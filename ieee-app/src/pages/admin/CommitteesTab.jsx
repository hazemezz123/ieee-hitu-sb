import { useCallback, useEffect, useState } from 'react'
import {
  createCommittee,
  createCommitteeMember,
  deleteCommittee,
  deleteCommitteeMember,
  fetchCommitteeMembers,
  fetchCommittees,
  updateCommittee,
  updateCommitteeMember,
} from '../../lib/turso'
import { uploadToCloudinary } from '../../lib/upload'
import { slugify } from '../../lib/slugify'
import PhotoInput from './PhotoInput'

const emptyCommittee = { name: '', slug: '', category: 'technical', shortDescription: '' }
const emptyMember = { name: '', position: '', email: '', phone: '', img: '' }

export default function CommitteesTab() {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [committeeForm, setCommitteeForm] = useState(null)
  const [memberForm, setMemberForm] = useState(null)
  const [memberFile, setMemberFile] = useState(null)
  const [memberUrl, setMemberUrl] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCommittees(await fetchCommittees())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget load
  useEffect(() => { load() }, [load])

  async function saveCommittee(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (committeeForm._id) {
        await updateCommittee(committeeForm._id, committeeForm)
      } else {
        await createCommittee({ ...committeeForm, slug: committeeForm.slug || slugify(committeeForm.name) })
      }
      setCommitteeForm(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  function openMembers(committee) {
    setError(null)
    setSelected(committee)
    setMemberForm(null)
    setMemberFile(null)
    setMemberUrl('')
  }

  async function saveMember(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const img = memberFile ? await uploadToCloudinary(memberFile) : memberUrl.trim()
      if (memberForm._id) {
        await updateCommitteeMember(memberForm._id, { ...memberForm, img })
      } else {
        await createCommitteeMember(selected._id, { ...memberForm, img })
      }
      setMemberForm(null)
      setMemberFile(null)
      setMemberUrl('')
      setSelected({ ...selected })
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
      if (deleteTarget.kind === 'committee') {
        await deleteCommittee(deleteTarget.item._id)
        setSelected(null)
      } else {
        await deleteCommitteeMember(deleteTarget.item._id)
        setSelected({ ...selected })
      }
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const confirmDialog = deleteTarget && (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={() => setDeleteTarget(null)}>
      <div className="card shadow-xl p-6 md:p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-2">{deleteTarget.kind === 'committee' ? 'Delete Committee' : 'Delete Member'}</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          {deleteTarget.kind === 'committee'
            ? <>Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.item.name}</span>? Its members will also be deleted. This cannot be undone.</>
            : <>Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.item.name}</span>? This cannot be undone.</>}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="btn bg-error text-white text-sm hover:bg-error/90">Delete</button>
        </div>
      </div>
    </div>
  )

  if (selected) {
    return (
      <>
        <MemberManager
          committee={selected}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
          memberFile={memberFile}
          setMemberFile={setMemberFile}
          memberUrl={memberUrl}
          setMemberUrl={setMemberUrl}
          saving={saving}
          error={error}
          setError={setError}
          onBack={() => { setSelected(null); setMemberForm(null) }}
          onSave={saveMember}
          onDelete={item => setDeleteTarget({ kind: 'member', item })}
        />
        {confirmDialog}
      </>
    )
  }

  if (committeeForm) {
    return (
      <form onSubmit={saveCommittee} className="max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {committeeForm._id ? 'Edit Committee' : 'New Committee'}
          </h2>
          <button type="button" onClick={() => setCommitteeForm(null)} className="btn btn-ghost text-xs">Cancel</button>
        </div>
        {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
        <label className="form-label" htmlFor="committee-name">Name</label>
        <input
          id="committee-name"
          className="form-input mb-4"
          value={committeeForm.name}
          required
          onChange={e => setCommitteeForm({ ...committeeForm, name: e.target.value })}
          onBlur={e => {
            if (!committeeForm._id && !committeeForm.slug) setCommitteeForm({ ...committeeForm, slug: slugify(e.target.value) })
          }}
        />
        <label className="form-label" htmlFor="committee-slug">Slug</label>
        <input
          id="committee-slug"
          className="form-input mb-4"
          value={committeeForm.slug}
          required
          onChange={e => setCommitteeForm({ ...committeeForm, slug: e.target.value })}
        />
        <label className="form-label" htmlFor="committee-category">Category</label>
        <select
          id="committee-category"
          className="form-select mb-4"
          value={committeeForm.category}
          onChange={e => setCommitteeForm({ ...committeeForm, category: e.target.value })}
        >
          <option value="technical">Technical</option>
          <option value="non-technical">Non-Technical</option>
        </select>
        <label className="form-label" htmlFor="committee-desc">Short Description</label>
        <textarea
          id="committee-desc"
          className="form-input mb-4"
          rows={3}
          value={committeeForm.shortDescription}
          onChange={e => setCommitteeForm({ ...committeeForm, shortDescription: e.target.value })}
        />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Committee'}
        </button>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Manage Committees</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {committees.length} {committees.length === 1 ? 'committee' : 'committees'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCommitteeForm({ ...emptyCommittee })} className="btn btn-primary text-xs">+ New Committee</button>
          <button onClick={load} className="btn btn-secondary text-xs" disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}

      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="pb-3 pr-4 font-semibold">Name</th>
              <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Category</th>
              <th className="pb-3 pr-4 font-semibold hidden md:table-cell">Members</th>
              <th className="pb-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {committees.map(committee => (
              <tr key={committee._id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="py-3 pr-4 font-medium">{committee.name}</td>
                <td className="py-3 pr-4 text-on-surface-variant hidden sm:table-cell">{committee.categoryLabel}</td>
                <td className="py-3 pr-4 text-on-surface-variant hidden md:table-cell">
                  {committee.memberCount} {committee.memberCount === 1 ? 'member' : 'members'}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openMembers(committee)} className="btn btn-ghost text-xs">Members</button>
                    <button onClick={() => setCommitteeForm({ ...committee })} className="btn btn-ghost text-xs">Edit</button>
                    <button onClick={() => setDeleteTarget({ kind: 'committee', item: committee })} className="btn btn-ghost text-xs text-error">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {confirmDialog}
    </div>
  )
}

function MemberManager({
  committee, memberForm, setMemberForm, memberFile, setMemberFile,
  memberUrl, setMemberUrl, saving, error, setError, onBack, onSave, onDelete,
}) {
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  useEffect(() => {
    let active = true
    fetchCommitteeMembers(committee._id)
      .then(list => { if (active) setMembers(list) })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoadingMembers(false) })
    return () => { active = false }
  }, [committee, setError])

  if (memberForm) {
    return (
      <form onSubmit={onSave} className="max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {memberForm._id ? 'Edit Member' : 'New Member'} — {committee.name}
          </h2>
          <button type="button" onClick={() => setMemberForm(null)} className="btn btn-ghost text-xs">Cancel</button>
        </div>
        {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
        <label className="form-label" htmlFor="member-name">Member Name</label>
        <input id="member-name" className="form-input mb-4" value={memberForm.name} required onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
        <label className="form-label" htmlFor="member-position">Position</label>
        <input id="member-position" className="form-input mb-4" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} placeholder="Head, Vice Head, ..." />
        <label className="form-label" htmlFor="member-email">Email</label>
        <input id="member-email" type="email" className="form-input mb-4" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
        <label className="form-label" htmlFor="member-phone">Phone</label>
        <input id="member-phone" className="form-input mb-4" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />
        <label className="form-label" htmlFor="member-photo">Photo</label>
        <PhotoInput id="member-photo" file={memberFile} setFile={setMemberFile} url={memberUrl} setUrl={setMemberUrl} />
        <button type="submit" className="btn btn-primary mt-4" disabled={saving}>
          {saving ? 'Saving...' : 'Save Member'}
        </button>
      </form>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="btn btn-ghost text-xs mb-2">← All committees</button>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{committee.name} — Members</h2>
          <p className="text-sm text-on-surface-variant mt-1">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
        </div>
        <button onClick={() => setMemberForm({ ...emptyMember })} className="btn btn-primary text-xs">+ New Member</button>
      </div>

      {error && <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}

      {loadingMembers ? (
        <div className="text-center py-16 text-on-surface-variant">Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">No members yet.</div>
      ) : (
        <ul className="divide-y divide-outline-variant/20 border-t border-outline-variant/20">
          {members.map(member => (
            <li key={member._id} className="flex items-center gap-4 py-4">
              {member.img && <img src={member.img} alt="" className="h-12 w-12 rounded-full object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-on-surface-variant">{member.position || '—'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMemberForm({ ...member })} className="btn btn-ghost text-xs">Edit</button>
                <button onClick={() => onDelete(member)} className="btn btn-ghost text-xs text-error">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
