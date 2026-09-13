import { NextResponse } from 'next/server'
import { checkRateLimit, createSession, passwordsEqual, sessionCookie } from '@/lib/server/auth'

export async function POST(req) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 })
  }
  const { password } = (await req.json().catch(() => ({}))) ?? {}
  if (!passwordsEqual(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const { token, maxAge } = createSession()
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', sessionCookie(token, maxAge, process.env.NODE_ENV === 'production'))
  return res
}
