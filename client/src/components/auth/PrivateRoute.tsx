import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: "admin" | "moderator" | "seller" | "business" | "customer";
  requireAuth?: boolean;
}

export default function PrivateRoute({ 
  children, 
  role, 
  requireAuth = true 
}: PrivateRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to log in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    // Check role requirement
    if (role && user && 'role' in user && (user as any).role !== role) {
      // Special handling for admin role - also allow moderators for some admin functions
      if (role === "admin" && (user as any).role === "moderator") {
        return; // Allow moderators to access some admin routes
      }

      toast({
        title: "Access Denied",
        description: `You need ${role} privileges to access this page.`,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, role, requireAuth, toast]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render if auth check failed
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if role check failed
  if (role && user && 'role' in user && (user as any).role !== role && !(role === "admin" && (user as any).role === "moderator")) {
    return null;
  }

  return <>{children}</>;
}