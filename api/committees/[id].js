import { deleteCommittee, ensureSchema, fetchCommitteeMembers, updateCommittee } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const members = await fetchCommitteeMembers(Number(req.query?.id))
      return res.status(200).json({ members })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updateCommittee(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteCommittee(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
