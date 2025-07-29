import { useAuth } from "@/hooks/useAuth";

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "moderator" | "seller" | "business" | "customer">;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export default function RoleBasedAccess({ 
  children, 
  allowedRoles, 
  fallback = null,
  requireAuth = true 
}: RoleBasedAccessProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />;
  }

  // Check authentication if required
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  // Check role permissions
  if (user && 'role' in user && allowedRoles.includes((user as any).role)) {
    return <>{children}</>;
  }

  return fallback;
}