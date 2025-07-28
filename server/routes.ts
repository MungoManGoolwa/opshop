import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
import { createPaymentIntent, confirmPayment, createRefund } from "./stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { buybackService } from "./buyback-service";
import { insertProductSchema, insertCategorySchema, insertMessageSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth (supports email, Google, Facebook, etc.)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: error.message || "Failed to create category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      // If specific product ID is requested
      if (req.query.id) {
        const product = await storage.getProduct(parseInt(req.query.id as string));
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        return res.json(product);
      }

      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        condition: req.query.condition as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        location: req.query.location as string,
        search: req.query.search as string,
        // Location-based radius search
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Increment view count
      await storage.incrementProductViews(parseInt(req.params.id));
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Increment view count
      await storage.incrementProductViews(id);
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['seller', 'business', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Seller access required" });
      }

      // Log the incoming data for debugging
      console.log("Creating product with data:", req.body);

      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      console.log("Request body was:", req.body);
      
      // Provide more detailed error information
      if (error.name === 'ZodError') {
        const fieldErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received
        }));
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: fieldErrors,
          details: "Please check all required fields are filled correctly"
        });
      }
      
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership or admin access
      if (product.sellerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership or admin access
      if (product.sellerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Seller routes
  app.get('/api/seller/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const products = await storage.getProductsBySeller(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ message: "Failed to fetch seller products" });
    }
  });

  app.get('/api/seller/commissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const commissions = await storage.getSellerCommissions(userId);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching seller commissions:", error);
      res.status(500).json({ message: "Failed to fetch seller commissions" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const wishlist = await storage.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { productId } = req.body;
      
      const wishlist = await storage.addToWishlist({
        userId,
        productId: parseInt(productId),
      });
      res.json(wishlist);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(userId, productId);
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Message routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:receiverId', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user?.claims?.sub;
      const receiverId = req.params.receiverId;
      
      const messages = await storage.getConversation(senderId, receiverId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user?.claims?.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: error.message || "Failed to send message" });
    }
  });

  app.put('/api/messages/mark-read/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { otherUserId } = req.params;
      
      await storage.markMessagesAsRead(otherUserId, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const users = await storage.getUsersForMessaging(userId);
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Payment routes - Stripe
  app.post('/api/stripe/payment-intent', isAuthenticated, createPaymentIntent);
  app.post('/api/stripe/confirm-payment', isAuthenticated, confirmPayment);
  app.post('/api/stripe/refund', isAuthenticated, createRefund);

  // Payment routes - PayPal
  app.get("/api/paypal/setup", loadPaypalDefault);
  app.post("/api/paypal/order", isAuthenticated, createPaypalOrder);
  app.post("/api/paypal/order/:orderID/capture", isAuthenticated, capturePaypalOrder);

  // Order management routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user?.claims?.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId,
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create commission record
      const product = await storage.getProduct(order.productId);
      if (product) {
        const settings = await storage.getPaymentSettings();
        const commissionRate = settings?.defaultCommissionRate || "10.00";
        const salePrice = parseFloat(order.totalAmount.toString());
        const commissionAmount = (salePrice * parseFloat(commissionRate.toString())) / 100;
        const sellerAmount = salePrice - commissionAmount;

        if (order.sellerId) {
          await storage.createCommission({
            orderId: order.id,
            productId: order.productId,
            sellerId: order.sellerId,
            salePrice: order.totalAmount,
            commissionRate,
            commissionAmount: commissionAmount.toString(),
            sellerAmount: sellerAmount.toString(),
            status: 'pending',
          });
        }
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/seller/orders', isAuthenticated, async (req: any, res) => {
    try {
      const sellerId = req.user?.claims?.sub;
      const orders = await storage.getSellerOrders(sellerId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ message: "Failed to fetch seller orders" });
    }
  });

  app.patch('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      
      // Check if user owns the order or is the seller
      const order = await storage.getOrder(orderId);
      if (!order || (order.buyerId !== userId && order.sellerId !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedOrder = await storage.updateOrder(orderId, req.body);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: error.message || "Failed to update order" });
    }
  });

  // Admin payment settings routes
  app.get('/api/admin/payment-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });

  app.post('/api/admin/payment-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.updatePaymentSettings(req.body, userId);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      res.status(400).json({ message: error.message || "Failed to update payment settings" });
    }
  });

  // Admin business settings routes
  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settingsData = { ...req.body, updatedBy: userId };
      const settings = await storage.updateBusinessSettings(settingsData);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating business settings:", error);
      res.status(400).json({ message: error.message || "Failed to update business settings" });
    }
  });

  // Public settings endpoint for contact page
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  // Shop upgrade routes
  app.post("/api/shop-upgrade/create-payment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.accountType === "shop") {
        return res.status(400).json({ message: "Already a shop account" });
      }

      // Create Stripe checkout session for shop upgrade
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.hostname}/shop-upgrade/success`,
        cancel_url: `${req.protocol}://${req.hostname}/shop-upgrade`,
        customer_email: user.email,
        metadata: {
          userId: userId,
          upgrade_type: 'shop'
        },
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: 'Shop Account Upgrade',
                description: 'Annual shop account with up to 1,000 listings and premium features',
              },
              unit_amount: 50000, // $500 AUD in cents
            },
            quantity: 1,
          },
        ],
      });

      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error("Shop upgrade error:", error);
      res.status(500).json({ message: "Failed to create upgrade payment" });
    }
  });

  app.post("/api/shop-upgrade/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const userId = session.metadata.userId;
        
        if (session.metadata.upgrade_type === 'shop') {
          // Upgrade user to shop account
          const upgradeDate = new Date();
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now
          
          await storage.upgradeToShop(userId, upgradeDate, expiryDate);
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user?.claims?.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId,
      });

      // Verify user can leave this review
      if (reviewData.orderId) {
        const canReview = await storage.canUserReview(reviewerId, reviewData.orderId);
        if (!canReview) {
          return res.status(403).json({ message: "Cannot review this order" });
        }
      }

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: error.message || "Failed to create review" });
    }
  });

  app.get('/api/reviews/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/reviews/stats/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const stats = await storage.getReviewStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching review stats:", error);
      res.status(500).json({ message: "Failed to fetch review stats" });
    }
  });

  app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  app.post('/api/reviews/:id/helpful', isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      await storage.markReviewHelpful(reviewId);
      res.json({ message: "Review marked as helpful" });
    } catch (error) {
      console.error("Error marking review helpful:", error);
      res.status(500).json({ message: "Failed to mark review helpful" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userData = req.body;
      const newUser = await storage.createAdminUser(userData);
      res.json(newUser);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await storage.getUser(adminUserId);
      
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      const userData = req.body;
      const updatedUser = await storage.updateUserProfile(targetUserId, userData);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const adminUser = await storage.getUser(adminUserId);
      
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      await storage.deleteUser(targetUserId);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(400).json({ message: error.message || "Failed to delete user" });
    }
  });

  // Admin products management
  app.get('/api/admin/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.put('/api/admin/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const productId = parseInt(req.params.id);
      const productData = req.body;
      const updatedProduct = await storage.updateProduct(productId, productData);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  // Admin orders management
  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Business settings management
  app.get('/api/admin/business-settings', async (req, res) => {
    try {
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settingsData = req.body;
      const updatedSettings = await storage.updateBusinessSettings({
        ...settingsData,
        updatedBy: userId
      });
      res.json(updatedSettings);
    } catch (error: any) {
      console.error("Error updating business settings:", error);
      res.status(400).json({ message: error.message || "Failed to update settings" });
    }
  });

  // Admin system statistics
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock system statistics - in real app, calculate from database
      const stats = {
        totalUsers: 50123,
        newUsersThisMonth: 2341,
        totalProducts: 12435,
        newProductsThisMonth: 1876,
        totalOrders: 8765,
        ordersThisMonth: 543,
        totalRevenue: 234567.89,
        revenueThisMonth: 12345.67,
        averageOrderValue: 67.43,
        conversionRate: 3.2,
        topCategories: [
          { name: "Fashion", count: 3421 },
          { name: "Electronics", count: 2134 },
          { name: "Home & Garden", count: 1876 }
        ],
        userGrowth: "+15%",
        productGrowth: "+23%",
        revenueGrowth: "+18%"
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin system settings
  app.get('/api/admin/system-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Mock system settings - in real app, fetch from database
      const settings = {
        siteName: "Opshop Online",
        siteDescription: "Australia's Sustainable Marketplace",
        maintenanceMode: false,
        registrationEnabled: true,
        commissionRate: 10,
        maxFileSize: 5,
        emailNotifications: true,
        smsNotifications: false,
        autoApprove: false
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put('/api/admin/system-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = req.body;
      // In real app, save to database
      console.log("System settings updated:", settings);
      
      res.json({ message: "System settings updated successfully", settings });
    } catch (error: any) {
      console.error("Error updating system settings:", error);
      res.status(400).json({ message: error.message || "Failed to update system settings" });
    }
  });

  // ===== BUYBACK SYSTEM ROUTES =====
  
  // Create a new buyback offer using AI evaluation
  app.post('/api/buyback/offer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { itemTitle, itemDescription, itemCondition, itemAge, itemBrand, itemCategory, images } = req.body;

      if (!itemTitle || !itemCondition) {
        return res.status(400).json({ message: "Item title and condition are required" });
      }

      const result = await buybackService.createBuybackOffer({
        userId,
        itemTitle,
        itemDescription,
        itemCondition,
        itemAge,
        itemBrand,
        itemCategory,
        images,
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error creating buyback offer:", error);
      res.status(500).json({ message: error.message || "Failed to create buyback offer" });
    }
  });

  // Accept a buyback offer
  app.post('/api/buyback/offer/:offerId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offerId = parseInt(req.params.offerId);

      const result = await buybackService.acceptBuybackOffer(offerId, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error accepting buyback offer:", error);
      res.status(500).json({ message: error.message || "Failed to accept buyback offer" });
    }
  });

  // Reject a buyback offer
  app.post('/api/buyback/offer/:offerId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offerId = parseInt(req.params.offerId);

      const result = await buybackService.rejectBuybackOffer(offerId, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error rejecting buyback offer:", error);
      res.status(500).json({ message: error.message || "Failed to reject buyback offer" });
    }
  });

  // Get user's buyback offers
  app.get('/api/buyback/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offers = await buybackService.getUserBuybackOffers(userId);
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching buyback offers:", error);
      res.status(500).json({ message: "Failed to fetch buyback offers" });
    }
  });

  // Get user's store credit balance
  app.get('/api/store-credit/balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const balance = await buybackService.getUserStoreCredit(userId);
      res.json({ balance });
    } catch (error: any) {
      console.error("Error fetching store credit balance:", error);
      res.status(500).json({ message: "Failed to fetch store credit balance" });
    }
  });

  // Get user's store credit transactions
  app.get('/api/store-credit/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await buybackService.getUserStoreCreditTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching store credit transactions:", error);
      res.status(500).json({ message: "Failed to fetch store credit transactions" });
    }
  });

  // ===== ADMIN BUYBACK ROUTES =====
  
  // Get all buyback offers (admin only)
  app.get('/api/admin/buyback/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const offers = await buybackService.getAllBuybackOffers(page, limit);
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching admin buyback offers:", error);
      res.status(500).json({ message: "Failed to fetch buyback offers" });
    }
  });

  // Get buyback analytics (admin only)
  app.get('/api/admin/buyback/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await buybackService.getBuybackAnalytics();
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching buyback analytics:", error);
      res.status(500).json({ message: "Failed to fetch buyback analytics" });
    }
  });

  // Admin: Approve buyback offer
  app.post('/api/admin/buyback/offer/:offerId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const offerId = parseInt(req.params.offerId);
      const { notes } = req.body;

      const result = await buybackService.approveBuybackOffer(offerId, userId, notes);
      res.json(result);
    } catch (error: any) {
      console.error("Error approving buyback offer:", error);
      res.status(500).json({ message: error.message || "Failed to approve buyback offer" });
    }
  });

  // Admin: Reject buyback offer
  app.post('/api/admin/buyback/offer/:offerId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const offerId = parseInt(req.params.offerId);
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const result = await buybackService.rejectBuybackOffer(offerId, userId, reason);
      res.json(result);
    } catch (error: any) {
      console.error("Error rejecting buyback offer:", error);
      res.status(500).json({ message: error.message || "Failed to reject buyback offer" });
    }
  });

  // Admin: Get all buyback offers for review
  app.get('/api/admin/buyback/offers/review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const status = req.query.status as string;
      const offers = await buybackService.getAllBuybackOffersForAdmin(status);
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching buyback offers for review:", error);
      res.status(500).json({ message: "Failed to fetch buyback offers" });
    }
  });

  // ===== ADMIN IMPERSONATION ROUTES =====
  
  // Start impersonating a user (admin only)
  app.post('/api/admin/impersonate', isAuthenticated, async (req: any, res) => {
    const adminUser = req.user?.claims?.sub ? await storage.getUser(req.user.claims.sub) : null;
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    try {
      const { userId } = req.body;
      const targetUser = await storage.getUser(userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Store original admin user info in session
      req.session.originalUserId = req.user.claims.sub;
      req.session.isImpersonating = true;
      
      // Update session to impersonate target user
      req.user.claims.sub = targetUser.id;
      req.user.claims.email = targetUser.email;
      req.user.claims.first_name = targetUser.firstName;
      req.user.claims.last_name = targetUser.lastName;
      req.user.claims.profile_image_url = targetUser.profileImageUrl;
      
      res.json({ 
        message: 'Impersonation started',
        targetUser: {
          id: targetUser.id,
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          role: targetUser.role
        }
      });
    } catch (error) {
      console.error('Error starting impersonation:', error);
      res.status(500).json({ message: 'Failed to start impersonation' });
    }
  });

  // Stop impersonation and return to admin user
  app.post('/api/admin/stop-impersonation', isAuthenticated, async (req: any, res) => {
    if (!req.session.isImpersonating || !req.session.originalUserId) {
      return res.status(400).json({ message: 'Not currently impersonating' });
    }

    try {
      const originalUser = await storage.getUser(req.session.originalUserId);
      
      if (!originalUser || originalUser.role !== 'admin') {
        return res.status(403).json({ message: 'Invalid impersonation session' });
      }

      // Restore original admin user
      req.user.claims.sub = originalUser.id;
      req.user.claims.email = originalUser.email;
      req.user.claims.first_name = originalUser.firstName;
      req.user.claims.last_name = originalUser.lastName;
      req.user.claims.profile_image_url = originalUser.profileImageUrl;
      
      // Clear impersonation flags
      delete req.session.originalUserId;
      delete req.session.isImpersonating;
      
      res.json({ 
        message: 'Impersonation stopped',
        adminUser: {
          id: originalUser.id,
          email: originalUser.email,
          firstName: originalUser.firstName,
          lastName: originalUser.lastName,
          role: originalUser.role
        }
      });
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      res.status(500).json({ message: 'Failed to stop impersonation' });
    }
  });

  // Check current impersonation status
  app.get('/api/admin/impersonation-status', isAuthenticated, async (req: any, res) => {
    const isImpersonating = req.session.isImpersonating || false;
    const originalUserId = req.session.originalUserId;
    
    let originalUser = null;
    if (isImpersonating && originalUserId) {
      originalUser = await storage.getUser(originalUserId);
    }
    
    res.json({
      isImpersonating,
      originalUser: originalUser ? {
        id: originalUser.id,
        email: originalUser.email,
        firstName: originalUser.firstName,
        lastName: originalUser.lastName,
        role: originalUser.role
      } : null
    });
  });

  // Message routes
  app.get('/api/messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getConversation(userId, otherUserId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { receiverId, content, productId } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ message: "Receiver and content are required" });
      }

      const message = await storage.sendMessage({
        senderId: userId,
        receiverId,
        content,
        productId: productId || null,
      });

      res.json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/mark-read/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { otherUserId } = req.params;
      
      await storage.markMessagesAsRead(otherUserId, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const users = await storage.getUsersForMessaging(userId);
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ===== WALLET API ENDPOINTS =====
  
  // Get user wallet metrics and overview
  app.get('/api/wallet/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get purchase metrics
      const purchases = await storage.getUserPurchases(userId);
      const totalPurchases = Array.isArray(purchases) ? purchases.length : 0;
      const totalSpent = Array.isArray(purchases) ? 
        purchases.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toFixed(2) : "0.00";

      // Get sales metrics
      const sales = await storage.getUserSales(userId);
      const totalSales = Array.isArray(sales) ? sales.length : 0;
      const totalEarned = Array.isArray(sales) ? 
        sales.reduce((sum, s) => sum + parseFloat(s.sellerAmount || "0"), 0).toFixed(2) : "0.00";
      const totalCommissions = Array.isArray(sales) ? 
        sales.reduce((sum, s) => sum + parseFloat(s.commissionAmount || "0"), 0).toFixed(2) : "0.00";

      // Get buyback metrics
      const buybackOffers = await buybackService.getUserBuybackOffers(userId);
      const activeBuybackOffers = Array.isArray(buybackOffers) ? 
        buybackOffers.filter(o => o.status === 'pending').length : 0;

      // Get listing count
      const userProducts = await storage.getUserProducts(userId);
      const totalListings = Array.isArray(userProducts) ? userProducts.length : 0;

      const metrics = {
        totalPurchases,
        totalSpent,
        totalSales,
        totalEarned,
        totalCommissions,
        activeBuybackOffers,
        storeCreditBalance: user.storeCredit || "0.00",
        memberSince: user.createdAt,
        totalListings,
        accountType: user.accountType || "seller"
      };

      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching wallet metrics:", error);
      res.status(500).json({ message: "Failed to fetch wallet metrics" });
    }
  });

  // Get user's store credit transactions
  app.get('/api/wallet/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactions = await buybackService.getUserStoreCreditTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Get user's purchase history
  app.get('/api/wallet/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error: any) {
      console.error("Error fetching purchase history:", error);
      res.status(500).json({ message: "Failed to fetch purchase history" });
    }
  });

  // Get user's sales history
  app.get('/api/wallet/sales', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sales = await storage.getUserSales(userId);
      res.json(sales);
    } catch (error: any) {
      console.error("Error fetching sales history:", error);
      res.status(500).json({ message: "Failed to fetch sales history" });
    }
  });

  // Get user's buyback offers for wallet
  app.get('/api/wallet/buyback-offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const offers = await buybackService.getUserBuybackOffers(userId);
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching buyback offers:", error);
      res.status(500).json({ message: "Failed to fetch buyback offers" });
    }
  });

  // Listing settings API routes
  app.get('/api/admin/listing-settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getListingSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching listing settings:', error);
      res.status(500).json({ message: 'Failed to fetch listing settings' });
    }
  });

  app.post('/api/admin/listing-settings', isAuthenticated, async (req: any, res) => {
    try {
      const updatedSettings = await storage.updateListingSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating listing settings:', error);
      res.status(500).json({ message: 'Failed to update listing settings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
