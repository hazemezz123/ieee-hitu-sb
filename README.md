# IEEE HITU Student Branch Website

Official website of the IEEE Student Branch at Heliopolis International Technological University — a recruitment-first site (home, about, committees, events, gallery, membership, join-us, contact) plus an admin surface for managing content.

Full-stack **Next.js 16** (App Router) + **Turso** (libSQL) + **TailwindCSS v4**.

## Tech Stack

- **Next.js** 16 / **React** 19
- **TailwindCSS** 4 + **Lucide** icons + **Lenis** smooth scroll
- **Turso** via raw Hrana HTTP (server only — token never leaves the server)
- **Vitest** + Testing Library, **ESLint**

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm

### Environment

Copy the required keys into `.env` (all server-side; never prefix them with `NEXT_PUBLIC_`):

```bash
TURSO_DATABASE_URL=https://<db>-<org>.turso.io/v2/pipeline
TURSO_AUTH_TOKEN=...
ADMIN_PASSWORD=...
SESSION_SECRET=...
```

`.env.example` lists the same keys with empty values.

### Development

```bash
npm install
npm run dev      # http://localhost:3000
```

### Build & Start

```bash
npm run build
npm start
```

### Testing & Linting

```bash
npm test
npm run lint
```

### Seed committees data

```bash
npm run seed:committees   # needs TURSO_* env vars set
```

## Project Structure

```
src/
├── app/                 # Next.js routes: pages, layouts, not-found
│   └── api/             # Route Handlers (auth + events/committees/gallery/members/partners)
├── views/               # Route components (client components)
├── components/          # Shared UI (Navbar, Footer, Hero, EventCard, Lightbox, ...)
├── data/                # Static fallback data + remote-with-fallback sources
├── lib/                 # Client: apiClient, turso entity layer, upload, slugify
│   └── server/          # Server-only: db.js (SQL), auth.js (HMAC sessions)
├── assets/              # Bundled images (logo)
public/                  # Static files (favicons, manifest)
scripts/                 # Maintenance scripts (seeding)
docs/                    # Plans, specs, product/design docs
```

## Routes

Public: `/`, `/about`, `/join-us`, `/committees`, `/committees/[slug]`, `/membership`, `/events`, `/events/[slug]`, `/gallery`, `/contact`.
Admin (password gate, HttpOnly session cookie): `/admin`, `/admin/events/new`, `/admin/events/[id]/edit`.
API: `/api/auth/*`, `/api/events/*`, `/api/committees/*`, `/api/gallery/*`, `/api/members/*`, `/api/partners/*`.

## Deployment

Standard Next.js hosting (Vercel, or `npm run build && npm start` anywhere Node runs). Provide the four env vars above; no SPA rewrite config needed.
