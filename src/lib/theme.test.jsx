import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('prefers a valid stored choice over the system', () => {
    expect(resolveTheme({ stored: 'dark', systemDark: false })).toBe('dark')
    expect(resolveTheme({ stored: 'light', systemDark: true })).toBe('light')
  })
  it('falls back to the system preference, then light', () => {
    expect(resolveTheme({ stored: null, systemDark: true })).toBe('dark')
    expect(resolveTheme({ stored: 'sepia', systemDark: false })).toBe('light')
    expect(resolveTheme({ stored: null, systemDark: false })).toBe('light')
  })
})
