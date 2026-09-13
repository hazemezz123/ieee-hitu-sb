# Visual Consistency Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all visual patterns (buttons, cards, labels, forms, backgrounds, animations, spacing) across the IEEE HITU SB website under one consistent design language.

**Architecture:** Uses existing but unused CSS utility classes (`.btn`, `.card-hover`, `.section-label`, `.form-input`) + new background pattern CSS + new decorative component. Each file is modified independently — no shared state between tasks.

**Tech Stack:** React 19, Tailwind CSS v4 (CSS-based config), framer-motion, Vite

---

### Task 1: Add background pattern utility classes to index.css

**Files:**
- Modify: `src/index.css` (append after line 759)

- [ ] **Step 1: Add pattern utility classes at end of index.css**

Open `src/index.css` and append after the last line:

```css
/* ============================================
   BACKGROUND PATTERN UTILITIES
   Subtle textures for section alternation
   ============================================ */
.bg-dot-pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, var(--color-primary) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}

.bg-line-pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, var(--color-primary) 0.5px, transparent 0.5px),
    linear-gradient(0deg, var(--color-primary) 0.5px, transparent 0.5px);
  background-size: 48px 48px;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

.section-content {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Verify the file is valid CSS**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add background pattern utility classes for section alternation"
```

---

### Task 2: Create SectionDecorations component

**Files:**
- Create: `src/components/SectionDecorations.jsx`

- [ ] **Step 1: Create SectionDecorations.jsx**

Write the file:

```jsx
const variants = {
  dots: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[15%] right-[8%] w-12 h-12 rounded-full border border-primary/8 animate-[shape-drift-1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[20%] left-[5%] w-6 h-6 rotate-45 border border-primary/6 animate-[shape-drift-2_25s_ease-in-out_infinite]" />
    </div>
  ),
  lines: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[30%] right-[3%] w-px h-16 bg-primary/6 animate-[shape-drift-3_18s_ease-in-out_infinite]" />
      <div className="absolute bottom-[30%] left-[10%] w-20 h-px bg-primary/5 animate-[shape-drift-2_22s_ease-in-out_infinite_1s]" />
    </div>
  ),
  grid: (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[10%] right-[5%] w-24 h-24 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, var(--color-primary) 1px, transparent 1px),
            linear-gradient(0deg, var(--color-primary) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />
    </div>
  ),
}

export default function SectionDecorations({ variant = 'dots' }) {
  return variants[variant] || null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionDecorations.jsx
git commit -m "feat: add reusable SectionDecorations component"
```

---

### Task 3: Refactor Hero.jsx buttons to use .btn classes

**Files:**
- Modify: `src/components/Hero.jsx`

- [ ] **Step 1: Replace inline button styles with .btn classes**

In `Hero.jsx`:
- Line 107: Replace the first button:
  - From: `className="btn-wedge bg-primary text-on-primary px-6 sm:px-8 py-3 sm:py-4 text-sm md:text-base font-bold tracking-wide uppercase hover:bg-primary-container transition-all animate-[button-float_10s_ease-in-out_infinite]"`
  - To: `className="btn btn-primary animate-[button-float_10s_ease-in-out_infinite]"`

- Line 110: Replace the second button:
  - From: `className="px-6 sm:px-8 py-3 sm:py-4 text-sm md:text-base font-bold tracking-wide uppercase text-primary border-b-2 border-transparent hover:border-primary transition-all animate-[button-float_12s_ease-in-out_infinite_1s]"`
  - To: `className="btn btn-secondary animate-[button-float_12s_ease-in-out_infinite_1s]"`

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "refactor: use .btn classes in Hero buttons"
```

---

### Task 4: Refactor Navbar.jsx to use .btn classes and consistent radius

**Files:**
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Update Join IEEE button in desktop nav**

Line 131-136: Replace:
```jsx
<Link
  to="/membership"
  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25"
>
  Join IEEE
</Link>
```
With:
```jsx
<Link
  to="/membership"
  className="btn btn-primary"
>
  Join IEEE
</Link>
```

- [ ] **Step 2: Update Join IEEE button in mobile menu**

Line 189-195: Replace:
```jsx
<Link
  to="/membership"
  className="flex-1 text-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25"
  onClick={() => setIsMenuOpen(false)}
>
  Join IEEE
</Link>
```
With:
```jsx
<Link
  to="/membership"
  className="btn btn-primary flex-1 text-center"
  onClick={() => setIsMenuOpen(false)}
>
  Join IEEE
</Link>
```

- [ ] **Step 3: Make nav link radius consistent**

Line 117: Change `rounded-full` to `rounded-2xl`:
```jsx
className={`relative px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-250 ease-out ${
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.jsx
git commit -m "refactor: use .btn classes in Navbar, consistent button radius"
```

---

### Task 5: Refactor Footer.jsx — remove framer-motion, add CSS animation + pattern

**Files:**
- Modify: `src/components/Footer.jsx`

- [ ] **Step 1: Remove framer-motion import and wrapper**

Replace `import { motion } from "framer-motion"` with nothing (remove the import line).

Replace `<motion.footer ...>` with `<footer className="relative w-full bg-surface-container-highest pt-16 pb-8 text-on-surface animate-fade-up">`

Remove all `initial`, `whileInView`, `viewport`, `transition` props from the footer element.

Remove the closing `</motion.footer>` and replace with `</footer>`.

- [ ] **Step 2: Add background pattern + content wrapper**

Wrap the footer content in a container that allows the pattern to show:

Before the first `<div className="mx-auto...">`, add a wrapper div:
```jsx
<div className="relative section-content">
```

Close it before `</footer>`:
```jsx
</div>
```

- [ ] **Step 3: Add the dot pattern background**

Change the footer className to include pattern:
From: `className="relative w-full bg-surface-container-highest pt-16 pb-8 text-on-surface animate-fade-up"`
To: `className="relative w-full bg-surface-container-highest pt-16 pb-8 text-on-surface animate-fade-up bg-dot-pattern"`

Add `relative` to the top wrapper:
From: `<div className="mx-auto...">`
To: Ensure the outer wrapper has `relative` (it will since footer has `relative`).

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.jsx
git commit -m "refactor: Footer — remove framer-motion, add CSS animation and dot pattern"
```

---

### Task 6: Refactor TechnicalResources.jsx — use .card-hover, .section-label, standard spacing

**Files:**
- Modify: `src/components/TechnicalResources.jsx`

- [ ] **Step 1: Replace section label with .section-label**

Line 28: Replace:
```jsx
<span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-3 sm:mb-4">Core Ecosystem</span>
```
With:
```jsx
<span className="section-label mb-4">Core Ecosystem</span>
```

- [ ] **Step 2: Replace card styles with .card-hover**

Line 37: Replace:
```jsx
className="bg-surface-container-low p-6 sm:p-8 md:p-10 group hover:bg-surface-container-lowest transition-all duration-300 relative overflow-hidden"
```
With:
```jsx
className="card-hover p-6 sm:p-8 md:p-10 group relative overflow-hidden"
```

- [ ] **Step 3: Standardize section spacing**

Line 24: Replace:
```jsx
<section className="py-12 sm:py-16 md:py-24 bg-surface">
```
With:
```jsx
<section className="py-20 md:py-24 lg:py-32 bg-surface relative">
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/TechnicalResources.jsx
git commit -m "refactor: TechnicalResources — use .card-hover, .section-label, standard spacing"
```

---

### Task 7: Refactor Membership.jsx — use .section-label, standard spacing, section-label uses text-primary

**Files:**
- Modify: `src/components/Membership.jsx`

- [ ] **Step 1: Replace section label**

Line 16: Replace:
```jsx
<span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-tertiary block mb-3 sm:mb-4">Connect with Excellence</span>
```
With:
```jsx
<span className="section-label mb-4">Connect with Excellence</span>
```

- [ ] **Step 2: Standardize section spacing**

Line 12: Replace:
```jsx
<section className="py-12 sm:py-16 md:py-24 bg-surface-container-lowest relative overflow-hidden">
```
With:
```jsx
<section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest relative overflow-hidden">
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Membership.jsx
git commit -m "refactor: Membership — use .section-label, standard spacing"
```

---

### Task 8: Refactor EventCard.jsx — use .card-hover

**Files:**
- Modify: `src/components/EventCard.jsx`

- [ ] **Step 1: Replace card with .card-hover**

Line 15: Replace:
```jsx
<article className="group relative bg-surface-container-low overflow-hidden transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-lg">
```
With:
```jsx
<article className="card-hover group relative overflow-hidden">
```

Line 34: Replace the event category label:
```jsx
<span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary block mb-2">
```
This is a different size (0.625rem vs 0.6875rem), keep as-is since it's an event-specific micro-label.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/EventCard.jsx
git commit -m "refactor: EventCard — use .card-hover"
```

---

### Task 9: Refactor pages/Home.jsx — CSS classes, background alternation, decorative elements

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Install SectionDecorations import**

Add at top (line 3):
```jsx
import SectionDecorations from '../components/SectionDecorations'
```

- [ ] **Step 2: Section 1 (About) — Pattern B with dot grid**

Replace lines 20-42. New section:
```jsx
<AnimatedSection>
<section className="py-20 md:py-24 lg:py-32 bg-surface-container-low relative bg-dot-pattern">
  <SectionDecorations variant="dots" />
  <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
    <div className="max-w-3xl">
      <span className="section-label mb-4">About Us</span>
      <h2 className="mb-4 md:mb-6 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
        What Is <span className="text-primary">IEEE HITU SB</span>?
      </h2>
      <p className="mb-4 text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
        IEEE HITU SB is the student branch of IEEE at Heliopolis International
        Technological University, built to give students a structured community for
        learning, collaboration, and professional growth.
      </p>
      <p className="text-sm md:text-base leading-relaxed text-on-surface-variant md:text-lg">
        Through committees, events, and shared branch work, students gain technical
        exposure, leadership experience, and a stronger connection to the wider world
        of engineering and technology.
      </p>
    </div>
  </div>
</section>
</AnimatedSection>
```

- [ ] **Step 3: Section 2 (University) — Pattern A**

Replace lines 45-87. Keep `bg-surface-container-lowest` but replace section labels:
```jsx
<AnimatedSection delay={1}>
<section className="py-20 md:py-24 lg:py-32 bg-surface-container-lowest relative">
  <SectionDecorations variant="lines" />
  <div className="container mx-auto px-6 md:px-12 max-w-6xl relative section-content">
    {/* ... rest of content but replace section label ... */}
    <span className="section-label mb-4">Our University</span>
    {/* Replace the highlight "cards" that use border styling with .card-hover */}
    {[/*...*/].map(...) => (
      <div className="card-hover p-4 md:px-6 py-4 md:py-5">...</div>
    )}
  </div>
</section>
</AnimatedSection>
```

- [ ] **Step 4: Section 3 (Benefits / Why Join) — Pattern B with line grid**

Replace the benefits section labels with `.section-label` and add pattern:
```jsx
<section className="py-20 md:py-24 lg:py-32 bg-surface-container-low relative bg-line-pattern">
  <SectionDecorations variant="grid" />
  ...
  <span className="section-label mb-4">Benefits</span>
  <!-- Replace card div with .card-hover -->
  {whyJoinItems.map(...) => (
    <div className="card-hover p-5 md:p-6 lg:p-8">...</div>
  )}
</section>
```

- [ ] **Step 5: Section 4 (Board) — Pattern A**

Replace board section labels with `.section-label`, keep bg as-is.

- [ ] **Step 6: Section 5 (CTA) — Keep as bg-primary, no changes needed**

- [ ] **Step 7: Add section-content wrapper to any section that has relative children with patterns**

All sections that use pattern classes need `relative` and their direct children need `section-content` for z-index stacking.

- [ ] **Step 8: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "refactor: Home — CSS classes, background alternation, decorative elements"
```

---

### Task 10: Refactor AboutPage.jsx — CSS classes, background alternation

**Files:**
- Modify: `src/pages/AboutPage.jsx`

- [ ] **Step 1: Add SectionDecorations import**

Add near other imports:
```jsx
import SectionDecorations from '../components/SectionDecorations'
```

- [ ] **Step 2: Replace all section labels**

Replace ALL instances of `text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary block mb-3 md:mb-4` with `section-label mb-4` (7 occurrences).

- [ ] **Step 3: Replace all buttons with .btn classes**

Line 169: Replace button with `.btn.btn-primary`:
```jsx
<Link to="/committees" className="btn btn-primary">Explore All Committees</Link>
```

Line 281: Replace:
```jsx
<Link className="btn btn-primary" to="/membership">Join IEEE</Link>
```

Line 286-291: Replace secondary button:
```jsx
<Link className="btn btn-secondary" to="/contact">Contact Us</Link>
```

- [ ] **Step 4: Replace card patterns with .card-hover**

Line 90: Replace 3 highlight cards with `.card-hover`:
```jsx
<div className="card-hover p-4 md:p-6">...</div>
```

Line 198: Replace ieeeHighlights cards with `.card-hover`:
```jsx
<div className="card-hover px-4 md:px-6 py-5 md:py-7">...</div>
```

Line 209: Replace ieeeResources cards with `.card-hover`:
```jsx
<div className="card-hover p-6 sm:p-8 md:p-10 group relative overflow-hidden">...</div>
```

- [ ] **Step 5: Apply background alternation**

- Section 1 (page hero): keep `bg-surface-container-lowest` (Pattern A)
- Section 2 (Committee Introduction): `bg-surface-container-low relative bg-dot-pattern` (Pattern B)
- Section 3 (What Is IEEE): `bg-surface` (Pattern A)
- Section 4 (Events): `bg-surface-container-lowest relative bg-line-pattern` (Pattern B)
- Section 5 (Next Step CTA): `bg-surface` (Pattern A)

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/AboutPage.jsx
git commit -m "refactor: AboutPage — CSS classes, background alternation"
```

---

### Task 11: Refactor ContactPage.jsx and JoinUsPage.jsx — use .form-input classes

**Files:**
- Modify: `src/pages/ContactPage.jsx`
- Modify: `src/pages/JoinUsPage.jsx`

- [ ] **Step 1: ContactPage.jsx — Replace form inputs**

Replace every:
```jsx
className="w-full border border-outline-variant/40 bg-surface px-4 py-3 outline-none focus:border-primary"
```
With:
```jsx
className="form-input"
```

Replace the `<select>` className:
```jsx
className="w-full border border-outline-variant/40 bg-surface px-4 py-3 outline-none focus:border-primary"
```
With:
```jsx
className="form-select"
```

Replace the `<textarea>` className:
```jsx
className="w-full border border-outline-variant/40 bg-surface px-4 py-3 outline-none focus:border-primary resize-none"
```
With:
```jsx
className="form-textarea"
```

Replace all `<label>` className:
```jsx
className="block text-sm font-semibold mb-2"
```
With:
```jsx
className="form-label"
```

Replace submit button:
```jsx
className="btn-wedge self-start bg-primary text-on-primary px-6 py-3 md:px-8 md:py-4 font-bold tracking-wide uppercase hover:bg-primary-container transition-all"
```
With:
```jsx
className="btn btn-primary self-start"
```

Replace section labels with `.section-label`.

- [ ] **Step 2: JoinUsPage.jsx — Same replacements**

Apply the same input/label/button replacements as ContactPage.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ContactPage.jsx src/pages/JoinUsPage.jsx
git commit -m "refactor: Contact and Join pages — use .form-input, .btn, .section-label classes"
```

---

### Task 12: Refactor EventsPage.jsx — CSS classes, background alternation

**Files:**
- Modify: `src/pages/EventsPage.jsx`

- [ ] **Step 1: Replace section labels with .section-label**

Line 56: Replace the label with:
```jsx
<span className="section-label mb-4">Events</span>
```

- [ ] **Step 2: Replace button with .btn class**

Line 150: Replace:
```jsx
<a href="/join-us" className="btn-wedge inline-block bg-primary text-on-primary px-6 py-2.5 md:px-8 md:py-3 font-bold tracking-wide uppercase">Join Us</a>
```
With:
```jsx
<Link to="/join-us" className="btn btn-primary">Join Us</Link>
```
(Also change `<a href="/join-us">` to `<Link to="/join-us">` and add `Link` import if needed — it's already imported via `react-router-dom`? Check imports.) Actually EventsPage doesn't import Link. Use `<a href="/join-us">` but with `.btn.btn-primary`.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/EventsPage.jsx
git commit -m "refactor: EventsPage — use .section-label, .btn classes"
```

---

### Task 13: Refactor CommitteesPage.jsx — CSS classes

**Files:**
- Modify: `src/pages/CommitteesPage.jsx`

- [ ] **Step 1: Replace section labels**

Replace the 3 instances of `text-[0.6875rem]...` with `.section-label mb-4`.

- [ ] **Step 2: Replace committee card with .card-hover**

Line 14: Change:
```jsx
className="bg-surface-container-low p-5 md:p-6 lg:p-8 transition-all duration-300 hover:bg-surface-container-lowest"
```
To:
```jsx
className="card-hover"
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/CommitteesPage.jsx
git commit -m "refactor: CommitteesPage — use .card-hover, .section-label"
```

---

### Task 14: Refactor remaining pages (GalleryPage, MembershipPage, CommitteeDetailPage, EventDetailPage) — CSS classes

**Files:**
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/pages/MembershipPage.jsx`
- Modify: `src/pages/CommitteeDetailPage.jsx`
- Modify: `src/pages/EventDetailPage.jsx`

- [ ] **Step 1: GalleryPage.jsx**

Replace the section label with `.section-label mb-4`.

- [ ] **Step 2: MembershipPage.jsx**

Replace all section labels (lines 168, 212, 233, 258) with `.section-label mb-4`.

Replace all benefit cards with `.card-hover`:
- Line 175: Change `className="... hover:bg-surface-container-lowest ..."` to `.card-hover`
- Line 195-197: Change buttons to use `.btn.btn-primary` or `.btn.btn-secondary`
- Line 217: Change benefit cards to `.card-hover`
- Line 238: Change testimonials to `.card-hover`
- Line 263: Change FAQ items to `.card-hover`
- Line 294: Change CTA button to `.btn.btn-primary`

- [ ] **Step 3: CommitteeDetailPage.jsx**

Replace section labels (line 184) with `.section-label mb-4`.

Replace StatCard-like divs (lines 151-168) with `.card-hover`.

Replace the hero description `<p>` that uses `text-xs font-bold uppercase tracking-[0.2em]` with `.section-label` equivalent (it's a different use case — a slogan, not a section label — so keep as-is but make consistent).

Replace "Back to Committees" button on line 107 with `.btn.btn-primary`.

- [ ] **Step 4: EventDetailPage.jsx**

Replace section labels (lines 104, 158, 180) with `.section-label mb-4`.

Replace StatCard with `.card` (no hover needed for stats).
- Line 19: Change `className="bg-surface-container-low p-6"` to `className="card p-6"`

Replace buttons with `.btn.btn-primary`.

- [ ] **Step 5: Build check**

Run: `npm run build`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/GalleryPage.jsx src/pages/MembershipPage.jsx src/pages/CommitteeDetailPage.jsx src/pages/EventDetailPage.jsx
git commit -m "refactor: remaining pages — use .card-hover, .section-label, .btn classes"
```

---

### Task 15: Final build verification

**Files:**
- Run build

- [ ] **Step 1: Clean build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: No errors (or only pre-existing warnings).

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup after visual consistency pass"
```
