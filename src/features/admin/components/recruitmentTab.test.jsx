// src/features/admin/components/recruitmentTab.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RecruitmentTab from './RecruitmentTab'

vi.mock('@/lib/recruitment', () => ({
  fetchRecruitmentForms: async () => [{ _id: 1, slug: 'heads', title: 'Heads', isOpen: false, description: '' }],
  fetchApplications: async () => [{ _id: 2, name: 'HITU Student', email: 's@hitu.edu.eg', firstPref: 'ai', createdAt: '2026-09-01' }],
  updateRecruitmentForm: vi.fn(),
  deleteApplication: vi.fn(),
}))

describe('RecruitmentTab', () => {
  it('shows the toggle and the applications', async () => {
    render(<RecruitmentTab />)
    expect(await screen.findByRole('switch', { name: /heads/i })).toBeTruthy()
    expect(await screen.findByText('HITU Student')).toBeTruthy()
  })
})
