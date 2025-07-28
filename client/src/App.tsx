import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/error-boundary";
import { ViewProvider } from "@/contexts/ViewContext";
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

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();

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
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/shop-upgrade" component={ShopUpgrade} />
          <Route path="/shop-upgrade/success" component={ShopUpgradeSuccess} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/create" component={CreateListing} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/buyback" component={AdminBuyback} />
          <Route path="/admin/site" component={SiteAdmin} />
          <Route path="/instant-buyback" component={InstantBuyback} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile" component={Profile} />
          <Route path="/wallet" component={Wallet} />
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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ViewProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ViewProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
