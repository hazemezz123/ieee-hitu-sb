import { useEffect, useRef, useState } from 'react';
import { ThemeContext } from './themeContext';

const STORAGE_KEY = 'ieee-theme';
const THEME_TRANSITION_CLASS = 'theme-transitioning';
const THEME_TRANSITION_DURATION = 220;

function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

function shouldReduceMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useState(() => getStoredTheme());
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());
  const transitionTimeoutRef = useRef(null);

  const theme = storedTheme ?? systemTheme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(event) {
      setSystemTheme(event.matches ? 'dark' : 'light');
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  function setThemePreference(nextTheme) {
    setStoredTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore persistence failures and keep the in-memory theme.
    }
  }

  function toggleTheme() {
    if (typeof document !== 'undefined' && !shouldReduceMotion()) {
      const root = document.documentElement;
      root.classList.add(THEME_TRANSITION_CLASS);

      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        root.classList.remove(THEME_TRANSITION_CLASS);
        transitionTimeoutRef.current = null;
      }, THEME_TRANSITION_DURATION);
    }

    setThemePreference(theme === 'dark' ? 'light' : 'dark');
  }

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
