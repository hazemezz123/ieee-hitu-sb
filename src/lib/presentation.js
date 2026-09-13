import { slugify } from './slugify'

const committeeAliases = {
  ai: ['AI'],
  automations: ['Automation'],
  cs: ['CS'],
  ds: ['DS'],
  embedded: ['Embedded'],
  'hr-td': ['HR', 'T&D'],
  marketing: ['Marketing'],
  'multi-media': ['Multi Media'],
  'pr-oc': ['PR', 'OC'],
  robotics: ['Robotic'],
  web: ['Web'],
}

const eventTime = event => event.date == null ? NaN : new Date(event.date).getTime()

export const sortEvents = events => events.filter((event, index) =>
  !event.slug || events.findIndex(candidate => candidate.slug === event.slug) === index
).sort((a, b) => {
  const aTime = eventTime(a)
  const bTime = eventTime(b)
  if (!Number.isFinite(aTime)) return Number.isFinite(bTime) ? 1 : 0
  return Number.isFinite(bTime) ? aTime - bTime : -1
})

export const getNextEvents = (events, now = new Date(), limit = events.length) =>
  sortEvents(events).filter(event => Number.isFinite(eventTime(event)) && eventTime(event) >= now).slice(0, limit)

export const getRecentEvents = (events, now = new Date(), limit = events.length) =>
  sortEvents(events).filter(event => Number.isFinite(eventTime(event)) && eventTime(event) < now).reverse().slice(0, limit)

export const findCommitteeLeaders = (slug, members) => {
  const aliases = committeeAliases[slug]
  if (!aliases) return []
  return members.filter(member =>
    (aliases.includes(member.committee) || slugify(member.committee) === slug) && /^(Head|Vice Head)$/.test(member.position),
  )
}

export const aggregateGallery = events => events.flatMap(event =>
  (event.gallery || []).map(image => ({
    ...image,
    eventTitle: event.title,
    eventDate: event.date,
    eventSlug: event.slug,
  })),
)
