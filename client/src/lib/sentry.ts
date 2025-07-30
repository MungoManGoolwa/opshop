import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

interface SentryConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  enabled: boolean;
}

const getSentryConfig = (): SentryConfig => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.NODE_ENV || 'development';
  
  return {
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    enabled: !!dsn && environment === 'production'
  };
};

export const initSentry = () => {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    console.log('Sentry: Disabled (no DSN provided or not in production)');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate,
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        // Basic route tracking for single page applications
      }),
    ],
    beforeSend(event, hint) {
      // Filter out known issues or development errors
      if (config.environment === 'development') {
        return null;
      }
      
      // Don't send console errors that are already handled
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'handled' in error) {
          return null;
        }
      }
      
      return event;
    },
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    // Set user context automatically
    initialScope: {
      tags: {
        component: "opshop-online"
      }
    }
  });

  console.log('Sentry: Initialized for', config.environment);
};

// Enhanced error logging that integrates with both our custom logger and Sentry
export const logErrorToSentry = (
  error: Error,
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
) => {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag('component', context.component);
    }
    
    if (context?.action) {
      scope.setTag('action', context.action);
    }
    
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    scope.setLevel('error');
    Sentry.captureException(error);
  });
};

// Enhanced user context setting
export const setSentryUser = (user: {
  id: string;
  email?: string;
  role?: string;
}) => {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  });
};

// Set custom context for business operations
export const setSentryContext = (key: string, context: Record<string, any>) => {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return;
  }

  Sentry.setContext(key, context);
};

// Performance monitoring for key operations
export const startSentryTransaction = (name: string, operation: string) => {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op: operation
  });
};

// Export Sentry for direct use if needed
export { Sentry };

// Check if Sentry is available and configured
export const isSentryEnabled = (): boolean => {
  return getSentryConfig().enabled;
};