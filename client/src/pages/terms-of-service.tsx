import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service - Opshop Online";
  }, []);

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Please read these terms carefully before using Opshop Online services.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-8">
                  <strong>Last updated:</strong> January 27, 2025
                </p>

                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-600 mb-6">
                  By accessing and using Opshop Online, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>

                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-6">
                  Opshop Online is an Australian marketplace platform that enables users to buy and sell 
                  pre-loved goods. We provide the platform and tools, but we are not party to transactions 
                  between buyers and sellers.
                </p>

                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• You must be at least 18 years old to create an account</li>
                  <li>• You are responsible for maintaining account security</li>
                  <li>• You must provide accurate and up-to-date information</li>
                  <li>• One person may not maintain multiple accounts</li>
                  <li>• You are responsible for all activities under your account</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">4. Listing Items</h2>
                <h3 className="text-xl font-semibold mb-3">Seller Responsibilities</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Provide accurate descriptions and photos of items</li>
                  <li>• Only list items you legally own and have the right to sell</li>
                  <li>• Set fair and reasonable prices</li>
                  <li>• Respond promptly to buyer inquiries</li>
                  <li>• Ship items within specified timeframes</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Prohibited Items</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Illegal or stolen goods</li>
                  <li>• Weapons or dangerous materials</li>
                  <li>• Adult content or services</li>
                  <li>• Counterfeit or replica items</li>
                  <li>• Items requiring special licenses to sell</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">5. Purchasing Items</h2>
                <h3 className="text-xl font-semibold mb-3">Buyer Responsibilities</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Review item descriptions and photos carefully</li>
                  <li>• Ask questions before purchasing if unsure</li>
                  <li>• Pay promptly after making a purchase</li>
                  <li>• Communicate respectfully with sellers</li>
                  <li>• Leave honest feedback after transactions</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">6. Fees and Payments</h2>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Sellers pay a 10% commission on successful sales</li>
                  <li>• Listing items is free</li>
                  <li>• Payment processing is handled by Stripe and PayPal</li>
                  <li>• All prices are in Australian Dollars (AUD)</li>
                  <li>• Fees are automatically deducted from sale proceeds</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">7. Instant Buyback Program</h2>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• AI-powered valuation provides instant offers</li>
                  <li>• Offers are valid for 24 hours</li>
                  <li>• Payment is made in store credit</li>
                  <li>• Items become property of Opshop Online upon acceptance</li>
                  <li>• All sales are final</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
                <p className="text-gray-600 mb-6">
                  The Opshop Online platform, including all content, features, and functionality, is owned by 
                  Opshop Online and protected by Australian and international copyright, trademark, and other 
                  intellectual property laws.
                </p>

                <h2 className="text-2xl font-bold mb-4">9. Privacy</h2>
                <p className="text-gray-600 mb-6">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the service, to understand our practices.
                </p>

                <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-600 mb-6">
                  Opshop Online acts as a platform connecting buyers and sellers. We are not responsible for 
                  the quality, safety, or legality of items listed, the accuracy of listings, or the 
                  ability of users to complete transactions.
                </p>

                <h2 className="text-2xl font-bold mb-4">11. Dispute Resolution</h2>
                <p className="text-gray-600 mb-6">
                  While we encourage users to resolve disputes directly, we provide mediation services 
                  when needed. Serious disputes may be referred to appropriate authorities or legal processes.
                </p>

                <h2 className="text-2xl font-bold mb-4">12. Account Termination</h2>
                <p className="text-gray-600 mb-6">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage 
                  in prohibited activities. Users may also close their accounts at any time.
                </p>

                <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
                <p className="text-gray-600 mb-6">
                  We may modify these terms from time to time. Significant changes will be communicated 
                  to users, and continued use of the service constitutes acceptance of new terms.
                </p>

                <h2 className="text-2xl font-bold mb-4">14. Governing Law</h2>
                <p className="text-gray-600 mb-6">
                  These terms are governed by the laws of South Australia and Australia. Any disputes 
                  will be resolved in the courts of South Australia.
                </p>

                <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
                <p className="text-gray-600 mb-6">
                  Questions about these Terms of Service should be directed to:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> legal@opshop.online<br />
                    <strong>Phone:</strong> 1800 123 456<br />
                    <strong>Address:</strong> 123 Sustainable Street, Goolwa, SA 5214, Australia<br />
                    <strong>ABN:</strong> 12 345 678 901
                  </p>
                </div>
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