import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Home from './HomePage'
import OfficersSection from './OfficersSection'
import RecruitmentBand from './RecruitmentBand'

const { fetchEventsResult, fetchPartnersResult, fetchRecruitmentForm } = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchPartnersResult: vi.fn(),
  fetchRecruitmentForm: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/features/events/hooks/useEvents', () => ({ fetchEventsResult }))
vi.mock('@/features/home/hooks/usePartners', () => ({ fetchPartnersResult, fetchPartners: vi.fn() }))
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

beforeEach(() => {
  fetchEventsResult.mockReset()
  fetchEventsResult.mockResolvedValue({ events: [pastEvent], source: 'remote' })
  fetchPartnersResult.mockReset()
  fetchPartnersResult.mockResolvedValue({
    partners: [{ name: 'Partner Co', logo: 'https://cdn.example.com/logo.svg' }],
    source: 'remote',
  })
  fetchRecruitmentForm.mockReset()
  fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: '', isOpen: true })
})

afterEach(cleanup)

const inOrder = nodes => {
  nodes.slice(1).forEach((node, index) => {
    expect(nodes[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
}

describe('home storytelling order', () => {
  it('orders sections as hero, partners, recent, gallery, officers, and CTA', async () => {
    render(<Home />)

    await screen.findByRole('heading', { name: 'Recent events' })
    inOrder([
      screen.getByRole('heading', { level: 1 }),
      screen.getByRole('heading', { name: 'Partners we build with' }),
      screen.getByRole('heading', { name: 'Recent events' }),
      screen.getByRole('heading', { name: 'Moments that inspire' }),
      screen.getByRole('heading', { name: 'Meet the officers' }),
      screen.getByRole('heading', { name: /join an ieee hitu committee/i }),
    ])
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
    const byAlt = alt => container.querySelector(`img[alt="${alt}"]`).className.split(' ')

    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('scale-90')
    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('origin-bottom')
    expect(byAlt('Portrait of Hazem Ezz, Webmaster')).toContain('scale-125')
    expect(byAlt('Portrait of Rania Elrediny, Treasurer')).toContain('scale-125')
  })

  it('keeps hover zoom subtle on every portrait', () => {
    const { container } = render(<OfficersSection />)
    const byAlt = alt => container.querySelector(`img[alt="${alt}"]`).className.split(' ')

    expect(byAlt('Portrait of Habiba Hamdy, Vice Chair')).toContain('group-hover:scale-95')
    expect(byAlt('Portrait of Hazem Ezz, Webmaster')).toContain('group-hover:scale-[1.35]')
    expect(byAlt('Portrait of Rania Elrediny, Treasurer')).toContain('group-hover:scale-[1.35]')
  })
})

describe('recent events featured card', () => {
  it('renders a single recent event as an impactful featured card with a record link', async () => {
    render(<Home />)

    const link = await screen.findByRole('link', { name: 'Read Techne Summit 26 event record' })
    const card = link.closest('[data-recent="featured"]')
    expect(card).toBeTruthy()
    expect(card.className).toContain('bg-slate-900/60')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('md:flex-row')

    const thumbnail = card.querySelector('img')
    expect(thumbnail.className).toContain('md:w-80')
    expect(thumbnail.className).toContain('aspect-video')
  })
})

describe('gallery carousel alignment', () => {
  it('aligns the first card with the page container and keeps equal card heights', async () => {
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

describe('CTA banner cleanup', () => {
  it('renders the CTA as a rounded container without the angled wedge gap', async () => {
    const { container } = render(<RecruitmentBand />)

    const banner = await screen.findByRole('heading', { name: /join an ieee hitu committee/i })
    const card = banner.closest('div.rounded-3xl')
    expect(card).toBeTruthy()
    expect(card.className).toContain('max-w-7xl')
    expect(card.className).toContain('mx-auto')
    expect(container.querySelector('.wedge-bg')).toBeNull()
    expect(document.querySelector('.wedge-bg')).toBeNull()
  })
})
