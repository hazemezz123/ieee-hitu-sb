'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MISSION_VISION } from '../data/landingContent'

const WIREFRAME_NODES = [
  { cx: 180, cy: 48, r: 3, duration: '7.4s', delay: '-1.2s' },
  { cx: 304, cy: 132, r: 2.75, duration: '9.3s', delay: '-4.1s' },
  { cx: 264, cy: 274, r: 3, duration: '11.7s', delay: '-2.5s' },
  { cx: 92, cy: 266, r: 2.5, duration: '8.6s', delay: '-6.0s' },
  { cx: 64, cy: 118, r: 2.75, duration: '10.9s', delay: '-0.8s' },
]

const SCHEMATIC_NODES = [
  { cx: 118, cy: 116, r: 3, duration: '8.8s', delay: '-1.8s' },
  { cx: 214, cy: 158, r: 2.75, duration: '10.6s', delay: '-5.2s' },
  { cx: 312, cy: 196, r: 3, duration: '12.4s', delay: '-3.1s' },
]

export default function MissionVisionSection() {
  const scopeRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !scopeRef.current) return
    const scope = scopeRef.current

    let observer
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        ([entry]) => {
          scope.dataset.mvInview = entry.isIntersecting ? 'true' : 'false'
        },
        { threshold: 0, rootMargin: '80px 0px' },
      )
      observer.observe(scope)
    }

    if (
      typeof window.matchMedia !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return () => observer?.disconnect()
    }

    gsap.registerPlugin(ScrollTrigger)
    const desktopPath = scope.querySelector('[data-mv="path"]')
    const nodes = scope.querySelectorAll('[data-mv="node"]')

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: scope, start: 'top 76%', once: true },
      })

      tl.from('[data-mv="heading"]', { opacity: 0, y: 20, duration: 0.5 }, 0)
        .from('[data-mv="mission"]', { opacity: 0, y: 22, duration: 0.55 }, 0.15)

      if (desktopPath) {
        const length =
          typeof desktopPath.getTotalLength === 'function'
            ? desktopPath.getTotalLength()
            : 600
        gsap.set(desktopPath, {
          strokeDasharray: length,
          strokeDashoffset: length,
        })
        tl.to(
          desktopPath,
          {
            strokeDashoffset: 0,
            duration: 0.75,
            ease: 'power2.inOut',
            clearProps: 'strokeDasharray,strokeDashoffset',
          },
          0.35,
        )
      }

      if (nodes.length > 0) {
        tl.from(
          nodes,
          {
            opacity: 0,
            scale: 0.4,
            transformOrigin: 'center',
            duration: 0.35,
            stagger: 0.18,
          },
          0.35,
        )
      }

      tl.from('[data-mv="vision"]', { opacity: 0, y: 22, duration: 0.55 }, 0.65)
    }, scope)

    return () => {
      observer?.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={scopeRef}
      data-mv-inview="true"
      aria-labelledby="mission-vision-heading"
      className="mv-blueprint-section relative overflow-hidden border-t border-outline-variant/30 py-14 md:py-20"
    >
      {/* Ambient Engineering Blueprint Layer */}
      <div
        data-mv="ambient-bg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Soft radial tonal depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle 34rem at 82% 18%, var(--mv-depth-a), transparent 70%), radial-gradient(circle 30rem at 16% 84%, var(--mv-depth-b), transparent 70%)',
          }}
        />

        {/* Slowly drifting technical blueprint grid */}
        <div className="mv-grid-layer mv-ambient absolute -inset-8" />

        {/* Upper-right geometric wireframe & orbital network */}
        <svg
          data-mv="wireframe"
          viewBox="0 0 360 360"
          fill="none"
          className="absolute -right-14 -top-10 h-56 w-56 opacity-60 md:right-2 md:-top-4 md:h-[22rem] md:w-[22rem] md:opacity-100 lg:right-6 lg:top-0 lg:h-[26rem] lg:w-[26rem]"
        >
          {/* Static drafting axes & corner ticks */}
          <g stroke="var(--mv-line-soft)" strokeWidth="0.85">
            <line x1="180" y1="18" x2="180" y2="342" strokeDasharray="3 7" />
            <line x1="18" y1="180" x2="342" y2="180" strokeDasharray="3 7" />
            <path d="M 38 56 V 38 H 56 M 304 38 H 322 V 56 M 38 304 V 322 H 56 M 304 322 H 322 V 304" />
          </g>

          {/* Outer calibration ring & 45°/135° arcs (slow CW rotation) */}
          <g className="mv-ambient mv-rotate-cw">
            <circle
              cx="180"
              cy="180"
              r="136"
              stroke="var(--mv-line-soft)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <circle
              cx="180"
              cy="180"
              r="112"
              stroke="var(--mv-line-soft)"
              strokeWidth="0.9"
            />
            <path
              d="M 84 84 L 276 276 M 276 84 L 84 276"
              stroke="var(--mv-line-soft)"
              strokeWidth="0.85"
              strokeDasharray="4 8"
            />
          </g>

          {/* Inner chamfered octagonal/diamond wireframe (slow CCW rotation) */}
          <g className="mv-ambient mv-rotate-ccw">
            <polygon
              points="180,68 258,102 292,180 258,258 180,292 102,258 68,180 102,102"
              stroke="var(--mv-line-accent)"
              strokeWidth="1"
            />
            <polygon
              points="180,98 262,180 180,262 98,180"
              stroke="var(--mv-line-accent)"
              strokeWidth="0.95"
              strokeDasharray="5 5"
            />
            <circle
              cx="180"
              cy="180"
              r="42"
              stroke="var(--mv-line-soft)"
              strokeWidth="0.9"
            />
          </g>

          {/* Staggered pulsing anchor nodes */}
          {WIREFRAME_NODES.map((node, index) => (
            <circle
              key={index}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="var(--mv-node)"
              className="mv-ambient mv-node-pulse"
              style={{
                animationDuration: node.duration,
                animationDelay: node.delay,
              }}
            />
          ))}
        </svg>

        {/* Lower-left blueprint & schematic circuit traces */}
        <svg
          data-mv="schematic"
          viewBox="0 0 420 250"
          fill="none"
          className="absolute bottom-0 left-0 hidden h-[15rem] w-[22rem] md:block lg:h-[17rem] lg:w-[28rem]"
        >
          {/* Static fine bus traces & + crosshairs */}
          <g stroke="var(--mv-line-soft)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 16 42 H 92 L 136 86 H 264" />
            <path d="M 0 188 H 146 L 186 228 H 372" />
            <path d="M 52 128 H 58 M 55 125 V 131" />
            <path d="M 276 112 H 284 M 280 108 V 116" />
          </g>

          {/* Gently breathing schematic branch group A */}
          <g
            className="mv-ambient mv-schematic-breathe"
            style={{ animationDuration: '14s', animationDelay: '-2s' }}
            stroke="var(--mv-line-accent)"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 24 84 H 86 L 118 116 H 228 L 254 142 H 348" />
            <rect x="64" y="106" width="22" height="20" rx="2" strokeWidth="0.95" />
          </g>

          {/* Gently breathing schematic branch group B */}
          <g
            className="mv-ambient mv-schematic-breathe"
            style={{ animationDuration: '18s', animationDelay: '-9s' }}
            stroke="var(--mv-line-accent)"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 18 158 H 214 L 252 196 H 312" />
            <circle cx="152" cy="158" r="6" fill="var(--mv-bg)" />
          </g>

          {/* Staggered pulsing trace vias */}
          {SCHEMATIC_NODES.map((node, index) => (
            <circle
              key={index}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="var(--mv-node)"
              className="mv-ambient mv-node-pulse"
              style={{
                animationDuration: node.duration,
                animationDelay: node.delay,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Editorial Foreground */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <h2
          id="mission-vision-heading"
          data-mv="heading"
          className="max-w-xl text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
        >
          {MISSION_VISION.heading}
        </h2>

        <div className="mt-9 md:mt-11">
          {/* 01 — Mission (Upper Left) */}
          <article data-mv="mission" className="max-w-xl">
            <div className="flex items-baseline gap-4">
              <span
                aria-hidden="true"
                className="text-5xl font-black leading-none tracking-tighter tabular-nums text-primary/25 md:text-6xl"
              >
                {MISSION_VISION.mission.number}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {MISSION_VISION.mission.concept}
              </span>
            </div>
            <h3 className="mt-3.5 text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
              {MISSION_VISION.mission.title}
            </h3>
            <p className="mt-2.5 text-base leading-relaxed text-on-surface-variant md:text-[1.0625rem]">
              {MISSION_VISION.mission.body}
            </p>
          </article>

          {/* Mobile Vertical Circuit Connector */}
          <div className="my-4 flex items-center pl-5 md:hidden" aria-hidden="true">
            <svg viewBox="0 0 24 44" className="h-11 w-6" fill="none">
              <line
                x1="12"
                y1="4"
                x2="12"
                y2="40"
                className="stroke-primary/70"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                pathLength="100"
                x1="12"
                y1="4"
                x2="12"
                y2="40"
                stroke="var(--mv-signal)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="mv-ambient mv-signal"
              />
              <circle cx="12" cy="5" r="3.5" className="fill-primary" />
              <circle cx="12" cy="39" r="3.5" className="fill-primary" />
            </svg>
          </div>

          {/* Desktop 45°-Chamfered Engineering Circuit Path */}
          <div className="my-1 hidden md:block" aria-hidden="true">
            <svg
              viewBox="0 0 1000 104"
              className="h-20 w-full overflow-visible lg:h-[5.5rem]"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 40 6 L 40 36 L 78 74 L 548 74 L 574 100"
                className="stroke-outline-variant/50"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                data-mv="path"
                d="M 40 6 L 40 36 L 78 74 L 548 74 L 574 100"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                data-mv="signal"
                pathLength="100"
                d="M 40 6 L 40 36 L 78 74 L 548 74 L 574 100"
                stroke="var(--mv-signal)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mv-ambient mv-signal"
              />
              <circle
                data-mv="node"
                cx="40"
                cy="6"
                r="5"
                fill="var(--mv-bg)"
                className="stroke-primary"
                strokeWidth="2.5"
              />
              <circle
                data-mv="node"
                cx="313"
                cy="74"
                r="3.5"
                className="fill-primary"
              />
              <circle
                data-mv="node"
                cx="574"
                cy="100"
                r="5"
                fill="var(--mv-bg)"
                className="stroke-primary"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* 02 — Vision (Lower Right) */}
          <article data-mv="vision" className="max-w-xl md:ml-auto">
            <div className="flex items-baseline gap-4">
              <span
                aria-hidden="true"
                className="text-5xl font-black leading-none tracking-tighter tabular-nums text-primary/25 md:text-6xl"
              >
                {MISSION_VISION.vision.number}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {MISSION_VISION.vision.concept}
              </span>
            </div>
            <h3 className="mt-3.5 text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
              {MISSION_VISION.vision.title}
            </h3>
            <p className="mt-2.5 text-base leading-relaxed text-on-surface-variant md:text-[1.0625rem]">
              {MISSION_VISION.vision.body}
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
