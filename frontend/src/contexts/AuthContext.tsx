/**
 * AuthContext
 *
 * Global authentication context for the application.
 * Manages user login state, authentication token, and logout functionality.
 * Uses mock authentication with localStorage persistence.
 *
 * Mock Features:
 * - Simulated login with email/password
 * - Simulated registration
 * - Token storage in localStorage
 * - User database persistence (survives page reload)
 * - Automatic token restoration on app load
 * - Loading state during auth operations
 * - Profile update (name/email) persisted to mock database
 * - Password update persisted to mock database
 *
 * Persistence:
 * - Users stored in localStorage under 'mock_user_database' key
 * - Survives page reloads and browser closes
 * - Can be cleared manually via browser dev tools
 *
 * TODO: Replace mock responses with real API calls once backend auth is ready
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

  /**
   * Update current user data (name, email).
   * Updates React state, the active session, and the mock database
   * so changes persist across logout/login.
   * @param updatedFields - Partial user fields to update
   */
  updateUser: (updatedFields: Partial<User>) => void

  /**
   * Update current user's password.
   * Validates the current password and stores the new one in the mock database.
   * @param currentPassword - The user's current password
   * @param newPassword - The new password to set
   * @returns Promise that resolves if updated, rejects if current password is wrong
   */
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
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
 * Mock user database structure
 */
interface MockUserDatabase {
  [email: string]: {
    password: string
    user: User
  }
}

/**
 * Initial mock user database
 * Includes demo user for testing
 */
const initialMockDatabase: MockUserDatabase = {
  'demo@example.com': {
    password: 'demo123',
    user: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
    },
  },
}

/**
 * Load mock database from localStorage
 * Falls back to initial database if not found
 */
const loadMockDatabase = (): MockUserDatabase => {
  try {
    const stored = localStorage.getItem('mock_user_database')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load mock database from localStorage:', error)
  }
  return initialMockDatabase
}

/**
 * Save mock database to localStorage
 * Ensures persistence across page reloads
 */
const saveMockDatabase = (database: MockUserDatabase) => {
  try {
    localStorage.setItem('mock_user_database', JSON.stringify(database))
  } catch (error) {
    console.error('Failed to save mock database to localStorage:', error)
  }
}

/**
 * Generate mock JWT token (simulates backend token generation)
 * In production, backend would generate real JWT tokens
 */
const generateMockToken = (email: string): string => {
  return `mock_token_${email}_${Date.now()}`
}

/**
 * AuthProvider Component
 *
 * Provides authentication context to entire application.
 * Manages login, register, logout operations with persistent mock data.
 * Restores token from localStorage on mount.
 *
 * Mock Credentials for Testing:
 * - Email: demo@example.com
 * - Password: demo123
 *
 * Additional users can be registered and will persist across page reloads.
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
   * Starts as `true` if a token exists in localStorage, so ProtectedRoute
   * waits for session restoration instead of redirecting prematurely.
   */
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('auth_token')
  })

  /**
   * Mock database reference
   * Loaded from localStorage on mount
   * Updated when new users register or update their profile/password
   */
  const [mockDatabase, setMockDatabase] = useState<MockUserDatabase>(
    loadMockDatabase()
  )

  /**
   * Restore authentication on app load
   * Checks localStorage for existing token and user data
   * This runs once on component mount
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')

    if (storedToken && storedUser) {
      setLoading(true)
      try {
        /**
         * Simulate API delay
         */
        setTimeout(() => {
          const userData: User = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(userData)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Auth restoration failed:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setLoading(false)
      }
    }
  }, [])

  /**
   * Listen for storage changes (cross-tab sync)
   * Updates the user state when user_data is modified in another tab.
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue)
          setUser(updatedUser)
        } catch (error) {
          console.error('Failed to parse updated user data:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * Mock login function
   * Simulates backend authentication without real API
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @throws Error if credentials are invalid
   */
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      /**
       * Simulate network delay
       */
      await new Promise((resolve) => setTimeout(resolve, 800))

      /**
       * Check mock database for user
       */
      const mockUser = mockDatabase[email]

      if (!mockUser) {
        throw new Error('User not found')
      }

      /**
       * Validate password
       */
      if (mockUser.password !== password) {
        throw new Error('Invalid password')
      }

      /**
       * Generate mock token and set user
       */
      const newToken = generateMockToken(email)
      const userData = mockUser.user

      setToken(newToken)
      setUser(userData)

      /**
       * Persist to localStorage
       */
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('user_data', JSON.stringify(userData))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mock register function
   * Simulates backend registration without real API
   * Saves new user to mock database and persists to localStorage
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User full name
   * @throws Error if email already exists
   */
  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      /**
       * Simulate network delay
       */
      await new Promise((resolve) => setTimeout(resolve, 1000))

      /**
       * Check if email already exists
       */
      if (mockDatabase[email]) {
        throw new Error('Email already registered')
      }

      /**
       * Create new mock user
       */
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
      }

      /**
       * Add to mock database
       */
      const updatedDatabase = {
        ...mockDatabase,
        [email]: {
          password,
          user: newUser,
        },
      }

      /**
       * Update state and persist to localStorage
       */
      setMockDatabase(updatedDatabase)
      saveMockDatabase(updatedDatabase)

      /**
       * Generate mock token and set user
       */
      const newToken = generateMockToken(email)

      setToken(newToken)
      setUser(newUser)

      /**
       * Persist user session to localStorage
       */
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('user_data', JSON.stringify(newUser))
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
    localStorage.removeItem('user_data')
  }

  /**
   * Update user profile data (name, email).
   * Updates React state, the active session (user_data), AND the mock
   * user database, so changes persist across logout/login.
   *
   * @param {Partial<User>} updatedFields - Fields to update (e.g. name, email)
   */
  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser

      const updated = { ...prevUser, ...updatedFields }

      /**
       * Update active session
       */
      localStorage.setItem('user_data', JSON.stringify(updated))

      /**
       * Update mock database (source of truth at login).
       * The user is keyed by their ORIGINAL email; if the email changed,
       * move the entry to the new key.
       */
      setMockDatabase((prevDb) => {
        const oldEmail = prevUser.email
        const entry = prevDb[oldEmail]
        if (!entry) return prevDb

        const newDb = { ...prevDb }
        delete newDb[oldEmail]
        newDb[updated.email] = {
          ...entry,
          user: updated,
        }

        saveMockDatabase(newDb)
        return newDb
      })

      return updated
    })
  }

  /**
   * Update the current user's password in the mock database.
   * Validates the current password before applying the change so the
   * new password actually works on the next login.
   *
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to store
   * @throws Error if there is no user or the current password is wrong
   */
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    const entry = mockDatabase[user.email]
    if (!entry) {
      throw new Error('User not found in database')
    }

    if (entry.password !== currentPassword) {
      throw new Error('Current password is incorrect')
    }

    /**
     * Persist new password in the mock database (source of truth at login)
     */
    setMockDatabase((prevDb) => {
      const newDb = {
        ...prevDb,
        [user.email]: {
          ...prevDb[user.email],
          password: newPassword,
        },
      }
      saveMockDatabase(newDb)
      return newDb
    })
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
    updateUser,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
