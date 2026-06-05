/**
 * Dashboard Page
 * 
 * Main dashboard page for authenticated users.
 * Shows overview statistics, quick URL creation form, and list of user's URLs.
 * Acts as the home page after login.
 * 
 * Features:
 * - Statistics cards (total URLs, clicks, etc)
 * - Quick URL creation form
 * - List of user's shortened URLs
 * - Delete URL functionality
 * - View analytics functionality
 * - Responsive grid layout
 * 
 * Props: None (uses auth context for user data)
 * 
 * Usage:
 * <Dashboard />
 */

import React, { useState } from 'react'
import { Link2, BarChart3, Eye, TrendingUp, Settings, List } from 'lucide-react'
import { StatsCard } from '../../components/Dashboard/StatsCard'
import { URLsList } from '../../components/Dashboard/URLsList'
import { QuickCreate } from '../../components/Dashboard/QuickCreate'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

/**
 * Interface for URL item in dashboard
 */
interface URLItem {
  id: string
  shortCode: string
  originalUrl: string
  clicks: number
  createdAt: string
  description?: string
}

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
   * Mock URLs list for demonstration
   * In production, would fetch from backend
   */
  const [urls, setUrls] = useState<URLItem[]>([
    {
      id: '1',
      shortCode: 'abc123',
      originalUrl: 'https://github.com/mircothibes/url-shortener',
      clicks: 245,
      createdAt: '2024-05-20T10:30:00Z',
      description: 'My GitHub project',
    },
    {
      id: '2',
      shortCode: 'xyz789',
      originalUrl: 'https://linkedin.com/in/marcosvtkemer',
      clicks: 128,
      createdAt: '2024-05-18T14:15:00Z',
      description: 'My LinkedIn profile',
    },
  ])

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
   * Handle successful URL creation
   * Adds new URL to the list
   */
  const handleURLCreated = (shortCode: string, originalUrl: string) => {
    const newURL: URLItem = {
      id: Date.now().toString(),
      shortCode,
      originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
    }
    setUrls([newURL, ...urls])
  }

  /**
   * Handle URL deletion
   * Removes URL from list
   */
  const handleDeleteURL = (id: string) => {
    if (confirm('Are you sure you want to delete this URL?')) {
      setUrls(urls.filter(url => url.id !== id))
    }
  }

  /**
   * Handle view analytics
   * In production, would navigate to analytics page
   */
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-slate-50">
      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header section */}
        <div className="mb-8 flex items-center justify-between"> 
         <div>
           <h1 className="text-3xl font-bold text-slate-900">
             Welcome back, {user?.name}! 👋
           </h1>
           <p className="text-slate-600 mt-2">
             Here's what's happening with your URLs today
           </p>
         </div>
         <div className="flex items-center gap-3">
           <button
             onClick={() => navigate('/urls')}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
           >
             <List className="w-5 h-5" />
             <span>Manage URLs</span>
           </button>
           <button
             onClick={() => navigate('/settings')}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Your URLs
            </h2>
            <URLsList
              urls={urls}
              onDelete={handleDeleteURL}
              onAnalytics={handleViewAnalytics}
            />
          </div>
        </div>

        {/* Quick tips section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Use descriptive custom codes for better brand recognition</li>
            <li>✓ Track analytics to see which links perform best</li>
            <li>✓ Share your short URLs to get more traffic</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
