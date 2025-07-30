// Image optimization service for Opshop Online
import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface ImageOptimizationConfig {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  formats: string[];
  enableWebP: boolean;
  enableLazyLoading: boolean;
}

const defaultConfig: ImageOptimizationConfig = {
  quality: 80,
  maxWidth: 1200,
  maxHeight: 1200,
  formats: ['webp', 'jpg', 'png'],
  enableWebP: true,
  enableLazyLoading: true
};

// Image serving middleware with optimization
export const optimizedImageMiddleware = (config: Partial<ImageOptimizationConfig> = {}) => {
  const fullConfig = { ...defaultConfig, ...config };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const imagePath = req.path;
    
    // Only handle image requests
    if (!imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return next();
    }

    try {
      // Check if browser supports WebP
      const acceptsWebP = req.headers.accept?.includes('image/webp') || false;
      
      // Set caching headers for images
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept'
      });

      // If WebP is supported and enabled, try to serve WebP version
      if (acceptsWebP && fullConfig.enableWebP) {
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        try {
          const webpStats = await fs.stat(path.join(process.cwd(), 'public', webpPath));
          if (webpStats.isFile()) {
            res.set('Content-Type', 'image/webp');
            return res.sendFile(path.join(process.cwd(), 'public', webpPath));
          }
        } catch {
          // WebP version doesn't exist, continue with original
        }
      }

      // Serve original image with proper headers
      const imageExtension = path.extname(imagePath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };

      res.set('Content-Type', mimeTypes[imageExtension] || 'application/octet-stream');
      next();
      
    } catch (error) {
      console.error('Image optimization error:', error);
      next();
    }
  };
};

// Lazy loading image component helper
export const generateLazyImageHTML = (
  src: string, 
  alt: string, 
  options: {
    width?: number;
    height?: number;
    className?: string;
    placeholder?: string;
  } = {}
) => {
  const { width, height, className = '', placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=' } = options;

  const dimensionAttrs = width && height ? `width="${width}" height="${height}"` : '';
  
  return `
    <img 
      src="${placeholder}"
      data-src="${src}"
      alt="${alt}"
      class="lazy-image ${className}"
      ${dimensionAttrs}
      loading="lazy"
      decoding="async"
    />
  `;
};

// Client-side lazy loading script
export const lazyLoadingScript = `
  <script>
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for older browsers
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  </script>
`;

// Responsive image sizes generator
export const generateResponsiveImages = (baseSrc: string, alt: string) => {
  const sizes = [
    { width: 320, suffix: '_mobile' },
    { width: 768, suffix: '_tablet' },
    { width: 1200, suffix: '_desktop' }
  ];

  const srcset = sizes
    .map(size => {
      const filename = baseSrc.replace(/(\.[^.]+)$/, `${size.suffix}$1`);
      return `${filename} ${size.width}w`;
    })
    .join(', ');

  return `
    <img 
      src="${baseSrc}"
      srcset="${srcset}"
      sizes="(max-width: 320px) 100vw, (max-width: 768px) 50vw, 33vw"
      alt="${alt}"
      loading="lazy"
      decoding="async"
    />
  `;
};

// Image compression utility (for future implementation)
export const compressImage = async (
  inputPath: string,
  outputPath: string,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
) => {
  // This would integrate with sharp or similar library
  // For now, just copy the file as placeholder
  try {
    await fs.copyFile(inputPath, outputPath);
    console.log(`Image optimized: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

// CSS for smooth lazy loading transitions
export const lazyLoadingCSS = `
  <style>
    .lazy-image {
      transition: opacity 0.3s ease;
      opacity: 0;
      background-color: #f3f4f6;
    }
    
    .lazy-image.loaded {
      opacity: 1;
    }
    
    .lazy-image[src*="data:image"] {
      filter: blur(5px);
    }
    
    .lazy-image.loaded[src*="data:image"] {
      filter: none;
    }
  </style>
`;

// Performance monitoring for images
export const trackImagePerformance = () => {
  return `
    <script>
      // Track image load performance
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === 'img') {
              console.log('Image loaded:', entry.name, 'Time:', entry.duration + 'ms');
              
              // Report slow loading images (over 2 seconds)
              if (entry.duration > 2000) {
                console.warn('Slow image detected:', entry.name, entry.duration + 'ms');
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
      }
    </script>
  `;
};