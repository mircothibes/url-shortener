/**
 * Login Page
 *
 * User authentication page for signing in with email and password.
 * Displays a form with email and password inputs.
 * Validates input before submission.
 * Redirects to dashboard on successful login.
 * Supports dark mode.
 *
 * Features:
 * - Email and password inputs
 * - Form validation
 * - Loading state during login
 * - Error message display
 * - Link to register page
 * - Dark mode support
 *
 * Usage:
 * <Login />
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from 'react-i18next'

/**
 * Login Component
 *
 * Renders login form with email and password fields.
 * Handles form submission and redirects to dashboard on success.
 * Displays error messages if login fails.
 *
 * @returns {React.ReactElement} Login form page
 */
export const Login: React.FC = () => {
  /**
   * Form state - email input
   */
  const [email, setEmail] = useState('')

  /**
   * Form state - password input
   */
  const [password, setPassword] = useState('')

  /**
   * Error message to display
   */
  const [error, setError] = useState('')

  /**
   * Get auth context for login function
   */
  const { login, loading } = useAuth()
  const { t } = useTranslation()

  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * Handle form submission
   * Validates inputs and calls login function
   * Redirects to dashboard on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    /**
     * Input validation
     */
    if (!email || !password) {
      setError(t('auth.errors.fillAllFields'))
      return
    }

    /**
     * Email format validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('auth.errors.invalidEmail'))
      return
    }

    /**
     * Password length validation
     */
    if (password.length < 8) {
      setError(t('auth.errors.passwordTooShort'))
      return
    }

    try {
      /**
       * Call login function from auth context
       */
      await login(email, password)

      /**
       * Redirect to dashboard on success
       */
      navigate('/dashboard')
    } catch (err) {
      /**
       * Display error message if login fails
       */
      setError(t('auth.errors.invalidCredentials'))
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md transition-colors">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToHome')}</span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('auth.login.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('auth.login.subtitle')}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              {t('auth.login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
              {t('auth.login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-slate-300 dark:border-slate-600"></div>

        {/* Sign Up Link */}
        <p className="text-center text-slate-600 dark:text-slate-400">
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            {t('auth.login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
