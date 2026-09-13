'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { findCommitteeLeaders } from '../data/presentation'
import { fetchCommitteeDetailResult } from '../data/committeeSource'
import Skeleton from '@/components/ui/Skeleton'
import CommitteeIcon from '@/components/ui/CommitteeIcon'

export default function CommitteeDetailPage() {
  const { slug } = useParams()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    let active = true
    fetchCommitteeDetailResult(slug).then(result => {
      if (active) setDetail(result)
    })
    return () => { active = false }
  }, [slug])

  if (!detail) return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <div role="status" className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
        <span className="sr-only">Loading committee record...</span>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-8 h-12 w-2/3 md:h-16" />
        <Skeleton className="mt-8 h-4 w-40" />
        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  )

  const { committee, members } = detail

  if (!committee) return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <section className="container mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16 sm:px-8 md:px-12">
        <h1 className="text-4xl font-black text-on-surface md:text-5xl">Committee not found</h1>
        <p className="mt-5 text-on-surface-variant">The requested committee record does not exist.</p>
        <Link className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-primary" href="/committees">Back to committees</Link>
      </section>
    </div>
  )

  const leaders = findCommitteeLeaders(committee.slug, members)

  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection trigger="load">
        <header className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <Link className="inline-flex min-h-11 items-center text-sm font-bold text-primary" href="/committees">All committees</Link>
          <h1 className="mt-8 flex items-center gap-3 text-4xl font-black text-on-surface md:text-6xl"><CommitteeIcon slug={committee.slug} className="h-9 w-9 shrink-0 text-primary md:h-12 md:w-12" />{committee.name}</h1>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div><dt className="text-on-surface-variant">Category</dt><dd className="mt-1 font-semibold text-on-surface">{committee.categoryLabel}</dd></div>
          </dl>
        </header>

        <div className="border-y border-outline-variant/30 bg-surface-container-low py-16">
          <div className="container mx-auto grid max-w-6xl gap-16 px-6 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <section>
              <h2 className="text-2xl font-bold text-on-surface">Mandate</h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">{committee.shortDescription}</p>
            </section>
            {leaders.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-on-surface">Leadership</h2>
                <ul className="mt-5 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
                  {leaders.map(leader => <li className="py-4" key={`${leader.name}-${leader.committee}-${leader.position}`}><p className="font-semibold text-on-surface">{leader.name}</p><p className="mt-1 text-sm text-on-surface-variant">{leader.position}</p></li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
