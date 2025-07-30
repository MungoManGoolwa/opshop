import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            404 - Page Not Found
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Requested URL:
            </p>
            <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-1 rounded border">
              {location}
            </code>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400">
              The page you're looking for might have been moved, deleted, or never existed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Link href="/search">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
