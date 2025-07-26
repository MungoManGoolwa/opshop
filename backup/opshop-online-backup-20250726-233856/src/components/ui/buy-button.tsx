import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BuyButtonProps {
  productId: number;
  price: string;
  shippingCost?: string;
  isAvailable?: boolean;
  className?: string;
}

export default function BuyButton({ 
  productId, 
  price, 
  shippingCost = "0", 
  isAvailable = true,
  className = ""
}: BuyButtonProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase this item.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }

    if (!isAvailable) {
      toast({
        title: "Item Unavailable",
        description: "This item is no longer available for purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Redirect to checkout with product ID
      setLocation(`/checkout?productId=${productId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to proceed to checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = parseFloat(price) + parseFloat(shippingCost);

  return (
    <Button
      onClick={handleBuyNow}
      disabled={!isAvailable || isLoading}
      className={`w-full ${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now - ${totalCost.toFixed(2)} AUD
        </>
      )}
    </Button>
  );
}