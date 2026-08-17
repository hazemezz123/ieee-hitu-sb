import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import EventCard from '../components/EventCard'
import { fetchEventsResult } from '../data/eventsSource'
import { sortEvents } from '../data/presentation'

const ALL = 'all'
const value = event => event || ''

export default function EventsPage() {
  const [result, setResult] = useState({ events: [], source: null, status: 'loading' })
  const [filters, setFilters] = useState({ category: ALL, status: ALL, location: ALL, organizerCommittee: ALL })

  useEffect(() => {
    let active = true
    fetchEventsResult().then(data => active && setResult({ ...data, status: 'ready' })).catch(() => active && setResult({ events: [], source: null, status: 'error' }))
    return () => { active = false }
  }, [])

  if (result.status === 'loading') return <PageLayout><p role="status" className="container mx-auto max-w-6xl px-6 py-24 text-center text-on-surface-variant">Loading event records...</p></PageLayout>
  if (result.status === 'error') return <PageLayout><div role="alert" className="container mx-auto max-w-6xl px-6 py-24 text-center"><h1 className="text-3xl font-bold text-on-surface">Event data could not be loaded</h1><p className="mt-3 text-on-surface-variant">Please try the event archive again later.</p></div></PageLayout>

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
  const options = key => [ALL, ...new Set(events.map(event => value(event[key])).filter(Boolean))]
  const filtered = records.filter(({ event }) => Object.entries(filters).every(([key, selected]) => selected === ALL || value(event[key]) === selected))
  const label = (key, option) => option === ALL ? 'All' : key === 'category' ? events.find(event => event.category === option)?.categoryLabel || option : option
  const filterLabel = key => key === 'organizerCommittee' ? 'committee' : key

  return <PageLayout>
    <div className="min-h-screen">
      <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28"><h1 className="max-w-3xl text-4xl font-black leading-tight text-on-surface md:text-6xl">The event program</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">A chronological record of workshops, gatherings, competitions, and branch activity.</p></section>
      {result.source === 'fallback' && <p className="bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing saved fallback event information while live event data is unavailable.</p>}
      {events.length === 0 ? <p className="container mx-auto max-w-6xl px-6 py-24 text-center text-on-surface-variant md:px-12">No event records are available yet.</p> : <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Object.keys(filters).map(key => <label key={key} className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{filterLabel(key)}<select aria-label={`Filter by ${filterLabel(key)}`} value={filters[key]} onChange={event => setFilters(current => ({ ...current, [key]: event.target.value }))} className="mt-2 block w-full border-b-2 border-on-surface-variant bg-surface-container px-3 py-3 text-sm font-normal normal-case tracking-normal text-on-surface">{options(key).map(option => <option key={option} value={option}>{label(key, option)}</option>)}</select></label>)}</div>
        <h2 className="mb-8 text-2xl font-bold text-on-surface">Event records</h2>
        {filtered.length ? <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{filtered.map(({ event, key }) => <EventCard key={key} event={event} />)}</div> : <p className="py-16 text-center text-on-surface-variant">No events match this filter.</p>}
      </section>}
    </div>
  </PageLayout>
}
