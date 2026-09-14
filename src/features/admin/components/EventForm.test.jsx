import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventForm from './EventForm'

const nav = vi.hoisted(() => ({ params: {}, push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useParams: () => nav.params,
  usePathname: () => '/',
  useRouter: () => ({ push: nav.push }),
}))

const { fetchEvents, createEvent, updateEvent, fetchCommittees, uploadToCloudinary } = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  fetchCommittees: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEvents', () => ({ fetchEvents, createEvent, updateEvent }))
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommittees }))
vi.mock('@/lib/upload', () => ({ uploadToCloudinary }))

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
  nav.params = {}
  fetchEvents.mockResolvedValue([])
  createEvent.mockResolvedValue(undefined)
  updateEvent.mockResolvedValue(undefined)
  fetchCommittees.mockResolvedValue(committees)
  uploadToCloudinary.mockResolvedValue('https://cdn/cover.jpg')
})

afterEach(cleanup)

function renderRoute(route = '/admin/events/new') {
  const match = route.match(/^\/admin\/events\/(\d+)\/edit$/)
  nav.params = match ? { id: match[1] } : {}
  return render(<EventForm />)
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'IEEE Summit' } })
  fireEvent.blur(screen.getByLabelText('Title'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01T10:00' } })
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Hall A' } })
}

function photoUrlInput(label) {
  return within(screen.getByLabelText(label).parentElement.parentElement).getByPlaceholderText('Or paste an image URL')
}

describe('event form', () => {
  it('offers Summit in the category dropdown', () => {
    renderRoute()
    fireEvent.click(screen.getByRole('combobox', { name: 'Category' }))
    expect(screen.getByRole('option', { name: 'Summit' })).toBeTruthy()
  })

  it('lists fetched committees in the organizer select with None first', async () => {
    renderRoute()
    const select = screen.getByRole('combobox', { name: 'Organizer Committee (optional)' })
    expect(select.textContent).toMatch(/None/)
    fireEvent.click(select)
    expect(await screen.findByRole('option', { name: 'Web' })).toBeTruthy()
    expect(screen.getAllByRole('option')[0].textContent).toMatch(/None/)
  })

  it('saves the selected committee name', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.click(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Web' }))
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
    expect(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }).textContent).toMatch(/Web/)
  })

  it('keeps a saved committee that no longer exists as an extra option', async () => {
    fetchEvents.mockResolvedValue([{ ...event, organizerCommittee: 'PR & OC' }])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('Robotics Workshop')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }).textContent).toMatch(/PR & OC/)
    fireEvent.click(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }))
    expect(await screen.findByRole('option', { name: 'PR & OC' })).toBeTruthy()
  })

  it('uploads a chosen cover file to Cloudinary and saves its URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Cover Image'), {
      target: { files: [new File(['x'], 'cover.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(uploadToCloudinary).toHaveBeenCalledOnce())
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ coverImage: 'https://cdn/cover.jpg' })))
  })

  it('skips upload and uses a pasted cover URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(photoUrlInput('Cover Image'), { target: { value: 'https://cdn/pasted.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ coverImage: 'https://cdn/pasted.jpg' })))
    expect(uploadToCloudinary).not.toHaveBeenCalled()
  })

  it('shows upload errors and does not save', async () => {
    uploadToCloudinary.mockRejectedValueOnce(new Error('Upload failed'))
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Cover Image'), {
      target: { files: [new File(['x'], 'cover.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(await screen.findByText('Upload failed')).toBeTruthy()
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('uploads a chosen card image file to Cloudinary and saves its URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Card Image'), {
      target: { files: [new File(['x'], 'card.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ cardImage: 'https://cdn/cover.jpg' })))
  })

  it('skips upload and uses a pasted card image URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(photoUrlInput('Card Image'), { target: { value: 'https://cdn/pasted-card.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ cardImage: 'https://cdn/pasted-card.jpg' })))
    expect(uploadToCloudinary).not.toHaveBeenCalled()
  })

  it('adds a gallery image from a pasted URL with caption and saves it', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(photoUrlInput('Gallery Image'), { target: { value: 'https://cdn/g.jpg' } })
    fireEvent.change(screen.getByLabelText('Caption (optional)'), { target: { value: 'Group photo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    expect(screen.getByText('Group photo')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
      gallery: [{ src: 'https://cdn/g.jpg', caption: 'Group photo' }],
    })))
    expect(uploadToCloudinary).not.toHaveBeenCalled()
  })

  it('uploads a gallery file to Cloudinary on save', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Gallery Image'), {
      target: { files: [new File(['x'], 'g.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(uploadToCloudinary).toHaveBeenCalledOnce())
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({
      gallery: [{ src: 'https://cdn/cover.jpg', caption: '' }],
    })))
  })

  it('removes a gallery image from the list', async () => {
    renderRoute()
    fireEvent.change(photoUrlInput('Gallery Image'), { target: { value: 'https://cdn/one.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.change(photoUrlInput('Gallery Image'), { target: { value: 'https://cdn/two.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    expect(screen.getAllByText('No caption')).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    expect(screen.getByText('https://cdn/two.jpg')).toBeTruthy()
    expect(screen.queryByText('https://cdn/one.jpg')).toBeNull()
  })

  it('hydrates gallery strings and objects into the image list', async () => {
    fetchEvents.mockResolvedValue([{ ...event, gallery: ['/one.jpg', { src: '/two.jpg', caption: 'Object photo' }] }])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByText('Object photo')).toBeTruthy()
    expect(screen.getByText('/one.jpg')).toBeTruthy()
    expect(screen.getByText('/two.jpg')).toBeTruthy()
  })

  it('shows a gallery upload error and does not save', async () => {
    uploadToCloudinary.mockRejectedValueOnce(new Error('Gallery upload failed'))
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Gallery Image'), {
      target: { files: [new File(['x'], 'g.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(await screen.findByText('Gallery upload failed')).toBeTruthy()
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('saves an event link and hydrates it on edit', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Event Link (optional)'), { target: { value: 'https://forms.example/register' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ eventLink: 'https://forms.example/register' })))

    cleanup()
    fetchEvents.mockResolvedValue([{ ...event, eventLink: 'https://forms.example/register' }])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('https://forms.example/register')).toBeTruthy()
  })
})