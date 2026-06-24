/**
 * EditURLModal Component
 *
 * Modal dialog for editing an existing URL's editable fields:
 * original URL, description, and active status.
 * Calls the backend through updateURL and reports the saved item back.
 * Supports dark mode.
 *
 * Props:
 * - url: The URL being edited
 * - onClose: Callback to close the modal without saving
 * - onSaved: Callback with the updated URL after a successful save
 *
 * Usage:
 * <EditURLModal url={url} onClose={...} onSaved={...} />
 */

import React, { useState } from 'react'
import { updateURL } from '../../services/urls'
import type { URLItem, URLUpdateInput } from '../../services/urls'

/**
 * Props interface for EditURLModal component
 */
interface EditURLModalProps {
  /**
   * The URL being edited
   */
  url: URLItem

  /**
   * Callback to close the modal without saving
   */
  onClose: () => void

  /**
   * Callback with the updated URL after a successful save
   */
  onSaved: (updated: URLItem) => void
}

/**
 * EditURLModal Component
 *
 * @param {EditURLModalProps} props - Component props
 * @returns {React.ReactElement} Edit URL modal
 */
export const EditURLModal: React.FC<EditURLModalProps> = ({
  url,
  onClose,
  onSaved,
}) => {
  /**
   * Editable field state, prefilled from the URL
   */
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl)
  const [description, setDescription] = useState(url.description ?? '')
  const [isActive, setIsActive] = useState(url.isActive)

  /**
   * Saving and error state
   */
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Send the changes to the backend.
   */
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const input: URLUpdateInput = {
        originalUrl,
        description,
        isActive,
      }
      const updated = await updateURL(url.id, input)
      onSaved(updated)
    } catch {
      setError('Failed to save changes. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Edit URL
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {url.shortCode}
        </p>

        {/* Original URL field */}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Original URL
        </label>
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Description field */}
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="w-full mb-4 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Active toggle */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Active
          </span>
        </label>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
