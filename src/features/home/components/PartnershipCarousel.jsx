'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

export default function PartnershipCarousel() {
  const [result, setResult] = useState({ partners: [], source: null, status: 'loading' })
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useEffect(() => {
    let active = true
    fetchPartnersResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ partners: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (result.status !== 'ready' || result.partners.length === 0) return
    if (typeof window === 'undefined' || !trackRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const track = trackRef.current
    gsap.from(track, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: track, start: 'top 85%', once: true } })
    tweenRef.current = gsap.to(track, { xPercent: -50, duration: 30, repeat: -1, ease: 'none' })
    return () => { tweenRef.current?.kill(); tweenRef.current = null }
  }, [result.status, result.partners.length])

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
        <div
          className="carousel-track"
          ref={trackRef}
          style={{ animation: 'none' }}
          onMouseEnter={() => tweenRef.current?.pause()}
          onMouseLeave={() => tweenRef.current?.play()}
          onFocus={() => tweenRef.current?.pause()}
          onBlur={() => tweenRef.current?.play()}
        >
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}
