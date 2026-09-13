import { NextResponse } from 'next/server'
import { createCommitteeMember, ensureSchema, fetchAllMembers } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET() {
  try {
    const members = await fetchAllMembers()
    return NextResponse.json({ members })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { committeeId, ...data } = (await req.json().catch(() => ({}))) ?? {}
    const id = await createCommitteeMember(Number(committeeId), data)
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
