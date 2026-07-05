# Continuous Canvas Background for Home Page

## Overview

Extend the HeroBackground across the entire Home page. One fixed-position canvas instance behind all sections. Sections become transparent, floating above the animated workspace.

## Architecture

- `HeroBackground` moves from `Hero.jsx` to `Home.jsx` as a single fixed instance
- Canvas uses `position: fixed` → always fills viewport regardless of scroll
- All page content rendered in a `relative z-10` wrapper above the canvas
- Scroll parallax: canvas elements offset by `scrollY * 0.12` for subtle depth

## Component Changes

### HeroBackground.jsx
- Canvas class from `absolute` → `fixed`
- Resize from `parentElement.getBoundingClientRect()` → `window.innerWidth/Height`
- Add `scroll` event listener; apply `scrollY * 0.12` offset to all draw layers
- Mouse parallax still works on top of scroll parallax

### Hero.jsx
- Remove `import HeroBackground`
- Remove `<div className="absolute inset-0 z-0"><HeroBackground /></div>`
- Remove `bg-[#05070B]` from section class
- Content unchanged — text already uses hardcoded light colors

### Home.jsx
- Add `import HeroBackground` and render at top: `<div className="fixed inset-0 z-0"><HeroBackground /></div>`  
- Wrap all content in `<div className="relative z-10">`
- Remove section background classes: `bg-surface-container-low`, `bg-surface-container-lowest`, `bg-primary`, `bg-dot-pattern`, `bg-line-pattern`
- Section text: `text-on-surface` → `text-[#F0F4F8]`, `text-on-surface-variant` → `text-[#9BA9B4]`
- CTA banner: wrap in `.card` container instead of `bg-primary text-on-primary`
- Keep `.card`, `.card-hover` as-is (their own backgrounds provide contrast)

## Edge Cases

- **Reduced motion**: Scroll parallax disabled, static frame
- **Mobile**: No mouse tracking, connection lines, or cursor glow — same reduction as before
- **Resize**: Canvas resizes to viewport, regenerates scene  
- **Theme toggle**: Canvas stays dark regardless; home page text uses hardcoded light colors (sections on non-home pages are unaffected)
