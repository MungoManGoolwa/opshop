// Frontend performance optimization utilities for Opshop Online
import { useState, useEffect, useCallback, useMemo } from 'react';

// Performance optimization hooks and utilities

// Debounce hook for search and API calls
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastExecuted, setLastExecuted] = useState<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted + delay) {
      setThrottledValue(value);
      setLastExecuted(Date.now());
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        setLastExecuted(Date.now());
      }, delay - (Date.now() - lastExecuted));

      return () => clearTimeout(timerId);
    }
  }, [value, delay, lastExecuted]);

  return throttledValue;
};

// Lazy loading hook for images and components
export const useLazyLoading = (ref: React.RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, hasLoaded]);

  return { isVisible, hasLoaded };
};

// Memory optimization for large lists
export const useVirtualization = (
  items: any[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, containerHeight, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
  };
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.recordMetric(name, duration);
    
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  // Measure async function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.recordMetric(name, duration);
    
    if (duration > 1000) {
      console.warn(`Slow async operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  // Record performance metric
  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Get performance statistics
  getStats(name: string) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return null;

    const sorted = [...metrics].sort((a, b) => a - b);
    return {
      count: metrics.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  // Get all performance statistics
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }
}

// Image optimization utilities
export const optimizeImageLoading = {
  // Create optimized image URL with size and format
  getOptimizedImageUrl: (
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      format?: 'webp' | 'jpg' | 'png';
      quality?: number;
    } = {}
  ) => {
    const { width, height, format = 'webp', quality = 80 } = options;
    
    // For now, return original URL - this would integrate with image optimization service
    return originalUrl;
  },

  // Preload critical images
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Lazy load image with placeholder
  createLazyImage: (src: string, alt: string, placeholder?: string) => {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = alt;
    
    if (placeholder) {
      img.src = placeholder;
      img.dataset.src = src;
    } else {
      img.src = src;
    }
    
    return img;
  },
};

// API request optimization
export const optimizeApiRequests = {
  // Request deduplication
  pendingRequests: new Map<string, Promise<any>>(),

  // Deduplicate identical API requests
  dedupe: async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    if (optimizeApiRequests.pendingRequests.has(key)) {
      return optimizeApiRequests.pendingRequests.get(key);
    }

    const promise = fn().finally(() => {
      optimizeApiRequests.pendingRequests.delete(key);
    });

    optimizeApiRequests.pendingRequests.set(key, promise);
    return promise;
  },

  // Batch multiple API requests
  batch: async <T>(requests: (() => Promise<T>)[]): Promise<T[]> => {
    const monitor = PerformanceMonitor.getInstance();
    return monitor.measureAsync('api_batch', async () => {
      return Promise.all(requests.map(req => req()));
    });
  },

  // Retry failed requests with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  },
};

// Bundle size optimization utilities
export const bundleOptimization = {
  // Dynamic import with error handling
  lazyImport: async <T>(importFn: () => Promise<{ default: T }>): Promise<T> => {
    const monitor = PerformanceMonitor.getInstance();
    return monitor.measureAsync('lazy_import', async () => {
      const module = await importFn();
      return module.default;
    });
  },

  // Preload critical modules
  preloadModule: (importFn: () => Promise<any>) => {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(console.error);
    }, 100);
  },
};

// Memory management utilities
export const memoryOptimization = {
  // Cleanup event listeners and subscriptions
  createCleanupManager: () => {
    const cleanupFunctions: (() => void)[] = [];
    
    return {
      add: (cleanupFn: () => void) => {
        cleanupFunctions.push(cleanupFn);
      },
      
      cleanup: () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        });
        cleanupFunctions.length = 0;
      },
    };
  },

  // Monitor memory usage
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
      
      if (usage.used > usage.limit * 0.8) {
        console.warn('High memory usage detected:', usage);
      }
      
      return usage;
    }
    return null;
  },
};

// Export performance monitoring instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React component performance wrapper
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  name: string
) => {
  return (props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        monitor.measure(`component_${name}`, () => duration);
      };
    }, []);
    
    return <Component {...props} />;
  };
};

// Checkout performance optimization
export const checkoutOptimization = {
  // Preload checkout dependencies
  preloadCheckoutDependencies: async () => {
    const imports = [
      () => import('@stripe/stripe-js'),
      () => import('../pages/checkout'),
      () => import('../components/ui/form'),
    ];
    
    await bundleOptimization.lazyImport(() => 
      Promise.all(imports.map(imp => imp()))
    );
  },

  // Optimize payment form performance
  optimizePaymentForm: () => {
    // Preload Stripe.js
    if (typeof window !== 'undefined' && !window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
    }
  },

  // Cache checkout data
  cacheCheckoutData: (data: any) => {
    try {
      sessionStorage.setItem('checkout_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache checkout data:', error);
    }
  },

  // Get cached checkout data
  getCachedCheckoutData: () => {
    try {
      const cached = sessionStorage.getItem('checkout_cache');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached checkout data:', error);
      return null;
    }
  },
};