import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingBag, Search } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "My Wishlist - Opshop Online";
  }, []);

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: number) => 
      apiRequest("DELETE", `/api/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Opshop Online</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-accent" />
            <h1 className="text-4xl font-bold mb-4">Save Your Favorite Items</h1>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Sign in to create your wishlist and never lose track of items you love.
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              <Heart className="mr-2 h-5 w-5" />
              Sign In to Save Items
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Why Create a Wishlist?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
                <p className="text-gray-600">
                  Keep track of items you love and want to buy later
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Get Notified</h3>
                <p className="text-gray-600">
                  Receive alerts when similar items become available
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quick Purchase</h3>
                <p className="text-gray-600">
                  Buy your saved items quickly before they're gone
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Heart className="mr-3 h-8 w-8 text-primary" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-2">
                {Array.isArray(wishlistItems) ? wishlistItems.length : 0} saved items
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : Array.isArray(wishlistItems) && wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="relative">
                  <ProductCard product={item.product} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white"
                    onClick={() => removeFromWishlistMutation.mutate(item.product.id)}
                    disabled={removeFromWishlistMutation.isPending}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start browsing and save items you love by clicking the heart icon on any product.
              </p>
              <Link href="/">
                <Button size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}