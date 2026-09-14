// src/lib/recruitmentValidation.js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUrl(value) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

export const HEADS_FIELD_KEYS = ['name','email','phone','address','photoUrl','university','major','academicYear','grade','boardInterest','role','firstPref','secondPref','experience','activities','activitiesDetails','weeklyHours','whyJoin','links','cvUrl','notes']

export const HEADS_CSV_COLUMNS = ['id','created_at',...HEADS_FIELD_KEYS]

export function validateHeadsApplication(data = {}) {
  const v = pick => String(data[pick] ?? '').trim()
  if (!v('name')) return { ok: false, field: 'name', error: 'Name is required.' }
  if (!EMAIL_RE.test(v('email'))) return { ok: false, field: 'email', error: 'Enter a valid email address.' }
  if (!v('phone')) return { ok: false, field: 'phone', error: 'Phone number is required.' }
  if (v('photoUrl') && !isUrl(v('photoUrl'))) return { ok: false, field: 'photoUrl', error: 'Photo link must be a valid URL.' }
  if (!v('photoUrl')) return { ok: false, field: 'photoUrl', error: 'Add a personal photo or a Drive link.' }
  if (!v('university')) return { ok: false, field: 'university', error: 'University is required.' }
  if (!v('major')) return { ok: false, field: 'major', error: 'Major is required.' }
  if (!v('academicYear')) return { ok: false, field: 'academicYear', error: 'Academic year is required.' }
  if (!['yes','no'].includes(v('boardInterest'))) return { ok: false, field: 'boardInterest', error: 'Choose yes or no.' }
  if (v('boardInterest') === 'yes' && !v('role')) return { ok: false, field: 'role', error: 'Role is required for board applicants.' }
  if (!v('firstPref')) return { ok: false, field: 'firstPref', error: 'Choose your 1st preference.' }
  if (!['yes','no'].includes(v('activities'))) return { ok: false, field: 'activities', error: 'Choose yes or no.' }
  if (v('activities') === 'yes' && !v('activitiesDetails')) return { ok: false, field: 'activitiesDetails', error: 'Tell us about your activities.' }
  if (!v('weeklyHours')) return { ok: false, field: 'weeklyHours', error: 'Weekly hours are required.' }
  if (!v('whyJoin')) return { ok: false, field: 'whyJoin', error: 'Tell us why you want to join.' }
  if (v('links') && !v('links').split(',').map(s => s.trim()).filter(Boolean).every(isUrl)) return { ok: false, field: 'links', error: 'Links must be valid URLs separated by commas.' }
  if (!v('cvUrl')) return { ok: false, field: 'cvUrl', error: 'Add your CV or a Drive link.' }
  if (v('cvUrl') && !isUrl(v('cvUrl'))) return { ok: false, field: 'cvUrl', error: 'CV link must be a valid URL.' }
  return { ok: true }
}
