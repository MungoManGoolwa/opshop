import {
  users,
  categories,
  products,
  wishlists,
  messages,
  commissions,
  orders,
  paymentSettings,
  reviews,
  businessSettings,
  listingSettings,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Wishlist,
  type InsertWishlist,
  type Message,
  type InsertMessage,
  type Commission,
  type InsertCommission,
  type Order,
  type InsertOrder,
  type PaymentSettings,
  type Review,
  type InsertReview,
  type BusinessSettings,
  type InsertBusinessSettings,
  type ListingSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, sql, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  incrementProductViews(id: number): Promise<void>;
  
  // Wishlist operations
  getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  
  // Message operations
  getConversations(userId: string): Promise<any[]>;
  getConversation(userId: string, otherUserId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUsersForMessaging(currentUserId: string): Promise<User[]>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<Commission>;
  getSellerCommissions(sellerId: string): Promise<Commission[]>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByOrderId(orderId: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getSellerOrders(sellerId: string): Promise<Order[]>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;
  
  // Wallet operations for detailed purchase/sales history
  getUserPurchases(userId: string): Promise<any[]>;
  getUserSales(userId: string): Promise<any[]>;
  getUserProducts(userId: string): Promise<Product[]>;
  
  // Payment settings operations
  getPaymentSettings(): Promise<PaymentSettings | undefined>;
  updatePaymentSettings(settings: Partial<PaymentSettings>, updatedBy: string): Promise<PaymentSettings>;

  // Business settings operations
  getBusinessSettings(): Promise<BusinessSettings>;
  updateBusinessSettings(settings: Partial<InsertBusinessSettings>): Promise<BusinessSettings>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllProducts(): Promise<Product[]>;
  getAllOrders(): Promise<Order[]>;
  createAdminUser(userData: any): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  updateUserProfile(userId: string, userData: any): Promise<User>;
  
  // Listing Settings operations
  getListingSettings(): Promise<ListingSettings>;
  updateListingSettings(settings: Partial<ListingSettings>): Promise<ListingSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category || undefined;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<Product[]> {
    const conditions = [eq(products.status, 'available')];

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.condition) {
      conditions.push(eq(products.condition, filters.condition));
    }
    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    if (filters?.location) {
      conditions.push(like(products.location, `%${filters.location}%`));
    }
    if (filters?.search) {
      conditions.push(
        sql`(${products.title} ILIKE ${'%' + filters.search + '%'} OR 
            ${products.description} ILIKE ${'%' + filters.search + '%'} OR 
            ${products.brand} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    // Location-based radius search using Haversine formula
    if (filters?.latitude && filters?.longitude && filters?.radius) {
      conditions.push(
        sql`(
          6371 * acos(
            cos(radians(${filters.latitude})) * 
            cos(radians(${products.latitude})) * 
            cos(radians(${products.longitude}) - radians(${filters.longitude})) + 
            sin(radians(${filters.latitude})) * 
            sin(radians(${products.latitude}))
          )
        ) <= ${filters.radius}`
      );
    }

    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async incrementProductViews(id: number): Promise<void> {
    await db.update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  }

  // Wishlist operations
  async getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const result = await db.select()
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId));

    return result.map(row => ({
      ...row.wishlists,
      product: row.products,
    }));
  }

  async addToWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const [wishlist] = await db.insert(wishlists).values(wishlistData).returning();
    return wishlist;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db.delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
  }

  // Message operations
  async getConversations(userId: string): Promise<any[]> {
    // Get all unique users that have messaged with the current user
    const conversationUsers = await db
      .select({
        otherUserId: sql<string>`CASE 
          WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId}
          ELSE ${messages.senderId}
        END`,
        lastMessageId: sql<number>`MAX(${messages.id})`,
        unreadCount: sql<number>`COUNT(CASE 
          WHEN ${messages.receiverId} = ${userId} AND ${messages.isRead} = false THEN 1 
          END)`,
      })
      .from(messages)
      .where(
        sql`${messages.senderId} = ${userId} OR ${messages.receiverId} = ${userId}`
      )
      .groupBy(sql`CASE 
        WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId}
        ELSE ${messages.senderId}
      END`)
      .orderBy(sql`MAX(${messages.createdAt}) DESC`);

    // Get user details and last messages
    const conversations = [];
    for (const conv of conversationUsers) {
      const [otherUser] = await db.select().from(users).where(eq(users.id, conv.otherUserId));
      const [lastMessage] = await db.select().from(messages).where(eq(messages.id, conv.lastMessageId));
      
      if (otherUser) {
        conversations.push({
          otherUser,
          lastMessage,
          unreadCount: conv.unreadCount,
        });
      }
    }

    return conversations;
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        sql`(${messages.senderId} = ${userId} AND ${messages.receiverId} = ${otherUserId}) 
            OR (${messages.senderId} = ${otherUserId} AND ${messages.receiverId} = ${userId})`
      )
      .orderBy(messages.createdAt);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUsersForMessaging(currentUserId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(sql`${users.id} != ${currentUserId} AND ${users.isActive} = true`)
      .orderBy(users.email);
  }

  // Commission operations
  async createCommission(commissionData: InsertCommission): Promise<Commission> {
    const [commission] = await db.insert(commissions).values(commissionData).returning();
    return commission;
  }

  async getSellerCommissions(sellerId: string): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(eq(commissions.sellerId, sellerId))
      .orderBy(desc(commissions.createdAt));
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByOrderId(orderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderId, orderId));
    return order || undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Payment settings operations
  async getPaymentSettings(): Promise<PaymentSettings | undefined> {
    const [settings] = await db.select().from(paymentSettings)
      .orderBy(desc(paymentSettings.id))
      .limit(1);
    return settings || undefined;
  }

  async updatePaymentSettings(settingsData: Partial<PaymentSettings>, updatedBy: string): Promise<PaymentSettings> {
    const existingSettings = await this.getPaymentSettings();
    
    if (existingSettings) {
      const [settings] = await db.update(paymentSettings)
        .set({ ...settingsData, updatedAt: new Date(), updatedBy })
        .where(eq(paymentSettings.id, existingSettings.id))
        .returning();
      return settings;
    } else {
      const [settings] = await db.insert(paymentSettings)
        .values({ ...settingsData, updatedBy })
        .returning();
      return settings;
    }
  }

  // Shop upgrade operations
  async upgradeToShop(userId: string, upgradeDate: Date, expiryDate: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        accountType: "shop",
        shopUpgradeDate: upgradeDate,
        shopExpiryDate: expiryDate,
        maxListings: 1000,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async checkShopExpiry(userId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.accountType !== "shop") return false;
    
    if (user.shopExpiryDate && new Date() > user.shopExpiryDate) {
      // Downgrade expired shop to seller
      await db
        .update(users)
        .set({
          accountType: "seller",
          maxListings: 10,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return false;
    }
    
    return true;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getReviewsByUser(userId: string): Promise<(Review & { reviewer: User; product?: Product })[]> {
    const result = await db.select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row.reviews,
      reviewer: row.users,
      product: row.products || undefined,
    }));
  }

  async getReviewStats(userId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { [key: number]: number };
  }> {
    const reviewStats = await db.select({
      rating: reviews.rating,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.revieweeId, userId))
    .groupBy(reviews.rating);

    const totalReviews = reviewStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRating = reviewStats.reduce((sum, stat) => sum + (stat.rating * stat.count), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const ratingBreakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewStats.forEach(stat => {
      ratingBreakdown[stat.rating] = stat.count;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingBreakdown,
    };
  }

  async getProductReviews(productId: number): Promise<(Review & { reviewer: User })[]> {
    const result = await db.select()
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row.reviews,
      reviewer: row.users,
    }));
  }

  async canUserReview(reviewerId: string, orderId: number): Promise<boolean> {
    // Check if user has purchased the item and hasn't already reviewed
    const [order] = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        or(eq(orders.buyerId, reviewerId), eq(orders.sellerId, reviewerId)),
        eq(orders.paymentStatus, "completed")
      ));

    if (!order) return false;

    // Check if already reviewed
    const [existingReview] = await db.select()
      .from(reviews)
      .where(and(
        eq(reviews.orderId, orderId),
        eq(reviews.reviewerId, reviewerId)
      ));

    return !existingReview;
  }

  async markReviewHelpful(reviewId: number): Promise<void> {
    await db.update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId));
  }

  // Admin user management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createAdminUser(userData: any): Promise<User> {
    const [user] = await db.insert(users).values({
      id: userData.id || sql`gen_random_uuid()`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'customer',
      accountType: userData.accountType || 'seller',
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      postcode: userData.postcode,
      country: userData.country || 'Australia',
      bio: userData.bio,
      businessName: userData.businessName,
      abn: userData.abn,
      isActive: userData.isActive !== false,
      maxListings: userData.maxListings || 10,
      shopExpiryDate: userData.shopExpiryDate ? new Date(userData.shopExpiryDate) : null,
    }).returning();
    return user;
  }

  async updateUserProfile(userId: string, userData: any): Promise<User> {
    const [user] = await db.update(users)
      .set({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        accountType: userData.accountType,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        postcode: userData.postcode,
        country: userData.country,
        bio: userData.bio,
        businessName: userData.businessName,
        abn: userData.abn,
        isActive: userData.isActive,
        maxListings: userData.maxListings,
        useDefaultMaxListings: userData.useDefaultMaxListings,
        shopExpiryDate: userData.shopExpiryDate ? new Date(userData.shopExpiryDate) : null,
        commissionRate: userData.commissionRate?.toString() || "10.00",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    // Note: In production, you might want to soft delete or handle related records
    await db.delete(users).where(eq(users.id, userId));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  // Wallet operations implementation
  async getUserPurchases(userId: string): Promise<any[]> {
    return await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        product: {
          id: products.id,
          title: products.title,
          images: products.images,
        },
        seller: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        totalAmount: orders.totalAmount,
        shippingCost: orders.shippingCost,
        paymentGateway: orders.paymentGateway,
        paymentStatus: orders.paymentStatus,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.sellerId, users.id))
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserSales(userId: string): Promise<any[]> {
    return await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        product: {
          id: products.id,
          title: products.title,
          images: products.images,
        },
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        totalAmount: orders.totalAmount,
        commissionAmount: commissions.commissionAmount,
        sellerAmount: commissions.sellerAmount,
        paymentStatus: orders.paymentStatus,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.buyerId, users.id))
      .leftJoin(commissions, eq(orders.id, commissions.orderId))
      .where(eq(orders.sellerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
  }

  // Business settings operations
  async getBusinessSettings(): Promise<BusinessSettings> {
    const [settings] = await db.select().from(businessSettings).limit(1);
    if (settings) {
      return settings;
    }
    
    // If no settings exist, create default settings
    const [defaultSettings] = await db.insert(businessSettings).values({}).returning();
    return defaultSettings;
  }

  async updateBusinessSettings(settingsData: Partial<InsertBusinessSettings>): Promise<BusinessSettings> {
    // Get existing settings or create if none exist
    const existingSettings = await this.getBusinessSettings();
    
    const [updatedSettings] = await db
      .update(businessSettings)
      .set({
        ...settingsData,
        updatedAt: new Date(),
      })
      .where(eq(businessSettings.id, existingSettings.id))
      .returning();
    
    return updatedSettings;
  }
  
  // Listing Settings operations
  async getListingSettings(): Promise<ListingSettings> {
    const [settings] = await db.select().from(listingSettings).limit(1);
    
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(listingSettings)
        .values({
          defaultCustomerMaxListings: 10,
          defaultBusinessMaxListings: 100,
          defaultSellerMaxListings: 25,
        })
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateListingSettings(settingsData: Partial<ListingSettings>): Promise<ListingSettings> {
    const existingSettings = await this.getListingSettings();
    
    const [settings] = await db
      .update(listingSettings)
      .set({
        ...settingsData,
        updatedAt: new Date(),
      })
      .where(eq(listingSettings.id, existingSettings.id))
      .returning();
    
    return settings;
  }
}

export const storage = new DatabaseStorage();
