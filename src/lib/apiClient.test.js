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

  it('rejects a 200 response with a non-JSON body instead of resolving garbage', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error('no json') } })
    await expect(api('/api/events')).rejects.toThrow('Request failed (200)')
  })
})
