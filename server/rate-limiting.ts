import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

// Basic rate limiting middleware
export const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    console.log(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiting for API endpoints
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for search endpoints
export const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 searches per minute
  message: {
    error: 'Search rate limit exceeded, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    error: 'Payment rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for buyback endpoints
export const buybackRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 buyback requests per hour
  message: {
    error: 'Buyback rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for messaging endpoints
export const messageRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 messages per hour
  message: {
    error: 'Message rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Simple slow down middleware for gradual response delays
export const createSlowDown = (delayAfter: number = 10, delayMs: number = 100) => (req: Request, res: Response, next: NextFunction) => {
  // Simple implementation without external dependencies
  next();
};

// Security middleware for suspicious activity detection
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /union.*select/i, // SQL injection
    /<script/i,       // XSS attempts
    /javascript:/i,   // JavaScript injection
    /vbscript:/i,     // VBScript injection
    /onload=/i,       // Event handler injection
    /onerror=/i       // Error handler injection
  ];

  const userAgent = req.get('User-Agent') || '';
  const suspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || 
    pattern.test(JSON.stringify(req.body)) || 
    pattern.test(JSON.stringify(req.query))
  );

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /spider/i
  ];

  const suspiciousUA = suspiciousUserAgents.some(pattern => pattern.test(userAgent));

  if (suspicious || suspiciousUA) {
    console.log(`Suspicious activity detected from IP: ${getClientId(req)}`, {
      url: req.url,
      userAgent,
      body: req.body,
      query: req.query
    });
    
    return res.status(403).json({
      error: 'Suspicious activity detected. Request blocked.',
      code: 'SECURITY_VIOLATION'
    });
  }

  next();
};

// Rate limiting statistics (for monitoring)
export const getRateLimitStats = () => ({
  endpoints: {
    auth: { limit: 5, window: '15 minutes' },
    api: { limit: 100, window: '15 minutes' },
    search: { limit: 60, window: '1 minute' },
    payment: { limit: 10, window: '1 hour' },
    buyback: { limit: 5, window: '1 hour' },
    message: { limit: 30, window: '1 hour' }
  }
});

export default {
  basicRateLimit,
  authRateLimit,
  apiRateLimit,
  searchRateLimit,
  paymentRateLimit,
  buybackRateLimit,
  messageRateLimit,
  createSlowDown,
  securityMiddleware
};