# About Page Design Spec

## Goal

Add an `About` page for the IEEE HITU Student Branch website that explains:

1. Who IEEE HITU SB is
2. What IEEE is globally
3. How the branch connects to the IEEE Egypt Section

The page should strengthen credibility, help first-time visitors understand the organization quickly, and fit the site's existing institutional visual language.

## Audience

This page is for visitors exploring the IEEE HITU Student Branch, including students, members, and people interested in IEEE resources and membership. They need a quick, trustworthy explanation of the branch identity and its connection to the wider IEEE network.

## Design Direction

- Narrative order: branch first
- Tone: institutional, credible, structured
- Visual language: light mode, restrained IEEE-blue accents, clean typography, clear section separation
- Interaction model: primarily static and informational, with only lightweight CTA links

## Page Structure

The page will be added at `/about` and will follow a top-to-bottom institutional timeline.

### 1. Hero: Who Are We?

Purpose:
Introduce IEEE HITU SB first, since this is the user's selected narrative lead.

Content:
- Section label such as `About Us`
- Main heading focused on `Who Are We?`
- A short institutional introduction describing IEEE HITU SB as a student branch at Heliopolis International Technological University
- A supporting sentence describing the branch as a place for technical growth, collaboration, and community
- Two or three compact credibility highlights presented as simple stats or identity blocks

Visual treatment:
- Reuse the existing page hero pattern already used on `Committees` and `Join Us`
- Use restrained background wedges or geometric accents in the IEEE blue palette
- Keep the text block dominant and avoid decorative visual noise

### 2. Section: Who We Are in Practice

Purpose:
Explain what the branch actually does for students beyond the identity statement.

Content:
- A concise section heading that expands on the branch mission
- Short explanatory copy about workshops, committees, events, teamwork, leadership, and student engagement
- Three to four structured highlights showing how members participate and grow

Visual treatment:
- Use a clear grid or aligned content blocks
- Keep the layout structured and readable rather than promotional
- Prefer text hierarchy and spacing over heavy card framing

### 3. Section: What Is IEEE?

Purpose:
Zoom out from the local branch to the global organization.

Content:
- A direct heading such as `What Is IEEE?`
- Short explanatory copy describing IEEE as a global professional organization supporting technology, engineering, learning, standards, and community
- Optional highlight row summarizing global scale in a restrained way if content supports it

Visual treatment:
- Separate this section with a subtle background shift using existing surface tokens
- Keep the content reference-like and clear
- Avoid overly marketing-style language or visual effects

### 4. Section: IEEE Egypt Section

Purpose:
Explain the branch's regional connection after establishing the global IEEE context.

Content:
- A heading focused on `IEEE Egypt Section`
- Short copy explaining that the student branch is part of the wider IEEE network in Egypt
- A concise explanation of how this regional layer connects local student activity to broader professional and organizational support

Visual treatment:
- Continue the structured narrative flow established above
- Use the same typographic system and spacing rhythm as the rest of the page
- Keep this section informative and institutionally framed

### 5. Closing CTA

Purpose:
Give visitors a natural next step after understanding the organization.

Content:
- Brief closing message inviting users to explore involvement
- CTA links to `/join-us` and `/membership`

Visual treatment:
- Short, clean closing band
- Maintain hierarchy without turning the section into a promotional banner

## Navigation Changes

Update the navbar to include an `About` link that routes to `/about`.

## Content Style

- Use short, scannable paragraphs
- Prefer explanatory institutional wording over inspirational slogans
- Keep headings explicit and easy to understand
- Use section labels sparingly to maintain a formal tone
- Avoid long text walls and avoid unnecessary repetition

## Layout Principles

- Preserve the site's current full-width page rhythm and spacing scale
- Alternate section backgrounds using existing `surface` tokens for clear visual separation
- Emphasize typography and composition more than decorative containers
- Use cards only where they improve clarity or credibility
- Maintain strong readability on desktop and mobile

## Responsive Behavior

- Hero content should stack cleanly on mobile
- Highlight blocks and informational grids should collapse into one column on smaller screens
- Section spacing should remain generous without making the page feel sparse on mobile
- CTA actions should remain easy to scan and tap on smaller screens

## Implementation Notes

- Add a new page component at `src/pages/AboutPage.jsx`
- Add a new route in `src/App.jsx` for `/about`
- Update `src/components/Navbar.jsx` to include `About`
- Reuse existing design tokens and layout conventions already present in current pages
- Keep the solution minimal and consistent with the existing codebase patterns

## Error Handling

This page is static content, so no special runtime error states are required beyond normal rendering.

## Verification

Verification should match current project practice:

- Run lint if available
- Run the production build
- Confirm the `/about` route renders correctly
- Confirm the navbar highlights the `About` route correctly
- Confirm the page reads well on desktop and mobile layouts

## Scope Boundaries

Included:
- New About page
- New navbar link
- Static institutional content sections
- Closing CTA links

Not included:
- Backend integrations
- Interactive timelines, tabs, sliders, or accordions
- Major site-wide redesigns
- Additional new pages beyond `About`
