import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchEvents, createEvent, updateEvent } from '../data/eventsSource'
import { fetchCommittees } from '../data/committeeSource'
import { slugify } from '../lib/slugify'
import Skeleton from '../components/Skeleton'

const categories = [
  { value: 'workshops', label: 'Workshops' },
  { value: 'conferences', label: 'Conferences' },
  { value: 'competitions', label: 'Competitions' },
  { value: 'social', label: 'Social' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'summit', label: 'Summit' },
]

const emptyForm = {
  title: '', slug: '', date: '', endDate: '', location: '', category: 'workshops',
  coverImage: '', excerpt: '', description: '', gallery: '[]', organizerCommittee: '',
}

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [galleryError, setGalleryError] = useState(null)
  const [hydratedId, setHydratedId] = useState(null)
  const [committees, setCommittees] = useState([])

  const isEdit = Boolean(id)
  const editLoading = isEdit && hydratedId !== id

  const committeeOptions = form.organizerCommittee && !committees.some(c => c.name === form.organizerCommittee)
    ? [...committees, { name: form.organizerCommittee }]
    : committees

  useEffect(() => {
    if (!isEdit) return
    let active = true
    async function load() {
      try {
        const events = await fetchEvents()
        if (!active) return
        const ev = events.find(e => e._id === Number(id))
        if (!ev) {
          setError('Event not found')
          setHydratedId(id)
          return
        }
        setForm({
          title: ev.title,
          slug: ev.slug,
          date: ev.date ? ev.date.slice(0, 16) : '',
          endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
          location: ev.location,
          category: ev.category,
          coverImage: ev.coverImage,
          excerpt: ev.excerpt,
          description: ev.description,
          gallery: JSON.stringify(ev.gallery, null, 2),
          organizerCommittee: ev.organizerCommittee || '',
        })
        setHydratedId(id)
      } catch (err) {
        if (active) {
          setError(err.message)
          setHydratedId(id)
        }
      }
    }
    load()
    return () => { active = false }
  }, [id, isEdit])

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

    const data = { ...form, endDate: form.endDate || null, gallery, organizerCommittee: form.organizerCommittee || null }

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

  return (
    <div className="min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <button onClick={() => navigate('/admin')} className="btn btn-ghost text-sm mb-6">&larr; Back to Admin</button>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{isEdit ? 'Edit Event' : 'New Event'}</h1>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>
        )}

        {editLoading && (
          <div role="status" className="mb-6 space-y-4">
            <span className="sr-only">Loading event data...</span>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}

        <form onSubmit={handleSave}>
          <fieldset disabled={editLoading} className="space-y-4 border-0 p-0 m-0">
          <div>
            <label htmlFor="event-title" className="form-label">Title</label>
            <input id="event-title" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                   onBlur={e => { if (!isEdit && !form.slug) setForm({ ...form, slug: slugify(e.target.value) }) }} required />
          </div>
          <div>
            <label htmlFor="event-slug" className="form-label">Slug</label>
            <input id="event-slug" className="form-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-date" className="form-label">Date</label>
              <input id="event-date" type="datetime-local" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="event-end-date" className="form-label">End Date</label>
              <input id="event-end-date" type="datetime-local" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-location" className="form-label">Location</label>
              <input id="event-location" className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="event-category" className="form-label">Category</label>
              <select id="event-category" className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="event-cover-image" className="form-label">Cover Image URL</label>
            <input id="event-cover-image" className="form-input" value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
          </div>
          <div>
            <label htmlFor="event-excerpt" className="form-label">Excerpt</label>
            <textarea id="event-excerpt" className="form-textarea" style={{ minHeight: '60px' }} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label htmlFor="event-description" className="form-label">Description</label>
            <textarea id="event-description" className="form-textarea" style={{ minHeight: '100px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="event-gallery" className="form-label">Gallery (JSON array)</label>
            <textarea id="event-gallery" className="form-textarea font-mono text-xs" style={{ minHeight: '80px' }} value={form.gallery} onChange={e => { setForm({ ...form, gallery: e.target.value }); setGalleryError(null) }} aria-describedby={galleryError ? 'event-gallery-error' : undefined} aria-invalid={Boolean(galleryError)} />
            {galleryError && <p id="event-gallery-error" className="mt-2 text-sm text-error">{galleryError}</p>}
          </div>
          <div>
            <label htmlFor="event-organizer" className="form-label">Organizer Committee (optional)</label>
            <select id="event-organizer" className="form-select" value={form.organizerCommittee} onChange={e => setForm({ ...form, organizerCommittee: e.target.value })}>
              <option value="">None</option>
              {committeeOptions.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary">{isEdit ? 'Update Event' : 'Create Event'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Cancel</button>
          </div>
          </fieldset>
        </form>
      </div>
    </div>
  )
}
