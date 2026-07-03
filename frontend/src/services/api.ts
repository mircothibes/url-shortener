/**
 * API Client
 *
 * Central axios instance for talking to the backend.
 * Base URL comes from the VITE_API_URL environment variable.
 *
 * Authentication: once a user logs in, a JWT access token is stored in
 * localStorage under 'auth_token' and attached to every request as
 * "Authorization: Bearer <token>". If no token is present, the request
 * falls back to the build-time VITE_API_KEY (legacy API key) so the app
 * keeps working during the migration to full user auth.
 */

import axios from 'axios'

/**
 * Base URL of the backend API, read from the environment.
 * Falls back to localhost for safety during development.
 */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Legacy build-time API key, used only as a fallback when no user token
 * is available. Will be removed once user auth is fully adopted.
 */
const apiKey = import.meta.env.VITE_API_KEY || ''

/**
 * Shared axios instance with sensible defaults.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Attach the user's JWT (preferred) or the legacy API key to every
 * outgoing request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`
  }
  return config
})

/**
 * Handle expired or invalid sessions globally: on a 401 from any
 * non-auth endpoint, clear the stored session and send the user back
 * to the login page.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url: string = error.config?.url || ''
    const isAuthCall =
      url.includes('/auth/login') || url.includes('/auth/register')

    if (status === 401 && !isAuthCall) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
