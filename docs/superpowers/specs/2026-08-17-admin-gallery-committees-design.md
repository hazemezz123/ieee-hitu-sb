# Admin Dashboard: Gallery Photos + Committee Management — Design

Date: 2026-08-17
Status: Approved

## Goal

Extend the existing admin dashboard (currently events-only) so admins can:

1. Add/delete standalone gallery photos (file upload → Cloudinary → stored URL + caption).
2. Add/edit/delete committees and their members.

All data persists in the existing Turso database, mirroring how events are managed today.

## Current state (context)

- `src/lib/turso.js` — raw SQL wrapper over Turso pipeline API. Events CRUD only. Schema is remote-only, no migration files.
- `src/pages/AdminPage.jsx` — password gate (`sessionStorage.admin_auth`), events table with New/Edit/Delete.
- Gallery page aggregates per-event `gallery` arrays (Cloudinary URLs, `{src, caption}` shape).
- Committees static in `src/data/committees.js`; members static in `src/data/boardMembers.js`.
- Images use Cloudinary account `dweqigxnz`; member photos use Google Drive links via `gDriveImg()`.

## Schema (new tables, Turso)

```sql
CREATE TABLE IF NOT EXISTS gallery_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  src TEXT NOT NULL,
  caption TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS committees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,          -- 'technical' | 'non-technical'
  short_description TEXT
);

CREATE TABLE IF NOT EXISTS committee_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  committee_id INTEGER NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  img TEXT
);
```

Tables are created lazily: `ensureSchema()` runs `CREATE TABLE IF NOT EXISTS` for all three before any admin operation (and is safe to call repeatedly).

## Photo upload

- Cloudinary unsigned upload preset (admin creates once, e.g. named `ieee_uploads`).
- Browser POSTs `FormData { file, upload_preset, folder: 'ieee-admin' }` to `https://api.cloudinary.com/v1_1/dweqigxnz/image/upload`; store returned `secure_url`.
- One shared helper `uploadToCloudinary(file)` in `src/lib/upload.js`, used by gallery and member photo inputs.
- Fallback: if upload fails, the form still accepts a pasted image URL.

## Data layer (`src/lib/turso.js` additions)

- `ensureSchema()`
- `fetchGalleryPhotos()`, `addGalleryPhoto(src, caption)`, `deleteGalleryPhoto(id)`
- `fetchCommittees()`, `fetchCommitteeBySlug(slug)`, `createCommittee(data)`, `updateCommittee(id, data)`, `deleteCommittee(id)`
- `fetchCommitteeMembers(committeeId)`, `createCommitteeMember(committeeId, data)`, `updateCommitteeMember(id, data)`, `deleteCommitteeMember(id)`
- `fetchAllMembers()` — for committee detail pages keyed by slug.
- Committee `memberCount` derived from member rows; `categoryLabel` derived like events (`category` → capitalized).

## Admin UI

`AdminPage.jsx` gains tabs: **Events | Gallery | Committees** (same password gate; tabs render conditionally, events tab is the current table unchanged).

### Gallery tab
- Upload form: file input (accept="image/*") + caption input + Add button. Shows thumbnail preview before upload. Error message on failure with fallback URL field.
- Grid/list of existing photos: thumbnail, caption, date, Delete button (confirm, matching existing delete-modal pattern).

### Committees tab
- List of committees: name, category, member count, Edit / Delete buttons, New Committee button.
- Committee form (inline or modal): name, category select (technical / non-technical), short description. Slug auto-generated from name (lowercase, dashes), editable.
- Clicking a committee (or its Manage button) opens member manager for that committee:
  - Members list: photo, name, position, email, phone, Edit / Delete.
  - Member form: name, position, email, phone, photo (file upload with URL fallback).
- Delete committee warns that its members are deleted too (cascade).

## Public pages

Follow the `eventsSource.js` pattern (Turso first, static fallback on fetch failure):

- `GalleryPage.jsx` — merge `fetchGalleryPhotos()` with existing `aggregateGallery(events)`; standalone photos appear first, same masonry/lightbox rendering (`src`, `caption` shape compatible).
- `CommitteesPage.jsx` — use `fetchCommittees()` with fallback to `src/data/committees.js`.
- `CommitteeDetailPage.jsx` — use `fetchCommitteeBySlug()` + members (DB) with fallback to static `boardMembers.js` lookup.

## Files touched

- `src/lib/turso.js` — schema bootstrap + CRUD (extend existing file)
- `src/lib/upload.js` — NEW, Cloudinary upload helper
- `src/pages/AdminPage.jsx` — tab shell; events table stays in place
- `src/pages/admin/GalleryTab.jsx` — NEW
- `src/pages/admin/CommitteesTab.jsx` — NEW (committee list + member manager)
- `src/pages/GalleryPage.jsx`, `CommitteesPage.jsx`, `CommitteeDetailPage.jsx` — DB-first reads
- Spec + tests for new logic

## Error handling

- Any Turso fetch failure on public pages → static fallback (existing pattern).
- Admin mutations surface error text inline in the form.
- Upload failure → error message + URL-paste fallback remains usable.

## Testing

- Follow existing Vitest + Testing Library setup in `src/pages/*.test.jsx`.
- Unit: slug generation, row→object mapping for new tables, gallery merge order.
- Component: gallery tab upload/delete flow, committee CRUD flow (mock `turso.js`).

## Cloudinary setup (one-time, manual)

In Cloudinary dashboard → Settings → Upload → presets → Add preset:
- Name: `ieee_uploads`
- Signing mode: **Unsigned**
- (Optional) Restrict file types to images.

The `cloud_name` (`dweqigxnz`) is read from existing event image URLs; hardcode in `upload.js` next to the preset name.