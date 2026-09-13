import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/server/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'))
  return res
}
