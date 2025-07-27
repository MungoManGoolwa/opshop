import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  TrendingUp,
  Info,
  CreditCard
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InstantBuyback() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    itemTitle: "",
    itemDescription: "",
    itemCondition: "",
    itemAge: "",
    itemBrand: "",
    itemCategory: "",
  });

  const [currentOffer, setCurrentOffer] = useState<any>(null);

  useEffect(() => {
    document.title = "Instant Buyback - Opshop Online";
  }, []);

  // Fetch user's store credit balance
  const { data: creditBalance } = useQuery({
    queryKey: ["/api/store-credit/balance"],
    enabled: isAuthenticated,
  });

  // Fetch user's previous offers
  const { data: previousOffers } = useQuery({
    queryKey: ["/api/buyback/offers"],
    enabled: isAuthenticated,
  });

  // Create buyback offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/buyback/offer", formData);
      return response;
    },
    onSuccess: (data: any) => {
      setCurrentOffer(data.offer);
      toast({
        title: "AI Evaluation Complete!",
        description: `We can offer you $${data.offer?.buybackOfferPrice} in store credit for your item.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "Please log in to get an instant buyback offer.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Evaluation Failed",
        description: "Unable to evaluate your item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return await apiRequest("POST", `/api/buyback/offer/${offerId}/accept`, {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/store-credit/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buyback/offers"] });
      
      toast({
        title: "Offer Accepted!",
        description: `$${data.storeCreditAdded || data.creditAdded} has been added to your store credit.`,
      });
      
      setCurrentOffer(null);
      setFormData({
        itemTitle: "",
        itemDescription: "",
        itemCondition: "",
        itemAge: "",
        itemBrand: "",
        itemCategory: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept offer.",
        variant: "destructive",
      });
    },
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      return await apiRequest("POST", `/api/buyback/offer/${offerId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buyback/offers"] });
      toast({
        title: "Offer Rejected",
        description: "You can submit another item for evaluation anytime.",
      });
      setCurrentOffer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to reject offer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemTitle || !formData.itemCondition) {
      toast({
        title: "Missing Information",
        description: "Please provide item title and condition.",
        variant: "destructive",
      });
      return;
    }
    createOfferMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Instant Buyback</h1>
          <p className="text-gray-600 mb-8">Please log in to get instant cash offers for your items.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Login to Continue
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary">
              <Sparkles className="inline w-8 h-8 mr-2" />
              Instant Buyback
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get immediate store credit for your items. Our AI technology evaluates your items 
              and offers you a buy price as instant store credit.
            </p>
          </div>

          {/* Store Credit Balance */}
          {creditBalance && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Your current store credit balance: <strong>${(creditBalance as any)?.balance || '0.00'}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Evaluation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Item Details
                </CardTitle>
                <CardDescription>
                  Provide details about your item for AI evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Title *</label>
                    <Input
                      placeholder="e.g., iPhone 13 Pro Max 256GB"
                      value={formData.itemTitle}
                      onChange={(e) => handleInputChange("itemTitle", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Condition *</label>
                    <Select 
                      value={formData.itemCondition}
                      onValueChange={(value) => handleInputChange("itemCondition", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent - Like New</SelectItem>
                        <SelectItem value="good">Good - Minor wear</SelectItem>
                        <SelectItem value="fair">Fair - Noticeable wear</SelectItem>
                        <SelectItem value="poor">Poor - Heavy wear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Describe your item's condition, features, and any flaws..."
                      value={formData.itemDescription}
                      onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <Select 
                        value={formData.itemAge}
                        onValueChange={(value) => handleInputChange("itemAge", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Item age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New (0-6 months)</SelectItem>
                          <SelectItem value="recent">Recent (6-12 months)</SelectItem>
                          <SelectItem value="1-2-years">1-2 years</SelectItem>
                          <SelectItem value="2-5-years">2-5 years</SelectItem>
                          <SelectItem value="5-plus-years">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand</label>
                      <Input
                        placeholder="e.g., Apple, Samsung"
                        value={formData.itemBrand}
                        onChange={(e) => handleInputChange("itemBrand", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select 
                      value={formData.itemCategory}
                      onValueChange={(value) => handleInputChange("itemCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="toys">Toys & Games</SelectItem>
                        <SelectItem value="books">Books & Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createOfferMutation.isPending}
                  >
                    {createOfferMutation.isPending ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                        AI Evaluating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Instant Offer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Offer or How It Works */}
            {currentOffer ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Your Offer
                  </CardTitle>
                  <CardDescription>
                    AI evaluation completed for: {currentOffer.itemTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${currentOffer.buybackOfferPrice}
                    </div>
                    <p className="text-sm text-gray-600">Store Credit Offer</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on retail value of ${currentOffer.aiEvaluatedRetailPrice}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <Badge variant="outline">{currentOffer.itemCondition}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-orange-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(currentOffer.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => acceptOfferMutation.mutate(currentOffer.id)}
                      disabled={acceptOfferMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => rejectOfferMutation.mutate(currentOffer.id)}
                      disabled={rejectOfferMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">AI Evaluation</h4>
                        <p className="text-sm text-gray-600">
                          Our AI analyzes your item's condition, brand, age, and market demand
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Instant Offer</h4>
                        <p className="text-sm text-gray-600">
                          Receive 50% of retail value as store credit immediately
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Shop Immediately</h4>
                        <p className="text-sm text-gray-600">
                          Use your store credit to purchase any item on our marketplace
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Fair pricing guaranteed:</strong> Our AI considers current market trends, 
                      item condition, and demand to offer competitive store credit.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Previous Offers */}
          {previousOffers && Array.isArray(previousOffers) && previousOffers.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Previous Offers</CardTitle>
                <CardDescription>Your recent buyback offer history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(previousOffers) ? previousOffers : []).slice(0, 5).map((offer: any) => (
                    <div key={offer.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{offer.itemTitle}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${offer.buybackOfferPrice}</div>
                        <Badge variant={
                          offer.status === 'accepted' ? 'default' : 
                          offer.status === 'rejected' ? 'destructive' : 
                          offer.status === 'expired' ? 'secondary' : 'outline'
                        }>
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}