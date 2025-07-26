import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import About from "@/pages/about";
import ProductDetail from "@/pages/product-detail";
import SellerDashboard from "@/pages/seller-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import Checkout from "@/pages/checkout";
import ShopUpgrade from "@/pages/shop-upgrade";
import ShopUpgradeSuccess from "@/pages/shop-upgrade-success";
import LoginSuccess from "@/pages/login-success";
import LoginManual from "@/pages/login-manual";
import Category from "@/pages/category";
import CreateListing from "@/pages/create-listing";
import Profile from "@/pages/profile";

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
          <Route path="/profile" component={Profile} />
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
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
