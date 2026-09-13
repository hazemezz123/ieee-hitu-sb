'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '../components/PageLayout'
import Hero from '../components/Hero'
import { fetchEventsResult } from '../data/eventsSource'
import { fetchCommitteesResult } from '../data/committeeSource'
import { getNextEvents, getRecentEvents, sortEvents } from '../data/presentation'
import Skeleton from '../components/Skeleton'
import CommitteeIcon from '../components/CommitteeIcon'
import { fetchPartnersResult } from '../data/partnersSource'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

function EventRecord({ event, tone = 'light' }) {
  const inverse = tone === 'inverse'
  return (
    <article className={`border-t py-5 ${inverse ? 'border-white/20' : 'border-outline-variant/40'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`text-lg font-bold ${inverse ? 'text-[#F0F4F8]' : 'text-on-surface'}`}>{event.title}</h3>
        <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
      </div>
      <p className={`mt-2 text-sm ${inverse ? 'text-[#C7D0D8]' : 'text-on-surface-variant'}`}>{event.excerpt || event.location}</p>
      {event.slug && <Link aria-label={`Read ${event.title} event record`} className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href={`/events/${event.slug}`}>Read event record</Link>}
    </article>
  )
}

function FeaturedEvent({ event, fallback }) {
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

function CommitteeDirectory() {
  const [result, setResult] = useState({ committees: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ committees: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  return (
    <section className="container mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-12">
      <div><p className="section-label">Branch structure</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Committee directory</h2><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href="/committees">Open directory</Link></div>
      {result.status === 'loading' && (
        <div role="status" className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
          <span className="sr-only">Loading committee directory...</span>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-4 py-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
      )}
      {result.status === 'error' && <p className="text-sm text-on-surface-variant">Committee directory could not be loaded.</p>}
      {result.status === 'ready' && (
        <div>
          {result.source === 'fallback' && <p className="mb-3 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static committee archive while live committee data is unavailable.</p>}
          <ol className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
            {result.committees.map(committee => (
              <li key={committee.slug} className="flex items-center gap-3 py-3 text-on-surface">
                <CommitteeIcon slug={committee.slug} className="h-4 w-4 shrink-0 text-primary" />
                <Link href={`/committees/${committee.slug}`}>{committee.name}</Link>
                <span className="ml-auto text-xs text-on-surface-variant">{committee.categoryLabel}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}


function PartnershipCarousel() {
  const [result, setResult] = useState({ partners: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchPartnersResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ partners: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  if (result.status !== 'ready' || result.partners.length === 0) return null

  const row = isClone => (
    <ul className="partners-row" aria-hidden={isClone}>
      {result.partners.map(partner => (
        <li key={partner._id ? partner._id : partner.name} className={`partner-tile${partner.logoDark ? ' partner-tile--dark' : ''}`} aria-label={partner.name}>
          {partner.logo ? <img src={partner.logo} alt={partner.name} /> : <span>{partner.name}</span>}
        </li>
      ))}
    </ul>
  )
  return (
    <section className="border-b border-outline-variant/30 bg-surface-container-low py-16" aria-labelledby="partnerships-heading">
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <p className="section-label">Community partnerships</p>
        <h2 id="partnerships-heading" className="mt-3 text-3xl font-bold text-on-surface">Partners we build with</h2>
      </div>
      <div className="carousel-viewport mt-10">
        <div className="carousel-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [result, setResult] = useState({ events: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchEventsResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ events: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  const events = sortEvents(result.events)
  const now = new Date()
  const nextEvents = getNextEvents(events, now, 3)
  const recentEvents = getRecentEvents(events, now, 3)
  const featuredEvent = nextEvents[0]
  const remainingNextEvents = nextEvents.slice(1)

  return (
    <PageLayout variant="home">
      <Hero />
      <div>
        {result.status === 'loading' && <div role="status" className="container mx-auto max-w-6xl px-6 py-16 md:px-12">
          <span className="sr-only">Loading event records...</span>
          <div className="space-y-3 border-l border-primary/40 pl-5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-10">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="border-b border-outline-variant/40 py-5">
                <div className="flex items-baseline justify-between gap-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="mt-3 h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>}
        {result.status === 'ready' && <>
          {featuredEvent && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><FeaturedEvent event={featuredEvent} fallback={result.source === 'fallback'} /></section>}
        </>}
                <PartnershipCarousel />
         {result.status === 'error' && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><div role="alert" className="border-l border-primary/40 pl-5"><h2 className="text-2xl font-bold text-on-surface">Event data could not be loaded</h2><p className="mt-2 text-on-surface-variant">Please try the event archive again later.</p></div></section>}
        {result.status === 'ready' && <>
          {result.source === 'fallback' && !featuredEvent && <p className="border-b border-outline-variant/30 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static event archive while live event data is unavailable.</p>}
           {events.length === 0 && <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12"><div className="border-l border-primary/40 pl-5"><h2 className="text-2xl font-bold text-on-surface">No events are available</h2><p className="mt-2 text-on-surface-variant">The branch has no event records to publish yet.</p><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href="/contact">Contact the branch</Link></div></section>}
          {events.length > 0 && nextEvents.length === 0 && recentEvents.length === 0 && <p role="status" className="container mx-auto max-w-6xl px-6 py-12 text-on-surface-variant md:px-12">Event dates are not available yet.</p>}
          {remainingNextEvents.length > 0 && <section className="border-y border-outline-variant/30 bg-surface-container-low py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><h2 className="mb-6 text-2xl font-bold text-on-surface">Next events</h2>{remainingNextEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} />)}</div></section>}
        </>}
        <CommitteeDirectory />
        {result.status === 'ready' && recentEvents.length > 0 && <section className="border-t border-outline-variant/30 bg-inverse-surface py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><h2 className="mb-6 text-2xl font-bold text-[#F0F4F8]">Recent events</h2>{recentEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} tone="inverse" />)}</div></section>}
      </div>
    </PageLayout>
  )
}
