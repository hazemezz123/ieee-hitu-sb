import { slugify } from './slugify'

const committeeAliases = {
  'artificial-intelligence': ['AI', 'Artificial Intelligence'],
  automation: ['Automation', 'Automations'],
  'content-creation': ['Content Creation'],
  'cyber-security-defensive': ['Cyber Security (Defensive)', 'Cyber Defensive'],
  'cyber-security-offensive': ['Cyber Security (Offensive)', 'Cyber Offensive'],
  embedded: ['Embedded'],
  flutter: ['Flutter'],
  'graphic-design': ['Graphic Design'],
  hr: ['HR'],
  iot: ['IoT'],
  'logistics-events': ['Logistics & Events'],
  marketing: ['Marketing'],
  'mobile-application': ['Mobile Application'],
  'pcb-design': ['PCB Design'],
  'people-culture': ['People & Culture'],
  'problem-solving': ['Problem Solving'],
  'public-relations-fundraising': ['Public Relations & Fundraising'],
  solidworks: ['SolidWorks'],
  'web-development': ['Web', 'Web Development'],
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
  const aliases = committeeAliases[slug] || []
  return members.filter(member =>
    Boolean(member.committee)
    && (aliases.includes(member.committee) || slugify(member.committee) === slug)
    && /^(Head|Vice Head)$/.test(member.position),
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
