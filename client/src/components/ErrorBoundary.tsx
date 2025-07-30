import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '@/utils/errorLogger';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log to error logger
    errorLogger.logReactError(error, { componentStack: errorInfo.componentStack || '' }, this.constructor.name);
    
    // Update state with error details
    this.setState({
      errorInfo,
      errorId,
      retryCount: this.state.retryCount + 1
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for component-level errors (but not page-level)
    if (this.props.level === 'component' && this.state.retryCount < 2) {
      this.scheduleReset(3000); // Auto-retry after 3 seconds
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, children } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change (useful for route changes)
    if (hasError && resetOnPropsChange && prevProps.children !== children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error || !errorInfo) return;

    // Open mailto with error details
    const subject = `Error Report - ${errorId}`;
    const body = `Error Details:
    
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Error ID: ${errorId}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]`;

    const mailtoUrl = `mailto:support@opshop.online?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  private getErrorSeverity(): 'low' | 'medium' | 'high' {
    const { level } = this.props;
    const { retryCount } = this.state;

    if (level === 'page' || retryCount > 1) return 'high';
    if (level === 'section') return 'medium';
    return 'low';
  }

  private renderErrorFallback() {
    const { fallback, showErrorDetails = false, level = 'component', isolate = false } = this.props;
    const { error, errorInfo, errorId, retryCount } = this.state;

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const severity = this.getErrorSeverity();
    const isPageLevel = level === 'page';
    const showDetails = showErrorDetails && process.env.NODE_ENV === 'development';

    return (
      <div className={`error-boundary ${isolate ? 'error-boundary--isolated' : ''}`}>
        <Card className={`border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 ${isPageLevel ? 'max-w-2xl mx-auto mt-8' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="h-5 w-5" />
              {isPageLevel ? 'Page Error' : severity === 'high' ? 'Component Error' : 'Display Issue'}
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {isPageLevel 
                ? 'Something went wrong loading this page.'
                : severity === 'high' 
                  ? 'This section encountered an error and cannot be displayed.'
                  : 'A component failed to load properly.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User-friendly message */}
            <div className="text-sm text-red-800 dark:text-red-200">
              {isPageLevel ? (
                <p>We're sorry for the inconvenience. Please try refreshing the page or return to the home page.</p>
              ) : (
                <p>This section is temporarily unavailable. You can continue using other parts of the site.</p>
              )}
              {errorId && (
                <p className="mt-2 font-mono text-xs bg-red-100 dark:bg-red-900 p-2 rounded">
                  Error ID: {errorId}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {!isPageLevel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={this.handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              )}
              
              {isPageLevel && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh Page
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/'}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Go Home
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleReportError}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <Bug className="h-4 w-4 mr-1" />
                Report Issue
              </Button>
            </div>

            {/* Developer error details */}
            {showDetails && error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Developer Details (Development Mode)
                </summary>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded text-xs font-mono space-y-2">
                  <div>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                  <div>
                    <strong>Retry Count:</strong> {retryCount}
                  </div>
                </div>
              </details>
            )}

            {/* Retry information */}
            {retryCount > 0 && !isPageLevel && (
              <div className="text-xs text-red-600 dark:text-red-400">
                This component has failed {retryCount} time{retryCount > 1 ? 's' : ''}.
                {retryCount >= 2 && ' Automatic retry disabled.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    level="page" 
    resetOnPropsChange={true}
    showErrorDetails={true}
  >
    {children}
  </ErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: ReactNode; title?: string }> = ({ 
  children, 
  title = "Section" 
}) => (
  <ErrorBoundary 
    level="section" 
    isolate={true}
    fallback={
      <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-300">
          {title} is temporarily unavailable.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary 
    level="component" 
    isolate={true}
    resetOnPropsChange={false}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;