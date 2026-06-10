/**
 * API Client
 *
 * Central axios instance for talking to the backend.
 * Base URL comes from the VITE_API_URL environment variable.
 *
 * Note: the backend currently has no authentication, so no auth
 * headers are attached. When auth is added later, an interceptor
 * can inject the token here.
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
