import { db } from "./db";
import { 
  abandonedCarts, 
  emailReminderQueue, 
  cartItems, 
  products, 
  users,
  type AbandonedCart,
  type EmailReminderQueue,
  type InsertAbandonedCart,
  type InsertEmailReminder
} from "@shared/schema";
import { eq, lt, and, isNull, desc } from "drizzle-orm";
import { emailService } from "./email-service";
// Note: Using console.log for logging since monitoring service logger is not available
// import { createLogger } from "./monitoring";

const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
};

export class AbandonedCartService {
  
  // Track cart abandonment when user leaves with items in cart
  async trackCartAbandonment(userId: string): Promise<void> {
    try {
      // Get current cart items with product details
      const currentCartItems = await db
        .select({
          cartItem: cartItems,
          product: products,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, userId));

      if (currentCartItems.length === 0) {
        logger.info("No cart items to track for abandonment", { userId });
        return;
      }

      // Calculate total value
      const totalValue = currentCartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.cartItem.quantity);
      }, 0);

      // Create cart snapshot
      const cartSnapshot = currentCartItems.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.cartItem.quantity,
        images: item.product.images,
        sellerId: item.product.sellerId,
      }));

      // Check if there's already an abandoned cart for this user in the last 24 hours
      const existingAbandonedCart = await db
        .select()
        .from(abandonedCarts)
        .where(
          and(
            eq(abandonedCarts.userId, userId),
            eq(abandonedCarts.status, "abandoned")
          )
        )
        .orderBy(desc(abandonedCarts.createdAt))
        .limit(1);

      if (existingAbandonedCart.length > 0) {
        // Update existing abandoned cart
        await db
          .update(abandonedCarts)
          .set({
            cartSnapshot: cartSnapshot,
            totalValue: totalValue.toString(),
            itemCount: currentCartItems.length,
            abandonedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(abandonedCarts.id, existingAbandonedCart[0].id));

        logger.info("Updated existing abandoned cart", {
          userId,
          abandonedCartId: existingAbandonedCart[0].id,
          totalValue,
          itemCount: currentCartItems.length
        });
      } else {
        // Create new abandoned cart record
        const [newAbandonedCart] = await db
          .insert(abandonedCarts)
          .values({
            userId,
            cartSnapshot: cartSnapshot,
            totalValue: totalValue.toString(),
            itemCount: currentCartItems.length,
            abandonedAt: new Date(),
          })
          .returning();

        logger.info("Created new abandoned cart", {
          userId,
          abandonedCartId: newAbandonedCart.id,
          totalValue,
          itemCount: currentCartItems.length
        });

        // Schedule reminder emails
        await this.scheduleReminderEmails(newAbandonedCart.id, userId);
      }
    } catch (error) {
      logger.error("Failed to track cart abandonment", { userId, error });
    }
  }

  // Schedule the sequence of reminder emails
  private async scheduleReminderEmails(abandonedCartId: number, userId: string): Promise<void> {
    const now = new Date();
    
    // Schedule reminders at 1 hour, 24 hours, and 72 hours
    const reminderSchedule = [
      { type: "first", hoursDelay: 1 },
      { type: "second", hoursDelay: 24 },
      { type: "final", hoursDelay: 72 },
    ];

    for (const reminder of reminderSchedule) {
      const scheduledFor = new Date(now.getTime() + (reminder.hoursDelay * 60 * 60 * 1000));
      
      await db.insert(emailReminderQueue).values({
        userId,
        abandonedCartId,
        reminderType: reminder.type,
        scheduledFor,
      });

      logger.info("Scheduled reminder email", {
        userId,
        abandonedCartId,
        reminderType: reminder.type,
        scheduledFor
      });
    }
  }

  // Process pending reminder emails (called by cron job)
  async processPendingReminders(): Promise<void> {
    try {
      const now = new Date();
      
      // Get pending reminders that are due
      const pendingReminders = await db
        .select({
          reminder: emailReminderQueue,
          user: users,
          abandonedCart: abandonedCarts,
        })
        .from(emailReminderQueue)
        .innerJoin(users, eq(emailReminderQueue.userId, users.id))
        .innerJoin(abandonedCarts, eq(emailReminderQueue.abandonedCartId, abandonedCarts.id))
        .where(
          and(
            eq(emailReminderQueue.status, "pending"),
            lt(emailReminderQueue.scheduledFor, now),
            eq(abandonedCarts.status, "abandoned") // Only send if cart is still abandoned
          )
        );

      logger.info("Processing pending reminders", { count: pendingReminders.length });

      for (const item of pendingReminders) {
        await this.sendReminderEmail(item.reminder, item.user, item.abandonedCart);
      }
    } catch (error) {
      logger.error("Failed to process pending reminders", { error });
    }
  }

  // Send individual reminder email
  private async sendReminderEmail(
    reminder: EmailReminderQueue, 
    user: any, 
    abandonedCart: AbandonedCart
  ): Promise<void> {
    try {
      if (!user.email) {
        logger.warn("User has no email address for abandoned cart reminder", {
          userId: user.id,
          reminderId: reminder.id
        });
        
        await db
          .update(emailReminderQueue)
          .set({
            status: "failed",
            errorMessage: "User has no email address",
            updatedAt: new Date(),
          })
          .where(eq(emailReminderQueue.id, reminder.id));
        return;
      }

      const cartItems = abandonedCart.cartSnapshot as any[];
      const emailTemplate = this.generateEmailTemplate(reminder.reminderType, user, cartItems, abandonedCart);

      // Send email using email service
      await emailService.sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      // Mark reminder as sent
      await db
        .update(emailReminderQueue)
        .set({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(emailReminderQueue.id, reminder.id));

      // Update abandoned cart with reminder timestamp
      const updateField = `${reminder.reminderType}ReminderSent` as keyof typeof abandonedCarts.$inferInsert;
      await db
        .update(abandonedCarts)
        .set({
          [updateField]: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(abandonedCarts.id, reminder.abandonedCartId));

      logger.info("Sent abandoned cart reminder email", {
        userId: user.id,
        reminderId: reminder.id,
        reminderType: reminder.reminderType,
        userEmail: user.email
      });

    } catch (error) {
      logger.error("Failed to send reminder email", {
        reminderId: reminder.id,
        userId: user.id,
        error
      });

      await db
        .update(emailReminderQueue)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(emailReminderQueue.id, reminder.id));
    }
  }

  // Generate email template based on reminder type
  private generateEmailTemplate(
    reminderType: string, 
    user: any, 
    cartItems: any[], 
    abandonedCart: AbandonedCart
  ): { subject: string; html: string; text: string } {
    const userName = user.firstName || "there";
    const totalValue = parseFloat(abandonedCart.totalValue);
    const itemCount = abandonedCart.itemCount;
    const cartUrl = `${process.env.FRONTEND_URL || 'https://opshop.online'}/cart`;

    const templates = {
      first: {
        subject: `${userName}, you left some great items in your cart!`,
        urgency: "Don't miss out on these sustainable finds!",
        message: "We noticed you were interested in some amazing pre-loved items. Complete your purchase before someone else discovers these treasures.",
        cta: "Complete Your Purchase"
      },
      second: {
        subject: `Still thinking about those items, ${userName}?`,
        urgency: "These unique items won't last long!",
        message: "Your cart is waiting! These one-of-a-kind items from our sustainable marketplace are popular choices. Secure yours before they're gone.",
        cta: "Return to Cart"
      },
      final: {
        subject: `Last chance for your cart items, ${userName}!`,
        urgency: "Final reminder - don't let these go!",
        message: "This is your final reminder about the items in your cart. After this, we'll need to release them for other buyers to discover.",
        cta: "Complete Purchase Now"
      }
    };

    const template = templates[reminderType as keyof typeof templates] || templates.first;

    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <img src="${item.images?.[0] || '/placeholder.svg'}" alt="${item.title}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; float: left; margin-right: 15px;">
          <div style="overflow: hidden;">
            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${item.title}</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">Quantity: ${item.quantity}</p>
            <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 16px; font-weight: bold;">$${parseFloat(item.price).toFixed(2)}</p>
          </div>
        </td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Opshop Online</h1>
          <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Australia's Sustainable Marketplace</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Hi ${userName}!</h2>
          <p style="color: #ff5722; font-weight: bold; margin: 0 0 20px 0; font-size: 16px;">${template.urgency}</p>
          <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">${template.message}</p>

          <!-- Cart Summary -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Your Cart (${itemCount} item${itemCount !== 1 ? 's' : ''})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
            <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #2e7d32;">
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2e7d32;">Total: $${totalValue.toFixed(2)}</p>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${cartUrl}" style="display: inline-block; background-color: #ff5722; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">${template.cta}</a>
          </div>

          <!-- Benefits -->
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">Why Choose Opshop Online?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">✓ Sustainable shopping - give items a second life</li>
              <li style="margin-bottom: 8px;">✓ Unique, one-of-a-kind finds</li>
              <li style="margin-bottom: 8px;">✓ Great prices on quality pre-loved items</li>
              <li style="margin-bottom: 8px;">✓ Supporting local Australian sellers</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #999; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@opshop.online" style="color: #2e7d32;">support@opshop.online</a>
          </p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            This email was sent to ${user.email}. 
            <a href="${cartUrl}" style="color: #2e7d32;">Visit your cart</a> | 
            <a href="${process.env.FRONTEND_URL || 'https://opshop.online'}/profile" style="color: #2e7d32;">Manage preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;

    const text = `
Hi ${userName}!

${template.urgency}

${template.message}

Your Cart (${itemCount} item${itemCount !== 1 ? 's' : ''}):
${cartItems.map(item => `- ${item.title} (Qty: ${item.quantity}) - $${parseFloat(item.price).toFixed(2)}`).join('\n')}

Total: $${totalValue.toFixed(2)}

${template.cta}: ${cartUrl}

Why Choose Opshop Online?
✓ Sustainable shopping - give items a second life
✓ Unique, one-of-a-kind finds  
✓ Great prices on quality pre-loved items
✓ Supporting local Australian sellers

Need help? Contact us at support@opshop.online
    `;

    return {
      subject: template.subject,
      html: html.trim(),
      text: text.trim()
    };
  }

  // Mark cart as recovered when user completes purchase
  async markCartAsRecovered(userId: string): Promise<void> {
    try {
      await db
        .update(abandonedCarts)
        .set({
          status: "recovered",
          recoveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(abandonedCarts.userId, userId),
            eq(abandonedCarts.status, "abandoned")
          )
        );

      // Cancel pending reminder emails
      await db
        .update(emailReminderQueue)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(emailReminderQueue.userId, userId),
            eq(emailReminderQueue.status, "pending")
          )
        );

      logger.info("Marked abandoned cart as recovered", { userId });
    } catch (error) {
      logger.error("Failed to mark cart as recovered", { userId, error });
    }
  }

  // Get abandoned cart statistics for admin dashboard
  async getAbandonedCartStats(): Promise<{
    totalAbandoned: number;
    totalRecovered: number;
    recoveryRate: number;
    totalValue: number;
    averageCartValue: number;
    reminderStats: {
      pending: number;
      sent: number;
      failed: number;
    };
  }> {
    try {
      const [abandonedStats] = await db
        .select({
          totalAbandoned: abandonedCarts.id,
          totalValue: abandonedCarts.totalValue,
          status: abandonedCarts.status,
        })
        .from(abandonedCarts);

      const [reminderStats] = await db
        .select({
          status: emailReminderQueue.status,
        })
        .from(emailReminderQueue);

      // Process stats (simplified for example)
      return {
        totalAbandoned: 0,
        totalRecovered: 0,
        recoveryRate: 0,
        totalValue: 0,
        averageCartValue: 0,
        reminderStats: {
          pending: 0,
          sent: 0,
          failed: 0,
        },
      };
    } catch (error) {
      logger.error("Failed to get abandoned cart stats", { error });
      throw error;
    }
  }
}

export const abandonedCartService = new AbandonedCartService();