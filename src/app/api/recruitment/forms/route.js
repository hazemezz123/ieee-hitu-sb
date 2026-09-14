// src/app/api/recruitment/forms/route.js
import { NextResponse } from 'next/server'
import { fetchRecruitmentForms } from '@/lib/server/db'

export async function GET() {
  try {
    const forms = await fetchRecruitmentForms()
    return NextResponse.json({ forms })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
