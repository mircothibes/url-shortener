/**
 * StatsCard Component
 * 
 * Reusable card component for displaying dashboard statistics.
 * Shows a stat title, value, and optional change indicator.
 * Used throughout dashboard to display key metrics.
 * 
 * Features:
 * - Icon support (Lucide React)
 * - Large stat value display
 * - Optional change percentage
 * - Color-coded metrics
 * - Responsive design
 * 
 * Props:
 * - icon: React icon component
 * - title: Stat name (e.g., "Total URLs")
 * - value: Main stat number (e.g., 42)
 * - change: Optional percent change (e.g., +12%)
 * - color: Icon color (blue, green, red)
 * 
 * Usage:
 * <StatsCard 
 *   icon={<Link className="w-6 h-6" />}
 *   title="Total URLs"
 *   value={42}
 *   change="+12%"
 *   color="blue"
 * />
 */

import React from 'react'

/**
 * Props interface for StatsCard component
 */
interface StatsCardProps {
  /**
   * Icon component to display (Lucide React icon)
   * Should be passed as <IconComponent className="w-6 h-6" />
   */
  icon: React.ReactNode
  
  /**
   * Title/label for the stat
   * Examples: "Total URLs", "Total Clicks", "Unique Visitors"
   */
  title: string
  
  /**
   * Main statistic value to display
   * Examples: 42, 1234, 98.5
   */
  value: number | string
  
  /**
   * Optional change indicator (trend)
   * Examples: "+12%", "-5%", "↑ 23%"
   * If omitted, change indicator is not displayed
   */
  change?: string
  
  /**
   * Icon color theme
   * 'blue' | 'green' | 'red' | 'purple' | 'orange'
   * Determines the background and icon color
   */
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange'
}

/**
 * StatsCard Component
 * 
 * Displays a single statistic in a card format.
 * Includes icon, title, value, and optional trend indicator.
 * Color-coded for visual distinction.
 * 
 * @param {StatsCardProps} props - Component props
 * @returns {React.ReactElement} Stats card element
 * 
 * Example:
 * ```tsx
 * <StatsCard
 *   icon={<BarChart3 className="w-6 h-6" />}
 *   title="Total Clicks"
 *   value={1234}
 *   change="+8.5%"
 *   color="blue"
 * />
 * ```
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  change,
  color = 'blue',
}) => {
  /**
   * Color scheme mapping
   * Maps color names to Tailwind classes
   */
  const colorSchemes = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  /**
   * Change color scheme
   * Green for positive, red for negative
   */
  const getChangeColor = (changeText?: string) => {
    if (!changeText) return ''
    if (changeText.includes('+') || changeText.includes('↑')) return 'text-green-600'
    if (changeText.includes('-') || changeText.includes('↓')) return 'text-red-600'
    return 'text-slate-600'
  }

  return (
    /**
     * Stats card container with shadow and border
     */
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      
      {/* Icon container with background color */}
      <div className={`${colorSchemes[color]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      
      {/* Stat title */}
      <h3 className="text-slate-600 text-sm font-medium mb-2">
        {title}
      </h3>
      
      {/* Stat value - large and bold */}
      <p className="text-3xl font-bold text-slate-900 mb-2">
        {value}
      </p>
      
      {/* Optional change indicator */}
      {change && (
        <p className={`text-sm font-medium ${getChangeColor(change)}`}>
          {change}
        </p>
      )}
    </div>
  )
}
