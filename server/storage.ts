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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private wishlists: Map<number, Wishlist> = new Map();
  private messages: Map<number, Message> = new Map();
  private commissions: Map<number, Commission> = new Map();
  
  private nextCategoryId = 1;
  private nextProductId = 1;
  private nextWishlistId = 1;
  private nextMessageId = 1;
  private nextCommissionId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const defaultCategories = [
      { name: "New Arrivals", slug: "new-arrivals", description: "Recently listed items" },
      { name: "Clothing", slug: "clothing", description: "Men, Women, Kids clothing" },
      { name: "Homewares", slug: "homewares", description: "Home decor and kitchenware" },
      { name: "Electronics", slug: "electronics", description: "Gadgets and technology" },
      { name: "Furniture", slug: "furniture", description: "Home and office furniture" },
      { name: "Sports", slug: "sports", description: "Sports equipment and gear" },
      { name: "Entertainment", slug: "entertainment", description: "Books, games, media" },
      { name: "Bric-a-brac", slug: "bric-a-brac", description: "Collectibles and misc items" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.nextCategoryId++,
        ...cat,
        parentId: null,
        isActive: true,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "customer",
      location: userData.location || null,
      phone: userData.phone || null,
      isVerified: userData.isVerified || false,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.nextCategoryId++,
      ...categoryData,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
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
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.condition) {
        products = products.filter(p => p.condition === filters.condition);
      }
      if (filters.minPrice) {
        products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }
      if (filters.location) {
        products = products.filter(p => p.location?.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(p => 
          p.title.toLowerCase().includes(searchTerm) ||
          p.description?.toLowerCase().includes(searchTerm) ||
          p.brand?.toLowerCase().includes(searchTerm)
        );
      }
    }

    return products.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.sellerId === sellerId);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.nextProductId++,
      ...productData,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error("Product not found");
    
    const updated: Product = {
      ...existing,
      ...productData,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async incrementProductViews(id: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.views = (product.views || 0) + 1;
      this.products.set(id, product);
    }
  }

  // Wishlist operations
  async getUserWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const userWishlists = Array.from(this.wishlists.values()).filter(w => w.userId === userId);
    return userWishlists.map(wishlist => {
      const product = this.products.get(wishlist.productId!);
      return { ...wishlist, product: product! };
    }).filter(w => w.product);
  }

  async addToWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const wishlist: Wishlist = {
      id: this.nextWishlistId++,
      ...wishlistData,
      createdAt: new Date(),
    };
    this.wishlists.set(wishlist.id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    const wishlist = Array.from(this.wishlists.values()).find(
      w => w.userId === userId && w.productId === productId
    );
    if (wishlist) {
      this.wishlists.delete(wishlist.id);
    }
  }

  // Message operations
  async getConversation(senderId: string, receiverId: string, productId?: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => 
        ((m.senderId === senderId && m.receiverId === receiverId) ||
         (m.senderId === receiverId && m.receiverId === senderId)) &&
        (!productId || m.productId === productId)
      )
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async sendMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...messageData,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
    }
  }

  // Commission operations
  async createCommission(commissionData: InsertCommission): Promise<Commission> {
    const commission: Commission = {
      id: this.nextCommissionId++,
      ...commissionData,
      createdAt: new Date(),
    };
    this.commissions.set(commission.id, commission);
    return commission;
  }

  async getSellerCommissions(sellerId: string): Promise<Commission[]> {
    return Array.from(this.commissions.values()).filter(c => c.sellerId === sellerId);
  }
}

export const storage = new MemStorage();
