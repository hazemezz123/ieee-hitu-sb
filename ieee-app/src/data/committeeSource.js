import { boardMembers as staticBoardMembers } from './boardMembers'
import { committees as staticCommittees } from './committees'
import {
  fetchAllMembers as tursoFetchAllMembers,
  fetchCommitteeBySlug as tursoFetchCommitteeBySlug,
  fetchCommitteeMembers as tursoFetchCommitteeMembers,
  fetchCommittees as tursoFetchCommittees,
} from '../lib/turso'

export {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  updateCommittee,
  updateCommitteeMember,
} from '../lib/turso'

export async function fetchCommitteesResult() {
  try {
    return { committees: await tursoFetchCommittees(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { committees: structuredClone(staticCommittees), source: 'fallback' }
  }
}

export async function fetchCommittees() {
  return (await fetchCommitteesResult()).committees
}

export async function fetchAllMembersResult() {
  try {
    return { members: await tursoFetchAllMembers(), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    return { members: structuredClone(staticBoardMembers), source: 'fallback' }
  }
}

export async function fetchAllMembers() {
  return (await fetchAllMembersResult()).members
}

export async function fetchCommitteeDetailResult(slug) {
  try {
    const committee = await tursoFetchCommitteeBySlug(slug)
    if (!committee) return { committee: null, members: [], source: 'remote' }
    const members = await tursoFetchCommitteeMembers(committee._id)
    // members from fetchCommitteeMembers carry no committee name; attach it so
    // findCommitteeLeaders(slug, members) matches on the detail page
    return { committee, members: members.map(member => ({ ...member, committee: committee.name })), source: 'remote' }
  } catch (err) {
    console.warn('Turso fetch failed, falling back to static:', err?.message ?? String(err))
    const committee = staticCommittees.find(item => item.slug === slug)
    return {
      committee: committee ? structuredClone(committee) : null,
      members: structuredClone(staticBoardMembers),
      source: 'fallback',
    }
  }
}
