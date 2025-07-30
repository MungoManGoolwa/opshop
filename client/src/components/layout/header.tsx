import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Recycle,
  HelpCircle,
  Store,
  UserCircle,
  Sparkles,
  MessageCircle,
  CreditCard
} from "lucide-react";
import ImpersonationControl from "@/components/admin/impersonation-control";
import LogoutDropdown from "@/components/auth/logout-dropdown";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's wishlist for count
  const { data: wishlist } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const cartCount = 0; // For now, since we redirect to checkout directly

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const getDashboardRoute = () => {
    if (!user) return "/";
    
    switch ((user as any)?.role) {
      case "admin":
        return "/admin/site";  // Site administrator with full access
      case "seller":
      case "business":
        return "/seller/dashboard";
      case "customer":
      default:
        return "/profile"; // Default customer profile page
    }
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to view your wishlist.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    // Redirect directly to wishlist page
    window.location.href = "/wishlist";
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to view your cart.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    // Redirect directly to cart page
    window.location.href = "/cart";
  };

  return (
    <>
      {/* Impersonation Control - shown when admin is impersonating */}
      <ImpersonationControl />
      
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <span className="text-primary font-medium">🇦🇺 Australian Marketplace</span>
            </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Link href="/about" className="text-gray-600 hover:text-primary" title="About Us">
                <span className="hidden md:inline">About Us</span>
                <HelpCircle className="h-4 w-4 md:hidden" />
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/instant-buyback" className="text-green-600 hover:text-green-700 font-medium" title="Instant Buyback">
                <Sparkles className="h-4 w-4 mr-0 md:mr-1" />
                <span className="hidden md:inline">Instant Buyback</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/wallet" className="text-gray-600 hover:text-primary" title="Wallet">
                <CreditCard className="h-4 w-4 mr-0 md:mr-1" />
                <span className="hidden md:inline">Wallet</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/messages" className="text-gray-600 hover:text-primary" title="Messages">
                <MessageCircle className="h-4 w-4 mr-0 md:mr-1" />
                <span className="hidden md:inline">Messages</span>
              </Link>
            )}
            {isAuthenticated && ((user as any)?.role === 'seller' || (user as any)?.role === 'business' || (user as any)?.role === 'admin') && (
              <Link href="/seller/dashboard" className="text-gray-600 hover:text-primary" title="Seller Dashboard">
                <Store className="h-4 w-4 mr-0 md:mr-1" />
                <span className="hidden md:inline">Sell</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-1 md:space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-primary">Opshop</span>
              <span className="text-sm md:text-lg text-secondary font-medium">Online</span>
            </Link>
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="relative w-full flex">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for second-hand treasures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <Button type="submit" className="ml-2 bg-primary hover:bg-primary/90">
                  Search
                </Button>
              </form>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleWishlistClick}
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleCartClick}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href={getDashboardRoute()}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100">
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <span className="hidden md:inline">
                      Dashboard
                    </span>
                  </Button>
                </Link>
                <LogoutDropdown />
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                size="sm"
                title="Login"
              >
                <span className="hidden md:inline">Login</span>
                <User className="h-4 w-4 md:hidden" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for second-hand treasures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </form>
        </div>
      </div>
    </header>
    </>
  );
}
