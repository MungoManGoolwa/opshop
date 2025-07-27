import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  DollarSign, 
  Users, 
  Star, 
  Camera, 
  Truck, 
  Shield,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Sell() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "Start Selling - Opshop Online";
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Start Selling Today
            </h1>
            <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
              Turn your unwanted items into cash while helping the environment. Join thousands of Australian sellers making money sustainably.
            </p>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              <Plus className="mr-2 h-5 w-5" />
              Sign Up to Start Selling
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Sell on Opshop Online?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Australia's most trusted marketplace for pre-loved goods with powerful tools to help you succeed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <DollarSign className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Earn More Money</CardTitle>
                  <CardDescription>
                    Keep 90% of your sales with our low 10% commission. No listing fees or hidden charges.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Huge Audience</CardTitle>
                  <CardDescription>
                    Reach millions of Australian buyers looking for quality pre-loved items every month.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Safe & Secure</CardTitle>
                  <CardDescription>
                    Protected payments, buyer protection, and secure messaging keep your transactions safe.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
              >
                Get Started Now
              </Button>
            </div>
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
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Seller Dashboard</h1>
            <p className="text-xl text-green-100 mb-8">
              Manage your listings, track sales, and grow your sustainable business
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Plus className="h-8 w-8 text-primary" />
                  <Badge variant="outline">Quick Action</Badge>
                </div>
                <CardTitle>Create New Listing</CardTitle>
                <CardDescription>
                  List an item for sale in minutes with our simple listing tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/seller/create">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Listing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <Badge variant="outline">Analytics</Badge>
                </div>
                <CardTitle>Seller Dashboard</CardTitle>
                <CardDescription>
                  View your sales, analytics, and manage all your listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/seller/dashboard">
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <Badge variant="outline">Instant Cash</Badge>
                </div>
                <CardTitle>Instant Buyback</CardTitle>
                <CardDescription>
                  Get instant offers for your items using our AI valuation system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/instant-buyback">
                  <Button className="w-full" variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Get Instant Offer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Selling Tips for Success</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-primary" />
                  Great Photos
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Use natural lighting for clear, bright photos
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Show multiple angles and any flaws honestly
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Include size references and close-up details
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-primary" />
                  Detailed Descriptions
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Include brand, size, color, and condition
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Mention any wear, stains, or damage
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    Add measurements for clothing and furniture
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}