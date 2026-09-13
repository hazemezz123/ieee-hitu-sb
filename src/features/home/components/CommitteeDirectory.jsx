'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import Skeleton from '@/components/ui/Skeleton'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

export default function CommitteeDirectory() {
  const [result, setResult] = useState({ committees: [], source: null, status: 'loading' })

  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(data => {
      if (active) setResult({ ...data, status: 'ready' })
    }).catch(() => {
      if (active) setResult({ committees: [], source: null, status: 'error' })
    })
    return () => { active = false }
  }, [])

  return (
    <section className="container mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-12">
      <div><p className="section-label">Branch structure</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Committee directory</h2><Link className="mt-5 inline-flex text-xs font-bold uppercase tracking-widest text-primary" href="/committees">Open directory</Link></div>
      {result.status === 'loading' && (
        <div role="status" className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
          <span className="sr-only">Loading committee directory...</span>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex gap-4 py-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
      )}
      {result.status === 'error' && <p className="text-sm text-on-surface-variant">Committee directory could not be loaded.</p>}
      {result.status === 'ready' && (
        <div>
          {result.source === 'fallback' && <p className="mb-3 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">Showing the static committee archive while live committee data is unavailable.</p>}
          <ol className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
            {result.committees.map(committee => (
              <li key={committee.slug} className="flex items-center gap-3 py-3 text-on-surface">
                <CommitteeIcon slug={committee.slug} className="h-4 w-4 shrink-0 text-primary" />
                <Link href={`/committees/${committee.slug}`}>{committee.name}</Link>
                <span className="ml-auto text-xs text-on-surface-variant">{committee.categoryLabel}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
