import { db } from "./db";
import { users, products, orders, wishlists, savedItems, commissions, reviews } from "../shared/schema";
import { sql, eq, and, gte, count } from "drizzle-orm";

export class DashboardStatsService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsersResult,
      totalProductsResult,
      totalSalesResult,
      activeListingsResult,
      itemsSavedResult,
      itemsAvailableResult,
      totalSavingsResult,
      sellerSatisfactionResult,
      co2SavedTodayResult
    ] = await Promise.all([
      // Total Users
      db.select({ count: count() }).from(users),
      
      // Total Products
      db.select({ count: count() }).from(products),
      
      // Total Sales (completed orders)
      db.select({ 
        count: count(),
        total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`
      }).from(orders).where(eq(orders.orderStatus, 'completed')),
      
      // Active Listings (available products)
      db.select({ count: count() }).from(products)
        .where(eq(products.status, 'available')),
      
      // Items Saved (wishlist + saved items)
      Promise.all([
        db.select({ count: count() }).from(wishlists),
        db.select({ count: count() }).from(savedItems)
      ]).then(([wishlistCount, savedCount]) => ({
        count: wishlistCount[0].count + savedCount[0].count
      })),
      
      // Items Available (same as active listings for now)
      db.select({ count: count() }).from(products)
        .where(eq(products.status, 'available')),
      
      // Total Savings (sum of original prices minus sale prices for sold items)
      db.select({
        savings: sql<string>`COALESCE(SUM(
          CASE 
            WHEN ${products.originalPrice} IS NOT NULL AND ${products.originalPrice} > ${products.price}
            THEN ${products.originalPrice} - ${products.price}
            ELSE 0
          END
        ), 0)`
      }).from(products)
        .innerJoin(orders, eq(products.id, orders.productId))
        .where(eq(orders.orderStatus, 'completed')),
      
      // Seller Satisfaction (average seller rating)
      db.select({
        rating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`
      }).from(reviews)
        .where(eq(reviews.reviewType, 'seller')),
      
      // CO2 Saved Today (estimated based on items sold today)
      db.select({
        itemsSoldToday: count(),
        co2Saved: sql<string>`COALESCE(COUNT(*) * 2.5, 0)` // Estimate 2.5kg CO2 saved per item
      }).from(orders)
        .where(and(
          eq(orders.orderStatus, 'completed'),
          gte(orders.createdAt, today)
        ))
    ]);

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalProducts: totalProductsResult[0]?.count || 0,
      totalSales: {
        count: totalSalesResult[0]?.count || 0,
        amount: parseFloat(totalSalesResult[0]?.total || '0')
      },
      activeListings: activeListingsResult[0]?.count || 0,
      itemsSaved: itemsSavedResult.count || 0,
      itemsAvailable: itemsAvailableResult[0]?.count || 0,
      totalSavings: parseFloat(totalSavingsResult[0]?.savings || '0'),
      sellerSatisfaction: parseFloat(sellerSatisfactionResult[0]?.rating || '0'),
      co2SavedToday: parseFloat(co2SavedTodayResult[0]?.co2Saved || '0'),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get trending statistics (changes over time periods)
   */
  async getTrendingStats() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      usersToday,
      usersYesterday,
      usersLastWeek,
      salesThisWeek,
      salesLastWeek,
      listingsThisWeek,
      listingsLastWeek
    ] = await Promise.all([
      // New users today
      db.select({ count: count() }).from(users)
        .where(gte(users.createdAt, yesterday.toISOString())),
      
      // New users yesterday
      db.select({ count: count() }).from(users)
        .where(and(
          gte(users.createdAt, new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString()),
          gte(users.createdAt, yesterday.toISOString())
        )),
      
      // New users last week
      db.select({ count: count() }).from(users)
        .where(gte(users.createdAt, lastWeek.toISOString())),
      
      // Sales this week
      db.select({ 
        count: count(),
        total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`
      }).from(orders)
        .where(and(
          eq(orders.orderStatus, 'completed'),
          gte(orders.createdAt, lastWeek.toISOString())
        )),
      
      // Sales last week
      db.select({ 
        count: count(),
        total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`
      }).from(orders)
        .where(and(
          eq(orders.orderStatus, 'completed'),
          gte(orders.createdAt, new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          gte(orders.createdAt, lastWeek.toISOString())
        )),
      
      // New listings this week
      db.select({ count: count() }).from(products)
        .where(gte(products.createdAt, lastWeek.toISOString())),
      
      // New listings last week
      db.select({ count: count() }).from(products)
        .where(and(
          gte(products.createdAt, new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          gte(products.createdAt, lastWeek.toISOString())
        ))
    ]);

    return {
      userGrowth: {
        today: usersToday[0]?.count || 0,
        yesterday: usersYesterday[0]?.count || 0,
        thisWeek: usersLastWeek[0]?.count || 0,
        changeFromYesterday: (usersToday[0]?.count || 0) - (usersYesterday[0]?.count || 0)
      },
      salesGrowth: {
        thisWeek: {
          count: salesThisWeek[0]?.count || 0,
          amount: parseFloat(salesThisWeek[0]?.total || '0')
        },
        lastWeek: {
          count: salesLastWeek[0]?.count || 0,
          amount: parseFloat(salesLastWeek[0]?.total || '0')
        },
        changePercent: this.calculatePercentChange(
          parseFloat(salesThisWeek[0]?.total || '0'),
          parseFloat(salesLastWeek[0]?.total || '0')
        )
      },
      listingGrowth: {
        thisWeek: listingsThisWeek[0]?.count || 0,
        lastWeek: listingsLastWeek[0]?.count || 0,
        changePercent: this.calculatePercentChange(
          listingsThisWeek[0]?.count || 0,
          listingsLastWeek[0]?.count || 0
        )
      }
    };
  }

  /**
   * Get real-time activity stats
   */
  async getActivityStats() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    const [
      recentOrders,
      recentListings,
      recentUsers,
      activeUsers
    ] = await Promise.all([
      // Orders in last 24 hours
      db.select({ count: count() }).from(orders)
        .where(gte(orders.createdAt, last24Hours.toISOString())),
      
      // New listings in last 24 hours
      db.select({ count: count() }).from(products)
        .where(gte(products.createdAt, last24Hours.toISOString())),
      
      // New users in last 24 hours
      db.select({ count: count() }).from(users)
        .where(gte(users.createdAt, last24Hours.toISOString())),
      
      // Active users (users who created content in last hour)
      db.select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
        .from(users)
        .leftJoin(products, eq(products.sellerId, users.id))
        .leftJoin(orders, eq(orders.buyerId, users.id))
        .where(sql`
          ${products.createdAt} >= ${lastHour.toISOString()} OR 
          ${orders.createdAt} >= ${lastHour.toISOString()} OR
          ${users.updatedAt} >= ${lastHour.toISOString()}
        `)
    ]);

    return {
      last24Hours: {
        orders: recentOrders[0]?.count || 0,
        listings: recentListings[0]?.count || 0,
        newUsers: recentUsers[0]?.count || 0
      },
      activeNow: activeUsers[0]?.count || 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate percentage change between two values
   */
  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get category breakdown statistics
   */
  async getCategoryStats() {
    const categoryStats = await db.select({
      category: products.categoryId,
      count: count(),
      avgPrice: sql<string>`COALESCE(AVG(${products.price}), 0)`,
      totalValue: sql<string>`COALESCE(SUM(${products.price}), 0)`
    })
    .from(products)
    .where(eq(products.status, 'available'))
    .groupBy(products.categoryId)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

    return categoryStats.map(stat => ({
      category: stat.category,
      count: stat.count,
      avgPrice: parseFloat(stat.avgPrice),
      totalValue: parseFloat(stat.totalValue)
    }));
  }
}

export const dashboardStatsService = new DashboardStatsService();