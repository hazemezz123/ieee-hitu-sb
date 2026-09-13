import { NextResponse } from 'next/server'
import { fetchCommitteeBySlug } from '@/lib/server/db'

export async function GET(req) {
  try {
    const committee = await fetchCommitteeBySlug(String(new URL(req.url).searchParams.get('slug') ?? ''))
    return NextResponse.json({ committee })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
