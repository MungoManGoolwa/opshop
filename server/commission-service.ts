import { db } from "./db";
import { commissions, payouts, payoutSettings, orders, users } from "@shared/schema";
import { eq, and, sql, desc, lt, gte } from "drizzle-orm";
import type { InsertPayout, Commission, User, Order } from "@shared/schema";

export class CommissionService {
  
  /**
   * Calculate commission with processing fees for an order
   */
  async calculateCommission(order: Order, seller: User) {
    const commissionRate = parseFloat(seller.commissionRate?.toString() || "10.00");
    const salePrice = parseFloat(order.totalAmount.toString());
    
    // Calculate marketplace commission
    const commissionAmount = (salePrice * commissionRate) / 100;
    const sellerAmount = salePrice - commissionAmount;
    
    // Calculate processing fee (2.9% default)
    const processingFeeRate = 2.9; // This should come from payment settings eventually
    const processingFee = (sellerAmount * processingFeeRate) / 100;
    const netSellerAmount = sellerAmount - processingFee;
    
    return {
      salePrice,
      commissionRate: commissionRate.toString(),
      commissionAmount: commissionAmount.toString(),
      sellerAmount: sellerAmount.toString(),
      processingFee: processingFee.toString(),
      netSellerAmount: netSellerAmount.toString(),
    };
  }

  /**
   * Create commission record when order is completed
   */
  async createCommissionFromOrder(order: Order, seller: User) {
    const calculation = await this.calculateCommission(order, seller);
    
    const [commission] = await db.insert(commissions).values({
      orderId: order.id,
      productId: order.productId,
      sellerId: order.sellerId!,
      salePrice: calculation.salePrice.toString(),
      commissionRate: calculation.commissionRate,
      commissionAmount: calculation.commissionAmount,
      sellerAmount: calculation.sellerAmount,
      processingFee: calculation.processingFee,
      netSellerAmount: calculation.netSellerAmount,
      status: "pending"
    }).returning();
    
    return commission;
  }

  /**
   * Get pending commissions eligible for payout
   */
  async getPendingCommissions(sellerId: string, minimumAmount = 50.00, holdingPeriodDays = 7) {
    const holdingCutoff = new Date();
    holdingCutoff.setDate(holdingCutoff.getDate() - holdingPeriodDays);
    
    return await db.select()
      .from(commissions)
      .where(
        and(
          eq(commissions.sellerId, sellerId),
          eq(commissions.status, "pending"),
          lt(commissions.createdAt, holdingCutoff)
        )
      )
      .orderBy(desc(commissions.createdAt));
  }

  /**
   * Calculate total payout amount for seller
   */
  async calculatePayoutAmount(sellerId: string, holdingPeriodDays = 7) {
    const pendingCommissions = await this.getPendingCommissions(sellerId, 0, holdingPeriodDays);
    
    const totalAmount = pendingCommissions.reduce((sum, commission) => {
      return sum + parseFloat(commission.netSellerAmount.toString());
    }, 0);
    
    return {
      totalAmount,
      commissionCount: pendingCommissions.length,
      commissions: pendingCommissions
    };
  }

  /**
   * Create a payout batch for a seller
   */
  async createPayout(sellerId: string, paymentMethod = "stripe", scheduledDate?: Date) {
    const payoutData = await this.calculatePayoutAmount(sellerId);
    
    if (payoutData.totalAmount === 0) {
      throw new Error("No eligible commissions for payout");
    }
    
    // Create payout record
    const [payout] = await db.insert(payouts).values({
      sellerId,
      totalAmount: payoutData.totalAmount.toString(),
      totalCommissions: payoutData.commissionCount,
      paymentMethod,
      status: "pending",
      scheduledDate: scheduledDate || new Date(),
    }).returning();
    
    // Update commissions to link to this payout
    await db.update(commissions)
      .set({ 
        payoutId: payout.id,
        status: "processing",
        updatedAt: new Date()
      })
      .where(
        and(
          eq(commissions.sellerId, sellerId),
          eq(commissions.status, "pending")
        )
      );
    
    return payout;
  }

  /**
   * Process automated payouts for all eligible sellers
   */
  async processAutomatedPayouts() {
    const settings = await this.getPayoutSettings();
    
    if (!settings.autoPayoutEnabled) {
      return { message: "Automated payouts are disabled" };
    }
    
    // Get all sellers with pending commissions above minimum threshold
    const eligibleSellers = await db.select({
      sellerId: commissions.sellerId,
      totalAmount: sql<number>`SUM(CAST(${commissions.netSellerAmount} AS DECIMAL))`,
      commissionCount: sql<number>`COUNT(*)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.status, "pending"),
        lt(commissions.createdAt, new Date(Date.now() - (settings.holdingPeriodDays ?? 7) * 24 * 60 * 60 * 1000))
      )
    )
    .groupBy(commissions.sellerId)
    .having(sql`SUM(CAST(${commissions.netSellerAmount} AS DECIMAL)) >= ${settings.minimumPayoutAmount}`);
    
    const results = [];
    
    for (const seller of eligibleSellers) {
      try {
        const payout = await this.createPayout(
          seller.sellerId, 
          settings.defaultPaymentMethod ?? "stripe",
          new Date()
        );
        results.push({ sellerId: seller.sellerId, payout, status: "created" });
      } catch (error: any) {
        results.push({ sellerId: seller.sellerId, error: error.message, status: "failed" });
      }
    }
    
    return {
      processedAt: new Date(),
      totalPayouts: results.length,
      successful: results.filter(r => r.status === "created").length,
      failed: results.filter(r => r.status === "failed").length,
      results
    };
  }

  /**
   * Mark payout as completed (called after successful payment processing)
   */
  async completePayout(payoutId: number, paymentReference: string) {
    const [payout] = await db.update(payouts)
      .set({
        status: "completed",
        processedDate: new Date(),
        paymentReference,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, payoutId))
      .returning();
    
    // Update associated commissions
    await db.update(commissions)
      .set({ 
        status: "paid",
        updatedAt: new Date()
      })
      .where(eq(commissions.payoutId, payoutId));
    
    return payout;
  }

  /**
   * Mark payout as failed
   */
  async failPayout(payoutId: number, failureReason: string) {
    const [payout] = await db.update(payouts)
      .set({
        status: "failed",
        failureReason,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, payoutId))
      .returning();
    
    // Reset associated commissions back to pending
    await db.update(commissions)
      .set({ 
        status: "pending",
        payoutId: null,
        updatedAt: new Date()
      })
      .where(eq(commissions.payoutId, payoutId));
    
    return payout;
  }

  /**
   * Get payout settings or create default ones
   */
  async getPayoutSettings() {
    const [settings] = await db.select().from(payoutSettings).limit(1);
    
    if (!settings) {
      const [newSettings] = await db.insert(payoutSettings).values({}).returning();
      return newSettings;
    }
    
    return settings;
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(updates: Partial<typeof payoutSettings.$inferInsert>, updatedBy: string) {
    const [settings] = await db.update(payoutSettings)
      .set({
        ...updates,
        updatedAt: new Date(),
        updatedBy
      })
      .returning();
    
    return settings;
  }

  /**
   * Get seller payout history
   */
  async getSellerPayouts(sellerId: string) {
    return await db.select()
      .from(payouts)
      .where(eq(payouts.sellerId, sellerId))
      .orderBy(desc(payouts.createdAt));
  }

  /**
   * Get detailed commission information for a payout
   */
  async getPayoutCommissions(payoutId: number) {
    return await db.select({
      commission: commissions,
      order: orders,
    })
    .from(commissions)
    .leftJoin(orders, eq(commissions.orderId, orders.id))
    .where(eq(commissions.payoutId, payoutId))
    .orderBy(desc(commissions.createdAt));
  }

  /**
   * Get commission analytics for admin dashboard
   */
  async getCommissionAnalytics() {
    try {
      const [totalCommissions, totalPayouts, pendingPayouts, monthlyStats] = await Promise.all([
        // Total commissions
        db.select({
          total: sql<string>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
          count: sql<string>`COUNT(*)`
        }).from(commissions),
        
        // Total payouts
        db.select({
          total: sql<string>`COALESCE(SUM(${payouts.totalAmount}), 0)`,
          count: sql<string>`COUNT(*)`
        }).from(payouts).where(eq(payouts.status, 'completed')),
        
        // Pending payouts
        db.select({
          total: sql<string>`COALESCE(SUM(${payouts.totalAmount}), 0)`,
          count: sql<string>`COUNT(*)`
        }).from(payouts).where(eq(payouts.status, 'pending')),
        
        // Monthly commission stats
        db.select({
          month: sql<string>`DATE_TRUNC('month', ${commissions.createdAt})`,
          total: sql<string>`COALESCE(SUM(${commissions.commissionAmount}), 0)`,
          count: sql<string>`COUNT(*)`
        }).from(commissions)
          .where(gte(commissions.createdAt, sql`CURRENT_DATE - INTERVAL '12 months'`))
          .groupBy(sql`DATE_TRUNC('month', ${commissions.createdAt})`)
          .orderBy(sql`DATE_TRUNC('month', ${commissions.createdAt})`)
      ]);

      return {
        totalCommissions: {
          amount: totalCommissions[0]?.total || '0',
          count: parseInt(totalCommissions[0]?.count || '0')
        },
        totalPayouts: {
          amount: totalPayouts[0]?.total || '0',
          count: parseInt(totalPayouts[0]?.count || '0')
        },
        pendingPayouts: {
          amount: pendingPayouts[0]?.total || '0',
          count: parseInt(pendingPayouts[0]?.count || '0')
        },
        monthlyStats: monthlyStats.map(stat => ({
          month: stat.month,
          amount: stat.total,
          count: parseInt(stat.count)
        }))
      };
    } catch (error) {
      console.error('Error fetching commission analytics:', error);
      throw new Error('Failed to fetch commission analytics');
    }
  }
}

export const commissionService = new CommissionService();