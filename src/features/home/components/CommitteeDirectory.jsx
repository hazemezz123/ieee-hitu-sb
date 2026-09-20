'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import Skeleton from '@/components/ui/Skeleton'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

export const COMMITTEES_DATA = [
  {
    slug: 'ai',
    name: 'AI',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: true,
    shortDescription: 'Explores artificial intelligence and machine learning through hands-on neural network experiments, computer vision, and team projects.',
    techTags: ['PyTorch', 'TensorFlow', 'Computer Vision', 'NLP'],
  },
  {
    slug: 'web',
    name: 'Web',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: true,
    shortDescription: 'Creates modern full-stack web experiences and scalable cloud platforms with industry-standard development workflows.',
    techTags: ['Next.js', 'React', 'Tailwind CSS', 'Node.js'],
  },
  {
    slug: 'cs',
    name: 'CS',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Builds strong computer science foundations through data structures, problem-solving, and software craftsmanship.',
  },
  {
    slug: 'ds',
    name: 'Data Science',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Extracts actionable insights from data using statistical analysis, predictive pipelines, and visualization.',
  },
  {
    slug: 'cyber-defensive',
    name: 'Cyber Defensive',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Hardens systems, analyzes digital vulnerabilities, and protects networks through modern defensive security.',
  },
  {
    slug: 'cyber-offensive',
    name: 'Cyber Offensive',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Uncovers threat vectors and builds offensive awareness through ethical penetration testing and CTF challenges.',
  },
  {
    slug: 'embedded',
    name: 'Embedded Systems',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Designs at the hardware-software boundary using microcontrollers, low-level firmware, and IoT devices.',
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Integrates mechanics, sensory control, and algorithmic logic to engineer autonomous robotic platforms.',
  },
  {
    slug: 'automations',
    name: 'Automations',
    category: 'technical',
    categoryLabel: 'Technical Track',
    featured: false,
    shortDescription: 'Streamlines operational workflows, scripting tools, and continuous integration to drive efficiency.',
  },
  {
    slug: 'pr-oc',
    name: 'PR & OC',
    category: 'operations',
    categoryLabel: 'Operations & Media',
    featured: false,
    shortDescription: 'Coordinates branch outreach, brand voice, external relations, and smooth on-ground event management.',
  },
  {
    slug: 'multi-media',
    name: 'Multi Media',
    category: 'operations',
    categoryLabel: 'Operations & Media',
    featured: false,
    shortDescription: 'Produces dynamic visual storytelling, photography, videography, and graphic design for branch media.',
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    category: 'operations',
    categoryLabel: 'Operations & Media',
    featured: false,
    shortDescription: 'Drives audience engagement, campaign strategy, social media growth, and student community presence.',
  },
  {
    slug: 'hr-td',
    name: 'HR - T&D',
    category: 'operations',
    categoryLabel: 'Operations & Media',
    featured: false,
    shortDescription: 'Empowers branch members through skill training, personal development, team performance, and cultural care.',
  },
]

const TABS = [
  { id: 'all', label: 'All Committees' },
  { id: 'technical', label: 'Technical Tracks' },
  { id: 'operations', label: 'Operations & Media' },
]

export default function CommitteeDirectory() {
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchCommitteesResult()
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const filteredCommittees = COMMITTEES_DATA.filter(committee => {
    if (activeTab === 'all') return true
    return committee.category === activeTab
  })

  return (
    <section
      aria-labelledby="committee-directory-heading"
      className="border-t border-outline-variant/20 bg-[#070d18] py-20 text-[#F0F4F8]"
    >
      <div className="container mx-auto max-w-6xl px-6 md:px-12">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00b5e2]">
            Branch Structure
          </p>
          <h2
            id="committee-directory-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-[#F0F4F8] md:text-5xl"
          >
            Committee Directory
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#9BA9B4]">
            Thirteen specialized teams driving technical excellence, event management, and creative outreach at IEEE HITU.
          </p>

          {/* Filtering Tabs */}
          <div
            role="tablist"
            aria-label="Committee Categories"
            className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-[#0b1324]/80 p-1.5 backdrop-blur-md"
          >
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 md:text-sm ${
                    isActive
                      ? 'bg-[#00629b] text-white shadow-md shadow-[#00629b]/30'
                      : 'text-[#9BA9B4] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div role="status" className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <span className="sr-only">Loading committee directory...</span>
            <Skeleton className="h-72 rounded-2xl bg-white/5 md:col-span-2" />
            <Skeleton className="h-72 rounded-2xl bg-white/5 md:col-span-2" />
            {Array.from({ length: 4 }, (_, idx) => (
              <Skeleton key={idx} className="h-48 rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5"
          >
            {filteredCommittees.map(committee => {
              if (committee.featured) {
                return (
                  <article
                    key={committee.slug}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0b1324] p-6 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_30px_-5px_rgba(0,181,226,0.2)] md:col-span-2 md:p-8"
                  >
                    {/* Background glow accent */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#00629b]/15 blur-3xl transition-all duration-500 group-hover:bg-[#00b5e2]/25"
                    />

                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#00b5e2] transition-colors duration-200 group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                          <CommitteeIcon slug={committee.slug} className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-[#00b5e2]/30 bg-[#00629b]/20 px-3 py-1 text-[11px] font-medium tracking-wide text-cyan-300">
                          {committee.categoryLabel}
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#F0F4F8] md:text-3xl">
                        {committee.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#9BA9B4] md:text-base">
                        {committee.shortDescription}
                      </p>

                      {committee.techTags && committee.techTags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {committee.techTags.map(tag => (
                            <span
                              key={tag}
                              className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-cyan-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                      <Link
                        href={`/committees/${committee.slug}`}
                        aria-label={`Learn more about ${committee.name}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00b5e2] transition-colors duration-200 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-[#00b5e2]"
                      >
                        <span>Learn more</span>
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </Link>
                      <span className="text-xs text-[#9BA9B4]/60">Primary Track</span>
                    </div>
                  </article>
                )
              }

              return (
                <Link
                  key={committee.slug}
                  href={`/committees/${committee.slug}`}
                  aria-label={`View ${committee.name} committee`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b1324] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_24px_-4px_rgba(0,181,226,0.25)] focus:outline-none focus:ring-2 focus:ring-[#00b5e2] md:p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#00b5e2] transition-colors duration-200 group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                        <CommitteeIcon slug={committee.slug} className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-medium text-[#9BA9B4]/70">
                        {committee.category === 'technical' ? 'Technical' : 'Operations'}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold tracking-tight text-[#F0F4F8] transition-colors duration-200 group-hover:text-white">
                      {committee.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#9BA9B4]">
                      {committee.shortDescription}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs font-semibold text-[#00b5e2] transition-colors duration-200 group-hover:text-cyan-300">
                      View committee
                    </span>
                    <span aria-hidden="true" className="text-xs text-[#00b5e2] transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Directory Footer CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/committees"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#F0F4F8] transition-all duration-300 hover:border-[#00b5e2]/40 hover:bg-white/10 hover:text-white"
          >
            <span>Explore All 13 Detailed Committee Records</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
