# Admin Server-Side Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the admin password check and all Turso database access behind Vercel serverless `/api` endpoints so no secret ships in the client bundle.

**Architecture:** New `api/` folder holds stateless serverless functions. `api/_lib/auth.js` signs/verifies HMAC session cookies; `api/_lib/turso.js` is the only module that touches Turso (env credentials). Reads are public, writes require the session cookie. The frontend `src/lib/turso.js` keeps identical export names but becomes a thin `/api` fetch client, so existing callers and `*Source.js` modules need no changes.

**Tech Stack:** Vercel Serverless Functions (Node ESM), `node:crypto` (HMAC, timing-safe compare), existing React/Vite frontend, Vitest.

---

## Prerequisites (do once, before Task 1)

- `git status --short` currently shows mass deletions (` D ieee-app/...`) plus everything untracked — the git index root does not match the working tree. **Do not run any `Commit` step until this is repaired** (re-clone into a clean checkout or fix the index with the repo owner). Verify with: `git status --short` shows only your intended files.
- Create `.env.local` (gitignored via `*.local`) for local dev:
  ```
  ADMIN_PASSWORD=dev-only-password
  TURSO_DATABASE_URL=https://ieee-events-hazemezz123.aws-us-east-1.turso.io/v2/pipeline
  TURSO_AUTH_TOKEN=<current-token>
  SESSION_SECRET=<32+ random bytes, e.g. output of node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
  ```
- All commands run from repo root (`ieee-app/`). Test runner: `npm test -- <path-filter>` (runs `vitest run`).

## File map

| File | Action | Responsibility |
|---|---|---|
| `api/_lib/auth.js` | Create | Session sign/verify, password compare, rate limit, cookie helpers |
| `api/_lib/auth.test.js` | Create | Unit tests for the above |
| `api/_lib/turso.js` | Create | Server-only Turso pipeline client + all SQL (ported from `src/lib/turso.js`) |
| `api/_lib/turso.test.js` | Create | Protocol/arg-mapping tests (ported from `src/lib/turso.test.js`) + missing-env test |
| `api/auth/login.js` | Create | `POST` login, sets session cookie |
| `api/auth/logout.js` | Create | `POST` logout, clears cookie |
| `api/auth/me.js` | Create | `GET` session check |
| `api/auth/auth.test.js` | Create | Handler tests for login/logout/me |
| `api/events/index.js` | Create | `GET` list (public), `POST` create (authed) |
| `api/events/[id].js` | Create | `GET` one (public), `PUT`/`DELETE` (authed) |
| `api/events/events.test.js` | Create | Handler tests incl. 401-without-cookie |
| `api/gallery/index.js`, `api/gallery/[id].js` | Create | Photo list/add (public/add-authed), delete (authed) |
| `api/committees/index.js`, `api/committees/[id].js` | Create | Committee CRUD, reads public |
| `api/members/index.js`, `api/members/[id].js` | Create | Member create (authed, committee via body), read/update/delete |
| `api/partners/index.js`, `api/partners/[id].js` | Create | Partner CRUD, reads public |
| `api/resources.test.js` | Create | One 401-gating + one happy-path test per resource above |
| `src/lib/apiClient.js` | Create | `fetch` wrapper with `credentials:'include'` + error normalization |
| `src/lib/turso.js` | Rewrite | Same export names/signatures, implemented via `/api` (no secrets) |
| `src/lib/apiClient.test.js` | Create | Wrapper tests with mocked `fetch` |
| `src/lib/turso.test.js` | Rewrite | Tests for the API-client (mocked `fetch`); DB-protocol tests live in `api/_lib/turso.test.js` now |
| `src/pages/AdminPage.jsx` | Modify | Login/logout/me via `/api/auth/*`; drop `ADMIN_PASSWORD` + `sessionStorage` + `ensureSchema` call |
| `src/pages/admin.test.jsx` | Modify | Auth tests use mocked `fetch` for `/api/auth/*` instead of `sessionStorage` |
| `.env.example` | Create | Documents the four required env vars (no values) |

`src/data/*Source.js`, `EventFormPage.jsx`, `GalleryTab.jsx`, `CommitteesTab.jsx`, `PartnersTab.jsx`, public pages: **no changes** (same import names). `vercel.json`: **no change** — Vercel routes `/api/*` to functions before SPA rewrites; verified in Task 8.

---

### Task 1: Server session helper

**Files:**
- Create: `api/_lib/auth.js`
- Test: `api/_lib/auth.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkRateLimit,
  clearLoginAttempts,
  createSession,
  getSessionToken,
  isAuthed,
  passwordsEqual,
  signSession,
  verifySessionToken,
} from './auth.js'

beforeEach(() => {
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  vi.stubEnv('ADMIN_PASSWORD', 'correct-horse')
  clearLoginAttempts()
})

describe('passwordsEqual', () => {
  it('accepts the right password and rejects the wrong one without throwing on length mismatch', () => {
    expect(passwordsEqual('correct-horse')).toBe(true)
    expect(passwordsEqual('wrong')).toBe(false)
    expect(passwordsEqual('')).toBe(false)
    expect(passwordsEqual(undefined)).toBe(false)
  })
})

describe('session round-trip', () => {
  it('creates a token that verifies, and rejects tampered or expired tokens', () => {
    const { token, maxAge } = createSession()
    expect(maxAge).toBe(43200)
    expect(verifySessionToken(token)).toBe(true)
    expect(verifySessionToken(token.replace(/\d/, '9'))).toBe(false)
    expect(verifySessionToken('garbage')).toBe(false)
    expect(verifySessionToken(null)).toBe(false)
    const past = Math.floor(Date.now() / 1000) - 10
    expect(verifySessionToken(signSession(past))).toBe(false)
  })
})

describe('cookies and request auth', () => {
  it('extracts admin_session from a cookie header and authed-checks the request', () => {
    const { token } = createSession()
    const req = { headers: { cookie: `other=1; admin_session=${encodeURIComponent(token)}` } }
    expect(getSessionToken(req)).toBe(token)
    expect(isAuthed(req)).toBe(true)
    expect(isAuthed({ headers: {} })).toBe(false)
    expect(isAuthed({ headers: { cookie: 'admin_session=forged.abc' } })).toBe(false)
  })
})

describe('login rate limit', () => {
  it('allows 10 attempts per minute per IP then blocks', () => {
    for (let i = 0; i < 10; i++) expect(checkRateLimit('1.2.3.4')).toBe(true)
    expect(checkRateLimit('1.2.3.4')).toBe(false)
    expect(checkRateLimit('5.6.7.8')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/_lib/auth.test.js`
Expected: FAIL with "Failed to resolve import './auth.js'" (file does not exist yet).

- [ ] **Step 3: Write minimal implementation**

```js
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_MAX_AGE = 12 * 60 * 60 // seconds
const LOGIN_WINDOW_MS = 60 * 1000
const LOGIN_MAX_ATTEMPTS = 10
const attempts = new Map()

function sessionSecret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not set')
  return s
}

export function passwordsEqual(provided) {
  const expected = process.env.ADMIN_PASSWORD || ''
  const a = createHash('sha256').update(String(provided ?? ''), 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(a, b)
}

export function signSession(expiresAt) {
  const payload = String(expiresAt)
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function createSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  return { token: signSession(expiresAt), maxAge: SESSION_MAX_AGE }
}

export function verifySessionToken(token) {
  if (typeof token !== 'string') return false
  const dot = token.indexOf('.')
  if (dot < 0) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const exp = Number(payload)
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function getSessionToken(req) {
  const header = req.headers?.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    if (part.slice(0, idx).trim() === 'admin_session') {
      return decodeURIComponent(part.slice(idx + 1).trim())
    }
  }
  return null
}

export function isAuthed(req) {
  try {
    return verifySessionToken(getSessionToken(req))
  } catch {
    return false
  }
}

export function checkRateLimit(ip) {
  const now = Date.now()
  const list = (attempts.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS)
  if (list.length >= LOGIN_MAX_ATTEMPTS) return false
  list.push(now)
  attempts.set(ip, list)
  return true
}

export function clearLoginAttempts() {
  attempts.clear()
}

export function sessionCookie(token, maxAge, isProd) {
  const parts = [
    `admin_session=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    'HttpOnly',
  ]
  if (isProd) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookie(isProd) {
  return sessionCookie('', 0, isProd)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/_lib/auth.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/auth.js api/_lib/auth.test.js
git commit -m "feat(api): add HMAC session helper with password compare and rate limit"
```

---

### Task 2: Server Turso client (port existing SQL server-side)

**Files:**
- Create: `api/_lib/turso.js`
- Test: `api/_lib/turso.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TURSO_DATABASE_URL', 'https://example.turso.io/v2/pipeline')
  vi.stubEnv('TURSO_AUTH_TOKEN', 'token-abc')
})

function okRows(cols, rows) {
  return { json: async () => ({ results: [{ type: 'ok', response: { result: { cols, rows } } }] }) }
}

const text = (value) => ({ type: 'text', value: String(value) })

describe('server turso client', () => {
  it('throws when env credentials are missing', async () => {
    vi.stubEnv('TURSO_AUTH_TOKEN', '')
    const { fetchEvents } = await import('./turso.js?missing-env')
    await expect(fetchEvents()).rejects.toThrow('Turso is not configured')
  })

  it('sends the bearer token and maps text/integer args', async () => {
    vi.resetModules()
    const { deleteEvent } = await import('./turso.js')
    fetchMock.mockResolvedValue(okRows([], []))
    await deleteEvent(7)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.turso.io/v2/pipeline')
    expect(options.headers.Authorization).toBe('Bearer token-abc')
    const stmt = JSON.parse(options.body).requests[0].stmt
    expect(stmt.sql).toContain('DELETE FROM events WHERE id = ?')
    expect(stmt.args).toEqual([{ type: 'integer', value: '7' }])
  })

  it('maps rows to event objects with status and categoryLabel', async () => {
    vi.resetModules()
    const { fetchEvents } = await import('./turso.js')
    fetchMock.mockResolvedValue(
      okRows(
        [{ name: 'id' }, { name: 'title' }, { name: 'slug' }, { name: 'date' }, { name: 'category' },
         { name: 'gallery' }, { name: 'location' }, { name: 'cover_image' }, { name: 'card_image' },
         { name: 'excerpt' }, { name: 'description' }, { name: 'organizer_committee' }, { name: 'event_link' }, { name: 'end_date' }],
        [[[1], 'T', 't', '2999-01-01', 'workshops', '[]', 'L', '', '', '', '', null, '', null].map((v, i) =>
          Array.isArray(v) ? { type: 'integer', value: String(v[0]) } : text(v ?? ''))],
      ),
    )
    const events = await fetchEvents()
    expect(events[0]).toMatchObject({ _id: 1, title: 'T', status: 'upcoming', categoryLabel: 'Workshops' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/_lib/turso.test.js`
Expected: FAIL with "Failed to resolve import './turso.js'".

- [ ] **Step 3: Write minimal implementation**

Port `src/lib/turso.js` verbatim with exactly two changes: (1) the `DB_URL`/`DB_TOKEN` constants become env reads that throw when unset; (2) no other logic changes. The file must export: `fetchEvents`, `fetchEventBySlug`, `createEvent`, `updateEvent`, `deleteEvent`, `ensureSchema`, `fetchGalleryPhotos`, `addGalleryPhoto`, `deleteGalleryPhoto`, `fetchCommittees`, `fetchCommitteeBySlug`, `createCommittee`, `updateCommittee`, `deleteCommittee`, `fetchCommitteeMembers`, `fetchAllMembers`, `createCommitteeMember`, `updateCommitteeMember`, `deleteCommitteeMember`, `fetchPartners`, `createPartner`, `updatePartner`, `deletePartner`.

```js
function dbUrl() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error('Turso is not configured')
  return url
}

function dbToken() {
  const token = process.env.TURSO_AUTH_TOKEN
  if (!token) throw new Error('Turso is not configured')
  return token
}

async function execute(sql, params = []) {
  const body = {
    requests: [{
      type: 'execute',
      stmt: { sql, args: params.map(v => {
        if (v === null || v === undefined) return { type: 'null' }
        const type = typeof v === 'number' ? 'integer' : 'text'
        return { type, value: String(v) }
      }) },
    }],
  }

  const res = await fetch(dbUrl(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${dbToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  // ... identical result-mapping, rowToEvent, and all query functions from src/lib/turso.js
}
```

Copy every function body (`rowToEvent`, `fetchEvents`, `createEvent`, …, `deletePartner`, `ensureSchema` with `SCHEMA_STATEMENTS`) unchanged from `src/lib/turso.js:4-325`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- api/_lib/turso.test.js`
Expected: PASS (3 tests). Also port the remaining protocol assertions from `src/lib/turso.test.js` (arg mapping, error-branch `item.type === 'error'` throws) into this file when they apply to unchanged code — keep all ported assertions green.

Run: `npm test -- src/lib/turso.test.js`
Expected: still PASS (old client untouched so far).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/turso.js api/_lib/turso.test.js
git commit -m "feat(api): add server-only Turso client using env credentials"
```

---

### Task 3: Auth endpoints (login / logout / me)

**Files:**
- Create: `api/auth/login.js`
- Create: `api/auth/logout.js`
- Create: `api/auth/me.js`
- Test: `api/auth/auth.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'
import login from './login.js'
import logout from './logout.js'
import me from './me.js'
import { clearLoginAttempts } from '../_lib/auth.js'

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

beforeEach(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'correct-horse')
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  clearLoginAttempts()
})

describe('POST /api/auth/login', () => {
  it('sets an HttpOnly session cookie on the right password', async () => {
    const res = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'correct-horse' } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(res.headers['Set-Cookie']).toMatch(/^admin_session=.+; Path=\/; Max-Age=43200; SameSite=Lax; HttpOnly/)
  })

  it('rejects a wrong password without setting a cookie', async () => {
    const res = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, res)
    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid credentials' })
    expect(res.headers['Set-Cookie']).toBeUndefined()
  })

  it('rejects non-POST methods and rate-limits after 10 attempts', async () => {
    const get = mockRes()
    await login({ method: 'GET', headers: {}, body: {} }, get)
    expect(get.statusCode).toBe(405)
    for (let i = 0; i < 10; i++) {
      await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, mockRes())
    }
    const limited = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, limited)
    expect(limited.statusCode).toBe(429)
  })
})

describe('logout and me', () => {
  it('me returns false without a cookie and true with a login cookie', async () => {
    const anon = mockRes()
    await me({ method: 'GET', headers: {} }, anon)
    expect(anon.body).toEqual({ authed: false })

    const loginRes = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'correct-horse' } }, loginRes)
    const cookie = loginRes.headers['Set-Cookie'].split(';')[0]
    const authed = mockRes()
    await me({ method: 'GET', headers: { cookie } }, authed)
    expect(authed.body).toEqual({ authed: true })
  })

  it('logout clears the cookie', async () => {
    const res = mockRes()
    await logout({ method: 'POST', headers: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Set-Cookie']).toMatch(/^admin_session=; Path=\//)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/auth/auth.test.js`
Expected: FAIL with "Failed to resolve import './login.js'".

- [ ] **Step 3: Write minimal implementation**

`api/auth/login.js`:
```js
import { checkRateLimit, createSession, passwordsEqual, sessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts, try again later' })
  }
  const { password } = req.body ?? {}
  if (!passwordsEqual(password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const { token, maxAge } = createSession()
  res.setHeader('Set-Cookie', sessionCookie(token, maxAge, process.env.NODE_ENV === 'production'))
  return res.status(200).json({ ok: true })
}
```

`api/auth/logout.js`:
```js
import { clearSessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  res.setHeader('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'))
  return res.status(200).json({ ok: true })
}
```

`api/auth/me.js`:
```js
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  return res.status(200).json({ authed: isAuthed(req) })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/auth/auth.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add api/auth/login.js api/auth/logout.js api/auth/me.js api/auth/auth.test.js
git commit -m "feat(api): add login/logout/me endpoints with session cookie"
```

---

### Task 4: Events endpoints

**Files:**
- Create: `api/events/index.js`
- Create: `api/events/[id].js`
- Test: `api/events/events.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEventBySlug: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))
vi.mock('../_lib/turso.js', () => turso)

const { default: index } = await import('./index.js')
const { default: byId } = await import('./[id].js')
import { createSession } from '../_lib/auth.js'

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

function authedReq(extra = {}) {
  const { token } = createSession()
  return { headers: { cookie: `admin_session=${token}` }, ...extra }
}

beforeEach(() => {
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  Object.values(turso).forEach((fn) => fn.mockReset())
})

describe('events api', () => {
  it('GET /api/events is public and returns { events }', async () => {
    turso.fetchEvents.mockResolvedValue([{ _id: 1 }])
    const res = mockRes()
    await index({ method: 'GET', headers: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ events: [{ _id: 1 }] })
  })

  it('POST /api/events requires auth and returns 201 with the id', async () => {
    const anon = mockRes()
    await index({ method: 'POST', headers: {}, body: { title: 'X' } }, anon)
    expect(anon.statusCode).toBe(401)
    expect(turso.createEvent).not.toHaveBeenCalled()

    turso.createEvent.mockResolvedValue(9)
    const res = mockRes()
    await index({ method: 'POST', ...authedReq(), body: { title: 'X' } }, res)
    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({ id: 9 })
    expect(turso.ensureSchema).toHaveBeenCalledOnce()
  })

  it('PUT and DELETE by id require auth; GET by slug stays public', async () => {
    turso.fetchEventBySlug.mockResolvedValue({ _id: 3 })
    const pub = mockRes()
    await byId({ method: 'GET', headers: {}, query: { slug: 'x' } }, pub)
    expect(pub.statusCode).toBe(200)

    const denied = mockRes()
    await byId({ method: 'DELETE', headers: {}, query: { id: '3' } }, denied)
    expect(denied.statusCode).toBe(401)

    const res = mockRes()
    await byId({ method: 'PUT', ...authedReq(), query: { id: '3' }, body: { title: 'Y' } }, res)
    expect(res.statusCode).toBe(200)
    expect(turso.updateEvent).toHaveBeenCalledWith(3, { title: 'Y' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/events/events.test.js`
Expected: FAIL with "Failed to resolve import './index.js'".

- [ ] **Step 3: Write minimal implementation**

`api/events/index.js`:
```js
import { createEvent, fetchEvents } from '../_lib/turso.js'
import { ensureSchema } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const events = await fetchEvents()
      return res.status(200).json({ events })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const id = await createEvent(req.body ?? {})
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/events/[id].js`:
```js
import { deleteEvent, fetchEventBySlug, fetchEvents, updateEvent } from '../_lib/turso.js'
import { ensureSchema } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (req.query?.slug) {
        const event = await fetchEventBySlug(String(req.query.slug))
        return res.status(200).json({ event })
      }
      const events = await fetchEvents()
      return res.status(200).json({ event: events.find((e) => e._id === Number(req.query?.id)) ?? null })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updateEvent(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteEvent(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/events/events.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add api/events/index.js "api/events/[id].js" api/events/events.test.js
git commit -m "feat(api): add public-read authed-write events endpoints"
```

---

### Task 5: Gallery, committees, members, partners endpoints

**Files:**
- Create: `api/gallery/index.js`, `api/gallery/[id].js`
- Create: `api/committees/index.js`, `api/committees/[id].js`
- Create: `api/members/index.js`, `api/members/[id].js`
- Create: `api/partners/index.js`, `api/partners/[id].js`
- Test: `api/resources.test.js`

Pattern per file (repeat exactly, only names/SQL helpers differ): `GET` is public, every other method calls `isAuthed(req)` first and `ensureSchema()` before writing, `catch` returns `500 { error: 'Database error' }`, wrong method returns `405` with an `Allow` header.

`api/gallery/index.js`:
```js
import { addGalleryPhoto, ensureSchema, fetchGalleryPhotos } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const photos = await fetchGalleryPhotos()
      return res.status(200).json({ photos })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const { src, caption } = req.body ?? {}
      const id = await addGalleryPhoto(src, caption)
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/gallery/[id].js`:
```js
import { deleteGalleryPhoto, ensureSchema } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', 'DELETE')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    await deleteGalleryPhoto(Number(req.query?.id))
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/committees/index.js`:
```js
import { createCommittee, ensureSchema, fetchCommittees } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const committees = await fetchCommittees()
      return res.status(200).json({ committees })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const id = await createCommittee(req.body ?? {})
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/committees/[id].js`:
```js
import { deleteCommittee, ensureSchema, fetchCommitteeMembers, updateCommittee } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const members = await fetchCommitteeMembers(Number(req.query?.id))
      return res.status(200).json({ members })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updateCommittee(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteCommittee(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/members/index.js` (committee id comes from the body, matching `createCommitteeMember(committeeId, data)`):
```js
import { createCommitteeMember, ensureSchema, fetchAllMembers } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const members = await fetchAllMembers()
      return res.status(200).json({ members })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const { committeeId, ...data } = req.body ?? {}
      const id = await createCommitteeMember(Number(committeeId), data)
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/members/[id].js`:
```js
import { deleteCommitteeMember, ensureSchema, updateCommitteeMember } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updateCommitteeMember(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteCommitteeMember(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/partners/index.js`:
```js
import { createPartner, ensureSchema, fetchPartners } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const partners = await fetchPartners()
      return res.status(200).json({ partners })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const id = await createPartner(req.body ?? {})
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/partners/[id].js`:
```js
import { deletePartner, ensureSchema, updatePartner } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updatePartner(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deletePartner(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

- [ ] **Step 1: Write the failing test** (`api/resources.test.js`)

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  fetchCommittees: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  createCommittee: vi.fn(),
  updateCommittee: vi.fn(),
  deleteCommittee: vi.fn(),
  fetchAllMembers: vi.fn(),
  createCommitteeMember: vi.fn(),
  updateCommitteeMember: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchPartners: vi.fn(),
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  deletePartner: vi.fn(),
}))
vi.mock('./_lib/turso.js', () => turso)

const { default: galleryIndex } = await import('./gallery/index.js')
const { default: galleryById } = await import('./gallery/[id].js')
const { default: committeesIndex } = await import('./committees/index.js')
const { default: committeeById } = await import('./committees/[id].js')
const { default: membersIndex } = await import('./members/index.js')
const { default: memberById } = await import('./members/[id].js')
const { default: partnersIndex } = await import('./partners/index.js')
const { default: partnerById } = await import('./partners/[id].js')
import { createSession } from './_lib/auth.js'

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

function authedReq(extra = {}) {
  const { token } = createSession()
  return { headers: { cookie: `admin_session=${token}` }, ...extra }
}

beforeEach(() => {
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  Object.values(turso).forEach((fn) => fn.mockReset())
})

describe('resource endpoints', () => {
  it('GETs are public; writes return 401 without a cookie', async () => {
    turso.fetchGalleryPhotos.mockResolvedValue([])
    turso.fetchCommittees.mockResolvedValue([])
    turso.fetchAllMembers.mockResolvedValue([])
    turso.fetchPartners.mockResolvedValue([])
    for (const [handler, fn] of [
      [galleryIndex, turso.fetchGalleryPhotos],
      [committeesIndex, turso.fetchCommittees],
      [membersIndex, turso.fetchAllMembers],
      [partnersIndex, turso.fetchPartners],
    ]) {
      const pub = mockRes()
      await handler({ method: 'GET', headers: {} }, pub)
      expect(pub.statusCode).toBe(200)
      expect(fn).toHaveBeenCalledOnce()
      const denied = mockRes()
      await handler({ method: 'POST', headers: {}, body: {} }, denied)
      expect(denied.statusCode).toBe(401)
    }
    const delDenied = mockRes()
    await galleryById({ method: 'DELETE', headers: {}, query: { id: '1' } }, delDenied)
    expect(delDenied.statusCode).toBe(401)
    expect(turso.deleteGalleryPhoto).not.toHaveBeenCalled()
  })

  it('authed writes reach the DB helpers with the right args', async () => {
    turso.addGalleryPhoto.mockResolvedValue(1)
    turso.createCommittee.mockResolvedValue(2)
    turso.createCommitteeMember.mockResolvedValue(3)
    turso.createPartner.mockResolvedValue(4)
    turso.fetchCommitteeMembers.mockResolvedValue([])

    let res = mockRes()
    await galleryIndex({ method: 'POST', ...authedReq(), body: { src: 's', caption: 'c' } }, res)
    expect(res.statusCode).toBe(201)
    expect(turso.addGalleryPhoto).toHaveBeenCalledWith('s', 'c')

    res = mockRes()
    await committeesIndex({ method: 'POST', ...authedReq(), body: { name: 'N' } }, res)
    expect(turso.createCommittee).toHaveBeenCalledWith({ name: 'N' })

    res = mockRes()
    await membersIndex({ method: 'POST', ...authedReq(), body: { committeeId: 5, name: 'M' } }, res)
    expect(turso.createCommitteeMember).toHaveBeenCalledWith(5, { name: 'M' })

    res = mockRes()
    await partnersIndex({ method: 'POST', ...authedReq(), body: { name: 'P' } }, res)
    expect(turso.createPartner).toHaveBeenCalledWith({ name: 'P' })

    res = mockRes()
    await committeeById({ method: 'DELETE', ...authedReq(), query: { id: '6' } }, res)
    expect(turso.deleteCommittee).toHaveBeenCalledWith(6)

    res = mockRes()
    await memberById({ method: 'PUT', ...authedReq(), query: { id: '7' }, body: { name: 'Z' } }, res)
    expect(turso.updateCommitteeMember).toHaveBeenCalledWith(7, { name: 'Z' })

    res = mockRes()
    await partnerById({ method: 'DELETE', ...authedReq(), query: { id: '8' } }, res)
    expect(turso.deletePartner).toHaveBeenCalledWith(8)

    res = mockRes()
    await galleryById({ method: 'DELETE', ...authedReq(), query: { id: '9' } }, res)
    expect(turso.deleteGalleryPhoto).toHaveBeenCalledWith(9)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/resources.test.js`
Expected: FAIL with "Failed to resolve import './gallery/index.js'".

- [ ] **Step 3: Write minimal implementation**

Create the eight handler files exactly as shown above (copy each block into its file).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/resources.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add api/gallery api/committees api/members api/partners api/resources.test.js
git commit -m "feat(api): add gallery/committee/member/partner endpoints with auth gating"
```

---

### Task 6: Frontend API client (drop secrets from the bundle)

**Files:**
- Create: `src/lib/apiClient.js`
- Test: `src/lib/apiClient.test.js`
- Rewrite: `src/lib/turso.js` (same export names, fetch-based, no secrets)
- Rewrite: `src/lib/turso.test.js` (tests the fetch-based client)

No changes to `src/data/eventsSource.js`, `committeeSource.js`, `gallerySource.js`, `partnersSource.js` — they keep importing the same names from `../lib/turso`.

- [ ] **Step 1: Write the failing tests**

`src/lib/apiClient.test.js`:
```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, apiAuthed } from './apiClient'

const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => vi.unstubAllGlobals())

describe('apiClient', () => {
  it('sends credentials:include and returns parsed JSON', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ events: [1] }) })
    const data = await api('/api/events')
    expect(fetchMock).toHaveBeenCalledWith('/api/events', expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }))
    expect(data).toEqual({ events: [1] })
  })

  it('POSTs JSON bodies and throws normalized errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Unauthenticated' }) })
    await expect(apiAuthed('/api/events', { title: 'X' })).rejects.toThrow('Unauthenticated')
    const [, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ title: 'X' })
  })

  it('falls back to status text when the error body is empty', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('no json') } })
    await expect(api('/api/events')).rejects.toThrow('Request failed (500)')
  })
})
```

Append to `src/lib/turso.test.js` replacement (full-file rewrite — new content):
```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent, deleteEvent, fetchEvents, fetchGalleryPhotos } from './turso'

const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => vi.unstubAllGlobals())

describe('api-backed turso client', () => {
  it('fetchEvents unwraps { events }', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ events: [{ _id: 1 }] }) })
    expect(await fetchEvents()).toEqual([{ _id: 1 }])
    expect(fetchMock).toHaveBeenCalledWith('/api/events', expect.anything())
  })

  it('createEvent POSTs and deleteEvent DELETEs by id', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: 9 }) })
    await createEvent({ title: 'X' })
    expect(fetchMock).toHaveBeenCalledWith('/api/events', expect.objectContaining({ method: 'POST' }))
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    await deleteEvent(9)
    expect(fetchMock).toHaveBeenCalledWith('/api/events/9', expect.objectContaining({ method: 'DELETE' }))
  })

  it('fetchGalleryPhotos unwraps { photos }', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ photos: [] }) })
    expect(await fetchGalleryPhotos()).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/apiClient.test.js`
Expected: FAIL with "Failed to resolve import './apiClient'".

- [ ] **Step 3: Write minimal implementation**

`src/lib/apiClient.js`:
```js
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export function apiAuthed(path, body) {
  return api(path, { method: 'POST', body })
}
```

`src/lib/turso.js` (full rewrite — same 22 export names, zero secrets):
```js
import { api } from './apiClient'

// Reads are public GETs; writes POST/PUT/DELETE the authed /api endpoints
// (auth is the HttpOnly session cookie, sent automatically).
export async function fetchEvents() {
  const { events } = await api('/api/events')
  return events
}

export async function fetchEventBySlug(slug) {
  const { event } = await api(`/api/events/by-slug?slug=${encodeURIComponent(slug)}`)
  return event
}

export async function createEvent(data) {
  const { id } = await api('/api/events', { method: 'POST', body: data })
  return id
}

export async function updateEvent(id, data) {
  await api(`/api/events/${id}`, { method: 'PUT', body: data })
}

export async function deleteEvent(id) {
  await api(`/api/events/${id}`, { method: 'DELETE' })
}

export async function fetchGalleryPhotos() {
  const { photos } = await api('/api/gallery')
  return photos
}

export async function addGalleryPhoto(src, caption) {
  const { id } = await api('/api/gallery', { method: 'POST', body: { src, caption } })
  return id
}

export async function deleteGalleryPhoto(id) {
  await api(`/api/gallery/${id}`, { method: 'DELETE' })
}

export async function fetchCommittees() {
  const { committees } = await api('/api/committees')
  return committees
}

export async function fetchCommitteeBySlug(slug) {
  const { committee } = await api(`/api/committees/by-slug?slug=${encodeURIComponent(slug)}`)
  return committee
}

export async function createCommittee(data) {
  const { id } = await api('/api/committees', { method: 'POST', body: data })
  return id
}

export async function updateCommittee(id, data) {
  await api(`/api/committees/${id}`, { method: 'PUT', body: data })
}

export async function deleteCommittee(id) {
  await api(`/api/committees/${id}`, { method: 'DELETE' })
}

export async function fetchCommitteeMembers(committeeId) {
  const { members } = await api(`/api/committees/${committeeId}/members`)
  return members
}

export async function fetchAllMembers() {
  const { members } = await api('/api/members')
  return members
}

export async function createCommitteeMember(committeeId, data) {
  const { id } = await api('/api/members', { method: 'POST', body: { committeeId, ...data } })
  return id
}

export async function updateCommitteeMember(id, data) {
  await api(`/api/members/${id}`, { method: 'PUT', body: data })
}

export async function deleteCommitteeMember(id) {
  await api(`/api/members/${id}`, { method: 'DELETE' })
}

export async function fetchPartners() {
  const { partners } = await api('/api/partners')
  return partners
}

export async function createPartner(data) {
  const { id } = await api('/api/partners', { method: 'POST', body: data })
  return id
}

export async function updatePartner(id, data) {
  await api(`/api/partners/${id}`, { method: 'PUT', body: data })
  return undefined
}

export async function deletePartner(id) {
  await api(`/api/partners/${id}`, { method: 'DELETE' })
}
```

This introduces three extra server routes not built in Tasks 4–5: `GET /api/events/by-slug`, `GET /api/committees/by-slug`, `GET /api/committees/[id]/members`. Add them now as part of this task:

`api/events/by-slug.js`:
```js
import { fetchEventBySlug } from '../_lib/turso.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const event = await fetchEventBySlug(String(req.query?.slug ?? ''))
    return res.status(200).json({ event })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

`api/committees/by-slug.js`:
```js
import { fetchCommitteeBySlug, fetchCommitteeMembers } from '../_lib/turso.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const committee = await fetchCommitteeBySlug(String(req.query?.slug ?? ''))
    if (!committee) return res.status(200).json({ committee: null, members: [] })
    const members = await fetchCommitteeMembers(committee._id)
    return res.status(200).json({
      committee,
      members: members.map((member) => ({ ...member, committee: committee.name })),
    })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
```

Change `api/committees/[id].js` GET to return `{ committee: null }` shape? No — `fetchCommitteeMembers`-only GET already returns `{ members }`; update `committeeSource.js`? No: `fetchCommitteeDetailResult` calls `tursoFetchCommitteeBySlug` + `tursoFetchCommitteeMembers` separately, and the client above exposes both, so the source module works unchanged. But `api/committees/[id].js` GET currently serves members — that matches `fetchCommitteeMembers(committeeId)`. Keep it. (The `by-slug` route returns committee+members together for convenience but the source module does not use it; harmless.)

Wait — consistency check: `fetchCommitteeDetailResult` in `committeeSource.js` calls both client functions, producing two HTTP requests. Acceptable (YAGNI: no extra endpoint needed). The `by-slug` committee route above is then unused — delete it to respect YAGNI. Keep only `api/events/by-slug.js` (needed by `fetchEventBySlug`). Remove `api/committees/by-slug.js` from this task.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/apiClient.test.js src/lib/turso.test.js`
Expected: PASS (6 tests), all green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/apiClient.js src/lib/apiClient.test.js src/lib/turso.js src/lib/turso.test.js api/events/by-slug.js
git commit -m "feat(web): route all DB access through authed /api endpoints"
```

---

### Task 7: AdminPage server auth flow

**Files:**
- Modify: `src/pages/AdminPage.jsx`
- Modify: `src/pages/admin.test.jsx`

Current code references: `ADMIN_PASSWORD` const (`AdminPage.jsx:11`), `sessionStorage` check (`:16`), `handleLogin` (`:62-69`), `ensureSchema` import (`:4`) and call (`:39`), `handleLogout` (`:87-90`).

- [ ] **Step 1: Rewrite the auth tests to fail against the old component**

Replace the `sessionStorage`-based tests in `src/pages/admin.test.jsx` with fetch-mocked API auth. Keep the existing `vi.mock('../data/eventsSource')` and `vi.mock('../lib/turso')` blocks unchanged. Add at the top of the file:

```js
const fetchMock = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', fetchMock)

function apiAuth({ authed }) {
  fetchMock.mockImplementation((url) => {
    if (String(url).endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ authed }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
}

function mockLoginOnce(ok) {
  fetchMock.mockImplementation((url) => {
    if (String(url).endsWith('/api/auth/login')) {
      return Promise.resolve(ok
        ? { ok: true, json: async () => ({ ok: true }) }
        : { ok: false, status: 401, json: async () => ({ error: 'Invalid credentials' }) })
    }
    if (String(url).endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ authed: false }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
}
```

Replace the first two tests in `describe('admin authentication and event list')` with:

```js
it('rejects a wrong password, then logs in via the API', async () => {
  mockLoginOnce(false)
  renderRoute('/admin')
  expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
  fireEvent.click(screen.getByRole('button', { name: 'Login' }))
  expect(await screen.findByText('Invalid credentials')).toBeTruthy()
  expect(screen.queryByRole('heading', { name: 'Manage Events' })).toBeNull()
})

it('restores a valid session from /api/auth/me and loads events', async () => {
  apiAuth({ authed: true })
  fetchEvents.mockResolvedValue([event])
  renderRoute('/admin')
  expect(await screen.findByText('Robotics Workshop')).toBeTruthy()
  expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ credentials: 'include' }))
  expect(fetchEvents).toHaveBeenCalledOnce()
})
```

And in `beforeEach`, replace `sessionStorage.clear()` / `sessionStorage.setItem('admin_auth', 'ieee2026')` lines with `apiAuth({ authed: true })` for the tests that need a logged-in state, plus `fetchMock.mockReset()`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/pages/admin.test.jsx`
Expected: FAIL — old component reads `sessionStorage` and never calls `fetch('/api/auth/me')`, so `findByText('Robotics Workshop')` times out and login posts nowhere.

- [ ] **Step 3: Rewrite AdminPage auth block (minimal diff)**

Replace `AdminPage.jsx:1-23` header and auth logic:

```jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../data/eventsSource";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import GalleryTab from "./admin/GalleryTab";
import CommitteesTab from "./admin/CommitteesTab";
import PartnersTab from "./admin/PartnersTab";

async function apiAuth(path, body) {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState("events");
```

Replace the `useEffect` at `:36-60` (schema + events bootstrap) with:

```jsx
  useEffect(() => {
    let active = true;
    apiAuth("/api/auth/me")
      .then(({ authed }) => { if (active) setAuthed(authed); })
      .catch(() => { if (active) setAuthed(false); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    fetchEvents()
      .then((data) => { if (active) setEvents(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authed]);
```

Replace `handleLogin` (`:62-69`) and `handleLogout` (`:87-90`) with:

```jsx
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      await apiAuth("/api/auth/login", { password });
      setPassword("");
      setLoading(true);
      setAuthed(true);
    } catch (err) {
      setLoginError(err.message);
    }
  }
```

```jsx
  async function handleLogout() {
    try {
      await apiAuth("/api/auth/logout", {});
    } catch {
      // cookie may already be expired; still log out locally
    }
    setAuthed(false);
    setPassword("");
  }
```

Render logic: change `if (!authed)` to `if (checking)` → return the same loading skeleton block used for events (`role="status"` with `Loading...`); then `if (!authed)` → login form as today plus `{loginError && (...)}` error banner above the Password label reusing the `bg-error/10 border-error/30` classes. Delete the `ADMIN_PASSWORD` const, the `ensureSchema` import, and the `turso.ensureSchema` test expectation (`admin.test.jsx:264` `expect(turso.ensureSchema).toHaveBeenCalledOnce()` → delete that line; keep the "events view as default tab" assertion).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/pages/admin.test.jsx`
Expected: PASS — full file green (auth + form + tabs suites).

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPage.jsx src/pages/admin.test.jsx
git commit -m "feat(web): authenticate admin via server session cookie"
```

---

### Task 8: Env docs, secret rotation, final verification

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

```
ADMIN_PASSWORD=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
SESSION_SECRET=
```

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: all test files PASS (no failures, no unhandled errors). Fix any fallout in `EventFormPage.test.jsx`, `galleryTab.test.jsx`, `committeesTab.test.jsx`, `partnersTab.test.jsx` caused by Tasks 6–7 (they mock `../lib/turso` / `../../lib/turso` by export name — names are preserved, so expect zero changes; if a test imports `ensureSchema`, remove that import line only).

- [ ] **Step 3: Build and prove no secrets ship to the client**

Run: `npm run build`
Expected: `vite build` succeeds, `dist/` emitted.

Run: `Select-String -Path dist/assets/*.js -Pattern "ieee2026|turso.io|eyJhbGciOiJFZERTQS"`
Expected: no matches (old password, DB URL, and JWT token absent from the bundle). If any match appears, the leaking import must be removed before proceeding.

- [ ] **Step 4: Post-deploy manual checks (Vercel env vars set first)**

1. Set `ADMIN_PASSWORD` (new value), `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (rotated — the old token is in git history), `SESSION_SECRET` in the Vercel dashboard and redeploy.
2. `curl https://<app>/api/auth/me` → `{"authed":false}` (proves `/api` is served, not SPA-rewritten).
3. Wrong password login → `401 {"error":"Invalid credentials"}`; right password → `200` + `Set-Cookie: admin_session=...; HttpOnly`.
4. Unauthenticated `POST /api/events` → `401`; old client bundle cannot write (token no longer in JS).
5. Rotate checklist: old Turso token revoked in Turso dashboard, old `ieee2026` password retired.

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "chore: document server env vars for admin auth"
```

---

## Self-review

- **Spec coverage:** login/logout/me (spec Endpoints) → Tasks 1+3; public-GET/authed-write resources → Tasks 4+5; env-only secrets → Tasks 2+8; frontend rewiring + fallback preservation (`*Source.js` untouched, static fallbacks intact) → Tasks 6+7; rotation → Task 8 step 4; uploads stay unsigned/out-of-scope as specified.
- **Placeholder scan:** no TBD/TODO/generic steps — every step has exact file paths, full code, exact commands with expected output.
- **Type consistency:** cookie name `admin_session` and `{ events }`/`{ photos }`/`{ committees }`/`{ members }`/`{ partners }`/`{ event }`/`{ committee }` envelopes match between server handlers and the Task 6 client; `createCommitteeMember(committeeId, data)` split matches the existing helper signature; `updatePartner` return normalized to `undefined` as before.

## Execution deviations (2026-09-13)

- Added `api/committees/by-slug.js` (+ `by-slug.test.js`): the Task 6 client needs `GET /api/committees/by-slug?slug=` for `fetchCommitteeBySlug` (used by `committeeSource.js` / `CommitteeDetailPage`). Without it the request would hit `[id].js` and fail.
- Client `fetchCommitteeMembers` calls `GET /api/committees/:id` (served by `[id].js`), not `/api/committees/:id/members` — no such nested route exists.
- All `Commit` steps skipped: git index root mismatch (mass phantom ` D ieee-app/...` deletions) still unresolved — repair before committing.
- `admin.test.jsx`: one extra fix beyond the plan — Cancel-navigation assertion changed from sync `getByRole` to `findByRole` for the new `checking` state.
- Post-plan bugfix (2026-09-14): `api()` resolved `{}` on 2xx-non-JSON (vite dev serves raw `api/` sources as 200 text/javascript; Vercel SPA fallback can do similar), so `fetchEvents()` returned `undefined` and `Home` crashed in `sortEvents`. Fixed `api()` to throw when the body isn't parseable JSON — existing `*Source` fallbacks now engage. Regression test in `apiClient.test.js`; verified live against `vite dev`.
