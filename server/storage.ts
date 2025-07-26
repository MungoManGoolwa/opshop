import {
  users,
  categories,
  products,
  wishlists,
  messages,
  commissions,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, sql } from "drizzle-orm";

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
  getConversation(senderId: string, receiverId: string, productId?: number): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<Commission>;
  getSellerCommissions(sellerId: string): Promise<Commission[]>;
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
  async getConversation(senderId: string, receiverId: string, productId?: number): Promise<Message[]> {
    const conditions = [
      sql`(${messages.senderId} = ${senderId} AND ${messages.receiverId} = ${receiverId}) OR
          (${messages.senderId} = ${receiverId} AND ${messages.receiverId} = ${senderId})`
    ];

    if (productId) {
      conditions.push(eq(messages.productId, productId));
    }

    return await db.select().from(messages)
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt));
  }

  async sendMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
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
}

export const storage = new DatabaseStorage();