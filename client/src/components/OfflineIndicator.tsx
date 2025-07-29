import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, Wifi, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <Card 
        className={cn(
          "border shadow-lg backdrop-blur-sm transition-colors",
          isOnline 
            ? "border-green-200 bg-green-50/95 dark:border-green-800 dark:bg-green-950/95" 
            : "border-red-200 bg-red-50/95 dark:border-red-800 dark:bg-red-950/95"
        )}
      >
        <CardContent className="flex items-center gap-2 py-2 px-3">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Back online
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  You're offline
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}