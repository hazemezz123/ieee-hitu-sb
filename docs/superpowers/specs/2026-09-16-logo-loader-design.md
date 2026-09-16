# Logo Draw Loader Design

## Goal

Play a GSAP stroke-draw animation of `public/logov2.svg` as a full-screen intro
loader overlay on the homepage, then reveal the page.

## Decisions (approved)

- Placement: homepage only, overlay above all content, once per browser session.
- Artwork: brand blue diamond (`#0e487f`) + gold arch (`#dcb656`) on dark navy,
  fills fading in after the draw.
- Library: GSAP core (user choice). No DrawSVG (paid), no new React wrapper.

## Source asset

`public/logov2.svg`: viewBox `0 0 1095 1095`, two compound `<path>` elements
(blue mark + gold arch, fills with `evenodd`, hairline same-color strokes).
Path data is copied verbatim into JSX; no geometry is altered.

## Architecture

- New `src/components/ui/LogoMark.jsx`: the two paths inlined as JSX
  (an `<img>` cannot expose path nodes to GSAP). Accepts `className` and
  exposes the path nodes via refs. Single responsibility: artwork.
- New `src/components/ui/LogoLoader.jsx` (`'use client'`): fixed `inset-0`
  overlay at `z-[100]` (navbar is `z-50`), `bg-inverse-surface`, responsive mark
  at `w-[min(70vw,320px)]`, single GSAP timeline built in `useLayoutEffect`
  with `gsap.context` + revert on unmount. Single responsibility: overlay lifecycle.
- Mounted as the first element inside `src/features/home/components/HomePage.jsx`
  (the route file `src/app/page.js` stays thin per repo convention), above all
  existing content. No other page changes.

## Animation sequence (~3s total)

1. Measure each path with `getTotalLength()` at runtime; set matching
   `stroke-dasharray`/`stroke-dashoffset`, strokes in brand colors at a visible
   width, `fill-opacity` 0.
2. Diamond draws (1.2s), arch draws with slight overlap, fills fade in (0.6s),
   0.3s hold, overlay fades out (0.5s), component unmounts on complete.
3. Durations scale by an optional `durationScale` prop (default 1, tests use 0.01).

## Behavior and fallbacks

- Session gating: `sessionStorage` flag skips the loader on repeat views.
- `prefers-reduced-motion`: static mark, immediate dismiss.
- 5s failsafe unmount so the overlay can never trap the page.
- No JavaScript: no loader renders, content stays accessible.
- All storage/DOM access guarded with try/catch (private-mode pattern).

## Testing

- Stub `SVGPathElement.prototype.getTotalLength` (jsdom does not implement it).
- Tests: overlay draws then unmounts (scaled durations), session skip,
  reduced-motion skip.
- Full `npm test`, `npx eslint` on touched files, `npm run build`, plus a live
  browser check of timing, exit, and no console errors.

## Out of scope

- Replacing the static navbar/hero/footer logos with the animated mark.
- Scroll-triggered replays, sound, theme-dependent loader variants.
- Any change to `logov2.svg` geometry or brand colors.
