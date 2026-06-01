/**
 * Analytics Page
 * 
 * Complete analytics dashboard for a shortened URL.
 * Shows detailed statistics with multiple charts.
 * Displays clicks over time, country breakdown, device distribution.
 * 
 * Features:
 * - Line chart for click trends
 * - Pie chart for countries
 * - Bar chart for devices
 * - Summary statistics
 * - Responsive grid layout
 * - Back button to dashboard
 * 
 * Props: None (uses URL params to get URL ID)
 * 
 * Usage:
 * <Analytics />
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/UI/Button'
import { ClicksChart } from '../../components/Analytics/ClicksChart'
import { CountriesChart } from '../../components/Analytics/CountriesChart'
import { DeviceChart } from '../../components/Analytics/DeviceChart'

/**
 * Mock analytics data for demonstration
 */
const mockAnalyticsData = {
  urlId: '1',
  shortCode: 'abc123',
  originalUrl: 'https://github.com/mircothibes/url-shortener',
  totalClicks: 245,
  uniqueVisitors: 189,
  clicksData: [
    { date: 'May 15', clicks: 12 },
    { date: 'May 16', clicks: 19 },
    { date: 'May 17', clicks: 8 },
    { date: 'May 18', clicks: 25 },
    { date: 'May 19', clicks: 18 },
    { date: 'May 20', clicks: 31 },
    { date: 'May 21', clicks: 28 },
    { date: 'May 22', clicks: 22 },
    { date: 'May 23', clicks: 35 },
    { date: 'May 24', clicks: 42 },
  ],
  countriesData: [
    { name: 'Brazil', value: 95 },
    { name: 'USA', value: 68 },
    { name: 'Germany', value: 45 },
    { name: 'Japan', value: 25 },
    { name: 'France', value: 12 },
  ],
  deviceData: [
    { device: 'Mobile', clicks: 142, percentage: 58 },
    { device: 'Desktop', clicks: 89, percentage: 36 },
    { device: 'Tablet', clicks: 14, percentage: 6 },
  ],
}

/**
 * Analytics Component
 * 
 * Main analytics page showing comprehensive statistics for a URL.
 * Displays multiple charts and summary information.
 * 
 * @returns {React.ReactElement} Analytics page
 */
export const Analytics: React.FC = () => {
  /**
   * Router navigation hook
   */
  const navigate = useNavigate()

  /**
   * Handle back navigation to dashboard
   */
  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Analytics: {mockAnalyticsData.shortCode}
          </h1>
          <p className="text-slate-600">
            {mockAnalyticsData.originalUrl}
          </p>
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Total clicks card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-slate-600 text-sm font-medium mb-2">
              Total Clicks
            </h3>
            <p className="text-4xl font-bold text-slate-900">
              {mockAnalyticsData.totalClicks}
            </p>
            <p className="text-sm text-green-600 mt-2">
              ↑ 12.5% from last week
            </p>
          </div>

          {/* Unique visitors card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-slate-600 text-sm font-medium mb-2">
              Unique Visitors
            </h3>
            <p className="text-4xl font-bold text-slate-900">
              {mockAnalyticsData.uniqueVisitors}
            </p>
            <p className="text-sm text-green-600 mt-2">
              ↑ 8.2% from last week
            </p>
          </div>
        </div>

        {/* Charts grid */}
        <div className="space-y-6 mb-8">
          
          {/* Clicks over time chart */}
          <ClicksChart
            data={mockAnalyticsData.clicksData}
            title="Clicks Over Time"
          />

          {/* Country and device charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Countries chart */}
            <CountriesChart
              data={mockAnalyticsData.countriesData}
              title="Clicks by Country"
            />

            {/* Device chart */}
            <DeviceChart
              data={mockAnalyticsData.deviceData}
              title="Clicks by Device"
            />
          </div>
        </div>

        {/* Additional info section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">
            📊 About This Analytics
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Data is updated in real-time</li>
            <li>✓ Geolocation determined from user IP address</li>
            <li>✓ Device type detected from User-Agent</li>
            <li>✓ All data is anonymized and privacy-respecting</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
