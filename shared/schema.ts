import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("customer"), // admin, moderator, customer, seller, business
  accountType: varchar("account_type", { length: 20 }).default("seller").notNull(), // "seller" or "shop"
  shopUpgradeDate: timestamp("shop_upgrade_date"),
  shopExpiryDate: timestamp("shop_expiry_date"),
  maxListings: integer("max_listings").default(10).notNull(),
  location: varchar("location"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  postcode: varchar("postcode"),
  country: varchar("country").default("Australia"),
  bio: text("bio"),
  businessName: varchar("business_name"),
  abn: varchar("abn"),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  condition: varchar("condition").notNull(), // new, excellent, good, fair
  status: varchar("status").notNull().default("available"), // available, reserved, sold
  categoryId: integer("category_id").references(() => categories.id),
  sellerId: varchar("seller_id").references(() => users.id),
  brand: varchar("brand"),
  size: varchar("size"),
  color: varchar("color"),
  material: varchar("material"),
  images: text("images").array(),
  location: varchar("location"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id),
  receiverId: varchar("receiver_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().unique(),
  buyerId: varchar("buyer_id").references(() => users.id),
  sellerId: varchar("seller_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  paymentGateway: varchar("payment_gateway").notNull(), // stripe, paypal
  paymentIntentId: varchar("payment_intent_id"),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, completed, failed, refunded
  orderStatus: varchar("order_status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: jsonb("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  sellerId: varchar("seller_id").references(() => users.id),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  sellerAmount: decimal("seller_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, paid
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  stripeEnabled: boolean("stripe_enabled").default(true),
  paypalEnabled: boolean("paypal_enabled").default(true),
  defaultCommissionRate: decimal("default_commission_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  processingFeeRate: decimal("processing_fee_rate", { precision: 5, scale: 2 }).notNull().default("2.90"),
  currency: varchar("currency").notNull().default("AUD"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  reviewerId: varchar("reviewer_id").references(() => users.id).notNull(),
  revieweeId: varchar("reviewee_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  reviewType: varchar("review_type").notNull(), // "seller", "buyer", "product"
  isVerified: boolean("is_verified").default(false), // verified purchase
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
  isVerified: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

export type PaymentSettings = typeof paymentSettings.$inferSelect;
