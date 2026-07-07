/**
 * API Client
 *
 * Central axios instance for talking to the backend.
 * Base URL comes from the VITE_API_URL environment variable.
 *
 * Authentication: after a user logs in, a JWT access token is stored in
 * localStorage under 'auth_token' and attached to every request as
 * "Authorization: Bearer <token>". Requests made before login carry no
 * token; protected endpoints answer 401 and the response interceptor
 * sends the user to the login page.
 */

import axios from 'axios'

/**
 * Base URL of the backend API, read from the environment.
 * Falls back to localhost for safety during development.
 */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
 * Attach the user's JWT access token (when present) to every request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/change-password')

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
