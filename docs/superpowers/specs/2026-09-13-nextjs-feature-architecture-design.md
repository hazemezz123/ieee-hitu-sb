# Next.js Feature Architecture Refactor — Design

**Goal:** Lift-and-shift Vite-SPA leftovers into Next.js App Router feature-driven structure with zero behavior change.

**Constraints (user-approved):** Keep valuable tests, stay on JavaScript (no TS), full `features/` migration, keep `app/api` routes (no server actions).

**State found:** `index.html`/`vite.config`/`App.jsx`/`main.jsx` already deleted. No `react-router-dom` in `src` or `package.json`. 103 files in `src`, largest: `CommitteesTab.jsx` 15KB, `AdminPage.jsx` 11KB, `Home.jsx` 10KB.

## Architecture

`src/app/` = thin route entries only (import from features, no logic). `src/features/[feature]/components|hooks|data` = domain code. `src/components/` = truly global (`navbar`, `footer`, `ui/*`). `src/lib/` = shared clients. `src/assets/logo.png` → `public/logo.png`.

```
src/app/(routes)/page.js        # thin: export { default } from '@/features/x/components/Y'
src/features/home/components/FeaturedEvent.jsx, EventRecord.jsx, CommitteeDirectory.jsx, PartnershipCarousel.jsx
src/features/home/hooks/useEventsResult.js
src/features/admin/components/AdminShell.jsx, EventsTable.jsx, LoginForm.jsx + committees|gallery|partners tabs
src/features/admin/hooks/useAdminAuth.js, useCommittees.js
src/features/events|committees|gallery|contact|about|membership|join-us/...
src/components/ui/ConfirmDialog.jsx, Skeleton.jsx, Lightbox.jsx, EventCard.jsx, ...
src/components/navbar.jsx, footer.jsx
src/lib/apiClient.js, turso.js, upload.js, slugify.js, LenisProvider.jsx
```

## Cleanup (Step 1)

- Delete: `src/components/ScrollToTop.jsx` (Next.js handles scroll; `usePathname`+`window.scrollTo` fights App Router scroll restoration), `src/components/PageLayout.jsx` (2-line padding wrapper → inline in `app/layout.js`).
- Move: `src/assets/logo.png` → `public/logo.png`, update `Navbar.jsx` `import logo` → `src="/logo.png"`.
- Fix: `eslint.config.js` `reactRefresh.configs.vite` → drop `react-refresh` plugin entirely (Vite-only, false positives on RSC); keep `react-hooks`.
- Keep: `vitest.config.js` + valuable tests (`app/api/routes.test.js`, `data/presentation.test.js`, `data/*Source.test.js`, `views/admin.test.jsx` auth flow, `Navbar/Lightbox/AnimatedSection` tests). Delete only stale duplicates that reference deleted paths after move.
- No-ops confirmed: no `index.html`/`vite.config.*`/`App.jsx`/`main.jsx` to delete, no `react-router-dom` to replace.

## Decomposition

- `views/AdminPage.jsx` (325 lines) → `features/admin/components/AdminShell.jsx` + `EventsTable.jsx` + `LoginForm.jsx` + `hooks/useAdminAuth.js` (wraps existing `apiAuth` → reuse `lib/apiClient.api`).
- `views/admin/CommitteesTab.jsx` (366) → `CommitteesTable.jsx` + `CommitteeForm.jsx` + `MemberManager.jsx` + `hooks/useCommittees.js`. `PhotoInput.jsx` → `components/ui/PhotoInput.jsx`.
- `views/Home.jsx` (200) → 4 components above + `hooks/useEventsResult.js` (existing `fetchEventsResult` call).
- `views/EventFormPage.jsx` (12KB) → `features/admin/components/EventForm.jsx` + `hooks/useEventForm.js`.
- `components/Navbar.jsx` → `components/navbar.jsx` + `hooks/useMobileMenu.js` (3 `useEffect` blocks). Lowercase per target structure.
- `data/eventsSource|committeeSource|gallerySource|partnersSource` → `features/*/hooks/use*.js` thin wrappers; static `data/events|committees|partners|boardMembers` → `features/*/data/`. `data/presentation.js` → `lib/presentation.js` (shared sort/format).

## Data flow / Errors

Unchanged: `fetch*Result()` → `{ data, source: 'remote'|'fallback' }` → components branch on `status/source`. `apiClient.api()` stays single fetch wrapper. No SWR, no RSC fetch, no server actions. `vercel-react-best-practices`: defers `bundle-dynamic-imports` (Lightbox) and `async-suspense-boundaries` to follow-up; no new waterfalls introduced (same `useEffect` count, just relocated).

## Testing

Green gates per move: `npm run lint`, `npm test`, `npm run build`. Tests move with their feature (`features/admin/components/*.test.jsx`), imports `@/features/*`. `next/navigation` mocks (`useRouter/usePathname/useParams`) stay as-is.

## Out of scope

TS conversion, `actions/` + `schemas/`, RSC/Suspense rewrite, new deps (zod, swr), route groups `(auth)/(dashboard)`.
