const DB_URL = 'https://ieee-events-hazemezz123.aws-us-east-1.turso.io/v2/pipeline'
const DB_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODMyNzY5ODUsImlkIjoiMDE5ZjMzOTctM2QwMS03NThhLTlkMWItNWIwMmI1YmU0ZTQ5Iiwia2lkIjoiYUJMdzFWX3FNMGkxRlU5dEhiS2VMSWxoLWs5WkhSRjBiSjZyU3g4eS1OTSIsInJpZCI6ImYzMjI3MTFlLTRkMDItNGM0Zi1iMzgxLWRmNjY1NGI5NDQ4NiJ9.j4kUCa6FTs6oRcTxVnAJkbo5YHfWuMbHyD21gavDEnpAXUmwtHa-Ln0eWcx7ScLQCGXbRYNH5m2MzpJRIOSVCw'

async function execute(sql, params = []) {
  const body = {
    requests: [{
      type: 'execute',
      stmt: { sql, args: params.map(v => {
        if (v === null || v === undefined) return { type: 'null' }
        const type = typeof v === 'number' ? 'integer' : 'text'
        return { type, value: String(v) }
      }) },
    }],
  }

  const res = await fetch(DB_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const item = data.results?.[0]
  const result = item?.response?.result

  if (item?.type === 'error') {
    throw new Error(item.response.error.message)
  }

  if (result?.cols && result?.rows) {
    const colNames = result.cols.map(c => c.name)
    result.rows = result.rows.map(row => {
      const obj = {}
      colNames.forEach((name, i) => {
        const val = row[i]
        obj[name] = val !== null && val !== undefined
          ? (val.type ? (val.type === 'null' ? null : val.value) : val)
          : null
      })
      return obj
    })
  }

  return result
}

function rowToEvent(row) {
  const parsedGallery = (() => {
    try { return JSON.parse(row.gallery || '[]') } catch { return [] }
  })()

  const eventDate = new Date(row.date)
  const status = !isNaN(eventDate) && eventDate > new Date() ? 'upcoming' : 'past'

  const cat = typeof row.category === 'string' ? row.category : ''
  const categoryLabel = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''

  return {
    _id: Number(row.id) || 0,
    title: typeof row.title === 'string' ? row.title : String(row.title || ''),
    slug: typeof row.slug === 'string' ? row.slug : String(row.slug || ''),
    date: row.date || '',
    endDate: row.end_date || null,
    location: typeof row.location === 'string' ? row.location : String(row.location || ''),
    category: cat,
    categoryLabel,
    coverImage: row.cover_image || '',
    excerpt: row.excerpt || '',
    description: row.description || '',
    gallery: parsedGallery,
    organizerCommittee: row.organizer_committee || null,
    status,
  }
}

export async function fetchEvents() {
  const result = await execute('SELECT * FROM events ORDER BY date DESC')
  const rows = result?.rows || []
  return rows.map(rowToEvent)
}

export async function fetchEventBySlug(slug) {
  const result = await execute('SELECT * FROM events WHERE slug = ?', [slug])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToEvent(rows[0]) : null
}

export async function createEvent(data) {
  const result = await execute(
    `INSERT INTO events (title, slug, date, end_date, location, category, cover_image, excerpt, description, gallery, organizer_committee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.slug, data.date, data.endDate || null, data.location, data.category,
     data.coverImage || '', data.excerpt || '', data.description || '', JSON.stringify(data.gallery || []),
     data.organizerCommittee || null]
  )
  return result?.last_insert_rowid
}

export async function updateEvent(id, data) {
  await execute(
    `UPDATE events SET title = ?, slug = ?, date = ?, end_date = ?, location = ?, category = ?,
     cover_image = ?, excerpt = ?, description = ?, gallery = ?, organizer_committee = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [data.title, data.slug, data.date, data.endDate || null, data.location, data.category,
     data.coverImage || '', data.excerpt || '', data.description || '', JSON.stringify(data.gallery || []),
     data.organizerCommittee || null, id]
  )
}

export async function deleteEvent(id) {
  await execute('DELETE FROM events WHERE id = ?', [id])
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS gallery_photos (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     src TEXT NOT NULL,
     caption TEXT,
     created_at TEXT DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS committees (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     category TEXT NOT NULL,
     short_description TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS committee_members (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     committee_id INTEGER NOT NULL,
     name TEXT NOT NULL,
     position TEXT,
     email TEXT,
     phone TEXT,
     img TEXT
   )`,
]

export async function ensureSchema() {
  for (const sql of SCHEMA_STATEMENTS) await execute(sql)
}

function rowToPhoto(row) {
  return {
    _id: Number(row.id) || 0,
    src: row.src || '',
    caption: row.caption || '',
    createdAt: row.created_at || '',
  }
}

function rowToCommittee(row) {
  const cat = typeof row.category === 'string' ? row.category : ''
  return {
    _id: Number(row.id) || 0,
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    category: cat,
    categoryLabel: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : '',
    shortDescription: row.short_description || '',
    memberCount: Number(row.member_count) || 0,
  }
}

function rowToMember(row) {
  const member = {
    _id: Number(row.id) || 0,
    committeeId: Number(row.committee_id) || 0,
    name: String(row.name || ''),
    position: row.position || '',
    email: row.email || '',
    phone: row.phone || '',
    img: row.img || '',
  }
  if (row.committee_name !== undefined && row.committee_name !== null) {
    member.committee = row.committee_name
  }
  return member
}

export async function fetchGalleryPhotos() {
  const result = await execute('SELECT * FROM gallery_photos ORDER BY id DESC')
  return (result?.rows || []).map(rowToPhoto)
}

export async function addGalleryPhoto(src, caption) {
  const result = await execute('INSERT INTO gallery_photos (src, caption) VALUES (?, ?)', [src, caption || ''])
  return result?.last_insert_rowid
}

export async function deleteGalleryPhoto(id) {
  await execute('DELETE FROM gallery_photos WHERE id = ?', [id])
}

export async function fetchCommittees() {
  const result = await execute(
    `SELECT c.*, COUNT(m.id) AS member_count
     FROM committees c LEFT JOIN committee_members m ON m.committee_id = c.id
     GROUP BY c.id ORDER BY c.name`
  )
  return (result?.rows || []).map(rowToCommittee)
}

export async function fetchCommitteeBySlug(slug) {
  const result = await execute('SELECT * FROM committees WHERE slug = ?', [slug])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToCommittee(rows[0]) : null
}

export async function createCommittee(data) {
  const result = await execute(
    'INSERT INTO committees (name, slug, category, short_description) VALUES (?, ?, ?, ?)',
    [data.name, data.slug, data.category, data.shortDescription || '']
  )
  return result?.last_insert_rowid
}

export async function updateCommittee(id, data) {
  await execute(
    'UPDATE committees SET name = ?, slug = ?, category = ?, short_description = ? WHERE id = ?',
    [data.name, data.slug, data.category, data.shortDescription || '', id]
  )
}

export async function deleteCommittee(id) {
  await execute('DELETE FROM committee_members WHERE committee_id = ?', [id])
  await execute('DELETE FROM committees WHERE id = ?', [id])
}

export async function fetchCommitteeMembers(committeeId) {
  const result = await execute('SELECT * FROM committee_members WHERE committee_id = ? ORDER BY id', [committeeId])
  return (result?.rows || []).map(rowToMember)
}

export async function fetchAllMembers() {
  const result = await execute(
    `SELECT m.*, c.name AS committee_name
     FROM committee_members m JOIN committees c ON c.id = m.committee_id
     ORDER BY m.id`
  )
  return (result?.rows || []).map(rowToMember)
}

export async function createCommitteeMember(committeeId, data) {
  const result = await execute(
    'INSERT INTO committee_members (committee_id, name, position, email, phone, img) VALUES (?, ?, ?, ?, ?, ?)',
    [committeeId, data.name, data.position || '', data.email || '', data.phone || '', data.img || '']
  )
  return result?.last_insert_rowid
}

export async function updateCommitteeMember(id, data) {
  await execute(
    'UPDATE committee_members SET name = ?, position = ?, email = ?, phone = ?, img = ? WHERE id = ?',
    [data.name, data.position || '', data.email || '', data.phone || '', data.img || '', id]
  )
}

export async function deleteCommitteeMember(id) {
  await execute('DELETE FROM committee_members WHERE id = ?', [id])
}
