import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Rate limiting configurations (simplified without external dependencies)
export const createRateLimit = (maxRequests: number, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const requestTimes = requests.get(key) || [];
    
    // Clean old requests outside the window
    const validRequests = requestTimes.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / (60 * 1000))} minutes.`,
      });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    next();
  };
};

// Specific rate limiters
export const authRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 login attempts per 15 minutes
export const apiRateLimit = createRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const uploadRateLimit = createRateLimit(10, 60 * 60 * 1000); // 10 uploads per hour
export const searchRateLimit = createRateLimit(60, 60 * 1000); // 60 searches per minute
export const paymentRateLimit = createRateLimit(10, 60 * 60 * 1000); // 10 payment attempts per hour
export const buybackRateLimit = createRateLimit(5, 60 * 60 * 1000); // 5 buyback offers per hour
export const messageRateLimit = createRateLimit(30, 60 * 60 * 1000); // 30 messages per hour

// Input sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/[<>]/g, '') // Remove angle brackets
        .slice(0, 1000); // Limit length
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitizeObject(obj[key]);
      });
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// File upload validation middleware
export const validateFileUpload = (req: Request & { file?: any; files?: any }, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const validateSingleFile = (file: any) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size cannot exceed 5MB");
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error("Only JPEG, PNG, and WebP files are allowed");
    }

    // Check filename
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
      throw new Error("Invalid file extension");
    }
  };

  try {
    if (req.file) {
      validateSingleFile(req.file);
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(validateSingleFile);
      } else {
        Object.values(req.files).flat().forEach(validateSingleFile);
      }
    }

    next();
  } catch (error) {
    res.status(400).json({ 
      message: "File validation failed", 
      error: error instanceof Error ? error.message : "Invalid file" 
    });
  }
};

// Request ID middleware for tracking
export const requestId = (req: Request & { id?: string }, res: Response, next: NextFunction) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
};

// CORS middleware for API routes
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'https://opshop.online',
    'https://www.opshop.online',
    process.env.NODE_ENV === 'development' ? `http://localhost:5000` : null,
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Security middleware for admin routes
export const adminSecurityCheck = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns in request
  const suspiciousPatterns = [
    /(\.\.|\/\.\.|\\\.\.)/g, // Path traversal
    /(union|select|insert|delete|update|drop|create|alter)/gi, // SQL injection
    /(<script|javascript:|vbscript:|onload=|onerror=)/gi, // XSS
  ];

  const checkString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn(`Suspicious request detected from ${req.ip}:`, {
        url: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        pattern: pattern.source,
      });
      
      return res.status(400).json({ 
        message: "Request contains suspicious content" 
      });
    }
  }
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

export default {
  sanitizeRequest,
  validateFileUpload,
  requestId,
  corsMiddleware,
  adminSecurityCheck,
  requestLogger,
};