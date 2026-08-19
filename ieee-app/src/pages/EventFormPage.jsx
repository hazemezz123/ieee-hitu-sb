import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchEvents, createEvent, updateEvent } from '../data/eventsSource'
import { fetchCommittees } from '../data/committeeSource'
import { uploadToCloudinary } from '../lib/upload'
import { slugify } from '../lib/slugify'
import PhotoInput from './admin/PhotoInput'
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
  coverImage: '', description: '', gallery: [], organizerCommittee: '',
}

const normalizeGallery = items => (items || []).map(item => typeof item === 'string'
  ? { src: item, caption: '' }
  : { src: item.src || '', caption: item.caption || '' })

export default function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [hydratedId, setHydratedId] = useState(null)
  const [committees, setCommittees] = useState([])
  const [file, setFile] = useState(null)
  const [galleryFile, setGalleryFile] = useState(null)
  const [galleryUrl, setGalleryUrl] = useState('')
  const [galleryCaption, setGalleryCaption] = useState('')

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
          gallery: normalizeGallery(ev.gallery),
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

  function handleAddGalleryImage() {
    if (!galleryFile && !galleryUrl.trim()) return
    const src = galleryUrl.trim() || URL.createObjectURL(galleryFile)
    setForm({ ...form, gallery: [...form.gallery, { src, caption: galleryCaption.trim(), ...(galleryFile ? { file: galleryFile } : {}) }] })
    setGalleryFile(null)
    setGalleryUrl('')
    setGalleryCaption('')
  }

  function handleRemoveGalleryImage(index) {
    const target = form.gallery[index]
    if (target.src.startsWith('blob:')) URL.revokeObjectURL(target.src)
    setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== index) })
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(null)

    let coverImage = form.coverImage.trim()
    if (file) {
      try {
        coverImage = await uploadToCloudinary(file)
      } catch (err) {
        setError(err.message)
        return
      }
    }

    const gallery = []
    for (const item of form.gallery) {
      if (!item.file) {
        gallery.push({ src: item.src, caption: item.caption || '' })
        continue
      }
      try {
        gallery.push({ src: await uploadToCloudinary(item.file), caption: item.caption || '' })
      } catch (err) {
        setError(err.message)
        return
      }
    }

    const data = { ...form, endDate: form.endDate || null, gallery, coverImage, organizerCommittee: form.organizerCommittee || null }

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
            <label htmlFor="event-cover-image" className="form-label">Cover Image</label>
            <PhotoInput id="event-cover-image" file={file} setFile={setFile} url={form.coverImage} setUrl={u => setForm({ ...form, coverImage: u })} />
          </div>
          <div>
            <label htmlFor="event-description" className="form-label">Description</label>
            <textarea id="event-description" className="form-textarea" style={{ minHeight: '100px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="event-gallery-photo" className="form-label">Gallery Image</label>
            <PhotoInput id="event-gallery-photo" file={galleryFile} setFile={setGalleryFile} url={galleryUrl} setUrl={setGalleryUrl} />
            <label htmlFor="event-gallery-caption" className="form-label mt-4">Caption (optional)</label>
            <input id="event-gallery-caption" className="form-input" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} />
            <button type="button" className="btn btn-secondary mt-4" disabled={!galleryFile && !galleryUrl.trim()} onClick={handleAddGalleryImage}>Add Image</button>
            {form.gallery.length > 0 && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {form.gallery.map((item, index) => (
                  <li key={`${item.src}:${index}`} className="card flex items-center gap-3 p-3">
                    <img src={item.src} alt={item.caption || 'Gallery image'} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-on-surface">{item.caption || 'No caption'}</p>
                      <p className="truncate text-xs text-on-surface-variant">{item.src}</p>
                    </div>
                    <button type="button" className="btn btn-ghost text-xs text-error" onClick={() => handleRemoveGalleryImage(index)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
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
