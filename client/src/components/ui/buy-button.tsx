import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BuyButtonProps {
  productId: number;
  price?: string;
  amount?: string; // Support both price and amount props
  shippingCost?: string;
  isAvailable?: boolean;
  status?: string; // Support status prop
  sellerId?: string; // Support sellerId prop
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export default function BuyButton({ 
  productId, 
  price, 
  amount,
  shippingCost = "0", 
  isAvailable = true,
  status,
  variant = "default",
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

    // Check availability based on both isAvailable prop and status
    const itemAvailable = isAvailable && (!status || status === "available");
    if (!itemAvailable) {
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

  // Use price if available, otherwise use amount
  const productPrice = price || amount || "0";
  const totalCost = parseFloat(productPrice) + parseFloat(shippingCost || "0");

  const itemAvailable = isAvailable && (!status || status === "available");
  
  return (
    <Button
      onClick={handleBuyNow}
      disabled={!itemAvailable || isLoading}
      variant={variant}
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