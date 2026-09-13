import { checkRateLimit, createSession, passwordsEqual, sessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts, try again later' })
  }
  const { password } = req.body ?? {}
  if (!passwordsEqual(password)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const { token, maxAge } = createSession()
  res.setHeader('Set-Cookie', sessionCookie(token, maxAge, process.env.NODE_ENV === 'production'))
  return res.status(200).json({ ok: true })
}
