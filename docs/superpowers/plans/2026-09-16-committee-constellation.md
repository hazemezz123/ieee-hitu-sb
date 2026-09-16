# Committee Constellation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Home page GSAP orbit in `CommitteeDirectory` with a static Blueprint Constellation (hub + 13 wired nodes) per `docs/superpowers/specs/2026-09-16-committee-constellation-design.md`.

**Architecture:** One self-contained component rewrite. Node positions live as a module-level coordinate map in the component file; edges render in a single SVG layer using the same map; hover highlight is React state; entrance motion is one GSAP context with ScrollTrigger, fully skipped under reduced motion. No data-model, routing, or HomePage changes.

**Tech Stack:** Next.js App Router (`'use client'`), React 19, Tailwind CSS v4, GSAP 3 + ScrollTrigger, Vitest + Testing Library.

---

## File structure

- Modify: `src/features/home/components/CommitteeDirectory.jsx` — constellation panel, hub, nodes, edges, motion.
- Modify: `src/features/home/components/CommitteeDirectory.test.jsx` — new render/interaction contract.
- Modify: `src/app/globals.css` — append `.const-*` styles, delete the dead `.orbit-*` block.
- Modify: `docs/superpowers/specs/2026-09-16-committee-constellation-design.md` — amend §2 coordinates and §4 responsive rules (see Task 5).

No other files change. `src/features/committees/data/committees.js`, `CommitteeIcon.jsx`, and `HomePage.jsx` are read-only sources.

## Reference data (read-only)

`committees.js` exports 13 entries `{ name, slug, category, categoryLabel, memberCount, shortDescription }`. Technical slugs: `ai`, `cyber-defensive`, `cyber-offensive`, `web`, `automations`, `robotics`, `embedded`, `cs`, `ds`. Non-technical: `pr-oc`, `multi-media`, `marketing`, `hr-td`. Test mocks must keep this shape (`shortDescription` is used for tooltips).

Existing test conventions to follow: mock `next/link` as `<a>`, mock `@/features/committees/hooks/useCommittees` via `vi.hoisted(() => ({ fetchCommitteesResult: vi.fn() }))`, resolve `{ committees, source: 'remote' }` in `beforeEach`.

---

### Task 1: Constellation test contract (failing)

**Files:**
- Modify: `src/features/home/components/CommitteeDirectory.test.jsx`

- [ ] **Step 1: Write the failing test file**

Replace the whole file with:

```jsx
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CommitteeDirectory from './CommitteeDirectory'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

const REAL_SLUGS = ['cs', 'ai', 'embedded', 'cyber-defensive', 'web', 'cyber-offensive', 'robotics', 'automations', 'ds', 'pr-oc', 'multi-media', 'marketing', 'hr-td']
const committees = REAL_SLUGS.map((slug, i) => ({
  slug,
  name: `Committee ${i}`,
  category: i < 9 ? 'technical' : 'non-technical',
  categoryLabel: i < 9 ? 'Technical' : 'Non-Technical',
  shortDescription: `About committee ${i}.`,
}))

const { fetchCommitteesResult } = vi.hoisted(() => ({ fetchCommitteesResult: vi.fn() }))

vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult }))

beforeEach(() => {
  fetchCommitteesResult.mockReset()
  fetchCommitteesResult.mockResolvedValue({ committees, source: 'remote' })
})

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('CommitteeDirectory constellation', () => {
  it('renders 13 wired nodes as accessible links with hub count and directory entry', async () => {
    const { container } = render(<CommitteeDirectory />)

    expect(await screen.findByRole('heading', { name: /committee directory/i })).toBeTruthy()
    for (const committee of committees) {
      const link = screen.getByRole('link', { name: `${committee.name} committee` })
      expect(link.getAttribute('href')).toBe(`/committees/${committee.slug}`)
      expect(link.querySelector('svg')).toBeTruthy()
    }
    expect(screen.getByText('13')).toBeTruthy()
    expect(screen.getByRole('link', { name: /open directory/i }).getAttribute('href')).toBe('/committees')
    // 13 hub spokes + 14 mesh edges
    expect(container.querySelectorAll('[data-edge]').length).toBe(27)
  })

  it('shows the committee description in a tooltip per node', async () => {
    const { container } = render(<CommitteeDirectory />)
    await screen.findByTestId('committee-constellation')

    const tips = container.querySelectorAll('.const-tooltip')
    expect(tips.length).toBe(13)
    expect(tips[0].textContent).toMatch(/About committee 0/)
  })

  it('highlights only the hovered node edges', async () => {
    const { container } = render(<CommitteeDirectory />)
    await screen.findByTestId('committee-constellation')

    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Committee 0 committee' }))
    const active = container.querySelectorAll('.const-edge-active')
    expect(active.length).toBeGreaterThan(0)
    for (const edge of active) {
      // Committee 0 has slug 'cs'; every active edge must touch it
      expect(edge.getAttribute('data-edge')).toMatch(/(^|\s)cs(\s|$)/)
    }
    fireEvent.mouseLeave(screen.getByRole('link', { name: 'Committee 0 committee' }))
    expect(container.querySelectorAll('.const-edge-active').length).toBe(0)
  })

  it('renders the final layout statically under reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    render(<CommitteeDirectory />)

    expect(await screen.findByTestId('committee-constellation')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Committee 0 committee' })).toBeTruthy()
  })

  it('reports load failure without the panel', async () => {
    fetchCommitteesResult.mockRejectedValueOnce(new Error('offline'))
    render(<CommitteeDirectory />)

    await waitFor(() => expect(screen.getByText(/could not be loaded/i)).toBeTruthy())
    expect(screen.queryByTestId('committee-constellation')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: FAIL — `findByTestId('committee-constellation')` times out (current code renders `committee-orbit`), tooltip/edge assertions fail.

- [ ] **Step 3: Commit the failing contract**

```bash
git add src/features/home/components/CommitteeDirectory.test.jsx
git commit -m "test: constellation contract for committee directory (failing)"
```

---

### Task 2: Static constellation (panel, hub, nodes, edges, CSS)

**Files:**
- Modify: `src/features/home/components/CommitteeDirectory.jsx`
- Modify: `src/app/globals.css` (append `.const-*`, delete old `.orbit` block at the file end)

- [ ] **Step 1: Rewrite the component (no motion yet)**

Replace the whole `CommitteeDirectory.jsx` with:

```jsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import Skeleton from '@/components/ui/Skeleton'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

// Panel coordinate space: 1000 x 600. HTML nodes use left = x/10 %, top = y/6 %;
// SVG edges use raw units with viewBox="0 0 1000 600" preserveAspectRatio="none".
const HUB = { x: 500, y: 300 }

const NODES = [
  { slug: 'cs', x: 80, y: 180 },
  { slug: 'ai', x: 220, y: 132 },
  { slug: 'embedded', x: 380, y: 168 },
  { slug: 'cyber-defensive', x: 100, y: 330 },
  { slug: 'web', x: 260, y: 312 },
  { slug: 'cyber-offensive', x: 120, y: 468 },
  { slug: 'robotics', x: 300, y: 438 },
  { slug: 'automations', x: 220, y: 540 },
  { slug: 'ds', x: 430, y: 375 },
  { slug: 'pr-oc', x: 640, y: 180 },
  { slug: 'multi-media', x: 810, y: 126 },
  { slug: 'marketing', x: 900, y: 312 },
  { slug: 'hr-td', x: 740, y: 468 },
]

const MESH_EDGES = [
  ['cs', 'ai'], ['ai', 'embedded'], ['embedded', 'web'], ['web', 'ds'],
  ['web', 'robotics'], ['cyber-defensive', 'web'],
  ['cyber-defensive', 'cyber-offensive'], ['cyber-offensive', 'robotics'],
  ['robotics', 'automations'], ['cyber-offensive', 'automations'],
  ['pr-oc', 'multi-media'], ['multi-media', 'marketing'],
  ['pr-oc', 'hr-td'], ['marketing', 'hr-td'],
]

export default function CommitteeDirectory() {
  const [result, setResult] = useState({ committees: [], source: null, status: 'loading' })
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ committees: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  const bySlug = Object.fromEntries(result.committees.map(c => [c.slug, c]))
  const nodes = NODES.filter(n => bySlug[n.slug])
  const edges = [
    ...nodes.map(n => (['hub', n.slug])),
    ...MESH_EDGES.filter(([a, b]) => bySlug[a] && bySlug[b]),
  ]
  const pointOf = slug => (slug === 'hub' ? HUB : NODES.find(n => n.slug === slug))

  const edgeClass = ([a, b]) => {
    const base = 'const-edge'
    if (!hovered) return base
    const touched = a === hovered || b === hovered
    if (touched) return `${base} const-edge-active`
    return `${base} const-edge-dim`
  }

  return (
    <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12" aria-labelledby="committee-directory-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Branch structure</p>
        <h2 id="committee-directory-heading" className="mt-3 text-3xl font-bold text-on-surface">Committee directory</h2>
        <p className="mt-3 text-on-surface-variant">Thirteen crews, one blueprint — pick a path into the branch.</p>
      </div>

      {result.status === 'loading' && (
        <div role="status" className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-4">
          <span className="sr-only">Loading committee directory...</span>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-14 rounded-full" />
          ))}
        </div>
      )}

      {result.status === 'error' && <p className="mt-10 text-center text-sm text-on-surface-variant">Committee directory could not be loaded.</p>}

      {result.status === 'ready' && (
        <div className="mt-10 flex flex-col items-center gap-8">
          {result.source === 'fallback' && <p className="mx-auto w-full max-w-3xl bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static committee archive while live committee data is unavailable.</p>}
          {/* Central hub: stacked above the panel on mobile, overlaid center at md+ */}
          <div data-const="hub" className="z-10 flex flex-col items-center gap-1 rounded-full bg-inverse-surface px-7 py-5 text-center ring-1 ring-cyan-300/30 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:px-8">
            <p className="text-3xl font-black leading-none text-[#F0F4F8] md:text-4xl">{result.committees.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9BA9B4]">committees</p>
            <Link className="mt-2 text-xs font-bold uppercase tracking-widest text-white underline underline-offset-4 hover:no-underline" href="/committees">Open directory</Link>
          </div>

          <div data-testid="committee-constellation" className="const-panel relative h-[520px] w-full max-w-[34rem] md:h-auto md:max-w-none md:aspect-[5/3]">
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
              {edges.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  data-edge={`${a} ${b}`}
                  x1={pointOf(a).x} y1={pointOf(a).y} x2={pointOf(b).x} y2={pointOf(b).y}
                  vectorEffect="non-scaling-stroke"
                  className={`${edgeClass([a, b])}${a !== 'hub' && b !== 'hub' ? ' hidden sm:block' : ''}`}
                />
              ))}
            </svg>
            <ul aria-label="Committees" className="absolute inset-0">
              {nodes.map(node => {
                const committee = bySlug[node.slug]
                return (
                  <li key={node.slug} className="absolute" style={{ left: `${node.x / 10}%`, top: `${node.y / 6}%`, transform: 'translate(-50%, -50%)' }}>
                    <Link
                      href={`/committees/${committee.slug}`}
                      aria-label={`${committee.name} committee`}
                      onMouseEnter={() => setHovered(node.slug)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(node.slug)}
                      onBlur={() => setHovered(null)}
                      className="group relative flex w-11 flex-col items-center gap-1 sm:w-14"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-primary transition-all duration-200 group-hover:scale-115 group-hover:border-cyan-300 group-hover:shadow-[0_0_28px_-4px_rgba(0,181,226,0.55)] group-focus-visible:scale-115 group-focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-14 sm:w-14">
                        <CommitteeIcon slug={committee.slug} className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>
                      <span className="whitespace-nowrap text-[10px] font-semibold text-on-surface sm:text-xs">{committee.name}</span>
                      <span aria-hidden="true" className="const-tooltip pointer-events-none absolute -top-2 left-1/2 z-20 w-40 -translate-x-1/2 -translate-y-full whitespace-normal rounded-lg border border-outline-variant bg-inverse-surface px-3 py-2 text-center text-xs font-normal text-white opacity-0 transition-all duration-200 group-hover:-translate-y-[calc(100%+4px)] group-hover:opacity-100 group-focus-visible:-translate-y-[calc(100%+4px)] group-focus-visible:opacity-100">{committee.shortDescription}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
```

Notes for the worker: the hub `md:absolute` anchors to the nearest positioned ancestor — the outer flex column is static, so add `md:relative` to nothing; instead the panel is the anchor only if the hub is inside it. The hub above is a sibling of the panel, so on md+ it would anchor to the section. Fix: wrap hub + panel in `<div className="relative w-full">`? Simpler: keep the outer `mt-10 flex flex-col items-center gap-8` wrapper and give it `md:relative md:block md:gap-0`, making the hub `md:absolute` anchor to it while the panel fills it. The panel is `md:max-w-none`, so wrapper ≈ panel box. Apply this: outer wrapper className `"mt-10 flex flex-col items-center gap-8 md:relative md:block"`, hub keeps `md:absolute md:left-1/2 md:top-1/2 ...`, panel adds `md:mt-0`. On md the flex becomes block: hub absolute (out of flow), panel static full width. Mobile keeps column stacking. Edit the snippet accordingly when writing the file.

- [ ] **Step 2: Append constellation CSS, delete dead orbit CSS**

In `src/app/globals.css`, delete the whole `.orbit` / `.orbit-node` / `.orbit-ring-spin` / `@keyframes orbit-spin` block at file end, append:

```css
/* Committee constellation (home directory): blueprint grid panel, wired SVG
   edges with traveling dash, tooltip cards. GSAP owns scale on
   [data-const="node"] during entrance only — do not add Tailwind scale there. */
.const-panel {
  background-image: radial-gradient(circle, var(--color-outline-variant) 1px, transparent 1.5px);
  background-size: 22px 22px;
}
.const-edge {
  stroke: var(--color-outline-variant);
  stroke-width: 1.5;
  opacity: 0.7;
  stroke-dasharray: 6 8;
  animation: const-edge-flow 3s linear infinite;
}
.const-edge-active {
  stroke: #00b5e2;
  opacity: 1;
  animation: none;
  filter: drop-shadow(0 0 6px rgba(0, 181, 226, 0.8));
}
.const-edge-dim {
  opacity: 0.18;
  animation: none;
}
@keyframes const-edge-flow {
  to { stroke-dashoffset: -28; }
}
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: PASS for render/edges/tooltip/hover/reduced-motion/error tests (motion not yet added; entrance runs only in browsers).

- [ ] **Step 4: Commit**

```bash
git add src/features/home/components/CommitteeDirectory.jsx src/app/globals.css
git commit -m "feat: blueprint constellation directory with edge highlight"
```

---

### Task 3: GSAP entrance, hub pulse, reduced-motion guard

**Files:**
- Modify: `src/features/home/components/CommitteeDirectory.jsx`

- [ ] **Step 1: Add motion (test already covers the static fallback)**

Apply this diff to the component file:

1. Update imports:
```jsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
```
2. Inside the component, after the fetch `useEffect`, add:
```jsx
const scopeRef = useRef(null)

useEffect(() => {
  if (result.status !== 'ready') return
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {
    gsap.from('[data-const="node"]', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
    gsap.from('[data-const="edge"]', { opacity: 0, duration: 0.8, stagger: 0.015, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
    gsap.to('[data-const="hub"]', { scale: 1.04, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  }, scopeRef)
  return () => ctx.revert()
}, [result.status])
```
3. Add `ref={scopeRef}` to the outer ready wrapper (`<div className="mt-10 flex ...">` → add `ref={scopeRef}`).
4. Add `data-const="panel"` to the constellation panel div, `data-const="node"` to each `<li>`, `data-const="edge"` to each `<line>`.

Why this is safe: `gsap.from` leaves the final state as plain CSS, so jsdom tests (no `matchMedia`) and reduced-motion users see the complete layout; `ctx.revert()` on unmount kills tweens and ScrollTriggers (no leaks).

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: PASS (5/5) — jsdom has no `matchMedia`, so motion is skipped and DOM assertions hold.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/CommitteeDirectory.jsx
git commit -m "feat: constellation entrance motion with reduced-motion guard"
```

---

### Task 4: Spec amendment (coordinates + responsive rules)

**Files:**
- Modify: `docs/superpowers/specs/2026-09-16-committee-constellation-design.md`

- [ ] **Step 1: Replace §2 coordinate lists with the implemented 1000×600 map**

Replace the technical/non-technical position lines with:
`cs` (80,180), `ai` (220,132), `embedded` (380,168), `cyber-defensive` (100,330), `web` (260,312), `cyber-offensive` (120,468), `robotics` (300,438), `automations` (220,540), `ds` (430,375); `pr-oc` (640,180), `multi-media` (810,126), `marketing` (900,312), `hr-td` (740,468); hub (500,300). HTML uses left=x/10 %, top=y/6 %; SVG uses raw units.

- [ ] **Step 2: Replace §4 with the implemented responsive rules**

Mobile panel is fixed `h-[520px]` (hub stacked above in column flow); `md+` panel is `aspect-[5/3]` with the hub absolutely overlaid at center. Badges are 44px (`w-11 h-11`) on mobile, 56px (`sm:w-14 sm:h-14`) above. Cross-mesh edges render `hidden sm:block`; hub spokes always render.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-09-16-committee-constellation-design.md
git commit -m "docs: amend constellation coordinates and responsive rules"
```

---

### Task 5: Full verification

- [ ] **Step 1: Run the constellation tests**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: 5/5 PASS.

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: 32 files passed, all tests passed (273 + any new = all green). `recruitment.test.jsx` Home-ordering tests must pass unchanged — the section keeps its heading and position.

- [ ] **Step 3: Lint touched files**

Run: `npx eslint src/features/home/components/CommitteeDirectory.jsx src/features/home/components/CommitteeDirectory.test.jsx`
Expected: no output (clean).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: compiles successfully with all routes listed (`/`, `/about/founders`, `/committees`, `/committees/[slug]`, `/join-us`, etc.).
