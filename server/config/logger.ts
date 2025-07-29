import pino from 'pino';
import express from 'express';
import { env, isDevelopment, isProduction, isTest } from './env';

// Create logger configuration based on environment
const createLoggerConfig = () => {
  const baseConfig = {
    level: env.NODE_ENV === 'test' ? 'silent' : 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
  };

  if (isDevelopment()) {
    // Development: Pretty printing for better readability
    return {
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
          levelFirst: true,
        },
      },
    };
  }

  if (isProduction()) {
    // Production: Structured JSON logging
    return {
      ...baseConfig,
      level: 'warn', // Only log warnings and errors in production
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'password',
          'token',
          'secret',
          'apiKey',
        ],
        censor: '[REDACTED]',
      },
    };
  }

  // Test environment
  return {
    ...baseConfig,
    level: 'silent',
  };
};

// Create logger instance
export const logger = pino(createLoggerConfig());

// Request logger middleware
export const requestLogger = (req: express.Request & { requestId?: string }, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  
  // Create request ID for tracking
  req.requestId = generateRequestId();
  
  // Log incoming request
  logger.info({
    requestId: req.requestId,
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
    type: 'request_start',
  }, 'Incoming request');

  // Override res.json to capture response data
  const originalJson = res.json;
  let responseData: any;
  
  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const logData = {
      requestId: req.requestId,
      method,
      url,
      statusCode,
      duration,
      type: 'request_complete',
    };

    // Add response data for API calls (but redact sensitive info)
    if (url.startsWith('/api') && responseData) {
      (logData as any).responseSize = JSON.stringify(responseData).length;
      
      // Only log response data in development for API debugging
      if (isDevelopment() && statusCode >= 400) {
        (logData as any).responseData = responseData;
      }
    }

    // Log at appropriate level based on status code
    if (statusCode >= 500) {
      logger.error(logData, `${method} ${url} - Server Error`);
    } else if (statusCode >= 400) {
      logger.warn(logData, `${method} ${url} - Client Error`);
    } else {
      logger.info(logData, `${method} ${url} - Success`);
    }
  });

  next();
};

// Error logger middleware
export const errorLogger = (err: any, req: express.Request & { requestId?: string }, res: express.Response, next: express.NextFunction) => {
  const { requestId, method, url } = req;
  
  logger.error({
    requestId,
    method,
    url,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      status: err.status || err.statusCode,
    },
    type: 'error',
  }, 'Request error occurred');

  next(err);
};

// Database operation logger
export const dbLogger = {
  query: (sql: string, params?: any[], duration?: number) => {
    logger.debug({
      type: 'database_query',
      sql: sql.substring(0, 200), // Truncate long queries
      paramCount: params?.length || 0,
      duration,
    }, 'Database query executed');
  },
  
  error: (error: any, sql?: string) => {
    logger.error({
      type: 'database_error',
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      sql: sql?.substring(0, 200),
    }, 'Database error occurred');
  },
};

// Service operation logger
export const serviceLogger = {
  stripe: {
    payment: (action: string, paymentIntentId?: string, amount?: number) => {
      logger.info({
        type: 'payment_operation',
        service: 'stripe',
        action,
        paymentIntentId,
        amount,
      }, `Stripe payment ${action}`);
    },
    
    error: (action: string, error: any) => {
      logger.error({
        type: 'payment_error',
        service: 'stripe',
        action,
        error: {
          type: error.type,
          code: error.code,
          message: error.message,
        },
      }, `Stripe error during ${action}`);
    },
  },
  
  anthropic: {
    evaluation: (itemType: string, confidence?: number, duration?: number) => {
      logger.info({
        type: 'ai_evaluation',
        service: 'anthropic',
        itemType,
        confidence,
        duration,
      }, 'AI item evaluation completed');
    },
    
    error: (error: any) => {
      logger.error({
        type: 'ai_error',
        service: 'anthropic',
        error: {
          name: error.name,
          message: error.message,
        },
      }, 'Anthropic AI evaluation failed');
    },
  },
  
  paypal: {
    order: (action: string, orderId?: string, amount?: number) => {
      logger.info({
        type: 'payment_operation',
        service: 'paypal',
        action,
        orderId,
        amount,
      }, `PayPal order ${action}`);
    },
    
    error: (action: string, error: any) => {
      logger.error({
        type: 'payment_error',
        service: 'paypal',
        action,
        error: {
          message: error.message,
          details: error.details,
        },
      }, `PayPal error during ${action}`);
    },
  },
};

// Business logic logger
export const businessLogger = {
  user: {
    created: (userId: string, email?: string) => {
      logger.info({
        type: 'user_lifecycle',
        action: 'created',
        userId,
        email: email ? '[REDACTED]' : undefined,
      }, 'New user created');
    },
    
    login: (userId: string, ip?: string) => {
      logger.info({
        type: 'user_lifecycle',
        action: 'login',
        userId,
        ip,
      }, 'User logged in');
    },
    
    logout: (userId: string) => {
      logger.info({
        type: 'user_lifecycle',
        action: 'logout',
        userId,
      }, 'User logged out');
    },
  },
  
  listing: {
    created: (listingId: string, userId: string, category?: string) => {
      logger.info({
        type: 'listing_lifecycle',
        action: 'created',
        listingId,
        userId,
        category,
      }, 'New listing created');
    },
    
    sold: (listingId: string, buyerId: string, sellerId: string, amount: number) => {
      logger.info({
        type: 'listing_lifecycle',
        action: 'sold',
        listingId,
        buyerId,
        sellerId,
        amount,
      }, 'Listing sold');
    },
  },
  
  buyback: {
    offered: (offerId: string, userId: string, itemType: string, amount: number) => {
      logger.info({
        type: 'buyback_lifecycle',
        action: 'offered',
        offerId,
        userId,
        itemType,
        amount,
      }, 'Buyback offer created');
    },
    
    accepted: (offerId: string, userId: string, amount: number) => {
      logger.info({
        type: 'buyback_lifecycle',
        action: 'accepted',
        offerId,
        userId,
        amount,
      }, 'Buyback offer accepted');
    },
  },
};

// Security logger
export const securityLogger = {
  authAttempt: (success: boolean, email?: string, ip?: string, reason?: string) => {
    const level = success ? 'info' : 'warn';
    logger[level]({
      type: 'security_auth',
      success,
      email: email ? '[REDACTED]' : undefined,
      ip,
      reason,
    }, success ? 'Authentication successful' : 'Authentication failed');
  },
  
  suspiciousActivity: (activity: string, userId?: string, ip?: string, details?: any) => {
    logger.warn({
      type: 'security_suspicious',
      activity,
      userId,
      ip,
      details,
    }, 'Suspicious activity detected');
  },
  
  rateLimit: (ip: string, endpoint: string, limit: number) => {
    logger.warn({
      type: 'security_rate_limit',
      ip,
      endpoint,
      limit,
    }, 'Rate limit exceeded');
  },
};

// Utility functions
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Export logger types for TypeScript
export type Logger = typeof logger;
export type RequestLogger = typeof requestLogger;
export type ServiceLogger = typeof serviceLogger;
export type BusinessLogger = typeof businessLogger;
export type SecurityLogger = typeof securityLogger;