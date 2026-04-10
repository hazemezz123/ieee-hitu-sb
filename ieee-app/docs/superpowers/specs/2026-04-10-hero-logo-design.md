# Hero Logo Design

## Goal
Add the existing IEEE HITU Student Branch logo to the homepage Hero section so the branch identity is visible immediately on first view.

## Current Context
- The Hero section is a centered single-column layout in `src/components/Hero.jsx`.
- The site already uses `src/assets/logo.png` in the navbar.
- The current visual language is light, geometric, and based on the existing IEEE blue palette.

## Chosen Design
- Reuse the existing `src/assets/logo.png` asset in the Hero section.
- Place the logo above the main hero heading inside the central content column.
- Present it inside a subtle framed container so it feels intentional against the light background and does not compete with the decorative wedges.
- Keep the logo responsive with a moderate visual size on mobile and a slightly larger size on desktop.

## Constraints
- Do not change the hero copy or CTA structure.
- Do not introduce a new logo asset.
- Keep the implementation limited to the Hero component unless styling changes are clearly necessary.

## Verification
- The hero should still read clearly on mobile and desktop.
- The logo should render with correct spacing above the headline.
- Existing build and lint checks should continue to pass.
