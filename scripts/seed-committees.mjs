import { committees } from '../src/data/committees.js'
import { boardMembers } from '../src/data/boardMembers.js'

const DB_URL = process.env.TURSO_DATABASE_URL
if (!DB_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars.')
  process.exit(1)
}
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN

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
  if (item?.type === 'error') throw new Error(item.response.error.message)
  const result = item?.response?.result
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

const aliasMap = {
  AI: 'ai',
  Automation: 'automations',
  CS: 'cs',
  DS: 'ds',
  Embedded: 'embedded',
  HR: 'hr-td',
  Marketing: 'marketing',
  'Multi Media': 'multi-media',
  OC: 'pr-oc',
  PR: 'pr-oc',
  Robotic: 'robotics',
  'T&D': 'hr-td',
  Web: 'web',
}

await execute(`CREATE TABLE IF NOT EXISTS committees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT
)`)
await execute(`CREATE TABLE IF NOT EXISTS committee_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  committee_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  img TEXT
)`)

const junk = await execute("DELETE FROM committees WHERE name = 'askjd'")
console.log('removed junk test committee rows:', junk?.affected_row_count ?? 0)

let created = 0
for (const c of committees) {
  const res = await execute(
    'INSERT OR IGNORE INTO committees (name, slug, category, short_description) VALUES (?, ?, ?, ?)',
    [c.name, c.slug, c.category, c.shortDescription]
  )
  if (res?.last_insert_rowid) created++
}
console.log(`committees: ${created} created, ${committees.length} total in data`)

const rows = (await execute('SELECT id, slug FROM committees')).rows
const idBySlug = Object.fromEntries(rows.map(r => [r.slug, Number(r.id)]))

let added = 0
const skipped = []
for (const m of boardMembers) {
  const slug = aliasMap[m.committee]
  if (!slug) {
    skipped.push(`${m.name} (committee: "${m.committee}")`)
    continue
  }
  const existing = await execute('SELECT id FROM committee_members WHERE committee_id = ? AND name = ?', [idBySlug[slug], m.name])
  if (existing?.rows?.length) continue
  await execute(
    'INSERT INTO committee_members (committee_id, name, position, email, phone, img) VALUES (?, ?, ?, ?, ?, ?)',
    [idBySlug[slug], m.name, m.position || '', m.email || '', m.phone || '', m.img || '']
  )
  added++
}
console.log(`members: ${added} added, ${boardMembers.length} in data`)
if (skipped.length) console.log('skipped (no matching committee):', skipped.join(' | '))

for (const [slug, id] of Object.entries(idBySlug)) {
  const counts = await execute('SELECT COUNT(*) AS n FROM committee_members WHERE committee_id = ?', [id])
  console.log(`  ${slug}: ${counts.rows[0].n} members`)
}