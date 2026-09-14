// src/app/api/recruitment/forms/[slug]/route.js
import { NextResponse } from 'next/server'
import { ensureSchema, fetchRecruitmentFormBySlug, updateRecruitmentForm } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

function isMissingTable(err) {
  return String(err?.message || '').includes('no such table')
}

async function getForm(slug) {
  try {
    return await fetchRecruitmentFormBySlug(slug)
  } catch (err) {
    if (!isMissingTable(err)) throw err
    await ensureSchema()
    return await fetchRecruitmentFormBySlug(slug)
  }
}

export async function GET(req, { params }) {
  try {
    const { slug } = await params
    const form = await getForm(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ form })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { slug } = await params
    const body = (await req.json().catch(() => ({}))) ?? {}
    const patch = {}
    if (body.title !== undefined) patch.title = String(body.title)
    if (body.description !== undefined) patch.description = String(body.description)
    if (body.isOpen !== undefined) patch.isOpen = Boolean(body.isOpen)
    if (body.closedTitle !== undefined) patch.closedTitle = String(body.closedTitle)
    if (body.closedMessage !== undefined) patch.closedMessage = String(body.closedMessage)
    await updateRecruitmentForm(slug, patch)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
