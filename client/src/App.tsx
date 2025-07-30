import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { ErrorBoundary } from "@/components/error-boundary";
import { ViewProvider } from "@/contexts/ViewContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import PrivateRoute from "@/components/auth/PrivateRoute";
import LazyRoute from "@/components/LazyRoute";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { preloadCriticalRoutes, preloadAuthenticatedRoutes, preloadAdminRoutes, preloadSellerRoutes } from "./utils/preloadRoutes";

// Critical pages - loaded immediately
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

// Lazy loaded pages - split into separate bundles
const About = lazy(() => import("@/pages/about"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const SellerDashboard = lazy(() => import("@/pages/seller-dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminBuyback = lazy(() => import("@/pages/admin-buyback"));
const SiteAdmin = lazy(() => import("@/pages/site-admin"));
const InstantBuyback = lazy(() => import("@/pages/instant-buyback"));
const Messages = lazy(() => import("@/pages/messages"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const ShopUpgrade = lazy(() => import("@/pages/shop-upgrade"));
const ShopUpgradeSuccess = lazy(() => import("@/pages/shop-upgrade-success"));
const LoginSuccess = lazy(() => import("@/pages/login-success"));
const LoginManual = lazy(() => import("@/pages/login-manual"));
const Category = lazy(() => import("@/pages/category"));
const CreateListing = lazy(() => import("@/pages/create-listing"));
const Profile = lazy(() => import("@/pages/profile"));
const Wallet = lazy(() => import("@/pages/wallet"));
const Search = lazy(() => import("@/pages/search"));
const Sell = lazy(() => import("@/pages/sell"));
const Wishlist = lazy(() => import("@/pages/wishlist"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const Contact = lazy(() => import("@/pages/contact"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PricingGuide = lazy(() => import("@/pages/pricing-guide"));
const SafetyGuidelines = lazy(() => import("@/pages/safety-guidelines"));
const GuestCheckout = lazy(() => import("@/pages/guest-checkout"));

function Router() {
  const { isAuthenticated, isLoading, error, user } = useAuth();
  useScrollToTop(); // Automatically scroll to top on route changes
  useAnalytics(); // Track page views for Google Analytics

  // Preload routes based on user status
  useEffect(() => {
    if (!isLoading) {
      preloadCriticalRoutes();
      
      if (isAuthenticated && user) {
        preloadAuthenticatedRoutes();
        
        // Preload role-specific routes
        if ('role' in user) {
          const userRole = (user as any).role;
          if (userRole === "admin") {
            preloadAdminRoutes();
          } else if (userRole === "seller" || userRole === "business") {
            preloadSellerRoutes();
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Always show landing page if not authenticated to prevent white screen
  if (!isLoading && !isAuthenticated) {
    console.log("Not authenticated, showing landing page");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Opshop Online</h2>
          <p className="text-sm opacity-80">Australia's sustainable marketplace</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginManual} />
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/about">
            <LazyRoute><About /></LazyRoute>
          </Route>
          <Route path="/category/:slug">
            <LazyRoute><Category /></LazyRoute>
          </Route>
          <Route path="/product/:id">
            <LazyRoute skeleton="product"><ProductDetail /></LazyRoute>
          </Route>
          <Route path="/instant-buyback">
            <LazyRoute><InstantBuyback /></LazyRoute>
          </Route>
          <Route path="/search">
            <LazyRoute><Search /></LazyRoute>
          </Route>
          <Route path="/sell">
            <LazyRoute><Sell /></LazyRoute>
          </Route>
          <Route path="/wishlist">
            <LazyRoute><Wishlist /></LazyRoute>
          </Route>
          <Route path="/cart">
            <LazyRoute><Cart /></LazyRoute>
          </Route>
          <Route path="/help-center">
            <LazyRoute><HelpCenter /></LazyRoute>
          </Route>
          <Route path="/contact">
            <LazyRoute><Contact /></LazyRoute>
          </Route>
          <Route path="/privacy-policy">
            <LazyRoute><PrivacyPolicy /></LazyRoute>
          </Route>
          <Route path="/terms-of-service">
            <LazyRoute><TermsOfService /></LazyRoute>
          </Route>
          <Route path="/pricing-guide">
            <LazyRoute><PricingGuide /></LazyRoute>
          </Route>
          <Route path="/safety-guidelines">
            <LazyRoute><SafetyGuidelines /></LazyRoute>
          </Route>
          <Route path="/guest-checkout">
            <LazyRoute><GuestCheckout /></LazyRoute>
          </Route>
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/about">
            <LazyRoute><About /></LazyRoute>
          </Route>
          <Route path="/category/:slug">
            <LazyRoute><Category /></LazyRoute>
          </Route>
          <Route path="/product/:id">
            <LazyRoute skeleton="product"><ProductDetail /></LazyRoute>
          </Route>
          <Route path="/checkout">
            <PrivateRoute>
              <LazyRoute><Checkout /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/shop-upgrade">
            <PrivateRoute role="seller">
              <LazyRoute><ShopUpgrade /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/shop-upgrade/success">
            <PrivateRoute role="seller">
              <LazyRoute><ShopUpgradeSuccess /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/seller/dashboard">
            <PrivateRoute role="seller">
              <LazyRoute><SellerDashboard /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/seller/create">
            <PrivateRoute role="seller">
              <LazyRoute skeleton="listing"><CreateListing /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/admin/dashboard">
            <PrivateRoute role="admin">
              <LazyRoute skeleton="admin"><AdminDashboard /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/admin/users">
            <PrivateRoute role="admin">
              <LazyRoute skeleton="admin"><AdminUsers /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/admin/buyback">
            <PrivateRoute role="admin">
              <LazyRoute skeleton="admin"><AdminBuyback /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/admin/site">
            <PrivateRoute role="admin">
              <LazyRoute skeleton="admin"><SiteAdmin /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/instant-buyback">
            <LazyRoute><InstantBuyback /></LazyRoute>
          </Route>
          <Route path="/messages">
            <PrivateRoute>
              <LazyRoute><Messages /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/profile">
            <PrivateRoute>
              <LazyRoute><Profile /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/wallet">
            <PrivateRoute>
              <LazyRoute><Wallet /></LazyRoute>
            </PrivateRoute>
          </Route>
          <Route path="/search">
            <LazyRoute><Search /></LazyRoute>
          </Route>
          <Route path="/sell">
            <LazyRoute><Sell /></LazyRoute>
          </Route>
          <Route path="/wishlist">
            <LazyRoute><Wishlist /></LazyRoute>
          </Route>
          <Route path="/cart">
            <LazyRoute><Cart /></LazyRoute>
          </Route>
          <Route path="/help-center">
            <LazyRoute><HelpCenter /></LazyRoute>
          </Route>
          <Route path="/contact">
            <LazyRoute><Contact /></LazyRoute>
          </Route>
          <Route path="/privacy-policy">
            <LazyRoute><PrivacyPolicy /></LazyRoute>
          </Route>
          <Route path="/terms-of-service">
            <LazyRoute><TermsOfService /></LazyRoute>
          </Route>
          <Route path="/pricing-guide">
            <LazyRoute><PricingGuide /></LazyRoute>
          </Route>
          <Route path="/safety-guidelines">
            <LazyRoute><SafetyGuidelines /></LazyRoute>
          </Route>
        </>
      )}
      {/* Wildcard catch-all route for unknown paths */}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ViewProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
            <PWAInstallPrompt />
            <OfflineIndicator />
          </TooltipProvider>
        </ViewProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
