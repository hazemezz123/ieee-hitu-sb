# Committee Directory Redesign — Blueprint Constellation

Date: 2026-09-16
Status: Approved design, awaiting implementation plan
Scope: Home page `CommitteeDirectory` section only. `CommitteesPage`, data model, and routing are unchanged.

## 1. Goal

Replace the GSAP dual-orbit showcase in `src/features/home/components/CommitteeDirectory.jsx`
with a calm, on-brand constellation centerpiece. Priority, per stakeholder: fresh spectacle
over information density, with every committee one tap away.

## 2. Layout

A single scaling panel (`aspect-[5/3]`, max-w-6xl) containing:

- **Branch hub** at (50%, 50%): dark `bg-inverse-surface` circular badge showing the live
  committee count, the word `Committees`, and one `Open directory` link to `/committees`.
- **9 technical committees** wired as a mesh on the left half:
  `cs` (8,30), `ai` (22,22), `embedded` (36,30), `cyber-defensive` (10,55),
  `web` (26,52), `cyber-offensive` (12,78), `robotics` (28,74),
  `automations` (22,92), `ds` (40,60). Coordinates are x%, y% of the panel.
- **4 non-technical committees** wired as a mesh on the right half:
  `pr-oc` (64,30), `multi-media` (80,22), `marketing` (90,52), `hr-td` (74,78).
- **Edges** (SVG lines, `vector-effect="non-scaling-stroke"`): hub to every node (13),
  plus intra-mesh links — technical: cs–ai, ai–embedded, embedded–web, web–ds,
  web–robotics, cyber-defensive–web, cyber-defensive–cyber-offensive,
  cyber-offensive–robotics, robotics–automations, cyber-offensive–automations;
  non-technical: pr-oc–multi-media, multi-media–marketing, pr-oc–hr-td,
  marketing–hr-td. The two-cluster wiring encodes the real technical /
  non-technical split from `committees.js`.
- **Nodes**: 56px (`w-14 h-14`) circular badges, `surface-container-lowest` fill,
  `outline-variant` border, `CommitteeIcon` in primary. Committee name always
  visible as a small label beneath the badge. Nodes are HTML absolutely-positioned
  links (`left/top` in %, `translate(-50%,-50%)`); edges live in one SVG layer
  (`viewBox="0 0 1000 600"`, `preserveAspectRatio="none"`) using the same map ×10.
- **Backdrop**: faint blueprint grid (existing `radial-gradient` dot pattern idiom)
  on a `surface-container-low` panel with `primary-fixed-dim` accents.

## 3. Motion and interaction

- **Entrance**: GSAP `fromTo` scale 0→1, stagger 0.05, triggered on scroll into view
  (ScrollTrigger, already a dependency and used in `navbar.jsx`). Runs once.
- **Ambient**: hub slow pulse (GSAP yoyo); edges carry a traveling dash via CSS
  (`.const-edge`: `stroke-dasharray: 6 8`, `edge-flow` keyframes, 3s linear infinite).
- **Hover/focus**: node scales to 1.15 with cyan glow
  (`shadow 0 0 28px -4px rgba(0,181,226,0.55)`, border `cyan-300`); connected edges
  switch to `.const-edge-active` (cyan stroke, full opacity); all other edges dim to
  25% opacity. A tooltip above the node shows `shortDescription` (CSS
  group-hover/group-focus-visible fade+rise; `aria-hidden` to avoid double naming).
- **Damping**: none needed — there is no continuous rotation. Hover state is driven
  by React `hoveredSlug` state, so it is inherently stable.
- **Reduced motion**: when `prefers-reduced-motion` matches, skip the GSAP entrance
  (render final state) and rely on the global CSS rule that neutralizes the
  edge-flow animation.

## 4. Responsive behavior

The panel scales as one unit, so mobile needs no separate layout. Safeguards:
cross-mesh edges hidden below `sm` (keep hub spokes); node labels shrink to
`text-[11px]`; badges stay 56px (≥44px tap targets, no overlap at 360px per the
coordinate map: nearest-neighbor distance ≥9% of panel width ≈ 29px edge-to-edge
at 320px content width — verified against the map in section 2).

## 5. Accessibility

- Every node is a real `<Link href={`/committees/${slug}`}>` with
  `aria-label="<Name> committee"` and a visible `focus-visible:ring-2` indicator.
- Tooltip and edge SVG are `aria-hidden`; the list is a `<ul aria-label="Committees">`.
- No auto-playing motion that cannot be disabled: entrance runs once, ambient dash
  is decorative and motion-safe, nodes never move after entrance.

## 6. Files to change

1. `src/features/home/components/CommitteeDirectory.jsx` — rewrite (keep `use client`,
   fetch states, fallback notice, heading, hub count/link contract).
2. `src/features/home/components/CommitteeDirectory.test.jsx` — new contract: 13 nodes
   with correct hrefs, hub count + `Open directory`, hover highlights exactly the
   connected edges, reduced-motion renders statically, error state shows no panel.
3. `src/app/globals.css` — append `.const-*` styles (grid backdrop, edge, edge-active,
   edge-flow keyframes). No new palette tokens; cyan accent `#00B5E2` only.

## 7. Verification

`npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`,
then `npm test`, `npx eslint` on touched files, `npm run build`. All must pass.
Existing `recruitment.test.jsx` Home-ordering assertions (heading presence and
section order) must keep passing — the section keeps its heading and position.
