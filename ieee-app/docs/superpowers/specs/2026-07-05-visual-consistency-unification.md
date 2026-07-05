# Visual Consistency Unification — IEEE HITU SB Website

## 1. Overview

Unify the entire website under one visual language while preserving IEEE branding, colors, logo, content, and professional identity. The Hero section currently feels more modern than the rest — this spec eliminates that gap without reducing the Hero.

**Guiding principle:** One design language, multiple section personalities. Energy decreases from Hero (most dynamic) to Footer (minimal).

## 2. Scope

All 15 components and 10 pages in `src/`. No new pages. No content changes. No redesign — only unification of existing patterns.

**Work streams:**
1. CSS utility class adoption (`.btn`, `.card`, `.section-label`, `.form-input`)
2. Background alternation (A-B-A-B pattern with subtle CSS overlays)
3. Decorative elements (Hero visual language bleed via CSS patterns + SVG)
4. Card system unification
5. Button system unification
6. Animation consistency (CSS over framer-motion where possible)
7. Form system unification
8. Section spacing standardization
9. Footer refinement

## 3. CSS Utility Adoption

### 3.1 Section Labels

Every `text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary block` → `.section-label` CSS class.

Add `display: block` and `margin-bottom` as needed per context. The `.section-label` class already exists at `index.css:469`.

**Files affected:** All pages with section labels (~30 occurrences across Home.jsx, AboutPage.jsx, EventsPage.jsx, CommitteesPage.jsx, ContactPage.jsx, JoinUsPage.jsx, MembershipPage.jsx, GalleryPage.jsx, CommitteeDetailPage.jsx, EventDetailPage.jsx, TechnicalResources.jsx, Membership.jsx)

### 3.2 Cards

All instances of `bg-surface-container-low p-5/6/8 hover:bg-surface-container-lowest transition-all duration-300` → `.card-hover` class.

Cards without hover → `.card` class.

Both classes already exist at `index.css:482-497`. Use semantic padding via `--card-padding` token (`var(--space-6)` = 1.5rem).

**Hover consistency:** All hoverable cards use `box-shadow: var(--shadow-md)` on hover. No `shadow-lg` or `shadow-sm` variation.

**Files affected:** Home.jsx (whyJoin cards, Board members), TechnicalResources.jsx, Membership.jsx, EventCard.jsx, CommitteesPage.jsx, AboutPage.jsx, MembershipPage.jsx, CommitteeDetailPage.jsx, EventDetailPage.jsx, ContactPage.jsx, JoinUsPage.jsx

### 3.3 Buttons

All `bg-primary text-on-primary px-6 py-3 font-bold tracking-wide uppercase hover:bg-primary-container` → `.btn.btn-primary.btn-wedge`.

All `border border-outline-variant/40 ...` → `.btn.btn-secondary`.

All ghost/text buttons → `.btn.btn-ghost`.

The `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` classes exist at `index.css:502-560`.

**Navbar "Join IEEE" button:** Change from `rounded-full bg-primary px-5 py-2.5 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25` to `.btn.btn-primary` (which uses `--btn-radius` = `--radius-2xl` = 1.25rem).

**Files affected:** Hero.jsx, Navbar.jsx, Home.jsx, AboutPage.jsx, EventsPage.jsx, CommitteesPage.jsx, ContactPage.jsx, JoinUsPage.jsx, MembershipPage.jsx, CommitteeDetailPage.jsx, EventDetailPage.jsx, Membership.jsx

### 3.4 Form Inputs

All `w-full border border-outline-variant/40 bg-surface px-4 py-3 outline-none focus:border-primary` → `.form-input`.

All `select` variants → `.form-select`.

All `textarea` → `.form-textarea`.

All labels → `.form-label`.

All classes exist at `index.css:566-635`.

**Files affected:** ContactPage.jsx, JoinUsPage.jsx

## 4. Background Alternation (A-B-A-B Pattern)

### 4.1 Pattern Rules

- **Pattern A:** `bg-surface` (solid)
- **Pattern B:** `bg-surface-container-low` with subtle CSS pattern overlay

### 4.2 Section Sequence

| Section | Pattern | Page |
|---------|---------|------|
| Hero | A `bg-surface-container-lowest` | Home |
| About (What Is IEEE HITU SB) | B dot grid | Home |
| University (What Is HITU) | A | Home |
| Benefits (Why Join) | B line grid | Home |
| Board Members | A | Home |
| CTA "Ready to Become Part" | Primary bg | Home |
| Technical Resources | A | Home/About |
| Membership | B dot grid | Home |
| Page heros | A `bg-surface-container-lowest` | All pages |
| Content sections | Alternating A/B relative to page hero | All pages |
| Footer | B dot grid | All pages |

### 4.3 CSS Patterns

Add to `index.css`:

```css
.bg-dot-grid {
  background-image: radial-gradient(circle, var(--color-primary) 1px, transparent 1px);
  background-size: 24px 24px;
}
.bg-line-grid {
  background-image:
    linear-gradient(90deg, var(--color-primary) 0.5px, transparent 0.5px),
    linear-gradient(0deg, var(--color-primary) 0.5px, transparent 0.5px);
  background-size: 48px 48px;
}
```

Both at 0.03 opacity via `color-mix()` or `opacity` on a pseudo-element/overlay. Approach: use a `::before` pseudo-element with `pointer-events: none` on sections that need patterns, or add the pattern as a CSS class on the section with `background-blend-mode`.

**Implementation choice:** Add the pattern as a `::before` pseudo-element so the section background color remains clean and the pattern sits on top at low opacity. Use a single utility class `.has-dot-bg` / `.has-line-bg` added to `<section>` elements.

## 5. Decorative Elements

### 5.1 Floating Shapes

Create a `<SectionDecorations />` component in `src/components/SectionDecorations.jsx`:

```jsx
// Props: variant ('dots' | 'lines' | 'grid-fragment' | 'none'), className
```

Place one instance per section in alternating positions (top-right, bottom-left, etc.) — never identical placement across adjacent sections.

**Variants:**
- **dots:** 1-2 small floating circles (from Hero's `DecorativeShapes`)
- **lines:** 1-2 thin lines, horizontal or vertical
- **grid-fragment:** Small corner grid snippet

All use the same animation keyframes as Hero (`shape-drift-1`, `shape-drift-2`, `shape-drift-3`).

**Files created:** `src/components/SectionDecorations.jsx`

### 5.2 CSS Background Patterns

Used for Pattern B sections (see §4). The patterns are extremely subtle — barely noticeable, never competing with content.

## 6. Button System

### 6.1 Button Variants

All buttons follow this system:

| Class | Background | Hover |
|-------|-----------|-------|
| `.btn-primary` | `--color-primary` | `--color-primary-container` |
| `.btn-secondary` | Transparent + border | `border-color: --color-primary` |
| `.btn-ghost` | Transparent | `--color-surface-container-high` |

### 6.2 Radius

All buttons use `--btn-radius` = `--radius-2xl` = 1.25rem.

Navbar "Join IEEE" button changes from `rounded-full` to match.

### 6.3 Wedge Style

Primary action buttons get `.btn-wedge` clip-path (already exists):
```css
clip-path: polygon(0 0, 92% 0, 100% 25%, 100% 100%, 0 100%);
```

## 7. Card System

### 7.1 Card Properties

All cards share:
- `border-radius: var(--card-radius)` = `--radius-xl` = 1rem
- `padding: var(--card-padding)` = `var(--space-6)` = 1.5rem
- `background: var(--color-surface-container-low)`
- `transition: all var(--duration-300) var(--ease-out-quart)`

### 7.2 Card Hover

All hoverable cards:
- `hover: background: var(--color-surface-container-lowest)`
- `hover: box-shadow: var(--shadow-md)`

No variation in hover shadow intensity.

### 7.3 Cards with Images

EventCard images use `overflow-hidden` + `group-hover:scale-105` transition. This pattern is preserved and made consistent — already correct.

## 8. Animation System

### 8.1 Motion Language

Primary entrance: `animate-fade-up` (opacity 0→1, y 24px→0)
Secondary entrance: `animate-scale-in` (opacity 0→1, scale 0.95→1)
Stagger: `.animate-delay-1` through `.animate-delay-5`

### 8.2 Implementation

- Replace `AnimatedSection` framer-motion wrapper with direct CSS animation classes on `<section>` elements
- Add `animate-fade-up` to all sections
- Add `animate-delay-*` incrementally per section (1 per section in sequence)
- Keep `AnimatedSection` only where sequential stagger is critical (Home page)
- Remove framer-motion dependency from Footer (use CSS `animate-fade-up` instead)

### 8.3 Hero Preservation

Hero's framer-motion stagger + parallax effects are preserved untouched.

## 9. Section Spacing

Standardize all section spacing:

```css
/* Already defined as tokens */
--spacing-section-sm: var(--space-16);   /* 4rem */
--spacing-section: var(--space-20);       /* 5rem */
--spacing-section-lg: var(--space-24);   /* 6rem */
--spacing-section-xl: var(--space-32);   /* 8rem */
```

All sections use `py-20 md:py-24 lg:py-32` (mapping to `--spacing-section`).

**Exceptions overridden:**
- TechnicalResources.jsx: `py-12 sm:py-16 md:py-24` → `py-20 md:py-24 lg:py-32`
- Membership.jsx: `py-12 sm:py-16 md:py-24` → `py-20 md:py-24 lg:py-32`

## 10. Footer Refinement

- Add `bg-dot-grid` background pattern
- Replace `motion.footer` with `<footer>` + `animate-fade-up` CSS class
- Remove framer-motion import from Footer.jsx
- Keep all existing content and links unchanged

## 11. Design Tokens Needed (Additions to index.css)

Add new utility classes for background patterns at bottom of existing CSS:

```css
/* Background pattern utilities */
.bg-dot-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, var(--color-primary) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.03;
  pointer-events: none;
}
.bg-line-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, var(--color-primary) 0.5px, transparent 0.5px),
    linear-gradient(0deg, var(--color-primary) 0.5px, transparent 0.5px);
  background-size: 48px 48px;
  opacity: 0.03;
  pointer-events: none;
}
```

**Sections using these must have `position: relative`.** All sections already use `relative` or can have it added.

## 12. Files Changed Summary

### New Files
- `src/components/SectionDecorations.jsx` — reusable decorative elements

### Modified Files
- `src/index.css` — add pattern utility classes
- `src/components/Hero.jsx` — use `.btn.btn-primary.btn-wedge` for buttons
- `src/components/Navbar.jsx` — change Join IEEE to `.btn.btn-primary`, nav links radius consistency
- `src/components/Footer.jsx` — remove framer-motion, add CSS animation + pattern background
- `src/components/TechnicalResources.jsx` — use `.card-hover`, `.section-label`, standardize spacing
- `src/components/Membership.jsx` — use `.card-hover`, `.section-label`, standardize spacing
- `src/components/EventCard.jsx` — use `.card-hover`
- `src/components/MasonryGallery.jsx` — minor refinement
- `src/components/AnimatedSection.jsx` — preserve for critical stagger use only
- `src/pages/Home.jsx` — use CSS classes, background alternation, decorative elements
- `src/pages/AboutPage.jsx` — use CSS classes, background alternation, decorative elements
- `src/pages/EventsPage.jsx` — use CSS classes, background alternation
- `src/pages/CommitteesPage.jsx` — use CSS classes, background alternation
- `src/pages/CommitteeDetailPage.jsx` — use CSS classes
- `src/pages/ContactPage.jsx` — use `.form-input` classes, CSS classes
- `src/pages/EventDetailPage.jsx` — use CSS classes
- `src/pages/GalleryPage.jsx` — use CSS classes
- `src/pages/JoinUsPage.jsx` — use `.form-input` classes, CSS classes
- `src/pages/MembershipPage.jsx` — use CSS classes, background alternation

## 13. Non-Goals

- No redesign of any section
- No content changes
- No new pages
- No new colors or accent colors
- No colorful gradients
- No JavaScript performance regressions
- No framer-motion removal from Hero or PageTransition
- No changing the Hero DotField canvas or interactive elements
- No changing Lenis smooth scroll configuration

## 14. Verification

After implementation:
1. `npm run build` — must pass with no errors
2. Visual check: all buttons look consistent across pages
3. Visual check: all cards have same hover behavior
4. Visual check: background alternating pattern visible but subtle
5. Visual check: decorative elements appear but don't compete with content
