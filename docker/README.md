# Opshop Online - Docker Deployment

This folder contains the Docker configuration and deployment package for Opshop Online marketplace.

## Contents

- `Dockerfile` - Production-ready Docker image configuration
- `docker-compose.yml` - Complete application stack with PostgreSQL
- `.dockerignore` - Files to exclude from Docker builds
- `opshop-online-deployment-*.tar.gz` - Complete application deployment package

## Deployment Package

The deployment package contains the complete Opshop Online application ready for deployment:

### What's Included:
- All source code (client, server, shared)
- Configuration files and schemas
- Database migrations and initialization scripts
- Docker configuration files
- Documentation and setup instructions

### What's Excluded:
- node_modules (will be installed during build)
- Build artifacts (generated during deployment)
- Log files and temporary data
- Environment secrets (must be configured separately)

## Quick Start with Docker

```bash
# Extract deployment package
tar -xzf opshop-online-deployment-*.tar.gz

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Build and start the application
docker-compose up -d

# Check application health
curl http://localhost:3000/health
```

## Environment Variables Required

```env
DATABASE_URL=postgresql://user:password@postgres:5432/opshop
SESSION_SECRET=your-secure-session-secret
STRIPE_SECRET_KEY=sk_test_or_live_key
VITE_STRIPE_PUBLIC_KEY=pk_test_or_live_key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
ANTHROPIC_API_KEY=your-anthropic-api-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.com
POSTGRES_PASSWORD=secure-database-password
```

## Application Features

The deployment includes:
- Complete React.js frontend with responsive design
- Express.js backend with comprehensive API
- PostgreSQL database with full schema
- AI-powered instant buyback system
- Payment processing (Stripe & PayPal)
- User authentication and role management
- Location-based product search
- Administrative dashboard
- Progressive Web App (PWA) capabilities

## Health Checks

The application includes health check endpoints:
- `/health` - Basic application health
- `/health/ready` - Application readiness check
- `/health/live` - Application liveness check

## Monitoring

Built-in monitoring features:
- Structured logging with Pino
- Request tracking and performance metrics
- Error logging and reporting
- Admin analytics dashboard

## Support

This is a production-ready deployment of Opshop Online marketplace platform.
For technical support or customization, contact the development team.