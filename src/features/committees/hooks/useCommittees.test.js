import { beforeEach, describe, expect, it, vi } from 'vitest'
import { boardMembers as staticBoardMembers } from '@/features/about/data/boardMembers'
import { committees as staticCommittees } from '../data/committees'

const turso = vi.hoisted(() => ({
  createCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  deleteCommittee: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchAllMembers: vi.fn(),
  fetchCommitteeBySlug: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  fetchCommittees: vi.fn(),
  updateCommittee: vi.fn(),
  updateCommitteeMember: vi.fn(),
}))

vi.mock('@/lib/turso', () => turso)

import {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  fetchAllMembers,
  fetchAllMembersResult,
  fetchCommitteeDetailResult,
  fetchCommittees,
  fetchCommitteesResult,
  updateCommittee,
  updateCommitteeMember,
} from './useCommittees'

describe('committee source', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns remote committees with provenance', async () => {
    const remote = [{ _id: 1, name: 'AI', slug: 'ai' }]
    turso.fetchCommittees.mockResolvedValue(remote)
    await expect(fetchCommitteesResult()).resolves.toEqual({ committees: remote, source: 'remote' })
    await expect(fetchCommittees()).resolves.toEqual(remote)
  })

  it('falls back to a fresh clone of static committees', async () => {
    turso.fetchCommittees.mockRejectedValueOnce(new Error('offline'))
    const result = await fetchCommitteesResult()
    expect(result.source).toBe('fallback')
    expect(result.committees).toEqual(structuredClone(staticCommittees))
  })

  it('returns remote members with provenance', async () => {
    const remote = [{ _id: 1, name: 'Shahd', committee: 'PR' }]
    turso.fetchAllMembers.mockResolvedValue(remote)
    await expect(fetchAllMembersResult()).resolves.toEqual({ members: remote, source: 'remote' })
    await expect(fetchAllMembers()).resolves.toEqual(remote)
  })

  it('falls back to a fresh clone of static board members', async () => {
    turso.fetchAllMembers.mockRejectedValueOnce(new Error('offline'))
    const result = await fetchAllMembersResult()
    expect(result.source).toBe('fallback')
    expect(result.members).toEqual(structuredClone(staticBoardMembers))
  })

  it('resolves committee detail with members from Turso, attaching the committee name', async () => {
    const committee = { _id: 2, name: 'AI', slug: 'ai' }
    const members = [{ _id: 3, committeeId: 2, name: 'Mo', position: 'Head' }]
    turso.fetchCommitteeBySlug.mockResolvedValue(committee)
    turso.fetchCommitteeMembers.mockResolvedValue(members)

    await expect(fetchCommitteeDetailResult('ai')).resolves.toEqual({ committee, members: [{ ...members[0], committee: 'AI' }], source: 'remote' })
    expect(turso.fetchCommitteeMembers).toHaveBeenCalledWith(2)
  })

  it('resolves a missing remote committee to null', async () => {
    turso.fetchCommitteeBySlug.mockResolvedValue(null)
    await expect(fetchCommitteeDetailResult('nope')).resolves.toEqual({ committee: null, members: [], source: 'remote' })
  })

  it('falls back to static detail on failure', async () => {
    turso.fetchCommitteeBySlug.mockRejectedValue(new Error('offline'))
    const result = await fetchCommitteeDetailResult('web')
    expect(result.source).toBe('fallback')
    expect(result.committee).toEqual(structuredClone(staticCommittees.find(c => c.slug === 'web')))
    expect(result.members).toEqual(structuredClone(staticBoardMembers))

    const missing = await fetchCommitteeDetailResult('ghost')
    expect(missing).toEqual({ committee: null, members: structuredClone(staticBoardMembers), source: 'fallback' })
  })

  it('preserves CRUD exports', () => {
    expect(createCommittee).toBe(turso.createCommittee)
    expect(updateCommittee).toBe(turso.updateCommittee)
    expect(deleteCommittee).toBe(turso.deleteCommittee)
    expect(createCommitteeMember).toBe(turso.createCommitteeMember)
    expect(updateCommitteeMember).toBe(turso.updateCommitteeMember)
    expect(deleteCommitteeMember).toBe(turso.deleteCommitteeMember)
  })
})
