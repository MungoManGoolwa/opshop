import { useAuth } from "./useAuth";

type UserRole = "admin" | "moderator" | "seller" | "business" | "customer";

interface PermissionConfig {
  roles: UserRole[];
  requireAuth?: boolean;
}

const permissions = {
  // Admin permissions
  viewAdminDashboard: { roles: ["admin"], requireAuth: true },
  manageUsers: { roles: ["admin"], requireAuth: true },
  manageProducts: { roles: ["admin", "moderator"], requireAuth: true },
  viewAnalytics: { roles: ["admin", "moderator"], requireAuth: true },
  manageBuyback: { roles: ["admin", "moderator"], requireAuth: true },
  siteSettings: { roles: ["admin"], requireAuth: true },
  
  // Seller permissions
  viewSellerDashboard: { roles: ["admin", "moderator", "seller", "business"], requireAuth: true },
  createListings: { roles: ["admin", "moderator", "seller", "business"], requireAuth: true },
  manageOwnListings: { roles: ["admin", "moderator", "seller", "business"], requireAuth: true },
  viewSales: { roles: ["admin", "moderator", "seller", "business"], requireAuth: true },
  
  // Customer permissions
  addToWishlist: { roles: ["admin", "moderator", "seller", "business", "customer"], requireAuth: true },
  addToCart: { roles: ["admin", "moderator", "seller", "business", "customer"], requireAuth: true },
  viewProfile: { roles: ["admin", "moderator", "seller", "business", "customer"], requireAuth: true },
  
  // Public permissions
  viewProducts: { roles: ["admin", "moderator", "seller", "business", "customer"], requireAuth: false },
  search: { roles: ["admin", "moderator", "seller", "business", "customer"], requireAuth: false },
} as const;

type PermissionKey = keyof typeof permissions;

export function usePermissions() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasPermission = (permission: PermissionKey): boolean => {
    const config = permissions[permission];
    
    // If loading, assume no permission
    if (isLoading) return false;
    
    // Check authentication requirement
    if (config.requireAuth && !isAuthenticated) return false;
    
    // If no auth required and no user, allow
    if (!config.requireAuth && !user) return true;
    
    // Check role permission
    if (user && 'role' in user) {
      return config.roles.includes((user as any).role as UserRole);
    }
    
    return false;
  };

  const canAccess = (roles: UserRole[], requireAuth = true): boolean => {
    if (isLoading) return false;
    if (requireAuth && !isAuthenticated) return false;
    if (!requireAuth && !user) return true;
    if (user && 'role' in user) return roles.includes((user as any).role as UserRole);
    return false;
  };

  return {
    hasPermission,
    canAccess,
    isAdmin: user && 'role' in user ? (user as any).role === "admin" : false,
    isModerator: user && 'role' in user ? (user as any).role === "moderator" : false,
    isSeller: user && 'role' in user ? ((user as any).role === "seller" || (user as any).role === "business") : false,
    isCustomer: user && 'role' in user ? (user as any).role === "customer" : false,
    userRole: user && 'role' in user ? (user as any).role : undefined,
  };
}