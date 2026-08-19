import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminPage from './AdminPage'
import EventFormPage from './EventFormPage'

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
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/events/new" element={<EventFormPage />} />
        <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
        <Route path="/destination" element={<p>Destination</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New AI Session' } })
  fireEvent.blur(screen.getByLabelText('Title'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01T10:00' } })
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Hall A' } })
}

beforeEach(() => {
  sessionStorage.clear()
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
})

afterEach(cleanup)

describe('admin authentication and event list', () => {
  it('rejects a wrong password, then logs in and stores the session', async () => {
    renderRoute('/admin')
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeTruthy()
    expect(sessionStorage.getItem('admin_auth')).toBeNull()

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'ieee2026' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByRole('heading', { name: 'Manage Events' })).toBeTruthy()
    expect(sessionStorage.getItem('admin_auth')).toBe('ieee2026')
  })

  it('restores a valid session and loads events', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin')
    expect(await screen.findByText('Robotics Workshop')).toBeTruthy()
    expect(fetchEvents).toHaveBeenCalledOnce()
  })

  it('renders loading, error, and empty list states', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
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
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([event])
    const page = renderRoute('/admin')
    await screen.findByText('Robotics Workshop')
    fireEvent.click(screen.getByRole('button', { name: /new event/i }))
    expect(screen.getByRole('heading', { name: 'New Event' })).toBeTruthy()
    page.unmount()

    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin')
    await screen.findByText('Robotics Workshop')
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('heading', { name: 'Edit Event' })).toBeTruthy()
  })

  it('cancels deletion, then confirms it and refreshes the list', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
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
    for (const label of ['Title', 'Slug', 'Date', 'End Date', 'Location', 'Category', 'Cover Image', 'Excerpt', 'Description', 'Gallery (JSON array)', 'Organizer Committee (optional)']) {
      expect(screen.getByLabelText(label).id).not.toBe('')
    }
    for (const label of ['Title', 'Slug', 'Date', 'Location']) expect(screen.getByLabelText(label).required).toBe(true)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'AI & Robotics 101' } })
    fireEvent.blur(screen.getByLabelText('Title'))
    expect(screen.getByLabelText('Slug').value).toBe('ai-robotics-101')
  })

  it('hydrates an edit form and updates valid gallery data', async () => {
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('Robotics Workshop')).toBeTruthy()
    expect(screen.getByLabelText('Gallery (JSON array)').value).toContain('/one.jpg')
    fireEvent.change(screen.getByLabelText('Gallery (JSON array)'), { target: { value: '["/new.jpg"]' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Event' }))
    expect(updateEvent).toHaveBeenCalledWith(7, expect.objectContaining({ gallery: ['/new.jpg'] }))
  })

  it('creates an event with valid gallery JSON', async () => {
    renderRoute('/admin/events/new')
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Gallery (JSON array)'), { target: { value: '["/gallery.jpg"]' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ slug: 'new-ai-session', gallery: ['/gallery.jpg'] }))
  })

  it.each(['{bad json', '{"image":"/one.jpg"}'])('keeps invalid gallery input and blocks save: %s', input => {
    renderRoute('/admin/events/new')
    fillRequiredFields()
    const gallery = screen.getByLabelText('Gallery (JSON array)')
    fireEvent.change(gallery, { target: { value: input } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    const message = screen.getByText(/gallery must be valid json containing an array/i)
    expect(message.previousElementSibling).toBe(gallery)
    expect(gallery.value).toBe(input)
    expect(createEvent).not.toHaveBeenCalled()
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
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeTruthy()
    created.unmount()

    renderRoute('/admin/events/new')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Admin Login' })).toBeTruthy()
  })
})

describe('admin tabs', () => {
  it('bootstraps the schema and keeps the events view as the default tab', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    expect(await screen.findByRole('heading', { name: 'Manage Events' })).toBeTruthy()
    expect(turso.ensureSchema).toHaveBeenCalledOnce()
  })

  it('switches to the gallery and committees tabs', async () => {
    sessionStorage.setItem('admin_auth', 'ieee2026')
    fetchEvents.mockResolvedValue([])
    renderRoute('/admin')
    await screen.findByRole('heading', { name: 'Manage Events' })

    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }))
    expect(screen.getByRole('heading', { name: 'Manage Gallery' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Committees' }))
    expect(screen.getByRole('heading', { name: 'Manage Committees' })).toBeTruthy()
  })
})
