import { storage } from "./storage";
import { achievements, userAchievements, sellerStats, sellerBadges, type Achievement, type SellerStats } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface AchievementProgress {
  achievementId: number;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface UnlockReward {
  type: 'listing_boost' | 'commission_discount' | 'featured_listing' | 'priority_support' | 'custom_badge';
  value: number;
  duration?: number; // in days
  description: string;
}

class AchievementService {
  
  // Initialize default achievements
  async initializeDefaultAchievements() {
    try {
      const defaultAchievements = [
        // Sales Achievements
        {
          name: "First Sale",
          description: "Complete your first successful sale",
          category: "sales",
          icon: "trophy",
          badgeColor: "green",
          requirement: { type: "sales_count", value: 1 },
          reward: { type: "listing_boost", value: 3, description: "3 free featured listings" },
          displayOrder: 1
        },
        {
          name: "Rising Seller",
          description: "Complete 10 successful sales",
          category: "sales",
          icon: "trending-up",
          badgeColor: "blue",
          requirement: { type: "sales_count", value: 10 },
          reward: { type: "commission_discount", value: 0.5, duration: 30, description: "0.5% commission discount for 30 days" },
          displayOrder: 2
        },
        {
          name: "Experienced Seller",
          description: "Complete 50 successful sales",
          category: "sales",
          icon: "star",
          badgeColor: "purple",
          requirement: { type: "sales_count", value: 50 },
          reward: { type: "priority_support", value: 1, duration: 90, description: "Priority customer support for 90 days" },
          displayOrder: 3
        },
        {
          name: "Top Seller",
          description: "Complete 100 successful sales",
          category: "sales",
          icon: "crown",
          badgeColor: "gold",
          requirement: { type: "sales_count", value: 100 },
          reward: { type: "custom_badge", value: 1, description: "Custom 'Top Seller' badge on profile" },
          displayOrder: 4
        },
        
        // Listing Achievements
        {
          name: "Active Lister",
          description: "Have 20 active listings",
          category: "listings",
          icon: "list",
          badgeColor: "orange",
          requirement: { type: "active_listings", value: 20 },
          reward: { type: "listing_boost", value: 5, description: "5 free listing boosts" },
          displayOrder: 5
        },
        {
          name: "Catalog Master",
          description: "Create 100 total listings",
          category: "listings",
          icon: "package",
          badgeColor: "indigo",
          requirement: { type: "total_listings", value: 100 },
          reward: { type: "featured_listing", value: 7, description: "7 days of featured listings" },
          displayOrder: 6
        },
        
        // Revenue Achievements
        {
          name: "First $100",
          description: "Earn your first $100 in sales",
          category: "sales",
          icon: "dollar-sign",
          badgeColor: "green",
          requirement: { type: "total_revenue", value: 100 },
          reward: { type: "commission_discount", value: 1, duration: 14, description: "1% commission discount for 14 days" },
          displayOrder: 7
        },
        {
          name: "Power Seller",
          description: "Earn $1,000 in total sales",
          category: "sales",
          icon: "zap",
          badgeColor: "yellow",
          requirement: { type: "total_revenue", value: 1000 },
          reward: { type: "priority_support", value: 1, duration: 60, description: "VIP support access for 60 days" },
          displayOrder: 8
        },
        
        // Review Achievements
        {
          name: "5-Star Seller",
          description: "Maintain a 5.0 average rating with 10+ reviews",
          category: "reviews",
          icon: "heart",
          badgeColor: "red",
          requirement: { type: "rating_with_reviews", value: 5.0, minReviews: 10 },
          reward: { type: "custom_badge", value: 1, description: "5-Star Seller badge on all listings" },
          displayOrder: 9
        },
        {
          name: "Customer Favorite",
          description: "Receive 50 positive reviews",
          category: "reviews",
          icon: "thumbs-up",
          badgeColor: "pink",
          requirement: { type: "total_reviews", value: 50 },
          reward: { type: "featured_listing", value: 14, description: "14 days featured listing priority" },
          displayOrder: 10
        },
        
        // Community Achievements
        {
          name: "Quick Responder",
          description: "Maintain 90% response rate with average response time under 2 hours",
          category: "community",
          icon: "clock",
          badgeColor: "cyan",
          requirement: { type: "response_metrics", responseRate: 90, responseTime: 2 },
          reward: { type: "custom_badge", value: 1, description: "Quick Responder badge" },
          displayOrder: 11
        },
        {
          name: "Eco Warrior",
          description: "List 25 items with sustainability tags",
          category: "community",
          icon: "leaf",
          badgeColor: "emerald",
          requirement: { type: "eco_listings", value: 25 },
          reward: { type: "featured_listing", value: 10, description: "10 days eco-friendly listing boost" },
          displayOrder: 12
        },
        
        // Special Achievements
        {
          name: "Early Adopter",
          description: "One of the first 100 sellers on Opshop Online",
          category: "special",
          icon: "users",
          badgeColor: "violet",
          requirement: { type: "early_adopter", value: 100 },
          reward: { type: "custom_badge", value: 1, description: "Exclusive Early Adopter badge" },
          displayOrder: 13
        },
        {
          name: "Streak Master",
          description: "Make sales for 30 consecutive days",
          category: "special",
          icon: "calendar",
          badgeColor: "amber",
          requirement: { type: "consecutive_sale_days", value: 30 },
          reward: { type: "commission_discount", value: 2, duration: 90, description: "2% commission discount for 90 days" },
          displayOrder: 14
        }
      ];

      for (const achievement of defaultAchievements) {
        await db.insert(achievements).values(achievement).onConflictDoNothing();
      }

      console.log("Default achievements initialized successfully");
    } catch (error) {
      console.error("Error initializing default achievements:", error);
      throw error;
    }
  }

  // Check and update user achievements
  async checkUserAchievements(userId: string) {
    try {
      const userStats = await this.getUserStats(userId);
      const allAchievements = await db.select().from(achievements).where(eq(achievements.isActive, true));
      const userAchievementsList = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
      
      const unlockedAchievementIds = new Set(userAchievementsList.map(ua => ua.achievementId));
      const newUnlocks: Achievement[] = [];

      for (const achievement of allAchievements) {
        if (unlockedAchievementIds.has(achievement.id)) continue;

        const isEligible = await this.checkAchievementEligibility(userId, achievement, userStats);
        
        if (isEligible) {
          // Unlock achievement
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            progress: { completed: true, unlockedAt: new Date() }
          });

          // Apply reward
          await this.applyAchievementReward(userId, achievement);
          
          newUnlocks.push(achievement);
          
          console.log("Achievement unlocked", {
            userId,
            achievementId: achievement.id,
            achievementName: achievement.name
          });
        }
      }

      return newUnlocks;
    } catch (error) {
      console.error("Error checking user achievements:", error);
      throw error;
    }
  }

  // Check if user is eligible for a specific achievement
  private async checkAchievementEligibility(userId: string, achievement: Achievement, userStats: any): Promise<boolean> {
    const requirement = achievement.requirement as any;

    switch (requirement.type) {
      case 'sales_count':
        return userStats.totalSales >= requirement.value;
      
      case 'total_revenue':
        return parseFloat(userStats.totalRevenue) >= requirement.value;
      
      case 'total_listings':
        return userStats.totalListings >= requirement.value;
      
      case 'active_listings':
        return userStats.activeListings >= requirement.value;
      
      case 'total_reviews':
        return userStats.totalReviews >= requirement.value;
      
      case 'rating_with_reviews':
        return userStats.totalReviews >= (requirement.minReviews || 1) && 
               parseFloat(userStats.averageRating) >= requirement.value;
      
      case 'response_metrics':
        return parseFloat(userStats.responseRate) >= requirement.responseRate &&
               userStats.responseTime <= requirement.responseTime;
      
      case 'consecutive_sale_days':
        return userStats.consecutiveSaleDays >= requirement.value;
      
      case 'eco_listings':
        // Would need to check listings with eco/sustainability tags
        const ecoListings = await storage.getEcoListingCount(userId);
        return ecoListings >= requirement.value;
      
      case 'early_adopter':
        // Check if user is among first X sellers
        const userRank = await this.getUserJoinRank(userId);
        return userRank <= requirement.value;
      
      default:
        return false;
    }
  }

  // Apply achievement reward
  private async applyAchievementReward(userId: string, achievement: Achievement) {
    const reward = achievement.reward as UnlockReward;
    if (!reward) return;

    try {
      switch (reward.type) {
        case 'listing_boost':
          // Add listing boosts to user account
          await storage.addListingBoosts(userId, reward.value);
          break;
        
        case 'commission_discount':
          // Apply temporary commission discount
          await storage.addCommissionDiscount(userId, reward.value, reward.duration);
          break;
        
        case 'featured_listing':
          // Add featured listing days
          await storage.addFeaturedListingDays(userId, reward.value);
          break;
        
        case 'priority_support':
          // Add priority support access
          await storage.addPrioritySupport(userId, reward.duration);
          break;
        
        case 'custom_badge':
          // Add custom badge
          await this.awardBadge(userId, achievement.name.toLowerCase().replace(/\s+/g, '_'), 1);
          break;
      }

      console.log("Achievement reward applied", {
        userId,
        achievementId: achievement.id,
        rewardType: reward.type,
        rewardValue: reward.value
      });
    } catch (error) {
      console.error("Error applying achievement reward:", error);
    }
  }

  // Get user's achievement progress
  async getUserAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const userStats = await this.getUserStats(userId);
      const allAchievements = await db.select().from(achievements)
        .where(eq(achievements.isActive, true))
        .orderBy(achievements.displayOrder);
      
      const userAchievementsList = await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, userId));
      
      const unlockedIds = new Set(userAchievementsList.map(ua => ua.achievementId));

      return allAchievements.map(achievement => {
        const requirement = achievement.requirement as any;
        let currentValue = 0;
        let targetValue = requirement.value || 0;

        switch (requirement.type) {
          case 'sales_count':
            currentValue = userStats.totalSales;
            break;
          case 'total_revenue':
            currentValue = parseFloat(userStats.totalRevenue);
            break;
          case 'total_listings':
            currentValue = userStats.totalListings;
            break;
          case 'active_listings':
            currentValue = userStats.activeListings;
            break;
          case 'total_reviews':
            currentValue = userStats.totalReviews;
            break;
          case 'rating_with_reviews':
            currentValue = parseFloat(userStats.averageRating);
            targetValue = requirement.value;
            break;
          case 'consecutive_sale_days':
            currentValue = userStats.consecutiveSaleDays;
            break;
        }

        const isCompleted = unlockedIds.has(achievement.id);
        const progressPercentage = isCompleted ? 100 : Math.min(100, (currentValue / targetValue) * 100);

        return {
          achievementId: achievement.id,
          currentValue,
          targetValue,
          isCompleted,
          progressPercentage
        };
      });
    } catch (error) {
      console.error("Error getting user achievement progress:", error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId: string) {
    try {
      let stats = await db.select().from(sellerStats).where(eq(sellerStats.userId, userId));
      
      if (stats.length === 0) {
        // Create initial stats
        await db.insert(sellerStats).values({
          userId,
          totalSales: 0,
          totalRevenue: "0",
          totalListings: 0,
          activeListing: 0,
          averageRating: "0",
          totalReviews: 0,
          responseRate: "0",
          responseTime: 0,
          level: 1,
          experiencePoints: 0,
          consecutiveSaleDays: 0
        });
        
        stats = await db.select().from(sellerStats).where(eq(sellerStats.userId, userId));
      }

      return stats[0];
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }

  // Update user stats
  async updateUserStats(userId: string, updates: Partial<SellerStats>) {
    try {
      await db.update(sellerStats)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(sellerStats.userId, userId));
      
      // Check for new achievements after stats update
      await this.checkUserAchievements(userId);
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }

  // Award badge to user
  async awardBadge(userId: string, badgeType: string, level: number = 1, duration?: number) {
    try {
      const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
      
      await db.insert(sellerBadges).values({
        userId,
        badgeType,
        badgeLevel: level,
        expiresAt,
        criteria: { awardedVia: 'achievement_system' }
      });

      console.log("Badge awarded", { userId, badgeType, level });
    } catch (error) {
      console.error("Error awarding badge:", error);
      throw error;
    }
  }

  // Get user's active badges
  async getUserBadges(userId: string) {
    try {
      return await db.select().from(sellerBadges)
        .where(and(
          eq(sellerBadges.userId, userId),
          eq(sellerBadges.isActive, true)
        ))
        .orderBy(desc(sellerBadges.earnedAt));
    } catch (error) {
      console.error("Error getting user badges:", error);
      throw error;
    }
  }

  // Get user's achievements
  async getUserAchievements(userId: string) {
    try {
      return await db.select({
        achievement: achievements,
        userAchievement: userAchievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
    } catch (error) {
      console.error("Error getting user achievements:", error);
      throw error;
    }
  }

  // Calculate user level and experience
  async calculateUserLevel(userId: string) {
    try {
      const stats = await this.getUserStats(userId);
      let experiencePoints = 0;

      // Calculate XP from various activities
      experiencePoints += stats.totalSales * 10; // 10 XP per sale
      experiencePoints += parseFloat(stats.totalRevenue) * 0.1; // 0.1 XP per dollar
      experiencePoints += stats.totalListings * 2; // 2 XP per listing
      experiencePoints += stats.totalReviews * 5; // 5 XP per review

      // Calculate level (every 100 XP = 1 level)
      const level = Math.floor(experiencePoints / 100) + 1;

      await db.update(sellerStats)
        .set({ experiencePoints, level, updatedAt: new Date() })
        .where(eq(sellerStats.userId, userId));

      return { level, experiencePoints };
    } catch (error) {
      console.error("Error calculating user level:", error);
      throw error;
    }
  }

  // Get join rank for early adopter achievement
  private async getUserJoinRank(userId: string): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) + 1 as rank 
        FROM seller_stats s1 
        JOIN seller_stats s2 ON s1.joined_at > s2.joined_at 
        WHERE s1.user_id = ${userId}
      `);
      
      return parseInt(result.rows[0]?.rank as string) || 1;
    } catch (error) {
      console.error("Error getting user join rank:", error);
      return 999999; // Return high number on error
    }
  }
}

export const achievementService = new AchievementService();