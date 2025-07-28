import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowRight, Heart, Search } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    document.title = "Shopping Cart - Opshop Online";
    window.scrollTo(0, 0);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Opshop Online</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-accent" />
            <h1 className="text-4xl font-bold mb-4">Your Shopping Cart</h1>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Sign in to access your cart and complete your purchases.
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sign In to Shop
            </Button>
          </div>
        </section>
        
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">Review and manage your selected items</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Cart Items
                  </CardTitle>
                  <CardDescription>
                    Your cart is currently empty. At Opshop Online, items are purchased directly from product pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6">
                    Browse our sustainable marketplace to find amazing pre-loved items.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link href="/">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Products
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        View Wishlist
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>How Shopping Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Browse Products</h4>
                      <p className="text-sm text-gray-600">Discover unique pre-loved items from Australian sellers.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Buy Now</h4>
                      <p className="text-sm text-gray-600">Click "Buy Now" on any product to purchase directly.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Secure Checkout</h4>
                      <p className="text-sm text-gray-600">Complete your purchase with our secure payment system.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about shopping on Opshop Online?
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const subject = encodeURIComponent("Shopping Help - Opshop Online");
                      const body = encodeURIComponent("Hi,\n\nI need help with shopping on Opshop Online:\n\n[Please describe your question here]\n\nThank you!");
                      window.location.href = `mailto:brendan@opshop.online?subject=${subject}&body=${body}`;
                    }}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}