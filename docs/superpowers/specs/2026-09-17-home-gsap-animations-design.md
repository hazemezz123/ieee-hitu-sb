# Home Page GSAP Animations — Design Spec

Date: 2026-09-17
Status: Approved (user approved all 4 sections)
Approach: A — Central GSAP reveal system + Hero timeline (no new deps)

## 1. Goal

Animate the entire Home page (`src/app/page.js` → `src/features/home/components/HomePage.jsx`) with GSAP, covering all 7 sections, in the authoritative & smooth personality that matches `DESIGN.md` (Architectural Blueprint, tonal authority, extreme whitespace).

Success: every section has entrance motion + subtle scroll life, 60fps on desktop/mobile, content always visible without JS/GSAP, `prefers-reduced-motion` respected, existing tests stay green.

## 2. Scope (user: Every section animated)

Sections in order:

1. `Hero` (`src/components/ui/Hero.jsx`) — dark navy, logo, slogan art, copy, stats (+committees, +180), 2 CTAs
2. `RecruitmentBand` (conditional on heads form `isOpen`) — 135° wedge gradient
3. `FeaturedEvent` — featured next event, image + text grid
4. `PartnershipCarousel` — community partnerships marquee
5. `TechnicalResources` — dark section, 5 resource cards
6. Next events list (`EventRecord` x N) + Recent events list (inverse tone)
7. `CommitteeDirectory` — constellation, already GSAP + Draggable (keep, unify easing)

Out of scope: navbar/footer animation, other routes, dark-mode token changes, backend changes.

## 3. Motion personality (user: Authoritative & smooth)

Tokens (all sections share):

- Entrance: `opacity 0 → 1`, `y 24 → 0`, `duration 0.6`, `ease power2.out`
- Stagger: `0.08` for groups (cards, records, CTAs)
- Hero load timeline: slightly longer (`0.7`), same ease, no bounce
- Hover: brightness/background shifts only (per DESIGN.md); no lift/translate on cards
- Props animated: `transform` + `opacity` only (plus `clip-path` for image reveals, which is composited cheaply enough for 1-2 images)
- No `back.out`, no elastic, no rotation on entrance

## 4. Scroll behavior (user: Reveal + subtle scrub)

- Default: reveal once on enter — `ScrollTrigger { trigger, start: 'top 80%', once: true }`
- Scrub (subtle, desktop only `min-width: 768px` via `gsap.matchMedia`):
  - Hero decorative circles: `yPercent 10 → -10`, `scrub: 1`
  - `FeaturedEvent` image: `yPercent -6 → 6`, `scrub: 1`
- No pinning. No scrubbed text timelines.
- Lenis sync: `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t * 1000))` with `gsap.ticker.lagSmoothing(0)` (update `src/lib/LenisProvider.jsx`, keep `lenis.destroy()` cleanup).

## 5. Architecture

New shared primitive (no new npm deps; `gsap@^3.15.0` already installed):

- `src/components/ui/Reveal.jsx` (client):
  - Props: `as`, `delay`, `y`, `staggerChildren` (selector string), `triggerStart='top 80%'`
  - Impl: `gsap.context` scoped to ref, `gsap.matchMedia`:
    - `(prefers-reduced-motion: reduce)` → do nothing (content visible)
    - default → `gsap.from(targets, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', ... })` with per-element ScrollTrigger once
  - Cleanup: `ctx.revert()` + kill ScrollTriggers in scope
  - Uses `gsap.from` exclusively so SSR/no-JS renders visible content (never CSS `opacity: 0`)
- `HomePage` owns one inline `useEffect`: calls `ScrollTrigger.refresh()` inside `requestAnimationFrame` when `result.status` flips to `ready` (no separate hook file to keep the diff small)
- `Hero`: dedicated load timeline in `gsap.context` on mount (not scroll-triggered): logo (`scale 0.92→1, opacity`), slogan, copy, stats (count-up on the numeric part only, `+` stays static in markup; `gsap.to` with `snap` updating `textContent`), CTAs stagger. Guard `matchMedia('(prefers-reduced-motion: reduce)')` → skip timeline.
- `CommitteeDirectory`: keep existing `ScrollTrigger` + `Draggable` logic; change entrance ease to `power2.out` for consistency; keep click-swallow after drag; keep `once: true`
- `FeaturedEvent` image reveal: `clip-path: inset(8% 0 8% 0 round 12px)` → `inset(0% 0 0% 0 round 12px)`, `duration 0.8`, `ease power2.out`, once.
- `PartnershipCarousel`: replace CSS `marquee` keyframes with GSAP `xPercent: 0 → -50`, `duration 30`, `repeat: -1`, `ease: 'none'`; duplicate row kept for seamless loop; `hover` → `tween.pause()/play()`; reduced-motion → static row with `overflow-x: auto`
- `AnimatedSection.jsx`: keep as fallback for non-Home routes; Home migrates to `Reveal` (do not delete file)
- Lenis sync: `lenis.on('scroll', ScrollTrigger.update)` + drive Lenis via `gsap.ticker` (replace the local `requestAnimationFrame` loop); cleanup removes the ticker callback and calls `lenis.destroy()`; reduced-motion → construct Lenis with `smoothWheel: false`.
- Registration: `gsap.registerPlugin(ScrollTrigger)` once per client module (guard `typeof window !== 'undefined'`)

File touch list (max):

- Add: `src/components/ui/Reveal.jsx`, `src/components/ui/Reveal.test.jsx`
- Edit: `src/lib/LenisProvider.jsx`, `src/components/ui/Hero.jsx`, `src/features/home/components/HomePage.jsx`, `src/features/home/components/RecruitmentBand.jsx`, `src/features/home/components/FeaturedEvent.jsx`, `src/features/home/components/PartnershipCarousel.jsx`, `src/components/ui/TechnicalResources.jsx`, `src/features/home/components/EventRecord.jsx` (add `data-reveal` hooks only), `src/features/home/components/CommitteeDirectory.jsx` (easing only), `src/app/globals.css` (keep `.animate-section`, add `.reveal-will-change` hint only; no new keyframes except keeping `marquee` as no-JS fallback)

## 6. Data flow

- `HomePage` → `useEventsResult()` (`ready/loading/error`, `source: live|fallback`) → `nextEvents[3]`, `recentEvents[3]`
- `CommitteeDirectory` → `fetchCommitteesResult()` → 13 nodes filtered by slug
- `PartnershipCarousel` → `fetchPartnersResult()` → null-render when empty (no trigger created)
- `RecruitmentBand` → `fetchRecruitmentForm('heads')` → null when closed
- After each async `ready`: `ScrollTrigger.refresh()` so triggers below the fold recalc (images also call `refresh` on `onLoad`)
- `fallback` banners stay text-only, no animation dependency

## 7. Edge cases & error handling

- GSAP load failure / SSR: content visible (all `gsap.from`, no CSS-hidden initial state)
- `prefers-reduced-motion: reduce`: skip all tweens/timelines/marquee/scrub; Lenis keeps native scroll (`smoothWheel: false` fallback or destroy)
- Mobile `<768px`: reveals stay, scrub parallax disabled via `matchMedia`
- Image `onError` → fallback div; tween targets text container only, never assumes image exists
- `RecruitmentBand` closed → component returns null, no ScrollTrigger created
- Draggable badges: existing drag-click swallow kept; entrance tween targets `[data-const=node]` scale only during entrance (per CSS comment, do not add Tailwind scale there)
- High contrast / focus: no motion on `:focus-visible` ring; tooltips unchanged
- Theme: animations theme-agnostic (no color tweens)

## 8. Testing

- `vitest run`: keep `Hero.test.jsx`, `CommitteeDirectory.test.jsx`, `AnimatedSection.test.jsx` green; update selectors for new `data-reveal` attributes
- New `Reveal.test.jsx`: renders children visible by default; with mocked `matchMedia(reduce)` asserts no `gsap.from` call; asserts `ctx.revert` on unmount
- `eslint .` clean; `next build` passes
- Manual: desktop 1440 + mobile 390, light/dark, keyboard tab through CTAs/cards/badges, DevTools reduced-motion emulation, slow-3G image-fail case

## 9. Decisions log

- Scope Q → Every section animated
- Personality Q → Authoritative & smooth
- Scroll Q → Reveal + subtle scrub
- Approach → A (central reveal, no `@gsap/react`), B/C rejected (extra dep / pinning weight)
- Design review → 4/4 sections approved 2026-09-17
