// src/app/api/recruitment/applications/[id]/route.js
import { NextResponse } from 'next/server'
import { deleteRecruitmentApplication, ensureSchema, fetchRecruitmentApplicationById } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

function isMissingTable(err) {
  return String(err?.message || '').includes('no such table')
}

export async function GET(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const { id } = await params
    let application
    try {
      application = await fetchRecruitmentApplicationById(Number(id))
    } catch (err) {
      if (!isMissingTable(err)) throw err
      await ensureSchema()
      application = await fetchRecruitmentApplicationById(Number(id))
    }
    if (!application) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ application })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { id } = await params
    await deleteRecruitmentApplication(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
