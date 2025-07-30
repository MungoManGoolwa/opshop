import { useState, useEffect } from "react";
import { SEOTester } from "@/utils/seoUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Eye, Search, Share2 } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SEOHead from "@/components/SEOHead";

interface SEOResult {
  pass: boolean;
  message: string;
}

interface SEOResults {
  title: SEOResult;
  description: SEOResult;
  keywords: SEOResult;
  openGraph: SEOResult;
  twitterCard: SEOResult;
  structuredData: SEOResult;
  canonical: SEOResult;
  hreflang: SEOResult;
}

export default function SEOTestPage() {
  const [seoResults, setSeoResults] = useState<SEOResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runSEOTest = () => {
    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const results = SEOTester.testPageSEO();
      setSeoResults(results);
      setLastTestTime(new Date());
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    // Run initial test when component mounts
    runSEOTest();
  }, []);

  const getScoreColor = (passed: number, total: number) => {
    const percentage = (passed / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const passedTests = seoResults ? Object.values(seoResults).filter(result => result.pass).length : 0;
  const totalTests = seoResults ? Object.keys(seoResults).length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="SEO Testing Dashboard"
        description="Comprehensive SEO analysis and testing dashboard for Opshop Online marketplace. Test meta tags, structured data, social media optimization and search engine compatibility."
        keywords="SEO testing, meta tags, structured data, Open Graph, Twitter Cards, search optimization"
        url="/seo-test"
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SEO Testing Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive analysis of search engine optimization elements across the marketplace.
              Test meta tags, structured data, and social media optimization.
            </p>
          </div>

          {/* Score Overview */}
          {seoResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Score Overview
                </CardTitle>
                <CardDescription>
                  Last tested: {lastTestTime?.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    <span className={getScoreColor(passedTests, totalTests)}>
                      {passedTests}/{totalTests}
                    </span>
                    <span className="text-base font-normal text-gray-500 ml-2">
                      ({Math.round((passedTests / totalTests) * 100)}%)
                    </span>
                  </div>
                  <Button 
                    onClick={runSEOTest} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Testing...' : 'Retest SEO'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Results Grid */}
          {seoResults && (
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(seoResults).map(([testName, result]) => (
                <Card key={testName} className={`border-l-4 ${result.pass ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {result.pass ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant={result.pass ? "default" : "destructive"}>
                        {result.pass ? "Passed" : "Failed"}
                      </Badge>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* SEO Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                SEO Best Practices
              </CardTitle>
              <CardDescription>
                Key optimization guidelines for better search engine visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Meta Tags</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Title: 30-60 characters with primary keywords</li>
                    <li>• Description: 120-160 characters, compelling summary</li>
                    <li>• Keywords: 3-10 relevant terms, comma-separated</li>
                    <li>• Canonical URL: Prevent duplicate content issues</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Social Media</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Open Graph: Enhanced Facebook/LinkedIn sharing</li>
                    <li>• Twitter Cards: Optimized Twitter appearance</li>
                    <li>• Images: 1200x630px for best compatibility</li>
                    <li>• Alt text: Describe images for accessibility</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Structured Data</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Product schema: Price, availability, reviews</li>
                    <li>• Breadcrumbs: Navigation structure</li>
                    <li>• Organization: Business information</li>
                    <li>• Website: Search action configuration</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Technical</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Mobile responsiveness and fast loading</li>
                    <li>• HTTPS security and valid HTML</li>
                    <li>• XML sitemap and robots.txt</li>
                    <li>• Internal linking and URL structure</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Quick SEO Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://search.google.com/test/mobile-friendly', '_blank')}
                >
                  Test Mobile Friendly
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://developers.google.com/speed/pagespeed/insights/', '_blank')}
                >
                  PageSpeed Insights
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://search.google.com/structured-data/testing-tool', '_blank')}
                >
                  Test Structured Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://cards-dev.twitter.com/validator', '_blank')}
                >
                  Twitter Card Validator
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Development Helper</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Available in development mode only
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    The SEO tester is available globally. Open browser console and run:
                  </p>
                  <code className="block p-3 bg-blue-100 dark:bg-blue-900 rounded text-blue-900 dark:text-blue-100 font-mono text-xs">
                    window.SEOTester.testPageSEO()
                  </code>
                  <p className="text-blue-700 dark:text-blue-300">
                    This will run all SEO tests and display detailed results in the console.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}