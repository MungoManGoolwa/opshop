import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User, 
  Calendar,
  DollarSign,
  AlertCircle,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface BuybackOffer {
  id: number;
  userId: string;
  itemTitle: string;
  itemDescription: string;
  itemCondition: string;
  aiEvaluatedRetailPrice: string;
  buybackOfferPrice: string;
  status: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
  expiresAt: string;
  createdAt: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export default function AdminBuyback() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<BuybackOffer | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Check admin access
  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch buyback offers
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/buyback/offers/review"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter offers by status
  const filteredOffers = offers.filter((offer: BuybackOffer) => {
    if (activeTab === "all") return true;
    return offer.status === activeTab;
  });

  // Approve offer mutation
  const approveMutation = useMutation({
    mutationFn: async ({ offerId, notes }: { offerId: number; notes?: string }) => {
      return await apiRequest("POST", `/api/admin/buyback/offer/${offerId}/approve`, { notes });
    },
    onSuccess: () => {
      toast({
        title: "Offer Approved",
        description: "The buyback offer has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buyback/offers/review"] });
      setSelectedOffer(null);
      setReviewNotes("");
      setShowApprovalModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the offer.",
        variant: "destructive",
      });
    },
  });

  // Reject offer mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: number; reason: string }) => {
      return await apiRequest("POST", `/api/admin/buyback/offer/${offerId}/reject`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Offer Rejected",
        description: "The buyback offer has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buyback/offers/review"] });
      setSelectedOffer(null);
      setRejectReason("");
      setShowRejectionModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the offer.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (offer: BuybackOffer) => {
    setSelectedOffer(offer);
    setReviewNotes("");
    setShowApprovalModal(true);
    setShowRejectionModal(false);
  };

  const handleReject = (offer: BuybackOffer) => {
    setSelectedOffer(offer);
    setRejectReason("");
    setShowRejectionModal(true);
    setShowApprovalModal(false);
  };

  const confirmApproval = () => {
    if (selectedOffer) {
      approveMutation.mutate({
        offerId: selectedOffer.id,
        notes: reviewNotes,
      });
    }
  };

  const confirmRejection = () => {
    if (selectedOffer && rejectReason.trim()) {
      rejectMutation.mutate({
        offerId: selectedOffer.id,
        reason: rejectReason.trim(),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "expired": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading buyback offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Buyback Offer Management</h1>
        <p className="text-gray-600">
          Review and manage AI-generated buyback offers from users
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({offers.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({offers.filter((o: BuybackOffer) => o.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({offers.filter((o: BuybackOffer) => o.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({offers.filter((o: BuybackOffer) => o.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({offers.filter((o: BuybackOffer) => o.status === 'accepted').length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({offers.filter((o: BuybackOffer) => o.status === 'expired').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOffers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No offers found</h3>
                <p className="text-gray-600">
                  {activeTab === "pending" 
                    ? "No pending offers need your review right now."
                    : `No ${activeTab} offers at the moment.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOffers.map((offer: BuybackOffer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{offer.itemTitle}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {offer.userFirstName} {offer.userLastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {offer.userEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(offer.createdAt), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                      </div>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(offer.status)}`}>
                        {getStatusIcon(offer.status)}
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Item Condition</Label>
                        <p className="font-medium">{offer.itemCondition}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">AI Estimated Value</Label>
                        <p className="font-medium text-blue-600">
                          ${parseFloat(offer.aiEvaluatedRetailPrice).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Buyback Offer (50%)</Label>
                        <p className="font-medium text-green-600">
                          ${parseFloat(offer.buybackOfferPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {offer.itemDescription && (
                      <div>
                        <Label className="text-xs text-gray-500">Description</Label>
                        <p className="text-sm">{offer.itemDescription}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires: {format(new Date(offer.expiresAt), "MMM d, yyyy HH:mm")}
                      </span>
                      {offer.emailSent && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Mail className="h-3 w-3" />
                          Email sent
                        </span>
                      )}
                    </div>

                    {offer.adminNotes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-xs text-gray-500">Admin Notes</Label>
                        <p className="text-sm mt-1">{offer.adminNotes}</p>
                        {offer.reviewedBy && offer.reviewedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Reviewed by {offer.reviewedBy} on {format(new Date(offer.reviewedAt), "MMM d, yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                    )}

                    {offer.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(offer)}
                          className="flex-1"
                          variant="default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(offer)}
                          className="flex-1"
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {selectedOffer && showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Buyback Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmApproval}
                  disabled={approveMutation.isPending}
                  className="flex-1"
                >
                  {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOffer(null);
                    setReviewNotes("");
                    setShowApprovalModal(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedOffer && showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Buyback Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this offer..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmRejection}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOffer(null);
                    setRejectReason("");
                    setShowRejectionModal(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}