# Event Form: Cloudinary Cover, Summit Category, Committee Dropdown — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the admin event form so the cover uploads to Cloudinary with a preview, "Summit" is a category, and Organizer Committee is an optional dropdown of real committees.

**Architecture:** All changes live in `src/pages/EventFormPage.jsx` plus a new test file. Reuses the existing `PhotoInput` component and `uploadToCloudinary()` helper already used by the Gallery/Committees admin tabs. Committees come from `fetchCommittees()` in `src/data/committeeSource.js` (has static fallback). `organizer_committee` is already nullable in Turso, so no schema/DB changes.

**Tech Stack:** React 19 (function components, hooks), Vite, Vitest + Testing Library (jsdom), Tailwind (existing `form-*` classes).

---

## File Structure

- Modify: `src/pages/EventFormPage.jsx` — category list, cover upload, committee dropdown
- Create: `src/pages/EventFormPage.test.jsx` — new unit tests (none exist today)
- Modify: `src/pages/admin.test.jsx` — update two label assertions that change (line 195)

Context for all tasks:

- The form currently renders a text input labeled "Cover Image URL" (`event-cover-image`) and a text input labeled "Organizer Committee" (`event-organizer`).
- `PhotoInput` (in `src/pages/admin/PhotoInput.jsx`) renders a file input (with the `id` prop as its id), a URL text input with placeholder "Or paste an image URL", and a preview thumbnail when a file is selected. It takes props `{ id, file, setFile, url, setUrl }`.
- `uploadToCloudinary(file)` (`src/lib/upload.js`) returns a Promise resolving to a Cloudinary `secure_url` string.
- `fetchCommittees()` (`src/data/committeeSource.js`) resolves to an array of `{ _id, name, slug, category, categoryLabel, shortDescription, memberCount }`.
- Commands run from `C:\Users\Administrator\Desktop\HITU\IEEE\website\ieee-app`.

---

### Task 1: Summit category

**Files:**
- Create: `src/pages/EventFormPage.test.jsx`
- Modify: `src/pages/EventFormPage.jsx` (categories array, line 7-14)

- [ ] **Step 1: Write the failing test**

Create `src/pages/EventFormPage.test.jsx` with exactly this content (harness reused by later tasks):

```jsx
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EventFormPage from './EventFormPage'

const { fetchEvents, createEvent, updateEvent, fetchCommittees, uploadToCloudinary } = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  fetchCommittees: vi.fn(),
  uploadToCloudinary: vi.fn(),
}))

vi.mock('../data/eventsSource', () => ({ fetchEvents, createEvent, updateEvent }))
vi.mock('../data/committeeSource', () => ({ fetchCommittees }))
vi.mock('../lib/upload', () => ({ uploadToCloudinary }))

const committees = [
  { _id: 1, name: 'Web', slug: 'web', category: 'technical', categoryLabel: 'Technical', shortDescription: '', memberCount: 0 },
  { _id: 2, name: 'AI', slug: 'ai', category: 'technical', categoryLabel: 'Technical', shortDescription: '', memberCount: 0 },
]

const event = {
  _id: 7,
  title: 'Robotics Workshop',
  slug: 'robotics-workshop',
  date: '2026-09-10T10:00:00.000Z',
  endDate: '2026-09-10T12:00:00.000Z',
  location: 'Lab 1',
  category: 'workshops',
  categoryLabel: 'Workshops',
  status: 'upcoming',
  coverImage: '/robot.jpg',
  excerpt: 'Build a robot.',
  description: 'Hands-on robotics.',
  gallery: ['/one.jpg'],
  organizerCommittee: 'Web',
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchEvents.mockResolvedValue([])
  createEvent.mockResolvedValue(undefined)
  updateEvent.mockResolvedValue(undefined)
  fetchCommittees.mockResolvedValue(committees)
  uploadToCloudinary.mockResolvedValue('https://cdn/cover.jpg')
})

afterEach(cleanup)

function renderRoute(route = '/admin/events/new') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/admin/events/new" element={<EventFormPage />} />
        <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
        <Route path="/admin" element={<p>Admin</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'IEEE Summit' } })
  fireEvent.blur(screen.getByLabelText('Title'))
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01T10:00' } })
  fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Hall A' } })
}

describe('event form', () => {
  it('offers Summit in the category dropdown', () => {
    renderRoute()
    const values = [...screen.getByLabelText('Category').options].map(o => o.value)
    expect(values).toContain('summit')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: FAIL — `values` does not contain `'summit'` (options are workshops/conferences/competitions/social/orientation/outreach).

- [ ] **Step 3: Implement**

In `src/pages/EventFormPage.jsx`, change the `categories` array (lines 7-14) to:

```jsx
const categories = [
  { value: 'workshops', label: 'Workshops' },
  { value: 'conferences', label: 'Conferences' },
  { value: 'competitions', label: 'Competitions' },
  { value: 'social', label: 'Social' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'summit', label: 'Summit' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/EventFormPage.test.jsx src/pages/EventFormPage.jsx
git commit -m "feat: add Summit event category"
```

---

### Task 2: Organizer Committee dropdown

**Files:**
- Modify: `src/pages/EventFormPage.test.jsx` (add tests)
- Modify: `src/pages/EventFormPage.jsx` (imports, state, effect, form field)

- [ ] **Step 1: Write the failing tests**

Append inside the `describe('event form', ...)` block of `src/pages/EventFormPage.test.jsx` (before the closing `})`):

```jsx
  it('lists fetched committees in the organizer select with None first', async () => {
    renderRoute()
    const select = screen.getByLabelText('Organizer Committee (optional)')
    expect(await screen.findByRole('option', { name: 'Web' })).toBeTruthy()
    expect(select.options[0].value).toBe('')
    expect(select.options[0].text).toBe('None')
  })

  it('saves the selected committee name', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Organizer Committee (optional)'), { target: { value: 'Web' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ organizerCommittee: 'Web' })))
  })

  it('saves organizerCommittee as null when None is chosen', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ organizerCommittee: null })))
  })

  it('hydrates the organizer select from the event', async () => {
    fetchEvents.mockResolvedValue([event])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByDisplayValue('Robotics Workshop')).toBeTruthy()
    expect(screen.getByLabelText('Organizer Committee (optional)').value).toBe('Web')
  })

  it('keeps a saved committee that no longer exists as an extra option', async () => {
    fetchEvents.mockResolvedValue([{ ...event, organizerCommittee: 'PR & OC' }])
    renderRoute('/admin/events/7/edit')
    expect(await screen.findByRole('option', { name: 'PR & OC' })).toBeTruthy()
    expect(screen.getByLabelText('Organizer Committee (optional)').value).toBe('PR & OC')
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: FAIL — `getByLabelText('Organizer Committee (optional)')` throws (current label is "Organizer Committee" and it's a text input, not a select).

- [ ] **Step 3: Implement**

In `src/pages/EventFormPage.jsx`:

3a. Add the import (after the `Skeleton` import on line 5):

```jsx
import { fetchCommittees } from '../data/committeeSource'
```

3b. Add state (after `const [hydratedId, setHydratedId] = useState(null)` on line 27):

```jsx
const [committees, setCommittees] = useState([])
```

3c. Add a load effect (after the existing `useEffect` that ends at line 68, mirroring its active-flag pattern):

```jsx
  useEffect(() => {
    let active = true
    async function loadCommittees() {
      try {
        const items = await fetchCommittees()
        if (active) setCommittees(items)
      } catch {
        // keep the empty list; "None" remains a valid choice
      }
    }
    loadCommittees()
    return () => { active = false }
  }, [])
```

3d. Add a derived option list (after the `editLoading` const on line 30):

```jsx
  const committeeOptions = form.organizerCommittee && !committees.some(c => c.name === form.organizerCommittee)
    ? [...committees, { name: form.organizerCommittee }]
    : committees
```

3e. Replace the Organizer Committee field (lines 170-173) with:

```jsx
          <div>
            <label htmlFor="event-organizer" className="form-label">Organizer Committee (optional)</label>
            <select id="event-organizer" className="form-select" value={form.organizerCommittee} onChange={e => setForm({ ...form, organizerCommittee: e.target.value })}>
              <option value="">None</option>
              {committeeOptions.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: PASS (6 tests — 1 summit + 5 committee).

- [ ] **Step 5: Commit**

```bash
git add src/pages/EventFormPage.test.jsx src/pages/EventFormPage.jsx
git commit -m "feat: make event organizer committee an optional committee dropdown"
```

---

### Task 3: Cloudinary cover upload

**Files:**
- Modify: `src/pages/EventFormPage.test.jsx` (add tests)
- Modify: `src/pages/EventFormPage.jsx` (imports, state, handleSave, form field)

- [ ] **Step 1: Write the failing tests**

Append inside the `describe('event form', ...)` block of `src/pages/EventFormPage.test.jsx` (before the closing `})`):

```jsx
  it('uploads a chosen cover file to Cloudinary and saves its URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Cover Image'), {
      target: { files: [new File(['x'], 'cover.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(uploadToCloudinary).toHaveBeenCalledOnce())
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ coverImage: 'https://cdn/cover.jpg' })))
  })

  it('skips upload and uses a pasted cover URL', async () => {
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByPlaceholderText('Or paste an image URL'), { target: { value: 'https://cdn/pasted.jpg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    await waitFor(() => expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ coverImage: 'https://cdn/pasted.jpg' })))
    expect(uploadToCloudinary).not.toHaveBeenCalled()
  })

  it('shows upload errors and does not save', async () => {
    uploadToCloudinary.mockRejectedValueOnce(new Error('Upload failed'))
    renderRoute()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Cover Image'), {
      target: { files: [new File(['x'], 'cover.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))
    expect(await screen.findByText('Upload failed')).toBeTruthy()
    expect(createEvent).not.toHaveBeenCalled()
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: FAIL — `getByLabelText('Cover Image')` throws (current field is a text input labeled "Cover Image URL").

- [ ] **Step 3: Implement**

In `src/pages/EventFormPage.jsx`:

3a. Add imports (after the `fetchCommittees` import added in Task 2):

```jsx
import { uploadToCloudinary } from '../lib/upload'
import PhotoInput from './admin/PhotoInput'
```

3b. Add state (after `const [committees, setCommittees] = useState([])`):

```jsx
const [file, setFile] = useState(null)
```

3c. Replace `handleSave` (lines 70-94) with:

```jsx
  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setGalleryError(null)
    let gallery
    try {
      gallery = JSON.parse(form.gallery)
      if (!Array.isArray(gallery)) throw new Error()
    } catch {
      setGalleryError('Gallery must be valid JSON containing an array.')
      return
    }

    let coverImage = form.coverImage.trim()
    if (file) {
      try {
        coverImage = await uploadToCloudinary(file)
      } catch (err) {
        setError(err.message)
        return
      }
    }

    const data = { ...form, endDate: form.endDate || null, gallery, coverImage }

    try {
      if (isEdit) {
        await updateEvent(Number(id), data)
      } else {
        data.slug = data.slug || slugify(data.title)
        await createEvent(data)
      }
      navigate('/admin')
    } catch (err) { setError(err.message) }
  }
```

3d. Replace the Cover Image field (lines 153-156) with:

```jsx
          <div>
            <label htmlFor="event-cover-image" className="form-label">Cover Image</label>
            <PhotoInput id="event-cover-image" file={file} setFile={setFile} url={form.coverImage} setUrl={u => setForm({ ...form, coverImage: u })} />
          </div>
```

Note: `PhotoInput` renders the file input with `id="event-cover-image"` (matched by the label), the "Or paste an image URL" input, and a preview thumbnail when a file is picked.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/pages/EventFormPage.test.jsx`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pages/EventFormPage.test.jsx src/pages/EventFormPage.jsx
git commit -m "feat: upload event cover images to Cloudinary with preview"
```

---

### Task 4: Update existing admin tests, run full suite and lint

**Files:**
- Modify: `src/pages/admin.test.jsx` (label list at line 195)

- [ ] **Step 1: Update the label assertions**

In `src/pages/admin.test.jsx`, line 195, replace the two changed labels:

```jsx
    for (const label of ['Title', 'Slug', 'Date', 'End Date', 'Location', 'Category', 'Cover Image URL', 'Excerpt', 'Description', 'Gallery (JSON array)', 'Organizer Committee']) {
```

becomes:

```jsx
    for (const label of ['Title', 'Slug', 'Date', 'End Date', 'Location', 'Category', 'Cover Image', 'Excerpt', 'Description', 'Gallery (JSON array)', 'Organizer Committee (optional)']) {
```

No other changes needed in that file: `turso.fetchCommittees` is already mocked to resolve `[]` in its `beforeEach` (line 84-85), and `../lib/upload` is already mocked (line 31), so the form's new mount-time `fetchCommittees` call and the unused upload mock do not break existing tests.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites (admin, gallery, committees, events, records, upload, slugify, turso, presentation, etc.).

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS — no errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin.test.jsx
git commit -m "test: update event form label assertions for cover and committee"
```

---

## Self-Review Checklist

- **Spec coverage:** Cover upload (Task 3) ✓; Summit category (Task 1) ✓; committee dropdown with None + unknown-name option + hydration (Task 2) ✓; upload errors surfaced without saving (Task 3 test) ✓; tests for all spec bullets ✓.
- **Placeholder scan:** No TBD/TODO; every step has concrete code or commands.
- **Type consistency:** `fetchCommittees` always resolves `{ _id, name, ... }`; `uploadToCloudinary` always resolves a URL string; `createEvent` receives `coverImage` and `organizerCommittee` (null when empty). `PhotoInput` props (`id`, `file`, `setFile`, `url`, `setUrl`) match its existing signature.