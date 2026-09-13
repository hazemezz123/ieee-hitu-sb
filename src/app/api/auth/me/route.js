import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/server/auth'

export async function GET(req) {
  return NextResponse.json({ authed: isAuthed(req) })
}
