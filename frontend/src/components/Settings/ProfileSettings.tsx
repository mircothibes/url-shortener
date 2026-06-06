/**
 * ProfileSettings Component
 * 
 * Form for users to update their profile information.
 * Saves changes to localStorage and updates auth context.
 * Allows editing name and email.
 * 
 * Features:
 * - Edit full name
 * - Edit email address
 * - Save changes to localStorage
 * - Success/error messages
 * - Loading state
 * - Form validation
 * 
 * Props: None
 * 
 * Usage:
 * <ProfileSettings />
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

/**
 * ProfileSettings Component
 * 
 * Manages user profile information updates.
 * Persists changes to localStorage.
 * 
 * @returns {React.ReactElement} Profile settings form
 */
export const ProfileSettings: React.FC = () => {
  /**
   * Get user and auth functions from context
   */
  const { user, updateUser } = useAuth()

  /**
   * Full name state
   */
  const [fullName, setFullName] = useState('')
  
  /**
   * Email state
   */
  const [email, setEmail] = useState('')
  
  /**
   * Loading state
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * Success message
   */
  const [successMessage, setSuccessMessage] = useState('')
  
  /**
   * Error message
   */
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Load initial user data on mount
   */
  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  /**
   * Handle profile update
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    /**
     * Validate full name
     */
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name')
      return
    }

    /**
     * Validate email
     */
    if (!email.trim()) {
      setErrorMessage('Please enter your email')
      return
    }

    /**
     * Validate email format
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      /**
       * Simulate API call
       */
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      /**
       * Update profile via AuthContext.
       * This updates React state, the session, and the mock database,
       * so the change persists across logout/login.
       */
      updateUser({
        name: fullName,
        email: email,
      })

      setSuccessMessage('Profile updated successfully!')
      
      /**
       * Clear message after 3 seconds
       */
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Section title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Profile Information
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✓ {successMessage}
          </div>
        )}

        {/* Profile picture section */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Profile Picture</p>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              Upload new picture
            </button>
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            We'll use this for important account notifications
          </p>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
