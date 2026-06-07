/**
 * ThemeContext
 *
 * Global theme context for the application (light / dark / auto).
 * Applies the theme to the document root on load and on change,
 * and persists the choice in localStorage.
 *
 * Theme values:
 * - 'light': always light
 * - 'dark': always dark
 * - 'auto': follows the operating system preference
 *
 * Persistence:
 * - Stored in localStorage under 'app_theme'
 *
 * Usage:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * const { theme, setTheme } = useTheme()
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Available theme options
 */
export type Theme = 'light' | 'dark' | 'auto'

/**
 * Shape of the theme context
 */
interface ThemeContextType {
  /**
   * Current theme preference selected by the user
   */
  theme: Theme

  /**
   * Update the theme preference (applies and persists it)
   */
  setTheme: (theme: Theme) => void
}

/**
 * Theme context instance
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * localStorage key used to persist the theme
 */
const STORAGE_KEY = 'app_theme'

/**
 * Resolve whether dark mode should be active for a given theme.
 * For 'auto', it checks the OS-level color scheme preference.
 *
 * @param {Theme} theme - The selected theme
 * @returns {boolean} true if dark mode should be applied
 */
const shouldUseDark = (theme: Theme): boolean => {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  // auto: follow system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Apply or remove the `dark` class on the document root element.
 *
 * @param {Theme} theme - The theme to apply
 */
const applyThemeToDocument = (theme: Theme): void => {
  const root = document.documentElement
  if (shouldUseDark(theme)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Read the initial theme from localStorage, defaulting to 'light'.
 *
 * @returns {Theme} The stored theme or 'light'
 */
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }
  return 'light'
}

/**
 * Props for ThemeProvider
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * ThemeProvider Component
 *
 * Provides theme state to the entire app, applies the theme to the
 * document on mount and whenever it changes, and persists the choice.
 *
 * @param {ThemeProviderProps} props - Provider props
 * @returns {React.ReactElement} Provider wrapper
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  /**
   * Current theme state, initialized from localStorage
   */
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  /**
   * Apply the theme on mount and whenever it changes
   */
  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  /**
   * Keep 'auto' theme in sync with OS preference changes
   */
  useEffect(() => {
    if (theme !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyThemeToDocument('auto')

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [theme])

  /**
   * Update theme: store in state and persist to localStorage.
   * The useEffect above handles applying it to the document.
   *
   * @param {Theme} newTheme - The new theme to set
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme Hook
 *
 * Access the theme context from any component.
 * Must be used inside <ThemeProvider>.
 *
 * @returns {ThemeContextType} The theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
