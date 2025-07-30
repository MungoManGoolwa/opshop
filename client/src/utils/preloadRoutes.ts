// Preload critical routes for better user experience
export const preloadCriticalRoutes = () => {
  // Preload most commonly accessed pages after initial load
  setTimeout(() => {
    import("@/pages/product-detail");
    import("@/pages/search");
    import("@/pages/category");
  }, 2000);
};

// Preload authenticated routes when user is logged in
export const preloadAuthenticatedRoutes = () => {
  setTimeout(() => {
    import("@/pages/profile");
    import("@/pages/cart");
    import("@/pages/wishlist");
    import("@/pages/messages");
  }, 1000);
};

// Preload admin routes for admin users
export const preloadAdminRoutes = () => {
  setTimeout(() => {
    import("@/pages/admin-dashboard");
    import("@/pages/admin-users");
    import("@/pages/admin-buyback");
  }, 1000);
};

// Preload seller routes for seller users
export const preloadSellerRoutes = () => {
  setTimeout(() => {
    import("@/pages/seller-dashboard");
    import("@/pages/create-listing");
  }, 1000);
};