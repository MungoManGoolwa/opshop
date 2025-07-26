import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, UserX, AlertTriangle, Shield } from "lucide-react";

interface ImpersonationControlProps {
  onImpersonationChange?: (isImpersonating: boolean) => void;
}

export default function ImpersonationControl({ onImpersonationChange }: ImpersonationControlProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check impersonation status
  const { data: impersonationStatus, isLoading } = useQuery({
    queryKey: ["/api/admin/impersonation-status"],
    retry: false,
    refetchInterval: 5000, // Check every 5 seconds
  });

  const isImpersonating = impersonationStatus?.isImpersonating || false;
  const originalUser = impersonationStatus?.originalUser;

  // Stop impersonation mutation
  const stopImpersonationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/stop-impersonation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonation-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Impersonation Stopped",
        description: "You have returned to your admin account",
      });
      onImpersonationChange?.(false);
      // Reload the page to ensure clean state
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Stop Impersonation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    onImpersonationChange?.(isImpersonating);
  }, [isImpersonating, onImpersonationChange]);

  if (isLoading) {
    return null;
  }

  if (!isImpersonating) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Admin Impersonation Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={originalUser?.profileImageUrl} />
              <AvatarFallback className="bg-blue-500 text-white">
                <Shield className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Admin: {originalUser?.firstName} {originalUser?.lastName}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {originalUser?.email}
              </p>
            </div>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <UserX className="h-3 w-3" />
            Impersonating
          </Badge>
        </div>
        
        <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
          <Button
            onClick={() => stopImpersonationMutation.mutate()}
            disabled={stopImpersonationMutation.isPending}
            variant="outline"
            size="sm"
            className="w-full border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
          >
            {stopImpersonationMutation.isPending ? "Stopping..." : "Stop Impersonation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}