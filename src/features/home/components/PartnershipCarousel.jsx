'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Pause, Play } from 'lucide-react'
import BrandLogo from '@/components/ui/BrandLogo'
import { resolvePartnerLogoConfig } from '@/features/home/data/partners'
import { fetchPartnersResult } from '@/features/home/hooks/usePartners'

function PartnerLogoRow({ partners, isClone = false }) {
  return (
    <ul
      aria-hidden={isClone ? 'true' : undefined}
      className={`partners-marquee-row flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16 md:gap-20 md:pr-20${isClone ? ' partners-marquee-clone' : ''}`}
    >
      {partners.map((partner) => {
        const config = resolvePartnerLogoConfig(partner)
        return (
          <li
            key={`${isClone ? 'clone-' : ''}${partner._id || partner.name}`}
            aria-label={isClone ? undefined : partner.name}
            className="flex shrink-0 items-center justify-center opacity-85 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100 motion-reduce:transform-none"
          >
            <BrandLogo
              src={config.src}
              lightSrc={config.lightSrc}
              darkSrc={config.darkSrc}
              name={partner.name}
              alt={config.alt}
              decorative={isClone}
              logoDark={config.logoDark}
              surface="none"
              opticalScale={config.opticalScale}
              maxWidth={config.maxWidth}
              maxHeight={config.maxHeight}
              size="showcase"
            />
          </li>
        )
      })}
    </ul>
  )
}

export default function PartnershipCarousel({ initialPartners = null, fetchOnMount = true }) {
  const hasInitial = Array.isArray(initialPartners)
  const [fetchedResult, setFetchedResult] = useState({ partners: [], source: null, status: 'loading' })
  const [isPaused, setIsPaused] = useState(false)
  const manualPausedRef = useRef(false)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useEffect(() => {
    if (hasInitial || !fetchOnMount) return
    let active = true
    fetchPartnersResult()
      .then((data) => {
        if (active) setFetchedResult({ ...data, status: 'ready' })
      })
      .catch(() => {
        if (active) setFetchedResult({ partners: [], source: null, status: 'error' })
      })
    return () => {
      active = false
    }
  }, [hasInitial, fetchOnMount])

  const partners = hasInitial ? initialPartners : fetchedResult.partners
  const ready = hasInitial ? partners.length > 0 : fetchedResult.status === 'ready' && partners.length > 0

  useEffect(() => {
    if (!ready) return
    if (typeof window === 'undefined' || !trackRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const track = trackRef.current
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: 38,
        ease: 'none',
        repeat: -1,
      })
      if (manualPausedRef.current) {
        tweenRef.current.timeScale(0)
      }
    }, trackRef)

    return () => {
      if (tweenRef.current) gsap.killTweensOf(tweenRef.current)
      ctx.revert()
      tweenRef.current = null
    }
  }, [ready, partners.length])

  function easeToStop() {
    const tween = tweenRef.current
    if (!tween) return
    gsap.killTweensOf(tween)
    gsap.to(tween, { timeScale: 0, duration: 0.55, ease: 'power2.out', overwrite: true })
  }

  function easeToResume() {
    if (manualPausedRef.current) return
    const tween = tweenRef.current
    if (!tween) return
    gsap.killTweensOf(tween)
    gsap.to(tween, { timeScale: 1, duration: 0.65, ease: 'power2.inOut', overwrite: true })
  }

  function togglePause() {
    const next = !isPaused
    manualPausedRef.current = next
    setIsPaused(next)
    if (next) {
      easeToStop()
    } else {
      const tween = tweenRef.current
      if (!tween) return
      gsap.killTweensOf(tween)
      gsap.to(tween, { timeScale: 1, duration: 0.65, ease: 'power2.inOut', overwrite: true })
    }
  }

  function handleMouseLeave() {
    if (viewportRef.current?.matches(':focus-within')) return
    easeToResume()
  }

  function handleBlur(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (e.currentTarget.matches(':hover')) return
    easeToResume()
  }

  if (!ready) return null

  return (
    <section
      className="border-t border-outline-variant/30 bg-surface py-14 md:py-16"
      aria-labelledby="partnerships-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="partnerships-heading"
            className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl"
          >
            Partners we build with
          </h2>

          <button
            type="button"
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={isPaused ? 'Resume partner logos scrolling' : 'Pause partner logos scrolling'}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3.5 py-2 text-xs font-bold text-on-surface transition-colors hover:border-primary hover:text-primary motion-reduce:hidden"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Play</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pause</span>
              </>
            )}
          </button>
        </div>

        <div
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-label="Partner logos showcase"
          onMouseEnter={easeToStop}
          onMouseLeave={handleMouseLeave}
          onFocus={easeToStop}
          onBlur={handleBlur}
          className="partners-marquee-viewport mt-10 rounded-md py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <div ref={trackRef} className="partners-marquee-track">
            <PartnerLogoRow partners={partners} />
            <PartnerLogoRow partners={partners} isClone />
          </div>
        </div>
      </div>
    </section>
  )
}
