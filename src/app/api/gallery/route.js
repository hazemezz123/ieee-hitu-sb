import { NextResponse } from 'next/server'
import { addGalleryPhoto, ensureSchema, fetchGalleryPhotos } from '@/lib/server/db'
import { isAuthed } from '@/lib/server/auth'

export async function GET() {
  try {
    const photos = await fetchGalleryPhotos()
    return NextResponse.json({ photos })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    await ensureSchema()
    const { src, caption } = (await req.json().catch(() => ({}))) ?? {}
    const id = await addGalleryPhoto(src, caption)
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
