// src/lib/recruitmentValidation.js
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isUrl(value) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

export const APPLYING_AS_OPTIONS = ['head', 'vice-head', 'manager', 'member']

export const ACADEMIC_YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th']

export const GRADE_OPTIONS = ['excellent', 'very-good', 'good', 'pass']

export const HEADS_FIELD_KEYS = ['name','email','phone','address','photoUrl','university','major','academicYear','grade','cvUrl','links','applyingAs','committee','whyHead','experience','prevMember','prevCommittee','prevPosition','studentActivities','weeklyHours','whyJoin','notes']

export const HEADS_CSV_COLUMNS = ['id','created_at',...HEADS_FIELD_KEYS]

export function validateHeadsStep(step, data = {}, { hasCvFile = false } = {}) {
  const v = pick => String(data[pick] ?? '').trim()
  if (step === 0) {
    if (!v('name')) return { ok: false, field: 'name', error: 'Name is required.' }
    if (!EMAIL_RE.test(v('email'))) return { ok: false, field: 'email', error: 'Enter a valid email address.' }
    if (!v('phone')) return { ok: false, field: 'phone', error: 'Phone number is required.' }
    const digits = v('phone').replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 15) return { ok: false, field: 'phone', error: 'Enter a valid phone number.' }
    if (!v('university')) return { ok: false, field: 'university', error: 'University is required.' }
    if (!v('major')) return { ok: false, field: 'major', error: 'Major is required.' }
    if (!ACADEMIC_YEAR_OPTIONS.includes(v('academicYear'))) return { ok: false, field: 'academicYear', error: 'Choose your academic year.' }
    if (!hasCvFile) {
      if (!v('cvUrl')) return { ok: false, field: 'cvUrl', error: 'Upload your CV.' }
      if (!isUrl(v('cvUrl'))) return { ok: false, field: 'cvUrl', error: 'CV upload failed. Try again.' }
    }
    return { ok: true }
  }
  if (step === 1) {
    if (!APPLYING_AS_OPTIONS.includes(v('applyingAs'))) return { ok: false, field: 'applyingAs', error: 'Choose what you are applying as.' }
    if (!v('committee')) return { ok: false, field: 'committee', error: 'Choose a committee.' }
    if (!v('experience')) return { ok: false, field: 'experience', error: 'Tell us about your technical experience.' }
    if (!v('weeklyHours')) return { ok: false, field: 'weeklyHours', error: 'Weekly hours are required.' }
    if (!/\d/.test(v('weeklyHours'))) return { ok: false, field: 'weeklyHours', error: 'Enter valid weekly hours (e.g. 6).' }
    return { ok: true }
  }
  return { ok: true }
}

export function validateHeadsApplication(data = {}, { skipUploads = false } = {}) {
  const files = skipUploads ? { hasCvFile: true } : {}
  for (const step of [0, 1]) {
    const check = validateHeadsStep(step, data, files)
    if (!check.ok) return check
  }
  return { ok: true }
}
