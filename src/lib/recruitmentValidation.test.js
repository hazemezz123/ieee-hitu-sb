// src/lib/recruitmentValidation.test.js
import { describe, expect, it } from 'vitest'
import { HEADS_CSV_COLUMNS, validateHeadsApplication } from './recruitmentValidation'

describe('validateHeadsApplication', () => {
  const valid = {
    name: 'HITU Student', email: 'student@hitu.edu.eg', phone: '01001234567',
    address: '', photoUrl: 'https://drive.google.com/x', university: 'HITU',
    major: 'Engineering', academicYear: '2nd', grade: '',
    boardInterest: 'yes', role: 'Vice Head', firstPref: 'ai', secondPref: '',
    experience: '', activities: 'no', activitiesDetails: '', weeklyHours: '6',
    whyJoin: 'I want to learn and serve.', links: '', cvUrl: 'https://drive.google.com/cv', notes: '',
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
  it('requires role when boardInterest is yes', () => {
    expect(validateHeadsApplication({ ...valid, role: '' }).ok).toBe(false)
  })
  it('requires activitiesDetails when activities is yes', () => {
    expect(validateHeadsApplication({ ...valid, activities: 'yes', activitiesDetails: '' })).toEqual({ ok: false, field: 'activitiesDetails', error: 'Tell us about your activities.' })
  })
  it('requires photoUrl and cvUrl', () => {
    expect(validateHeadsApplication({ ...valid, photoUrl: '', cvUrl: '' }).ok).toBe(false)
  })
  it('exposes 23 CSV columns starting with id and created_at', () => {
    expect(HEADS_CSV_COLUMNS[0]).toBe('id')
    expect(HEADS_CSV_COLUMNS[1]).toBe('created_at')
    expect(HEADS_CSV_COLUMNS.length).toBe(23)
  })
})
