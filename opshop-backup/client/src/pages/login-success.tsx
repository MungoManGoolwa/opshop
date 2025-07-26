import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginSuccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Invalidate auth query to refetch user data
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queryClient, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral">
      <div className="text-center">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Login Successful!</h2>
        <p className="text-gray-600 mb-4">Welcome to Opshop Online marketplace</p>
        <p className="text-sm text-gray-500">Redirecting to home in {countdown} seconds...</p>
      </div>
    </div>
  );
}