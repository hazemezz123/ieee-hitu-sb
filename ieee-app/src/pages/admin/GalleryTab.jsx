import { useCallback, useEffect, useState } from 'react'
import { addGalleryPhoto, deleteGalleryPhoto } from '../../lib/turso'
import { uploadToCloudinary } from '../../lib/upload'
import { fetchGalleryPhotos } from '../../data/gallerySource'
import PhotoInput from './PhotoInput'

export default function GalleryTab() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPhotos(await fetchGalleryPhotos())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!file && !url.trim()) {
      setError('Choose a photo or paste an image URL.')
      return
    }
    setUploading(true)
    try {
      const src = file ? await uploadToCloudinary(file) : url.trim()
      await addGalleryPhoto(src, caption.trim())
      setCaption('')
      setFile(null)
      setUrl('')
      await load()
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setError(null)
    try {
      await deleteGalleryPhoto(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Gallery</h2>
          <p className="text-sm text-on-surface-variant mt-1">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</p>
        </div>
        <button onClick={load} className="btn btn-secondary text-xs" disabled={loading}>Refresh</button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>
      )}

      <form onSubmit={handleAdd} className="card p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Add Photo</h3>
        <label className="form-label" htmlFor="gallery-photo">Photo</label>
        <PhotoInput id="gallery-photo" file={file} setFile={setFile} url={url} setUrl={setUrl} />
        <label className="form-label mt-4" htmlFor="gallery-caption">Caption</label>
        <input
          id="gallery-caption"
          className="form-input"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-4" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Photo'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">No photos yet.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map(photo => (
            <li key={photo._id} className="card p-4">
              <img src={photo.src} alt={photo.caption || 'Gallery photo'} className="h-44 w-full rounded-lg object-cover" />
              <p className="mt-3 text-sm font-medium line-clamp-2">{photo.caption || 'No caption'}</p>
              <div className="mt-3 flex justify-end">
                <button onClick={() => setDeleteTarget(photo)} className="btn btn-ghost text-xs text-error">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="card shadow-xl p-6 md:p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Photo</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Are you sure you want to delete this photo? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary text-sm">Cancel</button>
              <button onClick={handleDelete} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}