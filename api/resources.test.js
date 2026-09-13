import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchGalleryPhotos: vi.fn(),
  addGalleryPhoto: vi.fn(),
  deleteGalleryPhoto: vi.fn(),
  fetchCommittees: vi.fn(),
  fetchCommitteeMembers: vi.fn(),
  createCommittee: vi.fn(),
  updateCommittee: vi.fn(),
  deleteCommittee: vi.fn(),
  fetchAllMembers: vi.fn(),
  createCommitteeMember: vi.fn(),
  updateCommitteeMember: vi.fn(),
  deleteCommitteeMember: vi.fn(),
  fetchPartners: vi.fn(),
  createPartner: vi.fn(),
  updatePartner: vi.fn(),
  deletePartner: vi.fn(),
}))
vi.mock('./_lib/turso.js', () => turso)

const { default: galleryIndex } = await import('./gallery/index.js')
const { default: galleryById } = await import('./gallery/[id].js')
const { default: committeesIndex } = await import('./committees/index.js')
const { default: committeeById } = await import('./committees/[id].js')
const { default: membersIndex } = await import('./members/index.js')
const { default: memberById } = await import('./members/[id].js')
const { default: partnersIndex } = await import('./partners/index.js')
const { default: partnerById } = await import('./partners/[id].js')
import { createSession } from './_lib/auth.js'

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

function authedReq(extra = {}) {
  const { token } = createSession()
  return { headers: { cookie: `admin_session=${token}` }, ...extra }
}

beforeEach(() => {
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  Object.values(turso).forEach((fn) => fn.mockReset())
})

describe('resource endpoints', () => {
  it('GETs are public; writes return 401 without a cookie', async () => {
    turso.fetchGalleryPhotos.mockResolvedValue([])
    turso.fetchCommittees.mockResolvedValue([])
    turso.fetchAllMembers.mockResolvedValue([])
    turso.fetchPartners.mockResolvedValue([])
    for (const [handler, fn] of [
      [galleryIndex, turso.fetchGalleryPhotos],
      [committeesIndex, turso.fetchCommittees],
      [membersIndex, turso.fetchAllMembers],
      [partnersIndex, turso.fetchPartners],
    ]) {
      const pub = mockRes()
      await handler({ method: 'GET', headers: {} }, pub)
      expect(pub.statusCode).toBe(200)
      expect(fn).toHaveBeenCalledOnce()
      const denied = mockRes()
      await handler({ method: 'POST', headers: {}, body: {} }, denied)
      expect(denied.statusCode).toBe(401)
    }
    const delDenied = mockRes()
    await galleryById({ method: 'DELETE', headers: {}, query: { id: '1' } }, delDenied)
    expect(delDenied.statusCode).toBe(401)
    expect(turso.deleteGalleryPhoto).not.toHaveBeenCalled()
  })

  it('authed writes reach the DB helpers with the right args', async () => {
    turso.addGalleryPhoto.mockResolvedValue(1)
    turso.createCommittee.mockResolvedValue(2)
    turso.createCommitteeMember.mockResolvedValue(3)
    turso.createPartner.mockResolvedValue(4)
    turso.fetchCommitteeMembers.mockResolvedValue([])

    let res = mockRes()
    await galleryIndex({ method: 'POST', ...authedReq(), body: { src: 's', caption: 'c' } }, res)
    expect(res.statusCode).toBe(201)
    expect(turso.addGalleryPhoto).toHaveBeenCalledWith('s', 'c')

    res = mockRes()
    await committeesIndex({ method: 'POST', ...authedReq(), body: { name: 'N' } }, res)
    expect(turso.createCommittee).toHaveBeenCalledWith({ name: 'N' })

    res = mockRes()
    await membersIndex({ method: 'POST', ...authedReq(), body: { committeeId: 5, name: 'M' } }, res)
    expect(turso.createCommitteeMember).toHaveBeenCalledWith(5, { name: 'M' })

    res = mockRes()
    await partnersIndex({ method: 'POST', ...authedReq(), body: { name: 'P' } }, res)
    expect(turso.createPartner).toHaveBeenCalledWith({ name: 'P' })

    res = mockRes()
    await committeeById({ method: 'DELETE', ...authedReq(), query: { id: '6' } }, res)
    expect(turso.deleteCommittee).toHaveBeenCalledWith(6)

    res = mockRes()
    await memberById({ method: 'PUT', ...authedReq(), query: { id: '7' }, body: { name: 'Z' } }, res)
    expect(turso.updateCommitteeMember).toHaveBeenCalledWith(7, { name: 'Z' })

    res = mockRes()
    await partnerById({ method: 'DELETE', ...authedReq(), query: { id: '8' } }, res)
    expect(turso.deletePartner).toHaveBeenCalledWith(8)

    res = mockRes()
    await galleryById({ method: 'DELETE', ...authedReq(), query: { id: '9' } }, res)
    expect(turso.deleteGalleryPhoto).toHaveBeenCalledWith(9)
  })
})
