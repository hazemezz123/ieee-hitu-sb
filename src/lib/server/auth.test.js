import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkRateLimit,
  clearLoginAttempts,
  createSession,
  getSessionToken,
  isAuthed,
  passwordsEqual,
  signSession,
  verifySessionToken,
} from './auth.js'

beforeEach(() => {
  vi.stubEnv('SESSION_SECRET', 'test-secret-1234567890abcdef')
  vi.stubEnv('ADMIN_PASSWORD', 'correct-horse')
  clearLoginAttempts()
})

describe('passwordsEqual', () => {
  it('accepts the right password and rejects the wrong one without throwing on length mismatch', () => {
    expect(passwordsEqual('correct-horse')).toBe(true)
    expect(passwordsEqual('wrong')).toBe(false)
    expect(passwordsEqual('')).toBe(false)
    expect(passwordsEqual(undefined)).toBe(false)
  })
})

describe('session round-trip', () => {
  it('creates a token that verifies, and rejects tampered or expired tokens', () => {
    const { token, maxAge } = createSession()
    expect(maxAge).toBe(43200)
    expect(verifySessionToken(token)).toBe(true)
    expect(verifySessionToken(token.replace(/\d/, '9'))).toBe(false)
    expect(verifySessionToken('garbage')).toBe(false)
    expect(verifySessionToken(null)).toBe(false)
    const past = Math.floor(Date.now() / 1000) - 10
    expect(verifySessionToken(signSession(past))).toBe(false)
  })
})

describe('cookies and request auth', () => {
  it('extracts admin_session from a cookie header and authed-checks the request', () => {
    const { token } = createSession()
    const req = { headers: { cookie: `other=1; admin_session=${encodeURIComponent(token)}` } }
    expect(getSessionToken(req)).toBe(token)
    expect(isAuthed(req)).toBe(true)
    expect(isAuthed({ headers: {} })).toBe(false)
    expect(isAuthed({ headers: { cookie: 'admin_session=forged.abc' } })).toBe(false)
  })
})

describe('login rate limit', () => {
  it('allows 10 attempts per minute per IP then blocks', () => {
    for (let i = 0; i < 10; i++) expect(checkRateLimit('1.2.3.4')).toBe(true)
    expect(checkRateLimit('1.2.3.4')).toBe(false)
    expect(checkRateLimit('5.6.7.8')).toBe(true)
  })
})
