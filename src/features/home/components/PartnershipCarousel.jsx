'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

export function isImageBackgroundOpaque(ctx, width, height) {
  if (!ctx || !width || !height) return false
  try {
    const corners = [
      [0, 0],
      [Math.max(0, width - 1), 0],
      [0, Math.max(0, height - 1)],
      [Math.max(0, width - 1), Math.max(0, height - 1)],
    ]
    return corners.every(([x, y]) => {
      const pixel = ctx.getImageData(x, y, 1, 1)?.data
      return pixel && pixel[3] >= 250
    })
  } catch {
    return false
  }
}

function PartnerLogoTile({ partner }) {
  const [isOpaque, setIsOpaque] = useState(false)
  const imgRef = useRef(null)

  const checkOpacity = img => {
    if (!img) return
    try {
      const width = img.naturalWidth
      const height = img.naturalHeight
      if (!width || !height) return

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      if (isImageBackgroundOpaque(ctx, width, height)) {
        setIsOpaque(true)
      }
    } catch {
      // Graceful fallback for CORS restrictions
    }
  }

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      checkOpacity(imgRef.current)
    }
  }, [partner.logo])

  const pillClasses = [
    'group flex items-center justify-center h-24 px-6 py-4 shrink-0 min-w-[14rem] rounded-xl transition-colors duration-300 select-none',
    isOpaque
      ? 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-100 dark:hover:bg-white dark:border-slate-300'
      : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 dark:border-slate-800/80',
  ].join(' ')

  const imgBaseClasses = 'max-h-12 max-w-[140px] w-auto object-contain select-none'

  const imgFilterClasses = isOpaque
    ? 'mix-blend-multiply opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 ease-in-out [filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))] [@media(hover:none)]:opacity-100'
    : 'brightness-0 opacity-55 transition-all duration-300 ease-in-out dark:invert dark:opacity-60 group-hover:brightness-100 group-hover:opacity-100 group-hover:scale-105 group-hover:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))] dark:group-hover:invert-0 [@media(hover:none)]:brightness-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.35))_drop-shadow(0_0_1px_rgba(15,23,42,0.5))] dark:[@media(hover:none)]:invert-0'

  return (
    <li className={pillClasses} aria-label={partner.name}>
      {partner.logo ? (
        <img
          ref={imgRef}
          src={partner.logo}
          alt={partner.name}
          crossOrigin="anonymous"
          onLoad={e => checkOpacity(e.currentTarget)}
          className={`${imgBaseClasses} ${imgFilterClasses}`}
        />
      ) : (
        <span className="text-sm font-semibold tracking-wider text-muted-foreground">{partner.name}</span>
      )}
    </li>
  )
}

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
    gsap.from(track, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: track, start: 'top 85%', once: true },
    })
    tweenRef.current = gsap.to(track, { xPercent: -50, duration: 30, repeat: -1, ease: 'none' })
    return () => { tweenRef.current?.kill(); tweenRef.current = null }
  }, [result.status, result.partners.length])

  if (result.status !== 'ready' || result.partners.length === 0) return null

  const row = isClone => (
    <ul className="partners-row flex gap-4 px-2" aria-hidden={isClone}>
      {result.partners.map(partner => (
        <PartnerLogoTile
          key={`${isClone ? 'clone-' : ''}${partner._id || partner.name}`}
          partner={partner}
        />
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
          className="carousel-track flex w-max"
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
