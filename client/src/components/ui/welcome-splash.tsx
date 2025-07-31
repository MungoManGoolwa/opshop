import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Heart, ShoppingCart, Store, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface WelcomeSplashProps {
  onClose: () => void;
}

export default function WelcomeSplash({ onClose }: WelcomeSplashProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Get user's quick stats
  const { data: wishlist } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getLastVisit = () => {
    const lastVisit = localStorage.getItem('lastVisit');
    if (lastVisit) {
      const date = new Date(lastVisit);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    }
    return "recently";
  };

  const quickActions = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: "Instant Buyback",
      href: "/instant-buyback",
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      description: "Get instant offers"
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: "Wishlist",
      href: "/wishlist",
      color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
      count: Array.isArray(wishlist) ? wishlist.length : 0
    },
    {
      icon: <Store className="h-4 w-4" />,
      label: "Browse Products",
      href: "/",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      description: "Find treasures"
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      label: "Wallet",
      href: "/wallet",
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      description: "Check balance"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              {(user as any)?.profileImageUrl ? (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" 
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {((user as any)?.firstName || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {getGreeting()}, {(user as any)?.firstName || "User"}! 👋
                </h2>
                <p className="text-sm text-gray-600">
                  Welcome back to Opshop Online
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Last visit: {getLastVisit()}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Badge variant="secondary" className="text-xs">
                {(user as any)?.accountType === 'admin' ? 'Administrator' : 
                 (user as any)?.accountType === 'seller' ? 'Seller' : 
                 (user as any)?.accountType === 'business' ? 'Business' : 'Customer'}
              </Badge>
              {Array.isArray(wishlist) && wishlist.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {wishlist.length} wishlist items
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    variant="ghost"
                    className={`w-full h-auto p-3 flex flex-col items-start space-y-1 ${action.color}`}
                    onClick={handleClose}
                  >
                    <div className="flex items-center space-x-2 w-full">
                      {action.icon}
                      <span className="text-xs font-medium flex-1 text-left">
                        {action.label}
                      </span>
                      {action.count && action.count > 0 && (
                        <Badge className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-xs opacity-75 text-left w-full">
                        {action.description}
                      </p>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleClose} className="w-full">
              Start Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}