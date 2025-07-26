import React from 'react';
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Opshop Online</h1>
            <h2 className="text-lg mb-4">Something went wrong</h2>
            <p className="text-sm opacity-80 mb-6">
              We're having trouble loading the marketplace. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-white text-primary hover:bg-gray-100"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}