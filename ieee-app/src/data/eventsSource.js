import { events, getEventBySlug as getStaticEventBySlug } from './events';

/**
 * Fetch all events. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event"]')
 */
export async function fetchEvents() {
  return events;
}

/**
 * Fetch a single event by slug. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event" && slug.current == $slug][0]')
 */
export async function fetchEventBySlug(slug) {
  return getStaticEventBySlug(slug);
}
