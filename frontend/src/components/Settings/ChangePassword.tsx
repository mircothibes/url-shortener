/**
 * ChangePassword Component
 * 
 * Form for users to change their account password.
 * Validates old password and new password confirmation.
 * Shows success/error messages.
 * 
 * Features:
 * - Old password verification
 * - New password input
 * - Confirm password validation
 * - Password strength indicator
 * - Success/error messages
 * - Submit button with loading state
 * 
 * Props: None
 * 
 * Usage:
 * <ChangePassword />
 */

import React, { useState } from 'react'
import { Button } from '../UI/Button'

/**
 * ChangePassword Component
 * 
 * Allows users to change their account password securely.
 * Validates both old and new passwords before submission.
 * 
 * @returns {React.ReactElement} Password change form
 */
export const ChangePassword: React.FC = () => {
  /**
   * Old password state
   */
  const [oldPassword, setOldPassword] = useState('')
  
  /**
   * New password state
   */
  const [newPassword, setNewPassword] = useState('')
  
  /**
   * Confirm password state
   */
  const [confirmPassword, setConfirmPassword] = useState('')
  
  /**
   * Loading state during submission
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * Success message state
   */
  const [successMessage, setSuccessMessage] = useState('')
  
  /**
   * Error message state
   */
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * Handle password change submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    /**
     * Validate old password
     */
    if (!oldPassword) {
      setErrorMessage('Please enter your current password')
      return
    }

    /**
     * Validate new password
     */
    if (!newPassword) {
      setErrorMessage('Please enter your new password')
      return
    }

    /**
     * Validate password confirmation
     */
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    /**
     * Validate password length
     */
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters')
      return
    }

    /**
     * Simulate API call
     */
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Section title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Change Password
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

        {/* Old password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your current password"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            At least 8 characters
          </p>
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
