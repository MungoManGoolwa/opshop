import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrivateRoute from '../components/auth/PrivateRoute';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock authentication hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('Route Protection Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockLocation.href = '';
    vi.clearAllMocks();
  });

  describe('PrivateRoute Component', () => {
    it('renders children when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'customer' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute>
            <div data-testid="protected-content">Protected Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('redirects to login when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute>
            <div data-testid="protected-content">Protected Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
      });

      // Check that redirect happens after timeout
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(mockLocation.href).toBe('/api/login');
    });

    it('shows loading when authentication is loading', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute>
            <div data-testid="protected-content">Protected Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      // Should not render protected content while loading
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('allows access when user has required admin role', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'admin@example.com', role: 'admin' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="admin">
            <div data-testid="admin-content">Admin Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      });
    });

    it('denies access when user lacks required admin role', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'customer@example.com', role: 'customer' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="admin">
            <div data-testid="admin-content">Admin Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
      });

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('allows access when user has required seller role', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'seller@example.com', role: 'seller' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="seller">
            <div data-testid="seller-content">Seller Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('seller-content')).toBeInTheDocument();
      });
    });

    it('allows business users to access seller routes', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'business@example.com', role: 'business' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="seller">
            <div data-testid="seller-content">Seller Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('seller-content')).toBeInTheDocument();
      });
    });

    it('denies access when user lacks required seller role', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'customer@example.com', role: 'customer' }
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="seller">
            <div data-testid="seller-content">Seller Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
      });

      expect(screen.queryByTestId('seller-content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles user object without role property', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com' } // No role property
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute role="admin">
            <div data-testid="admin-content">Admin Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
      });
    });

    it('handles null user object', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <PrivateRoute>
            <div data-testid="protected-content">Protected Content</div>
          </PrivateRoute>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
      });
    });
  });
});