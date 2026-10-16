import { describe, it, expect } from 'vitest'
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  buildCommitteeJsonLd,
} from './structuredData.js'

describe('structuredData', () => {
  it('builds Organization with @context/@type', () => {
    const org = buildOrganizationJsonLd()
    expect(org['@context']).toBe('https://schema.org')
    expect(org['@type']).toBe('Organization')
    expect(org.name).toMatch(/IEEE HITU/)
  })

  it('builds WebSite with SearchAction', () => {
    const site = buildWebSiteJsonLd()
    expect(site['@type']).toBe('WebSite')
    const action = site.potentialAction
    expect(action['@type']).toBe('SearchAction')
  })

  it('builds BreadcrumbList from items', () => {
    const crumbs = buildBreadcrumbJsonLd([
      { name: 'Events', path: '/events' },
      { name: 'My Talk', path: '/events/my-talk' },
    ])
    expect(crumbs['@type']).toBe('BreadcrumbList')
    expect(crumbs.itemListElement).toHaveLength(2)
  })

  it('builds Event with required fields and absolute URLs', () => {
    const ev = buildEventJsonLd({
      title: 'Intro',
      slug: 'intro',
      date: '2026-05-10T09:00:00Z',
      location: 'HITU Campus',
      description: 'Desc',
      coverImage: '/x.png',
    })
    expect(ev['@type']).toBe('Event')
    expect(ev.name).toBe('Intro')
    expect(ev.url).toMatch(/^https:\/\//)
  })

  it('builds Committee as Organization sub-type', () => {
    const c = buildCommitteeJsonLd({ name: 'Web', slug: 'web', shortDescription: 'Builds web' })
    expect(c['@type']).toBe('Organization')
    expect(c.name).toBe('Web')
  })
})
