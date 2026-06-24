/**
 * URLManagement Page
 *
 * Complete URL management interface backed by the real API.
 * Lists all of the user's active URLs with search, sort, and filter,
 * and supports deleting, copying, and navigating to analytics.
 * Supports dark mode.
 *
 * Data comes from the backend via the urls service (listURLs / deleteURL).
 *
 * Props: None (uses hooks)
 *
 * Usage:
 * <URLManagement />
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { URLCard } from '../../components/URLManagement/URLCard'
import { SearchBar } from '../../components/URLManagement/SearchBar'
import { listURLs, deleteURL } from '../../services/urls'
import type { URLItem } from '../../services/urls'

/**
 * Format an ISO date string into a short, human-readable form.
 * Falls back to the raw value if it cannot be parsed.
 *
 * @param {string} iso - ISO date string from the API
 * @returns {string} Formatted date (e.g., "May 20, 2024")
 */
const formatDate = (iso: string): string => {
  const date = new Date(iso)
  if (isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * URLManagement Component
 *
 * Main page for managing shortened URLs, backed by the API.
 *
 * @returns {React.ReactElement} URL management page
 */
export const URLManagement: React.FC = () => {
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
   * Error message when fetching fails
   */
  const [error, setError] = useState<string | null>(null)

  /**
   * Search term state
   */
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * Sort option state
   */
  const [sortBy, setSortBy] = useState('newest')

  /**
   * Filter status state
   */
  const [filterStatus, setFilterStatus] = useState('all')

  /**
   * Fetch the user's URLs from the backend on mount.
   */
  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listURLs()
        if (active) {
          setUrls(data)
        }
      } catch {
        if (active) {
          setError('Failed to load your URLs. Please try again.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  /**
   * Filter and sort URLs based on search, sort, and filter options.
   */
  const filteredURLs = useMemo(() => {
    let result = [...urls]

    /**
     * Apply search filter
     */
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (url) =>
          url.shortCode.toLowerCase().includes(term) ||
          url.originalUrl.toLowerCase().includes(term)
      )
    }

    /**
     * Apply status filter
     */
    if (filterStatus !== 'all') {
      const wantActive = filterStatus === 'active'
      result = result.filter((url) => url.isActive === wantActive)
    }

    /**
     * Apply sorting
     */
    switch (sortBy) {
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        break
      case 'most-clicks':
        result.sort((a, b) => b.clicks - a.clicks)
        break
      case 'least-clicks':
        result.sort((a, b) => a.clicks - b.clicks)
        break
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [urls, searchTerm, sortBy, filterStatus])

  /**
   * Handle delete URL through the API, then remove it from local state.
   * The URLCard already asks for confirmation before calling this.
   */
  const handleDeleteURL = async (id: string) => {
    try {
      await deleteURL(id)
      setUrls((prev) => prev.filter((url) => url.id !== id))
    } catch {
      window.alert('Failed to delete the URL. Please try again.')
    }
  }

  /**
   * Handle view analytics for URL
   */
  const handleViewAnalytics = (id: string) => {
    navigate(`/analytics/${id}`)
  }

  /**
   * Handle edit URL (wired in Part 2, once the backend update endpoint exists)
   */
  const handleEditURL = (id: string) => {
    console.log('Edit URL:', id)
  }

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Page content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            URL Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all your shortened URLs in one place
          </p>
        </div>

        {/* Search and filter */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {loading ? (
          /**
           * Loading state
           */
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            Loading your URLs...
          </div>
        ) : error ? (
          /**
           * Error state
           */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Results summary */}
            <div className="mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold dark:text-slate-200">
                  {filteredURLs.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold dark:text-slate-200">
                  {urls.length}
                </span>{' '}
                URLs
              </p>
            </div>

            {/* URLs grid */}
            {filteredURLs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredURLs.map((url) => (
                  <URLCard
                    key={url.id}
                    id={url.id}
                    shortCode={url.shortCode}
                    originalUrl={url.originalUrl}
                    clicks={url.clicks}
                    createdAt={formatDate(url.createdAt)}
                    onDelete={handleDeleteURL}
                    onAnalytics={handleViewAnalytics}
                    onEdit={handleEditURL}
                  />
                ))}
              </div>
            ) : (
              /**
               * Empty state message
               */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No URLs found
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first shortened URL in the Dashboard'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
