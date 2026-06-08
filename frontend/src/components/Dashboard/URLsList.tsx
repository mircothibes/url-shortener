/**
 * URLsList Component
 *
 * Displays a list of shortened URLs created by the user.
 * Shows short code, original URL, clicks, and creation date.
 * Includes actions to copy, view analytics, and delete URLs.
 * Supports dark mode.
 *
 * Features:
 * - Scrollable table format
 * - Copy short code to clipboard
 * - View analytics button
 * - Delete URL button
 * - Responsive design
 * - Empty state message
 * - Dark mode support
 *
 * Props:
 * - urls: Array of URL objects
 * - onDelete: Callback when user clicks delete
 * - onAnalytics: Callback when user clicks analytics
 *
 * Usage:
 * <URLsList
 *   urls={userURLs}
 *   onDelete={handleDelete}
 *   onAnalytics={handleAnalytics}
 * />
 */

import React, { useState } from 'react'
import { Copy, BarChart3, Trash2, Check } from 'lucide-react'

/**
 * Interface for URL object
 */
interface URLItem {
  /**
   * Unique identifier for the URL
   */
  id: string

  /**
   * Short code (e.g., "abc123")
   */
  shortCode: string

  /**
   * Original long URL
   */
  originalUrl: string

  /**
   * Total number of clicks
   */
  clicks: number

  /**
   * Creation date as ISO string
   */
  createdAt: string

  /**
   * Optional description
   */
  description?: string
}

/**
 * Props interface for URLsList component
 */
interface URLsListProps {
  /**
   * Array of URLs to display
   */
  urls: URLItem[]

  /**
   * Callback when delete button is clicked
   * @param id - URL id to delete
   */
  onDelete: (id: string) => void

  /**
   * Callback when analytics button is clicked
   * @param id - URL id to view analytics
   */
  onAnalytics: (id: string) => void
}

/**
 * URLsList Component
 *
 * Renders a table of user's shortened URLs.
 * Displays key information and action buttons.
 * Shows empty state if no URLs exist.
 *
 * @param {URLsListProps} props - Component props
 * @returns {React.ReactElement} URLs list table
 */
export const URLsList: React.FC<URLsListProps> = ({
  urls,
  onDelete,
  onAnalytics
}) => {
  /**
   * Track which short code was just copied
   * Used to show "Copied!" feedback
   */
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /**
   * Copy short code to clipboard
   * Shows "Copied!" feedback for 2 seconds
   */
  const copyToClipboard = (shortCode: string, id: string) => {
    navigator.clipboard.writeText(shortCode)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  /**
   * Format date to readable format
   * Converts ISO string to "Jan 15, 2024" format
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  /**
   * Empty state - show when no URLs
   */
  if (urls.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center transition-colors">
        <p className="text-slate-600 dark:text-slate-400">
          No URLs created yet. Create your first short URL to get started!
        </p>
      </div>
    )
  }

  return (
    /**
     * URLs table wrapper with overflow scroll on mobile
     */
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
      <table className="w-full">

        {/* Table header */}
        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              Short Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              Original URL
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              Clicks
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table body */}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {urls.map((url) => (
            <tr key={url.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">

              {/* Short code with copy button */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded">
                    {url.shortCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(url.shortCode, url.id)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition"
                    title="Copy short code"
                  >
                    {copiedId === url.id ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>

              {/* Original URL - truncated on mobile */}
              <td className="px-6 py-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs" title={url.originalUrl}>
                  {url.originalUrl}
                </p>
              </td>

              {/* Click count */}
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {url.clicks}
                </p>
              </td>

              {/* Creation date */}
              <td className="px-6 py-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(url.createdAt)}
                </p>
              </td>

              {/* Action buttons */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAnalytics(url.id)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                    title="View analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(url.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                    title="Delete URL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
