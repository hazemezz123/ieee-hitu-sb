# Hero Logo Drawing Animation Design

## Goal
Implement a vector stroke-drawing animation for the IEEE HITU Student Branch logo in the Hero section, seamlessly choreographed into the section entrance timeline using GSAP.

## Requirements
1. **Vector Artwork Component (`LogoMark.jsx`)**:
   - Extract the vector geometry from `public/logov2.svg` (`viewBox="0 0 1095 1095"`).
   - Separate the mark into two clear semantic SVG paths:
     - Blue diamond/kite mark (`data-logo="diamond"`): `#00629b` stroke/fill.
     - Gold orbital arch (`data-logo="arch"`): `#dcb656` stroke/fill.
   - Maintain accessible label `aria-label="IEEE HITU Student Branch logo"`, `role="img"`.
   - Scalable through standard Tailwind width classes (`w-full max-w-[9rem] md:max-w-[11rem]`).

2. **Choreographed Drawing Animation (`Hero.jsx`)**:
   - Dynamically compute each path length using `getTotalLength()` (with fallback to default if unavailable).
   - Set up initial state with transparent fills (`fill-opacity: 0`), path `strokeDasharray`, and offset equal to the path length.
   - Timeline sequence in `Hero.jsx`:
     - Both paths draw their strokes simultaneously (`strokeDashoffset: 0`) over ~1.2s using `power2.out` with a 0.15s stagger.
     - As strokes finish, fill opacity fades in from 0 to 1 over ~0.5s.
     - Slogan, description copy, statistics, and CTAs animate in directly following the fill fade-in.
   - **Reduced Motion Support**:
     - When `prefers-reduced-motion: reduce` is active, stroke drawing is bypassed, displaying the full static mark with fills directly.

3. **Verification**:
   - Update `Hero.test.jsx` to verify `<LogoMark />` rendering and presence of vector paths.
   - Guard against missing `getTotalLength()` in jsdom environments.
   - All tests passing, linter clean, Next.js build succeeding.
