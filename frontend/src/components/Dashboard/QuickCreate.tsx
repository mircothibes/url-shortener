/**
 * QuickCreate Component
 * 
 * Quick form to create a shortened URL directly from dashboard.
 * Allows users to paste a long URL and get a short code instantly.
 * Minimal form with essential fields only.
 * 
 * Features:
 * - URL input field
 * - Optional custom code
 * - Create button with loading state
 * - Error message display
 * - Success message
 * - Copy short code on success
 * 
 * Props:
 * - onSuccess: Callback when URL created successfully
 * - onError: Callback when creation fails
 * 
 * Usage:
 * <QuickCreate 
 *   onSuccess={handleSuccess}
 *   onError={handleError}
 * />
 */

import React, { useState } from 'react'
import { Button } from '../UI/Button'
import { Copy, Check } from 'lucide-react'

/**
 * Props interface for QuickCreate component
 */
interface QuickCreateProps {
  /**
   * Callback when URL is created successfully
   * @param shortCode - Generated short code
   * @param originalUrl - Original URL that was shortened
   */
  onSuccess: (shortCode: string, originalUrl: string) => void
  
  /**
   * Callback when creation fails
   * @param error - Error message
   */
  onError: (error: string) => void
}

/**
 * QuickCreate Component
 * 
 * Renders a compact form for quick URL shortening.
 * Takes original URL and optional custom code.
 * Simulates API call and shows success/error feedback.
 * 
 * @param {QuickCreateProps} props - Component props
 * @returns {React.ReactElement} Quick create form
 */
export const QuickCreate: React.FC<QuickCreateProps> = ({ 
  onSuccess, 
  onError 
}) => {
  /**
   * Original URL input state
   */
  const [originalUrl, setOriginalUrl] = useState('')
  
  /**
   * Custom short code input state
   * Optional - if empty, system generates random code
   */
  const [customCode, setCustomCode] = useState('')
  
  /**
   * Loading state during submission
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * Success message and short code
   */
  const [success, setSuccess] = useState<{
    shortCode: string
    message: string
  } | null>(null)
  
  /**
   * Error message
   */
  const [error, setError] = useState('')
  
  /**
   * Track if short code was copied
   * For showing "Copied!" feedback
   */
  const [copied, setCopied] = useState(false)

  /**
   * Validate URL format
   * Basic validation for HTTP/HTTPS URLs
   */
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Generate random short code
   * Used if custom code not provided
   */
  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Handle form submission
   * Validates inputs and creates short URL
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    /**
     * Validate original URL
     */
    if (!originalUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(originalUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    /**
     * Validate custom code if provided
     */
    if (customCode && customCode.length < 2) {
      setError('Custom code must be at least 2 characters')
      return
    }

    setLoading(true)
    try {
      /**
       * Simulate API call delay
       * In production, this would be replaced with real API call
       */
      await new Promise(resolve => setTimeout(resolve, 800))

      /**
       * Generate short code (use custom or auto-generate)
       */
      const shortCode = customCode || generateShortCode()

      /**
       * Simulate URL creation success
       */
      const successMessage = `Short URL created! Code: ${shortCode}`
      setSuccess({
        shortCode,
        message: successMessage,
      })

      /**
       * Call success callback
       */
      onSuccess(shortCode, originalUrl)

      /**
       * Reset form
       */
      setOriginalUrl('')
      setCustomCode('')

      /**
       * Auto-hide success message after 5 seconds
       */
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create URL'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Copy short code to clipboard
   */
  const copyShortCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      
      {/* Header */}
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Create New Short URL
      </h2>
      <p className="text-slate-600 text-sm mb-6">
        Paste any long URL and we'll create a short code for you
      </p>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-green-600 font-medium">
              {success.message}
            </p>
            <button
              onClick={() => copyShortCode(success.shortCode)}
              className="text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Original URL Input */}
        <div>
          <label className="block text-slate-700 font-medium mb-2">
            Long URL
          </label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
          />
        </div>

        {/* Custom Code Input */}
        <div>
          <label className="block text-slate-700 font-medium mb-2">
            Custom Code (Optional)
          </label>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-link (leave empty for auto-generate)"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-1">
            At least 2 characters, letters and numbers only
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Short URL'}
        </Button>
      </form>
    </div>
  )
}
