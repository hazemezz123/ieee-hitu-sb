'use client'
import { useEffect, useState } from 'react'
import { submitApplication } from '@/lib/recruitment'
import { uploadToCloudinary, uploadFileToCloudinary } from '@/lib/upload'
import { validateHeadsApplication } from '@/lib/recruitmentValidation'
import { fetchCommitteesResult } from '@/features/committees/hooks/useCommittees'
import { committees as fallbackCommittees } from '@/features/committees/data/committees'
import Select, { toOptions } from '@/components/ui/Select'

const DRAFT_KEY = 'recruitment:heads:draft'
const emptyValues = { name: '', email: '', phone: '', address: '', photoUrl: '', university: '', major: '', academicYear: '', grade: '', boardInterest: '', role: '', firstPref: '', secondPref: '', experience: '', activities: '', activitiesDetails: '', weeklyHours: '', whyJoin: '', links: '', cvUrl: '', notes: '' }
const STEP_TITLES = ['Personal', 'Ambition', 'Story', 'Finish']

function loadDraft() {
  try { return { ...emptyValues, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') } } catch { return { ...emptyValues } }
}

export default function HeadsApplicationForm({ onClosed }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(loadDraft)
  const [photoFile, setPhotoFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldError, setFieldError] = useState(null)
  const [doneId, setDoneId] = useState(null)
  const [options, setOptions] = useState(fallbackCommittees)

  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)) } catch { /* private-mode storage may be unavailable; draft stays in memory */ } }, [values])
  useEffect(() => {
    let active = true
    fetchCommitteesResult().then(r => { if (active && r?.committees?.length) setOptions(r.committees) }).catch(() => { /* fallback committees stay in use */ })
    return () => { active = false }
  }, [])

  const set = key => valueOrEvent => {
    setFieldError(null)
    const next = valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent ? valueOrEvent.target.value : valueOrEvent
    setValues(v => ({ ...v, [key]: next }))
  }
  const requiredFor = s => s === 0
    ? ['name', 'email', 'phone', 'photoUrl', 'university', 'major', 'academicYear']
    : s === 1 ? ['boardInterest', 'firstPref'] : s === 2 ? ['activities', 'weeklyHours', 'whyJoin'] : ['cvUrl']

  function next() {
    setError(null)
    if (step === 0 && !photoFile && !values.photoUrl.trim()) { setFieldError({ field: 'photoUrl', error: 'Add a personal photo or a Drive link.' }); return }
    if (step === 3 && !cvFile && !values.cvUrl.trim()) { setFieldError({ field: 'cvUrl', error: 'Add your CV or a Drive link.' }); return }
    for (const key of requiredFor(step)) {
      if (key === 'photoUrl' || key === 'cvUrl') continue
      if (!String(values[key] ?? '').trim()) { setFieldError({ field: key, error: `${key} is required.` }); return }
    }
    if (step === 1 && values.boardInterest === 'yes' && !values.role.trim()) { setFieldError({ field: 'role', error: 'Role is required for board applicants.' }); return }
    if (step === 2 && values.activities === 'yes' && !values.activitiesDetails.trim()) { setFieldError({ field: 'activitiesDetails', error: 'Tell us about your activities.' }); return }
    setFieldError(null)
    setStep(s => Math.min(s + 1, 3))
  }

  async function submit(e) {
    e.preventDefault()
    setError(null); setFieldError(null); setUploading(true)
    try {
      const photoUrl = photoFile ? await uploadToCloudinary(photoFile) : values.photoUrl.trim()
      const cvUrl = cvFile ? await uploadFileToCloudinary(cvFile) : values.cvUrl.trim()
      const payload = { ...values, photoUrl, cvUrl }
      const check = validateHeadsApplication(payload)
      if (!check.ok) { setFieldError(check); setUploading(false); return }
      const id = await submitApplication('heads', payload)
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* draft already gone */ }
      setDoneId(id)
    } catch (err) {
      if (String(err.message || '').toLowerCase().includes('closed') || String(err.message || '').includes('410')) onClosed?.()
      else setError(err.message)
    }
    setUploading(false)
  }

  if (doneId) return <div role="status" className="card p-8"><h2 className="text-2xl font-black">Application recorded</h2><p className="mt-2 text-on-surface-variant">Reference #{doneId}. Thanks for your time — we will contact you if there are questions.</p></div>

  const errFor = name => fieldError?.field === name ? <p className="form-error" role="alert">{fieldError.error}</p> : null
  const input = (label, key, props = {}) => (
    <label className="form-label" htmlFor={`heads-${key}`}>{label}<input id={`heads-${key}`} className="form-input mt-2" value={values[key]} onChange={set(key)} {...props} />{errFor(key)}</label>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate={false}>
      <div><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step {step + 1}/4 — {STEP_TITLES[step]}</p>
        <div className="mt-2 h-1 bg-surface-container"><div className="h-1 bg-primary btn-wedge" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div>
      {error && <div role="alert" className="p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">{error}</div>}
      {step === 0 && <>
        {input('Full name', 'name', { required: true, type: 'text' })}
        {input('Email', 'email', { required: true, type: 'email' })}
        {input('Phone', 'phone', { required: true, type: 'tel' })}
        {input('Address', 'address')}
        <div><label className="form-label" htmlFor="heads-photoFile">Personal photo (file)</label><input id="heads-photoFile" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />{input('…or personal photo Drive link', 'photoUrl', { type: 'url', placeholder: 'https://drive.google.com/…' })}</div>
        {input('University', 'university', { required: true })}
        {input('Major', 'major', { required: true })}
        {input('Academic Year', 'academicYear', { required: true, placeholder: 'e.g. 2nd' })}
        {input('Current Academic Grade', 'grade')}
      </>}
      {step === 1 && <>
        <Select id="heads-boardInterest" label="Interested in Heads Board positions?" required value={values.boardInterest} onChange={set('boardInterest')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} placeholder="Select…" />
        {errFor('boardInterest')}
        {values.boardInterest === 'yes' && input('Role', 'role', { required: true, placeholder: 'Head / Vice-Head…' })}
        <Select id="heads-firstPref" label="1st preference" required value={values.firstPref} onChange={set('firstPref')} placeholder="Select a committee" options={toOptions(options)} />
        {errFor('firstPref')}
        <Select id="heads-secondPref" label="2nd preference" value={values.secondPref} onChange={set('secondPref')} placeholder="None" options={[{ value: '', label: 'None' }, ...toOptions(options)]} />
        <label className="form-label" htmlFor="heads-experience">Your technical experience in this committee<textarea id="heads-experience" className="form-textarea mt-2" rows={4} value={values.experience} onChange={set('experience')} /></label>
      </>}
      {step === 2 && <>
        <Select id="heads-activities" label="Any student activities experience?" required value={values.activities} onChange={set('activities')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} placeholder="Select…" />
        {errFor('activities')}
        {values.activities === 'yes' && <label className="form-label" htmlFor="heads-activitiesDetails">Tell us more about your activities<textarea id="heads-activitiesDetails" className="form-textarea mt-2" rows={4} value={values.activitiesDetails} onChange={set('activitiesDetails')} />{errFor('activitiesDetails')}</label>}
        {input('Weekly commit hours', 'weeklyHours', { required: true, placeholder: 'e.g. 6' })}
        <label className="form-label" htmlFor="heads-whyJoin">Why do you want to join IEEE HITU?<textarea id="heads-whyJoin" className="form-textarea mt-2" rows={4} required value={values.whyJoin} onChange={set('whyJoin')} />{errFor('whyJoin')}</label>
        {input('Social / professional / technical links (comma-separated)', 'links', { type: 'text', placeholder: 'https://…, https://…' })}
      </>}
      {step === 3 && <>
        <div><label className="form-label" htmlFor="heads-cvFile">CV (PDF file)</label><input id="heads-cvFile" type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} />{input('…or CV Drive link', 'cvUrl', { type: 'url', placeholder: 'https://drive.google.com/…' })}</div>
        <label className="form-label" htmlFor="heads-notes">Questions / notes<textarea id="heads-notes" className="form-textarea mt-2" rows={4} value={values.notes} onChange={set('notes')} placeholder="Thanks for your time — drop questions here and we'll contact you." /></label>
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={values.company_website || ''} onChange={set('company_website')} />
      </>}
      <div className="flex gap-3">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < 3
          ? <button type="button" className="btn btn-primary btn-wedge" onClick={next}>Continue</button>
          : <button type="submit" className="btn btn-primary btn-wedge" disabled={uploading}>{uploading ? 'Submitting…' : 'Submit application'}</button>}
        <button type="button" className="btn btn-ghost" onClick={() => { setValues({ ...emptyValues }); setPhotoFile(null); setCvFile(null); try { localStorage.removeItem(DRAFT_KEY) } catch { /* nothing to clear */ } }}>Clear</button>
      </div>
    </form>
  )
}
