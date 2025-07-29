import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Minus, ShoppingCart, Heart, Bookmark, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import Breadcrumbs from "@/components/navigation/breadcrumbs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";

interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    title: string;
    price: string;
    images: string[];
    condition: string;
    sellerId: string;
  };
}

interface SavedItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  savedFromCart: boolean;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    title: string;
    price: string;
    images: string[];
    condition: string;
    sellerId: string;
  };
}

export default function Cart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("cart");
  const abandonmentTrackedRef = useRef(false);
  
  // Use unified cart hook for both authenticated and guest users
  const { cartItems, isLoading: cartLoading, cartCount, guestSessionId } = useCart();

  // For authenticated users, also fetch saved items
  const { data: savedItems = [], isLoading: savedLoading } = useQuery({
    queryKey: ["/api/saved-items"],
    enabled: isAuthenticated,
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${cartItemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Cart updated", description: "Item quantity updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update quantity", variant: "destructive" });
    },
  });

  // Remove from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Item removed", description: "Item removed from cart" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    },
  });

  // Save for later
  const saveForLaterMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", `/api/cart/${productId}/save-for-later`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
      toast({ title: "Item saved", description: "Item saved for later" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save item", variant: "destructive" });
    },
  });

  // Move to cart from saved
  const moveToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", `/api/saved-items/${productId}/move-to-cart`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
      toast({ title: "Item moved", description: "Item moved to cart" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to move item", variant: "destructive" });
    },
  });

  // Remove saved item
  const removeSavedMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/saved-items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
      toast({ title: "Item removed", description: "Saved item removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove saved item", variant: "destructive" });
    },
  });

  // Track cart abandonment
  const trackAbandonmentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/track-abandonment");
    },
    onError: (error) => {
      console.error("Failed to track cart abandonment:", error);
    },
  });

  // Mark cart as recovered when user proceeds to checkout
  const markRecoveredMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/mark-recovered");
    },
    onError: (error) => {
      console.error("Failed to mark cart as recovered:", error);
    },
  });

  // Track cart abandonment when user navigates away with items in cart
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && cartItems.length > 0 && !abandonmentTrackedRef.current) {
        // Track abandonment when user closes tab/navigates away
        navigator.sendBeacon('/api/cart/track-abandonment', JSON.stringify({}));
        abandonmentTrackedRef.current = true;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated && cartItems.length > 0 && !abandonmentTrackedRef.current) {
        // Track abandonment when user switches tabs
        trackAbandonmentMutation.mutate();
        abandonmentTrackedRef.current = true;
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, cartItems.length, trackAbandonmentMutation]);

  // Reset abandonment tracking when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0) {
      abandonmentTrackedRef.current = false;
    }
  }, [cartItems.length]);

  // Function to handle proceeding to checkout (marks cart as recovered)
  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      markRecoveredMutation.mutate();
      // Navigate to checkout page
      window.location.href = '/checkout';
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total: number, item: CartItem) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shopping Cart", href: "/cart" }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading your cart...</h2>
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
            <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-accent" />
            <h1 className="text-4xl font-bold mb-4">Your Shopping Cart</h1>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Sign in to access your cart and saved items.
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sign In to Shop
            </Button>
          </div>
        </section>
        
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const CartItemCard = ({ item }: { item: CartItem }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={item.product.images?.[0] || "/placeholder.svg"}
              alt={item.product.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.product.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                {item.product.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.product.condition}
              </Badge>
            </div>
            <p className="text-lg font-bold text-primary mt-2">
              {formatPrice(parseFloat(item.product.price))}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantityMutation.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                disabled={updateQuantityMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveForLaterMutation.mutate(item.product.id)}
                disabled={saveForLaterMutation.isPending}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromCartMutation.mutate(item.product.id)}
                disabled={removeFromCartMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SavedItemCard = ({ item }: { item: SavedItem }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={item.product.images?.[0] || "/placeholder.svg"}
              alt={item.product.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.product.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                {item.product.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.product.condition}
              </Badge>
              {item.savedFromCart && (
                <Badge variant="outline" className="text-xs">
                  Saved from cart
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold text-primary mt-2">
              {formatPrice(parseFloat(item.product.price))}
            </p>
            <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => moveToCartMutation.mutate(item.product.id)}
              disabled={moveToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Move to Cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeSavedMutation.mutate(item.product.id)}
              disabled={removeSavedMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">Review your items and save for later</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cart" className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartItems.length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center">
                <Bookmark className="h-4 w-4 mr-2" />
                Saved for Later ({savedItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cart" className="mt-6">
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {cartLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : cartItems.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-600 mb-6">
                          Browse our sustainable marketplace to find amazing pre-loved items.
                        </p>
                        <Button asChild>
                          <Link href="/">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Start Shopping
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div>
                      {cartItems.map((item: CartItem) => (
                        <CartItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Items ({cartItems.length})</span>
                          <span>{formatPrice(calculateTotal())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="text-green-600">Calculated at checkout</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatPrice(calculateTotal())}</span>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleProceedToCheckout}
                        >
                          Proceed to Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          Shipping and taxes calculated at checkout
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              {savedLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : savedItems.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bookmark className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved items</h3>
                    <p className="text-gray-600 mb-6">
                      Items you save for later will appear here.
                    </p>
                    <Button asChild>
                      <Link href="/">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-w-4xl">
                  {savedItems.map((item: SavedItem) => (
                    <SavedItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}