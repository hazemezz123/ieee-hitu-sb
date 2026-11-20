'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Code, Compass, Cpu, Layers, Network, Users } from 'lucide-react'
import { BRANCH_BENEFITS, WHY_JOIN_INTRO } from '../data/landingContent'

const BENEFIT_ICONS = {
  cpu: Cpu,
  code: Code,
  network: Network,
  compass: Compass,
  layers: Layers,
  users: Users,
}

export default function WhyJoinSection() {
  const scopeRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return
    if (
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    gsap.registerPlugin(ScrollTrigger)
    const scope = scopeRef.current

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: { trigger: scope, start: 'top 82%', once: true },
        })

        tl.from(
          '[data-why="heading"]',
          { opacity: 0, y: 14, duration: 0.45, clearProps: 'opacity,transform' },
          0,
        )
          .from(
            '[data-why="subtitle"]',
            { opacity: 0, y: 12, duration: 0.45, clearProps: 'opacity,transform' },
            0.1,
          )
          .from(
            '[data-why="item"]',
            {
              opacity: 0,
              y: 14,
              duration: 0.45,
              stagger: 0.085,
              clearProps: 'opacity,transform',
            },
            0.18,
          )
      })
    }, scope)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={scopeRef}
      aria-labelledby="why-join-heading"
      className="border-t border-outline-variant/30 bg-surface py-14 md:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="why-join-heading"
            data-why="heading"
            className="text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
          >
            {WHY_JOIN_INTRO.heading}
          </h2>
          <p
            data-why="subtitle"
            className="mt-3 text-base leading-relaxed text-on-surface-variant md:text-lg"
          >
            {WHY_JOIN_INTRO.subtitle}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 sm:gap-y-9 md:mt-12 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-11">
          {BRANCH_BENEFITS.map((benefit) => {
            const Icon = BENEFIT_ICONS[benefit.icon] || Cpu
            return (
              <li
                key={benefit.id}
                data-why="item"
                className="why-feature group relative pt-6"
              >
                <span
                  aria-hidden="true"
                  data-why="accent-track"
                  className="pointer-events-none absolute inset-x-0 top-0 block h-[2px]"
                >
                  <span className="why-accent-base absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-outline-variant/65" />
                  <span
                    data-why="accent-bar"
                    className="why-accent-bar absolute inset-0 block origin-left bg-primary"
                  />
                </span>

                <Icon
                  className={`why-icon why-icon--${benefit.icon} h-7 w-7 overflow-visible text-primary`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h3 className="why-feature-title mt-4 text-lg font-bold tracking-tight text-on-surface">
                  {benefit.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant sm:text-[0.9375rem]">
                  {benefit.description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
