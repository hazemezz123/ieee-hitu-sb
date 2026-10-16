'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
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

  const renderRow = isClone => (
    <div className="flex shrink-0 gap-6" aria-hidden={isClone}>
      {photos.map((photo, index) => (
        <figure
          key={`${isClone ? 'clone-' : ''}${photo.id || photo.src}`}
          data-gallery="card"
          className="group relative flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:w-96 select-none"
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
        </figure>
      ))}
    </div>
  )

  return (
    <section
      className="border-t border-outline-variant/30 bg-surface-container-low py-20"
      aria-labelledby="gallery-heading"
    >
      <div data-gallery="header" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Life at IEEE HITU</p>
          <h2 id="gallery-heading" className="mt-2 text-3xl font-bold text-on-surface md:text-4xl">
            Moments that inspire
          </h2>
        </div>
      </div>

      <div className="relative mt-10">
        {/* Right-edge fade so the carousel dissolves as it overflows; the
            first card stays fully readable at the container edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-container-low to-transparent md:w-32"
        />

        {/* Viewport with right-only mask fade; left padding aligns the first
            card with the page container while overflowing right. */}
        <div
          data-carousel="viewport"
          className="carousel-viewport overflow-hidden [mask-image:linear-gradient(to_right,black_92%,transparent)]"
        >
          <div
            data-carousel="track"
            ref={trackRef}
            className="flex w-max gap-6 pl-4 pr-6 sm:pl-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]"
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

      <div className="mx-auto mt-10 w-full max-w-7xl px-4 text-center sm:px-6 md:text-left lg:px-8">
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center gap-2 font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
        >
          <span>View all gallery photos</span>
        </Link>
      </div>
    </section>
  )
}
