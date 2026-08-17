import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import AboutPage from './AboutPage'

const { fetchEventsResult } = vi.hoisted(() => ({ fetchEventsResult: vi.fn() }))

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('../data/eventsSource', () => ({ fetchEventsResult }))

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

  it('orders featured, next, and recent records and renders labeled derived counts', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    expect(screen.getByRole('heading', { level: 2, name: 'Featured next event' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Next Lab' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Later Lab' })).toBeTruthy()
    const recent = screen.getByRole('heading', { level: 2, name: 'Recent events' }).parentElement.textContent
    expect(recent.indexOf('Recent Workshop')).toBeLessThan(recent.indexOf('Older Workshop'))
    expect(screen.getByLabelText('4 events')).toBeTruthy()
    expect(screen.getByLabelText('11 committees')).toBeTruthy()
    expect(screen.getByLabelText('28 board records')).toBeTruthy()
  })

  it('orders Home bands as identity, featured, counts, next, directory, and recent', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    const nodes = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByRole('heading', { name: 'Featured next event' }),
      screen.getByLabelText('4 events'),
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

  it('shows fallback provenance with records and the fallback-derived count', async () => {
    fetchEventsResult.mockResolvedValue({ events: events.slice(0, 2), source: 'fallback' })
    renderPage(<Home />)

    expect(await screen.findByText(/showing the static event archive/i)).toBeTruthy()
    expect(screen.getByLabelText('2 events')).toBeTruthy()
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
    expect(screen.getByLabelText('2 events')).toBeTruthy()
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

  it('shows a pending event count without briefly reporting zero', () => {
    fetchEventsResult.mockReturnValue(new Promise(() => {}))
    renderPage(<Home />)

    expect(screen.getByRole('status', { name: /loading event count/i }).textContent).toContain('—')
    expect(screen.queryByLabelText('0 events')).toBeNull()
  })

  it('renders a distinct error state for unexpected rejection', async () => {
    fetchEventsResult.mockRejectedValue(new Error('unexpected'))
    renderPage(<Home />)

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/event data could not be loaded/i)).toBeTruthy()
    expect(screen.queryByText(/static event archive/i)).toBeNull()
    expect(screen.getByLabelText(/event count unavailable/i).textContent).not.toContain('0')
    expect(screen.queryByLabelText('0 events')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Committee directory' })).toBeTruthy()
  })

  it('does not report zero events on About when event data rejects', async () => {
    fetchEventsResult.mockRejectedValue(new Error('unexpected'))
    renderPage(<AboutPage />)

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByLabelText(/event count unavailable/i).textContent).not.toContain('0')
    expect(screen.queryByLabelText('0 events')).toBeNull()
  })

  it('shows About fallback provenance before its derived event count', async () => {
    fetchEventsResult.mockResolvedValue({ events: events.slice(0, 2), source: 'fallback' })
    renderPage(<AboutPage />)

    const notice = await screen.findByText(/showing the static event archive/i)
    const count = screen.getByLabelText('2 events')
    expect(notice.compareDocumentPosition(count) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps About factual, private-contact-free, and free of nested main landmarks', async () => {
    const { container } = renderPage(<AboutPage />)

    await screen.findByLabelText('4 events')
    expect(screen.getByRole('heading', { level: 1, name: /about ieee hitu student branch/i })).toBeTruthy()
    expect(screen.getByLabelText('11 committees')).toBeTruthy()
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
})
