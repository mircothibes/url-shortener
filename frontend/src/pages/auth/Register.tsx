/**
 * Register Page
 *
 * User registration page for creating a new account.
 * Displays a form with name, email, password, and password confirmation.
 * Validates all inputs before submission.
 * Redirects to dashboard on successful registration.
 * Supports dark mode.
 *
 * Features:
 * - Name, email, password inputs
 * - Password confirmation validation
 * - Form validation
 * - Loading state during registration
 * - Error message display
 * - Link to login page
 * - Dark mode support
 *
 * Usage:
 * <Register />
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'

/**
 * Register Component
 *
 * Renders registration form with name, email, password, and password confirmation.
 * Handles form submission and redirects to dashboard on success.
 * Displays error messages if registration fails.
 *
 * @returns {React.ReactElement} Registration form page
 */
export const Register: React.FC = () => {
  /**
   * Form state - user name input
   */
  const [name, setName] = useState('')

  /**
   * Form state - email input
   */
  const [email, setEmail] = useState('')

  /**
   * Form state - password input
   */
  const [password, setPassword] = useState('')

  /**
   * Form state - password confirmation input
   */
  const [confirmPassword, setConfirmPassword] = useState('')

  /**
   * Error message to display
   */
  const [error, setError] = useState('')

  /**
   * Get auth context for register function
   */
  const { register, loading } = useAuth()

  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * Handle form submission
   * Validates all inputs and calls register function
   * Redirects to dashboard on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    /**
     * Input validation - all fields required
     */
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    /**
     * Name length validation
     */
    if (name.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    /**
     * Email format validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return
    }

    /**
     * Password length validation
     */
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    /**
     * Password confirmation validation
     */
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      /**
       * Call register function from auth context
       */
      await register(email, password, name)

      /**
       * Redirect to dashboard on success
       */
      navigate('/dashboard')
    } catch (err) {
      /**
       * Display error message if registration fails
       */
      setError('Registration failed. Email may already be in use.')
      console.error('Register error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md transition-colors">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join us and start shortening URLs
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              At least 6 characters
            </p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Terms of Service */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"
              disabled={loading}
            />
            <label htmlFor="terms" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-slate-300 dark:border-slate-600"></div>

        {/* Login Link */}
        <p className="text-center text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
