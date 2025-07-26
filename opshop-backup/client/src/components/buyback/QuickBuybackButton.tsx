import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Info } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface QuickBuybackButtonProps {
  className?: string;
}

export default function QuickBuybackButton({ className = "" }: QuickBuybackButtonProps) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return null; // Don't show button if not logged in
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 ${className}`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get Instant Buyback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-green-600" />
            Instant Buyback
          </DialogTitle>
          <DialogDescription>
            Turn your unwanted items into store credit instantly
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">How it works:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• AI evaluates your item instantly</li>
                  <li>• Get 50% of retail value as store credit</li>
                  <li>• Use credit immediately on any item</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link href="/instant-buyback" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Start Evaluation
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}