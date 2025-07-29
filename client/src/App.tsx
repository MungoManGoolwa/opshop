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
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import ProductDetail from "@/pages/product-detail";
import SellerDashboard from "@/pages/seller-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminBuyback from "@/pages/admin-buyback";
import SiteAdmin from "@/pages/site-admin";
import InstantBuyback from "@/pages/instant-buyback";
import Messages from "@/pages/messages";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import ShopUpgrade from "@/pages/shop-upgrade";
import ShopUpgradeSuccess from "@/pages/shop-upgrade-success";
import LoginSuccess from "@/pages/login-success";
import LoginManual from "@/pages/login-manual";
import Category from "@/pages/category";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";
import Wallet from "@/pages/wallet";
import Search from "@/pages/search";
import Sell from "@/pages/sell";
import Wishlist from "@/pages/wishlist";
import HelpCenter from "@/pages/help-center";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import PricingGuide from "@/pages/pricing-guide";
import SafetyGuidelines from "@/pages/safety-guidelines";
import GuestCheckout from "@/pages/guest-checkout";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();
  useScrollToTop(); // Automatically scroll to top on route changes
  useAnalytics(); // Track page views for Google Analytics

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
          <Route path="/about" component={About} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/instant-buyback" component={InstantBuyback} />
          <Route path="/search" component={Search} />
          <Route path="/sell" component={Sell} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/cart" component={Cart} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/pricing-guide" component={PricingGuide} />
          <Route path="/safety-guidelines" component={SafetyGuidelines} />
          <Route path="/guest-checkout" component={GuestCheckout} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/checkout">
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          </Route>
          <Route path="/shop-upgrade">
            <PrivateRoute role="seller">
              <ShopUpgrade />
            </PrivateRoute>
          </Route>
          <Route path="/shop-upgrade/success">
            <PrivateRoute role="seller">
              <ShopUpgradeSuccess />
            </PrivateRoute>
          </Route>
          <Route path="/seller/dashboard">
            <PrivateRoute role="seller">
              <SellerDashboard />
            </PrivateRoute>
          </Route>
          <Route path="/seller/create">
            <PrivateRoute role="seller">
              <CreateListing />
            </PrivateRoute>
          </Route>
          <Route path="/admin/dashboard">
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          </Route>
          <Route path="/admin/users">
            <PrivateRoute role="admin">
              <AdminUsers />
            </PrivateRoute>
          </Route>
          <Route path="/admin/buyback">
            <PrivateRoute role="admin">
              <AdminBuyback />
            </PrivateRoute>
          </Route>
          <Route path="/admin/site">
            <PrivateRoute role="admin">
              <SiteAdmin />
            </PrivateRoute>
          </Route>
          <Route path="/instant-buyback" component={InstantBuyback} />
          <Route path="/messages">
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          </Route>
          <Route path="/profile">
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          </Route>
          <Route path="/wallet">
            <PrivateRoute>
              <Wallet />
            </PrivateRoute>
          </Route>
          <Route path="/search" component={Search} />
          <Route path="/sell" component={Sell} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/cart" component={Cart} />
          <Route path="/help-center" component={HelpCenter} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/pricing-guide" component={PricingGuide} />
          <Route path="/safety-guidelines" component={SafetyGuidelines} />
        </>
      )}
      <Route component={NotFound} />
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
