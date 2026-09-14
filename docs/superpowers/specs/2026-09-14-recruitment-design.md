# Recruitment Forms Design — IEEE HITU Website

Date: 2026-09-14
Status: Approved by user (Option A — Dynamic forms system)
Scope: Heads & Vice-Heads recruitment form now; Members form later (data model ready, no rebuild).

## 1. Goal

Replace the local-only Join Us demo with a real, admin-controlled recruitment system that follows DESIGN.md (Architectural Blueprint, tonal layering, No-Line rule, Wedge geometry) and feels special via a stepped wizard + closed-state design.

## 2. Requirements (locked)

Fields for Heads form (22 incl. auto timestamp):
1. Timestamp — server `created_at`, never user input
2. Name (required)
3. Email (required, email format)
4. Phone number (required)
5. Address (optional)
6. Personal photo — file upload OR public Drive link (one required)
7. University (required)
8. Major / College (required)
9. Academic Year (required)
10. Current Academic Grade (optional)
11. Interest in Heads Board open positions (yes/no, required)
12. Role (required if board interest = yes; free text, was "Rule" in source)
13. 1st preference committee (required, from live committees API)
14. 2nd preference committee (optional, from live committees API)
15. Technical experience in this committee (optional long text)
16. Any student activities experience (yes/no, required)
17. Student activities details (required if 16 = yes, else hidden)
18. Weekly commit hours (required)
19. Why join IEEE HITU (required long text)
20. Social / professional / technical links (optional, comma-separated URLs)
21. CV — file upload OR public Drive link (one required)
22. Notes / questions (optional; helper text "Thanks for your time — drop questions here and we'll contact you")

Members form: deferred (inshallah). Data model supports it via new `recruitment_forms` row; no code change needed later.

Admin control: per-form Open/Closed switches from day one (not single global flag).
Submissions: save to Turso + admin table viewer + detail + delete + CSV export.
Uploads: accept file OR Drive link for photo + CV.

## 3. Architecture & Data Model

### 3.1 Tables (Turso, `src/lib/server/db.js` + `ensureSchema`)

`recruitment_forms`:
- id INTEGER PK, slug TEXT UNIQUE (seed: 'heads'), title TEXT, description TEXT
- is_open INTEGER 0/1 (default 0 = closed until admin opens)
- closed_title TEXT, closed_message TEXT
- created_at TEXT, updated_at TEXT

`recruitment_applications`:
- id INTEGER PK, form_id INTEGER FK → recruitment_forms.id
- data TEXT (JSON object with the 21 user fields)
- created_at TEXT DEFAULT datetime('now')
- Index on (form_id, created_at DESC)

Seed: one `heads` row titled "Heads & Vice-Heads Recruitment" with editable closed copy.

### 3.2 API (Next.js, mirrors `/api/events` auth pattern, `isAuthed` cookie)

- `GET /api/recruitment/forms` (public) — id, slug, title, description, is_open. Never returns applications.
- `GET /api/recruitment/forms/[slug]` (public) — single form + is_open for `/join-us`.
- `PUT /api/recruitment/forms/[slug]` (admin) — body: title?, description?, is_open?, closed_title?, closed_message?. Updates `updated_at`.
- `POST /api/recruitment/applications` (public) — body: { formSlug, data }. Server: lookup form, if `is_open != 1` → 410 { error: 'Recruitment is closed' }; validate required + email/URL formats; insert; return { id }.
- `GET /api/recruitment/applications?form=heads&q=&pref=` (admin) — newest first, lightweight rows (id, name, email, firstPref, created_at).
- `GET /api/recruitment/applications/[id]` (admin) — full data + form slug.
- `DELETE /api/recruitment/applications/[id]` (admin).
- `GET /api/recruitment/applications/export?form=heads` (admin) — CSV, UTF-8 BOM, header row = all 22 columns.

### 3.3 Client lib

- `src/lib/recruitment.js` (mirrors `turso.js`): fetchRecruitmentForms, fetchRecruitmentForm(slug), updateRecruitmentForm(slug, patch), submitApplication(slug, data), fetchApplications(form, query), fetchApplication(id), deleteApplication(id). Uses existing `api()` client (credentials include).

## 4. Public Experience (`/join-us`)

`JoinUsPage.jsx` rework: fetch `fetchRecruitmentForm('heads')`, skeleton via `Skeleton` while loading.

OPEN state:
- Hero: Display-LG, Wedge 135° gradient primary #004976 → #00629b, committee count, Authority Chip "Heads Recruitment — Open".
- 4-step wizard `HeadsApplicationForm.jsx`: Personal → Ambition → Story → Finish (field grouping per section 2 of brainstorm). Progress = Wedge accent bar + Label-SM uppercase legend. Back/Next preserve state; draft autosaves to localStorage; Clear button.
- Inputs: `surface-container` bg, 2px bottom-only outline (#717881), focus → accent-cyan #00B5E2. No 1px boxes, no drop shadows, tonal layering only. Primary submit has 45° clipped top-right corner. Diagonal background split behind hero.
- 1st/2nd preference `<select>` populated from live committees (fallback to static `committees.js` if API fails).
- File-or-link: photo input = file picker (jpg/png/webp, 5MB) + URL textbox; at least one required. CV = file (pdf/doc/docx, 8MB via Cloudinary raw/upload) + URL textbox; at least one required. Upload via existing Cloudinary preset pattern (`uploadToCloudinary` for images; new `uploadFileToCloudinary` with `raw/upload` for CV).
- Success panel: reference id + recorded message (honest copy, no fake SLA), clears draft.

CLOSED state (`RecruitmentClosed.jsx`): same hero + tonal card with admin-editable closed_title/message + links to /events + /committees. Form unmounted. If admin closes mid-fill, in-flight submit gets 410 → swap to closed UI, keep draft.

Accessibility/responsive: native labels, keyboard-usable steps, focus-visible states, mobile-first per PRODUCT.md.

`InterestForm.jsx` untouched for Contact page; existing recruitment tests for Contact stay green; Join tests updated to new async open-state behavior.

## 5. Admin Dashboard

New 5th tab `Recruitment` in `AdminShell.jsx` (`RecruitmentTab.jsx` + `ApplicationDetail.jsx`):
- Forms section: row per form with Open chip / Closed muted chip, title, application count, toggle switch → `PUT` optimistic + rollback. Edit form fields (title, description, closed_title, closed_message) with existing `form-*` classes.
- Applications section: search (name/email), filter by 1st preference, table Name / 1st pref / Email / Date, row → detail drawer with all 22 fields, clickable photo/CV links, formatted timestamp. Delete via `ConfirmDialog`. Export CSV button.
- States: `Skeleton` loading, `bg-error/10` error banner + Retry, empty "No applications yet".
- Tab added to existing `role=tablist` (events/gallery/committees/partners/recruitment). Auth via `useAdminAuth`; all reads/writes use authed `api()`.

## 6. Validation, Errors, Edge Cases

- Client: required, type=email/url, conditional required (role if board=yes; activities details if activities=yes; file-or-link pairs).
- Server (authoritative): same checks + form-open gate + email/URL regex. Failures → 400 with { error, field }; closed → 410.
- Draft: localStorage key `recruitment:heads:draft`; restored on mount; cleared on success or manual Clear.
- Spam: honeypot `company_website` hidden field (filled → silent 201 without insert) + 60s/IP in-memory rate limit on POST.
- Upload failures surface inline per field, block submit until resolved or replaced with link.
- CSV export escapes quotes/commas, BOM for Excel Arabic.

## 7. Files

New: `src/lib/recruitment.js`, `src/app/api/recruitment/forms/route.js`, `src/app/api/recruitment/forms/[slug]/route.js`, `src/app/api/recruitment/applications/route.js`, `src/app/api/recruitment/applications/[id]/route.js`, `src/app/api/recruitment/applications/export/route.js`, `src/features/recruitment/components/HeadsApplicationForm.jsx`, `RecruitmentClosed.jsx`, `src/features/admin/components/RecruitmentTab.jsx`, `ApplicationDetail.jsx`.
Edit: `src/lib/server/db.js` (schema + helpers), `src/features/join-us/components/JoinUsPage.jsx`, `src/features/admin/components/AdminShell.jsx`, tests.

## 8. Tests (vitest)

- API: submit to open form → 201; submit to closed → 410; missing required → 400 with field; unauthed list/delete → 401; public form fetch never includes applications; CSV has 23-column header (id + created_at + 21 data fields).
- UI: wizard conditional fields show/hide; file-OR-link rule enforced; closed state hides form; admin toggle calls PUT with flipped is_open.
- Keep existing Contact `InterestForm` honest-outcome tests passing.

## 9. Out of Scope

Members form UI, email notifications, interview scheduling, analytics. Adding Members later = insert `recruitment_forms` row (slug 'members') + reuse same components with slug prop.
