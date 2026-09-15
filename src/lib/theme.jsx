export const THEME_KEY = 'ieee-hitu-theme'

export function resolveTheme({ stored, systemDark } = {}) {
  if (stored === 'light' || stored === 'dark') return stored
  return systemDark ? 'dark' : 'light'
}
