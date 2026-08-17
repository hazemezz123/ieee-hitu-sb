import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events as staticEvents } from './events'

const turso = vi.hoisted(() => ({
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  fetchEventBySlug: vi.fn(),
  fetchEvents: vi.fn(),
  updateEvent: vi.fn(),
}))

vi.mock('../lib/turso', () => turso)

import {
  createEvent,
  deleteEvent,
  fetchEventBySlug,
  fetchEventBySlugResult,
  fetchEvents,
  fetchEventsResult,
  updateEvent,
} from './eventsSource'

describe('event source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds provenance without breaking existing event-list reads', async () => {
    const remoteEvents = [{ slug: 'remote' }]
    turso.fetchEvents.mockResolvedValue(remoteEvents)

    await expect(fetchEventsResult()).resolves.toEqual({ events: remoteEvents, source: 'remote' })
    await expect(fetchEvents()).resolves.toEqual(remoteEvents)

    turso.fetchEvents.mockRejectedValueOnce(new Error('offline'))
    await expect(fetchEventsResult()).resolves.toMatchObject({ source: 'fallback' })
  })

  it('preserves the legacy static event-list fallback after rejection', async () => {
    turso.fetchEvents.mockRejectedValueOnce(new Error('offline'))

    await expect(fetchEvents()).resolves.toEqual(staticEvents)
  })

  it('adds provenance without breaking existing event-detail reads', async () => {
    const remoteEvent = { slug: 'remote' }
    turso.fetchEventBySlug.mockResolvedValue(remoteEvent)

    await expect(fetchEventBySlugResult('remote')).resolves.toEqual({ event: remoteEvent, source: 'remote' })
    await expect(fetchEventBySlug('remote')).resolves.toEqual(remoteEvent)

    turso.fetchEventBySlug.mockRejectedValueOnce(new Error('offline'))
    await expect(fetchEventBySlugResult('not-found')).resolves.toEqual({ event: undefined, source: 'fallback' })
  })

  it('preserves legacy static event-detail fallback semantics after rejection', async () => {
    turso.fetchEventBySlug
      .mockRejectedValueOnce(new Error('offline'))
      .mockRejectedValueOnce(new Error('offline'))

    await expect(fetchEventBySlug(staticEvents[0].slug)).resolves.toEqual(staticEvents[0])
    await expect(fetchEventBySlug('not-found')).resolves.toBeUndefined()
  })

  it('handles non-Error rejection reasons', async () => {
    turso.fetchEvents.mockRejectedValueOnce('offline')
    turso.fetchEventBySlug.mockRejectedValueOnce(null)

    await expect(fetchEventsResult()).resolves.toMatchObject({ source: 'fallback' })
    await expect(fetchEventBySlugResult('not-found')).resolves.toEqual({ event: undefined, source: 'fallback' })
  })

  it('preserves CRUD exports', () => {
    expect(createEvent).toBe(turso.createEvent)
    expect(updateEvent).toBe(turso.updateEvent)
    expect(deleteEvent).toBe(turso.deleteEvent)
  })

  it('returns fresh fallback arrays from metadata and legacy reads', async () => {
    const originalSlugs = staticEvents.map(event => event.slug)
    turso.fetchEvents.mockRejectedValue(new Error('offline'))

    const metadataEvents = (await fetchEventsResult()).events
    const legacyEvents = await fetchEvents()
    metadataEvents.length = 0
    legacyEvents.reverse()

    await expect(fetchEventsResult()).resolves.toMatchObject({
      events: originalSlugs.map(slug => expect.objectContaining({ slug })),
      source: 'fallback',
    })
    await expect(fetchEvents()).resolves.toEqual(originalSlugs.map(slug => expect.objectContaining({ slug })))
  })

  it('does not expose fallback event objects or nested galleries through list reads', async () => {
    const expected = structuredClone(staticEvents)
    turso.fetchEvents.mockRejectedValue(new Error('offline'))

    const metadataEvent = (await fetchEventsResult()).events[0]
    const legacyEvent = (await fetchEvents())[0]
    metadataEvent.title = 'Mutated title'
    metadataEvent.gallery[0].caption = 'Mutated caption'
    legacyEvent.gallery.push({ src: '/mutated.jpg' })

    await expect(fetchEventsResult()).resolves.toEqual({ events: expected, source: 'fallback' })
    await expect(fetchEvents()).resolves.toEqual(expected)
  })

  it('does not expose fallback event objects or nested galleries through detail reads', async () => {
    const expected = structuredClone(staticEvents[0])
    turso.fetchEventBySlug.mockRejectedValue(new Error('offline'))

    const metadataEvent = (await fetchEventBySlugResult(expected.slug)).event
    const legacyEvent = await fetchEventBySlug(expected.slug)
    metadataEvent.title = 'Mutated title'
    metadataEvent.gallery[0].caption = 'Mutated caption'
    legacyEvent.gallery.push({ src: '/mutated.jpg' })

    await expect(fetchEventBySlugResult(expected.slug)).resolves.toEqual({ event: expected, source: 'fallback' })
    await expect(fetchEventBySlug(expected.slug)).resolves.toEqual(expected)
    await expect(fetchEventBySlug('not-found')).resolves.toBeUndefined()
  })
})
