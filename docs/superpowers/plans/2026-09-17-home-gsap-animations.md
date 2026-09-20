# Home Page GSAP Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate every Home page section with GSAP (authoritative & smooth, reveal-once + subtle scrub) with zero new dependencies.

**Architecture:** One shared `Reveal` client wrapper (`gsap.context` + `ScrollTrigger` + `gsap.matchMedia` reduced-motion guard) used by all Home sections; Hero owns a load timeline; Lenis is driven by `gsap.ticker` and notifies `ScrollTrigger`; async data triggers `ScrollTrigger.refresh()`. All motion uses `gsap.from` so SSR/no-JS stays visible.

**Tech Stack:** Next.js 16 (app router, client components), React 19, GSAP 3.15 (`gsap`, `gsap/ScrollTrigger`, `gsap/Draggable`), Lenis 1.3, Vitest + jsdom + Testing Library, ESLint.

---

## File map

- Create: `src/components/ui/Reveal.jsx` — shared reveal wrapper (props: `as`, `delay`, `y`, `staggerChildren`, `triggerStart`, `className`, `children`)
- Create: `src/components/ui/Reveal.test.jsx` — unit tests for Reveal
- Modify: `src/lib/LenisProvider.jsx` — drive Lenis via `gsap.ticker`, call `ScrollTrigger.update` on scroll
- Modify: `src/components/ui/Hero.jsx` — load timeline + stats count-up + hero scrub parallax
- Modify: `src/features/home/components/HomePage.jsx` — wrap sections in `Reveal`, add `ScrollTrigger.refresh()` effect on `ready`
- Modify: `src/features/home/components/RecruitmentBand.jsx` — wrap in `Reveal`
- Modify: `src/features/home/components/FeaturedEvent.jsx` — image clip reveal + text stagger + image scrub
- Modify: `src/features/home/components/PartnershipCarousel.jsx` — GSAP `xPercent` infinite loop + hover pause + reduced-motion fallback
- Modify: `src/components/ui/TechnicalResources.jsx` — header + cards stagger via `Reveal`
- Modify: `src/features/home/components/EventRecord.jsx` — add `data-reveal="record"` hook attribute only (parent staggers)
- Modify: `src/features/home/components/CommitteeDirectory.jsx` — change entrance ease `back.out(1.6)` → `power2.out` only
- Modify: `src/app/globals.css` — keep `.animate-section` + `marquee` keyframes as no-JS fallback; add `.reveal-will-change { will-change: transform, opacity; }`
- Touch (tests): `src/components/ui/Hero.test.jsx` — keep green, no selector breakage

---

### Task 1: Shared Reveal wrapper + tests

**Files:**
- Create: `src/components/ui/Reveal.jsx`
- Create: `src/components/ui/Reveal.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/ui/Reveal.test.jsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Reveal from './Reveal'

vi.mock('gsap', () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    from: vi.fn(),
    matchMedia: vi.fn(() => ({ add: vi.fn() })),
  },
}))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Reveal', () => {
  it('renders children visibly with no hidden CSS', () => {
    const { container } = render(<Reveal><span>Visible copy</span></Reveal>)
    expect(screen.getByText('Visible copy')).toBeTruthy()
    expect(container.firstElementChild.className).not.toMatch(/opacity-0/)
  })

  it('skips gsap.from under reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const gsap = (await import('gsap')).default
    render(<Reveal><span>Calm copy</span></Reveal>)
    expect(gsap.from).not.toHaveBeenCalled()
    expect(screen.getByText('Calm copy')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Reveal.test.jsx`
Expected: FAIL with "Failed to resolve import ./Reveal" (file does not exist yet).

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/components/ui/Reveal.jsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  y = 24,
  staggerChildren = null,
  triggerStart = 'top 80%',
  className = '',
  children,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const scope = ref.current
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = staggerChildren ? scope.querySelectorAll(staggerChildren) : [scope]
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.6,
          ease: 'power2.out',
          delay,
          stagger: staggerChildren ? 0.08 : 0,
          scrollTrigger: { trigger: scope, start: triggerStart, once: true },
        })
      })
    }, scope)
    return () => { ctx.revert() }
  }, [delay, y, staggerChildren, triggerStart])

  return <Tag ref={ref} className={className}>{children}</Tag>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Reveal.test.jsx`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Reveal.jsx src/components/ui/Reveal.test.jsx
git commit -m "feat: add shared GSAP Reveal wrapper"
```

---

### Task 2: Lenis + ScrollTrigger sync

**Files:**
- Modify: `src/lib/LenisProvider.jsx`
- Test: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx` (regression guard; Lenis has no unit test)

- [ ] **Step 1: Write the failing check (manual assertion script)**

```js
// /tmp/lenis-check.mjs — run with node, expects gsap ticker wiring in source
import { readFileSync } from 'node:fs'
const src = readFileSync('src/lib/LenisProvider.jsx', 'utf8')
if (!src.includes('ScrollTrigger.update')) throw new Error('missing ScrollTrigger.update wiring')
if (!src.includes('gsap.ticker')) throw new Error('missing gsap.ticker wiring')
console.log('lenis wiring ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/lenis-check.mjs`
Expected: FAIL with "missing ScrollTrigger.update wiring".

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/lib/LenisProvider.jsx
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LenisContext } from './lenisContext'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)
    gsap.ticker.lagSmoothing(0)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: !reduce,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  )
}
```

- [ ] **Step 4: Run check + regression to verify**

Run: `node /tmp/lenis-check.mjs`
Expected: `lenis wiring ok`

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: PASS (6 passed) — Lenis change breaks nothing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/LenisProvider.jsx
git commit -m "feat: sync Lenis with GSAP ScrollTrigger"
```

---

### Task 3: Hero entrance timeline + stats count-up + scrub

**Files:**
- Modify: `src/components/ui/Hero.jsx`
- Test: `src/components/ui/Hero.test.jsx` (must stay green; no new test file)

- [ ] **Step 1: Write the failing test (add to existing file)**

Add this test to `src/components/ui/Hero.test.jsx`:

```jsx
it('exposes stable animation hooks without hiding content', () => {
  const { container } = render(<Hero />)
  const section = container.querySelector('section')
  expect(section.querySelector('[data-hero="logo"]')).toBeTruthy()
  expect(section.querySelector('[data-hero="slogan"]')).toBeTruthy()
  expect(section.querySelector('[data-hero="copy"]')).toBeTruthy()
  expect(section.querySelectorAll('[data-hero="stat"]').length).toBe(2)
  expect(section.querySelector('[data-hero="ctas"]')).toBeTruthy()
  // Content visible pre-animation: no opacity-0 utility on hooks
  for (const el of section.querySelectorAll('[data-hero]')) {
    expect(el.className).not.toMatch(/opacity-0/)
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Hero.test.jsx`
Expected: FAIL — `querySelector('[data-hero="logo"]')` is null (hooks not added yet).

- [ ] **Step 3: Write minimal implementation**

Replace `src/components/ui/Hero.jsx` with:

```jsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { committees } from "@/features/committees/data/committees";

export default function Hero() {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !scopeRef.current) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = scopeRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power2.out" } });
      tl.from('[data-hero="logo"]', { opacity: 0, scale: 0.92 })
        .from('[data-hero="slogan"]', { opacity: 0, y: 24 }, "-=0.4")
        .from('[data-hero="copy"]', { opacity: 0, y: 24 }, "-=0.45")
        .from('[data-hero="stat"]', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4")
        .from('[data-hero="ctas"] > *', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4");
      scope.querySelectorAll('[data-hero="count"]').forEach((el) => {
        const target = Number(el.dataset.countTarget || 0);
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target, duration: 1.1, ease: "power2.out", delay: 0.5,
          onUpdate: () => { el.textContent = `+${Math.round(obj.value)}`; },
        });
      });
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to('[data-hero="bg"]', {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 1 },
        });
      });
    }, scope);
    return () => { ctx.revert(); };
  }, []);

  return (
    <section
      ref={scopeRef}
      aria-labelledby="home-title"
      className="grid min-h-[100svh] items-center overflow-hidden bg-inverse-surface pt-[var(--navbar-height)]"
    >
      <div data-hero="bg" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full border border-primary/20" />
        <div className="absolute -left-20 top-36 h-56 w-56 rounded-full border border-primary/15" />
      </div>
      <div className="container relative mx-auto flex max-w-4xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10">
        <img
          data-hero="logo"
          src="/logo.png"
          alt=""
          className="w-full max-w-[9rem] object-contain md:max-w-[11rem]"
        />
        <h1 id="home-title" className="sr-only">
          IEEE HITU Student Branch
        </h1>
        <p data-hero="copy" className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#9BA9B4] md:text-lg">
          The IEEE student branch at Helwan International Technological
          University — hands-on workshops, technical committees, and a community
          that learns and builds together.
        </p>
        <img
          data-hero="slogan"
          src="/slogan/ieeehitu_kit_white.png"
          alt="IEEE HITU Student Branch slogan"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="mx-auto mt-4 h-auto w-full max-w-xs object-contain"
        />
        <dl className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex flex-col" data-hero="stat">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Committees</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]" data-hero="count" data-count-target={committees.length}>
              +{committees.length}
            </dd>
          </div>
          <div className="flex flex-col" data-hero="stat">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Members</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]" data-hero="count" data-count-target={180}>
              +180
            </dd>
          </div>
        </dl>
        <div data-hero="ctas" className="mt-5 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/events">
            View events
          </Link>
          <Link className="btn btn-secondary" href="/join-us">
            Join the branch
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Hero.test.jsx`
Expected: PASS (5 passed: 4 existing + 1 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Hero.jsx src/components/ui/Hero.test.jsx
git commit -m "feat: animate hero with GSAP timeline and count-up"
```

---

### Task 4: HomePage Reveal wiring + ScrollTrigger refresh

**Files:**
- Modify: `src/features/home/components/HomePage.jsx`

- [ ] **Step 1: Write the failing test (jsdom hook check)**

```js
// /tmp/homepage-check.mjs
import { readFileSync } from 'node:fs'
const src = readFileSync('src/features/home/components/HomePage.jsx', 'utf8')
if (!src.includes('Reveal')) throw new Error('missing Reveal wiring')
if (!src.includes('ScrollTrigger.refresh')) throw new Error('missing ScrollTrigger.refresh')
console.log('homepage wiring ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/homepage-check.mjs`
Expected: FAIL with "missing Reveal wiring".

- [ ] **Step 3: Write minimal implementation**

Edits to `src/features/home/components/HomePage.jsx`:
1. Add imports at top:
```jsx
import { useEffect } from 'react'
import Reveal from '@/components/ui/Reveal'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
```
2. Inside `Home()` after the `remainingNextEvents` line, add:
```jsx
useEffect(() => {
  if (result.status !== 'ready' || typeof window === 'undefined') return
  const frame = requestAnimationFrame(() => { try { ScrollTrigger.refresh() } catch {} })
  return () => cancelAnimationFrame(frame)
}, [result.status, result.events.length])
```
3. Wrap sections (keep all existing conditionals, only wrap):
```jsx
{featuredEvent && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><Reveal><FeaturedEvent event={featuredEvent} fallback={result.source === 'fallback'} /></Reveal></section>}
```
```jsx
{remainingNextEvents.length > 0 && <section className="border-y border-outline-variant/30 bg-surface-container-low py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><Reveal staggerChildren="[data-reveal='record']"><h2 className="mb-6 text-2xl font-bold text-on-surface">Next events</h2>{remainingNextEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} />)}</Reveal></div></section>}
```
```jsx
{result.status === 'ready' && recentEvents.length > 0 && <section className="border-t border-outline-variant/30 bg-inverse-surface py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><Reveal staggerChildren="[data-reveal='record']"><h2 className="mb-6 text-2xl font-bold text-[#F0F4F8]">Recent events</h2>{recentEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} tone="inverse" />)}</Reveal></div></section>}
```
Full file keeps `Hero`, `RecruitmentBand`, `PartnershipCarousel`, `TechnicalResources`, `CommitteeDirectory` in the same order; only the three blocks above change plus imports + effect.

- [ ] **Step 4: Run check + full home tests to verify**

Run: `node /tmp/homepage-check.mjs`
Expected: `homepage wiring ok`

Run: `npx vitest run src/components/ui/Hero.test.jsx src/features/home/components/CommitteeDirectory.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/components/HomePage.jsx
git commit -m "feat: wire Home sections to Reveal with refresh"
```

---

### Task 5: RecruitmentBand + FeaturedEvent reveals

**Files:**
- Modify: `src/features/home/components/RecruitmentBand.jsx`
- Modify: `src/features/home/components/FeaturedEvent.jsx`

- [ ] **Step 1: Write the failing check**

```js
// /tmp/band-check.mjs
import { readFileSync } from 'node:fs'
const band = readFileSync('src/features/home/components/RecruitmentBand.jsx', 'utf8')
const feat = readFileSync('src/features/home/components/FeaturedEvent.jsx', 'utf8')
if (!band.includes('Reveal')) throw new Error('band missing Reveal')
if (!feat.includes('clip-path') && !feat.includes('clipPath')) throw new Error('featured missing clip reveal')
console.log('band+featured ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/band-check.mjs`
Expected: FAIL with "band missing Reveal".

- [ ] **Step 3: Write minimal implementation**

`RecruitmentBand.jsx` — add import and wrap inner container (keep early `if (!open) return null` untouched):
```jsx
import Reveal from '@/components/ui/Reveal'
```
```jsx
<div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
```
becomes:
```jsx
<Reveal className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
```
and its closing `</div>` becomes `</Reveal>` (keep section + wedge style identical).

`FeaturedEvent.jsx` — replace whole file with:
```jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

export default function FeaturedEvent({ event, fallback }) {
  const [imageFailed, setImageFailed] = useState(false)
  const scopeRef = useRef(null)
  const image = event.cardImage || event.coverImage

  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const scope = scopeRef.current
    const refresh = () => { try { ScrollTrigger.refresh() } catch {} }
    const ctx = gsap.context(() => {
      if (scope.querySelector('[data-featured="image"]')) {
        gsap.fromTo('[data-featured="image"]',
          { clipPath: 'inset(8% 0 8% 0 round 12px)', opacity: 0.4 },
          { clipPath: 'inset(0% 0 0% 0 round 12px)', opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: scope, start: 'top 80%', once: true } })
        const mm = gsap.matchMedia()
        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo('[data-featured="image"]', { yPercent: -6 }, { yPercent: 6, ease: 'none',
            scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1 } })
        })
      }
      gsap.from('[data-featured="text"] > *', {
        opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
      })
    }, scope)
    return () => { ctx.revert() }
  }, [])

  return (
    <div ref={scopeRef} className="border-l border-primary/40 pl-5">
      <h2 className="text-2xl font-bold text-on-surface">Featured next event</h2>
      {fallback && <p className="mt-3 text-sm text-on-surface-variant">Showing the static event archive while live event data is unavailable.</p>}
      <article className={`mt-6 grid items-center gap-8 ${image && !imageFailed ? 'md:grid-cols-2' : ''}`}>
        {image && !imageFailed && (
          <img data-featured="image" src={image} alt={event.title || 'Event'} className="aspect-[16/10] w-full rounded-xl object-cover" onError={() => setImageFailed(true)} onLoad={refresh} />
        )}
        {image && imageFailed && (
          <div role="img" aria-label={`${event.title || 'Event'} image unavailable`} className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-surface-container px-6 text-center font-semibold text-on-surface-variant">Image unavailable</div>
        )}
        <div data-featured="text">
          <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
          <h3 className="mt-3 text-3xl font-bold text-on-surface">{event.title}</h3>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{event.excerpt || event.location}</p>
          {event.slug && <Link aria-label={`Read ${event.title} event record`} className="btn btn-primary mt-6" href={`/events/${event.slug}`}>Read event record</Link>}
        </div>
      </article>
    </div>
  )
}
```

- [ ] **Step 4: Run check to verify it passes**

Run: `node /tmp/band-check.mjs`
Expected: `band+featured ok`

- [ ] **Step 5: Commit**

```bash
git add src/features/home/components/RecruitmentBand.jsx src/features/home/components/FeaturedEvent.jsx
git commit -m "feat: animate recruitment band and featured event"
```

---

### Task 6: PartnershipCarousel GSAP loop

**Files:**
- Modify: `src/features/home/components/PartnershipCarousel.jsx`

- [ ] **Step 1: Write the failing check**

```js
// /tmp/partners-check.mjs
import { readFileSync } from 'node:fs'
const src = readFileSync('src/features/home/components/PartnershipCarousel.jsx', 'utf8')
if (!src.includes('xPercent')) throw new Error('missing GSAP loop')
console.log('partners ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/partners-check.mjs`
Expected: FAIL with "missing GSAP loop".

- [ ] **Step 3: Write minimal implementation**

Replace motion logic in `src/features/home/components/PartnershipCarousel.jsx` (keep data fetching + null-return + markup identical, add GSAP):

```jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

export default function PartnershipCarousel() {
  const [result, setResult] = useState({ partners: [], source: null, status: 'loading' })
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useEffect(() => {
    let active = true
    fetchPartnersResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ partners: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (result.status !== 'ready' || result.partners.length === 0) return
    if (typeof window === 'undefined' || !trackRef.current) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const track = trackRef.current
    gsap.from(track, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: track, start: 'top 85%', once: true } })
    tweenRef.current = gsap.to(track, { xPercent: -50, duration: 30, repeat: -1, ease: 'none' })
    return () => { tweenRef.current?.kill(); tweenRef.current = null }
  }, [result.status, result.partners.length])

  if (result.status !== 'ready' || result.partners.length === 0) return null

  const row = isClone => (
    <ul className="partners-row" aria-hidden={isClone}>
      {result.partners.map(partner => (
        <li key={partner._id ? partner._id : partner.name} className={`partner-tile${partner.logoDark ? ' partner-tile--dark' : ''}`} aria-label={partner.name}>
          {partner.logo ? <img src={partner.logo} alt={partner.name} /> : <span>{partner.name}</span>}
        </li>
      ))}
    </ul>
  )
  return (
    <section className="border-b border-outline-variant/30 bg-surface-container-low py-16" aria-labelledby="partnerships-heading">
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <p className="section-label">Community partnerships</p>
        <h2 id="partnerships-heading" className="mt-3 text-3xl font-bold text-on-surface">Partners we build with</h2>
      </div>
      <div className="carousel-viewport mt-10">
        <div
          className="carousel-track"
          ref={trackRef}
          style={{ animation: 'none' }}
          onMouseEnter={() => tweenRef.current?.pause()}
          onMouseLeave={() => tweenRef.current?.play()}
          onFocus={() => tweenRef.current?.pause()}
          onBlur={() => tweenRef.current?.play()}
        >
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}
```

Note: `style={{ animation: 'none' }}` disables the CSS `marquee` keyframes when GSAP owns the loop; the keyframes stay in `globals.css` as the no-JS fallback.

- [ ] **Step 4: Run check to verify it passes**

Run: `node /tmp/partners-check.mjs`
Expected: `partners ok`

- [ ] **Step 5: Commit**

```bash
git add src/features/home/components/PartnershipCarousel.jsx
git commit -m "feat: drive partners marquee with GSAP"
```

---

### Task 7: TechnicalResources + EventRecord batch reveals + CSS hint

**Files:**
- Modify: `src/components/ui/TechnicalResources.jsx`
- Modify: `src/features/home/components/EventRecord.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing check**

```js
// /tmp/resources-check.mjs
import { readFileSync } from 'node:fs'
const res = readFileSync('src/components/ui/TechnicalResources.jsx', 'utf8')
const rec = readFileSync('src/features/home/components/EventRecord.jsx', 'utf8')
const css = readFileSync('src/app/globals.css', 'utf8')
if (!res.includes('Reveal')) throw new Error('resources missing Reveal')
if (!rec.includes('data-reveal')) throw new Error('record missing data-reveal')
if (!css.includes('.reveal-will-change')) throw new Error('missing css hint')
console.log('resources ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/resources-check.mjs`
Expected: FAIL with "resources missing Reveal".

- [ ] **Step 3: Write minimal implementation**

`TechnicalResources.jsx` — add import, wrap header + list (keep links/markup identical):
```jsx
'use client'
```
at top (file currently has no directive; add it), plus:
```jsx
import Reveal from './Reveal'
```
Wrap:
```jsx
<Reveal>
  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Global network / local action</p>
  ...header grid stays inside...
</Reveal>
<Reveal staggerChildren="[data-reveal='card']">
  <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
    {resources.map(...) // identical, but add data-reveal="card" to each <li>
  </ul>
</Reveal>
```
Each `<li>` gains `data-reveal="card"` alongside its existing className.

`EventRecord.jsx` — one-line change, add hook attribute:
```jsx
<article data-reveal="record" className={`border-t py-5 ${inverse ? 'border-white/20' : 'border-outline-variant/40'}`}>
```
(rest of file identical).

`globals.css` — append at end (keep everything else untouched):
```css
.reveal-will-change { will-change: transform, opacity; }
```

- [ ] **Step 4: Run check to verify it passes**

Run: `node /tmp/resources-check.mjs`
Expected: `resources ok`

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/TechnicalResources.jsx src/features/home/components/EventRecord.jsx src/app/globals.css
git commit -m "feat: reveal resources and event records"
```

---

### Task 8: Committee easing unify + refresh + full verification

**Files:**
- Modify: `src/features/home/components/CommitteeDirectory.jsx` (easing token + refresh on ready)

- [ ] **Step 1: Write the failing check**

```js
// /tmp/const-check.mjs
import { readFileSync } from 'node:fs'
const src = readFileSync('src/features/home/components/CommitteeDirectory.jsx', 'utf8')
if (src.includes('back.out')) throw new Error('still uses back.out')
if (!src.includes("ease: 'power2.out'")) throw new Error('missing unified ease')
console.log('constellation ok')
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node /tmp/const-check.mjs`
Expected: FAIL with "still uses back.out".

- [ ] **Step 3: Write minimal implementation**

In `src/features/home/components/CommitteeDirectory.jsx`, make exactly two changes (everything else untouched):

1. Add `ScrollTrigger` to the existing gsap import line:
```jsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
```
(`gsap.registerPlugin(ScrollTrigger, Draggable)` line stays as-is.)

2. Change the entrance ease:
```jsx
gsap.from('[data-const="node"]', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
```
becomes:
```jsx
gsap.from('[data-const="node"]', { scale: 0, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
```

3. In the data-loading effect, refresh triggers after committees resolve:
```jsx
fetchCommitteesResult().then(data => {
  if (active) {
    setResult({ ...data, status: 'ready' })
    requestAnimationFrame(() => { try { ScrollTrigger.refresh() } catch {} })
  }
})
```
(Draggable, click-swallow, edges, tooltip logic untouched.)

- [ ] **Step 4: Run full verification**

Run: `npx vitest run`
Expected: all suites PASS (Hero, AnimatedSection, CommitteeDirectory, Reveal, others).

Run: `npm run lint`
Expected: no errors (warnings ok only if pre-existing).

Run: `npm run build`
Expected: `✓ Compiled successfully` / Next build completes.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/components/CommitteeDirectory.jsx
git commit -m "feat: unify constellation easing to power2.out"
```

---

## Manual QA (post-plan, not a task)

- Desktop 1440 + mobile 390, light/dark toggle, keyboard-only tab through Hero CTAs → cards → badges
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → all content visible, no marquee, no scrub
- Slow 3G + broken image on featured event → fallback div, text still animates
- Recruitment band open + closed states
