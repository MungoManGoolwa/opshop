import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to detect user changes
  });

  const logout = () => {
    // Clear local session only (for user switching)
    window.location.href = "/api/logout";
  };

  const completeLogout = () => {
    // Complete logout from Replit Auth provider
    window.location.href = "/api/logout?force=true";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
    logout,
    completeLogout,
  };
}
