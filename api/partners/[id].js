import { deletePartner, ensureSchema, updatePartner } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updatePartner(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deletePartner(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
