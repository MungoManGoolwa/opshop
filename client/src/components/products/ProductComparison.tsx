import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Heart, ShoppingCart, Star, Eye, Calendar, Package } from "lucide-react";
import { Link } from "wouter";

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
  clothingGender?: string;
  model?: string;
  storageCapacity?: string;
  screenSize?: string;
  batteryLife?: string;
  connectivity?: string;
  make?: string;
  vehicleModel?: string;
  year?: number;
  kilometers?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  author?: string;
  genre?: string;
  format?: string;
  publicationYear?: number;
  roomType?: string;
  furnitureType?: string;
  sportType?: string;
  activityLevel?: string;
}

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
}

export function ProductComparison({ products, onClose, onRemoveProduct }: ProductComparisonProps) {
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

  const getConditionScore = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return 5;
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      default: return 1;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Determine which attributes to compare based on the products
  const getComparisonAttributes = () => {
    const attributes = [];
    
    // Price comparison
    attributes.push({
      label: 'Price',
      key: 'price',
      formatter: formatPrice,
      highlight: 'lowest'
    });

    // Condition comparison
    attributes.push({
      label: 'Condition',
      key: 'condition',
      formatter: (value: string) => value,
      highlight: 'highest_condition'
    });

    // Check for common attributes across products
    if (products.some(p => p.brand)) {
      attributes.push({
        label: 'Brand',
        key: 'brand',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.model)) {
      attributes.push({
        label: 'Model',
        key: 'model',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.storageCapacity)) {
      attributes.push({
        label: 'Storage',
        key: 'storageCapacity',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.screenSize)) {
      attributes.push({
        label: 'Screen Size',
        key: 'screenSize',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.clothingSize)) {
      attributes.push({
        label: 'Size',
        key: 'clothingSize',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.clothingType)) {
      attributes.push({
        label: 'Type',
        key: 'clothingType',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.clothingGender)) {
      attributes.push({
        label: 'Gender',
        key: 'clothingGender',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.make)) {
      attributes.push({
        label: 'Make',
        key: 'make',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.year)) {
      attributes.push({
        label: 'Year',
        key: 'year',
        formatter: (value: number) => value?.toString() || 'N/A'
      });
    }

    if (products.some(p => p.kilometers)) {
      attributes.push({
        label: 'Kilometers',
        key: 'kilometers',
        formatter: (value: number) => value ? `${value.toLocaleString()} km` : 'N/A'
      });
    }

    if (products.some(p => p.fuelType)) {
      attributes.push({
        label: 'Fuel Type',
        key: 'fuelType',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.transmission)) {
      attributes.push({
        label: 'Transmission',
        key: 'transmission',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.author)) {
      attributes.push({
        label: 'Author',
        key: 'author',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.genre)) {
      attributes.push({
        label: 'Genre',
        key: 'genre',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.color)) {
      attributes.push({
        label: 'Color',
        key: 'color',
        formatter: (value: string) => value || 'N/A'
      });
    }

    if (products.some(p => p.material)) {
      attributes.push({
        label: 'Material',
        key: 'material',
        formatter: (value: string) => value || 'N/A'
      });
    }

    // Always include views and date
    attributes.push({
      label: 'Views',
      key: 'views',
      formatter: (value: number) => value?.toString() || '0',
      highlight: 'highest'
    });

    attributes.push({
      label: 'Listed',
      key: 'createdAt',
      formatter: formatDate
    });

    return attributes;
  };

  const getBestValue = (attribute: any) => {
    if (attribute.highlight === 'lowest') {
      const prices = products.map(p => parseFloat((p as any)[attribute.key]));
      return Math.min(...prices).toString();
    } else if (attribute.highlight === 'highest') {
      const values = products.map(p => parseInt((p as any)[attribute.key]) || 0);
      return Math.max(...values).toString();
    } else if (attribute.highlight === 'highest_condition') {
      const conditions = products.map(p => getConditionScore((p as any)[attribute.key]));
      const maxScore = Math.max(...conditions);
      const product = products.find(p => getConditionScore((p as any)[attribute.key]) === maxScore);
      return product ? (product as any)[attribute.key] : '';
    }
    return null;
  };

  const isHighlighted = (product: Product, attribute: any) => {
    const bestValue = getBestValue(attribute);
    if (!bestValue) return false;

    const productValue = (product as any)[attribute.key];
    
    if (attribute.highlight === 'lowest') {
      return parseFloat(productValue) === parseFloat(bestValue);
    } else if (attribute.highlight === 'highest') {
      return parseInt(productValue) === parseInt(bestValue);
    } else if (attribute.highlight === 'highest_condition') {
      return productValue === bestValue;
    }
    
    return false;
  };

  const comparisonAttributes = getComparisonAttributes();

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Product Comparison</h1>
            <p className="text-muted-foreground mt-1">Compare {products.length} similar items side by side</p>
          </div>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)` }}>
          {products.map((product, index) => (
            <Card key={product.id} className="relative">
              {products.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveProduct(product.id)}
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <CardHeader className="pb-4">
                <div className="aspect-square overflow-hidden rounded-lg mb-4">
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&h=400"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                    {product.title}
                  </Link>
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <Badge className={getConditionColor(product.condition)}>
                    {product.condition}
                  </Badge>
                  <Badge variant="secondary" className="font-bold text-lg">
                    {formatPrice(product.price)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>

                <Separator />

                {/* Detailed Comparison Attributes */}
                <div className="space-y-3">
                  {comparisonAttributes.map((attr) => {
                    const value = (product as any)[attr.key];
                    const isHighlight = isHighlighted(product, attr);
                    
                    return (
                      <div key={attr.key} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{attr.label}:</span>
                        <span className={`text-sm font-medium ${isHighlight ? 'text-green-600 font-bold' : ''}`}>
                          {attr.formatter(value)}
                          {isHighlight && attr.highlight === 'lowest' && (
                            <span className="ml-1 text-xs text-green-600">BEST PRICE</span>
                          )}
                          {isHighlight && attr.highlight === 'highest_condition' && (
                            <span className="ml-1 text-xs text-green-600">BEST CONDITION</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Product Stats */}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {product.views || 0} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(product.createdAt)}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {product.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Comparison Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatPrice(Math.min(...products.map(p => parseFloat(p.price))).toString())}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Price</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {products.reduce((best, current) => 
                    getConditionScore(current.condition) > getConditionScore(best.condition) ? current : best
                  ).condition}
                </div>
                <div className="text-sm text-muted-foreground">Best Condition</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.max(...products.map(p => p.views || 0))}
                </div>
                <div className="text-sm text-muted-foreground">Most Viewed</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Tip:</strong> Look for items with the best value combination of price, condition, and seller reputation. 
              Green highlights indicate the best values in each category.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}