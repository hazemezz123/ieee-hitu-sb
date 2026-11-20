import { describe, expect, it } from 'vitest'
import {
  aggregateGallery,
  findCommitteeLeaders,
  getNextEvents,
  getRecentEvents,
  sortEvents,
} from './presentation'

const events = [
  { slug: 'later', title: 'Later', date: '2026-10-01T10:00:00Z', gallery: [] },
  { slug: 'past', title: 'Past', date: '2026-01-01T10:00:00Z', gallery: [{ src: '/past.jpg', caption: 'Workshop' }] },
  { slug: 'next', title: 'Next', date: '2026-09-01T10:00:00Z', gallery: [] },
]

describe('presentation selectors', () => {
  it('orders and selects events without mutating input', () => {
    const original = [...events]

    expect(sortEvents(events).map(event => event.slug)).toEqual(['past', 'next', 'later'])
    expect(getNextEvents(events, new Date('2026-08-17T00:00:00Z'), 1)[0].slug).toBe('next')
    expect(getRecentEvents(events, new Date('2026-08-17T00:00:00Z'), 1)[0].slug).toBe('past')
    expect(events).toEqual(original)
  })

  it('sorts invalid or missing dates last and excludes them from temporal selections', () => {
    const mixedEvents = [
      { slug: 'invalid', date: 'not-a-date' },
      { slug: 'future', date: '2026-09-01T10:00:00Z' },
      { slug: 'missing' },
      { slug: 'null', date: null },
      { slug: 'past', date: '2026-01-01T10:00:00Z' },
    ]
    const now = new Date('2026-08-17T00:00:00Z')

    expect(sortEvents(mixedEvents).map(event => event.slug)).toEqual(['past', 'future', 'invalid', 'missing', 'null'])
    expect(getNextEvents(mixedEvents, now).map(event => event.slug)).toEqual(['future'])
    expect(getRecentEvents(mixedEvents, now).map(event => event.slug)).toEqual(['past'])
  })

  it('keeps the first non-empty slug and preserves slugless records', () => {
    const first = { slug: 'same', title: 'First', date: '2026-09-01T10:00:00Z' }
    const duplicate = { slug: 'same', title: 'Duplicate', date: '2026-10-01T10:00:00Z' }
    const sluglessA = { title: 'Slugless A', date: '2026-11-01T10:00:00Z' }
    const sluglessB = { slug: '', title: 'Slugless B', date: '2026-12-01T10:00:00Z' }

    expect(sortEvents([sluglessB, first, duplicate, sluglessA])).toEqual([first, sluglessA, sluglessB])
    expect(getNextEvents([first, duplicate, sluglessA, sluglessB], new Date('2026-08-17T00:00:00Z'))).toEqual([first, sluglessA, sluglessB])
  })

  it('matches every explicit committee alias and excludes managers', () => {
    const aliases = {
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
    const members = Object.values(aliases).flat().map((committee, index) => ({
      name: `${committee}-${index}`,
      committee,
      position: index % 2 ? 'Vice Head' : 'Head',
    }))
    members.push({ name: 'Manager', committee: 'Web Development', position: 'Technical Software Manager' })

    for (const [slug, committees] of Object.entries(aliases)) {
      expect(findCommitteeLeaders(slug, members).map(member => member.committee)).toEqual(committees)
    }
    expect(findCommitteeLeaders('web-development', members).map(member => member.name)).not.toContain('Manager')
    expect(findCommitteeLeaders('unknown', members)).toEqual([])
  })

  it('matches DB display names that slugify to the route', () => {
    const members = [
      { name: 'PublicRel', committee: 'Public Relations & Fundraising', position: 'Head' },
      { name: 'CyberDef', committee: 'Cyber Security (Defensive)', position: 'Head' },
      { name: 'Logistics', committee: 'Logistics & Events', position: 'Vice Head' },
      { name: 'Manager', committee: 'Logistics & Events', position: 'Technical Manager' },
    ]

    expect(findCommitteeLeaders('public-relations-fundraising', members).map(member => member.name)).toEqual(['PublicRel'])
    expect(findCommitteeLeaders('cyber-security-defensive', members).map(member => member.name)).toEqual(['CyberDef'])
    expect(findCommitteeLeaders('logistics-events', members).map(member => member.name)).toEqual(['Logistics'])
  })

  it('keeps event metadata on gallery images', () => {
    expect(aggregateGallery(events)[0]).toMatchObject({
      src: '/past.jpg',
      caption: 'Workshop',
      eventTitle: 'Past',
      eventDate: '2026-01-01T10:00:00Z',
      eventSlug: 'past',
    })
  })
})
