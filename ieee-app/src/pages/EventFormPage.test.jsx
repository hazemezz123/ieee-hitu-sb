import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventFormPage from './EventFormPage'

const { fetchEvents, createEvent, updateEvent, fetchCommittees, uploadToCloudinary } = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  fetchCommittees: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../data/eventsSource', () => ({ fetchEvents, createEvent, updateEvent }))
vi.mock('../data/committeeSource', () => ({ fetchCommittees }))
vi.mock('../lib/upload', () => ({ uploadToCloudinary }))

const committees = [
  { _id: 1, name: 'Web', slug: 'web', category: 'technical', categoryLabel: 'Technical', shortDescription: '', memberCount: 0 },
  { _id: 2, name: 'AI', slug: 'ai', category: 'technical', categoryLabel: 'Technical', shortDescription: '', memberCount: 0 },
]

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
  organizerCommittee: 'Web',
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchEvents.mockResolvedValue([])
  createEvent.mockResolvedValue(undefined)
  updateEvent.mockResolvedValue(undefined)
  fetchCommittees.mockResolvedValue(committees)
  uploadToCloudinary.mockResolvedValue('https://cdn/cover.jpg')
})

afterEach(cleanup)

function renderRoute(route = '/admin/events/new') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/events/new" element={<EventFormPage />} />
        <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
        <Route path="/admin" element={<p>Admin</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'IEEE Summit' } })
  fireEvent.blur(screen.getByLabelText('Title'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01T10:00' } })
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Hall A' } })
}

describe('event form', () => {
  it('offers Summit in the category dropdown', () => {
    renderRoute()
    const values = [...screen.getByLabelText('Category').options].map(o => o.value)
    expect(values).toContain('summit')
  })

  it('lists fetched committees in the organizer select with None first', async () => {
    renderRoute()
    const select = screen.getByLabelText('Organizer Committee (optional)')
    expect(await screen.findByRole('option', { name: 'Web' })).toBeTruthy()
    expect(select.options[0].value).toBe('')
    expect(select.options[0].text).toBe('None')
  })

  it('saves the selected committee name', async () => {
    renderRoute()
    await screen.findByRole('option', { name: 'Web' })
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Organizer Committee (optional)'), { target: { value: 'Web' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ organizerCommittee: 'Web' })))
  })

  it('saves organizerCommittee as null when None is chosen', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ organizerCommittee: null })))
  })

  it('hydrates the organizer select from the event', async () => {
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('Robotics Workshop')).toBeTruthy()
    expect(screen.getByLabelText('Organizer Committee (optional)').value).toBe('Web')
  })

  it('keeps a saved committee that no longer exists as an extra option', async () => {
    fetchEvents.mockResolvedValue([{ ...event, organizerCommittee: 'PR & OC' }])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByRole('option', { name: 'PR & OC' })).toBeTruthy()
    expect(screen.getByLabelText('Organizer Committee (optional)').value).toBe('PR & OC')
  })
})