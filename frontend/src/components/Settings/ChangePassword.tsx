/**
 * ChangePassword Component
 * 
 * Form for users to change their account password securely.
 * Validates old password and new password confirmation.
 * Saves new password to localStorage.
 * 
 * Features:
 * - Old password verification
 * - New password input with strength indicator
 * - Confirm password validation
 * - Password requirements (min 8 chars)
 * - Success/error messages
 * - Form validation
 * - Loading state
 * 
 * Props: None
 * 
 * Usage:
 * <ChangePassword />
 */

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

/**
 * ChangePassword Component
 * 
 * Allows users to change their account password securely.
 * Validates both old and new passwords before submission.
 * Stores new password in localStorage.
 * 
 * @returns {React.ReactElement} Password change form
 */
export const ChangePassword: React.FC = () => {
  /**
   * Get auth data from context
   */
  const { user } = useAuth()

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
   * Calculate password strength
   */
  const getPasswordStrength = (password: string): string => {
    if (password.length < 8) return 'weak'
    if (password.length < 12) return 'medium'
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong'
    return 'medium'
  }

  /**
   * Get password strength color
   */
  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-slate-300'
    }
  }

  /**
   * Handle password change submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    /**
     * Get stored user data from localStorage
     */
    const storedUserData = localStorage.getItem('user_data')
    const userData = storedUserData ? JSON.parse(storedUserData) : null

    /**
     * Validate old password (mock comparison)
     */
    if (!oldPassword) {
      setErrorMessage('Please enter your current password')
      return
    }

    /**
     * Mock password verification
     * In real app, would be verified on backend
     */
    if (oldPassword !== 'demo123') {
      setErrorMessage('Current password is incorrect')
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
     * Validate password is different from old
     */
    if (newPassword === oldPassword) {
      setErrorMessage('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      /**
       * Simulate API call
       */
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      /**
       * Save new password (mock - in real app would hash on backend)
       */
      const passwordData = {
        oldPassword: oldPassword,
        newPassword: newPassword,
        changedAt: new Date().toISOString(),
      }
      localStorage.setItem('password_data', JSON.stringify(passwordData))
      
      setSuccessMessage('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      /**
       * Clear message after 3 seconds
       */
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

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
            ✓ {successMessage}
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
          <p className="text-xs text-slate-500 mt-1">
            (For demo: password is "demo123")
          </p>
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
          
          {/* Password strength indicator */}
          {newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-slate-600">Strength:</p>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getStrengthColor(passwordStrength)} w-1/3`}></div>
                </div>
                <span className="text-xs font-medium text-slate-700 capitalize">
                  {passwordStrength}
                </span>
              </div>
            </div>
          )}
          
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
          {newPassword && confirmPassword && newPassword === confirmPassword && (
            <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
          )}
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-600 mt-1">✗ Passwords do not match</p>
          )}
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
