import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ShoppingCart, CreditCard, User, Mail, Phone, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Guest checkout form schema
const guestCheckoutSchema = z.object({
  guestEmail: z.string().email("Please enter a valid email address"),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestPhone: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postcode: z.string().min(4, "Postcode is required"),
    country: z.string().default("Australia"),
  }),
  paymentMethod: z.enum(["stripe", "paypal"]),
});

type GuestCheckoutForm = z.infer<typeof guestCheckoutSchema>;

// Generate or get guest session ID
function getGuestSessionId(): string {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
}

export default function GuestCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  
  const guestSessionId = getGuestSessionId();

  const form = useForm<GuestCheckoutForm>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      guestEmail: "",
      guestName: "",
      guestPhone: "",
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        postcode: "",
        country: "Australia",
      },
      paymentMethod: "stripe",
    },
  });

  // Fetch guest cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: [`/api/guest-cart/${guestSessionId}`],
    enabled: !!guestSessionId,
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const shippingCost = subtotal > 100 ? 0 : 9.95; // Free shipping over $100
  const total = subtotal + shippingCost;

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [cartItems, isLoading, setLocation, toast]);

  const processPaymentMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/guest-checkout/create-payment", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to payment gateway
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Payment Error",
          description: "Unable to create payment session. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to process checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const onSubmit = async (data: GuestCheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create orders for each cart item
      for (const item of cartItems) {
        const orderData = {
          guestSessionId,
          productId: item.product.id,
          sellerId: item.product.sellerId,
          totalAmount: (parseFloat(item.product.price) * item.quantity + 
                       (item === cartItems[cartItems.length - 1] ? shippingCost : 0)).toFixed(2),
          shippingCost: item === cartItems[cartItems.length - 1] ? shippingCost.toFixed(2) : "0.00",
          paymentGateway: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          guestEmail: data.guestEmail,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
        };

        await processPaymentMutation.mutateAsync(orderData);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/cart")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Guest Checkout</h1>
            <p className="text-gray-600">Complete your purchase without creating an account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main checkout form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                    <CardDescription>
                      Enter your details for order confirmation and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guestEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="0400 123 456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                    <CardDescription>
                      Where should we deliver your items?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Adelaide" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingAddress.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="SA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingAddress.postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode *</FormLabel>
                            <FormControl>
                              <Input placeholder="5000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Choose how you'd like to pay
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "stripe" 
                                  ? "border-primary bg-primary/5" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => field.onChange("stripe")}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={field.value === "stripe"}
                                  onChange={() => field.onChange("stripe")}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <div className="font-medium">Credit/Debit Card</div>
                                  <div className="text-sm text-gray-600">Visa, MasterCard, Amex</div>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                field.value === "paypal" 
                                  ? "border-primary bg-primary/5" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => field.onChange("paypal")}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  checked={field.value === "paypal"}
                                  onChange={() => field.onChange("paypal")}
                                  className="w-4 h-4"
                                />
                                <div>
                                  <div className="font-medium">PayPal</div>
                                  <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Purchase - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.imageUrl || "/api/placeholder/60/60"}
                        alt={item.product.title}
                        className="w-15 h-15 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.title}</p>
                        <p className="text-sm text-gray-600">
                          ${parseFloat(item.product.price).toFixed(2)} × {item.quantity}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {item.product.condition}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                {shippingCost === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                )}

                {/* Account Creation Offer */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Want to track your order?</strong>
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Create an account after purchase to track orders, save favorites, and get exclusive deals.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => setLocation("/api/login")}
                  >
                    Create Account Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}