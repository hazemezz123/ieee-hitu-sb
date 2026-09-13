# Admin Server-Side Auth Design — 2026-09-13

## Problem
- `ADMIN_PASSWORD = "ieee2026"` hardcoded in `src/pages/AdminPage.jsx:11`, checked client-side, stored in `sessionStorage`.
- Turso `DB_URL` + `DB_TOKEN` hardcoded in `src/lib/turso.js:1-2`. Anyone can read/write/delete the DB via curl, bypassing any login.
- Goal (approved): full-secure move — password check AND all Turso writes behind server API. Shared-password model kept. Hosting: Vercel Serverless Functions.

## Architecture
- New `api/` directory at repo root (Vercel Serverless, ESM).
- `api/_lib/auth.js`: HMAC-SHA256 sign/verify sessions with `SESSION_SECRET`, 12h expiry. Cookie parse/serialize helpers. No dependency on external session store (stateless, works on serverless).
- `api/_lib/turso.js`: server-only Turso pipeline client. Sole place importing `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`. Reuses parameterized SQL from current `src/lib/turso.js`.
- Env vars (never bundled): `ADMIN_PASSWORD`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` (32+ random bytes). Local: `.env.local` (gitignored). Prod: Vercel dashboard.
- `vercel.json`: keep SPA rewrite, add exemption so `/api/*` is not rewritten to `/index.html`.
- Frontend `src/lib/turso.js` becomes thin `/api` client. `src/lib/apiClient.js` (new) wraps `fetch` with `credentials: 'include'` + JSON error handling.

## Endpoints
- `POST /api/auth/login` body `{password}` → `crypto.timingSafeEqual` vs `ADMIN_PASSWORD`. Success: `Set-Cookie: admin_session=<exp>.<sig>; HttpOnly; Secure (prod only); SameSite=Lax; Path=/; Max-Age=43200`. Failure: `401 {error: "Invalid credentials"}`. In-memory per-IP rate limit ~10 req/min.
- `POST /api/auth/logout` → clears `admin_session` cookie.
- `GET /api/auth/me` → `{authed: true|false}` from cookie verify. Used by `AdminPage` on mount instead of `sessionStorage`.
- Resources (same shapes as today):
  - `/api/events` (GET public list, POST auth create), `/api/events/[id]` (GET public, PUT/DELETE auth).
  - `/api/gallery` (GET public, POST auth), `/api/gallery/[id]` (DELETE auth).
  - `/api/committees`, `/api/committees/[id]`, `/api/committees/[id]/members`, `/api/members/[id]`, `/api/partners`, `/api/partners/[id]` — GET public, writes auth-gated.
- Auth gate: `verifySession(req)` → 401 `{error: "Unauthenticated"}` when missing/invalid/expired.

## Data flow
- Login: form → `POST /api/auth/login` → cookie set → `authed=true`.
- Authed writes: `fetch('/api/events', {method:'POST', credentials:'include', body})` → server verifies cookie → Turso → JSON.
- Public reads: pages → `GET /api/events` etc → server → Turso → JSON. On API failure, frontend keeps existing static-data fallback (`eventsSource.js`, `gallerySource.js`, etc.).
- Logout / expiry (12h): cookie cleared or 401 → frontend returns to login form.
- Out of scope: Cloudinary unsigned preset stays as-is; follow-up is signed uploads via `/api/uploads`.

## Error handling
- 401 wrong password: generic message, no timing leak.
- 401 unauthenticated writes → redirect to `/admin` login.
- 405 wrong method, 400 bad JSON/body, 500 DB errors without leaking SQL/token.
- Frontend reuses existing login-error text + banner UI. No secrets in error payloads or logs.

## Testing
- Vitest unit: `auth.js` sign/verify, tamper rejection, expiry rejection.
- Vitest handler: login success/failure, `me` true/false, one write endpoint 401-without-cookie / 200-with-cookie.
- Update `src/pages/admin.test.jsx`, `EventFormPage.test.jsx` to mock `/api` fetch.
- Manual: wrong password fails, right password persists across refresh, `curl` POST without cookie → 401, `grep -r` on `dist/` shows no `ADMIN_PASSWORD` value, no Turso token.
- Rotation: changing `ADMIN_PASSWORD` / `SESSION_SECRET` in Vercel invalidates existing sessions (expected).

## Rollout
1. Add `api/` + env vars + `vercel.json` exemption.
2. Migrate reads first (public GET), keep fallback.
3. Migrate writes + login/logout/me, delete client secrets.
4. Rotate Turso token (old one was public in git history) and set new `ADMIN_PASSWORD`.
