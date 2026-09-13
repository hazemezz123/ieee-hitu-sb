import { beforeEach, describe, expect, it, vi } from 'vitest'
import login from './login.js'
import logout from './logout.js'
import me from './me.js'
import { clearLoginAttempts } from '../_lib/auth.js'

function mockRes() {
  const res = { statusCode: 0, headers: {}, body: undefined }
  res.status = (c) => { res.statusCode = c; return res }
  res.json = (o) => { res.body = o; return res }
  res.setHeader = (k, v) => { res.headers[k] = v }
  return res
}

beforeEach(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'correct-horse')
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  clearLoginAttempts()
})

describe('POST /api/auth/login', () => {
  it('sets an HttpOnly session cookie on the right password', async () => {
    const res = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'correct-horse' } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(res.headers['Set-Cookie']).toMatch(/^admin_session=.+; Path=\/; Max-Age=43200; SameSite=Lax; HttpOnly/)
  })

  it('rejects a wrong password without setting a cookie', async () => {
    const res = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, res)
    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid credentials' })
    expect(res.headers['Set-Cookie']).toBeUndefined()
  })

  it('rejects non-POST methods and rate-limits after 10 attempts', async () => {
    const get = mockRes()
    await login({ method: 'GET', headers: {}, body: {} }, get)
    expect(get.statusCode).toBe(405)
    for (let i = 0; i < 10; i++) {
      await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, mockRes())
    }
    const limited = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'nope' } }, limited)
    expect(limited.statusCode).toBe(429)
  })
})

describe('logout and me', () => {
  it('me returns false without a cookie and true with a login cookie', async () => {
    const anon = mockRes()
    await me({ method: 'GET', headers: {} }, anon)
    expect(anon.body).toEqual({ authed: false })

    const loginRes = mockRes()
    await login({ method: 'POST', headers: {}, body: { password: 'correct-horse' } }, loginRes)
    const cookie = loginRes.headers['Set-Cookie'].split(';')[0]
    const authed = mockRes()
    await me({ method: 'GET', headers: { cookie } }, authed)
    expect(authed.body).toEqual({ authed: true })
  })

  it('logout clears the cookie', async () => {
    const res = mockRes()
    await logout({ method: 'POST', headers: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Set-Cookie']).toMatch(/^admin_session=; Path=\//)
  })
})
