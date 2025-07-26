# Opshop Online - Complete Backup Package

## Backup Information
- **Date Created**: $(date +"%B %d, %Y at %H:%M:%S")
- **Version**: Production Release v1.0
- **Platform**: Replit + Neon PostgreSQL
- **Domain**: opshop.online

## Project Overview
Opshop Online is a comprehensive second-hand marketplace platform specifically designed for the Australian market. It features a multi-role user system, AI-powered item valuation with instant buyback, tiered seller accounts, comprehensive messaging system, and admin approval workflows with email notifications.

## Package Contents

### 1. Source Code
- **client/** - React frontend application with TypeScript
  - Modern React 18 with Vite build system
  - shadcn/ui component library with Tailwind CSS
  - TanStack Query for state management
  - Wouter for lightweight routing
  - Complete responsive design with dark/light mode

- **server/** - Express.js backend API
  - TypeScript Node.js server
  - Drizzle ORM for database operations
  - Replit Auth integration with OpenID Connect
  - PayPal and Stripe payment processing
  - AI-powered buyback evaluation system
  - Email notification service

- **shared/** - Common TypeScript schemas and types
  - Drizzle database schema definitions
  - Zod validation schemas
  - Shared type definitions

### 2. Configuration Files
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **vite.config.ts** - Vite build configuration
- **drizzle.config.ts** - Database configuration
- **components.json** - shadcn/ui component configuration
- **postcss.config.js** - PostCSS configuration

### 3. Database
- **schema.sql** - Complete database schema
- **data.sql** - All application data
- **full_database_backup.sql** - Complete database backup

### 4. Documentation
- **replit.md** - Project architecture and recent changes
- **FUNCTIONALITY_ASSESSMENT.md** - Feature assessment
- **README files** - Setup and deployment instructions

### 5. Assets
- **attached_assets/** - User-uploaded files and static assets

## Key Features Implemented

### Authentication & User Management
- Replit Auth integration with multiple providers (email, Google, Facebook, GitHub)
- Role-based access control (admin, moderator, customer, seller, business)
- Comprehensive user management system
- Session management with PostgreSQL storage

### Marketplace Features
- Product listing and management
- Category-based organization
- Advanced search and filtering
- Real-time messaging between users
- Review and rating system
- Wishlist functionality

### Payment System
- Stripe integration for payments
- PayPal integration
- Commission tracking (90:10 split)
- Store credit system

### AI-Powered Buyback System
- Anthropic Claude API integration for item valuation
- 50% retail value offers with 24-hour expiry
- Admin approval workflow
- Email notifications for offers
- Store credit balance tracking

### Admin Features
- Comprehensive admin dashboard
- User management interface
- Buyback offer management
- Site administration panel
- System analytics and reporting

### Communication
- Real-time messaging system
- Email notification service
- Professional email templates

## Environment Variables Required

### Authentication
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit environment identifier
- `REPLIT_DOMAINS` - Configured domains

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Database credentials

### Payment Processing
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (frontend)
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_CLIENT_SECRET` - PayPal secret

### AI Services
- `ANTHROPIC_API_KEY` - Claude API key for buyback valuation

## Deployment Instructions

### 1. Replit Setup
1. Import this backup into a new Replit project
2. Configure environment variables in Replit Secrets
3. Set up custom domain (opshop.online)
4. Enable PostgreSQL database

### 2. Database Setup
1. Create PostgreSQL database instance
2. Import schema: `psql $DATABASE_URL < schema.sql`
3. Import data: `psql $DATABASE_URL < data.sql`
4. Run any pending migrations: `npm run db:push`

### 3. Application Setup
1. Install dependencies: `npm install`
2. Configure environment variables
3. Start development server: `npm run dev`
4. Deploy to production

### 4. External Services
1. Configure Stripe account with webhook endpoints
2. Set up PayPal business account
3. Configure Anthropic API access
4. Set up email service provider

## Technical Architecture

### Frontend Stack
- React 18 + TypeScript
- Vite for build/dev server
- shadcn/ui + Radix UI components
- Tailwind CSS for styling
- TanStack Query for data fetching
- Wouter for routing
- React Hook Form + Zod validation

### Backend Stack
- Node.js + Express + TypeScript
- Drizzle ORM + PostgreSQL
- Replit Auth (OpenID Connect)
- Stripe + PayPal SDKs
- Anthropic SDK for AI
- Nodemailer for emails

### Database Schema
- Users with role-based permissions
- Products with categories and media
- Buyback offers and store credits
- Messages and conversations
- Reviews and ratings
- Sessions and authentication

## Security Features
- HTTPS everywhere with secure cookies
- Role-based access control
- Input validation with Zod schemas
- SQL injection protection via ORM
- CSRF protection
- Rate limiting on API endpoints

## Performance Optimizations
- Image optimization and lazy loading
- Code splitting and tree shaking
- PostgreSQL indexing strategy
- Caching with TanStack Query
- Optimistic updates for better UX

## Monitoring & Analytics
- Real-time system statistics
- User activity tracking
- Transaction monitoring
- Error logging and reporting
- Performance metrics

## Backup & Recovery
This backup includes everything needed to fully restore the application:
- Complete source code
- Database schema and data
- Configuration files
- Asset files
- Documentation

## Support & Maintenance
- Regular security updates
- Database maintenance procedures
- Backup automation scripts
- Performance monitoring tools

---

**© 2025 Opshop Online - Australia's Sustainable Marketplace**
**Complete backup package created on $(date +"%B %d, %Y")**