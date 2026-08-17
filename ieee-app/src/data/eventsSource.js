import { events as staticEvents, getEventBySlug as getStaticEventBySlug } from './events'
import { fetchEvents as tursoFetchEvents, fetchEventBySlug as tursoFetchEventBySlug } from '../lib/turso'

const USE_TURSO = true

export { createEvent, updateEvent, deleteEvent } from '../lib/turso'

export async function fetchEventsResult() {
  if (!USE_TURSO) return { events: structuredClone(staticEvents), source: 'fallback' }

  try {
    return { events: await tursoFetchEvents(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { events: structuredClone(staticEvents), source: 'fallback' }
  }
}

export async function fetchEvents() {
  return (await fetchEventsResult()).events
}

export async function fetchEventBySlugResult(slug) {
  if (!USE_TURSO) {
    const event = getStaticEventBySlug(slug)
    return { event: event === undefined ? undefined : structuredClone(event), source: 'fallback' }
  }

  try {
    return { event: await tursoFetchEventBySlug(slug), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    const event = getStaticEventBySlug(slug)
    return { event: event === undefined ? undefined : structuredClone(event), source: 'fallback' }
  }
}

export async function fetchEventBySlug(slug) {
  return (await fetchEventBySlugResult(slug)).event
}
