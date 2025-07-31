import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Settings,
  Mail,
  Calendar,
  MapPin,
  UserCircle
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "My Profile - Opshop Online";
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access your profile.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const userData = user as any;

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {userData?.profileImageUrl ? (
                  <img 
                    src={userData.profileImageUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover mx-auto" 
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                    <UserCircle className="h-12 w-12 text-gray-600" />
                  </div>
                )}
              </div>
              <CardTitle>{userData?.firstName || userData?.email || "User"}</CardTitle>
              <div className="flex justify-center">
                <Badge variant="outline" className="capitalize">
                  {userData?.accountType || "Customer"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{userData.email}</span>
                </div>
              )}
              {userData?.createdAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Member since {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <Button className="w-full mt-4" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start browsing to see your activity here</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="wishlist" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">My Wishlist</h3>
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Your wishlist is empty</p>
                      <p className="text-sm">Save items you love by clicking the heart icon</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Order History</h3>
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No orders yet</p>
                      <p className="text-sm">Your order history will appear here</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <User className="h-6 w-6" />
                <span>Update Profile</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Preferences</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Heart className="h-6 w-6" />
                <span>View Wishlist</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}