# Custom Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one shared Blueprint-styled `Select` listbox (search, hints, full keyboard) and swap it into all 8 native dropdowns per `docs/superpowers/specs/2026-09-14-custom-select-design.md`.

**Architecture:** Single self-contained client component `src/components/ui/Select.jsx` (button trigger + absolutely-positioned panel + visually-hidden native `<select>` for validation) with a value-string `onChange` contract identical to native selects, so all 8 call sites keep their state logic; styles as plain CSS classes in `src/app/globals.css` beside `.btn`/`.form-input`.

**Tech Stack:** React 19 (`useState/useRef/useEffect/useId`), Next.js App Router, Testing Library + vitest, material-symbols chevron/check glyphs (existing convention from `Lightbox.jsx`/`navbar.jsx`), zero new dependencies.

---

## File structure

- Create: `src/components/ui/Select.jsx` — the component + `toOptions()` adapter (single responsibility: single-select listbox UI).
- Create: `src/components/ui/Select.test.jsx` — full behavior suite.
- Modify: `src/app/globals.css` — append `.select-*` classes (trigger, panel, options, search, chevron, empty/disabled states).
- Modify: `src/components/ui/InterestForm.jsx` — committee swap (1 line block).
- Modify: `src/features/recruitment/components/HeadsApplicationForm.jsx` — 4 swaps (boardInterest, firstPref, secondPref, activities).
- Modify: `src/features/admin/components/EventForm.jsx` — category + organizer swaps.
- Modify: `src/features/admin/components/CommitteesTab.jsx` — category swap.
- Modify: `src/features/admin/components/RecruitmentTab.jsx` — preference filter swap (label-less, `ariaLabel`).
- Modify: `src/features/join-us/components/recruitment.test.jsx` — Contact committee assertions go click-based.
- Modify: `src/features/admin/components/EventForm.test.jsx` — organizer assertions go click-based.

Conventions (verified in repo): `form-label` wraps control or uses `htmlFor`; `getByLabelText` must keep resolving; `page-enter`/tabs untouched; `sr-only` from Tailwind; `material-symbols-outlined` glyphs (`expand_more`, `check`); `no-empty` lint forbids empty `catch {}` (use `catch { /* reason */ }`).

---

### Task 1: Select core — trigger, panel, open/close, hidden native select, base CSS

**Files:**
- Create: `src/components/ui/Select.jsx`
- Test: `src/components/ui/Select.test.jsx`
- Modify: `src/app/globals.css` (append select CSS)

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/ui/Select.test.jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Select from './Select'

const options = [
  { value: 'ai', label: 'AI', hint: 'Explores artificial intelligence.' },
  { value: 'web', label: 'Web' },
]

describe('Select core', () => {
  it('renders placeholder and opens the panel on click', () => {
    render(<Select id="s1" label="Committee" value="" onChange={() => {}} options={options} placeholder="Select a committee" />)
    expect(screen.getByRole('combobox', { name: 'Committee' }).textContent).toMatch(/Select a committee/)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: /AI/ })).toBeTruthy()
  })

  it('selects an option, calls onChange with the value, and closes', () => {
    const onChange = vi.fn()
    render(<Select id="s2" label="Committee" value="" onChange={onChange} options={options} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    fireEvent.click(screen.getByRole('option', { name: /Web/ }))
    expect(onChange).toHaveBeenCalledWith('web')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('shows the selected label and closes on Escape without selecting', () => {
    const onChange = vi.fn()
    render(<Select id="s3" label="Committee" value="ai" onChange={onChange} options={options} />)
    expect(screen.getByRole('combobox', { name: 'Committee' }).textContent).toMatch(/AI/)
    fireEvent.click(screen.getByRole('combobox', { name: 'Committee' }))
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('keeps a hidden native select carrying name, required, and value', () => {
    const { container } = render(<Select id="s4" label="Committee" name="committee" required value="web" onChange={() => {}} options={options} />)
    const native = container.querySelector('select[name="committee"]')
    expect(native.required).toBe(true)
    expect(native.value).toBe('web')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Select.test.jsx`
Expected: FAIL with "Failed to resolve import ./Select"

- [ ] **Step 3: Write minimal implementation** (full component — keyboard/search come in Task 2, but structure must already include refs/ids used there)

```jsx
'use client'

import { useEffect, useId, useRef, useState } from 'react'

export function toOptions(items, { value = 'slug', label = 'name', hint = 'shortDescription' } = {}) {
  return (items || []).map(item => ({
    value: String(item[value] ?? ''),
    label: String(item[label] ?? ''),
    hint: item[hint] ? String(item[hint]) : '',
  }))
}

export default function Select({
  id, label, ariaLabel, value, onChange, options = [],
  placeholder = 'Select…', required = false, disabled = false,
  name, searchThreshold = 6, className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [dropUp, setDropUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel-${reactId}`

  const selected = options.find(o => o.value === value) || null
  const showSearch = options.length > searchThreshold
  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(o => `${o.label} ${o.hint || ''}`.toLowerCase().includes(q))
    : options
  const activeId = active >= 0 && filtered[active] ? `${panelId}-opt-${active}` : undefined

  function measure() {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setDropUp(rect.bottom + 280 > window.innerHeight && rect.top > 320)
  }

  function openPanel() {
    if (disabled) return
    const selectedIndex = filtered.findIndex(o => o.value === value)
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    setQuery('')
    measure()
    setOpen(true)
  }

  function closePanel(refocus = true) {
    setOpen(false)
    setQuery('')
    setActive(-1)
    if (refocus) triggerRef.current?.focus()
  }

  function choose(nextValue) {
    onChange(nextValue)
    closePanel()
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fire-and-forget open side effects
  useEffect(() => {
    if (!open) return
    measure()
    if (showSearch) searchRef.current?.focus()
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) closePanel(false)
    }
    function onResize() { measure() }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function onTriggerKeyDown(e) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      openPanel()
    } else if (!showSearch && e.key.length === 1) {
      const hit = options.find(o => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (hit) onChange(hit.value)
    }
  }

  function move(delta) {
    if (filtered.length === 0) return
    setActive(a => (a + delta + filtered.length) % filtered.length)
  }

  function onPanelKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[active]) choose(filtered[active].value)
      else if (filtered.length === 1) choose(filtered[0].value)
    }
    else if (e.key === 'Escape') { e.preventDefault(); closePanel() }
    else if (e.key === 'Tab') { closePanel(false) }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      id={triggerId}
      role="combobox"
      aria-expanded={open}
      aria-controls={panelId}
      aria-activedescendant={open ? activeId : undefined}
      aria-label={label || ariaLabel}
      disabled={disabled}
      onClick={() => (open ? closePanel() : openPanel())}
      onKeyDown={onTriggerKeyDown}
      className={'select-trigger' + (open ? ' select-trigger--open' : '')}
    >
      <span className={'select-value' + (selected ? '' : ' select-value--placeholder')}>
        {selected ? selected.label : placeholder}
      </span>
      <span className={'material-symbols-outlined select-chevron' + (open ? ' select-chevron--open' : '')} aria-hidden="true">expand_more</span>
    </button>
  )

  return (
    <div ref={rootRef} className={'select-root ' + className}>
      {label ? <label className="form-label" htmlFor={triggerId}>{label}</label> : null}
      {trigger}
      <select
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        name={name}
        required={required}
        value={value}
        onChange={() => { /* single source of truth is the custom panel */ }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {open && (
        <div id={panelId} role="listbox" aria-label={label || ariaLabel} onKeyDown={onPanelKeyDown} className={'select-panel' + (dropUp ? ' select-panel--up' : '')}>
          {showSearch && (
            <div className="select-search-row">
              <input
                ref={searchRef}
                role="searchbox"
                aria-label="Filter options"
                className="select-search"
                placeholder="Type to filter…"
                value={query}
                onChange={e => { setQuery(e.target.value); setActive(0) }}
                onKeyDown={onPanelKeyDown}
              />
              <span className="select-count" aria-hidden="true">{filtered.length} of {options.length}</span>
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="select-empty" role="presentation">{q ? `No matches for "${query.trim()}"` : 'No options'}</p>
          ) : (
            <ul className="select-list">
              {filtered.map((o, index) => {
                const isSelected = o.value === value
                return (
                  <li
                    key={o.value}
                    id={`${panelId}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(o.value)}
                    className={'select-option' + (index === active ? ' select-option--active' : '') + (isSelected ? ' select-option--selected' : '')}
                  >
                    <span className="select-option-main">
                      <span className="select-option-label" title={o.label}>{o.label}</span>
                      {o.hint ? <span className="select-option-hint">{o.hint}</span> : null}
                    </span>
                    {isSelected ? <span className="material-symbols-outlined select-check" aria-hidden="true">check</span> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Append the CSS** to `src/app/globals.css` (after the `.form-checkbox` block, before `.nav-link`):

```css
.select-root { position: relative; }
.select-trigger { display: flex; width: 100%; min-height: var(--input-height); align-items: center; justify-content: space-between; gap: var(--space-3); padding-inline: var(--input-padding-x); border-bottom: 2px solid var(--color-outline); border-radius: var(--input-radius) var(--input-radius) 0 0; background: var(--color-surface-container); color: var(--text); font: inherit; text-align: start; cursor: pointer; transition: border-color 160ms ease; }
.select-trigger:hover { border-color: var(--primary); }
.select-trigger:focus-visible { border-color: var(--primary); outline: var(--ring-width) solid var(--primary); outline-offset: var(--ring-offset); }
.select-trigger--open { border-color: #00B5E2; }
.select-trigger:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }
.select-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-value--placeholder { color: var(--text-muted); }
.select-chevron { color: var(--text-muted); transition: transform 160ms ease; }
.select-chevron--open { transform: rotate(180deg); color: var(--primary); }
.select-panel { position: absolute; inset-inline: 0; top: calc(100% + 0.25rem); z-index: 30; overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-outline-variant) 15%, transparent); border-radius: var(--card-radius); background: var(--color-surface-container-lowest); box-shadow: 0 40px 40px -20px color-mix(in srgb, var(--color-on-surface) 4%, transparent); clip-path: polygon(0.75rem 0, 100% 0, 100% 100%, 0 100%, 0 0.75rem); animation: select-enter 160ms var(--ease-out-cubic); }
.select-panel--up { top: auto; bottom: calc(100% + 0.25rem); }
@keyframes select-enter { from { opacity: 0; transform: translateY(-0.25rem); } }
.select-search-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
.select-search { flex: 1; min-height: 2.25rem; padding-inline: var(--space-3); border-bottom: 2px solid var(--color-outline); background: transparent; color: var(--text); font: inherit; }
.select-search:focus { border-color: #00B5E2; outline: none; }
.select-count { color: var(--color-on-primary-container); background: var(--color-primary-fixed); border-radius: var(--radius-full); padding: 0.125rem 0.625rem; font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); white-space: nowrap; }
.select-list { overflow-y: auto; max-height: 16rem; margin: 0; padding: var(--space-2); list-style: none; }
.select-option { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0.625rem 1rem; border-radius: var(--radius-sm); cursor: pointer; }
.select-option--active { background: var(--color-surface-container-low); }
.select-option--selected .select-option-label { font-weight: var(--font-weight-semibold); color: var(--primary-strong); }
.select-option--selected::before { content: ''; align-self: stretch; width: 3px; border-radius: 2px; background: var(--primary); }
.select-option-main { display: flex; min-width: 0; flex-direction: column; }
.select-option-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--font-size-sm); }
.select-option-hint { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; font-size: var(--font-size-xs); color: var(--text-muted); }
.select-check { color: var(--primary); }
.select-empty { padding: var(--space-4); font-size: var(--font-size-sm); color: var(--text-muted); }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Select.test.jsx`
Expected: PASS (4 tests). Note: `pointerdown` outside-close is not covered here (jsdom); covered implicitly by Escape test. `dropUp` measure runs on `window.innerHeight` (jsdom 768 default) without asserting.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Select.jsx src/components/ui/Select.test.jsx src/app/globals.css
git commit -m "feat: add Blueprint custom Select listbox"
```

---

### Task 2: Keyboard, search, and edge-state tests

**Files:**
- Test only: `src/components/ui/Select.test.jsx` (append describes; no production change expected — if a test fails, fix `Select.jsx` minimally)

- [ ] **Step 1: Append the failing tests**

```jsx
describe('Select keyboard', () => {
  const options = [
    { value: 'ai', label: 'AI' },
    { value: 'web', label: 'Web' },
    { value: 'pr-oc', label: 'PR & OC' },
  ]
  it('opens with ArrowDown and selects with arrows + Enter', () => {
    const onChange = vi.fn()
    render(<Select id="k1" label="Pick" value="" onChange={onChange} options={options} />)
    const trigger = screen.getByRole('combobox', { name: 'Pick' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('web')
  })
  it('type-ahead selects by first letter when search is hidden', () => {
    const onChange = vi.fn()
    render(<Select id="k2" label="Pick" value="" onChange={onChange} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Pick' }), { key: 'n' })
    expect(onChange).toHaveBeenCalledWith('no')
  })
})

describe('Select search', () => {
  const many = Array.from({ length: 8 }, (_, i) => ({ value: `c${i}`, label: `Committee ${i}` }))
  it('shows search above threshold and filters, with a no-match row', () => {
    render(<Select id="s5" label="Pick" value="" onChange={() => {}} options={many} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    const search = screen.getByRole('searchbox', { name: 'Filter options' })
    expect(search).toBeTruthy()
    fireEvent.change(search, { target: { value: 'Committee 7' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.change(search, { target: { value: 'zzz-nope' } })
    expect(screen.getByText(/No matches for/)).toBeTruthy()
  })
  it('hides search for short lists', () => {
    render(<Select id="s6" label="Pick" value="" onChange={() => {}} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
  it('marks the selected option with aria-selected and shows its hint', () => {
    render(<Select id="s7" label="Pick" value="ai" onChange={() => {}} options={[{ value: 'ai', label: 'AI', hint: 'Smart systems.' }]} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.getByRole('option', { name: /AI/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('Smart systems.')).toBeTruthy()
  })
  it('disables interaction when disabled', () => {
    render(<Select id="s8" label="Pick" value="" onChange={() => {}} options={[{ value: 'a', label: 'A' }]} disabled />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Pick' }))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they pass** (they should — behavior was built in Task 1)

Run: `npx vitest run src/components/ui/Select.test.jsx`
Expected: PASS (10 tests). If any fail, fix `Select.jsx` minimally and re-run — do not weaken the test.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Select.test.jsx src/components/ui/Select.jsx
git commit -m "test: cover Select keyboard, search, and edge states"
```

(If Step 2 required a `Select.jsx` fix, amend the message to `fix: ...` in a second commit — one concern per commit.)

---

### Task 3: Public swap-ins — InterestForm + HeadsApplicationForm + test updates

**Files:**
- Modify: `src/components/ui/InterestForm.jsx:22`
- Modify: `src/features/recruitment/components/HeadsApplicationForm.jsx:97,99,100,104`
- Modify: `src/features/join-us/components/recruitment.test.jsx:251-285`

- [ ] **Step 1: Update the failing tests first** — in `recruitment.test.jsx`, replace the shared `it.each` honest-outcome block's committee assertions with interaction-aware versions. Replace lines using `committee.options` and `fireEvent.change(committee, ...)`:

```jsx
const committee = screen.getByRole('combobox', { name: 'Committee' })
fireEvent.click(committee)
expect(screen.getByRole('listbox')).toBeTruthy()
expect(screen.getAllByRole('option').length).toBe(committees.length)
fireEvent.click(screen.getByRole('option', { name: new RegExp(committees[0].name) }))
```

Keep every other assertion in that block identical (labels unique, local-demo note, invalid-email stays blocked, success status text). The Join page's wizard selects are covered by `HeadsApplicationForm.test.jsx`; add one assertion there: after reaching Step 2, `screen.getByRole('combobox', { name: /1st preference/ })` exists and opens with 13 committee options:

```jsx
const first = screen.getByRole('combobox', { name: /1st preference/ })
fireEvent.click(first)
expect(screen.getAllByRole('option').length).toBe(13)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx src/features/recruitment/components/HeadsApplicationForm.test.jsx`
Expected: FAIL — `getByLabelText('Committee')` finds no native select; `committee.options` undefined.

- [ ] **Step 3: Swap the controls** (state logic untouched)

`InterestForm.jsx:22` — replace the whole label element:

```jsx
<Select id={`${idPrefix}-committee`} label="Committee" name="committee" required value={formData.committee} onChange={value => { setSubmitted(false); setFormData(current => ({ ...current, committee: value })) }} placeholder="Select a committee" options={toOptions(committees)} />
```

with imports added at top:

```jsx
import Select, { toOptions } from '@/components/ui/Select'
```

Note: the old inline `change` handler stays for the other inputs; only the committee line changes. The wrapping `<label>` is removed because `Select` renders its own `form-label`.

`HeadsApplicationForm.jsx` — add `import Select, { toOptions } from '@/components/ui/Select'` and replace the four native selects (keep each surrounding label TEXT as the `label` prop, keep `{errFor(...)}` siblings):

Board interest:
```jsx
<Select id="heads-boardInterest" label="Interested in Heads Board positions?" required value={values.boardInterest} onChange={set('boardInterest')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} placeholder="Select…" />
{errFor('boardInterest')}
```

1st preference:
```jsx
<Select id="heads-firstPref" label="1st preference" required value={values.firstPref} onChange={set('firstPref')} placeholder="Select a committee" options={toOptions(options)} />
{errFor('firstPref')}
```

2nd preference: same with `id="heads-secondPref"`, `label="2nd preference"`, no `required`, `placeholder="None"`, `value={values.secondPref}`, `onChange={set('secondPref')}`.

Activities:
```jsx
<Select id="heads-activities" label="Any student activities experience?" required value={values.activities} onChange={set('activities')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} placeholder="Select…" />
{errFor('activities')}
```

Important: `set(key)` currently reads `e.target.value` — change it to accept a raw value so both text inputs and Select work:

```jsx
const set = key => valueOrEvent => {
  setFieldError(null)
  const next = valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent ? valueOrEvent.target.value : valueOrEvent
  setValues(v => ({ ...v, [key]: next }))
}
```

Verify the old `input()` helper and textareas keep working with the new `set` (they pass events — handled by the `'target' in` branch).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/join-us/components/recruitment.test.jsx src/features/recruitment/components/HeadsApplicationForm.test.jsx src/components/ui/Select.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/InterestForm.jsx src/features/recruitment/components/HeadsApplicationForm.jsx src/features/join-us/components/recruitment.test.jsx src/features/recruitment/components/HeadsApplicationForm.test.jsx
git commit -m "feat: use custom Select in public recruitment forms"
```

---

### Task 4: Admin swap-ins — EventForm, CommitteesTab, RecruitmentTab + test updates

**Files:**
- Modify: `src/features/admin/components/EventForm.jsx:9,222-226,268-273`
- Modify: `src/features/admin/components/CommitteesTab.jsx:1-18,181-190`
- Modify: `src/features/admin/components/RecruitmentTab.jsx:1-7,71`
- Modify: `src/features/admin/components/EventForm.test.jsx:84-117`

- [ ] **Step 1: Update the failing tests first** — in `EventForm.test.jsx`, replace native-select interactions with click-based ones. Replace:

```jsx
const select = screen.getByLabelText('Organizer Committee (optional)')
```

with:

```jsx
const select = screen.getByRole('combobox', { name: 'Organizer Committee (optional)' })
```

Replace:

```jsx
fireEvent.change(screen.getByLabelText('Organizer Committee (optional)'), { target: { value: 'Web' } })
```

with:

```jsx
fireEvent.click(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }))
fireEvent.click(screen.getByRole('option', { name: 'Web' }))
```

And value assertions `expect(...value).toBe('Web')` / `.toBe('PR & OC')` become trigger-label assertions:

```jsx
expect(screen.getByRole('combobox', { name: 'Organizer Committee (optional)' }).textContent).toMatch(/Web/)
```

(and likewise `PR & OC`). Keep all other assertions identical.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/admin/components/EventForm.test.jsx`
Expected: FAIL — no labeled native select found.

- [ ] **Step 3: Swap the controls** (state logic untouched; add `import Select from '@/components/ui/Select'` to each file)

`EventForm.jsx` category block (lines 222-226) → keep the outer `<label>`, replace only the `<select>`:

```jsx
<label htmlFor="event-category" className="form-label">Category</label>
<Select id="event-category" value={form.category} onChange={value => setForm({ ...form, category: value })} options={categories} />
```

Wait — this nests no label (Select without `label` prop renders trigger only) while the outer `<label htmlFor="event-category">` points at `triggerId` = `event-category-trigger`, NOT `event-category`. Fix: outer labels must point at the trigger id. Change the outer labels to `htmlFor="event-category-trigger"` and `htmlFor="event-organizer-trigger"`. (Rule: Select trigger id is always `${id}-trigger`; external labels must use that.)

Organizer block (lines 268-273):

```jsx
<label htmlFor="event-organizer-trigger" className="form-label">Organizer Committee (optional)</label>
<Select id="event-organizer" value={form.organizerCommittee} onChange={value => setForm({ ...form, organizerCommittee: value })} placeholder="None" options={[{ value: '', label: 'None' }, ...committeeOptions.map(c => ({ value: c.name, label: c.name }))]} />
```

Note: native "None" empty option becomes an explicit `{ value: '', label: 'None' }` first option so clearing still works.

`CommitteesTab.jsx` category block (lines 181-190):

```jsx
<label htmlFor="committee-category-trigger" className="form-label">Category</label>
<Select id="committee-category" className="mb-4" value={committeeForm.category} onChange={value => setCommitteeForm({ ...committeeForm, category: value })} options={[{ value: 'technical', label: 'Technical' }, { value: 'non-technical', label: 'Non-Technical' }]} />
```

`RecruitmentTab.jsx` filter (line 71) — label-less with aria-label:

```jsx
<Select id="rec-pref-filter" ariaLabel="Filter by preference" className="max-w-xs" value={pref} onChange={setPref} placeholder="All preferences" options={[{ value: '', label: 'All preferences' }, ...committees.map(c => ({ value: c.slug, label: c.name }))]} />
```

Note: `setPref` already takes a raw value (`e => setPref(e.target.value)` becomes just `setPref`) — update the handler accordingly: replace `onChange={e => setPref(e.target.value)}` usage by passing `onChange={setPref}`. Clearing to "" shows all, matching the old empty-option behavior.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/admin/components/EventForm.test.jsx src/features/admin/components/committeesTab.test.jsx src/features/admin/components/recruitmentTab.test.jsx src/features/admin/components/admin.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/components/EventForm.jsx src/features/admin/components/CommitteesTab.jsx src/features/admin/components/RecruitmentTab.jsx src/features/admin/components/EventForm.test.jsx
git commit -m "feat: use custom Select across admin forms"
```

---

### Task 5: Full verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: zero errors (empty `catch {}` is forbidden — use `catch { /* reason */ }`).

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: all suites PASS (baseline before this feature: 28 files / 205 tests; expect 29 files / ~225 tests).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: succeeds; `/join-us` stays static, `/api/recruitment/*` routes listed.

- [ ] **Step 4: Manual smoke checklist** (`npm run dev`): open `/join-us` (wizard selects open with search + hints, yes/no without search); submit blocked when a required Select is empty (native bubble); pick committee, submit; `/admin` Recruitment filter + EventForm category/organizer + CommitteesTab category all open styled panels; keyboard-only run-through of one dropdown; mobile width check. Record failures as new bug tasks — do not ship red.
