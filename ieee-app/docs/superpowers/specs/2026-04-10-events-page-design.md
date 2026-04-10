# Events Page Design

**Date:** 2026-04-10
**Status:** Approved

## Overview

Add an Events section to the IEEE HITU Student Branch website with a category-filtered listing page and dedicated detail pages for each event, including a masonry photo gallery with a custom lightbox. The data layer uses a static file now but is structured identically to the future Sanity CMS schema for easy migration.

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/events` | `EventsPage.jsx` | Category-filtered listing of all events |
| `/events/:slug` | `EventDetailPage.jsx` | Single event detail with description and photo gallery |

Navigation: Add "Events" link to the `Navbar` between existing links (position after "Committees", before "Join Us").

## Data Layer

### Static Data (`src/data/events.js`)

Factory function `createEvent()` with sensible defaults. Each event:

```js
{
  title,              // string — event name
  slug,               // string — URL-friendly identifier
  date,               // ISO date string — "2026-03-15T18:00:00Z"
  endDate,            // ISO date string — optional, for multi-day events
  location,           // string — venue or "Online"
  category,           // string — one of eventCategories keys
  categoryLabel,      // string — human-readable (computed)
  coverImage,         // string — URL or import path
  excerpt,            // string — 1-2 sentence summary for cards
  description,        // string — full event description (supports markdown/HTML later)
  gallery,            // array of { src, caption } objects
  organizerCommittee, // string or null — which committee ran it
  status,             // computed: "upcoming" | "past" (from date vs now)
}
```

Exports:
- `events` — full array
- `eventCategories` — `{ workshops, conferences, competitions, social, orientation, outreach }`
- `upcomingEvents`, `pastEvents` — filtered arrays
- `eventCategoryLabels` — mapping for display

### Sanity Schema (`src/sanity/schemas/event.js`)

Schema type `event` with fields that map 1:1 to the static structure:

| Field | Sanity Type | Notes |
|-------|-------------|-------|
| `title` | string | Required, validation: maxLength 100 |
| `slug` | slug | Generated from title |
| `date` | datetime | Required |
| `endDate` | datetime | Optional |
| `location` | string | Required |
| `category` | string | Dropdown from predefined options |
| `coverImage` | image | With hotspot/crop enabled |
| `excerpt` | text | maxLength 200 |
| `description` | array (Portable Text) | Rich text blocks |
| `gallery` | array of images | Each with optional caption |
| `organizerCommittee` | string | Committee name |

Status (`upcoming`/`past`) is computed client-side from the date, not stored.

### Data Source Abstraction

Create `src/data/eventsSource.js`:
```js
// Current: returns import from events.js
// Future: returns sanityClient.fetch(query)
// Export: { getEvents, getEventBySlug } — same shape either way
```

This keeps the page components agnostic to the data source.

## Events Listing Page (`EventsPage.jsx`)

### Hero Section
- Decorative wedge background overlay (opacity 5%, matches site pattern)
- Eyebrow: "Events"
- Heading: "Where Ideas Come Alive"
- Subtitle paragraph
- Stats row: Total Events, Categories, Upcoming count

### Filter Bar
- Pill-style category buttons: All, Workshops, Conferences, Competitions, Social, Orientation, Outreach
- Active pill uses `bg-primary text-on-primary` styling
- Filter state via `useState`, filters the events array before render
- Smooth CSS transition on filter change

### Event Cards Grid
- Responsive grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8`
- Card anatomy:
  1. Cover image (`aspect-[4/3] object-cover`)
  2. Floating date badge (absolute positioned top-right: "15 APR")
  3. Category tag (uppercase, tracking-widest, primary color)
  4. Title (bold, text-xl)
  5. Excerpt (text-on-surface-variant, line-clamp-2)
  6. Location + "View Event →" link
  7. Optional "Upcoming" status badge if date is in future
- Hover: `hover:bg-surface-container-lowest` transition (matches committee cards)
- Link to `/events/${slug}`

### Empty State
- "No events found in this category yet. More are coming soon!"

### Sections
- If both upcoming and past exist: show upcoming first, then a "Past Events" heading before the rest
- Otherwise: single grid of all events

## Event Detail Page (`EventDetailPage.jsx`)

### Hero Header
- Back link: "← All Events" → `/events`
- Full-width cover image with overlay or large hero
- Title (text-5xl/6xl, bold)
- Meta row: Date · Location · Category badge
- Organizer: "Organized by [Committee Name]" (if available)
- Excerpt as lead paragraph (text-xl, text-on-surface-variant)

### Key Info Cards (Grid)
- 3-4 stat-like cards: Date, Location, Category, Organizer
- Styled like committee detail stat cards (`bg-surface-container-low p-6`)

### Description Section
- Rendered from description field
- Clean prose typography with generous spacing
- Supports paragraphs, headings, lists, blockquotes

### Masonry Photo Gallery
- CSS column-based masonry: `columns-2 md:columns-3 lg:columns-4 gap-4`
- Each image: `break-inside-avoid mb-4 rounded-lg overflow-hidden`
- Click any image → opens lightbox

### Custom Lightbox
- State: `{ isOpen, currentIndex }`
- On open: fixed overlay, dark backdrop, centered image
- Navigation: prev/next arrows (SVG icons), close button (X)
- Keyboard: Escape to close, ArrowLeft/ArrowRight to navigate
- Image counter: "3 / 12"
- Optional caption below image
- No external dependencies — fully custom component

### Footer CTA
- "Want to join our next event?" → CTA button linking to `/join-us`

### 404 Fallback
- If slug not found: "Event not found" with link back to `/events`

## Sanity Studio Integration

### Setup
- Install: `@sanity/vite-plugin`, `sanity` (latest stable)
- Vite config: add `sanityPlugin()` to plugins array
- Add catch-all route in `App.jsx`: `<Route path="/studio/*" element={<Studio />} />` — or let the Vite plugin handle it via its own route

### Configuration
- `sanity.config.js` at project root
- `projectId`, `dataset` from environment variables or hard-coded for now
- Schemas: `event` schema only initially

### Studio Schema Location
- `src/sanity/schemas/index.js` — exports all schemas
- `src/sanity/schemas/event.js` — event document type

## Component Structure

```
src/
  App.jsx                          → Add /events, /events/:slug, /studio routes
  components/
    Navbar.jsx                     → Add "Events" nav link
    EventCard.jsx                  → Reusable event card (used in listing)
    MasonryGallery.jsx             → Column-based masonry with lightbox
    Lightbox.jsx                   → Custom photo lightbox component
  pages/
    EventsPage.jsx                 → Filter bar + event grid
    EventDetailPage.jsx            → Detail + gallery
  data/
    events.js                      → Static event data + factory
    eventsSource.js                → Data source abstraction
  sanity/
    schemas/
      event.js                     → Sanity event schema
      index.js                     → Schema registry
  sanity.config.js                 → Sanity client config
```

## Design System Consistency

- Wedge decorative elements on hero sections (matches About, Committees)
- Surface hierarchy: surface → surface-container → surface-container-low → surface-container-lowest
- No borders except `outline-variant/20` when needed
- Material Symbols Outlined for icons
- Inter font, typography scale matching existing pages
- Primary color for accents, on-primary for text on primary backgrounds
- `btn-wedge` clip-path for CTA buttons

## Error Handling

- Missing event slug → 404-style page with back link
- Missing cover image → gradient placeholder in card
- Empty gallery → "No photos available for this event" message
- Empty filter results → friendly empty state message

## Future Considerations

- Swap `eventsSource.js` to use `sanityClient` when ready
- Add search/filter by date range
- Add pagination or "Load More" when events exceed ~12
- Share buttons for individual events
- Calendar export (.ics) for upcoming events
