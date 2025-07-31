# Opshop Online - Australia's Sustainable Marketplace

## Overview
Opshop Online is a full-stack marketplace application facilitating sustainable commerce for second-hand goods in Australia. It aims to be a leading platform for buying and selling pre-loved items, promoting a circular economy. Key capabilities include comprehensive product listings, user-friendly search and filtering, secure authentication, admin management tools, and an innovative AI-powered instant buyback system. The project's vision is to make sustainable shopping accessible and efficient across Australia.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application employs a monorepo design, separating concerns into `client/` (React frontend), `server/` (Express.js backend), `shared/` (common types and schemas), and `docker/` (containerization files).

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite for rapid development and optimized builds.
- **UI/UX**: Radix UI components integrated with a shadcn/ui design system, featuring a custom color scheme with light/dark modes.
- **State Management**: TanStack Query (React Query) for server state.
- **Routing**: Wouter for client-side navigation.
- **Forms**: React Hook Form with Zod validation.
- **Key Features**: Dynamic image galleries with zoom, lazy loading for performance optimization, comprehensive SEO metadata management, PWA functionality with offline support, and social sharing capabilities.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database ORM**: Drizzle ORM for type-safe operations.
- **Database**: PostgreSQL, specifically configured for Neon serverless.
- **Authentication**: Replit Auth integration using OpenID Connect.
- **Session Management**: PostgreSQL-backed sessions.
- **Core Features**: Robust data validation using Zod, comprehensive security measures (CSRF protection, rate limiting, input sanitization), automated commission calculations, an AI-powered instant buyback system with admin approval workflows, a detailed seller verification system, and a comprehensive Australian locations database for radius-based search.

### UI/UX Decisions
- **Design System**: Shadcn/ui and Radix UI for consistent, accessible components.
- **Color Scheme**: Custom colors supporting both light and dark modes.
- **Responsiveness**: Mobile-first approach ensuring optimal experience across devices.
- **Iconography**: Lucide React icons are used throughout for a cohesive visual language.
- **User Experience**: Personalized welcome splash, intuitive navigation, clear visual feedback for actions, and enhanced product viewing with advanced image handling.

### System Design Choices
- **Role-Based Access Control**: Granular permissions for admin, moderator, customer, seller, and business users.
- **Scalability**: Designed for cloud deployment with serverless database integration and optimized build processes.
- **Security**: Multi-layered security including CSRF, rate limiting, input sanitization, and robust authentication.
- **Observability**: Structured logging with Pino, comprehensive health checks, and metrics monitoring for performance and business intelligence.
- **Data Integrity**: Extensive Zod-based validation across all API endpoints.
- **Monorepo Benefits**: Shared types and streamlined development across frontend and backend.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **@tanstack/react-query**: For server state management.
- **@radix-ui/***: Unstyled, accessible UI components.
- **tailwindcss**: Utility-first CSS framework.
- **zod**: Schema validation library.

### Authentication
- **openid-client**: OpenID Connect client for Replit Auth integration.
- **passport**: Authentication middleware.
- **express-session**: For session management.
- **connect-pg-simple**: PostgreSQL session store.

### AI Integration
- **Anthropic Claude API**: Used for AI-powered instant buyback system.

### Payment Gateways
- **Stripe**: For processing payments.
- **PayPal**: Planned future integration.

### File Uploads
- **multer**: For handling multipart/form-data, specifically for document and image uploads.

### Security
- **csurf**: For CSRF protection.
- **express-rate-limit**: For API rate limiting.

### Logging & Monitoring
- **Pino**: For structured logging.
- **Sentry**: Optional integration for enhanced error logging and monitoring.

### Analytics
- **Google Analytics 4**: For tracking user behavior and page views.