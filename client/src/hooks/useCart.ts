import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

// Generate or get guest session ID
function getGuestSessionId(): string {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [guestSessionId] = useState(getGuestSessionId);

  // Fetch authenticated user cart
  const { data: userCartItems = [], isLoading: userCartLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Fetch guest cart
  const { data: guestCartItems = [], isLoading: guestCartLoading } = useQuery({
    queryKey: [`/api/guest-cart/${guestSessionId}`],
    enabled: !isAuthenticated,
  });

  // Get cart count for header badge
  const { data: guestCartCount = 0 } = useQuery({
    queryKey: [`/api/guest-cart/${guestSessionId}/count`],
    enabled: !isAuthenticated,
  });

  const cartItems = isAuthenticated ? userCartItems : guestCartItems;
  const isLoading = isAuthenticated ? userCartLoading : guestCartLoading;
  const cartCount = isAuthenticated 
    ? (userCartItems as any[]).reduce((sum: number, item: any) => sum + item.quantity, 0)
    : guestCartCount;

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      if (isAuthenticated) {
        return apiRequest("POST", "/api/cart", { productId, quantity });
      } else {
        return apiRequest("POST", "/api/guest-cart", { 
          sessionId: guestSessionId, 
          productId, 
          quantity 
        });
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}/count`] });
      }
      toast({ 
        title: "Added to cart", 
        description: "Item added to your cart successfully" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add item to cart", 
        variant: "destructive" 
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (isAuthenticated) {
        return apiRequest("DELETE", `/api/cart/${productId}`);
      } else {
        return apiRequest("DELETE", `/api/guest-cart/${guestSessionId}/${productId}`);
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}/count`] });
      }
      toast({ 
        title: "Item removed", 
        description: "Item removed from cart" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to remove item from cart", 
        variant: "destructive" 
      });
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, cartItemId, quantity }: { 
      productId: number; 
      cartItemId?: number; 
      quantity: number 
    }) => {
      if (isAuthenticated && cartItemId) {
        return apiRequest("PATCH", `/api/cart/${cartItemId}`, { quantity });
      } else {
        return apiRequest("PATCH", `/api/guest-cart/${guestSessionId}/${productId}`, { quantity });
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}/count`] });
      }
      toast({ 
        title: "Cart updated", 
        description: "Item quantity updated successfully" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update quantity", 
        variant: "destructive" 
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return apiRequest("DELETE", "/api/cart");
      } else {
        return apiRequest("DELETE", `/api/guest-cart/${guestSessionId}`);
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}/count`] });
      }
      toast({ 
        title: "Cart cleared", 
        description: "All items removed from cart" 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to clear cart", 
        variant: "destructive" 
      });
    },
  });

  // Convert guest cart to user cart on login
  const convertGuestCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/guest-cart/convert", { guestSessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/guest-cart/${guestSessionId}/count`] });
      localStorage.removeItem('guest_session_id'); // Clear guest session
      toast({ 
        title: "Cart transferred", 
        description: "Your cart items have been transferred to your account" 
      });
    },
    onError: (error: any) => {
      console.error("Failed to convert guest cart:", error);
    },
  });

  // Auto-convert guest cart when user logs in
  useEffect(() => {
    if (isAuthenticated && (guestCartItems as any[]).length > 0) {
      convertGuestCartMutation.mutate();
    }
  }, [isAuthenticated, (guestCartItems as any[]).length]);

  return {
    cartItems,
    cartCount,
    isLoading,
    guestSessionId: isAuthenticated ? null : guestSessionId,
    
    // Actions
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,
    
    // Loading states
    isAdding: addToCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}