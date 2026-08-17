import { fetchGalleryPhotos as tursoFetchGalleryPhotos } from '../lib/turso'

export async function fetchGalleryPhotosResult() {
  try {
    return { photos: await tursoFetchGalleryPhotos(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { photos: [], source: 'fallback' }
  }
}

export async function fetchGalleryPhotos() {
  return (await fetchGalleryPhotosResult()).photos
}
