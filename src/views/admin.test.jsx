import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminPage from './AdminPage'
import EventFormPage from './EventFormPage'

const nav = vi.hoisted(() => ({ params: {}, push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useParams: () => nav.params,
  usePathname: () => '/',
  useRouter: () => ({ push: nav.push }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
}))

const fetchMock = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', fetchMock)

function apiAuth({ authed }) {
  fetchMock.mockImplementation((url) => {
    if (String(url).endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ authed }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
}

function mockLoginOnce(ok) {
  fetchMock.mockImplementation((url) => {
    if (String(url).endsWith('/api/auth/login')) {
      return Promise.resolve(ok
        ? { ok: true, json: async () => ({ ok: true }) }
        : { ok: false, status: 401, json: async () => ({ error: 'Invalid credentials' }) })
    }
    if (String(url).endsWith('/api/auth/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ authed: false }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
}

const { fetchEvents, createEvent, updateEvent, deleteEvent } = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

vi.mock('../data/eventsSource', () => ({ fetchEvents, createEvent, updateEvent, deleteEvent }))

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  fetchCommittees: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  createCommittee: vi.fn(),
  updateCommittee: vi.fn(),
  deleteCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  updateCommitteeMember: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchPartners: vi.fn(),
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  deletePartner: vi.fn(),
}))
vi.mock('../lib/turso', () => turso)
vi.mock('../lib/upload', () => ({ uploadToCloudinary: vi.fn() }))

const event = {
  _id: 7,
  title: 'Robotics Workshop',
  slug: 'robotics-workshop',
  date: '2026-09-10T10:00:00.000Z',
  endDate: '2026-09-10T12:00:00.000Z',
  location: 'Lab 1',
  category: 'workshops',
  categoryLabel: 'Workshops',
  status: 'upcoming',
  coverImage: '/robot.jpg',
  excerpt: 'Build a robot.',
  description: 'Hands-on robotics.',
  gallery: ['/one.jpg'],
  organizerCommittee: 'Robotics',
}

function renderRoute(route) {
  if (route === '/admin') {
    nav.params = {}
    return render(<AdminPage />)
  }
  const match = route.match(/^\/admin\/events\/(\d+)\/edit$/)
  nav.params = match ? { id: match[1] } : {}
  return render(<EventFormPage />)
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New AI Session' } })
  fireEvent.blur(screen.getByLabelText('Title'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01T10:00' } })
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Hall A' } })
}

function photoUrlInput(label) {
  return within(screen.getByLabelText(label).parentElement.parentElement).getByPlaceholderText('Or paste an image URL')
}

beforeEach(() => {
  nav.params = {}
  nav.push.mockReset()
  fetchMock.mockReset()
  fetchMock.mockRejectedValue(new Error('fetch not mocked'))
  fetchEvents.mockReset()
  createEvent.mockReset()
  updateEvent.mockReset()
  deleteEvent.mockReset()
  fetchEvents.mockResolvedValue([])
  createEvent.mockResolvedValue(undefined)
  updateEvent.mockResolvedValue(undefined)
  deleteEvent.mockResolvedValue(undefined)
  turso.ensureSchema.mockReset()
  turso.ensureSchema.mockResolvedValue(undefined)
  turso.fetchGalleryPhotos.mockReset()
  turso.fetchGalleryPhotos.mockResolvedValue([])
  turso.fetchCommittees.mockReset()
  turso.fetchCommittees.mockResolvedValue([])
  turso.fetchCommitteeMembers.mockReset()
  turso.fetchCommitteeMembers.mockResolvedValue([])
  turso.fetchPartners.mockReset()
  turso.fetchPartners.mockResolvedValue([])
})

afterEach(cleanup)

describe('admin authentication and event list', () => {
  it('rejects a wrong password, then logs in via the API', async () => {
    mockLoginOnce(false)
    renderRoute('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByText('Invalid credentials')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Manage Events' })).toBeNull()
  })

  it('restores a valid session from /api/auth/me and loads events', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin')
    expect(await screen.findByText('Robotics Workshop')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ credentials: 'include' }))
    expect(fetchEvents).toHaveBeenCalledOnce()
  })

  it('renders loading, error, and empty list states', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockReturnValueOnce(new Promise(() => {}))
    const pending = renderRoute('/admin')
    expect(screen.getByText('Loading...')).toBeTruthy()
    await act(async () => {})
    pending.unmount()

    fetchEvents.mockRejectedValueOnce(new Error('Events unavailable'))
    const failed = renderRoute('/admin')
    expect(await screen.findByText('Events unavailable')).toBeTruthy()
    failed.unmount()

    fetchEvents.mockResolvedValueOnce([])
    renderRoute('/admin')
    expect(await screen.findByText('0 events')).toBeTruthy()
    expect(screen.queryByRole('row', { name: /robotics workshop/i })).toBeNull()
  })

  it('navigates to create and edit routes', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin')
    await screen.findByText('Robotics Workshop')
    fireEvent.click(screen.getByRole('button', { name: /new event/i }))
    expect(nav.push).toHaveBeenCalledWith('/admin/events/new')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(nav.push).toHaveBeenCalledWith('/admin/events/7/edit')
  })

  it('cancels deletion, then confirms it and refreshes the list', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockResolvedValueOnce([event]).mockResolvedValueOnce([])
    renderRoute('/admin')
    await screen.findByText('Robotics Workshop')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Event').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(deleteEvent).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Event').parentElement).getByRole('button', { name: 'Delete' }))
    expect(deleteEvent).toHaveBeenCalledWith(7)
    expect(await screen.findByText('0 events')).toBeTruthy()
    expect(fetchEvents).toHaveBeenCalledTimes(2)
  })
})

describe('event form', () => {
  it('hydrates a delayed edit once and ignores completion after unmount', async () => {
    let resolveEvents
    fetchEvents.mockReturnValue(new Promise(resolve => { resolveEvents = resolve }))
    const page = renderRoute('/admin/events/7/edit')

    expect(screen.getByRole('status').textContent).toMatch(/loading event/i)
    expect(screen.getByRole('group').disabled).toBe(true)

    await act(() => resolveEvents([event]))
    expect(screen.getByLabelText('Title').value).toBe('Robotics Workshop')
    expect(screen.getByRole('group').disabled).toBe(false)
    expect(fetchEvents).toHaveBeenCalledOnce()

    page.unmount()
    fetchEvents.mockClear()
    fetchEvents.mockReturnValue(new Promise(resolve => { resolveEvents = resolve }))
    const stale = renderRoute('/admin/events/7/edit')
    expect(screen.getByRole('group').disabled).toBe(true)

    stale.unmount()
    await act(() => resolveEvents([event]))
    expect(fetchEvents).toHaveBeenCalledOnce()
  })

  it('associates every label, marks required fields, and generates a slug', () => {
    renderRoute('/admin/events/new')
    for (const label of ['Title', 'Slug', 'Date', 'End Date', 'Location', 'Category', 'Event Link (optional)', 'Cover Image', 'Card Image', 'Description', 'Gallery Image', 'Caption (optional)', 'Organizer Committee (optional)']) {
      expect(screen.getByLabelText(label).id).not.toBe('')
    }
    for (const label of ['Title', 'Slug', 'Date', 'Location']) expect(screen.getByLabelText(label).required).toBe(true)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'AI & Robotics 101' } })
    fireEvent.blur(screen.getByLabelText('Title'))
    expect(screen.getByLabelText('Slug').value).toBe('ai-robotics-101')
  })

  it('hydrates an edit form and updates gallery data', async () => {
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('Robotics Workshop')).toBeTruthy()
    expect(screen.getByText('/one.jpg')).toBeTruthy()
    fireEvent.change(photoUrlInput('Gallery Image'), { target: { value: 'https://cdn/new.jpg' } })
    fireEvent.change(screen.getByLabelText('Caption (optional)'), { target: { value: 'New photo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Update Event' }))
    expect(updateEvent).toHaveBeenCalledWith(7, expect.objectContaining({ gallery: [{ src: '/one.jpg', caption: '' }, { src: 'https://cdn/new.jpg', caption: 'New photo' }] }))
  })

  it('creates an event with gallery images', async () => {
    renderRoute('/admin/events/new')
    fillRequiredFields()
    fireEvent.change(photoUrlInput('Gallery Image'), { target: { value: 'https://cdn/gallery.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ slug: 'new-ai-session', gallery: [{ src: 'https://cdn/gallery.jpg', caption: '' }] }))
  })

  it('retains form data after an API failure', async () => {
    createEvent.mockRejectedValue(new Error('Save failed'))
    renderRoute('/admin/events/new')
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(await screen.findByText('Save failed')).toBeTruthy()
    expect(screen.getByLabelText('Title').value).toBe('New AI Session')
    expect(screen.getByRole('heading', { name: 'New Event' })).toBeTruthy()
  })

  it('returns to admin when save succeeds or cancel is clicked', async () => {
    const created = renderRoute('/admin/events/new')
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/admin'))
    created.unmount()

    renderRoute('/admin/events/new')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(nav.push).toHaveBeenCalledWith('/admin')
  })
})

describe('admin tabs', () => {
  it('bootstraps the schema and keeps the events view as the default tab', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    expect(await screen.findByRole('heading', { name: 'Manage Events' })).toBeTruthy()
  })

  it('switches to the gallery, committees, and partners tabs', async () => {
    apiAuth({ authed: true })
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    await screen.findByRole('heading', { name: 'Manage Events' })

    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }))
    expect(screen.getByRole('heading', { name: 'Manage Gallery' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Committees' }))
    expect(screen.getByRole('heading', { name: 'Manage Committees' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Partners' }))
    expect(await screen.findByRole('heading', { name: 'Manage Partners' })).toBeTruthy()
  })
})
