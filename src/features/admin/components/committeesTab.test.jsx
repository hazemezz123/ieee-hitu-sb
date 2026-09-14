import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CommitteesTab from './CommitteesTab'

const turso = vi.hoisted(() => ({
  createCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  deleteCommittee: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  fetchCommittees: vi.fn(),
  updateCommittee: vi.fn(),
  updateCommitteeMember: vi.fn(),
}))

vi.mock('@/lib/turso', () => turso)
vi.mock('@/lib/upload', () => ({ uploadToCloudinary: vi.fn().mockResolvedValue('https://cdn/uploaded.jpg') }))

const committee = {
  _id: 2, name: 'AI', slug: 'ai', category: 'technical',
  categoryLabel: 'Technical', shortDescription: 'Explores AI.', memberCount: 1,
}
const member = { _id: 4, committeeId: 2, name: 'Shahd', position: 'Head', email: 's@mail.com', phone: '012', img: '/img.jpg' }

beforeEach(() => {
  vi.clearAllMocks()
  turso.fetchCommittees.mockResolvedValue([committee])
  turso.fetchCommitteeMembers.mockResolvedValue([member])
  turso.createCommittee.mockResolvedValue(undefined)
  turso.updateCommittee.mockResolvedValue(undefined)
  turso.deleteCommittee.mockResolvedValue(undefined)
  turso.createCommitteeMember.mockResolvedValue(undefined)
  turso.updateCommitteeMember.mockResolvedValue(undefined)
  turso.deleteCommitteeMember.mockResolvedValue(undefined)
})

afterEach(cleanup)

describe('committees tab', () => {
  it('lists committees with member counts', async () => {
    render(<CommitteesTab />)
    expect(await screen.findByText('AI')).toBeTruthy()
    expect(screen.getByText('1 member')).toBeTruthy()
  })

  it('creates a committee with an auto-generated slug', async () => {
    turso.fetchCommittees.mockResolvedValueOnce([]).mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('0 committees')

    fireEvent.click(screen.getByRole('button', { name: '+ New Committee' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'AI & Robotics' } })
    fireEvent.blur(screen.getByLabelText('Name'))
    expect(screen.getByLabelText('Slug').value).toBe('ai-robotics')
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'ai-robotics' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'technical' } })
    fireEvent.change(screen.getByLabelText('Short Description'), { target: { value: 'Builds robots.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Committee' }))

    expect(turso.createCommittee).toHaveBeenCalledWith({
      name: 'AI & Robotics', slug: 'ai-robotics', category: 'technical', shortDescription: 'Builds robots.',
    })
    expect(await screen.findByText('1 committee')).toBeTruthy()
  })

  it('edits and deletes a committee with confirmation', async () => {
    turso.fetchCommittees.mockResolvedValueOnce([committee]).mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'AI Lab' } })
    fireEvent.change(screen.getByLabelText('Short Description'), { target: { value: 'New desc.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Committee' }))
    expect(turso.updateCommittee).toHaveBeenCalledWith(2, expect.objectContaining({ name: 'AI Lab', shortDescription: 'New desc.' }))
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByText('Delete Committee').parentElement
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(turso.deleteCommittee).toHaveBeenCalledWith(2)
  })

  it('manages members: add with photo URL, edit, delete', async () => {
    turso.fetchCommittees.mockResolvedValueOnce([committee])
    turso.fetchCommitteeMembers.mockResolvedValueOnce([member]).mockResolvedValueOnce([member]).mockResolvedValueOnce([member]).mockResolvedValueOnce([])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Members' }))
    expect(await screen.findByText('Shahd')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '+ New Member' }))
    fireEvent.change(screen.getByLabelText('Member Name'), { target: { value: 'Ali' } })
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Vice Head' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@mail.com' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '011' } })
    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/ali.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Member' }))
    expect(turso.createCommitteeMember).toHaveBeenCalledWith(2, {
      name: 'Ali', position: 'Vice Head', email: 'a@mail.com', phone: '011', img: 'https://cdn/ali.jpg',
    })
    await screen.findByText('Shahd')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Treasurer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Member' }))
    expect(turso.updateCommitteeMember).toHaveBeenCalledWith(4, expect.objectContaining({ position: 'Treasurer' }))
    await screen.findByText('Shahd')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByText('Delete Member').parentElement).getByRole('button', { name: 'Delete' }))
    expect(turso.deleteCommitteeMember).toHaveBeenCalledWith(4)
    expect(await screen.findByText('No members yet.')).toBeTruthy()
  })

  it('warns that deleting a committee removes its members', async () => {
    turso.fetchCommittees.mockResolvedValueOnce([committee])
    render(<CommitteesTab />)
    await screen.findByText('AI')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText(/members will also be deleted/i)).toBeTruthy()
  })
})
