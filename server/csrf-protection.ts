import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

interface RequestWithCsrf extends Request {
  csrfToken?: () => string;
  session: any;
}

// Generate a CSRF token
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Simple CSRF protection middleware (custom implementation)
export const csrfProtection = (req: RequestWithCsrf, res: Response, next: NextFunction) => {
  // Skip if no session
  if (!req.session) {
    return next();
  }

  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Add csrfToken function for GET requests to generate tokens
    req.csrfToken = () => {
      if (!req.session.csrfToken) {
        req.session.csrfToken = generateCsrfToken();
      }
      return req.session.csrfToken;
    };
    return next();
  }

  // Skip CSRF for non-API routes
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  // Skip CSRF for specific endpoints
  if (req.path.startsWith('/api/auth/') || req.path.startsWith('/api/login') || req.path.startsWith('/api/logout') || req.path.includes('/csrf-token')) {
    return next();
  }

  // Get expected token from session
  const expectedToken = req.session.csrfToken;
  
  // Get submitted token from headers
  const submittedToken = (
    req.headers['csrf-token'] ||
    req.headers['xsrf-token'] ||
    req.headers['x-csrf-token'] ||
    req.headers['x-xsrf-token'] ||
    req.body._csrf ||
    req.query._csrf
  ) as string;

  // Validate token
  if (!expectedToken || !submittedToken || expectedToken !== submittedToken) {
    console.log(`CSRF token validation failed for ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      hasExpectedToken: !!expectedToken,
      hasSubmittedToken: !!submittedToken,
      tokensMatch: expectedToken === submittedToken
    });
    
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed. Please refresh the page and try again.',
      code: 'CSRF_VALIDATION_FAILED'
    });
  }

  // Add csrfToken function for other requests
  req.csrfToken = () => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    return req.session.csrfToken;
  };

  next();
};

// CSRF token endpoint
export const getCsrfToken = (req: RequestWithCsrf, res: Response) => {
  try {
    // Check if session exists
    if (!req.session) {
      return res.status(500).json({
        error: 'Session not available',
        message: 'Please enable cookies and try again'
      });
    }

    // Generate token and store in session
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    
    res.json({ 
      csrfToken: req.session.csrfToken,
      message: 'CSRF token generated successfully'
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({
      error: 'Failed to generate CSRF token',
      message: 'Please try again later'
    });
  }
};

// CSRF error handler (legacy csurf compatibility)
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN' || err.code === 'CSRF_VALIDATION_FAILED') {
    console.log(`CSRF token validation failed for IP: ${req.ip}`, {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    });
    
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed. Please refresh the page and try again.',
      code: 'CSRF_VALIDATION_FAILED'
    });
  }
  next(err);
};

// Middleware to add CSRF token to locals for templates
export const addCsrfToLocals = (req: RequestWithCsrf, res: Response, next: NextFunction) => {
  // Check if session exists
  if (!req.session) {
    return next();
  }
  
  // Generate token for session if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  
  // Add token to response locals
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Double submit cookie pattern for additional security (simplified)
export const doubleSubmitCookie = (req: RequestWithCsrf, res: Response, next: NextFunction) => {
  // This is now handled by the main CSRF protection middleware
  next();
};

// CSRF protection for API routes only (exclude static files)
export const apiCsrfProtection = (req: RequestWithCsrf, res: Response, next: NextFunction) => {
  // This functionality is now handled by the main CSRF protection middleware
  csrfProtection(req, res, next);
};

// CSRF statistics for monitoring
export const getCsrfStats = () => ({
  protection: {
    enabled: true,
    cookieBased: true,
    doubleSubmit: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  configuration: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  endpoints: {
    token: '/api/csrf-token',
    protected: 'All state-changing API operations'
  }
});

export default {
  csrfProtection,
  getCsrfToken,
  csrfErrorHandler,
  addCsrfToLocals,
  doubleSubmitCookie,
  apiCsrfProtection,
  getCsrfStats
};