// src/app/api/recruitment/forms/route.js
import { NextResponse } from 'next/server'
import { ensureSchema, fetchRecruitmentForms } from '@/lib/server/db'

function isMissingTable(err) {
  return String(err?.message || '').includes('no such table')
}

export async function GET() {
  try {
    try {
      return NextResponse.json({ forms: await fetchRecruitmentForms() })
    } catch (err) {
      if (!isMissingTable(err)) throw err
      await ensureSchema()
      return NextResponse.json({ forms: await fetchRecruitmentForms() })
    }
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
