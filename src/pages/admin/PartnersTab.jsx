import { useCallback, useEffect, useState } from 'react'
import { createPartner, deletePartner, fetchPartners, updatePartner } from '../../data/partnersSource'
import { uploadToCloudinary } from '../../lib/upload'
import ConfirmDialog from '../../components/ConfirmDialog'
import Skeleton from '../../components/Skeleton'
import PhotoInput from './PhotoInput'

const emptyForm = { name: '', logo: '', logoDark: false }

export default function PartnersTab() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [partnerForm, setPartnerForm] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPartners(await fetchPartners())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget load
  useEffect(() => { load() }, [load])

  function openForm(partner) {
    setError(null)
    setPartnerForm(partner ? { ...partner } : { ...emptyForm })
    setLogoFile(null)
    setLogoUrl(partner?.logo || '')
  }

  async function savePartner(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const logo = logoFile ? await uploadToCloudinary(logoFile) : logoUrl.trim()
      if (partnerForm._id) {
        await updatePartner(partnerForm._id, { ...partnerForm, logo })
      } else {
        await createPartner({ ...partnerForm, logo })
      }
      setPartnerForm(null)
      setLogoFile(null)
      setLogoUrl('')
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget || saving) return
    setError(null)
    setSaving(true)
    try {
      await deletePartner(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  if (partnerForm) {
    return (
      <form onSubmit={savePartner} className="max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {partnerForm._id ? 'Edit Partner' : 'New Partner'}
          </h2>
          <button type="button" onClick={() => setPartnerForm(null)} className="btn btn-ghost text-xs">Cancel</button>
        </div>
        {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
        <label className="form-label" htmlFor="partner-name">Name</label>
        <input
          id="partner-name"
          className="form-input mb-4"
          value={partnerForm.name}
          required
          onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
        />
        <label className="form-label" htmlFor="partner-logo">Logo</label>
        <PhotoInput
          id="partner-logo"
          file={logoFile}
          setFile={setLogoFile}
          url={logoUrl}
          setUrl={setLogoUrl}
        />
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-on-surface" htmlFor="partner-logo-dark">
          <input
            id="partner-logo-dark"
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={!!partnerForm.logoDark}
            onChange={e => setPartnerForm({ ...partnerForm, logoDark: e.target.checked })}
          />
          Dark logo background
        </label>
        <button type="submit" className="btn btn-primary mt-6" disabled={saving}>
          {saving ? 'Saving...' : 'Save Partner'}
        </button>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Partners</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {partners.length} {partners.length === 1 ? 'partner' : 'partners'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openForm(null)} className="btn btn-primary text-xs">+ New Partner</button>
          <button onClick={load} className="btn btn-secondary text-xs" disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}

      {loading ? (
        <div role="status" className="overflow-x-auto">
          <span className="sr-only">Loading...</span>
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 5 }, (_, index) => (
                <tr key={index} className="border-b border-outline-variant/10">
                  <td className="py-3 pr-4"><Skeleton className="h-4 w-40" /></td>
                  <td className="py-3"><div className="flex gap-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-16" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="pb-3 pr-4 font-semibold">Name</th>
              <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Logo</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(partner => (
              <tr key={partner._id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-3 pr-4 font-medium">{partner.name}</td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="h-10 w-24 rounded object-contain" />
                  ) : (
                    <span className="text-on-surface-variant">—</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openForm(partner)} className="btn btn-ghost text-xs">Edit</button>
                    <button onClick={() => setDeleteTarget(partner)} className="btn btn-ghost text-xs text-error">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Delete Partner" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={saving}>
          Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.name}</span>? This cannot be undone.
        </ConfirmDialog>
      )}
    </div>
  )
}