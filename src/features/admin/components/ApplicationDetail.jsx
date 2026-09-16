'use client'
function displayApplyingAs(d) {
  if (d.applyingAs) return d.applyingAs
  if (d.role) return d.role
  if (d.boardInterest === 'yes') return `Board interested (${d.role || 'role unspecified'})`
  if (d.boardInterest === 'no') return 'No (old field)'
  return ''
}

function displayCommittee(d) {
  if (d.committee) return d.committee
  return d.firstPref || ''
}

const ACADEMIC_YEAR_LABELS = { '1st': '1st Year', '2nd': '2nd Year', '3rd': '3rd Year', '4th': '4th Year' }

const GRADE_LABELS = { excellent: 'Excellent (3.5 – 4.0)', 'very-good': 'Very Good (3.0 – 3.49)', good: 'Good (2.5 – 2.99)', pass: 'Pass (2.0 – 2.49)' }

function displayAcademicYear(d) {
  return ACADEMIC_YEAR_LABELS[d.academicYear] || d.academicYear || ''
}

function displayGrade(d) {
  return GRADE_LABELS[d.grade] || d.grade || ''
}

function displayStudentActivities(d) {
  if (d.studentActivities) return d.studentActivities
  if (d.activities === 'no') return 'No (old field)'
  if (d.activities === 'yes') return d.activitiesDetails || 'Yes (old field)'
  return d.activitiesDetails || ''
}

export default function ApplicationDetail({ application, onClose, onDelete }) {
  const d = application?.data || {}
  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Address', d.address], ['Photo', d.photoUrl], ['University', d.university], ['Major', d.major], ['Academic Year', displayAcademicYear(d)], ['Grade', displayGrade(d)], ['CV', d.cvUrl], ['Social links', d.links], ['Applying as', displayApplyingAs(d)], ['Committee', displayCommittee(d)], ...(d.secondPref ? [['2nd Preference (old)', d.secondPref]] : []), ['Why apply as head', d.whyHead], ['Technical experience', d.experience], ['Previous IEEE HITU member', d.prevMember], ['Previous committee', d.prevCommittee], ['Previous position', d.prevPosition], ['Student activity experience', displayStudentActivities(d)], ['Weekly Hours', d.weeklyHours], ['Why Join', d.whyJoin], ['Notes', d.notes], ['Submitted', application?.createdAt]]
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
