import { sql, relations } from 'drizzle-orm';
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
  accountType: varchar("account_type", { length: 20 }).default("buyer").notNull(), // "buyer", "admin", "moderator", "seller", "shop"
  shopUpgradeDate: timestamp("shop_upgrade_date"),
  shopExpiryDate: timestamp("shop_expiry_date"),
  maxListings: integer("max_listings").default(0).notNull(), // 0 for buyers, 10 for sellers, 100 for shops
  useDefaultMaxListings: boolean("use_default_max_listings").default(true),
  location: varchar("location"),
  suburb: varchar("suburb"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
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
  verificationStatus: varchar("verification_status").default("unverified"), // unverified, pending, verified, rejected
  verificationSubmittedAt: timestamp("verification_submitted_at"),
  verificationCompletedAt: timestamp("verification_completed_at"),
  storeCredit: decimal("store_credit", { precision: 10, scale: 2 }).default("0.00"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // Individual commission rate for this user
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

// Buyback settings per category - admin configurable percentage reduction from AI price
export const categoryBuybackSettings = pgTable("category_buyback_settings", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  buybackPercentage: decimal("buyback_percentage", { precision: 5, scale: 2 }).notNull().default("40.00"), // Default 40% of AI price (60% reduction)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  condition: varchar("condition").notNull(), // new, excellent, good, fair
  status: varchar("status").notNull().default("available"), // available, reserved, sold
  isBuybackItem: boolean("is_buyback_item").default(false), // Items purchased by system via buyback
  isVerified: boolean("is_verified").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  sellerId: varchar("seller_id").references(() => users.id),
  brand: varchar("brand"),
  size: varchar("size"),
  color: varchar("color"),
  material: varchar("material"),
  
  // Additional category-specific attributes
  // Clothing & Fashion specific
  clothingSize: varchar("clothing_size"), // XS, S, M, L, XL, XXL
  clothingType: varchar("clothing_type"), // shirt, pants, dress, etc
  clothingGender: varchar("clothing_gender"), // men, women, unisex, kids
  
  // Electronics specific
  model: varchar("model"),
  storageCapacity: varchar("storage_capacity"),
  screenSize: varchar("screen_size"),
  batteryLife: varchar("battery_life"),
  connectivity: varchar("connectivity"), // wifi, bluetooth, cellular
  
  // Vehicles specific
  make: varchar("make"), // Toyota, Ford, etc
  vehicleModel: varchar("vehicle_model"),
  year: integer("year"),
  kilometers: integer("kilometers"),
  fuelType: varchar("fuel_type"), // petrol, diesel, electric, hybrid
  transmission: varchar("transmission"), // manual, automatic
  bodyType: varchar("body_type"), // sedan, hatchback, SUV, etc
  engineSize: varchar("engine_size"),
  drivetrain: varchar("drivetrain"), // FWD, RWD, AWD
  registrationState: varchar("registration_state"),
  
  // Home & Garden specific
  roomType: varchar("room_type"), // bedroom, living room, kitchen, etc
  furnitureType: varchar("furniture_type"), // chair, table, bed, etc
  dimensions: varchar("dimensions"), // LxWxH
  assemblyRequired: boolean("assembly_required"),
  
  // Sports & Recreation specific
  sportType: varchar("sport_type"), // football, tennis, cycling, etc
  activityLevel: varchar("activity_level"), // beginner, intermediate, advanced
  equipmentType: varchar("equipment_type"), // racket, ball, protective gear, etc
  
  // Books & Media specific
  author: varchar("author"),
  isbn: varchar("isbn"),
  publisher: varchar("publisher"),
  publicationYear: integer("publication_year"),
  language: varchar("language"),
  format: varchar("format"), // hardcover, paperback, ebook, audiobook
  genre: varchar("genre"),
  
  // Baby & Kids specific
  ageRange: varchar("age_range"), // 0-6 months, 6-12 months, 1-2 years, etc
  safetyStandard: varchar("safety_standard"),
  educationalValue: varchar("educational_value"),
  
  // Beauty & Health specific
  skinType: varchar("skin_type"), // normal, dry, oily, combination, sensitive
  hairType: varchar("hair_type"), // straight, wavy, curly, coily
  ingredients: text("ingredients").array().default([]),
  expiryDate: timestamp("expiry_date"),
  images: text("images").array(),
  location: varchar("location"),
  suburb: varchar("suburb"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
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

// Cart items table for persistent cart functionality
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved for later items table 
export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  savedFromCart: boolean("saved_from_cart").default(false), // Track if saved from cart vs added directly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest cart sessions for anonymous users
export const guestCartSessions = pgTable("guest_cart_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull().unique(), // Generated UUID for guest session
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Guest carts expire after 7 days
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
  buyerId: varchar("buyer_id").references(() => users.id), // Nullable for guest checkout
  sellerId: varchar("seller_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  paymentGateway: varchar("payment_gateway").notNull(), // stripe, paypal
  paymentIntentId: varchar("payment_intent_id"),
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, completed, failed, refunded
  orderStatus: varchar("order_status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: jsonb("shipping_address"),
  
  // Guest customer information (when buyerId is null)
  isGuestOrder: boolean("is_guest_order").default(false),
  guestEmail: varchar("guest_email"),
  guestName: varchar("guest_name"),
  guestPhone: varchar("guest_phone"),
  
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
  status: varchar("status").notNull().default("pending"), // pending, processing, paid, failed
  payoutId: integer("payout_id").references(() => payouts.id),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0.00"),
  netSellerAmount: decimal("net_seller_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout batches for sellers
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  totalCommissions: integer("total_commissions").notNull(), // Number of commissions included
  paymentMethod: varchar("payment_method").notNull(), // stripe, paypal, bank_transfer
  paymentReference: varchar("payment_reference"), // External payment ID
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  scheduledDate: timestamp("scheduled_date"),
  processedDate: timestamp("processed_date"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"), // Additional payout data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout schedules and automation settings
export const payoutSettings = pgTable("payout_settings", {
  id: serial("id").primaryKey(),
  autoPayoutEnabled: boolean("auto_payout_enabled").default(false),
  payoutFrequency: varchar("payout_frequency").default("weekly"), // daily, weekly, monthly
  minimumPayoutAmount: decimal("minimum_payout_amount", { precision: 10, scale: 2 }).default("50.00"),
  payoutDay: integer("payout_day").default(1), // Day of week (1-7) or month (1-31)
  holdingPeriodDays: integer("holding_period_days").default(7), // Days to hold before payout
  defaultPaymentMethod: varchar("default_payment_method").default("stripe"), // stripe, paypal, bank_transfer
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
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

export const listingSettings = pgTable("listing_settings", {
  id: serial("id").primaryKey(),
  defaultCustomerMaxListings: integer("default_customer_max_listings").notNull().default(10),
  defaultBusinessMaxListings: integer("default_business_max_listings").notNull().default(100),
  defaultSellerMaxListings: integer("default_seller_max_listings").notNull().default(25),
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

// Abandoned cart tracking for recovery campaigns
export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  cartSnapshot: jsonb("cart_snapshot").notNull(), // Store cart items at abandonment time
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  itemCount: integer("item_count").notNull(),
  abandonedAt: timestamp("abandoned_at").defaultNow().notNull(),
  firstReminderSent: timestamp("first_reminder_sent"),
  secondReminderSent: timestamp("second_reminder_sent"),
  finalReminderSent: timestamp("final_reminder_sent"),
  recoveredAt: timestamp("recovered_at"), // When user completed purchase
  status: varchar("status", { length: 50 }).notNull().default("abandoned"), // abandoned, recovered, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email reminder queue for automated cart recovery
export const emailReminderQueue = pgTable("email_reminder_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  abandonedCartId: integer("abandoned_cart_id").references(() => abandonedCarts.id).notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // first, second, final
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, sent, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Seller achievements and gamification system
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // sales, listings, reviews, community, special
  icon: varchar("icon", { length: 100 }).notNull(),
  badgeColor: varchar("badge_color", { length: 20 }).default("blue"),
  requirement: jsonb("requirement").notNull(), // { type: "sales_count", value: 10 }
  reward: jsonb("reward"), // { type: "listing_boost", value: 5 } or { type: "commission_discount", value: 0.5 }
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: jsonb("progress"), // Current progress towards achievement
  isDisplayed: boolean("is_displayed").default(true), // User can choose to display or hide
  createdAt: timestamp("created_at").defaultNow(),
});

export const sellerStats = pgTable("seller_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalSales: integer("total_sales").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalListings: integer("total_listings").default(0),
  activeListing: integer("active_listings").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  responseRate: decimal("response_rate", { precision: 3, scale: 2 }).default("0"), // Message response rate
  responseTime: integer("response_time").default(0), // Average response time in hours
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  level: integer("level").default(1),
  experiencePoints: integer("experience_points").default(0),
  consecutiveSaleDays: integer("consecutive_sale_days").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sellerBadges = pgTable("seller_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: varchar("badge_type", { length: 50 }).notNull(), // verified, top_seller, eco_warrior, fast_responder
  badgeLevel: integer("badge_level").default(1), // Bronze(1), Silver(2), Gold(3), Platinum(4)
  earnedAt: timestamp("earned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Some badges may expire
  isActive: boolean("is_active").default(true),
  criteria: jsonb("criteria"), // Criteria used to earn this badge
});

// Seller verification documents and ID tracking
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: varchar("document_type").notNull(), // passport, drivers_licence, birth_certificate, medicare_card, etc.
  documentNumber: varchar("document_number"),
  documentPoints: integer("document_points").notNull(), // Points value for this document
  frontImageUrl: varchar("front_image_url"),
  backImageUrl: varchar("back_image_url"),
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, rejected
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"), // Admin ID who verified
  rejectionReason: text("rejection_reason"),
  expiryDate: timestamp("expiry_date"), // For documents that expire
  documentData: jsonb("document_data"), // Extracted data from document
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track verification submissions and progress
export const verificationSubmissions = pgTable("verification_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0),
  hasPhotoId: boolean("has_photo_id").default(false), // Must have passport or drivers licence
  submissionStatus: varchar("submission_status").default("draft"), // draft, submitted, under_review, approved, rejected
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"), // Admin ID who reviewed
  reviewNotes: text("review_notes"),
  approvalDate: timestamp("approval_date"),
  rejectionReason: text("rejection_reason"),
  autoVerified: boolean("auto_verified").default(false), // If verified automatically
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification audit trail
export const verificationAuditLog = pgTable("verification_audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  submissionId: integer("submission_id").references(() => verificationSubmissions.id),
  documentId: integer("document_id").references(() => verificationDocuments.id),
  action: varchar("action").notNull(), // document_uploaded, document_verified, submission_approved, etc.
  adminId: varchar("admin_id").references(() => users.id),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for achievements system
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const sellerStatsRelations = relations(sellerStats, ({ one }) => ({
  user: one(users, {
    fields: [sellerStats.userId],
    references: [users.id],
  }),
}));

export const sellerBadgesRelations = relations(sellerBadges, ({ one }) => ({
  user: one(users, {
    fields: [sellerBadges.userId],
    references: [users.id],
  }),
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  user: one(users, {
    fields: [verificationDocuments.userId],
    references: [users.id],
  }),
}));

export const verificationSubmissionsRelations = relations(verificationSubmissions, ({ one, many }) => ({
  user: one(users, {
    fields: [verificationSubmissions.userId],
    references: [users.id],
  }),
  documents: many(verificationDocuments),
  auditLogs: many(verificationAuditLog),
}));

export const verificationAuditLogRelations = relations(verificationAuditLog, ({ one }) => ({
  user: one(users, {
    fields: [verificationAuditLog.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [verificationAuditLog.adminId],
    references: [users.id],
  }),
  submission: one(verificationSubmissions, {
    fields: [verificationAuditLog.submissionId],
    references: [verificationSubmissions.id],
  }),
  document: one(verificationDocuments, {
    fields: [verificationAuditLog.documentId],
    references: [verificationDocuments.id],
  }),
}));

// Types for achievements
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type SellerStats = typeof sellerStats.$inferSelect;
export type InsertSellerStats = typeof sellerStats.$inferInsert;
export type SellerBadge = typeof sellerBadges.$inferSelect;
export type InsertSellerBadge = typeof sellerBadges.$inferInsert;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = typeof verificationDocuments.$inferInsert;
export type VerificationSubmission = typeof verificationSubmissions.$inferSelect;
export type InsertVerificationSubmission = typeof verificationSubmissions.$inferInsert;
export type VerificationAuditLog = typeof verificationAuditLog.$inferSelect;
export type InsertVerificationAuditLog = typeof verificationAuditLog.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type CategoryBuybackSettings = typeof categoryBuybackSettings.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type SavedItem = typeof savedItems.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type ListingSettings = typeof listingSettings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type PayoutSettings = typeof payoutSettings.$inferSelect;
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type EmailReminderQueue = typeof emailReminderQueue.$inferSelect;

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const insertCategoryBuybackSettingsSchema = createInsertSchema(categoryBuybackSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCategoryBuybackSettings = z.infer<typeof insertCategoryBuybackSettingsSchema>;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;

export const insertAbandonedCartSchema = createInsertSchema(abandonedCarts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAbandonedCart = z.infer<typeof insertAbandonedCartSchema>;

export const insertEmailReminderSchema = createInsertSchema(emailReminderQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailReminder = z.infer<typeof insertEmailReminderSchema>;

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  verifiedBy: true,
});

export const insertVerificationSubmissionSchema = createInsertSchema(verificationSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  approvalDate: true,
});

// Buyback offers from AI evaluation
export const buybackOffers = pgTable("buyback_offers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  itemTitle: varchar("item_title").notNull(),
  itemDescription: text("item_description"),
  itemCondition: varchar("item_condition").notNull(),
  itemAge: varchar("item_age"),
  itemBrand: varchar("item_brand"),
  itemCategory: varchar("item_category"),
  images: text("images").array(), // Array of image URLs
  aiEvaluatedRetailPrice: decimal("ai_evaluated_retail_price", { precision: 10, scale: 2 }).notNull(),
  buybackOfferPrice: decimal("buyback_offer_price", { precision: 10, scale: 2 }).notNull(), // 50% of retail
  aiEvaluationData: jsonb("ai_evaluation_data"), // Full AI response for audit
  status: varchar("status").notNull().default("pending_admin_review"), // pending_admin_review, admin_approved, admin_rejected, admin_revised, pending_seller, accepted, rejected, expired
  adminNotes: text("admin_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  adminDecision: varchar("admin_decision"), // approved, rejected, revised
  revisedOfferPrice: decimal("revised_offer_price", { precision: 10, scale: 2 }),
  adminReviewExpiresAt: timestamp("admin_review_expires_at"), // Admin has 24 hours to review
  sendleTrackingNumber: varchar("sendle_tracking_number"),
  sendleLabelUrl: varchar("sendle_label_url"),
  shippingStatus: varchar("shipping_status").default("not_shipped"), // not_shipped, label_created, in_transit, delivered
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  expiresAt: timestamp("expires_at").notNull(), // Offers expire after 24 hours
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Store credit transactions
export const storeCreditTransactions = pgTable("store_credit_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "earned", "spent", "refund", "buyback"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceId: varchar("reference_id"), // Links to buyback_offer_id, order_id, etc.
  referenceType: varchar("reference_type"), // "buyback_offer", "order", "refund"
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export new types
export type BuybackOffer = typeof buybackOffers.$inferSelect;
export type StoreCreditTransaction = typeof storeCreditTransactions.$inferSelect;

export const insertBuybackOfferSchema = createInsertSchema(buybackOffers).omit({
  id: true,
  createdAt: true,
});
export type InsertBuybackOffer = z.infer<typeof insertBuybackOfferSchema>;

export const insertStoreCreditTransactionSchema = createInsertSchema(storeCreditTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertStoreCreditTransaction = z.infer<typeof insertStoreCreditTransactionSchema>;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const insertGuestCartSessionSchema = createInsertSchema(guestCartSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGuestCartSession = z.infer<typeof insertGuestCartSessionSchema>;

// Business settings table for admin configuration
export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name").notNull().default("Opshop Online"),
  abn: varchar("abn").notNull().default("12 345 678 901"),
  address: text("address").notNull().default("123 Sustainable Street, Goolwa, SA 5214, Australia"),
  phone: varchar("phone").notNull().default("1800 123 456"),
  email: varchar("email").notNull().default("info@opshop.online"),
  supportEmail: varchar("support_email").notNull().default("support@opshop.online"),
  website: varchar("website").default("https://opshop.online"),
  description: text("description").notNull().default("Australia's most sustainable marketplace for pre-loved goods. Based in Goolwa, South Australia."),
  businessHours: text("business_hours").notNull().default("Monday - Friday: 9:00 AM - 6:00 PM ACDT\nSaturday: 10:00 AM - 4:00 PM ACDT\nSunday: Closed"),
  emergencyContact: varchar("emergency_contact").default("000"),
  socialMedia: jsonb("social_media").default({}),
  liveChatEnabled: boolean("live_chat_enabled").default(false),
  liveChatDisabledMessage: text("live_chat_disabled_message").default("Live chat is currently unavailable. Please email us at brendan@opshop.online for support."),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export type BusinessSettings = typeof businessSettings.$inferSelect;

export const insertBusinessSettingsSchema = createInsertSchema(businessSettings).omit({
  id: true,
  updatedAt: true,
});
export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;

// Relations for categories and buyback settings
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  buybackSettings: one(categoryBuybackSettings, {
    fields: [categories.id],
    references: [categoryBuybackSettings.categoryId],
  }),
  children: many(categories, { relationName: "CategoryHierarchy" }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "CategoryHierarchy",
  }),
}));

export const categoryBuybackSettingsRelations = relations(categoryBuybackSettings, ({ one }) => ({
  category: one(categories, {
    fields: [categoryBuybackSettings.categoryId],
    references: [categories.id],
  }),
}));
