import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import PageSkeleton from "./PageSkeleton";

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: "default" | "admin" | "product" | "listing";
}

export default function LazyRoute({ 
  children, 
  fallback, 
  skeleton = "default" 
}: LazyRouteProps) {
  const skeletonFallback = <PageSkeleton variant={skeleton} />;
  
  const finalFallback = fallback || skeletonFallback;

  return (
    <Suspense fallback={finalFallback}>
      {children}
    </Suspense>
  );
}