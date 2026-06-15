/**
 * Analytics Page
 *
 * Complete analytics dashboard for a shortened URL.
 * Fetches real analytics data from the backend API.
 * Displays country breakdown and device distribution.
 * Supports dark mode.
 *
 * Features:
 * - Pie chart for countries (real data)
 * - Bar chart for devices (real data)
 * - Summary statistics (real data)
 * - Loading and error states
 * - Responsive grid layout
 * - Back button to dashboard
 * - Dark mode support
 *
 * Props: None (uses URL params to get URL ID)
 *
 * Usage:
 * <Analytics />
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CountriesChart } from '../../components/Analytics/CountriesChart'
import { DeviceChart } from '../../components/Analytics/DeviceChart'
import { getAnalytics, type URLAnalytics } from '../../services/urls'

/**
 * Analytics Component
 *
 * Main analytics page showing comprehensive statistics for a URL.
 * Displays charts and summary information from real backend data.
 *
 * @returns {React.ReactElement} Analytics page
 */
export const Analytics: React.FC = () => {
  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * URL id from the route (e.g. /analytics/:id)
   */
  const { urlId: id } = useParams<{ urlId: string }>()

  /**
   * Analytics data fetched from the backend
   */
  const [analytics, setAnalytics] = useState<URLAnalytics | null>(null)

  /**
   * Loading state while fetching
   */
  const [loading, setLoading] = useState(true)

  /**
   * Error message if the fetch fails
   */
  const [error, setError] = useState('')

  /**
   * Fetch analytics when the page mounts (or the id changes).
   */
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id) {
        setError('No URL selected.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await getAnalytics(id)
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to load analytics:', err)
        setError('Failed to load analytics. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [id])

  /**
   * Handle back navigation to dashboard
   */
  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Performance for this shortened URL
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center transition-colors">
            <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loaded content */}
        {!loading && !error && analytics && (
          <>
            {/* Summary statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

              {/* Total clicks card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
                  Total Clicks
                </h3>
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.totalClicks}
                </p>
              </div>

              {/* Unique visitors card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
                  Unique Visitors
                </h3>
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.uniqueVisitors}
                </p>
              </div>
            </div>

            {/* Charts grid */}
            {analytics.totalClicks > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Countries chart */}
                <CountriesChart
                  data={analytics.countriesData}
                  title="Clicks by Country"
                />

                {/* Device chart */}
                <DeviceChart
                  data={analytics.deviceData}
                  title="Clicks by Device"
                />
              </div>
            ) : (
              /* No clicks yet */
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center mb-8 transition-colors">
                <p className="text-slate-600 dark:text-slate-400">
                  No clicks recorded yet. Share your short URL to start collecting analytics.
                </p>
              </div>
            )}

            {/* Additional info section */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">
                📊 About This Analytics
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li>✓ Data is updated in real-time</li>
                <li>✓ Geolocation determined from user IP address</li>
                <li>✓ Device type detected from User-Agent</li>
                <li>✓ All data is anonymized and privacy-respecting</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
