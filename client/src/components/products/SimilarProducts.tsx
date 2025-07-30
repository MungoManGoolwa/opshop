import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Compare, Heart, ShoppingCart, Eye } from "lucide-react";
import { ProductComparison } from "./ProductComparison";

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  condition: string;
  status: string;
  brand?: string;
  images?: string[];
  views: number;
  categoryId: number;
  createdAt: string;
  color?: string;
  size?: string;
  material?: string;
  clothingSize?: string;
  clothingType?: string;
  model?: string;
  storageCapacity?: string;
  screenSize?: string;
  make?: string;
  year?: number;
  fuelType?: string;
  author?: string;
  genre?: string;
}

interface SimilarProductsProps {
  productId: number;
  currentProduct: Product;
  limit?: number;
}

export default function SimilarProducts({ productId, currentProduct, limit = 6 }: SimilarProductsProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<Product[]>([currentProduct]);
  const [showComparison, setShowComparison] = useState(false);

  const { data: similarProducts, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}/similar`, { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/similar?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch similar products');
      return response.json();
    },
  });

  const toggleProductForComparison = (product: Product) => {
    setSelectedForComparison(current => {
      const isSelected = current.some(p => p.id === product.id);
      if (isSelected) {
        return current.filter(p => p.id !== product.id);
      } else if (current.length < 4) { // Max 4 products for comparison
        return [...current, product];
      }
      return current;
    });
  };

  const isSelectedForComparison = (productId: number) => {
    return selectedForComparison.some(p => p.id === productId);
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'excellent': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showComparison && selectedForComparison.length > 1) {
    return (
      <ProductComparison 
        products={selectedForComparison}
        onClose={() => setShowComparison(false)}
        onRemoveProduct={(productId) => {
          setSelectedForComparison(current => current.filter(p => p.id !== productId));
        }}
      />
    );
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Similar Items</h2>
          <p className="text-muted-foreground mt-1">Compare prices and features of similar second-hand items</p>
        </div>
        
        {selectedForComparison.length > 1 && (
          <Button 
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2"
          >
            <Compare className="h-4 w-4" />
            Compare ({selectedForComparison.length})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !similarProducts || similarProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Compare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Similar Items Found</h3>
          <p className="text-gray-500">Try browsing our categories for more options</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProducts.map((product: Product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=300"}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Quick action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant={isSelectedForComparison(product.id) ? "default" : "secondary"}
                    onClick={() => toggleProductForComparison(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Compare className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>

                {/* Price badge */}
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-white/90 text-black font-semibold">
                    {formatPrice(product.price)}
                  </Badge>
                </div>

                {/* Condition badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={getConditionColor(product.condition)}>
                    {product.condition}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {product.brand && <span>{product.brand}</span>}
                      {product.brand && (product.model || product.size || product.color) && <span>•</span>}
                      {product.model && <span>{product.model}</span>}
                      {product.size && <span>Size {product.size}</span>}
                      {product.color && <span>{product.color}</span>}
                      {product.clothingSize && <span>Size {product.clothingSize}</span>}
                      {product.storageCapacity && <span>{product.storageCapacity}</span>}
                      {product.year && <span>{product.year}</span>}
                    </div>
                  </div>

                  {/* Key attributes for quick comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {product.brand && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.condition && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="font-medium">{product.condition}</span>
                      </div>
                    )}
                    {product.storageCapacity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="font-medium">{product.storageCapacity}</span>
                      </div>
                    )}
                    {product.screenSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Screen:</span>
                        <span className="font-medium">{product.screenSize}</span>
                      </div>
                    )}
                    {product.clothingSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{product.clothingSize}</span>
                      </div>
                    )}
                    {product.fuelType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuel:</span>
                        <span className="font-medium">{product.fuelType}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {product.views || 0} views
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isSelectedForComparison(product.id) ? "default" : "outline"}
                        onClick={() => toggleProductForComparison(product)}
                        className="text-xs px-2 py-1 h-7"
                      >
                        <Compare className="h-3 w-3 mr-1" />
                        {isSelectedForComparison(product.id) ? 'Selected' : 'Compare'}
                      </Button>
                      
                      <Button size="sm" className="text-xs px-2 py-1 h-7">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedForComparison.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Selected for Comparison</h4>
              <p className="text-sm text-muted-foreground">
                {selectedForComparison.length} item{selectedForComparison.length > 1 ? 's' : ''} selected (max 4)
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedForComparison([currentProduct])}
              >
                Clear
              </Button>
              
              {selectedForComparison.length > 1 && (
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                >
                  <Compare className="h-4 w-4 mr-2" />
                  Compare Now
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {selectedForComparison.map((product) => (
              <div key={product.id} className="flex-shrink-0 flex items-center gap-2 bg-background rounded p-2 border">
                <img
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=40&h=40"}
                  alt={product.title}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate max-w-24">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleProductForComparison(product)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}