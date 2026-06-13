/**
 * Dashboard Page
 *
 * Main dashboard page for authenticated users.
 * Shows overview statistics, quick URL creation form, and list of user's URLs.
 * Acts as the home page after login. Supports dark mode.
 * Fetches real URLs from the backend API.
 *
 * Features:
 * - Statistics cards (total URLs, clicks, etc)
 * - Quick URL creation form
 * - List of user's shortened URLs (from backend)
 * - Delete URL functionality
 * - View analytics functionality
 * - Responsive grid layout
 * - Dark mode support
 *
 * Props: None (uses auth context for user data)
 *
 * Usage:
 * <Dashboard />
 */

import React, { useState, useEffect } from 'react'
import { Link2, BarChart3, Eye, TrendingUp, Settings, List } from 'lucide-react'
import { StatsCard } from '../../components/Dashboard/StatsCard'
import { URLsList } from '../../components/Dashboard/URLsList'
import { QuickCreate } from '../../components/Dashboard/QuickCreate'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { listURLs, deleteURL, type URLItem } from '../../services/urls'

/**
 * Dashboard Component
 *
 * Main dashboard page showing user's URL statistics and management tools.
 * Displays stats in cards, provides form to create URLs, and shows list of URLs.
 *
 * @returns {React.ReactElement} Dashboard page
 */
export const Dashboard: React.FC = () => {
  /**
   * Get user from auth context
   */
  const { user } = useAuth()

  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * URLs fetched from the backend
   */
  const [urls, setUrls] = useState<URLItem[]>([])

  /**
   * Loading state while fetching URLs
   */
  const [loading, setLoading] = useState(true)

  /**
   * Error message if the fetch fails
   */
  const [error, setError] = useState('')

  /**
   * Fetch URLs from the backend.
   * Extracted so it can be reused after creating/deleting.
   */
  const fetchURLs = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listURLs()
      setUrls(data)
    } catch (err) {
      console.error('Failed to load URLs:', err)
      setError('Failed to load your URLs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load URLs once when the page mounts.
   */
  useEffect(() => {
    fetchURLs()
  }, [])

  /**
   * Calculate total statistics from URLs
   */
  const stats = {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
    averageClicks: urls.length > 0 ? Math.round(urls.reduce((sum, url) => sum + url.clicks, 0) / urls.length) : 0,
    topUrl: urls.length > 0 ? urls.reduce((max, url) => url.clicks > max.clicks ? url : max) : null,
  }

  /**
   * Handle successful URL creation.
   * Re-fetches the list from the backend so it stays in sync.
   */
  const handleURLCreated = () => {
    fetchURLs()
  }

  /**
   * Handle URL deletion.
   * Calls the backend, then re-fetches the list.
   */
  const handleDeleteURL = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return
    }
    try {
      await deleteURL(id)
      fetchURLs()
    } catch (err) {
      console.error('Failed to delete URL:', err)
      setError('Failed to delete the URL. Please try again.')
    }
  }

  /**
   * Handle view analytics
   */
  const handleViewAnalytics = (id: string) => {
    navigate(`/analytics/${id}`)
  }

  /**
   * Handle creation error
   */
  const handleCreationError = (error: string) => {
    console.error('URL creation error:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header section */}
        <div className="mb-8 flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
             Welcome back, {user?.name}! 👋
           </h1>
           <p className="text-slate-600 dark:text-slate-400 mt-2">
             Here's what's happening with your URLs today
           </p>
         </div>
         <div className="flex items-center gap-3">
           <button
             onClick={() => navigate('/urls')}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
           >
             <List className="w-5 h-5" />
             <span>Manage URLs</span>
           </button>
           <button
             onClick={() => navigate('/settings')}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
           >
             <Settings className="w-5 h-5" />
             <span>Settings</span>
           </button>
         </div>
        </div>
        {/* Statistics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Total URLs stat */}
          <StatsCard
            icon={<Link2 className="w-6 h-6" />}
            title="Total URLs"
            value={stats.totalUrls}
            color="blue"
          />

          {/* Total Clicks stat */}
          <StatsCard
            icon={<Eye className="w-6 h-6" />}
            title="Total Clicks"
            value={stats.totalClicks}
            change="+12.5%"
            color="green"
          />

          {/* Average Clicks stat */}
          <StatsCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Avg. Clicks"
            value={stats.averageClicks}
            change="+2.1%"
            color="purple"
          />

          {/* Top URL stat */}
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Top URL"
            value={stats.topUrl?.clicks || 0}
            color="orange"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Quick create form - spans 1 column */}
          <div className="lg:col-span-1">
            <QuickCreate
              onSuccess={handleURLCreated}
              onError={handleCreationError}
            />
          </div>

          {/* URLs list - spans 2 columns */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Your URLs
            </h2>

            {/* Loading state */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center transition-colors">
                <p className="text-slate-600 dark:text-slate-400">Loading your URLs...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* URLs list */}
            {!loading && !error && (
              <URLsList
                urls={urls}
                onDelete={handleDeleteURL}
                onAnalytics={handleViewAnalytics}
              />
            )}
          </div>
        </div>

        {/* Quick tips section */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>✓ Use descriptive custom codes for better brand recognition</li>
            <li>✓ Track analytics to see which links perform best</li>
            <li>✓ Share your short URLs to get more traffic</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
