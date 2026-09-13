# IEEE HITU Technical Editorial Redesign

## Goal

Remove generic AI-styled presentation from the entire public website while preserving the IEEE HITU identity, existing routes, event data flow, and admin workflow. The result should feel like a precise student-branch publication grounded in real people, events, committees, and university context.

This specification supersedes conflicting visual guidance in `DESIGN.md`, especially glassmorphism, generic global-authority messaging, decorative gradients, and oversized abstract declarations.

## Scope

- Redesign every public route: home, about, join, committees, committee details, membership, events, event details, gallery, and contact.
- Redesign the shared navigation, footer, page layout, controls, cards, forms, and motion behavior.
- Lightly align admin typography, colors, controls, focus states, and spacing without changing event CRUD behavior or routes.
- Keep the existing technical resources section in scope wherever it is currently rendered; restyle it under the same editorial system without changing its external destinations.
- Preserve React, Vite, React Router, Tailwind, Turso event loading, static event fallback, existing branch assets, and current data structures.
- Do not add dependencies or invent missing branch facts.

## Visual Direction

The creative direction is a technical editorial publication rather than a generic technology landing page.

- Preserve IEEE blue, the IEEE HITU logo, 45-degree wedge geometry, and restrained blueprint/grid cues.
- Use asymmetric editorial grids, clear reading order, index numbers, captions, metadata, and deliberate whitespace.
- Replace glass panels, large radii, floating shapes, ambient glows, and excessive card grids with square or subtly rounded surfaces and tonal section changes.
- Use neutral light and dark surfaces with IEEE blue as the primary signal color. Reserve secondary colors for statuses and meaningful emphasis.
- Use display type only for page-level statements. Use compact technical labels for dates, categories, locations, and section indexes.
- Do not highlight generic words inside headings or use interchangeable slogans such as “learn, grow, connect.”
- Prefer real event and member media. When distinct media is unavailable, use a clearly intentional neutral fallback rather than repeating unrelated images.

## Motion

- Remove continuous button floating, decorative object movement, cursor glow, and motion without informational purpose.
- Keep brief route transitions, section reveals, gallery transitions, and control feedback where they clarify state.
- Honor reduced-motion preferences throughout.
- Keep the layout stable during animation and asynchronous event loading.

## Shared Shell

### Navigation

- Use a compact, solid navigation surface with clear active-route treatment.
- Keep the branch name and logo legible as a first-viewport identity signal.
- Make mobile navigation keyboard-operable, dismissible, and non-obscuring.
- Remove glass blur and decorative movement.

### Footer

- Present a useful branch directory: primary routes, verified contact paths, university identity, and IEEE affiliation.
- Remove generic promotional copy and decorative filler.

### Reusable UI

- Buttons must navigate, submit, or change state; remove inactive controls.
- Cards are reserved for repeated records such as events and people, not used as default section containers.
- Forms use persistent labels, visible focus, concise validation, and honest submission messaging.
- Section labels communicate real hierarchy or metadata rather than decorative uppercase text.

## Page Structure

### Home

- Use “IEEE HITU Student Branch” as the primary heading.
- State the branch's relationship to Heliopolis International Technological University and IEEE in factual language.
- Provide working primary links to events and participation.
- Feature the next dated event from the existing event source. Follow it with counts derived from existing event, committee, and board-member data; the next available events; the committee directory; and recent event records. Omit a subsection when its source has no records and show the shared event empty state when all event records are absent.
- Remove the generic “Beyond Labels. Beyond Limits.” hero and inactive hero buttons.

### About

- Present the branch purpose and university context from `PRODUCT.md`, leadership from `src/data/boardMembers.js`, and activity counts derived from repository event and committee data as an editorial profile. Omit history or metrics that have no authoritative repository source.
- Replace generic icon-card claims with supported facts and real leadership information.

### Committees

- Present committees as a numbered directory using names, categories, descriptions, and routes from `src/data/committees.js`. Resolve current leads by matching committee names to `src/data/boardMembers.js`; omit leadership where no reliable match exists.
- Structure detail pages as profile sheets covering only repository-backed mandate, category, member count, leadership, and contact data. Omit unsupported current-work sections and unverified contact paths.
- Do not display placeholder biographies, goals, social links, or emails as verified content.

### Events

- Use a chronological program layout with date, status, venue, committee, and distinct imagery.
- Event details prioritize logistics, description, and outcomes.
- Preserve Turso loading and the existing static fallback, with intentional loading, empty, image-error, and data-error states.

### Gallery

- Treat photography as a documented archive with event names, dates, and captions.
- Preserve the lightbox with keyboard close, previous/next controls, focus containment and restoration, and descriptive image text.

### Membership and Join

- Explain specific IEEE and branch opportunities, eligibility, expectations, and the next participation step.
- Clearly disclose when a form is a local placeholder rather than a production submission system.
- Avoid duplicating generic benefit sections across both routes.

### Contact

- Present only verified contact channels, location details, and office information.
- Keep the form compact, labeled, keyboard-usable, and honest about submission behavior.

### Admin

- Apply only shared typography, color, button, input, focus, and spacing tokens to `/admin`, `/admin/events/new`, and `/admin/events/:id/edit`.
- Preserve event CRUD routes, data behavior, information density, and workflow.
- Keep admin layout and component structure unchanged; do not reshape admin pages into editorial marketing layouts.

## Content Rules

- Use HITU-specific facts already supported by repository data or approved product context.
- Remove invented or placeholder content from prominent presentation. Clearly mark unavailable information when omission would confuse users.
- Keep IEEE terminology accurate, including student branch, committees, membership, events, and IEEE Xplore.
- Make dates, locations, names, statuses, and participation steps easier to scan than promotional prose.
- Fix incomplete utility classes and remove decorative elements that have no content relationship.

## Accessibility and Responsive Behavior

- Preserve semantic heading order, landmarks, alt text, persistent form labels, keyboard access, and visible focus.
- Meet WCAG 2.2 AA contrast for text, controls, and focus indicators on all surface combinations.
- Prevent horizontal overflow and text overlap from mobile through wide desktop.
- Keep touch targets usable and ensure navigation never hides primary content.
- Ensure animations and canvas effects are absent or reduced when reduced motion is requested.

## Error and Empty States

- Event loading failures retain the existing fallback behavior and distinguish fallback content from a blank result.
- Missing images use a stable neutral fallback without resizing the layout.
- Empty event and gallery states explain the absence of records and provide a relevant route where one exists.
- Forms keep user input after validation errors and communicate success or failure next to the action.

## Verification

- Run the existing automated tests and production build.
- Inspect every public route plus `/admin`, `/admin/events/new`, and one existing event edit route at 390x844 and 1440x900 viewports.
- Verify active navigation, mobile navigation, all CTAs, forms, event loading/fallback, image fallbacks, gallery/lightbox, and detail routes.
- Check keyboard focus, reduced motion, heading order, WCAG 2.2 AA contrast, overflow, text overlap, console errors, and failed first-party network requests.
- Compare pages as a set to ensure they share a system without repeating the same hero and card-grid composition.
- Verify admin event list, create, edit, delete, validation, persistence, and route navigation behavior.

## Delivery Phases

1. Shared system: tokens, typography, shell, reusable controls, motion, and accessibility foundations.
2. Recruitment pages: home, about, membership, join, contact, and technical resources.
3. Record pages: committees, committee details, events, event details, gallery, loading/error/empty states, and lightbox.
4. Admin alignment and complete cross-route browser verification.

Each phase receives its own build and targeted browser check before the next phase begins.

## Acceptance Criteria

- Every public route has a factual page heading, a working primary action where the route has a user task, stable loading/error states where data is loaded, no prohibited decorative effects, and no overflow at 390x844 or 1440x900.
- The branch identity and factual HITU context appear clearly in the first viewport of the home page.
- No inactive CTA, generic hero slogan, meaningless floating decoration, persistent glass navigation, or continuous decorative motion remains.
- Real records and metadata take priority over generic promotional copy.
- Placeholder content is removed, omitted, or explicitly identified rather than presented as verified.
- Admin event list, create, edit, delete, validation, persistence, and route navigation retain their current behavior with token-level visual alignment only.
- Tests and production build pass. Browser verification reports zero automated accessibility violations, zero console errors, zero failed first-party requests, no horizontal overflow at the specified viewports, and successful keyboard completion of navigation, forms, and lightbox workflows.
