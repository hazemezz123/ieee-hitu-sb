// src/features/recruitment/components/HeadsApplicationForm.test.jsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HeadsApplicationForm from './HeadsApplicationForm'

globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }

afterEach(() => { cleanup(); try { localStorage.clear() } catch { /* storage unavailable */ } })
vi.mock('@/features/committees/hooks/useCommittees', () => ({ fetchCommitteesResult: async () => ({ committees: Array.from({ length: 13 }, (_, i) => ({ slug: `c${i}`, name: `Committee ${i}` })), source: 'remote' }) }))

const { submitApplication } = vi.hoisted(() => ({ submitApplication: vi.fn() }))
vi.mock('@/lib/recruitment', () => ({ submitApplication }))

describe('HeadsApplicationForm', () => {
  it('walks 4 steps with file-only uploads and applying-as + committee', async () => {
    render(<HeadsApplicationForm />)
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    // No Drive links anymore
    expect(screen.queryByLabelText(/drive link/i)).toBeNull()

    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
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

  it('offers Academic Year and Current Academic Grade as selects', async () => {
    render(<HeadsApplicationForm />)
    const year = screen.getByRole('combobox', { name: /Academic Year/ })
    fireEvent.click(year)
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    expect(screen.getByRole('combobox', { name: /Academic Year/ }).textContent).toMatch(/2nd Year/)
    const grade = screen.getByRole('combobox', { name: /Current Academic Grade/ })
    fireEvent.click(grade)
    fireEvent.click(screen.getByRole('option', { name: /Excellent/ }))
    expect(screen.getByRole('combobox', { name: /Current Academic Grade/ }).textContent).toMatch(/Excellent/)
  })

  it('requires committee name + position when previous member is yes', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
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

  it('blocks an invalid email on step 1 with a visible error', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    fireEvent.change(document.getElementById('heads-photoFile'), { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/valid email/i)
  })

  it('rejects invalid social links on step 1 with a visible error', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    fireEvent.change(screen.getByLabelText(/Social media links/), { target: { value: 'not-a-url' } })
    fireEvent.change(document.getElementById('heads-photoFile'), { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/valid URLs/i)
  })

  it('blocks an invalid phone on step 1 with a visible error', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: 'abc' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    fireEvent.change(document.getElementById('heads-photoFile'), { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/valid phone/i)
  })

  it('records a fully valid draft on submit', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'https://cdn/photo.jpg', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: 'head', committee: 'c0',
      whyHead: 'Lead', experience: 'Exp', prevMember: 'no', prevCommittee: '', prevPosition: '',
      studentActivities: 'x', weeklyHours: '5', whyJoin: 'y', notes: '',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 4\/4/)).toBeTruthy()
    // Submit is held briefly to swallow a double-click landing from Continue.
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
  })

  it('blocks a bad draft upload URL on step 1 instead of failing at submit', async () => {
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'not-a-url', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: '', committee: '',
      whyHead: '', experience: '', prevMember: '', prevCommittee: '', prevPosition: '',
      studentActivities: '', weeklyHours: '', whyJoin: '', notes: '',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/Photo upload failed/i)
  })

  it('blocks non-numeric weekly hours on step 3 with a visible error', async () => {
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'https://cdn/photo.jpg', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: 'head', committee: 'c0',
      whyHead: 'Lead', experience: 'Exp', prevMember: 'no', prevCommittee: '', prevPosition: '',
      studentActivities: 'x', weeklyHours: 'a lot', whyJoin: 'y', notes: '',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(screen.getByText(/Step 3\/4/)).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toMatch(/weekly hours/i)
  })

  it('resets the wizard to step 1 when cleared', async () => {
    render(<HeadsApplicationForm />)
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'HITU Student' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 's@hitu.edu.eg' } })
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '01001234567' } })
    fireEvent.change(screen.getByLabelText(/University/), { target: { value: 'HITU' } })
    fireEvent.change(screen.getByLabelText(/Major/), { target: { value: 'Eng' } })
    fireEvent.click(screen.getByRole('combobox', { name: /Academic Year/ }))
    fireEvent.click(screen.getByRole('option', { name: '2nd Year' }))
    fireEvent.change(document.getElementById('heads-photoFile'), { target: { files: [new File(['img'], 'me.png', { type: 'image/png' })] } })
    fireEvent.change(document.getElementById('heads-cvFile'), { target: { files: [new File(['cv'], 'cv.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }))
    expect(screen.getByText(/Step 1\/4/)).toBeTruthy()
    expect(screen.getByLabelText(/Full name/).value).toBe('')
  })

  it('guards Step 4 submit against double-click right after Continue', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'https://cdn/photo.jpg', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: 'head', committee: 'c0',
      whyHead: 'Lead', experience: 'Exp', prevMember: 'no', prevCommittee: '', prevPosition: '',
      studentActivities: 'x', weeklyHours: '5', whyJoin: 'y', notes: '',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 4\/4/)).toBeTruthy()
    // Second click of an accidental double-click lands on Submit in the same
    // spot — it must not submit before the user can type Notes.
    const submitBtn = screen.getByRole('button', { name: /Submit application/ })
    expect(submitBtn.disabled).toBe(true)
    fireEvent.click(submitBtn)
    expect(submitApplication).not.toHaveBeenCalled()
    // Notes stay editable during the guard.
    fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: 'Some note' } })
    expect(screen.getByLabelText(/Notes/).value).toBe('Some note')
    // After the guard window, confirm and a deliberate submit goes through with the note.
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    expect(screen.getByRole('button', { name: /Submit application/ }).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
    expect(submitApplication).toHaveBeenCalledWith('heads', expect.objectContaining({ notes: 'Some note' }))
  })

  it('treats Enter on a non-final step as Continue instead of submitting', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'https://cdn/photo.jpg', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: 'head', committee: 'c0',
      whyHead: 'Lead', experience: 'Exp', prevMember: 'no', prevCommittee: '', prevPosition: '',
      studentActivities: 'x', weeklyHours: '5', whyJoin: 'y', notes: '',
    }))
    render(<HeadsApplicationForm />)
    const form = document.querySelector('form')
    // Implicit submit (Enter key) on step 1 advances without submitting.
    fireEvent.submit(form)
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    expect(submitApplication).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    // Implicit submit (Enter key) on step 3 advances without submitting.
    fireEvent.submit(document.querySelector('form'))
    expect(await screen.findByText(/Step 4\/4/)).toBeTruthy()
    expect(submitApplication).not.toHaveBeenCalled()
    // Notes stay editable and a real submit on the final step records the application.
    fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: 'Some note' } })
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.submit(document.querySelector('form'))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
    expect(submitApplication).toHaveBeenCalledWith('heads', expect.objectContaining({ notes: 'Some note' }))
  })

  it('keeps Submit disabled until the confirmation checkbox is checked', async () => {
    submitApplication.mockReset()
    submitApplication.mockResolvedValue(7)
    localStorage.setItem('recruitment:heads:draft', JSON.stringify({
      name: 'HITU Student', email: 's@hitu.edu.eg', phone: '01001234567', address: '',
      photoUrl: 'https://cdn/photo.jpg', university: 'HITU', major: 'Eng', academicYear: '2nd', grade: '',
      cvUrl: 'https://cdn/cv.pdf', links: '', applyingAs: 'head', committee: 'c0',
      whyHead: 'Lead', experience: 'Exp', prevMember: 'no', prevCommittee: '', prevPosition: '',
      studentActivities: 'x', weeklyHours: '5', whyJoin: 'y', notes: '',
    }))
    render(<HeadsApplicationForm />)
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 2\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 3\/4/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }))
    expect(await screen.findByText(/Step 4\/4/)).toBeTruthy()
    // Wait out the double-click guard so only the confirmation gates Submit.
    await new Promise(r => setTimeout(r, 850))
    const submitBtn = screen.getByRole('button', { name: /Submit application/ })
    const confirmBox = screen.getByRole('checkbox', { name: /I confirm that the information I provided is accurate/ })
    expect(submitBtn.disabled).toBe(true)
    // Implicit submits (Enter / assistive tech) can't bypass the gate either.
    fireEvent.submit(document.querySelector('form'))
    expect(submitApplication).not.toHaveBeenCalled()
    fireEvent.click(confirmBox)
    expect(screen.getByRole('button', { name: /Submit application/ }).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Submit application/ }))
    expect(await screen.findByText(/You're all set/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
  })
})
