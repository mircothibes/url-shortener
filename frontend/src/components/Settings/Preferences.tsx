/**
 * Preferences Component
 *
 * User preferences for theme, language, and notifications.
 * Theme is managed globally via ThemeContext; other prefs persist to localStorage.
 *
 * Features:
 * - Theme selector (light/dark/auto) — applied globally via ThemeContext
 * - Language selector (en/pt/es/de/fr)
 * - Email notification toggle
 * - Weekly digest toggle
 * - Activity notification toggle
 * - Save preferences to localStorage
 * - Dark mode support
 * - Success messages
 *
 * Props: None
 *
 * Usage:
 * <Preferences />
 */

import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

/**
 * Preferences Component
 *
 * Manages user preferences and settings.
 * Displays toggles and selectors for app behavior.
 * Persists all changes to localStorage.
 *
 * @returns {React.ReactElement} Preferences form
 */
export const Preferences: React.FC = () => {
  /**
   * Theme preference from global ThemeContext.
   * Reading/writing here applies the theme across the whole app.
   */
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  /**
   * Language preference state
   */
  const [language, setLanguage] = useState(i18n.language?.startsWith('fr') ? 'fr' : 'en')

  /**
   * Email notifications enabled
   */
  const [emailNotifications, setEmailNotifications] = useState(true)

  /**
   * Weekly digest enabled
   */
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  /**
   * Activity notifications enabled
   */
  const [activityNotifications, setActivityNotifications] = useState(true)

  /**
   * Loading state
   */
  const [loading, setLoading] = useState(false)

  /**
   * Success message
   */
  const [successMessage, setSuccessMessage] = useState('')

  /**
   * Load preferences from localStorage on mount.
   * Theme is intentionally NOT loaded here — it comes from ThemeContext.
   */
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user_preferences')
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      setEmailNotifications(prefs.emailNotifications !== false)
      setWeeklyDigest(prefs.weeklyDigest !== false)
      setActivityNotifications(prefs.activityNotifications !== false)
    }
  }, [])

  /**
   * Handle theme change.
   * setTheme (from ThemeContext) applies and persists the theme globally.
   */
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as 'light' | 'dark' | 'auto')
  }

  /**
   * Handle language change
   */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lng = e.target.value
    setLanguage(lng)
    i18n.changeLanguage(lng)
  }

  /**
   * Handle save preferences
   */
  const handleSave = async () => {
    setLoading(true)
    try {
      /**
       * Simulate API call
       */
      await new Promise((resolve) => setTimeout(resolve, 800))

      /**
       * Save all preferences to localStorage.
       * Theme is included for reference, but ThemeContext is the source of truth.
       */
      const preferences = {
        theme,
        language,
        emailNotifications,
        weeklyDigest,
        activityNotifications,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem('user_preferences', JSON.stringify(preferences))

      setSuccessMessage(t('settings.preferences.saved'))

      /**
       * Clear message after 3 seconds
       */
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Theme Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t('settings.preferences.appearance')}
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {t('settings.preferences.theme')}
          </label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">{t('settings.preferences.light')}</option>
            <option value="dark">{t('settings.preferences.dark')}</option>
            <option value="auto">{t('settings.preferences.auto')}</option>
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {t('settings.preferences.themeHint')}
          </p>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t('settings.preferences.language')}
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {t('settings.preferences.preferredLanguage')}
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {t('settings.preferences.notifications')}
        </h3>

        <div className="space-y-4">

          {/* Email notifications toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('settings.preferences.emailNotifications')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.preferences.emailNotificationsHint')}
              </p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                emailNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Weekly digest toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('settings.preferences.weeklyDigest')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.preferences.weeklyDigestHint')}
              </p>
            </div>
            <button
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              disabled={!emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                weeklyDigest && emailNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              } ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  weeklyDigest && emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Activity notifications toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('settings.preferences.activityAlerts')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.preferences.activityAlertsHint')}
              </p>
            </div>
            <button
              onClick={() => setActivityNotifications(!activityNotifications)}
              disabled={!emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                activityNotifications && emailNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              } ${!emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  activityNotifications && emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          ✓ {successMessage}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {loading ? t('settings.preferences.saving') : t('settings.preferences.save')}
      </button>
    </div>
  )
}
