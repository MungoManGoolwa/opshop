CREATE TABLE "business_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar DEFAULT 'Opshop Online' NOT NULL,
	"abn" varchar DEFAULT '12 345 678 901' NOT NULL,
	"address" text DEFAULT '123 Sustainable Street, Goolwa, SA 5214, Australia' NOT NULL,
	"phone" varchar DEFAULT '1800 123 456' NOT NULL,
	"email" varchar DEFAULT 'info@opshop.online' NOT NULL,
	"support_email" varchar DEFAULT 'support@opshop.online' NOT NULL,
	"website" varchar DEFAULT 'https://opshop.online',
	"description" text DEFAULT 'Australia''s most sustainable marketplace for pre-loved goods. Based in Goolwa, South Australia.' NOT NULL,
	"business_hours" text DEFAULT 'Monday - Friday: 9:00 AM - 6:00 PM ACDT
Saturday: 10:00 AM - 4:00 PM ACDT
Sunday: Closed' NOT NULL,
	"emergency_contact" varchar DEFAULT '000',
	"social_media" jsonb DEFAULT '{}'::jsonb,
	"live_chat_enabled" boolean DEFAULT false,
	"live_chat_disabled_message" text DEFAULT 'Live chat is currently unavailable. Please email us at brendan@opshop.online for support.',
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "buyback_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"item_title" varchar NOT NULL,
	"item_description" text,
	"item_condition" varchar NOT NULL,
	"item_age" varchar,
	"item_brand" varchar,
	"item_category" varchar,
	"images" text[],
	"ai_evaluated_retail_price" numeric(10, 2) NOT NULL,
	"buyback_offer_price" numeric(10, 2) NOT NULL,
	"ai_evaluation_data" jsonb,
	"status" varchar DEFAULT 'pending_admin_review' NOT NULL,
	"admin_notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"admin_decision" varchar,
	"revised_offer_price" numeric(10, 2),
	"admin_review_expires_at" timestamp,
	"sendle_tracking_number" varchar,
	"sendle_label_url" varchar,
	"shipping_status" varchar DEFAULT 'not_shipped',
	"email_sent" boolean DEFAULT false,
	"email_sent_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"parent_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"product_id" integer,
	"seller_id" varchar,
	"sale_price" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"seller_amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"payout_id" integer,
	"processing_fee" numeric(10, 2) DEFAULT '0.00',
	"net_seller_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listing_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"default_customer_max_listings" integer DEFAULT 10 NOT NULL,
	"default_business_max_listings" integer DEFAULT 100 NOT NULL,
	"default_seller_max_listings" integer DEFAULT 25 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar,
	"receiver_id" varchar,
	"product_id" integer,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"buyer_id" varchar,
	"seller_id" varchar,
	"product_id" integer,
	"total_amount" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0.00',
	"payment_gateway" varchar NOT NULL,
	"payment_intent_id" varchar,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"order_status" varchar DEFAULT 'pending' NOT NULL,
	"shipping_address" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_enabled" boolean DEFAULT true,
	"paypal_enabled" boolean DEFAULT true,
	"default_commission_rate" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"processing_fee_rate" numeric(5, 2) DEFAULT '2.90' NOT NULL,
	"currency" varchar DEFAULT 'AUD' NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "payout_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"auto_payout_enabled" boolean DEFAULT false,
	"payout_frequency" varchar DEFAULT 'weekly',
	"minimum_payout_amount" numeric(10, 2) DEFAULT '50.00',
	"payout_day" integer DEFAULT 1,
	"holding_period_days" integer DEFAULT 7,
	"default_payment_method" varchar DEFAULT 'stripe',
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" varchar NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"total_commissions" integer NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_reference" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp,
	"processed_date" timestamp,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"condition" varchar NOT NULL,
	"status" varchar DEFAULT 'available' NOT NULL,
	"is_buyback_item" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"category_id" integer,
	"seller_id" varchar,
	"brand" varchar,
	"size" varchar,
	"color" varchar,
	"material" varchar,
	"images" text[],
	"location" varchar,
	"suburb" varchar,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"shipping_cost" numeric(10, 2),
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"reviewer_id" varchar NOT NULL,
	"reviewee_id" varchar NOT NULL,
	"product_id" integer,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text,
	"review_type" varchar NOT NULL,
	"is_verified" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"reference_id" varchar,
	"reference_type" varchar,
	"balance_before" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'customer' NOT NULL,
	"account_type" varchar(20) DEFAULT 'seller' NOT NULL,
	"shop_upgrade_date" timestamp,
	"shop_expiry_date" timestamp,
	"max_listings" integer DEFAULT 10 NOT NULL,
	"use_default_max_listings" boolean DEFAULT true,
	"location" varchar,
	"suburb" varchar,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"phone" varchar,
	"address" text,
	"city" varchar,
	"state" varchar,
	"postcode" varchar,
	"country" varchar DEFAULT 'Australia',
	"bio" text,
	"business_name" varchar,
	"abn" varchar,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"store_credit" numeric(10, 2) DEFAULT '0.00',
	"commission_rate" numeric(5, 2) DEFAULT '10.00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"product_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_settings" ADD CONSTRAINT "listing_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_settings" ADD CONSTRAINT "payment_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_settings" ADD CONSTRAINT "payout_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");