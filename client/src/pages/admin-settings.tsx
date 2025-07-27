import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import PageHeader from "@/components/layout/page-header";
import ProtectedRoute from "@/components/ui/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Settings, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  Save,
  Globe
} from "lucide-react";

const settingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  abn: z.string().min(1, "ABN is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  supportEmail: z.string().email("Valid support email is required"),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  description: z.string().min(1, "Business description is required"),
  businessHours: z.string().min(1, "Business hours are required"),
  emergencyContact: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional()
  }).optional()
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Admin Settings - Opshop Online";
  }, []);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: "Opshop Online",
      abn: "12 345 678 901",
      address: "123 Sustainable Street, Goolwa, SA 5214, Australia",
      phone: "1800 123 456",
      email: "info@opshop.online",
      supportEmail: "support@opshop.online",
      website: "https://opshop.online",
      description: "Australia's most sustainable marketplace for pre-loved goods. Based in Goolwa, South Australia.",
      businessHours: "Monday - Friday: 9:00 AM - 6:00 PM ACDT\nSaturday: 10:00 AM - 4:00 PM ACDT\nSunday: Closed",
      emergencyContact: "000",
      socialMedia: {
        facebook: "https://facebook.com/opshop.online",
        instagram: "https://instagram.com/opshop.online",
        twitter: "https://twitter.com/opshop_online",
        youtube: "https://youtube.com/@opshop-online"
      }
    }
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: SettingsFormData) => 
      apiRequest("PUT", "/api/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated successfully",
        description: "Business information has been saved and will appear on contact pages.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error updating settings",
        description: "Failed to save business information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral">
        <Header />
        
        <PageHeader 
          title="Admin Settings"
          description="Manage business information and contact details"
        />

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs defaultValue="business" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="business">Business Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact Details</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                  </TabsList>

                  <TabsContent value="business" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Building className="mr-2 h-5 w-5" />
                          Business Information
                        </CardTitle>
                        <CardDescription>
                          Basic business details that appear on legal documents and contact pages
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="abn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ABN</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Business Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Hours</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Phone className="mr-2 h-5 w-5" />
                          Contact Information
                        </CardTitle>
                        <CardDescription>
                          Contact details displayed on the contact page and footer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Main Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="emergencyContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="000" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>General Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="supportEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Support Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input {...field} type="url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Globe className="mr-2 h-5 w-5" />
                          Social Media Links
                        </CardTitle>
                        <CardDescription>
                          Social media profiles displayed in the footer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="socialMedia.facebook"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://facebook.com/your-page" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="socialMedia.instagram"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://instagram.com/your-profile" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="socialMedia.twitter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://twitter.com/your-handle" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="socialMedia.youtube"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://youtube.com/@your-channel" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    className="min-w-32"
                  >
                    {updateSettingsMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </section>

        <Footer />
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}