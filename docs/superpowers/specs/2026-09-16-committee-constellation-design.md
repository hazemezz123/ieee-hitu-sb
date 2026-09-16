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

- **Directory entry**: one `Open directory` link to `/committees` under the section
  header (no center badge — the panel holds only nodes and wiring).
- **9 technical committees** wired as a mesh on the left half, in 1000×600 panel
  units (HTML: left=x/10 %, top=y/6 %; SVG: raw units):
  `cs` (80,180), `ai` (220,132), `embedded` (380,168),
  `cyber-defensive` (100,330), `web` (260,312), `cyber-offensive` (120,468),
  `robotics` (300,438), `automations` (220,540), `ds` (430,375).
- **4 non-technical committees** wired as a mesh on the right half:
  `pr-oc` (640,180), `multi-media` (810,126), `marketing` (900,312),
  `hr-td` (740,468).
- **Edges** (SVG lines, `vector-effect="non-scaling-stroke"`): 14 intra-mesh links
  — technical: cs–ai, ai–embedded, embedded–web, web–ds,
  web–robotics, cyber-defensive–web, cyber-defensive–cyber-offensive,
  cyber-offensive–robotics, robotics–automations, cyber-offensive–automations;
  non-technical: pr-oc–multi-media, multi-media–marketing, pr-oc–hr-td,
  marketing–hr-td. The two-cluster wiring encodes the real technical /
  non-technical split from `committees.js`.
- **Nodes**: 44px mobile (`w-11 h-11`), 56px (`sm:w-14 sm:h-14`) above — circular badges,
  `outline-variant` border, `CommitteeIcon` in primary. Committee name always
  visible as a small label beneath the badge. Nodes are HTML absolutely-positioned
  links (`left/top` in %, `translate(-50%,-50%)`); edges live in one SVG layer
  (`viewBox="0 0 1000 600"`, `preserveAspectRatio="none"`) using the same map ×10.
- **Backdrop**: faint blueprint grid (existing `radial-gradient` dot pattern idiom)
  on a `surface-container-low` panel with `primary-fixed-dim` accents.

## 3. Motion and interaction

- **Entrance**: GSAP `fromTo` scale 0→1, stagger 0.05, triggered on scroll into view
  (ScrollTrigger, already a dependency and used in `navbar.jsx`). Runs once.
- **Ambient**: edges carry a traveling dash via CSS
  (`.const-edge`: `stroke-dasharray: 6 8`, `edge-flow` keyframes, 3s linear infinite).
  The dash flow never pauses — hover states change only stroke color/opacity,
  never `animation`.
- **Drag and drop**: badges are GSAP Draggable (`type: x,y`, bounded to the panel,
  `cursor-grab` / `active:cursor-grabbing`, `touch-pan-y` so vertical page scroll
  still works on touch). A capture-phase click guard swallows the navigation click
  only when a real drag moved the badge (>4px); plain clicks and keyboard
  activation always navigate. Arrangement is in-memory and resets on reload.
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

Mobile panel is fixed `h-[520px]` with the header stacked above in column flow;
`md+` panel is `aspect-[5/3]`. The panel always spans the full section width
(`w-full`, no max-width cap). Badges are 44px (`w-11 h-11`)
on mobile, 56px (`sm:w-14 sm:h-14`) above; labels are 10px mobile / 12px above.
Mesh edges render `hidden sm:block`. Nearest
node-neighbor clearance was verified against the §2 map at 312px and 1088px
panel widths.

## 5. Accessibility

- Every node is a real `<Link href={`/committees/${slug}`}>` with
  `aria-label="<Name> committee"` and a visible `focus-visible:ring-2` indicator.
- Tooltip and edge SVG are `aria-hidden`; the list is a `<ul aria-label="Committees">`.
- No auto-playing motion that cannot be disabled: entrance runs once, ambient dash
  is decorative and motion-safe, nodes never move after entrance.

## 6. Files to change

1. `src/features/home/components/CommitteeDirectory.jsx` — rewrite (keep `use client`,
   fetch states, fallback notice, heading, header `Open directory` link).
2. `src/features/home/components/CommitteeDirectory.test.jsx` — new contract: 13 nodes
   with correct hrefs, header `Open directory`, hover highlights exactly the
   connected edges, reduced-motion renders statically, error state shows no panel.
3. `src/app/globals.css` — append `.const-*` styles (grid backdrop, edge, edge-active,
   edge-flow keyframes). No new palette tokens; cyan accent `#00B5E2` only.

## 7. Verification

`npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`,
then `npm test`, `npx eslint` on touched files, `npm run build`. All must pass.
Existing `recruitment.test.jsx` Home-ordering assertions (heading presence and
section order) must keep passing — the section keeps its heading and position.
