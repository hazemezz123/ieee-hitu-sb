# Recruitment Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin-controlled Heads & Vice-Heads recruitment system (per-form open/close, DB-backed applications, wizard UI, admin viewer + CSV) per `docs/superpowers/specs/2026-09-14-recruitment-design.md`.

**Architecture:** Turso tables `recruitment_forms` + `recruitment_applications` (JSON data column) behind Next.js `/api/recruitment/*` routes reusing `isAuthed` cookie auth; public wizard posts JSON; admin tab toggles `is_open` and manages applications. Adding Members later = one DB row.

**Tech Stack:** Next.js 16 App Router, React 19, Turso (pipeline fetch in `src/lib/server/db.js`), Cloudinary unsigned upload (`image/upload` for photo, `raw/upload` for CV), vitest + jsdom + Testing Library.

---

## File structure

- Create: `src/lib/recruitmentValidation.js` — pure shared validator + CSV columns (used by client AND server, single source of truth).
- Modify: `src/lib/server/db.js` — append recruitment schema + 7 helpers (no changes to existing helpers).
- Test: `src/lib/server/recruitment.test.js` — DB helper tests (fetch-mock pipeline pattern from `src/lib/server/turso.test.js`).
- Test: `src/lib/recruitmentValidation.test.js` — validator tests.
- Create: `src/app/api/recruitment/forms/route.js` — public GET list.
- Create: `src/app/api/recruitment/forms/[slug]/route.js` — public GET one + admin PUT.
- Create: `src/app/api/recruitment/applications/route.js` — public POST + admin GET list.
- Create: `src/app/api/recruitment/applications/[id]/route.js` — admin GET one + DELETE.
- Create: `src/app/api/recruitment/applications/export/route.js` — admin GET CSV.
- Test: extend `src/app/api/routes.test.js` — add recruitment describe blocks (mock `@/lib/server/db`, same `req()`/`authedCookie()` helpers already in file).
- Create: `src/lib/recruitment.js` — client fetchers mirroring `src/lib/turso.js` via `api()`.
- Modify: `src/lib/upload.js` — append `uploadFileToCloudinary` (raw/upload for CV PDFs).
- Create: `src/features/recruitment/components/HeadsApplicationForm.jsx` — 4-step wizard.
- Create: `src/features/recruitment/components/RecruitmentClosed.jsx` — closed state.
- Test: `src/features/recruitment/components/HeadsApplicationForm.test.jsx` — wizard behavior.
- Modify: `src/features/join-us/components/JoinUsPage.jsx` — fetch open status, render wizard or closed.
- Create: `src/features/admin/components/RecruitmentTab.jsx` — forms toggle + applications table + edit.
- Create: `src/features/admin/components/ApplicationDetail.jsx` — detail drawer.
- Modify: `src/features/admin/components/AdminShell.jsx` — add `recruitment` to tab list + render.
- Test: `src/features/admin/components/recruitmentTab.test.jsx` — admin toggle + list.

Conventions to follow (from codebase reads): `api()` client with `credentials: include`; admin writes return 401 without cookie, 201 with `{ id }`; public GETs never require auth; `Skeleton` for loading, `bg-error/10 border-error/30` error banner, `ConfirmDialog` for deletes, `form-input/form-select/form-textarea/form-label/btn btn-primary/btn-secondary/btn-ghost` classes, `page-enter` wrapper, no new deps.

---

### Task 1: Shared validator + CSV columns

**Files:**
- Create: `src/lib/recruitmentValidation.js`
- Test: `src/lib/recruitmentValidation.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/recruitmentValidation.test.js
import { describe, expect, it } from 'vitest'
import { HEADS_CSV_COLUMNS, validateHeadsApplication } from './recruitmentValidation'

describe('validateHeadsApplication', () => {
  const valid = {
    name: 'HITU Student', email: 'student@hitu.edu.eg', phone: '01001234567',
    address: '', photoUrl: 'https://drive.google.com/x', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    boardInterest: 'yes', role: 'Vice Head', firstPref: 'ai', secondPref: '',
    experience: '', activities: 'no', activitiesDetails: '', weeklyHours: '6',
    whyJoin: 'I want to learn and serve.', links: '', cvUrl: 'https://drive.google.com/cv', notes: '',
  }
  it('accepts a valid payload', () => {
    expect(validateHeadsApplication(valid)).toEqual({ ok: true })
  })
  it('rejects missing name with field', () => {
    expect(validateHeadsApplication({ ...valid, name: ' ' })).toEqual({ ok: false, field: 'name', error: 'Name is required.' })
  })
  it('rejects bad email', () => {
    expect(validateHeadsApplication({ ...valid, email: 'not-an-email' })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
  })
  it('requires role when boardInterest is yes', () => {
    expect(validateHeadsApplication({ ...valid, role: '' }).ok).toBe(false)
  })
  it('requires activitiesDetails when activities is yes', () => {
    expect(validateHeadsApplication({ ...valid, activities: 'yes', activitiesDetails: '' })).toEqual({ ok: false, field: 'activitiesDetails', error: 'Tell us about your activities.' })
  })
  it('requires photoUrl and cvUrl', () => {
    expect(validateHeadsApplication({ ...valid, photoUrl: '', cvUrl: '' }).ok).toBe(false)
  })
  it('exposes 23 CSV columns starting with id and created_at', () => {
    expect(HEADS_CSV_COLUMNS[0]).toBe('id')
    expect(HEADS_CSV_COLUMNS[1]).toBe('created_at')
    expect(HEADS_CSV_COLUMNS.length).toBe(23)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/recruitmentValidation.test.js`
Expected: FAIL with "Failed to resolve import ./recruitmentValidation"

- [ ] **Step 3: Write minimal implementation**

```js
// src/lib/recruitmentValidation.js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUrl(value) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

export const HEADS_FIELD_KEYS = ['name','email','phone','address','photoUrl','university','major','academicYear','grade','boardInterest','role','firstPref','secondPref','experience','activities','activitiesDetails','weeklyHours','whyJoin','links','cvUrl','notes']

export const HEADS_CSV_COLUMNS = ['id','created_at',...HEADS_FIELD_KEYS]

export function validateHeadsApplication(data = {}) {
  const v = pick => String(data[pick] ?? '').trim()
  if (!v('name')) return { ok: false, field: 'name', error: 'Name is required.' }
  if (!EMAIL_RE.test(v('email'))) return { ok: false, field: 'email', error: 'Enter a valid email address.' }
  if (!v('phone')) return { ok: false, field: 'phone', error: 'Phone number is required.' }
  if (v('photoUrl') && !isUrl(v('photoUrl'))) return { ok: false, field: 'photoUrl', error: 'Photo link must be a valid URL.' }
  if (!v('photoUrl')) return { ok: false, field: 'photoUrl', error: 'Add a personal photo or a Drive link.' }
  if (!v('university')) return { ok: false, field: 'university', error: 'University is required.' }
  if (!v('major')) return { ok: false, field: 'major', error: 'Major is required.' }
  if (!v('academicYear')) return { ok: false, field: 'academicYear', error: 'Academic year is required.' }
  if (!['yes','no'].includes(v('boardInterest'))) return { ok: false, field: 'boardInterest', error: 'Choose yes or no.' }
  if (v('boardInterest') === 'yes' && !v('role')) return { ok: false, field: 'role', error: 'Role is required for board applicants.' }
  if (!v('firstPref')) return { ok: false, field: 'firstPref', error: 'Choose your 1st preference.' }
  if (!['yes','no'].includes(v('activities'))) return { ok: false, field: 'activities', error: 'Choose yes or no.' }
  if (v('activities') === 'yes' && !v('activitiesDetails')) return { ok: false, field: 'activitiesDetails', error: 'Tell us about your activities.' }
  if (!v('weeklyHours')) return { ok: false, field: 'weeklyHours', error: 'Weekly hours are required.' }
  if (!v('whyJoin')) return { ok: false, field: 'whyJoin', error: 'Tell us why you want to join.' }
  if (v('links') && !v('links').split(',').map(s => s.trim()).filter(Boolean).every(isUrl)) return { ok: false, field: 'links', error: 'Links must be valid URLs separated by commas.' }
  if (!v('cvUrl')) return { ok: false, field: 'cvUrl', error: 'Add your CV or a Drive link.' }
  if (v('cvUrl') && !isUrl(v('cvUrl'))) return { ok: false, field: 'cvUrl', error: 'CV link must be a valid URL.' }
  return { ok: true }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/recruitmentValidation.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/recruitmentValidation.js src/lib/recruitmentValidation.test.js
git commit -m "feat: add heads recruitment validator"
```

---

### Task 2: DB layer — schema + helpers

**Files:**
- Modify: `src/lib/server/db.js`
- Test: `src/lib/server/recruitment.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/server/recruitment.test.js
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
const text = value => ({ type: 'text', value: String(value) })
const int = value => ({ type: 'integer', value: String(value) })

describe('recruitment db helpers', () => {
  it('fetchRecruitmentForms maps rows', async () => {
    vi.resetModules()
    const { fetchRecruitmentForms } = await import('./db.js')
    fetchMock.mockResolvedValue(okRows(
      [{ name: 'id' }, { name: 'slug' }, { name: 'title' }, { name: 'description' }, { name: 'is_open' }, { name: 'closed_title' }, { name: 'closed_message' }],
      [[int(1), text('heads'), text('Heads'), text('D'), int(1), text('Closed'), text('Later')]],
    ))
    const forms = await fetchRecruitmentForms()
    expect(forms).toEqual([{ _id: 1, slug: 'heads', title: 'Heads', description: 'D', isOpen: true, closedTitle: 'Closed', closedMessage: 'Later' }])
  })
  it('fetchRecruitmentFormBySlug returns null when missing', async () => {
    vi.resetModules()
    const { fetchRecruitmentFormBySlug } = await import('./db.js')
    fetchMock.mockResolvedValue(okRows([], []))
    expect(await fetchRecruitmentFormBySlug('heads')).toBeNull()
  })
  it('createRecruitmentApplication inserts JSON and returns id', async () => {
    vi.resetModules()
    const { createRecruitmentApplication } = await import('./db.js')
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 42 } } }] }) })
    const id = await createRecruitmentApplication(1, { name: 'A' })
    expect(id).toBe(42)
    const stmt = JSON.parse(fetchMock.mock.calls[0][1].body).requests[0].stmt
    expect(stmt.sql).toContain('INSERT INTO recruitment_applications')
    expect(JSON.parse(stmt.args[1].value)).toEqual({ name: 'A' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/server/recruitment.test.js`
Expected: FAIL with "fetchRecruitmentForms is not a function" (or not exported)

- [ ] **Step 3: Write minimal implementation** (append to end of `src/lib/server/db.js`, do not touch existing code)

```js
function rowToRecruitmentForm(row) {
  return {
    _id: Number(row.id) || 0,
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    description: row.description || '',
    isOpen: Number(row.is_open) === 1,
    closedTitle: row.closed_title || '',
    closedMessage: row.closed_message || '',
  }
}

function rowToRecruitmentApplication(row) {
  let data = {}
  try { data = JSON.parse(row.data || '{}') } catch { data = {} }
  return { _id: Number(row.id) || 0, formId: Number(row.form_id) || 0, data, createdAt: row.created_at || '' }
}

export async function fetchRecruitmentForms() {
  const result = await execute('SELECT * FROM recruitment_forms ORDER BY id')
  return (result?.rows || []).map(rowToRecruitmentForm)
}

export async function fetchRecruitmentFormBySlug(slug) {
  const result = await execute('SELECT * FROM recruitment_forms WHERE slug = ?', [slug])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToRecruitmentForm(rows[0]) : null
}

export async function updateRecruitmentForm(slug, patch = {}) {
  const sets = []
  const args = []
  if (patch.title !== undefined) { sets.push('title = ?'); args.push(patch.title) }
  if (patch.description !== undefined) { sets.push('description = ?'); args.push(patch.description) }
  if (patch.isOpen !== undefined) { sets.push('is_open = ?'); args.push(patch.isOpen ? 1 : 0) }
  if (patch.closedTitle !== undefined) { sets.push('closed_title = ?'); args.push(patch.closedTitle) }
  if (patch.closedMessage !== undefined) { sets.push('closed_message = ?'); args.push(patch.closedMessage) }
  sets.push("updated_at = datetime('now')")
  args.push(slug)
  await execute(`UPDATE recruitment_forms SET ${sets.join(', ')} WHERE slug = ?`, args)
}

export async function createRecruitmentApplication(formId, data) {
  const result = await execute(
    'INSERT INTO recruitment_applications (form_id, data) VALUES (?, ?)',
    [formId, JSON.stringify(data || {})],
  )
  return result?.last_insert_rowid
}

export async function fetchRecruitmentApplications(formId) {
  const result = await execute('SELECT * FROM recruitment_applications WHERE form_id = ? ORDER BY id DESC', [formId])
  return (result?.rows || []).map(rowToRecruitmentApplication)
}

export async function fetchRecruitmentApplicationById(id) {
  const result = await execute('SELECT * FROM recruitment_applications WHERE id = ?', [id])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToRecruitmentApplication(rows[0]) : null
}

export async function deleteRecruitmentApplication(id) {
  await execute('DELETE FROM recruitment_applications WHERE id = ?', [id])
}
```

And in `ensureSchema()`'s `SCHEMA_STATEMENTS` array add (keep existing entries, append these two):

```js
`CREATE TABLE IF NOT EXISTS recruitment_forms (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   slug TEXT UNIQUE NOT NULL,
   title TEXT NOT NULL,
   description TEXT,
   is_open INTEGER DEFAULT 0,
   closed_title TEXT,
   closed_message TEXT,
   created_at TEXT DEFAULT (datetime('now')),
   updated_at TEXT DEFAULT (datetime('now'))
 )`,
`CREATE TABLE IF NOT EXISTS recruitment_applications (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   form_id INTEGER NOT NULL,
   data TEXT NOT NULL,
   created_at TEXT DEFAULT (datetime('now'))
 )`,
`CREATE INDEX IF NOT EXISTS idx_recruitment_applications_form ON recruitment_applications(form_id, id DESC)`,
```

And after the existing `ensureSchema()` migrations, seed the heads form:

```js
const headsCheck = await execute("SELECT id FROM recruitment_forms WHERE slug = 'heads'")
if ((headsCheck?.rows || []).length === 0) {
  await execute(
    'INSERT INTO recruitment_forms (slug, title, description, is_open, closed_title, closed_message) VALUES (?, ?, ?, ?, ?, ?)',
    ['heads', 'Heads & Vice-Heads Recruitment', 'Apply to lead a committee as Head or Vice-Head.', 0, 'Recruitment is Closed', 'Heads recruitment is closed right now. Follow our events and check back for the next wave.'],
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/server/recruitment.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/db.js src/lib/server/recruitment.test.js
git commit -m "feat: add recruitment forms tables and helpers"
```

---

### Task 3: API routes

**Files:**
- Create: `src/app/api/recruitment/forms/route.js`
- Create: `src/app/api/recruitment/forms/[slug]/route.js`
- Create: `src/app/api/recruitment/applications/route.js`
- Create: `src/app/api/recruitment/applications/[id]/route.js`
- Create: `src/app/api/recruitment/applications/export/route.js`
- Modify: `src/app/api/routes.test.js` (append recruitment blocks)

- [ ] **Step 1: Write the failing route test** (append to `src/app/api/routes.test.js`; extend the hoisted mock with the 7 new db fns)

Add to the `vi.hoisted` object: `fetchRecruitmentForms: vi.fn(), fetchRecruitmentFormBySlug: vi.fn(), updateRecruitmentForm: vi.fn(), createRecruitmentApplication: vi.fn(), fetchRecruitmentApplications: vi.fn(), fetchRecruitmentApplicationById: vi.fn(), deleteRecruitmentApplication: vi.fn(),` and imports:

```js
import { GET as recruitmentFormsGET } from './recruitment/forms/route.js'
import { GET as recruitmentFormGET, PUT as recruitmentFormPUT } from './recruitment/forms/[slug]/route.js'
import { GET as applicationsGET, POST as applicationsPOST } from './recruitment/applications/route.js'
import { DELETE as applicationDELETE } from './recruitment/applications/[id]/route.js'
```

Append describe:

```js
describe('recruitment routes', () => {
  it('public form GETs never leak applications', async () => {
    turso.fetchRecruitmentForms.mockResolvedValue([{ _id: 1, slug: 'heads', isOpen: true }])
    const res = await recruitmentFormsGET()
    expect(res.status).toBe(200)
    expect(JSON.stringify(await res.json())).not.toContain('applications')
  })
  it('POST to a closed form returns 410 without inserting', async () => {
    turso.fetchRecruitmentFormBySlug.mockResolvedValue({ _id: 1, slug: 'heads', isOpen: false })
    const res = await applicationsPOST(req('/api/recruitment/applications', { method: 'POST', body: { formSlug: 'heads', data: { name: 'A', email: 'a@x.com' } } }))
    expect(res.status).toBe(410)
    expect(turso.createRecruitmentApplication).not.toHaveBeenCalled()
  })
  it('POST validates required fields with 400 + field', async () => {
    turso.fetchRecruitmentFormBySlug.mockResolvedValue({ _id: 1, slug: 'heads', isOpen: true })
    const res = await applicationsPOST(req('/api/recruitment/applications', { method: 'POST', body: { formSlug: 'heads', data: { name: '', email: 'bad' } } }))
    expect(res.status).toBe(400)
    expect((await res.json()).field).toBe('name')
  })
  it('admin PUT toggles is_open; admin list/delete require auth', async () => {
    const denied = await recruitmentFormPUT(req('/api/recruitment/forms/heads', { method: 'PUT', body: { isOpen: true } }), { params: Promise.resolve({ slug: 'heads' }) })
    expect(denied.status).toBe(401)
    const res = await recruitmentFormPUT(req('/api/recruitment/forms/heads', { method: 'PUT', body: { isOpen: true }, cookie: authedCookie() }), { params: Promise.resolve({ slug: 'heads' }) })
    expect(res.status).toBe(200)
    expect(turso.updateRecruitmentForm).toHaveBeenCalledWith('heads', { isOpen: true })
    expect((await applicationsGET(req('/api/recruitment/applications?form=heads'))).status).toBe(401)
    expect((await applicationDELETE(req('/api/x', { method: 'DELETE' }), { params: Promise.resolve({ id: '1' }) })).status).toBe(401)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/routes.test.js`
Expected: FAIL with "Failed to resolve import ./recruitment/forms/route.js"

- [ ] **Step 3: Write minimal implementations**

```js
// src/app/api/recruitment/forms/route.js
import { NextResponse } from 'next/server'
import { fetchRecruitmentForms } from '@/lib/server/db'

export async function GET() {
  try {
    const forms = await fetchRecruitmentForms()
    return NextResponse.json({ forms })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
```

```js
// src/app/api/recruitment/forms/[slug]/route.js
import { NextResponse } from 'next/server'
import { ensureSchema, fetchRecruitmentFormBySlug, updateRecruitmentForm } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET(req, { params }) {
  try {
    const { slug } = await params
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ form })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { slug } = await params
    const body = (await req.json().catch(() => ({}))) ?? {}
    const patch = {}
    if (body.title !== undefined) patch.title = String(body.title)
    if (body.description !== undefined) patch.description = String(body.description)
    if (body.isOpen !== undefined) patch.isOpen = Boolean(body.isOpen)
    if (body.closedTitle !== undefined) patch.closedTitle = String(body.closedTitle)
    if (body.closedMessage !== undefined) patch.closedMessage = String(body.closedMessage)
    await updateRecruitmentForm(slug, patch)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
```

```js
// src/app/api/recruitment/applications/route.js
import { NextResponse } from 'next/server'
import { createRecruitmentApplication, ensureSchema, fetchRecruitmentApplications, fetchRecruitmentFormBySlug } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'
import { validateHeadsApplication } from '@/lib/recruitmentValidation'

const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter(t => now - t < 60_000)
  if (list.length >= 5) return true
  list.push(now)
  hits.set(ip, list)
  return false
}

export async function GET(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const slug = new URL(req.url).searchParams.get('form') || 'heads'
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const applications = await fetchRecruitmentApplications(form._id)
    const q = (new URL(req.url).searchParams.get('q') || '').toLowerCase()
    const pref = new URL(req.url).searchParams.get('pref') || ''
    const rows = applications
      .map(a => ({ _id: a._id, name: String(a.data?.name || ''), email: String(a.data?.email || ''), firstPref: String(a.data?.firstPref || ''), createdAt: a.createdAt }))
      .filter(r => (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) && (!pref || r.firstPref === pref))
    return NextResponse.json({ applications: rows })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get?.('x-forwarded-for') || 'local'
    if (rateLimited(ip)) return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    const body = (await req.json().catch(() => ({}))) ?? {}
    if (body.company_website) return NextResponse.json({ id: 0 }, { status: 201 })
    const slug = String(body.formSlug || 'heads')
    await ensureSchema()
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!form.isOpen) return NextResponse.json({ error: 'Recruitment is closed.' }, { status: 410 })
    const check = validateHeadsApplication(body.data || {})
    if (!check.ok) return NextResponse.json({ error: check.error, field: check.field }, { status: 400 })
    const id = await createRecruitmentApplication(form._id, body.data)
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
```

```js
// src/app/api/recruitment/applications/[id]/route.js
import { NextResponse } from 'next/server'
import { deleteRecruitmentApplication, ensureSchema, fetchRecruitmentApplicationById } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const { id } = await params
    const application = await fetchRecruitmentApplicationById(Number(id))
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ application })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await deleteRecruitmentApplication(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
```

```js
// src/app/api/recruitment/applications/export/route.js
import { NextResponse } from 'next/server'
import { fetchRecruitmentApplications, fetchRecruitmentFormBySlug } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'
import { HEADS_CSV_COLUMNS } from '@/lib/recruitmentValidation'

function csvCell(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const slug = new URL(req.url).searchParams.get('form') || 'heads'
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const applications = await fetchRecruitmentApplications(form._id)
    const lines = [HEADS_CSV_COLUMNS.join(',')]
    for (const a of applications) {
      lines.push(HEADS_CSV_COLUMNS.map(col => col === 'id' ? a._id : col === 'created_at' ? a.createdAt : a.data?.[col] ?? '').map(csvCell).join(','))
    }
    return new NextResponse('﻿' + lines.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="recruitment-${slug}.csv"` } })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/routes.test.js`
Expected: PASS (all existing + 4 new recruitment tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/recruitment src/app/api/routes.test.js
git commit -m "feat: add recruitment forms and applications API"
```

---

### Task 4: Client lib + CV upload helper

**Files:**
- Create: `src/lib/recruitment.js`
- Modify: `src/lib/upload.js`
- Test: `src/lib/recruitmentClient.test.js` (fetch-mock for `api()`)

- [ ] **Step 1: Write the failing test**

```js
// src/lib/recruitmentClient.test.js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
const ok = payload => ({ ok: true, json: async () => payload })

describe('recruitment client', () => {
  it('fetches a form and submits an application', async () => {
    const { fetchRecruitmentForm, submitApplication } = await import('./recruitment.js')
    fetchMock.mockResolvedValueOnce(ok({ form: { slug: 'heads' } }))
    expect((await fetchRecruitmentForm('heads')).slug).toBe('heads')
    fetchMock.mockResolvedValueOnce(ok({ id: 7 }))
    expect(await submitApplication('heads', { name: 'A' })).toBe(7)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/recruitmentClient.test.js`
Expected: FAIL with "Failed to resolve import ./recruitment.js"

- [ ] **Step 3: Write minimal implementation**

```js
// src/lib/recruitment.js
import { api } from './apiClient'

export async function fetchRecruitmentForms() {
  const { forms } = await api('/api/recruitment/forms')
  return forms
}

export async function fetchRecruitmentForm(slug) {
  const { form } = await api(`/api/recruitment/forms/${encodeURIComponent(slug)}`)
  return form
}

export async function updateRecruitmentForm(slug, patch) {
  await api(`/api/recruitment/forms/${encodeURIComponent(slug)}`, { method: 'PUT', body: patch })
}

export async function submitApplication(formSlug, data) {
  const { id } = await api('/api/recruitment/applications', { method: 'POST', body: { formSlug, data } })
  return id
}

export async function fetchApplications(form = 'heads', { q = '', pref = '' } = {}) {
  const params = new URLSearchParams({ form, q, pref })
  const { applications } = await api(`/api/recruitment/applications?${params}`)
  return applications
}

export async function fetchApplication(id) {
  const { application } = await api(`/api/recruitment/applications/${id}`)
  return application
}

export async function deleteApplication(id) {
  await api(`/api/recruitment/applications/${id}`, { method: 'DELETE' })
}
```

Append to `src/lib/upload.js`:

```js
const CLOUD_NAME_FILE = 'dweqigxnz'
const UPLOAD_PRESET_FILE = 'ieee_uploads'

export async function uploadFileToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET_FILE)
  body.append('folder', 'ieee-recruitment')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME_FILE}/raw/upload`, { method: 'POST', body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
  if (!data.secure_url) throw new Error(`Upload failed (${res.status})`)
  return data.secure_url
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/recruitmentClient.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/recruitment.js src/lib/recruitmentClient.test.js src/lib/upload.js
git commit -m "feat: add recruitment client and file upload helper"
```

---

### Task 5: Public wizard + closed state

**Files:**
- Create: `src/features/recruitment/components/HeadsApplicationForm.jsx`
- Create: `src/features/recruitment/components/RecruitmentClosed.jsx`
- Test: `src/features/recruitment/components/HeadsApplicationForm.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/features/recruitment/components/HeadsApplicationForm.test.jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HeadsApplicationForm from './HeadsApplicationForm'

globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult: async () => ({ committees: [{ slug: 'ai', name: 'AI' }], source: 'remote' }) }))

describe('HeadsApplicationForm', () => {
  it('walks 4 steps and requires role only for board applicants', async () => {
    render(<HeadsApplicationForm />)
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '0100' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.change(screen.getByLabelText(/Academic Year/), { target: { value: '2nd' } })
    fireEvent.change(screen.getByLabelText(/Personal photo.*link/), { target: { value: 'https://drive.google.com/p' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/recruitment/components/HeadsApplicationForm.test.jsx`
Expected: FAIL with "Failed to resolve import ./HeadsApplicationForm"

- [ ] **Step 3: Write minimal implementation**

`RecruitmentClosed.jsx`:

```jsx
export default function RecruitmentClosed({ form }) {
  return (
    <section className="card p-8 md:p-12" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Heads Recruitment — Closed</p>
      <h2 className="mt-3 text-3xl font-black">{form?.closedTitle || 'Recruitment is Closed'}</h2>
      <p className="mt-4 text-on-surface-variant">{form?.closedMessage || 'Heads recruitment is closed right now. Check back for the next wave.'}</p>
      <div className="mt-6 flex gap-3">
        <a className="btn btn-secondary" href="/events">View events</a>
        <a className="btn btn-ghost" href="/committees">Explore committees</a>
      </div>
    </section>
  )
}
```

`HeadsApplicationForm.jsx` — full implementation (field order matches spec section 2):

```jsx
'use client'
import { useEffect, useState } from 'react'
import { submitApplication } from '@/lib/recruitment'
import { uploadToCloudinary, uploadFileToCloudinary } from '@/lib/upload'
import { validateHeadsApplication } from '@/lib/recruitmentValidation'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import { committees as fallbackCommittees } from '@/features/committees/data/committees'

const DRAFT_KEY = 'recruitment:heads:draft'
const emptyValues = { name: '', email: '', phone: '', address: '', photoUrl: '', university: '', major: '', academicYear: '', grade: '', boardInterest: '', role: '', firstPref: '', secondPref: '', experience: '', activities: '', activitiesDetails: '', weeklyHours: '', whyJoin: '', links: '', cvUrl: '', notes: '' }
const STEP_TITLES = ['Personal', 'Ambition', 'Story', 'Finish']

function loadDraft() {
  try { return { ...emptyValues, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') } } catch { return { ...emptyValues } }
}

export default function HeadsApplicationForm({ onClosed }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(loadDraft)
  const [photoFile, setPhotoFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [doneId, setDoneId] = useState(null)
  const [options, setOptions] = useState(fallbackCommittees)

  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)) } catch {} }, [values])
  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(r => { if (active && r?.committees?.length) setOptions(r.committees) }).catch(() => {})
    return () => { active = false }
  }, [])

  const set = key => e => { setFieldError(null); setValues(v => ({ ...v, [key]: e.target.value })) }
  const requiredFor = s => s === 0
    ? ['name', 'email', 'phone', 'photoUrl', 'university', 'major', 'academicYear']
    : s === 1 ? ['boardInterest', 'firstPref'] : s === 2 ? ['activities', 'weeklyHours', 'whyJoin'] : ['cvUrl']

  function next() {
    setError(null)
    if (step === 0 && !photoFile && !values.photoUrl.trim()) { setFieldError({ field: 'photoUrl', error: 'Add a personal photo or a Drive link.' }); return }
    if (step === 3 && !cvFile && !values.cvUrl.trim()) { setFieldError({ field: 'cvUrl', error: 'Add your CV or a Drive link.' }); return }
    for (const key of requiredFor(step)) {
      if (key === 'photoUrl' || key === 'cvUrl') continue
      if (!String(values[key] ?? '').trim()) { setFieldError({ field: key, error: `${key} is required.` }); return }
    }
    if (step === 1 && values.boardInterest === 'yes' && !values.role.trim()) { setFieldError({ field: 'role', error: 'Role is required for board applicants.' }); return }
    if (step === 2 && values.activities === 'yes' && !values.activitiesDetails.trim()) { setFieldError({ field: 'activitiesDetails', error: 'Tell us about your activities.' }); return }
    setFieldError(null)
    setStep(s => Math.min(s + 1, 3))
  }

  async function submit(e) {
    e.preventDefault()
    setError(null); setFieldError(null); setUploading(true)
    try {
      const photoUrl = photoFile ? await uploadToCloudinary(photoFile) : values.photoUrl.trim()
      const cvUrl = cvFile ? await uploadFileToCloudinary(cvFile) : values.cvUrl.trim()
      const payload = { ...values, photoUrl, cvUrl }
      const check = validateHeadsApplication(payload)
      if (!check.ok) { setFieldError(check); setUploading(false); return }
      const id = await submitApplication('heads', payload)
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
      setDoneId(id)
    } catch (err) {
      if (String(err.message || '').toLowerCase().includes('closed') || String(err.message || '').includes('410')) onClosed?.()
      else setError(err.message)
    }
    setUploading(false)
  }

  if (doneId) return <div role="status" className="card p-8"><h2 className="text-2xl font-black">Application recorded</h2><p className="mt-2 text-on-surface-variant">Reference #{doneId}. Thanks for your time — we will contact you if there are questions.</p></div>

  const errFor = name => fieldError?.field === name ? <p className="form-error" role="alert">{fieldError.error}</p> : null
  const input = (label, key, props = {}) => (
    <label className="form-label" htmlFor={`heads-${key}`}>{label}<input id={`heads-${key}`} className="form-input mt-2" value={values[key]} onChange={set(key)} {...props} />{errFor(key)}</label>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate={false}>
      <div><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step {step + 1}/4 — {STEP_TITLES[step]}</p>
        <div className="mt-2 h-1 bg-surface-container"><div className="h-1 bg-primary btn-wedge" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div>
      {error && <div role="alert" className="p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
      {step === 0 && <>
        {input('Full name', 'name', { required: true, type: 'text' })}
        {input('Email', 'email', { required: true, type: 'email' })}
        {input('Phone', 'phone', { required: true, type: 'tel' })}
        {input('Address', 'address')}
        <div><label className="form-label" htmlFor="heads-photoFile">Personal photo (file)</label><input id="heads-photoFile" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />{input('…or personal photo Drive link', 'photoUrl', { type: 'url', placeholder: 'https://drive.google.com/…' })}</div>
        {input('University', 'university', { required: true })}
        {input('Major', 'major', { required: true })}
        {input('Academic Year', 'academicYear', { required: true, placeholder: 'e.g. 2nd' })}
        {input('Current Academic Grade', 'grade')}
      </>}
      {step === 1 && <>
        <label className="form-label" htmlFor="heads-boardInterest">Interested in Heads Board positions?<select id="heads-boardInterest" className="form-select mt-2" value={values.boardInterest} onChange={set('boardInterest')} required><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option></select>{errFor('boardInterest')}</label>
        {values.boardInterest === 'yes' && input('Role', 'role', { required: true, placeholder: 'Head / Vice-Head…' })}
        <label className="form-label" htmlFor="heads-firstPref">1st preference<select id="heads-firstPref" className="form-select mt-2" value={values.firstPref} onChange={set('firstPref')} required><option value="">Select a committee</option>{options.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>{errFor('firstPref')}</label>
        <label className="form-label" htmlFor="heads-secondPref">2nd preference<select id="heads-secondPref" className="form-select mt-2" value={values.secondPref} onChange={set('secondPref')}><option value="">None</option>{options.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
        <label className="form-label" htmlFor="heads-experience">Your technical experience in this committee<textarea id="heads-experience" className="form-textarea mt-2" rows={4} value={values.experience} onChange={set('experience')} /></label>
      </>}
      {step === 2 && <>
        <label className="form-label" htmlFor="heads-activities">Any student activities experience?<select id="heads-activities" className="form-select mt-2" value={values.activities} onChange={set('activities')} required><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option></select>{errFor('activities')}</label>
        {values.activities === 'yes' && <label className="form-label" htmlFor="heads-activitiesDetails">Tell us more about your activities<textarea id="heads-activitiesDetails" className="form-textarea mt-2" rows={4} value={values.activitiesDetails} onChange={set('activitiesDetails')} />{errFor('activitiesDetails')}</label>}
        {input('Weekly commit hours', 'weeklyHours', { required: true, placeholder: 'e.g. 6' })}
        <label className="form-label" htmlFor="heads-whyJoin">Why do you want to join IEEE HITU?<textarea id="heads-whyJoin" className="form-textarea mt-2" rows={4} required value={values.whyJoin} onChange={set('whyJoin')} />{errFor('whyJoin')}</label>
        {input('Social / professional / technical links (comma-separated)', 'links', { type: 'text', placeholder: 'https://…, https://…' })}
      </>}
      {step === 3 && <>
        <div><label className="form-label" htmlFor="heads-cvFile">CV (PDF file)</label><input id="heads-cvFile" type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} />{input('…or CV Drive link', 'cvUrl', { type: 'url', placeholder: 'https://drive.google.com/…' })}</div>
        <label className="form-label" htmlFor="heads-notes">Questions / notes<textarea id="heads-notes" className="form-textarea mt-2" rows={4} value={values.notes} onChange={set('notes')} placeholder="Thanks for your time — drop questions here and we'll contact you." /></label>
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </>}
      <div className="flex gap-3">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < 3
          ? <button type="button" className="btn btn-primary btn-wedge" onClick={next}>Continue</button>
          : <button type="submit" className="btn btn-primary btn-wedge" disabled={uploading}>{uploading ? 'Submitting…' : 'Submit application'}</button>}
        <button type="button" className="btn btn-ghost" onClick={() => { setValues({ ...emptyValues }); setPhotoFile(null); setCvFile(null); try { localStorage.removeItem(DRAFT_KEY) } catch {} }}>Clear</button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/recruitment/components/HeadsApplicationForm.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/recruitment/components/HeadsApplicationForm.jsx src/features/recruitment/components/RecruitmentClosed.jsx src/features/recruitment/components/HeadsApplicationForm.test.jsx
git commit -m "feat: add heads application wizard and closed state"
```

---

### Task 6: JoinUsPage rework

**Files:**
- Modify: `src/features/join-us/components/JoinUsPage.jsx`
- Modify: `src/features/join-us/components/recruitment.test.jsx` (update Join assertions to async open-state)

- [ ] **Step 1: Update the failing test** — replace the `join` entry in the `it.each` honest-outcome block so Join asserts the new behavior:

```jsx
it('loads the heads form status and shows the wizard when open', async () => {
  const { fetchRecruitmentForm } = await import('@/lib/recruitment.js')
  ...
})
```

(Concrete: mock `@/lib/recruitment.js` `fetchRecruitmentForm` to resolve `{ slug: 'heads', title: 'Heads', isOpen: true }`; render `<JoinUsPage />`; `findByText(/Step 1\/4/)`; then mock `isOpen: false` + closedTitle and expect closed copy. Keep Contact's `InterestForm` assertions untouched.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx`
Expected: FAIL (JoinUsPage has no Step 1/4 yet)

- [ ] **Step 3: Write minimal implementation**

```jsx
'use client'
import { useEffect, useState } from 'react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Skeleton from '@/components/ui/Skeleton'
import HeadsApplicationForm from '@/features/recruitment/components/HeadsApplicationForm'
import RecruitmentClosed from '@/features/recruitment/components/RecruitmentClosed'
import { fetchRecruitmentForm } from '@/lib/recruitment'
import { committees } from '@/features/committees/data/committees'

export default function JoinUsPage() {
  const [form, setForm] = useState(null)
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    let active = true
    fetchRecruitmentForm('heads').then(f => { if (active) { setForm(f); setStatus('ready') } }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [])
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection><header className="container mx-auto max-w-4xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Heads &amp; Vice-Heads Recruitment</p>
        <h1 className="mt-3 text-4xl font-black text-on-surface md:text-6xl">Lead an IEEE HITU Committee</h1>
        <p className="mt-6 max-w-2xl text-lg text-on-surface-variant">{form?.description || 'Apply to lead a committee as Head or Vice-Head.'}</p>
        <p className="mt-8" aria-label={`${committees.length} committees`}><strong className="text-3xl text-primary">{committees.length}</strong> <span className="text-on-surface-variant">committees</span></p>
      </header></AnimatedSection>
      <AnimatedSection delay={1}>
        <section className="py-16"><div className="container mx-auto max-w-3xl px-6 sm:px-8 md:px-12">
          {status === 'loading' && <div role="status"><span className="sr-only">Loading recruitment status...</span><Skeleton className="h-10 w-64" /><Skeleton className="mt-4 h-40 w-full" /></div>}
          {status === 'error' && <div role="alert" className="card p-6">Recruitment status could not be loaded. Please try again later.</div>}
          {status === 'ready' && (form?.isOpen ? <HeadsApplicationForm onClosed={() => setForm({ ...form, isOpen: false })} /> : <RecruitmentClosed form={form} />)}
        </div></section>
      </AnimatedSection>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/join-us/components/JoinUsPage.jsx src/features/join-us/components/recruitment.test.jsx
git commit -m "feat: wire join-us page to recruitment open status"
```

---

### Task 7: Admin Recruitment tab + shell wiring

**Files:**
- Create: `src/features/admin/components/RecruitmentTab.jsx`
- Create: `src/features/admin/components/ApplicationDetail.jsx`
- Modify: `src/features/admin/components/AdminShell.jsx`
- Test: `src/features/admin/components/recruitmentTab.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/features/admin/components/recruitmentTab.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RecruitmentTab from './RecruitmentTab'

vi.mock('@/lib/recruitment', () => ({
  fetchRecruitmentForms: async () => [{ _id: 1, slug: 'heads', title: 'Heads', isOpen: false, description: '' }],
  fetchApplications: async () => [{ _id: 2, name: 'HITU Student', email: 's@hitu.edu.eg', firstPref: 'ai', createdAt: '2026-09-01' }],
  updateRecruitmentForm: vi.fn(),
  deleteApplication: vi.fn(),
}))

describe('RecruitmentTab', () => {
  it('shows the toggle and the applications', async () => {
    render(<RecruitmentTab />)
    expect(await screen.findByRole('switch', { name: /heads/i })).toBeTruthy()
    expect(await screen.findByText('HITU Student')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/admin/components/recruitmentTab.test.jsx`
Expected: FAIL with "Failed to resolve import ./RecruitmentTab"

- [ ] **Step 3: Write minimal implementation**

`ApplicationDetail.jsx`: drawer (`role=dialog aria-label`) listing all 22 fields from `application.data` + `createdAt`, photo/CV as `<a target=_blank rel=noreferrer>`, Close button + Delete button (calls `onDelete`, parent confirms via `ConfirmDialog`).

`ApplicationDetail.jsx` (full):

```jsx
'use client'
export default function ApplicationDetail({ application, onClose, onDelete }) {
  const d = application?.data || {}
  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Address', d.address], ['Photo', d.photoUrl], ['University', d.university], ['Major', d.major], ['Academic Year', d.academicYear], ['Grade', d.grade], ['Board Interest', d.boardInterest], ['Role', d.role], ['1st Preference', d.firstPref], ['2nd Preference', d.secondPref], ['Experience', d.experience], ['Activities', d.activities], ['Activities Details', d.activitiesDetails], ['Weekly Hours', d.weeklyHours], ['Why Join', d.whyJoin], ['Links', d.links], ['CV', d.cvUrl], ['Notes', d.notes], ['Submitted', application?.createdAt]]
  return (
    <div role="dialog" aria-label={`Application ${application?._id}`} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black">Application #{application?._id}</h3>
        <button className="btn btn-ghost text-xs" onClick={onClose}>Close</button>
      </div>
      <dl className="flex flex-col gap-3">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{k}</dt>
            <dd className="mt-1 text-sm break-words">{(k === 'Photo' || k === 'CV') && v ? <a className="text-primary underline" href={v} target="_blank" rel="noreferrer">{v}</a> : (v || '—')}</dd></div>
        ))}
      </dl>
      <button className="btn btn-ghost text-xs text-error mt-6" onClick={onDelete}>Delete application</button>
    </div>
  )
}
```

`RecruitmentTab.jsx` (full):

```jsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import { deleteApplication, fetchApplications, fetchRecruitmentForms, updateRecruitmentForm } from '@/lib/recruitment'
import { fetchCommittees } from '@/lib/turso'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import ApplicationDetail from './ApplicationDetail'

export default function RecruitmentTab() {
  const [forms, setForms] = useState([])
  const [apps, setApps] = useState([])
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [pref, setPref] = useState('')
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      setForms(await fetchRecruitmentForms())
      setApps(await fetchApplications('heads', { q: search, pref }))
      if (committees.length === 0) setCommittees(await fetchCommittees().catch(() => []))
    } catch (err) { setError(err.message) }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pref])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget load
  useEffect(() => { load() }, [load])

  async function toggle(form) {
    const next = !form.isOpen
    setForms(fs => fs.map(f => f.slug === form.slug ? { ...f, isOpen: next } : f))
    try { await updateRecruitmentForm(form.slug, { isOpen: next }) }
    catch (err) { setForms(fs => fs.map(f => f.slug === form.slug ? { ...f, isOpen: !next } : f)); setError(err.message) }
  }

  async function saveEdit(e) {
    e.preventDefault()
    try { await updateRecruitmentForm(editing.slug, editing); setEditing(null); await load() }
    catch (err) { setError(err.message) }
  }

  async function confirmDelete() {
    try { await deleteApplication(deleteTarget._id); setDeleteTarget(null); setSelected(null); await load() }
    catch (err) { setError(err.message) }
  }

  if (selected) return (<><button className="btn btn-ghost text-xs mb-4" onClick={() => setSelected(null)}>← All applications</button><ApplicationDetail application={selected} onClose={() => setSelected(null)} onDelete={() => setDeleteTarget(selected)} />{deleteTarget && <ConfirmDialog title="Delete Application" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>Delete application #{deleteTarget._id}? This cannot be undone.</ConfirmDialog>}</>)

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Recruitment</h2>
      {error && <div className="my-4 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
      {loading ? <div role="status"><span className="sr-only">Loading...</span><Skeleton className="h-10 w-full" /><Skeleton className="mt-2 h-40 w-full" /></div> : <>
        {forms.map(f => (
          <div key={f.slug} className="card p-4 my-4 flex items-center justify-between gap-4">
            <div><p className="font-bold">{f.title}</p><p className="text-sm text-on-surface-variant">{f.isOpen ? 'Open' : 'Closed'}</p></div>
            <div className="flex gap-2">
              <button role="switch" aria-checked={f.isOpen} aria-label={`${f.title} open switch`} className={f.isOpen ? 'btn btn-primary text-xs' : 'btn btn-secondary text-xs'} onClick={() => toggle(f)}>{f.isOpen ? 'Open — click to close' : 'Closed — click to open'}</button>
              <button className="btn btn-ghost text-xs" onClick={() => setEditing({ ...f })}>Edit</button>
            </div>
          </div>
        ))}
        {editing && <form onSubmit={saveEdit} className="card p-4 my-4"><label className="form-label" htmlFor="rec-title">Title<input id="rec-title" className="form-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-desc">Description<textarea id="rec-desc" className="form-textarea" rows={2} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-closed-title">Closed title<input id="rec-closed-title" className="form-input" value={editing.closedTitle || ''} onChange={e => setEditing({ ...editing, closedTitle: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-closed-msg">Closed message<textarea id="rec-closed-msg" className="form-textarea" rows={2} value={editing.closedMessage || ''} onChange={e => setEditing({ ...editing, closedMessage: e.target.value })} /></label><div className="mt-3 flex gap-2"><button className="btn btn-primary text-xs" type="submit">Save</button><button className="btn btn-ghost text-xs" type="button" onClick={() => setEditing(null)}>Cancel</button></div></form>}
        <div className="my-4 flex flex-wrap gap-3">
          <input className="form-input max-w-xs" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search applications" />
          <select className="form-select max-w-xs" value={pref} onChange={e => setPref(e.target.value)} aria-label="Filter by preference"><option value="">All preferences</option>{committees.map(c => <option key={c._id || c.slug} value={c.slug}>{c.name}</option>)}</select>
          <button className="btn btn-secondary text-xs" onClick={load}>Refresh</button>
          <a className="btn btn-ghost text-xs" href="/api/recruitment/applications/export?form=heads">Export CSV</a>
        </div>
        {apps.length === 0 ? <div className="text-center py-16 text-on-surface-variant">No applications yet.</div> : (
          <table className="w-full text-sm"><thead><tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4 hidden sm:table-cell">1st pref</th><th className="pb-3 pr-4 hidden md:table-cell">Email</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>{apps.map(a => <tr key={a._id} className="border-b border-outline-variant/10"><td className="py-3 pr-4 font-medium">{a.name}</td><td className="py-3 pr-4 hidden sm:table-cell">{a.firstPref || '—'}</td><td className="py-3 pr-4 hidden md:table-cell">{a.email}</td><td className="py-3"><div className="flex gap-2"><button className="btn btn-ghost text-xs" onClick={async () => { const { fetchApplication } = await import('@/lib/recruitment'); setSelected(await fetchApplication(a._id)) }}>View</button><button className="btn btn-ghost text-xs text-error" onClick={() => setDeleteTarget(a)}>Delete</button></div></td></tr>)}</tbody></table>
        )}
      </>}
      {deleteTarget && !selected && <ConfirmDialog title="Delete Application" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>Delete application #{deleteTarget._id}? This cannot be undone.</ConfirmDialog>}
    </div>
  )
}
```

`AdminShell.jsx` edits: add `import RecruitmentTab from "./RecruitmentTab"`; change tab array to `["events", "gallery", "committees", "partners", "recruitment"]` with label mapping adding `name === "recruitment" ? "Recruitment" : ...`; add render branch `tab === "recruitment" ? (<RecruitmentTab />) :` before the EventsTable fallback. No header change needed (RecruitmentTab owns its heading like GalleryTab).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/admin/components/recruitmentTab.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/RecruitmentTab.jsx src/features/admin/components/ApplicationDetail.jsx src/features/admin/components/AdminShell.jsx src/features/admin/components/recruitmentTab.test.jsx
git commit -m "feat: add recruitment admin tab with open-close control"
```

---

### Task 8: Full verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: zero errors (fix any `react-hooks` warnings with the established `// eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget load` comment used in GalleryTab/CommitteesTab).

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: all suites PASS, including `routes.test.js`, `recruitment.test.js`, `recruitmentValidation.test.js`, `HeadsApplicationForm.test.jsx`, `recruitmentTab.test.jsx`, and the untouched Contact `InterestForm` tests.

- [ ] **Step 3: Manual smoke checklist** (dev server with Turso env set)

Run: `npm run dev`, then: open `/join-us` (wizard visible when admin opens Heads form); submit one test application; close form in `/admin` → Recruitment tab; reload `/join-us` (closed state, no form); reopen; verify application appears in admin table; export CSV opens with 22 columns; delete test row. Record any failure as a new bug task — do not ship with red items.

- [ ] **Step 4: Commit any final fixes separately**

```bash
git add -A
git commit -m "fix: recruitment review fixes"
```

Only if fixes were needed; otherwise skip this commit.
