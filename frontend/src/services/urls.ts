/**
 * URL Service
 *
 * Functions to interact with the backend URL endpoints.
 * Handles the conversion between the API's snake_case shape
 * and the camelCase shape used across the frontend.
 */

import { api } from './api'

/**
 * Shape of a URL as the frontend uses it (camelCase).
 */
export interface URLItem {
  id: string
  shortCode: string
  originalUrl: string
  clicks: number
  createdAt: string
  isActive: boolean
  description?: string
}

/**
 * Raw URL shape returned by the API (snake_case).
 */
interface URLResponseRaw {
  id: number
  short_code: string
  original_url: string
  created_at: string
  total_clicks: number
  is_active: boolean
  description?: string | null
}

/**
 * Map an API URL object to the frontend shape.
 */
const mapURL = (raw: URLResponseRaw): URLItem => ({
  id: String(raw.id),
  shortCode: raw.short_code,
  originalUrl: raw.original_url,
  clicks: raw.total_clicks,
  createdAt: raw.created_at,
  isActive: raw.is_active,
  description: raw.description ?? undefined,
})

/**
 * Fetch all URLs from the backend.
 *
 * @returns {Promise<URLItem[]>} List of URLs in frontend shape
 */
export const listURLs = async (): Promise<URLItem[]> => {
  const response = await api.get<URLResponseRaw[]>('/api/v1/urls')
  return response.data.map(mapURL)
}

/**
 * Create a new shortened URL.
 *
 * @param {string} originalUrl - The long URL to shorten
 * @param {string} [customSlug] - Optional custom short code
 * @returns {Promise<URLItem>} The created URL in frontend shape
 */
export const createURL = async (
  originalUrl: string,
  customSlug?: string
): Promise<URLItem> => {
  const body: Record<string, unknown> = { original_url: originalUrl }
  if (customSlug) {
    body.custom_slug = customSlug
  }
  const response = await api.post<URLResponseRaw>('/api/v1/urls', body)
  return mapURL(response.data)
}

/**
 * Delete a URL by its id.
 *
 * @param {string} id - The URL id to delete
 */
export const deleteURL = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/urls/${id}`)
}

/**
 * Shape of analytics as the frontend charts use it.
 */
export interface URLAnalytics {
  totalClicks: number
  uniqueVisitors: number
  topCountry: string | null
  topDevice: string | null
  countriesData: { name: string; value: number }[]
  deviceData: { device: string; clicks: number; percentage: number }[]
}

/**
 * Raw analytics shape returned by the API (snake_case).
 * Breakdowns come as objects: { "name": count }.
 */
interface AnalyticsResponseRaw {
  total_clicks: number
  unique_visitors: number
  top_country: string | null
  top_device: string | null
  device_breakdown: Record<string, number>
  country_breakdown: Record<string, number>
  city_breakdown: Record<string, number>
  top_referrers: Record<string, number>
}

/**
 * Convert a breakdown object { name: count } into a sorted array
 * of { name, value }, largest first.
 */
const breakdownToArray = (
  breakdown: Record<string, number>
): { name: string; value: number }[] =>
  Object.entries(breakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

/**
 * Fetch analytics for a given URL and adapt it to the chart shapes.
 *
 * @param {string} id - The URL id
 * @returns {Promise<URLAnalytics>} Analytics in frontend shape
 */
export const getAnalytics = async (id: string): Promise<URLAnalytics> => {
  const response = await api.get<AnalyticsResponseRaw>(
    `/api/v1/urls/${id}/analytics`
  )
  const raw = response.data

  const totalClicks = raw.total_clicks

  /**
   * Countries: object -> [{ name, value }]
   */
  const countriesData = breakdownToArray(raw.country_breakdown)

  /**
   * Devices: object -> [{ device, clicks, percentage }]
   */
  const deviceData = Object.entries(raw.device_breakdown)
    .map(([device, clicks]) => ({
      device,
      clicks,
      percentage:
        totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)

  return {
    totalClicks,
    uniqueVisitors: raw.unique_visitors,
    topCountry: raw.top_country,
    topDevice: raw.top_device,
    countriesData,
    deviceData,
  }
}
