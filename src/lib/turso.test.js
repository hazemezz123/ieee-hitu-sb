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
