# Next.js Feature Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift-and-shift `src/views|data|components` into `src/features/*` with thin `app/` routes, zero behavior change.

**Architecture:** Pure file moves + import rewrites (`@/` alias). No logic, no TS, no server actions. `app/**/page.js` re-exports feature components. Shared code → `lib/`, `components/ui/`.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript, Vitest, Tailwind v4.

---

### Task 1: Cleanup dead code + ESLint + logo

**Files:**
- Delete: `src/components/ScrollToTop.jsx`, `src/components/PageLayout.jsx`
- Move: `src/assets/logo.png` → `public/logo.png`
- Modify: `src/app/layout.js`, `src/components/Navbar.jsx`, `eslint.config.js`

- [ ] **Step 1: Delete dead wrappers**

```bash
git rm src/components/ScrollToTop.jsx src/components/PageLayout.jsx
git mv src/assets/logo.png public/logo.png
```

- [ ] **Step 2: Run to verify deletes staged**

Run: `git status --short`
Expected: `D src/components/ScrollToTop.jsx`, `D src/components/PageLayout.jsx`, `R src/assets/logo.png -> public/logo.png`

- [ ] **Step 3: Fix `src/app/layout.js` — drop ScrollToTop, keep main plain (padding stays per-page to preserve exact behavior)**

```js
import './globals.css'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LenisProvider from '@/lib/LenisProvider'

export const metadata = {
  title: 'IEEE HITU Student Branch',
  description: 'The official IEEE student branch at Heliopolis International Technological University.',
  icons: { icon: ['/favicon-96x96.png', '/favicon.svg', '/favicon.ico'], apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-7FMS8J5THQ" />
        <Script id="gtag-init">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-7FMS8J5THQ')`}</Script>
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3b: Inline `PageLayout` in ALL 11 importers (exact behavior preserved)** — files: `Home.jsx` (variant home), `EventsPage.jsx`, `EventDetailPage.jsx`, `CommitteesPage.jsx`, `CommitteeDetailPage.jsx`, `GalleryPage.jsx`, `AboutPage.jsx`, `ContactPage.jsx`, `MembershipPage.jsx`, `JoinUsPage.jsx`, `NotFoundPage.jsx`. Remove `PageLayout` import; replace `<PageLayout variant="home">` with `<div className="page-enter">`; replace `<PageLayout>` (or `<PageLayout variant="default">`) with `<div className="page-enter pt-[var(--navbar-height,6rem)]">`. Children identical.

- [ ] **Step 4: Fix logo imports in ALL 3 importers (Navbar.jsx, Hero.jsx, Footer.jsx)** — remove `import logo from '../assets/logo.png'`, change `<img src={logo}` → `<img src="/logo.png"` in each. Everything else identical.

```js
// before: import logo from '../assets/logo.png'
// after:
<img src="/logo.png" alt="IEEE HITU Student Branch" className="h-9 w-auto" />
```

- [ ] **Step 5: Fix `eslint.config.js` — drop Vite-only react-refresh**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', '.next', 'studio']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }] },
  },
  {
    files: ['src/app/api/**/*.js', 'src/lib/server/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
])
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: PASS, no errors

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.js src/components/Navbar.jsx eslint.config.js public/logo.png
git commit -m "refactor: drop ScrollToTop/PageLayout, move logo to public, fix eslint"
```

### Task 2: Global components (`components/ui` + lowercase shell)

**Files:**
- Move: `src/components/Navbar.jsx` → `src/components/navbar.jsx`, `src/components/Footer.jsx` → `src/components/footer.jsx`
- Move: `ConfirmDialog.jsx,Skeleton.jsx,Lightbox.jsx,EventCard.jsx,Hero.jsx,AnimatedSection.jsx,MasonryGallery.jsx,CommitteeIcon.jsx,InterestForm.jsx,TechnicalResources.jsx` → `src/components/ui/`
- Modify: all importers (`src/app/layout.js`, `src/views/*`, `src/features/*`)

- [ ] **Step 1: Move files**

```bash
git mv src/components/Navbar.jsx src/components/navbar.jsx
git mv src/components/Footer.jsx src/components/footer.jsx
New-Item -ItemType Directory -Path src/components/ui -Force
git mv src/components/ConfirmDialog.jsx src/components/ui/ConfirmDialog.jsx
git mv src/components/Skeleton.jsx src/components/ui/Skeleton.jsx
git mv src/components/Lightbox.jsx src/components/ui/Lightbox.jsx
git mv src/components/EventCard.jsx src/components/ui/EventCard.jsx
git mv src/components/Hero.jsx src/components/ui/Hero.jsx
git mv src/components/AnimatedSection.jsx src/components/ui/AnimatedSection.jsx
git mv src/components/MasonryGallery.jsx src/components/ui/MasonryGallery.jsx
git mv src/components/CommitteeIcon.jsx src/components/ui/CommitteeIcon.jsx
git mv src/components/InterestForm.jsx src/components/ui/InterestForm.jsx
git mv src/components/TechnicalResources.jsx src/components/ui/TechnicalResources.jsx
```

- [ ] **Step 2: Rewrite imports (repo-wide) — no codemod, exact replaces**

Run: `rg -l "components/(ConfirmDialog|Skeleton|Lightbox|EventCard|Hero|AnimatedSection|MasonryGallery|CommitteeIcon|InterestForm|TechnicalResources)" src`
Expected: list of files to fix. Replace `from '../components/X'` → `from '@/components/ui/X'`, `from '@/components/Navbar'` → `from '@/components/navbar'`, `from '@/components/Footer'` → `from '@/components/footer'`.

- [ ] **Step 3: Verify**

Run: `npm run lint; if ($?) { npm test }`
Expected: lint PASS, tests PASS (paths only, no logic change)

- [ ] **Step 4: Commit**

```bash
git add -A src/components src/app src/views
git commit -m "refactor: global components to ui/ + lowercase shell"
```

### Task 3: Shared lib consolidation

**Files:**
- Move: `src/data/presentation.js` → `src/lib/presentation.js`
- Keep: `src/lib/apiClient.js,turso.js,upload.js,slugify.js,LenisProvider.jsx,lenisContext.js,server/db.js,server/auth.js`
- Modify: importers of `../data/presentation`

- [ ] **Step 1: Move + rewrite imports**

```bash
git mv src/data/presentation.js src/lib/presentation.js
```

Replace `from '../data/presentation'` → `from '@/lib/presentation'`, `from '@/data/presentation'` → `from '@/lib/presentation'`.

- [ ] **Step 2: Verify**

Run: `npm test -- src/data/presentation.test.js; if ($?) { npm run lint }`
Expected: PASS (move test with it in Task 5 if needed; update import first)

- [ ] **Step 3: Commit**

```bash
git add -A src/lib src/data
git commit -m "refactor: presentation helpers to lib/"
```

### Task 5: Feature `home` (runs after Task 4 — imports `useEvents`)

**Files:**
- Create: `src/features/home/components/FeaturedEvent.jsx` (lines 30-52 of `views/Home.jsx`), `EventRecord.jsx` (16-28), `CommitteeDirectory.jsx` (54-98), `PartnershipCarousel.jsx` (101-139)
- Create: `src/features/home/hooks/useEventsResult.js` (wraps `fetchEventsResult`)
- Create: `src/features/home/components/HomePage.jsx` (remaining `Home()` 141-200, imports above)
- Modify: `src/app/page.js` → `export { default } from '@/features/home/components/HomePage'`
- Delete: `src/views/Home.jsx` (git rm after green)

- [ ] **Step 1: Create hooks file**

```js
'use client'
import { useEffect, useState } from 'react'
import { fetchEventsResult } from '@/features/events/hooks/useEvents'

export function useEventsResult() {
  const [result, setResult] = useState({ events: [], source: null, status: 'loading' })
  useEffect(() => {
    let active = true
    fetchEventsResult().then((data) => { if (active) setResult({ ...data, status: 'ready' }) })
      .catch(() => { if (active) setResult({ events: [], source: null, status: 'error' }) })
    return () => { active = false }
  }, [])
  return result
}
```

- [ ] **Step 2: Split components (exact copy from Home.jsx, fix `@/components/ui/*` + `@/lib/presentation` imports)**

- [ ] **Step 3: Thin route**

```js
export { default } from '@/features/home/components/HomePage'
```

- [ ] **Step 4: Verify**

Run: `npm test; if ($?) { npm run build }`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/home src/app/page.js
git rm src/views/Home.jsx
git commit -m "refactor: home view to features/home"
```

### Task 4: Features `events,committees,gallery` data+pages (do before home — home depends on events)

**Files:**
- `src/views/EventsPage.jsx,EventDetailPage.jsx` → `src/features/events/components/`
- `src/data/events.js` → `src/features/events/data/events.js`, `src/data/eventsSource.js` → `src/features/events/hooks/useEvents.js`
- `src/views/CommitteesPage.jsx,CommitteeDetailPage.jsx` → `src/features/committees/components/`
- `src/data/committees.js` → `src/features/committees/data/committees.js`, `src/data/committeeSource.js` → `src/features/committees/hooks/useCommittees.js`
- `src/views/GalleryPage.jsx` → `src/features/gallery/components/GalleryPage.jsx`
- `src/data/gallerySource.js` → `src/features/gallery/hooks/useGallery.js`
- `src/views/AboutPage.jsx` → `src/features/about/components/AboutPage.jsx`
- `src/views/ContactPage.jsx` → `src/features/contact/components/ContactPage.jsx`
- `src/views/MembershipPage.jsx,JoinUsPage.jsx` → `src/features/membership/components/`, `src/features/join-us/components/`
- `src/data/boardMembers.js` → `src/features/about/data/boardMembers.js`, `src/data/partners.js` → `src/features/home/data/partners.js`, `src/data/partnersSource.js` → `src/features/home/hooks/usePartners.js`
- Modify: `src/app/events/page.js`, `src/app/events/[slug]/page.js`, `src/app/committees/page.js`, `src/app/committees/[slug]/page.js`, `src/app/gallery/page.js`, `src/app/about/page.js`, `src/app/contact/page.js`, `src/app/membership/page.js`, `src/app/join-us/page.js` → thin re-exports
- Move tests with files: `records.test.jsx,recruitment.test.jsx` → owning feature `components/`

- [ ] **Step 1: Move events**

```bash
New-Item -ItemType Directory -Path src/features/events/components,src/features/events/hooks,src/features/events/data -Force
git mv src/views/EventsPage.jsx src/features/events/components/EventsPage.jsx
git mv src/views/EventDetailPage.jsx src/features/events/components/EventDetailPage.jsx
git mv src/views/EventFormPage.jsx src/features/admin/components/EventForm.jsx
git mv src/data/events.js src/features/events/data/events.js
git mv src/data/eventsSource.js src/features/events/hooks/useEvents.js
git mv src/views/EventFormPage.test.jsx src/features/admin/components/EventForm.test.jsx
```

Update `useEvents.js` internal: `from './events'` → `from '../data/events'` (now relative within feature), `from '../lib/turso'` → `from '@/lib/turso'`.

- [ ] **Step 2: Move committees/gallery/about/contact/membership/join-us (exact)**

```bash
New-Item -ItemType Directory -Path src/features/committees/components,src/features/committees/hooks,src/features/committees/data,src/features/gallery/components,src/features/gallery/hooks,src/features/about/components,src/features/about/data,src/features/contact/components,src/features/membership/components,src/features/join-us/components,src/features/home/data,src/features/home/hooks -Force
git mv src/views/CommitteesPage.jsx src/features/committees/components/CommitteesPage.jsx
git mv src/views/CommitteeDetailPage.jsx src/features/committees/components/CommitteeDetailPage.jsx
git mv src/data/committees.js src/features/committees/data/committees.js
git mv src/data/committeeSource.js src/features/committees/hooks/useCommittees.js
git mv src/data/committeeSource.test.js src/features/committees/hooks/useCommittees.test.js
git mv src/views/GalleryPage.jsx src/features/gallery/components/GalleryPage.jsx
git mv src/data/gallerySource.js src/features/gallery/hooks/useGallery.js
git mv src/data/gallerySource.test.js src/features/gallery/hooks/useGallery.test.js
git mv src/views/AboutPage.jsx src/features/about/components/AboutPage.jsx
git mv src/data/boardMembers.js src/features/about/data/boardMembers.js
git mv src/views/ContactPage.jsx src/features/contact/components/ContactPage.jsx
git mv src/views/MembershipPage.jsx src/features/membership/components/MembershipPage.jsx
git mv src/views/JoinUsPage.jsx src/features/join-us/components/JoinUsPage.jsx
git mv src/data/partners.js src/features/home/data/partners.js
git mv src/data/partnersSource.js src/features/home/hooks/usePartners.js
git mv src/data/partnersSource.test.js src/features/home/hooks/usePartners.test.js
git mv src/views/records.test.jsx src/features/events/components/records.test.jsx
git mv src/views/recruitment.test.jsx src/features/join-us/components/recruitment.test.jsx
```

Update each moved `hooks/use*.js`: `from './x'` → `from '../data/x'`, `from '../lib/turso'` → `from '@/lib/turso'`.

- [ ] **Step 3: Thin all `app/` routes** (example)

```js
// src/app/events/page.js
export { default } from '@/features/events/components/EventsPage'
```

- [ ] **Step 4: Verify per feature**

Run: `npm test; if ($?) { npm run lint }`
Expected: PASS before next feature move

- [ ] **Step 5: Commit per feature**

```bash
git add -A src/features/events src/app/events
git commit -m "refactor: events view+data to features/events"
```

### Task 6: Feature `admin` (decompose bloated)

**Files:**
- `src/views/AdminPage.jsx` (325) → `src/features/admin/components/AdminShell.jsx` + `EventsTable.jsx` + `LoginForm.jsx`, `hooks/useAdminAuth.js`
- `src/views/admin/CommitteesTab.jsx` (366) → `CommitteesTable.jsx` + `CommitteeForm.jsx` + `MemberManager.jsx`, `hooks/useCommittees.js`
- `src/views/admin/{GalleryTab,PartnersTab,PhotoInput}.jsx` → `src/features/admin/components/`
- Modify: `src/app/admin/page.js`, `src/app/admin/events/new/page.js`, `src/app/admin/events/[id]/edit/page.js` → thin re-exports

- [ ] **Step 1: Extract `useAdminAuth.js` (existing logic, reuse `api`)**

```js
'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/apiClient'

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    let active = true
    api('/api/auth/me').then(({ authed }) => { if (active) setAuthed(authed) })
      .catch(() => { if (active) setAuthed(false) })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [])
  async function login(password) { await api('/api/auth/login', { method: 'POST', body: { password } }); setAuthed(true) }
  async function logout() { try { await api('/api/auth/logout', { method: 'POST', body: {} }) } catch {} setAuthed(false) }
  return { authed, checking, login, logout }
}
```

- [ ] **Step 2: Split `AdminPage` → shell/table/login (copy JSX verbatim, wire hook)**

- [ ] **Step 3: Split `CommitteesTab` → table/form/manager + `useCommittees.js` (copy `load/saveCommittee/saveMember/handleDelete` verbatim)**

- [ ] **Step 4: Verify**

Run: `npm test -- src/features/admin; if ($?) { npm run build }`
Expected: PASS (`admin.test.jsx`, `committeesTab/galleryTab/partnersTab.test.jsx` moved alongside)

- [ ] **Step 5: Commit**

```bash
git add -A src/features/admin src/app/admin
git rm src/views/AdminPage.jsx src/views/admin.test.jsx
git commit -m "refactor: admin to features/admin, decompose shell/table/forms"
```

### Task 7: Final verification + prune `views|data`

**Files:** delete empty `src/views/`, `src/data/` dirs if empty; move remaining `*.test.*` with owners; delete `src/assets/` if empty.

- [ ] **Step 1: Confirm no stale imports**

Run: `rg -n "from ['\"]@/(views|data)/|from ['\"]\.\./(views|data)/|ScrollToTop|PageLayout|assets/logo" src/app src/features src/components src/lib`
Expected: no matches

- [ ] **Step 2: Full gates**

Run: `npm run lint; if ($?) { npm test; if ($?) { npm run build } }`
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: complete features/ migration, remove views/data shims"
```
