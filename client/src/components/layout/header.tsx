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
    
    switch ((user as any)?.accountType) {
      case "admin":
        return "/admin/site";  // Site administrator with full access
      case "seller":
      case "shop":
        return "/seller/dashboard";
      case "buyer":
      default:
        return "/profile"; // Default buyer profile page
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
          <div className="flex items-center justify-between py-2 text-xs sm:text-sm border-b border-gray-100">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-primary font-medium flex items-center">
                <span className="mr-1">🇦🇺</span>
                <span className="hidden xs:inline">Australian Marketplace</span>
                <span className="xs:hidden">AU Marketplace</span>
              </span>
            </div>
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {isAuthenticated && (
              <Link href="/about" className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-gray-50" title="About Us">
                <HelpCircle className="h-4 w-4 sm:mr-1 md:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">About Us</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/instant-buyback" className="flex items-center justify-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200 p-1 rounded-md hover:bg-green-50" title="Instant Buyback">
                <Sparkles className="h-4 w-4 sm:mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Instant Buyback</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/wallet" className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-gray-50" title="Wallet">
                <CreditCard className="h-4 w-4 sm:mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Wallet</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/messages" className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-gray-50" title="Messages">
                <MessageCircle className="h-4 w-4 sm:mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Messages</span>
              </Link>
            )}
            {isAuthenticated && ((user as any)?.accountType === 'seller' || (user as any)?.accountType === 'shop' || (user as any)?.accountType === 'admin') && (
              <Link href="/seller/dashboard" className="flex items-center justify-center text-gray-600 hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-gray-50" title="Seller Dashboard">
                <Store className="h-4 w-4 sm:mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Sell</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-90 transition-opacity duration-200">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Recycle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary leading-none">Opshop</span>
                <span className="text-xs sm:text-sm md:text-lg text-secondary font-medium leading-none">Online</span>
              </div>
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
          
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative flex items-center justify-center p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
              onClick={handleWishlistClick}
              title="Wishlist"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden lg:inline ml-1 text-sm font-medium">Wishlist</span>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative flex items-center justify-center p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
              onClick={handleCartClick}
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden lg:inline ml-1 text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link href={getDashboardRoute()}>
                  <Button variant="ghost" size="sm" className="flex items-center justify-center space-x-1 sm:space-x-2 p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      {(user as any)?.profileImageUrl ? (
                        <img 
                          src={(user as any).profileImageUrl} 
                          alt="Profile" 
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
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
                className="flex items-center justify-center space-x-1 p-2 hover:bg-primary/90 transition-colors duration-200 rounded-lg"
                title="Login"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Login</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for second-hand treasures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
            <Button type="submit" size="sm" className="ml-2 px-3 py-2">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
    </>
  );
}
