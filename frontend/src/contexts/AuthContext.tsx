/**
 * AuthContext
 *
 * Global authentication state backed by the real backend API.
 *
 * - login/register call POST /api/v1/auth/{login,register} and store the
 *   returned JWT access token in localStorage ('auth_token').
 * - The token is attached to API requests by the axios interceptor in
 *   services/api.ts, so authenticated calls act on behalf of the user.
 * - The session is restored on app load from localStorage and validated
 *   against the token's expiry.
 *
 * The backend User has no display name, so the name shown in the UI is
 * derived from the email local-part until a name field exists server-side.
 *
 * Note: profile updates are local-only and password change is not wired
 * yet, because the backend does not expose those endpoints.
 */

import React, { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (updatedFields: Partial<User>) => void
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Derive a display name from an email address (local-part, prettified).
 * e.g. "jane.doe@example.com" -> "Jane Doe".
 */
const deriveName = (email: string): string => {
  const local = email.split('@')[0] || 'user'
  const pretty = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return pretty || 'User'
}

/**
 * Decode a JWT payload without verifying the signature (client-side only).
 */
const parseJwt = (token: string): { exp?: number } | null => {
  try {
    const payload = token.split('.')[1]
    const decoded = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Check whether a JWT is present and not expired.
 */
const isTokenValid = (token: string): boolean => {
  const payload = parseJwt(token)
  return !!(payload && payload.exp && payload.exp * 1000 > Date.now())
}

/**
 * Extract a human-readable message from an axios/backend error.
 */
const errorMessage = (err: unknown, fallback: string): string => {
  const detail = (err as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined
    if (first?.msg) return first.msg
  }
  return fallback
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  /**
   * Start in a loading state if a token exists, so ProtectedRoute waits
   * for the session to be restored instead of redirecting prematurely.
   */
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('auth_token')
  })

  const clearSession = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  /**
   * Restore the session on app load from localStorage, validating expiry.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedUser && isTokenValid(storedToken)) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        clearSession()
      }
    } else if (storedToken) {
      clearSession()
    }

    setLoading(false)
  }, [])

  /**
   * Keep the user in sync across browser tabs.
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Failed to parse updated user data:', error)
        }
      }
      if (e.key === 'auth_token' && !e.newValue) {
        setUser(null)
        setToken(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * Persist a session (token + user) to state and localStorage.
   */
  const persistSession = (accessToken: string, userData: User) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('auth_token', accessToken)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/login', { email, password })
      const { access_token, user_id, email: userEmail } = res.data
      persistSession(access_token, {
        id: user_id,
        email: userEmail,
        name: deriveName(userEmail),
      })
    } catch (err) {
      throw new Error(errorMessage(err, 'Invalid email or password'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Register a new account. The name argument is collected in the UI but
   * not sent, because the backend has no name field yet; the display name
   * is derived from the email.
   */
  const register = async (email: string, password: string, _name: string) => {
    setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/register', { email, password })
      const { access_token, user_id, email: userEmail } = res.data
      persistSession(access_token, {
        id: user_id,
        email: userEmail,
        name: deriveName(userEmail),
      })
    } catch (err) {
      throw new Error(errorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearSession()
  }

  /**
   * Update the local user profile (display only). Not persisted to the
   * backend, which has no profile-update endpoint yet.
   */
  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('user_data', JSON.stringify(updated))
      return updated
    })
  }

  /**
   * Password change is not available yet: the backend does not expose a
   * change-password endpoint. Kept for API compatibility with the UI.
   */
  const updatePassword = async (_currentPassword: string, _newPassword: string) => {
    throw new Error('Password change is not available yet')
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
