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

    expect(fetchMock).toHaveBeenCalledTimes(4)
    const sqls = fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body).requests[0].stmt.sql)
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS gallery_photos')
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS committees')
    expect(sqls.join('\n')).toContain('CREATE TABLE IF NOT EXISTS committee_members')
    expect(sqls[3]).toContain("FROM sqlite_master WHERE type = 'table' AND name = 'events'")
  })

  it('adds the event_link column when the events table is missing it', async () => {
    const generic = { json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 1, rows_affected: 0 } } }] }) }
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce({ json: async () => selectResult([{ name: 'name' }], [[text('events')]]) })
    fetchMock.mockResolvedValueOnce({ json: async () => selectResult([{ name: 'name' }], [[text('title')]]) })
    fetchMock.mockResolvedValueOnce(generic)
    await ensureSchema()

    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(lastBody().sql).toBe('ALTER TABLE events ADD COLUMN event_link TEXT')
  })

  it('skips the ALTER when the event_link column already exists', async () => {
    const generic = { json: async () => ({ results: [{ type: 'ok', response: { result: { last_insert_rowid: 1, rows_affected: 0 } } }] }) }
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce(generic)
    fetchMock.mockResolvedValueOnce({ json: async () => selectResult([{ name: 'name' }], [[text('events')]]) })
    fetchMock.mockResolvedValueOnce({ json: async () => selectResult([{ name: 'name' }], [[text('event_link')]]) })
    await ensureSchema()

    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(JSON.parse(fetchMock.mock.calls.at(-1)[1].body).requests[0].stmt.sql).toBe('PRAGMA table_info(events)')
  })
})

describe('turso error handling', () => {
  it('surfaces the real message from a top-level error result', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({
      results: [{ type: 'error', error: { message: 'SQLite error: table events has no column named event_link', code: 'SQLITE_UNKNOWN' } }],
    }) })
    await expect(addGalleryPhoto('https://cdn/x.jpg', 'Caption here')).rejects.toThrow('SQLite error: table events has no column named event_link')
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

    fetchMock.mockClear()
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