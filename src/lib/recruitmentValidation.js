// src/lib/recruitmentValidation.js
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUrl(value) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

export const APPLYING_AS_OPTIONS = ['head', 'vice-head', 'manager']

export const HEADS_FIELD_KEYS = ['name','email','phone','address','photoUrl','university','major','academicYear','grade','cvUrl','links','applyingAs','committee','whyHead','experience','prevMember','prevCommittee','prevPosition','studentActivities','weeklyHours','whyJoin','notes']

export const HEADS_CSV_COLUMNS = ['id','created_at',...HEADS_FIELD_KEYS]

export function validateHeadsApplication(data = {}) {
  const v = pick => String(data[pick] ?? '').trim()
  if (!v('name')) return { ok: false, field: 'name', error: 'Name is required.' }
  if (!EMAIL_RE.test(v('email'))) return { ok: false, field: 'email', error: 'Enter a valid email address.' }
  if (!v('phone')) return { ok: false, field: 'phone', error: 'Phone number is required.' }
  if (!v('photoUrl')) return { ok: false, field: 'photoUrl', error: 'Upload a personal photo.' }
  if (v('photoUrl') && !isUrl(v('photoUrl'))) return { ok: false, field: 'photoUrl', error: 'Photo upload failed. Try again.' }
  if (!v('university')) return { ok: false, field: 'university', error: 'University is required.' }
  if (!v('major')) return { ok: false, field: 'major', error: 'Major is required.' }
  if (!v('academicYear')) return { ok: false, field: 'academicYear', error: 'Academic year is required.' }
  if (!v('cvUrl')) return { ok: false, field: 'cvUrl', error: 'Upload your CV.' }
  if (v('cvUrl') && !isUrl(v('cvUrl'))) return { ok: false, field: 'cvUrl', error: 'CV upload failed. Try again.' }
  if (v('links') && !v('links').split(',').map(s => s.trim()).filter(Boolean).every(isUrl)) return { ok: false, field: 'links', error: 'Links must be valid URLs separated by commas.' }
  if (!APPLYING_AS_OPTIONS.includes(v('applyingAs'))) return { ok: false, field: 'applyingAs', error: 'Choose what you are applying as.' }
  if (!v('committee')) return { ok: false, field: 'committee', error: 'Choose a committee.' }
  if (!v('whyHead')) return { ok: false, field: 'whyHead', error: 'Tell us why you want to apply as head.' }
  if (!v('experience')) return { ok: false, field: 'experience', error: 'Tell us about your technical experience.' }
  if (!['yes','no'].includes(v('prevMember'))) return { ok: false, field: 'prevMember', error: 'Choose yes or no.' }
  if (v('prevMember') === 'yes' && !v('prevCommittee')) return { ok: false, field: 'prevCommittee', error: 'Committee name is required.' }
  if (v('prevMember') === 'yes' && !v('prevPosition')) return { ok: false, field: 'prevPosition', error: 'Position is required.' }
  if (!v('studentActivities')) return { ok: false, field: 'studentActivities', error: 'Tell us about your student activity experience.' }
  if (!v('weeklyHours')) return { ok: false, field: 'weeklyHours', error: 'Weekly hours are required.' }
  if (!v('whyJoin')) return { ok: false, field: 'whyJoin', error: 'Tell us why you want to join.' }
  return { ok: true }
}
