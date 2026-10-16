'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { galleryPhotos } from '../data/galleryPhotos'

export default function GalleryCarousel({ photos = galleryPhotos }) {
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !trackRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const track = trackRef.current
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: 40,
        repeat: -1,
        ease: 'none',
      })
    }, trackRef)

    return () => {
      ctx.revert()
      tweenRef.current = null
    }
  }, [photos.length])

  const nudge = direction => {
    const tween = tweenRef.current
    if (tween) {
      const shift = direction === 'left' ? -3 : 3
      gsap.to(tween, {
        time: `+=${shift}`,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }

  const renderRow = isClone => (
    <div className="flex shrink-0 gap-6" aria-hidden={isClone}>
      {photos.map((photo, index) => (
        <figure
          key={`${isClone ? 'clone-' : ''}${photo.id || photo.src}`}
          className="group relative flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:w-96 select-none"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
            <img
              src={photo.src}
              alt={photo.alt || photo.title || 'IEEE HITU Gallery photo'}
              width={800}
              height={500}
              sizes="(max-width: 768px) 20rem, 24rem"
              decoding="async"
              loading={isClone || index > 1 ? 'lazy' : 'eager'}
              fetchPriority={isClone || index > 1 ? 'low' : 'high'}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>
          <figcaption className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-bold text-on-surface">{photo.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
              {photo.caption}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  )

  return (
    <section
      className="border-t border-outline-variant/30 bg-surface-container-low py-20"
      aria-labelledby="gallery-heading"
    >
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Life at IEEE HITU</p>
            <h2 id="gallery-heading" className="mt-2 text-3xl font-bold text-on-surface md:text-4xl">
              Moments that inspire
            </h2>
            <p className="mt-2 max-w-xl text-base text-on-surface-variant">
              Highlights from our recent summits, hands-on workshops, and community activities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nudge('left')}
              aria-label="Previous photos"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge('right')}
              aria-label="Next photos"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-10">
        {/* Left and right fade gradients for depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-container-low to-transparent md:w-32"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-container-low to-transparent md:w-32"
        />

        {/* Viewport with CSS mask fade */}
        <div
          data-carousel="viewport"
          className="carousel-viewport overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        >
          <div
            data-carousel="track"
            ref={trackRef}
            className="flex w-max gap-6"
            style={{ animation: 'none' }}
            onMouseEnter={() => tweenRef.current?.pause()}
            onMouseLeave={() => tweenRef.current?.play()}
            onFocus={() => tweenRef.current?.pause()}
            onBlur={() => tweenRef.current?.play()}
          >
            {renderRow(false)}
            {renderRow(true)}
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-10 max-w-6xl px-6 md:px-12 text-center md:text-left">
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center gap-2 font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
        >
          <span>View all gallery photos</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
