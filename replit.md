# MLWIO API Admin Panel

## Overview

MLWIO API is an admin panel and dashboard system for managing multimedia content (Movies, Anime, and Web Series). The application provides a centralized interface for uploading, categorizing, and organizing content with episode/season management for series-based media. The design replicates the Blakite API admin interface with a dark theme and professional aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing (no React Router dependency)

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **CVA (Class Variance Authority)** for component variant management
- Dark theme as the primary visual mode

**State Management**
- **TanStack Query (React Query)** for server state management, caching, and API synchronization
- Local component state via React hooks for UI-specific state

**Form Handling**
- **React Hook Form** with **Zod** resolvers for type-safe form validation
- Validation schemas shared between client and server

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for RESTful API endpoints
- Session-based authentication using **express-session**
- Middleware pattern for request logging and authentication guards

**API Design**
- RESTful endpoints under `/api` namespace
- Authentication endpoints (`/api/auth/login`)
- Content management endpoints (`/api/content` for CRUD operations)
- Session-based authentication with HTTP-only cookies

**Request/Response Handling**
- JSON request bodies with validation
- Centralized error handling
- Request logging with timing metrics

### Database Architecture

**ORM & Database**
- **Mongoose ORM** for MongoDB database operations
- **MongoDB Atlas** cloud-hosted database with session storage
- Schema-first approach with TypeScript type inference
- **In-Memory Storage** fallback when MongoDB URI is not configured

**Data Models**
- **Users**: Admin authentication (username/password with bcrypt hashing)
  - Default credentials: `mlwio` / `MLWIO0372`
- **Content Items**: Multimedia content with category-based structure
  - Title, category, thumbnail URL
  - Drive link for Movies
  - Seasons/Episodes array structure for Anime and Web Series
- **Sessions**: Persistent session storage in MongoDB (via connect-mongo)

**Schema Design**
- Season/Episode data stored as nested arrays with embedded documents
- MongoDB ObjectId primary keys (_id field)
- Zod schemas for runtime validation matching database schema
- Dual storage implementation (DbStorage for MongoDB, MemStorage for in-memory)

### Authentication & Security

**Authentication Strategy**
- Session-based authentication (not JWT)
- Password hashing with **bcryptjs** (10 salt rounds)
- Default credentials: `mlwioapi` / `MLWIO.0372`
- Session stored server-side with configurable secret

**Security Measures**
- HTTP-only session cookies
- Secure cookies in production environment
- Authorization middleware protecting admin routes
- CSRF protection through session validation

### File Structure & Organization

**Monorepo Structure**
- `/client` - Frontend React application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas
- `/migrations` - Drizzle database migrations
- `/attached_assets` - Static assets and images

**Path Aliases**
- `@/` maps to `client/src/`
- `@shared/` maps to `shared/`
- `@assets/` maps to `attached_assets/`

### Content Management Features

**Category System**
- Three content types: Movie, Anime, Web Series
- Category-specific data structures:
  - **Movies**: Single drive link
  - **Anime/Web Series**: Multi-season with episodes
  
**Episode/Season Management**
- Auto-numbered episode format (E01, E02, etc.)
- Season labeling (S1, S2, etc.)
- Individual episode links within each season
- Dynamic form generation based on number of seasons

**Search & Filtering**
- Category-based filtering
- Text search across content titles
- Combined category + search query filtering

## External Dependencies

### Database & Storage
- **Neon Serverless PostgreSQL** - Cloud-hosted PostgreSQL database with WebSocket support
- **Drizzle Kit** - Migration management and schema synchronization

### UI Component Primitives
- **Radix UI** - Headless accessible component primitives (dialogs, dropdowns, selects, etc.)
- **Lucide React** - Icon library

### Development & Build Tools
- **TypeScript** - Type safety across frontend and backend
- **ESBuild** - Fast JavaScript bundler for production builds
- **Replit Vite Plugins** - Development experience enhancements (error overlay, cartographer, dev banner)

### Utility Libraries
- **date-fns** - Date manipulation and formatting
- **clsx** & **tailwind-merge** - Conditional class name composition
- **zod-validation-error** - Human-readable Zod error messages
- **nanoid** - Unique ID generation

### Session Management
- **connect-mongo** - MongoDB session store for express-session (persistent session storage)
- Sessions stored in MongoDB `sessions` collection with 7-day TTL
- Automatic session cleanup via native MongoDB TTL indexes

### Deployment Configuration
- Environment variable: `MONGODB_URI` for MongoDB Atlas connection
- Environment variable: `SESSION_SECRET` for session encryption
- Environment variable: `NODE_ENV` for production/development mode detection
- Environment variable: `PORT` for server port (defaults to 5000)
- Server binds to `0.0.0.0` for external accessibility
- Designed for deployment on platforms like Replit, Render.com, or Heroku

## Recent Updates (October 27, 2025)

### Fixed: 401 Unauthorized Error After Login

**Problem:** Users were getting a 401 Unauthorized error when accessing protected endpoints (like `/api/content`) immediately after logging in successfully.

**Root Cause:** Sessions were using the default in-memory store, which doesn't persist sessions properly, especially when:
- Running in production mode
- Connecting from external clients (VS Code, external browsers)
- Server restarts or reloads

**Solution Implemented:**
1. **Configured MongoDB Session Store** - Sessions now persist in MongoDB Atlas
   - Uses `connect-mongo` library
   - Stores sessions in dedicated `sessions` collection
   - 7-day automatic expiration (TTL)

2. **Explicit Session Saving** - Login endpoint now explicitly saves sessions before responding
   - Ensures session is committed to database before client receives success response
   - Prevents race conditions between session save and subsequent requests

3. **Automatic Storage Selection** - Application automatically uses appropriate storage:
   - If `MONGODB_URI` is set: Uses MongoDB for both data and sessions
   - If not set: Uses in-memory storage (development mode)

4. **Server Binding Fix** - Changed server to bind to `0.0.0.0` instead of `127.0.0.1`
   - Allows external connections (required for Replit and cloud deployments)
   - Enables proper port detection for workflow management

**Files Modified:**
- `server/routes.ts` - Added MongoStore configuration and explicit session save
- `server/storage.ts` - Automatic storage selection based on environment
- `server/db.ts` - Graceful handling when MongoDB URI is not set
- `server/index.ts` - Server binding to 0.0.0.0 for external access

**Setup Required:**
Users must create a `.env` file with their MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
SESSION_SECRET=your-secret-key
```

## Recent Updates (October 28, 2025)

### Fixed: Session Cookie Configuration for Production Deployments

**Problem:** Users deploying to Render.com were experiencing persistent 401 Unauthorized errors even after successful login. The Render deployment logs showed repeated authentication failures.

**Root Cause:** The session cookie configuration had a hard-coded `domain: ".onrender.com"` restriction that prevented cookies from working correctly across different deployment URLs and environments.

**Solution Implemented:**

1. **Removed Domain Restriction** - Removed the `domain` property from session cookie configuration
   - Allows cookies to work across all environments (development, Replit, Render, etc.)
   - Maintains secure cookie settings (`secure: true` in production, `httpOnly: true`)
   - Properly handles `sameSite` attribute (`"none"` in production, `"lax"` in development)

2. **Fixed Security Vulnerability** - Removed session ID logging
   - Eliminated logging of `req.sessionID` which could lead to session hijacking
   - Kept only non-sensitive logging (username, environment info)

3. **Added Session Diagnostics** - Added configuration logging for easier debugging
   - Logs session store type (MongoDB vs Memory)
   - Logs environment mode (production vs development)
   - Tracks authentication flow without exposing sensitive data

**Files Modified:**
- `server/routes.ts` - Removed domain restriction, fixed logging security issue
- `server/index.ts` - Already configured to bind to 0.0.0.0 for external access

**Deployment Checklist for Render.com:**
To prevent 401 errors on Render, ensure the following environment variables are set:
- `NODE_ENV=production` - Enables secure cookies and proper session handling
- `MONGODB_URI=<your-mongo-connection-string>` - Required for persistent sessions
- `SESSION_SECRET=<strong-random-string>` - Required for session encryption

**Important Notes:**
- The PostCSS warning in development logs is a known cosmetic issue with Tailwind CSS v3 + Vite that doesn't affect functionality
- Sessions are automatically cleaned up after 7 days via MongoDB TTL indexes
- Frontend must use HTTPS in production for secure cookies to work properly

## Recent Updates (October 29, 2025)

### Enhanced Logging System and Content Ordering

**Purpose:** Improve the logging system to show only newly uploaded content and ensure the dashboard displays content in chronological order (newest first).

**Changes Implemented:**

1. **Upload Logging System**
   - Created `UploadLog` model in MongoDB to track content uploads
   - Added `createUploadLog()` and `getUploadLogs()` methods to storage interface
   - Modified POST `/api/content` endpoint to create upload log entries
   - Updated logging middleware to only log successful content uploads
   - Log format: `✅ New upload: [Content Title]`

2. **Content Timestamp Tracking**
   - Added `createdAt` field to `ContentItem` schema (Date type with default value)
   - All new content automatically receives a creation timestamp
   - Update operations preserve the original `createdAt` timestamp

3. **Content Ordering (Newest First)**
   - All content retrieval methods now sort by `createdAt` descending
   - **Database (DbStorage)**: Uses MongoDB `.sort({ createdAt: -1 })` in all queries
   - **In-Memory (MemStorage)**: Uses JavaScript `.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())`
   - Affects: `getAllContent()`, `getContentByCategory()`, `searchContent()`

4. **Dashboard Behavior**
   - Latest uploaded content appears at the top of the list
   - Previous uploads appear below in chronological order
   - Consistent ordering across all content views (all types, category filters, search results)
   - No changes to frontend code required - backend returns pre-sorted data

**Benefits:**
- Clean console logs showing only new uploads
- Intuitive dashboard ordering (newest first, oldest last)
- Persistent upload history in database
- Consistent behavior across both MongoDB and in-memory storage modes

**Files Modified:**
- `shared/schema.ts` - Added UploadLog model and createdAt field to ContentItem
- `server/storage.ts` - Updated all storage methods for timestamp tracking and sorting
- `server/routes.ts` - Added upload log creation in POST /api/content
- `server/index.ts` - Modified logging middleware to only show uploads

**Technical Details:**
- Upload logs stored in `uploadlogs` collection in MongoDB
- Content items include automatic `createdAt` timestamp via MongoDB default
- Both storage implementations (MemStorage and DbStorage) maintain consistent sorting behavior
- Logs persist across server restarts when using MongoDB