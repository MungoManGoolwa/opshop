import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Store, User, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const features = {
  seller: [
    "List up to 10 items",
    "Basic seller tools",
    "Standard support",
    "Community access"
  ],
  shop: [
    "List up to 1,000 items",
    "Advanced shop analytics",
    "Priority customer support",
    "Shop customization tools",
    "Bulk listing tools",
    "Featured shop placement",
    "Advanced inventory management",
    "Shop branding options"
  ]
};

export default function ShopUpgrade() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/shop-upgrade/create-payment");
      return response.json();
    },
    onSuccess: (data: any) => {
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    },
  });

  const handleUpgrade = () => {
    setProcessing(true);
    upgradeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isShop = (user as any)?.accountType === "shop";
  const currentListings = (user as any)?.maxListings || 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Shop Account</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scale your business with advanced tools and higher listing limits. Perfect for serious sellers ready to grow.
          </p>
        </div>

        {/* Current Status */}
        {user && (
          <div className="max-w-md mx-auto mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isShop ? <Store className="h-8 w-8 text-primary" /> : <User className="h-8 w-8 text-gray-500" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Current Account: {isShop ? "Shop" : "Seller"}
                </h3>
                <p className="text-gray-600 mb-4">
                  You can list up to {currentListings} items
                </p>
                {isShop && (user as any).shopExpiryDate && (
                  <Badge variant="outline" className="text-success border-success">
                    Expires: {new Date((user as any).shopExpiryDate).toLocaleDateString()}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparison Table */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Seller Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <CardTitle className="text-2xl">Seller Account</CardTitle>
              <div className="text-3xl font-bold text-primary">Free</div>
              <p className="text-gray-600">Perfect for casual sellers</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.seller.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Shop Plan */}
          <Card className="relative border-primary border-2">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-white">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Shop Account</CardTitle>
              <div className="text-3xl font-bold text-primary">$500</div>
              <p className="text-gray-600">per year • Serious sellers</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.shop.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {!isShop && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Upgrade to Shop - $500/year
                    </>
                  )}
                </Button>
              )}
              
              {isShop && (
                <div className="text-center">
                  <Badge variant="outline" className="text-success border-success">
                    <Star className="mr-1 h-4 w-4" />
                    Current Plan
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Why Upgrade to Shop?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Scale Your Business</h3>
                  <p className="text-gray-600 text-sm">List 100x more items and reach more customers with advanced tools.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Premium Features</h3>
                  <p className="text-gray-600 text-sm">Access analytics, bulk tools, and priority support to grow faster.</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Professional Presence</h3>
                  <p className="text-gray-600 text-sm">Build your brand with shop customization and featured placement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}