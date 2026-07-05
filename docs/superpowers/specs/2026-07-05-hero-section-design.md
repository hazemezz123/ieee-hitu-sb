# Hero Section — Immersive Canvas Background

## Overview

Redesign the Home page Hero section with an immersive, full-canvas animated background featuring a futuristic engineering aesthetic. The background is built as a reusable `HeroBackground` component independent of the content.

## Requirements

- Full viewport height (100vh)
- Very dark background (#05070B), always dark regardless of theme toggle
- No gradients or mesh gradients
- Engineering blueprint aesthetic: grid, connected nodes, particles, wireframe shapes
- Mouse interaction: subtle parallax, node glow on proximity
- 60 FPS target, `requestAnimationFrame`-based
- Content stays readable above the canvas

## Architecture

### Approach: Full Canvas Rendering (Approach 1)

All animated elements rendered on a single HTML `<canvas>` element. One `requestAnimationFrame` loop drives the entire scene.

### Files

| File | Purpose |
|------|---------|
| `src/components/HeroBackground.jsx` | Canvas-based animated background (reusable) |
| `src/components/Hero.jsx` | Updated Hero — uses HeroBackground, content unchanged |
| `src/pages/Home.jsx` | No changes needed (already imports Hero) |

### `HeroBackground` — Canvas Layers (bottom to top)

1. **Solid Fill** — `#05070B` (no theme adaptation)
2. **Engineering Grid** — 0.5px thin lines in blueprint-teal `rgba(74, 139, 175, 0.04)`, ~40px spacing
3. **Wireframe Shapes** — 3–5 outlined hexagons, circles, triangles, stroke `rgba(74, 139, 175, 0.08)`, drifting + rotating slowly
4. **Connected Nodes** — ~30 nodes at grid-like positions, connected by lines when ≤180px apart; line opacity fades with distance (0.02–0.06)
5. **Floating Particles** — ~100 tiny dots (r=1, `rgba(200, 220, 240, 0.3)`), drifting ~0.3px/frame
6. **Cursor Glow** — Soft radial gradient `rgba(74, 139, 175, 0.06)` → transparent, follows mouse
7. **Parallax** — All layers shift ±12px based on mouse, lerp-smoothed

### Node Animations
- Nodes pulse size (0.6→1.0→0.6, ~3s cycle)
- Cursor proximity ≤200px increases node glow 2×
- Connection lines shimmer (brightness pulse traveling along the line)

### Content Layout (unchanged)

```
[IEEE Logo — float animation, brightened for dark bg]
"Beyond Labels."
"Beyond Limits."  ← primary (#7BAED4) color
"The official student branch of IEEE at Heliopolis International Technological University—connecting students to a global community of engineers, innovators, and problem-solvers."
[Explore Standards] [Learn More]  ← buttons
[ScrollIndicator]
```

- Content sits at `z-10`, canvas at `z-0`
- Canvas has `pointer-events-none`
- Semi-transparent overlay at bottom edge for section transition

### Reusability

`HeroBackground` fills its parent container. Usage from any page:

```jsx
<div className="absolute inset-0">
  <HeroBackground />
</div>
```

No props. No CSS dependencies. Works on any background.

### Performance

- Single `requestAnimationFrame` loop (no multiple timers)
- High-DPI via `devicePixelRatio` scaling
- Pre-allocated arrays — no allocations in the draw loop
- Mouse events with `{ passive: true }`
- Mobile reduction: 40 particles, no cursor glow, no connection lines

### Changes from Existing Hero

- Replace `DotField` and `DecorativeShapes` with `HeroBackground` canvas component
- Add short description paragraph below tagline
- Buttons and scroll indicator remain identical
- Remove gradient wedge overlays (not needed on dark bg)

## Edge Cases

- **Reduced motion**: `matchMedia('(prefers-reduced-motion: reduce)')` → static frame, no animation loop
- **Mobile/touch**: Disable cursor tracking entirely, reduce particles, skip connection lines
- **Resize**: Canvas resizes with parent, regenerates node positions on width/height change above threshold
- **Theme toggle**: Hero stays dark regardless — manually set text colors instead of CSS variable tokens
