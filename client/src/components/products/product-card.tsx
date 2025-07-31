import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomImage } from "@/components/ui/zoom-image";
import { Heart, MapPin, Star, ShoppingCart } from "lucide-react";
import { QuickShareButtons } from "@/components/social/QuickShareButtons";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Fetch user's wishlist to check if this product is liked
  const { data: wishlist } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  // Check if product is in wishlist
  useEffect(() => {
    if (wishlist && Array.isArray(wishlist)) {
      const isInWishlist = wishlist.some((item: any) => item.productId === product.id);
      setIsLiked(isInWishlist);
    }
  }, [wishlist, product.id]);

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`, {});
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: product.id });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Removed from Wishlist" : "Added to Wishlist",
        description: isLiked ? "Item removed from your wishlist." : "Item added to your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "Please log in to manage your wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      // Redirect to checkout page with product details
      window.location.href = `/checkout?productId=${product.id}`;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
      case "like new":
        return "bg-success";
      case "good":
        return "bg-warning";
      case "fair":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your wishlist.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    
    addToWishlistMutation.mutate();
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase items.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    
    addToCartMutation.mutate();
  };

  const mainImage = product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300";

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <div className="relative overflow-hidden rounded-t-lg">
          <ZoomImage
            src={mainImage}
            alt={`${product.title} - $${product.price} in ${product.condition} condition from ${product.location}`}
            className="w-full h-48"
            enableHoverZoom={true}
            enableClickZoom={false}
            zoomScale={1.2}
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-white/90 hover:bg-gray-50"
              onClick={handleWishlistClick}
              disabled={addToWishlistMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-current" : "text-gray-400"}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-white/90 hover:bg-gray-50"
              onClick={handleCartClick}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
          <Badge className={`absolute top-3 left-3 ${getConditionColor(product.condition)} text-white text-xs`}>
            {product.condition}
          </Badge>
          {product.isVerified && (
            <Badge className="absolute bottom-3 left-3 bg-accent text-white text-xs">
              ✓ Verified
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-1">{product.title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                Was ${product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{product.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>4.8</span>
            </div>
          </div>
          
          {/* Seller Information */}
          {(product as any).sellerName && (
            <div className="text-xs text-gray-600 mb-2">
              Sold by <span className="font-medium text-gray-800">{(product as any).sellerName}</span>
            </div>
          )}
          
          {product.views !== undefined && (
            <div className="mt-2 text-xs text-gray-500">
              {product.views} views • {product.likes || 0} likes
            </div>
          )}
          
          {/* Social Share Buttons */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Share this item</span>
            <QuickShareButtons
              title={product.title}
              description={product.description || ""}
              price={`$${product.price}`}
              url={`/product/${product.id}`}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
