// Server-only Turso client. NEVER import this from frontend code —
// it reads credentials from environment variables.
function dbUrl() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error('Turso is not configured')
  return url
}

function dbToken() {
  const token = process.env.TURSO_AUTH_TOKEN
  if (!token) throw new Error('Turso is not configured')
  return token
}

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

  const res = await fetch(dbUrl(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${dbToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const item = data.results?.[0]
  const result = item?.response?.result

  if (item?.type === 'error') {
    const message = item.response?.error?.message || item.error?.message || 'Database error'
    throw new Error(message)
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

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

function rowToEvent(row) {
  const parsedGallery = (() => {
    try { return JSON.parse(row.gallery || '[]') } catch { return [] }
  })()

  const eventDate = new Date(row.date)
  const status = !isNaN(eventDate) && eventDate > new Date() ? 'upcoming' : 'past'

  const cat = typeof row.category === 'string' ? row.category : ''
  const categoryLabel = cat ? capitalize(cat) : ''

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
    cardImage: row.card_image || '',
    excerpt: row.excerpt || '',
    description: row.description || '',
    gallery: parsedGallery,
    organizerCommittee: row.organizer_committee || null,
    eventLink: row.event_link || '',
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
    `INSERT INTO events (title, slug, date, end_date, location, category, cover_image, card_image, excerpt, description, gallery, organizer_committee, event_link)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.slug, data.date, data.endDate || null, data.location, data.category,
     data.coverImage || '', data.cardImage || '', data.excerpt || '', data.description || '', JSON.stringify(data.gallery || []),
     data.organizerCommittee || null, data.eventLink || '']
  )
  return result?.last_insert_rowid
}

export async function updateEvent(id, data) {
  await execute(
    `UPDATE events SET title = ?, slug = ?, date = ?, end_date = ?, location = ?, category = ?,
     cover_image = ?, card_image = ?, excerpt = ?, description = ?, gallery = ?, organizer_committee = ?, event_link = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [data.title, data.slug, data.date, data.endDate || null, data.location, data.category,
     data.coverImage || '', data.cardImage || '', data.excerpt || '', data.description || '', JSON.stringify(data.gallery || []),
     data.organizerCommittee || null, data.eventLink || '', id]
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
  `CREATE TABLE IF NOT EXISTS partners (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     logo TEXT,
     logo_dark INTEGER DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS recruitment_forms (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   slug TEXT UNIQUE NOT NULL,
   title TEXT NOT NULL,
   description TEXT,
   is_open INTEGER DEFAULT 0,
   closed_title TEXT,
   closed_message TEXT,
   created_at TEXT DEFAULT (datetime('now')),
   updated_at TEXT DEFAULT (datetime('now'))
 )`,
  `CREATE TABLE IF NOT EXISTS recruitment_applications (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   form_id INTEGER NOT NULL,
   data TEXT NOT NULL,
   created_at TEXT DEFAULT (datetime('now'))
 )`,
  `CREATE INDEX IF NOT EXISTS idx_recruitment_applications_form ON recruitment_applications(form_id, id DESC)`,
]

export async function ensureSchema() {
  for (const sql of SCHEMA_STATEMENTS) await execute(sql)

  const tableResult = await execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'events'")
  if ((tableResult?.rows || []).length > 0) {
    const info = await execute('PRAGMA table_info(events)')
    const columns = (info?.rows || []).map(row => row.name)
    if (!columns.includes('event_link')) {
      await execute('ALTER TABLE events ADD COLUMN event_link TEXT')
    }
    if (!columns.includes('card_image')) {
      await execute('ALTER TABLE events ADD COLUMN card_image TEXT')
    }
  }

  const partnerTableResult = await execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'partners'")
  if ((partnerTableResult?.rows || []).length > 0) {
    const info = await execute('PRAGMA table_info(partners)')
    if (!(info?.rows || []).some(row => row.name === 'logo_dark')) {
      await execute('ALTER TABLE partners ADD COLUMN logo_dark INTEGER DEFAULT 0')
    }
  }

  const headsCheck = await execute("SELECT id FROM recruitment_forms WHERE slug = 'heads'")
  if ((headsCheck?.rows || []).length === 0) {
    await execute(
      'INSERT INTO recruitment_forms (slug, title, description, is_open, closed_title, closed_message) VALUES (?, ?, ?, ?, ?, ?)',
      ['heads', 'Heads & Vice-Heads Recruitment', 'Apply to lead a committee as Head or Vice-Head.', 0, 'Recruitment is Closed', 'Heads recruitment is closed right now. Follow our events and check back for the next wave.'],
    )
  }
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
    categoryLabel: cat ? capitalize(cat) : '',
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

function rowToPartner(row) {
  return {
    _id: Number(row.id) || 0,
    name: String(row.name || ''),
    logo: row.logo || '',
    logoDark: Boolean(Number(row.logo_dark)),
  }
}

export async function fetchPartners() {
  const result = await execute('SELECT * FROM partners ORDER BY id')
  return (result?.rows || []).map(rowToPartner)
}

export async function createPartner(data) {
  const result = await execute(
    'INSERT INTO partners (name, logo, logo_dark) VALUES (?, ?, ?)',
    [data.name, data.logo || '', data.logoDark ? 1 : 0]
  )
  return result?.last_insert_rowid
}

export async function updatePartner(id, data) {
  await execute(
    'UPDATE partners SET name = ?, logo = ?, logo_dark = ? WHERE id = ?',
    [data.name, data.logo || '', data.logoDark ? 1 : 0, id]
  )
}

export async function deletePartner(id) {
  await execute('DELETE FROM partners WHERE id = ?', [id])
}

function rowToRecruitmentForm(row) {
  return {
    _id: Number(row.id) || 0,
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    description: row.description || '',
    isOpen: Number(row.is_open) === 1,
    closedTitle: row.closed_title || '',
    closedMessage: row.closed_message || '',
  }
}

function rowToRecruitmentApplication(row) {
  let data = {}
  try { data = JSON.parse(row.data || '{}') } catch { data = {} }
  return { _id: Number(row.id) || 0, formId: Number(row.form_id) || 0, data, createdAt: row.created_at || '' }
}

export async function fetchRecruitmentForms() {
  const result = await execute('SELECT * FROM recruitment_forms ORDER BY id')
  return (result?.rows || []).map(rowToRecruitmentForm)
}

export async function fetchRecruitmentFormBySlug(slug) {
  const result = await execute('SELECT * FROM recruitment_forms WHERE slug = ?', [slug])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToRecruitmentForm(rows[0]) : null
}

export async function updateRecruitmentForm(slug, patch = {}) {
  const sets = []
  const args = []
  if (patch.title !== undefined) { sets.push('title = ?'); args.push(patch.title) }
  if (patch.description !== undefined) { sets.push('description = ?'); args.push(patch.description) }
  if (patch.isOpen !== undefined) { sets.push('is_open = ?'); args.push(patch.isOpen ? 1 : 0) }
  if (patch.closedTitle !== undefined) { sets.push('closed_title = ?'); args.push(patch.closedTitle) }
  if (patch.closedMessage !== undefined) { sets.push('closed_message = ?'); args.push(patch.closedMessage) }
  sets.push("updated_at = datetime('now')")
  args.push(slug)
  await execute(`UPDATE recruitment_forms SET ${sets.join(', ')} WHERE slug = ?`, args)
}

export async function createRecruitmentApplication(formId, data) {
  const result = await execute(
    'INSERT INTO recruitment_applications (form_id, data) VALUES (?, ?)',
    [formId, JSON.stringify(data || {})],
  )
  return result?.last_insert_rowid
}

export async function fetchRecruitmentApplications(formId) {
  const result = await execute('SELECT * FROM recruitment_applications WHERE form_id = ? ORDER BY id DESC', [formId])
  return (result?.rows || []).map(rowToRecruitmentApplication)
}

export async function fetchRecruitmentApplicationById(id) {
  const result = await execute('SELECT * FROM recruitment_applications WHERE id = ?', [id])
  const rows = result?.rows || []
  return rows.length > 0 ? rowToRecruitmentApplication(rows[0]) : null
}

export async function deleteRecruitmentApplication(id) {
  await execute('DELETE FROM recruitment_applications WHERE id = ?', [id])
}
