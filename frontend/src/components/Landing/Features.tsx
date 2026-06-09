/**
 * Features Component
 *
 * Displays the main features of the URL shortener application.
 * Shows 6 key features in responsive card layout.
 * Each feature has an icon, title, and description. Supports dark mode.
 *
 * Features displayed:
 * - Short URLs (auto + custom codes)
 * - Complete Analytics
 * - Geolocation tracking
 * - Ultra-fast performance
 * - Security & protection
 * - Device detection
 *
 * Props: None
 *
 * Usage:
 * <Features />
 */

import React from 'react'
import { Link2, BarChart3, Globe, Zap, Lock, Smartphone } from 'lucide-react'

/**
 * Props interface for FeatureCard component
 */
interface FeatureCardProps {
  /**
   * Icon component to display (Lucide React icon)
   */
  icon: React.ReactNode

  /**
   * Feature title text
   */
  title: string

  /**
   * Feature description text
   */
  description: string
}

/**
 * FeatureCard Component
 *
 * Individual feature card with icon, title, and description.
 * Displays with shadow and hover effects for interactivity.
 *
 * @param {FeatureCardProps} props - Card props
 * @returns {React.ReactElement} Feature card element
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description
}) => {
  return (
    /**
     * Feature card container with hover effect
     * - bg-white: White background (dark: slate-800)
     * - shadow-sm hover:shadow-md: Subtle shadow that increases on hover
     * - transition-shadow: Smooth shadow animation
     */
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition">
      {/* Icon container with blue color */}
      <div className="text-blue-600 dark:text-blue-400 mb-4">
        {icon}
      </div>

      {/* Feature title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      {/* Feature description */}
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        {description}
      </p>
    </div>
  )
}

/**
 * Features Component
 *
 * Renders a grid of 6 features showcasing the application's capabilities.
 * Layout is responsive: 1 column on mobile, 2 on tablet, 3 on desktop.
 *
 * @returns {React.ReactElement} Features section with grid layout
 */
export const Features: React.FC = () => {
  /**
   * Array of feature objects with icon, title, and description
   * Each feature represents a key capability of the application
   */
  const features = [
    {
      icon: <Link2 className="w-8 h-8" />,
      title: 'Short URLs',
      description: 'Shorten any URL. Auto-generated or custom codes. Your choice.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Complete Analytics',
      description: 'Track clicks, sources, devices, locations in real-time.',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Geolocation',
      description: 'Know which country, region, and city your clicks come from.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Redis cache. Redirects under 50ms. 100x faster performance.',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure',
      description: 'Password protection, auto-expiration, complete control.',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Device Detection',
      description: 'Mobile, Desktop, Tablet. Know what your users are using.',
    },
  ]

  return (
    /**
     * Features section container
     * id="features": Anchor link target from navigation
     */
    <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header with title and description */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            13 powerful features to dominate your digital marketing
          </p>
        </div>

        {/* Features grid - responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
