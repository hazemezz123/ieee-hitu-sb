'use client'

import { useState } from 'react'
import Link from 'next/link'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

export default function EventRecord({ event, tone = 'light' }) {
  const inverse = tone === 'inverse'
  const [imageFailed, setImageFailed] = useState(false)
  const image = event.cardImage || event.coverImage
  return (
    <article data-reveal="record" className={`border-t py-5 ${inverse ? 'border-white/20' : 'border-outline-variant/40'}`}>
      <div className="flex gap-5">
        {image && !imageFailed && (
          <img src={image} alt={event.title || 'Event'} onError={() => setImageFailed(true)} className="h-20 w-28 shrink-0 rounded-xl object-cover md:h-24 md:w-40" />
        )}
        {image && imageFailed && (
          <div role="img" aria-label={`${event.title || 'Event'} image unavailable`} className={`flex h-20 w-28 shrink-0 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold md:h-24 md:w-40 ${inverse ? 'bg-white/10 text-[#C7D0D8]' : 'bg-surface-container text-on-surface-variant'}`}>Image unavailable</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className={`text-lg font-bold ${inverse ? 'text-[#F0F4F8]' : 'text-on-surface'}`}>{event.title}</h3>
            <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
          </div>
          <p className={`mt-2 text-sm ${inverse ? 'text-[#C7D0D8]' : 'text-on-surface-variant'}`}>{event.excerpt || event.location}</p>
          {event.slug && <Link aria-label={`Read ${event.title} event record`} className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href={`/events/${event.slug}`}>Read event record</Link>}
        </div>
      </div>
    </article>
  )
}
