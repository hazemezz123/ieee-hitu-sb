'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { galleryPhotos } from '../data/galleryPhotos'

export default function GalleryCarousel({ photos = galleryPhotos }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const tweenRef = useRef(null)
  const manualPausedRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  const [fallbackActive, setFallbackActive] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined' || !trackRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const track = trackRef.current
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: 42,
        repeat: -1,
        ease: 'none',
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
  }, [photos.length])

  function easeToStop() {
    const tween = tweenRef.current
    if (!tween) return
    gsap.killTweensOf(tween)
    gsap.to(tween, { timeScale: 0, duration: 0.45, ease: 'power2.out', overwrite: true })
  }

  function easeToResume() {
    if (manualPausedRef.current) return
    const tween = tweenRef.current
    if (!tween) return
    gsap.killTweensOf(tween)
    gsap.to(tween, { timeScale: 1, duration: 0.55, ease: 'power2.inOut', overwrite: true })
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
      gsap.to(tween, { timeScale: 1, duration: 0.55, ease: 'power2.inOut', overwrite: true })
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

  function handleImgError(photo) {
    if (!photo?.fallbackSrc) return
    setFallbackActive((prev) => (prev[photo.id] ? prev : { ...prev, [photo.id]: true }))
  }

  const renderRow = (isClone) => (
    <div
      className={`flex h-60 shrink-0 items-stretch gap-5 pr-5 sm:h-72 sm:gap-6 sm:pr-6 md:h-80${
        isClone ? ' gallery-marquee-clone' : ''
      }`}
      aria-hidden={isClone ? 'true' : undefined}
    >
      {photos.map((photo, index) => {
        const key = `${isClone ? 'clone-' : ''}${photo.id || photo.src}`
        const resolvedSrc = fallbackActive[photo.id] && photo.fallbackSrc ? photo.fallbackSrc : photo.src
        const aspect =
          photo.width && photo.height ? `${photo.width} / ${photo.height}` : '16 / 10'

        return (
          <figure
            key={key}
            data-gallery="card"
            style={{ aspectRatio: aspect }}
            className="group relative h-full max-w-[85vw] shrink-0 select-none overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest transition-colors duration-200 hover:border-primary/60"
          >
            <img
              src={resolvedSrc}
              alt={isClone ? '' : photo.alt || photo.title || 'IEEE HITU gallery photo'}
              width={photo.width || 800}
              height={photo.height || 500}
              decoding="async"
              loading={isClone || index > 1 ? 'lazy' : 'eager'}
              fetchPriority={isClone || index > 1 ? 'low' : 'high'}
              onError={() => handleImgError(photo)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
            />
          </figure>
        )
      })}
    </div>
  )

  return (
    <section
      className="border-t border-outline-variant/30 bg-surface-container-low py-16 md:py-24"
      aria-labelledby="gallery-heading"
    >
      <div data-gallery="header" className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Life at IEEE HITU</p>
            <h2
              id="gallery-heading"
              className="mt-2 text-balance text-3xl font-black tracking-tight text-on-surface md:text-4xl"
            >
              Moments that inspire
            </h2>
          </div>

          <button
            type="button"
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={isPaused ? 'Resume gallery scrolling' : 'Pause gallery scrolling'}
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
      </div>

      <div className="relative mt-10">
        <div
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-label="IEEE HITU gallery showcase"
          data-carousel="viewport"
          onMouseEnter={easeToStop}
          onMouseLeave={handleMouseLeave}
          onFocus={easeToStop}
          onBlur={handleBlur}
          className="gallery-marquee-viewport focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <div
            data-carousel="track"
            ref={trackRef}
            className="gallery-marquee-track"
            onMouseEnter={easeToStop}
            onMouseLeave={handleMouseLeave}
            onFocus={easeToStop}
            onBlur={handleBlur}
          >
            {renderRow(false)}
            {renderRow(true)}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl px-5 sm:px-8">
        <Link
          href="/gallery"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
        >
          <span>View all gallery photos</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  )
}
