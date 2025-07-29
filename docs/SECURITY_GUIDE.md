# Security and Rate Limiting Guide

## Overview

Opshop Online implements comprehensive security measures including rate limiting, input validation, CORS protection, and request sanitization to protect against common web vulnerabilities and abuse patterns.

## Rate Limiting Strategy

### Implementation

Our rate limiting system uses in-memory storage with IP-based tracking. Each rate limiter maintains a sliding window of requests and automatically cleans expired entries.

### Rate Limits by Endpoint Type

#### Authentication Endpoints
- **Limit**: 5 attempts per 15 minutes
- **Endpoints**: `/api/auth/*`
- **Purpose**: Prevent brute force login attacks
- **Response**: 429 Too Many Requests with retry-after information

#### API Endpoints (General)
- **Limit**: 100 requests per 15 minutes
- **Endpoints**: `/api/*` (fallback for all API routes)
- **Purpose**: Prevent API abuse and DoS attacks
- **Response**: Rate limit exceeded message

#### Search Endpoints
- **Limit**: 60 requests per minute
- **Endpoints**: `/api/products/search`, `/api/search`
- **Purpose**: Protect expensive search operations
- **Response**: Search rate limit exceeded

#### Payment Endpoints
- **Limit**: 10 attempts per hour
- **Endpoints**: `/api/create-payment`, `/api/guest-checkout`
- **Purpose**: Prevent payment fraud and abuse
- **Response**: Payment rate limit exceeded

#### Buyback System
- **Limit**: 5 offers per hour
- **Endpoints**: `/api/buyback/*`
- **Purpose**: Prevent AI service abuse and spam offers
- **Response**: Buyback rate limit exceeded

#### Messaging System
- **Limit**: 30 messages per hour
- **Endpoints**: `/api/messages`
- **Purpose**: Prevent spam and harassment
- **Response**: Message rate limit exceeded

#### File Uploads
- **Limit**: 10 uploads per hour
- **Endpoints**: File upload endpoints
- **Purpose**: Prevent storage abuse
- **Response**: Upload rate limit exceeded

## Security Middleware

### Request Sanitization

All incoming requests are automatically sanitized to prevent XSS and injection attacks:

```typescript
// Automatic sanitization applied to all requests
app.use(sanitizeRequest);
```

**Features:**
- Removes script tags from all string inputs
- Strips angle brackets (`<>`) to prevent HTML injection
- Limits input length to 1000 characters
- Recursively sanitizes nested objects and arrays

### CORS Protection

Cross-Origin Resource Sharing is configured for production security:

```typescript
// Allowed origins for opshop.online
const allowedOrigins = [
  'https://opshop.online',
  'https://www.opshop.online',
  'http://localhost:5000' // Development only
];
```

**Configuration:**
- Restricts origin to opshop.online domains
- Allows credentials for authenticated requests
- Supports standard HTTP methods
- Handles preflight OPTIONS requests

### Admin Security Checks

Admin routes have additional security validation:

```typescript
app.use('/api/admin', adminSecurityCheck);
```

**Security Patterns Detected:**
- Path traversal attempts (`../`, `..\\`)
- SQL injection patterns (`UNION`, `SELECT`, etc.)
- XSS attempts (`<script>`, `javascript:`, etc.)
- Suspicious request patterns

**Response**: 400 Bad Request with "suspicious content" message

### Request Tracking

Every request gets a unique identifier for tracking and debugging:

```typescript
app.use(requestId); // Adds X-Request-ID header
app.use(requestLogger); // Logs request details
```

## File Upload Security

### Validation Rules

File uploads are strictly validated:

- **Size Limit**: 5MB maximum
- **Allowed Types**: JPEG, PNG, WebP only
- **Extension Check**: Must match MIME type
- **Content Validation**: File headers are verified

### Security Features

```typescript
// File upload validation
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxSize = 5 * 1024 * 1024; // 5MB
```

**Protection Against:**
- Executable file uploads
- Oversized file attacks
- MIME type spoofing
- Directory traversal in filenames

## Input Validation Security

### Zod Schema Validation

All API endpoints use Zod schemas for type-safe validation:

- **Data Type Enforcement**: Ensures correct data types
- **Range Validation**: Min/max values for numbers and strings
- **Format Validation**: Email, phone, postcode formats
- **Business Logic**: Australian-specific validation rules

### Australian-Specific Security

Special validation for Australian market:

```typescript
// Australian postcode validation
const postcodeSchema = z.string().regex(/^\d{4}$/, "Invalid Australian postcode");

// Australian phone number validation
const phoneSchema = z.string().regex(/^(\+61|0)[2-9]\d{8}$/, "Invalid Australian phone number");
```

## Monitoring and Alerting

### Security Event Logging

All security events are logged with request context:

```typescript
console.warn('Suspicious request detected:', {
  ip: req.ip,
  url: req.url,
  userAgent: req.headers['user-agent'],
  pattern: 'detected_pattern'
});
```

### Rate Limit Monitoring

Track rate limit violations:

- Failed requests by IP address
- Most frequently hit endpoints
- Patterns indicating automated attacks
- Geographic distribution of blocked requests

### Security Metrics

Monitor security health:

- Authentication failure rates
- File upload rejection rates
- Admin access attempts
- Validation failure patterns

## Best Practices

### For Developers

1. **Always Validate Input**: Use Zod schemas for all user input
2. **Sanitize Output**: Clean data before database storage
3. **Log Security Events**: Track suspicious activity
4. **Test Edge Cases**: Validate boundary conditions
5. **Update Dependencies**: Keep security patches current

### For Administrators

1. **Monitor Logs**: Regular review of security events
2. **Adjust Limits**: Tune rate limits based on usage patterns
3. **Block Bad Actors**: IP-based blocking for persistent abuse
4. **Regular Audits**: Periodic security assessment
5. **Incident Response**: Procedures for security breaches

### For Users

1. **Strong Passwords**: Encourage secure authentication
2. **Report Abuse**: Mechanisms for reporting suspicious activity
3. **Account Security**: Monitor for unauthorized access
4. **Safe Uploads**: Guidelines for file sharing

## Rate Limit Bypass Prevention

### Implementation Details

- **IP-based Tracking**: Cannot be bypassed with user accounts
- **Memory Storage**: Fast response times for rate checking
- **Sliding Window**: More accurate than fixed-window approaches
- **Automatic Cleanup**: Prevents memory leaks from old entries

### Advanced Protection

- **Distributed Rate Limiting**: Ready for multi-server deployment
- **Rate Limit Headers**: Standard HTTP headers for client awareness
- **Graceful Degradation**: Service continues with protection active
- **Monitoring Integration**: Alerts for unusual traffic patterns

## Incident Response

### Rate Limit Violations

1. **Log the Event**: Capture full request context
2. **Analyze Pattern**: Determine if attack or legitimate spike
3. **Adjust Limits**: Temporary increases for legitimate traffic
4. **Block Source**: IP blocking for confirmed attacks

### Security Breaches

1. **Immediate Response**: Block malicious requests
2. **Assess Damage**: Check for data compromise
3. **Notify Users**: Inform affected customers
4. **Improve Security**: Implement additional protections

### Recovery Procedures

1. **Service Restoration**: Restore normal operation
2. **Data Integrity**: Verify database consistency
3. **Security Updates**: Apply emergency patches
4. **Post-Incident Review**: Learn from the incident

## Testing Security

### Penetration Testing

Regular testing of security measures:

- **Rate Limit Testing**: Verify limits are enforced
- **Input Validation**: Test with malicious payloads
- **Authentication**: Verify access controls
- **File Upload**: Test with malicious files

### Automated Testing

Continuous security validation:

```typescript
describe('Rate Limiting', () => {
  it('should block excessive requests', async () => {
    // Make requests exceeding rate limit
    for (let i = 0; i < 6; i++) {
      const response = await request(app).post('/api/auth/login');
      if (i < 5) {
        expect(response.status).not.toBe(429);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

## Configuration

### Environment Variables

Security configuration through environment variables:

```bash
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Request limit

# CORS
ALLOWED_ORIGINS=https://opshop.online,https://www.opshop.online

# Security
ENABLE_SECURITY_LOGGING=true
BLOCK_SUSPICIOUS_REQUESTS=true
```

### Production Settings

Recommended production configuration:

- Enable all rate limiting
- Strict CORS policy
- Comprehensive logging
- Automated alerting
- Regular security audits

## Compliance

### Data Protection

- **Input Sanitization**: Protects against data corruption
- **Access Controls**: Prevents unauthorized data access
- **Audit Logging**: Tracks all security events
- **Incident Response**: Procedures for data breaches

### Industry Standards

- **OWASP Guidelines**: Following web security best practices
- **API Security**: RESTful API protection standards
- **Rate Limiting**: Industry-standard implementation
- **Input Validation**: Comprehensive data validation

## Conclusion

Opshop Online's security layer provides comprehensive protection against common web vulnerabilities and abuse patterns. The multi-layered approach combining rate limiting, input validation, sanitization, and monitoring ensures a secure marketplace environment for all users.

Regular monitoring, testing, and updates maintain the effectiveness of these security measures against evolving threats.