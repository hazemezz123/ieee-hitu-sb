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
        [[{ type: 'integer', value: '1' }, text('T'), text('t'), text('2999-01-01'), text('workshops'),
          text('[]'), text('L'), text(''), text(''), text(''), text(''), { type: 'null' }, text(''), { type: 'null' }]],
      ),
    )
    const events = await fetchEvents()
    expect(events[0]).toMatchObject({ _id: 1, title: 'T', status: 'upcoming', categoryLabel: 'Workshops' })
  })

  it('throws the database error message on error results', async () => {
    vi.resetModules()
    const { fetchEvents } = await import('./turso.js')
    fetchMock.mockResolvedValue({
      json: async () => ({ results: [{ type: 'error', response: { error: { message: 'no such table' } } }] }),
    })
    await expect(fetchEvents()).rejects.toThrow('no such table')
  })
})
