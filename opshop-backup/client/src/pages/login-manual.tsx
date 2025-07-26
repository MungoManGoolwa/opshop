import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function LoginManual() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      // Make a direct API call to create session
      const response = await fetch('/api/login', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Wait a moment for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Invalidate and refetch auth state
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: "Login Successful",
          description: "Welcome to Opshop Online marketplace!"
        });
        
        setLocation("/");
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Opshop Online</CardTitle>
          <CardDescription>
            Australia's sustainable marketplace for second-hand treasures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Logging in...
              </>
            ) : (
              "Enter Marketplace"
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Quick demo login as admin user</p>
            <p className="mt-2">test@opshop.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}