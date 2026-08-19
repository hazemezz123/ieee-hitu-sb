import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import AboutPage from './AboutPage'
import MembershipPage from './MembershipPage'
import JoinUsPage from './JoinUsPage'
import ContactPage from './ContactPage'
import TechnicalResources from '../components/TechnicalResources'
import { committees } from '../data/committees'
import { communityPartners } from '../data/partners'

const { fetchEventsResult, fetchCommitteesResult, fetchPartnersResult, fetchPartners } = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchCommitteesResult: vi.fn(),
  fetchPartnersResult: vi.fn(),
  fetchPartners: vi.fn(),
}))

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('../data/eventsSource', () => ({ fetchEventsResult }))
vi.mock('../data/committeeSource', () => ({ fetchCommitteesResult }))
vi.mock('../data/partnersSource', () => ({ fetchPartnersResult, fetchPartners }))

const events = [
  { slug: 'later', title: 'Later Lab', date: '2026-10-01T10:00:00Z', excerpt: 'Later', location: 'HITU' },
  { slug: 'older', title: 'Older Workshop', date: '2026-06-01T10:00:00Z', excerpt: 'Older', location: 'HITU' },
  { slug: 'next', title: 'Next Lab', date: '2026-09-01T10:00:00Z', excerpt: 'Next', location: 'HITU' },
  { slug: 'recent', title: 'Recent Workshop', date: '2026-08-01T10:00:00Z', excerpt: 'Recent', location: 'HITU' },
]

const renderPage = page => render(<MemoryRouter>{page}</MemoryRouter>)

describe('recruitment pages', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-08-17T00:00:00Z'))
    fetchEventsResult.mockReset()
    fetchEventsResult.mockResolvedValue({ events, source: 'remote' })
    fetchCommitteesResult.mockReset()
    fetchCommitteesResult.mockResolvedValue({ committees: structuredClone(committees), source: 'remote' })
    fetchPartnersResult.mockReset()
    fetchPartnersResult.mockResolvedValue({ partners: structuredClone(communityPartners), source: 'remote' })
    fetchPartners.mockReset()
    fetchPartners.mockResolvedValue(structuredClone(communityPartners))
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('presents factual identity, hierarchy, and working recruitment links', () => {
    const { container } = renderPage(<Home />)

    expect(screen.getByRole('heading', { level: 1, name: 'IEEE HITU Student Branch' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
    expect(screen.getByAltText('')).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByText('Beyond Labels. Beyond Limits.')).toBeNull()
    expect(screen.queryByText(/learn, grow, connect/i)).toBeNull()
  })

  it('orders featured, next, and recent records', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    expect(screen.getByRole('heading', { level: 2, name: 'Featured next event' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Next Lab' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Later Lab' })).toBeTruthy()
    const recent = screen.getByRole('heading', { level: 2, name: 'Recent events' }).parentElement.textContent
    expect(recent.indexOf('Recent Workshop')).toBeLessThan(recent.indexOf('Older Workshop'))
  })

  it('shows the featured event image clearly on the home page', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [{ ...events[0], cardImage: '/later-card.jpg', coverImage: '/later-cover.jpg' }],
      source: 'remote',
    })
    renderPage(<Home />)

    const featured = await screen.findByRole('img', { name: 'Later Lab' })
    expect(featured.getAttribute('src')).toBe('/later-card.jpg')
    expect(featured.closest('article').className).toContain('grid')
    expect(screen.getByRole('link', { name: 'Read Later Lab event record' }).getAttribute('href')).toBe('/events/later')
  })

  it('renders community partners from the source in the partnerships carousel', async () => {
    renderPage(<Home />)

    expect(await screen.findAllByLabelText('Risk Solutions')).toHaveLength(2)
    expect(screen.getAllByLabelText('IEEE HSB')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Partners we build with' })).toBeTruthy()
  })

  it('gives light-colored logos a dark tile', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ name: 'White Logo Co', logo: 'https://cdn/white.png', logoDark: true }],
      source: 'remote',
    })
    renderPage(<Home />)

    const tiles = await screen.findAllByLabelText('White Logo Co')
    expect(tiles).toHaveLength(2)
    for (const tile of tiles) {
      expect(tile.className).toContain('partner-tile--dark')
    }
  })

  it('orders Home bands as identity, featured, counts, next, directory, and recent', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    const nodes = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByRole('heading', { name: 'Featured next event' }),
      screen.getByRole('heading', { name: 'Next events' }),
      screen.getByRole('heading', { name: 'Committee directory' }),
      screen.getByRole('heading', { name: 'Recent events' }),
    ]
    nodes.slice(1).forEach((node, index) => {
      expect(nodes[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it('renders duplicate slugs only once across Home event records', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [events[2], { ...events[2], title: 'Duplicate Next Lab' }, events[0]],
      source: 'remote',
    })
    renderPage(<Home />)

    expect(await screen.findAllByText('Next Lab')).toHaveLength(1)
    expect(screen.queryByText('Duplicate Next Lab')).toBeNull()
  })

  it('shows fallback provenance with records', async () => {
    fetchEventsResult.mockResolvedValue({ events: events.slice(0, 2), source: 'fallback' })
    renderPage(<Home />)

    expect(await screen.findByText(/showing the static event archive/i)).toBeTruthy()
    expect(screen.getByText('Later Lab')).toBeTruthy()
  })

  it('keeps the committee directory when events are empty', async () => {
    fetchEventsResult.mockResolvedValue({ events: [], source: 'remote' })
    renderPage(<Home />)

    expect(await screen.findByText(/no events are available/i)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Committee directory' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /next events/i })).toBeNull()
    expect(screen.queryByRole('heading', { name: /recent events/i })).toBeNull()
  })

  it('reports unavailable dates without calling a non-empty archive empty', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [{ slug: 'undated', title: 'Undated Event', date: null }, { slug: 'invalid', title: 'Invalid Event', date: 'unknown' }],
      source: 'remote',
    })
    renderPage(<Home />)

    expect(await screen.findByText('Event dates are not available yet.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Committee directory' })).toBeTruthy()
    expect(screen.queryByText(/no events are available/i)).toBeNull()
  })

  it('links valid event records but leaves slugless event titles as plain text', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [events[2], { title: 'Slugless Event', date: '2026-10-01T10:00:00Z', excerpt: 'No route' }],
      source: 'remote',
    })
    renderPage(<Home />)

    await screen.findByText('Slugless Event')
    expect(screen.getByRole('link', { name: 'Read Next Lab event record' }).getAttribute('href')).toBe('/events/next')
    expect(screen.queryByRole('link', { name: /slugless event/i })).toBeNull()
    expect(screen.getByRole('heading', { level: 3, name: 'Slugless Event' })).toBeTruthy()
  })

  it('omits the Next events section when only the featured upcoming event exists', async () => {
    fetchEventsResult.mockResolvedValue({ events: [events[2]], source: 'remote' })
    renderPage(<Home />)

    expect(await screen.findByRole('heading', { level: 3, name: 'Next Lab' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Next events' })).toBeNull()
  })

  it('shows a pending event state without briefly reporting zero', () => {
    fetchEventsResult.mockReturnValue(new Promise(() => {}))
    renderPage(<Home />)

    expect(screen.getAllByRole('status').some(el => el.textContent.includes('Loading event records'))).toBe(true)
    expect(screen.queryByLabelText('0 events')).toBeNull()
  })

  it('renders a distinct error state for unexpected rejection', async () => {
    fetchEventsResult.mockRejectedValue(new Error('unexpected'))
    renderPage(<Home />)

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/event data could not be loaded/i)).toBeTruthy()
    expect(screen.queryByText(/static event archive/i)).toBeNull()
    expect(screen.queryByLabelText('0 events')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Committee directory' })).toBeTruthy()
  })

  it('keeps About factual, private-contact-free, and free of nested main landmarks', async () => {
    const { container } = renderPage(<AboutPage />)

    expect(screen.getByLabelText('more than 60 sessions')).toBeTruthy()
    expect(screen.getByLabelText('5 community partnerships')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: /about ieee hitu student branch/i })).toBeTruthy()
    expect(screen.getByText('Abdelrhman Saleh Amin')).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByText(/founded|since 20|worldwide impact|global leader/i)).toBeNull()
    expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
  })

  it('does not update state after unmounting before the request resolves', async () => {
    let resolve
    fetchEventsResult.mockReturnValue(new Promise(done => { resolve = done }))
    const page = renderPage(<Home />)
    page.unmount()

    await act(async () => resolve({ events, source: 'remote' }))
    expect(page.container.textContent).toBe('')
  })

  it('keeps membership factual and links only to the local participation route', () => {
    const { container } = renderPage(<MembershipPage />)

    expect(screen.getByRole('heading', { level: 1, name: /membership and participation/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /start with ieee hitu/i }).getAttribute('href')).toBe('/join-us')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText(/current participation process details are not published/i)).toBeTruthy()
    expect(screen.getByText(/technical learning, committees, events, and the wider ieee network/i)).toBeTruthy()
    expect(screen.queryByText(/free|\$197|\$217|420,000|160\+|50%|testimonial|payment|cancel|refund|eligib|placement|expected to|attend|communicate reliably/i)).toBeNull()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('.section-label')).toBeNull()
  })

  it.each([
    ['join', <JoinUsPage />, 'Submit interest'],
    ['contact', <ContactPage />, 'Record message'],
  ])('uses committee data, native labels, and an honest local outcome on %s', (_, page, action) => {
    const { container } = renderPage(page)
    const name = screen.getByLabelText('Full name')
    const email = screen.getByLabelText('Email address')
    const phone = screen.getByLabelText('Phone number')
    const committee = screen.getByLabelText('Committee')

    const controls = [name, email, phone, committee, screen.getByLabelText('Message')]
    expect(new Set(controls.map(control => control.id)).size).toBe(controls.length)
    expect(screen.getByLabelText(`${committees.length} committees`)).toBeTruthy()
    expect(Array.from(committee.options).slice(1).map(option => option.textContent)).toEqual(committees.map(item => item.name))
    expect(Array.from(committee.options).slice(1).map(option => option.value)).toEqual(committees.map(item => item.slug))
    expect(screen.getByText(/local demonstration/i)).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('.section-label')).toBeNull()

    fireEvent.change(name, { target: { value: 'HITU Student' } })
    fireEvent.change(email, { target: { value: 'not-an-email' } })
    expect(email.validity.typeMismatch).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: action }))
    expect(email.value).toBe('not-an-email')
    expect(screen.queryByRole('status')).toBeNull()

    fireEvent.change(email, { target: { value: 'student@hitu.edu.eg' } })
    fireEvent.change(committee, { target: { value: committees[0].slug } })
    const message = screen.getByLabelText('Message')
    if (message.required) fireEvent.change(message, { target: { value: 'Participation question' } })
    fireEvent.click(screen.getByRole('button', { name: action }))
    expect(screen.getByRole('status').textContent).toMatch(/recorded locally|not transmitted/i)
    expect(screen.queryByText(/message sent|we'll get back|success/i)).toBeNull()
    expect(email.value).toBe('student@hitu.edu.eg')
  })

  it('renders technical resources as factual non-linked editorial entries', () => {
    const { container } = render(<TechnicalResources />)
    expect(screen.getByRole('heading', { name: 'IEEE Xplore' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'IEEE Standards' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'IEEE conferences' })).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.card-hover')).toBeNull()
    expect(container.querySelector('.section-label')).toBeNull()
  })

  it('does not invent participation instructions or a public contact channel', () => {
    const join = renderPage(<JoinUsPage />)
    expect(screen.queryByText(/contact page for current participation instructions/i)).toBeNull()
    join.unmount()

    renderPage(<ContactPage />)
    expect(screen.getByText(/currently no verified public contact channel/i)).toBeTruthy()
    expect(screen.getByText(/local demonstration.*transmits nothing/i)).toBeTruthy()
    expect(screen.queryByText(/current branch channels|we'll get back|reach out/i)).toBeNull()
  })
})
