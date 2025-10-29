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
- **Release Year Field:** Optional release year field for content items, displayed next to titles in dashboard.
- **Episode/Season Management:** Auto-numbered episodes (E01, E02), season labeling (S1, S2), individual episode links.
- **Search & Filtering:** Enhanced case-insensitive partial search supporting both title and release year queries, category-based filtering.

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

## Recent Updates (October 29, 2025)

### Release Year Feature & Enhanced Search (Latest)

**Purpose:** Added release year field to content management and improved API search functionality to support searching by both title and year with proper URL encoding support.

**Changes Implemented:**

1. **Schema Updates**
   - Added optional `releaseYear` number field to content schema in `shared/schema.ts`
   - Updated IContentItem interface, ContentItem type, MongoDB schema, and Zod validation
   - Field is backward compatible (optional) - existing content without year works fine

2. **Storage Layer Enhancement**
   - Updated DbStorage and MemStorage to include releaseYear in all CRUD operations
   - Enhanced searchContent method to query both title (regex, case-insensitive) and release year (exact match)
   - MongoDB search uses $or query to match either title OR year
   - Memory storage searches both title and year with partial matching

3. **Upload Form Updates**
   - Added "Release Year" input field (optional number, 1900-2100 range)
   - Field appears between Title and Category in upload form
   - Proper form validation and data submission handling

4. **Dashboard Layout Improvements**
   - **Reorganized column order:** Category now appears on the LEFT (was on right)
   - **Release year display:** Year shown in parentheses next to title (e.g., "Iron Man 1 (2008)")
   - Updated ContentList and ContentItem components for new layout
   - Desktop view: Category | No. | Thumbnail | Title (Year) | Actions

5. **API Search Fixes**
   - **Route Order Fix:** Moved `/api/content/search` route BEFORE `/api/content/:id` to prevent routing conflicts
   - **Enhanced Search Logic:**
     - Case-insensitive partial matching on title (already worked)
     - Exact matching on release year when query is numeric
     - Supports URL-encoded spaces and special characters
     - Returns empty array instead of errors when no matches found

**API Examples:**

```bash
# Search by title (partial, case-insensitive)
GET /api/content/search?q=iron&category=Movie
# Returns: [{ title: "IRON MAN 1", ... }]

# Search by year (finds items with year in title or releaseYear field)
GET /api/content/search?q=2008&category=Movie
# Returns items with 2008 in title or releaseYear: 2008

# Search with URL-encoded spaces
GET /api/content/search?q=spider%20man
# Returns: [{ title: "Spider Man 1 2002", ... }, { title: "Spider Man 2 2004", ... }]

# Get all content (includes releaseYear field)
GET /api/content
# Returns: [{ _id, title, category, thumbnail, releaseYear, driveLink, ... }]
```

**Response Format with Release Year:**
```json
{
  "_id": "6901cab7779da171365afe09",
  "title": "IRON MAN 1",
  "category": "Movie",
  "thumbnail": "https://...",
  "releaseYear": 2008,
  "driveLink": "https://drive.google.com/...",
  "seasons": [],
  "createdAt": "2025-10-29T08:05:11.868Z"
}
```

**Files Modified:**
- `shared/schema.ts` - Added releaseYear field to schema, interfaces, and validation
- `server/storage.ts` - Updated all CRUD operations and enhanced search logic for both storage types
- `server/routes.ts` - Fixed route order (search before :id)
- `client/src/pages/UploadPage.tsx` - Added release year input field
- `client/src/components/ContentList.tsx` - Reorganized column headers
- `client/src/components/ContentItem.tsx` - Updated layout (category left, year next to title)

**Backward Compatibility:**
- Release year is optional - existing content without years continues to work
- Database queries handle missing releaseYear fields gracefully
- No migration required for existing data

**Mobile App Integration Notes:**
- All endpoints support CORS and proper URL encoding
- Search queries like `"iron man 1 2008"` or `"Iron Man 1"` both work
- Empty search results return `[]` instead of error messages
- Thumbnails, titles, and video links load correctly in external apps