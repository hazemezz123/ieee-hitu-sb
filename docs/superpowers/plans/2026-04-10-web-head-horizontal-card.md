# Web Head Horizontal Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the Web committee head card to a horizontal layout with the image on the left and the content on the right.

**Architecture:** Keep the current committee detail page structure and only update the reusable leader card layout in `src/pages/CommitteeDetailPage.jsx`. Preserve the existing responsive behavior by making the card stack vertically on small screens and switch to a two-column layout on larger screens.

**Tech Stack:** React 19, Vite, Tailwind CSS 4, ESLint

---

### Task 1: Update The Leader Card Layout

**Files:**
- Modify: `src/pages/CommitteeDetailPage.jsx`
- Verify: `npm run lint`
- Verify: `npm run build`

- [ ] **Step 1: Change the leader card wrapper to a responsive horizontal layout**

```jsx
<article className="bg-surface-container-low overflow-hidden md:grid md:grid-cols-[280px_minmax(0,1fr)]">
```

- [ ] **Step 2: Move the image into a fixed left column style**

```jsx
<img
  src={leader.image}
  alt={leader.name}
  className="h-72 w-full object-cover bg-surface-container md:h-full md:min-h-[320px]"
/>
```

- [ ] **Step 3: Wrap the textual content in a padded right-side content column**

```jsx
<div className="p-8 md:p-10 flex flex-col justify-center">
  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
    {leader.role}
  </p>
  <h3 className="text-2xl font-bold mb-3">{leader.name}</h3>
  <p className="text-on-surface-variant mb-6 leading-relaxed">{leader.bio}</p>
  <div className="flex items-center gap-4">
    ...
  </div>
</div>
```

- [ ] **Step 4: Run lint to verify the JSX change is valid**

Run: `npm run lint`
Expected: ESLint completes without errors.

- [ ] **Step 5: Run build to verify the page still compiles**

Run: `npm run build`
Expected: Vite build completes successfully and outputs production assets.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CommitteeDetailPage.jsx docs/superpowers/specs/2026-04-10-web-head-horizontal-card-design.md docs/superpowers/plans/2026-04-10-web-head-horizontal-card.md
git commit -m "feat: switch web head card to horizontal layout"
```
