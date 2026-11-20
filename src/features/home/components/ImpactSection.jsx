'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { committees } from '@/features/committees/data/committees'
import { communityPartners } from '../data/partners'
import { VERIFIED_IMPACT_BASE } from '../data/landingContent'

export default function ImpactSection({
  committeeCount = committees.length,
  partnerCount = communityPartners.length,
}) {
  const scopeRef = useRef(null)

  const metrics = [
    VERIFIED_IMPACT_BASE.members,
    { value: committeeCount, suffix: '', label: 'Active Committees' },
    VERIFIED_IMPACT_BASE.sessions,
    { value: partnerCount, suffix: '', label: 'Community Partners' },
  ].filter((m) => Number.isFinite(m.value) && m.value > 0)

  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)
    const scope = scopeRef.current
    const ctx = gsap.context(() => {
      const counters = Array.from(scope.querySelectorAll('[data-impact-num]'))
      if (counters.length === 0) return

      ScrollTrigger.create({
        trigger: scope,
        start: 'top 86%',
        once: true,
        onEnter: () => {
          counters.forEach((el) => {
            const target = Number(el.dataset.impactNum || 0)
            const obj = { value: 0 }
            gsap.to(obj, {
              value: target,
              duration: 0.9,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = String(Math.round(obj.value))
              },
            })
          })
        },
      })
    }, scope)

    return () => ctx.revert()
  }, [committeeCount, partnerCount])

  return (
    <section
      ref={scopeRef}
      aria-labelledby="impact-heading"
      className="border-y border-outline-variant/40 bg-surface-container-lowest py-12 md:py-16"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <h2
          id="impact-heading"
          className="text-sm font-bold uppercase tracking-widest text-primary"
        >
          Our Impact
        </h2>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-outline-variant/40">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`flex flex-col ${
                index === 0
                  ? 'lg:pr-8'
                  : index === metrics.length - 1
                    ? 'lg:pl-8'
                    : 'lg:px-8'
              }`}
            >
              <dt className="order-2 mt-2 text-sm font-medium text-on-surface-variant">
                {metric.label}
              </dt>
              <dd className="order-1 text-4xl font-black leading-none tracking-tight tabular-nums text-on-surface sm:text-5xl lg:text-[3.5rem]">
                <span className="sr-only">
                  {metric.value}
                  {metric.suffix}
                </span>
                <span aria-hidden="true">
                  <span data-impact-num={metric.value}>{metric.value}</span>
                  {metric.suffix ? (
                    <span className="text-primary">{metric.suffix}</span>
                  ) : null}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
