# MLWIO API Admin Panel

## Overview
MLWIO API is an admin panel for managing multimedia content (Movies, Anime, Web Series). It provides a centralized interface for uploading, categorizing, and organizing content with episode/season management. The application's design mirrors the Blakite API admin interface, featuring a dark theme and a professional aesthetic. The project aims to streamline content management for multimedia platforms, offering a robust and intuitive dashboard.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript.
- **Build System:** Vite.
- **Routing:** Wouter.
- **UI:** shadcn/ui (Radix UI, Tailwind CSS, CVA), primary dark theme.
- **State Management:** TanStack Query for server state, React hooks for local UI state.
- **Form Handling:** React Hook Form with Zod for type-safe validation.

### Backend Architecture
- **Server Framework:** Express.js with TypeScript.
- **API Design:** RESTful endpoints under `/api` for authentication, content management (CRUD).
  - Public read access for content listing and details (`GET /api/content`, `GET /api/content/:id`, `GET /api/content/search`).
  - Authenticated write access for content creation, updates, and deletion (`POST`, `PUT`, `DELETE /api/content`).
- **Authentication:** Session-based authentication using `express-session` with HTTP-only cookies.
- **Security:** bcryptjs for password hashing, CSRF protection, secure cookie configuration for production.
- **Request Handling:** JSON bodies, centralized error handling, request logging.
- **CORS:** Configured to allow cross-origin requests, supporting credentials.

### Database Architecture
- **ORM:** Mongoose ORM for MongoDB.
- **Database:** MongoDB Atlas (cloud-hosted), with in-memory fallback.
- **Data Models:** Users (admin authentication), Content Items (multimedia content with categories, drive links, seasons/episodes), and Sessions.
- **Schema:** Schema-first approach with TypeScript type inference, Zod schemas for validation.
- **Content Ordering:** All content retrieval is sorted by `createdAt` in descending order (newest first).
- **Upload Logging:** Separate `UploadLog` model to track content uploads.

### File Structure & Organization
- **Monorepo:** `/client` (React frontend), `/server` (Express backend), `/shared` (shared types/schemas).
- **Path Aliases:** `@/` for client source, `@shared/` for shared, `@assets/` for attached assets.

### Content Management Features
- **Category System:** Supports Movie, Anime, Web Series with category-specific data structures.
- **Episode/Season Management:** Auto-numbered episodes (E01, E02), season labeling (S1, S2), individual episode links.
- **Search & Filtering:** Category-based filtering and text search.

## External Dependencies

### Database & Storage
- **MongoDB Atlas:** Cloud-hosted NoSQL database.
- **Mongoose:** MongoDB object data modeling.
- **connect-mongo:** MongoDB session store for `express-session`.

### UI Component Primitives
- **Radix UI:** Headless accessible component primitives.
- **Lucide React:** Icon library.

### Development & Build Tools
- **TypeScript:** Language for type safety.
- **Vite:** Frontend build tool.

### Utility Libraries
- **TanStack Query (React Query):** Server state management.
- **React Hook Form:** Form management with Zod resolvers.
- **Tailwind CSS:** Utility-first CSS framework.
- **bcryptjs:** Password hashing.
- **clsx & tailwind-merge:** Conditional class name composition.
- **nanoid:** Unique ID generation.
- **date-fns:** Date manipulation.
- **cors:** Middleware for enabling Cross-Origin Resource Sharing.

### Deployment Configuration
- Environment variables for `MONGODB_URI`, `SESSION_SECRET`, `NODE_ENV`, `PORT`.
- Server binds to `0.0.0.0` for external accessibility.