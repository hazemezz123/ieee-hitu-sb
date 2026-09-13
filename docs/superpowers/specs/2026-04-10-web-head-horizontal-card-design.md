# Web Head Horizontal Card Design

## Goal
Change the Web committee head card from a vertical profile card to a horizontal profile card.

## Scope
- Apply the layout change to the committee head card on the committee detail page.
- Keep the image on the left and the content on the right on larger screens.
- Keep the card stacked vertically on smaller screens.
- Keep the existing colors, typography, spacing language, and social icon styling.

## Chosen Layout
- Use a two-column horizontal card for the Web committee head.
- The profile image stays on the left side.
- The right side contains the role label, name, bio, and social/email icons.
- On mobile, the card collapses to a vertical layout so the image remains readable.

## Constraints
- Do not redesign the rest of the committee detail page.
- Do not change the provided head image.
- Do not reintroduce the vice head section.

## Verification
- The Web committee head card appears horizontal on desktop.
- The image remains on the left side on desktop.
- The card stacks cleanly on mobile.
- Existing lint and build checks still pass.
