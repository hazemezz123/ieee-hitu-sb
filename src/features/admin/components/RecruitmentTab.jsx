'use client'
import { useCallback, useEffect, useState } from 'react'
import { deleteApplication, fetchApplication, fetchApplications, fetchRecruitmentForms, updateRecruitmentForm } from '@/lib/recruitment'
import { fetchCommittees } from '@/lib/turso'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import ApplicationDetail from './ApplicationDetail'
import Select from '@/components/ui/Select'

export default function RecruitmentTab() {
  const [forms, setForms] = useState([])
  const [apps, setApps] = useState([])
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [pref, setPref] = useState('')
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      setForms(await fetchRecruitmentForms())
      setApps(await fetchApplications('heads', { q: search, pref }))
      if (committees.length === 0) setCommittees(await fetchCommittees().catch(() => []))
    } catch (err) { setError(err.message) }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pref])

  useEffect(() => { load() }, [load])

  async function toggle(form) {
    const next = !form.isOpen
    setForms(fs => fs.map(f => f.slug === form.slug ? { ...f, isOpen: next } : f))
    try { await updateRecruitmentForm(form.slug, { isOpen: next }) }
    catch (err) { setForms(fs => fs.map(f => f.slug === form.slug ? { ...f, isOpen: !next } : f)); setError(err.message) }
  }

  async function saveEdit(e) {
    e.preventDefault()
    try { await updateRecruitmentForm(editing.slug, editing); setEditing(null); await load() }
    catch (err) { setError(err.message) }
  }

  async function confirmDelete() {
    try { await deleteApplication(deleteTarget._id); setDeleteTarget(null); setSelected(null); await load() }
    catch (err) { setError(err.message) }
  }

  if (selected) return (<><button className="btn btn-ghost text-xs mb-4" onClick={() => setSelected(null)}>← All applications</button><ApplicationDetail application={selected} onClose={() => setSelected(null)} onDelete={() => setDeleteTarget(selected)} />{deleteTarget && <ConfirmDialog title="Delete Application" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>Delete application #{deleteTarget._id}? This cannot be undone.</ConfirmDialog>}</>)

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Recruitment</h2>
      {error && <div className="my-4 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
      {loading ? <div role="status"><span className="sr-only">Loading...</span><Skeleton className="h-10 w-full" /><Skeleton className="mt-2 h-40 w-full" /></div> : <>
        {forms.map(f => (
          <div key={f.slug} className="card p-4 my-4 flex items-center justify-between gap-4">
            <div><p className="font-bold">{f.title}</p><p className="text-sm text-on-surface-variant">{f.isOpen ? 'Open' : 'Closed'}</p></div>
            <div className="flex gap-2">
              <button role="switch" aria-checked={f.isOpen} aria-label={`${f.title} open switch`} className={f.isOpen ? 'btn btn-primary text-xs' : 'btn btn-secondary text-xs'} onClick={() => toggle(f)}>{f.isOpen ? 'Open — click to close' : 'Closed — click to open'}</button>
              <button className="btn btn-ghost text-xs" onClick={() => setEditing({ ...f })}>Edit</button>
            </div>
          </div>
        ))}
        {editing && <form onSubmit={saveEdit} className="card p-4 my-4"><label className="form-label" htmlFor="rec-title">Title<input id="rec-title" className="form-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-desc">Description<textarea id="rec-desc" className="form-textarea" rows={2} value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-closed-title">Closed title<input id="rec-closed-title" className="form-input" value={editing.closedTitle || ''} onChange={e => setEditing({ ...editing, closedTitle: e.target.value })} /></label><label className="form-label mt-3" htmlFor="rec-closed-msg">Closed message<textarea id="rec-closed-msg" className="form-textarea" rows={2} value={editing.closedMessage || ''} onChange={e => setEditing({ ...editing, closedMessage: e.target.value })} /></label><div className="mt-3 flex gap-2"><button className="btn btn-primary text-xs" type="submit">Save</button><button className="btn btn-ghost text-xs" type="button" onClick={() => setEditing(null)}>Cancel</button></div></form>}
        <div className="my-4 flex flex-wrap gap-3">
          <input className="form-input max-w-xs" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search applications" />
          <Select id="rec-pref-filter" ariaLabel="Filter by preference" className="max-w-xs" value={pref} onChange={setPref} placeholder="All preferences" options={[{ value: '', label: 'All preferences' }, ...committees.map(c => ({ value: c.slug, label: c.name }))]} />
          <button className="btn btn-secondary text-xs" onClick={load}>Refresh</button>
          <a className="btn btn-ghost text-xs" href="/api/recruitment/applications/export?form=heads">Export CSV</a>
        </div>
        {apps.length === 0 ? <div className="text-center py-16 text-on-surface-variant">No applications yet.</div> : (
          <table className="w-full text-sm"><thead><tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant"><th className="pb-3 pr-4">Name</th><th className="pb-3 pr-4 hidden sm:table-cell">Committee</th><th className="pb-3 pr-4 hidden md:table-cell">Email</th><th className="pb-3">Actions</th></tr></thead>
            <tbody>{apps.map(a => <tr key={a._id} className="border-b border-outline-variant/10"><td className="py-3 pr-4 font-medium">{a.name}</td><td className="py-3 pr-4 hidden sm:table-cell">{a.committee || a.firstPref || '—'}</td><td className="py-3 pr-4 hidden md:table-cell">{a.email}</td><td className="py-3"><div className="flex gap-2"><button className="btn btn-ghost text-xs" onClick={async () => setSelected(await fetchApplication(a._id))}>View</button><button className="btn btn-ghost text-xs text-error" onClick={() => setDeleteTarget(a)}>Delete</button></div></td></tr>)}</tbody></table>
        )}
      </>}
      {deleteTarget && !selected && <ConfirmDialog title="Delete Application" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}>Delete application #{deleteTarget._id}? This cannot be undone.</ConfirmDialog>}
    </div>
  )
}
