import { NextResponse } from 'next/server'
import { deleteCommittee, ensureSchema, fetchCommitteeMembers, updateCommittee } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const members = await fetchCommitteeMembers(Number(id))
    return NextResponse.json({ members })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await updateCommittee(Number(id), (await req.json().catch(() => ({}))) ?? {})
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await deleteCommittee(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
