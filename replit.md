# Si-link App - Replit.md

## Overview

Si-link App is a student-focused marketplace that connects students with local service providers. The application combines features from Amazon's browsing experience, Fiverr's gig marketplace, and social engagement patterns. The platform enables students to discover services, post gigs, bid on projects, and build professional reputations within their community.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React-based Single Page Application (SPA) with TypeScript
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Build Tool**: Vite for client-side development and bundling
- **Runtime**: Node.js 20 with ES Modules

### Monorepo Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared types and database schema
└── migrations/      # Database migration files
```

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme and neon accent colors
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Configuration**: Vite with path aliases and development plugins

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Passport.js with OpenID Connect strategy
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Database Connection**: Neon serverless PostgreSQL with connection pooling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Session Store**: PostgreSQL table (`sessions`) for user sessions
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection Strategy**: Connection pooling with `@neondatabase/serverless`

### Database Schema
The application uses a comprehensive schema supporting:
- **User Management**: Users with roles (student, provider, assistant)
- **Service Marketplace**: Services with categories, pricing, and ratings
- **Gig System**: Project postings with bidding functionality
- **Order Management**: Order lifecycle tracking and payments
- **Review System**: User feedback and rating system
- **Financial Features**: Wallet system and transaction tracking
- **Communication**: Chat system for user interactions

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication with Replit
3. User session stored in PostgreSQL
4. Frontend receives authenticated user data via `/api/auth/user`

### Service Discovery Flow
1. Users browse services via `/api/services` with optional filtering
2. Services display with provider information and ratings
3. Real-time data updates through TanStack Query caching

### Gig Marketplace Flow
1. Clients post gigs via `/api/gigs`
2. Service providers submit bids via `/api/bids`
3. Order creation and management through `/api/orders`
4. Review system completion via `/api/reviews`

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **passport**: Authentication middleware
- **express**: Web application framework

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Server-side bundling for production
- **drizzle-kit**: Database migration and introspection tools

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with `tsx` for TypeScript execution
- **Development Server**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with development configuration
- **Port Configuration**: Server runs on port 5000

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles server to `dist/index.js`
- **Deployment Target**: Replit Autoscale deployment
- **Environment**: Production Node.js with compiled JavaScript

### Database Management
- **Schema Deployment**: `drizzle-kit push` for schema updates
- **Migration Strategy**: Drizzle migrations in `./migrations` directory
- **Connection Management**: Environment variable `DATABASE_URL` configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ Fixed service creation validation error (tags field)
✓ Added comprehensive notification system with real-time counters
✓ Implemented KYC verification system with document upload
✓ Added virtual account generation functionality
✓ Created splash screen with manual and Replit authentication options
✓ Fixed bidding restrictions (owners cannot bid on their own gigs)
✓ Fixed booking restrictions (providers cannot book their own services)
✓ Enhanced navigation with notification badges and user profile images
✓ Added manual authentication system with role-based registration
✓ Updated database schema with new tables and columns
✓ Fixed missing useAuth imports in components
✓ Integrated new Si-link logo across all pages and navigation
✓ Updated app metadata with proper branding and SEO
✓ Fixed manage service and manage gig navigation with proper routing
✓ Added individual API endpoints for services, gigs, and bids
✓ Fixed API request parameter order in management pages
✓ Added PATCH and DELETE endpoints for complete CRUD operations
✓ Resolved infinite authentication requests issue
✓ Fixed logged-out users getting stuck on splash screen
✓ Fixed manual registration and login API calls
✓ Improved authentication flow with proper 401 handling
✓ Enhanced chat functionality with proper profile details display
✓ Improved mobile responsiveness for chat interface
✓ Added profile images and user names to chat interface
✓ Implemented responsive chat layout (list view on mobile)
✓ Added helpful chat tips and guidance for users
✓ Added back button to marketplace that redirects to dashboard
✓ Fixed database connection issue by creating PostgreSQL database

## Changelog

- June 20, 2025: Initial setup
- June 20, 2025: Comprehensive fixes implemented - validation, notifications, KYC, authentication, UI improvements