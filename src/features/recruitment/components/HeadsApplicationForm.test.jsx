// src/features/recruitment/components/HeadsApplicationForm.test.jsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HeadsApplicationForm from './HeadsApplicationForm'

globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }

afterEach(() => { cleanup(); try { localStorage.clear() } catch { /* storage unavailable */ } })
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult: async () => ({ committees: Array.from({ length: 13 }, (_, i) => ({ slug: `c${i}`, name: `Committee ${i}` })), source: 'remote' }) }))

const { submitApplication } = vi.hoisted(() => ({ submitApplication: vi.fn() }))
vi.mock('@/lib/recruitment', () => ({ submitApplication }))

function fillStep1() {
  fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
  fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
  fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
  fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
  fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
  fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
  fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
}

describe('HeadsApplicationForm summarized', () => {
  it('walks 2 summarized steps with CV-only upload and member role', async () => {
    render(<HeadsApplicationForm />)
    expect(screen.getByText(/Step 1\/2/)).toBeTruthy()
    // Summarized: no photo, address, grade, links, notes headings
    expect(screen.queryByLabelText(/Address/)).toBeNull()
    expect(document.getElementById('heads-photoFile')).toBeNull()
    expect(screen.queryByRole('combobox', { name: /Current Academic Grade/ })).toBeNull()
    expect(screen.queryByLabelText(/Social media links/)).toBeNull()

    fillStep1()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()

    // Applying-as includes Member
    const applyingAs = screen.getByRole('combobox', { name: /You are applying as/ })
    fireEvent.click(applyingAs)
    expect(screen.getByRole('option', { name: 'Member' })).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'Member' }))

    const committee = screen.getByRole('combobox', { name: /^Committee$/ })
    fireEvent.click(committee)
    expect(screen.getAllByRole('option').length).toBe(13)
    fireEvent.click(screen.getByRole('option', { name: 'Committee 0' }))

    fireEvent.change(screen.getByLabelText(/experience/), { target: { value: '2 years' } })
    fireEvent.change(screen.getByLabelText(/Weekly commit hours/), { target: { value: '6' } })

    // Summarized: no whyHead, prev-member, activities, whyJoin, notes
    expect(screen.queryByLabelText(/Why do you want to apply as a head/)).toBeNull()
    expect(screen.queryByRole('combobox', { name: /previous IEEE HITU member/ })).toBeNull()
    expect(screen.queryByLabelText(/Student activity experience/)).toBeNull()
    expect(screen.queryByLabelText(/Why do you want to join IEEE HITU/)).toBeNull()
    expect(screen.queryByLabelText(/Notes/)).toBeNull()
  })

  it('blocks an invalid email on step 1 with a visible error', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 1\/2/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/valid email/i)
  })

  it('blocks non-numeric weekly hours on step 2 with a visible error', async () => {
    submitApplication.mockReset()
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567',
      university: 'HITU', major: 'Eng', academicYear: '2nd',
      cvUrl: 'https://cdn/cv.pdf', applyingAs: 'member', committee: 'c0',
      experience: 'Exp', weeklyHours: 'a lot',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/weekly hours/i)
  })

  it('records a fully valid summarized draft on submit', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567',
      university: 'HITU', major: 'Eng', academicYear: '2nd',
      cvUrl: 'https://cdn/cv.pdf', applyingAs: 'member', committee: 'c0',
      experience: 'Exp', weeklyHours: '5',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
  })

  it('resets the wizard to step 1 when cleared', async () => {
    render(<HeadsApplicationForm />)
    fillStep1()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }))
    expect(screen.getByText(/Step 1\/2/)).toBeTruthy()
    expect(screen.getByLabelText(/Full name/).value).toBe('')
  })

  it('allows advancing and submitting without providing a CV', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(42)
    render(<HeadsApplicationForm />)
    expect(screen.getByLabelText(/CV \(PDF file, optional\)/)).toBeTruthy()
    expect(document.getElementById('heads-cvFile').required).toBe(false)

    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'jane@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'CS' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))

    // Continue without touching CV
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()

    const applyingAs = screen.getByRole('combobox', { name: /You are applying as/ })
    fireEvent.click(applyingAs)
    fireEvent.click(screen.getByRole('option', { name: 'Member' }))

    const committee = screen.getByRole('combobox', { name: /^Committee$/ })
    fireEvent.click(committee)
    fireEvent.click(screen.getByRole('option', { name: 'Committee 0' }))

    fireEvent.change(screen.getByLabelText(/experience/), { target: { value: 'None' } })
    fireEvent.change(screen.getByLabelText(/Weekly commit hours/), { target: { value: '4' } })

    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))

    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
    expect(submitApplication).toHaveBeenCalledWith('heads', expect.objectContaining({
      name: 'Jane Doe',
      cvUrl: '',
    }))
  })

  it('keeps Submit disabled until the confirmation checkbox is checked', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567',
      university: 'HITU', major: 'Eng', academicYear: '2nd',
      cvUrl: 'https://cdn/cv.pdf', applyingAs: 'member', committee: 'c0',
      experience: 'Exp', weeklyHours: '5',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/2/)).toBeTruthy()
    await new Promise(r => setTimeout(r, 850))
    const submitBtn = screen.getByRole('button', { name: /Submit application/ })
    expect(submitBtn.disabled).toBe(true)
    fireEvent.submit(document.querySelector('form'))
    expect(submitApplication).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm that the information I provided is accurate/ }))
    expect(screen.getByRole('button', { name: /Submit application/ }).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
  })
})
