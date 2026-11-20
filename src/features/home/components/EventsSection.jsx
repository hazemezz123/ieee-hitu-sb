'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Calendar, MapPin } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import Skeleton from '@/components/ui/Skeleton'
import { getNextEvents, getRecentEvents, sortEvents } from '@/lib/presentation'

function formatEventDate(date) {
  if (!date) return ''
  const parsed = new Date(date)
  if (!Number.isFinite(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', { dateStyle: 'medium' })
}

function EventThumbnail({ event, className = '', priority = false }) {
  const [failed, setFailed] = useState(false)
  const src = event.cardImage || event.coverImage

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${event.title || 'Event'} visual placeholder`}
        className={`flex items-center justify-center bg-surface-container px-4 text-center text-xs font-semibold text-on-surface-variant ${className}`}
      >
        {event.categoryLabel || 'IEEE HITU Event'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={event.title || 'IEEE HITU event'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

function FeaturedEventCard({ event, mode }) {
  const formattedDate = formatEventDate(event.date)
  const metaParts = [event.categoryLabel, event.organizerCommittee].filter(Boolean)
  const isUpcoming = mode === 'upcoming'
  const hasRegistration = isUpcoming && Boolean(event.eventLink)

  return (
    <article
      data-events="featured"
      className="group overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest"
    >
      <div className="grid items-stretch lg:grid-cols-12">
        <div className="aspect-[4/3] w-full overflow-hidden bg-surface-container lg:col-span-5 lg:max-h-[25rem]">
          <EventThumbnail
            event={event}
            priority
            className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-wider">
              <span className="rounded-sm bg-primary-fixed px-2.5 py-1 text-on-primary-fixed">
                {isUpcoming ? 'Upcoming Event' : 'Recent Highlight'}
              </span>
              {metaParts.length > 0 && (
                <span className="text-on-surface-variant">
                  {metaParts.join(' · ')}
                </span>
              )}
            </div>

            <h3 className="mt-5 text-balance text-2xl font-black tracking-tight text-on-surface sm:text-3xl">
              {event.title}
            </h3>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-surface-variant">
              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="sr-only">Date</dt>
                  <dd>
                    <time dateTime={event.date}>{formattedDate}</time>
                  </dd>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="sr-only">Location</dt>
                  <dd>{event.location}</dd>
                </div>
              )}
            </dl>

            {(event.excerpt || event.description) && (
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-on-surface-variant">
                {event.excerpt || event.description}
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-outline-variant/40 pt-5">
            {hasRegistration ? (
              <>
                <a
                  href={event.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-wedge inline-flex items-center gap-2"
                >
                  <span>Register / Attend</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                {event.slug && (
                  <Link
                    href={`/events/${event.slug}`}
                    className="btn btn-secondary"
                  >
                    Event details
                  </Link>
                )}
              </>
            ) : (
              event.slug && (
                <Link
                  href={`/events/${event.slug}`}
                  className="btn btn-primary btn-wedge inline-flex items-center gap-2"
                >
                  <span>{isUpcoming ? 'View event details' : 'Read event recap'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function CompactEventRow({ event, isUpcoming }) {
  const formattedDate = formatEventDate(event.date)
  return (
    <article
      data-reveal="event-row"
      className="group flex flex-col gap-4 border-t border-outline-variant/60 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
        <div className="aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg bg-surface-container sm:w-32">
          <EventThumbnail
            event={event}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transform-none"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-on-surface-variant">
            {formattedDate && (
              <time className="font-bold text-primary" dateTime={event.date}>
                {formattedDate}
              </time>
            )}
            {event.location && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{event.location}</span>
              </>
            )}
          </div>
          <h4 className="mt-1.5 text-lg font-bold tracking-tight text-on-surface">
            {event.title}
          </h4>
          {event.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
              {event.excerpt}
            </p>
          )}
        </div>
      </div>

      {event.slug && (
        <Link
          href={`/events/${event.slug}`}
          aria-label={`${isUpcoming ? 'View' : 'Read recap for'} ${event.title}`}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-[var(--primary-strong)] sm:self-center"
        >
          <span>{isUpcoming ? 'Details' : 'Recap'}</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      )}
    </article>
  )
}

export default function EventsSection({ result = { status: 'loading', events: [], source: null } }) {
  const events = sortEvents(result.events || [])
  const now = new Date()
  const upcomingEvents = getNextEvents(events, now, 4)
  const recentEvents = getRecentEvents(events, now, 4)

  const hasUpcoming = upcomingEvents.length > 0
  const featuredEvent = hasUpcoming ? upcomingEvents[0] : recentEvents[0] || null
  const featuredMode = hasUpcoming ? 'upcoming' : 'recent'

  let secondaryEvents = []
  let secondaryHeading = ''
  let secondaryUpcoming = false

  if (hasUpcoming) {
    if (upcomingEvents.length > 1) {
      secondaryEvents = upcomingEvents.slice(1, 4)
      secondaryHeading = 'More Upcoming Events'
      secondaryUpcoming = true
    } else if (recentEvents.length > 0) {
      secondaryEvents = recentEvents.slice(0, 3)
      secondaryHeading = 'Recent Highlights'
      secondaryUpcoming = false
    }
  } else if (recentEvents.length > 1) {
    secondaryEvents = recentEvents.slice(1, 4)
    secondaryHeading = 'More Recent Highlights'
    secondaryUpcoming = false
  }

  return (
    <section
      aria-labelledby="events-heading"
      className="bg-surface-container-low py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="events-heading"
              className="text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
            >
              Learning beyond the classroom.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface-variant">
              Workshops, study camps, and technical gatherings connecting IEEE HITU students with hands-on practice.
            </p>
          </div>
          <Link
            href="/events"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
          >
            <span>View all events</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        {result.status === 'loading' && (
          <div role="status" className="mt-10 space-y-6">
            <span className="sr-only">Loading events and activities...</span>
            <div className="grid overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest lg:grid-cols-12">
              <Skeleton className="aspect-[4/3] w-full rounded-none lg:col-span-5 lg:max-h-[25rem]" />
              <div className="space-y-4 p-8 lg:col-span-7">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>
        )}

        {result.status === 'error' && (
          <div
            role="alert"
            className="mt-10 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8"
          >
            <h3 className="text-xl font-bold text-on-surface">
              Events could not be loaded right now
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Visit the events archive page to check published workshops and branch activities.
            </p>
            <Link href="/events" className="btn btn-secondary mt-5">
              Open events archive
            </Link>
          </div>
        )}

        {result.status === 'ready' && (
          <>
            {result.source === 'fallback' && events.length > 0 && (
              <p className="mt-6 text-xs font-medium text-on-surface-variant">
                Showing saved branch event records while live event data is unavailable.
              </p>
            )}

            {events.length === 0 ? (
              <div className="mt-10 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8">
                <h3 className="text-xl font-bold text-on-surface">
                  No published events yet
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Upcoming workshops and branch activities will appear here once announced.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-primary"
                >
                  <span>Contact the branch</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : !featuredEvent ? (
              <div className="mt-10 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8">
                <p className="text-sm text-on-surface-variant">
                  Event schedule dates are not available yet.
                </p>
              </div>
            ) : (
              <div className="mt-10 space-y-10">
                <Reveal>
                  <FeaturedEventCard event={featuredEvent} mode={featuredMode} />
                </Reveal>

                {secondaryEvents.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                      {secondaryHeading}
                    </h3>
                    <Reveal staggerChildren="[data-reveal='event-row']">
                      <div className="border-b border-outline-variant/60">
                        {secondaryEvents.map((event, index) => (
                          <CompactEventRow
                            key={event.slug || event._id || index}
                            event={event}
                            isUpcoming={secondaryUpcoming}
                          />
                        ))}
                      </div>
                    </Reveal>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
