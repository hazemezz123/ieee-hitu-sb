# Dark Mode Toggle Design

## Goal

Add a manual dark-mode toggle to the IEEE HITU Student Branch website so visitors
can switch the whole site between light and dark appearance. Follows the earlier
`2026-04-10-dark-mode-design.md` spec, adapted to the current Next.js App Router
codebase and the dark navbar introduced with the white-logo standardization.

## Decisions (approved)

- First visit with no saved preference follows the OS/browser color scheme.
- Toggle overrides the theme immediately and persists in `localStorage`.
- Token inversion (approach A): redefine semantic tokens under
  `[data-theme="dark"]`, no per-component `dark:` classes, no new dependency.

## Architecture

- New `src/lib/theme.jsx`: `ThemeProvider` + `useTheme()` context exposing
  `{ theme, toggle }`. Mounted in `src/app/layout.js` around Navbar, main, Footer.
- Resolution order: saved `localStorage` value (`ieee-hitu-theme`) → live
  `prefers-color-scheme` → light fallback.
- The provider writes the resolved theme to `document.documentElement.dataset.theme`
  and sets matching `color-scheme`. All storage/DOM access is guarded so private
  mode never crashes (same try/catch pattern used for drafts).
- A tiny blocking script in `<head>` applies the stored/system theme before
  hydration to avoid a light-flash. The hardcoded `data-theme="dark"` on `<html>`
  is replaced by this script-managed default.

## Tokens (`src/app/globals.css`)

- New `[data-theme="dark"]` block redefining the `:root` tokens: deep
  blue-tinted surfaces (never pure black), bright controlled text, IEEE blue
  lifted for dark contrast (inverse-primary `#74b9df` family), adjusted outlines
  and error tones, `color-scheme: dark`.
- Zones that are already dark (Hero, dark navbar, recruitment band) keep their
  explicit colors and stay correct in both modes; no per-component edits expected
  beyond a contrast audit.

## Theme-aware brand assets

- Navbar follows the theme: light surfaces in light mode, dark surfaces in dark
  mode (automatic via the token inversion, no navbar-specific colors).
- Navbar logo is theme-aware: full-color `logo.png` in light mode, white version
  in dark mode via `[data-theme="dark"] .navbar-logo { filter: brightness(0) invert(1); }`
  (same filter treatment already used in Hero/Footer). The `navbar-logo` hook
  class is already on the navbar image.
- Hero and Footer are permanently dark surfaces, so their white logo stays
  unchanged in both modes. The slogan file has an opaque white background, so
  it renders unfiltered on a small white badge (aspect ratio preserved) rather
  than with the white filter.

## Toggle UI (`src/components/navbar.jsx`)

- Sun/moon icon button using the already-loaded Material Symbols font
  (`dark_mode` / `light_mode`), with an accessible label naming the target mode
  (e.g. "Switch to dark mode").
- One button in the header bar after the desktop links (before Join IEEE / the hamburger), so it is visible in both the desktop and mobile navigation without duplication.
- Theme-dependent labels/icons render after mount (neutral "Toggle color theme" first paint) so dark-system first visits never hydrate stale server labels.
- Styled after the existing `nav-menu-button` so it fits the institutional look
  in both themes.

## Edge cases

- `localStorage` unavailable → system preference, no crash.
- No system preference → light.
- Pre-hydration default + head script keep first paint correct; React state
  converges on hydration with no visible flip.

## Testing

- Provider tests: stored choice wins, system fallback, light fallback,
  private-mode storage failure.
- Navbar test: clicking the toggle flips `data-theme` and persists the choice.
- Full `npm test`, `npx eslint` on touched files, `npm run build`.

## Out of scope

- Settings page, extra palettes, theme transitions animation, theme-specific
  content, any redesign beyond contrast fixes required by dark mode.
