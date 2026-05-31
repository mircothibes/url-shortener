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
   */
  const [loading, setLoading] = useState(false)

  /**
   * Mock database reference
   * Loaded from localStorage on mount
   * Updated when new users register
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
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user_data')
      
      if (storedToken && storedUser) {
        setLoading(true)
        try {
          /**
           * Simulate API delay
           */
          await new Promise(resolve => setTimeout(resolve, 500))
          
          /**
           * Restore user and token
           */
          const userData: User = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(userData)
        } catch (error) {
          console.error('Auth restoration failed:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
        } finally {
          setLoading(false)
        }
      }
    }

    restoreAuth()
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
      await new Promise(resolve => setTimeout(resolve, 800))

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
      await new Promise(resolve => setTimeout(resolve, 1000))

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
