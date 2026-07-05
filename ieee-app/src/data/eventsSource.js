import { events as staticEvents, getEventBySlug as getStaticEventBySlug } from './events'
import { fetchEvents as tursoFetchEvents, fetchEventBySlug as tursoFetchEventBySlug } from '../lib/turso'

const USE_TURSO = true

export { createEvent, updateEvent, deleteEvent } from '../lib/turso'

export async function fetchEvents() {
  if (!USE_TURSO) return staticEvents

  try {
    return await tursoFetchEvents()
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err.message)
    return staticEvents
  }
}

export async function fetchEventBySlug(slug) {
  if (!USE_TURSO) return getStaticEventBySlug(slug)

  try {
    return await tursoFetchEventBySlug(slug)
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err.message)
    return getStaticEventBySlug(slug)
  }
}
