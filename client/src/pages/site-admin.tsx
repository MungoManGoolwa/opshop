import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ProtectedRoute from "@/components/ui/protected-route";
import PageHeader from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Package, 
  Settings, 
  Database,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Mail,
  Globe,
  Server,
  BarChart3,
  FileText,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Home
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accountType: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  location?: string;
  businessName?: string;
  maxListings: number;
}

interface Product {
  id: number;
  title: string;
  price: string;
  condition: string;
  status: string;
  sellerId: string;
  isVerified: boolean;
  views: number;
  createdAt: string;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  commissionRate: number;
  maxFileSize: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoApprove: boolean;
}

export default function SiteAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "Opshop Online",
    siteDescription: "Australia's Sustainable Marketplace",
    maintenanceMode: false,
    registrationEnabled: true,
    commissionRate: 10,
    maxFileSize: 5,
    emailNotifications: true,
    smsNotifications: false,
    autoApprove: false
  });

  useEffect(() => {
    document.title = "Site Administrator - Opshop Online";
  }, []);

  const breadcrumbs = [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Site Administration" },
  ];

  // Fetch data
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    retry: false,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      return apiRequest("PUT", `/api/admin/users/${userData.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    },
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (settings: SystemSettings) => {
      return apiRequest("PUT", "/api/admin/system-settings", settings);
    },
    onSuccess: () => {
      toast({ title: "System settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update settings", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: { id: number; status?: string; isVerified?: boolean }) => {
      return apiRequest("PUT", `/api/admin/products/${productData.id}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  // Filter users based on search
  const filteredUsers = Array.isArray(users) ? users.filter((user: User) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleUserRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({ id: userId, role: newRole });
  };

  const handleUserStatusChange = (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({ id: userId, isActive });
  };

  const handleUserVerificationChange = (userId: string, isVerified: boolean) => {
    updateUserMutation.mutate({ id: userId, isVerified });
  };

  const handleSystemSettingsUpdate = () => {
    updateSystemSettingsMutation.mutate(systemSettings);
  };

  const stats = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    activeUsers: Array.isArray(users) ? users.filter((u: User) => u.isActive).length : 0,
    verifiedUsers: Array.isArray(users) ? users.filter((u: User) => u.isVerified).length : 0,
    adminUsers: Array.isArray(users) ? users.filter((u: User) => u.role === 'admin').length : 0,
    activeProducts: Array.isArray(products) ? products.filter((p: Product) => p.status === 'available').length : 0,
    pendingProducts: Array.isArray(products) ? products.filter((p: Product) => !p.isVerified).length : 0,
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <PageHeader
          title="🔧 Site Administrator"
          description="Full system administration and control panel"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                <ShieldCheck className="w-3 h-3 mr-1" />
                ADMIN ACCESS
              </Badge>
              <Button asChild variant="outline">
                <a href="/admin/dashboard" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </a>
              </Button>
            </div>
          }
        />
        
        <div className="container mx-auto px-4 py-8">

          {/* System Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-green-600">{stats.activeUsers} active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-green-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    <p className="text-xs text-orange-600">{stats.pendingProducts} pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 text-red-500" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">{stats.adminUsers}</p>
                    <p className="text-xs text-blue-600">{stats.verifiedUsers} verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Users Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>User Management</span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users by email, name, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  <div className="space-y-4">
                    {usersLoading ? (
                      <p>Loading users...</p>
                    ) : (
                      filteredUsers.map((user: User) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                  {user.role}
                                </Badge>
                                <Badge variant={user.accountType === 'shop' ? 'default' : 'outline'}>
                                  {user.accountType}
                                </Badge>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {user.isVerified && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={user.role} 
                              onValueChange={(value) => handleUserRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              size="sm" 
                              variant={user.isActive ? "destructive" : "default"}
                              onClick={() => handleUserStatusChange(user.id, !user.isActive)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={user.isVerified ? "outline" : "default"}
                              onClick={() => handleUserVerificationChange(user.id, !user.isVerified)}
                            >
                              {user.isVerified ? 'Unverify' : 'Verify'}
                            </Button>
                            
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteUserMutation.mutate(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Management */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productsLoading ? (
                      <p>Loading products...</p>
                    ) : Array.isArray(products) ? (
                      products.map((product: Product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-gray-600">${product.price} • {product.condition}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={product.status === 'available' ? 'default' : 'secondary'}>
                                {product.status}
                              </Badge>
                              {product.isVerified ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              <span className="text-xs text-gray-500">{product.views} views</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={product.status} 
                              onValueChange={(value) => updateProductMutation.mutate({ id: product.id, status: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="removed">Removed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              size="sm" 
                              variant={product.isVerified ? "outline" : "default"}
                              onClick={() => updateProductMutation.mutate({ id: product.id, isVerified: !product.isVerified })}
                            >
                              {product.isVerified ? 'Unverify' : 'Verify'}
                            </Button>
                            
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No products found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Management */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 py-8">
                    Order management interface - view and manage all marketplace transactions
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={systemSettings.siteName}
                        onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        value={systemSettings.commissionRate}
                        onChange={(e) => setSystemSettings({...systemSettings, commissionRate: Number(e.target.value)})}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={systemSettings.siteDescription}
                        onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <Switch
                        id="maintenance"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="registration">Registration Enabled</Label>
                      <Switch
                        id="registration"
                        checked={systemSettings.registrationEnabled}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, registrationEnabled: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <Switch
                        id="emailNotifications"
                        checked={systemSettings.emailNotifications}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoApprove">Auto-approve Products</Label>
                      <Switch
                        id="autoApprove"
                        checked={systemSettings.autoApprove}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoApprove: checked})}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSystemSettingsUpdate} className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Update System Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Database Management */}
            <TabsContent value="database" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col">
                      <RefreshCw className="w-5 h-5 mb-2" />
                      Sync Database
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Download className="w-5 h-5 mb-2" />
                      Export Backup
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col">
                      <Upload className="w-5 h-5 mb-2" />
                      Import Data
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 font-medium">Database Operations</p>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      These operations directly affect the production database. Use with extreme caution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    System Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">User Growth</h3>
                      <p className="text-2xl font-bold text-green-600">↗ +15%</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Product Listings</h3>
                      <p className="text-2xl font-bold text-blue-600">↗ +23%</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Transaction Volume</h3>
                      <p className="text-2xl font-bold text-purple-600">$45,231</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Commission Earned</h3>
                      <p className="text-2xl font-bold text-green-600">$4,523</p>
                      <p className="text-sm text-gray-600">This month (10%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}