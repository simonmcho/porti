# Replit.md - Porti Business Discovery Platform

## Overview

This is a modern full-stack web application called "Porti" - a business discovery platform that connects users with local businesses. The platform enables users to discover businesses, follow them, participate in loyalty programs, and purchase gift cards. Businesses can register, manage their profiles, create advertisements, and offer rewards to customers.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Payment Processing**: Stripe integration for subscriptions and payments
- **Session Management**: express-session with PostgreSQL store

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Migration System**: Drizzle Kit for schema migrations
- **Connection**: Neon Database (serverless PostgreSQL)

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Mandatory user table structure for Replit Auth compatibility
- **Security**: HTTP-only cookies, secure session handling

### Business Management
- **Registration**: Multi-step business registration with plan selection
- **Profiles**: Comprehensive business profiles with contact information
- **Subscriptions**: Stripe-powered subscription management (Basic/Premium plans)
- **Add-ons**: Gift card and loyalty program functionality as paid add-ons

### User Features
- **Discovery**: Search and filter businesses by category and location
- **Following**: Follow favorite businesses for updates
- **Loyalty Programs**: Earn points and rewards from participating businesses
- **Gift Cards**: Purchase and redeem digital gift cards
- **Dashboard**: Personal dashboard for managing follows, gift cards, and loyalty accounts

### Payment Integration
- **Stripe**: Full Stripe integration for subscriptions and one-time payments
- **Checkout**: Dedicated checkout flows for business subscriptions and gift cards
- **Webhooks**: Stripe webhook handling for payment confirmations

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Business Registration**: Business owners register and select subscription plans
3. **Payment Processing**: Stripe handles subscription payments and gift card purchases
4. **Content Management**: Businesses manage profiles, ads, and loyalty programs
5. **User Interaction**: Users discover businesses, follow them, and participate in programs
6. **Real-time Updates**: TanStack Query manages client-side data synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **@stripe/stripe-js**: Stripe payment integration
- **express-session**: Session management
- **passport**: Authentication middleware

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Served from built frontend directory

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `REPLIT_DOMAINS`: Allowed domains for Replit Auth
- `SESSION_SECRET`: Session encryption secret

### Production Setup
- Single-process deployment serving both API and static files
- Express serves built React app for client-side routing
- Database migrations handled via Drizzle Kit
- Session storage in PostgreSQL for scalability

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```