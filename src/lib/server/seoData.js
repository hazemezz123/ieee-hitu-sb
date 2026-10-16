// server-only: never import from client components.
// Centralizes SEO/sitemap reads: Turso DB first, static fallback on error.
import { cache } from 'react'
import {
  fetchEventBySlug as dbFetchEventBySlug,
  fetchEvents as dbFetchEvents,
  fetchCommitteeBySlug as dbFetchCommitteeBySlug,
  fetchCommittees as dbFetchCommittees,
  fetchCommitteeMembers as dbFetchCommitteeMembers,
} from './db.js'
import { getEventBySlug as getStaticEventBySlug, events as staticEvents } from '@/features/events/data/events.js'
import { committees as staticCommittees } from '@/features/committees/data/committees.js'

/**
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export const getEventForSeo = cache(async (slug) => {
  try {
    const event = await dbFetchEventBySlug(slug)
    if (event) return event
  } catch {
    // fall through to static
  }
  const fallback = getStaticEventBySlug(slug)
  return fallback ? structuredClone(fallback) : null
})

export const getAllEventsForSitemap = cache(async () => {
  try {
    const events = await dbFetchEvents()
    if (events && events.length > 0) return events
  } catch {
    // fall through
  }
  return structuredClone(staticEvents)
})

/**
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export const getCommitteeForSeo = cache(async (slug) => {
  try {
    const committee = await dbFetchCommitteeBySlug(slug)
    if (committee) return committee
  } catch {
    // fall through to static
  }
  const fallback = staticCommittees.find((item) => item.slug === slug)
  return fallback ? structuredClone(fallback) : null
})

export const getAllCommitteesForSitemap = cache(async () => {
  try {
    const list = await dbFetchCommittees()
    if (list && list.length > 0) return list
  } catch {
    // fall through
  }
  return structuredClone(staticCommittees)
})

/**
 * @param {number} committeeId
 * @returns {Promise<Array>}
 */
export const getCommitteeMembersForSeo = cache(async (committeeId) => {
  try {
    return await dbFetchCommitteeMembers(committeeId)
  } catch {
    return []
  }
})
