// src/lib/recruitmentValidation.test.js
import { describe, expect, it } from 'vitest'
import { HEADS_CSV_COLUMNS, validateHeadsApplication, validateHeadsStep } from './recruitmentValidation'

describe('validateHeadsApplication', () => {
  const valid = {
    name: 'HITU Student', email: 'student@hitu.edu.eg', phone: '01001234567',
    address: '', photoUrl: 'https://cloudinary.com/photo.jpg', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    cvUrl: 'https://cloudinary.com/cv.pdf', links: 'https://linkedin.com/in/x',
    applyingAs: 'head', committee: 'ai', whyHead: 'I want to lead.',
    experience: '2 years in AI.', prevMember: 'no', prevCommittee: '', prevPosition: '',
    studentActivities: 'Volunteered in events.', weeklyHours: '6',
    whyJoin: 'I want to learn and serve.', notes: '',
  }
  it('accepts a valid payload', () => {
    expect(validateHeadsApplication(valid)).toEqual({ ok: true })
  })
  it('rejects missing name with field', () => {
    expect(validateHeadsApplication({ ...valid, name: ' ' })).toEqual({ ok: false, field: 'name', error: 'Name is required.' })
  })
  it('rejects bad email', () => {
    expect(validateHeadsApplication({ ...valid, email: 'not-an-email' })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
  })
  it('rejects phone numbers without 7-15 digits', () => {
    expect(validateHeadsApplication({ ...valid, phone: 'abc' })).toEqual({ ok: false, field: 'phone', error: 'Enter a valid phone number.' })
    expect(validateHeadsApplication({ ...valid, phone: '0100' })).toEqual({ ok: false, field: 'phone', error: 'Enter a valid phone number.' })
    expect(validateHeadsApplication({ ...valid, phone: '+20 100 123 4567' }).ok).toBe(true)
  })
  it('rejects weekly hours without a number', () => {
    expect(validateHeadsApplication({ ...valid, weeklyHours: 'a lot' })).toEqual({ ok: false, field: 'weeklyHours', error: 'Enter valid weekly hours (e.g. 6).' })
  })
  it('requires applyingAs to be head, vice-head, or manager', () => {
    expect(validateHeadsApplication({ ...valid, applyingAs: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'yes' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'manager' }).ok).toBe(true)
  })
  it('requires committee, whyHead, and experience', () => {
    expect(validateHeadsApplication({ ...valid, committee: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, whyHead: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, experience: '' }).ok).toBe(false)
  })
  it('requires prevCommittee/prevPosition when prevMember is yes', () => {
    expect(validateHeadsApplication({ ...valid, prevMember: 'yes', prevCommittee: '', prevPosition: '' })).toEqual({ ok: false, field: 'prevCommittee', error: 'Committee name is required.' })
    expect(validateHeadsApplication({ ...valid, prevMember: 'yes', prevCommittee: 'AI', prevPosition: '' })).toEqual({ ok: false, field: 'prevPosition', error: 'Position is required.' })
  })
  it('requires studentActivities as free text', () => {
    expect(validateHeadsApplication({ ...valid, studentActivities: '' }).ok).toBe(false)
  })
  it('requires photoUrl and cvUrl as uploads', () => {
    expect(validateHeadsApplication({ ...valid, photoUrl: '', cvUrl: '' }).ok).toBe(false)
  })
  it('skips upload checks with skipUploads for pre-upload fail-fast', () => {
    expect(validateHeadsApplication({ ...valid, photoUrl: '', cvUrl: '' }, { skipUploads: true })).toEqual({ ok: true })
    expect(validateHeadsApplication({ ...valid, email: 'not-an-email', photoUrl: '', cvUrl: '' }, { skipUploads: true })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
  })
  it('exposes CSV columns starting with id and created_at', () => {
    expect(HEADS_CSV_COLUMNS[0]).toBe('id')
    expect(HEADS_CSV_COLUMNS[1]).toBe('created_at')
    expect(HEADS_CSV_COLUMNS).toContain('applyingAs')
    expect(HEADS_CSV_COLUMNS).toContain('committee')
    expect(HEADS_CSV_COLUMNS).toContain('notes')
    expect(HEADS_CSV_COLUMNS.length).toBe(24)
  })
})

describe('validateHeadsStep', () => {
  const valid = {
    name: 'HITU Student', email: 'student@hitu.edu.eg', phone: '01001234567',
    address: '', photoUrl: 'https://cloudinary.com/photo.jpg', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    cvUrl: 'https://cloudinary.com/cv.pdf', links: 'https://linkedin.com/in/x',
    applyingAs: 'head', committee: 'ai', whyHead: 'I want to lead.',
    experience: '2 years in AI.', prevMember: 'no', prevCommittee: '', prevPosition: '',
    studentActivities: 'Volunteered in events.', weeklyHours: '6',
    whyJoin: 'I want to learn and serve.', notes: '',
  }
  it('accepts each step of a valid payload', () => {
    expect(validateHeadsStep(0, valid)).toEqual({ ok: true })
    expect(validateHeadsStep(1, valid)).toEqual({ ok: true })
    expect(validateHeadsStep(2, valid)).toEqual({ ok: true })
    expect(validateHeadsStep(3, {})).toEqual({ ok: true })
  })
  it('gates step 0 on contact formats and upload URLs', () => {
    expect(validateHeadsStep(0, { ...valid, email: 'bad' })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
    expect(validateHeadsStep(0, { ...valid, phone: 'abc' })).toEqual({ ok: false, field: 'phone', error: 'Enter a valid phone number.' })
    expect(validateHeadsStep(0, { ...valid, photoUrl: 'not-a-url' })).toEqual({ ok: false, field: 'photoUrl', error: 'Photo upload failed. Try again.' })
  })
  it('skips URL checks for freshly picked files', () => {
    expect(validateHeadsStep(0, { ...valid, photoUrl: '', cvUrl: '' }, { hasPhotoFile: true, hasCvFile: true })).toEqual({ ok: true })
  })
  it('checks only its own step fields', () => {
    expect(validateHeadsStep(1, { ...valid, email: 'bad', committee: '' })).toEqual({ ok: false, field: 'committee', error: 'Choose a committee.' })
    expect(validateHeadsStep(2, { ...valid, weeklyHours: 'lots' })).toEqual({ ok: false, field: 'weeklyHours', error: 'Enter valid weekly hours (e.g. 6).' })
  })
})
