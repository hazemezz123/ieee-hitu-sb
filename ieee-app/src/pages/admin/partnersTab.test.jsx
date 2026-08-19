import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PartnersTab from './PartnersTab'

const { createPartner, deletePartner, fetchPartners, updatePartner, uploadToCloudinary } = vi.hoisted(() => ({
  createPartner: vi.fn(),
  deletePartner: vi.fn(),
  fetchPartners: vi.fn(),
  updatePartner: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../../data/partnersSource', () => ({ createPartner, deletePartner, fetchPartners, updatePartner }))
vi.mock('../../lib/upload', () => ({ uploadToCloudinary }))

const partner = { _id: 1, name: 'Risk Solutions', logo: 'https://cdn/risk.webp' }

beforeEach(() => {
  vi.clearAllMocks()
  fetchPartners.mockResolvedValue([partner])
  createPartner.mockResolvedValue(undefined)
  updatePartner.mockResolvedValue(undefined)
  deletePartner.mockResolvedValue(undefined)
  uploadToCloudinary.mockResolvedValue('https://cdn/uploaded.jpg')
})

afterEach(cleanup)

describe('partners tab', () => {
  it('lists existing partners with logos', async () => {
    render(<PartnersTab />)
    expect(await screen.findByText('Risk Solutions')).toBeTruthy()
    expect(screen.getByText('1 partner')).toBeTruthy()
    expect(screen.getByAltText('Risk Solutions').getAttribute('src')).toBe('https://cdn/risk.webp')
  })

  it('creates a partner with an uploaded logo', async () => {
    fetchPartners.mockResolvedValueOnce([]).mockResolvedValueOnce([{ _id: 2, name: 'Make X', logo: 'https://cdn/uploaded.jpg', logoDark: true }])
    render(<PartnersTab />)
    await screen.findByText('0 partners')

    fireEvent.click(screen.getByRole('button', { name: '+ New Partner' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Make X' } })
    fireEvent.change(screen.getByLabelText('Logo'), {
      target: { files: [new File(['x'], 'makex.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByLabelText('Dark logo background'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Partner' }))

    expect(await screen.findByText('Make X')).toBeTruthy()
    expect(uploadToCloudinary).toHaveBeenCalledOnce()
    expect(createPartner).toHaveBeenCalledWith({ name: 'Make X', logo: 'https://cdn/uploaded.jpg', logoDark: true })
  })

  it('creates a partner from a pasted logo URL when no file is chosen', async () => {
    fetchPartners.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    render(<PartnersTab />)
    await screen.findByText('0 partners')

    fireEvent.click(screen.getByRole('button', { name: '+ New Partner' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Pasted Co' } })
    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/pasted.png' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Partner' }))

    await screen.findByText('0 partners')
    expect(uploadToCloudinary).not.toHaveBeenCalled()
    expect(createPartner).toHaveBeenCalledWith({ name: 'Pasted Co', logo: 'https://cdn/pasted.png', logoDark: false })
  })

  it('edits a partner and replaces its logo', async () => {
    fetchPartners.mockResolvedValueOnce([partner]).mockResolvedValueOnce([{ ...partner, name: 'Risk Solutions Ltd', logo: 'https://cdn/uploaded.jpg', logoDark: true }])
    render(<PartnersTab />)
    await screen.findByText('Risk Solutions')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Risk Solutions Ltd' } })
    fireEvent.change(screen.getByLabelText('Logo'), {
      target: { files: [new File(['x'], 'new.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByLabelText('Dark logo background'))
    fireEvent.click(screen.getByRole('button', { name: 'Save Partner' }))

    expect(await screen.findByText('Risk Solutions Ltd')).toBeTruthy()
    expect(uploadToCloudinary).toHaveBeenCalledOnce()
    expect(updatePartner).toHaveBeenCalledWith(1, { _id: 1, name: 'Risk Solutions Ltd', logo: 'https://cdn/uploaded.jpg', logoDark: true })
  })

  it('shows upload errors and keeps the form open', async () => {
    fetchPartners.mockResolvedValueOnce([partner])
    uploadToCloudinary.mockRejectedValueOnce(new Error('Invalid preset'))
    render(<PartnersTab />)
    await screen.findByText('Risk Solutions')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Logo'), {
      target: { files: [new File(['x'], 'new.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Partner' }))

    expect(await screen.findByText('Invalid preset')).toBeTruthy()
    expect(updatePartner).not.toHaveBeenCalled()
  })

  it('deletes a partner after confirmation', async () => {
    fetchPartners.mockResolvedValueOnce([partner]).mockResolvedValueOnce([])
    render(<PartnersTab />)
    await screen.findByText('Risk Solutions')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Partner').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(deletePartner).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Partner').parentElement).getByRole('button', { name: 'Delete' }))
    expect(deletePartner).toHaveBeenCalledWith(1)
    expect(await screen.findByText('0 partners')).toBeTruthy()
  })
})