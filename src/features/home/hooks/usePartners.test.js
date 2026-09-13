import { beforeEach, describe, expect, it, vi } from 'vitest'
import { communityPartners as staticPartners } from '../data/partners'

const turso = vi.hoisted(() => ({
  createPartner: vi.fn(),
  deletePartner: vi.fn(),
  fetchPartners: vi.fn(),
  updatePartner: vi.fn(),
}))

vi.mock('@/lib/turso', () => turso)

import {
  createPartner,
  deletePartner,
  fetchPartners,
  fetchPartnersResult,
  updatePartner,
} from './usePartners'

describe('partner source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds provenance without breaking existing partner reads', async () => {
    const remotePartners = [{ name: 'Remote Partner', logo: 'https://cdn/x.png' }]
    turso.fetchPartners.mockResolvedValue(remotePartners)

    await expect(fetchPartnersResult()).resolves.toEqual({ partners: remotePartners, source: 'remote' })
    await expect(fetchPartners()).resolves.toEqual(remotePartners)

    turso.fetchPartners.mockRejectedValueOnce(new Error('offline'))
    await expect(fetchPartnersResult()).resolves.toMatchObject({ source: 'fallback' })
  })

  it('preserves the static fallback list after rejection', async () => {
    turso.fetchPartners.mockRejectedValueOnce(new Error('offline'))

    await expect(fetchPartners()).resolves.toEqual(staticPartners)
  })

  it('handles non-Error rejection reasons', async () => {
    turso.fetchPartners.mockRejectedValueOnce(null)

    await expect(fetchPartnersResult()).resolves.toMatchObject({ source: 'fallback' })
  })

  it('returns fresh fallback arrays from metadata and legacy reads', async () => {
    const originalNames = staticPartners.map(partner => partner.name)
    turso.fetchPartners.mockRejectedValue(new Error('offline'))

    const metadataPartners = (await fetchPartnersResult()).partners
    const legacyPartners = await fetchPartners()
    metadataPartners.length = 0
    legacyPartners.reverse()

    await expect(fetchPartnersResult()).resolves.toMatchObject({
      partners: originalNames.map(name => expect.objectContaining({ name })),
      source: 'fallback',
    })
    await expect(fetchPartners()).resolves.toEqual(originalNames.map(name => expect.objectContaining({ name })))
  })

  it('preserves CRUD exports', () => {
    expect(createPartner).toBe(turso.createPartner)
    expect(updatePartner).toBe(turso.updatePartner)
    expect(deletePartner).toBe(turso.deletePartner)
  })
})