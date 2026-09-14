# Home Recruitment Band Design — IEEE HITU Website

Date: 2026-09-14
Status: Approved by user (Option A — status-aware band)
Scope: Teaser band for Heads recruitment on the Home page. No form fields on Home; full application stays on `/join-us`.

## 1. Goal

Give recruitment a high-presence, on-brand teaser on the Home page that is always honest: visible only while the admin has Heads recruitment open, completely absent otherwise.

## 2. Requirements (locked)

- Teaser band (headline + status + CTA to `/join-us`), not an embedded form.
- Placement: directly after `<Hero />`, before the event-status/featured block.
- Closed, missing-form (404), or error states render `null` — Home is byte-identical to today.
- Loading renders `null` (no skeleton, no reserved space, no layout shift for the closed case).
- Follows DESIGN.md: Wedge 135° gradient, Authority Chip, tonal layering, generous whitespace, no shadows/borders.

## 3. Component & Placement

New client component `src/features/home/components/RecruitmentBand.jsx` — owns its data, no changes to `HomePage` data flow:

- On mount fetches `fetchRecruitmentForm('heads')` from `@/lib/recruitment` with an `active` unmount guard (identical pattern to `JoinUsPage.jsx:10-17`).
- Internal status: `loading` → `null`; `ready` + `form.isOpen` → band; `ready` + closed, 404, or fetch error → `null`.
- `HomePage.jsx`: render `<RecruitmentBand />` immediately after `<Hero />`. Relative order of all existing bands (featured, partners, next, directory, recent) is untouched.

## 4. Visual (DESIGN.md tokens)

- Full-bleed section with 135° linear gradient `primary #004976 → primary-container #00629b` and a 45° clipped bottom edge (existing `.wedge-bg` language) transitioning into the page background.
- Inner `container max-w-6xl` block: Authority Chip ("Heads Recruitment — Open"), Display-scale headline "Lead an IEEE HITU Committee", one-line description from `form.description` (admin-editable, fallback "Apply to lead a committee as Head or Vice-Head."), committee count (`{committees.length} committees`, same data source as `/join-us`), white CTA button "Start your application" linking to `/join-us`.
- Inverted text (`#F0F4F8` headings, muted `#9BA9B4`-tone copy) matching Hero contrast on dark surfaces.
- Mobile: vertical stack (chip → headline → copy → count → full-width CTA).

## 5. States & Edge Cases

- Slow API: band inserts when the fetch resolves; the single downward push is accepted (reserving space would leave a permanent gap in the common closed case).
- Unmount before resolve: guarded, no state update (matches `Home` event-result pattern).
- No form logic, no draft, no validation on Home — the band links out; all application behavior remains owned by `/join-us`.

## 6. Tests (vitest + Testing Library)

Extend the Home block in `src/features/join-us/components/recruitment.test.jsx`: mock `@/lib/recruitment` `fetchRecruitmentForm` — open form → band heading + CTA with `href="/join-us"` render between the `h1` and "Featured next event"; closed form → band heading absent and existing band-order test unchanged. All existing Home/About/Membership/Contact assertions stay green.

## 7. Out of Scope

Embedded wizard or mini-form on Home, deadline/countdown display, Members-form awareness (band reads the `heads` form slug only), changes to Hero CTAs or navbar.
