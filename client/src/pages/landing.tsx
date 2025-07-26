import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recycle, Users, Heart, Star, MapPin, ShoppingBag, Plus, RefreshCw } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import CategoryNav from "@/components/categories/category-nav";
import ProductGrid from "@/components/products/product-grid";
import { mockProducts } from "@/lib/mockData";

export default function Landing() {
  useEffect(() => {
    document.title = "Opshop Online - Australia's Sustainable Marketplace";
  }, []);

  const featuredProducts = mockProducts.slice(0, 8);

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      <CategoryNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Australia's Most Sustainable Marketplace
              </h1>
              <p className="text-xl mb-6 text-green-100">
                Buy and sell pre-loved treasures while helping our planet. Every purchase saves items from landfill.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-white"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start Selling
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-green-100">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>50,000+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Recycle className="h-5 w-5" />
                  <span>1M+ Items Saved</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Second-hand marketplace items" 
                className="rounded-xl shadow-2xl" 
              />
              <Badge className="absolute top-4 right-4 bg-accent text-white">
                ♻️ Eco-Friendly
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">15,234</div>
              <div className="text-sm text-gray-600">Items Available</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-success">$2.3M</div>
              <div className="text-sm text-gray-600">Total Savings</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-accent">98%</div>
              <div className="text-sm text-gray-600">Seller Satisfaction</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-secondary">127kg</div>
              <div className="text-sm text-gray-600">CO₂ Saved Today</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Clothing", icon: "👕", gradient: "from-primary to-secondary" },
              { name: "Furniture", icon: "🛋️", gradient: "from-accent to-orange-600" },
              { name: "Electronics", icon: "💻", gradient: "from-blue-500 to-blue-600" },
              { name: "Homewares", icon: "🏠", gradient: "from-purple-500 to-purple-600" },
              { name: "Sports", icon: "⚽", gradient: "from-green-500 to-green-600" },
              { name: "Entertainment", icon: "🎮", gradient: "from-red-500 to-red-600" },
              { name: "Tools", icon: "🔧", gradient: "from-yellow-500 to-yellow-600" },
              { name: "More", icon: "➕", gradient: "from-gray-500 to-gray-600" },
            ].map((category) => (
              <div key={category.name} className="text-center group cursor-pointer">
                <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <span className="text-white text-xl">{category.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Listings</h2>
            <span className="text-gray-600">15,234 items found</span>
          </div>
          
          <ProductGrid products={featuredProducts} />
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/api/login"}
            >
              View All Items
            </Button>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Making a Difference Together</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every item you buy or sell on Opshop Online helps reduce waste and supports a more sustainable future for Australia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Circular Economy</h3>
              <p className="text-gray-600">Keep valuable items in circulation instead of ending up in landfill</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Waste</h3>
              <p className="text-gray-600">Every purchase prevents items from contributing to Australia's waste problem</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
              <p className="text-gray-600">Support local communities and make sustainable living affordable</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Spotlight */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Sellers</h2>
            <p className="text-xl text-gray-600">Meet some of our top-rated sellers making sustainability stylish</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Emma's Vintage Finds",
                rating: 4.9,
                reviews: 312,
                description: "Curated vintage clothing and accessories from Melbourne",
                items: 234,
                responseRate: "99%"
              },
              {
                name: "Tech Revival Sydney",
                rating: 4.8,
                reviews: 189,
                description: "Refurbished electronics and gadgets with warranty",
                items: 156,
                responseRate: "100%"
              },
              {
                name: "Home & Garden Adelaide",
                rating: 4.9,
                reviews: 278,
                description: "Quality furniture and home decor pieces",
                items: 89,
                responseRate: "98%"
              }
            ].map((seller, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold mb-1">{seller.name}</h3>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{seller.rating}</span>
                    <span className="text-gray-500">({seller.reviews} reviews)</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{seller.description}</p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>{seller.items} Items</span>
                    <span>•</span>
                    <span>{seller.responseRate} Response Rate</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Sustainable Journey?</h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Join thousands of Australians buying and selling pre-loved items. Make money, save money, and help the planet.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.location.href = "/api/login"}
            >
              <Plus className="mr-2 h-5 w-5" />
              Start Selling
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">Free</div>
              <div className="text-green-100">to list your items</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">90:10</div>
              <div className="text-green-100">You keep 90%, we take 10%</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Instant</div>
              <div className="text-green-100">AI-powered quick buyouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Buyout Section */}
      <section className="py-16 bg-white dark:bg-stone-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-stone-800 dark:text-stone-200">
              Need Store Credit Fast? We'll Buy Your Items Instantly
            </h2>
            <p className="text-lg mb-8 text-stone-600 dark:text-stone-400">
              Can't wait for a buyer? Our AI technology instantly evaluates your items and offers 
              you store credit on the spot. Start shopping immediately with your credit.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-stone-50 dark:bg-stone-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">1</div>
                <h3 className="font-semibold mb-2 text-stone-800 dark:text-stone-200">Upload Photos</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Take clear photos of your item from multiple angles
                </p>
              </div>
              <div className="text-center p-6 bg-stone-50 dark:bg-stone-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">2</div>
                <h3 className="font-semibold mb-2 text-stone-800 dark:text-stone-200">AI Evaluation</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Our AI analyzes condition, brand, and market value
                </p>
              </div>
              <div className="text-center p-6 bg-stone-50 dark:bg-stone-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">3</div>
                <h3 className="font-semibold mb-2 text-stone-800 dark:text-stone-200">Get Store Credit</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Accept our offer and receive instant store credit to shop with
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Fair pricing guaranteed:</strong> Our AI considers current market trends, 
                item condition, and demand to offer you competitive store credit that you can use 
                immediately on any items in our marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
