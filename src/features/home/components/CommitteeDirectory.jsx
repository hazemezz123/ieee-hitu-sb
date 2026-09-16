'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import Skeleton from '@/components/ui/Skeleton'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

// Panel coordinate space: 1000 x 600. HTML nodes use left = x/10 %, top = y/6 %;
// SVG edges use raw units with viewBox="0 0 1000 600" preserveAspectRatio="none".
const HUB = { x: 500, y: 300 }

const NODES = [
  { slug: 'cs', x: 80, y: 180 },
  { slug: 'ai', x: 220, y: 132 },
  { slug: 'embedded', x: 380, y: 168 },
  { slug: 'cyber-defensive', x: 100, y: 330 },
  { slug: 'web', x: 260, y: 312 },
  { slug: 'cyber-offensive', x: 120, y: 468 },
  { slug: 'robotics', x: 300, y: 438 },
  { slug: 'automations', x: 220, y: 540 },
  { slug: 'ds', x: 430, y: 375 },
  { slug: 'pr-oc', x: 640, y: 180 },
  { slug: 'multi-media', x: 810, y: 126 },
  { slug: 'marketing', x: 900, y: 312 },
  { slug: 'hr-td', x: 740, y: 468 },
]

const MESH_EDGES = [
  ['cs', 'ai'], ['ai', 'embedded'], ['embedded', 'web'], ['web', 'ds'],
  ['web', 'robotics'], ['cyber-defensive', 'web'],
  ['cyber-defensive', 'cyber-offensive'], ['cyber-offensive', 'robotics'],
  ['robotics', 'automations'], ['cyber-offensive', 'automations'],
  ['pr-oc', 'multi-media'], ['multi-media', 'marketing'],
  ['pr-oc', 'hr-td'], ['marketing', 'hr-td'],
]

export default function CommitteeDirectory() {
  const [result, setResult] = useState({ committees: [], source: null, status: 'loading' })
  const [hovered, setHovered] = useState(null)
  const scopeRef = useRef(null)

  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ committees: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (result.status !== 'ready') return
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from('[data-const="node"]', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.05, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
      gsap.from('[data-const="edge"]', { opacity: 0, duration: 0.8, stagger: 0.015, scrollTrigger: { trigger: '[data-const="panel"]', start: 'top 80%', once: true } })
      gsap.to('[data-const="hub"]', { scale: 1.04, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    }, scopeRef)
    return () => ctx.revert()
  }, [result.status])

  const bySlug = Object.fromEntries(result.committees.map(c => [c.slug, c]))
  const nodes = NODES.filter(n => bySlug[n.slug])
  const edges = [
    ...nodes.map(n => (['hub', n.slug])),
    ...MESH_EDGES.filter(([a, b]) => bySlug[a] && bySlug[b]),
  ]
  const pointOf = slug => (slug === 'hub' ? HUB : NODES.find(n => n.slug === slug))

  const edgeClass = ([a, b]) => {
    const base = 'const-edge'
    if (!hovered) return base
    const touched = a === hovered || b === hovered
    if (touched) return `${base} const-edge-active`
    return `${base} const-edge-dim`
  }

  return (
    <section className="container mx-auto max-w-6xl px-6 py-16 md:px-12" aria-labelledby="committee-directory-heading">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-label">Branch structure</p>
        <h2 id="committee-directory-heading" className="mt-3 text-3xl font-bold text-on-surface">Committee directory</h2>
        <p className="mt-3 text-on-surface-variant">Thirteen crews, one blueprint — pick a path into the branch.</p>
      </div>

      {result.status === 'loading' && (
        <div role="status" className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-4">
          <span className="sr-only">Loading committee directory...</span>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-14 rounded-full" />
          ))}
        </div>
      )}

      {result.status === 'error' && <p className="mt-10 text-center text-sm text-on-surface-variant">Committee directory could not be loaded.</p>}

      {result.status === 'ready' && (
        <div ref={scopeRef} className="mt-10 flex flex-col items-center gap-8 md:relative md:block">
          {result.source === 'fallback' && <p className="mx-auto w-full max-w-3xl bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static committee archive while live committee data is unavailable.</p>}
          {/* Central hub: stacked above the panel on mobile, overlaid center at md+ */}
          <div data-const="hub" className="z-10 flex flex-col items-center gap-1 rounded-full bg-inverse-surface px-7 py-5 text-center ring-1 ring-cyan-300/30 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:px-8">
            <p className="text-3xl font-black leading-none text-[#F0F4F8] md:text-4xl">{result.committees.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9BA9B4]">committees</p>
            <Link className="mt-2 text-xs font-bold uppercase tracking-widest text-white underline underline-offset-4 hover:no-underline" href="/committees">Open directory</Link>
          </div>

          <div data-testid="committee-constellation" data-const="panel" className="const-panel relative h-[520px] w-full max-w-[34rem] md:mt-0 md:h-auto md:max-w-none md:aspect-[5/3]">
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
              {edges.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  data-edge={`${a} ${b}`}
                  data-const="edge"
                  x1={pointOf(a).x} y1={pointOf(a).y} x2={pointOf(b).x} y2={pointOf(b).y}
                  vectorEffect="non-scaling-stroke"
                  className={`${edgeClass([a, b])}${a !== 'hub' && b !== 'hub' ? ' hidden sm:block' : ''}`}
                />
              ))}
            </svg>
            <ul aria-label="Committees" className="absolute inset-0">
              {nodes.map(node => {
                const committee = bySlug[node.slug]
                return (
                  <li key={node.slug} data-const="node" className="absolute" style={{ left: `${node.x / 10}%`, top: `${node.y / 6}%`, transform: 'translate(-50%, -50%)' }}>
                    <Link
                      href={`/committees/${committee.slug}`}
                      aria-label={`${committee.name} committee`}
                      onMouseEnter={() => setHovered(node.slug)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(node.slug)}
                      onBlur={() => setHovered(null)}
                      className="group relative flex w-11 flex-col items-center gap-1 sm:w-14"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-primary transition-all duration-200 group-hover:scale-115 group-hover:border-cyan-300 group-hover:shadow-[0_0_28px_-4px_rgba(0,181,226,0.55)] group-focus-visible:scale-115 group-focus-visible:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-14 sm:w-14">
                        <CommitteeIcon slug={committee.slug} className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>
                      <span className="whitespace-nowrap text-[10px] font-semibold text-on-surface sm:text-xs">{committee.name}</span>
                      <span aria-hidden="true" className="const-tooltip pointer-events-none absolute -top-2 left-1/2 z-20 w-40 -translate-x-1/2 -translate-y-full whitespace-normal rounded-lg border border-outline-variant bg-inverse-surface px-3 py-2 text-center text-xs font-normal text-white opacity-0 transition-all duration-200 group-hover:-translate-y-[calc(100%+4px)] group-hover:opacity-100 group-focus-visible:-translate-y-[calc(100%+4px)] group-focus-visible:opacity-100">{committee.shortDescription}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
