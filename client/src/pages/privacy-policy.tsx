import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - Opshop Online";
  }, []);

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
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

                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 mb-6">
                  We collect information you provide directly to us, such as when you create an account, 
                  list items for sale, make purchases, or contact us for support.
                </p>

                <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Name and contact information (email, phone number, address)</li>
                  <li>• Profile information and preferences</li>
                  <li>• Payment information (processed securely by Stripe and PayPal)</li>
                  <li>• Communication records and customer service interactions</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Device information and browser type</li>
                  <li>• IP address and location data</li>
                  <li>• Usage patterns and interaction with our services</li>
                  <li>• Search queries and listing activities</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Provide and improve our marketplace services</li>
                  <li>• Process transactions and payments</li>
                  <li>• Communicate with you about your account and transactions</li>
                  <li>• Prevent fraud and ensure platform security</li>
                  <li>• Comply with legal obligations</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell or rent your personal information. We may share your information in these situations:
                </p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• With other users as necessary to complete transactions</li>
                  <li>• With service providers who help operate our platform</li>
                  <li>• When required by law or to protect our rights</li>
                  <li>• In connection with a business transfer or merger</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-600 mb-6">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. All 
                  payment information is processed securely through our payment partners.
                </p>

                <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                <p className="text-gray-600 mb-4">Under Australian Privacy Law, you have the right to:</p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li>• Access and update your personal information</li>
                  <li>• Request deletion of your data</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Lodge a complaint with the Privacy Commissioner</li>
                </ul>

                <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-600 mb-6">
                  We use cookies and similar technologies to improve your experience, analyze usage, 
                  and provide personalized content. You can control cookie settings through your browser.
                </p>

                <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                <p className="text-gray-600 mb-6">
                  Our services are not intended for children under 13. We do not knowingly collect 
                  personal information from children under 13.
                </p>

                <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
                <p className="text-gray-600 mb-6">
                  We may update this privacy policy from time to time. We will notify you of any 
                  significant changes by posting the new policy on this page.
                </p>

                <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                <p className="text-gray-600 mb-6">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> privacy@opshop.online<br />
                    <strong>Phone:</strong> 1800 123 456<br />
                    <strong>Address:</strong> 123 Sustainable Street, Goolwa, SA 5214, Australia
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