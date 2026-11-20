'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { WHO_WE_ARE } from '../data/landingContent'

export default function WhoWeAreSection() {
  const mediaRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mediaRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)
    const el = mediaRef.current
    const ctx = gsap.context(() => {
      const img = el.querySelector('[data-who="image"]')
      if (!img) return
      gsap.fromTo(
        img,
        { scale: 1.05, opacity: 0.7 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        },
      )
    }, mediaRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      aria-labelledby="who-we-are-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <h2
              id="who-we-are-heading"
              className="text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
            >
              {WHO_WE_ARE.heading}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-on-surface-variant md:text-[1.0625rem]">
              {WHO_WE_ARE.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-7">
              <Link
                href={WHO_WE_ARE.cta.href}
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
              >
                <span>{WHO_WE_ARE.cta.label}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>

          <figure ref={mediaRef} className="lg:col-span-7">
            <div className="wedge-frame overflow-hidden rounded-xl bg-surface-container-low">
              <img
                data-who="image"
                src={WHO_WE_ARE.image.src}
                alt={WHO_WE_ARE.image.alt}
                width={WHO_WE_ARE.image.width}
                height={WHO_WE_ARE.image.height}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs font-medium text-on-surface-variant">
              {WHO_WE_ARE.image.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
