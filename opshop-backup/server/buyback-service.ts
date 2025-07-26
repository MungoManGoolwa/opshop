import { db } from "./db";
import { users, buybackOffers, storeCreditTransactions, products } from "@shared/schema";
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
  
  // Create a new buyback offer using AI evaluation
  async createBuybackOffer(request: CreateBuybackOfferRequest) {
    try {
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

      // Get AI evaluation
      const aiResult = await evaluateItemWithAI(itemEvaluation);

      // Create expiry date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + OFFER_EXPIRY_HOURS);

      // Create buyback offer in database
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
          expiresAt,
        })
        .returning();

      // Get user details for email notification
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId))
        .limit(1);

      if (user && user.email) {
        try {
          // Send email notification
          const emailSent = await emailService.sendBuybackOfferNotification(
            user.email,
            user.firstName || "User",
            request.itemTitle,
            aiResult.estimatedRetailPrice,
            aiResult.buybackOfferPrice,
            offer.id
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