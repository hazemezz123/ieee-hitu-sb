import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
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
    expect(screen.getByAltText('Beyond Labels. Beyond Limits.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /join the branch/i }).getAttribute('href')).toBe('/join-us')
    expect(screen.getAllByRole('link', { name: /explore committees/i }).some(l => l.getAttribute('href') === '/committees')).toBe(true)
    expect(screen.getByRole('img', { name: /ieee hitu student branch logo/i })).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByText(/learn, grow, connect/i)).toBeNull()
  })

  it('orders upcoming events cleanly on home with featured and secondary items', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    expect(screen.getByRole('heading', { level: 2, name: /learning beyond the classroom\./i })).toBeTruthy()
    expect(screen.getByText('Upcoming Event')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Next Lab' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 4, name: 'Later Lab' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 2, name: 'Recent events' })).toBeNull()
  })

  it('shows the featured event image clearly on the home page', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [{ ...events[0], cardImage: '/later-card.jpg', coverImage: '/later-cover.jpg' }],
      source: 'remote',
    })
    renderPage(<Home />)

    const featured = await screen.findByRole('img', { name: 'Later Lab' })
    expect(featured.getAttribute('src')).toBe('/later-card.jpg')
    expect(featured.closest('article').querySelector('.grid')).toBeTruthy()
    expect(screen.getByRole('link', { name: /view event details/i }).getAttribute('href')).toBe('/events/later')
  })

  it('renders community partners from the source in the partnerships grid', async () => {
    renderPage(<Home />)

    expect(await screen.findByLabelText('Risk Solutions')).toBeTruthy()
    expect(screen.getByLabelText('IEEE HSB')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Partners we build with' })).toBeTruthy()
  })

  it('renders borderless theme-aware partner logos without individual cards or CSS filters', async () => {
    fetchPartnersResult.mockResolvedValue({
      partners: [{ name: 'Make X', logo: '/logos/partners/make-x.svg', logoDark: true }],
      source: 'remote',
    })
    renderPage(<Home />)

    const tile = await screen.findByLabelText('Make X')
    const [lightImg, darkImg] = tile.querySelectorAll('img')
    expect(lightImg.getAttribute('src')).toBe('/logos/partners/make-x-light.svg')
    expect(darkImg.getAttribute('src')).toBe('/logos/partners/make-x.svg')
    expect(lightImg.parentElement.getAttribute('data-logo-surface')).toBe('none')
    expect(lightImg.className).not.toMatch(/invert|grayscale|brightness-0|hue-rotate/)
  })

  it('orders Home bands with events before gallery and partners below gallery', async () => {
    renderPage(<Home />)

    await screen.findByText('Next Lab')
    const nodes = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByRole('heading', { name: /learning beyond the classroom\./i }),
      screen.getByRole('heading', { name: /moments that inspire/i }),
      screen.getByRole('heading', { name: 'Partners we build with' }),
    ]
    nodes.slice(1).forEach((node, index) => {
      expect(nodes[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  it('shows Join the Branch and Explore Committees in the recruitment band when open', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: true })
    renderPage(<Home />)

    expect(await screen.findByText('Recruitment open')).toBeTruthy()
    const h1 = screen.getByRole('heading', { level: 1 })
    const band = screen.getByRole('heading', { name: /your future starts beyond the classroom\./i })
    expect(h1.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const section = band.closest('section')
    expect(screen.getAllByRole('link', { name: /join the branch/i }).every(l => l.getAttribute('href') === '/join-us')).toBe(true)
    expect(within(section).getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
  })

  it('shows closed recruitment status and alternative committee/event paths when closed', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', isOpen: false })
    renderPage(<Home />)

    expect(await screen.findByText('Recruitment currently closed')).toBeTruthy()
    const band = screen.getByRole('heading', { name: /your future starts beyond the classroom\./i })
    const section = band.closest('section')
    expect(screen.queryByRole('link', { name: /join the branch/i })).toBeNull()
    expect(within(section).getByRole('link', { name: /explore committees/i }).getAttribute('href')).toBe('/committees')
    expect(within(section).getByRole('link', { name: /view events/i }).getAttribute('href')).toBe('/events')
  })

  it('omits marketing descriptions and announcement channels in the minimal recruitment CTA', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: 'Lead description', isOpen: true })
    renderPage(<Home />)

    expect(await screen.findByText('Recruitment open')).toBeTruthy()
    expect(screen.queryByText('Lead description')).toBeNull()
    expect(screen.queryByText(/Announcement channels/i)).toBeNull()
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

    expect(await screen.findByText(/showing saved branch event records/i)).toBeTruthy()
    expect(screen.getByText('Later Lab')).toBeTruthy()
  })

  it('handles empty events cleanly', async () => {
    fetchEventsResult.mockResolvedValue({ events: [], source: 'remote' })
    renderPage(<Home />)

    expect(await screen.findByText(/no published events yet/i)).toBeTruthy()
    expect(screen.queryByText('Upcoming Event')).toBeNull()
    expect(screen.queryByText('Recent Highlight')).toBeNull()
  })

  it('reports unavailable dates without calling a non-empty archive empty', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [{ slug: 'undated', title: 'Undated Event', date: null }, { slug: 'invalid', title: 'Invalid Event', date: 'unknown' }],
      source: 'remote',
    })
    renderPage(<Home />)

    expect(await screen.findByText('Event schedule dates are not available yet.')).toBeTruthy()
    expect(screen.queryByText(/no published events yet/i)).toBeNull()
  })

  it('links valid event records but leaves slugless event titles as plain text', async () => {
    fetchEventsResult.mockResolvedValue({
      events: [events[2], { title: 'Slugless Event', date: '2026-10-01T10:00:00Z', excerpt: 'No route' }],
      source: 'remote',
    })
    renderPage(<Home />)

    await screen.findByText('Slugless Event')
    expect(screen.getByRole('link', { name: /view event details/i }).getAttribute('href')).toBe('/events/next')
    expect(screen.queryByRole('link', { name: /slugless event/i })).toBeNull()
    expect(screen.getByRole('heading', { level: 4, name: 'Slugless Event' })).toBeTruthy()
  })

  it('omits secondary event rows when only one upcoming event exists', async () => {
    fetchEventsResult.mockResolvedValue({ events: [events[2]], source: 'remote' })
    renderPage(<Home />)

    expect(await screen.findByRole('heading', { level: 3, name: 'Next Lab' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'More Upcoming Events' })).toBeNull()
  })

  it('shows a pending event state without briefly reporting zero', () => {
    fetchEventsResult.mockReturnValue(new Promise(() => {}))
    renderPage(<Home />)

    expect(screen.getAllByRole('status').some(el => el.textContent.includes('Loading events and activities'))).toBe(true)
    expect(screen.queryByLabelText('0 events')).toBeNull()
  })

  it('renders a distinct error state for unexpected rejection', async () => {
    fetchEventsResult.mockRejectedValue(new Error('unexpected'))
    renderPage(<Home />)

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByText(/events could not be loaded right now/i)).toBeTruthy()
    expect(screen.queryByText(/saved branch event records/i)).toBeNull()
    expect(screen.queryByLabelText('0 events')).toBeNull()
  })

  it('keeps About factual, private-contact-free, and free of nested main landmarks', async () => {
    const { container } = renderPage(<AboutPage />)

    expect(screen.getByLabelText('more than 60 sessions')).toBeTruthy()
    expect(screen.getByLabelText(`${communityPartners.length} community partnerships`)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: /about ieee hitu student branch/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /meet our board members/i })).toBeNull()
    expect(container.querySelector('main')).toBeNull()
    expect(screen.queryByText(/founded|since 20|worldwide impact|global leader/i)).toBeNull()
    expect(screen.queryByText(/@gmail\.com|01\d{8,}/i)).toBeNull()
  })

  it('omits the board section while keeping the founders entry point when no roster records exist', async () => {
    renderPage(<AboutPage />)

    expect(screen.queryByRole('heading', { name: /meet our board members/i })).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
    // Prominent entry point to the Founders Team view stays available
    const foundersLink = screen.getByRole('link', { name: /founders team|meet our founders/i })
    expect(foundersLink.getAttribute('href')).toBe('/about/founders')
  })

  it('preserves the Local Student Branch vs. Global IEEE Membership explanation and external IEEE links on About', () => {
    renderPage(<AboutPage />)

    expect(screen.getByRole('heading', { name: 'Local Student Branch vs. Global IEEE Membership' })).toBeTruthy()
    expect(
      screen.getByText(/Joining an IEEE HITU Student Branch committee connects you with local campus tracks/i),
    ).toBeTruthy()

    const expectedLinks = [
      [/^ieee\.org$/i, 'https://www.ieee.org/'],
      [/^official ieee membership$/i, 'https://www.ieee.org/membership.html'],
      [/^ieee xplore$/i, 'https://ieeexplore.ieee.org/'],
    ]

    for (const [name, href] of expectedLinks) {
      const link = screen.getByRole('link', { name })
      expect(link.getAttribute('href')).toBe(href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
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

    expect(screen.getByRole('heading', { level: 1, name: 'Join an IEEE HITU Committee' })).toBeTruthy()
    expect(screen.getByText('Committee Recruitment')).toBeTruthy()
    expect(container.querySelector('main')).toBeNull()

    expect(await screen.findByText(/Step 1\/2/)).toBeTruthy()
    expect(fetchRecruitmentForm).toHaveBeenCalledWith('heads')
  })

  it('falls back to a description covering all six accepted roles', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', description: '', isOpen: false })
    renderPage(<JoinUsPage />)

    expect(
      await screen.findByText(/Apply to join a committee as Member, Head, Vice-Head, Manager, Director, or Instructor\./)
    ).toBeTruthy()
  })

  it('shows the closed state when heads recruitment is closed', async () => {
    fetchRecruitmentForm.mockResolvedValue({ slug: 'heads', title: 'Heads', isOpen: false, closedTitle: 'Custom closed', closedMessage: 'Come back later.' })
    renderPage(<JoinUsPage />)

    expect(await screen.findByText('Custom closed')).toBeTruthy()
    expect(screen.getByText('Come back later.')).toBeTruthy()
    expect(screen.queryByText(/Step 1\/2/)).toBeNull()
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
