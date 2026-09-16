import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, applyTheme, getInitialTheme, resolveTheme, useTheme } from './theme'

afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.style.colorScheme = ''
  window.localStorage.clear()
  vi.restoreAllMocks()
})

function Probe() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>current:{theme}</button>
}

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

describe('getInitialTheme', () => {
  it('uses the stored choice first', () => {
    window.localStorage.setItem('ieee-hitu-theme', 'dark')
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(getInitialTheme()).toBe('dark')
  })
  it('falls back to the system preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(getInitialTheme()).toBe('dark')
  })
  it('falls back to light with no storage and no matchMedia', () => {
    vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => { throw new Error('denied') })
    delete window.matchMedia
    expect(getInitialTheme()).toBe('light')
  })
})

describe('applyTheme', () => {
  it('writes the attribute and color scheme', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })
})

describe('ThemeProvider', () => {
  it('applies the stored theme and toggles with persistence', () => {
    window.localStorage.setItem('ieee-hitu-theme', 'light')
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByRole('button', { name: 'current:light' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'current:light' }))
    expect(screen.getByRole('button', { name: 'current:dark' })).toBeTruthy()
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ieee-hitu-theme')).toBe('dark')
  })
  it('toggles without crashing when storage is unavailable', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => { throw new Error('denied') })
    render(<ThemeProvider><Probe /></ThemeProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'current:light' }))
    expect(screen.getByRole('button', { name: 'current:dark' })).toBeTruthy()
  })
})
