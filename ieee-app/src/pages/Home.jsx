import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Hero from '../components/Hero'
import { fetchEventsResult } from '../data/eventsSource'
import { getNextEvents, getRecentEvents, sortEvents } from '../data/presentation'
import { committees } from '../data/committees'
import { boardMembers } from '../data/boardMembers'

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
      {event.slug && <Link aria-label={`Read ${event.title} event record`} className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-primary" to={`/events/${event.slug}`}>Read event record</Link>}
    </article>
  )
}

function CommitteeDirectory() {
  return (
    <section className="container mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-12">
      <div><p className="section-label">Branch structure</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Committee directory</h2><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" to="/committees">Open directory</Link></div>
      <ol className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">{committees.map((committee, index) => <li key={committee.slug} className="flex gap-4 py-3 text-on-surface"><span className="font-mono text-primary">{String(index + 1).padStart(2, '0')}</span><Link to={`/committees/${committee.slug}`}>{committee.name}</Link><span className="ml-auto text-xs text-on-surface-variant">{committee.category}</span></li>)}</ol>
    </section>
  )
}

function Counts({ events, status }) {
  return (
    <section className="border-b border-outline-variant/30 bg-surface py-10">
      <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4 md:px-12">
        {status === 'loading' ? <p role="status" aria-live="polite" aria-label="Loading event count"><strong className="block text-3xl text-primary">—</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Events loading</span></p> : status === 'error' ? <p aria-label="Event count unavailable"><strong className="block text-3xl text-primary">—</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Events unavailable</span></p> : <p aria-label={`${events.length} events`}><strong className="block text-3xl text-primary">{events.length}</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Events</span></p>}
        <p aria-label={`${committees.length} committees`}><strong className="block text-3xl text-primary">{committees.length}</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Committees</span></p>
        <p aria-label={`${boardMembers.length} board records`}><strong className="block text-3xl text-primary">{boardMembers.length}</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Board records</span></p>
        <p><strong className="block text-3xl text-primary">HITU</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">University</span></p>
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
        {result.status === 'loading' && <p role="status" aria-live="polite" className="container mx-auto max-w-6xl px-6 py-16 text-on-surface-variant md:px-12">Loading event records...</p>}
        {result.status === 'ready' && <>
          {featuredEvent && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><div className="border-l-4 border-primary pl-5"><h2 className="text-2xl font-bold text-on-surface">Featured next event</h2>{result.source === 'fallback' && <p className="mt-3 text-sm text-on-surface-variant">Showing the static event archive while live event data is unavailable.</p>}<EventRecord event={featuredEvent} /></div></section>}
        </>}
        <Counts events={events} status={result.status} />
        {result.status === 'error' && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><div role="alert" className="border-l-4 border-primary pl-5"><h2 className="text-2xl font-bold text-on-surface">Event data could not be loaded</h2><p className="mt-2 text-on-surface-variant">Please try the event archive again later.</p></div></section>}
        {result.status === 'ready' && <>
          {result.source === 'fallback' && !featuredEvent && <p className="border-b border-outline-variant/30 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static event archive while live event data is unavailable.</p>}
          {events.length === 0 && <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12"><div className="border-l-4 border-primary pl-5"><h2 className="text-2xl font-bold text-on-surface">No events are available</h2><p className="mt-2 text-on-surface-variant">The branch has no event records to publish yet.</p><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" to="/contact">Contact the branch</Link></div></section>}
          {events.length > 0 && nextEvents.length === 0 && recentEvents.length === 0 && <p role="status" className="container mx-auto max-w-6xl px-6 py-12 text-on-surface-variant md:px-12">Event dates are not available yet.</p>}
          {remainingNextEvents.length > 0 && <section className="border-y border-outline-variant/30 bg-surface-container-low py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><h2 className="mb-6 text-2xl font-bold text-on-surface">Next events</h2>{remainingNextEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} />)}</div></section>}
        </>}
        <CommitteeDirectory />
        {result.status === 'ready' && recentEvents.length > 0 && <section className="border-t border-outline-variant/30 bg-inverse-surface py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><h2 className="mb-6 text-2xl font-bold text-[#F0F4F8]">Recent events</h2>{recentEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} tone="inverse" />)}</div></section>}
      </div>
    </PageLayout>
  )
}
