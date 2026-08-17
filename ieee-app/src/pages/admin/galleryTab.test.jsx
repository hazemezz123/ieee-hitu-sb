import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryTab from './GalleryTab'

const { fetchGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto, uploadToCloudinary } = vi.hoisted(() => ({
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../../data/gallerySource', () => ({ fetchGalleryPhotos }))
vi.mock('../../lib/turso', () => ({ addGalleryPhoto, deleteGalleryPhoto }))
vi.mock('../../lib/upload', () => ({ uploadToCloudinary }))

const photo = { _id: 1, src: 'https://cdn/x.jpg', caption: 'Group photo', createdAt: '2026-08-17 10:00:00' }

beforeEach(() => {
  vi.clearAllMocks()
  fetchGalleryPhotos.mockResolvedValue([photo])
  addGalleryPhoto.mockResolvedValue(undefined)
  deleteGalleryPhoto.mockResolvedValue(undefined)
  uploadToCloudinary.mockResolvedValue('https://cdn/uploaded.jpg')
})

afterEach(cleanup)

describe('gallery tab', () => {
  it('lists existing photos with captions', async () => {
    render(<GalleryTab />)
    expect(await screen.findByAltText('Group photo')).toBeTruthy()
    expect(screen.getByText('Group photo')).toBeTruthy()
  })

  it('uploads a file, then refreshes the list', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([]).mockResolvedValueOnce([{ _id: 2, src: 'https://cdn/uploaded.jpg', caption: 'New', createdAt: '' }])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] },
    })
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'New' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    expect(await screen.findByText('1 photo')).toBeTruthy()
    expect(uploadToCloudinary).toHaveBeenCalledOnce()
    expect(addGalleryPhoto).toHaveBeenCalledWith('https://cdn/uploaded.jpg', 'New')
  })

  it('adds a photo from a pasted URL when no file is chosen', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/pasted.jpg' } })
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Pasted' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    await screen.findByText('0 photos')
    expect(uploadToCloudinary).not.toHaveBeenCalled()
    expect(addGalleryPhoto).toHaveBeenCalledWith('https://cdn/pasted.jpg', 'Pasted')
  })

  it('requires a file or URL before adding', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))
    expect(screen.getByText('Choose a photo or paste an image URL.')).toBeTruthy()
    expect(addGalleryPhoto).not.toHaveBeenCalled()
  })

  it('shows upload errors and keeps the form usable', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([])
    uploadToCloudinary.mockRejectedValueOnce(new Error('Invalid preset'))
    render(<GalleryTab />)
    await screen.findByText('0 photos')

    fireEvent.change(screen.getByLabelText('Photo'), {
      target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add Photo' }))

    expect(await screen.findByText('Invalid preset')).toBeTruthy()
    expect(addGalleryPhoto).not.toHaveBeenCalled()
  })

  it('deletes a photo after confirmation', async () => {
    fetchGalleryPhotos.mockResolvedValueOnce([photo]).mockResolvedValueOnce([])
    render(<GalleryTab />)
    await screen.findByAltText('Group photo')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Photo').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(deleteGalleryPhoto).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Photo').parentElement).getByRole('button', { name: 'Delete' }))
    expect(deleteGalleryPhoto).toHaveBeenCalledWith(1)
    expect(await screen.findByText('0 photos')).toBeTruthy()
  })
})