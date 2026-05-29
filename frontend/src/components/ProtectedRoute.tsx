/**
 * ProtectedRoute Component
 * 
 * Route wrapper that protects pages requiring authentication.
 * Redirects unauthenticated users to login page.
 * Allows authenticated users to access protected pages.
 * 
 * Features:
 * - Authentication check
 * - Automatic redirect to login if not authenticated
 * - Loading state while checking auth
 * - Clean component wrapping
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  /**
   * Child component to render if authenticated
   */
  children: React.ReactNode
}

/**
 * ProtectedRoute Component
 * 
 * Checks if user is authenticated before rendering child component.
 * If not authenticated, redirects to login page.
 * If loading, shows loading indicator.
 * 
 * @param {ProtectedRouteProps} props - Component props
 * @returns {React.ReactElement} Protected route wrapper
 * 
 * Example:
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  /**
   * Get authentication state from context
   */
  const { isAuthenticated, loading } = useAuth()

  /**
   * Show loading spinner while checking authentication
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  /**
   * If not authenticated, redirect to login
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  /**
   * User is authenticated - render child component
   */
  return <>{children}</>
}
