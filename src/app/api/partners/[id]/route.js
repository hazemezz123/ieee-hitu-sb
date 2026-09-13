import { NextResponse } from 'next/server'
import { deletePartner, ensureSchema, updatePartner } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function PUT(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await updatePartner(Number(id), (await req.json().catch(() => ({}))) ?? {})
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
    await deletePartner(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
