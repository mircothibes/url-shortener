/**
 * API Client
 *
 * Central axios instance for talking to the backend.
 * Base URL comes from the VITE_API_URL environment variable.
 *
 * The backend requires an API key on every endpoint, sent as
 * "Authorization: Bearer <key>". The key comes from VITE_API_KEY.
 * When real user auth is added later, this can be replaced by a
 * per-user token injected via an interceptor.
 */

import axios from 'axios'

/**
 * Base URL of the backend API, read from the environment.
 * Falls back to localhost for safety during development.
 */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * API key used to authenticate requests against the backend.
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
 * Attach the API key to every outgoing request, if present.
 */
api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`
  }
  return config
})
