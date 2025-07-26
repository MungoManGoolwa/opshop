# Opshop Online - Complete Backup Package

## Backup Information
- **Date Created**: January 26, 2025
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
- **backup_manifest.md** - This backup documentation

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
- Comprehensive admin dashboard with breadcrumb navigation
- User management interface
- Buyback offer management with approval workflow
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

## Installation Instructions

### 1. Extract and Setup
```bash
# Extract backup files to your project directory
# Run the installation script
chmod +x install.sh
./install.sh
```

### 2. Environment Configuration
Create a `.env` file or configure environment variables in your hosting platform with all required secrets listed above.

### 3. Database Setup
```bash
# Import schema and data
psql $DATABASE_URL < schema.sql
psql $DATABASE_URL < data.sql

# Or use complete backup
psql $DATABASE_URL < full_database_backup.sql
```

### 4. Application Startup
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production
npm run build
npm start
```

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
- Email service integration

### Database Schema
The database includes 13 tables:
- `users` - User accounts with role-based permissions
- `products` - Product listings with categories
- `categories` - Product categorization
- `buyback_offers` - AI-generated buyback offers
- `store_credit_transactions` - Store credit tracking
- `messages` - Real-time messaging system
- `reviews` - User and product reviews
- `wishlists` - User favorites
- `orders` - Transaction records
- `commissions` - Fee tracking
- `payment_settings` - Payment configuration
- `sessions` - Authentication sessions

## Security Features
- HTTPS everywhere with secure cookies
- Role-based access control
- Input validation with Zod schemas
- SQL injection protection via ORM
- CSRF protection
- Admin-only routes protection

## Recent Major Features
- **Buyback Approval Workflow**: Complete admin system for reviewing and approving AI-generated buyback offers
- **Email Notifications**: Professional email service that notifies users when buyback offers are created
- **Breadcrumb Navigation**: Comprehensive navigation system across all admin pages
- **Admin Dashboard**: Full-featured admin interface with user management and system controls

## Support Information
- Complete source code with TypeScript
- Comprehensive database schema and data
- All configuration files included
- Installation and setup scripts
- Detailed documentation

---

**© 2025 Opshop Online - Australia's Sustainable Marketplace**
**Complete production-ready backup package**