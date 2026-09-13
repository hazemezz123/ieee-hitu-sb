# Technical Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic AI-styled presentation across the IEEE HITU public website with a factual technical-editorial system while preserving routes, event data behavior, accessibility, and admin CRUD workflows.

**Architecture:** Keep the existing React route and component structure. Add one small presentation-data module for shared event ordering and reliable committee-leader matching, make fallback provenance explicit at the existing event-source boundary, then restyle and recompose existing pages in four phases: shared system, recruitment pages, record pages, and admin alignment.

**Tech Stack:** React 19, React Router 7, Vite 8, Tailwind CSS 4, Framer Motion, Vitest, Testing Library, Turso with static event fallback.

---

## File Map

**Create**

- `src/data/presentation.js`: pure event ordering, next/recent selection, committee-leader aliases, and gallery aggregation.
- `src/data/presentation.test.js`: focused checks for all shared presentation logic.
- `src/data/eventsSource.test.js`: remote/fallback provenance and legacy return-contract checks.
- `src/components/Navbar.test.jsx`: active route and mobile navigation behavior.
- `src/components/Lightbox.test.jsx`: keyboard and focus behavior.
- `src/pages/recruitment.test.jsx`: factual home/about content and local form behavior.
- `src/pages/records.test.jsx`: committee, event, detail, and gallery route states.
- `src/pages/admin.test.jsx`: protected event-management workflows.

**Modify**

- `src/index.css`, `index.html`, `src/App.jsx`: global system, metadata, and shell.
- `src/components/Navbar.jsx`, `Footer.jsx`, `PageLayout.jsx`, `AnimatedSection.jsx`: shared navigation, directory, layout, and restrained motion.
- `src/components/Hero.jsx`, `TechnicalResources.jsx`: factual home identity and editorial resources.
- `src/pages/Home.jsx`, `AboutPage.jsx`, `MembershipPage.jsx`, `JoinUsPage.jsx`, `ContactPage.jsx`: recruitment content and flows.
- `src/data/eventsSource.js`, `src/data/committees.js`: explicit fallback provenance and removal of generated placeholder fields.
- `src/components/EventCard.jsx`, `MasonryGallery.jsx`, `Lightbox.jsx`: record presentation and gallery accessibility.
- `src/pages/CommitteesPage.jsx`, `CommitteeDetailPage.jsx`, `EventsPage.jsx`, `EventDetailPage.jsx`, `GalleryPage.jsx`: factual directory/archive layouts and data states.
- `src/pages/AdminPage.jsx`, `EventFormPage.jsx`: token-level alignment and protected form behavior.

**Delete**

- `src/components/HeroBackground.jsx`: global ambient canvas and cursor effects.
- `src/components/SectionDecorations.jsx`: content-free floating decoration.
- `src/components/ScrollIndicator.jsx`, `src/components/PageTransition.jsx`, `src/components/CountUp.jsx`: unused/decorative residue.

Do not remove Lenis in this redesign. It is already installed and its removal does not materially advance the approved visual outcome.

## Phase 1: Shared System

### Task 1: Add Shared Presentation Selectors

**Files:**
- Create: `src/data/presentation.js`
- Create: `src/data/presentation.test.js`
- Modify: `src/data/eventsSource.js`
- Create: `src/data/eventsSource.test.js`

- [ ] **Step 1: Write failing selector tests**

Cover chronological ordering, next-event selection, recent-event selection, exact committee aliases, ambiguous managers, and gallery metadata.

```js
import { describe, expect, it } from 'vitest'
import {
  aggregateGallery,
  findCommitteeLeaders,
  getNextEvents,
  getRecentEvents,
  sortEvents,
} from './presentation'

const events = [
  { slug: 'past', title: 'Past', date: '2026-01-01T10:00:00Z', gallery: [{ src: '/past.jpg', caption: 'Workshop' }] },
  { slug: 'next', title: 'Next', date: '2026-09-01T10:00:00Z', gallery: [] },
  { slug: 'later', title: 'Later', date: '2026-10-01T10:00:00Z', gallery: [] },
]

describe('presentation selectors', () => {
  it('orders and selects events without mutating input', () => {
    const original = [...events]
    expect(sortEvents(events).map(event => event.slug)).toEqual(['past', 'next', 'later'])
    expect(getNextEvents(events, new Date('2026-08-17T00:00:00Z'), 1)[0].slug).toBe('next')
    expect(getRecentEvents(events, new Date('2026-08-17T00:00:00Z'), 1)[0].slug).toBe('past')
    expect(events).toEqual(original)
  })

  it('matches only explicit committee aliases', () => {
    const members = [
      { name: 'A', committee: 'Automation', position: 'Head' },
      { name: 'B', committee: 'AI / CS / Web', position: 'Technical Software Manager' },
    ]
    expect(findCommitteeLeaders('automations', members).map(member => member.name)).toEqual(['A'])
    expect(findCommitteeLeaders('web', members)).toEqual([])
  })

  it('keeps event metadata on gallery images', () => {
    expect(aggregateGallery(events)[0]).toMatchObject({
      src: '/past.jpg', caption: 'Workshop', eventTitle: 'Past', eventDate: events[0].date, eventSlug: 'past',
    })
  })
})
```

- [ ] **Step 2: Run selectors to verify failure**

Run: `npm test -- src/data/presentation.test.js`

Expected: FAIL because `presentation.js` does not exist.

- [ ] **Step 3: Implement the pure selectors**

```js
const committeeAliases = {
  ai: ['AI'],
  automations: ['Automation'],
  robotics: ['Robotic'],
  multimedia: ['Multi Media'],
  hr: ['HR'],
  'training-development': ['T&D'],
}

export const sortEvents = events => [...events].sort((a, b) => new Date(a.date) - new Date(b.date))

export const getNextEvents = (events, now = new Date(), limit = events.length) =>
  sortEvents(events).filter(event => new Date(event.date) >= now).slice(0, limit)

export const getRecentEvents = (events, now = new Date(), limit = events.length) =>
  sortEvents(events).filter(event => new Date(event.date) < now).reverse().slice(0, limit)

export const findCommitteeLeaders = (slug, members) => {
  const aliases = committeeAliases[slug]
  if (!aliases) return []
  return members.filter(member => aliases.includes(member.committee) && /^(Head|Vice Head)$/.test(member.position))
}

export const aggregateGallery = events => events.flatMap(event =>
  (event.gallery || []).map(image => ({
    ...image,
    eventTitle: event.title,
    eventDate: event.date,
    eventSlug: event.slug,
  })),
)
```

Extend `committeeAliases` only with exact names confirmed in `src/data/committees.js` and `src/data/boardMembers.js`; never fuzzy-match multi-committee manager records.

- [ ] **Step 4: Write failing event-source provenance tests**

Mock `../lib/turso`. Require new metadata reads while preserving the existing array/event reads used by admin and pages not yet migrated.

```js
it('adds provenance without breaking existing reads', async () => {
  tursoFetchEvents.mockResolvedValue([{ slug: 'remote' }])
  await expect(fetchEventsResult()).resolves.toEqual({ events: [{ slug: 'remote' }], source: 'remote' })
  await expect(fetchEvents()).resolves.toEqual([{ slug: 'remote' }])

  tursoFetchEvents.mockRejectedValueOnce(new Error('offline'))
  await expect(fetchEventsResult()).resolves.toMatchObject({ source: 'fallback' })
})
```

- [ ] **Step 5: Run provenance tests to verify failure**

Run: `npm test -- src/data/eventsSource.test.js`

Expected: FAIL because `fetchEventsResult()` and `fetchEventBySlugResult()` do not exist.

- [ ] **Step 6: Add metadata reads beside the stable API**

```js
export async function fetchEventsResult() {
  try {
    return { events: await tursoFetchEvents(), source: 'remote' }
  } catch (error) {
    console.warn('Turso fetch failed, falling back to static:', error.message)
    return { events: staticEvents, source: 'fallback' }
  }
}

export async function fetchEvents() {
  return (await fetchEventsResult()).events
}

export async function fetchEventBySlugResult(slug) {
  try {
    return { event: await tursoFetchEventBySlug(slug), source: 'remote' }
  } catch (error) {
    console.warn('Turso fetch failed, falling back to static:', error.message)
    return { event: getStaticEventBySlug(slug), source: 'fallback' }
  }
}

export async function fetchEventBySlug(slug) {
  return (await fetchEventBySlugResult(slug)).event
}
```

CRUD exports remain unchanged.

- [ ] **Step 7: Verify and commit shared data logic**

Run: `npm test -- src/data/presentation.test.js src/data/eventsSource.test.js`

Expected: both test files PASS.

```bash
git add src/data/presentation.js src/data/presentation.test.js src/data/eventsSource.js src/data/eventsSource.test.js
git commit -m "refactor: centralize editorial presentation data"
```

### Task 2: Replace the Global Visual System and Shell

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/components/PageLayout.jsx`
- Modify: `src/components/AnimatedSection.jsx`
- Modify: `src/components/AnimatedSection.test.jsx`
- Create: `src/components/Navbar.test.jsx`
- Delete: `src/components/HeroBackground.jsx`
- Delete: `src/components/SectionDecorations.jsx`
- Delete: `src/components/ScrollIndicator.jsx`
- Delete: `src/components/PageTransition.jsx`
- Delete: `src/components/CountUp.jsx`

- [ ] **Step 1: Write failing shell behavior tests**

```jsx
it('marks nested routes active and closes the mobile menu after navigation', async () => {
  render(<MemoryRouter initialEntries={['/committees/web']}><Navbar /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'Committees' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(screen.getByRole('button', { name: /menu/i }))
  await userEvent.click(screen.getByRole('link', { name: 'Events' }))
  expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute('aria-expanded', 'false')
})
```

Extend `AnimatedSection.test.jsx` by mocking `useReducedMotion` and asserting `initial={false}` when motion is reduced.

- [ ] **Step 2: Run shell tests to verify failure**

Run: `npm test -- src/components/Navbar.test.jsx src/components/AnimatedSection.test.jsx`

Expected: FAIL on nested active state, route dismissal, or missing reduced-motion behavior.

- [ ] **Step 3: Replace global tokens and component primitives**

Keep existing CSS variable names where pages already consume them. Replace values and shared classes rather than adding a second design system.

```css
:root {
  --primary: #00629b;
  --primary-strong: #00476f;
  --surface: #f4f6f7;
  --surface-raised: #ffffff;
  --surface-inverse: #101820;
  --text: #17212b;
  --text-muted: #53616d;
  --signal: #d8ff3e;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --navbar-height: 4.5rem;
}

.editorial-band { background: var(--surface); }
.editorial-rule { border-top: 1px solid color-mix(in srgb, var(--text) 18%, transparent); }
.card { border-radius: var(--radius-md); background: var(--surface-raised); box-shadow: none; }
.btn { border-radius: var(--radius-sm); transition: background-color 160ms ease, color 160ms ease; }
.form-input { border-radius: var(--radius-sm); background: var(--surface-raised); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

Delete glass blur, ambient glow, floating, card-lift, decorative pattern, and incomplete utility rules. Preserve visible `:focus-visible`, form errors, layout container, and Tailwind token mappings.

- [ ] **Step 4: Simplify the app shell and metadata**

Remove `HeroBackground` import/render from `App.jsx`. In `index.html`, set the title to `IEEE HITU Student Branch`, retain required fonts/icons, and remove the localhost-only design script.

Use nested-route matching in `Navbar.jsx`:

```js
const isActive = path => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
```

Use a solid compact navigation surface, route-change menu dismissal, Escape dismissal, body overflow restoration, and `aria-current="page"`. Rebuild `Footer.jsx` as verified internal route links plus institutional identity; remove `href="#"` and unverified social/privacy links.

- [ ] **Step 5: Restrain shared motion**

```jsx
import { motion, useReducedMotion } from 'framer-motion'

const reduceMotion = useReducedMotion()
return (
  <motion.div
    initial={reduceMotion ? false : 'hidden'}
    {...(reduceMotion ? {} : visibilityProps)}
    custom={delay}
    variants={variants}
    className={className}
  >
    {children}
  </motion.div>
)
```

Reduce default displacement to `12px`, duration to `0.3s`, and stagger to `0.05s`. Keep `PageLayout` as the one route wrapper.

- [ ] **Step 6: Delete decorative residue and remove imports**

Delete the listed five files and remove every `SectionDecorations` import/render. Do not replace them with new decorative components.

- [ ] **Step 7: Verify phase 1 and commit**

Run sequentially: `npm run lint`, then `npm test -- src/components/Navbar.test.jsx src/components/AnimatedSection.test.jsx`, then `npm run build`.

Expected: lint exits 0, tests PASS, Vite build exits 0.

```bash
git add index.html src/App.jsx src/index.css src/components
git commit -m "refactor: establish technical editorial shell"
```

## Phase 2: Recruitment Pages

### Task 3: Recompose Home and About Around Repository Evidence

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/AboutPage.jsx`
- Create: `src/pages/recruitment.test.jsx`

- [ ] **Step 1: Write failing factual-content and data-state tests**

Mock `fetchEventsResult()` with `{ events, source }`. Assert:

```jsx
expect(screen.getByRole('heading', { level: 1, name: 'IEEE HITU Student Branch' })).toBeVisible()
expect(screen.getByRole('link', { name: /view events/i })).toHaveAttribute('href', '/events')
expect(screen.getByRole('link', { name: /join the branch/i })).toHaveAttribute('href', '/join-us')
expect(screen.queryByText('Beyond Labels. Beyond Limits.')).not.toBeInTheDocument()
expect(screen.queryByText(/learn, grow, connect/i)).not.toBeInTheDocument()
```

Test remote data, fallback notice, and all-events-empty state. Test About renders repository-backed counts and omits unsupported history claims.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/pages/recruitment.test.jsx`

Expected: FAIL on old slogan/inactive buttons and old event return shape.

- [ ] **Step 3: Make `Hero` a factual identity block**

Keep the logo as the primary visual asset. Use Router links, no parallax, no floating animation, and literal branch identity.

```jsx
<section aria-labelledby="home-title" className="min-h-[calc(100svh-var(--navbar-height))] grid items-end">
  <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_0.6fr]">
    <div>
      <p className="section-label">Heliopolis International Technological University</p>
      <h1 id="home-title">IEEE HITU Student Branch</h1>
      <p>Technical learning, student-led committees, and IEEE opportunities rooted at HITU.</p>
      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/events">View events</Link>
        <Link className="btn btn-secondary" to="/join-us">Join the branch</Link>
      </div>
    </div>
    <img src={logo} alt="IEEE HITU Student Branch" />
  </div>
</section>
```

- [ ] **Step 4: Recompose Home with selectors**

Call `fetchEventsResult()`, select `nextEvents` and `recentEvents`, and derive counts from `events`, `committees`, and `boardMembers`. Render one featured next event, compact counts, next-event records, a numbered committee directory, and recent event records. If events are empty, render one shared event empty state linking to `/contact` and omit event subsections.

- [ ] **Step 5: Recompose About from approved sources**

Use `PRODUCT.md` facts as literal page copy, `boardMembers` for leadership, and derived event/committee counts. Do not render unsupported history, global-impact claims, generated testimonials, or generic icon cards.

- [ ] **Step 6: Verify and commit Home/About**

Run sequentially: `npm test -- src/pages/recruitment.test.jsx`, then `npm run build`.

Expected: tests PASS and Vite build exits 0.

```bash
git add src/components/Hero.jsx src/pages/Home.jsx src/pages/AboutPage.jsx src/pages/recruitment.test.jsx
git commit -m "feat: ground home and about in branch evidence"
```

### Task 4: Make Participation and Contact Flows Factual

**Files:**
- Modify: `src/pages/MembershipPage.jsx`
- Modify: `src/pages/JoinUsPage.jsx`
- Modify: `src/pages/ContactPage.jsx`
- Modify: `src/components/TechnicalResources.jsx`
- Modify: `src/pages/recruitment.test.jsx`

- [ ] **Step 1: Add failing participation tests**

Assert Membership has no unsupported pricing/testimonials and links to Join; Join and Contact show local-placeholder disclosure; labels are associated with inputs; validation keeps values; Technical Resources has no inert destinations.

```jsx
expect(screen.queryByText(/free|pricing|cancel anytime/i)).not.toBeInTheDocument()
expect(screen.getByRole('link', { name: /start with ieee hitu/i })).toHaveAttribute('href', '/join-us')
expect(screen.getByText(/local demonstration/i)).toBeVisible()
expect(screen.getByLabelText(/email/i)).toHaveValue('student@hitu.edu.eg')
```

- [ ] **Step 2: Run participation tests to verify failure**

Run: `npm test -- src/pages/recruitment.test.jsx`

Expected: FAIL on unsupported claims, missing label associations, or form reset behavior.

- [ ] **Step 3: Replace Membership claims with a clear path**

Keep only factual opportunities: committee participation, branch events, IEEE resources, peer-led practice, eligibility, and expectations. Use a single primary link to `/join-us` and a secondary verified external IEEE membership link already present in the repository. Delete fabricated tiers, prices, statistics, testimonials, and payment FAQs.

- [ ] **Step 4: Tighten Join and Contact forms**

Use `id`/`htmlFor` on all controls, derive committee options/count from `committees`, preserve values on validation errors, and show this adjacent disclosure:

```jsx
<p className="form-note" role="note">
  This form is a local demonstration and does not send an application. Use the contact page for current participation instructions.
</p>
```

Do not announce a successful submission unless data was actually sent. For the current local form, set a neutral submitted state explaining that no application was transmitted.

- [ ] **Step 5: Restyle Technical Resources without changing destinations**

Use an editorial link list with resource name, short factual description, and external-link indication. Remove card lift, generic claims, and decoration. Keep only verified URLs already in the component.

- [ ] **Step 6: Verify phase 2 and commit**

Run sequentially: `npm run lint`, then `npm test -- src/pages/recruitment.test.jsx`, then `npm run build`.

Expected: lint exits 0, tests PASS, build exits 0.

```bash
git add src/pages/MembershipPage.jsx src/pages/JoinUsPage.jsx src/pages/ContactPage.jsx src/components/TechnicalResources.jsx src/pages/recruitment.test.jsx
git commit -m "feat: clarify participation and contact paths"
```

## Phase 3: Record and Archive Pages

### Task 5: Replace Placeholder Committees with a Verified Directory

**Files:**
- Modify: `src/data/committees.js`
- Modify: `src/pages/CommitteesPage.jsx`
- Modify: `src/pages/CommitteeDetailPage.jsx`
- Create: `src/pages/records.test.jsx`

- [ ] **Step 1: Write failing committee tests**

```jsx
it('shows repository-backed committee data without generated leadership', () => {
  renderRoute('/committees/web')
  expect(screen.getByRole('heading', { name: 'Web' })).toBeVisible()
  expect(screen.queryByText(/placeholder profile/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /github|linkedin/i })).not.toBeInTheDocument()
})
```

Also assert directory numbering, category grouping, exact detail links, explicit matched leaders, and not-found behavior.

- [ ] **Step 2: Run committee tests to verify failure**

Run: `npm test -- src/pages/records.test.jsx`

Expected: FAIL because committee factories inject goals, roles, biographies, social links, and email placeholders.

- [ ] **Step 3: Remove generated fields at the source**

Reduce `createCommittee()` output to existing factual directory fields:

```js
const createCommittee = ({ name, slug, category, memberCount, shortDescription }) => ({
  name,
  slug,
  category,
  categoryLabel: categoryLabelMap[category],
  memberCount,
  shortDescription,
})
```

Remove placeholder arrays, fake leaders, slogan, decorative icon, fake email/social URLs, and placeholder asset import. Preserve each committee's existing name, slug, category, member count, and short description.

- [ ] **Step 4: Build the numbered directory and profile sheet**

Use `findCommitteeLeaders(committee.slug, boardMembers)`. Directory rows show number, name, category, description, member count, matched lead if any, and detail link. Detail pages show only mandate, category, member count, and matched leadership. Omit empty leadership/contact sections.

- [ ] **Step 5: Verify and commit committees**

Run sequentially: `npm test -- src/data/presentation.test.js src/pages/records.test.jsx`, then `npm run build`.

Expected: tests PASS and build exits 0.

```bash
git add src/data/committees.js src/pages/CommitteesPage.jsx src/pages/CommitteeDetailPage.jsx src/pages/records.test.jsx
git commit -m "feat: replace committee placeholders with verified records"
```

### Task 6: Turn Events into a Chronological Program

**Files:**
- Modify: `src/components/EventCard.jsx`
- Modify: `src/pages/EventsPage.jsx`
- Modify: `src/pages/EventDetailPage.jsx`
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/AboutPage.jsx`
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/pages/AdminPage.jsx`
- Modify: `src/pages/EventFormPage.jsx`
- Modify: `src/pages/records.test.jsx`
- Modify: `src/pages/recruitment.test.jsx`

- [ ] **Step 1: Add failing event route-state tests**

Mock `fetchEventsResult()` and `fetchEventBySlugResult()`. Cover loading, remote records, fallback notice, remote-empty state, filtered-empty state, unknown slug, optional-field omission, stable image fallback, chronological order, and metadata.

```jsx
expect(await screen.findByText(/showing saved fallback event information/i)).toBeVisible()
expect(screen.getAllByTestId('event-record').map(row => row.dataset.slug)).toEqual(['earlier', 'later'])
expect(screen.getByRole('link', { name: /event title/i })).toHaveAttribute('href', '/events/event-title')
```

- [ ] **Step 2: Run event tests to verify failure**

Run: `npm test -- src/data/eventsSource.test.js src/pages/records.test.jsx src/pages/recruitment.test.jsx`

Expected: FAIL until public event pages use the metadata-returning reads.

- [ ] **Step 3: Migrate public event pages to metadata reads**

Use this pattern in list pages:

```js
const [{ events, source }, setResult] = useState({ events: [], source: 'remote' })
// In load():
setResult(await fetchEventsResult())
```

Use this pattern in details:

```js
const result = await fetchEventBySlugResult(slug)
setEvent(result.event)
setSource(result.source)
```

Home and About already use `fetchEventsResult()` from Task 3. Gallery migrates here. Admin and Event Form keep `fetchEvents()` unchanged and do not show a public fallback notice.

- [ ] **Step 4: Restyle EventCard as a record**

Show date, title, status, category, location, and committee. Use a fixed image aspect ratio only when a real image exists. On image error, replace the media area with a stable neutral panel labeled with the event title; do not substitute the unrelated Web image.

- [ ] **Step 5: Recompose Events and Event Detail**

Sort with `sortEvents()`. Preserve category filters. Render metadata rows instead of icon/stat cards. Use one shared fallback notice and distinct empty states. Replace raw anchors with Router `Link`. Omit empty gallery, end date, organizer, excerpt, and description sections.

- [ ] **Step 6: Verify and commit events**

Run sequentially: `npm run lint`, then `npm test -- src/data/eventsSource.test.js src/pages/records.test.jsx src/pages/recruitment.test.jsx`, then `npm run build`.

Expected: lint exits 0, tests PASS, build exits 0.

```bash
git add src/components/EventCard.jsx src/pages
git commit -m "feat: present events as a chronological program"
```

### Task 7: Make the Gallery a Documented Accessible Archive

**Files:**
- Modify: `src/pages/GalleryPage.jsx`
- Modify: `src/components/MasonryGallery.jsx`
- Modify: `src/components/Lightbox.jsx`
- Create: `src/components/Lightbox.test.jsx`
- Modify: `src/pages/records.test.jsx`

- [ ] **Step 1: Write failing archive and lightbox tests**

```jsx
it('traps focus and restores it when closed', async () => {
  const trigger = document.createElement('button')
  document.body.append(trigger)
  trigger.focus()
  const { unmount } = render(<Lightbox images={images} currentIndex={0} onClose={onClose} onNavigate={onNavigate} />)
  expect(screen.getByRole('button', { name: /close/i })).toHaveFocus()
  await userEvent.tab()
  expect(screen.getByRole('button', { name: /next/i })).toHaveFocus()
  unmount()
  expect(trigger).toHaveFocus()
})
```

Also test Escape, arrow navigation, one-image controls, caption/alt, gallery event title/date/link, image failure, fallback notice, and empty archive link to Events.

- [ ] **Step 2: Run archive tests to verify failure**

Run: `npm test -- src/components/Lightbox.test.jsx src/pages/records.test.jsx`

Expected: FAIL on focus behavior and missing parent event metadata.

- [ ] **Step 3: Preserve archive metadata during aggregation**

Use `aggregateGallery(events)` and render event title, formatted date, caption, and `/events/:slug` link for every image. Use stable dimensions and a neutral failure state. If empty, explain that no event photography is available and link to `/events`.

- [ ] **Step 4: Add dialog focus management**

In `Lightbox`, store `document.activeElement` and the previous body overflow value in refs. Focus close on mount, cycle Tab/Shift+Tab through visible dialog buttons, restore focus and overflow on unmount, and retain Escape/arrow behavior. Use Material Symbols already loaded in `index.html` instead of maintaining custom SVG icon components.

- [ ] **Step 5: Verify phase 3 and commit**

Run sequentially: `npm run lint`, then `npm test -- src/data/presentation.test.js src/data/eventsSource.test.js src/pages/records.test.jsx src/components/Lightbox.test.jsx`, then `npm run build`.

Expected: lint exits 0, tests PASS, build exits 0.

```bash
git add src/pages/GalleryPage.jsx src/components/MasonryGallery.jsx src/components/Lightbox.jsx src/components/Lightbox.test.jsx src/pages/records.test.jsx
git commit -m "feat: make gallery a documented archive"
```

## Phase 4: Admin Alignment and Full Verification

### Task 8: Align Admin Controls Without Changing Workflow

**Files:**
- Modify: `src/pages/AdminPage.jsx`
- Modify: `src/pages/EventFormPage.jsx`
- Create: `src/pages/admin.test.jsx`

- [ ] **Step 1: Write failing admin workflow tests**

Cover login/session restore, wrong password, event load/error/empty, create/edit navigation, delete cancel/confirm/refresh, edit hydration, slug generation, required fields, invalid gallery JSON, API failure, and cancel navigation.

```jsx
it('keeps invalid gallery JSON and blocks save', async () => {
  renderRoute('/admin/events/new')
  await userEvent.type(screen.getByLabelText(/gallery json/i), '{bad json')
  await userEvent.click(screen.getByRole('button', { name: /create event/i }))
  expect(screen.getByText(/gallery must be valid json/i)).toBeVisible()
  expect(screen.getByLabelText(/gallery json/i)).toHaveValue('{bad json')
  expect(createEvent).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run admin tests to verify failure**

Run: `npm test -- src/pages/admin.test.jsx`

Expected: FAIL because invalid gallery JSON is silently replaced with `[]` and labels are not associated.

- [ ] **Step 3: Apply token-level styling only**

Keep component layout, authentication, table, modal, and CRUD structure. Replace malformed hover utilities and route all buttons/inputs through existing `.btn`, `.form-input`, `.form-label`, error, and focus classes.

- [ ] **Step 4: Fix form labels and JSON validation**

Add stable IDs and `htmlFor` to every field. Replace silent parsing fallback:

```js
let gallery
try {
  gallery = JSON.parse(form.gallery)
  if (!Array.isArray(gallery)) throw new Error()
} catch {
  setError('Gallery must be valid JSON containing an array.')
  return
}
```

Retain form input and remain on the route after validation or API errors.

- [ ] **Step 5: Verify admin behavior and commit**

Run sequentially: `npm test -- src/pages/admin.test.jsx`, then `npm run build`.

Expected: tests PASS and build exits 0.

```bash
git add src/pages/AdminPage.jsx src/pages/EventFormPage.jsx src/pages/admin.test.jsx
git commit -m "refactor: align admin controls with editorial system"
```

### Task 9: Verify Every Route and Remove Remaining Slop

**Files:**
- Modify only files implicated by verification findings.

- [ ] **Step 1: Run the full automated gate**

Run sequentially: `npm run lint`, then `npm test`, then `npm run build`.

Expected: ESLint exits 0, Vitest reports all tests passing, and Vite build exits 0.

- [ ] **Step 2: Start the production-like preview**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL. Keep the server running for browser checks.

- [ ] **Step 3: Inspect exact routes at 390x844 and 1440x900**

Check `/`, `/about`, `/join-us`, `/committees`, one valid committee detail, one invalid committee detail, `/membership`, `/events`, one valid event detail, one invalid event detail, `/gallery`, `/contact`, `/admin`, `/admin/events/new`, and one existing edit route.

For each route verify: factual H1, no horizontal overflow, no text overlap, stable media, working primary action where applicable, visible keyboard focus, usable mobile navigation, and no repeated generic hero/card-grid formula.

- [ ] **Step 4: Exercise behavior and accessibility workflows**

Keyboard-complete desktop/mobile navigation, Join form, Contact form, event filters, gallery/lightbox, admin login, create validation, edit, delete cancel, and delete confirm. Emulate reduced motion and confirm decorative canvas, floating controls, cursor glow, and continuous motion are absent.

- [ ] **Step 5: Run diagnostics**

Use the browser console/network tools and Lighthouse accessibility audit on Home, Events, Gallery, Contact, and Admin at desktop and mobile sizes.

Expected: zero console errors, zero failed first-party requests under normal connectivity, no critical/high accessibility findings, and WCAG 2.2 AA color contrast. External image failures must show stable fallbacks and not count as first-party failures.

- [ ] **Step 6: Search for prohibited residue**

Run:

```bash
rg -n "Beyond Labels|learn, grow|backdrop-blur|glass|float|cursor glow|Placeholder profile|href=\"#\"|group-hover:\s|hover:\s" src index.html
```

Expected: no matches except factual comments/tests that explicitly assert absence.

- [ ] **Step 7: Fix only observed defects and rerun the full gate**

Run sequentially: `npm run lint`, then `npm test`, then `npm run build`.

Expected: all commands exit 0 after fixes.

- [ ] **Step 8: Commit verification fixes**

```bash
git add src index.html
git commit -m "fix: resolve full-site redesign verification findings"
```

Skip this commit if verification required no file changes; do not create an empty commit.

## Out of Scope

- Do not add a CMS, design-system package, icon package, browser-test dependency, or new animation library.
- Do not change Turso schema, event CRUD endpoints, admin authentication design, or hosting.
- Do not publish personal board-member phone numbers or emails without explicit verification.
- Do not invent branch history, testimonials, prices, committee work, contact channels, or impact metrics.
- The client-exposed Turso write token is a separate security issue requiring credential rotation and a server write boundary; do not mix that migration into this visual redesign.
