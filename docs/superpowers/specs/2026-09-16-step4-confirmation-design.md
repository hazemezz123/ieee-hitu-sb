# Step 4 Confirmation Gate — Heads Application Wizard

Date: 2026-09-16
Status: Approved by user (Required confirmation step)
Scope: `src/features/recruitment/components/HeadsApplicationForm.jsx` (Step 4/4 only)

## 1. Goal

Make Step 4/4 an actively completed step. Today Step 4 is an optional Notes box that already contains the Submit button, so the form feels "finished" at Step 3. After this change, the applicant must explicitly confirm on Step 4 before submission is possible.

## 2. Behavior (locked)

- Step 4/4 keeps the Notes textarea (still optional) and adds a required confirmation checkbox below it: "I confirm that the information I provided is accurate."
- The `Submit application` button is disabled until the checkbox is checked, in addition to the existing `uploading` and `readyToSubmit` (800ms double-click guard) conditions.
- The submit handler ignores submissions while the checkbox is unchecked, so implicit or assistive-tech-triggered form submits can't bypass the disabled button.
- Navigating Back from Step 4 clears the confirmation; returning to Step 4 requires re-confirming, so answers edited after confirming can't be submitted without a fresh confirmation.
- `Clear` resets the confirmation along with everything else.
- Successful submission is unchanged: success screen ("Application recorded"), draft removed.

## 3. Non-goals

- No review/summary UI, no field additions or removals.
- No API, database, CSV, or validation-rule changes.
- Notes stays optional; the checkbox is a UI gate in the wizard, not a persisted field.

## 4. Implementation Notes

- State: a local `confirmed` boolean in `HeadsApplicationForm` — deliberately NOT part of `values`, so the draft payload, submit payload, and CSV columns are untouched.
- Reset `confirmed` in the existing step effect when `step !== 3` (the same effect that manages `readyToSubmit`).
- Checkbox reuses the existing `.form-checkbox` class (`src/app/globals.css:375`, currently unused).
- Submit button becomes `disabled={uploading || !readyToSubmit || !confirmed}`.
- `submit()` gains `if (!confirmed) return` right after its existing `readyToSubmit` guard (step 4 is the only place `submit()` runs at that point).
- Checkbox is wrapped in a `<label>` with its visible text for an accessible name; native checkbox keeps keyboard and screen-reader behavior.

## 5. Tests (vitest + Testing Library)

- New test: on Step 4/4 the Submit button is disabled, an implicit `fireEvent.submit(form)` does not call `submitApplication`, and the button enables after checking the box.
- Existing submit tests (`records a fully valid draft`, the double-click guard, and the Enter-as-Continue test) check the box first.
- Existing step-navigation tests are unchanged.
- Regression gate: full `npm test` green, including `HeadsApplicationForm.test.jsx` and `recruitment.test.jsx`.
