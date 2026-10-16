'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { boardMembers } from '@/features/about/data/boardMembers'
import MemberCard from '@/features/about/components/MemberCard'
import { communityPartners } from '@/features/home/data/partners'
import { fetchPartners } from '@/features/home/hooks/usePartners'

export default function AboutPage() {
  const leadership = boardMembers.filter(member => /^(Head|Vice Head|Technical Manager|Technical Software Manager|Manager)$/i.test(member.position))
  const [partnerCount, setPartnerCount] = useState(communityPartners.length)

  useEffect(() => {
    let active = true
    fetchPartners()
      .then(list => { if (active) setPartnerCount(list.length) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <div className="container mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
        <header className="max-w-4xl border-b border-outline-variant/40 pb-12">
          <p className="section-label">Branch profile</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-on-surface md:text-6xl">About IEEE HITU Student Branch</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">IEEE HITU Student Branch is the student branch of IEEE at Helwan International Technological University. It is a structured student community connecting HITU students with technical learning, committees, events, and the wider IEEE network.</p>
        </header>

        <section className="grid gap-10 border-b border-outline-variant/40 py-12 md:grid-cols-[1fr_1.4fr]">
          <div><p className="section-label">The branch at a glance</p><h2 className="mt-3 text-3xl font-bold text-on-surface">A campus bridge to IEEE</h2></div>
          <div>
            <div className="grid grid-cols-2 gap-4"><p aria-label="more than 60 sessions"><strong className="block text-3xl text-primary">60+</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Sessions across all committees</span></p><p aria-label={`${partnerCount} community partnerships`}><strong className="block text-3xl text-primary">{partnerCount}</strong><span className="text-xs uppercase tracking-widest text-on-surface-variant">Community partnerships</span></p></div>
          </div>
        </section>

        {leadership.length > 0 && (
          <section className="border-b border-outline-variant/40 py-12">
            <div><p className="section-label">Leadership records</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Meet Our Board Members</h2></div>
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{leadership.map(member => <MemberCard key={`${member.name}-${member.committee}-${member.position}`} member={member} />)}</ul>
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-6 border-b border-outline-variant/40 py-12"><div><p className="section-label">Origins</p><h2 className="mt-3 text-3xl font-bold text-on-surface">Founders Team</h2><p className="mt-3 max-w-xl text-on-surface-variant">Meet the students who started the branch.</p></div><Link className="btn btn-secondary" href="/about/founders">Meet Our Founders</Link></section>

        <section className="flex flex-wrap items-center justify-between gap-6 py-12"><p className="max-w-xl text-on-surface-variant">The public site provides access to branch information, committees, events, gallery content, resources, and contact paths.</p><Link className="btn btn-primary" href="/join-us">Join the branch</Link></section>
      </div>
    </div>
  )
}
