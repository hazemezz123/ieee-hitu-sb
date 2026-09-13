# Dark Mode Design Spec

## Goal

Add dark mode to the IEEE HITU Student Branch website so visitors can view the site in either light or dark appearance while preserving the current institutional IEEE visual identity.

The implementation should:

1. Follow system preference on first visit
2. Allow a manual navbar toggle to override the theme
3. Persist the user choice across visits
4. Keep the same site structure, branding, and semantic color system in both modes

## Audience

This site is for visitors exploring the IEEE HITU Student Branch, including students, members, and people interested in IEEE resources and membership. Dark mode should improve comfort and preference support without making the interface feel less professional or less recognizable.

## Design Direction

- Tone: professional, credible, academic
- Theme behavior: system preference by default, manual override after user interaction
- Toggle style: compact icon button in the navbar
- Visual language: dark mode should feel like the same website in a darker environment, not a different brand

## Theme Architecture

Dark mode should be implemented as a single global theme layer rather than page-by-page state.

### Theme resolution order

1. If the user has a saved manual preference, use it
2. Otherwise, fall back to the system color scheme preference

### Theme application

- Apply the resolved theme to the root document using a single attribute such as `data-theme="light"` or `data-theme="dark"`
- Keep the existing semantic color token model already used across the site
- Define both light and dark token values in CSS so components using `bg-surface`, `text-on-surface`, `border-outline-variant`, and related semantic classes adapt automatically

### State ownership

- Centralize theme state in one shared place for the whole app
- Expose current theme and a toggle action to the navbar and any future components that may need theme access
- Avoid local per-page theme logic

## User Experience

### First visit

- If no saved theme exists, the site should follow the user’s operating system or browser color scheme

### Manual override

- A compact icon button should appear in the navbar
- The control should switch between light and dark mode immediately when pressed
- Once the user interacts with the toggle, the chosen theme should be stored in `localStorage`
- On future visits, the stored preference should take precedence over system preference

### Navbar behavior

- The toggle should be visible on desktop navigation
- The toggle should also be available in the mobile navigation experience
- The button should remain visually consistent with the site’s institutional styling
- The icon should clearly communicate the current or next theme state using sun/moon imagery or equivalent

### Accessibility

- The toggle must have an accessible label
- Focus visibility should remain clear in both light and dark modes
- Contrast should remain strong for text, buttons, borders, and navigation states

## Visual Treatment

Dark mode should preserve the IEEE identity and avoid trendy neon or glow-heavy styling.

### Color behavior

- Use deep blue-tinted dark surfaces rather than pure black
- Use bright but controlled foreground text for readability
- Keep IEEE blue as the main accent while tuning it for dark contrast
- Adjust borders, section dividers, and container layers so content hierarchy remains clear

### Brand consistency

- Preserve the current geometric accents and section rhythm
- Reduce the intensity of decorative accents when needed so they do not overpower content on dark surfaces
- Keep the site feeling structured and institutional rather than entertainment-oriented

### Component expectations

The following should visually remain coherent in both themes:

- Navbar and mobile menu
- Hero sections with wedge accents
- Cards and content containers
- Primary and secondary buttons
- Body text, headings, section labels, and borders
- Footer and page background transitions

## Scope Of First Implementation

Included:

- Global theme state and theme application
- System preference fallback on first visit
- Manual saved override in `localStorage`
- Navbar icon toggle for desktop and mobile
- Dark theme semantic tokens in `src/index.css`
- Updates needed so existing components render correctly in both themes

Not included:

- Theme settings page
- Multiple theme palettes
- Major UI redesigns
- Theme-specific content changes
- Advanced animated transitions between themes

## Implementation Notes

- Reuse the current semantic token naming scheme instead of introducing page-specific dark classes
- Keep the implementation minimal and compatible with the current React Router app structure
- Prefer a small global provider or shared theme module rather than scattering storage and DOM updates across components
- Preserve existing page composition and content structure while adapting colors

## Error Handling

- If `localStorage` is unavailable, the site should still fall back to system preference without crashing
- If no system preference is available, default to light mode
- Theme initialization should avoid visible broken states during app startup as much as reasonably possible

## Verification

Verification should include:

- Run lint if available
- Run the production build
- Confirm the navbar toggle switches the theme correctly
- Confirm the chosen theme persists after reload
- Confirm first-load behavior follows system preference when no saved preference exists
- Confirm desktop and mobile navigation both expose the toggle
- Confirm major pages remain readable and visually consistent in both themes

## Files Likely To Change

- `src/index.css`
- `src/App.jsx` or a new shared theme module/provider file
- `src/components/Navbar.jsx`
- Any components or pages that require minor adjustments for dark theme contrast consistency

## Scope Boundaries

This feature is about theme behavior and visual adaptation only. It should not expand into broader redesign work unless a specific page has a readability issue that must be fixed to support dark mode correctly.
