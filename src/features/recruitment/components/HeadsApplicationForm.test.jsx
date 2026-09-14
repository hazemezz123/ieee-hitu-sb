// src/features/recruitment/components/HeadsApplicationForm.test.jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HeadsApplicationForm from './HeadsApplicationForm'

globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult: async () => ({ committees: Array.from({ length: 13 }, (_, i) => ({ slug: `c${i}`, name: `Committee ${i}` })), source: 'remote' }) }))

describe('HeadsApplicationForm', () => {
  it('walks 4 steps and requires role only for board applicants', async () => {
    render(<HeadsApplicationForm />)
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '0100' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.change(screen.getByLabelText(/Academic Year/), { target: { value: '2nd' } })
    fireEvent.change(screen.getByLabelText(/personal photo.*link/i), { target: { value: 'https://drive.google.com/p' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    const first = screen.getByRole('combobox', { name: /1st preference/ })
    fireEvent.click(first)
    expect(screen.getAllByRole('option').length).toBe(13)
  })
})
