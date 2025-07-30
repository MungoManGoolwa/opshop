// Performance optimization and caching layer for Opshop Online
import { Request, Response, NextFunction } from 'express';
import memoize from 'memoizee';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxAge: number; // Max age in seconds for HTTP cache headers
  staleWhileRevalidate?: number; // Background refresh time
}

const defaultCacheConfig: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxAge: 300, // 5 minutes
  staleWhileRevalidate: 60 // 1 minute background refresh
};

// In-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache middleware for API responses
export const cacheMiddleware = (config: Partial<CacheConfig> = {}) => {
  const { ttl, maxAge, staleWhileRevalidate } = { ...defaultCacheConfig, ...config };
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        'X-Cache': 'HIT'
      });
      return res.json(cached.data);
    }

    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = function(body: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data: body,
          timestamp: Date.now(),
          ttl
        });
        
        res.set({
          'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
          'X-Cache': 'MISS'
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
};

// Database query optimization with memoization
export const memoizeQuery = (fn: Function, options: { maxAge?: number; max?: number } = {}) => {
  return memoize(fn, {
    maxAge: options.maxAge || 5 * 60 * 1000, // 5 minutes default
    max: options.max || 100, // Max 100 cached queries
    promise: true,
    normalizer: (args: any[]) => JSON.stringify(args)
  });
};

// Optimize product queries with intelligent caching
export const optimizeProductQueries = {
  // Cache featured products for 10 minutes
  getFeaturedProducts: memoizeQuery(async (storage: any, limit: number = 8) => {
    return await storage.getFeaturedProducts(limit);
  }, { maxAge: 10 * 60 * 1000 }),

  // Cache categories for 30 minutes (they change less frequently)
  getCategories: memoizeQuery(async (storage: any) => {
    return await storage.getCategories();
  }, { maxAge: 30 * 60 * 1000 }),

  // Cache product by ID for 5 minutes
  getProduct: memoizeQuery(async (storage: any, id: string) => {
    return await storage.getProduct(id);
  }, { maxAge: 5 * 60 * 1000 }),

  // Cache product search results for 2 minutes
  searchProducts: memoizeQuery(async (storage: any, filters: any) => {
    return await storage.searchProducts(filters);
  }, { maxAge: 2 * 60 * 1000 })
};

// Real-time inventory sync utilities
export class InventorySync {
  private static instance: InventorySync;
  private inventoryCache = new Map<string, { quantity: number; timestamp: number }>();
  private readonly INVENTORY_TTL = 30 * 1000; // 30 seconds for inventory data

  static getInstance(): InventorySync {
    if (!InventorySync.instance) {
      InventorySync.instance = new InventorySync();
    }
    return InventorySync.instance;
  }

  // Update inventory in real-time
  async updateInventory(productId: string, quantity: number): Promise<void> {
    this.inventoryCache.set(productId, {
      quantity,
      timestamp: Date.now()
    });

    // Broadcast to all connected clients if using WebSocket
    // This would integrate with your WebSocket implementation
    // broadcastInventoryUpdate(productId, quantity);
  }

  // Get current inventory with cache fallback
  async getInventory(productId: string, storage: any): Promise<number> {
    const cached = this.inventoryCache.get(productId);
    
    // Return cached if recent
    if (cached && Date.now() - cached.timestamp < this.INVENTORY_TTL) {
      return cached.quantity;
    }

    // Fetch from database and cache
    try {
      const product = await storage.getProduct(productId);
      const quantity = product?.quantity || 0;
      
      this.inventoryCache.set(productId, {
        quantity,
        timestamp: Date.now()
      });
      
      return quantity;
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return cached?.quantity || 0;
    }
  }

  // Check if product is available
  async isAvailable(productId: string, storage: any): Promise<boolean> {
    const quantity = await this.getInventory(productId, storage);
    return quantity > 0;
  }

  // Get low stock warning
  getLowStockWarning(quantity: number): string | null {
    if (quantity === 0) return "Out of Stock";
    if (quantity === 1) return "Only 1 left!";
    if (quantity <= 3) return `Only ${quantity} left!`;
    if (quantity <= 5) return "Low stock";
    return null;
  }
}

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Set response time header before response is sent
  const originalSend = res.send.bind(res);
  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log slow requests (over 2 seconds)
    if (duration > 2000) {
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
    
    // Set performance headers before sending response
    if (!res.headersSent) {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    return originalSend(body);
  };
  
  next();
};

// Cache cleanup utility
export const cleanupCache = () => {
  const now = Date.now();
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key);
    }
  }
};

// Schedule cache cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// Export cache utilities
export { cache };