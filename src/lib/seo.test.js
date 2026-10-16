import { describe, it, expect } from 'vitest'
import { siteConfig, absoluteUrl } from './seo.js'

describe('seo siteConfig', () => {
  it('exposes a single production origin and absoluteUrl() joins paths', () => {
    expect(siteConfig.siteUrl).toMatch(/^https:\/\//)
    expect(absoluteUrl('/events/my-talk')).toBe(`${siteConfig.siteUrl}/events/my-talk`)
  })

  it('absoluteUrl handles root and trailing slashes without doubling', () => {
    expect(absoluteUrl('/')).toBe(siteConfig.siteUrl)
    expect(absoluteUrl('events')).toBe(`${siteConfig.siteUrl}/events`)
  })
})
