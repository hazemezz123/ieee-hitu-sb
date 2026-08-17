import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { boardMembers } from '../data/boardMembers'
import { committees } from '../data/committees'
import { findCommitteeLeaders } from '../data/presentation'
import CommitteesPage from './CommitteesPage'
import CommitteeDetailPage from './CommitteeDetailPage'
import EventsPage from './EventsPage'
import EventDetailPage from './EventDetailPage'
import GalleryPage from './GalleryPage'

const { fetchEventsResult, fetchEventBySlugResult, fetchEvents, fetchEventBySlug } = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchEventBySlugResult: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEventBySlug: vi.fn(),
}))

vi.mock('../data/eventsSource', () => ({ fetchEventsResult, fetchEventBySlugResult, fetchEvents, fetchEventBySlug }))

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const renderRoute = route => render(
  <MemoryRouter initialEntries={[route]}>
    <Routes>
      <Route path="/committees" element={<CommitteesPage />} />
      <Route path="/committees/:slug" element={<CommitteeDetailPage />} />
    </Routes>
  </MemoryRouter>,
)

const renderEventRoute = route => render(
  <MemoryRouter initialEntries={[route]}>
    <Routes>
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:slug" element={<EventDetailPage />} />
    </Routes>
  </MemoryRouter>,
)

const renderGallery = () => render(<MemoryRouter><GalleryPage /></MemoryRouter>)

afterEach(cleanup)

beforeEach(() => {
  fetchEventsResult.mockReset()
  fetchEventBySlugResult.mockReset()
})

describe('committee records', () => {
  it('keeps only the repository-backed committee fields', () => {
    expect(committees).toHaveLength(11)
    for (const committee of committees) {
      expect(Object.keys(committee).sort()).toEqual([
        'category',
        'categoryLabel',
        'memberCount',
        'name',
        'shortDescription',
        'slug',
      ])
    }
  })

  it('renders every committee as a record grouped by category', () => {
    const { container } = renderRoute('/committees')

    expect(screen.getByRole('heading', { level: 1, name: 'Committee directory' })).toBeTruthy()
    expect(screen.getByLabelText('11 committee records')).toBeTruthy()
    const technical = screen.getByRole('heading', { level: 2, name: 'Technical committees' }).parentElement
    const nonTechnical = screen.getByRole('heading', { level: 2, name: 'Non-technical committees' }).parentElement
    const lists = screen.getAllByRole('list')

    expect(lists).toHaveLength(2)
    expect(lists[0].tagName).toBe('UL')
    expect(lists[1].tagName).toBe('UL')

    committees.forEach((committee, index) => {
      const link = screen.getByRole('link', { name: `View ${committee.name} committee record` })
      expect(link.getAttribute('href')).toBe(`/committees/${committee.slug}`)
      expect(link.classList.contains('min-h-11')).toBe(true)
      expect(link.classList.contains('items-center')).toBe(true)
      expect((committee.category === 'technical' ? technical : nonTechnical).contains(link)).toBe(true)
    })
    expect(container.querySelector('main')).toBeNull()
    expect(container.querySelector('.card-hover')).toBeNull()
    expect(container.querySelector('.material-symbols-outlined')).toBeNull()
  })

  it('shows explicitly aliased leadership without managers or private contacts', () => {
    renderRoute('/committees')

    for (const name of [
      'Omar Raafat Hamed Abdelaziz',
      'Ahmed Hamdy',
      'Menna Allah Mohamed',
      'Adham Ahmad Hosny Mohammad',
      'Mariam Ahmed El-Neblawy',
    ]) expect(screen.getByText(name)).toBeTruthy()

    expect(screen.queryByText('Habiba Hamdy Aly Hassan')).toBeNull()
    expect(screen.queryByText(/Technical Software Manager|Technical Manager/i)).toBeNull()
    expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
    expect(screen.queryByRole('link', { name: /github|linkedin|email/i })).toBeNull()
    expect(screen.queryByText(/placeholder|slogan|turning intelligence|build motion/i)).toBeNull()
  })

  it('renders every detail route with exactly its explicitly supported leadership', () => {
    for (const committee of committees) {
      const expected = findCommitteeLeaders(committee.slug, boardMembers)
      const page = renderRoute(`/committees/${committee.slug}`)

      expect(screen.getByRole('heading', { level: 1, name: committee.name })).toBeTruthy()
      expect(screen.getByRole('heading', { level: 2, name: 'Mandate' })).toBeTruthy()
      expect(screen.getByText(committee.categoryLabel)).toBeTruthy()
      const backLink = screen.getByRole('link', { name: 'All committees' })
      expect(backLink.classList.contains('inline-flex')).toBe(true)
      expect(backLink.classList.contains('items-center')).toBe(true)
      expect(backLink.classList.contains('min-h-11')).toBe(true)
      expect(backLink.classList.contains('btn')).toBe(false)
      if (expected.length) {
        const leadership = screen.getByRole('heading', { level: 2, name: 'Leadership' }).parentElement
        expect(within(leadership).getAllByRole('listitem')).toHaveLength(expected.length)
        for (const leader of expected) {
          const item = within(leadership).getByText(leader.name).closest('li')
          expect(within(item).getByText(leader.position, { selector: 'p' })).toBeTruthy()
        }
      } else {
        expect(screen.queryByRole('heading', { name: 'Leadership' })).toBeNull()
      }
      expect(screen.queryByText(/Technical Software Manager|Technical Manager/i)).toBeNull()
      expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
      expect(page.container.querySelector('main')).toBeNull()
      page.unmount()
    }
  })

  it('does not infer cyber leadership from CS or DS roster labels', () => {
    for (const slug of ['cyber-defensive', 'cyber-offensive']) {
      const page = renderRoute(`/committees/${slug}`)
      expect(screen.queryByRole('heading', { name: 'Leadership' })).toBeNull()
      for (const member of boardMembers.filter(item => ['CS', 'DS'].includes(item.committee))) {
        expect(screen.queryByText(member.name)).toBeNull()
      }
      page.unmount()
    }
  })

  it('handles unknown committee routes', () => {
    renderRoute('/committees/not-a-committee')
    expect(screen.getByRole('heading', { level: 1, name: 'Committee not found' })).toBeTruthy()
    const backLink = screen.getByRole('link', { name: 'Back to committees' })
    expect(backLink.getAttribute('href')).toBe('/committees')
    expect(backLink.classList.contains('inline-flex')).toBe(true)
    expect(backLink.classList.contains('items-center')).toBe(true)
    expect(backLink.classList.contains('min-h-11')).toBe(true)
    expect(backLink.classList.contains('btn')).toBe(false)
  })
})

describe('event records', () => {
  const events = [
    { slug: 'later', title: 'Later Event', date: '2026-10-01T10:00:00Z', status: 'upcoming', category: 'workshops', categoryLabel: 'Workshops', location: 'Lab', coverImage: '/later.jpg', excerpt: 'Later', organizerCommittee: 'Web' },
    { slug: 'earlier', title: 'Earlier Event', date: '2026-09-01T10:00:00Z', status: 'upcoming', category: 'social', categoryLabel: 'Social', location: 'Hall', coverImage: '/earlier.jpg', excerpt: 'Earlier' },
  ]

  it('renders a loading state before the public event result resolves', () => {
    fetchEventsResult.mockReturnValue(new Promise(() => {}))
    renderEventRoute('/events')
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText(/loading event records/i)).toBeTruthy()
  })

  it('renders a distinct list error for an unexpected rejection', async () => {
    fetchEventsResult.mockRejectedValue(new Error('unexpected'))
    renderEventRoute('/events')
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/event data could not be loaded/i)).toBeTruthy()
    expect(screen.queryByText(/fallback event information/i)).toBeNull()
  })

  it('sorts records, deduplicates slugs, exposes filters, and links titled records', async () => {
    fetchEventsResult.mockResolvedValue({ events: [events[0], events[1], { ...events[0], title: 'Duplicate' }], source: 'remote' })
    renderEventRoute('/events')

    expect(await screen.findByText('Earlier Event')).toBeTruthy()
    expect(screen.getAllByTestId('event-record').map(row => row.dataset.slug)).toEqual(['earlier', 'later'])
    expect(screen.getByRole('link', { name: /later event/i }).getAttribute('href')).toBe('/events/later')
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeTruthy()
    const records = screen.getByRole('heading', { level: 2, name: 'Event records' })
    expect(records.compareDocumentPosition(screen.getAllByRole('heading', { level: 3 })[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('filters committee values from organizerCommittee', async () => {
    fetchEventsResult.mockResolvedValue({ events, source: 'remote' })
    renderEventRoute('/events')
    const committee = await screen.findByRole('combobox', { name: 'Filter by committee' })
    expect(within(committee).getByRole('option', { name: 'Web' })).toBeTruthy()
    fireEvent.change(committee, { target: { value: 'Web' } })
    expect(screen.getByText('Later Event')).toBeTruthy()
    expect(screen.queryByText('Earlier Event')).toBeNull()
  })

  it('shows fallback, remote-empty, and filtered-empty states distinctly', async () => {
    fetchEventsResult.mockResolvedValue({ events, source: 'fallback' })
    renderEventRoute('/events')
    expect(await screen.findByText(/showing saved fallback event information/i)).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by category' }), { target: { value: 'social' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by location' }), { target: { value: 'Lab' } })
    expect(screen.getByText(/no events match this filter/i)).toBeTruthy()

    cleanup()
    fetchEventsResult.mockResolvedValue({ events: [], source: 'remote' })
    renderEventRoute('/events')
    expect(await screen.findByText(/no event records are available/i)).toBeTruthy()
  })

  it('renders detail metadata and omits empty optional sections', async () => {
    fetchEventBySlugResult.mockResolvedValue({ event: { slug: 'earlier', title: 'Earlier Event', date: '2026-09-01T10:00:00Z', status: 'upcoming', categoryLabel: 'Social', location: 'Hall' }, source: 'remote' })
    renderEventRoute('/events/earlier')
    expect(await screen.findByRole('heading', { level: 1, name: 'Earlier Event' })).toBeTruthy()
    expect(screen.getByText('September 1, 2026')).toBeTruthy()
    expect(screen.getByText('Hall')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /about the event|event photos/i })).toBeNull()
    expect(screen.queryByText(/earlier$/i)).toBeNull()
    expect(screen.queryByText(/organizer/i)).toBeNull()
    expect(screen.queryByText(/ - /)).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('renders detail loading, fallback provenance, and a stable failed cover', async () => {
    let resolve
    fetchEventBySlugResult.mockReturnValue(new Promise(done => { resolve = done }))
    const page = renderEventRoute('/events/later')
    expect(screen.getByText(/loading event record/i)).toBeTruthy()
    await resolve({ event: events[0], source: 'fallback' })
    expect(await screen.findByRole('heading', { name: 'Later Event' })).toBeTruthy()
    expect(screen.getByText(/showing saved fallback event information/i)).toBeTruthy()
    fireEvent.error(screen.getByRole('img', { name: 'Later Event' }))
    expect(page.container.querySelector('article img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Later Event image unavailable' })).toBeTruthy()
  })

  it('resets failed detail media when navigating to another slug', async () => {
    fetchEventBySlugResult.mockImplementation(slug => Promise.resolve({ event: slug === 'later' ? events[0] : events[1], source: 'remote' }))
    render(<MemoryRouter initialEntries={['/events/later']}><Link to="/events/earlier">Next fixture</Link><Routes><Route path="/events/:slug" element={<EventDetailPage />} /></Routes></MemoryRouter>)
    fireEvent.error(await screen.findByRole('img', { name: 'Later Event' }))
    expect(screen.getByRole('img', { name: 'Later Event image unavailable' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Next fixture' }))
    expect(await screen.findByRole('img', { name: 'Earlier Event' })).toBeTruthy()
  })

  it('shows loading immediately while a newly navigated detail route is pending', async () => {
    let resolveEarlier
    fetchEventBySlugResult.mockImplementation(slug => slug === 'later'
      ? Promise.resolve({ event: events[0], source: 'remote' })
      : new Promise(resolve => { resolveEarlier = resolve }))
    render(<MemoryRouter initialEntries={['/events/later']}><Link to="/events/earlier">Next fixture</Link><Routes><Route path="/events/:slug" element={<EventDetailPage />} /></Routes></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'Later Event' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Next fixture' }))
    expect(screen.getByText(/loading event record/i)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Later Event' })).toBeNull()
    await act(async () => resolveEarlier({ event: events[1], source: 'remote' }))
    expect(screen.getByRole('heading', { name: 'Earlier Event' })).toBeTruthy()
  })

  it('keeps slugless and invalid-date records stable and replaces failed media neutrally', async () => {
    fetchEventsResult.mockResolvedValue({ events: [{ title: 'Unrouted Event', date: 'invalid', coverImage: '/broken.jpg', category: 'social' }], source: 'remote' })
    const page = renderEventRoute('/events')
    expect(await screen.findByText('Unrouted Event')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Unrouted Event' })).toBeNull()
    expect(screen.getByText('-- DATE')).toBeTruthy()
    const record = screen.getByTestId('event-record')
    fireEvent.error(within(record).getByRole('img', { name: 'Unrouted Event' }))
    expect(page.container.querySelector('[data-testid="event-record"] img')).toBeNull()
    expect(within(record).getByRole('img', { name: 'Unrouted Event image unavailable' })).toBeTruthy()
  })

  it('omits media for missing covers and formats near-midnight dates in UTC', async () => {
    fetchEventsResult.mockResolvedValue({ events: [{ title: 'No Cover', date: '2026-09-01T23:30:00Z', category: 'social' }], source: 'remote' })
    renderEventRoute('/events')
    const record = await screen.findByTestId('event-record')
    expect(within(record).queryByRole('img')).toBeNull()
    expect([...record.querySelectorAll('div')].some(node => node.classList.contains('aspect-[4/3]'))).toBe(false)
    expect(within(record).getByText('1 SEP')).toBeTruthy()
  })

  it('uses duplicate-safe keys for identical slugless records', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const slugless = { title: 'Same Record', date: '2026-09-01T10:00:00Z', category: 'social' }
    fetchEventsResult.mockResolvedValue({ events: [slugless, { ...slugless }], source: 'remote' })
    renderEventRoute('/events')
    expect(await screen.findAllByText('Same Record')).toHaveLength(2)
    expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i)
    consoleError.mockRestore()
  })

  it('does not transfer failed media state between slugless records when filtering', async () => {
    const records = [
      { title: 'Broken Workshop', date: '2026-09-01T10:00:00Z', location: 'Lab', category: 'workshops', coverImage: '/broken.jpg' },
      { title: 'Working Social', date: '2026-10-01T10:00:00Z', location: 'Hall', category: 'social', coverImage: '/working.jpg' },
    ]
    fetchEventsResult.mockResolvedValue({ events: records, source: 'remote' })
    renderEventRoute('/events')
    const broken = (await screen.findByText('Broken Workshop')).closest('article')
    fireEvent.error(within(broken).getByRole('img', { name: 'Broken Workshop' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by category' }), { target: { value: 'social' } })
    expect(screen.queryByRole('img', { name: 'Broken Workshop image unavailable' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Working Social' })).toBeTruthy()
  })

  it('formats detail dates in UTC near midnight', async () => {
    fetchEventBySlugResult.mockResolvedValue({ event: { title: 'UTC Event', date: '2026-09-01T23:30:00Z' }, source: 'remote' })
    renderEventRoute('/events/utc')
    expect(await screen.findByText('September 1, 2026')).toBeTruthy()
  })

  it('handles detail errors and unknown slugs', async () => {
    fetchEventBySlugResult.mockRejectedValueOnce(new Error('unexpected'))
    renderEventRoute('/events/broken')
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/event record could not be loaded/i)).toBeTruthy()

    cleanup()
    fetchEventBySlugResult.mockResolvedValue({ event: undefined, source: 'remote' })
    renderEventRoute('/events/missing')
    expect(await screen.findByRole('heading', { name: 'Event not found' })).toBeTruthy()
  })

  it('renders Gallery loading, fallback, empty, and rejection states', async () => {
    fetchEventsResult.mockReturnValueOnce(new Promise(() => {}))
    renderGallery()
    expect(screen.getByText(/loading event photos/i)).toBeTruthy()
    cleanup()

    fetchEventsResult.mockResolvedValueOnce({ events: [{ title: 'Fallback Event', date: '2026-09-01T23:30:00Z', slug: 'fallback-event', gallery: [{ src: '/gallery.jpg', caption: 'Fallback photo' }] }], source: 'fallback' })
    renderGallery()
    expect(await screen.findByText(/showing saved fallback event information/i)).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Fallback photo' })).toBeTruthy()
    expect(screen.getByText('Fallback Event')).toBeTruthy()
    expect(screen.getByText('September 1, 2026')).toBeTruthy()
    expect(screen.getByRole('link', { name: /view fallback event/i }).getAttribute('href')).toBe('/events/fallback-event')
    cleanup()

    fetchEventsResult.mockResolvedValueOnce({ events: [], source: 'remote' })
    renderGallery()
    expect(await screen.findByRole('heading', { level: 2, name: 'No event photography available' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Browse events' }).getAttribute('href')).toBe('/events')
    cleanup()

    fetchEventsResult.mockRejectedValueOnce(new Error('unexpected'))
    renderGallery()
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Browse events' }).getAttribute('href')).toBe('/events')
  })

  it('keeps archive images stable and replaces failed media neutrally', async () => {
    fetchEventsResult.mockResolvedValue({ events: [{ title: 'Archive Event', date: '2026-09-01T10:00:00Z', slug: 'archive-event', gallery: [{ src: '/broken.jpg', caption: 'Documented moment', width: 1200, height: 800 }] }], source: 'remote' })
    const page = renderGallery()
    const image = await screen.findByRole('img', { name: 'Documented moment' })

    expect(image.getAttribute('width')).toBe('1200')
    expect(image.getAttribute('height')).toBe('800')
    fireEvent.error(image)
    expect(page.container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Documented moment image unavailable' })).toBeTruthy()
    expect(screen.getByText('Archive Event')).toBeTruthy()
    expect(screen.getByText('Documented moment')).toBeTruthy()
  })

  it('uses level-two headings for archive records', async () => {
    fetchEventsResult.mockResolvedValue({ events: [{ title: 'Archive Event', slug: 'archive-event', gallery: [{ src: '/photo.jpg', caption: 'Archive photo' }] }], source: 'remote' })
    renderGallery()
    expect(await screen.findByRole('heading', { level: 2, name: 'Archive Event' })).toBeTruthy()
  })

  it('does not update Gallery after unmounting before its request resolves', async () => {
    let resolve
    fetchEventsResult.mockReturnValue(new Promise(done => { resolve = done }))
    const page = renderGallery()
    page.unmount()
    await act(async () => resolve({ events: [], source: 'remote' }))
    expect(page.container.textContent).toBe('')
  })
})
