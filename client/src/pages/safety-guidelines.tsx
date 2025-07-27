import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  MessageCircle,
  CreditCard,
  MapPin,
  Phone
} from "lucide-react";

export default function SafetyGuidelines() {
  useEffect(() => {
    document.title = "Safety Guidelines - Opshop Online";
  }, []);

  const safetyTips = [
    {
      icon: Eye,
      title: "Verify Before You Buy",
      tips: [
        "Read descriptions and examine photos carefully",
        "Ask questions if anything is unclear",
        "Check seller ratings and reviews",
        "Be wary of prices that seem too good to be true"
      ]
    },
    {
      icon: MessageCircle,
      title: "Communicate Safely",
      tips: [
        "Keep all communication within Opshop Online messaging",
        "Never share personal contact details prematurely",
        "Be polite and professional in all interactions",
        "Report any inappropriate or suspicious messages"
      ]
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      tips: [
        "Only use Opshop Online's secure payment system",
        "Never send money via bank transfer or cash apps",
        "Payment protection covers eligible transactions",
        "Keep receipts and transaction records"
      ]
    },
    {
      icon: MapPin,
      title: "Safe Meetups",
      tips: [
        "Meet in public places during daylight hours",
        "Bring a friend or family member if possible",
        "Trust your instincts - if something feels wrong, leave",
        "Inspect items thoroughly before completing purchase"
      ]
    }
  ];

  const redFlags = [
    "Seller refuses to provide additional photos",
    "Pressure to complete transaction quickly",
    "Requests for payment outside the platform",
    "Prices significantly below market value",
    "Poor grammar or generic item descriptions",
    "Seller has no reviews or very recent account",
    "Asks for personal information unnecessarily",
    "Refuses to meet in public or safe location"
  ];

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Safety Guidelines</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Your safety is our priority. Follow these guidelines to have secure and positive experiences on Opshop Online.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Emergency Alert */}
          <Alert className="mb-12 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> If you feel unsafe at any time during a transaction, trust your instincts and 
              remove yourself from the situation. Contact local authorities if necessary, and report the incident to our support team.
            </AlertDescription>
          </Alert>

          {/* Safety Tips Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {safetyTips.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary mr-3" />
                      <CardTitle>{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Red Flags Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="text-center mb-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Warning Signs to Watch For</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Be cautious if you encounter any of these red flags during transactions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {redFlags.map((flag, index) => (
                <div key={index} className="flex items-start p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="mr-3 h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-red-800">{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* For Sellers Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">For Sellers</CardTitle>
                <CardDescription>
                  Additional safety tips when selling your items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Screen potential buyers through messaging</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Don't leave valuable items unattended during viewings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Have someone else present during home pickups</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Remove personal information from items before selling</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Be honest about item condition to avoid disputes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">For Buyers</CardTitle>
                <CardDescription>
                  Stay safe when purchasing items online
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Research item values before making offers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Test electronic items before purchasing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Bring exact change to avoid handling large amounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Don't feel pressured to buy if item doesn't match description</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">Leave reviews to help other community members</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-bold mb-4">Need Help or Want to Report Something?</h2>
            <p className="text-xl text-green-100 mb-6">
              Our support team is available 24/7 to help with safety concerns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100">Emergency: Call 000</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100">Support: support@opshop.online</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100">Phone: 1800 123 456</p>
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