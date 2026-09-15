'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export const THEME_KEY = 'ieee-hitu-theme'

export function resolveTheme({ stored, systemDark } = {}) {
  if (stored === 'light' || stored === 'dark') return stored
  return systemDark ? 'dark' : 'light'
}

const ThemeContext = createContext({ theme: 'light', toggle: () => {} })

export function getInitialTheme() {
  try {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem(THEME_KEY)
    const systemDark = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
    return resolveTheme({ stored, systemDark })
  } catch { return 'light' }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  useEffect(() => { applyTheme(theme) }, [theme])
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { window.localStorage.setItem(THEME_KEY, next) } catch { /* private mode: theme applies for this visit only */ }
      return next
    })
  }, [])
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
