// Performance optimization utilities for third-party scripts and plugins
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    domContentLoaded: 0
  };

  constructor() {
    this.initMetrics();
    this.optimizeThirdPartyScripts();
  }

  private initMetrics() {
    // Capture core performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      // DOM Content Loaded time
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now();
      });

      // Window load time
      window.addEventListener('load', () => {
        this.metrics.loadTime = performance.now();
        this.captureWebVitals();
      });
    }
  }

  private captureWebVitals() {
    // Capture Web Vitals if available
    try {
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      }
    } catch (error) {
      // Performance APIs not supported
      if (import.meta.env.DEV) {
        console.warn('Performance APIs not supported:', error);
      }
    }
  }

  private optimizeThirdPartyScripts() {
    // Defer non-critical third-party scripts
    this.deferNonCriticalScripts();
    
    // Optimize image loading
    this.optimizeImageLoading();
    
    // Clean up unused event listeners
    this.cleanupEventListeners();
  }

  private deferNonCriticalScripts() {
    // Add intersection observer for lazy loading scripts
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            if (element.dataset.src) {
              const script = document.createElement('script');
              script.src = element.dataset.src;
              script.async = true;
              document.head.appendChild(script);
              observer.unobserve(element);
            }
          }
        });
      });

      // Observe elements marked for lazy script loading
      document.querySelectorAll('[data-lazy-script]').forEach((el) => {
        observer.observe(el);
      });
    }
  }

  private optimizeImageLoading() {
    // Add loading="lazy" to images that don't have it
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach((img) => {
        (img as HTMLImageElement).loading = 'lazy';
      });
    }
  }

  private cleanupEventListeners() {
    // Simple cleanup without WeakMap tracking to avoid issues
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      // Force cleanup of any remaining listeners
      this.forceCleanupListeners();
    });
  }

  private forceCleanupListeners() {
    // Remove any dangling event listeners
    try {
      // Clear timers
      for (let i = 1; i < 99999; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    } catch (error) {
      // Silent cleanup
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public reportSlowOperations(threshold: number = 100) {
    // Report operations that exceed threshold
    if (typeof window !== 'undefined' && 'performance' in window) {
      const entries = performance.getEntriesByType('measure');
      const slowOperations = entries.filter(entry => entry.duration > threshold);
      
      if (slowOperations.length > 0 && import.meta.env.DEV) {
        console.warn('Slow operations detected:', slowOperations);
      }
    }
  }

  public optimizeBundle() {
    // Dynamic import optimization
    return {
      loadComponent: async (componentPath: string) => {
        try {
          const startTime = performance.now();
          const component = await import(componentPath);
          const loadTime = performance.now() - startTime;
          
          if (loadTime > 50 && import.meta.env.DEV) {
            console.warn(`Slow component load: ${componentPath} took ${loadTime}ms`);
          }
          
          return component;
        } catch (error) {
          console.error(`Failed to load component: ${componentPath}`, error);
          throw error;
        }
      }
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export utilities
export const optimizeThirdPartyPlugin = (
  pluginName: string,
  loadFn: () => Promise<any>,
  options: {
    timeout?: number;
    retries?: number;
    fallback?: () => void;
  } = {}
) => {
  const { timeout = 5000, retries = 2, fallback } = options;
  
  let attempts = 0;
  
  const load = async (): Promise<any> => {
    attempts++;
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout loading ${pluginName}`)), timeout);
      });
      
      const result = await Promise.race([loadFn(), timeoutPromise]);
      
      if (import.meta.env.DEV) {
        console.log(`Successfully loaded ${pluginName}`);
      }
      
      return result;
    } catch (error) {
      if (attempts < retries) {
        if (import.meta.env.DEV) {
          console.warn(`Retrying ${pluginName} (attempt ${attempts + 1}/${retries})`);
        }
        return load();
      }
      
      if (import.meta.env.DEV) {
        console.error(`Failed to load ${pluginName}:`, error);
      }
      
      if (fallback) {
        fallback();
      }
      
      throw error;
    }
  };
  
  return load();
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const metrics = performanceOptimizer.getMetrics();
  
  return {
    metrics,
    reportSlowOperations: (threshold?: number) => 
      performanceOptimizer.reportSlowOperations(threshold),
    optimizeBundle: () => performanceOptimizer.optimizeBundle()
  };
};