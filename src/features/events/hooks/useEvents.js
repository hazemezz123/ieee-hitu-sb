import { events as staticEvents, getEventBySlug as getStaticEventBySlug } from '../data/events'
import { fetchEvents as tursoFetchEvents, fetchEventBySlug as tursoFetchEventBySlug } from '@/lib/turso'

export { createEvent, updateEvent, deleteEvent } from '@/lib/turso'

export async function fetchEventsResult() {
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
