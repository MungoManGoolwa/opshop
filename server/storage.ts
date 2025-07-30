import {
  users,
  categories,
  products,
  wishlists,
  cartItems,
  savedItems,
  messages,
  commissions,
  orders,
  payouts,
  payoutSettings,
  paymentSettings,
  reviews,
  businessSettings,
  listingSettings,
  storeCreditTransactions,
  guestCartSessions,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Wishlist,
  type InsertWishlist,
  type CartItem,
  type InsertCartItem,
  type SavedItem,
  type InsertSavedItem,
  type Message,
  type InsertMessage,
  type Commission,
  type InsertCommission,
  type Order,
  type InsertOrder,
  type Payout,
  type InsertPayout,
  type PayoutSettings,
  type PaymentSettings,
  type Review,
  type InsertReview,
  type BusinessSettings,
  type InsertBusinessSettings,
  type ListingSettings,
  type InsertGuestCartSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, ilike, gte, lte, desc, asc, sql, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserStats(userId: string): Promise<any>;
  
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
  getSimilarProducts(productId: number, limit?: number): Promise<Product[]>;
  getProductsForComparison(productIds: number[]): Promise<Product[]>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  incrementProductViews(id: number): Promise<void>;
  
  // Wishlist operations
  getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;

  // Cart operations
  getUserCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Saved items operations
  getUserSavedItems(userId: string): Promise<(SavedItem & { product: Product })[]>;
  saveItemForLater(savedItem: InsertSavedItem): Promise<SavedItem>;
  moveToCartFromSaved(userId: string, productId: number): Promise<CartItem>;
  removeSavedItem(userId: string, productId: number): Promise<void>;

  // Abandoned cart tracking
  trackCartAbandonment(userId: string): Promise<void>;
  markCartAsRecovered(userId: string): Promise<void>;

  // Guest cart operations  
  getGuestCartItems(sessionId: string): Promise<(any & { product: Product })[]>;
  addToGuestCart(guestCartItem: InsertGuestCartSession): Promise<any>;
  updateGuestCartItemQuantity(sessionId: string, productId: number, quantity: number): Promise<any>;
  removeFromGuestCart(sessionId: string, productId: number): Promise<void>;
  clearGuestCart(sessionId: string): Promise<void>;
  cleanupExpiredGuestCarts(): Promise<void>;
  
  // Message operations
  getConversations(userId: string): Promise<any[]>;
  getConversation(userId: string, otherUserId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getUsersForMessaging(currentUserId: string): Promise<User[]>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<Commission>;
  getSellerCommissions(sellerId: string): Promise<Commission[]>;
  updateCommissionStatus(commissionId: number, status: string, payoutId?: number): Promise<Commission>;
  getPendingCommissions(sellerId?: string): Promise<Commission[]>;
  
  // Payout operations
  createPayout(payout: InsertPayout): Promise<Payout>;
  getSellerPayouts(sellerId: string): Promise<Payout[]>;
  getAllPayouts(): Promise<Payout[]>;
  updatePayoutStatus(payoutId: number, status: string, paymentReference?: string, failureReason?: string): Promise<Payout>;
  getPayoutCommissions(payoutId: number): Promise<(Commission & { order?: Order })[]>;
  
  // Payout settings operations
  getPayoutSettings(): Promise<PayoutSettings>;
  updatePayoutSettings(settings: Partial<PayoutSettings>, updatedBy: string): Promise<PayoutSettings>;
  
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

  async getUserStats(userId: string): Promise<any> {
    try {
      // Get user's product listings count
      const userProducts = await db.select().from(products).where(eq(products.sellerId, userId));
      
      // Get user's orders count (as buyer)  
      const userOrders = await db.select().from(orders).where(eq(orders.buyerId, userId));
      
      // Get user's sales count (as seller)
      const userSales = await db.select().from(orders).where(eq(orders.sellerId, userId));
      
      // Get user's wishlist count
      const userWishlist = await db.select().from(wishlists).where(eq(wishlists.userId, userId));
      
      return {
        listingsCount: userProducts.length,
        ordersCount: userOrders.length,
        salesCount: userSales.length,
        wishlistCount: userWishlist.length,
        totalViews: userProducts.reduce((total, product) => total + (product.views || 0), 0),
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        listingsCount: 0,
        ordersCount: 0,
        salesCount: 0,
        wishlistCount: 0,
        totalViews: 0,
      };
    }
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
    sort?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    // General attributes
    brand?: string;
    color?: string;
    size?: string;
    material?: string;
    // Clothing specific
    clothingSize?: string;
    clothingType?: string;
    clothingGender?: string;
    // Electronics specific
    model?: string;
    storageCapacity?: string;
    screenSize?: string;
    connectivity?: string;
    // Vehicles specific
    make?: string;
    vehicleModel?: string;
    year?: number;
    minYear?: number;
    maxYear?: number;
    kilometers?: number;
    minKilometers?: number;
    maxKilometers?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    drivetrain?: string;
    // Home & Garden specific
    roomType?: string;
    furnitureType?: string;
    assemblyRequired?: boolean;
    // Sports specific
    sportType?: string;
    activityLevel?: string;
    equipmentType?: string;
    // Books specific
    author?: string;
    genre?: string;
    format?: string;
    language?: string;
    publicationYear?: number;
    // Baby & Kids specific
    ageRange?: string;
    educationalValue?: string;
    // Beauty & Health specific
    skinType?: string;
    hairType?: string;
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
      // Enhanced fuzzy search with PostgreSQL text search
      const searchTerm = filters.search.toLowerCase().trim();
      const searchWords = searchTerm.split(/\s+/);
      
      // Build comprehensive search conditions with fuzzy matching
      const searchConditions = [];
      
      // Primary search fields with high priority
      searchConditions.push(
        sql`${products.title} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.brand} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.description} ILIKE ${'%' + searchTerm + '%'}`
      );
      
      // Secondary search fields for comprehensive matching
      searchConditions.push(
        sql`${products.color} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.material} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.model} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.make} ILIKE ${'%' + searchTerm + '%'}`
      );
      
      // Word-based search for better matching
      for (const word of searchWords) {
        if (word.length >= 2) {
          searchConditions.push(
            sql`${products.title} ILIKE ${'%' + word + '%'}`,
            sql`${products.brand} ILIKE ${'%' + word + '%'}`,
            sql`${products.description} ILIKE ${'%' + word + '%'}`
          );
        }
      }
      
      conditions.push(sql`(${sql.join(searchConditions, sql` OR `)})`);
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

    // General attribute filters
    if (filters?.brand) {
      conditions.push(ilike(products.brand, `%${filters.brand}%`));
    }
    if (filters?.color) {
      conditions.push(eq(products.color, filters.color));
    }
    if (filters?.size) {
      conditions.push(eq(products.size, filters.size));
    }
    if (filters?.material) {
      conditions.push(eq(products.material, filters.material));
    }

    // Clothing specific filters
    if (filters?.clothingSize) {
      conditions.push(eq(products.clothingSize, filters.clothingSize));
    }
    if (filters?.clothingType) {
      conditions.push(eq(products.clothingType, filters.clothingType));
    }
    if (filters?.clothingGender) {
      conditions.push(eq(products.clothingGender, filters.clothingGender));
    }

    // Electronics specific filters
    if (filters?.model) {
      conditions.push(ilike(products.model, `%${filters.model}%`));
    }
    if (filters?.storageCapacity) {
      conditions.push(eq(products.storageCapacity, filters.storageCapacity));
    }
    if (filters?.screenSize) {
      conditions.push(eq(products.screenSize, filters.screenSize));
    }
    if (filters?.connectivity) {
      conditions.push(ilike(products.connectivity, `%${filters.connectivity}%`));
    }

    // Vehicles specific filters
    if (filters?.make) {
      conditions.push(eq(products.make, filters.make));
    }
    if (filters?.vehicleModel) {
      conditions.push(ilike(products.vehicleModel, `%${filters.vehicleModel}%`));
    }
    if (filters?.year) {
      conditions.push(eq(products.year, filters.year));
    }
    if (filters?.minYear) {
      conditions.push(gte(products.year, filters.minYear));
    }
    if (filters?.maxYear) {
      conditions.push(lte(products.year, filters.maxYear));
    }
    if (filters?.kilometers) {
      conditions.push(eq(products.kilometers, filters.kilometers));
    }
    if (filters?.minKilometers) {
      conditions.push(gte(products.kilometers, filters.minKilometers));
    }
    if (filters?.maxKilometers) {
      conditions.push(lte(products.kilometers, filters.maxKilometers));
    }
    if (filters?.fuelType) {
      conditions.push(eq(products.fuelType, filters.fuelType));
    }
    if (filters?.transmission) {
      conditions.push(eq(products.transmission, filters.transmission));
    }
    if (filters?.bodyType) {
      conditions.push(eq(products.bodyType, filters.bodyType));
    }
    if (filters?.drivetrain) {
      conditions.push(eq(products.drivetrain, filters.drivetrain));
    }

    // Home & Garden specific filters
    if (filters?.roomType) {
      conditions.push(eq(products.roomType, filters.roomType));
    }
    if (filters?.furnitureType) {
      conditions.push(eq(products.furnitureType, filters.furnitureType));
    }
    if (filters?.assemblyRequired !== undefined) {
      conditions.push(eq(products.assemblyRequired, filters.assemblyRequired));
    }

    // Sports specific filters
    if (filters?.sportType) {
      conditions.push(eq(products.sportType, filters.sportType));
    }
    if (filters?.activityLevel) {
      conditions.push(eq(products.activityLevel, filters.activityLevel));
    }
    if (filters?.equipmentType) {
      conditions.push(eq(products.equipmentType, filters.equipmentType));
    }

    // Books specific filters
    if (filters?.author) {
      conditions.push(ilike(products.author, `%${filters.author}%`));
    }
    if (filters?.genre) {
      conditions.push(eq(products.genre, filters.genre));
    }
    if (filters?.format) {
      conditions.push(eq(products.format, filters.format));
    }
    if (filters?.language) {
      conditions.push(eq(products.language, filters.language));
    }
    if (filters?.publicationYear) {
      conditions.push(eq(products.publicationYear, filters.publicationYear));
    }

    // Baby & Kids specific filters
    if (filters?.ageRange) {
      conditions.push(eq(products.ageRange, filters.ageRange));
    }
    if (filters?.educationalValue) {
      conditions.push(eq(products.educationalValue, filters.educationalValue));
    }

    // Beauty & Health specific filters
    if (filters?.skinType) {
      conditions.push(eq(products.skinType, filters.skinType));
    }
    if (filters?.hairType) {
      conditions.push(eq(products.hairType, filters.hairType));
    }

    // Build the query with conditions
    let query = db.select().from(products).where(and(...conditions));

    // Apply sorting
    const sortBy = filters?.sort || 'newest';
    switch (sortBy) {
      case 'oldest':
        query = query.orderBy(asc(products.createdAt));
        break;
      case 'price_asc':
        query = query.orderBy(asc(products.price));
        break;
      case 'price_desc':
        query = query.orderBy(desc(products.price));
        break;
      case 'views_desc':
        query = query.orderBy(desc(products.views));
        break;
      case 'title_asc':
        query = query.orderBy(asc(products.title));
        break;
      case 'title_desc':
        query = query.orderBy(desc(products.title));
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(products.createdAt));
        break;
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getSimilarProducts(productId: number, limit: number = 6): Promise<(Product & { sellerName?: string })[]> {
    // Get the original product to find similar items
    const originalProduct = await this.getProduct(productId);
    if (!originalProduct) {
      return [];
    }

    const conditions = [
      eq(products.status, "available"),
      sql`${products.id} != ${productId}` // Exclude the original product
    ];

    // Primary match: same category
    const categoryConditions = [...conditions];
    if (originalProduct.categoryId) {
      categoryConditions.push(eq(products.categoryId, originalProduct.categoryId));
    }

    // Add specific attribute matching based on category
    const specificConditions = [...categoryConditions];
    
    // Only add non-null conditions to avoid Drizzle issues
    if (originalProduct.brand && originalProduct.brand.trim()) {
      specificConditions.push(eq(products.brand, originalProduct.brand));
    }
    if (originalProduct.model && originalProduct.model.trim()) {
      specificConditions.push(ilike(products.model, `%${originalProduct.model}%`));
    }
    if (originalProduct.storageCapacity && originalProduct.storageCapacity.trim()) {
      specificConditions.push(eq(products.storageCapacity, originalProduct.storageCapacity));
    }
    if (originalProduct.clothingSize && originalProduct.clothingSize.trim()) {
      specificConditions.push(eq(products.clothingSize, originalProduct.clothingSize));
    }
    if (originalProduct.clothingType && originalProduct.clothingType.trim()) {
      specificConditions.push(eq(products.clothingType, originalProduct.clothingType));
    }
    if (originalProduct.clothingGender && originalProduct.clothingGender.trim()) {
      specificConditions.push(eq(products.clothingGender, originalProduct.clothingGender));
    }
    if (originalProduct.make && originalProduct.make.trim()) {
      specificConditions.push(eq(products.make, originalProduct.make));
    }
    if (originalProduct.fuelType && originalProduct.fuelType.trim()) {
      specificConditions.push(eq(products.fuelType, originalProduct.fuelType));
    }
    if (originalProduct.transmission && originalProduct.transmission.trim()) {
      specificConditions.push(eq(products.transmission, originalProduct.transmission));
    }
    if (originalProduct.author && originalProduct.author.trim()) {
      specificConditions.push(ilike(products.author, `%${originalProduct.author}%`));
    }
    if (originalProduct.genre && originalProduct.genre.trim()) {
      specificConditions.push(eq(products.genre, originalProduct.genre));
    }

    // Try to get specific matches first with basic select
    let similarProductsData = [];
    try {
      // Ensure we have at least basic conditions before making the query
      if (specificConditions.length === 0) {
        specificConditions.push(...conditions);
      }
      
      similarProductsData = await db.select()
        .from(products)
        .where(and(...specificConditions))
        .orderBy(desc(products.views), desc(products.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting specific matches:', error);
      // Fall back to category matches directly
      similarProductsData = [];
    }

    // Get seller names separately for the similar products
    const allSellerIds = new Set(similarProductsData.map(p => p.sellerId).filter(Boolean));
    
    // If not enough specific matches, fill with category matches
    if (similarProductsData.length < limit && originalProduct.categoryId) {
      const remaining = limit - similarProductsData.length;
      const excludeIds = [productId, ...similarProductsData.map(p => p.id)];
      
      let categoryMatchesData = [];
      try {
        categoryMatchesData = await db.select()
          .from(products)
          .where(and(
            eq(products.status, "available"),
            eq(products.categoryId, originalProduct.categoryId),
            sql`${products.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}`), sql`, `)})`
          ))
          .orderBy(desc(products.views), desc(products.createdAt))
          .limit(remaining);
      } catch (error) {
        console.error('Error getting category matches:', error);
        categoryMatchesData = [];
      }

      // Add category matches to the list
      similarProductsData = [...similarProductsData, ...categoryMatchesData];
      categoryMatchesData.forEach(p => p.sellerId && allSellerIds.add(p.sellerId));
    }

    // If still not enough, fill with products in similar price range
    if (similarProductsData.length < limit) {
      const remaining = limit - similarProductsData.length;
      const excludeIds = [productId, ...similarProductsData.map(p => p.id)];
      const minPrice = parseFloat(originalProduct.price) * 0.5; // 50% of original price
      const maxPrice = parseFloat(originalProduct.price) * 2.0; // 200% of original price

      let priceMatchesData = [];
      try {
        priceMatchesData = await db.select()
          .from(products)
          .where(and(
            eq(products.status, "available"),
            gte(products.price, minPrice.toString()),
            lte(products.price, maxPrice.toString()),
            sql`${products.id} NOT IN (${sql.join(excludeIds.map(id => sql`${id}`), sql`, `)})`
          ))
          .orderBy(desc(products.views), desc(products.createdAt))
          .limit(remaining);
      } catch (error) {
        console.error('Error getting price matches:', error);
        priceMatchesData = [];
      }

      // Add price matches to the list
      similarProductsData = [...similarProductsData, ...priceMatchesData];
      priceMatchesData.forEach(p => p.sellerId && allSellerIds.add(p.sellerId));
    }

    // Get all seller names in one query
    const sellersMap = new Map();
    if (allSellerIds.size > 0) {
      const sellerIdsArray = Array.from(allSellerIds);
      const sellers = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }).from(users).where(sql`${users.id} IN (${sql.join(sellerIdsArray.map(id => sql`${id}`), sql`, `)})`);
      
      sellers.forEach(seller => {
        const sellerName = [seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.email || 'Unknown Seller';
        sellersMap.set(seller.id, sellerName);
      });
    }

    // Add seller names to products and return
    return similarProductsData.slice(0, limit).map(product => ({
      ...product,
      sellerName: sellersMap.get(product.sellerId) || null
    }));
  }

  async getProductsForComparison(productIds: number[]): Promise<(Product & { sellerName?: string })[]> {
    if (productIds.length === 0) {
      return [];
    }

    // Get products first
    const productsData = await db.select()
      .from(products)
      .where(and(
        eq(products.status, "available"),
        sql`${products.id} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`
      ))
      .orderBy(desc(products.views), desc(products.createdAt));

    // Get seller names separately
    const sellerIds = productsData.map(p => p.sellerId).filter(Boolean);
    const sellersMap = new Map();
    if (sellerIds.length > 0) {
      const sellers = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }).from(users).where(sql`${users.id} IN (${sql.join(sellerIds.map(id => sql`${id}`), sql`, `)})`);
      
      sellers.forEach(seller => {
        const sellerName = [seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.email || 'Unknown Seller';
        sellersMap.set(seller.id, sellerName);
      });
    }

    // Add seller names to products
    return productsData.map(product => ({
      ...product,
      sellerName: sellersMap.get(product.sellerId) || null
    }));
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

  // Cart operations
  async getUserCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db.select({
      id: cartItems.id,
      userId: cartItems.userId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, cartItemData.userId), eq(cartItems.productId, cartItemData.productId)));
    
    if (existingItem.length > 0) {
      // Update quantity instead of creating duplicate
      const [updatedItem] = await db.update(cartItems)
        .set({ 
          quantity: existingItem[0].quantity + (cartItemData.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db.insert(cartItems).values(cartItemData).returning();
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const [cartItem] = await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem;
  }

  async removeFromCart(userId: string, productId: number): Promise<void> {
    await db.delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Saved items operations
  async getUserSavedItems(userId: string): Promise<(SavedItem & { product: Product })[]> {
    return await db.select({
      id: savedItems.id,
      userId: savedItems.userId,
      productId: savedItems.productId,
      quantity: savedItems.quantity,
      savedFromCart: savedItems.savedFromCart,
      createdAt: savedItems.createdAt,
      updatedAt: savedItems.updatedAt,
      product: products,
    })
    .from(savedItems)
    .innerJoin(products, eq(savedItems.productId, products.id))
    .where(eq(savedItems.userId, userId))
    .orderBy(desc(savedItems.createdAt));
  }

  async saveItemForLater(savedItemData: InsertSavedItem): Promise<SavedItem> {
    // Check if item already exists in saved items
    const existingItem = await db.select().from(savedItems)
      .where(and(eq(savedItems.userId, savedItemData.userId), eq(savedItems.productId, savedItemData.productId)));
    
    if (existingItem.length > 0) {
      // Update quantity instead of creating duplicate
      const [updatedItem] = await db.update(savedItems)
        .set({ 
          quantity: existingItem[0].quantity + (savedItemData.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(savedItems.id, existingItem[0].id))
        .returning();
      return updatedItem;
    }

    const [savedItem] = await db.insert(savedItems).values(savedItemData).returning();
    return savedItem;
  }

  async moveToCartFromSaved(userId: string, productId: number): Promise<CartItem> {
    // Get the saved item
    const [savedItem] = await db.select().from(savedItems)
      .where(and(eq(savedItems.userId, userId), eq(savedItems.productId, productId)));
    
    if (!savedItem) {
      throw new Error("Saved item not found");
    }

    // Add to cart
    const cartItem = await this.addToCart({
      userId,
      productId,
      quantity: savedItem.quantity
    });

    // Remove from saved items
    await this.removeSavedItem(userId, productId);

    return cartItem;
  }

  async removeSavedItem(userId: string, productId: number): Promise<void> {
    await db.delete(savedItems)
      .where(and(eq(savedItems.userId, userId), eq(savedItems.productId, productId)));
  }

  // Guest cart operations
  async getGuestCartItems(sessionId: string): Promise<(any & { product: Product })[]> {
    return await db.select({
      id: guestCartSessions.id,
      sessionId: guestCartSessions.sessionId,
      quantity: guestCartSessions.quantity,
      createdAt: guestCartSessions.createdAt,
      product: products,
    })
    .from(guestCartSessions)
    .innerJoin(products, eq(guestCartSessions.productId, products.id))
    .where(and(
      eq(guestCartSessions.sessionId, sessionId),
      sql`${guestCartSessions.expiresAt} > NOW()`
    ))
    .orderBy(desc(guestCartSessions.createdAt));
  }

  async addToGuestCart(guestCartItem: InsertGuestCartSession): Promise<any> {
    // Check if item already exists in guest cart
    const [existingItem] = await db.select()
      .from(guestCartSessions)
      .where(and(
        eq(guestCartSessions.sessionId, guestCartItem.sessionId),
        eq(guestCartSessions.productId, guestCartItem.productId)
      ));

    if (existingItem) {
      // Update quantity if item exists
      const [updated] = await db.update(guestCartSessions)
        .set({ 
          quantity: existingItem.quantity + (guestCartItem.quantity || 1),
          updatedAt: new Date()
        })
        .where(eq(guestCartSessions.id, existingItem.id))
        .returning();
      return updated;
    } else {
      // Add new item to guest cart
      const [newItem] = await db.insert(guestCartSessions)
        .values({
          ...guestCartItem,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        })
        .returning();
      return newItem;
    }
  }

  async updateGuestCartItemQuantity(sessionId: string, productId: number, quantity: number): Promise<any> {
    const [updated] = await db.update(guestCartSessions)
      .set({ quantity, updatedAt: new Date() })
      .where(and(
        eq(guestCartSessions.sessionId, sessionId),
        eq(guestCartSessions.productId, productId)
      ))
      .returning();
    return updated;
  }

  async removeFromGuestCart(sessionId: string, productId: number): Promise<void> {
    await db.delete(guestCartSessions)
      .where(and(
        eq(guestCartSessions.sessionId, sessionId),
        eq(guestCartSessions.productId, productId)
      ));
  }

  async clearGuestCart(sessionId: string): Promise<void> {
    await db.delete(guestCartSessions)
      .where(eq(guestCartSessions.sessionId, sessionId));
  }

  async cleanupExpiredGuestCarts(): Promise<void> {
    await db.delete(guestCartSessions)
      .where(sql`${guestCartSessions.expiresAt} < NOW()`);
  }

  // Abandoned cart tracking methods
  async trackCartAbandonment(userId: string): Promise<void> {
    const { abandonedCartService } = await import("./abandoned-cart-service");
    await abandonedCartService.trackCartAbandonment(userId);
  }

  async markCartAsRecovered(userId: string): Promise<void> {
    const { abandonedCartService } = await import("./abandoned-cart-service");
    await abandonedCartService.markCartAsRecovered(userId);
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

  async updateCommissionStatus(commissionId: number, status: string, payoutId?: number): Promise<Commission> {
    const [commission] = await db.update(commissions)
      .set({ status, payoutId, updatedAt: new Date() })
      .where(eq(commissions.id, commissionId))
      .returning();
    return commission;
  }

  async getPendingCommissions(sellerId?: string): Promise<Commission[]> {
    const whereConditions = [eq(commissions.status, "pending")];
    if (sellerId) {
      whereConditions.push(eq(commissions.sellerId, sellerId));
    }
    
    return await db.select().from(commissions)
      .where(and(...whereConditions))
      .orderBy(desc(commissions.createdAt));
  }

  // Payout operations
  async createPayout(payoutData: InsertPayout): Promise<Payout> {
    const [payout] = await db.insert(payouts).values(payoutData).returning();
    return payout;
  }

  async getSellerPayouts(sellerId: string): Promise<Payout[]> {
    return await db.select().from(payouts)
      .where(eq(payouts.sellerId, sellerId))
      .orderBy(desc(payouts.createdAt));
  }

  async getAllPayouts(): Promise<Payout[]> {
    return await db.select().from(payouts)
      .orderBy(desc(payouts.createdAt));
  }

  async updatePayoutStatus(payoutId: number, status: string, paymentReference?: string, failureReason?: string): Promise<Payout> {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === "completed") {
      updateData.processedDate = new Date();
      updateData.paymentReference = paymentReference;
    } else if (status === "failed") {
      updateData.failureReason = failureReason;
    }
    
    const [payout] = await db.update(payouts)
      .set(updateData)
      .where(eq(payouts.id, payoutId))
      .returning();
    return payout;
  }

  async getPayoutCommissions(payoutId: number): Promise<(Commission & { order?: Order })[]> {
    return await db.select({
      commission: commissions,
      order: orders,
    })
    .from(commissions)
    .leftJoin(orders, eq(commissions.orderId, orders.id))
    .where(eq(commissions.payoutId, payoutId))
    .orderBy(desc(commissions.createdAt)) as any;
  }

  // Payout settings operations
  async getPayoutSettings(): Promise<PayoutSettings> {
    const [settings] = await db.select().from(payoutSettings)
      .orderBy(desc(payoutSettings.id))
      .limit(1);
    
    if (!settings) {
      const [newSettings] = await db.insert(payoutSettings).values({}).returning();
      return newSettings;
    }
    
    return settings;
  }

  async updatePayoutSettings(settingsData: Partial<PayoutSettings>, updatedBy: string): Promise<PayoutSettings> {
    const existingSettings = await this.getPayoutSettings();
    
    const [settings] = await db.update(payoutSettings)
      .set({ ...settingsData, updatedAt: new Date(), updatedBy })
      .where(eq(payoutSettings.id, existingSettings.id))
      .returning();
    return settings;
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

  // Admin operations - getAllUsers method already defined above

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
  // Product search with fuzzy matching
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const searchTerm = query.toLowerCase().trim();
      const searchWords = searchTerm.split(/\s+/);
      
      // Build comprehensive search conditions with fuzzy matching
      const searchConditions = [];
      
      // Primary search fields with high priority
      searchConditions.push(
        sql`${products.title} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.brand} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.description} ILIKE ${'%' + searchTerm + '%'}`
      );
      
      // Secondary search fields for comprehensive matching
      searchConditions.push(
        sql`${products.color} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.material} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.model} ILIKE ${'%' + searchTerm + '%'}`,
        sql`${products.make} ILIKE ${'%' + searchTerm + '%'}`
      );
      
      // Word-based search for better matching
      for (const word of searchWords) {
        if (word.length >= 2) {
          searchConditions.push(
            sql`${products.title} ILIKE ${'%' + word + '%'}`,
            sql`${products.brand} ILIKE ${'%' + word + '%'}`,
            sql`${products.description} ILIKE ${'%' + word + '%'}`
          );
        }
      }
      
      const results = await db
        .select({
          id: products.id,
          title: products.title,
          description: products.description,
          price: products.price,
          imageUrl: products.imageUrl,
          brand: products.brand,
          condition: products.condition,
          views: products.views,
          categoryId: products.categoryId,
          createdAt: products.createdAt
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            eq(products.status, 'available'),
            sql`(${sql.join(searchConditions, sql` OR `)})`
          )
        )
        .orderBy(sql`
          CASE 
            WHEN ${products.title} ILIKE ${'%' + searchTerm + '%'} THEN 1
            WHEN ${products.brand} ILIKE ${'%' + searchTerm + '%'} THEN 2
            WHEN ${products.description} ILIKE ${'%' + searchTerm + '%'} THEN 3
            ELSE 4
          END,
          ${products.views} DESC,
          ${products.createdAt} DESC
        `)
        .limit(limit);

      return results.map(result => ({
        ...result,
        category: categories.name || 'Uncategorized'
      })) as any[];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  // Get search suggestions for autocomplete
  async getSearchSuggestions(): Promise<any[]> {
    try {
      // Get popular brands
      const popularBrands = await db
        .select({
          query: products.brand,
          type: sql`'brand'`,
          count: sql`COUNT(*)::int`
        })
        .from(products)
        .where(and(
          eq(products.status, 'available'),
          isNotNull(products.brand)
        ))
        .groupBy(products.brand)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(5);

      // Get popular categories
      const popularCategories = await db
        .select({
          query: categories.name,
          type: sql`'category'`,
          count: sql`COUNT(*)::int`
        })
        .from(categories)
        .leftJoin(products, eq(categories.id, products.categoryId))
        .where(eq(products.status, 'available'))
        .groupBy(categories.name)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(5);

      // Get trending searches (mock for now - would track actual searches in production)
      const trendingSearches = [
        { query: 'iPhone', type: 'trending', count: 45 },
        { query: 'Nike shoes', type: 'trending', count: 32 },
        { query: 'vintage furniture', type: 'trending', count: 28 },
        { query: 'gaming laptop', type: 'trending', count: 24 }
      ];

      // Get recent searches from localStorage (handled client-side)
      const suggestions = [
        ...trendingSearches,
        ...popularBrands.map(b => ({ ...b, type: 'brand' })),
        ...popularCategories.map(c => ({ ...c, type: 'category' }))
      ];

      return suggestions;
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
