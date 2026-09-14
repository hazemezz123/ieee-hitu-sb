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
