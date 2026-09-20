# Hero Logo Drawing Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a vector stroke-drawing and fill fade-in animation for the IEEE HITU Student Branch logo in the Hero section, choreographed via GSAP.

**Architecture:** Implement an inlined SVG `<LogoMark />` component containing the exact vector path data from `public/logov2.svg`. In `Hero.jsx`, measure path lengths dynamically with fallback, configure initial transparent fills and stroke offsets, and orchestrate a smooth stroke-drawing followed by fill fade-in before revealing the rest of the Hero content.

**Tech Stack:** React 19, Next.js 16, GSAP 3.15, Tailwind CSS, Vitest & Testing Library.

---

### Task 1: Vector Component `<LogoMark />` and Test

**Files:**
- Create: `src/components/ui/LogoMark.jsx`
- Create: `src/components/ui/LogoMark.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/LogoMark.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import LogoMark from './LogoMark'

describe('LogoMark', () => {
  it('renders an accessible SVG with diamond and arch paths', () => {
    const { container } = render(<LogoMark className="custom-class" />)

    const svg = screen.getByRole('img', { name: /ieee hitu student branch logo/i })
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('viewBox')).toBe('0 0 1095 1095')
    expect(svg.classList.contains('custom-class')).toBe(true)

    const diamond = container.querySelector('[data-logo="diamond"]')
    expect(diamond).toBeTruthy()
    expect(diamond.getAttribute('fill-rule')).toBe('evenodd')

    const arch = container.querySelector('[data-logo="arch"]')
    expect(arch).toBeTruthy()
    expect(arch.getAttribute('fill-rule')).toBe('evenodd')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/LogoMark.test.jsx`
Expected: FAIL with "Cannot find module './LogoMark'"

- [ ] **Step 3: Implement `src/components/ui/LogoMark.jsx`**

Read path 1 and path 2 from `public/logov2.svg` and write `src/components/ui/LogoMark.jsx`:
```jsx
import { forwardRef } from 'react'
import { LOGO_ARCH_PATH, LOGO_DIAMOND_PATH } from './logoPaths'

const LogoMark = forwardRef(function LogoMark({ className = '', ...props }, ref) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1095 1095"
      role="img"
      aria-label="IEEE HITU Student Branch logo"
      className={className}
      {...props}
    >
      <title>IEEE HITU Student Branch logo</title>
      <path
        data-logo="diamond"
        d={LOGO_DIAMOND_PATH}
        fill="#00629b"
        stroke="#00b5e2"
        strokeWidth="6"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
      <path
        data-logo="arch"
        d={LOGO_ARCH_PATH}
        fill="#dcb656"
        stroke="#dcb656"
        strokeWidth="6"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
    </svg>
  )
})

export default LogoMark
```
And create `src/components/ui/logoPaths.js` with the verbatim `d` strings extracted from `public/logov2.svg`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/LogoMark.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/LogoMark.jsx src/components/ui/logoPaths.js src/components/ui/LogoMark.test.jsx
git commit -m "feat: add LogoMark vector component with accessible paths"
```

---

### Task 2: Integrate `<LogoMark />` and GSAP Drawing Animation in `Hero.jsx`

**Files:**
- Modify: `src/components/ui/Hero.jsx`

- [ ] **Step 1: Update `Hero.jsx` to render `<LogoMark />` and animate stroke-draw & fill**

In `src/components/ui/Hero.jsx`:
1. Import `LogoMark` from `@/components/ui/LogoMark`.
2. Replace `<img data-hero="logo" src="/logo.png" ... />` with `<LogoMark data-hero="logo" className="w-full max-w-[9rem] md:max-w-[11rem]" />`.
3. In `useEffect` with GSAP context:
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, display static logo mark with normal fade.
   - Otherwise, select the diamond and arch paths inside `[data-hero="logo"]`.
   - Measure `getTotalLength()` (or fallback default 4000 if not implemented in environment).
   - Set initial styles:
     ```js
     gsap.set([diamondPath, archPath], {
       strokeDasharray: (i, target) => (target.getTotalLength ? target.getTotalLength() : 4000),
       strokeDashoffset: (i, target) => (target.getTotalLength ? target.getTotalLength() : 4000),
       fillOpacity: 0,
       opacity: 1,
     })
     ```
   - In the master timeline:
     ```js
     tl.from('[data-hero="logo"]', { opacity: 0, scale: 0.94, duration: 0.4, ease: "power2.out" })
       .to([diamondPath, archPath], {
         strokeDashoffset: 0,
         duration: 1.2,
         ease: "power2.out",
         stagger: 0.15,
       }, "-=0.2")
       .to([diamondPath, archPath], {
         fillOpacity: 1,
         duration: 0.5,
         ease: "power1.inOut",
       }, "-=0.3")
       .from('[data-hero="slogan"]', { opacity: 0, y: 24 }, "-=0.1")
       .from('[data-hero="copy"]', { opacity: 0, y: 24 }, "-=0.4")
       .from('[data-hero="stat"]', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4")
       .from('[data-hero="ctas"] > *', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4")
     ```

- [ ] **Step 2: Run tests to verify compilation and behavior**

Run: `npx vitest run src/components/ui/Hero.test.jsx`
Check output and identify needed assertion updates in `Hero.test.jsx`.

---

### Task 3: Update and Expand `src/components/ui/Hero.test.jsx`

**Files:**
- Modify: `src/components/ui/Hero.test.jsx`

- [ ] **Step 1: Update `Hero.test.jsx` test suite**

Update tests:
1. Replace `document.querySelector('img[src="/logo.png"]')` with `screen.getByRole('img', { name: /ieee hitu student branch logo/i })`.
2. Verify both `[data-logo="diamond"]` and `[data-logo="arch"]` exist inside the Hero logo.
3. Verify `data-hero="logo"` is present and holds the accessible SVG.
4. Verify other assertions (CTAs, slogan, counts, canvas) remain green.

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Hero.test.jsx`
Expected: PASS (all tests in Hero.test.jsx pass)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Hero.jsx src/components/ui/Hero.test.jsx
git commit -m "feat: animate hero logo drawing with gsap stroke-draw and fill reveal"
```

---

### Task 4: Full Test Suite, Lint, and Build Verification

**Files:**
- Run project-wide checks.

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: PASS (33 test files, 279+ tests passing)

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: PASS (zero lint errors or warnings)

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS (Next.js production build succeeds)

- [ ] **Step 4: Commit any cleanup or final integration changes**

```bash
git status
```
Confirm clean working tree.
