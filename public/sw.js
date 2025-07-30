// Opshop Online Service Worker
const CACHE_NAME = 'opshop-online-v1';
const STATIC_CACHE = 'opshop-static-v1';
const DYNAMIC_CACHE = 'opshop-dynamic-v1';

// Static files to cache
const STATIC_FILES = [
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/offline.html'
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/categories',
  '/api/products',
  '/api/featured-products'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Try to cache static files, skip if not found
        return Promise.allSettled(
          STATIC_FILES.map(file => cache.add(file))
        );
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with Cache Fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(cacheFirst(request));
  } else {
    // Pages - Network First with Cache Fallback
    event.respondWith(networkFirstWithFallback(request));
  }
});

// Network First strategy with cache fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response(
        '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Check if request is for a static asset
function isStaticAsset(pathname) {
  return pathname.startsWith('/icons/') ||
         pathname.startsWith('/images/') ||
         pathname.startsWith('/screenshots/') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'product-search') {
    event.waitUntil(syncProductSearch());
  } else if (event.tag === 'cart-update') {
    event.waitUntil(syncCartUpdates());
  }
});

// Sync product searches when back online
async function syncProductSearch() {
  try {
    // Implement offline search sync logic here
    // Currently a placeholder for future implementation
  } catch (error) {
    // Handle sync errors silently
  }
}

// Sync cart updates when back online
async function syncCartUpdates() {
  try {
    // Implement offline cart sync logic here
    // Currently a placeholder for future implementation
  } catch (error) {
    // Handle sync errors silently
  }
}