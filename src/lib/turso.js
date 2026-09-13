import { api } from './apiClient'

// Reads are public GETs; writes POST/PUT/DELETE the authed /api endpoints
// (auth is the HttpOnly session cookie, sent automatically).
export async function fetchEvents() {
  const { events } = await api('/api/events')
  return events
}

export async function fetchEventBySlug(slug) {
  const { event } = await api(`/api/events/by-slug?slug=${encodeURIComponent(slug)}`)
  return event
}

export async function createEvent(data) {
  const { id } = await api('/api/events', { method: 'POST', body: data })
  return id
}

export async function updateEvent(id, data) {
  await api(`/api/events/${id}`, { method: 'PUT', body: data })
}

export async function deleteEvent(id) {
  await api(`/api/events/${id}`, { method: 'DELETE' })
}

export async function fetchGalleryPhotos() {
  const { photos } = await api('/api/gallery')
  return photos
}

export async function addGalleryPhoto(src, caption) {
  const { id } = await api('/api/gallery', { method: 'POST', body: { src, caption } })
  return id
}

export async function deleteGalleryPhoto(id) {
  await api(`/api/gallery/${id}`, { method: 'DELETE' })
}

export async function fetchCommittees() {
  const { committees } = await api('/api/committees')
  return committees
}

export async function fetchCommitteeBySlug(slug) {
  const { committee } = await api(`/api/committees/by-slug?slug=${encodeURIComponent(slug)}`)
  return committee
}

export async function createCommittee(data) {
  const { id } = await api('/api/committees', { method: 'POST', body: data })
  return id
}

export async function updateCommittee(id, data) {
  await api(`/api/committees/${id}`, { method: 'PUT', body: data })
}

export async function deleteCommittee(id) {
  await api(`/api/committees/${id}`, { method: 'DELETE' })
}

export async function fetchCommitteeMembers(committeeId) {
  const { members } = await api(`/api/committees/${committeeId}`)
  return members
}

export async function fetchAllMembers() {
  const { members } = await api('/api/members')
  return members
}

export async function createCommitteeMember(committeeId, data) {
  const { id } = await api('/api/members', { method: 'POST', body: { committeeId, ...data } })
  return id
}

export async function updateCommitteeMember(id, data) {
  await api(`/api/members/${id}`, { method: 'PUT', body: data })
}

export async function deleteCommitteeMember(id) {
  await api(`/api/members/${id}`, { method: 'DELETE' })
}

export async function fetchPartners() {
  const { partners } = await api('/api/partners')
  return partners
}

export async function createPartner(data) {
  const { id } = await api('/api/partners', { method: 'POST', body: data })
  return id
}

export async function updatePartner(id, data) {
  await api(`/api/partners/${id}`, { method: 'PUT', body: data })
  return undefined
}

export async function deletePartner(id) {
  await api(`/api/partners/${id}`, { method: 'DELETE' })
}
