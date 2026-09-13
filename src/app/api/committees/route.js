import { NextResponse } from 'next/server'
import { createCommittee, ensureSchema, fetchCommittees } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET() {
  try {
    const committees = await fetchCommittees()
    return NextResponse.json({ committees })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const id = await createCommittee((await req.json().catch(() => ({}))) ?? {})
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
