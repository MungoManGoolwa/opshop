import { Heart, ShoppingCart, MapPin, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { Product } from "@shared/schema";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4a1 1 0 00-1-1H7a1 1 0 00-1 1v4a1 1 0 001 1h10a1 1 0 001-1V9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product) => (
        <ProductListItem key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductListItem({ product }: { product: Product }) {
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

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlistMutation.mutate();
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/checkout?productId=${product.id}`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
      case "like new":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "fair":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle array of images or single image
  const images = Array.isArray(product.images) ? product.images : [];
  const mainImage = images.length > 0 
    ? images[0] 
    : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300";

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border p-6">
        <div className="flex space-x-6">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <img
              src={mainImage}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300";
              }}
            />
            <Badge className={`absolute top-2 left-2 ${getConditionColor(product.condition)} text-white text-xs`}>
              {product.condition}
            </Badge>
          </div>

          {/* Product Details */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={handleWishlistClick}
                  disabled={addToWishlistMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-current" : "text-gray-400"}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0"
                  onClick={handleCartClick}
                >
                  <ShoppingCart className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  {product.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {product.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {product.views || 0} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                  {product.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                {product.shippingCost && parseFloat(product.shippingCost) > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    + ${product.shippingCost} shipping
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}