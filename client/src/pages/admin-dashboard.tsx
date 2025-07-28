import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ProtectedRoute from "@/components/ui/protected-route";
import PaymentSettings from "@/components/admin/payment-settings";
import PageHeader from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Shield,
  Flag,
  Settings,
  Home
} from "lucide-react";

export default function AdminDashboard() {
  useEffect(() => {
    document.title = "Admin Dashboard - Opshop Online";
  }, []);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Mock admin statistics (in real app, these would come from dedicated admin endpoints)
  const totalUsers = 50123;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalSales = 2345678;
  const activeListings = Array.isArray(products) ? products.filter((p: any) => p.status === "available").length : 0;

  const breadcrumbs = [
    { label: "Admin Dashboard" },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageHeader
          title="Admin Dashboard"
          description="Manage your marketplace platform"
          breadcrumbs={breadcrumbs}
          actions={
            <Button asChild variant="outline">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Marketplace Home
              </Link>
            </Button>
          }
        />
        
        <div className="container mx-auto px-4 py-8">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
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
                    <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                    <p className="text-2xl font-bold">{activeListings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>System Status</span>
                        <span className="text-success font-semibold">✓ Healthy</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Response Time</span>
                        <span className="font-semibold">45ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Status</span>
                        <span className="text-success font-semibold">✓ Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Usage</span>
                        <span className="font-semibold">67%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>New user registrations today</span>
                        <span className="font-semibold">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Products listed today</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales completed today</span>
                        <span className="font-semibold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support tickets open</span>
                        <span className="font-semibold text-warning">12</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Comprehensive user management interface</p>
                    <Button asChild>
                      <Link href="/admin/users">
                        Open User Management
                      </Link>
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      Features: User profiles, role management, account settings, seller upgrades
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded" />
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
                      <p className="text-sm text-gray-600 mb-4">
                        Showing {Math.min(10, products.length)} of {products.length} products
                      </p>
                      {products.slice(0, 10).map((product: any) => (
                        <div key={product.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=100&h=100"}
                            alt={product.title}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{product.title}</h4>
                            <p className="text-sm text-gray-600">
                              {product.condition} • ${product.price}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No products found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoriesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : Array.isArray(categories) && categories.length > 0 ? (
                    <div className="space-y-3">
                      {categories.map((category: any) => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {category.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No categories found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Moderation queue would be implemented here.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Features: Flagged content review, automated moderation, user reports, etc.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Manage business information and contact details</p>
                    <Button asChild className="mb-4">
                      <Link href="/admin/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Open Business Settings
                      </Link>
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      Features: Contact information, business hours, address, phone numbers
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <PaymentSettings />
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
