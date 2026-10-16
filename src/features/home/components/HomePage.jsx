'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import Reveal from '@/components/ui/Reveal'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '@/components/ui/Hero'
import Skeleton from '@/components/ui/Skeleton'
import { getNextEvents, getRecentEvents, sortEvents } from '@/lib/presentation'
import EventRecord from './EventRecord'
import FeaturedEvent from './FeaturedEvent'
import PartnershipCarousel from './PartnershipCarousel'
import OfficersSection from './OfficersSection'
import RecruitmentBand from './RecruitmentBand'
import GalleryCarousel from './GalleryCarousel'
import { useEventsResult } from '../hooks/useEventsResult'

export default function Home() {
  const result = useEventsResult()

  const events = sortEvents(result.events)
  const now = new Date()
  const nextEvents = getNextEvents(events, now, 3)
  const recentEvents = getRecentEvents(events, now, 3)
  const featuredEvent = nextEvents[0]
  const remainingNextEvents = nextEvents.slice(1)

  useEffect(() => {
    if (result.status !== 'ready' || typeof window === 'undefined') return
    const frame = requestAnimationFrame(() => { try { ScrollTrigger.refresh() } catch { /* trigger may be unmounted */ } })
    return () => cancelAnimationFrame(frame)
  }, [result.status, result.events.length])

  return (
    <>
      <Hero />
      <div className="page-enter">
      <PartnershipCarousel />
      <OfficersSection />
      <RecruitmentBand />
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
          {featuredEvent && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><Reveal><FeaturedEvent event={featuredEvent} fallback={result.source === 'fallback'} /></Reveal></section>}
        </>}
         {result.status === 'error' && <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12"><div role="alert" className="border-l border-primary/40 pl-5"><h2 className="text-2xl font-bold text-on-surface">Event data could not be loaded</h2><p className="mt-2 text-on-surface-variant">Please try the event archive again later.</p></div></section>}
        {result.status === 'ready' && <>
          {result.source === 'fallback' && !featuredEvent && <p className="border-b border-outline-variant/30 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static event archive while live event data is unavailable.</p>}
           {events.length === 0 && <section className="container mx-auto max-w-6xl px-6 py-20 md:px-12"><div className="border-l border-primary/40 pl-5"><h2 className="text-2xl font-bold text-on-surface">No events are available</h2><p className="mt-2 text-on-surface-variant">The branch has no event records to publish yet.</p><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href="/contact">Contact the branch</Link></div></section>}
          {events.length > 0 && nextEvents.length === 0 && recentEvents.length === 0 && <p role="status" className="container mx-auto max-w-6xl px-6 py-12 text-on-surface-variant md:px-12">Event dates are not available yet.</p>}
          {remainingNextEvents.length > 0 && <section className="border-y border-outline-variant/30 bg-surface-container-low py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><Reveal staggerChildren="[data-reveal='record']"><h2 className="mb-6 text-2xl font-bold text-on-surface">Next events</h2>{remainingNextEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} />)}</Reveal></div></section>}
        </>}
        {result.status === 'ready' && recentEvents.length > 0 && <section className="border-t border-outline-variant/30 bg-inverse-surface py-16"><div className="container mx-auto max-w-6xl px-6 md:px-12"><Reveal staggerChildren="[data-reveal='record']"><h2 className="mb-6 text-2xl font-bold text-[#F0F4F8]">Recent events</h2>{recentEvents.map((event, index) => <EventRecord key={event.slug || index} event={event} tone="inverse" />)}</Reveal></div></section>}
      </div>
      <GalleryCarousel />
      </div>
    </>
  )
}
