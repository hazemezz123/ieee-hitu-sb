# Events Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a category-filtered Events listing page, dedicated event detail pages with a masonry photo gallery and custom lightbox, and integrate Sanity CMS for future content management.

**Architecture:** Static data file (`src/data/events.js`) with a factory pattern matching the existing committees data layer. A thin `eventsSource.js` abstraction will allow swapping to `sanityClient.fetch()` later. Sanity Studio is integrated as a Vite plugin serving `/studio/*`. Two new page components (`EventsPage`, `EventDetailPage`) and three new reusable components (`EventCard`, `MasonryGallery`, `Lightbox`) are added.

**Tech Stack:** React 19, React Router DOM 7, Tailwind CSS 4, Sanity (v3+), Vite 8

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/data/events.js` | Static event data, factory function, filtered exports |
| `src/data/eventsSource.js` | Data source abstraction — currently returns static data |
| `src/pages/EventsPage.jsx` | Events listing with category filter bar and event card grid |
| `src/pages/EventDetailPage.jsx` | Single event detail with hero, description, and masonry gallery |
| `src/components/EventCard.jsx` | Reusable event card component |
| `src/components/MasonryGallery.jsx` | Column-based CSS masonry gallery with lightbox trigger |
| `src/components/Lightbox.jsx` | Custom fullscreen photo lightbox with keyboard navigation |
| `src/components/Navbar.jsx` | Add "Events" link to nav links |
| `src/components/Footer.jsx` | Add "Events" link to footer nav |
| `src/App.jsx` | Add `/events` and `/events/:slug` routes |
| `src/sanity/schemas/event.js` | Sanity event document schema |
| `src/sanity/schemas/index.js` | Schema registry export |
| `sanity.config.js` | Sanity client configuration (projectId, dataset, schemas) |
| `vite.config.js` | Add Sanity Vite plugin |
| `package.json` | Add Sanity dependencies |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (dependencies)

- [ ] **Step 1: Install Sanity packages**

Run:
```bash
npm install sanity @sanity/image-url
```

This installs:
- `sanity` — Sanity client and Studio framework
- `@sanity/image-url` — Image URL builder for Sanity assets

- [ ] **Step 2: Verify install**

Run:
```bash
npm ls sanity @sanity/image-url
```

Expected: Both packages listed in the dependency tree.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add sanity dependencies"
```

---

### Task 2: Create Static Event Data

**Files:**
- Create: `src/data/events.js`

- [ ] **Step 1: Write the event data file**

Create `src/data/events.js`:

```js
const eventCategoryLabels = {
  workshops: 'Workshops',
  conferences: 'Conferences',
  competitions: 'Competitions',
  social: 'Social',
  orientation: 'Orientation',
  outreach: 'Outreach',
};

const createEvent = ({
  title,
  slug,
  date,
  endDate = null,
  location,
  category,
  coverImage,
  excerpt,
  description = '',
  gallery = [],
  organizerCommittee = null,
}) => {
  const eventDate = new Date(date);
  const status = eventDate > new Date() ? 'upcoming' : 'past';

  return {
    title,
    slug,
    date,
    endDate,
    location,
    category,
    categoryLabel: eventCategoryLabels[category] || category,
    coverImage,
    excerpt,
    description,
    gallery,
    organizerCommittee,
    status,
  };
};

export const events = [
  createEvent({
    title: 'Introduction to Web Development',
    slug: 'intro-to-web-dev',
    date: '2025-09-20T14:00:00Z',
    location: 'HITU Campus, Room A101',
    category: 'workshops',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'A hands-on workshop covering HTML, CSS, and JavaScript fundamentals for beginners.',
    description: 'This workshop introduced members to the fundamentals of web development. Starting with HTML structure, moving through CSS styling, and finishing with JavaScript interactivity, attendees built their first complete webpage by the end of the session.\n\nThe Web committee led the session with live coding exercises and one-on-one mentoring. Members left with a working portfolio page and a clear learning path for continued web development.',
    gallery: [
      { src: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png', caption: 'Workshop instructor demonstrating HTML structure' },
    ],
    organizerCommittee: 'Web',
  }),
  createEvent({
    title: 'IEEE Day Celebration 2025',
    slug: 'ieee-day-2025',
    date: '2025-10-05T10:00:00Z',
    location: 'HITU Campus Main Hall',
    category: 'social',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'Celebrating IEEE Day with technical demos, networking, and branch achievements showcases.',
    description: 'Our branch celebrated IEEE Day 2025 with a full day of activities. Members showcased projects from each technical committee, shared experiences, and welcomed new attendees interested in joining IEEE.\n\nThe event featured live demos, poster presentations, and a panel discussion on the role of IEEE in shaping future engineers.',
    gallery: [
      { src: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png', caption: 'IEEE Day group photo' },
    ],
    organizerCommittee: 'PR & OC',
  }),
  createEvent({
    title: 'AI Study Camp — Level 1',
    slug: 'ai-study-camp-l1',
    date: '2026-05-10T09:00:00Z',
    endDate: '2026-05-14T16:00:00Z',
    location: 'HITU Campus, Computer Labs',
    category: 'workshops',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'A five-day intensive study camp covering Python, data analysis, and introductory machine learning.',
    description: 'An intensive five-day study camp designed to give members a strong foundation in AI. The program covers Python programming, data analysis with pandas, visualization with matplotlib, and an introduction to machine learning with scikit-learn.\n\nEach day combines morning theory sessions with afternoon hands-on labs. Members who complete all five days receive a branch certificate of completion.',
    gallery: [],
    organizerCommittee: 'AI',
  }),
];

export { eventCategoryLabels };

export const eventCategories = Object.keys(eventCategoryLabels);

export const upcomingEvents = events.filter((e) => e.status === 'upcoming');
export const pastEvents = events.filter((e) => e.status === 'past');

export function getEventBySlug(slug) {
  return events.find((event) => event.slug === slug);
}
```

This provides 3 sample events (2 past, 1 upcoming) across 2 categories. More events and categories can be added later. The gallery uses placeholder images — replace with actual event photos.

- [ ] **Step 2: Commit**

```bash
git add src/data/events.js
git commit -m "feat: add static event data layer with factory pattern"
```

---

### Task 3: Create Data Source Abstraction

**Files:**
- Create: `src/data/eventsSource.js`

- [ ] **Step 1: Write the data source abstraction**

Create `src/data/eventsSource.js`:

```js
import { events, getEventBySlug as getStaticEventBySlug } from './events';

/**
 * Fetch all events. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event"]')
 */
export async function fetchEvents() {
  return events;
}

/**
 * Fetch a single event by slug. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event" && slug.current == $slug][0]')
 */
export async function fetchEventBySlug(slug) {
  return getStaticEventBySlug(slug);
}
```

This module exports async functions that currently wrap the static data. When migrating to Sanity, only these two functions change — page components remain untouched.

- [ ] **Step 2: Commit**

```bash
git add src/data/eventsSource.js
git commit -m "feat: add events data source abstraction for future Sanity migration"
```

---

### Task 4: Create EventCard Component

**Files:**
- Create: `src/components/EventCard.jsx`

- [ ] **Step 1: Write the EventCard component**

Create `src/components/EventCard.jsx`:

```jsx
import { Link } from 'react-router-dom';

function formatDateBadge(dateStr) {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }).toUpperCase(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function EventCard({ event }) {
  const { day, month } = formatDateBadge(event.date);

  return (
    <article className="group relative bg-surface-container-low overflow-hidden transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {event.status === 'upcoming' && (
          <span className="absolute top-4 left-4 bg-primary text-on-primary text-[0.625rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Upcoming
          </span>
        )}
        <div className="absolute top-4 right-4 bg-surface-container-lowest/95 backdrop-blur-sm text-on-surface px-3 py-2 text-center leading-none shadow-sm">
          <div className="text-lg font-black leading-none">{day}</div>
          <div className="text-[0.625rem] font-bold uppercase tracking-wider leading-none mt-1">{month}</div>
        </div>
      </div>

      <div className="p-6">
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary block mb-2">
          {event.categoryLabel}
        </span>
        <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
          {event.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span className="truncate">{event.location}</span>
          </div>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 text-primary font-bold text-[0.6875rem] uppercase tracking-widest whitespace-nowrap"
          >
            View
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
```

Key design decisions:
- Date badge is absolutely positioned top-right with frosted glass effect
- "Upcoming" badge only shows for future events (top-left)
- Cover image has a subtle zoom on hover (matches site interactivity)
- Location uses Material Symbols icon + truncated text
- "View →" link uses the same style as committee cards

- [ ] **Step 2: Commit**

```bash
git add src/components/EventCard.jsx
git commit -m "feat: add EventCard component with date badge and status"
```

---

### Task 5: Create Lightbox Component

**Files:**
- Create: `src/components/Lightbox.jsx`

- [ ] **Step 1: Write the Lightbox component**

Create `src/components/Lightbox.jsx`:

```jsx
import { useEffect, useCallback } from 'react';

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    },
    [onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close lightbox"
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors p-2"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          className="absolute left-4 z-10 text-white/80 hover:text-white transition-colors p-2 bg-black/40 rounded-full hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1);
          }}
        >
          <ChevronLeftIcon />
        </button>
      )}

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next image"
          className="absolute right-4 z-10 text-white/80 hover:text-white transition-colors p-2 bg-black/40 rounded-full hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1);
          }}
        >
          <ChevronRightIcon />
        </button>
      )}

      <div
        className="max-w-5xl max-h-[85vh] px-16 py-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.caption || ''}
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        {image.caption && (
          <p className="text-white/70 text-sm mt-4 text-center max-w-lg">{image.caption}</p>
        )}
        {images.length > 1 && (
          <p className="text-white/50 text-xs mt-2 uppercase tracking-wider">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
```

Key design decisions:
- Full-screen dark overlay (`bg-black/90`)
- Click backdrop closes lightbox; click image does not
- Prev/next buttons only render when there are multiple images
- Keyboard: Escape closes, arrows navigate
- Body scroll is locked while lightbox is open
- Image counter at bottom when multiple images

- [ ] **Step 2: Commit**

```bash
git add src/components/Lightbox.jsx
git commit -m "feat: add custom Lightbox component with keyboard navigation"
```

---

### Task 6: Create MasonryGallery Component

**Files:**
- Create: `src/components/MasonryGallery.jsx`

- [ ] **Step 1: Write the MasonryGallery component**

Create `src/components/MasonryGallery.jsx`:

```jsx
import { useState } from 'react';
import Lightbox from './Lightbox';

export default function MasonryGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">
          photo_library
        </span>
        <p className="text-on-surface-variant">No photos available for this event yet.</p>
      </div>
    );
  }

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (direction) => {
    setLightboxIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className="break-inside-avoid cursor-pointer group block overflow-hidden rounded-lg"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.caption || `Event photo ${index + 1}`}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}
```

Key design decisions:
- Uses CSS `columns-*` for true masonry (images flow top-to-bottom within columns)
- `break-inside-avoid` prevents images from being split across columns
- `space-y-4` adds vertical gap between stacked items
- Each image is a button for accessibility
- Hover scale effect on images
- Empty state with icon and message when no gallery images

- [ ] **Step 2: Commit**

```bash
git add src/components/MasonryGallery.jsx
git commit -m "feat: add MasonryGallery component with Lightbox integration"
```

---

### Task 7: Create EventsPage

**Files:**
- Create: `src/pages/EventsPage.jsx`
- Modify: `src/App.jsx` (add route)
- Modify: `src/components/Navbar.jsx` (add nav link)
- Modify: `src/components/Footer.jsx` (add footer link)

- [ ] **Step 1: Write the EventsPage component**

Create `src/pages/EventsPage.jsx`:

```jsx
import { useState, useMemo } from 'react';
import { eventCategories, eventCategoryLabels, events } from '../data/events';
import EventCard from '../components/EventCard';

const ALL_CATEGORY = 'all';

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  const filteredEvents = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return events;
    return events.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-5xl text-center">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">
            Events
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-6">
            Where Ideas Come <span className="text-primary">Alive</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
            Workshops, conferences, competitions, and more — explore everything our branch
            has organized for its members.
          </p>
          <div className="flex gap-8 justify-center text-on-surface-variant">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{events.length}</div>
              <div className="text-sm uppercase tracking-wider">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{eventCategories.length}</div>
              <div className="text-sm uppercase tracking-wider">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{upcomingCount}</div>
              <div className="text-sm uppercase tracking-wider">Upcoming</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar + Events Grid */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12 max-w-6xl">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            <button
              type="button"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${
                activeCategory === ALL_CATEGORY
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`}
              onClick={() => setActiveCategory(ALL_CATEGORY)}
            >
              All
            </button>
            {eventCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {eventCategoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">
                event_busy
              </span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No events in this category yet</h3>
              <p className="text-on-surface-variant">More events are coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12 text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Want to Join Our Next Event?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Become a member and be part of the workshops, competitions, and conferences
            that make our branch thrive.
          </p>
          <a
            href="/join-us"
            className="btn-wedge inline-block bg-primary text-on-primary px-8 py-3 font-bold tracking-wide uppercase"
          >
            Join Us
          </a>
        </div>
      </section>
    </div>
  );
}
```

Key design decisions:
- Hero matches the wedge pattern used in CommitteesPage and CommitteeDetailPage
- Stats row: total events, categories, upcoming
- Filter bar uses pill-style rounded-full buttons, centered
- Active filter uses primary color, inactive uses surface-container with hover state
- Empty state uses Material Symbols `event_busy` icon
- CTA section at bottom links to `/join-us`

- [ ] **Step 2: Add the route to App.jsx**

Modify `src/App.jsx`. Add import and route:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MembershipPage from './pages/MembershipPage'
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'
import JoinUsPage from './pages/JoinUsPage'
import AboutPage from './pages/AboutPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/committees" element={<CommitteesPage />} />
          <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
```

- [ ] **Step 3: Add "Events" link to Navbar**

Modify `src/components/Navbar.jsx`. In the `navLinks` array, add Events after Committees:

```js
  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Committees', href: '/committees' },
    { name: 'Events', href: '/events' },
    { name: 'Join Us', href: '/join-us' },
    { name: 'Membership', href: '/membership' },
  ];
```

- [ ] **Step 4: Add "Events" link to Footer**

Modify `src/components/Footer.jsx`. In the footer nav, add after Committees:

```jsx
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/committees">Committees</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/events">Events</Link>
          <Link className="text-xs font-medium uppercase tracking-widest text-on-surface-variant transition-transform hover:translate-x-1 hover:text-primary" to="/join">Join Us</Link>
```

- [ ] **Step 5: Verify the route works**

Run:
```bash
npm run dev
```

Open `http://localhost:5173/events` — should show the Events listing page with filter bar and event cards. Open `http://localhost:5173/events/intro-to-web-dev` — should show 404 fallback (EventDetailPage not yet created).

- [ ] **Step 6: Commit**

```bash
git add src/pages/EventsPage.jsx src/App.jsx src/components/Navbar.jsx src/components/Footer.jsx
git commit -m "feat: add Events listing page with filter bar and nav links"
```

---

### Task 8: Create EventDetailPage

**Files:**
- Create: `src/pages/EventDetailPage.jsx`

- [ ] **Step 1: Write the EventDetailPage component**

Create `src/pages/EventDetailPage.jsx`:

```jsx
import { Link, useParams } from 'react-router-dom';
import { getEventBySlug } from '../data/events';
import MasonryGallery from '../components/MasonryGallery';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-surface-container-low p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <span className="text-xs uppercase tracking-wider text-on-surface-variant">{label}</span>
      </div>
      <div className="text-lg font-bold text-on-surface">{value}</div>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const event = getEventBySlug(slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-8">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-black tracking-tight mb-4">Event not found</h1>
          <p className="text-on-surface-variant mb-6">
            The event page you are looking for does not exist.
          </p>
          <Link
            to="/events"
            className="btn-wedge inline-block bg-primary text-on-primary px-6 py-3 font-bold tracking-wide uppercase"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Header */}
      <section className="relative bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent"
            style={{ transform: 'rotate(0deg) scale(1.5)' }}
          ></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-5xl">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-8 pt-32"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Events
          </Link>

          {/* Cover Image */}
          <div className="relative w-full aspect-[21/9] overflow-hidden rounded-xl mb-10">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="max-w-3xl pb-16">
            <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary block mb-3">
              {event.categoryLabel}
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-6">
              {event.excerpt}
            </p>
            {event.organizerCommittee && (
              <p className="text-sm text-on-surface-variant">
                Organized by <span className="font-semibold text-on-surface">{event.organizerCommittee} Committee</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-12 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon="calendar_today"
              label="Date"
              value={formatDate(event.date)}
            />
            <StatCard
              icon="location_on"
              label="Location"
              value={event.location}
            />
            <StatCard
              icon="category"
              label="Category"
              value={event.categoryLabel}
            />
            <StatCard
              icon={event.endDate ? 'event_repeat' : 'event'}
              label="Type"
              value={event.endDate ? 'Multi-day' : 'Single day'}
            />
          </div>
        </div>
      </section>

      {/* Description */}
      {event.description && (
        <section className="py-24 bg-surface-container-lowest">
          <div className="container mx-auto px-12 max-w-4xl">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-6">
              About the Event
            </span>
            <div className="prose prose-lg max-w-none">
              {event.description.split('\n').map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="text-on-surface-variant leading-relaxed mb-4 last:mb-0">
                    {paragraph.trim()}
                  </p>
                ) : null,
              )}
            </div>
          </div>
        </section>
      )}

      {/* Masonry Gallery */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">
              Gallery
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Event Photos
            </h2>
          </div>
          <MasonryGallery images={event.gallery} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-12 text-center max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Want to Join Our Next Event?
          </h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Be part of the workshops, competitions, and conferences that make our branch thrive.
          </p>
          <a
            href="/join-us"
            className="btn-wedge inline-block bg-primary text-on-primary px-8 py-3 font-bold tracking-wide uppercase"
          >
            Join Us
          </a>
        </div>
      </section>
    </div>
  );
}
```

Key design decisions:
- Cover image is 21:9 aspect ratio, rounded corners — dramatic hero
- Back link above hero uses same style as CommitteeDetailPage
- Stat cards in a 4-column grid with Material Symbols icons
- Description renders paragraph blocks (newline-separated text)
- Gallery section uses MasonryGallery component
- CTA section at bottom matches EventsPage CTA
- 404 fallback matches CommitteeDetailPage pattern

- [ ] **Step 2: Verify the detail page**

Run:
```bash
npm run dev
```

Open `http://localhost:5173/events/intro-to-web-dev` — should show the event detail page with hero, stat cards, description, gallery, and CTA.
Open `http://localhost:5173/events/nonexistent` — should show "Event not found" page.

Test the lightbox: click any gallery image → should open fullscreen overlay with prev/next (if multiple images) and Escape to close.

- [ ] **Step 3: Commit**

```bash
git add src/pages/EventDetailPage.jsx
git commit -m "feat: add EventDetailPage with hero, stat cards, and masonry gallery"
```

---

### Task 9: Set Up Sanity Studio Integration

**Files:**
- Create: `sanity.config.js`
- Create: `src/sanity/schemas/event.js`
- Create: `src/sanity/schemas/index.js`
- Modify: `vite.config.js`

- [ ] **Step 1: Create the Sanity configuration**

First, I need the Sanity Project ID. Check the Sanity dashboard at https://www.sanity.io/ for your project ID, or run:

```bash
npx sanity@latest manage
```

Once you have the Project ID, create `sanity.config.js` at the project root:

```js
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemas } from './src/sanity/schemas/index';

export default defineConfig({
  name: 'ieee-hitu-sb',
  title: 'IEEE HITU Student Branch',
  projectId: 'YOUR_SANITY_PROJECT_ID', // Replace with your actual project ID
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemas,
  },
});
```

- [ ] **Step 2: Create the Sanity event schema**

Create `src/sanity/schemas/event.js`:

```js
export const eventSchema = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100).error('Title must be under 100 characters'),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'End Date (Optional)',
      type: 'datetime',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Workshops', value: 'workshops' },
          { title: 'Conferences', value: 'conferences' },
          { title: 'Competitions', value: 'competitions' },
          { title: 'Social', value: 'social' },
          { title: 'Orientation', value: 'orientation' },
          { title: 'Outreach', value: 'outreach' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alternative Text', type: 'string' },
      ],
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          fields: [
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
          options: { hotspot: true },
        },
      ],
    },
    {
      name: 'organizerCommittee',
      title: 'Organizer Committee',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      category: 'category',
      media: 'coverImage',
    },
    prepare({ title, date, category }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString() : category,
      };
    },
  },
};
```

- [ ] **Step 3: Create schema registry**

Create `src/sanity/schemas/index.js`:

```js
import { eventSchema } from './event';

export const schemas = [eventSchema];
```

- [ ] **Step 4: Add Sanity Vite plugin to vite.config.js**

Modify `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sanityVite } from 'sanity'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sanityVite({
      projectId: 'YOUR_SANITY_PROJECT_ID', // Must match sanity.config.js
      dataset: 'production',
    }),
  ],
})
```

Note: Replace `YOUR_SANITY_PROJECT_ID` with your actual Sanity project ID in both `sanity.config.js` and `vite.config.js`.

- [ ] **Step 5: Verify Sanity Studio is accessible**

Run:
```bash
npm run dev
```

Open `http://localhost:5173/studio` — the Sanity Studio should load with the Event document type available.

- [ ] **Step 6: Commit**

```bash
git add sanity.config.js src/sanity/schemas/event.js src/sanity/schemas/index.js vite.config.js
git commit -m "feat: integrate Sanity Studio with event schema"
```

---

### Task 10: Build Verification and Polish

**Files:**
- All modified files

- [ ] **Step 1: Run the build to ensure no errors**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors. Warnings are acceptable if they are not about missing imports or broken references.

- [ ] **Step 2: Run linting**

Run:
```bash
npm run lint
```

Expected: No errors. Fix any lint issues that arise.

- [ ] **Step 3: Test all routes manually**

- `/` — Home page still works
- `/about` — About page still works
- `/committees` — Committees page still works
- `/committees/ai` — Committee detail still works
- `/membership` — Membership page still works
- `/join-us` — Join Us page still works
- `/events` — Events listing with filter bar, 3 sample events
- `/events/intro-to-web-dev` — Event detail with gallery
- `/events/ieee-day-2025` — Second event detail
- `/events/ai-study-camp-l1` — Upcoming event detail
- `/events/nonexistent` — 404 fallback

- [ ] **Step 4: Test the lightbox**

On `/events/intro-to-web-dev`, click the gallery image → lightbox opens with the image, counter shows "1 / 1", no prev/next arrows (only one image). Close with Escape or X button.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final polish and build verification for Events feature"
```

---

## Sanity Project ID Note

Before Task 9, you will need your actual Sanity Project ID. Get it from:
1. https://www.sanity.io/manage — select your project → copy the Project ID
2. Or run `npx sanity@latest debug` in the project directory

Replace `YOUR_SANITY_PROJECT_ID` in both `sanity.config.js` and `vite.config.js` with the real ID.
