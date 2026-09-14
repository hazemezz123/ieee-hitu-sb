'use client'
export default function ApplicationDetail({ application, onClose, onDelete }) {
  const d = application?.data || {}
  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Address', d.address], ['Photo', d.photoUrl], ['University', d.university], ['Major', d.major], ['Academic Year', d.academicYear], ['Grade', d.grade], ['Board Interest', d.boardInterest], ['Role', d.role], ['1st Preference', d.firstPref], ['2nd Preference', d.secondPref], ['Experience', d.experience], ['Activities', d.activities], ['Activities Details', d.activitiesDetails], ['Weekly Hours', d.weeklyHours], ['Why Join', d.whyJoin], ['Links', d.links], ['CV', d.cvUrl], ['Notes', d.notes], ['Submitted', application?.createdAt]]
  return (
    <div role="dialog" aria-label={`Application ${application?._id}`} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black">Application #{application?._id}</h3>
        <button className="btn btn-ghost text-xs" onClick={onClose}>Close</button>
      </div>
      <dl className="flex flex-col gap-3">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{k}</dt>
            <dd className="mt-1 text-sm break-words">{(k === 'Photo' || k === 'CV') && v ? <a className="text-primary underline" href={v} target="_blank" rel="noreferrer">{v}</a> : (v || '—')}</dd></div>
        ))}
      </dl>
      <button className="btn btn-ghost text-xs text-error mt-6" onClick={onDelete}>Delete application</button>
    </div>
  )
}
