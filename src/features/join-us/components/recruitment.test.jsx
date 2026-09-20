import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '@/features/home/components/HomePage'
import AboutPage from '@/features/about/components/AboutPage'
import FoundersView from '@/features/about/components/FoundersView'
import JoinUsPage from './JoinUsPage'
import ContactPage from '@/features/contact/components/ContactPage'
import TechnicalResources from '@/components/ui/TechnicalResources'
import { committees } from '@/features/committees/data/committees'
import { communityPartners } from '@/features/home/data/partners'

const { fetchEventsResult, fetchCommitteesResult, fetchPartnersResult, fetchPartners, fetchRecruitmentForm } = vi.hoisted(() => ({
  fetchEventsResult: vi.fn(),
  fetchCommitteesResult: vi.fn(),
  fetchPartnersResult: vi.fn(),
  fetchPartners: vi.fn(),
  fetchRecruitmentForm: vi.fn(),
}))

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

vi.mock('@/features/events/hooks/useEvents', () => ({ fetchEventsResult }))
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult }))
vi.mock('@/features/home/hooks/usePartners', () => ({ fetchPartnersResult, fetchPartners }))
vi.mock('@/lib/recruitment', () => ({
  fetchRecruitmentForm: (...args) => fetchRecruitmentForm(...args),
  submitApplication: vi.fn(),
}))

const events = [
  { slug: 'later', title: 'Later Lab', date: '2026-10-01T10:00:00Z', excerpt: 'Later', location: 'HITU' },
  { slug: 'older', title: 'Older Workshop', date: '2026-06-01T10:00:00Z', excerpt: 'Older', location: 'HITU' },
  { slug: 'next', title: 'Next Lab', date: '2026-09-01T10:00:00Z', excerpt: 'Next', location: 'HITU' },
  { slug: 'recent', title: 'Recent Workshop', date: '2026-08-01T10:00:00Z', excerpt: 'Recent', location: 'HITU' },
]

const renderPage = page => render(page)

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
    fetchRecruitmentForm.mockReset()
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: '', isOpen: false })
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

  it('shows the recruitment band after the hero when open', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: true })
    renderPage(<Home />)

    const cta = await screen.findByRole('link', { name: /start your application/i })
    expect(cta.getAttribute('href')).toBe('/join-us')
    const h1 = screen.getByRole('heading', { level: 1 })
    const band = screen.getByRole('heading', { name: /lead an ieee hitu committee/i })
    expect(h1.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('hides the recruitment band when closed', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', isOpen: false })
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    expect(screen.queryByRole('heading', { name: /lead an ieee hitu committee/i })).toBeNull()
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

  it('shows Meet Our Board Members as image cards including managers plus a founders entry', async () => {
    renderPage(<AboutPage />)

    expect(screen.getByRole('heading', { name: /meet our board members/i })).toBeTruthy()
    // Managers must not be filtered out
    expect(screen.getByText('Habiba Hamdy Aly Hassan')).toBeTruthy()
    expect(screen.getByText('Seif Ayman Abdelmoniem Ahmed')).toBeTruthy()
    // Card grid with photos (real URL or graceful fallback), name, and title
    const grid = screen.getByText('Habiba Hamdy Aly Hassan').closest('ul')
    expect(grid.className).toContain('grid')
    const card = screen.getByText('Habiba Hamdy Aly Hassan').closest('li')
    expect(card.textContent).toMatch(/Technical Software Manager/)
    // Fallback avatar for members without a usable photo URL
    const fallbackCard = screen.getByText('Abdelrhman Saleh Amin').closest('li')
    expect(fallbackCard.querySelector('img')).toBeNull()
    // Prominent entry point to the Founders Team view
    const foundersLink = screen.getByRole('link', { name: /founders team|meet our founders/i })
    expect(foundersLink.getAttribute('href')).toBe('/about/founders')
  })

  it('renders the founders view with a heading, honest empty state, and navigation', async () => {
    const { container } = renderPage(<FoundersView />)

    expect(screen.getByRole('heading', { level: 1, name: /meet our founders/i })).toBeTruthy()
    expect(screen.getByText(/founder records are being compiled/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to about/i }).getAttribute('href')).toBe('/about')
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByText(/@gmail\.com/i)).toBeTruthy()
  })

  it('does not update state after unmounting before the request resolves', async () => {
    let resolve
    fetchEventsResult.mockReturnValue(new Promise(done => { resolve = done }))
    const page = renderPage(<Home />)
    page.unmount()

    await act(async () => resolve({ events, source: 'remote' }))
    expect(page.container.textContent).toBe('')
  })

  it('uses committee data, native labels, and an honest local outcome on contact', () => {
    const { container } = renderPage(<ContactPage />)
    const action = 'Record message'
    const name = screen.getByLabelText('Full name')
    const email = screen.getByLabelText('Email address')
    const phone = screen.getByLabelText('Phone number')
    const company = screen.getByLabelText('Company')
    const committee = screen.getByRole('combobox', { name: 'Committee' })

    const controls = [name, email, phone, company, committee, screen.getByLabelText('Message')]
    expect(new Set(controls.map(control => control.id)).size).toBe(controls.length)
    expect(screen.getByLabelText(`${committees.length} committees`)).toBeTruthy()
    fireEvent.click(committee)
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getAllByRole('option').length).toBe(committees.length)
    fireEvent.click(committee)
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
    fireEvent.click(committee)
    fireEvent.click(screen.getByRole('option', { name: new RegExp(committees[0].name) }))
    // Branch email sits directly underneath the submit button
    const submitBtn = screen.getByRole('button', { name: action })
    expect(submitBtn.nextElementSibling?.tagName).toBe('A')
    expect(submitBtn.nextElementSibling?.getAttribute('href')).toBe('mailto:ieee.hitu.sb@gmail.com')
    expect(submitBtn.nextElementSibling?.textContent).toMatch(/ieee\.hitu\.sb@gmail\.com/)
    const message = screen.getByLabelText('Message')
    if (message.required) fireEvent.change(message, { target: { value: 'Participation question' } })
    fireEvent.click(screen.getByRole('button', { name: action }))
    expect(screen.getByRole('status').textContent).toMatch(/recorded locally|not transmitted/i)
    expect(screen.queryByText(/message sent|we'll get back|success/i)).toBeNull()
    expect(email.value).toBe('student@hitu.edu.eg')
  })

  it('loads the heads form status and shows the wizard when open', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: true })
    const { container } = renderPage(<JoinUsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Lead an IEEE HITU Committee' })).toBeTruthy()
    expect(screen.getByText('Heads & Vice-Heads Recruitment')).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()

    expect(await screen.findByText(/Step 1\/4/)).toBeTruthy()
    expect(fetchRecruitmentForm).toHaveBeenCalledWith('heads')
  })

  it('shows the closed state when heads recruitment is closed', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', isOpen: false, closedTitle: 'Custom closed', closedMessage: 'Come back later.' })
    renderPage(<JoinUsPage />)

    expect(await screen.findByText('Custom closed')).toBeTruthy()
    expect(screen.getByText('Come back later.')).toBeTruthy()
    expect(screen.queryByText(/Step 1\/4/)).toBeNull()
  })

  it('renders the redesigned IEEE network section', () => {
    const { container } = render(<TechnicalResources />)
    expect(screen.getByRole('heading', { name: /Take the next idea beyond campus/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /IEEE Xplore/ }).getAttribute('href')).toBe('https://ieeexplore.ieee.org/')
    expect(screen.getByRole('link', { name: /IEEE Standards/ }).getAttribute('href')).toBe('https://standards.ieee.org/')
    expect(screen.getByRole('link', { name: /IEEE Spectrum/ }).getAttribute('href')).toBe('https://spectrum.ieee.org/')
    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.bg-inverse-surface')).toBeTruthy()
  })

  it('shows the verified public contact channel without inventing participation instructions', () => {
    const join = renderPage(<JoinUsPage />)
    expect(screen.queryByText(/contact page for current participation instructions/i)).toBeNull()
    join.unmount()

    renderPage(<ContactPage />)
    expect(screen.getAllByRole('link', { name: 'ieee.hitu.sb@gmail.com' })).toHaveLength(3)
        expect(screen.getAllByRole('link', { name: 'ieee.hitu.sb@gmail.com' }).every(link => link.getAttribute('href') === 'mailto:ieee.hitu.sb@gmail.com')).toBe(true)
    expect(screen.getByText(/local demonstration.*transmits nothing/i)).toBeTruthy()
    expect(screen.queryByText(/current branch channels|we'll get back|reach out/i)).toBeNull()
  })
})
