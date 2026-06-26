/**
 * URLCard Component
 *
 * Individual URL card component for display and management.
 * Shows URL details with action buttons (copy, edit, analytics, delete).
 * Used in URLManagement page for managing multiple URLs. Supports dark mode.
 *
 * Features:
 * - Display short code and original URL
 * - Show click count and creation date
 * - Copy short code to clipboard
 * - Navigate to analytics
 * - Delete URL with confirmation
 * - Edit URL details
 * - Responsive design
 * - Dark mode support
 *
 * Props:
 * - id: URL identifier
 * - shortCode: Generated short code
 * - originalUrl: Original long URL
 * - clicks: Number of clicks
 * - createdAt: Creation date
 * - onDelete: Callback when deleting
 * - onAnalytics: Callback for analytics navigation
 * - onEdit: Callback for edit action
 *
 * Usage:
 * <URLCard
 *   id="1"
 *   shortCode="abc123"
 *   originalUrl="https://example.com"
 *   clicks={245}
 *   createdAt="May 20, 2024"
 *   onDelete={() => handleDelete('1')}
 *   onAnalytics={() => handleAnalytics('1')}
 *   onEdit={() => handleEdit('1')}
 * />
 */

import React, { useState } from 'react'

/**
 * Props interface for URLCard component
 */
interface URLCardProps {
  /**
   * Unique URL identifier
   */
  id: string

  /**
   * Generated short code (e.g., "abc123")
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
   * URL creation date as formatted string
   */
  createdAt: string

  /**
   * Callback function when delete button clicked
   */
  onDelete: (id: string) => void

  /**
   * Callback function when analytics button clicked
   */
  onAnalytics: (id: string) => void

  /**
   * Callback function when edit button clicked
   */
  onEdit: (id: string) => void
}

/**
 * URLCard Component
 *
 * Displays individual URL with management actions.
 * Shows URL details in a card format with action buttons.
 *
 * @param {URLCardProps} props - Component props
 * @returns {React.ReactElement} URL card component
 */
export const URLCard: React.FC<URLCardProps> = ({
  id,
  shortCode,
  originalUrl,
  clicks,
  createdAt,
  onDelete,
  onAnalytics,
  onEdit,
}) => {
  /**
   * State for showing copy confirmation message
   */
  const [copied, setCopied] = useState(false)

  /**
   * Handle copy short code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortCode)
      setCopied(true)

      /**
       * Reset copy message after 2 seconds
       */
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${shortCode}"?`
    )
    if (confirmed) {
      onDelete(id)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">

      {/* Header with short code and copy button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* Short code display */}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {shortCode}
          </h3>

          {/* Original URL truncated */}
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
            {originalUrl}
          </p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            copied
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">

        {/* Clicks stat */}
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase">
            Clicks
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {clicks}
          </p>
        </div>

        {/* Created date stat */}
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase">
            Created
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
            {createdAt}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">

        {/* Analytics button */}
        <button
          onClick={() => onAnalytics(id)}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded transition text-sm font-medium"
        >
          📊 Analytics
        </button>

        {/* Edit button */}
        <button
          onClick={() => onEdit(id)}
          className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded transition text-sm font-medium"
        >
          ✏️ Edit
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded transition text-sm font-medium"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
