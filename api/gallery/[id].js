import { deleteGalleryPhoto, ensureSchema } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', 'DELETE')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    await deleteGalleryPhoto(Number(req.query?.id))
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
