import { NextResponse } from 'next/server'
import { createPartner, ensureSchema, fetchPartners } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET() {
  try {
    const partners = await fetchPartners()
    return NextResponse.json({ partners })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const id = await createPartner((await req.json().catch(() => ({}))) ?? {})
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
