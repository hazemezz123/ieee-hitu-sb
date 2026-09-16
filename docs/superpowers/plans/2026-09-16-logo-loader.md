# Logo Draw Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play a one-per-session GSAP stroke-draw intro of the logov2.svg mark on the homepage, then fade out and reveal the page.

**Architecture:** `LogoMark.jsx` inlines the two SVG paths as JSX (GSAP must own the nodes); `LogoLoader.jsx` measures them at runtime, draws diamond-then-arch with a GSAP timeline, fades fills in, exits and unmounts; `HomePage.jsx` mounts it first. Session gating, reduced-motion skip, and a failsafe keep it from ever trapping the page.

**Tech Stack:** Next.js App Router, React, GSAP 3 core, vitest + Testing Library.

---

## File map

- Run: `npm install -S gsap` (records `gsap@^3` in `package.json` + lockfile).
- Create `src/components/ui/LogoMark.jsx` — inlined artwork, forwards refs.
- Create `src/components/ui/LogoMark.test.jsx` — two paths, brand fills, viewBox.
- Create `src/components/ui/LogoLoader.jsx` — overlay lifecycle + GSAP timeline.
- Create `src/components/ui/LogoLoader.test.jsx` — draw-then-unmount, session skip, reduced-motion skip.
- Modify `src/features/home/components/HomePage.jsx` — mount `<LogoLoader />` first (no test changes: jsdom cannot measure paths, so the loader dismisses instantly there and existing home tests are unaffected).

## Conventions to follow

- Guard every `localStorage`/`window`/`document` touch (private-mode pattern used across the codebase).
- `npm test -- <path>` per task; `npx eslint` on touched JS/JSX; finish with full `npm test` + `npm run build`.
- Commit after each task, staging only that task's files.

---

### Task 1: Install GSAP, inline artwork, test it

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Create: `src/components/ui/LogoMark.test.jsx`
- Create: `src/components/ui/LogoMark.jsx`

- [ ] **Step 1: Install GSAP**

Run: `npm install -S gsap`
Expected: exit 0, `gsap` appears under `dependencies` in `package.json`

- [ ] **Step 2: Write the failing test**

```jsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LogoMark from './LogoMark'

describe('LogoMark', () => {
  it('renders the two brand paths', () => {
    const { container } = render(<LogoMark />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].getAttribute('fill')).toBe('#0e487f')
    expect(paths[1].getAttribute('fill')).toBe('#dcb656')
    expect(container.querySelector('svg').getAttribute('viewBox')).toBe('0 0 1095 1095')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/components/ui/LogoMark.test.jsx`
Expected: FAIL with "Failed to resolve import './LogoMark'" (file does not exist yet)

- [ ] **Step 4: Write minimal implementation** — create `src/components/ui/LogoMark.jsx` exactly as below, copying each `d="..."` value verbatim from `public/logov2.svg` (path 1 then path 2, in order; convert only the attribute names as shown, never the geometry)

```jsx
export default function LogoMark({ className = '', diamondRef, archRef }) {
  return (
    <svg viewBox="0 0 1095 1095" className={className} aria-hidden="true" focusable="false">
      <path ref={diamondRef} d="PASTE_PATH_1_D_VERBATIM_FROM_PUBLIC_LOGOV2_SVG" fill="#0e487f" fillRule="evenodd" stroke="#0e487f" strokeWidth="0.25" strokeLinejoin="round" />
      <path ref={archRef} d="PASTE_PATH_2_D_VERBATIM_FROM_PUBLIC_LOGOV2_SVG" fill="#dcb656" fillRule="evenodd" stroke="#dcb656" strokeWidth="0.25" strokeLinejoin="round" />
    </svg>
  )
}
```

- [ ] **Step 5: Verify the pasted geometry byte-for-byte against the source**

Run:

```powershell
python3 -c "
import re
svg = open('public/logov2.svg', encoding='utf-8').read()
jsx = open('src/components/ui/LogoMark.jsx', encoding='utf-8').read()
svg_paths = re.findall(r'd=\"(.*?)\"', svg)
jsx_paths = re.findall(r'd=\"(.*?)\"', jsx)
assert len(svg_paths) == 2 and len(jsx_paths) == 2, (len(svg_paths), len(jsx_paths))
assert svg_paths == jsx_paths, 'path data differs from source'
print('paths match:', [len(p) for p in jsx_paths])
"
```

Expected: prints `paths match: [...]` with two lengths, exit 0. If the assertion fires, re-paste the `d` values; do not hand-edit path data.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/components/ui/LogoMark.test.jsx`
Expected: PASS (1 passed)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/ui/LogoMark.jsx src/components/ui/LogoMark.test.jsx
git commit -m "feat: inline logov2 artwork with gsap dependency"
```

---

### Task 2: Loader overlay with GSAP timeline + tests

**Files:**
- Create: `src/components/ui/LogoLoader.test.jsx`
- Create: `src/components/ui/LogoLoader.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LogoLoader from './LogoLoader'

beforeEach(() => {
  if (typeof window.SVGPathElement === 'undefined') window.SVGPathElement = function () {}
  window.SVGPathElement.prototype.getTotalLength = () => 120
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  delete window.SVGPathElement.prototype.getTotalLength
  delete window.matchMedia
  vi.restoreAllMocks()
})

describe('LogoLoader', () => {
  it('draws the mark then unmounts', async () => {
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.getByRole('img', { name: /logo animation/i })).toBeTruthy()
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
    }, { timeout: 4000 })
  })
  it('skips when the session already saw it', () => {
    window.sessionStorage.setItem('ieee-hitu-loader-seen', '1')
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
  })
  it('skips on reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    render(<LogoLoader durationScale={0.01} />)
    expect(screen.queryByRole('img', { name: /logo animation/i })).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/ui/LogoLoader.test.jsx`
Expected: FAIL with "Failed to resolve import './LogoLoader'" (file does not exist yet)

- [ ] **Step 3: Write minimal implementation** — create `src/components/ui/LogoLoader.jsx` exactly as below

```jsx
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import LogoMark from './LogoMark'

const LOADER_SEEN_KEY = 'ieee-hitu-loader-seen'
const DRAW_SECONDS = 1.2
const FILL_SECONDS = 0.6
const HOLD_SECONDS = 0.3
const EXIT_SECONDS = 0.5
const FAILSAFE_MS = 5000
const STROKES = ['#0e487f', '#dcb656']

function measure(path) {
  try {
    const len = path.getTotalLength()
    if (Number.isFinite(len) && len > 0) return len
  } catch { /* non-rendering environments have no measurable geometry */ }
  return 0
}

function shouldSkip() {
  try {
    if (window.sessionStorage.getItem(LOADER_SEEN_KEY)) return true
  } catch { /* private mode: play the loader every visit */ }
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function LogoLoader({ durationScale = 1 }) {
  const [done, setDone] = useState(() => shouldSkip())
  const rootRef = useRef(null)
  const diamondRef = useRef(null)
  const archRef = useRef(null)

  useLayoutEffect(() => {
    if (done) return
    const root = rootRef.current
    const paths = [diamondRef.current, archRef.current].filter(Boolean)
    const lengths = paths.map(measure)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- unmeasurable geometry means nothing to animate; dismiss once
    if (lengths.some(len => len === 0)) { setDone(true); return }
    const ctx = gsap.context(() => {
      paths.forEach((path, i) => {
        gsap.set(path, {
          stroke: STROKES[i],
          strokeWidth: 6,
          strokeDasharray: lengths[i],
          strokeDashoffset: lengths[i],
          fillOpacity: 0,
        })
      })
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => setDone(true) })
      tl.to(paths[0], { strokeDashoffset: 0, duration: DRAW_SECONDS * durationScale })
        .to(paths[1], { strokeDashoffset: 0, duration: DRAW_SECONDS * durationScale }, '-=0.3')
        .to(paths, { fillOpacity: 1, duration: FILL_SECONDS * durationScale })
        .to(root, { duration: HOLD_SECONDS * durationScale })
        .to(root, { autoAlpha: 0, duration: EXIT_SECONDS * durationScale })
    }, root)
    const failsafe = setTimeout(() => setDone(true), Math.max(FAILSAFE_MS * durationScale, 100))
    try { window.sessionStorage.setItem(LOADER_SEEN_KEY, '1') } catch { /* private mode: replay next visit */ }
    return () => { clearTimeout(failsafe); ctx.revert() }
  }, [done, durationScale])

  if (done) return null
  return (
    <div ref={rootRef} role="img" aria-label="IEEE HITU Student Branch logo animation" className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface">
      <LogoMark className="h-auto w-[min(70vw,320px)]" diamondRef={diamondRef} archRef={archRef} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/ui/LogoLoader.test.jsx`
Expected: PASS (3 passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/LogoLoader.jsx src/components/ui/LogoLoader.test.jsx
git commit -m "feat: add gsap logo draw loader overlay"
```

---

### Task 3: Mount the loader on the homepage

**Files:**
- Modify: `src/features/home/components/HomePage.jsx` (add import + first-child mount only)

- [ ] **Step 1: Edit `src/features/home/components/HomePage.jsx`** — add the import after the Hero import, and the element as the first child (nothing else in the file changes)

```jsx
import LogoLoader from '@/components/ui/LogoLoader'
```

```jsx
  return (
    <div className="page-enter">
      <LogoLoader />
      <Hero />
```

- [ ] **Step 2: Run the home test file to prove no regression**

Run: `npm test -- src/features/join-us/components/recruitment.test.jsx`
Expected: PASS (all tests; the loader dismisses instantly under jsdom where paths are unmeasurable, so existing assertions are unaffected)

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/HomePage.jsx
git commit -m "feat: mount logo loader on homepage"
```

---

### Task 4: Full verification and live audit

**Files:** none (verification only; fix-and-commit only on a real finding)

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: all test files pass, 0 failures

- [ ] **Step 2: Lint touched files**

Run: `npx eslint src/components/ui/LogoMark.jsx src/components/ui/LogoMark.test.jsx src/components/ui/LogoLoader.jsx src/components/ui/LogoLoader.test.jsx src/features/home/components/HomePage.jsx`
Expected: 0 errors

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: exit 0 with the route table printed and no errors

- [ ] **Step 4: Live browser audit** (dev server + homepage, fresh profile with empty session storage)

1. First visit plays the draw once (~3s: diamond, then arch, fills fade, overlay exits) and the homepage is fully interactive after.
2. Client-side navigation away and back, plus full reload, skip the loader.
3. `prefers-reduced-motion` shows no overlay and no console errors.
4. No console errors or failed requests in any of the above.
5. 375px and 1280px widths: overlay covers the viewport, mark scales, no horizontal overflow.

- [ ] **Step 5: Commit** (only if Step 4 required fixes; otherwise record "verified, no changes" and finish)
