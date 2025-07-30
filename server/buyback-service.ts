import { db } from "./db";
import { users, buybackOffers, storeCreditTransactions, products, categories, categoryBuybackSettings } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { evaluateItemWithAI, type ItemEvaluation } from "./ai-evaluation";
import { emailService } from "./email-service";

const SYSTEM_USER_ID = "system"; // Special system user for buyback items
const OFFER_EXPIRY_HOURS = 24;

export interface CreateBuybackOfferRequest {
  userId: string;
  itemTitle: string;
  itemDescription?: string;
  itemCondition: string;
  itemAge?: string;
  itemBrand?: string;
  itemCategory?: string;
  images?: string[];
}

export class BuybackService {

  // Get all categories with their buyback settings for admin
  async getCategoriesWithBuybackSettings() {
    try {
      const categoriesWithSettings = await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          isActive: categories.isActive,
          buybackPercentage: categoryBuybackSettings.buybackPercentage,
          buybackSettingsActive: categoryBuybackSettings.isActive,
        })
        .from(categories)
        .leftJoin(categoryBuybackSettings, eq(categories.id, categoryBuybackSettings.categoryId))
        .where(eq(categories.isActive, true))
        .orderBy(categories.name);

      // Set default percentage for categories without settings
      return categoriesWithSettings.map(category => ({
        ...category,
        buybackPercentage: category.buybackPercentage || "40.00", // Default 40%
        buybackSettingsActive: category.buybackSettingsActive !== null ? category.buybackSettingsActive : true,
      }));
    } catch (error) {
      console.error("Error fetching categories with buyback settings:", error);
      throw new Error("Failed to fetch categories with buyback settings");
    }
  }

  // Update or create category buyback settings
  async updateCategoryBuybackSettings(categoryId: number, buybackPercentage: number) {
    try {
      // Check if settings already exist
      const [existingSettings] = await db
        .select()
        .from(categoryBuybackSettings)
        .where(eq(categoryBuybackSettings.categoryId, categoryId))
        .limit(1);

      if (existingSettings) {
        // Update existing settings
        const [updated] = await db
          .update(categoryBuybackSettings)
          .set({
            buybackPercentage: buybackPercentage.toString(),
            updatedAt: new Date(),
          })
          .where(eq(categoryBuybackSettings.categoryId, categoryId))
          .returning();
        return updated;
      } else {
        // Create new settings
        const [created] = await db
          .insert(categoryBuybackSettings)
          .values({
            categoryId,
            buybackPercentage: buybackPercentage.toString(),
            isActive: true,
          })
          .returning();
        return created;
      }
    } catch (error) {
      console.error("Error updating category buyback settings:", error);
      throw new Error("Failed to update category buyback settings");
    }
  }

  // Get category buyback percentage (default 40% if not configured)
  async getCategoryBuybackPercentage(categoryName?: string): Promise<number> {
    if (!categoryName) {
      return 40.00; // Default 40% of AI price (60% reduction from retail)
    }

    try {
      // Find category by name
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, categoryName))
        .limit(1);

      if (!category) {
        return 40.00; // Default if category not found
      }

      // Get buyback settings for this category
      const [settings] = await db
        .select()
        .from(categoryBuybackSettings)
        .where(and(
          eq(categoryBuybackSettings.categoryId, category.id),
          eq(categoryBuybackSettings.isActive, true)
        ))
        .limit(1);

      if (!settings) {
        return 40.00; // Default if no settings found
      }

      return parseFloat(settings.buybackPercentage);
    } catch (error) {
      console.error("Error fetching category buyback percentage:", error);
      return 40.00; // Default on error
    }
  }
  
  // Create a new buyback offer using AI evaluation
  async createBuybackOffer(request: CreateBuybackOfferRequest) {
    try {
      // Get category-specific buyback percentage
      const buybackPercentage = await this.getCategoryBuybackPercentage(request.itemCategory);
      
      // Prepare item for AI evaluation
      const itemEvaluation: ItemEvaluation = {
        title: request.itemTitle,
        description: request.itemDescription || "",
        condition: request.itemCondition,
        age: request.itemAge,
        brand: request.itemBrand,
        category: request.itemCategory,
        images: request.images,
      };

      // Get AI evaluation with category-specific percentage
      const aiResult = await evaluateItemWithAI(itemEvaluation, buybackPercentage);

      // Create expiry date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + OFFER_EXPIRY_HOURS);

      // Create admin review expiry date (24 hours from now)
      const adminReviewExpiresAt = new Date();
      adminReviewExpiresAt.setHours(adminReviewExpiresAt.getHours() + 24);

      // Create buyback offer in database with pending admin review status
      const [offer] = await db
        .insert(buybackOffers)
        .values({
          userId: request.userId,
          itemTitle: request.itemTitle,
          itemDescription: request.itemDescription,
          itemCondition: request.itemCondition,
          itemAge: request.itemAge,
          itemBrand: request.itemBrand,
          itemCategory: request.itemCategory,
          images: request.images || [],
          aiEvaluatedRetailPrice: aiResult.estimatedRetailPrice.toString(),
          buybackOfferPrice: aiResult.buybackOfferPrice.toString(),
          aiEvaluationData: aiResult,
          status: "pending_admin_review",
          adminReviewExpiresAt,
          expiresAt,
        })
        .returning();

      // Get user details for email notification
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      // Send admin notification about new buyback submission
      try {
        await emailService.sendAdminBuybackNotification(offer);
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      if (user && user.email) {
        try {
          // Send submission confirmation to user
          const emailSent = await emailService.sendBuybackSubmissionConfirmation(
            user.email,
            user.firstName || "User",
            offer
          );

          // Update offer with email status
          if (emailSent) {
            await db
              .update(buybackOffers)
              .set({ 
                emailSent: true, 
                emailSentAt: new Date() 
              })
              .where(eq(buybackOffers.id, offer.id));
          }
        } catch (emailError) {
          console.error("Failed to send buyback offer email:", emailError);
          // Don't fail the whole process if email fails
        }
      }

      return {
        success: true,
        offer,
        aiEvaluation: aiResult,
      };

    } catch (error) {
      console.error("Error creating buyback offer:", error);
      throw new Error("Failed to create buyback offer");
    }
  }

  // Accept a buyback offer and process payment
  async acceptBuybackOffer(offerId: number, userId: string) {
    const offer = await db
      .select()
      .from(buybackOffers)
      .where(and(eq(buybackOffers.id, offerId), eq(buybackOffers.userId, userId)))
      .limit(1);

    if (!offer.length) {
      throw new Error("Buyback offer not found");
    }

    const offerData = offer[0];

    // Check if offer is still valid
    if (offerData.status !== "pending") {
      throw new Error("Offer is no longer available");
    }

    if (new Date() > new Date(offerData.expiresAt)) {
      // Mark as expired
      await db
        .update(buybackOffers)
        .set({ status: "expired" })
        .where(eq(buybackOffers.id, offerId));
      throw new Error("Offer has expired");
    }

    try {
      // Start transaction
      await db.transaction(async (tx) => {
        // Get current user balance
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user) {
          throw new Error("User not found");
        }

        const currentBalance = parseFloat(user.storeCredit || "0");
        const offerAmount = parseFloat(offerData.buybackOfferPrice);
        const newBalance = currentBalance + offerAmount;

        // Update user store credit
        await tx
          .update(users)
          .set({ storeCredit: newBalance.toString() })
          .where(eq(users.id, userId));

        // Mark offer as accepted
        await tx
          .update(buybackOffers)
          .set({ 
            status: "accepted",
            acceptedAt: new Date()
          })
          .where(eq(buybackOffers.id, offerId));

        // Record store credit transaction
        await tx
          .insert(storeCreditTransactions)
          .values({
            userId,
            type: "buyback",
            amount: offerAmount.toString(),
            description: `Buyback offer accepted: ${offerData.itemTitle}`,
            referenceId: offerId.toString(),
            referenceType: "buyback_offer",
            balanceBefore: currentBalance.toString(),
            balanceAfter: newBalance.toString(),
          });

        // Create product listing for system user
        await this.createSystemListing(offerData, tx);
      });

      return {
        success: true,
        message: "Buyback offer accepted successfully",
        storeCreditAdded: parseFloat(offerData.buybackOfferPrice),
      };

    } catch (error) {
      console.error("Error accepting buyback offer:", error);
      throw new Error("Failed to process buyback offer acceptance");
    }
  }

  // Create product listing under system user
  private async createSystemListing(offer: any, tx: any) {
    const aiData = offer.aiEvaluationData;
    const listingPrice = aiData?.suggestedListingPrice || parseFloat(offer.aiEvaluatedRetailPrice);

    await tx
      .insert(products)
      .values({
        title: offer.itemTitle,
        description: offer.itemDescription || `${offer.itemTitle} - Previously owned item acquired through our instant buyback program.`,
        price: listingPrice.toString(),
        originalPrice: offer.aiEvaluatedRetailPrice,
        condition: offer.itemCondition,
        sellerId: SYSTEM_USER_ID,
        categoryId: 1, // Default category
        brand: offer.itemBrand,
        material: "", // Will be filled from AI data if available
        size: "", 
        color: "",
        location: "Warehouse - Australia Wide Shipping",
        shippingCost: "0.00", // Free shipping for system items
        images: offer.images || [],
        isBuybackItem: true,
        status: "available",
        isVerified: true, // System items are automatically verified
      });
  }

  // Get user's buyback offers
  async getUserBuybackOffers(userId: string, limit = 20) {
    return await db
      .select()
      .from(buybackOffers)
      .where(eq(buybackOffers.userId, userId))
      .orderBy(desc(buybackOffers.createdAt))
      .limit(limit);
  }

  // Get user's store credit transactions
  async getUserStoreCreditTransactions(userId: string, limit = 50) {
    return await db
      .select()
      .from(storeCreditTransactions)
      .where(eq(storeCreditTransactions.userId, userId))
      .orderBy(desc(storeCreditTransactions.createdAt))
      .limit(limit);
  }

  // Get user's current store credit balance
  async getUserStoreCredit(userId: string): Promise<number> {
    const [user] = await db
      .select({ storeCredit: users.storeCredit })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return parseFloat(user?.storeCredit || "0");
  }

  // Admin: Get all buyback offers for analytics
  async getAllBuybackOffers(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    return await db
      .select()
      .from(buybackOffers)
      .orderBy(desc(buybackOffers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Admin: Get buyback analytics
  async getBuybackAnalytics() {
    // This would typically use more complex queries
    // For now, we'll get basic stats
    
    const totalOffers = await db
      .select()
      .from(buybackOffers);

    const acceptedOffers = totalOffers.filter(offer => offer.status === "accepted");
    const totalValue = acceptedOffers.reduce((sum, offer) => 
      sum + parseFloat(offer.buybackOfferPrice), 0
    );
    
    const avgOfferValue = acceptedOffers.length > 0 ? totalValue / acceptedOffers.length : 0;
    const acceptanceRate = totalOffers.length > 0 ? (acceptedOffers.length / totalOffers.length) * 100 : 0;

    return {
      totalOffers: totalOffers.length,
      acceptedOffers: acceptedOffers.length,
      rejectedOffers: totalOffers.filter(offer => offer.status === "rejected").length,
      expiredOffers: totalOffers.filter(offer => offer.status === "expired").length,
      totalValueDisbursed: totalValue,
      averageOfferValue: avgOfferValue,
      acceptanceRate: acceptanceRate,
    };
  }

  // Admin: Reject a buyback offer (overridden method)
  async rejectBuybackOffer(offerId: number, adminUserId: string, reason?: string) {
    const [offer] = await db
      .select()
      .from(buybackOffers)
      .where(eq(buybackOffers.id, offerId))
      .limit(1);

    if (!offer) {
      throw new Error("Buyback offer not found");
    }

    if (offer.status !== "pending") {
      throw new Error("Offer is not pending approval");
    }

    // Update offer status to rejected
    const [updatedOffer] = await db
      .update(buybackOffers)
      .set({
        status: "rejected",
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        adminNotes: reason || "Rejected by admin",
      })
      .where(eq(buybackOffers.id, offerId))
      .returning();

    return {
      success: true,
      offer: updatedOffer,
      message: "Buyback offer rejected",
    };
  }

  // Expire old offers (run via cron job)
  async expireOldOffers() {
    const now = new Date();
    
    const result = await db
      .update(buybackOffers)
      .set({ status: "expired" })
      .where(and(
        eq(buybackOffers.status, "pending"),
        // SQL comparison for timestamp
      ))
      .returning();

    return { expiredCount: result.length };
  }
  // Admin: Approve a buyback offer
  async approveBuybackOffer(offerId: number, adminUserId: string, notes?: string) {
    const [offer] = await db
      .select()
      .from(buybackOffers)
      .where(eq(buybackOffers.id, offerId))
      .limit(1);

    if (!offer) {
      throw new Error("Buyback offer not found");
    }

    if (offer.status !== "pending") {
      throw new Error("Offer is not pending approval");
    }

    // Update offer status to approved
    const [updatedOffer] = await db
      .update(buybackOffers)
      .set({
        status: "approved",
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        adminNotes: notes,
      })
      .where(eq(buybackOffers.id, offerId))
      .returning();

    return {
      success: true,
      offer: updatedOffer,
      message: "Buyback offer approved successfully",
    };
  }

  // Admin: Get all buyback offers for review
  async getAllBuybackOffersForAdmin(status?: string) {
    const query = db
      .select({
        id: buybackOffers.id,
        userId: buybackOffers.userId,
        itemTitle: buybackOffers.itemTitle,
        itemDescription: buybackOffers.itemDescription,
        itemCondition: buybackOffers.itemCondition,
        aiEvaluatedRetailPrice: buybackOffers.aiEvaluatedRetailPrice,
        buybackOfferPrice: buybackOffers.buybackOfferPrice,
        status: buybackOffers.status,
        adminNotes: buybackOffers.adminNotes,
        reviewedBy: buybackOffers.reviewedBy,
        reviewedAt: buybackOffers.reviewedAt,
        emailSent: buybackOffers.emailSent,
        emailSentAt: buybackOffers.emailSentAt,
        expiresAt: buybackOffers.expiresAt,
        createdAt: buybackOffers.createdAt,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(buybackOffers)
      .leftJoin(users, eq(buybackOffers.userId, users.id))
      .orderBy(desc(buybackOffers.createdAt));

    if (status) {
      return await query.where(eq(buybackOffers.status, status));
    }

    return await query;
  }
}

export const buybackService = new BuybackService();