// src/features/recruitment/components/HeadsApplicationForm.test.jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HeadsApplicationForm from './HeadsApplicationForm'

globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult: async () => ({ committees: Array.from({ length: 13 }, (_, i) => ({ slug: `c${i}`, name: `Committee ${i}` })), source: 'remote' }) }))

describe('HeadsApplicationForm', () => {
  it('walks 4 steps with file-only uploads and applying-as + committee', async () => {
    render(<HeadsApplicationForm />)
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    // No Drive links anymore
    expect(screen.queryByLabelText(/drive link/i)).toBeNull()

    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '0100' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.change(screen.getByLabelText(/Academic Year/), { target: { value: '2nd' } })
    const photoInput = document.getElementById('heads-photoFile')
    const cvInput = document.getElementById('heads-cvFile')
    fireEvent.change(photoInput, { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(cvInput, { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()

    // Applying-as select
    const applyingAs = screen.getByRole('combobox', { name: /You are applying as/ })
    fireEvent.click(applyingAs)
    fireEvent.click(screen.getByRole('option', { name: 'Manager' }))
    expect(screen.getByRole('combobox', { name: /You are applying as/ }).textContent).toMatch(/Manager/)

    // Single committee select (no 1st/2nd preference)
    expect(screen.queryByRole('combobox', { name: /1st preference/ })).toBeNull()
    const committee = screen.getByRole('combobox', { name: /^Committee$/ })
    fireEvent.click(committee)
    expect(screen.getAllByRole('option').length).toBe(13)
    fireEvent.click(screen.getByRole('option', { name: 'Committee 0' }))
    expect(screen.getByRole('combobox', { name: /^Committee$/ }).textContent).toMatch(/Committee 0/)

    fireEvent.change(screen.getByLabelText(/Why do you want to apply as a head/), { target: { value: 'I want to lead' } })
    fireEvent.change(screen.getByLabelText(/technical experience/), { target: { value: '2 years' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()

    // Previous member conditional + free-text activities (no yes/no activities select)
    expect(screen.queryByRole('combobox', { name: /Any student activities experience/ })).toBeNull()
    const prev = screen.getByRole('combobox', { name: /previous IEEE HITU member/ })
    fireEvent.click(prev)
    fireEvent.click(screen.getByRole('option', { name: 'No' }))
    fireEvent.change(screen.getByLabelText(/Student activity experience/), { target: { value: 'Volunteered' } })
    fireEvent.change(screen.getByLabelText(/Weekly commit hours/), { target: { value: '6' } })
    fireEvent.change(screen.getByLabelText(/Why do you want to join IEEE HITU/), { target: { value: 'Learn' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 4\/4/)).toBeTruthy()
    expect(screen.getByLabelText(/Notes/)).toBeTruthy()
  })

  it('requires committee name + position when previous member is yes', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '0100' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.change(screen.getByLabelText(/Academic Year/), { target: { value: '2nd' } })
    fireEvent.change(document.getElementById('heads-photoFile'), { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: /You are applying as/ }))
    fireEvent.click(screen.getByRole('option', { name: 'Head' }))
    fireEvent.click(screen.getByRole('combobox', { name: /^Committee$/ }))
    fireEvent.click(screen.getByRole('option', { name: 'Committee 1' }))
    fireEvent.change(screen.getByLabelText(/Why do you want to apply as a head/), { target: { value: 'Lead' } })
    fireEvent.change(screen.getByLabelText(/technical experience/), { target: { value: 'Exp' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: /previous IEEE HITU member/ }))
    fireEvent.click(screen.getByRole('option', { name: 'Yes' }))
    expect(screen.getByLabelText(/Committee name/)).toBeTruthy()
    expect(screen.getByLabelText(/Position/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Student activity experience/), { target: { value: 'x' } })
    fireEvent.change(screen.getByLabelText(/Weekly commit hours/), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText(/Why do you want to join IEEE HITU/), { target: { value: 'y' } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    // Should stay on step 3 because committee name + position are required
    expect(screen.getByText(/Step 3\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/Committee name/i)
  })
})
