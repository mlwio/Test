# MLWIO API Admin Panel - Design Guidelines

## Design Approach
**Reference-Based Approach**: This project must replicate the Blakite API admin interface (https://blakiteapi.xyz/admin/links) exactly - matching theme, color palette, layout, spacing, typography, and interaction patterns A-to-Z.

## Visual Theme & Aesthetics
- Dark theme matching Blakite's exact color scheme and background treatment
- Professional admin interface aesthetic with clean, modern styling
- Consistent visual language across login, dashboard, and upload pages
- Subtle shadows and depth to create visual hierarchy

## Typography Hierarchy
- Match Blakite's exact font families, sizes, and weights
- Header text: "MLWIO API" (left-aligned in top bar)
- Footer text: "Provided by MLWIO" (center-aligned)
- Clear labeling for table columns: Thumbnail, Title, Category
- Episode labeling: Auto-numbered format (E01, E02, etc.)
- Season labeling: S1, S2, etc. matching Blakite's format

## Layout System
**Spacing**: Match Blakite's exact spacing units for margins, padding, and gaps between elements
- Add visible gaps between dashboard rows/items
- Consistent spacing in header, content area, and footer
- Proper breathing room around form fields and buttons

**Structure**:
- Fixed header at top with left/right alignment (brand left, action button right)
- Category selector + search section below header
- Main content area for dashboard grid/table
- Fixed footer at bottom

## Component Library

### Login Page
- Full-page background with faded logo watermark
- Centered login box with Blakite-style card treatment
- Username and password fields
- Submit button matching theme

### Header Bar
- Left: "MLWIO API" branding text
- Right: Single action button (Upload on dashboard, Home on upload page)
- Same visual treatment as Blakite's header

### Category & Search Section
- Category dropdown selector (Movie / Anime / Web Series)
- Large search button
- Positioned below header, above main content
- Search popup/inline area with category filter and live text search

### Dashboard Cards/Table
- Table-style layout with columns: No., Thumbnail, Title, Seasons, Episodes, Category
- Rounded corners on all 4 sides of each row/card
- Thumbnail images displayed in first column
- Drive link or "View" buttons for movies
- Expandable rows for Anime/Web Series showing season and episode structure

**Hover Effects**:
- Slight upward lift (3D elevation)
- Color transition
- Soft shadow animation
- Smooth, subtle transitions

**Anime/Series Expansion**:
- Copy Blakite's exact expand/collapse behavior
- Season list display matching Blakite's structure
- Episode links under each season with automatic numbering
- Same visual presentation and spacing as Blakite

### Upload Page
- Form layout with clear field labels
- Text input for Name
- Dropdown for Category selection
- Conditional fields based on category:
  - Movie: Single Drive Link input
  - Anime/Web Series: Season selector (1-10), dynamic episode input fields per season
- Thumbnail Link input
- Submit button
- Home button in header replaces Upload button

### Footer
- Fixed to bottom of viewport
- Center-aligned text: "Provided by MLWIO"
- Matches Blakite's footer styling

## Interactive Elements

### Buttons
- Primary action buttons (Upload, Search, Submit)
- Match Blakite's button styling exactly
- Smooth hover states with color transitions
- Clear visual feedback on interaction

### Dropdowns
- Category selectors (Movie/Anime/Web Series)
- Season number selector (1-10)
- Styled to match Blakite's form elements

### Expandable Sections
- Anime/Series items expand on click
- Smooth expand/collapse animations
- Season and episode structure revealed on expansion
- Replicate Blakite's exact implementation

## Responsive Design
- Maintain Blakite's responsive behavior
- Mobile-friendly layout adaptations
- Touch-friendly interaction areas
- Consistent visual treatment across breakpoints

## Animation Guidelines
- Hover animations: subtle 3D lift with shadow
- Expand/collapse: smooth transitions
- Color transitions: soft, professional
- Loading states: minimal, non-intrusive
- Match Blakite's animation timing and easing

## Images
- Logo: Faded background watermark on login page
- Thumbnails: Displayed in dashboard table for each item
- No hero images required (admin interface)

## Key Design Principles
1. **Exact Replication**: Match Blakite's design in all visual and interaction details
2. **Professional Aesthetics**: Clean, modern admin interface
3. **Visual Feedback**: Clear hover states and interactive elements
4. **Organized Hierarchy**: Logical information architecture
5. **Consistent Theme**: MLWIO branding maintained across all pages