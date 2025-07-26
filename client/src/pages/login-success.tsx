import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginSuccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate auth query to refetch user data
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // Redirect to home after a brief delay
    const timer = setTimeout(() => {
      setLocation("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [queryClient, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Login Successful!</h2>
        <p className="text-gray-600">Redirecting you to the marketplace...</p>
      </div>
    </div>
  );
}