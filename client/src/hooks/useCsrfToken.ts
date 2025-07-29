import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CsrfTokenResponse {
  csrfToken: string;
  message: string;
}

export function useCsrfToken() {
  const { data, isLoading, error } = useQuery<CsrfTokenResponse>({
    queryKey: ['/api/csrf-token'],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  return {
    csrfToken: data?.csrfToken,
    isLoading,
    error
  };
}

export function getCsrfToken(): Promise<string | null> {
  return apiRequest('GET', '/api/csrf-token')
    .then((response) => response.json())
    .then((data: CsrfTokenResponse) => data.csrfToken)
    .catch((error) => {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    });
}