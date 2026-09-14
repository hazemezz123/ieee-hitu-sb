# Custom Select Design — IEEE HITU Website

Date: 2026-09-14
Status: Approved by user (Option A — hand-built Listbox component)
Scope: One shared `Select` component replacing all 8 native dropdowns (public + admin). Single-select only.

## 1. Goal

Replace every native `<select>` with a custom dropdown that fully follows DESIGN.md (Architectural Blueprint, tonal layering, No-Line rule, Wedge geometry) and feels special via search, option descriptions, and signature Wedge detailing — without breaking forms, validation, keyboard users, or screen readers.

## 2. Requirements (locked)

- Scope: all 8 dropdowns — `InterestForm` committee; `HeadsApplicationForm` boardInterest, firstPref, secondPref, activities; `EventForm` category + organizer; `CommitteesTab` category; `RecruitmentTab` preference filter.
- Full custom listbox: styled trigger + animated panel, Arrow/Enter/Escape/Tab/type-ahead keyboard, search box for long lists, checkmark on selected option.
- Options support an optional hint line; committee dropdowns show `shortDescription` as hint, yes/no and admin enum dropdowns use names only.
- Zero new dependencies (repo convention; `lucide-react` chevron already installed).
- Must preserve: native form validation (`required`), existing state logic in all 8 call sites, label-based test queries, keyboard + screen-reader access, responsive + reduced-motion behavior.

## 3. Component API & Architecture

New files: `src/components/ui/Select.jsx`, `src/components/ui/Select.test.jsx` — alongside the existing UI kit (`AnimatedSection`, `Hero`, `ConfirmDialog`, `Lightbox`).

```jsx
<Select
  id="heads-firstPref" label="1st preference" required
  value={values.firstPref} onChange={set('firstPref')}
  placeholder="Select a committee"
  options={[{ value: 'ai', label: 'AI', hint: 'Explores artificial intelligence…' }]}
  searchThreshold={6}
/>
```

Props (all explicit, no hidden behavior):
- `id` (string, required): wires trigger + hidden select to the visible `<label>` via `htmlFor`; also prefixes option ids.
- `label` (string, required): accessible name, rendered in the wrapping label.
- `value` (string): currently selected option value; empty string means "nothing selected".
- `onChange` (function, required): called with the new value string — identical contract to a native select's `e.target.value`, so call sites keep their handlers.
- `options` (array, required): `{ value: string, label: string, hint?: string }`. Call sites map domain objects via a `toOptions()` adapter (committees: `slug → value`, `name → label`, `shortDescription → hint`).
- `placeholder` (string): shown muted when `value` is empty. Default: `'Select…'`.
- `required` (bool), `disabled` (bool), `name` (string): forwarded to the hidden native select.
- `searchThreshold` (number, default 6): search box renders only when `options.length > searchThreshold`. Short lists (yes/no, categories) get no search box.

Progressive enhancement: a visually-hidden native `<select>` (same `id`-rooted name, `required`, `value`, real `<option>` children) stays in the DOM. Built-in validation, autofill, and no-JS form posts keep working; the custom trigger/panel is the visual layer. `onChange` from the hidden select is ignored (single source: custom panel) to avoid double-firing.

Panel placement: fixed-positioned under the trigger, flips upward when space below is insufficient (measured via `getBoundingClientRect` on open + on scroll/resize while open). Closes on outside pointer-down, `Escape`, `Tab`, or selection.

## 4. Behavior & Accessibility

- Mouse/touch: trigger click toggles; option click selects + closes + refocuses trigger; outside pointer-down closes with no change.
- Keyboard (WAI-ARIA listbox pattern): `Enter`/`Space`/`ArrowDown` on trigger opens; `Up`/`Down` moves `aria-activedescendant`; `Enter` selects; `Escape` closes and refocuses trigger; `Tab` closes leaving natural focus order; single-character type-ahead jumps to matches when search is hidden; when search is visible it autofocuses and arrows move through filtered options.
- Semantics: trigger `role="combobox"` with `aria-expanded`, `aria-controls` (panel id), `aria-activedescendant` (active option id); panel `role="listbox"`; options `role="option"` with `aria-selected`; checkmark `aria-hidden="true"`; panel header count (e.g. "13 committees") `aria-hidden`, decorative.
- Motion: open = 160ms fade + 4px rise using `--duration-200` / `--ease-out-cubic` tokens; disabled entirely under `prefers-reduced-motion` via the existing global rule.
- States: empty `options` → "No options" disabled row; search with zero matches → `No matches for "x"` row; `disabled` → trigger dimmed (`--opacity-disabled`), non-interactive, `aria-disabled`; long labels truncate with ellipsis + `title` attribute.

## 5. Visual Design (DESIGN.md tokens)

- Trigger (closed): `surface-container` background, 2px bottom-only outline `#717881`, focus → bottom line `accent-cyan #00B5E2`; radius `var(--input-radius)`; min-height `var(--input-height)`; horizontal padding `var(--input-padding-x)`; selected value `on-surface`, placeholder `text-muted`; lucide `chevron-down` at right, rotates 180° when open (160ms transform).
- Panel (open): `surface-container-lowest` background (white = lifted per Layering Principle); single allowed ambient shadow (40px blur, 4% `on-surface`); `outline-variant` at 15% ghost border; radius `var(--card-radius)`; max-height 16rem with internal scroll; 45° clipped top edge (Wedge anchor, `clip-path` echoing `.btn-wedge`); `z-index` above sticky nav.
- Options: padding `0.625rem 1rem`; label `sm` semibold when selected else normal; hint line `xs` muted, 1-line clamp; hover/active option background shifts `surface-container-lowest → surface-container-low` (brighten-don't-lift rule); selected option gets primary left tick (3px bar) + checkmark icon + semibold label; no dividers — whitespace separation only.
- Panel header (only when search is visible): search input (same blueprint underline style, `role="searchbox"` with `aria-label="Filter options"`) + count badge in Authority-Chip language (primary-tinted tonal background).
- Contrast/responsive: all text uses existing `--color-*` vars (AA on tonal backgrounds); panel width matches trigger width, min 12rem; full-width on mobile within its container; honors `prefers-contrast: more` via the existing global rule.

## 6. Integration (8 mechanical swap-ins)

Each swap keeps its state hook/handler; only the JSX control changes (`value` + `onChange` map 1:1):

1. `src/components/ui/InterestForm.jsx` — committee: options from `committees` data with hints.
2. `src/features/recruitment/components/HeadsApplicationForm.jsx` — `boardInterest` (yes/no, no search), `firstPref` + `secondPref` (committees with hints), `activities` (yes/no, no search).
3. `src/features/admin/components/EventForm.jsx` — `event-category`, `event-organizer` (plain options, no search).
4. `src/features/admin/components/CommitteesTab.jsx` — `committee-category` (2 options, no search).
5. `src/features/admin/components/RecruitmentTab.jsx` — preference filter (non-required, placeholder "All preferences", value "" = all).

`.form-select` CSS remains for the hidden native elements (still focusable-by-validation); no visual footprint since hidden. Existing tests query by visible label text (`getByLabelText('Committee')`, `fireEvent.change(committee, …)` on native selects) — swap-ins must keep label association working; tests that `fireEvent.change` a native select will be updated to click-based selection in the same commit.

## 7. Tests (vitest + Testing Library)

`src/components/ui/Select.test.jsx` covers: renders placeholder; click opens panel with all options + hints; click option calls `onChange(value)` and closes; outside pointer-down and Escape close without `onChange`; ArrowDown opens, arrows move active, Enter selects; type-ahead jumps; search box appears only above threshold and filters (including no-match row); hidden native select carries `required`, `name`, current value; empty options row; disabled blocks open. Regression gate: full `npm test` green, especially `recruitment.test.jsx` (Join wizard), `InterestForm` honest-outcome assertions, and admin tab tests.

## 8. Out of Scope

Multi-select, async/paginated option loading, option grouping, mobile bottom-sheet variant, combobox free-text entry (strict single selection from the list only). Future Members recruitment form reuses this component with no changes.
