# Admin Gallery + Committee Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the admin dashboard with a Gallery tab (upload/delete standalone photos via Cloudinary) and a Committees tab (CRUD committees + members), persisted in Turso, with DB-first public pages.

**Architecture:** Three new Turso tables (`gallery_photos`, `committees`, `committee_members`) managed through the existing raw-SQL wrapper in `src/lib/turso.js`. New source modules (`gallerySource`, `committeeSource`) follow the existing `eventsSource` pattern: Turso first, static fallback. AdminPage gains a tab shell hosting two new tab components. Photo upload goes straight to Cloudinary via an unsigned preset, storing the returned URL.

**Tech Stack:** React 19, react-router-dom 7, Vite 8, Vitest 4 + Testing Library (jsdom), Tailwind v4 (custom `btn`/`card`/`form-input` classes), Turso (remote SQLite), Cloudinary unsigned upload.

**Spec:** `docs/superpowers/specs/2026-08-17-admin-gallery-committees-design.md`

**Repo layout:** git repo root is `C:\Users\Administrator\Desktop\HITU\IEEE\website`; the app is in `ieee-app/`. All commands run from `ieee-app/`. Commit from the repo root.

**Test commands (run in `ieee-app/`):** `npx vitest run <file>` — expected PASS output per task.

---

### Task 1: Shared slugify util

**Files:**
- Create: `ieee-app/src/lib/slugify.js`
- Modify: `ieee-app/src/pages/EventFormPage.jsx:19-21`
- Test: `ieee-app/src/lib/slugify.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/slugify.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases, strips non-alphanumerics, and joins with dashes', () => {
    expect(slugify('AI & Robotics 101')).toBe('ai-robotics-101')
    expect(slugify('Web')).toBe('web')
    expect(slugify('  Multi   Media  ')).toBe('multi-media')
    expect(slugify('')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/slugify.test.js`
Expected: FAIL with "Failed to resolve import './slugify'"

- [ ] **Step 3: Write the implementation**

`src/lib/slugify.js`:

```js
export const slugify = text => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-')
```

- [ ] **Step 4: Reuse it in EventFormPage (delete the local copy)**

In `src/pages/EventFormPage.jsx`, delete lines 19-21 (the local `function slugify`) and add the import at the top:

```js
import { slugify } from '../lib/slugify'
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npx vitest run src/lib/slugify.test.js src/pages/admin.test.jsx`
Expected: PASS (admin.test.jsx slug generation test still green — `ai-robotics-101`)

- [ ] **Step 6: Commit**

```bash
git add ieee-app/src/lib/slugify.js ieee-app/src/lib/slugify.test.js ieee-app/src/pages/EventFormPage.jsx
git commit -m "refactor: extract shared slugify util"
```

---

### Task 2: Cloudinary upload helper

**Files:**
- Create: `ieee-app/src/lib/upload.js`
- Test: `ieee-app/src/lib/upload.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/upload.test.js`:

```js
import { afterEach, describe, expect, it, vi } from 'vitest'
import { uploadToCloudinary } from './upload'

describe('uploadToCloudinary', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts the file with preset and folder, returning secure_url', async () => {
    const json = vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/dweqigxnz/image/upload/v1/x.jpg' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    const url = await uploadToCloudinary(file)

    expect(url).toBe('https://res.cloudinary.com/dweqigxnz/image/upload/v1/x.jpg')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [endpoint, options] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/dweqigxnz/image/upload')
    expect(options.method).toBe('POST')
    const body = options.body
    expect(body.get('upload_preset')).toBe('ieee_uploads')
    expect(body.get('folder')).toBe('ieee-admin')
    expect(body.get('file')).toBe(file)
  })

  it('throws a readable error when Cloudinary rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid preset' } }),
    }))

    await expect(uploadToCloudinary(new File(['x'], 'a.png', { type: 'image/png' })))
      .rejects.toThrow('Invalid preset')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/upload.test.js`
Expected: FAIL with "Failed to resolve import './upload'"

- [ ] **Step 3: Write the implementation**

`src/lib/upload.js`:

```js
const CLOUD_NAME = 'dweqigxnz'
const UPLOAD_PRESET = 'ieee_uploads'

export async function uploadToCloudinary(file) {
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', 'ieee-admin')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Upload failed (${res.status})`)
  return data.secure_url
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/upload.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/lib/upload.js ieee-app/src/lib/upload.test.js
git commit -m "feat: add Cloudinary unsigned upload helper"
```

---

### Task 3: Turso data layer — schema bootstrap + gallery/committee/member CRUD

**Files:**
- Modify: `ieee-app/src/lib/turso.js` (append below existing `deleteEvent`)
- Test: `ieee-app/src/lib/turso.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/turso.test.js` (mocks `global.fetch` and inspects the SQL + args the wrapper sends):

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addGalleryPhoto,
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  deleteGalleryPhoto,
  ensureSchema,
  fetchAllMembers,
  fetchCommitteeMembers,
  fetchCommittees,
  fetchGalleryPhotos,
  updateCommittee,
  updateCommitteeMember,
} from './turso'

function selectResult(cols, rows) {
  return { results: [{ type: 'ok', response: { result: { cols, rows } } }] }
}

const text = value => ({ type: 'text', value: String(value) })
const integer = value => ({ type: 'integer', value: String(value) })

const fetchMock = vi.fn()
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock) })
afterEach(() => vi.unstubAllGlobals())

function lastBody() {
  const body = JSON.parse(fetchMock.mock.calls.at(-1)[1].body)
  return body.requests[0].stmt
}

describe('ensureSchema', () => {
  it('creates the three tables if they do not exist', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 1, rows_affected: 0 } } }] }) })
    await ensureSchema()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const sqls = fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body).requests[0].stmt.sql)
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS gallery_photos')
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS committees')
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS committee_members')
  })
})

describe('gallery photos', () => {
  it('maps rows to photo objects', async () => {
    fetchMock.mockResolvedValue({ json: async () => selectResult(
      [{ name: 'id' }, { name: 'src' }, { name: 'caption' }, { name: 'created_at' }],
      [[integer(1), text('https://cdn/x.jpg'), text('Group photo'), text('2026-08-17 10:00:00')]],
    ) })
    await expect(fetchGalleryPhotos()).resolves.toEqual([
      { _id: 1, src: 'https://cdn/x.jpg', caption: 'Group photo', createdAt: '2026-08-17 10:00:00' },
    ])
    expect(lastBody().sql).toContain('SELECT * FROM gallery_photos ORDER BY id DESC')
  })

  it('inserts src and caption', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 5 } } }] }) })
    await addGalleryPhoto('https://cdn/x.jpg', 'Caption here')
    expect(lastBody().sql).toContain('INSERT INTO gallery_photos')
    expect(lastBody().args).toEqual([
      { type: 'text', value: 'https://cdn/x.jpg' },
      { type: 'text', value: 'Caption here' },
    ])
  })

  it('deletes by id', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { rows_affected: 1 } } }] }) })
    await deleteGalleryPhoto(9)
    expect(lastBody().sql).toBe('DELETE FROM gallery_photos WHERE id = ?')
    expect(lastBody().args).toEqual([{ type: 'integer', value: '9' }])
  })
})

describe('committees', () => {
  const committeeRow = {
    id: integer(2), name: text('AI'), slug: text('ai'), category: text('technical'),
    short_description: text('Explores AI.'), member_count: integer(52),
  }

  it('lists committees with derived counts and labels', async () => {
    fetchMock.mockResolvedValue({ json: async () => selectResult(
      [{ name: 'id' }, { name: 'name' }, { name: 'slug' }, { name: 'category' }, { name: 'short_description' }, { name: 'member_count' }],
      [[committeeRow.id, committeeRow.name, committeeRow.slug, committeeRow.category, committeeRow.short_description, committeeRow.member_count]],
    ) })
    await expect(fetchCommittees()).resolves.toEqual([
      { _id: 2, name: 'AI', slug: 'ai', category: 'technical', categoryLabel: 'Technical', shortDescription: 'Explores AI.', memberCount: 52 },
    ])
    expect(lastBody().sql).toContain('LEFT JOIN committee_members')
  })

  it('creates, updates, and deletes committees (members first on delete)', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 3 } } }] }) })
    await createCommittee({ name: 'Web', slug: 'web', category: 'technical', shortDescription: 'Builds websites.' })
    expect(lastBody().sql).toContain('INSERT INTO committees')
    expect(lastBody().args).toEqual([
      { type: 'text', value: 'Web' }, { type: 'text', value: 'web' },
      { type: 'text', value: 'technical' }, { type: 'text', value: 'Builds websites.' },
    ])

    await updateCommittee(3, { name: 'Web Dev', slug: 'web-dev', category: 'technical', shortDescription: 'Builds sites.' })
    expect(lastBody().sql).toContain('UPDATE committees SET')
    expect(lastBody().args.at(-1)).toEqual({ type: 'integer', value: '3' })

    await deleteCommittee(3)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).requests[0].stmt.sql).toBe('DELETE FROM committee_members WHERE committee_id = ?')
    expect(lastBody().sql).toBe('DELETE FROM committees WHERE id = ?')
  })
})

describe('committee members', () => {
  it('fetches members for a committee with the committee name attached', async () => {
    fetchMock.mockResolvedValue({ json: async () => selectResult(
      [{ name: 'id' }, { name: 'committee_id' }, { name: 'name' }, { name: 'position' }, { name: 'email' }, { name: 'phone' }, { name: 'img' }, { name: 'committee_name' }],
      [[integer(4), integer(2), text('Shahd'), text('Head'), text('s@mail.com'), text('012'), text('/img.jpg'), text('PR')]],
    ) })
    await expect(fetchAllMembers()).resolves.toEqual([
      { _id: 4, committeeId: 2, name: 'Shahd', position: 'Head', email: 's@mail.com', phone: '012', img: '/img.jpg', committee: 'PR' },
    ])
    expect(lastBody().sql).toContain('JOIN committees')
  })

  it('fetches members by committee id', async () => {
    fetchMock.mockResolvedValue({ json: async () => selectResult(
      [{ name: 'id' }, { name: 'committee_id' }, { name: 'name' }, { name: 'position' }, { name: 'email' }, { name: 'phone' }, { name: 'img' }],
      [[integer(4), integer(2), text('Shahd'), text('Head'), text('s@mail.com'), text('012'), text('/img.jpg')]],
    ) })
    await expect(fetchCommitteeMembers(2)).resolves.toEqual([
      { _id: 4, committeeId: 2, name: 'Shahd', position: 'Head', email: 's@mail.com', phone: '012', img: '/img.jpg' },
    ])
    expect(lastBody().sql).toContain('WHERE committee_id = ?')
    expect(lastBody().args).toEqual([{ type: 'integer', value: '2' }])
  })

  it('creates, updates, and deletes a member', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 6 } } }] }) })
    await createCommitteeMember(2, { name: 'Ali', position: 'Vice Head', email: 'a@mail.com', phone: '011', img: '/a.jpg' })
    expect(lastBody().sql).toContain('INSERT INTO committee_members')
    expect(lastBody().args).toEqual([
      { type: 'integer', value: '2' }, { type: 'text', value: 'Ali' }, { type: 'text', value: 'Vice Head' },
      { type: 'text', value: 'a@mail.com' }, { type: 'text', value: '011' }, { type: 'text', value: '/a.jpg' },
    ])

    await updateCommitteeMember(6, { name: 'Ali H', position: 'Head', email: '', phone: '', img: '' })
    expect(lastBody().sql).toContain('UPDATE committee_members SET')
    expect(lastBody().args.at(-1)).toEqual({ type: 'integer', value: '6' })

    await deleteCommitteeMember(6)
    expect(lastBody().sql).toBe('DELETE FROM committee_members WHERE id = ?')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/turso.test.js`
Expected: FAIL — imports don't exist yet

- [ ] **Step 3: Implement the data layer**

Append to `src/lib/turso.js` (keep all existing code; add below `deleteEvent`):

```js
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS gallery_photos (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     src TEXT NOT NULL,
     caption TEXT,
     created_at TEXT DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS committees (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     category TEXT NOT NULL,
     short_description TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS committee_members (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     committee_id INTEGER NOT NULL,
     name TEXT NOT NULL,
     position TEXT,
     email TEXT,
     phone TEXT,
     img TEXT
   )`,
]

export async function ensureSchema() {
  for (const sql of SCHEMA_STATEMENTS) await execute(sql)
}

function rowToPhoto(row) {
  return {
    _id: Number(row.id) || 0,
    src: row.src || '',
    caption: row.caption || '',
    createdAt: row.created_at || '',
  }
}

function rowToCommittee(row) {
  const cat = typeof row.category === 'string' ? row.category : ''
  return {
    _id: Number(row.id) || 0,
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    category: cat,
    categoryLabel: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '',
    shortDescription: row.short_description || '',
    memberCount: Number(row.member_count) || 0,
  }
}

function rowToMember(row) {
  return {
    _id: Number(row.id) || 0,
    committeeId: Number(row.committee_id) || 0,
    name: String(row.name || ''),
    position: row.position || '',
    email: row.email || '',
    phone: row.phone || '',
    img: row.img || '',
    committee: row.committee_name || '',
  }
}

export async function fetchGalleryPhotos() {
  const result = await execute('SELECT * FROM gallery_photos ORDER BY id DESC')
  return (result?.rows || []).map(rowToPhoto)
}

export async function addGalleryPhoto(src, caption) {
  const result = await execute('INSERT INTO gallery_photos (src, caption) VALUES (?, ?)', [src, caption || ''])
  return result?.last_insert_rowid
}

export async function deleteGalleryPhoto(id) {
  await execute('DELETE FROM gallery_photos WHERE id = ?', [id])
}

export async function fetchCommittees() {
  const result = await execute(
    `SELECT c.*, COUNT(m.id) AS member_count
     FROM committees c LEFT JOIN committee_members m ON m.committee_id = c.id
     GROUP BY c.id ORDER BY c.name`
  )
  return (result?.rows || []).map(rowToCommittee)
}

export async function fetchCommitteeBySlug(slug) {
  const result = await execute('SELECT * FROM committees WHERE slug = ?', [slug])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToCommittee(rows[0]) : null
}

export async function createCommittee(data) {
  const result = await execute(
    'INSERT INTO committees (name, slug, category, short_description) VALUES (?, ?, ?, ?)',
    [data.name, data.slug, data.category, data.shortDescription || '']
  )
  return result?.last_insert_rowid
}

export async function updateCommittee(id, data) {
  await execute(
    'UPDATE committees SET name = ?, slug = ?, category = ?, short_description = ? WHERE id = ?',
    [data.name, data.slug, data.category, data.shortDescription || '', id]
  )
}

export async function deleteCommittee(id) {
  await execute('DELETE FROM committee_members WHERE committee_id = ?', [id])
  await execute('DELETE FROM committees WHERE id = ?', [id])
}

export async function fetchCommitteeMembers(committeeId) {
  const result = await execute('SELECT * FROM committee_members WHERE committee_id = ? ORDER BY id', [committeeId])
  return (result?.rows || []).map(rowToMember)
}

export async function fetchAllMembers() {
  const result = await execute(
    `SELECT m.*, c.name AS committee_name
     FROM committee_members m JOIN committees c ON c.id = m.committee_id
     ORDER BY m.id`
  )
  return (result?.rows || []).map(rowToMember)
}

export async function createCommitteeMember(committeeId, data) {
  const result = await execute(
    'INSERT INTO committee_members (committee_id, name, position, email, phone, img) VALUES (?, ?, ?, ?, ?, ?)',
    [committeeId, data.name, data.position || '', data.email || '', data.phone || '', data.img || '']
  )
  return result?.last_insert_rowid
}

export async function updateCommitteeMember(id, data) {
  await execute(
    'UPDATE committee_members SET name = ?, position = ?, email = ?, phone = ?, img = ? WHERE id = ?',
    [data.name, data.position || '', data.email || '', data.phone || '', data.img || '', id]
  )
}

export async function deleteCommitteeMember(id) {
  await execute('DELETE FROM committee_members WHERE id = ?', [id])
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/turso.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/lib/turso.js ieee-app/src/lib/turso.test.js
git commit -m "feat: add turso schema bootstrap and gallery/committee CRUD"
```

---

### Task 4: Gallery source module (DB-first, empty fallback)

**Files:**
- Create: `ieee-app/src/data/gallerySource.js`
- Test: `ieee-app/src/data/gallerySource.test.js`

- [ ] **Step 1: Write the failing test**

`src/data/gallerySource.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({ fetchGalleryPhotos: vi.fn() }))
vi.mock('../lib/turso', () => turso)

import { fetchGalleryPhotos, fetchGalleryPhotosResult } from './gallerySource'

describe('gallery source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns remote photos with provenance', async () => {
    const photos = [{ _id: 1, src: '/a.jpg', caption: 'A' }]
    turso.fetchGalleryPhotos.mockResolvedValue(photos)

    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos, source: 'remote' })
    await expect(fetchGalleryPhotos()).resolves.toEqual(photos)
  })

  it('falls back to an empty list when Turso fails', async () => {
    turso.fetchGalleryPhotos.mockRejectedValueOnce(new Error('offline'))

    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos: [], source: 'fallback' })
  })

  it('returns a fresh array each fallback call', async () => {
    turso.fetchGalleryPhotos.mockRejectedValue(new Error('offline'))
    const first = (await fetchGalleryPhotosResult()).photos
    first.push({ src: '/mutated.jpg' })
    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos: [], source: 'fallback' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/gallerySource.test.js`
Expected: FAIL with "Failed to resolve import './gallerySource'"

- [ ] **Step 3: Write the implementation**

`src/data/gallerySource.js`:

```js
import { fetchGalleryPhotos as tursoFetchGalleryPhotos } from '../lib/turso'

export async function fetchGalleryPhotosResult() {
  try {
    return { photos: await tursoFetchGalleryPhotos(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { photos: [], source: 'fallback' }
  }
}

export async function fetchGalleryPhotos() {
  return (await fetchGalleryPhotosResult()).photos
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/gallerySource.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/data/gallerySource.js ieee-app/src/data/gallerySource.test.js
git commit -m "feat: add gallery source with static fallback"
```

---

### Task 5: Committee source module (DB-first, static fallback)

**Files:**
- Create: `ieee-app/src/data/committeeSource.js`
- Test: `ieee-app/src/data/committeeSource.test.js`

- [ ] **Step 1: Write the failing test**

`src/data/committeeSource.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { boardMembers as staticBoardMembers } from './boardMembers'
import { committees as staticCommittees } from './committees'

const turso = vi.hoisted(() => ({
  createCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  deleteCommittee: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchAllMembers: vi.fn(),
  fetchCommitteeBySlug: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  fetchCommittees: vi.fn(),
  updateCommittee: vi.fn(),
  updateCommitteeMember: vi.fn(),
}))

vi.mock('../lib/turso', () => turso)

import {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  fetchAllMembers,
  fetchAllMembersResult,
  fetchCommitteeDetailResult,
  fetchCommittees,
  fetchCommitteesResult,
  updateCommittee,
  updateCommitteeMember,
} from './committeeSource'

describe('committee source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns remote committees with provenance', async () => {
    const remote = [{ _id: 1, name: 'AI', slug: 'ai' }]
    turso.fetchCommittees.mockResolvedValue(remote)
    await expect(fetchCommitteesResult()).resolves.toEqual({ committees: remote, source: 'remote' })
    await expect(fetchCommittees()).resolves.toEqual(remote)
  })

  it('falls back to a fresh clone of static committees', async () => {
    turso.fetchCommittees.mockRejectedValueOnce(new Error('offline'))
    const result = await fetchCommitteesResult()
    expect(result.source).toBe('fallback')
    expect(result.committees).toEqual(structuredClone(staticCommittees))
  })

  it('returns remote members with provenance', async () => {
    const remote = [{ _id: 1, name: 'Shahd', committee: 'PR' }]
    turso.fetchAllMembers.mockResolvedValue(remote)
    await expect(fetchAllMembersResult()).resolves.toEqual({ members: remote, source: 'remote' })
    await expect(fetchAllMembers()).resolves.toEqual(remote)
  })

  it('falls back to a fresh clone of static board members', async () => {
    turso.fetchAllMembers.mockRejectedValueOnce(new Error('offline'))
    const result = await fetchAllMembersResult()
    expect(result.source).toBe('fallback')
    expect(result.members).toEqual(structuredClone(staticBoardMembers))
  })

  it('resolves committee detail with members from Turso', async () => {
    const committee = { _id: 2, name: 'AI', slug: 'ai' }
    const members = [{ _id: 3, committeeId: 2, name: 'Mo', position: 'Head' }]
    turso.fetchCommitteeBySlug.mockResolvedValue(committee)
    turso.fetchCommitteeMembers.mockResolvedValue(members)

    await expect(fetchCommitteeDetailResult('ai')).resolves.toEqual({ committee, members: [{ ...members[0], committee: 'AI' }], source: 'remote' })
    expect(turso.fetchCommitteeMembers).toHaveBeenCalledWith(2)
  })

  it('resolves a missing remote committee to null', async () => {
    turso.fetchCommitteeBySlug.mockResolvedValue(null)
    await expect(fetchCommitteeDetailResult('nope')).resolves.toEqual({ committee: null, members: [], source: 'remote' })
  })

  it('falls back to static detail on failure', async () => {
    turso.fetchCommitteeBySlug.mockRejectedValueOnce(new Error('offline'))
    const result = await fetchCommitteeDetailResult('web')
    expect(result.source).toBe('fallback')
    expect(result.committee).toEqual(structuredClone(staticCommittees.find(c => c.slug === 'web')))
    expect(result.members).toEqual(structuredClone(staticBoardMembers))

    const missing = await fetchCommitteeDetailResult('ghost')
    expect(missing).toEqual({ committee: null, members: structuredClone(staticBoardMembers), source: 'fallback' })
  })

  it('preserves CRUD exports', () => {
    expect(createCommittee).toBe(turso.createCommittee)
    expect(updateCommittee).toBe(turso.updateCommittee)
    expect(deleteCommittee).toBe(turso.deleteCommittee)
    expect(createCommitteeMember).toBe(turso.createCommitteeMember)
    expect(updateCommitteeMember).toBe(turso.updateCommitteeMember)
    expect(deleteCommitteeMember).toBe(turso.deleteCommitteeMember)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/committeeSource.test.js`
Expected: FAIL with "Failed to resolve import './committeeSource'"

- [ ] **Step 3: Write the implementation**

`src/data/committeeSource.js`:

```js
import { boardMembers as staticBoardMembers } from './boardMembers'
import { committees as staticCommittees } from './committees'
import {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  fetchAllMembers as tursoFetchAllMembers,
  fetchCommitteeBySlug as tursoFetchCommitteeBySlug,
  fetchCommitteeMembers as tursoFetchCommitteeMembers,
  fetchCommittees as tursoFetchCommittees,
  updateCommittee,
  updateCommitteeMember,
} from '../lib/turso'

export {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  updateCommittee,
  updateCommitteeMember,
} from '../lib/turso'

export async function fetchCommitteesResult() {
  try {
    return { committees: await tursoFetchCommittees(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { committees: structuredClone(staticCommittees), source: 'fallback' }
  }
}

export async function fetchCommittees() {
  return (await fetchCommitteesResult()).committees
}

export async function fetchAllMembersResult() {
  try {
    return { members: await tursoFetchAllMembers(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { members: structuredClone(staticBoardMembers), source: 'fallback' }
  }
}

export async function fetchAllMembers() {
  return (await fetchAllMembersResult()).members
}

export async function fetchCommitteeDetailResult(slug) {
  try {
    const committee = await tursoFetchCommitteeBySlug(slug)
    if (!committee) return { committee: null, members: [], source: 'remote' }
    const members = await tursoFetchCommitteeMembers(committee._id)
    // members from fetchCommitteeMembers carry no committee name; attach it so
    // findCommitteeLeaders(slug, members) matches on the detail page
    return { committee, members: members.map(member => ({ ...member, committee: committee.name })), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    const committee = staticCommittees.find(item => item.slug === slug)
    return {
      committee: committee ? structuredClone(committee) : null,
      members: structuredClone(staticBoardMembers),
      source: 'fallback',
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/committeeSource.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/data/committeeSource.js ieee-app/src/data/committeeSource.test.js
git commit -m "feat: add committee source with static fallback"
```

---

### Task 6: PhotoInput shared form control

**Files:**
- Create: `ieee-app/src/pages/admin/PhotoInput.jsx`
- Test: covered by Task 7/8 component tests (no separate test file)

- [ ] **Step 1: Write the component**

`src/pages/admin/PhotoInput.jsx`:

```jsx
import { useEffect, useState } from 'react'

export default function PhotoInput({ file, setFile, url, setUrl }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="mb-2 block w-full text-sm"
      />
      <input
        type="text"
        className="form-input"
        placeholder="Or paste an image URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      {preview && (
        <img src={preview} alt="Selected photo preview" className="mt-3 h-24 w-24 rounded-lg object-cover" />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add ieee-app/src/pages/admin/PhotoInput.jsx
git commit -m "feat: add shared photo input with preview and URL fallback"
```

---

### Task 7: GalleryTab admin component

**Files:**
- Create: `ieee-app/src/pages/admin/GalleryTab.jsx`
- Test: `ieee-app/src/pages/admin/galleryTab.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/pages/admin/galleryTab.test.jsx`:

```jsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryTab from './GalleryTab'

const { fetchGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto, uploadToCloudinary } = vi.hoisted(() => ({
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../../data/gallerySource', () => ({ fetchGalleryPhotos }))
vi.mock('../../lib/turso', () => ({ addGalleryPhoto, deleteGalleryPhoto }))
vi.mock('../../lib/upload', () => ({ uploadToCloudinary }))

const photo = { _id: 1, src: 'https://cdn/x.jpg', caption: 'Group photo', createdAt: '2026-08-17 10:00:00' }

beforeEach(() => {
  vi.clearAllMocks()
  fetchGalleryPhotos.mockResolvedValue([photo])
  addGalleryPhoto.mockResolvedValue(undefined)
  deleteGalleryPhoto.mockResolvedValue(undefined)
  uploadToCloudinary.mockResolvedValue('https://cdn/uploaded.jpg')
})

afterEach(cleanup)

describe('gallery tab', () => {
  it('lists existing photos with captions', async () => {
    render(<GalleryTab />)
    expect(await screen.findByAltText('Group photo')).toBeTruthy()
    expect(screen.getByText('Group photo')).toBeTruthy()
  })

  it('uploads a file, then refreshes the list', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([]).mockResolvedValueOnce([{ _id: 2, src: 'https://cdn/uploaded.jpg', caption: 'New', createdAt: '' }])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] },
    })
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'New' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    expect(await screen.findByText('1 photo')).toBeTruthy()
    expect(uploadToCloudinary).toHaveBeenCalledOnce()
    expect(addGalleryPhoto).toHaveBeenCalledWith('https://cdn/uploaded.jpg', 'New')
  })

  it('adds a photo from a pasted URL when no file is chosen', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/pasted.jpg' } })
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Pasted' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    await screen.findByText('0 photos')
    expect(uploadToCloudinary).not.toHaveBeenCalled()
    expect(addGalleryPhoto).toHaveBeenCalledWith('https://cdn/pasted.jpg', 'Pasted')
  })

  it('requires a file or URL before adding', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))
    expect(screen.getByText('Choose a photo or paste an image URL.')).toBeTruthy()
    expect(addGalleryPhoto).not.toHaveBeenCalled()
  })

  it('shows upload errors and keeps the form usable', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([])
    uploadToCloudinary.mockRejectedValueOnce(new Error('Invalid preset'))
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    expect(await screen.findByText('Invalid preset')).toBeTruthy()
    expect(addGalleryPhoto).not.toHaveBeenCalled()
  })

  it('deletes a photo after confirmation', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([photo]).mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByAltText('Group photo')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Photo').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(deleteGalleryPhoto).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Photo').parentElement).getByRole('button', { name: 'Delete' }))
    expect(deleteGalleryPhoto).toHaveBeenCalledWith(1)
    expect(await screen.findByText('0 photos')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/admin/galleryTab.test.jsx`
Expected: FAIL with "Failed to resolve import './GalleryTab'"

- [ ] **Step 3: Write the implementation**

`src/pages/admin/GalleryTab.jsx`:

```jsx
import { useCallback, useEffect, useState } from 'react'
import { addGalleryPhoto, deleteGalleryPhoto } from '../../lib/turso'
import { uploadToCloudinary } from '../../lib/upload'
import { fetchGalleryPhotos } from '../../data/gallerySource'
import PhotoInput from './PhotoInput'

export default function GalleryTab() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPhotos(await fetchGalleryPhotos())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!file && !url.trim()) {
      setError('Choose a photo or paste an image URL.')
      return
    }
    setUploading(true)
    try {
      const src = file ? await uploadToCloudinary(file) : url.trim()
      await addGalleryPhoto(src, caption.trim())
      setCaption('')
      setFile(null)
      setUrl('')
      await load()
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setError(null)
    try {
      await deleteGalleryPhoto(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Gallery</h2>
          <p className="text-sm text-on-surface-variant mt-1">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</p>
        </div>
        <button onClick={load} className="btn btn-secondary text-xs" disabled={loading}>Refresh</button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>
      )}

      <form onSubmit={handleAdd} className="card p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Add Photo</h3>
        <label className="form-label" htmlFor="gallery-photo">Photo</label>
        <PhotoInput file={file} setFile={setFile} url={url} setUrl={setUrl} />
        <label className="form-label mt-4" htmlFor="gallery-caption">Caption</label>
        <input
          id="gallery-caption"
          className="form-input"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-4" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Photo'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">No photos yet.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map(photo => (
            <li key={photo._id} className="card p-4">
              <img src={photo.src} alt={photo.caption || 'Gallery photo'} className="h-44 w-full rounded-lg object-cover" />
              <p className="mt-3 text-sm font-medium line-clamp-2">{photo.caption || 'No caption'}</p>
              <div className="mt-3 flex justify-end">
                <button onClick={() => setDeleteTarget(photo)} className="btn btn-ghost text-xs text-error">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card shadow-xl p-6 md:p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Photo</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to delete this photo? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary text-sm">Cancel</button>
              <button onClick={handleDelete} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

Note: the photo input in the test is labeled "Photo" — the file input must carry `aria-label` or an associated `<label>` with `htmlFor`. The `<label className="form-label" htmlFor="gallery-photo">Photo</label>` above points at no element with that id; fix by giving the file input an `id="gallery-photo"`. To keep PhotoInput shared and simple, give the file input a stable label via wrapping label instead: replace the explicit label + PhotoInput with `<label className="form-label">Photo<PhotoInput ... /></label>` — actually the test uses `getByLabelText('Photo')`. Simplest: add `id="gallery-photo"` prop pass-through is overkill; instead PhotoInput accepts an optional `id` and applies it to the file input:

```jsx
export default function PhotoInput({ id, file, setFile, url, setUrl }) {
  ...
  <input id={id} type="file" accept="image/*" onChange={...} className="mb-2 block w-full text-sm" />
```

and in GalleryTab use `<PhotoInput id="gallery-photo" ... />`. Update Task 6's PhotoInput accordingly (apply this edit to the file created in Task 6):

```jsx
import { useEffect, useState } from 'react'

export default function PhotoInput({ id, file, setFile, url, setUrl }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="mb-2 block w-full text-sm"
      />
      <input
        type="text"
        className="form-input"
        placeholder="Or paste an image URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      {preview && (
        <img src={preview} alt="Selected photo preview" className="mt-3 h-24 w-24 rounded-lg object-cover" />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/admin/galleryTab.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/pages/admin/GalleryTab.jsx ieee-app/src/pages/admin/galleryTab.test.jsx ieee-app/src/pages/admin/PhotoInput.jsx
git commit -m "feat: add gallery management tab"
```

Applied deviations (from code review, committed a9b5138 + follow-up):
1. Mock paths in the test corrected from `../` to `../../` — the test lives in `src/pages/admin/`, one level deeper than the plan assumed; the original paths resolved to non-existent `src/pages/data|lib` and never intercepted.
2. GalleryTab imports `fetchGalleryPhotos` directly from `../../lib/turso` instead of `../../data/gallerySource` — the source module never rejects (it falls back to `[]`), making the component's load-error banner dead code. The admin tab needs a visible error when the DB is down; the source module stays for public pages only. Test mocks turso's `fetchGalleryPhotos` accordingly.

---

### Task 8: CommitteesTab admin component

**Files:**
- Create: `ieee-app/src/pages/admin/CommitteesTab.jsx`
- Test: `ieee-app/src/pages/admin/committeesTab.test.jsx`

- [ ] **Step 1: Write the failing test**

`src/pages/admin/committeesTab.test.jsx`:

```jsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CommitteesTab from './CommitteesTab'

const turso = vi.hoisted(() => ({
  createCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  deleteCommittee: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  updateCommittee: vi.fn(),
  updateCommitteeMember: vi.fn(),
}))

const { fetchCommittees } = vi.hoisted(() => ({ fetchCommittees: vi.fn() }))

vi.mock('../../data/committeeSource', () => ({ fetchCommittees }))
vi.mock('../../lib/turso', () => turso)
vi.mock('../../lib/upload', () => ({ uploadToCloudinary: vi.fn().mockResolvedValue('https://cdn/uploaded.jpg') }))

const committee = {
  _id: 2, name: 'AI', slug: 'ai', category: 'technical',
  categoryLabel: 'Technical', shortDescription: 'Explores AI.', memberCount: 1,
}
const member = { _id: 4, committeeId: 2, name: 'Shahd', position: 'Head', email: 's@mail.com', phone: '012', img: '/img.jpg' }

beforeEach(() => {
  vi.clearAllMocks()
  fetchCommittees.mockResolvedValue([committee])
  turso.fetchCommitteeMembers.mockResolvedValue([member])
  turso.createCommittee.mockResolvedValue(undefined)
  turso.updateCommittee.mockResolvedValue(undefined)
  turso.deleteCommittee.mockResolvedValue(undefined)
  turso.createCommitteeMember.mockResolvedValue(undefined)
  turso.updateCommitteeMember.mockResolvedValue(undefined)
  turso.deleteCommitteeMember.mockResolvedValue(undefined)
})

afterEach(cleanup)

describe('committees tab', () => {
  it('lists committees with member counts', async () => {
    render(<CommitteesTab />)
    expect(await screen.findByText('AI')).toBeTruthy()
    expect(screen.getByText('1 member')).toBeTruthy()
  })

  it('creates a committee with an auto-generated slug', async () => {
    fetchCommittees.mockResolvedValueOnce([]).mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('0 committees')

    fireEvent.click(screen.getByRole('button', { name: '+ New Committee' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'AI & Robotics' } })
    fireEvent.blur(screen.getByLabelText('Name'))
    expect(screen.getByLabelText('Slug').value).toBe('ai-robotics')
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'ai-robotics' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'technical' } })
    fireEvent.change(screen.getByLabelText('Short Description'), { target: { value: 'Builds robots.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Committee' }))

    expect(turso.createCommittee).toHaveBeenCalledWith({
      name: 'AI & Robotics', slug: 'ai-robotics', category: 'technical', shortDescription: 'Builds robots.',
    })
    expect(await screen.findByText('1 committee')).toBeTruthy()
  })

  it('edits and deletes a committee with confirmation', async () => {
    fetchCommittees.mockResolvedValueOnce([committee]).mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'AI Lab' } })
    fireEvent.change(screen.getByLabelText('Short Description'), { target: { value: 'New desc.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Committee' }))
    expect(turso.updateCommittee).toHaveBeenCalledWith(2, expect.objectContaining({ name: 'AI Lab', shortDescription: 'New desc.' }))

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Committee').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(turso.deleteCommittee).toHaveBeenCalledWith(2)
  })

  it('manages members: add with photo URL, edit, delete', async () => {
    fetchCommittees.mockResolvedValueOnce([committee])
    turso.fetchCommitteeMembers.mockResolvedValueOnce([member]).mockResolvedValueOnce([member]).mockResolvedValueOnce([])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Members' }))
    expect(await screen.findByText('Shahd')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '+ New Member' }))
    fireEvent.change(screen.getByLabelText('Member Name'), { target: { value: 'Ali' } })
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Vice Head' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@mail.com' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '011' } })
    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/ali.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Member' }))
    expect(turso.createCommitteeMember).toHaveBeenCalledWith(2, {
      name: 'Ali', position: 'Vice Head', email: 'a@mail.com', phone: '011', img: 'https://cdn/ali.jpg',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Head' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Member' }))
    expect(turso.updateCommitteeMember).toHaveBeenCalledWith(4, expect.objectContaining({ position: 'Head' }))

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Member').parentElement).getByRole('button', { name: 'Delete' }))
    expect(turso.deleteCommitteeMember).toHaveBeenCalledWith(4)
    expect(await screen.findByText('No members yet.')).toBeTruthy()
  })

  it('warns that deleting a committee removes its members', async () => {
    fetchCommittees.mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/members will also be deleted/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/admin/committeesTab.test.jsx`
Expected: FAIL with "Failed to resolve import './CommitteesTab'"

- [ ] **Step 3: Write the implementation**

`src/pages/admin/CommitteesTab.jsx`:

```jsx
import { useCallback, useEffect, useState } from 'react'
import {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  fetchCommitteeMembers,
  updateCommittee,
  updateCommitteeMember,
} from '../../lib/turso'
import { fetchCommittees } from '../../data/committeeSource'
import { slugify } from '../../lib/slugify'
import PhotoInput from './PhotoInput'

const emptyCommittee = { name: '', slug: '', category: 'technical', shortDescription: '' }
const emptyMember = { name: '', position: '', email: '', phone: '', img: '' }

export default function CommitteesTab() {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [committeeForm, setCommitteeForm] = useState(null)
  const [memberForm, setMemberForm] = useState(null)
  const [memberFile, setMemberFile] = useState(null)
  const [memberUrl, setMemberUrl] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCommittees(await fetchCommittees())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveCommittee(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (committeeForm._id) {
        await updateCommittee(committeeForm._id, committeeForm)
      } else {
        await createCommittee({ ...committeeForm, slug: committeeForm.slug || slugify(committeeForm.name) })
      }
      setCommitteeForm(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function openMembers(committee) {
    setError(null)
    setSelected(committee)
    setMemberForm(null)
    setMemberFile(null)
    setMemberUrl('')
  }

  async function saveMember(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const img = memberFile ? await uploadToCloudinary(memberFile) : memberUrl.trim()
      if (memberForm._id) {
        await updateCommitteeMember(memberForm._id, { ...memberForm, img })
      } else {
        await createCommitteeMember(selected._id, { ...memberForm, img })
      }
      setMemberForm(null)
      setMemberFile(null)
      setMemberUrl('')
      setSelected({ ...selected })
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setError(null)
    try {
      if (deleteTarget.kind === 'committee') {
        await deleteCommittee(deleteTarget.item._id)
        setSelected(null)
      } else {
        await deleteCommitteeMember(deleteTarget.item._id)
        setSelected({ ...selected })
      }
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (selected) {
    return (
      <MemberManager
        committee={selected}
        members={selected._members || []}
        memberForm={memberForm}
        setMemberForm={setMemberForm}
        memberFile={memberFile}
        setMemberFile={setMemberFile}
        memberUrl={memberUrl}
        setMemberUrl={setMemberUrl}
        saving={saving}
        error={error}
        setError={setError}
        onBack={() => { setSelected(null); setMemberForm(null) }}
        onSave={saveMember}
        onDelete={item => setDeleteTarget({ kind: 'member', item })}
      />
    )
  }

  if (committeeForm) {
    return (
      <form onSubmit={saveCommittee} className="max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {committeeForm._id ? 'Edit Committee' : 'New Committee'}
          </h2>
          <button type="button" onClick={() => setCommitteeForm(null)} className="btn btn-ghost text-xs">Cancel</button>
        </div>
        {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
        <label className="form-label" htmlFor="committee-name">Name</label>
        <input
          id="committee-name"
          className="form-input mb-4"
          value={committeeForm.name}
          required
          onChange={e => setCommitteeForm({ ...committeeForm, name: e.target.value })}
          onBlur={e => {
            if (!committeeForm._id && !committeeForm.slug) setCommitteeForm({ ...committeeForm, slug: slugify(e.target.value) })
          }}
        />
        <label className="form-label" htmlFor="committee-slug">Slug</label>
        <input
          id="committee-slug"
          className="form-input mb-4"
          value={committeeForm.slug}
          required
          onChange={e => setCommitteeForm({ ...committeeForm, slug: e.target.value })}
        />
        <label className="form-label" htmlFor="committee-category">Category</label>
        <select
          id="committee-category"
          className="form-select mb-4"
          value={committeeForm.category}
          onChange={e => setCommitteeForm({ ...committeeForm, category: e.target.value })}
        >
          <option value="technical">Technical</option>
          <option value="non-technical">Non-Technical</option>
        </select>
        <label className="form-label" htmlFor="committee-desc">Short Description</label>
        <textarea
          id="committee-desc"
          className="form-input mb-4"
          rows={3}
          value={committeeForm.shortDescription}
          onChange={e => setCommitteeForm({ ...committeeForm, shortDescription: e.target.value })}
        />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Committee'}
        </button>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Committees</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {committees.length} {committees.length === 1 ? 'committee' : 'committees'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCommitteeForm({ ...emptyCommittee })} className="btn btn-primary text-xs">+ New Committee</button>
          <button onClick={load} className="btn btn-secondary text-xs" disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="pb-3 pr-4 font-semibold">Name</th>
              <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Category</th>
              <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Members</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {committees.map(committee => (
              <tr key={committee._id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-3 pr-4 font-medium">{committee.name}</td>
                <td className="py-3 pr-4 text-on-surface-variant hidden sm:table-cell">{committee.categoryLabel}</td>
                <td className="py-3 pr-4 text-on-surface-variant hidden md:table-cell">
                  {committee.memberCount} {committee.memberCount === 1 ? 'member' : 'members'}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openMembers(committee)} className="btn btn-ghost text-xs">Members</button>
                    <button onClick={() => setCommitteeForm({ ...committee })} className="btn btn-ghost text-xs">Edit</button>
                    <button onClick={() => setDeleteTarget({ kind: 'committee', item: committee })} className="btn btn-ghost text-xs text-error">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setDeleteTarget(null)}>
          <div className="card shadow-xl p-6 md:p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{deleteTarget.kind === 'committee' ? 'Delete Committee' : 'Delete Member'}</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              {deleteTarget.kind === 'committee'
                ? <>Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.item.name}</span>? Its members will also be deleted. This cannot be undone.</>
                : <>Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.item.name}</span>? This cannot be undone.</>}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary text-sm">Cancel</button>
              <button onClick={handleDelete} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MemberManager({
  committee, members, memberForm, setMemberForm, memberFile, setMemberFile,
  memberUrl, setMemberUrl, saving, error, setError, onBack, onSave, onDelete,
}) {
  const [loadingMembers, setLoadingMembers] = useState(true)

  useEffect(() => {
    let active = true
    fetchCommitteeMembers(committee._id)
      .then(list => { if (active) committee._members = list })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoadingMembers(false) })
    return () => { active = false }
  }, [committee, setError])

  const list = committee._members || members

  if (memberForm) {
    return (
      <form onSubmit={onSave} className="max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {memberForm._id ? 'Edit Member' : 'New Member'} — {committee.name}
          </h2>
          <button type="button" onClick={() => setMemberForm(null)} className="btn btn-ghost text-xs">Cancel</button>
        </div>
        {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
        <label className="form-label" htmlFor="member-name">Member Name</label>
        <input id="member-name" className="form-input mb-4" value={memberForm.name} required onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
        <label className="form-label" htmlFor="member-position">Position</label>
        <input id="member-position" className="form-input mb-4" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} placeholder="Head, Vice Head, ..." />
        <label className="form-label" htmlFor="member-email">Email</label>
        <input id="member-email" type="email" className="form-input mb-4" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
        <label className="form-label" htmlFor="member-phone">Phone</label>
        <input id="member-phone" className="form-input mb-4" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />
        <label className="form-label" htmlFor="member-photo">Photo</label>
        <PhotoInput id="member-photo" file={memberFile} setFile={setMemberFile} url={memberUrl} setUrl={setMemberUrl} />
        <button type="submit" className="btn btn-primary mt-4" disabled={saving}>
          {saving ? 'Saving...' : 'Save Member'}
        </button>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="btn btn-ghost text-xs mb-2">← All committees</button>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{committee.name} — Members</h2>
          <p className="text-sm text-on-surface-variant mt-1">{list.length} {list.length === 1 ? 'member' : 'members'}</p>
        </div>
        <button onClick={() => setMemberForm({ ...emptyMember })} className="btn btn-primary text-xs">+ New Member</button>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}

      {loadingMembers ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">No members yet.</div>
      ) : (
        <ul className="divide-y divide-outline-variant/20 border-t border-outline-variant/20">
          {list.map(member => (
            <li key={member._id} className="flex items-center gap-4 py-4">
              {member.img && <img src={member.img} alt="" className="h-12 w-12 rounded-full object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-on-surface-variant">{member.position || '—'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMemberForm({ ...member })} className="btn btn-ghost text-xs">Edit</button>
                <button onClick={() => onDelete(member)} className="btn btn-ghost text-xs text-error">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

Note: `uploadToCloudinary` is referenced in `saveMember` but not imported — add the import at the top of `CommitteesTab.jsx`:

```js
import { uploadToCloudinary } from '../../lib/upload'
```

Also `selected._members` is mutated by MemberManager's effect; simpler and test-friendly alternative is to lift member state into CommitteesTab. Keep the `_members` cache approach: the effect runs once per `committee` object identity; after save, `setSelected({ ...selected })` gives a new object so the effect refetches. The `members` prop is only a fallback for the initial render. In tests, `fetchCommitteeMembers` is mocked and resolves — the list renders from `_members`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/admin/committeesTab.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/pages/admin/CommitteesTab.jsx ieee-app/src/pages/admin/committeesTab.test.jsx
git commit -m "feat: add committee and member management tab"
```

Applied deviations (from execution + code review, committed 77d5b8c + 4be6db7):
1. Same as Task 7: `fetchCommittees`/`fetchCommitteeMembers` imported directly from `../../lib/turso`, not `../../data/committeeSource` — admin must never see the static fallback masquerading as DB data, and load errors must surface. Test's turso mock includes `fetchCommittees`; the committeeSource mock is dropped.
2. Test awaits: `await findByText('Shahd')` after member saves (React 19 batches async continuations — sync queries after a click run before the refetch renders).
3. `fetchCommitteeMembers` mock chain is 4 values `[member],[member],[member],[]` — the member flow fetches 4× (initial mount, post-add, post-edit, post-delete). The plan's 3-value chain left the delete refetch on the base value, so `'No members yet.'` could never render.
4. The confirm dialog renders in BOTH views (list + members). The plan rendered it only in the list view's return, making member deletes unconfirmable (test's `getByText('Delete Member')` would throw).
5. Member list lives in local `useState` inside MemberManager (not `committee._members` mutation): mutation + `setLoadingMembers(false)` false→false no-op means the post-delete refetched list never re-renders under React 19 batching. The `members` fallback prop is dropped entirely.
6. Code review polish: `handleDelete` guards double-clicks (`if (!deleteTarget || saving) return` + `disabled={saving}`); member-edit test asserts a distinct position value ('Treasurer'); eslint-disable comment on the mount effect; BOM stripped, trailing newlines added.

---

### Task 9: AdminPage tab shell

**Files:**
- Modify: `ieee-app/src/pages/AdminPage.jsx`
- Modify: `ieee-app/src/pages/admin.test.jsx`

- [ ] **Step 1: Update the failing test — add mocks and tab switching tests**

In `src/pages/admin.test.jsx`:

1. Add a hoisted mock for the turso module (AdminPage will import `ensureSchema`) and the two source modules:

```js
const turso = vi.hoisted(() => ({ ensureSchema: vi.fn() }))
vi.mock('../lib/turso', () => turso)

const gallerySource = vi.hoisted(() => ({ fetchGalleryPhotos: vi.fn() }))
vi.mock('../data/gallerySource', () => gallerySource)

const committeeSource = vi.hoisted(() => ({ fetchCommittees: vi.fn() }))
vi.mock('../data/committeeSource', () => committeeSource)
```

2. In `beforeEach`, reset them:

```js
turso.ensureSchema.mockReset()
turso.ensureSchema.mockResolvedValue(undefined)
gallerySource.fetchGalleryPhotos.mockReset()
gallerySource.fetchGalleryPhotos.mockResolvedValue([])
committeeSource.fetchCommittees.mockReset()
committeeSource.fetchCommittees.mockResolvedValue([])
```

3. Add a new describe block after the existing ones:

```js
describe('admin tabs', () => {
  it('bootstraps the schema and keeps the events view as the default tab', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    expect(await screen.findByRole('heading', { name: 'Manage Events' })).toBeTruthy()
    expect(turso.ensureSchema).toHaveBeenCalledOnce()
  })

  it('switches to the gallery and committees tabs', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    await screen.findByRole('heading', { name: 'Manage Events' })

    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }))
    expect(screen.getByRole('heading', { name: 'Manage Gallery' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Committees' }))
    expect(screen.getByRole('heading', { name: 'Manage Committees' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/admin.test.jsx`
Expected: FAIL — `ensureSchema` not mocked correctly / tabs don't exist

- [ ] **Step 3: Implement the tab shell**

Modify `src/pages/AdminPage.jsx`:

1. Add imports:

```js
import { ensureSchema } from "../lib/turso";
import GalleryTab from "./admin/GalleryTab";
import CommitteesTab from "./admin/CommitteesTab";
```

2. Add state after `deleteTarget`:

```js
const [tab, setTab] = useState("events");
```

3. In the authed `useEffect`, bootstrap the schema before loading events:

```js
useEffect(() => {
  if (!authed) return;
  let active = true;
  ensureSchema()
    .catch((err) => {
      if (active) setError(err.message);
    })
    .finally(() => {
      if (active) {
        fetchEvents()
          .then((data) => {
            if (active) setEvents(data);
          })
          .catch((err) => {
            if (active) setError(err.message);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      }
    });
  return () => {
    active = false;
  };
}, [authed]);
```

4. After the header div (line ~147) and before the error box, insert the tab bar:

```jsx
<div role="tablist" className="mb-8 flex gap-2 border-b border-outline-variant/20">
  {["events", "gallery", "committees"].map((name) => (
    <button
      key={name}
      role="tab"
      aria-selected={tab === name}
      onClick={() => setTab(name)}
      className={
        "px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors " +
        (tab === name
          ? "border-b-2 border-primary text-primary"
          : "text-on-surface-variant hover:text-on-surface")
      }
    >
      {name === "events" ? "Events" : name === "gallery" ? "Gallery" : "Committees"}
    </button>
  ))}
</div>
```

5. Wrap the existing list/loading/table content: keep it rendered only on the events tab, and render the tab components otherwise. Change the conditional block so that:

```jsx
{error && (...)}   {/* keep as-is, shared */}

{tab === "gallery" ? (
  <GalleryTab />
) : tab === "committees" ? (
  <CommitteesTab />
) : (
  <>
    {loading ? (...) : (<table>...)}
  </>
)}
```

The delete modal stays shared at the bottom (events only — unchanged).

- [ ] **Step 4: Run all tests to verify pass**

Run: `npx vitest run src/pages/admin.test.jsx src/pages/admin/galleryTab.test.jsx src/pages/admin/committeesTab.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/pages/AdminPage.jsx ieee-app/src/pages/admin.test.jsx
git commit -m "feat: add gallery and committee tabs to admin dashboard"
```

---

### Task 10: Public GalleryPage merges standalone photos

**Files:**
- Modify: `ieee-app/src/pages/GalleryPage.jsx`
- Modify: `ieee-app/src/pages/records.test.jsx` (gallery tests + new mock)

- [ ] **Step 1: Update the failing test — mock gallerySource and assert merge order**

In `src/pages/records.test.jsx`:

1. Add the hoisted mock next to the eventsSource mock:

```js
const { fetchGalleryPhotosResult } = vi.hoisted(() => ({ fetchGalleryPhotosResult: vi.fn() }))
vi.mock('../data/gallerySource', () => ({ fetchGalleryPhotosResult }))
```

2. In `beforeEach` add a default:

```js
fetchGalleryPhotosResult.mockReset()
fetchGalleryPhotosResult.mockResolvedValue({ photos: [], source: 'remote' })
```

3. Add a new test in the gallery describe block (after the existing archive tests):

```js
it('merges standalone admin photos ahead of event photos', async () => {
  fetchEventsResult.mockResolvedValue({
    events: [{ title: 'Event A', slug: 'event-a', gallery: [{ src: '/event-a.jpg', caption: 'Event photo' }] }],
    source: 'remote',
  })
  fetchGalleryPhotosResult.mockResolvedValue({
    photos: [{ _id: 1, src: '/standalone.jpg', caption: 'Standalone photo' }],
    source: 'remote',
  })
  renderGallery()

  expect(await screen.findByAltText('Standalone photo')).toBeTruthy()
  expect(screen.getByAltText('Event photo')).toBeTruthy()
  const imgs = screen.getAllByRole('img')
  expect(imgs.map(img => img.getAttribute('src'))).toEqual(['/standalone.jpg', '/event-a.jpg'])
})

it('shows the fallback notice when either source falls back', async () => {
  fetchEventsResult.mockResolvedValue({ events: [], source: 'remote' })
  fetchGalleryPhotosResult.mockResolvedValue({ photos: [], source: 'fallback' })
  renderGallery()
  expect(await screen.findByText(/fallback event information/i)).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/records.test.jsx -t "merges standalone"` (plus the fallback test)
Expected: FAIL — GalleryPage ignores standalone photos

- [ ] **Step 3: Implement the merge**

Modify `src/pages/GalleryPage.jsx`:

1. Add import:

```js
import { fetchGalleryPhotosResult } from '../data/gallerySource'
```

2. Replace the load effect (lines 16-25):

```js
useEffect(() => {
  let active = true
  Promise.all([fetchEventsResult(), fetchGalleryPhotosResult()]).then(([eventsResult, photosResult]) => {
    if (!active) return
    setImages([...photosResult.photos, ...aggregateGallery(eventsResult.events)])
    setSource(eventsResult.source === 'remote' && photosResult.source === 'remote' ? 'remote' : 'fallback')
    setStatus('ready')
  }).catch(() => active && setStatus('error'))
  return () => { active = false }
}, [])
```

- [ ] **Step 4: Run all gallery tests to verify pass**

Run: `npx vitest run src/pages/records.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add ieee-app/src/pages/GalleryPage.jsx ieee-app/src/pages/records.test.jsx
git commit -m "feat: merge standalone gallery photos into public archive"
```

---

### Task 11: Public committees pages read from DB with fallback

**Files:**
- Modify: `ieee-app/src/pages/CommitteesPage.jsx`
- Modify: `ieee-app/src/pages/CommitteeDetailPage.jsx`
- Modify: `ieee-app/src/pages/records.test.jsx` (committee describe block)

- [ ] **Step 1: Update the failing tests — mock committeeSource, make assertions async**

In `src/pages/records.test.jsx`:

1. Add the hoisted mock next to the eventsSource mock:

```js
const committeeSource = vi.hoisted(() => ({
  fetchAllMembersResult: vi.fn(),
  fetchCommitteeDetailResult: vi.fn(),
  fetchCommitteesResult: vi.fn(),
}))
vi.mock('../data/committeeSource', () => committeeSource)
```

2. In `beforeEach` add defaults that mirror the static data (keep the import of `committees` and `boardMembers` already present):

```js
committeeSource.fetchCommitteesResult.mockReset()
committeeSource.fetchCommitteesResult.mockResolvedValue({ committees: structuredClone(committees), source: 'fallback' })
committeeSource.fetchAllMembersResult.mockReset()
committeeSource.fetchAllMembersResult.mockResolvedValue({ members: structuredClone(boardMembers), source: 'fallback' })
committeeSource.fetchCommitteeDetailResult.mockReset()
committeeSource.fetchCommitteeDetailResult.mockImplementation(async slug => {
  const committee = committees.find(item => item.slug === slug)
  return {
    committee: committee ? structuredClone(committee) : null,
    members: structuredClone(boardMembers),
    source: 'fallback',
  }
})
```

3. Convert the committee describe block assertions to async. Every test that renders a committee page must first `await screen.findByRole('heading', { level: 1, name: ... })` before its existing `getBy*` assertions. Specifically:

- In `renders every committee as a record grouped by category`: make the callback `async`, and after `renderRoute('/committees')` add `await screen.findByRole('heading', { level: 1, name: 'Committee directory' })` before the existing assertions.
- In `shows explicitly aliased leadership without managers or private contacts`: make callback `async` and add `await screen.findByRole('heading', { level: 1, name: 'Committee directory' })`.
- In `renders every detail route with exactly its explicitly supported leadership`: after `renderRoute(\`/committees/${committee.slug}\`)` add `await screen.findByRole('heading', { level: 1, name: committee.name })`, then keep the rest (the `getByRole` calls are fine once the heading is present).
- In `does not infer cyber leadership from CS or DS roster labels`: add `await screen.findByRole('heading', { level: 1, name: committee.slug === 'cyber-defensive' ? 'Cyber Defensive' : 'Cyber Offensive' })` after each `renderRoute`.
- In `handles unknown committee routes`: add `await screen.findByRole('heading', { level: 1, name: 'Committee not found' })`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/records.test.jsx -t "committee"`
Expected: FAIL — pages render static data synchronously and the mocks are ignored

- [ ] **Step 3: Implement the DB-first committees page**

Replace the body of `src/pages/CommitteesPage.jsx` (keep imports of `committeeCategories` and `findCommitteeLeaders`; drop the static `boardMembers`/`technicalCommittees`/`nonTechnicalCommittees`/`totalCommittees` imports):

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { committeeCategories } from '../data/committees'
import { findCommitteeLeaders } from '../data/presentation'
import { fetchAllMembersResult, fetchCommitteesResult } from '../data/committeeSource'

const CommitteeGroup = ({ title, committees, members }) => (
  <section>
    <h2 className="text-2xl font-bold text-on-surface md:text-3xl">{title}</h2>
    <ul className="mt-8 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
      {committees.map((committee) => {
        const leaders = findCommitteeLeaders(committee.slug, members)
        return (
          <li key={committee.slug} className="grid gap-4 py-8 md:grid-cols-[minmax(0,1fr)_10rem] md:gap-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface">{committee.name}</h3>
              <p className="mt-2 max-w-3xl leading-relaxed text-on-surface-variant">{committee.shortDescription}</p>
              {leaders.length > 0 && <p className="mt-3 flex flex-wrap gap-x-2 text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">Leadership:</span> {leaders.map(leader => <span key={`${leader.name}-${leader.position}`}>{leader.name}</span>)}</p>}
            </div>
            <div className="md:text-right">
              <p className="text-sm text-on-surface-variant">{committee.categoryLabel}</p>
              <Link aria-label={`View ${committee.name} committee record`} className="mt-4 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-widest text-primary" to={`/committees/${committee.slug}`}>View record</Link>
            </div>
          </li>
        )
      })}
    </ul>
  </section>
)

export default function CommitteesPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchCommitteesResult(), fetchAllMembersResult()]).then(([committeesResult, membersResult]) => {
      if (active) setData({ ...committeesResult, members: membersResult.members })
    })
    return () => { active = false }
  }, [])

  if (!data) return null

  const technical = data.committees.filter(committee => committee.category === 'technical')
  const nonTechnical = data.committees.filter(committee => committee.category === 'non-technical')

  return (
    <PageLayout>
      <AnimatedSection>
        <header className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <h1 className="text-4xl font-black text-on-surface md:text-6xl">Committee directory</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">Technical and non-technical committee records published by IEEE HITU Student Branch.</p>
          <p className="mt-8 text-on-surface-variant" aria-label={`${data.committees.length} committee records`}><strong className="text-3xl text-primary">{data.committees.length}</strong> committee records</p>
        </header>
      </AnimatedSection>
      <div className="border-y border-outline-variant/30 bg-surface-container-low py-16">
        <div className="container mx-auto max-w-6xl space-y-16 px-6 sm:px-8 md:px-12">
          <CommitteeGroup title={committeeCategories.technical} committees={technical} members={data.members} />
          <CommitteeGroup title={committeeCategories.nonTechnical} committees={nonTechnical} members={data.members} />
        </div>
      </div>
    </PageLayout>
  )
}
```

- [ ] **Step 4: Implement the DB-first detail page**

Replace the body of `src/pages/CommitteeDetailPage.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import AnimatedSection from '../components/AnimatedSection'
import { findCommitteeLeaders } from '../data/presentation'
import { fetchCommitteeDetailResult } from '../data/committeeSource'

export default function CommitteeDetailPage() {
  const { slug } = useParams()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    let active = true
    fetchCommitteeDetailResult(slug).then(result => {
      if (active) setDetail(result)
    })
    return () => { active = false }
  }, [slug])

  if (!detail) return null

  const { committee, members } = detail

  if (!committee) return (
    <PageLayout>
      <section className="container mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16 sm:px-8 md:px-12">
        <h1 className="text-4xl font-black text-on-surface md:text-5xl">Committee not found</h1>
        <p className="mt-5 text-on-surface-variant">The requested committee record does not exist.</p>
        <Link className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-primary" to="/committees">Back to committees</Link>
      </section>
    </PageLayout>
  )

  const leaders = findCommitteeLeaders(committee.slug, members)

  return (
    <PageLayout>
      <AnimatedSection trigger="load">
        <header className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <Link className="inline-flex min-h-11 items-center text-sm font-bold text-primary" to="/committees">All committees</Link>
          <h1 className="mt-8 text-4xl font-black text-on-surface md:text-6xl">{committee.name}</h1>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div><dt className="text-on-surface-variant">Category</dt><dd className="mt-1 font-semibold text-on-surface">{committee.categoryLabel}</dd></div>
          </dl>
        </header>

        <div className="border-y border-outline-variant/30 bg-surface-container-low py-16">
          <div className="container mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <section>
              <h2 className="text-2xl font-bold text-on-surface">Mandate</h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">{committee.shortDescription}</p>
            </section>
            {leaders.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-on-surface">Leadership</h2>
                <ul className="mt-5 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
                  {leaders.map(leader => <li className="py-4" key={`${leader.name}-${leader.committee}-${leader.position}`}><p className="font-semibold text-on-surface">{leader.name}</p><p className="mt-1 text-sm text-on-surface-variant">{leader.position}</p></li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </AnimatedSection>
    </PageLayout>
  )
}
```

- [ ] **Step 5: Run all committee + gallery tests to verify pass**

Run: `npx vitest run src/pages/records.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add ieee-app/src/pages/CommitteesPage.jsx ieee-app/src/pages/CommitteeDetailPage.jsx ieee-app/src/pages/records.test.jsx
git commit -m "feat: read committees and members from database with static fallback"
```

---

### Task 12: Full verification + Cloudinary setup handoff

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all suites PASS (existing + new)

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors (or fix any lint findings, e.g. unused imports, then re-run)

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, open `http://localhost:5173/admin`, log in with `ieee2026`, verify:
1. Events tab behaves as before
2. Gallery tab: upload a photo (after Cloudinary preset exists), paste-URL fallback, delete
3. Committees tab: create a committee, add a member with a photo URL, edit, delete
4. Public `/gallery` shows the new photo; `/committees` and `/committees/<slug>` show the new committee and its Head/Vice Head members

- [ ] **Step 5: Cloudinary one-time setup (user)**

In Cloudinary dashboard (account `dweqigxnz`): Settings → Upload → presets → **Add preset**:
- Name: `ieee_uploads`
- Signing mode: **Unsigned**
- (Optional) restrict to image file types.

Until this preset exists, uploads fail with "Invalid preset" — the URL-paste fallback still works.

- [ ] **Step 6: Commit any leftover changes**

```bash
git add -A
git commit -m "chore: finalize admin gallery and committee management"
```

---

## Self-review notes

- **Spec coverage:** schema ✓ (Task 3), upload helper ✓ (Task 2), admin tabs ✓ (Task 9), gallery tab ✓ (Task 7), committees tab + members ✓ (Task 8), public pages ✓ (Tasks 10-11), static fallback ✓ (Tasks 4-5), Cloudinary manual setup ✓ (Task 12).
- **Type consistency:** photo rows map to `{ _id, src, caption, createdAt }`; committees to `{ _id, name, slug, category, categoryLabel, shortDescription, memberCount }`; members to `{ _id, committeeId, name, position, email, phone, img, committee }` — shapes are defined in Task 3 and consumed identically everywhere (gallerySource/committeeSource pass through, tabs and pages read the same field names). `findCommitteeLeaders(slug, members)` keeps working because both static `boardMembers` and DB members carry a `committee` name field.
- **Existing-test impact:** only `admin.test.jsx` (new turso/source mocks + tab tests) and `records.test.jsx` (committee describe made async, gallery merge tests) change; every other suite stays untouched.