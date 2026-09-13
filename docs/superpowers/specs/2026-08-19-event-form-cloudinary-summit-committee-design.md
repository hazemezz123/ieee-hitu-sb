# Event Form: Cloudinary Cover Upload, Summit Category, Optional Organizer Committee

Date: 2026-08-19
Status: Approved

## Goal

Improve the admin "New Event / Edit Event" form (`src/pages/EventFormPage.jsx`):

1. Cover image uploads to Cloudinary with file picker, URL paste, and preview.
2. Add "Summit" to the event category dropdown.
3. Organizer Committee becomes an optional dropdown of real committees.

## Context

- `src/lib/upload.js` already exposes `uploadToCloudinary(file)` used by the Gallery and Committees admin tabs.
- `src/pages/admin/PhotoInput.jsx` already provides the file + URL + preview pattern; reuse it as-is.
- `src/data/committeeSource.js` exports `fetchCommittees()` with a static fallback.
- `organizer_committee` is already nullable in Turso (`data.organizerCommittee || null` in `src/lib/turso.js`), and the event card/detail pages already render it conditionally.
- Category labels are auto-capitalized from the stored value (`capitalize()` in `src/lib/turso.js`), so `summit` displays as "Summit" with no other changes.

## Changes

### 1. Cover upload (`src/pages/EventFormPage.jsx`)

- Add local `file` state.
- Replace the "Cover Image URL" text input with `PhotoInput` (import from `./admin/PhotoInput`), passing:
  - `id="event-cover-image"`
  - `file` / `setFile` (new state)
  - `url={form.coverImage}` / `setUrl={u => setForm({ ...form, coverImage: u })}`
- In `handleSave`, before calling `createEvent`/`updateEvent`:
  - If `file` is set, `const coverImage = await uploadToCloudinary(file)` and use it; otherwise keep `form.coverImage.trim()`.
  - Upload failures throw and surface in the existing error banner (do not create/update the event).
- No database or schema changes.

### 2. Summit category (`src/pages/EventFormPage.jsx`)

- Add `{ value: 'summit', label: 'Summit' }` to the `categories` array.

### 3. Organizer Committee dropdown (`src/pages/EventFormPage.jsx`)

- Load committees on mount with `fetchCommittees` from `../data/committeeSource`.
- Replace the text input with a `<select id="event-organizer">`:
  - First option: empty value labeled "None" (optional).
  - Remaining options: committee `name` values, `value` = name.
  - Label reads "Organizer Committee (optional)".
- Store the committee name (the string the card and detail pages already render), so no display code changes.
- Edit hydration: preselect `ev.organizerCommittee`; if the saved name is not among the loaded committees, append it as an extra option so it is never silently dropped.
- If committees fail to load, keep the select usable (empty option only) — saving with "None" is still valid.

### 4. Tests

New `src/pages/EventFormPage.test.jsx` (none exists today), following the mock style of `src/pages/admin/galleryTab.test.jsx`:

- Renders the Summit option in the category dropdown.
- Selecting a cover file uploads via `uploadToCloudinary` and the returned URL is passed to `createEvent`.
- Pasting a URL (no file) skips upload and passes the URL directly.
- Upload failure shows an error and does not call `createEvent`.
- Committee dropdown lists fetched committees with "None" first.
- Saving with "None" passes `organizerCommittee: null` to `createEvent`.
- Edit mode hydrates the committee select from the event.

## Out of Scope

- No changes to public pages, `EventsPage` filters (they derive from data), Turso schema, or static fallback events.
- No multi-select committees per event (existing data stores a single name).