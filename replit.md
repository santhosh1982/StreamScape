# StreamHub - Video Streaming Platform

## Overview

StreamHub is a comprehensive video streaming platform built with modern web technologies. It provides a YouTube-like experience with video upload, streaming, channel management, user authentication, and social features. The platform supports multi-quality video playback, user subscriptions, watch history, and content discovery through search and recommendations.

The application follows a full-stack architecture with a React-based frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and integrates Replit's authentication system for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing with pattern matching
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming, including dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with structured routes for resources (videos, channels, users, categories)
- **File Handling**: Multer middleware for handling video uploads and file processing
- **Session Management**: Express sessions with PostgreSQL session store for persistent user sessions
- **Error Handling**: Centralized error handling middleware with structured error responses

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach for type-safe database operations
- **Schema Structure**:
  - Users table with profile information and authentication data
  - Channels for content creators with ownership and subscriber tracking
  - Videos with metadata, processing status, and quality variants
  - Categories for content organization
  - Subscriptions for user-channel relationships
  - Watch history for tracking user viewing behavior
  - Video likes/dislikes for engagement metrics
  - Sessions table for authentication state persistence

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session storage
- **Authorization Pattern**: Route-level middleware protection with user context injection
- **User Profiles**: Automatic user creation and profile management through OIDC claims

### Content Management
- **Video Processing**: Multi-quality video support with metadata extraction
- **File Storage**: Local file storage with configurable upload directory
- **Content Organization**: Category-based classification with channel ownership
- **Metadata Handling**: Rich video metadata including thumbnails, duration, and processing status

### API Architecture
- **REST Endpoints**: Resource-based URLs with standard HTTP methods
- **Request/Response**: JSON payload handling with validation
- **Query Support**: Search functionality across videos with filtering and pagination
- **Error Standards**: Consistent error response format with appropriate HTTP status codes

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management with serverless architecture
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **express**: Web application framework for API server
- **@tanstack/react-query**: Server state management and caching for React frontend

### Authentication & Security
- **openid-client**: OpenID Connect client implementation for Replit Auth
- **passport**: Authentication middleware with strategy-based authentication
- **express-session**: Session management with store persistence
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **@radix-ui/react-***: Comprehensive primitive components for accessible UI
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Component variant management for consistent styling
- **lucide-react**: Icon library with consistent design language

### Development & Build Tools
- **vite**: Fast build tool with HMR and optimized bundling
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

### File & Data Processing
- **multer**: Multipart form data handling for file uploads
- **date-fns**: Date manipulation and formatting utilities
- **zod**: Schema validation for runtime type checking

### Utility Libraries
- **wouter**: Lightweight routing for single-page applications
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation for resources