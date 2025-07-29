import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallPrompt() {
  const { canInstall, install, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if recently dismissed
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < sevenDaysInMs) {
        setDismissed(true);
        return;
      }
    }

    // Show install prompt after 30 seconds if PWA can be installed
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, dismissed]);

  // Don't show if already installed or dismissed
  if (!showPrompt || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Install Opshop Online</CardTitle>
                <CardDescription className="text-xs">
                  Get the full app experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              • Faster loading
              • Offline access
              • Push notifications
              • Native app feel
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                className="flex-1 h-8 text-xs"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Install App
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="px-3 h-8 text-xs"
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}