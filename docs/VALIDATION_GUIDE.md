# Validation Layer Guide

## Overview

Opshop Online implements a comprehensive validation layer using Zod schemas to ensure data integrity, security, and type safety across all API endpoints. This guide covers the validation system implementation, usage patterns, and best practices.

## Validation Architecture

### Core Components

1. **Zod Schemas** (`server/validation.ts`) - Type-safe validation schemas
2. **Middleware Functions** - Request validation middleware for Express routes
3. **Security Middleware** (`server/validation-middleware.ts`) - Additional security layers
4. **Error Handling** - Standardized validation error responses

### Schema Types

#### Database Entity Schemas
- `insertUserSchema` - User creation validation
- `insertProductSchema` - Product creation validation
- `insertOrderSchema` - Order validation
- `insertMessageSchema` - Message validation
- And more for all entities

#### API-Specific Schemas
- `productQuerySchema` - Product search and filtering
- `cartActionSchema` - Cart operations
- `guestCartActionSchema` - Guest cart operations
- `buybackEvaluationSchema` - AI buyback evaluations
- `messageSchema` - User messaging

#### Parameter Validation
- `idParamSchema` - Numeric ID parameters
- `uuidParamSchema` - UUID session parameters
- `paginationSchema` - Pagination parameters

## Middleware Functions

### Core Validation Functions

```typescript
// Validate request body
validateBody(schema)

// Validate query parameters  
validateQuery(schema)

// Validate URL parameters
validateParams(schema)

// Combined validation
validate({ body: schema1, query: schema2, params: schema3 })
```

### Usage Examples

#### Product Creation with Validation
```typescript
app.post('/api/products', 
  isAuthenticated, 
  validateBody(insertProductSchema.omit({ id: true, sellerId: true })), 
  async (req, res) => {
    // Request body is now validated and type-safe
    const { title, description, price, categoryId } = req.body;
    // Implementation...
  }
);
```

#### Search with Query Validation
```typescript
app.get('/api/products/search', 
  validateQuery(z.object({
    q: z.string().min(2, "Search query must be at least 2 characters"),
    limit: z.string().optional().transform(val => Math.min(100, parseInt(val || "20")))
  })), 
  async (req, res) => {
    const { q: query, limit } = req.query;
    // Query parameters are validated and transformed
  }
);
```

#### Parameter Validation
```typescript
app.get('/api/products/:id', 
  validateParams(idParamSchema), 
  async (req, res) => {
    const { id } = req.params; // id is now guaranteed to be a valid integer
  }
);
```

## Security Features

### Input Sanitization

The validation layer includes automatic input sanitization:

```typescript
// Sanitizes input by removing script tags and limiting length
const sanitizedContent = sanitizeInput(userInput);
```

### Rate Limiting

Multiple rate limiting strategies are implemented:

```typescript
// Authentication endpoints - 5 attempts per 15 minutes
app.use('/api/auth', authRateLimit);

// API endpoints - 100 requests per 15 minutes  
app.use('/api', apiRateLimit);

// Search endpoints - 60 requests per minute
app.use('/api/search', searchRateLimit);

// File uploads - 10 uploads per hour
app.use('/api/upload', uploadRateLimit);
```

### File Upload Validation

```typescript
app.post('/api/upload', validateFileUpload, async (req, res) => {
  // Files are validated for:
  // - Size limit (5MB)
  // - Allowed types (JPEG, PNG, WebP)
  // - Valid extensions
});
```

### Security Headers

```typescript
// Helmet.js security headers
app.use(securityHeaders);

// Custom CORS configuration
app.use(corsMiddleware);

// Admin route security checks
app.use('/api/admin', adminSecurityCheck);
```

## Validated Endpoints

### Product Management
- `GET /api/products` - Product listing with filters (validated query parameters)
- `GET /api/products/:id` - Single product (validated ID parameter)
- `POST /api/products` - Create product (validated product data)
- `GET /api/products/search` - Search products (validated search query)

### Cart Operations
- `POST /api/cart` - Add to cart (validated product ID and quantity)
- `PATCH /api/cart/:cartItemId` - Update quantity (validated parameters and body)
- `POST /api/guest-cart` - Guest cart operations (validated session and product data)
- `GET /api/guest-cart/:sessionId` - Get guest cart (validated UUID session)

### User Communication
- `POST /api/messages` - Send message (validated content with sanitization)

### Buyback System
- `POST /api/buyback/offer` - Create buyback offer (validated item details)
- `POST /api/admin/buyback/approve` - Admin approval (validated admin actions)

## Error Handling

### Validation Error Format

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "path": "quantity",
      "message": "Quantity must be at least 1",
      "code": "too_small"
    }
  ]
}
```

### Common Validation Rules

#### String Validation
- Email format validation
- Minimum/maximum length constraints
- Pattern matching (phone numbers, postcodes)
- Content sanitization

#### Numeric Validation
- Positive integer validation for IDs
- Price range validation
- Quantity limits (1-10 for cart items)

#### Australian-Specific Validation
- Postcode format (4 digits)
- Phone number format (+61 or 0 prefix)
- Address validation for shipping

#### Business Logic Validation
- Product categories must exist
- User permissions for actions
- Stock availability checks
- Price reasonableness checks

## Best Practices

### Schema Design
1. **Reuse Base Schemas** - Extend database schemas for API validation
2. **Transform Data** - Use Zod transforms for type conversion
3. **Provide Clear Messages** - Custom error messages for user-facing errors
4. **Validate Early** - Apply validation at route level before business logic

### Security Considerations
1. **Sanitize Input** - Always sanitize user-provided content
2. **Limit Input Size** - Prevent large payload attacks
3. **Rate Limiting** - Protect against abuse
4. **File Validation** - Strict file type and size checking

### Performance Optimization
1. **Schema Caching** - Reuse schema instances
2. **Minimal Validation** - Only validate what's necessary
3. **Early Validation** - Fail fast on invalid requests
4. **Efficient Transforms** - Use lightweight data transformations

## Testing Validation

### Unit Tests
```typescript
describe('Product validation', () => {
  it('should validate valid product data', () => {
    const validProduct = {
      title: "Test Product",
      description: "A test product",
      price: 29.99,
      categoryId: 1
    };
    
    const result = insertProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid price', () => {
    const invalidProduct = {
      title: "Test Product",
      price: -10 // Invalid negative price
    };
    
    const result = insertProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});
```

### API Testing
```typescript
describe('POST /api/products', () => {
  it('should reject invalid product data', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ price: -10 }) // Invalid data
      .expect(400);
    
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toHaveLength(1);
  });
});
```

## Monitoring and Debugging

### Validation Metrics
- Failed validation attempts
- Most common validation errors
- Endpoint-specific error rates
- Security incident detection

### Debugging Tips
1. **Log Validation Errors** - Include request context
2. **Track Error Patterns** - Identify systematic issues
3. **Monitor Performance** - Watch validation overhead
4. **Test Edge Cases** - Boundary value testing

## Migration Guide

### Adding New Validation

1. **Define Schema** in `server/validation.ts`
```typescript
export const newFeatureSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive()
});
```

2. **Apply Middleware** to routes
```typescript
app.post('/api/new-feature', validateBody(newFeatureSchema), handler);
```

3. **Update Frontend** to handle validation errors
```typescript
try {
  await apiRequest('POST', '/api/new-feature', data);
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
  }
}
```

### Updating Existing Schemas

1. **Add Optional Fields** first for backward compatibility
2. **Deprecate Old Fields** gradually
3. **Update Documentation** and examples
4. **Test Thoroughly** with existing data

## Conclusion

The validation layer provides comprehensive data integrity, security, and type safety for Opshop Online. By following these patterns and best practices, developers can ensure robust API endpoints that handle user input safely and provide clear feedback on validation errors.

For implementation details, refer to:
- `server/validation.ts` - Core validation schemas
- `server/validation-middleware.ts` - Security middleware
- `server/routes.ts` - Applied validation examples