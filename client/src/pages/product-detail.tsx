import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MapPin, 
  Star, 
  Truck, 
  Shield, 
  MessageCircle, 
  Eye,
  ArrowLeft,
  Share2
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    document.title = "Product Details - Opshop Online";
  }, []);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: id });
    },
    onSuccess: () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=600";

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

  const handleAddToWishlist = () => {
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

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className={`${getConditionColor(product.condition)} text-white`}>
                  {product.condition}
                </Badge>
                {product.isVerified && (
                  <Badge className="bg-accent text-white">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90"
                  onClick={() => {/* Share functionality */}}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90"
                  onClick={handleAddToWishlist}
                  disabled={addToWishlistMutation.isPending}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Thumbnail images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  Was ${product.originalPrice}
                </span>
              )}
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.brand && (
                    <div>
                      <span className="font-medium">Brand:</span>
                      <span className="ml-2 text-gray-600">{product.brand}</span>
                    </div>
                  )}
                  {product.size && (
                    <div>
                      <span className="font-medium">Size:</span>
                      <span className="ml-2 text-gray-600">{product.size}</span>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <span className="font-medium">Color:</span>
                      <span className="ml-2 text-gray-600">{product.color}</span>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <span className="font-medium">Material:</span>
                      <span className="ml-2 text-gray-600">{product.material}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location & Shipping */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{product.location}</span>
              </div>
              {product.shippingCost && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Shipping: ${product.shippingCost}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{product.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{product.likes || 0} likes</span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated && user?.id !== product.sellerId ? (
                <>
                  <Button size="lg" className="w-full">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contact Seller
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Wishlist
                  </Button>
                </>
              ) : !isAuthenticated ? (
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Login to Contact Seller
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Sign in to contact the seller and make an offer
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-600">This is your own listing</p>
                </div>
              )}
            </div>

            {/* Trust & Safety */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Trust & Safety</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure payment processing</li>
                  <li>• Buyer protection guarantee</li>
                  <li>• Verified seller program</li>
                  <li>• 30-day return policy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
