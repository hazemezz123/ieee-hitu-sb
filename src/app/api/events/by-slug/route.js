import { NextResponse } from 'next/server'
import { fetchEventBySlug } from '@/lib/server/db'

export async function GET(req) {
  try {
    const event = await fetchEventBySlug(String(new URL(req.url).searchParams.get('slug') ?? ''))
    return NextResponse.json({ event })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
