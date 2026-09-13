import { createCommitteeMember, ensureSchema, fetchAllMembers } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const members = await fetchAllMembers()
      return res.status(200).json({ members })
    }
    if (req.method === 'POST') {
      if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
      await ensureSchema()
      const { committeeId, ...data } = req.body ?? {}
      const id = await createCommitteeMember(Number(committeeId), data)
      return res.status(201).json({ id })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
