/**
 * ProfileSettings Component
 *
 * Form for users to update their profile information.
 * Saves changes via AuthContext (persists to mock database).
 * Allows editing name, email, and uploading a profile picture (stored as base64).
 * Supports dark mode.
 *
 * Features:
 * - Edit full name
 * - Edit email address
 * - Upload profile picture (local, base64, persisted in browser)
 * - Persist changes via updateUser
 * - Success/error messages
 * - Loading state
 * - Form validation
 * - Dark mode support
 *
 * Props: None
 *
 * Usage:
 * <ProfileSettings />
 */

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'

/**
 * Maximum allowed image size in bytes (2 MB).
 * Larger images risk exceeding localStorage limits.
 */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024

/**
 * ProfileSettings Component
 *
 * Manages user profile information updates.
 * Persists changes via AuthContext.
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
   * Avatar state (base64 data URL or empty)
   */
  const [avatar, setAvatar] = useState('')

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
   * Hidden file input reference, triggered by the "Upload new picture" button
   */
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Load initial user data on mount
   */
  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  /**
   * Open the file picker when "Upload new picture" is clicked
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handle file selection: validate, read as base64, and set as avatar preview.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('')
    const file = e.target.files?.[0]
    if (!file) return

    /**
     * Validate file type
     */
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file')
      return
    }

    /**
     * Validate file size
     */
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage('Image must be smaller than 2MB')
      return
    }

    /**
     * Read the file as a base64 data URL for preview and storage
     */
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatar(reader.result as string)
    }
    reader.onerror = () => {
      setErrorMessage('Failed to read image. Please try another file.')
    }
    reader.readAsDataURL(file)
  }

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
       * Update profile via AuthContext. The email is persisted to the
       * backend; name and avatar are kept locally for display.
       */
      await updateUser({
        name: fullName,
        email: email,
        avatar: avatar,
      })

      setSuccessMessage('Profile updated successfully!')

      /**
       * Clear message after 3 seconds
       */
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
      {/* Section title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Profile Information
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
            ✓ {successMessage}
          </div>
        )}

        {/* Profile picture section */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture</p>
            <button
              type="button"
              onClick={handleUploadClick}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
            >
              Upload new picture
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
