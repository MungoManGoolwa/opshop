import { useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Users, Heart, Shield, Globe, Truck } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "About Us - Opshop Online";
  }, []);

  return (
    <div className="min-h-screen bg-neutral">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Opshop Online</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Australia's premier sustainable marketplace connecting conscious consumers with quality pre-loved goods across the continent.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-primary mb-6">Our Story</h2>
              
              <p className="text-gray-700 mb-6">
                Founded in the beautiful coastal town of Goolwa, South Australia, Opshop Online was born from a simple yet powerful vision: to create Australia's most sustainable and accessible marketplace for second-hand goods. What started as a local initiative to reduce waste and promote circular economy principles has grown into a thriving national platform that serves communities across all Australian states and territories.
              </p>

              <p className="text-gray-700 mb-6">
                Our founder, Brendan Faulds, recognized the urgent need for a comprehensive platform that could bridge the gap between those looking to declutter responsibly and those seeking quality, affordable alternatives to fast fashion and mass-produced goods. With over 50,000 active users and more than 1 million items successfully saved from landfill, we've proven that sustainable commerce isn't just possible—it's profitable, practical, and essential for our planet's future.
              </p>

              <h2 className="text-3xl font-bold text-primary mb-6 mt-12">Our Mission</h2>
              
              <p className="text-gray-700 mb-6">
                Opshop Online is dedicated to revolutionizing how Australians buy and sell pre-loved goods by creating a trusted, efficient, and environmentally conscious marketplace. We believe that every item deserves a second chance, every transaction should benefit our community, and every choice we make should contribute to a more sustainable future.
              </p>

              <p className="text-gray-700 mb-8">
                We're not just facilitating transactions—we're building a movement that challenges the throwaway culture and demonstrates that quality, style, and sustainability can coexist beautifully.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Recycle className="h-6 w-6 text-success" />
                    <span>Sustainability First</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Every transaction on our platform contributes to reducing waste and promoting circular economy principles across Australia.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Community Driven</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We foster connections between buyers and sellers, creating a supportive community that values quality and conscious consumption.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-accent" />
                    <span>Trust & Safety</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our comprehensive verification system and secure payment processing ensure safe, reliable transactions for all users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-secondary" />
                    <span>Australian Focus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Built specifically for the Australian market, with local shipping solutions and understanding of regional needs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    <span>Social Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We partner with local charities and support programs that make sustainable living accessible to all Australians.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-6 w-6 text-blue-500" />
                    <span>Innovation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Cutting-edge AI technology helps match buyers with perfect items and assists sellers with optimal pricing and descriptions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-primary mb-6">How We're Making a Difference</h2>
              
              <p className="text-gray-700 mb-6">
                Since our launch, Opshop Online has facilitated the exchange of over 1 million pre-loved items, preventing them from entering Australia's waste stream. Our platform has generated over $2.3 million in savings for Australian families while providing income opportunities for thousands of sellers across the country.
              </p>

              <p className="text-gray-700 mb-6">
                Through our innovative commission structure, we ensure that sellers receive fair compensation for their items (90% of sale price for items over $10, with a minimal $1 fee for smaller items). Our optional "Quick Sale" program allows sellers to receive instant payment at 50% of AI-determined market value, which we then resell at market price, ensuring items find new homes quickly while providing immediate value to sellers.
              </p>

              <h2 className="text-3xl font-bold text-primary mb-6 mt-12">Our Technology</h2>
              
              <p className="text-gray-700 mb-6">
                Built on robust, scalable infrastructure with Progressive Web App capabilities, Opshop Online provides a seamless experience across all devices. Our AI-powered features include automated product categorization, intelligent pricing suggestions, and personalized recommendations that help users discover items they'll love.
              </p>

              <p className="text-gray-700 mb-6">
                We integrate with Australia Post and Sendle to provide convenient shipping solutions, and our secure payment processing through Stripe and PayPal ensures every transaction is protected. Our comprehensive messaging system facilitates clear communication between buyers and sellers, while our review and rating system builds trust within our community.
              </p>

              <h2 className="text-3xl font-bold text-primary mb-6 mt-12">Looking Forward</h2>
              
              <p className="text-gray-700 mb-6">
                As we continue to grow, our commitment to sustainability and community remains unwavering. We're constantly developing new features to make sustainable shopping even easier and more rewarding. From expanding our verification programs to introducing new categories and improving our AI recommendations, every update brings us closer to our vision of a truly circular economy.
              </p>

              <p className="text-gray-700 mb-8">
                Join us in creating a more sustainable future for Australia. Whether you're looking to find unique treasures, declutter responsibly, or build a sustainable business, Opshop Online is your trusted partner in conscious commerce.
              </p>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 rounded-lg p-8 mt-12">
              <h3 className="text-2xl font-bold text-center mb-8">Our Impact</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">1M+</div>
                  <div className="text-gray-600">Items Saved from Landfill</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success">$2.3M</div>
                  <div className="text-gray-600">Total Savings Generated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">50K+</div>
                  <div className="text-gray-600">Active Community Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">98%</div>
                  <div className="text-gray-600">Customer Satisfaction Rate</div>
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
