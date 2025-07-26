import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }

    if (!isLoading && isAuthenticated && allowedRoles.length > 0) {
      if (!user?.role || !allowedRoles.includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, requireAuth, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to login...</h1>
          <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && (!user?.role || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
