/**
 * ProfileSettings Component
 * 
 * Form for users to update their profile information.
 * Allows editing name, email, and profile picture.
 * Displays current user information.
 * 
 * Features:
 * - Edit full name
 * - Edit email address
 * - Profile picture upload (mock)
 * - Save changes button
 * - Success/error messages
 * - Loading state
 * 
 * Props: None
 * 
 * Usage:
 * <ProfileSettings />
 */

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

/**
 * ProfileSettings Component
 * 
 * Manages user profile information updates.
 * Shows current profile and allows editing.
 * 
 * @returns {React.ReactElement} Profile settings form
 */
export const ProfileSettings: React.FC = () => {
  /**
   * Get user from auth context
   */
  const { user } = useAuth()

  /**
   * Full name state
   */
  const [fullName, setFullName] = useState(user?.name || '')
  
  /**
   * Email state
   */
  const [email, setEmail] = useState(user?.email || '')
  
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
   * Handle profile update
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccessMessage('Profile updated successfully!')
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
            {successMessage}
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
