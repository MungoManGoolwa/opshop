import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProtectedRoute from "@/components/ui/protected-route";
import { ArrowLeft, Package, Upload, X } from "lucide-react";
import { Link } from "wouter";

const editListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  condition: z.string().min(1, "Condition is required"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  shippingCost: z.string().optional(),
});

type EditListingForm = z.infer<typeof editListingSchema>;

export default function EditListing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);

  // Type guard for user with accountType
  const isAdmin = user && typeof user === 'object' && user !== null && 'accountType' in user && user.accountType === 'admin';

  // Get product ID from URL params
  const params = useParams();
  const productId = parseInt(params.id || '0');

  useEffect(() => {
    document.title = "Edit Listing - Opshop Online";
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch the product data to pre-populate the form
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/products", productId],
    enabled: productId > 0,
  });

  // Type the product data properly
  const productData = product as any;

  const form = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      condition: "",
      categoryId: "",
      brand: "",
      size: "",
      color: "",
      material: "",
      location: "",
      shippingCost: "",
    },
  });

  // Pre-populate form when product data loads
  useEffect(() => {
    if (productData) {
      form.reset({
        title: productData.title || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        condition: productData.condition || "",
        categoryId: productData.categoryId?.toString() || "",
        brand: productData.brand || "",
        size: productData.size || "",
        color: productData.color || "",
        material: productData.material || "",
        location: productData.location || "",
        shippingCost: productData.shippingCost?.toString() || "",
      });
      
      // Set existing photos
      if (productData.photos && Array.isArray(productData.photos)) {
        setExistingPhotos(productData.photos);
      } else if (productData.images && Array.isArray(productData.images)) {
        // Fallback for legacy image format
        const legacyPhotos = productData.images.map((url: string, index: number) => ({
          url,
          filename: `legacy_${index}`,
          originalName: `image_${index}`,
        }));
        setExistingPhotos(legacyPhotos);
      }
    }
  }, [productData, form]);

  // Photo upload mutation
  const uploadPhotosMutation = useMutation({
    mutationFn: async (photos: File[]) => {
      const formData = new FormData();
      photos.forEach(photo => formData.append('photos', photo));
      
      const endpoint = isAdmin 
        ? `/api/admin/listings/${productId}/photos`
        : `/api/products/${productId}/photos`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload photos');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: `${result.addedPhotos?.length || 0} photos uploaded successfully!`,
      });
      setImages([]);
      setImagePreviews([]);
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    },
  });

  // Photo deletion mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoIndex: number) => {
      console.log(`Deleting photo at index ${photoIndex} from ${existingPhotos.length} total photos`);
      const endpoint = isAdmin 
        ? `/api/admin/listings/${productId}/photos/${photoIndex}`
        : `/api/products/${productId}/photos/${photoIndex}`;
      
      // Use direct fetch since CSRF is temporarily disabled
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete photo');
      }
      
      return response.json();
    },
    onSuccess: (result, photoIndex) => {
      toast({
        title: "Success",
        description: "Photo deleted successfully!",
      });
      // Refresh the product data instead of manipulating local state
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      // Force refetch to get updated photo list
      queryClient.refetchQueries({ queryKey: ["/api/products", productId] });
    },
    onError: (error: any) => {
      console.error("Photo deletion failed:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: async (data: EditListingForm) => {
      // Convert form data to proper format for backend
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        condition: data.condition,
        categoryId: parseInt(data.categoryId),
        brand: data.brand || "",
        size: data.size || "",
        color: data.color || "",
        material: data.material || "",
        location: data.location,
        shippingCost: data.shippingCost || "0.00",
      };
      
      // Use admin endpoint if user is admin, otherwise use regular endpoint
      const endpoint = isAdmin 
        ? `/api/admin/products/${productId}` 
        : `/api/products/${productId}`;
      
      return apiRequest("PUT", endpoint, productData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      
      // Note: New photos are uploaded separately via the Upload button
      
      // Redirect based on user role
      if (isAdmin) {
        setLocation("/admin/site");
      } else {
        setLocation("/seller/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = existingPhotos.length + images.length + files.length;
    
    if (totalPhotos > 10) {
      toast({
        title: "Too many images",
        description: "You can have a maximum of 10 images total",
        variant: "destructive",
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (photoIndex: number) => {
    deletePhotoMutation.mutate(photoIndex);
  };

  const uploadNewPhotos = () => {
    if (images.length > 0) {
      uploadPhotosMutation.mutate(images);
    }
  };

  const onSubmit = (data: EditListingForm) => {
    updateListingMutation.mutate(data);
  };

  if (productLoading) {
    return (
      <ProtectedRoute allowedRoles={["seller", "business", "admin"]}>
        <div className="min-h-screen bg-neutral">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading product details...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!productData) {
    return (
      <ProtectedRoute allowedRoles={["seller", "business", "admin"]}>
        <div className="min-h-screen bg-neutral">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Product not found.</p>
                <Button asChild className="mt-4">
                  <Link href="/seller/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["seller", "business", "admin"]}>
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={isAdmin ? "/admin/site" : "/seller/dashboard"}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {isAdmin ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold">{isAdmin ? 'Admin Edit Listing' : 'Edit Listing'}</h1>
              <p className="text-gray-600">{isAdmin ? 'Update any product information' : 'Update your product information'}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Vintage Leather Handbag" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your item in detail..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (AUD) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent - Like new</SelectItem>
                                <SelectItem value="good">Good - Minor wear</SelectItem>
                                <SelectItem value="fair">Fair - Noticeable wear</SelectItem>
                                <SelectItem value="poor">Poor - Significant wear</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(categories) && categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Nike, Apple, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Medium, XL, 10, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Blue, Red, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Cotton, Leather, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location & Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sydney, NSW" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Cost (AUD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00 for free shipping" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <p className="text-sm text-gray-600">
                      Current images: {existingPhotos.length} | New uploads: {images.length} | Total: {existingPhotos.length + images.length}/10 max
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Existing Photos Section */}
                    {existingPhotos.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">Current Photos</h4>
                          <Badge variant="outline">{existingPhotos.length} photos</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {existingPhotos.map((photo, index) => (
                            <div key={`existing-${index}`} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                                <img
                                  src={photo.url}
                                  alt={photo.originalName || `Product image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Delete Button */}
                              <div className="absolute top-2 right-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeExistingPhoto(index)}
                                  disabled={deletePhotoMutation.isPending}
                                  className="h-7 w-7 p-0"
                                  title="Delete photo"
                                >
                                  {deletePhotoMutation.isPending ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>

                              {/* Primary image indicator */}
                              {index === 0 && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-green-500 text-white text-xs">
                                    Primary
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload New Photos Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Add New Photos</h4>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-4">
                          Upload high-quality images of your item (max 10 total)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <div className="space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            disabled={existingPhotos.length + images.length >= 10}
                          >
                            Choose Images
                          </Button>
                          {images.length > 0 && (
                            <Button
                              type="button"
                              onClick={uploadNewPhotos}
                              disabled={uploadPhotosMutation.isPending}
                            >
                              {uploadPhotosMutation.isPending ? "Uploading..." : `Upload ${images.length} New Photos`}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* New Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">New Images to Upload</p>
                            <Badge variant="secondary">{images.length} selected</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={`new-${index}`} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
                                  <img
                                    src={preview}
                                    alt={`New image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                {/* Remove Button */}
                                <div className="absolute top-2 right-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeNewImage(index)}
                                    className="h-7 w-7 p-0 bg-white"
                                    title="Remove image"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>

                                {/* New indicator */}
                                <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="text-xs">
                                    New
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/seller/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateListingMutation.isPending}
                  >
                    {updateListingMutation.isPending ? "Updating..." : "Update Listing"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}