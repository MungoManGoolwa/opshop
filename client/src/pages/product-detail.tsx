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
import BuyButton from "@/components/ui/buy-button";
import ReviewSummary from "@/components/reviews/review-summary";
import ReviewList from "@/components/reviews/review-list";
import { ImageGallery } from "@/components/ui/image-gallery";
import { ZoomImage } from "@/components/ui/zoom-image";
import { Breadcrumbs, ProductBreadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { QuickShareButtons } from "@/components/social/QuickShareButtons";
import { useSEO, truncateDescription } from "@/hooks/useSEO";
import SEOHead from "@/components/SEOHead";
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
  // Remove currentImageIndex state as it's now handled by ImageGallery

  // SEO Metadata
  useSEO({
    title: productData ? `${productData.title} - $${productData.price} | Opshop Online` : "Product Details - Opshop Online",
    description: productData ? truncateDescription(`${productData.description} Located in ${productData.location}. Condition: ${productData.condition}. ${productData.shippingCost && parseFloat(productData.shippingCost) > 0 ? `Shipping: $${productData.shippingCost}` : 'Free shipping'}.`) : "View product details on Australia's sustainable marketplace",
    image: productData?.images?.[0],
    url: window.location.href,
    type: "product",
    siteName: "Opshop Online",
    price: productData?.price,
    availability: productData?.status === "available" ? "in-stock" : "out-of-stock",
    condition: productData?.condition,
    location: productData?.location,
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  // Type guard to check if product data is loaded
  const isProductLoaded = product && typeof product === 'object' && 'id' in product;
  // Cast product to any to avoid TypeScript errors while maintaining functionality
  const productData = isProductLoaded ? (product as any) : null;

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

  if (error || !isProductLoaded || !productData) {
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

  const images = productData.images || ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=600"];

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
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
      {/* Enhanced SEO with structured data for products */}
      {productData && (
        <SEOHead
          title={`${productData.title} - $${productData.price}`}
          description={truncateDescription(`${productData.description} Located in ${productData.location}. Condition: ${productData.condition}.`)}
          keywords={`${productData.title}, ${productData.category}, ${productData.condition}, ${productData.location}, second hand, pre-loved, Australia`}
          image={productData.images?.[0]}
          url={`/product/${id}`}
          type="product"
          price={productData.price}
          currency="AUD"
          availability={productData.status === "available" ? "InStock" : "OutOfStock"}
          condition={productData.condition === "new" ? "New" : "Used"}
          location={productData.location}
          category={productData.category}
        />
      )}
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumbs */}
        <div className="mb-6">
          <ProductBreadcrumbs
            categoryName={productData.category?.name}
            categorySlug={productData.category?.slug}
            productTitle={productData.title}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Image Gallery with Zoom & Lightbox */}
          <div className="space-y-4">
            <ImageGallery
              images={images}
              title={productData.title}
              className="h-96 lg:h-[500px]"
              showThumbnails={images.length > 1}
              enableZoom={true}
              enableDownload={false}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{productData.title}</h1>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAddToWishlist}
                  disabled={addToWishlistMutation.isPending}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Badge className={getConditionColor(productData.condition)}>
                  {productData.condition}
                </Badge>
                {productData.isVerified && (
                  <Badge variant="outline" className="text-success border-success">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-primary">${productData.price}</span>
                {productData.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${productData.originalPrice}
                  </span>
                )}
              </div>
              {productData.originalPrice && (
                <p className="text-sm text-success">
                  Save ${(parseFloat(productData.originalPrice || '0') - parseFloat(productData.price || '0')).toFixed(2)}
                </p>
              )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
              {productData.brand && (
                <div>
                  <span className="text-sm text-gray-600">Brand</span>
                  <p className="font-medium">{productData.brand}</p>
                </div>
              )}
              {productData.size && (
                <div>
                  <span className="text-sm text-gray-600">Size</span>
                  <p className="font-medium">{productData.size}</p>
                </div>
              )}
              {productData.color && (
                <div>
                  <span className="text-sm text-gray-600">Color</span>
                  <p className="font-medium">{productData.color}</p>
                </div>
              )}
              {productData.material && (
                <div>
                  <span className="text-sm text-gray-600">Material</span>
                  <p className="font-medium">{productData.material}</p>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Ships from {productData.location}</span>
              <span className="text-gray-400">•</span>
              <Truck className="h-4 w-4 text-gray-500" />
              <span>
                {productData.shippingCost && parseFloat(productData.shippingCost) > 0
                  ? `$${productData.shippingCost} shipping`
                  : 'Free shipping'
                }
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{productData.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{productData.likes} likes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <BuyButton
                productId={productData.id}
                sellerId={productData.sellerId}
                amount={productData.price}
                shippingCost={productData.shippingCost}
                status={productData.status}
                className="w-full"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Seller
                </Button>
                <SocialShareButton
                  title={productData.title}
                  description={productData.description}
                  price={`$${productData.price}`}
                  imageUrl={images[0]}
                  variant="outline"
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Purchase */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Quick Purchase</h3>
                <BuyButton
                  productId={productData.id}
                  sellerId={productData.sellerId}
                  amount={productData.price}
                  shippingCost={productData.shippingCost}
                  status={productData.status}
                  variant="outline"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Items */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Similar items feature coming soon</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seller Reviews */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Seller Reviews</h3>
              <ReviewSummary userId={productData.sellerId} showTitle={false} />
              <div className="mt-6">
                <ReviewList userId={productData.sellerId} limit={3} />
              </div>
            </div>

            {/* Product Reviews */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Reviews</h3>
              <ReviewList productId={productData.id} limit={5} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}