import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Eye, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profileImageUrl?: string;
}

interface UserImpersonationButtonProps {
  user: User;
  onImpersonationStart?: () => void;
}

export default function UserImpersonationButton({ user, onImpersonationStart }: UserImpersonationButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Start impersonation mutation
  const impersonateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/impersonate", { userId: user.id });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonation-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Impersonation Started",
        description: `You are now viewing the site as ${data.targetUser.firstName || data.targetUser.email}`,
      });
      setIsDialogOpen(false);
      onImpersonationStart?.();
      // Redirect to home page to see the user's view
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Impersonation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImpersonate = () => {
    impersonateMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "moderator": return "bg-orange-500";
      case "business": return "bg-purple-500";
      case "seller": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Impersonate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Impersonate User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImageUrl} />
              <AvatarFallback className="bg-blue-500 text-white">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge className={`${getRoleBadgeColor(user.accountType)} text-white mt-1`}>
                {user.accountType}
              </Badge>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>You will see the site exactly as this user sees it</li>
                  <li>Your admin privileges will be temporarily suspended</li>
                  <li>Use the "Stop Impersonation" button to return to admin view</li>
                  <li>This action is logged for security purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImpersonate}
            disabled={impersonateMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {impersonateMutation.isPending ? "Starting..." : "Start Impersonation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}