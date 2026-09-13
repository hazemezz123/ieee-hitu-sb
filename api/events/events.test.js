import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({
  ensureSchema: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEventBySlug: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))
vi.mock('../_lib/turso.js', () => turso)

const { default: index } = await import('./index.js')
const { default: byId } = await import('./[id].js')
import { createSession } from '../_lib/auth.js'

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

describe('events api', () => {
  it('GET /api/events is public and returns { events }', async () => {
    turso.fetchEvents.mockResolvedValue([{ _id: 1 }])
    const res = mockRes()
    await index({ method: 'GET', headers: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ events: [{ _id: 1 }] })
  })

  it('POST /api/events requires auth and returns 201 with the id', async () => {
    const anon = mockRes()
    await index({ method: 'POST', headers: {}, body: { title: 'X' } }, anon)
    expect(anon.statusCode).toBe(401)
    expect(turso.createEvent).not.toHaveBeenCalled()

    turso.createEvent.mockResolvedValue(9)
    const res = mockRes()
    await index({ method: 'POST', ...authedReq(), body: { title: 'X' } }, res)
    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual({ id: 9 })
    expect(turso.ensureSchema).toHaveBeenCalledOnce()
  })

  it('PUT and DELETE by id require auth; GET by slug stays public', async () => {
    turso.fetchEventBySlug.mockResolvedValue({ _id: 3 })
    const pub = mockRes()
    await byId({ method: 'GET', headers: {}, query: { slug: 'x' } }, pub)
    expect(pub.statusCode).toBe(200)

    const denied = mockRes()
    await byId({ method: 'DELETE', headers: {}, query: { id: '3' } }, denied)
    expect(denied.statusCode).toBe(401)

    const res = mockRes()
    await byId({ method: 'PUT', ...authedReq(), query: { id: '3' }, body: { title: 'Y' } }, res)
    expect(res.statusCode).toBe(200)
    expect(turso.updateEvent).toHaveBeenCalledWith(3, { title: 'Y' })
  })
})
