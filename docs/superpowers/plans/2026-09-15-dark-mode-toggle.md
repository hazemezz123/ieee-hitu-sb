# Dark Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working site-wide dark-mode toggle driven by CSS token inversion.

**Architecture:** A single `ThemeProvider` owns the theme (`localStorage` → system → light), writes it to `document.documentElement.dataset.theme` (plus a pre-hydration head script against flash), a `[data-theme="dark"]` token block in `globals.css` flips every token-built surface, and one sun/moon button in the navbar toggles it.

**Tech Stack:** Next.js App Router, React context, CSS custom properties, Tailwind v4 utilities, vitest + Testing Library.

---

## File map

- Create `src/lib/theme.jsx` — `THEME_KEY`, `resolveTheme`, `getInitialTheme`, `applyTheme`, `ThemeProvider`, `useTheme`. One file, one responsibility: theme state.
- Create `src/lib/theme.test.jsx` — unit tests for the helpers, provider, and hook.
- Modify `src/app/layout.js` — remove hardcoded `data-theme="dark"`, mount `ThemeProvider`, add blocking theme-init head script.
- Modify `src/app/globals.css` — append `[data-theme="dark"]` token overrides plus three scoped rules (primary-button text, file-button text, navbar logo).
- Modify `src/components/navbar.jsx` — add the toggle button using `useTheme`.
- Modify `src/components/navbar.test.jsx` — add toggle behavior tests (existing tests keep passing: `useTheme` falls back to a light default outside a provider).

Pre-existing (already in the working tree, uncommitted): the navbar `<img>` carries the `navbar-logo` hook class (`className="navbar-logo h-9 w-auto"`), and the navbar/header use the original light token classes. Do not re-add or rename the hook class.

## Conventions to follow

- Guard every `localStorage`/`window`/`document` touch with try/catch or typeof checks (private-mode pattern used for drafts in `HeadsApplicationForm.jsx`).
- Test commands look like `npm test -- src/lib/theme.test.jsx`; lint touched JS files with `npx eslint <files>`; finish with full `npm test` and `npm run build`.
- Commit after each task with the message given in its last step. Stage only the files that task lists.

---

### Task 1: Pure theme resolution helper + test

**Files:**
- Create: `src/lib/theme.test.jsx`
- Create: `src/lib/theme.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('prefers a valid stored choice over the system', () => {
    expect(resolveTheme({ stored: 'dark', systemDark: false })).toBe('dark')
    expect(resolveTheme({ stored: 'light', systemDark: true })).toBe('light')
  })
  it('falls back to the system preference, then light', () => {
    expect(resolveTheme({ stored: null, systemDark: true })).toBe('dark')
    expect(resolveTheme({ stored: 'sepia', systemDark: false })).toBe('light')
    expect(resolveTheme({ stored: null, systemDark: false })).toBe('light')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/theme.test.jsx`
Expected: FAIL with "Failed to resolve import './theme'" (file does not exist yet)

- [ ] **Step 3: Write minimal implementation**

```jsx
export const THEME_KEY = 'ieee-hitu-theme'

export function resolveTheme({ stored, systemDark } = {}) {
  if (stored === 'light' || stored === 'dark') return stored
  return systemDark ? 'dark' : 'light'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/theme.test.jsx`
Expected: PASS (2 passed)

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.jsx src/lib/theme.test.jsx
git commit -m "feat: add pure theme resolution helper"
```

---

### Task 2: Theme provider, hook, and DOM helpers + tests

**Files:**
- Modify: `src/lib/theme.jsx`
- Modify: `src/lib/theme.test.jsx`

- [ ] **Step 1: Write the failing tests** (append to `src/lib/theme.test.jsx`)

```jsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, applyTheme, getInitialTheme, useTheme } from './theme'

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  window.localStorage.clear()
  vi.restoreAllMocks()
})

function Probe() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>current:{theme}</button>
}

describe('getInitialTheme', () => {
  it('uses the stored choice first', () => {
    window.localStorage.setItem('ieee-hitu-theme', 'dark')
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(getInitialTheme()).toBe('dark')
  })
  it('falls back to the system preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(getInitialTheme()).toBe('dark')
  })
  it('falls back to light with no storage and no matchMedia', () => {
    vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => { throw new Error('denied') })
    delete window.matchMedia
    expect(getInitialTheme()).toBe('light')
  })
})

describe('applyTheme', () => {
  it('writes the attribute and color scheme', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })
})

describe('ThemeProvider', () => {
  it('applies the stored theme and toggles with persistence', () => {
    window.localStorage.setItem('ieee-hitu-theme', 'light')
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByRole('button', { name: 'current:light' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'current:light' }))
    expect(screen.getByRole('button', { name: 'current:dark' })).toBeTruthy()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ieee-hitu-theme')).toBe('dark')
  })
  it('toggles without crashing when storage is unavailable', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => { throw new Error('denied') })
    render(<ThemeProvider><Probe /></ThemeProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'current:light' }))
    expect(screen.getByRole('button', { name: 'current:dark' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/theme.test.jsx`
Expected: FAIL — `getInitialTheme`, `applyTheme`, `ThemeProvider`, `useTheme` are not exported (only `resolveTheme` exists)

- [ ] **Step 3: Write minimal implementation** (append to `src/lib/theme.jsx`; add `'use client'` as the very first line of the file, above the `THEME_KEY` export from Task 1)

```jsx
'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

export function getInitialTheme() {
  try {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem(THEME_KEY)
    const systemDark = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
    return resolveTheme({ stored, systemDark })
  } catch { return 'light' }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  useEffect(() => { applyTheme(theme) }, [theme])
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { window.localStorage.setItem(THEME_KEY, next) } catch { /* private mode: theme applies for this visit only */ }
      return next
    })
  }, [])
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/theme.test.jsx`
Expected: PASS (all tests in the file)

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.jsx src/lib/theme.test.jsx
git commit -m "feat: add theme provider with stored/system/light resolution"
```

---

### Task 3: Wire the provider and pre-hydration script into layout

**Files:**
- Modify: `src/app/layout.js`

- [ ] **Step 1: Edit `src/app/layout.js`** — replace the import block, the `<html>` tag, and the body wrapper exactly as shown (nothing else in the file changes)

```js
import './globals.css'
import Script from 'next/script'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import LenisProvider from '@/lib/LenisProvider'
import { ThemeProvider } from '@/lib/theme'

const themeInitScript = `(function(){try{var t=localStorage.getItem('ieee-hitu-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`
```

```jsx
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
```

```jsx
      <body>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-7FMS8J5THQ" />
        <Script id="gtag-init">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-7FMS8J5THQ')`}
        </Script>
        <ThemeProvider>
          <LenisProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
```

- [ ] **Step 2: Lint the touched file**

Run: `npx eslint src/app/layout.js`
Expected: 0 errors

- [ ] **Step 3: Build to verify the layout compiles**

Run: `npm run build`
Expected: exit 0 with the route table printed and no errors

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.js
git commit -m "feat: mount theme provider with pre-hydration theme script"
```

---

### Task 4: Dark token block and scoped rules in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Append this block at the end of `src/app/globals.css`** (nothing else in the file changes; the `@theme inline` mappings reference these same `var()` names, so every token-built surface flips automatically)

```css
[data-theme="dark"] {
  color-scheme: dark;
  --surface: #0b1322;
  --surface-raised: #141f30;
  --surface-inverse: #060b14;
  --text: #e9eff5;
  --text-muted: #9BA9B4;
  --primary: #6aaed6;
  --primary-strong: #8fcae8;
  --color-surface-container-lowest: #141f30;
  --color-surface-container-low: #182437;
  --color-surface-container: #1f2f49;
  --color-surface-container-high: #27395a;
  --color-surface-container-highest: #31486f;
  --color-surface-bright: #1b2942;
  --color-surface-dim: #1f2f49;
  --color-surface-variant: #1f2f49;
  --color-primary-container: #6aaed6;
  --color-on-primary-container: #06283d;
  --color-primary-fixed: #12395a;
  --color-primary-fixed-dim: #1d4566;
  --color-on-primary-fixed: #cfe8f7;
  --color-on-primary-fixed-variant: #8fcae8;
  --color-secondary: #6aa9c4;
  --color-secondary-container: #14324a;
  --color-on-secondary-container: #cfe6f2;
  --color-secondary-fixed: #14324a;
  --color-secondary-fixed-dim: #1d4566;
  --color-on-secondary-fixed: #cfe6f2;
  --color-on-secondary-fixed-variant: #8fb8cf;
  --color-tertiary: #9aa7b2;
  --color-tertiary-container: #1c2836;
  --color-on-tertiary: #0b1322;
  --color-tertiary-fixed: #1c2836;
  --color-tertiary-fixed-dim: #2a3a4f;
  --color-on-tertiary-fixed: #d7dee5;
  --color-on-tertiary-fixed-variant: #9aa7b2;
  --color-outline: #8fa0b3;
  --color-outline-variant: #2c3e5e;
  --color-error: #ff6b61;
  --color-error-container: #40211d;
  --color-on-error: #2a0f0c;
  --color-on-error-container: #ffc9c2;
}

/* White primary buttons keep dark text on the lightened dark-mode primary. */
[data-theme="dark"] .btn-primary { color: #06283d; }
[data-theme="dark"] .form-file::file-selector-button,
[data-theme="dark"] .form-file::-webkit-file-upload-button { color: #06283d; }

/* Theme-aware navbar logo: full color in light mode, white in dark mode. */
[data-theme="dark"] .navbar-logo { filter: brightness(0) invert(1); }
```

- [ ] **Step 2: Build to verify the stylesheet compiles**

Run: `npm run build`
Expected: exit 0 with the route table printed and no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add dark theme tokens and theme-aware logo rule"
```

---

### Task 5: Navbar toggle button + tests

**Files:**
- Modify: `src/components/navbar.jsx`
- Modify: `src/components/navbar.test.jsx`

- [ ] **Step 1: Write the failing tests** (append inside the existing `describe('Navbar', ...)` block in `src/components/navbar.test.jsx`; add the `ThemeProvider` import at the top: `import { ThemeProvider } from '@/lib/theme'`)

```jsx
  it('toggles the theme and persists the choice', () => {
    window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    render(<ThemeProvider><Navbar /></ThemeProvider>)

    const toDark = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(toDark)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ieee-hitu-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeTruthy()
  })

  it('renders the toggle without a provider (light default)', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeTruthy()
  })
```

Also extend the existing `afterEach` in `src/components/navbar.test.jsx` to reset theme state between tests:

```js
afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  window.localStorage.clear()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/navbar.test.jsx`
Expected: FAIL — "Unable to find an accessible element with the role button and name /switch to dark mode/i" (no toggle exists yet)

- [ ] **Step 3: Write minimal implementation** — in `src/components/navbar.jsx`, add the `useTheme` import and the button exactly as shown (nothing else in the file changes)

```jsx
import { useTheme } from '@/lib/theme'
```

```jsx
export default function Navbar() {
  const [openPath, setOpenPath] = useState(null)
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
```

Place this button after the desktop links `<div>` and before the `Join IEEE` link:

```jsx
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={dark}
          className="nav-menu-button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/navbar.test.jsx`
Expected: PASS (all tests in the file, old and new)

- [ ] **Step 5: Commit**

```bash
git add src/components/navbar.jsx src/components/navbar.test.jsx
git commit -m "feat: add navbar dark-mode toggle"
```

---

### Task 6: Full verification and contrast audit

**Files:** none (verification only; fix-and-commit only if the audit finds a real readability bug, scoped to the offending component)

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: all test files pass, 0 failures

- [ ] **Step 2: Lint touched files**

Run: `npx eslint src/lib/theme.jsx src/lib/theme.test.jsx src/app/layout.js src/components/navbar.jsx src/components/navbar.test.jsx`
Expected: 0 errors

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: exit 0 with the route table printed and no errors

- [ ] **Step 4: Manual theme audit** (dev server + browser)

1. Load `/` with no saved theme and OS set to light → site renders light; set OS to dark and reload → site renders dark.
2. Click the navbar toggle → theme flips immediately; reload → choice persists.
3. The toggle button is visible on desktop and on mobile (header bar, left of the hamburger).
4. Walk `/`, `/about`, `/committees`, `/events`, `/join-us`, `/contact`, `/admin` in both themes: body text, headings, cards, buttons, inputs, footer, and the permanently-dark Hero/band/footer blocks stay readable with no white-on-white or dark-on-dark text.
5. Keyboard: tab to the toggle, visible focus ring in both themes; Escape still closes the mobile menu.
6. No horizontal overflow at 375px and 1280px widths in either theme.

- [ ] **Step 5: Commit** (only if Step 4 required fixes; otherwise nothing to commit — record "verified, no changes" and finish)
