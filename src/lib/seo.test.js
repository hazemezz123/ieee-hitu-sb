import { describe, it, expect } from 'vitest'
import { siteConfig, absoluteUrl, resolveOgImage, resolveSiteUrl } from './seo.js'

describe('seo siteConfig', () => {
  it('exposes a single production origin and absoluteUrl() joins paths', () => {
    expect(siteConfig.siteUrl).toMatch(/^https:\/\//)
    expect(absoluteUrl('/events/my-talk')).toBe(`${siteConfig.siteUrl}/events/my-talk`)
  })

  it('absoluteUrl handles root and trailing slashes without doubling', () => {
    expect(absoluteUrl('/')).toBe(siteConfig.siteUrl)
    expect(absoluteUrl('events')).toBe(`${siteConfig.siteUrl}/events`)
  })

  it('resolveSiteUrl prepends https when the scheme is missing', () => {
    expect(resolveSiteUrl('example.com')).toBe('https://example.com')
    expect(resolveSiteUrl('https://example.com/')).toBe('https://example.com')
  })

  it('resolveOgImage absolutizes relative paths and passes through absolute URLs', () => {
    expect(resolveOgImage('/x.png')).toBe(`${siteConfig.siteUrl}/x.png`)
    expect(resolveOgImage('https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png')
    expect(resolveOgImage('')).toBeUndefined()
  })
})
