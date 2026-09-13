import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_MAX_AGE = 12 * 60 * 60 // seconds
const LOGIN_WINDOW_MS = 60 * 1000
const LOGIN_MAX_ATTEMPTS = 10
const attempts = new Map()

function sessionSecret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not set')
  return s
}

export function passwordsEqual(provided) {
  const expected = process.env.ADMIN_PASSWORD || ''
  const a = createHash('sha256').update(String(provided ?? ''), 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return timingSafeEqual(a, b)
}

export function signSession(expiresAt) {
  const payload = String(expiresAt)
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function createSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  return { token: signSession(expiresAt), maxAge: SESSION_MAX_AGE }
}

export function verifySessionToken(token) {
  if (typeof token !== 'string') return false
  const dot = token.indexOf('.')
  if (dot < 0) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const exp = Number(payload)
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function getSessionToken(req) {
  const header = req.headers?.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    if (part.slice(0, idx).trim() === 'admin_session') {
      return decodeURIComponent(part.slice(idx + 1).trim())
    }
  }
  return null
}

export function isAuthed(req) {
  try {
    return verifySessionToken(getSessionToken(req))
  } catch {
    return false
  }
}

export function checkRateLimit(ip) {
  const now = Date.now()
  const list = (attempts.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS)
  if (list.length >= LOGIN_MAX_ATTEMPTS) return false
  list.push(now)
  attempts.set(ip, list)
  return true
}

export function clearLoginAttempts() {
  attempts.clear()
}

export function sessionCookie(token, maxAge, isProd) {
  const parts = [
    `admin_session=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Lax',
    'HttpOnly',
  ]
  if (isProd) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookie(isProd) {
  return sessionCookie('', 0, isProd)
}
