// src/lib/recruitmentValidation.test.js
import { describe, expect, it } from 'vitest'
import { HEADS_CSV_COLUMNS, validateHeadsApplication, validateHeadsStep } from './recruitmentValidation'

describe('validateHeadsApplication', () => {
  const valid = {
    name: 'HITU Student', email: 'student@hitu.edu.eg', phone: '01001234567',
    address: '', photoUrl: '', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    cvUrl: 'https://cloudinary.com/cv.pdf', links: '',
    applyingAs: 'member', committee: 'ai', whyHead: '',
    experience: '2 years in AI.', prevMember: '', prevCommittee: '', prevPosition: '',
    studentActivities: '', weeklyHours: '6',
    whyJoin: '', notes: '',
  }
  it('accepts a valid minimal payload', () => {
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
  it('requires applyingAs to be head, vice-head, manager, or member', () => {
    expect(validateHeadsApplication({ ...valid, applyingAs: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'yes' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'manager' }).ok).toBe(true)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'member' }).ok).toBe(true)
    expect(validateHeadsApplication({ ...valid, applyingAs: 'head' }).ok).toBe(true)
  })
  it('requires academicYear to be 1st, 2nd, 3rd, or 4th', () => {
    expect(validateHeadsApplication({ ...valid, academicYear: '' })).toEqual({ ok: false, field: 'academicYear', error: 'Choose your academic year.' })
    expect(validateHeadsApplication({ ...valid, academicYear: 'second' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, academicYear: '3rd' }).ok).toBe(true)
  })
  it('treats photo, grade, links, whyHead, history, and notes as optional', () => {
    expect(validateHeadsApplication({ ...valid, photoUrl: '', grade: 'A+', links: 'not-a-url', whyHead: '', prevMember: '', prevCommittee: '', prevPosition: '', studentActivities: '', whyJoin: '', notes: 'hi' })).toEqual({ ok: true })
  })
  it('requires committee, experience, and weekly hours', () => {
    expect(validateHeadsApplication({ ...valid, committee: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, experience: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, weeklyHours: '' }).ok).toBe(false)
  })
  it('requires university, major, and cv', () => {
    expect(validateHeadsApplication({ ...valid, university: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, major: '' }).ok).toBe(false)
    expect(validateHeadsApplication({ ...valid, cvUrl: '' }).ok).toBe(false)
  })
  it('skips upload checks with skipUploads for pre-upload fail-fast', () => {
    expect(validateHeadsApplication({ ...valid, cvUrl: '' }, { skipUploads: true })).toEqual({ ok: true })
    expect(validateHeadsApplication({ ...valid, email: 'not-an-email', cvUrl: '' }, { skipUploads: true })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
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
    address: '', photoUrl: '', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    cvUrl: 'https://cloudinary.com/cv.pdf', links: '',
    applyingAs: 'member', committee: 'ai', whyHead: '',
    experience: '2 years in AI.', prevMember: '', prevCommittee: '', prevPosition: '',
    studentActivities: '', weeklyHours: '6',
    whyJoin: '', notes: '',
  }
  it('accepts each step of a valid minimal payload', () => {
    expect(validateHeadsStep(0, valid)).toEqual({ ok: true })
    expect(validateHeadsStep(1, valid)).toEqual({ ok: true })
  })
  it('gates step 0 on contact formats and cv URL', () => {
    expect(validateHeadsStep(0, { ...valid, email: 'bad' })).toEqual({ ok: false, field: 'email', error: 'Enter a valid email address.' })
    expect(validateHeadsStep(0, { ...valid, phone: 'abc' })).toEqual({ ok: false, field: 'phone', error: 'Enter a valid phone number.' })
    expect(validateHeadsStep(0, { ...valid, cvUrl: 'not-a-url' })).toEqual({ ok: false, field: 'cvUrl', error: 'CV upload failed. Try again.' })
  })
  it('skips URL checks for freshly picked files', () => {
    expect(validateHeadsStep(0, { ...valid, cvUrl: '' }, { hasCvFile: true })).toEqual({ ok: true })
  })
  it('checks only its own step fields', () => {
    expect(validateHeadsStep(1, { ...valid, email: 'bad', committee: '' })).toEqual({ ok: false, field: 'committee', error: 'Choose a committee.' })
    expect(validateHeadsStep(1, { ...valid, weeklyHours: 'lots' })).toEqual({ ok: false, field: 'weeklyHours', error: 'Enter valid weekly hours (e.g. 6).' })
  })
  it('accepts member, head, vice-head, and manager without whyHead', () => {
    for (const applyingAs of ['member', 'head', 'vice-head', 'manager']) {
      expect(validateHeadsStep(1, { ...valid, applyingAs, whyHead: '' })).toEqual({ ok: true })
    }
  })
})
