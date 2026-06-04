/**
 * Preferences Component
 * 
 * User preferences for theme, language, and notifications.
 * Persists all settings to localStorage.
 * Applies theme changes immediately to document.
 * 
 * Features:
 * - Theme selector (light/dark/auto)
 * - Language selector (en/pt/es/de)
 * - Email notification toggle
 * - Weekly digest toggle
 * - Activity notification toggle
 * - Save preferences to localStorage
 * - Apply theme changes in real-time
 * - Success messages
 * 
 * Props: None
 * 
 * Usage:
 * <Preferences />
 */

import React, { useState, useEffect } from 'react'

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
   * Theme preference state
   */
  const [theme, setTheme] = useState('light')
  
  /**
   * Language preference state
   */
  const [language, setLanguage] = useState('en')
  
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
   * Load preferences from localStorage on mount
   */
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user_preferences')
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      setTheme(prefs.theme || 'light')
      setLanguage(prefs.language || 'en')
      setEmailNotifications(prefs.emailNotifications !== false)
      setWeeklyDigest(prefs.weeklyDigest !== false)
      setActivityNotifications(prefs.activityNotifications !== false)
    }
  }, [])

  /**
   * Apply theme to document
   */
  const applyTheme = (selectedTheme: string) => {
    const html = document.documentElement
    if (selectedTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * Handle theme change
   */
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  /**
   * Handle language change
   */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
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
      await new Promise(resolve => setTimeout(resolve, 800))
      
      /**
       * Save all preferences to localStorage
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
      
      setSuccessMessage('Preferences saved successfully!')
      
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Appearance
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Theme
          </label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (system)</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">
            Choose how the app looks
          </p>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Language
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Preferred Language
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Notifications
        </h3>
        
        <div className="space-y-4">
          
          {/* Email notifications toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-600">
                Receive important updates via email
              </p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Weekly Digest</p>
              <p className="text-sm text-slate-600">
                Get a weekly summary of your URLs
              </p>
            </div>
            <button
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              disabled={!emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                weeklyDigest && emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Activity Alerts</p>
              <p className="text-sm text-slate-600">
                Get notified when your URLs get clicks
              </p>
            </div>
            <button
              onClick={() => setActivityNotifications(!activityNotifications)}
              disabled={!emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                activityNotifications && emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
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
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ✓ {successMessage}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}
