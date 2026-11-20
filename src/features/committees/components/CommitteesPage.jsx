'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { findCommitteeLeaders } from '@/lib/presentation'
import { fetchAllMembersResult, fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import Skeleton from '@/components/ui/Skeleton'
import CommitteeVisual from '@/components/ui/CommitteeVisual'

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'technical', label: 'Technical' },
  { id: 'non-technical', label: 'Non-Technical' },
]

export default function CommitteesPage() {
  const [data, setData] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    let active = true
    Promise.all([fetchCommitteesResult(), fetchAllMembersResult()]).then(([committeesResult, membersResult]) => {
      if (active) setData({ ...committeesResult, members: membersResult.members })
    })
    return () => { active = false }
  }, [])

  if (!data) return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <div role="status" className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
        <span className="sr-only">Loading committee records...</span>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Skeleton className="h-12 w-3/4 md:h-14" />
          <Skeleton className="mt-5 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-2/3" />
          <div className="mt-8 flex gap-2">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="card grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-6 p-6 sm:p-7">
              <div className="space-y-3">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-28 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const technical = data.committees.filter(committee => committee.category === 'technical')
  const nonTechnical = data.committees.filter(committee => committee.category === 'non-technical')
  const ordered = [...technical, ...nonTechnical]
  const visible = activeFilter === 'all'
    ? ordered
    : activeFilter === 'technical'
      ? technical
      : nonTechnical

  const counts = {
    all: data.committees.length,
    technical: technical.length,
    'non-technical': nonTechnical.length,
  }

  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection>
        <header className="relative overflow-hidden border-b border-outline-variant/30">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 16%, transparent) 0%, transparent 65%), linear-gradient(to right, color-mix(in srgb, var(--color-outline-variant) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-outline-variant) 22%, transparent) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            }}
          />
          <div className="container relative mx-auto max-w-4xl px-6 py-16 text-center sm:px-8 md:px-12 md:py-20">
            <p className="section-label">IEEE HITU Student Branch</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-on-surface md:text-6xl">
              Explore Our Committees
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Combining technical innovation with organizational excellence. Whether you&apos;re into embedded systems, AI, security, or creative media, there&apos;s a place for you to make an impact.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              <p aria-label={`${data.committees.length} committee records`}>
                <strong className="text-primary">{data.committees.length}</strong> committee records
              </p>
              <span aria-hidden="true">·</span>
              <p>
                <strong className="text-on-surface">{technical.length}</strong> technical ·{' '}
                <strong className="text-on-surface">{nonTechnical.length}</strong> non-technical
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter committees by category"
              className="mt-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest p-1.5"
            >
              {FILTER_TABS.map(tab => {
                const isActive = activeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`committees-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls="committees-grid-panel"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`min-h-10 cursor-pointer rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-colors duration-200 sm:px-5 ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    {tab.label} ({counts[tab.id]})
                  </button>
                )
              })}
            </div>
          </div>
        </header>
      </AnimatedSection>

      <section
        id="committees-grid-panel"
        role="tabpanel"
        aria-labelledby={`committees-tab-${activeFilter}`}
        className="bg-surface-container-low py-14 md:py-18"
      >
        <div className="container mx-auto max-w-6xl px-6 sm:px-8 md:px-12">
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {visible.map((committee, index) => {
              const isTech = committee.category === 'technical'
              const isCenteredLast = visible.length % 2 === 1 && index === visible.length - 1
              const leaders = findCommitteeLeaders(committee.slug, data.members)

              return (
                <li
                  key={committee.slug}
                  className={isCenteredLast ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-[calc(50%-0.75rem)]' : undefined}
                >
                  <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 transition-colors duration-200 hover:border-primary sm:p-7">
                    <span
                      aria-hidden="true"
                      className={`wedge-notch absolute right-0 top-0 h-5 w-5 transition-colors duration-200 ${
                        isTech ? 'bg-primary/20 group-hover:bg-primary' : 'bg-secondary/25 group-hover:bg-secondary'
                      }`}
                    />
                    <div className="grid h-full grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:gap-6">
                      <div className="flex min-w-0 flex-col items-start">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${
                            isTech
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : 'bg-secondary-fixed text-on-secondary-fixed'
                          }`}
                        >
                          {committee.categoryLabel}
                        </span>
                        <h2 className="mt-3 text-xl font-black uppercase tracking-tight text-on-surface sm:text-2xl">
                          {committee.name}
                        </h2>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                          {committee.shortDescription}
                        </p>
                        {leaders.length > 0 && (
                          <p className="mt-3 flex flex-wrap gap-x-2 text-xs text-on-surface-variant">
                            <span className="font-semibold text-on-surface">Leadership:</span>
                            {leaders.map(leader => (
                              <span key={`${leader.name}-${leader.position}`}>{leader.name}</span>
                            ))}
                          </p>
                        )}
                        <Link
                          aria-label={`View ${committee.name} committee record`}
                          href={`/committees/${committee.slug}`}
                          className={`btn-wedge mt-5 inline-flex min-h-11 items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                            isTech
                              ? 'bg-primary-container text-on-primary-container hover:bg-primary'
                              : 'bg-secondary-container text-on-secondary-container ring-1 ring-inset ring-secondary/30 hover:bg-secondary/20'
                          }`}
                        >
                          <span>View details</span>
                          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                        </Link>
                      </div>

                      <div
                        className={`relative flex h-26 w-26 shrink-0 items-center justify-center rounded-xl border p-2.5 transition-transform duration-300 group-hover:scale-105 sm:h-34 sm:w-34 sm:p-3 ${
                          isTech
                            ? 'border-primary/20 bg-primary/5'
                            : 'border-secondary/25 bg-secondary/5'
                        }`}
                      >
                        <CommitteeVisual
                          slug={committee.slug}
                          icon={committee.icon}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>

          <div className="mt-14 text-center">
            <Link
              href="/join-us"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline-offset-4 transition-colors hover:text-[var(--primary-strong)] hover:underline"
            >
              <span>Interested in Joining Us?</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
