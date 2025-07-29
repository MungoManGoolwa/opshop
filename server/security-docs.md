# Security Documentation - Opshop Online

## Overview

This document outlines the comprehensive security measures implemented in Opshop Online to protect against common web vulnerabilities and attacks.

## CSRF Protection

### Implementation
- **Package**: `csurf` middleware for Express.js
- **Method**: Cookie-based CSRF tokens with double-submit cookie pattern
- **Scope**: All state-changing API operations (POST, PUT, PATCH, DELETE)

### Configuration
```javascript
// CSRF Protection Settings
- httpOnly: true
- secure: production environment only
- sameSite: 'strict'
- ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
```

### Client Integration
- **Automatic Token Fetching**: Client automatically fetches CSRF tokens from `/api/csrf-token`
- **Token Caching**: Tokens are cached and reused until expiry
- **Retry Logic**: Failed CSRF validation triggers automatic token refresh and retry
- **Header**: Tokens sent via `X-CSRF-Token` header

### Endpoints
- **Token Endpoint**: `GET /api/csrf-token`
- **Statistics**: `GET /api/admin/csrf-stats` (admin only)

## Rate Limiting

### Endpoint-Specific Limits
- **Authentication**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes  
- **Search**: 60 requests per minute
- **Payments**: 10 requests per hour
- **Buyback**: 5 requests per hour
- **Messages**: 30 requests per hour

### Configuration
- **Package**: `express-rate-limit`
- **Storage**: Memory store with IPv6 support
- **Headers**: Standard rate limit headers included
- **Logging**: Rate limit violations logged with IP and user agent

### Admin Monitoring
- **Statistics**: `GET /api/admin/rate-limit-stats`
- **Real-time**: Rate limit status and configuration available

## Input Sanitization

### Request Sanitization
- **XSS Prevention**: All string inputs sanitized to remove script tags
- **HTML Encoding**: User content properly escaped before storage
- **SQL Injection**: Parameterized queries via Drizzle ORM
- **Path Traversal**: Directory traversal patterns blocked

### Validation Layer
- **Schema Validation**: Zod schemas for all API endpoints
- **Type Safety**: TypeScript enforcement for data structures
- **Australian Formats**: Postcode and phone number validation
- **File Uploads**: MIME type and size validation

## Suspicious Activity Detection

### Pattern Detection
- **SQL Injection**: Common injection patterns blocked
- **XSS Attempts**: Script injection attempts logged and blocked
- **Path Traversal**: `../` and similar patterns detected
- **Malicious User Agents**: Known bot patterns identified

### Response Actions
- **Immediate Blocking**: Suspicious requests return 403 Forbidden
- **Logging**: All security events logged with request details
- **IP Tracking**: Repeat offenders monitored

## CORS Protection

### Configuration
- **Allowed Origins**: Domain-specific origins for opshop.online
- **Methods**: Limited to required HTTP methods
- **Headers**: Restricted header access
- **Credentials**: Cookie support for authenticated requests

## Session Security

### Session Management
- **Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Security**: HTTP-only, secure, SameSite cookies
- **Expiry**: Configurable session timeouts
- **Regeneration**: Session IDs regenerated on authentication

### Authentication
- **Provider**: Replit Auth with OpenID Connect
- **Multi-factor**: Social login options (Google, Facebook, GitHub)
- **Token Refresh**: Automatic token refresh for expired sessions

## File Upload Security

### Validation
- **MIME Types**: Strict file type validation
- **File Size**: Configurable size limits (5MB default)
- **Extensions**: Allowed file extension whitelist
- **Content Scanning**: File content validation

### Storage
- **Location**: Local filesystem with access controls
- **Naming**: UUID-based file naming to prevent conflicts
- **Path Security**: Upload paths sanitized and validated

## Admin Security

### Access Control
- **Role-Based**: Admin, moderator, seller, customer roles
- **Route Protection**: Admin routes require role verification
- **Impersonation**: Secure admin user impersonation with audit logs
- **Session Tracking**: Admin sessions monitored separately

### Security Middleware
- **Admin Routes**: Additional security checks for `/api/admin/*`
- **Privilege Escalation**: Prevents unauthorized role changes
- **Audit Logging**: All admin actions logged with timestamps

## Monitoring and Logging

### Security Logging
- **Structured Logs**: JSON-formatted security events
- **Request Tracking**: Unique request IDs for correlation
- **IP Logging**: Source IP tracking with rate limit correlation
- **Error Tracking**: Security violations logged with context

### Performance Monitoring
- **Health Checks**: System health endpoints for monitoring
- **Metrics Collection**: Request timing and throughput metrics
- **Alert System**: Automated alerts for security anomalies

## Environment Security

### Configuration Management
- **Environment Variables**: Sensitive data stored in environment
- **Secret Management**: API keys and tokens properly secured
- **Configuration Validation**: Startup validation of required secrets
- **Service Degradation**: Graceful handling of missing services

### Production Security
- **HTTPS**: Secure HTTP connections in production
- **Security Headers**: Comprehensive security header implementation
- **Error Handling**: Production error messages don't expose internals
- **Debug Mode**: Debug information disabled in production

## Incident Response

### Detection
- **Real-time Monitoring**: Active monitoring of security events
- **Automated Alerts**: Immediate notification of security incidents
- **Pattern Analysis**: Trend analysis for attack pattern identification

### Response Procedures
1. **Immediate**: Block malicious requests automatically
2. **Investigation**: Log analysis and incident investigation
3. **Mitigation**: Apply additional protections as needed
4. **Recovery**: System recovery and data integrity verification
5. **Post-incident**: Security review and improvement implementation

## Best Practices

### Development
- **Security Reviews**: Code reviews with security focus
- **Dependency Updates**: Regular security updates for dependencies
- **Testing**: Security testing in development pipeline
- **Documentation**: Security requirements in development guidelines

### Operations
- **Regular Audits**: Periodic security audits and assessments
- **Backup Security**: Secure backup procedures and testing
- **Access Reviews**: Regular review of admin access and permissions
- **Update Schedule**: Regular security updates and patches

## Contact Information

For security-related issues or questions:
- **Internal**: Contact system administrators
- **External**: Security incidents should be reported immediately
- **Documentation**: This document updated with security changes

---

**Last Updated**: January 29, 2025
**Version**: 1.0
**Classification**: Internal Use