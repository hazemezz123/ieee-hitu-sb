'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ArrowRight, ChevronRight } from 'lucide-react'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import CommitteeVisual from '@/components/ui/CommitteeVisual'
import { committees as staticCommittees } from '@/features/committees/data/committees'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import { COMMITTEE_CATEGORY_META } from '../data/landingContent'

const CATEGORY_ORDER = ['technical', 'non-technical']

export default function CommitteeDirectory({ initialCommittees = null }) {
  const [fetchedCommittees, setFetchedCommittees] = useState(null)
  const [activeCategory, setActiveCategory] = useState('technical')
  const [selectedSlug, setSelectedSlug] = useState(null)
  const tabRefs = useRef([])
  const panelRef = useRef(null)

  useEffect(() => {
    if (Array.isArray(initialCommittees) && initialCommittees.length > 0) return
    let active = true
    fetchCommitteesResult()
      .then((res) => {
        if (active && Array.isArray(res?.committees) && res.committees.length > 0) {
          setFetchedCommittees(res.committees)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [initialCommittees])

  const committeesList = useMemo(() => {
    if (Array.isArray(initialCommittees) && initialCommittees.length > 0) {
      return initialCommittees
    }
    if (Array.isArray(fetchedCommittees) && fetchedCommittees.length > 0) {
      return fetchedCommittees
    }
    return staticCommittees
  }, [initialCommittees, fetchedCommittees])

  const grouped = useMemo(() => {
    return {
      technical: committeesList.filter((c) => c.category === 'technical'),
      'non-technical': committeesList.filter((c) => c.category === 'non-technical'),
    }
  }, [committeesList])

  const currentList = grouped[activeCategory] || []
  const selectedCommittee =
    currentList.find((c) => c.slug === selectedSlug) ||
    currentList[0] ||
    committeesList[0]

  useEffect(() => {
    if (typeof window === 'undefined' || !panelRef.current) return
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const panel = panelRef.current
    const ctx = gsap.context(() => {
      const items = panel.querySelectorAll('[data-committee="item"]')
      if (items.length === 0) return
      gsap.fromTo(
        items,
        { opacity: 0.4, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.025,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        },
      )
    }, panelRef)

    return () => ctx.revert()
  }, [activeCategory])

  function switchCategory(categoryId) {
    setActiveCategory(categoryId)
    const first = (grouped[categoryId] || [])[0]
    setSelectedSlug(first?.slug || null)
  }

  function handleTabKeyDown(e, index) {
    let nextIndex = null
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % CATEGORY_ORDER.length
    else if (e.key === 'ArrowLeft')
      nextIndex = (index - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = CATEGORY_ORDER.length - 1

    if (nextIndex !== null) {
      e.preventDefault()
      const nextId = CATEGORY_ORDER[nextIndex]
      switchCategory(nextId)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  const activeMeta = COMMITTEE_CATEGORY_META[activeCategory]

  return (
    <section
      aria-labelledby="committee-directory-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2
              id="committee-directory-heading"
              className="text-balance text-3xl font-black leading-tight tracking-tight text-on-surface md:text-4xl"
            >
              Find where you belong.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
              {activeMeta.description}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Committee categories"
            className="grid w-full grid-cols-2 gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-low p-1 sm:inline-flex sm:w-fit sm:items-center sm:gap-1.5"
          >
            {CATEGORY_ORDER.map((categoryId, index) => {
              const meta = COMMITTEE_CATEGORY_META[categoryId]
              const count = grouped[categoryId]?.length ?? 0
              const isActive = activeCategory === categoryId
              return (
                <button
                  key={categoryId}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={`committee-tab-${categoryId}`}
                  aria-selected={isActive}
                  aria-controls={`committee-panel-${categoryId}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => switchCategory(categoryId)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`min-h-10 cursor-pointer rounded-md px-3 py-2 text-center text-xs font-bold tracking-wide transition-[border-color] duration-150 sm:px-4 sm:text-sm ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div
          ref={panelRef}
          id={`committee-panel-${activeCategory}`}
          role="tabpanel"
          aria-labelledby={`committee-tab-${activeCategory}`}
          className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start"
        >
          {/* Compact selector directory */}
          <ul className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 sm:gap-2.5 lg:col-span-7">
            {currentList.map((committee) => {
              const isSelected = selectedCommittee?.slug === committee.slug
              return (
                <li key={committee.slug} data-committee="item" className="max-w-full">
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSlug(committee.slug)}
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-[border-color] duration-150 sm:px-4 ${
                      isSelected
                        ? 'border-primary bg-surface-container-lowest text-on-surface'
                        : 'border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-lowest hover:text-on-surface'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                          isSelected
                            ? 'bg-primary/15 text-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <CommitteeIcon
                          slug={committee.slug}
                          icon={committee.icon}
                          className="h-4 w-4"
                        />
                      </span>
                      <span className="truncate text-sm font-bold text-on-surface">
                        {committee.name}
                      </span>
                    </span>
                    <ChevronRight
                      className={`hidden h-4 w-4 shrink-0 transition-transform sm:block ${
                        isSelected
                          ? 'translate-x-0.5 text-primary'
                          : 'text-on-surface-variant/50'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Contextual committee spotlight */}
          {selectedCommittee && (
            <aside
              data-committee="spotlight"
              aria-live="polite"
              className="relative overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-5"
            >
              <span
                aria-hidden="true"
                className="wedge-notch pointer-events-none absolute right-0 top-0 h-5 w-5 bg-primary"
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-low p-3 sm:h-24 sm:w-24">
                  <CommitteeVisual
                    slug={selectedCommittee.slug}
                    icon={selectedCommittee.icon}
                    className="h-full w-full"
                  />
                </div>
                <span className="inline-flex items-center rounded-sm bg-primary-fixed px-2.5 py-1 text-xs font-bold text-on-primary-fixed">
                  {selectedCommittee.categoryLabel || activeMeta.shortLabel}
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-black tracking-tight text-on-surface">
                {selectedCommittee.name}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
                {selectedCommittee.shortDescription}
              </p>

              <div className="mt-7 border-t border-outline-variant/40 pt-5">
                <Link
                  href={`/committees/${selectedCommittee.slug}`}
                  className="btn btn-primary btn-wedge inline-flex items-center gap-2"
                >
                  <span>View {selectedCommittee.name}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          )}
        </div>

        <div className="mt-10 border-t border-outline-variant/40 pt-6">
          <Link
            href="/committees"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-[var(--primary-strong)]"
          >
            <span>Explore all {committeesList.length} committees</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
