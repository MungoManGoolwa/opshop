import { useEffect, useRef } from 'react';

/**
 * Hook to manage global event listeners with automatic cleanup
 * Ensures memory safety by properly removing listeners when components unmount
 */
export function useCleanupListeners() {
  const listenersRef = useRef<Map<string, () => void>>(new Map());

  const addListener = (
    target: EventTarget | Window | Document,
    eventType: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
    key?: string
  ) => {
    const listenerKey = key || `${eventType}_${Date.now()}_${Math.random()}`;
    
    // Add the event listener
    target.addEventListener(eventType, handler, options);
    
    // Store cleanup function
    const cleanup = () => {
      target.removeEventListener(eventType, handler, options);
    };
    
    listenersRef.current.set(listenerKey, cleanup);
    
    return () => {
      cleanup();
      listenersRef.current.delete(listenerKey);
    };
  };

  const removeListener = (key: string) => {
    const cleanup = listenersRef.current.get(key);
    if (cleanup) {
      cleanup();
      listenersRef.current.delete(key);
    }
  };

  const removeAllListeners = () => {
    listenersRef.current.forEach((cleanup) => cleanup());
    listenersRef.current.clear();
  };

  // Cleanup all listeners when component unmounts
  useEffect(() => {
    return () => {
      removeAllListeners();
    };
  }, []);

  return {
    addListener,
    removeListener,
    removeAllListeners
  };
}

/**
 * Hook for managing auth/session listeners with cleanup
 */
export function useAuthListeners() {
  const { addListener } = useCleanupListeners();

  useEffect(() => {
    // Session storage listener for auth state changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token' || event.key === 'user_session') {
        // Log auth state change
        console.log('Auth session storage changed:', {
          key: event.key,
          oldValue: event.oldValue?.substring(0, 10) + '...',
          newValue: event.newValue?.substring(0, 10) + '...',
          type: 'storage_change'
        });
        
        // You could trigger a re-authentication check here
        // window.location.reload();
      }
    };

    // Session expiry listener
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Clean up any pending operations
      if (window.navigator.sendBeacon) {
        window.navigator.sendBeacon('/api/session/cleanup', JSON.stringify({
          action: 'page_unload',
          timestamp: Date.now()
        }));
      }
    };

    // Visibility change listener for session management
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden
        console.log('Page visibility changed to hidden');
      } else {
        // Page is now visible - check session validity
        console.log('Page visibility changed to visible');
      }
    };

    // Add listeners with automatic cleanup
    const cleanupStorage = addListener(window, 'storage', handleStorageChange, undefined, 'auth_storage');
    const cleanupBeforeUnload = addListener(window, 'beforeunload', handleBeforeUnload, undefined, 'auth_beforeunload');
    const cleanupVisibility = addListener(document, 'visibilitychange', handleVisibilityChange, undefined, 'auth_visibility');

    // Return cleanup function
    return () => {
      cleanupStorage();
      cleanupBeforeUnload();
      cleanupVisibility();
    };
  }, [addListener]);
}

/**
 * Hook for managing network connectivity listeners
 */
export function useNetworkListeners() {
  const { addListener } = useCleanupListeners();

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored', {
        type: 'network_online',
        timestamp: Date.now(),
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      });
    };

    const handleOffline = () => {
      console.warn('Network connection lost', {
        type: 'network_offline',
        timestamp: Date.now()
      });
    };

    // Add network listeners
    const cleanupOnline = addListener(window, 'online', handleOnline, undefined, 'network_online');
    const cleanupOffline = addListener(window, 'offline', handleOffline, undefined, 'network_offline');

    return () => {
      cleanupOnline();
      cleanupOffline();
    };
  }, [addListener]);
}

/**
 * Hook for managing memory/performance listeners
 */
export function usePerformanceListeners() {
  const { addListener } = useCleanupListeners();

  useEffect(() => {
    // Memory warning listener (Chrome/Edge)
    const handleMemoryWarning = (event: any) => {
      console.error('Memory warning detected', {
        type: 'memory_warning',
        memoryInfo: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null,
        timestamp: Date.now()
      });
    };

    // Page lifecycle events
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from cache
        console.log('Page restored from cache');
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      console.log('Page being hidden/cached');
    };

    // Add performance listeners
    let cleanupMemory: (() => void) | null = null;
    if ('memory' in performance) {
      cleanupMemory = addListener(window, 'memorywarning' as any, handleMemoryWarning, undefined, 'memory_warning');
    }

    const cleanupPageShow = addListener(window, 'pageshow', handlePageShow, undefined, 'page_show');
    const cleanupPageHide = addListener(window, 'pagehide', handlePageHide, undefined, 'page_hide');

    return () => {
      if (cleanupMemory) cleanupMemory();
      cleanupPageShow();
      cleanupPageHide();
    };
  }, [addListener]);
}

/**
 * Comprehensive hook that sets up all standard app listeners
 */
export function useAppListeners() {
  useAuthListeners();
  useNetworkListeners();
  usePerformanceListeners();
}