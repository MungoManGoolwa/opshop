# Docker Deployment for Opshop Online

This directory contains Docker configuration files for deploying the Opshop Online marketplace application.

## Quick Start

1. **Copy environment file:**
   ```bash
   cp docker/.env.docker docker/.env
   ```

2. **Update environment variables:**
   Edit `docker/.env` with your actual configuration values.

3. **Build and run:**
   ```bash
   cd docker
   docker-compose up -d
   ```

## Files Overview

- `Dockerfile` - Multi-stage Docker image build configuration
- `docker-compose.yml` - Complete application stack with PostgreSQL
- `.dockerignore` - Files to exclude from Docker build context
- `docker-entrypoint.sh` - Application startup script with health checks
- `.env.docker` - Environment variables template
- `README.md` - This documentation file

## Environment Configuration

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session encryption
- `NODE_ENV` - Set to 'production' for production deployment

### Optional Services

- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- **PayPal:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- **Anthropic AI:** `ANTHROPIC_API_KEY`

## Docker Commands

### Build the image:
```bash
docker build -f docker/Dockerfile -t opshop-online .
```

### Run with Docker Compose:
```bash
cd docker
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f opshop-app
```

### Stop services:
```bash
docker-compose down
```

### Rebuild and restart:
```bash
docker-compose down
docker-compose up --build -d
```

## Health Checks

The application includes health check endpoints:

- `/health` - Basic application health
- `/health/ready` - Readiness check including database connectivity
- `/health/live` - Liveness check for container orchestration

## Production Deployment

1. **Security:** Update all default passwords and secrets
2. **SSL/TLS:** Configure reverse proxy (nginx/traefik) for HTTPS
3. **Monitoring:** Set up logging and monitoring solutions
4. **Backups:** Configure automated database backups
5. **Scaling:** Consider using Docker Swarm or Kubernetes for scaling

## Troubleshooting

### Database Connection Issues
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U opshop -d opshop
```

### Application Logs
```bash
docker-compose logs opshop-app
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up --build -d
```

## Architecture

The Docker setup provides:

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for container orchestration
- **Volume mounts** for persistent data
- **Environment-based configuration**
- **Production-ready PostgreSQL** with initialization

## Performance Notes

- Image size optimized with multi-stage build
- Alpine Linux base for minimal footprint
- Production dependencies only in final image
- Health checks for automatic recovery
- Restart policies for high availability