import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simple-auth";
import { getSession } from "./replitAuth";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
import { createPaymentIntent, confirmPayment, createRefund } from "./stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { insertProductSchema, insertCategorySchema, insertMessageSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());
  
  // Simple auth setup for development
  await setupSimpleAuth(app);

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

      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
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
  app.get('/api/messages/:receiverId', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user?.claims?.sub;
      const receiverId = req.params.receiverId;
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      
      const messages = await storage.getConversation(senderId, receiverId, productId);
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

  const httpServer = createServer(app);
  return httpServer;
}
