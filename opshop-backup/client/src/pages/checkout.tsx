import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { useAuth } from "@/hooks/useAuth";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  productId: number;
  sellerId: string;
  totalAmount: number;
  shippingCost: number;
  onSuccess: () => void;
}

const StripeCheckoutForm = ({ productId, sellerId, totalAmount, shippingCost, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const orderResponse = await apiRequest("POST", "/api/orders", {
        productId,
        sellerId,
        totalAmount,
        shippingCost,
        paymentGateway: "stripe",
        paymentStatus: "pending",
        orderStatus: "pending"
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}?success=true&orderId=${(orderResponse as any).orderId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)} AUD`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isLoading, setIsLoading] = useState(true);

  // Get product ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with checkout.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    if (!productId) {
      toast({
        title: "Invalid Product",
        description: "No product selected for checkout.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    loadProductAndCreatePaymentIntent();
  }, [productId, isAuthenticated]);

  const loadProductAndCreatePaymentIntent = async () => {
    try {
      // Fetch product details
      const productResponse = await apiRequest("GET", `/api/products?id=${productId}`);
      setProduct(Array.isArray(productResponse) ? productResponse[0] : productResponse);

      const totalAmount = parseFloat((productResponse as any).price) + (parseFloat((productResponse as any).shippingCost) || 0);

      // Create Stripe payment intent
      const paymentResponse = await apiRequest("POST", "/api/stripe/payment-intent", {
        amount: totalAmount,
        currency: 'aud',
        orderId: `temp-${Date.now()}`,
        productId: parseInt(productId!)
      });

      setClientSecret((paymentResponse as any).clientSecret);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load checkout",
        variant: "destructive",
      });
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been placed successfully.",
    });
    setLocation('/');
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const subtotal = parseFloat(product.price);
  const shipping = parseFloat(product.shippingCost) || 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                {product.images && product.images[0] && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <Badge variant="secondary" className="capitalize">
                    {product.condition}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.location}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Item Price</span>
                  <span>${subtotal.toFixed(2)} AUD</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)} AUD`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)} AUD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('stripe')}
                    className="flex-1"
                  >
                    Credit Card
                  </Button>
                  <Button
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('paypal')}
                    className="flex-1"
                  >
                    PayPal
                  </Button>
                </div>
              </div>

              {/* Stripe Payment Form */}
              {paymentMethod === 'stripe' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm 
                    productId={parseInt(productId!)}
                    sellerId={product.sellerId}
                    totalAmount={total}
                    shippingCost={shipping}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              )}

              {/* PayPal Payment Button */}
              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <PayPalButton 
                    amount={total.toString()}
                    currency="AUD"
                    intent="CAPTURE"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}