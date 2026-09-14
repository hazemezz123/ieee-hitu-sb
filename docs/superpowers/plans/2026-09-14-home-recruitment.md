# Home Recruitment Band Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a status-aware Heads-recruitment teaser band after the Home Hero, visible only while recruitment is open, per `docs/superpowers/specs/2026-09-14-home-recruitment-design.md`.

**Architecture:** New self-contained client component `src/features/home/components/RecruitmentBand.jsx` owns its `fetchRecruitmentForm('heads')` call (same unmount-guarded pattern as `JoinUsPage.jsx:10-17`); `HomePage.jsx` gains one import + one JSX line. Existing band order and data flow untouched.

**Tech Stack:** React 19, Next.js App Router, existing `api()`-based `@/lib/recruitment` client, vitest + Testing Library.

---

## File structure

- Create: `src/features/home/components/RecruitmentBand.jsx` — fetches open status, renders gradient band or `null`.
- Modify: `src/features/home/components/HomePage.jsx` — add import + `<RecruitmentBand />` after `<Hero />`.
- Modify: `src/features/join-us/components/recruitment.test.jsx` — mock `@/lib/recruitment`, default closed, add open/closed band tests.

Conventions (verified): `HomePage.jsx` is `'use client'`; tests use `vi.hoisted` mocks + `renderPage` helper + `beforeEach` resets; `getByRole('heading', { level: 1 })` is the Hero h1; band-order test uses `compareDocumentPosition`; `npm run lint` must be clean; no `catch {}` (use `catch { /* reason */ }`).

---

### Task 1: RecruitmentBand component + placement + tests

**Files:**
- Create: `src/features/home/components/RecruitmentBand.jsx`
- Modify: `src/features/home/components/HomePage.jsx`
- Modify: `src/features/join-us/components/recruitment.test.jsx`

- [ ] **Step 1: Update the test mocks first** — in `src/features/join-us/components/recruitment.test.jsx`:

(a) Extend the hoisted mock object (line ~12) with a recruitment fetcher:

```js
const { fetchEventsResult, fetchCommitteesResult, fetchPartnersResult, fetchPartners, fetchRecruitmentForm } = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchCommitteesResult: vi.fn(),
  fetchPartnersResult: vi.fn(),
  fetchPartners: vi.fn(),
  fetchRecruitmentForm: vi.fn(),
}))
```

(b) Register the module mock next to the other `vi.mock` lines:

```js
vi.mock('@/lib/recruitment', () => ({ fetchRecruitmentForm }))
```

(c) In `beforeEach`, default to closed so all 20+ existing Home tests see no band:

```js
fetchRecruitmentForm.mockReset()
fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: false })
```

(d) Append two new tests inside `describe('recruitment pages', ...)` (after the 'orders Home bands...' test):

```jsx
it('shows the recruitment band after the hero when open', async () => {
  fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: true })
  renderPage(<Home />)

  const cta = await screen.findByRole('link', { name: /start your application/i })
  expect(cta.getAttribute('href')).toBe('/join-us')
  const h1 = screen.getByRole('heading', { level: 1 })
  const band = screen.getByRole('heading', { name: /lead an ieee hitu committee/i })
  expect(h1.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it('hides the recruitment band when closed', async () => {
  fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', isOpen: false })
  renderPage(<Home />)

  await screen.findByText('Next Lab')
  expect(screen.queryByRole('heading', { name: /lead an ieee hitu committee/i })).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx`
Expected: FAIL — the open-band test fails with "Unable to find role link Start your application" (no band exists yet). The closed test passes already (guard against regressions).

- [ ] **Step 3: Create the component** — `src/features/home/components/RecruitmentBand.jsx`, verbatim:

```jsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchRecruitmentForm } from '@/lib/recruitment'
import { committees } from '@/features/committees/data/committees'

export default function RecruitmentBand() {
  const [form, setForm] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetchRecruitmentForm('heads')
      .then(f => { if (active && f?.isOpen) { setForm(f); setOpen(true) } })
      .catch(() => { /* band stays hidden when status cannot load */ })
    return () => { active = false }
  }, [])

  if (!open) return null

  return (
    <section aria-labelledby="recruitment-band-title" className="wedge-bg" style={{ background: 'linear-gradient(135deg, #004976, #00629b)' }}>
      <div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
        <p><span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Heads Recruitment — Open</span></p>
        <h2 id="recruitment-band-title" className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-[#F0F4F8] md:text-5xl">Lead an IEEE HITU Committee</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C7D3DC] md:text-lg">{form?.description || 'Apply to lead a committee as Head or Vice-Head.'}</p>
        <p className="mt-6" aria-label={`${committees.length} committees`}><strong className="text-2xl text-white">{committees.length}</strong> <span className="text-[#C7D3DC]">committees</span></p>
        <Link className="btn mt-8 bg-white font-bold text-[#004976] hover:bg-[#D7E9F3]" href="/join-us">Start your application</Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Place it in HomePage** — in `src/features/home/components/HomePage.jsx`, add the import after the `PartnershipCarousel` import line:

```jsx
import RecruitmentBand from './RecruitmentBand'
```

and render it directly after `<Hero />` (line 25), before `<div>`:

```jsx
<Hero />
<RecruitmentBand />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx`
Expected: PASS (all existing + 2 new band tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/home/components/RecruitmentBand.jsx src/features/home/components/HomePage.jsx src/features/join-us/components/recruitment.test.jsx
git commit -m "feat: add status-aware recruitment band to home page"
```

---

### Task 2: Full verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: all suites PASS (baseline before this feature: 29 files / 219 tests; expect 29 files / 221 tests).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: succeeds; `/` stays static.

- [ ] **Step 4: Manual smoke checklist** (`npm run dev` with admin session): open `/admin` → Recruitment → open Heads form → load `/` (band visible after Hero, CTA goes to `/join-us`) → close form → reload `/` (band gone, page identical to before). Record failures as new bug tasks — do not ship red.
