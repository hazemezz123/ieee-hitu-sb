'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const formatDate = date => new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })

export default function FeaturedEvent({ event, fallback }) {
  const [imageFailed, setImageFailed] = useState(false)
  const scopeRef = useRef(null)
  const image = event.cardImage || event.coverImage

  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const scope = scopeRef.current
    const ctx = gsap.context(() => {
      if (scope.querySelector('[data-featured="image"]')) {
        gsap.fromTo('[data-featured="image"]',
          { clipPath: 'inset(8% 0 8% 0 round 12px)', opacity: 0.4 },
          { clipPath: 'inset(0% 0 0% 0 round 12px)', opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: scope, start: 'top 80%', once: true } })
        const mm = gsap.matchMedia()
        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo('[data-featured="image"]', { yPercent: -6 }, { yPercent: 6, ease: 'none',
            scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1 } })
        })
      }
      gsap.from('[data-featured="text"] > *', {
        opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
      })
    }, scope)
    return () => { ctx.revert() }
  }, [])

  return (
    <div ref={scopeRef} className="border-l border-primary/40 pl-5">
      <h2 className="text-2xl font-bold text-on-surface">Featured next event</h2>
      {fallback && <p className="mt-3 text-sm text-on-surface-variant">Showing the static event archive while live event data is unavailable.</p>}
      <article className={`mt-6 grid items-center gap-8 ${image && !imageFailed ? 'md:grid-cols-2' : ''}`}>
        {image && !imageFailed && (
          <img data-featured="image" src={image} alt={event.title || 'Event'} className="aspect-[16/10] w-full rounded-xl object-cover" onError={() => setImageFailed(true)} onLoad={() => { try { ScrollTrigger.refresh() } catch { /* layout may be unmounted */ } }} />
        )}
        {image && imageFailed && (
          <div role="img" aria-label={`${event.title || 'Event'} image unavailable`} className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-surface-container px-6 text-center font-semibold text-on-surface-variant">Image unavailable</div>
        )}
        <div data-featured="text">
          <time className="text-xs font-bold uppercase tracking-widest text-primary" dateTime={event.date}>{formatDate(event.date)}</time>
          <h3 className="mt-3 text-3xl font-bold text-on-surface">{event.title}</h3>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{event.excerpt || event.location}</p>
          {event.slug && <Link aria-label={`Read ${event.title} event record`} className="btn btn-primary mt-6" href={`/events/${event.slug}`}>Read event record</Link>}
        </div>
      </article>
    </div>
  )
}
