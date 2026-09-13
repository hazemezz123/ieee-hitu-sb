import { deleteEvent, ensureSchema, fetchEventBySlug, fetchEvents, updateEvent } from '../_lib/turso.js'
import { isAuthed } from '../_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (req.query?.slug) {
        const event = await fetchEventBySlug(String(req.query.slug))
        return res.status(200).json({ event })
      }
      const events = await fetchEvents()
      return res.status(200).json({ event: events.find((e) => e._id === Number(req.query?.id)) ?? null })
    }
    if (!isAuthed(req)) return res.status(401).json({ error: 'Unauthenticated' })
    await ensureSchema()
    const id = Number(req.query?.id)
    if (req.method === 'PUT') {
      await updateEvent(id, req.body ?? {})
      return res.status(200).json({ ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteEvent(id)
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
