# 🐳 Docker Setup for Opshop Online

This guide helps you run the complete Opshop Online marketplace application using Docker on your local machine.

> **Note**: All Docker-related files are now organized in the `/docker` directory for better project structure.

## 🚀 Quick Start

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- 8GB+ RAM recommended
- 10GB+ disk space

### 2. Download and Setup

```bash
# Create project directory
mkdir opshop-online && cd opshop-online

# Download all Docker files (you can copy the files from the Replit project)
# Or clone if you have the repository

# Navigate to Docker directory
cd docker

# Copy environment configuration
cp .env.docker .env

# Edit .env file with your API keys (optional for basic testing)
nano .env
```

### 3. Start the Application

```bash
# From the /docker directory:
# Start all services (database, redis, app)
docker-compose up -d

# View logs
docker-compose logs -f app

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Main Application**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Database**: localhost:5432 (user: opshop_user, password: opshop_secure_password_2024)
- **Redis**: localhost:6379 (password: opshop_redis_password_2024)

## 📋 Available Commands

```bash
# Start all services
docker-compose up -d

# Start with build (after code changes)
docker-compose up --build -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart a specific service
docker-compose restart app

# Execute commands in running container
docker-compose exec app npm run db:push
docker-compose exec postgres psql -U opshop_user -d opshop

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up
```

## 🛠️ Configuration

### Environment Variables

Edit the `.env` file to configure:

#### Required for Full Functionality
- `STRIPE_SECRET_KEY` & `VITE_STRIPE_PUBLIC_KEY` - Payment processing
- `ANTHROPIC_API_KEY` - AI-powered buyback features
- `SESSION_SECRET` - Session security (generate a secure random string)

#### Optional Features
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` - PayPal payments
- `VITE_GA_MEASUREMENT_ID` - Google Analytics
- `VITE_SENTRY_DSN` - Error tracking

### API Keys Setup

1. **Stripe**: Visit https://dashboard.stripe.com/apikeys
2. **Anthropic**: Visit https://console.anthropic.com/
3. **PayPal**: Visit https://developer.paypal.com/
4. **Google Analytics**: Visit https://analytics.google.com/

## 🏗️ Architecture

The Docker setup includes:

- **PostgreSQL 15**: Main database with persistent storage
- **Redis 7**: Session storage and caching
- **Node.js App**: React frontend + Express backend
- **Nginx** (optional): Reverse proxy for production

### Volumes

- `postgres_data`: Database files
- `redis_data`: Redis persistence
- `uploads_data`: User uploaded files (images, documents)

## 🔧 Development Mode

For development with hot reload:

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up

# Or build development image
docker build -f Dockerfile.dev -t opshop-dev .
```

## 🧪 Testing

```bash
# Run tests in container
docker-compose exec app npm test

# Run E2E tests
docker-compose exec app npm run test:e2e

# Check health
curl http://localhost:5000/health
```

## 📊 Monitoring

### Health Checks
- App: http://localhost:5000/health
- Database: `docker-compose exec postgres pg_isready`
- Redis: `docker-compose exec redis redis-cli ping`

### Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Use different port
PORT=3000 docker-compose up
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U opshop_user

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec postgres psql -U opshop_user -d opshop
```

#### Permission Issues
```bash
# Fix upload directory permissions
sudo chown -R 1001:1001 uploads/
```

### Performance Optimization

```bash
# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory: 8GB+

# Clean up unused images/containers
docker system prune -f

# View resource usage
docker stats
```

## 🔒 Security Notes

### Production Deployment

1. **Change Default Passwords**: Update all default passwords in docker-compose.yml
2. **Use HTTPS**: Configure SSL certificates
3. **Environment Variables**: Use Docker secrets or external configuration
4. **Network Security**: Configure proper firewall rules
5. **Regular Updates**: Keep Docker images updated

### Security Checklist
- [ ] Changed default database password
- [ ] Generated secure SESSION_SECRET (32+ characters)
- [ ] Configured proper CORS origins
- [ ] Set up HTTPS certificates
- [ ] Enabled Docker security scanning
- [ ] Configured log rotation
- [ ] Set up backup strategy

## 📦 Production Deployment

For production deployment, consider:

1. **Use Docker Swarm or Kubernetes**
2. **External Database**: Managed PostgreSQL service
3. **Load Balancer**: Nginx or cloud load balancer
4. **Monitoring**: Prometheus + Grafana
5. **Backup Strategy**: Automated database backups
6. **CI/CD Pipeline**: Automated builds and deployments

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment configuration
3. Ensure all required ports are available
4. Check Docker daemon status
5. Review the troubleshooting section above

## 📋 System Requirements

### Minimum
- 4GB RAM
- 2 CPU cores
- 5GB disk space
- Docker 20.10+

### Recommended
- 8GB+ RAM
- 4+ CPU cores  
- 20GB+ disk space
- SSD storage
- Docker 24.0+