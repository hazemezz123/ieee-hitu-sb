// src/lib/recruitmentValidation.test.js
import { describe, expect, it } from 'vitest'
import { HEADS_CSV_COLUMNS, validateHeadsApplication } from './recruitmentValidation'

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
  it('exposes CSV columns starting with id and created_at', () => {
    expect(HEADS_CSV_COLUMNS[0]).toBe('id')
    expect(HEADS_CSV_COLUMNS[1]).toBe('created_at')
    expect(HEADS_CSV_COLUMNS).toContain('applyingAs')
    expect(HEADS_CSV_COLUMNS).toContain('committee')
    expect(HEADS_CSV_COLUMNS).toContain('notes')
    expect(HEADS_CSV_COLUMNS.length).toBe(24)
  })
})
