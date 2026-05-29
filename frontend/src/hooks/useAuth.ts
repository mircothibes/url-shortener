/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context.
 * Provides easy access to user, token, and auth functions
 * from any component in the application.
 * 
 * Usage:
 * const { user, token, login, logout } = useAuth()
 * 
 * Throws error if used outside AuthProvider
 */

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * useAuth Hook
 * 
 * Retrieves authentication context from React Context.
 * Must be used inside <AuthProvider> wrapper.
 * 
 * @returns {AuthContextType} Authentication context with user, token, and functions
 * @throws Error if used outside AuthProvider
 * 
 * Example:
 * ```tsx
 * const { user, isAuthenticated, login } = useAuth()
 * 
 * if (isAuthenticated) {
 *   return <div>Welcome, {user?.name}</div>
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}
