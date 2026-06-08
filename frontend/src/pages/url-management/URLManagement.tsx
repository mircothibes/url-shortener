/**
 * URLManagement Page
 *
 * Complete URL management interface for users.
 * Display all user URLs with search, filter, and management options.
 * Allows editing, deleting, copying, and viewing analytics for each URL.
 * Supports dark mode.
 *
 * Features:
 * - Search URLs by short code or original URL
 * - Sort by date or clicks
 * - Filter by status
 * - Delete URLs with confirmation
 * - Copy short code to clipboard
 * - Navigate to analytics
 * - Edit URL details
 * - Grid and list view options
 * - Empty state message
 * - Dark mode support
 *
 * Props: None (uses hooks)
 *
 * Usage:
 * <URLManagement />
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { URLCard } from '../../components/URLManagement/URLCard'
import { SearchBar } from '../../components/URLManagement/SearchBar'

/**
 * Mock URL data interface
 */
interface URLData {
  /**
   * Unique URL identifier
   */
  id: string

  /**
   * Generated short code
   */
  shortCode: string

  /**
   * Original long URL
   */
  originalUrl: string

  /**
   * Total clicks on this URL
   */
  clicks: number

  /**
   * Creation date as formatted string
   */
  createdAt: string

  /**
   * URL status (active or inactive)
   */
  status: 'active' | 'inactive'
}

/**
 * Mock URLs data for demonstration
 */
const mockURLs: URLData[] = [
  {
    id: '1',
    shortCode: 'abc123',
    originalUrl: 'https://github.com/mircothibes/url-shortener',
    clicks: 245,
    createdAt: 'May 20, 2024',
    status: 'active',
  },
  {
    id: '2',
    shortCode: 'xyz789',
    originalUrl: 'https://linkedin.com/in/marcosvtkemer',
    clicks: 128,
    createdAt: 'May 18, 2024',
    status: 'active',
  },
  {
    id: '3',
    shortCode: 'def456',
    originalUrl: 'https://example.com/very-long-url-path',
    clicks: 87,
    createdAt: 'May 15, 2024',
    status: 'active',
  },
  {
    id: '4',
    shortCode: 'ghi789',
    originalUrl: 'https://example.com/another-long-url',
    clicks: 42,
    createdAt: 'May 10, 2024',
    status: 'inactive',
  },
  {
    id: '5',
    shortCode: 'jkl012',
    originalUrl: 'https://example.com/inactive-link',
    clicks: 0,
    createdAt: 'May 5, 2024',
    status: 'inactive',
  },
]

/**
 * URLManagement Component
 *
 * Main page for managing shortened URLs.
 * Displays all user URLs with search and management features.
 *
 * @returns {React.ReactElement} URL management page
 */
export const URLManagement: React.FC = () => {
  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * Auth context hook
   */
  const { user } = useAuth()

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
   * URLs state (mock data)
   */
  const [urls, setUrls] = useState<URLData[]>(mockURLs)

  /**
   * Filter and sort URLs based on search, sort, and filter options
   */
  const filteredURLs = useMemo(() => {
    let result = [...urls]

    /**
     * Apply search filter
     */
    if (searchTerm) {
      result = result.filter(
        (url) =>
          url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    /**
     * Apply status filter
     */
    if (filterStatus !== 'all') {
      result = result.filter((url) => url.status === filterStatus)
    }

    /**
     * Apply sorting
     */
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'most-clicks':
        result.sort((a, b) => b.clicks - a.clicks)
        break
      case 'least-clicks':
        result.sort((a, b) => a.clicks - b.clicks)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [urls, searchTerm, sortBy, filterStatus])

  /**
   * Handle delete URL
   */
  const handleDeleteURL = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id))
  }

  /**
   * Handle view analytics for URL
   */
  const handleViewAnalytics = (id: string) => {
    navigate(`/analytics/${id}`)
  }

  /**
   * Handle edit URL
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

        {/* Results summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold dark:text-slate-200">{filteredURLs.length}</span> of{' '}
            <span className="font-semibold dark:text-slate-200">{urls.length}</span> URLs
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
                createdAt={url.createdAt}
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
      </div>
    </div>
  )
}
