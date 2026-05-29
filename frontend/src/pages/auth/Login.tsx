/**
 * Login Page
 * 
 * User authentication page for signing in with email and password.
 * Displays a form with email and password inputs.
 * Validates input before submission.
 * Redirects to dashboard on successful login.
 * 
 * Features:
 * - Email and password inputs
 * - Form validation
 * - Loading state during login
 * - Error message display
 * - Link to register page
 * 
 * Usage:
 * <Login />
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'

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
      setError('Please fill in all fields')
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
      setError('Invalid email or password')
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-slate-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-slate-300"></div>

        {/* Sign Up Link */}
        <p className="text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
