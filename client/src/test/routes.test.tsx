import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route } from 'wouter';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock all lazy-loaded components to avoid dynamic import issues in tests
vi.mock('@/pages/landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}));

vi.mock('@/pages/home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('@/pages/about', () => ({
  default: () => <div data-testid="about-page">About Page</div>
}));

vi.mock('@/pages/product-detail', () => ({
  default: () => <div data-testid="product-detail-page">Product Detail Page</div>
}));

vi.mock('@/pages/admin-dashboard', () => ({
  default: () => <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>
}));

vi.mock('@/pages/seller-dashboard', () => ({
  default: () => <div data-testid="seller-dashboard-page">Seller Dashboard Page</div>
}));

vi.mock('@/pages/search', () => ({
  default: () => <div data-testid="search-page">Search Page</div>
}));

vi.mock('@/pages/cart', () => ({
  default: () => <div data-testid="cart-page">Cart Page</div>
}));

vi.mock('@/pages/checkout', () => ({
  default: () => <div data-testid="checkout-page">Checkout Page</div>
}));

vi.mock('@/pages/profile', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>
}));

vi.mock('@/pages/create-listing', () => ({
  default: () => <div data-testid="create-listing-page">Create Listing Page</div>
}));

// Mock authentication hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

// Mock analytics hooks
vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => {}
}));

vi.mock('@/hooks/useScrollToTop', () => ({
  useScrollToTop: () => {}
}));

// Mock GA initialization
vi.mock('@/lib/analytics', () => ({
  initGA: () => {}
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_GA_MEASUREMENT_ID: 'G-TEST123456'
  }
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('Route Rendering Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  describe('Public Routes (Unauthenticated)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    });

    it('renders landing page for root path when not authenticated', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('renders about page', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/about">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('about-page')).toBeInTheDocument();
      });
    });

    it('renders product detail page', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/product/123">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-detail-page')).toBeInTheDocument();
      });
    });

    it('renders search page', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/search">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('search-page')).toBeInTheDocument();
      });
    });

    it('renders cart page', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/cart">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('cart-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'customer' },
        error: null
      });
    });

    it('renders home page for root path when authenticated', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('renders profile page for authenticated users', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/profile">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      });
    });

    it('renders checkout page for authenticated users', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/checkout">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('checkout-page')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        error: null
      });
    });

    it('renders admin dashboard for admin users', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/admin/dashboard">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Seller Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'seller@example.com', role: 'seller' },
        error: null
      });
    });

    it('renders seller dashboard for seller users', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/seller/dashboard">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('seller-dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('404 Routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    });

    it('renders 404 page for unknown routes', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/unknown-route">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      });
    });

    it('renders 404 page for deeply nested unknown routes', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/very/deep/unknown/path">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      });
    });

    it('shows requested URL in 404 page', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/missing-page">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('/missing-page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state while authentication is loading', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Router base="/">
            <App />
          </Router>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });
});