import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEvents, deleteEvent } from '../data/eventsSource'

const ADMIN_PASSWORD = 'ieee2026'

export default function AdminPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_auth')
    if (stored === ADMIN_PASSWORD) setAuthed(true)
    else setLoading(false)
  }, [])

  useEffect(() => {
    if (!authed) return
    loadEvents()
  }, [authed])

  async function loadEvents() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEvents()
      setEvents(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', password)
      setAuthed(true)
    }
  }

  function confirmDelete(ev) {
    setDeleteTarget(ev)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setError(null)
    try {
      await deleteEvent(deleteTarget._id)
      setDeleteTarget(null)
      loadEvents()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-surface" style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div className="card p-6 md:p-8">
              <h1 className="text-xl font-bold mb-1">Admin Login</h1>
              <p className="text-sm text-on-surface-variant mb-6">Enter the admin password to manage events.</p>
              <label htmlFor="admin-pw" className="form-label">Password</label>
              <input
                id="admin-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input mb-4"
                autoFocus
              />
              <button type="submit" className="btn btn-primary w-full">Login</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface" style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manage Events</h1>
            <p className="text-sm text-on-surface-variant mt-1">{events.length} events</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/events/new')} className="btn btn-primary text-xs">
              + New Event
            </button>
            <button onClick={loadEvents} className="btn btn-secondary text-xs" disabled={loading}>
              Refresh
            </button>
            <button onClick={handleLogout} className="btn btn-ghost text-xs">Logout</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-3 pr-4 font-semibold">Title</th>
                  <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Date</th>
                  <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Category</th>
                  <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 pr-4 font-medium">{ev.title}</td>
                    <td className="py-3 pr-4 text-on-surface-variant hidden sm:table-cell whitespace-nowrap">
                      {new Date(ev.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant hidden md:table-cell">
                      {ev.categoryLabel}
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      <span className={'text-xs font-bold uppercase tracking-wider ' + (ev.status === 'upcoming' ? 'text-primary' : 'text-on-surface-variant')}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/admin/events/' + ev._id + '/edit')} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                        <button onClick={() => confirmDelete(ev)} className="text-xs font-semibold text-error hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4"
               onClick={() => setDeleteTarget(null)}>
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-6 md:p-8 max-w-sm w-full"
                 onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Delete Event</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.title}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary text-sm">Cancel</button>
                <button onClick={handleDelete} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
