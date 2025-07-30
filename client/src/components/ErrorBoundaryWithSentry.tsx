import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '@/utils/errorLogger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'page' | 'section' | 'component';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

/**
 * Enhanced ErrorBoundary with Sentry integration
 * Automatically logs React errors to both our custom logger and Sentry
 */
export class ErrorBoundaryWithSentry extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Log to our custom error logger (includes Sentry integration)
      await errorLogger.logReactError(error, { componentStack: errorInfo.componentStack || '' }, this.constructor.name);
      
      // Also try direct Sentry logging with more context
      try {
        const { logErrorToSentry, setSentryContext } = await import('@/lib/sentry');
        
        // Set additional context for this error boundary
        setSentryContext('errorBoundary', {
          level: this.props.level || 'component',
          retryCount: this.state.retryCount,
          componentStack: errorInfo.componentStack
        });
        
        // Log the error with full context
        logErrorToSentry(error, {
          component: `ErrorBoundary.${this.props.level || 'component'}`,
          action: 'react_render_error',
          metadata: {
            errorId,
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
            level: this.props.level
          }
        });
      } catch (sentryError) {
        // Sentry not available - that's okay, we logged to our custom system
        console.warn('Sentry logging failed, but error was logged to custom system:', sentryError);
      }
      
    } catch (loggingError) {
      // Even if logging fails, we should handle the error gracefully
      console.error('Error logging failed:', loggingError);
      console.error('Original error:', error);
    }
    
    // Update state with error details
    this.setState({
      hasError: true,
      error,
      errorId,
      retryCount: this.state.retryCount + 1
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Clear any existing timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];
    
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    // Clean up timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on error boundary level
      const level = this.props.level || 'component';
      
      if (level === 'component') {
        return (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Component Error</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              This component encountered an error and couldn't load properly.
            </p>
            <Button size="sm" variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        );
      }

      if (level === 'section') {
        return (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
                Section Unavailable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 dark:text-orange-300 mb-4">
                This section encountered an error and is temporarily unavailable.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={this.handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Section
                </Button>
                <Button size="sm" variant="outline" onClick={this.handleRefresh}>
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Page level error
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Page Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                This page encountered an error and couldn't load properly. 
                Our team has been notified.
              </p>
              
              {this.state.errorId && (
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button variant="ghost" onClick={this.handleRefresh} className="w-full">
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience components for different levels
export const PageErrorBoundary = ({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) => (
  <ErrorBoundaryWithSentry level="page" onError={onError}>
    {children}
  </ErrorBoundaryWithSentry>
);

export const SectionErrorBoundary = ({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) => (
  <ErrorBoundaryWithSentry level="section" onError={onError}>
    {children}
  </ErrorBoundaryWithSentry>
);

export const ComponentErrorBoundary = ({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) => (
  <ErrorBoundaryWithSentry level="component" onError={onError}>
    {children}
  </ErrorBoundaryWithSentry>
);