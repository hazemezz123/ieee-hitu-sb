# Next.js 16 Full-Stack Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite SPA with a Next.js 16.3.3 App Router full-stack app (JavaScript), reusing the server Turso/HMAC code as Route Handlers so the DB token stays server-side.

**Architecture:** In-place migration on dirty tree (no commits unless asked). `src/pages/*` → `app/**/page.js` (client components, same logic, `react-router-dom` hooks swapped for `next/navigation` + `next/link`). `api/_lib/*` → `lib/server/*`. `api/**/*.js` handlers → `app/api/**/route.js`. Frontend data layer restored to the HEAD api-backed versions (`git show HEAD:...`). Tailwind v4 via `@tailwindcss/postcss`.

**Tech Stack:** Next.js 16.3.3, React 19.2, TailwindCSS 4.2.2, @libsql/client 0.18.0 (server only), Lenis, lucide-react, Vitest (kept).

---

### Task 0: Safety snapshot + read server sources

**Files:** none (reads only)

- [ ] **Step 1: Record dirty state**

Run: `git status --short`
Expected: M package.json/package-lock, M turso.js/turso.test.js/AdminPage.jsx/admin.test.jsx, D apiClient files + vercel.json

- [ ] **Step 2: Read port sources**

Read: `api/_lib/auth.js`, `api/_lib/turso.js` (already read — raw Hrana fetch + HMAC-SHA256 session), `api/events/index.js`, `api/auth/login.js`, HEAD `src/lib/apiClient.js` via `git show HEAD:src/lib/apiClient.js`, HEAD `src/pages/AdminPage.jsx` via `git show HEAD:src/pages/AdminPage.jsx`
Expected: know exact `(req,res)` handler shapes and cookie helpers before writing routes.

### Task 1: Install Next.js, remove react-router-dom

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

Run: `npm i next@latest react@latest react-dom@latest` then `npm rm react-router-dom`
Expected: `next` 16.3.x in package.json, no `react-router-dom`. React stays 19.x.

- [ ] **Step 2: Verify**

Run: `npx next --version`
Expected: `Next.js v16.3.x`

### Task 2: Next.js config + scripts + Tailwind PostCSS

**Files:**
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `jsconfig.json`
- Modify: `package.json` scripts

- [ ] **Step 1: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
export default nextConfig
```

- [ ] **Step 2: Create `postcss.config.mjs`**

```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

Run: `npm i -D @tailwindcss/postcss`

- [ ] **Step 3: Create `jsconfig.json`**

```json
{
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*", "./app/*", "./lib/*"] } }
}
```

- [ ] **Step 4: Replace scripts in `package.json`**

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "eslint .",
"test": "vitest run",
"preview": "next start"
```

(delete `vite`/`vite build`/`vite preview` entries)

### Task 3: Restore api-backed frontend files from HEAD

**Files (restore via git — these were rewritten for browser-direct Turso, now superseded):**
- `src/lib/turso.js`, `src/lib/turso.test.js`, `src/lib/apiClient.js`, `src/lib/apiClient.test.js`, `src/pages/AdminPage.jsx`, `src/pages/admin.test.jsx`

- [ ] **Step 1: Checkout from HEAD**

Run: `git checkout HEAD -- src/lib/turso.js src/lib/turso.test.js src/lib/apiClient.js src/lib/apiClient.test.js src/pages/AdminPage.jsx src/pages/admin.test.jsx`
Expected: `git status --short` no longer lists those as M/D. `grep -r "VITE_" src/` returns nothing.

### Task 4: Move server lib + create Route Handlers

**Files:**
- Move: `api/_lib/turso.js` → `lib/server/turso.js`, `api/_lib/auth.js` → `lib/server/auth.js` (via `git mv`, fix the header comment in turso.js: "Server-only" stays true)
- Create: `app/api/auth/login/route.js`, `app/api/auth/logout/route.js`, `app/api/auth/me/route.js`
- Create: `app/api/events/route.js`, `app/api/events/[id]/route.js`, `app/api/events/by-slug/route.js`
- Create: same triple for `committees`, plus `gallery/route.js`, `gallery/[id]/route.js`, `members/route.js`, `members/[id]/route.js`, `partners/route.js`, `partners/[id]/route.js`
- Delete: `api/` (after all ports verified by tests)

Route handler shape (port each `(req, res)` handler 1:1 — example for `app/api/events/route.js`):

```js
import { NextResponse } from 'next/server'
import { createEvent, ensureSchema, fetchEvents } from '@/lib/server/turso'
import { isAuthed } from '@/lib/server/auth'

export async function GET() {
  try {
    const events = await fetchEvents()
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  await ensureSchema()
  const body = await req.json()
  const id = await createEvent(body ?? {})
  return NextResponse.json({ id }, { status: 201 })
}
```

Auth adaptation: `api/_lib/auth.js` reads cookies via `req.headers.cookie` — `NextRequest` supports `req.headers.get('cookie')` and `req.cookies.get('admin_session')`. Prefer `req.cookies`. `login.js` sets cookie via `Set-Cookie` header — use `res.cookies.set()` on the NextResponse. `x-forwarded-for` → `req.headers.get('x-forwarded-for')`. Check `auth.js` crypto imports first: if it uses `node:crypto`, keep as-is (Node runtime default). If Web Crypto, also fine.

Dynamic `[id]` routes: `export async function GET(req, { params }) { const { id } = await params }` (Next 16: params is async).

- [ ] Steps per route file: write file → `npm test` related suite → proceed. Keep `api/` until the end, then `git rm -r api`.

### Task 5: App shell (layout, providers, globals, 404)

**Files:**
- Create: `app/layout.js`, `app/page.js` (re-export Home — actually move Home.jsx content or import from src: `import Home from '@/pages/Home'`? Cleaner: `app/page.js` renders `@/pages/Home`. Keep pages in src, only routing moves to app/)
- Create: `app/not-found.js` (render `@/pages/NotFoundPage`)
- Move: `src/index.css` → `app/globals.css` (git mv, update importers — only layout imports it)
- Modify: `src/lib/LenisProvider.jsx` add `'use client'` first line
- Modify: `src/components/Navbar.jsx` add `'use client'`, replace `useLocation`/`Link` from react-router-dom with `usePathname` + `Link` from `next/link`/`next/navigation`
- Replace: `src/components/ScrollToTop.jsx` → client component using `usePathname` + `useEffect scrollTo`, or delete (Next restores scroll). Keep component, convert.
- Check: `Footer.jsx`, `Hero.jsx`, others — add `'use client'` ONLY if they use hooks/events (read each; server components by default).

`app/layout.js`:

```js
import './globals.css'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import LenisProvider from '@/lib/LenisProvider'

export const metadata = {
  title: 'IEEE HITU Student Branch',
  description: 'Official IEEE student branch at Heliopolis International Technological University.',
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
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  )
}
```

(Drops the `document.documentElement.dataset.theme` inline script in favor of `data-theme="dark"` attribute — verify against index.css usage first; if CSS reads `dataset.theme` dynamically, keep a beforeInteractive script instead.)

### Task 6: Port pages to app/ routes

For each of `/`, `/about`, `/join-us`, `/committees`, `/committees/[slug]`, `/membership`, `/events`, `/events/[slug]`, `/gallery`, `/contact`, `/admin`, `/admin/events/new`, `/admin/events/[id]/edit`:

**Files:** Create `app/**/page.js` — thin wrappers importing from `@/pages/*`:

```js
// app/events/[slug]/page.js
import EventDetailPage from '@/pages/EventDetailPage'
export default EventDetailPage
```

But `EventDetailPage` uses `useParams` from react-router-dom → change to `next/navigation` `useParams` (client component, add `'use client'`). `EventFormPage` uses `useNavigate`/`useParams` → `useRouter`/`useParams` from `next/navigation`. All `<Link to=>` → `<Link href=>` from `next/link`. `MemoryRouter` only in tests — admin.test.jsx uses `MemoryRouter` from react-router-dom → replace with plain render (no router) + mock `next/navigation` via `vi.mock('next/navigation', ...)` returning useRouter/useParams/usePathname stubs.

- [ ] Per page: create wrapper → convert hooks → run page's test suite → next.
- [ ] `src/App.jsx`, `src/main.jsx`, `index.html`, `vite.config.js`: delete after all routes ported. `react-router-dom` already removed in Task 1 — so do conversions BEFORE deleting (order: Task 6 conversions, then delete).

### Task 7: Tests, build, smoke

- [ ] **Step 1: Update api tests** — `api/**/*.test.js` import old handler paths. After `git rm -r api`, port the valuable ones to `app/api/**/*.test.js` importing route handlers + `lib/server/*`. At minimum keep `auth` + `resources` coverage: rewrite imports to `@/lib/server/...`. Run: `npx vitest run app/api lib/server`
Expected: PASS
- [ ] **Step 2: Full suite** — Run: `npm test` Expected: all files pass (count will differ from 185 — record new count)
- [ ] **Step 3: Lint** — Run: `npm run lint` Expected: no errors (fix unused react-router imports)
- [ ] **Step 4: Build** — Run: `npm run build` Expected: `✓ Compiled successfully`, all 13+ routes listed
- [ ] **Step 5: Dev smoke** — Run: `npm run dev -- --port 5197`, curl `/` (200 HTML), `/events` (200), `/api/committees` (200 JSON — real DB!), `/admin` (200 login). Login with ADMIN_PASSWORD via curl POST `/api/auth/login` → Set-Cookie, then authed write works.
- [ ] **Step 6: Env cleanup** — delete `VITE_*` from `.env.local` (server uses `TURSO_*`; client holds no secrets). Keep `.env` as-is (gitignored... note: `.env` is TRACKED — flag rotation again, do not commit).

## Self-Review

- Spec coverage: JS ✓ (Q1), Route Handlers ✓ (Q2), dirty-tree preserved ✓ (Q3). Every current route (13 public + 3 admin + 404) has a port task. Auth restored server-side. Fallback/static data untouched (works via same apiClient responses).
- Placeholders: none — handler/page templates include real code; per-file conversions reference exact hook swaps.
- Type consistency: `lastInsertRowid` stays server-internal; frontend keeps `{ events }`-style JSON contracts identical to old api (apiClient unchanged from HEAD).
- Risk: `git checkout HEAD -- <6 files>` discards the browser-direct work — intended (superseded by Q2). `vercel.json` stays deleted (Next needs no SPA rewrite).
