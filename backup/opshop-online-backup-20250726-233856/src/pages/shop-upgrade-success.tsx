import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Store, ArrowRight } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ShopUpgradeSuccess() {
  useEffect(() => {
    // Optional: You could trigger a user refresh here to update account status
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                Welcome to Your Shop Account!
              </h1>
              
              <p className="text-lg text-green-700 mb-8">
                Congratulations! Your account has been successfully upgraded to a Shop account. 
                You can now list up to 1,000 items and access premium features.
              </p>

              <div className="bg-white rounded-lg p-6 mb-8 text-left">
                <div className="flex items-center mb-4">
                  <Store className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Your New Shop Benefits</h3>
                </div>
                
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    List up to 1,000 items (was 10)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Advanced shop analytics and insights
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Bulk listing and management tools
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Featured shop placement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Shop branding and customization
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/seller/dashboard">
                    <Store className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" asChild size="lg">
                  <Link href="/">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Browse Marketplace
                  </Link>
                </Button>
              </div>
              
              <p className="text-sm text-green-600 mt-6">
                Your shop account is valid for 1 year from today. You'll receive email reminders before renewal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}