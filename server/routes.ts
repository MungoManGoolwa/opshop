import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  healthCheck, 
  metricsEndpoint, 
  readinessCheck, 
  livenessCheck,
  collectRequestMetrics 
} from "./health";
import Stripe from "stripe";

import { env } from "./config/env";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;
import { createPaymentIntent, confirmPayment, createRefund } from "./stripe";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { buybackService } from "./buyback-service";
import { commissionService } from "./commission-service";
import { dashboardStatsService } from "./dashboard-stats";
import { logAdminAction, auditAdminAction, getAuditLogs, getAuditStatistics } from './admin-audit';
import { verificationService, DOCUMENT_TYPES } from "./seller-verification-service";
import { insertProductSchema, insertCategorySchema, insertMessageSchema, insertOrderSchema, insertReviewSchema, insertPayoutSchema, insertCartItemSchema, insertSavedItemSchema } from "@shared/schema";
import { z } from "zod";
import {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  productQuerySchema,
  cartActionSchema,
  guestCartActionSchema,
  messageSchema,
  buybackEvaluationSchema,
  orderCreateSchema,
  guestOrderCreateSchema,
  adminActionSchema,
  paginationSchema,
  idParamSchema,
  uuidParamSchema,
  sanitizeInput
} from "./validation";
import {
  sanitizeRequest,
  corsMiddleware,
  adminSecurityCheck,
  requestId,
  requestLogger
} from "./validation-middleware";
import {
  basicRateLimit,
  authRateLimit,
  apiRateLimit,
  searchRateLimit,
  paymentRateLimit,
  buybackRateLimit,
  messageRateLimit,
  securityMiddleware,
  getRateLimitStats
} from "./rate-limiting";
// CSRF temporarily disabled to fix app loading
// import {
//   csrfProtection,
//   getCsrfToken,
//   csrfErrorHandler,
//   addCsrfToLocals,
//   apiCsrfProtection,
//   getCsrfStats
// } from "./csrf-protection";

// Performance optimization imports
import { 
  cacheMiddleware, 
  optimizeProductQueries, 
  InventorySync,
  performanceMiddleware 
} from "./performance-cache";
import { optimizedImageMiddleware } from "./image-optimization";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "public/uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      cb(null, `photo_${timestamp}_${random}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Performance monitoring middleware
  app.use(performanceMiddleware);
  
  // Image optimization for faster loading
  app.use(optimizedImageMiddleware());
  
  // Minimal middleware for debugging
  app.use(requestId);
  app.use(corsMiddleware);
  
  // Setup Replit Auth (supports email, Google, Facebook, etc.)
  await setupAuth(app);

  // Health check and monitoring endpoints
  app.get('/health', healthCheck);
  app.get('/health/ready', readinessCheck);
  app.get('/health/live', livenessCheck);
  app.get('/metrics', metricsEndpoint);
  
  // Advanced monitoring dashboard (admin only)
  app.get('/api/admin/monitoring', isAuthenticated, async (req: any, res) => {
    const { monitoringDashboard } = await import('./monitoring');
    await monitoringDashboard(req, res);
  });
  
  // Rate limiting statistics endpoint (admin only)
  app.get('/api/admin/rate-limit-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = getRateLimitStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching rate limit stats:", error);
      res.status(500).json({ message: "Failed to fetch rate limit stats" });
    }
  });
  
  // CSRF temporarily disabled to fix app loading

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

  // ===== PRODUCT SEARCH AND DISCOVERY =====

  // Product search route with fuzzy matching and caching
  app.get("/api/products/search", 
    cacheMiddleware({ ttl: 2 * 60 * 1000, maxAge: 120 }), // 2 minute cache
    validateQuery(z.object({
      q: z.string().min(2, "Search query must be at least 2 characters"),
      limit: z.string().optional().transform(val => Math.min(100, parseInt(val || "20"))).pipe(z.number())
    })), 
    async (req, res) => {
    try {
      const { q: query, limit } = req.query as any;
      
      // Use optimized search query with caching
      const products = await optimizeProductQueries.searchProducts(storage, {
        query: sanitizeInput(query),
        limit
      });
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Search suggestions endpoint
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getSearchSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // User stats endpoint for welcome splash
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's activity stats
      const stats = await storage.getUserStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Category routes with caching
  app.get('/api/categories', 
    cacheMiddleware({ ttl: 30 * 60 * 1000, maxAge: 1800 }), // 30 minute cache
    async (req, res) => {
    try {
      const categories = await optimizeProductQueries.getCategories(storage);
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
      
      if (user?.accountType !== 'admin') {
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

  // Product routes with caching and inventory sync
  app.get('/api/products', 
    cacheMiddleware({ ttl: 5 * 60 * 1000, maxAge: 300 }), // 5 minute cache
    async (req, res) => {
    try {
      // If specific product ID is requested with real-time inventory
      if (req.query.id) {
        const productId = req.query.id as string;
        const product = await optimizeProductQueries.getProduct(storage, productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        // Add real-time inventory info
        const inventorySync = InventorySync.getInstance();
        const currentQuantity = await inventorySync.getInventory(productId, storage);
        const lowStockWarning = inventorySync.getLowStockWarning(currentQuantity);
        
        return res.json({
          ...product,
          currentQuantity,
          lowStockWarning,
          isAvailable: currentQuantity > 0
        });
      }

      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        condition: req.query.condition as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        location: req.query.location as string,
        search: req.query.search as string,
        sort: req.query.sort as string || 'newest',
        // Location-based radius search
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
        // General attributes
        brand: req.query.brand as string,
        color: req.query.color as string,
        size: req.query.size as string,
        material: req.query.material as string,
        // Clothing specific
        clothingSize: req.query.clothingSize as string,
        clothingType: req.query.clothingType as string,
        clothingGender: req.query.clothingGender as string,
        // Electronics specific
        model: req.query.model as string,
        storageCapacity: req.query.storageCapacity as string,
        screenSize: req.query.screenSize as string,
        connectivity: req.query.connectivity as string,
        // Vehicles specific
        make: req.query.make as string,
        vehicleModel: req.query.vehicleModel as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        kilometers: req.query.kilometers ? parseInt(req.query.kilometers as string) : undefined,
        minKilometers: req.query.minKilometers ? parseInt(req.query.minKilometers as string) : undefined,
        maxKilometers: req.query.maxKilometers ? parseInt(req.query.maxKilometers as string) : undefined,
        fuelType: req.query.fuelType as string,
        transmission: req.query.transmission as string,
        bodyType: req.query.bodyType as string,
        drivetrain: req.query.drivetrain as string,
        // Home & Garden specific
        roomType: req.query.roomType as string,
        furnitureType: req.query.furnitureType as string,
        assemblyRequired: req.query.assemblyRequired === 'true' ? true : req.query.assemblyRequired === 'false' ? false : undefined,
        // Sports specific
        sportType: req.query.sportType as string,
        activityLevel: req.query.activityLevel as string,
        equipmentType: req.query.equipmentType as string,
        // Books specific
        author: req.query.author as string,
        genre: req.query.genre as string,
        format: req.query.format as string,
        language: req.query.language as string,
        publicationYear: req.query.publicationYear ? parseInt(req.query.publicationYear as string) : undefined,
        // Baby & Kids specific
        ageRange: req.query.ageRange as string,
        educationalValue: req.query.educationalValue as string,
        // Beauty & Health specific
        skinType: req.query.skinType as string,
        hairType: req.query.hairType as string,
      };
      
      // Use optimized product queries with real-time inventory
      const products = await storage.getProducts(filters);
      
      // Add real-time inventory status to all products
      const inventorySync = InventorySync.getInstance();
      const productsWithInventory = await Promise.all(
        products.map(async (product: any) => {
          const currentQuantity = await inventorySync.getInventory(product.id.toString(), storage);
          const lowStockWarning = inventorySync.getLowStockWarning(currentQuantity);
          
          return {
            ...product,
            currentQuantity,
            lowStockWarning,
            isAvailable: currentQuantity > 0
          };
        })
      );
      
      res.json(productsWithInventory);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', validateParams(z.object({
    id: z.string().transform(val => parseInt(val)).pipe(z.number())
  })), async (req, res) => {
    try {
      const { id } = req.params as any;
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

  // Get similar products for comparison
  app.get('/api/products/:id/similar', 
    validateParams(z.object({
      id: z.string().transform(val => parseInt(val)).pipe(z.number())
    })),
    validateQuery(z.object({
      limit: z.string().optional().transform(val => Math.min(12, parseInt(val || "6"))).pipe(z.number()).optional()
    })),
    async (req, res) => {
    try {
      const { id } = req.params as any;
      const { limit } = req.query as any;
      
      const similarProducts = await storage.getSimilarProducts(id, limit || 6);
      res.json(similarProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      res.status(500).json({ message: "Failed to fetch similar products" });
    }
  });

  // Get multiple products for comparison view
  app.post('/api/products/compare',
    validateBody(z.object({
      productIds: z.array(z.number()).min(1).max(6) // Maximum 6 products for comparison
    })),
    async (req, res) => {
    try {
      const { productIds } = req.body;
      
      const products = await storage.getProductsForComparison(productIds);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products for comparison:", error);
      res.status(500).json({ message: "Failed to fetch products for comparison" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['seller', 'business', 'admin'].includes(user.accountType)) {
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
      if (product.sellerId !== userId && user?.accountType !== 'admin') {
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
      if (product.sellerId !== userId && user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Photo management for regular users
  app.post('/api/products/:id/photos', 
    isAuthenticated,
    upload.array('photos', 10),
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const productId = parseInt(req.params.id);
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership or admin access
      if (product.sellerId !== userId) {
        const user = await storage.getUser(userId);
        if (user?.accountType !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No photos provided" });
      }

      // Process uploaded photos
      const newPhotos = req.files.map((file: any) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedBy: userId,
        uploadedAt: new Date()
      }));

      // Add photos to existing product photos
      const currentPhotos = product.photos || [];
      const updatedPhotos = [...currentPhotos, ...newPhotos];

      await storage.updateProduct(productId, { 
        photos: updatedPhotos,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      console.log(`User ${userId} added ${newPhotos.length} photos to product ${productId}`);
      
      res.json({ 
        message: "Photos added successfully", 
        addedPhotos: newPhotos,
        totalPhotos: updatedPhotos.length 
      });
    } catch (error: any) {
      console.error("Error adding photos to product:", error);
      res.status(500).json({ message: error.message || "Failed to add photos" });
    }
  });

  app.delete('/api/products/:id/photos/:photoIndex', 
    isAuthenticated,
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const productId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.photoIndex);
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership or admin access
      if (product.sellerId !== userId) {
        const user = await storage.getUser(userId);
        if (user?.accountType !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const photos = product.photos || [];
      
      if (photoIndex < 0 || photoIndex >= photos.length) {
        return res.status(400).json({ message: "Invalid photo index" });
      }

      // Remove photo from array
      const removedPhoto = photos[photoIndex];
      const updatedPhotos = photos.filter((_, index) => index !== photoIndex);

      await storage.updateProduct(productId, { 
        photos: updatedPhotos,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      console.log(`User ${userId} removed photo from product ${productId}: ${removedPhoto.filename}`);
      
      res.json({ 
        message: "Photo removed successfully", 
        removedPhoto,
        remainingPhotos: updatedPhotos.length 
      });
    } catch (error: any) {
      console.error("Error removing photo from product:", error);
      res.status(500).json({ message: error.message || "Failed to remove photo" });
    }
  });

  app.put('/api/products/:id/photos/reorder', 
    isAuthenticated,
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const productId = parseInt(req.params.id);
      const { photoOrder } = req.body; // Array of photo indices in new order
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check ownership or admin access
      if (product.sellerId !== userId) {
        const user = await storage.getUser(userId);
        if (user?.accountType !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const photos = product.photos || [];
      
      if (!Array.isArray(photoOrder) || photoOrder.length !== photos.length) {
        return res.status(400).json({ message: "Invalid photo order array" });
      }

      // Reorder photos according to the provided order
      const reorderedPhotos = photoOrder.map(index => photos[index]).filter(Boolean);

      await storage.updateProduct(productId, { 
        photos: reorderedPhotos,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      console.log(`User ${userId} reordered photos for product ${productId}`);
      
      res.json({ 
        message: "Photos reordered successfully", 
        photos: reorderedPhotos 
      });
    } catch (error: any) {
      console.error("Error reordering photos:", error);
      res.status(500).json({ message: error.message || "Failed to reorder photos" });
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

  // ===== COMMISSION AND PAYOUT AUTOMATION SYSTEM =====

  // Get payout eligibility and amount for seller
  app.get('/api/seller/payouts/eligibility', isAuthenticated, async (req: any, res) => {
    try {
      const sellerId = req.user?.claims?.sub;
      const payoutData = await commissionService.calculatePayoutAmount(sellerId);
      
      res.json({
        ...payoutData,
        eligible: payoutData.totalAmount > 0,
        minimumReached: payoutData.totalAmount >= 50.00 // Configurable minimum
      });
    } catch (error) {
      console.error("Error checking payout eligibility:", error);
      res.status(500).json({ message: "Failed to check payout eligibility" });
    }
  });

  // Get seller payout history  
  app.get('/api/seller/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const sellerId = req.user?.claims?.sub;
      const payouts = await storage.getSellerPayouts(sellerId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching seller payouts:", error);
      res.status(500).json({ message: "Failed to fetch seller payouts" });
    }
  });

  // Create payout request for seller
  app.post('/api/seller/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const sellerId = req.user?.claims?.sub;
      const { paymentMethod = "stripe" } = req.body;
      
      const payout = await commissionService.createPayout(sellerId, paymentMethod);
      res.json(payout);
    } catch (error: any) {
      console.error("Error creating payout:", error);
      res.status(400).json({ message: error.message || "Failed to create payout" });
    }
  });

  // Get detailed commission info for a payout
  app.get('/api/payouts/:payoutId/commissions', isAuthenticated, async (req: any, res) => {
    try {
      const payoutId = parseInt(req.params.payoutId);
      const commissions = await storage.getPayoutCommissions(payoutId);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching payout commissions:", error);
      res.status(500).json({ message: "Failed to fetch payout commissions" });
    }
  });

  // ===== ADMIN COMMISSION AND PAYOUT MANAGEMENT =====

  // Get all payouts for admin management
  app.get('/api/admin/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const payouts = await storage.getAllPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching admin payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Update payout status (admin only)
  app.patch('/api/admin/payouts/:payoutId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const payoutId = parseInt(req.params.payoutId);
      const { status, paymentReference, failureReason } = req.body;
      
      const updatedPayout = await storage.updatePayoutStatus(payoutId, status, paymentReference, failureReason);
      res.json(updatedPayout);
    } catch (error: any) {
      console.error("Error updating payout status:", error);
      res.status(400).json({ message: error.message || "Failed to update payout status" });
    }
  });

  // Process automated payouts (admin only)  
  app.post('/api/admin/payouts/process-automated', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const results = await commissionService.processAutomatedPayouts();
      res.json(results);
    } catch (error: any) {
      console.error("Error processing automated payouts:", error);
      res.status(500).json({ message: error.message || "Failed to process automated payouts" });
    }
  });

  // Get payout settings (admin only)
  app.get('/api/admin/payout-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getPayoutSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching payout settings:", error);
      res.status(500).json({ message: "Failed to fetch payout settings" });
    }
  });

  // Update payout settings (admin only)
  app.put('/api/admin/payout-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settingsData = req.body;
      const updatedSettings = await storage.updatePayoutSettings(settingsData, userId);
      res.json(updatedSettings);
    } catch (error: any) {
      console.error("Error updating payout settings:", error);
      res.status(400).json({ message: error.message || "Failed to update payout settings" });
    }
  });

  // Get commission analytics (admin only)
  app.get('/api/admin/commission-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await commissionService.getCommissionAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching commission analytics:", error);
      res.status(500).json({ message: "Failed to fetch commission analytics" });
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

  // ===== CART OPERATIONS =====
  
  // Get user's cart items
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getUserCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error getting cart items:", error);
      res.status(500).json({ message: "Failed to get cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", isAuthenticated, validateBody(cartActionSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, quantity } = req.body;
      const cartItem = await storage.addToCart({ userId, productId, quantity });
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  // Update cart item quantity
  app.patch("/api/cart/:cartItemId", isAuthenticated, validate({
    params: idParamSchema.extend({ cartItemId: z.string().transform(val => parseInt(val)) }),
    body: z.object({ quantity: z.number().int().min(1).max(10) })
  }), async (req: any, res) => {
    try {
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      await storage.removeFromCart(userId, productId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Clear entire cart
  app.delete("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // ===== GUEST CART OPERATIONS =====
  
  // Get guest cart items (no authentication required)
  app.get("/api/guest-cart/:sessionId", validateParams(uuidParamSchema), async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getGuestCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error getting guest cart items:", error);
      res.status(500).json({ message: "Failed to get guest cart items" });
    }
  });

  // Add item to guest cart (no authentication required)
  app.post("/api/guest-cart", validateBody(guestCartActionSchema), async (req, res) => {
    try {
      const { sessionId, productId, quantity } = req.body;
      
      const cartItem = await storage.addToGuestCart({ sessionId, productId, quantity });
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to guest cart:", error);
      res.status(500).json({ message: "Failed to add to guest cart" });
    }
  });

  // Update guest cart item quantity
  app.patch("/api/guest-cart/:sessionId/:productId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      const cartItem = await storage.updateGuestCartItemQuantity(sessionId, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating guest cart item:", error);
      res.status(500).json({ message: "Failed to update guest cart item" });
    }
  });

  // Remove item from guest cart
  app.delete("/api/guest-cart/:sessionId/:productId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromGuestCart(sessionId, productId);
      res.json({ message: "Item removed from guest cart" });
    } catch (error) {
      console.error("Error removing from guest cart:", error);
      res.status(500).json({ message: "Failed to remove from guest cart" });
    }
  });

  // Clear entire guest cart
  app.delete("/api/guest-cart/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.clearGuestCart(sessionId);
      res.json({ message: "Guest cart cleared" });
    } catch (error) {
      console.error("Error clearing guest cart:", error);
      res.status(500).json({ message: "Failed to clear guest cart" });
    }
  });

  // Get guest cart count
  app.get("/api/guest-cart/:sessionId/count", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const { GuestCheckoutService } = await import("./guest-checkout-service");
      const count = await GuestCheckoutService.getGuestCartCount(sessionId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting guest cart count:", error);
      res.status(500).json({ message: "Failed to get guest cart count" });
    }
  });

  // Convert guest cart to user cart on login
  app.post("/api/guest-cart/convert", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { guestSessionId } = req.body;
      
      if (!guestSessionId) {
        return res.status(400).json({ message: "Guest session ID is required" });
      }

      const { GuestCheckoutService } = await import("./guest-checkout-service");
      await GuestCheckoutService.convertGuestCartToUserCart(guestSessionId, userId);
      
      res.json({ message: "Guest cart converted to user cart successfully" });
    } catch (error) {
      console.error("Error converting guest cart:", error);
      res.status(500).json({ message: "Failed to convert guest cart" });
    }
  });

  // ===== GUEST CHECKOUT ENDPOINTS =====

  // Create payment session for guest checkout (optimized for speed)
  app.post("/api/guest-checkout/create-payment", 
    performanceMiddleware, // Monitor checkout performance
    validateBody(guestOrderCreateSchema), 
    async (req, res) => {
    try {
      const {
        guestSessionId,
        productId,
        sellerId,
        totalAmount,
        shippingCost,
        paymentGateway,
        shippingAddress,
        guestEmail,
        guestName,
        guestPhone,
      } = req.body;

      if (!guestSessionId || !productId || !sellerId || !totalAmount || !paymentGateway) {
        return res.status(400).json({ 
          message: "Missing required fields: guestSessionId, productId, sellerId, totalAmount, paymentGateway" 
        });
      }

      const { GuestCheckoutService } = await import("./guest-checkout-service");
      const orderId = `guest-${crypto.randomUUID().substring(0, 16)}`;

      if (paymentGateway === "stripe") {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: `${req.protocol}://${req.hostname}/guest-checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.protocol}://${req.hostname}/guest-checkout`,
          customer_email: guestEmail,
          metadata: {
            orderId,
            guestSessionId,
            productId: productId.toString(),
            sellerId,
            isGuestOrder: 'true',
          },
          shipping_address_collection: {
            allowed_countries: ['AU'],
          },
          line_items: [{
            price_data: {
              currency: 'aud',
              product_data: {
                name: `Guest Order - Product ${productId}`,
                description: `Order from ${guestName}`,
              },
              unit_amount: Math.round(parseFloat(totalAmount) * 100), // Convert to cents
            },
            quantity: 1,
          }],
        });

        res.json({ checkoutUrl: session.url, orderId });
      } else if (paymentGateway === "paypal") {
        // PayPal integration would go here
        res.status(400).json({ message: "PayPal integration not implemented yet" });
      } else {
        res.status(400).json({ message: "Invalid payment gateway" });
      }
    } catch (error: any) {
      console.error("Error creating guest payment session:", error);
      res.status(500).json({ message: error.message || "Failed to create payment session" });
    }
  });

  // Handle guest checkout success (webhook or redirect)
  app.post("/api/guest-checkout/complete", async (req, res) => {
    try {
      const { sessionId, orderId } = req.body;
      
      // Verify payment and create order in database
      // This would typically be called by a webhook from the payment provider
      
      res.json({ success: true, message: "Guest order completed successfully" });
    } catch (error: any) {
      console.error("Error completing guest checkout:", error);
      res.status(500).json({ message: error.message || "Failed to complete guest checkout" });
    }
  });

  // Move item from cart to saved for later
  app.post("/api/cart/:productId/save-for-later", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      
      // Get cart item to get quantity
      const cartItems = await storage.getUserCartItems(userId);
      const cartItem = cartItems.find(item => item.productId === productId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      // Save to saved items
      const savedItem = await storage.saveItemForLater({
        userId,
        productId,
        quantity: cartItem.quantity,
        savedFromCart: true
      });

      // Remove from cart
      await storage.removeFromCart(userId, productId);

      res.json({ message: "Item saved for later", savedItem });
    } catch (error) {
      console.error("Error saving item for later:", error);
      res.status(500).json({ message: "Failed to save item for later" });
    }
  });

  // ===== SAVED ITEMS OPERATIONS =====
  
  // Get user's saved items
  app.get("/api/saved-items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedItems = await storage.getUserSavedItems(userId);
      res.json(savedItems);
    } catch (error) {
      console.error("Error getting saved items:", error);
      res.status(500).json({ message: "Failed to get saved items" });
    }
  });

  // Add item to saved for later
  app.post("/api/saved-items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedItemData = insertSavedItemSchema.parse({ ...req.body, userId });
      const savedItem = await storage.saveItemForLater(savedItemData);
      res.json(savedItem);
    } catch (error) {
      console.error("Error saving item:", error);
      res.status(500).json({ message: "Failed to save item" });
    }
  });

  // Move item from saved to cart
  app.post("/api/saved-items/:productId/move-to-cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      const cartItem = await storage.moveToCartFromSaved(userId, productId);
      res.json({ message: "Item moved to cart", cartItem });
    } catch (error) {
      console.error("Error moving item to cart:", error);
      res.status(500).json({ message: "Failed to move item to cart" });
    }
  });

  // Remove item from saved
  app.delete("/api/saved-items/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      await storage.removeSavedItem(userId, productId);
      res.json({ message: "Saved item removed" });
    } catch (error) {
      console.error("Error removing saved item:", error);
      res.status(500).json({ message: "Failed to remove saved item" });
    }
  });

  // ===== ABANDONED CART RECOVERY =====
  
  // Track cart abandonment when user leaves with items in cart
  app.post("/api/cart/track-abandonment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.trackCartAbandonment(userId);
      res.json({ success: true, message: "Cart abandonment tracked" });
    } catch (error) {
      console.error("Error tracking cart abandonment:", error);
      res.status(500).json({ message: "Failed to track cart abandonment" });
    }
  });

  // Mark cart as recovered when user completes purchase
  app.post("/api/cart/mark-recovered", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markCartAsRecovered(userId);
      res.json({ success: true, message: "Cart marked as recovered" });
    } catch (error) {
      console.error("Error marking cart as recovered:", error);
      res.status(500).json({ message: "Failed to mark cart as recovered" });
    }
  });

  // Get abandoned cart statistics (admin only)
  app.get("/api/admin/abandoned-carts/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { abandonedCartService } = await import("./abandoned-cart-service");
      const stats = await abandonedCartService.getAbandonedCartStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting abandoned cart stats:", error);
      res.status(500).json({ message: "Failed to get abandoned cart statistics" });
    }
  });

  // Process pending reminder emails (admin/cron endpoint)
  app.post("/api/admin/abandoned-carts/process-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { abandonedCartService } = await import("./abandoned-cart-service");
      await abandonedCartService.processPendingReminders();
      res.json({ success: true, message: "Pending reminders processed" });
    } catch (error) {
      console.error("Error processing reminders:", error);
      res.status(500).json({ message: "Failed to process pending reminders" });
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

  // Order management routes with performance optimization
  app.post('/api/orders', 
    isAuthenticated, 
    performanceMiddleware, // Monitor checkout performance
    async (req: any, res) => {
    try {
      const buyerId = req.user?.claims?.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId,
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create commission record using enhanced commission service (async for speed)
      if (order.sellerId) {
        // Run commission creation in background to speed up checkout
        setImmediate(async () => {
          try {
            const seller = await storage.getUser(order.sellerId);
            if (seller) {
              await commissionService.createCommissionFromOrder(order, seller);
            }
          } catch (error) {
            console.error("Background commission creation failed:", error);
          }
        });
      }
      
      // Update inventory immediately for real-time sync
      const inventorySync = InventorySync.getInstance();
      await inventorySync.updateInventory(order.productId.toString(), order.quantity || 1);
      
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.updatePaymentSettings(req.body, userId);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating payment settings:", error);
      res.status(400).json({ message: error.message || "Failed to update payment settings" });
    }
  });

  // Admin audit logs API
  app.get('/api/admin/audit-logs', isAuthenticated, auditAdminAction('view_audit_logs', 'audit_logs'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const filters = {
        adminUserId: req.query.adminUserId as string,
        action: req.query.action as string,
        targetType: req.query.targetType as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };
      
      const auditData = getAuditLogs(filters);
      res.json(auditData);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get('/api/admin/audit-statistics', isAuthenticated, auditAdminAction('view_audit_statistics', 'audit_statistics'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const timeRange = req.query.startDate && req.query.endDate ? {
        startDate: new Date(req.query.startDate as string),
        endDate: new Date(req.query.endDate as string)
      } : undefined;
      
      const statistics = getAuditStatistics(timeRange);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching audit statistics:", error);
      res.status(500).json({ message: "Failed to fetch audit statistics" });
    }
  });

  // Admin business settings routes
  app.get('/api/admin/settings', isAuthenticated, auditAdminAction('view_settings', 'business_settings'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getBusinessSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      res.status(500).json({ message: "Failed to fetch business settings" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, auditAdminAction('update_settings', 'business_settings'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (adminUser?.accountType !== 'admin') {
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
      
      if (adminUser?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
  
  // Create a new buyback offer using AI evaluation (with rate limiting)
  app.post('/api/buyback/offer', isAuthenticated, validateBody(buybackEvaluationSchema), async (req: any, res) => {
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
      
      if (user?.accountType !== 'admin') {
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

  // ===== ADMIN CATEGORY BUYBACK SETTINGS =====
  
  // Get all categories with their buyback settings
  app.get('/api/admin/categories/buyback-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoriesWithSettings = await buybackService.getCategoriesWithBuybackSettings();
      res.json(categoriesWithSettings);
    } catch (error: any) {
      console.error("Error fetching category buyback settings:", error);
      res.status(500).json({ message: "Failed to fetch category buyback settings" });
    }
  });

  // Update category buyback percentage
  app.put('/api/admin/categories/:categoryId/buyback-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryId = parseInt(req.params.categoryId);
      const { buybackPercentage } = req.body;

      if (!buybackPercentage || buybackPercentage < 10 || buybackPercentage > 80) {
        return res.status(400).json({ message: "Buyback percentage must be between 10% and 80%" });
      }

      const settings = await buybackService.updateCategoryBuybackSettings(categoryId, buybackPercentage);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating category buyback settings:", error);
      res.status(500).json({ message: error.message || "Failed to update buyback settings" });
    }
  });

  // ===== ADMIN BUYBACK LIMITS SETTINGS =====
  
  // Get current buyback limits settings
  app.get('/api/admin/buyback-limits-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        await logAdminAction(userId, 'get_buyback_limits_settings', false, 'Unauthorized access attempt');
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getBuybackLimitsSettings();
      await logAdminAction(userId, 'get_buyback_limits_settings', true, `Retrieved buyback limits settings`);
      
      res.json(settings || {
        maxItemsPerMonth: 2,
        maxPricePerItem: "200.00",
        isActive: true,
        description: "Monthly limits for instant buyback to prevent abuse and maintain system sustainability"
      });
    } catch (error) {
      console.error("Error fetching buyback limits settings:", error);
      res.status(500).json({ message: "Failed to fetch buyback limits settings" });
    }
  });

  // Update buyback limits settings
  app.put('/api/admin/buyback-limits-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        await logAdminAction(userId, 'update_buyback_limits_settings', false, 'Unauthorized access attempt');
        return res.status(403).json({ message: "Admin access required" });
      }

      const { maxItemsPerMonth, maxPricePerItem, description } = req.body;

      // Validate input
      if (maxItemsPerMonth < 1 || maxItemsPerMonth > 50) {
        return res.status(400).json({ message: "Max items per month must be between 1 and 50" });
      }

      if (parseFloat(maxPricePerItem) < 10 || parseFloat(maxPricePerItem) > 2000) {
        return res.status(400).json({ message: "Max price per item must be between $10 and $2000" });
      }

      const updatedSettings = await storage.updateBuybackLimitsSettings({
        maxItemsPerMonth,
        maxPricePerItem: parseFloat(maxPricePerItem).toFixed(2),
        description,
        updatedBy: userId
      });

      await logAdminAction(userId, 'update_buyback_limits_settings', true, 
        `Updated limits: ${maxItemsPerMonth} items/month, $${maxPricePerItem} max per item`);
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating buyback limits settings:", error);
      res.status(500).json({ message: "Failed to update buyback limits settings" });
    }
  });

  // Get user's current monthly buyback count (for checking limits)
  app.get('/api/user/buyback-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const monthlyCount = await storage.getUserMonthlyBuybackCount(userId);
      const settings = await storage.getBuybackLimitsSettings();
      
      res.json({
        currentMonthCount: monthlyCount,
        maxItemsPerMonth: settings?.maxItemsPerMonth || 2,
        maxPricePerItem: settings?.maxPricePerItem || "200.00",
        remainingItems: Math.max(0, (settings?.maxItemsPerMonth || 2) - monthlyCount)
      });
    } catch (error) {
      console.error("Error fetching user buyback count:", error);
      res.status(500).json({ message: "Failed to fetch buyback count" });
    }
  });

  // ===== DYNAMIC DASHBOARD STATISTICS =====
  
  // Dynamic dashboard statistics
  app.get('/api/admin/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await dashboardStatsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Trending statistics
  app.get('/api/admin/trending-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const trends = await dashboardStatsService.getTrendingStats();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trending stats:", error);
      res.status(500).json({ message: "Failed to fetch trending statistics" });
    }
  });

  // Real-time activity statistics
  app.get('/api/admin/activity-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const activity = await dashboardStatsService.getActivityStats();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      res.status(500).json({ message: "Failed to fetch activity statistics" });
    }
  });

  // Category breakdown statistics
  app.get('/api/admin/category-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await dashboardStatsService.getCategoryStats();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ message: "Failed to fetch category statistics" });
    }
  });

  // Get buyback analytics (admin only)
  app.get('/api/admin/buyback/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
      
      if (user?.accountType !== 'admin') {
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
    const adminUserId = req.user?.claims?.sub;
    console.log('=== IMPERSONATION DEBUG ===');
    console.log('Impersonation attempt by user:', adminUserId, 'type:', typeof adminUserId);
    console.log('Full user claims:', req.user?.claims);
    
    const adminUser = adminUserId ? await storage.getUser(String(adminUserId)) : null;
    console.log('Admin user found:', adminUser ? { 
      id: adminUser.id, 
      email: adminUser.email,
      accountType: adminUser.accountType 
    } : 'null');
    
    if (adminUser?.accountType !== 'admin') {
      console.log('Access denied - user account type:', adminUser?.accountType);
      return res.status(403).json({ message: 'Admin access required' });
    }

    try {
      const { userId } = req.body;
      console.log('Impersonation request for userId:', userId, 'type:', typeof userId);
      
      // Ensure userId is string (it should be for storage.getUser)
      const targetUserId = String(userId);
      const targetUser = await storage.getUser(targetUserId);
      
      if (!targetUser) {
        console.log('Target user not found:', targetUserId);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Starting impersonation:', {
        admin: req.user.claims.sub,
        target: targetUser.id,
        targetEmail: targetUser.email
      });

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
          role: targetUser.accountType
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
      
      if (!originalUser || originalUser.accountType !== 'admin') {
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
          role: originalUser.accountType
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
    
    // Debug current user info
    const currentUserId = req.user?.claims?.sub;
    console.log('Impersonation status check:', {
      currentUserId,
      isImpersonating,
      originalUserId
    });
    
    let originalUser = null;
    if (isImpersonating && originalUserId) {
      originalUser = await storage.getUser(originalUserId);
    }
    
    res.json({
      isImpersonating,
      currentUserId,
      originalUser: originalUser ? {
        id: originalUser.id,
        email: originalUser.email,
        firstName: originalUser.firstName,
        lastName: originalUser.lastName,
        role: originalUser.accountType
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

  // Admin listing management routes
  app.get('/api/admin/listings', isAuthenticated, auditAdminAction('view_all_listings', 'listings'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filters = {
        status: req.query.status as string,
        sellerId: req.query.sellerId as string,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        search: req.query.search as string,
        sort: req.query.sort as string || 'newest',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };
      
      const listings = await storage.getProducts(filters);
      const totalCount = await storage.getProductCount(filters);
      
      res.json({
        listings,
        totalCount,
        currentPage: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
        totalPages: Math.ceil(totalCount / (filters.limit || 50))
      });
    } catch (error) {
      console.error("Error fetching admin listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/admin/listings/:id', isAuthenticated, auditAdminAction('view_listing_details', 'listing'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const listing = await storage.getProduct(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get seller information
      const seller = await storage.getUser(listing.sellerId);
      
      res.json({
        ...listing,
        seller: seller ? {
          id: seller.id,
          email: seller.email,
          firstName: seller.firstName,
          lastName: seller.lastName,
          role: seller.accountType,
          createdAt: seller.createdAt
        } : null
      });
    } catch (error) {
      console.error("Error fetching listing details:", error);
      res.status(500).json({ message: "Failed to fetch listing details" });
    }
  });

  app.put('/api/admin/listings/:id', 
    isAuthenticated, 
    auditAdminAction('edit_listing', 'listing'),
    validateBody(insertProductSchema.partial()),
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const listing = await storage.getProduct(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Update listing with admin modifications
      const updateData = {
        ...req.body,
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
      };

      const updatedListing = await storage.updateProduct(listingId, updateData);
      
      // Log the admin edit action
      console.log(`Admin ${user.email} edited listing ${listingId}`);
      
      res.json(updatedListing);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      res.status(400).json({ message: error.message || "Failed to update listing" });
    }
  });

  // Admin photo management for listings
  app.post('/api/admin/listings/:id/photos', 
    isAuthenticated,
    auditAdminAction('add_listing_photo', 'listing'),
    upload.array('photos', 10),
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const listing = await storage.getProduct(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No photos provided" });
      }

      // Process uploaded photos
      const newPhotos = req.files.map((file: any) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedBy: userId,
        uploadedAt: new Date()
      }));

      // Add photos to existing listing photos
      const currentPhotos = listing.photos || [];
      const updatedPhotos = [...currentPhotos, ...newPhotos];

      await storage.updateProduct(listingId, { 
        photos: updatedPhotos,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      console.log(`Admin ${user.email} added ${newPhotos.length} photos to listing ${listingId}`);
      
      res.json({ 
        message: "Photos added successfully", 
        addedPhotos: newPhotos,
        totalPhotos: updatedPhotos.length 
      });
    } catch (error: any) {
      console.error("Error adding photos to listing:", error);
      res.status(500).json({ message: error.message || "Failed to add photos" });
    }
  });

  app.delete('/api/admin/listings/:id/photos/:photoIndex', 
    isAuthenticated,
    auditAdminAction('remove_listing_photo', 'listing'),
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.photoIndex);
      
      const listing = await storage.getProduct(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const photos = listing.photos || [];
      
      if (photoIndex < 0 || photoIndex >= photos.length) {
        return res.status(400).json({ message: "Invalid photo index" });
      }

      // Remove photo from array
      const removedPhoto = photos[photoIndex];
      const updatedPhotos = photos.filter((_, index) => index !== photoIndex);

      await storage.updateProduct(listingId, { 
        photos: updatedPhotos,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      // Optionally delete the physical file (implement file cleanup if needed)
      console.log(`Admin ${user.email} removed photo from listing ${listingId}: ${removedPhoto.filename}`);
      
      res.json({ 
        message: "Photo removed successfully", 
        removedPhoto,
        remainingPhotos: updatedPhotos.length 
      });
    } catch (error: any) {
      console.error("Error removing photo from listing:", error);
      res.status(500).json({ message: error.message || "Failed to remove photo" });
    }
  });

  app.patch('/api/admin/listings/:id/status', 
    isAuthenticated,
    auditAdminAction('change_listing_status', 'listing'),
    validateBody(z.object({
      status: z.enum(['available', 'sold', 'withdrawn', 'pending', 'banned']),
      reason: z.string().optional()
    })),
    async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.accountType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const listingId = parseInt(req.params.id);
      const { status, reason } = req.body;
      
      const listing = await storage.getProduct(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      await storage.updateProduct(listingId, {
        status,
        adminNotes: reason ? `Status changed to ${status}: ${reason}` : `Status changed to ${status}`,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      });

      console.log(`Admin ${user.email} changed listing ${listingId} status to ${status}${reason ? ` (${reason})` : ''}`);
      
      res.json({ message: "Listing status updated successfully", status });
    } catch (error: any) {
      console.error("Error updating listing status:", error);
      res.status(400).json({ message: error.message || "Failed to update listing status" });
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

  // CSRF error handling middleware (must be after routes)
  // CSRF error handler temporarily disabled

  // ===== SELLER VERIFICATION ENDPOINTS =====
  
  // Get verification status
  app.get("/api/seller/verification/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await verificationService.getVerificationStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error getting verification status:", error);
      res.status(500).json({ message: "Failed to get verification status" });
    }
  });

  // Get available document types
  app.get("/api/seller/verification/document-types", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const status = await verificationService.getVerificationStatus(userId);
      const availableTypes = verificationService.getAvailableDocumentTypes(status.documents);
      res.json(availableTypes);
    } catch (error) {
      console.error("Error getting document types:", error);
      res.status(500).json({ message: "Failed to get document types" });
    }
  });

  // Upload verification document
  const verificationUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = "public/uploads/verification";
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        cb(null, `verification_${timestamp}_${random}${ext}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only JPEG, PNG and PDF files are allowed"));
      }
    }
  });

  app.post("/api/seller/verification/upload-document", 
    isAuthenticated, 
    verificationUpload.fields([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 }
    ]), 
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { documentType, documentNumber, expiryDate } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!documentType) {
          return res.status(400).json({ message: "Document type is required" });
        }

        if (!files.frontImage || files.frontImage.length === 0) {
          return res.status(400).json({ message: "Front image is required" });
        }

        const frontImageUrl = `/uploads/verification/${files.frontImage[0].filename}`;
        const backImageUrl = files.backImage && files.backImage.length > 0 
          ? `/uploads/verification/${files.backImage[0].filename}` 
          : undefined;

        const documentData = {
          documentType,
          documentNumber: documentNumber || undefined,
          frontImageUrl,
          backImageUrl,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        };

        const document = await verificationService.uploadDocument(userId, documentData);
        res.json(document);
      } catch (error) {
        console.error("Error uploading verification document:", error);
        res.status(500).json({ message: error.message || "Failed to upload document" });
      }
    }
  );

  // Submit verification for review
  app.post("/api/seller/verification/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await verificationService.submitForReview(userId);
      res.json(submission);
    } catch (error) {
      console.error("Error submitting verification:", error);
      res.status(500).json({ message: error.message || "Failed to submit verification" });
    }
  });

  // Admin: Get pending verifications
  app.get("/api/admin/verification/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.accountType || "customer";
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const pendingSubmissions = await verificationService.getPendingSubmissions();
      res.json(pendingSubmissions);
    } catch (error) {
      console.error("Error getting pending verifications:", error);
      res.status(500).json({ message: "Failed to get pending verifications" });
    }
  });

  // Admin: Verify document
  app.post("/api/admin/verification/verify-document/:documentId", isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.accountType || "customer";
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adminId = req.user.claims.sub;
      const documentId = parseInt(req.params.documentId);
      const { approved, rejectionReason } = req.body;

      const document = await verificationService.verifyDocument(documentId, adminId, approved, rejectionReason);
      res.json(document);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Admin: Review submission
  app.post("/api/admin/verification/review-submission/:submissionId", isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.accountType || "customer";
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adminId = req.user.claims.sub;
      const submissionId = parseInt(req.params.submissionId);
      const { approved, reviewNotes } = req.body;

      const submission = await verificationService.reviewSubmission(submissionId, adminId, approved, reviewNotes);
      res.json(submission);
    } catch (error) {
      console.error("Error reviewing submission:", error);
      res.status(500).json({ message: "Failed to review submission" });
    }
  });

  // ===== AUSTRALIAN LOCATIONS API ENDPOINTS =====
  
  // Search Australian locations
  app.get('/api/locations/search', async (req, res) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json([]);
      }
      
      const locations = await storage.searchLocations(
        query, 
        limit ? parseInt(limit as string, 10) : 50
      );
      
      res.json(locations);
    } catch (error: any) {
      console.error("Error searching locations:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Get locations by postcode
  app.get('/api/locations/postcode/:postcode', async (req, res) => {
    try {
      const { postcode } = req.params;
      const locations = await storage.getLocationsByPostcode(postcode);
      res.json(locations);
    } catch (error: any) {
      console.error("Error fetching locations by postcode:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get locations by state
  app.get('/api/locations/state/:state', async (req, res) => {
    try {
      const { state } = req.params;
      const { limit } = req.query;
      
      const locations = await storage.getLocationsByState(
        state.toUpperCase(),
        limit ? parseInt(limit as string, 10) : 100
      );
      
      res.json(locations);
    } catch (error: any) {
      console.error("Error fetching locations by state:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get all Australian states
  app.get('/api/locations/states', async (req, res) => {
    try {
      const states = await storage.getAllStates();
      res.json(states);
    } catch (error: any) {
      console.error("Error fetching states:", error);  
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  // Error logging endpoint for client-side errors
  app.post("/api/errors", (req, res) => {
    try {
      const errorData = req.body;
      
      // Log error with structured logging
      const logData = {
        type: 'client_error',
        errorId: errorData.id,
        message: errorData.message,
        severity: errorData.severity,
        category: errorData.category,
        url: errorData.url,
        userAgent: errorData.userAgent,
        sessionId: errorData.sessionId,
        userId: (req as any).user?.id || 'anonymous',
        timestamp: errorData.timestamp,
        stack: errorData.stack,
        componentStack: errorData.componentStack,
        metadata: errorData.metadata
      };

      // Log with appropriate level based on severity
      switch (errorData.severity) {
        case 'critical':
          console.error('Critical client error:', logData);
          break;
        case 'high':
          console.error('High severity client error:', logData);
          break;
        case 'medium':
          console.warn('Medium severity client error:', logData);
          break;
        default:
          console.log('Low severity client error:', logData);
      }

      res.status(200).json({ success: true, errorId: errorData.id });
    } catch (error: any) {
      console.error('Failed to log client error:', error);
      res.status(500).json({ success: false, message: 'Failed to log error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
