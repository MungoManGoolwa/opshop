import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  CheckCircle,
  Camera,
  Tag,
  Zap
} from "lucide-react";

export default function PricingGuide() {
  useEffect(() => {
    document.title = "Pricing Guide - Opshop Online";
  }, []);

  const categories = [
    {
      name: "Electronics",
      depreciation: "20-40% per year",
      tips: ["Check current retail prices", "Consider age and condition", "Include original accessories"],
      examples: [
        { item: "iPhone 12 (Good)", original: "$1,199", suggested: "$600-800" },
        { item: "MacBook Air M1", original: "$1,599", suggested: "$1,000-1,300" },
        { item: "PlayStation 5", original: "$749", suggested: "$400-600" }
      ]
    },
    {
      name: "Clothing",
      depreciation: "60-80% from retail",
      tips: ["Brand matters significantly", "Designer items hold value better", "Condition is critical"],
      examples: [
        { item: "Zara Jacket (Good)", original: "$120", suggested: "$25-45" },
        { item: "Nike Sneakers", original: "$180", suggested: "$40-80" },
        { item: "Designer Handbag", original: "$500", suggested: "$150-300" }
      ]
    },
    {
      name: "Furniture",
      depreciation: "50-70% from retail",
      tips: ["Solid wood holds value", "Popular brands command higher prices", "Local pickup only affects price"],
      examples: [
        { item: "IKEA Bookshelf", original: "$150", suggested: "$50-80" },
        { item: "Dining Table (Wood)", original: "$800", suggested: "$250-400" },
        { item: "Office Chair", original: "$300", suggested: "$80-150" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <Tag className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Pricing Guide</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Learn how to price your items competitively and maximize your sales on Opshop Online
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Commission Info */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our 90:10 Commission Structure</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                You keep 90% of every sale, and we take just 10% to maintain the platform and provide support.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>You Keep 90%</CardTitle>
                  <CardDescription>
                    Keep most of your earnings with our low commission rate
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>We Take 10%</CardTitle>
                  <CardDescription>
                    Small fee covers platform costs and payment processing
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Instant Payouts</CardTitle>
                  <CardDescription>
                    Get paid immediately after successful transactions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Pricing Strategies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing Strategies</h2>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Research-Based Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Check current market prices on similar platforms
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Look up original retail prices for reference
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Consider age, condition, and brand reputation
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Factor in demand and seasonality
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Camera className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Quick Sale Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Price 10-20% below market rate for faster sales
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Bundle related items for better value
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Offer free shipping by including it in the price
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      Be open to reasonable offers from buyers
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Category-Specific Pricing */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Category-Specific Pricing</h2>
            
            <div className="space-y-8">
              {categories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{category.name}</CardTitle>
                      <Badge variant="outline">{category.depreciation}</Badge>
                    </div>
                    <CardDescription className="text-base">
                      {category.tips.join(" • ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {category.examples.map((example, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">{example.item}</h4>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Original:</strong> {example.original}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            <strong>Suggested:</strong> {example.suggested}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Instant Buyback Alternative */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Not Sure About Pricing?</h2>
            <p className="text-xl text-green-100 mb-6">
              Try our AI-powered instant buyback service for immediate offers on your items
            </p>
            <Link href="/instant-buyback">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                <Zap className="mr-2 h-5 w-5" />
                Get Instant Offer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}