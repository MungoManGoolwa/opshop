import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface LoginButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export default function LoginButton({ children, className, variant = "default" }: LoginButtonProps) {
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    try {
      // Navigate to login endpoint
      window.location.href = "/api/login";
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Button 
      onClick={handleLogin} 
      className={className}
      variant={variant}
    >
      {children}
    </Button>
  );
}