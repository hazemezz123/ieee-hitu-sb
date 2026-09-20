# Bento Grid Committee Directory Design

## 1. Overview
Refactor the "Committee directory" section on the Home page (`HomePage.jsx`) into a modern, responsive Bento Grid with category filtering tabs. This replaces the previous constellation section with a high-density, accessible, card-based layout featuring distinct featured cards for primary tracks and compact glowing cards for all other committees.

## 2. Requirements & Behavior

### 2.1 Tab Filter
- Centered tab bar with three filter options:
  - **All Committees** (`all`): Displays all 13 committees.
  - **Technical Tracks** (`technical`): Displays the 9 technical committees.
  - **Operations & Media** (`operations`): Displays the 4 non-technical committees.
- Tabs utilize accessible ARIA roles (`role="tablist"`, `role="tab"`, `aria-selected`).
- Active tab styling uses smooth Tailwind transitions (`bg-primary text-white shadow-md transition-all duration-300`).

### 2.2 Bento Grid Structure
- Container: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5`.
- Mobile layout: Gracefully collapses to a single column (`grid-cols-1`).
- Card types:
  1. **Featured Primary Cards (AI & Web):**
     - Span: `col-span-1 md:col-span-2`.
     - Surface: Dark slate `#0b1324`, border `border-white/10`, rounded `rounded-2xl`, subtle gradient overlay.
     - Header: Icon badge (`h-12 w-12 rounded-xl bg-white/5`), track tag, committee name.
     - Body: Expanded description snippet.
     - Tech tags: Badges showing key technologies (e.g. `['PyTorch', 'TensorFlow', 'Computer Vision', 'NLP']` for AI; `['Next.js', 'React', 'Tailwind CSS', 'Node.js']` for Web).
     - Action: Explicit "Learn more →" link to `/committees/[slug]`.
  2. **Compact Cards (Remaining 11 Committees):**
     - Span: `col-span-1`.
     - Surface: Dark slate `#0b1324`, border `border-white/10`, rounded `rounded-2xl`, p-5.
     - Visual: `CommitteeIcon`, committee title, category label, short description.
     - Interactive styling: Hover glow `hover:border-cyan-500/40 hover:shadow-[0_0_24px_-4px_rgba(0,181,226,0.25)] hover:-translate-y-1 transition-all duration-300`.
     - Entire card acts as an accessible link to `/committees/[slug]`.

### 2.3 Data Organization
Centralized array containing all 13 committees with category, slug, name, description, and optional featured tags:
- **Technical (9):**
  - `ai`: AI (Featured) - Tags: PyTorch, TensorFlow, Computer Vision, NLP
  - `web`: Web (Featured) - Tags: Next.js, React, Tailwind CSS, Node.js
  - `cs`: CS (Computer Science)
  - `ds`: Data Science
  - `cyber-defensive`: Cyber Defensive
  - `cyber-offensive`: Cyber Offensive
  - `embedded`: Embedded Systems
  - `robotics`: Robotics
  - `automations`: Automations
- **Non-Technical / Operations & Media (4):**
  - `pr-oc`: PR & OC
  - `multi-media`: Multi Media
  - `marketing`: Marketing
  - `hr-td`: HR - T&D

## 3. Architecture & File Impacts

1. `src/features/home/components/CommitteeDirectory.jsx`:
   - Refactored component with category filter tabs and responsive Bento Grid.
   - Fetches live data with fallback to static committee data via `fetchCommitteesResult()`.
   - Accessible tabs and responsive layout.

2. `src/features/home/components/HomePage.jsx`:
   - Integrates `<CommitteeDirectory />` between `PartnershipCarousel` / `TechnicalResources` and event archives.

3. `src/features/home/components/CommitteeDirectory.test.jsx`:
   - Comprehensive unit tests verifying initial render of 13 committees, tab switching to Technical (9) and Operations (4), and presence of featured card tags and links.

4. `src/features/join-us/components/recruitment.test.jsx`:
   - Ensures home page band ordering tests align with `<CommitteeDirectory />` placement.

## 4. Verification
- `npx vitest run src/features/home/components/CommitteeDirectory.test.jsx`
- Full test suite: `npm test`
- Build check: `npm run build`
