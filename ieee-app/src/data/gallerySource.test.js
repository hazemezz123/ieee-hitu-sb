import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({ fetchGalleryPhotos: vi.fn() }))
vi.mock('../lib/turso', () => turso)

import { fetchGalleryPhotos, fetchGalleryPhotosResult } from './gallerySource'

describe('gallery source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns remote photos with provenance', async () => {
    const photos = [{ _id: 1, src: '/a.jpg', caption: 'A' }]
    turso.fetchGalleryPhotos.mockResolvedValue(photos)

    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos, source: 'remote' })
    await expect(fetchGalleryPhotos()).resolves.toEqual(photos)
  })

  it('falls back to an empty list when Turso fails', async () => {
    turso.fetchGalleryPhotos.mockRejectedValueOnce(new Error('offline'))

    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos: [], source: 'fallback' })
  })

  it('returns a fresh array each fallback call', async () => {
    turso.fetchGalleryPhotos.mockRejectedValue(new Error('offline'))
    const first = (await fetchGalleryPhotosResult()).photos
    first.push({ src: '/mutated.jpg' })
    await expect(fetchGalleryPhotosResult()).resolves.toEqual({ photos: [], source: 'fallback' })
  })
})