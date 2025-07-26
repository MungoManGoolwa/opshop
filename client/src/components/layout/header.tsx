import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Recycle,
  HelpCircle,
  Store,
  UserCircle
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

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
        return "/admin/dashboard";
      case "seller":
      case "business":
        return "/seller/dashboard";
      case "customer":
      default:
        return "/profile"; // Default customer profile page
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-primary font-medium">🇦🇺 Australian Marketplace</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-primary">
              <HelpCircle className="inline h-4 w-4 mr-1" />
              Help
            </Link>
            {isAuthenticated && ((user as any)?.role === 'seller' || (user as any)?.role === 'business' || (user as any)?.role === 'admin') && (
              <Link href="/seller/dashboard" className="text-gray-600 hover:text-primary">
                <Store className="inline h-4 w-4 mr-1" />
                Sell
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">
                  {(user as any)?.firstName || "User"}
                </span>
                <button 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-gray-600 hover:text-primary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => window.location.href = "/api/login"}
                className="text-gray-600 hover:text-primary"
              >
                <User className="inline h-4 w-4 mr-1" />
                Login
              </button>
            )}
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">Opshop</span>
              <span className="text-lg text-secondary font-medium">Online</span>
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
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
            </Button>
            {isAuthenticated ? (
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
                  <span className="hidden lg:block">
                    {(user as any)?.firstName || "User"}
                  </span>
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                size="sm"
              >
                Login
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
  );
}
