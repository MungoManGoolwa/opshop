// Client-side error logging utility for React render errors and application exceptions

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'react' | 'network' | 'user' | 'security';
  metadata?: Record<string, any>;
}

export interface ErrorLoggerConfig {
  enabled: boolean;
  maxErrors: number;
  sendToServer: boolean;
  serverEndpoint?: string;
  includeUserAgent: boolean;
  includeUrl: boolean;
  enableConsoleLog: boolean;
  enableLocalStorage: boolean;
  retryAttempts: number;
  retryDelay: number;
}

class ErrorLogger {
  private config: ErrorLoggerConfig;
  private sessionId: string;
  private errorQueue: ErrorLogEntry[] = [];
  private retryQueue: ErrorLogEntry[] = [];

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = {
      enabled: true,
      maxErrors: 100,
      sendToServer: true,
      serverEndpoint: '/api/errors',
      includeUserAgent: true,
      includeUrl: true,
      enableConsoleLog: true,
      enableLocalStorage: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.loadStoredErrors();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private setupGlobalErrorHandlers(): void {
    if (!this.config.enabled || typeof window === 'undefined') return;

    // Global JavaScript error handler with proper typing
    const errorHandler = (event: ErrorEvent) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        category: 'javascript',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'global_error'
        }
      });
    };

    // Unhandled promise rejection handler with proper typing
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        category: 'javascript',
        metadata: {
          reason: event.reason,
          type: 'unhandled_rejection'
        }
      });
    };

    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Store cleanup function for proper removal
    this.globalHandlerCleanup = () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }

  // Cleanup method for global handlers
  private globalHandlerCleanup: (() => void) | null = null;

  destroy(): void {
    if (this.globalHandlerCleanup) {
      this.globalHandlerCleanup();
      this.globalHandlerCleanup = null;
    }
  }

  logError(error: Partial<ErrorLogEntry>): void {
    if (!this.config.enabled) return;

    const errorEntry: ErrorLogEntry = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary,
      url: this.config.includeUrl ? window.location.href : '',
      userAgent: this.config.includeUserAgent ? navigator.userAgent : '',
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
      category: error.category || 'javascript',
      metadata: error.metadata || {},
      ...error
    };

    this.addToQueue(errorEntry);
    this.processErrorQueue();
  }

  logReactError(error: Error, errorInfo: { componentStack: string }, errorBoundary?: string): void {
    this.logError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary,
      severity: 'high',
      category: 'react',
      metadata: {
        type: 'react_error_boundary',
        errorName: error.name
      }
    });
  }

  logNetworkError(error: any, url: string, method: string = 'GET'): void {
    this.logError({
      message: `Network Error: ${error.message || 'Request failed'}`,
      stack: error.stack,
      severity: 'medium',
      category: 'network',
      metadata: {
        url,
        method,
        status: error.status,
        statusText: error.statusText,
        type: 'network_error'
      }
    });
  }

  logUserAction(action: string, metadata: Record<string, any> = {}): void {
    this.logError({
      message: `User Action: ${action}`,
      severity: 'low',
      category: 'user',
      metadata: {
        action,
        ...metadata,
        type: 'user_action'
      }
    });
  }

  logSecurityEvent(event: string, metadata: Record<string, any> = {}): void {
    this.logError({
      message: `Security Event: ${event}`,
      severity: 'critical',
      category: 'security',
      metadata: {
        event,
        ...metadata,
        type: 'security_event'
      }
    });
  }

  private generateErrorId(): string {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private addToQueue(error: ErrorLogEntry): void {
    this.errorQueue.push(error);
    
    // Limit queue size
    if (this.errorQueue.length > this.config.maxErrors) {
      this.errorQueue.shift();
    }

    // Log to console if enabled
    if (this.config.enableConsoleLog) {
      const logLevel = this.getConsoleLogLevel(error.severity);
      console[logLevel]('Error logged:', {
        id: error.id,
        message: error.message,
        category: error.category,
        severity: error.severity,
        metadata: error.metadata
      });
    }

    // Store in localStorage if enabled
    if (this.config.enableLocalStorage) {
      this.storeErrorsLocally();
    }
  }

  private getConsoleLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  private async processErrorQueue(): Promise<void> {
    if (!this.config.sendToServer || !this.config.serverEndpoint) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    for (const error of errorsToSend) {
      try {
        await this.sendErrorToServer(error);
      } catch (sendError) {
        // Add to retry queue
        this.retryQueue.push(error);
        console.warn('Failed to send error to server:', sendError);
      }
    }

    // Process retry queue
    if (this.retryQueue.length > 0) {
      setTimeout(() => this.processRetryQueue(), this.config.retryDelay);
    }
  }

  private async processRetryQueue(): Promise<void> {
    const errorsToRetry = [...this.retryQueue];
    this.retryQueue = [];

    for (const error of errorsToRetry) {
      try {
        await this.sendErrorToServer(error);
      } catch (retryError) {
        // If retry fails, we'll lose this error log
        console.error('Failed to retry sending error:', retryError);
      }
    }
  }

  private async sendErrorToServer(error: ErrorLogEntry): Promise<void> {
    const response = await fetch(this.config.serverEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error)
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
  }

  private storeErrorsLocally(): void {
    try {
      const storedErrors = this.errorQueue.slice(-50); // Store last 50 errors
      localStorage.setItem('opshop_error_logs', JSON.stringify(storedErrors));
    } catch (e) {
      console.warn('Failed to store errors in localStorage:', e);
    }
  }

  private loadStoredErrors(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const stored = localStorage.getItem('opshop_error_logs');
      if (stored) {
        const errors = JSON.parse(stored);
        this.errorQueue.push(...errors);
      }
    } catch (e) {
      console.warn('Failed to load stored errors:', e);
    }
  }

  getStoredErrors(): ErrorLogEntry[] {
    return [...this.errorQueue];
  }

  clearStoredErrors(): void {
    this.errorQueue = [];
    this.retryQueue = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('opshop_error_logs');
    }
  }

  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const stats = {
      total: this.errorQueue.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: 0
    };

    this.errorQueue.forEach(error => {
      // Count by category
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Count recent errors (last hour)
      if (error.timestamp.getTime() > oneHourAgo) {
        stats.recent++;
      }
    });

    return stats;
  }

  configure(newConfig: Partial<ErrorLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger({
  enabled: true,
  sendToServer: true,
  serverEndpoint: '/api/errors',
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enableLocalStorage: true
});

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).errorLogger = errorLogger;
}

export default errorLogger;