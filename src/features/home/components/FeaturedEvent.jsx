'use client'

import { useState } from 'react'
import Link from 'next/link'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

export default function FeaturedEvent({ event, fallback }) {
  const [imageFailed, setImageFailed] = useState(false)
  const image = event.cardImage || event.coverImage
  return (
    <div className="border-l border-primary/40 pl-5">
      <h2 className="text-2xl font-bold text-on-surface">Featured next event</h2>
      {fallback && <p className="mt-3 text-sm text-on-surface-variant">Showing the static event archive while live event data is unavailable.</p>}
      <article className={`mt-6 grid items-center gap-8 ${image ? 'md:grid-cols-2' : ''}`}>
        {image && (imageFailed ? (
          <div role="img" aria-label={`${event.title || 'Event'} image unavailable`} className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-surface-container px-6 text-center font-semibold text-on-surface-variant">Image unavailable</div>
        ) : (
          <img src={image} alt={event.title || 'Event'} className="aspect-[16/10] w-full rounded-xl object-cover" onError={() => setImageFailed(true)} />
        ))}
        <div>
          <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
          <h3 className="mt-3 text-3xl font-bold text-on-surface">{event.title}</h3>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{event.excerpt || event.location}</p>
          {event.slug && <Link aria-label={`Read ${event.title} event record`} className="btn btn-primary mt-6" href={`/events/${event.slug}`}>Read event record</Link>}
        </div>
      </article>
    </div>
  )
}
