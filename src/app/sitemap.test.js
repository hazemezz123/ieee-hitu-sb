import { describe, it, expect } from 'vitest'
import sitemap from './sitemap.js'
import { siteConfig } from '@/lib/seo.js'

describe('sitemap', () => {
  it('includes home, sections, and dynamic slugs with absolute URLs', async () => {
    const urls = await sitemap()
    const locs = urls.map((u) => u.url)
    expect(locs).toContain(siteConfig.siteUrl)
    expect(locs).toContain(`${siteConfig.siteUrl}/events`)
    expect(locs).toContain(`${siteConfig.siteUrl}/committees`)
    expect(locs.some((u) => u.startsWith(`${siteConfig.siteUrl}/events/`))).toBe(true)
    expect(locs.some((u) => u.startsWith(`${siteConfig.siteUrl}/committees/`))).toBe(true)
    for (const entry of urls) {
      expect(entry.url.startsWith('https://')).toBe(true)
      expect(entry.lastModified).toBeDefined()
    }
  })
})
