import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, Settings, Download, Trash2, Mail, Globe, Calendar, Lock, UserCheck } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information 
            in compliance with Australian Privacy Act 1988, GDPR, and international privacy standards.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last Updated: January 29, 2025
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              GDPR Compliant
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Your Privacy Rights
            </CardTitle>
            <CardDescription>
              Quick access to your data protection rights under GDPR and Australian Privacy Act
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="flex items-center gap-2 justify-start h-auto py-3">
                <Eye className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">View Your Data</div>
                  <div className="text-xs text-muted-foreground">Access personal info</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 justify-start h-auto py-3">
                <Download className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Download Data</div>
                  <div className="text-xs text-muted-foreground">Export your information</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 justify-start h-auto py-3">
                <Settings className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Privacy Settings</div>
                  <div className="text-xs text-muted-foreground">Control your preferences</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 justify-start h-auto py-3">
                <Trash2 className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Delete Account</div>
                  <div className="text-xs text-muted-foreground">Remove your data</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <ScrollArea className="h-[800px]">
          <div className="space-y-8">
            
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Personal Information</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• <strong>Account Information:</strong> Name, email address, phone number, profile picture</li>
                    <li>• <strong>Identity Verification:</strong> Government-issued ID for seller verification (stored encrypted)</li>
                    <li>• <strong>Contact Details:</strong> Billing and shipping addresses, communication preferences</li>
                    <li>• <strong>Business Information:</strong> ABN, business name, tax details for sellers</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Transaction Data</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Purchase and sales history, order details, payment information</li>
                    <li>• Product listings, descriptions, photos, pricing information</li>
                    <li>• Communication between buyers and sellers</li>
                    <li>• Reviews, ratings, and feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Technical Information</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• IP address, browser type, device information, operating system</li>
                    <li>• Usage patterns, search queries, clicked links, time spent on pages</li>
                    <li>• Location data (with your consent) for local search results</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Service Provision</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Process transactions and payments</li>
                      <li>• Facilitate communication between users</li>
                      <li>• Provide customer support</li>
                      <li>• Verify user identity and prevent fraud</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Platform Improvement</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Analyze usage patterns and preferences</li>
                      <li>• Improve search and recommendation algorithms</li>
                      <li>• Develop new features and services</li>
                      <li>• Ensure platform security and stability</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Communication</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Send transaction confirmations</li>
                      <li>• Provide order updates and notifications</li>
                      <li>• Share promotional offers (with consent)</li>
                      <li>• Send important platform updates</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Legal Compliance</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Comply with Australian and international laws</li>
                      <li>• Respond to legal requests and investigations</li>
                      <li>• Enforce our terms of service</li>
                      <li>• Protect against fraud and abuse</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Basis for Processing (GDPR) */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-600" />
                  3. Legal Basis for Processing (GDPR)
                </CardTitle>
                <CardDescription>
                  For users in the EU/EEA, we process your data under these legal bases:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Contract Performance</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Processing necessary to provide our marketplace services, process transactions, and fulfill our obligations to you.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Legitimate Interests</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Platform security, fraud prevention, service improvement, and providing personalized experiences while balancing your privacy rights.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Your Consent</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Marketing communications, location services, and optional features (you can withdraw consent at any time).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Legal Compliance</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Compliance with Australian Privacy Act, tax obligations, anti-money laundering laws, and court orders.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  4. Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600 dark:text-green-400">GDPR Rights (EU/EEA Users)</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Right of Access:</strong> Request copies of your personal data
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Settings className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Right to Rectification:</strong> Correct inaccurate personal data
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trash2 className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Right to Erasure:</strong> Request deletion of your personal data
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Right to Restrict Processing:</strong> Limit how we use your data
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Download className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Right to Data Portability:</strong> Receive your data in a structured format
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600 dark:text-green-400">Australian Privacy Rights</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Eye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Access:</strong> Request access to your personal information
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Settings className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Correction:</strong> Correct inaccurate or outdated information
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Complaints:</strong> Lodge complaints with the Privacy Commissioner
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Anonymity:</strong> Interact anonymously where possible
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    To exercise your rights, contact us at privacy@opshop.online or use the buttons above.
                    We will respond within 30 days (1 month for GDPR requests).
                  </p>
                  <Button className="mr-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Privacy Team
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing and International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Data Sharing and International Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">When We Share Your Data</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• <strong>Service Providers:</strong> Payment processors, shipping companies, cloud storage (with data protection agreements)</li>
                    <li>• <strong>Other Users:</strong> Public profile information, reviews, and listing details as part of marketplace functionality</li>
                    <li>• <strong>Legal Requirements:</strong> When required by law, court orders, or to prevent fraud and ensure safety</li>
                    <li>• <strong>Business Transfers:</strong> In case of merger, acquisition, or sale (with equivalent privacy protections)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">International Transfers</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Your data may be transferred to and processed in countries outside Australia/EU for:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Cloud hosting and data storage (AWS, Google Cloud with appropriate safeguards)</li>
                    <li>• Payment processing (Stripe, PayPal with Standard Contractual Clauses)</li>
                    <li>• Customer support services (with GDPR-compliant processors)</li>
                  </ul>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    We ensure adequate protection through approved transfer mechanisms under GDPR Article 46.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Account Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Retained while your account is active, plus 7 years after account closure for legal compliance.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Transaction Records</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Kept for 7 years from transaction date for tax, warranty, and legal requirements.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Marketing Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Deleted immediately when you unsubscribe or withdraw consent.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Usage Analytics</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Aggregated and anonymized data may be retained indefinitely for service improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  7. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Privacy Enquiries</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> privacy@opshop.online</p>
                      <p><strong>Phone:</strong> 1800-OPSHOP (1800-677-467)</p>
                      <p><strong>Address:</strong> Level 15, 123 Collins Street, Melbourne VIC 3000</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Data Protection Officer (EU)</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> dpo@opshop.online</p>
                      <p><strong>EU Representative:</strong> Privacy Partners Ltd</p>
                      <p><strong>Address:</strong> 123 Privacy Street, Dublin, Ireland</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    You have the right to lodge a complaint with your local data protection authority:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Australia: OAIC (oaic.gov.au)</Badge>
                    <Badge variant="outline">EU: Your local DPA</Badge>
                    <Badge variant="outline">UK: ICO (ico.org.uk)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This privacy policy is available in multiple languages and formats upon request.
            We regularly review and update our privacy practices to ensure continued compliance.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/terms-of-service">
              <Button variant="outline" size="sm">Terms of Service</Button>
            </Link>
            <Link href="/cookie-policy">
              <Button variant="outline" size="sm">Cookie Policy</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="sm">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}