'use client'

import { useEffect, useState } from 'react'
import EventCard from '../components/EventCard'
import Skeleton, { EventCardSkeleton } from '../components/Skeleton'
import { fetchEventsResult } from '../data/eventsSource'
import { sortEvents } from '../data/presentation'

export default function EventsPage() {
  const [result, setResult] = useState({ events: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchEventsResult().then(data => active && setResult({ ...data, status: 'ready' })).catch(() => active && setResult({ events: [], source: null, status: 'error' }))
    return () => { active = false }
  }, [])

  if (result.status === 'loading') return <div className="page-enter pt-[var(--navbar-height,6rem)]">
    <div className="min-h-screen">
      <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28"><Skeleton className="h-12 w-2/3 md:h-16" /><Skeleton className="mt-5 h-5 w-1/2" /></section>
      <div role="status" className="container mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <span className="sr-only">Loading event records...</span>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <EventCardSkeleton key={index} />)}
        </div>
      </div>
    </div>
  </div>
  if (result.status === 'error') return <div className="page-enter pt-[var(--navbar-height,6rem)]"><div role="alert" className="container mx-auto max-w-6xl px-6 py-24 text-center"><h1 className="text-3xl font-bold text-on-surface">Event data could not be loaded</h1><p className="mt-3 text-on-surface-variant">Please try the event archive again later.</p></div></div>

  const events = sortEvents(result.events)
  const occurrences = new Map()
  const records = events.map(event => {
    if (event.slug) return { event, key: event.slug }
    if (event._id != null) return { event, key: event._id }
    const identity = [event.title, event.date, event.location, event.category].join('|')
    const occurrence = occurrences.get(identity) || 0
    occurrences.set(identity, occurrence + 1)
    return { event, key: `${identity}|${occurrence}` }
  })

  return <div className="page-enter pt-[var(--navbar-height,6rem)]">
    <div className="min-h-screen">
      <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28"><h1 className="max-w-3xl text-4xl font-black leading-tight text-on-surface md:text-6xl">The event program</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">A chronological record of workshops, gatherings, competitions, and branch activity.</p></section>
      {result.source === 'fallback' && <p className="bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing saved fallback event information while live event data is unavailable.</p>}
      {events.length === 0 ? <p className="container mx-auto max-w-6xl px-6 py-24 text-center text-on-surface-variant md:px-12">No event records are available yet.</p> : <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12">
        <h2 className="mb-8 text-2xl font-bold text-on-surface">Event records</h2>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{records.map(({ event, key }) => <EventCard key={key} event={event} />)}</div>
      </section>}
    </div>
  </div>
}
