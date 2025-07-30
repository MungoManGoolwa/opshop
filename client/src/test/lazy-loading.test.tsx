import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LazyRoute from '../components/LazyRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import PageSkeleton from '../components/PageSkeleton';
import { Suspense, lazy } from 'react';

// Mock a lazy component
const MockLazyComponent = lazy(() => 
  Promise.resolve({
    default: () => <div data-testid="lazy-content">Lazy Loaded Content</div>
  })
);

const SlowMockLazyComponent = lazy(() => 
  new Promise<{ default: React.ComponentType }>((resolve) => 
    setTimeout(() => resolve({
      default: () => <div data-testid="slow-lazy-content">Slow Lazy Content</div>
    }), 100)
  )
);

describe('Lazy Loading Tests', () => {
  describe('LazyRoute Component', () => {
    it('renders children after lazy loading completes', async () => {
      render(
        <LazyRoute>
          <MockLazyComponent />
        </LazyRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
      });
    });

    it('shows default skeleton while loading', async () => {
      render(
        <LazyRoute>
          <SlowMockLazyComponent />
        </LazyRoute>
      );

      // Should show skeleton initially
      expect(screen.getByText('Loading page...')).toBeInTheDocument();
      
      // Should show lazy content after loading
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('shows custom fallback when provided', async () => {
      const customFallback = <div data-testid="custom-fallback">Custom Loading...</div>;
      
      render(
        <LazyRoute fallback={customFallback}>
          <SlowMockLazyComponent />
        </LazyRoute>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('shows admin skeleton variant', async () => {
      render(
        <LazyRoute skeleton="admin">
          <SlowMockLazyComponent />
        </LazyRoute>
      );

      // Should show admin skeleton layout with multiple skeleton elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(4);
      
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('shows product skeleton variant', async () => {
      render(
        <LazyRoute skeleton="product">
          <SlowMockLazyComponent />
        </LazyRoute>
      );

      // Should show product skeleton layout with image and detail sections
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(6);
      
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('shows listing skeleton variant', async () => {
      render(
        <LazyRoute skeleton="listing">
          <SlowMockLazyComponent />
        </LazyRoute>
      );

      // Should show listing skeleton layout with form elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(5);
      
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('LoadingSpinner Component', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('renders with custom text', () => {
      render(<LoadingSpinner text="Please wait..." />);
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('renders without text when text prop is empty', () => {
      render(<LoadingSpinner text="" />);
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('applies different sizes correctly', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByLabelText('Loading')).toHaveClass('w-4', 'h-4');

      rerender(<LoadingSpinner size="md" />);
      expect(screen.getByLabelText('Loading')).toHaveClass('w-8', 'h-8');

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByLabelText('Loading')).toHaveClass('w-12', 'h-12');
    });

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      expect(screen.getByLabelText('Loading').parentElement).toHaveClass('custom-class');
    });
  });

  describe('PageSkeleton Component', () => {
    it('renders default skeleton variant', () => {
      render(<PageSkeleton />);
      
      // Should contain skeleton elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('renders admin skeleton variant', () => {
      render(<PageSkeleton variant="admin" />);
      
      // Should contain admin-specific skeleton elements (4 stat cards)
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(8); // Header + 4 cards + table rows
    });

    it('renders product skeleton variant', () => {
      render(<PageSkeleton variant="product" />);
      
      // Should contain product-specific skeleton elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(6); // Image + thumbnails + details
    });

    it('renders listing skeleton variant', () => {
      render(<PageSkeleton variant="listing" />);
      
      // Should contain listing form skeleton elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(5); // Form fields + image upload
    });
  });

  describe('Suspense Integration', () => {
    it('works correctly with React Suspense', async () => {
      render(
        <Suspense fallback={<div data-testid="suspense-fallback">Suspense Loading...</div>}>
          <MockLazyComponent />
        </Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
      });
    });

    it('shows suspense fallback for slow components', async () => {
      render(
        <Suspense fallback={<div data-testid="suspense-fallback">Suspense Loading...</div>}>
          <SlowMockLazyComponent />
        </Suspense>
      );

      expect(screen.getByTestId('suspense-fallback')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('slow-lazy-content')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });
});