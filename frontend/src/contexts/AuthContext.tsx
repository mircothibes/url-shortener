/**
 * AuthContext
 * 
 * Global authentication context for the application.
 * Manages user login state, authentication token, and logout functionality.
 * Provides authentication state to entire app through React Context API.
 * 
 * Features:
 * - User login/logout management
 * - Token storage (localStorage)
 * - Automatic token restoration on app load
 * - Loading state during auth operations
 * 
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react'

/**
 * User interface - represents authenticated user data
 */
interface User {
  /**
   * Unique user identifier
   */
  id: string
  
  /**
   * User's email address
   */
  email: string
  
  /**
   * User's display name
   */
  name: string
}

/**
 * AuthContext interface - defines shape of auth context
 */
interface AuthContextType {
  /**
   * Currently authenticated user or null if not authenticated
   */
  user: User | null
  
  /**
   * Authentication token (Bearer token for API calls)
   */
  token: string | null
  
  /**
   * Whether auth operations are in progress
   */
  loading: boolean
  
  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean
  
  /**
   * Login user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise with user data
   */
  login: (email: string, password: string) => Promise<void>
  
  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   * @param name - User full name
   * @returns Promise with user data
   */
  register: (email: string, password: string, name: string) => Promise<void>
  
  /**
   * Logout current user
   * Clears token and user data
   */
  logout: () => void
}

/**
 * Create AuthContext with initial undefined state
 * Will be provided by AuthProvider
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  /**
   * Child components to wrap with auth provider
   */
  children: ReactNode
}

/**
 * AuthProvider Component
 * 
 * Provides authentication context to entire application.
 * Manages login, register, logout operations.
 * Restores token from localStorage on mount.
 * 
 * @param {AuthProviderProps} props - Provider props
 * @returns {React.ReactElement} Provider wrapper
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  /**
   * Current user data
   */
  const [user, setUser] = useState<User | null>(null)
  
  /**
   * Authentication token stored in localStorage
   */
  const [token, setToken] = useState<string | null>(null)
  
  /**
   * Loading state for async operations
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * API base URL from backend
   * Change this to match your backend URL
   */
  const API_URL = 'https://url-shortener-1000156659602.us-central1.run.app'

  /**
   * Restore authentication on app load
   * Checks localStorage for existing token
   * Validates token by calling backend
   */
  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedToken) {
        setLoading(true)
        try {
          /**
           * Validate token by calling health endpoint
           * (Replace with actual endpoint when ready)
           */
          const response = await fetch(`${API_URL}/health`)
          if (response.ok) {
            setToken(storedToken)
            /**
             * TODO: Fetch user data from backend
             * For now, we'll set placeholder user
             */
            const userEmail = localStorage.getItem('user_email') || ''
            const userName = localStorage.getItem('user_name') || ''
            
            if (userEmail) {
              setUser({
                id: '1',
                email: userEmail,
                name: userName,
              })
            }
          } else {
            /**
             * Token invalid - clear storage
             */
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_email')
            localStorage.removeItem('user_name')
          }
        } catch (error) {
          console.error('Auth restoration failed:', error)
          localStorage.removeItem('auth_token')
        } finally {
          setLoading(false)
        }
      }
    }

    restoreAuth()
  }, [])

  /**
   * Login user with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @throws Error if login fails
   */
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      /**
       * Call backend login endpoint
       * TODO: Create /api/v1/auth/login endpoint in backend
       */
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      const { token: newToken, user: userData } = data

      /**
       * Store token and user data
       */
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('user_email', userData.email)
      localStorage.setItem('user_name', userData.name)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Register new user
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User full name
   * @throws Error if registration fails
   */
  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      /**
       * Call backend register endpoint
       * TODO: Create /api/v1/auth/register endpoint in backend
       */
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      const { token: newToken, user: userData } = data

      /**
       * Store token and user data
       */
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('user_email', userData.email)
      localStorage.setItem('user_name', userData.name)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout current user
   * Clears token and user data from state and storage
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
  }

  /**
   * Context value object
   * Provides all auth state and functions to context consumers
   */
  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
