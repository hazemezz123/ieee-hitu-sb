import { fetchCommitteeBySlug } from '../_lib/turso.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const committee = await fetchCommitteeBySlug(String(req.query?.slug ?? ''))
    return res.status(200).json({ committee })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
