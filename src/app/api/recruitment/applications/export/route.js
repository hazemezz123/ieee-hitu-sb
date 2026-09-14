// src/app/api/recruitment/applications/export/route.js
import { NextResponse } from 'next/server'
import { ensureSchema, fetchRecruitmentApplications, fetchRecruitmentFormBySlug } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'
import { HEADS_CSV_COLUMNS } from '@/lib/recruitmentValidation'

function csvCell(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const slug = new URL(req.url).searchParams.get('form') || 'heads'
    let form
    try {
      form = await fetchRecruitmentFormBySlug(slug)
    } catch (err) {
      if (!String(err?.message || '').includes('no such table')) throw err
      await ensureSchema()
      form = await fetchRecruitmentFormBySlug(slug)
    }
    if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const applications = await fetchRecruitmentApplications(form._id)
    const lines = [HEADS_CSV_COLUMNS.join(',')]
    for (const a of applications) {
      lines.push(HEADS_CSV_COLUMNS.map(col => col === 'id' ? a._id : col === 'created_at' ? a.createdAt : a.data?.[col] ?? '').map(csvCell).join(','))
    }
    return new NextResponse('﻿' + lines.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="recruitment-${slug}.csv"` } })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
