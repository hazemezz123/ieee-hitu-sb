'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { committeeCategories } from '../data/committees'
import { findCommitteeLeaders } from '../data/presentation'
import { fetchAllMembersResult, fetchCommitteesResult } from '../data/committeeSource'
import Skeleton from '@/components/ui/Skeleton'
import CommitteeIcon from '@/components/ui/CommitteeIcon'

const CommitteeGroup = ({ title, committees, members }) => (
  <section>
    <h2 className="text-2xl font-bold text-on-surface md:text-3xl">{title}</h2>
    <ul className="mt-8 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
      {committees.map((committee) => {
        const leaders = findCommitteeLeaders(committee.slug, members)
        return (
          <li key={committee.slug} className="grid gap-4 py-8 md:grid-cols-[minmax(0,1fr)_10rem] md:gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-on-surface"><CommitteeIcon slug={committee.slug} className="h-5 w-5 shrink-0 text-primary" />{committee.name}</h3>
              <p className="mt-2 max-w-3xl leading-relaxed text-on-surface-variant">{committee.shortDescription}</p>
              {leaders.length > 0 && <p className="mt-3 flex flex-wrap gap-x-2 text-sm text-on-surface-variant"><span className="font-semibold text-on-surface">Leadership:</span> {leaders.map(leader => <span key={`${leader.name}-${leader.position}`}>{leader.name}</span>)}</p>}
            </div>
            <div className="md:text-right">
              <p className="text-sm text-on-surface-variant">{committee.categoryLabel}</p>
              <Link aria-label={`View ${committee.name} committee record`} className="mt-4 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-widest text-primary" href={`/committees/${committee.slug}`}>View record</Link>
            </div>
          </li>
        )
      })}
    </ul>
  </section>
)

export default function CommitteesPage() {
  const [data, setData] = useState(null)

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
        <Skeleton className="h-12 w-2/3 md:h-16" />
        <Skeleton className="mt-6 h-5 w-1/2" />
        <Skeleton className="mt-8 h-8 w-40" />
        <div className="mt-8 divide-y divide-outline-variant/30 border-t border-outline-variant/30">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="grid gap-4 py-8 md:grid-cols-[minmax(0,1fr)_10rem]">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-3 md:text-right">
                <Skeleton className="h-3 w-24 md:ml-auto" />
                <Skeleton className="h-4 w-20 md:ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const technical = data.committees.filter(committee => committee.category === 'technical')
  const nonTechnical = data.committees.filter(committee => committee.category === 'non-technical')

  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection>
        <header className="container mx-auto max-w-6xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <h1 className="text-4xl font-black text-on-surface md:text-6xl">Committee directory</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">Technical and non-technical committee records published by IEEE HITU Student Branch.</p>
          <p className="mt-8 text-on-surface-variant" aria-label={`${data.committees.length} committee records`}><strong className="text-3xl text-primary">{data.committees.length}</strong> committee records</p>
        </header>
      </AnimatedSection>
      <div className="border-y border-outline-variant/30 bg-surface-container-low py-16">
        <div className="container mx-auto max-w-6xl space-y-16 px-6 sm:px-8 md:px-12">
          <CommitteeGroup title={committeeCategories.technical} committees={technical} members={data.members} />
          <CommitteeGroup title={committeeCategories.nonTechnical} committees={nonTechnical} members={data.members} />
        </div>
      </div>
    </div>
  )
}
