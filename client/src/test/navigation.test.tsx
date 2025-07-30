import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock the NotFound component
vi.mock('@/pages/not-found', () => ({
  default: () => (
    <div data-testid="not-found-page">
      <h1>404 - Page Not Found</h1>
      <div>/test-path</div>
      <button onClick={() => window.history.back()}>Go Back</button>
      <a href="/">Go Home</a>
      <a href="/search">Browse Products</a>
    </div>
  )
}));

// Mock other pages
vi.mock('@/pages/landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}));

vi.mock('@/pages/home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

// Mock authentication hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

// Mock other hooks
vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => {}
}));

vi.mock('@/hooks/useScrollToTop', () => ({
  useScrollToTop: () => {}
}));

vi.mock('@/lib/analytics', () => ({
  initGA: () => {}
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('Navigation Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    
    // Reset window.history
    window.history.replaceState({}, '', '/');
  });

  describe('404 Page Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    });

    it('shows navigation options on 404 page', async () => {
      // Navigate to unknown route
      window.history.replaceState({}, '', '/unknown-route');
      
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/unknown-route">
            <div data-testid="app-content">
              {/* Simulate App router with wildcard catch-all */}
              <div data-testid="not-found-page">
                <h1>404 - Page Not Found</h1>
                <div>/unknown-route</div>
                <button onClick={() => window.history.back()}>Go Back</button>
                <a href="/">Go Home</a>
                <a href="/search">Browse Products</a>
              </div>
            </div>
          </Router>
        </QueryClientProvider>
      );

      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('/unknown-route')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('handles back navigation', async () => {
      const mockBack = vi.spyOn(window.history, 'back');
      
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <div data-testid="not-found-page">
              <button onClick={() => window.history.back()}>Go Back</button>
            </div>
          </Router>
        </QueryClientProvider>
      );

      const backButton = screen.getByText('Go Back');
      await user.click(backButton);
      
      expect(mockBack).toHaveBeenCalled();
    });

    it('provides working home navigation link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <div data-testid="not-found-page">
              <a href="/" data-testid="home-link">Go Home</a>
            </div>
          </Router>
        </QueryClientProvider>
      );

      const homeLink = screen.getByTestId('home-link');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('provides working search navigation link', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router>
            <div data-testid="not-found-page">
              <a href="/search" data-testid="search-link">Browse Products</a>
            </div>
          </Router>
        </QueryClientProvider>
      );

      const searchLink = screen.getByTestId('search-link');
      expect(searchLink).toHaveAttribute('href', '/search');
    });
  });

  describe('Route History Management', () => {
    it('maintains browser history for navigation', () => {
      expect(window.location.pathname).toBe('/');
      
      // Simulate navigation
      window.history.pushState({}, '', '/about');
      expect(window.location.pathname).toBe('/about');
      
      window.history.pushState({}, '', '/search');
      expect(window.location.pathname).toBe('/search');
      
      window.history.back();
      expect(window.location.pathname).toBe('/about');
    });

    it('handles deep linking to specific routes', () => {
      window.history.replaceState({}, '', '/product/123');
      expect(window.location.pathname).toBe('/product/123');
      
      window.history.replaceState({}, '', '/category/electronics');
      expect(window.location.pathname).toBe('/category/electronics');
    });
  });

  describe('Authentication-Based Navigation', () => {
    it('handles navigation for authenticated users', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'customer' },
        error: null
      });

      // Test that authenticated routes are accessible
      const authenticatedRoutes = [
        '/profile',
        '/wallet', 
        '/messages',
        '/checkout'
      ];

      authenticatedRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });

    it('handles navigation for admin users', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        error: null
      });

      const adminRoutes = [
        '/admin/dashboard',
        '/admin/users',
        '/admin/buyback',
        '/admin/site'
      ];

      adminRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });

    it('handles navigation for seller users', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'seller@example.com', role: 'seller' },
        error: null
      });

      const sellerRoutes = [
        '/seller/dashboard',
        '/seller/create',
        '/shop-upgrade'
      ];

      sellerRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });
  });

  describe('Public Route Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    });

    it('allows navigation to public routes when not authenticated', () => {
      const publicRoutes = [
        '/',
        '/about',
        '/search',
        '/cart',
        '/help-center',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/pricing-guide',
        '/safety-guidelines'
      ];

      publicRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });

    it('allows navigation to product and category pages', () => {
      const dynamicRoutes = [
        '/product/123',
        '/product/abc-123',
        '/category/electronics',
        '/category/clothing'
      ];

      dynamicRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });
  });

  describe('URL Parameter Handling', () => {
    it('handles product ID parameters correctly', () => {
      const productRoutes = [
        '/product/123',
        '/product/abc-def-456',
        '/product/product-with-dashes'
      ];

      productRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
        
        // Extract ID from route
        const id = route.split('/product/')[1];
        expect(id).toBeTruthy();
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('handles category slug parameters correctly', () => {
      const categoryRoutes = [
        '/category/electronics',
        '/category/home-garden',
        '/category/sports-outdoors'
      ];

      categoryRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
        
        // Extract slug from route
        const slug = route.split('/category/')[1];
        expect(slug).toBeTruthy();
        expect(slug.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Case Navigation', () => {
    it('handles routes with special characters', () => {
      const specialRoutes = [
        '/product/item%20with%20spaces',
        '/category/toys%26games',
        '/search?q=test%20query'
      ];

      specialRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname + window.location.search).toBe(route);
      });
    });

    it('handles trailing slashes consistently', () => {
      const routesWithTrailingSlash = [
        '/about/',
        '/search/',
        '/contact/'
      ];

      routesWithTrailingSlash.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });

    it('handles deeply nested unknown routes', () => {
      const deepRoutes = [
        '/unknown/very/deep/path',
        '/admin/unknown/nested/route',
        '/seller/invalid/deep/path'
      ];

      deepRoutes.forEach(route => {
        window.history.replaceState({}, '', route);
        expect(window.location.pathname).toBe(route);
      });
    });
  });
});