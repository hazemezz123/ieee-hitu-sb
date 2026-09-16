# Step 4 Confirmation Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Step 4/4 of the Heads application wizard a must-complete step by gating submission behind a required confirmation checkbox.

**Architecture:** Add a local `confirmed` boolean to `HeadsApplicationForm` (not part of `values`, so draft payload and CSV columns stay untouched). Render a checkbox below the Notes textarea on step 4, disable `Submit application` until it is checked, and add an early return in `submit()` so implicit form submits can't bypass the disabled button. Reset the flag whenever the wizard leaves step 4.

**Tech Stack:** React 19 client component, Next.js 16, Tailwind utility classes, vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-09-16-step4-confirmation-design.md`

---

## File Structure

- Modify: `src/features/recruitment/components/HeadsApplicationForm.jsx` — `confirmed` state, reset in the existing step effect, checkbox UI on step 4, guarded submit handler, disabled Submit button.
- Modify: `src/features/recruitment/components/HeadsApplicationForm.test.jsx` — one new test, three existing tests updated to check the box before submitting.
- No new files. Checkbox style reuses `.form-checkbox` (`src/app/globals.css:375`), no CSS changes.

**Warning:** the working tree also contains unrelated uncommitted changes (`Select.jsx`, `globals.css`, `Select.test.jsx`, `JoinUsPage.jsx`, `RecruitmentBand.jsx`). Only stage the two files named in the commit step.

---

### Task 1: Gate Step 4 submission behind a confirmation checkbox

**Files:**
- Modify: `src/features/recruitment/components/HeadsApplicationForm.jsx`
- Test: `src/features/recruitment/components/HeadsApplicationForm.test.jsx`

- [ ] **Step 1: Write the failing test**

Append this test inside the `describe('HeadsApplicationForm', ...)` block in `src/features/recruitment/components/HeadsApplicationForm.test.jsx`, right before the final closing `})` (currently line 301):

```jsx
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
    expect(await screen.findByText(/Application recorded/)).toBeTruthy()
    expect(submitApplication).toHaveBeenCalledTimes(1)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/recruitment/components/HeadsApplicationForm.test.jsx -t "keeps Submit disabled until"`

Expected: 1 failed with `TestingLibraryElementError: Unable to find a label with the text of: /I confirm that the information I provided is accurate/` (the checkbox does not exist yet).

- [ ] **Step 3: Add the `confirmed` state**

In `src/features/recruitment/components/HeadsApplicationForm.jsx`, change:

```jsx
  const [readyToSubmit, setReadyToSubmit] = useState(true);
  const notesRef = useRef(null);
```

to:

```jsx
  const [readyToSubmit, setReadyToSubmit] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const notesRef = useRef(null);
```

- [ ] **Step 4: Reset the confirmation when leaving step 4**

In the same file, change the start of the step effect:

```jsx
  useEffect(() => {
    if (step !== 3) {
      setReadyToSubmit(true);
      return;
    }
```

to:

```jsx
  useEffect(() => {
    if (step !== 3) {
      setReadyToSubmit(true);
      setConfirmed(false);
      return;
    }
```

(`Clear` sets `step` to 0, which already triggers this reset; no other change needed.)

- [ ] **Step 5: Guard the submit handler**

In `submit()`, after the existing `readyToSubmit` guard:

```jsx
    // Ignore the second half of a double-click / key repeat that lands on
    // Submit right after Continue advanced to this step.
    if (!readyToSubmit) return;
```

add:

```jsx
    // The Step 4 confirmation checkbox gates real submission; implicit
    // submits (Enter / assistive tech) must not bypass the disabled button.
    if (!confirmed) return;
```

- [ ] **Step 6: Render the checkbox on step 4**

In the `{step === 3 && (` block, between the closing `</label>` of the Notes field and the honeypot `<input type="text" name="company_website" ...`, insert:

```jsx
          <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="heads-confirm">
            <input
              id="heads-confirm"
              type="checkbox"
              className="form-checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirm that the information I provided is accurate.
          </label>
```

- [ ] **Step 7: Gate the Submit button**

Change the Submit button's disabled prop:

```jsx
            disabled={uploading || !readyToSubmit}
```

to:

```jsx
            disabled={uploading || !readyToSubmit || !confirmed}
```

- [ ] **Step 8: Run the new test to verify it passes**

Run: `npx vitest run src/features/recruitment/components/HeadsApplicationForm.test.jsx -t "keeps Submit disabled until"`

Expected: 1 passed.

- [ ] **Step 9: Update the three existing submit tests**

In `src/features/recruitment/components/HeadsApplicationForm.test.jsx`:

**(a)** In `records a fully valid draft on submit`, after `await new Promise(r => setTimeout(r, 850))` (currently line 180), add before the Submit click:

```jsx
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
```

**(b)** In `guards Step 4 submit against double-click right after Continue`, change this block (currently lines 262-264):

```jsx
    // After the guard window, a deliberate submit goes through with the note.
    await new Promise(r => setTimeout(r, 850))
    expect(screen.getByRole('button', { name: /Submit application/ }).disabled).toBe(false)
```

to:

```jsx
    // After the guard window, confirm and a deliberate submit goes through with the note.
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    expect(screen.getByRole('button', { name: /Submit application/ }).disabled).toBe(false)
```

**(c)** In `treats Enter on a non-final step as Continue instead of submitting`, change this block (currently lines 294-296):

```jsx
    fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: 'Some note' } })
    await new Promise(r => setTimeout(r, 850))
    fireEvent.submit(document.querySelector('form'))
```

to:

```jsx
    fireEvent.change(screen.getByLabelText(/Notes/), { target: { value: 'Some note' } })
    await new Promise(r => setTimeout(r, 850))
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm/ }))
    fireEvent.submit(document.querySelector('form'))
```

- [ ] **Step 10: Run the full test file**

Run: `npx vitest run src/features/recruitment/components/HeadsApplicationForm.test.jsx`

Expected: `Test Files 1 passed`, `Tests 13 passed` (12 existing + 1 new).

- [ ] **Step 11: Run the full suite**

Run: `npm test`

Expected: `Test Files 31 passed`, `Tests 260 passed` (259 current + 1 new). Any failure here is a regression — fix before committing.

- [ ] **Step 12: Run lint**

Run: `npm run lint`

Expected: no output (clean).

- [ ] **Step 13: Commit**

```bash
git add src/features/recruitment/components/HeadsApplicationForm.jsx src/features/recruitment/components/HeadsApplicationForm.test.jsx
git commit -m "feat: gate Step 4 submission behind confirmation checkbox"
```

Do not stage any other modified files in the working tree.
