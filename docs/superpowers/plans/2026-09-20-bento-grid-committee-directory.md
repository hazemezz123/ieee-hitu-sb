# Bento Grid Committee Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Home page "Committee directory" section into a modern, responsive Bento Grid with category filtering tabs ("All Committees", "Technical Tracks", "Operations & Media"), featured wide cards for primary tracks (AI & Web) with tech tags and learn more actions, and glowing compact cards for remaining committees.

**Architecture:** Create `src/features/home/components/CommitteeDirectory.jsx` with static curated metadata for all 13 committees (including tech tags for featured tracks and category grouping), dynamic filtering via React state, and responsive CSS Grid layout (`grid-cols-1 md:grid-cols-3 lg:grid-cols-4`). Integrate the component into `src/features/home/components/HomePage.jsx`, and ensure comprehensive test coverage in `src/features/home/components/CommitteeDirectory.test.jsx` and `src/features/join-us/components/recruitment.test.jsx`.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS v4, Lucide React (`CommitteeIcon`), Vitest, React Testing Library.

---

### File Structure Map
- **Create:** `src/features/home/components/CommitteeDirectory.jsx` — Bento Grid committee directory component with category tabs and responsive cards.
- **Create:** `src/features/home/components/CommitteeDirectory.test.jsx` — Unit tests for tabs filtering, card rendering, tech tags, and links.
- **Modify:** `src/features/home/components/HomePage.jsx` — Mount `<CommitteeDirectory />` in the home page stream.
- **Modify:** `src/features/join-us/components/recruitment.test.jsx` — Maintain Home page section order contract including Committee Directory.

---

### Task 1: Write Unit Tests for Committee Directory

**Files:**
- Create: `src/features/home/components/CommitteeDirectory.test.jsx`

- [ ] **Step 1: Write the failing test suite**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommitteeDirectory from './CommitteeDirectory'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

vi.mock('@/features/committees/hooks/useCommittees', () => ({
  fetchCommitteesResult: vi.fn(),
}))

describe('CommitteeDirectory Bento Grid', () => {
  beforeEach(() => {
    fetchCommitteesResult.mockResolvedValue({
      committees: [
        { slug: 'ai', name: 'AI', category: 'technical' },
        { slug: 'web', name: 'Web', category: 'technical' },
        { slug: 'cs', name: 'CS', category: 'technical' },
        { slug: 'ds', name: 'DS', category: 'technical' },
        { slug: 'cyber-defensive', name: 'Cyber Defensive', category: 'technical' },
        { slug: 'cyber-offensive', name: 'Cyber Offensive', category: 'technical' },
        { slug: 'embedded', name: 'Embedded', category: 'technical' },
        { slug: 'robotics', name: 'Robotics', category: 'technical' },
        { slug: 'automations', name: 'Automations', category: 'technical' },
        { slug: 'pr-oc', name: 'PR & OC', category: 'non-technical' },
        { slug: 'multi-media', name: 'Multi Media', category: 'non-technical' },
        { slug: 'marketing', name: 'Marketing', category: 'non-technical' },
        { slug: 'hr-td', name: 'HR - T&D', category: 'non-technical' },
      ],
      source: 'remote',
    })
  })

  it('renders section title, subtitle, and tabs', async () => {
    render(<CommitteeDirectory />)
    expect(screen.getByRole('heading', { level: 2, name: /committee directory/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /all committees/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /technical tracks/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /operations & media/i })).toBeTruthy()
  })

  it('renders all 13 committees by default', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeTruthy()
      expect(screen.getByText('Web')).toBeTruthy()
      expect(screen.getByText('PR & OC')).toBeTruthy()
    })
    const links = screen.getAllByRole('link', { name: /view|learn more/i })
    expect(links.length).toBeGreaterThanOrEqual(13)
  })

  it('renders featured cards with tech tags and learn more action', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('PyTorch')).toBeTruthy()
      expect(screen.getByText('Next.js')).toBeTruthy()
    })
    const aiLearnMore = screen.getByRole('link', { name: /learn more about ai/i })
    expect(aiLearnMore.getAttribute('href')).toBe('/committees/ai')

    const webLearnMore = screen.getByRole('link', { name: /learn more about web/i })
    expect(webLearnMore.getAttribute('href')).toBe('/committees/web')
  })

  it('filters to technical committees when Technical Tracks tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeTruthy()
    })
    const techTab = screen.getByRole('tab', { name: /technical tracks/i })
    fireEvent.click(techTab)

    expect(screen.getByText('AI')).toBeTruthy()
    expect(screen.getByText('Web')).toBeTruthy()
    expect(screen.getByText('CS')).toBeTruthy()
    expect(screen.queryByText('PR & OC')).toBeNull()
    expect(screen.queryByText('Marketing')).toBeNull()
  })

  it('filters to operations & media committees when Operations & Media tab is selected', async () => {
    render(<CommitteeDirectory />)
    await waitFor(() => {
      expect(screen.getByText('PR & OC')).toBeTruthy()
    })
    const opsTab = screen.getByRole('tab', { name: /operations & media/i })
    fireEvent.click(opsTab)

    expect(screen.getByText('PR & OC')).toBeTruthy()
    expect(screen.getByText('Multi Media')).toBeTruthy()
    expect(screen.getByText('Marketing')).toBeTruthy()
    expect(screen.getByText('HR - T&D')).toBeTruthy()
    expect(screen.queryByText('AI')).toBeNull()
    expect(screen.queryByText('Web')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: FAIL due to missing `CommitteeDirectory.jsx` component.

---

### Task 2: Implement Committee Directory Bento Grid Component

**Files:**
- Create: `src/features/home/components/CommitteeDirectory.jsx`

- [ ] **Step 1: Write `src/features/home/components/CommitteeDirectory.jsx`**

```jsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CommitteeIcon from '@/components/ui/CommitteeIcon'
import Skeleton from '@/components/ui/Skeleton'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'

export const COMMITTEES_METADATA = [
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

  const filteredCommittees = COMMITTEES_METADATA.filter(committee => {
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

                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
Expected: PASS

---

### Task 3: Mount Committee Directory in Home Page & Verify Integration

**Files:**
- Modify: `src/features/home/components/HomePage.jsx`
- Modify: `src/features/join-us/components/recruitment.test.jsx`

- [ ] **Step 1: Mount CommitteeDirectory in `src/features/home/components/HomePage.jsx`**

Import `CommitteeDirectory` from `./CommitteeDirectory` and place it directly between `TechnicalResources` and event status sections.

- [ ] **Step 2: Update `recruitment.test.jsx` order test if needed**

Ensure Home page section ordering assertions match the presence of `<CommitteeDirectory />`.

- [ ] **Step 3: Run all Home & Recruitment tests**

Run: `npx vitest run src/features/home/ src/features/join-us/`
Expected: PASS

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: PASS (all 32+ test files pass)

---

### Task 4: Build & Visual Regression Check

**Files:**
- None (verification)

- [ ] **Step 1: Run production Next.js build**

Run: `npm run build`
Expected: Successful compile and static generation without errors.

- [ ] **Step 2: Commit all changes**

```bash
git add src/features/home/components/CommitteeDirectory.jsx src/features/home/components/CommitteeDirectory.test.jsx src/features/home/components/HomePage.jsx src/features/join-us/components/recruitment.test.jsx docs/superpowers/plans/2026-09-20-bento-grid-committee-directory.md
git commit -m "feat: refactor committee directory into responsive bento grid with category tabs"
```
