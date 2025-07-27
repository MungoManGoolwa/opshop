import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MessageCircle, 
  Shield, 
  Package, 
  CreditCard, 
  Users,
  HelpCircle,
  Mail
} from "lucide-react";

export default function HelpCenter() {
  useEffect(() => {
    document.title = "Help Center - Opshop Online";
  }, []);

  const categories = [
    {
      icon: Package,
      title: "Buying & Selling",
      description: "How to buy and sell items on Opshop Online",
      articles: [
        "How to create a listing",
        "Payment methods and security",
        "Shipping and delivery options",
        "Return and refund policy"
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Staying safe while trading online",
      articles: [
        "Safety guidelines for buyers",
        "Seller protection policies",
        "Reporting suspicious activity",
        "Identity verification"
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Fees",
      description: "Understanding payments and commission structure",
      articles: [
        "Commission rates (10% seller fee)",
        "Payment processing times",
        "Store credit system",
        "Instant buyback program"
      ]
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Managing your profile and settings",
      articles: [
        "Creating your account",
        "Profile settings and privacy",
        "Notification preferences",
        "Deleting your account"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Find answers to common questions and get support for using Opshop Online
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search help articles..."
                className="pl-10 bg-white text-gray-900"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary mr-3" />
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, i) => (
                        <li key={i}>
                          <button className="text-left text-primary hover:underline">
                            {article}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions about Opshop Online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}