import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { 
  users, 
  products, 
  categories, 
  cartItems, 
  guestCartSessions,
  orders, 
  messages, 
  wishlists,
  savedItems,
  buybackOffers,
  commissions,
  payouts
} from "@shared/schema";

// Create Zod schemas from Drizzle tables
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);

export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertGuestCartSessionSchema = createInsertSchema(guestCartSessions);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertMessageSchema = createInsertSchema(messages);
export const insertWishlistSchema = createInsertSchema(wishlists);
export const insertSavedItemSchema = createInsertSchema(savedItems);
export const insertBuybackOfferSchema = createInsertSchema(buybackOffers);
export const insertCommissionSchema = createInsertSchema(commissions);
export const insertPayoutSchema = createInsertSchema(payouts);

// API-specific validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const productQuerySchema = z.object({
  categoryId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  condition: z.enum(["new", "like-new", "good", "fair", "poor"]).optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  location: z.string().optional(),
  search: z.string().optional(),
  latitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  radius: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
});

export const cartActionSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10"),
});

export const guestCartActionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10"),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  content: z.string().min(1, "Message content cannot be empty").max(1000, "Message too long"),
  listingId: z.number().int().positive().optional(),
});

export const buybackEvaluationSchema = z.object({
  title: z.string().min(1, "Product title is required").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long"),
  condition: z.enum(["new", "like-new", "good", "fair", "poor"], {
    errorMap: () => ({ message: "Invalid condition. Must be one of: new, like-new, good, fair, poor" })
  }),
  categoryId: z.number().int().positive("Valid category must be selected"),
  originalPrice: z.number().positive("Original price must be greater than 0").max(50000, "Price cannot exceed $50,000"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
});

export const payoutRequestSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(100000, "Amount too large"),
  paymentMethod: z.enum(["stripe", "paypal"], {
    errorMap: () => ({ message: "Payment method must be either 'stripe' or 'paypal'" })
  }),
  paymentDetails: z.record(z.string()).optional(),
});

export const orderCreateSchema = z.object({
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10"),
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postcode: z.string().regex(/^\d{4}$/, "Invalid Australian postcode"),
    country: z.literal("Australia", { errorMap: () => ({ message: "Only Australian addresses supported" }) }),
  }),
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export const guestOrderCreateSchema = orderCreateSchema.extend({
  customerInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().regex(/^(\+61|0)[2-9]\d{8}$/, "Invalid Australian phone number"),
  }),
  guestSessionId: z.string().uuid("Invalid session ID format"),
});

export const adminActionSchema = z.object({
  action: z.enum(["approve", "reject", "revise"], {
    errorMap: () => ({ message: "Action must be one of: approve, reject, revise" })
  }),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  revisedPrice: z.number().positive("Revised price must be greater than 0").optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => Math.max(1, parseInt(val || "1"))),
  limit: z.string().optional().transform(val => Math.min(100, Math.max(1, parseInt(val || "20")))),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().transform(val => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("Invalid ID parameter");
    }
    return parsed;
  }),
});

export const uuidParamSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
});

// Validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      return res.status(400).json({
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown validation error",
      });
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      return res.status(400).json({
        message: "Invalid query parameters",
        error: error instanceof Error ? error.message : "Unknown validation error",
      });
    }
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid URL parameters",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      return res.status(400).json({
        message: "Invalid URL parameters",
        error: error instanceof Error ? error.message : "Unknown validation error",
      });
    }
  };
}

// Combined validation for multiple parts of request
export function validate<TBody, TQuery, TParams>(options: {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }
      if (options.query) {
        req.query = options.query.parse(req.query) as any;
      }
      if (options.params) {
        req.params = options.params.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      return res.status(400).json({
        message: "Invalid request data",
        error: error instanceof Error ? error.message : "Unknown validation error",
      });
    }
  };
}

// Security validation helpers
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
};

export const validateFileUpload = z.object({
  filename: z.string().regex(/\.(jpg|jpeg|png|webp)$/i, "Only image files allowed"),
  size: z.number().max(5 * 1024 * 1024, "File size cannot exceed 5MB"),
  mimetype: z.enum(["image/jpeg", "image/png", "image/webp"], {
    errorMap: () => ({ message: "Invalid file type. Only JPEG, PNG, and WebP allowed" })
  }),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  maxRequests: z.number().int().positive().default(100),
  windowMs: z.number().int().positive().default(15 * 60 * 1000), // 15 minutes
});

export default {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  sanitizeInput,
  validateFileUpload,
  // Export all schemas for direct use
  insertUserSchema,
  selectUserSchema,
  insertProductSchema,
  selectProductSchema,
  loginSchema,
  productQuerySchema,
  cartActionSchema,
  guestCartActionSchema,
  messageSchema,
  buybackEvaluationSchema,
  payoutRequestSchema,
  orderCreateSchema,
  guestOrderCreateSchema,
  adminActionSchema,
  paginationSchema,
  idParamSchema,
  uuidParamSchema,
};