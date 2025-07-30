import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ProtectedRoute from "@/components/ui/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import FeedbackCelebration from "@/components/seller/feedback-celebration";
import { 
  Plus, 
  DollarSign, 
  Package, 
  Eye, 
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";

export default function SellerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Seller Dashboard - Opshop Online";
  }, []);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/seller/products"],
  });

  const { data: commissions, isLoading: commissionsLoading } = useQuery({
    queryKey: ["/api/seller/commissions"],
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-success";
      case "reserved":
        return "bg-warning";
      case "sold":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate dashboard stats
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const availableProducts = Array.isArray(products) ? products.filter((p: any) => p.status === "available").length : 0;
  const soldProducts = Array.isArray(products) ? products.filter((p: any) => p.status === "sold").length : 0;
  const totalViews = Array.isArray(products) ? products.reduce((sum: number, p: any) => sum + (p.views || 0), 0) : 0;
  const totalEarnings = Array.isArray(commissions) ? commissions.reduce((sum: number, c: any) => sum + parseFloat(c.salePrice || "0"), 0) : 0;
  const totalCommissions = Array.isArray(commissions) ? commissions.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount || "0"), 0) : 0;

  // Mock data for celebration component - in a real app this would come from APIs
  const mockLatestReview = {
    id: "rev-123",
    rating: 5,
    comment: "Amazing vintage dress, exactly as described! Fast shipping and great communication.",
    buyerName: "Sarah M.",
    productName: "Vintage Floral Summer Dress",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  };

  const mockSellerStats = {
    totalReviews: 47,
    averageRating: 4.8,
    totalSales: soldProducts,
    achievementLevel: "Gold Seller",
  };

  return (
    <ProtectedRoute allowedRoles={["seller", "business", "admin"]}>
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-gray-600">Welcome back, {(user as any)?.firstName || "Seller"}!</p>
            </div>
            <Button asChild>
              <Link href="/seller/create">
                <Plus className="mr-2 h-4 w-4" />
                List New Item
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Sold Items</p>
                    <p className="text-2xl font-bold">{soldProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Celebration Component */}
          <div className="mb-8">
            <FeedbackCelebration 
              latestReview={mockLatestReview}
              sellerStats={mockSellerStats}
            />
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="sales">Sales History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(products) && products.length > 0 ? (
                    <div className="space-y-4">
                      {products.map((product: any) => (
                        <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&h=100"}
                            alt={product.title}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getConditionColor(product.condition)} text-white text-xs`}>
                                {product.condition}
                              </Badge>
                              <Badge className={`${getStatusColor(product.status)} text-white text-xs`}>
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${product.price}</p>
                            <p className="text-sm text-gray-600">{product.views || 0} views</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No products listed yet.</p>
                      <Button asChild className="mt-4">
                        <Link href="/seller/create">
                          <Plus className="mr-2 h-4 w-4" />
                          List Your First Item
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                  {commissionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(commissions) && commissions.length > 0 ? (
                    <div className="space-y-4">
                      {commissions.map((commission: any) => (
                        <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">Sale #{commission.id}</p>
                            <p className="text-sm text-gray-600">
                              Commission: {parseFloat(commission.commissionRate).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${commission.salePrice}</p>
                            <p className="text-sm text-gray-600">
                              You earned: ${(parseFloat(commission.salePrice) - parseFloat(commission.commissionAmount)).toFixed(2)}
                            </p>
                          </div>
                          <Badge className={commission.status === "paid" ? "bg-success" : "bg-warning"}>
                            {commission.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No sales yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Active Listings</span>
                        <span className="font-semibold">{availableProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items Sold</span>
                        <span className="font-semibold">{soldProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-semibold">
                          {totalProducts > 0 ? ((soldProducts / totalProducts) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Views per Item</span>
                        <span className="font-semibold">
                          {totalProducts > 0 ? Math.round(totalViews / totalProducts) : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Sales</span>
                        <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fees</span>
                        <span className="font-semibold">${totalCommissions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Earnings</span>
                        <span className="font-semibold">${(totalEarnings - totalCommissions).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Next Payout</span>
                        <span>Weekly</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
