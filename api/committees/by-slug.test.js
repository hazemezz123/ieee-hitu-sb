import { beforeEach, describe, expect, it, vi } from 'vitest'

const turso = vi.hoisted(() => ({
  fetchCommitteeBySlug: vi.fn(),
}))
vi.mock('../_lib/turso.js', () => turso)

const { default: bySlug } = await import('./by-slug.js')

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

beforeEach(() => {
  Object.values(turso).forEach((fn) => fn.mockReset())
})

describe('GET /api/committees/by-slug', () => {
  it('is public and returns { committee }', async () => {
    turso.fetchCommitteeBySlug.mockResolvedValue({ _id: 4, slug: 'robotics' })
    const res = mockRes()
    await bySlug({ method: 'GET', headers: {}, query: { slug: 'robotics' } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ committee: { _id: 4, slug: 'robotics' } })
    expect(turso.fetchCommitteeBySlug).toHaveBeenCalledWith('robotics')
  })
})
