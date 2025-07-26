import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: product.id });
    },
    onSuccess: () => {
      setIsLiked(true);
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
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
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
    
    addToWishlistMutation.mutate();
  };

  const mainImage = product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300";

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
        <div className="relative">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Button
            size="sm"
            variant="outline"
            className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/90 hover:bg-gray-50"
            onClick={handleWishlistClick}
            disabled={addToWishlistMutation.isPending}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-current" : "text-gray-400"}`} />
          </Button>
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
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{product.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>4.8</span>
            </div>
          </div>
          
          {product.views !== undefined && (
            <div className="mt-2 text-xs text-gray-500">
              {product.views} views • {product.likes || 0} likes
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
