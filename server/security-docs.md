# Security and Rate Limiting Documentation

## Overview
This document describes the security measures and rate limiting implemented in the Opshop Online application.

## Rate Limiting Configuration

### Basic Rate Limiting
- **Limit**: 100 requests per 15 minutes
- **Applies to**: All API endpoints
- **Purpose**: Prevent general API abuse

### Authentication Rate Limiting
- **Limit**: 5 attempts per 15 minutes
- **Applies to**: `/api/auth/*` endpoints
- **Purpose**: Prevent brute force login attempts
- **Features**: Skips counting successful requests

### Search Rate Limiting
- **Limit**: 60 requests per minute
- **Applies to**: `/api/search/*` and `/api/products/search` endpoints
- **Purpose**: Prevent search spam and resource exhaustion

### Payment Rate Limiting
- **Limit**: 10 attempts per hour
- **Applies to**: Payment processing endpoints
- **Purpose**: Prevent payment fraud and abuse

### Buyback Rate Limiting
- **Limit**: 5 requests per hour
- **Applies to**: `/api/buyback` endpoints
- **Purpose**: Prevent spam buyback requests

### Message Rate Limiting
- **Limit**: 30 messages per hour
- **Applies to**: `/api/messages` endpoints
- **Purpose**: Prevent message spam

## Security Middleware

### Suspicious Activity Detection
The security middleware monitors for:
- **Path Traversal**: `../` patterns
- **SQL Injection**: `union select` patterns
- **XSS Attempts**: `<script>` tags
- **JavaScript Injection**: `javascript:` URLs
- **VBScript Injection**: `vbscript:` URLs
- **Event Handler Injection**: `onload=`, `onerror=` patterns

### Suspicious User Agents
Blocks requests from:
- `curl` command-line tool
- `wget` command-line tool
- Python scripts
- Known bots and crawlers
- Web scrapers

### Input Sanitization
- Removes script tags from all input
- Strips angle brackets to prevent HTML injection
- Limits input length to prevent buffer overflow
- Sanitizes nested objects and arrays

## Response Headers
Rate limiting middleware adds standard headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Error Responses
Rate limited requests receive:
- **Status Code**: 429 Too Many Requests
- **Error Message**: Descriptive message with retry information
- **Retry After**: Time to wait before trying again

## Monitoring and Logging
- All rate limit violations are logged with IP address
- Suspicious activity is logged with request details
- Metrics are collected for monitoring dashboard

## Production Considerations
- Consider using Redis for distributed rate limiting
- Implement IP whitelisting for trusted sources
- Add CAPTCHA for repeated violations
- Monitor rate limit metrics for tuning

## Configuration
Rate limits can be adjusted in `server/rate-limiting.ts`:
```javascript
// Example: Increase search rate limit
export const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Increased from 60 to 120
  // ... other options
});
```

## Best Practices
1. **Monitor Metrics**: Watch rate limit violations for patterns
2. **Tune Limits**: Adjust based on legitimate usage patterns
3. **User Feedback**: Provide clear error messages
4. **Graceful Degradation**: Handle rate limits gracefully in UI
5. **Security Logging**: Log and alert on suspicious patterns