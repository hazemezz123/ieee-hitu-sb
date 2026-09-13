import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearLoginAttempts, createSession } from '@/lib/server/auth'
import { GET as authMe } from './auth/me/route.js'
import { POST as login } from './auth/login/route.js'
import { POST as logout } from './auth/logout/route.js'
import { GET as eventsGET, POST as eventsPOST } from './events/route.js'
import { DELETE as eventsDELETE, GET as eventByIdGET, PUT as eventPUT } from './events/[id]/route.js'
import { GET as eventBySlug } from './events/by-slug/route.js'
import { GET as committeesGET, POST as committeesPOST } from './committees/route.js'
import { DELETE as committeeDELETE } from './committees/[id]/route.js'
import { GET as committeeBySlug } from './committees/by-slug/route.js'
import { GET as galleryGET, POST as galleryPOST } from './gallery/route.js'
import { DELETE as galleryDELETE } from './gallery/[id]/route.js'
import { GET as membersGET, POST as membersPOST } from './members/route.js'
import { DELETE as memberDELETE, PUT as memberPUT } from './members/[id]/route.js'
import { GET as partnersGET, POST as partnersPOST } from './partners/route.js'
import { DELETE as partnerDELETE } from './partners/[id]/route.js'

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEventBySlug: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  fetchCommittees: vi.fn(),
  fetchCommitteeBySlug: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  fetchAllMembers: vi.fn(),
  createCommittee: vi.fn(),
  updateCommittee: vi.fn(),
  deleteCommittee: vi.fn(),
  createCommitteeMember: vi.fn(),
  updateCommitteeMember: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchPartners: vi.fn(),
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  deletePartner: vi.fn(),
}))
vi.mock('@/lib/server/db', () => turso)

function req(path, { method = 'GET', body, cookie } = {}) {
  return new Request(`http://test${path}`, {
    method,
    headers: { ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

function authedCookie() {
  return `admin_session=${createSession().token}`
}

beforeEach(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'correct-horse')
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  clearLoginAttempts()
  Object.values(turso).forEach(fn => fn.mockReset())
})

describe('auth routes', () => {
  it('login sets an HttpOnly session cookie on the right password', async () => {
    const res = await login(req('/api/auth/login', { method: 'POST', body: { password: 'correct-horse' } }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('set-cookie')).toMatch(/^admin_session=.+; Path=\/; Max-Age=43200; SameSite=Lax; HttpOnly/)
  })

  it('login rejects a wrong password and rate-limits after 10 attempts', async () => {
    const bad = () => req('/api/auth/login', { method: 'POST', body: { password: 'nope' } })
    const res = await login(bad())
    expect(res.status).toBe(401)
    expect(res.headers.get('set-cookie')).toBeNull()
    for (let i = 0; i < 10; i++) await login(bad())
    expect((await login(bad())).status).toBe(429)
  })

  it('me reflects the cookie and logout clears it', async () => {
    expect(await (await authMe(req('/api/auth/me'))).json()).toEqual({ authed: false })
    const loginRes = await login(req('/api/auth/login', { method: 'POST', body: { password: 'correct-horse' } }))
    const cookie = loginRes.headers.get('set-cookie').split(';')[0]
    expect(await (await authMe(req('/api/auth/me', { cookie }))).json()).toEqual({ authed: true })
    const out = await logout(req('/api/auth/logout', { method: 'POST' }))
    expect(out.status).toBe(200)
    expect(out.headers.get('set-cookie')).toMatch(/^admin_session=; Path=\//)
  })
})

describe('events routes', () => {
  it('GET is public and returns { events }', async () => {
    turso.fetchEvents.mockResolvedValue([{ _id: 1 }])
    const res = await eventsGET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ events: [{ _id: 1 }] })
  })

  it('POST requires auth and returns 201 with the id', async () => {
    const anon = await eventsPOST(req('/api/events', { method: 'POST', body: { title: 'X' } }))
    expect(anon.status).toBe(401)
    expect(turso.createEvent).not.toHaveBeenCalled()
    turso.createEvent.mockResolvedValue(9)
    const res = await eventsPOST(req('/api/events', { method: 'POST', body: { title: 'X' }, cookie: authedCookie() }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 9 })
    expect(turso.ensureSchema).toHaveBeenCalledOnce()
  })

  it('PUT/DELETE by id require auth; GET by slug stays public', async () => {
    turso.fetchEventBySlug.mockResolvedValue({ _id: 3 })
    const pub = await eventBySlug(req('/api/events/by-slug?slug=x'))
    expect(pub.status).toBe(200)
    expect((await pub.json()).event).toEqual({ _id: 3 })

    const denied = await eventsDELETE(req('/api/events/3', { method: 'DELETE' }), { params: Promise.resolve({ id: '3' }) })
    expect(denied.status).toBe(401)

    const res = await eventPUT(
      req('/api/events/3', { method: 'PUT', body: { title: 'Y' }, cookie: authedCookie() }),
      { params: Promise.resolve({ id: '3' }) },
    )
    expect(res.status).toBe(200)
    expect(turso.updateEvent).toHaveBeenCalledWith(3, { title: 'Y' })
  })

  it('GET by id finds the event in the full list', async () => {
    turso.fetchEvents.mockResolvedValue([{ _id: 1 }, { _id: 2 }])
    const res = await eventByIdGET(req('/api/events/2'), { params: Promise.resolve({ id: '2' }) })
    expect((await res.json()).event).toEqual({ _id: 2 })
  })
})

describe('committees/gallery/members/partners routes', () => {
  it('GETs are public; writes return 401 without a cookie', async () => {
    turso.fetchGalleryPhotos.mockResolvedValue([])
    turso.fetchCommittees.mockResolvedValue([])
    turso.fetchAllMembers.mockResolvedValue([])
    turso.fetchPartners.mockResolvedValue([])
    for (const [handler, fn] of [
      [galleryGET, turso.fetchGalleryPhotos],
      [committeesGET, turso.fetchCommittees],
      [membersGET, turso.fetchAllMembers],
      [partnersGET, turso.fetchPartners],
    ]) {
      const res = await handler()
      expect(res.status).toBe(200)
      expect(fn).toHaveBeenCalledOnce()
    }
    for (const call of [
      () => galleryPOST(req('/api/gallery', { method: 'POST', body: {} })),
      () => committeesPOST(req('/api/committees', { method: 'POST', body: {} })),
      () => membersPOST(req('/api/members', { method: 'POST', body: {} })),
      () => partnersPOST(req('/api/partners', { method: 'POST', body: {} })),
      () => galleryDELETE(req('/api/gallery/1', { method: 'DELETE' }), { params: Promise.resolve({ id: '1' }) }),
    ]) {
      expect((await call()).status).toBe(401)
    }
    expect(turso.deleteGalleryPhoto).not.toHaveBeenCalled()
  })

  it('authed writes reach the DB helpers with the right args', async () => {
    const cookie = authedCookie()
    turso.addGalleryPhoto.mockResolvedValue(1)
    turso.createCommittee.mockResolvedValue(2)
    turso.createCommitteeMember.mockResolvedValue(3)
    turso.createPartner.mockResolvedValue(4)

    let res = await galleryPOST(req('/api/gallery', { method: 'POST', body: { src: 's', caption: 'c' }, cookie }))
    expect(res.status).toBe(201)
    expect(turso.addGalleryPhoto).toHaveBeenCalledWith('s', 'c')

    res = await committeesPOST(req('/api/committees', { method: 'POST', body: { name: 'N' }, cookie }))
    expect(turso.createCommittee).toHaveBeenCalledWith({ name: 'N' })

    res = await membersPOST(req('/api/members', { method: 'POST', body: { committeeId: 5, name: 'M' }, cookie }))
    expect(turso.createCommitteeMember).toHaveBeenCalledWith(5, { name: 'M' })

    res = await partnersPOST(req('/api/partners', { method: 'POST', body: { name: 'P' }, cookie }))
    expect(turso.createPartner).toHaveBeenCalledWith({ name: 'P' })

    res = await committeeDELETE(req('/api/committees/6', { method: 'DELETE', cookie }), { params: Promise.resolve({ id: '6' }) })
    expect(turso.deleteCommittee).toHaveBeenCalledWith(6)

    res = await memberPUT(req('/api/members/7', { method: 'PUT', body: { name: 'Z' }, cookie }), { params: Promise.resolve({ id: '7' }) })
    expect(turso.updateCommitteeMember).toHaveBeenCalledWith(7, { name: 'Z' })

    res = await memberDELETE(req('/api/members/8', { method: 'DELETE', cookie }), { params: Promise.resolve({ id: '8' }) })
    expect(res.status).toBe(200)
    expect(turso.deleteCommitteeMember).toHaveBeenCalledWith(8)

    res = await partnerDELETE(req('/api/partners/8', { method: 'DELETE', cookie }), { params: Promise.resolve({ id: '8' }) })
    expect(turso.deletePartner).toHaveBeenCalledWith(8)

    const slug = await committeeBySlug(req('/api/committees/by-slug?slug=x'))
    expect(slug.status).toBe(200)
  })
})
