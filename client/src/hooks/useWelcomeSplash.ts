import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const WELCOME_SPLASH_KEY = "opshop-welcome-splash-shown";
const LAST_VISIT_KEY = "lastVisit";
const SPLASH_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useWelcomeSplash() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    const userId = (user as any)?.id;
    if (!userId) return;

    const userSplashKey = `${WELCOME_SPLASH_KEY}-${userId}`;
    const userLastVisitKey = `${LAST_VISIT_KEY}-${userId}`;
    
    const lastSplashShown = localStorage.getItem(userSplashKey);
    const lastVisit = localStorage.getItem(userLastVisitKey);
    const now = new Date().getTime();

    // Set current time as last visit for next time
    localStorage.setItem(userLastVisitKey, now.toString());

    // Show splash if:
    // 1. Never shown for this user, OR
    // 2. Last shown more than 24 hours ago, OR  
    // 3. It's been more than 2 hours since last visit
    const shouldShowSplash = 
      !lastSplashShown || 
      (now - parseInt(lastSplashShown) > SPLASH_COOLDOWN) ||
      (lastVisit && (now - parseInt(lastVisit) > 2 * 60 * 60 * 1000)); // 2 hours

    if (shouldShowSplash) {
      // Add a small delay to let the page load
      const timer = setTimeout(() => {
        setShowSplash(true);
        localStorage.setItem(userSplashKey, now.toString());
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, isLoading]);

  const closeSplash = () => {
    setShowSplash(false);
  };

  return {
    showSplash,
    closeSplash,
  };
}