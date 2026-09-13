'use client'

import { useState } from 'react'
import Link from 'next/link'
import Lightbox from './Lightbox'

const formatDate = date => {
  const parsed = new Date(date)
  return Number.isFinite(parsed.getTime())
    ? parsed.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })
    : 'Date unavailable'
}

export default function MasonryGallery({ images, headingLevel = 3 }) {
  const safeImages = images ?? []
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [failedItems, setFailedItems] = useState(new Set())
  const items = safeImages.map((image, index) => ({
    image,
    index,
    id: `${image.eventSlug || 'event'}:${image.src || ''}:${image.caption || ''}:${index}`,
  }))

  if (!items.length) return null

  const navigateLightbox = direction => setLightboxIndex(index => (index + direction + items.length) % items.length)

  return (
    <>
      <div className="columns-1 gap-8 space-y-12 sm:columns-2 lg:columns-3">
        {items.map(({ image, index, id }) => {
          const alt = image.caption || `${image.eventTitle || 'Event'} photo`
          const failed = failedItems.has(id)
          const media = <span className="block w-full" style={{ aspectRatio: `${image.width || 4} / ${image.height || 3}` }}>
            {failed
              ? <span role="img" aria-label={`${alt} image unavailable`} className="flex h-full min-h-48 items-center justify-center bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-4xl" aria-hidden="true">broken_image</span></span>
              : <img src={image.src} alt={alt} width={image.width || 800} height={image.height || 600} className="h-full w-full object-cover" onError={() => setFailedItems(current => new Set(current).add(id))} />}
          </span>
          return <figure key={id} className="break-inside-avoid">
            {failed
              ? <div className="w-full overflow-hidden bg-surface-container">{media}</div>
              : <button type="button" className="group block w-full overflow-hidden bg-surface-container text-left" onClick={() => setLightboxIndex(index)} aria-label={`Open ${alt}`}>{media}</button>}
            <figcaption className="pt-4">
              {image.eventTitle && <Heading className="text-lg font-bold text-on-surface">{image.eventTitle}</Heading>}
              {image.eventDate && <time className="mt-1 block text-sm text-on-surface-variant" dateTime={image.eventDate}>{formatDate(image.eventDate)}</time>}
              {image.caption && <p className="mt-3 text-on-surface-variant">{image.caption}</p>}
              {image.eventSlug && <Link className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-primary" href={`/events/${image.eventSlug}`}>View {image.eventTitle || 'event'}<span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span></Link>}
            </figcaption>
          </figure>
        })}
      </div>

      {lightboxIndex !== null && safeImages[lightboxIndex] && <Lightbox images={safeImages} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={navigateLightbox} />}
    </>
  )
}
