import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Cache for CSRF token
let cachedCsrfToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

async function fetchCsrfToken(): Promise<string | null> {
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  tokenFetchPromise = fetch('/api/csrf-token', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      cachedCsrfToken = data.csrfToken;
      tokenFetchPromise = null;
      return cachedCsrfToken;
    })
    .catch(error => {
      console.error('Failed to fetch CSRF token:', error);
      tokenFetchPromise = null;
      return null;
    });

  return tokenFetchPromise;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};

  // Add CSRF token for state-changing operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) && url.startsWith('/api/') && !url.includes('/csrf-token')) {
    if (!cachedCsrfToken) {
      cachedCsrfToken = await fetchCsrfToken();
    }
    
    if (cachedCsrfToken) {
      headers['X-CSRF-Token'] = cachedCsrfToken;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle CSRF token errors by refreshing token and retrying once
  if (res.status === 403) {
    try {
      const errorBody = await res.clone().json();
      if (errorBody.code === 'CSRF_VALIDATION_FAILED' || errorBody.code === 'CSRF_DOUBLE_SUBMIT_FAILED') {
        console.log('CSRF token validation failed, refreshing token and retrying...');
        
        // Clear cached token and fetch a new one
        cachedCsrfToken = null;
        const newToken = await fetchCsrfToken();
        
        if (newToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          headers['X-CSRF-Token'] = newToken;
          
          // Retry the request with new token
          const retryResponse = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
          });
          
          await throwIfResNotOk(retryResponse);
          return retryResponse;
        }
      }
    } catch (jsonError) {
      // If we can't parse the error response, fall through to normal error handling
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
