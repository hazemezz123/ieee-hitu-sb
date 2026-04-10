# Committees Pages Design

## Goal
Add a committees overview page and reusable committee detail pages that present all branch committees in a clear structure, using placeholder content for now and making it easy to replace with real data later.

## Scope
- Add one overview page at `/committees`.
- Add one reusable detail page route at `/committees/:slug`.
- Include all provided committees and their member counts.
- Split the overview into two categories: `Technical` and `Non-Technical`.
- Use placeholder content for committee descriptions, slogans, goals, roles, activities, head details, vice head details, and profile links.

## Committee Inventory

### Technical
- AI — 52 members
- Cyber Defensive — 13 members
- Cyber Offensive — 17 members
- Web — 12 members
- Automations — 18 members
- Robotics — 23 members
- Embedded — 8 members

### Non-Technical
- PR & OC — 8 members
- Multi Media — 7 members
- Marketing — 3 members
- HR - T&D — 23 members

## Information Architecture

### Overview Page
Route: `/committees`

The page should:
- Open with a hero introducing the branch committees.
- Present a short summary and total committee count.
- Show two main sections: `Technical Committees` and `Non-Technical Committees`.
- Render a compact card for each committee.
- Give users a clear path from overview to detail through a `View Committee` button.

### Detail Page
Route: `/committees/:slug`

The page should:
- Reuse a single shared layout for every committee.
- Show a top hero with the committee icon or illustration, committee name, slogan, short intro, and member count.
- Include a fast overview/perf area near the top for quick scanning.
- Include sections for committee goals, roles and responsibilities, and key activities.
- Include a leadership area with head and vice head cards.
- Include a back link to the committees overview page.
- Show a `Committee not found` state for invalid slugs.

## Data Model

Use one shared committee data source for both the overview and detail pages.

Each committee entry should contain:
- `name`
- `slug`
- `category`
- `memberCount`
- `icon`
- `shortDescription`
- `slogan`
- `goals`
- `roles`
- `activities`
- `head`
- `viceHead`

Each `head` and `viceHead` object should contain:
- `name`
- `role`
- `bio`
- `image`
- `githubUrl`
- `linkedinUrl`
- `email`

## Content Strategy
- Use placeholder content for all descriptive text and leadership profiles.
- Use placeholder profile images for committee head and vice head cards.
- Use placeholder GitHub, LinkedIn, and email values for leader contact actions.
- Keep the placeholders realistic enough that the layout can be reviewed properly.

## Visual Structure

### Overview Cards
Each committee card should contain:
- Committee icon or illustration
- Committee name
- Member count
- Short description
- `View Committee` button

The cards should feel easy to scan and should not overload users with too much detail on the overview page.

### Detail Layout
Each committee detail page should include:
- Hero section
- Quick facts/perf strip
- Goals section
- Roles and responsibilities section
- Key activities section
- Leadership section with two cards

Each leader card should contain:
- Profile image
- Name
- Position title
- Short bio
- GitHub icon link
- LinkedIn icon link
- Email icon link

## Technical Direction
- Keep the implementation aligned with the current React + Vite + Tailwind structure.
- Follow the existing page styling language already used by `Home` and `MembershipPage`.
- Prefer a single reusable committee detail template rather than one page per committee.
- Keep committee content in a central data module so replacing placeholders later does not require layout rewrites.

## Constraints
- Do not require a CMS or backend.
- Do not block on real committee content or real leadership photos.
- Do not create a unique layout for each committee.
- Keep the first version static and data-driven.

## Verification Criteria
- Users can open `/committees` and see all committees grouped correctly.
- Every committee card links to a working detail page.
- Every detail page shows placeholder hero, overview, goals, roles, activities, and leadership sections.
- Leadership cards show GitHub, LinkedIn, and email icon actions.
- Invalid committee slugs show a valid fallback state.
- The layout remains readable on mobile and desktop.
