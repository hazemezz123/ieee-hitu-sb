import { NextResponse } from 'next/server'
import { deleteEvent, ensureSchema, fetchEventBySlug, fetchEvents, updateEvent } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET(req, { params }) {
  try {
    const slug = new URL(req.url).searchParams.get('slug')
    if (slug) {
      const event = await fetchEventBySlug(String(slug))
      return NextResponse.json({ event })
    }
    const { id } = await params
    const events = await fetchEvents()
    return NextResponse.json({ event: events.find((e) => e._id === Number(id)) ?? null })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await updateEvent(Number(id), (await req.json().catch(() => ({}))) ?? {})
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
    await deleteEvent(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
