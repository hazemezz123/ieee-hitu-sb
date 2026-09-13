'use client'

import { useState } from 'react'
import Link from 'next/link'

function formatDateBadge(dateStr) {
  const date = new Date(dateStr);
  if (!Number.isFinite(date.getTime())) return { day: '--', month: 'DATE' }
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' }).toUpperCase(),
    month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
}

export default function EventCard({ event }) {
  const { day, month } = formatDateBadge(event.date);
const [imageFailed, setImageFailed] = useState(false)
  const hasSlug = Boolean(event.slug)
  const cardImage = event.cardImage || event.coverImage

  return (
    <article data-testid="event-record" data-slug={event.slug || ''} className="overflow-hidden bg-surface-container-lowest">
      {cardImage && !imageFailed ? <div className="relative aspect-[4/3] overflow-hidden">
        <img src={cardImage} alt={event.title || 'Event'} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
        {event.status === 'upcoming' && (
          <span className="absolute left-4 top-4 bg-primary px-3 py-1 text-[0.625rem] font-bold uppercase tracking-widest text-on-primary">
            Upcoming
          </span>
        )}
        <div className="absolute right-4 top-4 bg-surface-container-lowest/95 px-3 py-2 text-center leading-none text-on-surface">
          <div className="text-lg font-black leading-none">{day}</div>
          <div className="text-[0.625rem] font-bold uppercase tracking-wider leading-none mt-1">{month}</div>
        </div>
      </div> : cardImage ? <div role="img" aria-label={`${event.title || 'Event'} image unavailable`} className="flex aspect-[4/3] items-center justify-center bg-surface-container px-6 text-center text-sm font-semibold text-on-surface-variant">Image unavailable</div> : null}

      <div className="p-6">
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-widest text-primary"><span>{event.categoryLabel || event.category || 'Uncategorised'}</span><span>{event.status || 'status unavailable'}</span></div>
        <h3 className="mb-2 text-xl font-bold text-on-surface">{hasSlug ? <Link href={`/events/${event.slug}`} aria-label={event.title}>{event.title || 'Untitled event'}</Link> : (event.title || 'Untitled event')}</h3>
        {event.excerpt && <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">{event.excerpt}</p>}
        <dl className="space-y-2 text-sm text-on-surface-variant">
          <div><dt className="inline font-semibold text-on-surface">Date: </dt><dd className="inline">{day} {month}</dd></div>
          {event.location && <div><dt className="inline font-semibold text-on-surface">Location: </dt><dd className="inline">{event.location}</dd></div>}
          {event.organizerCommittee && <div><dt className="inline font-semibold text-on-surface">Committee: </dt><dd className="inline">{event.organizerCommittee}</dd></div>}
        </dl>
      </div>
    </article>
  );
}
