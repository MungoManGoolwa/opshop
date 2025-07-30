import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { PrivateRoute } from "@/components/PrivateRoute";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText, 
  Shield, 
  AlertTriangle,
  Info,
  Camera,
  Star
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DocumentType {
  type: string;
  points: number;
  category: 'photo_id' | 'supporting';
  displayName: string;
  description: string;
  requiresExpiry?: boolean;
  requiresBack?: boolean;
}

interface VerificationDocument {
  id: number;
  documentType: string;
  documentNumber?: string;
  documentPoints: number;
  frontImageUrl?: string;
  backImageUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
  expiryDate?: string;
  createdAt: string;
}

interface VerificationSubmission {
  id: number;
  totalPoints: number;
  hasPhotoId: boolean;
  submissionStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

interface VerificationStatus {
  submission?: VerificationSubmission;
  documents: VerificationDocument[];
  totalPoints: number;
  hasPhotoId: boolean;
  isEligible: boolean;
}

export default function SellerVerification() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string>("");
  const [backImagePreview, setBackImagePreview] = useState<string>("");

  // Fetch verification status
  const { data: verificationStatus, isLoading } = useQuery<VerificationStatus>({
    queryKey: ["/api/seller/verification/status"],
    enabled: isAuthenticated,
  });

  // Fetch available document types
  const { data: documentTypes } = useQuery<DocumentType[]>({
    queryKey: ["/api/seller/verification/document-types"],
    enabled: isAuthenticated,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/seller/verification/upload-document", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/verification/status"] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully and is pending verification.",
      });
      // Reset form
      setSelectedDocumentType("");
      setDocumentNumber("");
      setExpiryDate("");
      setFrontImage(null);
      setBackImage(null);
      setFrontImagePreview("");
      setBackImagePreview("");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload documents.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  // Submit for review mutation
  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/seller/verification/submit", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/verification/status"] });
      toast({
        title: "Submitted for Review",
        description: "Your verification documents have been submitted for admin review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit for review",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, isBack: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isBack) {
        setBackImage(file);
        setBackImagePreview(URL.createObjectURL(file));
      } else {
        setFrontImage(file);
        setFrontImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleUploadDocument = () => {
    if (!selectedDocumentType || !frontImage) {
      toast({
        title: "Missing Information",
        description: "Please select document type and upload at least the front image.",
        variant: "destructive",
      });
      return;
    }

    const selectedDoc = documentTypes?.find(doc => doc.type === selectedDocumentType);
    if (selectedDoc?.requiresBack && !backImage) {
      toast({
        title: "Back Image Required",
        description: "This document type requires both front and back images.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("documentType", selectedDocumentType);
    formData.append("documentNumber", documentNumber);
    formData.append("expiryDate", expiryDate);
    formData.append("frontImage", frontImage);
    if (backImage) {
      formData.append("backImage", backImage);
    }

    uploadDocumentMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const canSubmitForReview = verificationStatus?.isEligible && 
    verificationStatus?.submission?.submissionStatus === 'draft';

  const isUnderReview = verificationStatus?.submission?.submissionStatus === 'submitted' ||
    verificationStatus?.submission?.submissionStatus === 'under_review';

  const isApproved = verificationStatus?.submission?.submissionStatus === 'approved';
  const isRejected = verificationStatus?.submission?.submissionStatus === 'rejected';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Seller Verification</h1>
          <p className="text-gray-600 mb-8">Please log in to access seller verification.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Login to Continue
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <PrivateRoute allowedRoles={["seller", "business", "admin"]}>
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              Seller Verification
            </h1>
            <p className="text-gray-600 mt-2">
              Verify your identity with 100 points of ID to become a trusted seller
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Loading verification status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {verificationStatus?.totalPoints || 0}/100
                      </div>
                      <p className="text-sm text-gray-600">Points Achieved</p>
                      <Progress 
                        value={(verificationStatus?.totalPoints || 0)} 
                        className="mt-2"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {verificationStatus?.hasPhotoId ? (
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500 mx-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Photo ID Required</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {isApproved ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Star className="mr-1 h-4 w-4" />
                            Verified Seller
                          </Badge>
                        ) : isUnderReview ? (
                          <Badge variant="secondary">Under Review</Badge>
                        ) : isRejected ? (
                          <Badge variant="destructive">Rejected</Badge>
                        ) : verificationStatus?.isEligible ? (
                          <Badge variant="outline">Ready to Submit</Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Current Status</p>
                    </div>
                  </div>

                  {isApproved && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Congratulations!</strong> You are now a verified seller. You can list items with full marketplace privileges and reduced commission rates.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isRejected && verificationStatus?.submission?.rejectionReason && (
                    <Alert className="mt-4" variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Verification Rejected:</strong> {verificationStatus.submission.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {canSubmitForReview && (
                    <Alert className="mt-4 border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        You have met the requirements! You can now submit your documents for admin verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="requirements" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="documents">Upload Documents</TabsTrigger>
                  <TabsTrigger value="history">Document History</TabsTrigger>
                </TabsList>

                {/* Requirements Tab */}
                <TabsContent value="requirements">
                  <Card>
                    <CardHeader>
                      <CardTitle>100 Points of ID Requirements</CardTitle>
                      <CardDescription>
                        You need to provide documents totaling 100 points, including at least one photo ID (passport or driver's licence).
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-red-600 mb-2">Photo ID (Required - Choose One)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="border rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">Australian Passport</h4>
                                  <p className="text-sm text-gray-600">Current Australian passport</p>
                                </div>
                                <Badge variant="outline">70 points</Badge>
                              </div>
                            </div>
                            <div className="border rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">Driver's Licence</h4>
                                  <p className="text-sm text-gray-600">Current Australian driver's licence</p>
                                </div>
                                <Badge variant="outline">40 points</Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Supporting Documents</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                              { name: "Birth Certificate", points: 70 },
                              { name: "Citizenship Certificate", points: 70 },
                              { name: "Medicare Card", points: 25 },
                              { name: "Bank Statement", points: 25 },
                              { name: "Utility Bill", points: 25 },
                              { name: "Tax Assessment Notice", points: 25 },
                              { name: "Centrelink Card", points: 25 },
                            ].map((doc) => (
                              <div key={doc.name} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium text-sm">{doc.name}</h4>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">{doc.points} pts</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Important:</strong> All documents must be current and clearly legible. 
                            Expired documents will not be accepted. Allow 2-3 business days for verification.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Upload Documents Tab */}
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Verification Documents</CardTitle>
                      <CardDescription>
                        Upload clear, high-quality images of your identification documents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isApproved ? (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Your verification is complete. No additional documents needed.
                          </AlertDescription>
                        </Alert>
                      ) : isUnderReview ? (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Your documents are currently under review. Please wait for admin verification.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="document-type">Document Type</Label>
                              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {documentTypes?.map((docType) => (
                                    <SelectItem key={docType.type} value={docType.type}>
                                      {docType.displayName} ({docType.points} points)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedDocumentType && (
                              <>
                                <div>
                                  <Label htmlFor="document-number">Document Number (Optional)</Label>
                                  <Input
                                    id="document-number"
                                    value={documentNumber}
                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                    placeholder="Enter document number"
                                  />
                                </div>

                                {documentTypes?.find(doc => doc.type === selectedDocumentType)?.requiresExpiry && (
                                  <div>
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <Input
                                      id="expiry-date"
                                      type="date"
                                      value={expiryDate}
                                      onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="front-image">Front Image *</Label>
                                    <div className="mt-2">
                                      <Input
                                        id="front-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, false)}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                                      />
                                      {frontImagePreview && (
                                        <div className="mt-2">
                                          <img 
                                            src={frontImagePreview} 
                                            alt="Document front preview" 
                                            className="w-full h-32 object-cover rounded-lg border"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {documentTypes?.find(doc => doc.type === selectedDocumentType)?.requiresBack && (
                                    <div>
                                      <Label htmlFor="back-image">Back Image *</Label>
                                      <div className="mt-2">
                                        <Input
                                          id="back-image"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleFileChange(e, true)}
                                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                                        />
                                        {backImagePreview && (
                                          <div className="mt-2">
                                            <img 
                                              src={backImagePreview} 
                                              alt="Document back preview" 
                                              className="w-full h-32 object-cover rounded-lg border"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <Button 
                                  onClick={handleUploadDocument}
                                  disabled={uploadDocumentMutation.isPending}
                                  className="w-full"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                                </Button>
                              </>
                            )}
                          </div>

                          {canSubmitForReview && (
                            <div className="border-t pt-6">
                              <Alert className="mb-4">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                  You have uploaded sufficient documents. Submit for admin verification when ready.
                                </AlertDescription>
                              </Alert>
                              <Button 
                                onClick={() => submitForReviewMutation.mutate()}
                                disabled={submitForReviewMutation.isPending}
                                size="lg"
                                className="w-full"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {submitForReviewMutation.isPending ? "Submitting..." : "Submit for Verification"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Document History Tab */}
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Uploaded Documents</CardTitle>
                      <CardDescription>
                        View the status of all your uploaded verification documents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {verificationStatus?.documents.length ? (
                        <div className="space-y-4">
                          {verificationStatus.documents.map((document) => (
                            <div key={document.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                  {getStatusIcon(document.verificationStatus)}
                                  <div>
                                    <h3 className="font-medium">
                                      {documentTypes?.find(dt => dt.type === document.documentType)?.displayName || document.documentType}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Uploaded {new Date(document.createdAt).toLocaleDateString()}
                                    </p>
                                    {document.documentNumber && (
                                      <p className="text-sm text-gray-600">
                                        Document #: {document.documentNumber}
                                      </p>
                                    )}
                                    {document.rejectionReason && (
                                      <p className="text-sm text-red-600 mt-1">
                                        Rejection reason: {document.rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(document.verificationStatus)}
                                  <p className="text-sm text-gray-600 mt-1">
                                    {document.documentPoints} points
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No documents uploaded yet</p>
                          <p className="text-sm text-gray-500">
                            Start by uploading your identification documents in the Upload tab
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </PrivateRoute>
  );
}