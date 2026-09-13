import { createCommittee, ensureSchema, fetchCommittees } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const committees = await fetchCommittees()
      return res.status(200).json({ committees })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const id = await createCommittee(req.body ?? {})
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
