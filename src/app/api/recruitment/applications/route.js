// src/app/api/recruitment/applications/route.js
import { NextResponse } from 'next/server'
import { createRecruitmentApplication, ensureSchema, fetchRecruitmentApplications, fetchRecruitmentFormBySlug } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'
import { validateHeadsApplication } from '@/lib/recruitmentValidation'

const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter(t => now - t < 60_000)
  if (list.length >= 5) return true
  list.push(now)
  hits.set(ip, list)
  return false
}

export async function GET(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const slug = new URL(req.url).searchParams.get('form') || 'heads'
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const applications = await fetchRecruitmentApplications(form._id)
    const q = (new URL(req.url).searchParams.get('q') || '').toLowerCase()
    const pref = new URL(req.url).searchParams.get('pref') || ''
    const rows = applications
      .map(a => ({ _id: a._id, name: String(a.data?.name || ''), email: String(a.data?.email || ''), firstPref: String(a.data?.firstPref || ''), createdAt: a.createdAt }))
      .filter(r => (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)) && (!pref || r.firstPref === pref))
    return NextResponse.json({ applications: rows })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const ip = req.headers.get?.('x-forwarded-for') || 'local'
    if (rateLimited(ip)) return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
    const body = (await req.json().catch(() => ({}))) ?? {}
    if (body.company_website) return NextResponse.json({ id: 0 }, { status: 201 })
    const slug = String(body.formSlug || 'heads')
    await ensureSchema()
    const form = await fetchRecruitmentFormBySlug(slug)
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!form.isOpen) return NextResponse.json({ error: 'Recruitment is closed.' }, { status: 410 })
    const check = validateHeadsApplication(body.data || {})
    if (!check.ok) return NextResponse.json({ error: check.error, field: check.field }, { status: 400 })
    const id = await createRecruitmentApplication(form._id, body.data)
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
