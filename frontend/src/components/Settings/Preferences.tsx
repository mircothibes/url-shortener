/**
 * Preferences Component
 * 
 * User preferences for theme, language, and notifications.
 * Toggle settings for application behavior.
 * 
 * Features:
 * - Theme selector (light/dark)
 * - Language selector
 * - Notification toggles
 * - Email notification preferences
 * - Save preferences button
 * 
 * Props: None
 * 
 * Usage:
 * <Preferences />
 */

import React, { useState } from 'react'

/**
 * Preferences Component
 * 
 * Manages user preferences and settings.
 * Displays toggles and selectors for app behavior.
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
   * Handle save preferences
   */
  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSuccessMessage('Preferences saved successfully!')
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
            onChange={(e) => setTheme(e.target.value)}
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
            onChange={(e) => setLanguage(e.target.value)}
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
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
            />
          </div>

          {/* Weekly digest toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Weekly Digest</p>
              <p className="text-sm text-slate-600">
                Get a weekly summary of your URLs
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
              disabled={!emailNotifications}
            />
          </div>

          {/* Activity notifications toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Activity Alerts</p>
              <p className="text-sm text-slate-600">
                Get notified when your URLs get clicks
              </p>
            </div>
            <input
              type="checkbox"
              checked={activityNotifications}
              onChange={(e) => setActivityNotifications(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
              disabled={!emailNotifications}
            />
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
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
