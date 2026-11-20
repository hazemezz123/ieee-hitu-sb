import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import gsap from 'gsap'
import Home from './HomePage'
import WhoWeAreSection from './WhoWeAreSection'
import MissionVisionSection from './MissionVisionSection'
import ImpactSection from './ImpactSection'
import EventsSection from './EventsSection'
import WhyJoinSection from './WhyJoinSection'
import OfficersSection from './OfficersSection'
import FaqSection from './FaqSection'
import RecruitmentBand from './RecruitmentBand'
import { committees as staticCommittees } from '@/features/committees/data/committees'

const {
  fetchEventsResult,
  fetchPartnersResult,
  fetchCommitteesResult,
  fetchRecruitmentForm,
} = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchPartnersResult: vi.fn(),
  fetchCommitteesResult: vi.fn(),
  fetchRecruitmentForm: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/features/events/hooks/useEvents', () => ({ fetchEventsResult }))
vi.mock('@/features/home/hooks/usePartners', () => ({ fetchPartnersResult, fetchPartners: vi.fn() }))
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult }))
vi.mock('@/lib/recruitment', () => ({
  fetchRecruitmentForm: (...args) => fetchRecruitmentForm(...args),
}))

const pastEvent = {
  slug: 'techne-summit-26',
  title: 'Techne Summit 26',
  date: '2020-03-01T10:00:00Z',
  excerpt: 'Summit recap',
  location: 'Alexandria',
  coverImage: 'https://cdn.example.com/techne.jpg',
  category: 'conferences',
  categoryLabel: 'Conferences',
  status: 'past',
}

const earlierPastEvent = {
  slug: 'intro-web-25',
  title: 'Intro to Web 25',
  date: '2019-11-12T10:00:00Z',
  excerpt: 'Web workshop recap',
  location: 'HITU Campus',
  coverImage: 'https://cdn.example.com/web.jpg',
  category: 'workshops',
  categoryLabel: 'Workshops',
  status: 'past',
}

const upcomingEvent = {
  slug: 'embedded-bootcamp-2030',
  title: 'Embedded Bootcamp 2030',
  date: '2030-05-15T09:00:00Z',
  excerpt: 'Hands-on STM32 firmware bootcamp.',
  location: 'HITU Hardware Lab',
  coverImage: 'https://cdn.example.com/embedded.jpg',
  category: 'workshops',
  categoryLabel: 'Workshops',
  organizerCommittee: 'Embedded',
  eventLink: 'https://forms.example.com/embedded',
  status: 'upcoming',
}

beforeEach(() => {
  fetchEventsResult.mockReset()
  fetchEventsResult.mockResolvedValue({ events: [pastEvent, earlierPastEvent], source: 'remote' })
  fetchPartnersResult.mockReset()
  fetchPartnersResult.mockResolvedValue({
    partners: [{ name: 'Partner Co', logo: 'https://cdn.example.com/logo.svg' }],
    source: 'remote',
  })
  fetchCommitteesResult.mockReset()
  fetchCommitteesResult.mockResolvedValue({
    committees: staticCommittees,
    source: 'remote',
  })
  fetchRecruitmentForm.mockReset()
  fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: '', isOpen: true })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const inOrder = (nodes) => {
  nodes.slice(1).forEach((node, index) => {
    expect(nodes[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
}

describe('home visitor journey order', () => {
  it('orders all 12 landing page sections in the required narrative sequence', async () => {
    render(<Home />)

    await screen.findByRole('heading', { name: 'Partners we build with' })
    await screen.findByRole('heading', { name: /your future starts beyond the classroom\./i })

    inOrder([
      screen.getByRole('heading', { level: 1, name: /ieee hitu student branch/i }),
      screen.getByRole('heading', { name: /more than a student activity\./i }),
      screen.getByRole('heading', { name: /driven by purpose\. built for impact\./i }),
      screen.getByRole('heading', { name: /our impact/i }),
      screen.getByRole('heading', { name: /find where you belong\./i }),
      screen.getByRole('heading', { name: /learning beyond the classroom\./i }),
      screen.getByRole('heading', { name: /why ieee hitu\?/i }),
      screen.getByRole('heading', { name: /moments that inspire/i }),
      screen.getByRole('heading', { name: /partners we build with/i }),
      screen.getByRole('heading', { name: /meet the officers/i }),
      screen.getByRole('heading', { name: /frequently asked questions/i }),
      screen.getByRole('heading', { name: /your future starts beyond the classroom\./i }),
    ])
  })
})

describe('new discovery & impact sections', () => {
  it('renders Who We Are with authentic branch image and link to /about', () => {
    render(<WhoWeAreSection />)

    expect(screen.getByRole('heading', { name: /more than a student activity\./i })).toBeTruthy()
    const img = screen.getByRole('img', { name: /ieee hitu student branch members together/i })
    expect(img.getAttribute('src')).toBe('/gallery/techne4.webp')
    expect(screen.getByRole('link', { name: /learn more about our branch/i }).getAttribute('href')).toBe('/about')
  })

  it('renders Mission & Vision asymmetrically with 01/02 numerals, connecting SVG path, and accessible ambient blueprint layer', () => {
    let observerCallback = null
    const originalObserver = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      constructor(cb) {
        observerCallback = cb
      }
      observe() {}
      disconnect() {}
    }

    try {
      const { container } = render(<MissionVisionSection />)
      const section = container.querySelector('section')

      expect(screen.getByRole('heading', { name: /driven by purpose\. built for impact\./i })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Our Mission' })).toBeTruthy()
      expect(screen.getByRole('heading', { name: 'Our Vision' })).toBeTruthy()
      expect(screen.getByText('01')).toBeTruthy()
      expect(screen.getByText('02')).toBeTruthy()
      expect(container.querySelector('[data-mv="path"]')).toBeTruthy()
      expect(container.querySelector('[data-mv="signal"]')).toBeTruthy()
      expect(container.querySelector('[data-mv="wireframe"]')).toBeTruthy()
      expect(container.querySelector('[data-mv="schematic"]')).toBeTruthy()

      const ambient = container.querySelector('[data-mv="ambient-bg"]')
      expect(ambient.getAttribute('aria-hidden')).toBe('true')
      expect(ambient.className).toContain('pointer-events-none')

      expect(section.getAttribute('data-mv-inview')).toBe('true')
      observerCallback?.([{ isIntersecting: false }])
      expect(section.getAttribute('data-mv-inview')).toBe('false')
      observerCallback?.([{ isIntersecting: true }])
      expect(section.getAttribute('data-mv-inview')).toBe('true')
    } finally {
      globalThis.IntersectionObserver = originalObserver
    }
  })

  it('renders verified statistics in a borderless strip without cards', () => {
    const { container } = render(<ImpactSection committeeCount={19} partnerCount={9} />)

    const dl = container.querySelector('dl')
    expect(dl).toBeTruthy()
    expect(container.querySelector('.card')).toBeNull()
    expect(screen.getByText('180+')).toBeTruthy()
    expect(container.querySelector('.sr-only', { exact: false })).toBeTruthy()
    const srValues = Array.from(container.querySelectorAll('dd .sr-only')).map((el) => el.textContent)
    expect(srValues).toEqual(['180+', '19', '60+', '9'])
  })
})

describe('events & activities section', () => {
  it('prioritizes upcoming events with registration action when eventLink exists', () => {
    render(
      <EventsSection
        result={{ status: 'ready', source: 'remote', events: [pastEvent, upcomingEvent] }}
      />,
    )

    expect(screen.getByText('Upcoming Event')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: upcomingEvent.title })).toBeTruthy()
    const register = screen.getByRole('link', { name: /register \/ attend/i })
    expect(register.getAttribute('href')).toBe(upcomingEvent.eventLink)
    expect(screen.getByRole('heading', { name: 'Recent Highlights' })).toBeTruthy()
  })

  it('falls back to recent highlights without an empty upcoming block when no upcoming events exist', () => {
    render(
      <EventsSection
        result={{ status: 'ready', source: 'fallback', events: [earlierPastEvent, pastEvent] }}
      />,
    )

    expect(screen.queryByText('Upcoming Event')).toBeNull()
    expect(screen.getByText('Recent Highlight')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: pastEvent.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: /read event recap/i }).getAttribute('href')).toBe(`/events/${pastEvent.slug}`)
  })
})

describe('why join section', () => {
  it('renders the centered 6-feature grid with animated accent lines, decorative icons, and no cards or external links', () => {
    const { container } = render(<WhyJoinSection />)

    const heading = screen.getByRole('heading', { level: 2, name: 'Why IEEE HITU?' })
    expect(heading).toBeTruthy()
    expect(screen.getByText('More than knowledge. Real experience.')).toBeTruthy()

    const expectedFeatures = [
      ['Learn by Doing', 'Hands-on technical experience.'],
      ['Build Real Projects', 'Turn ideas into real solutions.'],
      ['Make Connections', 'Grow your professional network.'],
      ['Become a Leader', 'Take ownership and lead teams.'],
      ['Expand Your Skills', 'Explore beyond your specialty.'],
      ['Find Your Community', 'Learn and grow together.'],
    ]

    const list = container.querySelector('ul')
    expect(list.className).toContain('grid-cols-1')
    expect(list.className).toContain('sm:grid-cols-2')
    expect(list.className).toContain('lg:grid-cols-3')

    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(6)

    for (const [title, description] of expectedFeatures) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeTruthy()
      expect(screen.getByText(description)).toBeTruthy()
    }

    const accentBars = container.querySelectorAll('[data-why="accent-bar"]')
    expect(accentBars).toHaveLength(6)

    const icons = container.querySelectorAll('svg.why-icon')
    expect(icons).toHaveLength(6)
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    }

    const section = container.querySelector('section')
    expect(section.className).not.toContain('mv-blueprint-section')
    expect(container.querySelector('.card')).toBeNull()
    expect(container.querySelector('.cursor-pointer')).toBeNull()
    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByText(/local student branch vs\. global ieee membership/i)).toBeNull()
    expect(container.querySelector('.opacity-0')).toBeNull()
  })

  it('keeps content visible and skips GSAP entrance timeline under reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const timelineSpy = vi.spyOn(gsap, 'timeline')

    const { container } = render(<WhyJoinSection />)

    expect(timelineSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 2, name: 'Why IEEE HITU?' })).toBeTruthy()
    expect(container.querySelector('.opacity-0')).toBeNull()
  })
})

describe('officers section polish', () => {
  it('constrains the chairwoman featured card to a balanced centered layout', () => {
    const { container } = render(<OfficersSection />)

    const featured = container.querySelector('[data-reveal="officer"]')
    expect(featured.className).toContain('max-w-2xl')
    expect(featured.className).toContain('mx-auto')
  })

  it('frames officer portraits with no background, flush to the bottom edge', () => {
    const { container } = render(<OfficersSection />)

    const frames = container.querySelectorAll('[data-portrait="frame"]')
    expect(frames).toHaveLength(4)
    for (const frame of frames) {
      expect(frame.className).not.toContain('bg-gradient')
      expect(frame.className).not.toContain('bg-slate')
      expect(frame.className).toContain('h-64')
      expect(frame.className).toContain('overflow-hidden')
    }

    const portraits = container.querySelectorAll('[data-portrait="frame"] img')
    expect(portraits).toHaveLength(4)
    for (const portrait of portraits) {
      expect(portrait.className).toContain('object-contain')
      expect(portrait.className).toContain('object-bottom')
    }
  })

  it('scales Habiba lower than the other portraits', () => {
    const { container } = render(<OfficersSection />)
    const byAlt = (alt) => container.querySelector(`img[alt="${alt}"]`).className.split(' ')

    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('scale-90')
    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('origin-bottom')
    expect(byAlt('Portrait of Hazem Ezz, Webmaster')).toContain('scale-125')
    expect(byAlt('Portrait of Rania Elrediny, Treasurer')).toContain('scale-125')
  })

  it('keeps hover zoom subtle on every portrait', () => {
    const { container } = render(<OfficersSection />)
    const byAlt = (alt) => container.querySelector(`img[alt="${alt}"]`).className.split(' ')

    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('group-hover:scale-95')
    expect(byAlt('Portrait of Hazem Ezz, Webmaster')).toContain('group-hover:scale-[1.35]')
    expect(byAlt('Portrait of Rania Elrediny, Treasurer')).toContain('group-hover:scale-[1.35]')
  })
})

describe('gallery carousel alignment', () => {
  it('aligns the header with the page container and keeps equal card heights', async () => {
    const { container } = render(<Home />)

    await screen.findByRole('heading', { name: 'Moments that inspire' })
    const header = container.querySelector('[data-gallery="header"]')
    expect(header.className).toContain('max-w-7xl')
    expect(header.className).toContain('mx-auto')

    const cards = container.querySelectorAll('[data-gallery="card"]')
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(card.className).toContain('h-full')
    }
  })
})

describe('faq section accordion', () => {
  it('supports accessible toggle and keyboard arrow navigation', () => {
    render(
      <FaqSection
        recruitment={{ status: 'ready', form: { isOpen: false, closedMessage: 'Applications reopen next term.' } }}
        committeeCount={19}
      />,
    )

    const firstBtn = screen.getByRole('button', { name: /who can join ieee hitu/i })
    const secondBtn = screen.getByRole('button', { name: /how can i join a committee/i })
    const windowBtn = screen.getByRole('button', { name: /when does recruitment open/i })

    expect(firstBtn.getAttribute('aria-expanded')).toBe('true')
    expect(secondBtn.getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(firstBtn, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(secondBtn)

    fireEvent.click(secondBtn)
    expect(secondBtn.getAttribute('aria-expanded')).toBe('true')
    expect(firstBtn.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(windowBtn)
    expect(screen.getByText('Applications reopen next term.')).toBeTruthy()
  })
})

describe('final recruitment CTA', () => {
  it('renders a minimal editorial CTA with Join the Branch and Explore Committees when recruitment is open', async () => {
    const { container } = render(<RecruitmentBand />)

    await screen.findByText('Recruitment open')
    const section = container.querySelector('section')
    expect(section.className).toContain('bg-surface')
    expect(section.getAttribute('style')).toBeNull()
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
    expect(screen.getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
    expect(within(section).queryByRole('link', { name: 'Facebook' })).toBeNull()
    expect(container.querySelector('.rounded-3xl')).toBeNull()
    expect(container.querySelector('.wedge-bg')).toBeNull()
  })

  it('shows closed status with Explore Committees and View Events without marketing descriptions or social links', () => {
    render(
      <RecruitmentBand
        recruitment={{
          status: 'ready',
          form: { isOpen: false, closedMessage: 'Recruiting is paused until next semester.' },
        }}
      />,
    )

    expect(screen.getByText('Recruitment currently closed')).toBeTruthy()
    expect(screen.queryByText('Recruiting is paused until next semester.')).toBeNull()
    expect(screen.queryByText(/Announcement channels/i)).toBeNull()
    expect(screen.queryByRole('link', { name: /join the branch/i })).toBeNull()
    expect(screen.getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
    expect(screen.getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
    const section = screen.getByRole('heading', { name: /your future starts beyond the classroom\./i }).closest('section')
    expect(within(section).queryByRole('link', { name: 'Facebook' })).toBeNull()
  })
})
