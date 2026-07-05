# Continuous Home Background Implementation Plan

**Goal:** Move HeroBackground to Home.jsx as a fixed canvas behind all transparent sections, with scroll parallax.

**Architecture:** One fixed-position canvas at Home.jsx root. Sections become transparent. Text colors adjusted for dark canvas.

**Tech Stack:** React 19, Canvas 2D API

---

### Task 1: Update HeroBackground.jsx — fixed positioning + scroll parallax

**Files:**
- Modify: `src/components/HeroBackground.jsx`

- [ ] **Step 1: Change canvas class from absolute to fixed**

Change `className="absolute inset-0 z-0 pointer-events-none"` → `className="fixed inset-0 z-0 pointer-events-none"`

- [ ] **Step 2: Change resize() to use viewport dimensions**

Replace `const rect = canvas.parentElement.getBoundingClientRect()` with `const rect = { width: window.innerWidth, height: window.innerHeight }`

- [ ] **Step 3: Add scroll tracking variable and listener**

```jsx
let scrollPos = 0
// after isMobile, reducedMotion declarations:
let scrollParallax = 0

function onScroll() {
  scrollPos = window.scrollY
}
// inside resize(), before setupScene()
window.addEventListener('scroll', onScroll, { passive: true })
```

- [ ] **Step 4: Apply parallax offset in draw()**

After computing `currentOX/currentOY`, add:
```js
scrollParallax += (scrollPos * 0.12 - scrollParallax) * 0.05
```

Then pass `scrollParallax` as additional offset to all drawing functions. Change:
- `drawGrid(ctx, ww, hh, ox, oy)` → `drawGrid(ctx, ww, hh, ox, oy + scrollParallax)`
- Same for shapes, nodes, connections, particles, glow

- [ ] **Step 5: Clean up scroll listener in return**

Add `window.removeEventListener('scroll', onScroll)` in the cleanup function

- [ ] **Step 6: Update mouse event to work with fixed canvas**

Since the canvas is fixed, `canvas.parentElement.getBoundingClientRect()` would give wrong results. Change onMouseMove to use `window.innerWidth/Height` for centering math instead.

Actually, since the canvas is fixed and fills the viewport, `parentElement` is the body. `getBoundingClientRect()` would return `{left:0, top:0}`. But to be safe, use:
```js
mouseX = e.clientX
mouseY = e.clientY
const cx = w / 2
const cy = h / 2
targetOX = ((mouseX - cx) / cx) * PARALLAX_STRENGTH
targetOY = ((mouseY - cy) / cy) * PARALLAX_STRENGTH
```

- [ ] **Step 7: Verify build**

Run: `cd ieee-app && npx vite build`
Expected: Build succeeds

---

### Task 2: Update Hero.jsx — remove background

**Files:**
- Modify: `src/components/Hero.jsx`

- [ ] **Step 1: Remove import and usage of HeroBackground, remove bg color**

Remove `import HeroBackground from "./HeroBackground";`
Remove `<div className="absolute inset-0 z-0"><HeroBackground /></div>`
Change `bg-[#05070B]` to `bg-transparent` on the section

- [ ] **Step 2: Verify build**

Run: `cd ieee-app && npx vite build`
Expected: Build succeeds

---

### Task 3: Update Home.jsx — single background + transparent sections

**Files:**
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Add HeroBackground import and fixed container at top**

Add `import HeroBackground from '../components/HeroBackground'`

After `<PageLayout variant="home">`, add:
```jsx
<div className="fixed inset-0 z-0">
  <HeroBackground />
</div>
<div className="relative z-10">
```

And close the wrapper div before `</PageLayout>`.

- [ ] **Step 2: Remove section background classes from all sections**

For each section:
- Remove `bg-surface-container-low`, `bg-surface-container-lowest`, `bg-primary`
- Remove `bg-dot-pattern`, `bg-line-pattern`
- Keep `relative` (already present on most)

- [ ] **Step 3: Update section-level text colors for dark canvas**

All `text-on-surface` on headings/descriptions → `text-[#F0F4F8]`
All `text-on-surface-variant` on descriptions → `text-[#9BA9B4]`

Leave card-internal text as-is (`.card`, `.card-hover` provide their own backgrounds)

- [ ] **Step 4: Restyle CTA banner**

Replace `bg-primary text-on-primary` section with a card wrapper:
```jsx
<section className="py-20 md:py-24 lg:py-32">
  <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
    <div className="card p-8 md:p-12 lg:p-16">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-4 text-on-surface">
        Ready to Become Part of IEEE HITU?
      </h2>
      <p className="text-base md:text-lg lg:text-xl opacity-80 mb-8 max-w-2xl mx-auto text-on-surface-variant">
        Join the student branch and start your journey with a global community
        of engineers, innovators, and problem-solvers.
      </p>
      <Link to="/membership" className="btn btn-primary">Join IEEE Today</Link>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Verify build**

Run: `cd ieee-app && npx vite build`
Expected: Build succeeds

---

### Task 4: Visual verification

- [ ] **Step 1: Start dev server**

Run: `cd ieee-app && npx vite`
Expected: Dev server starts, open browser

- [ ] **Step 2: Verify background is continuous**

Scroll through the entire Home page. The grid, nodes, particles, and shapes should be visible behind all sections. No seams.

- [ ] **Step 3: Verify parallax on scroll**

Background elements shift subtly (slower than content) while scrolling.

- [ ] **Step 4: Verify mouse interaction**

Move mouse — nodes glow, subtle parallax shift on top of scroll parallax.

- [ ] **Step 5: Verify text readability**

All headings, descriptions, cards readable against the dark canvas.

- [ ] **Step 6: Verify mobile**

Reduce browser width < 768px. No mouse tracking. Reduced particles. All content responsive.
