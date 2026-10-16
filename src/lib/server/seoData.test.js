import { describe, it, expect } from 'vitest'
import { getEventForSeo, getCommitteeForSeo } from './seoData.js'

describe('seoData', () => {
  it('returns static fallback event when DB unconfigured', async () => {
    const ev = await getEventForSeo('intro-to-web-dev')
    expect(ev?.slug).toBe('intro-to-web-dev')
  })

  it('returns null for unknown event slug', async () => {
    expect(await getEventForSeo('__missing__')).toBeNull()
  })

  it('returns static fallback committee when DB unconfigured', async () => {
    const c = await getCommitteeForSeo('web')
    expect(c?.slug).toBe('web')
  })

  it('returns null for unknown committee slug', async () => {
    expect(await getCommitteeForSeo('__missing__')).toBeNull()
  })
})
