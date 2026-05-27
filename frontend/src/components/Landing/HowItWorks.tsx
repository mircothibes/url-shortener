/**
 * HowItWorks Component
 * 
 * Displays a 3-step process showing how the URL shortener works.
 * Each step includes a number badge, icon, title, and description.
 * Helps users understand the simple workflow.
 * 
 * Steps:
 * 1. Paste your URL
 * 2. Get short link
 * 3. Track clicks
 * 
 * Props: None
 * 
 * Usage:
 * <HowItWorks />
 */

import React from 'react'
import { Copy, Link, BarChart3 } from 'lucide-react'

/**
 * Props interface for Step component
 */
interface StepProps {
  /**
   * Step number (1, 2, 3, etc)
   */
  number: number
  
  /**
   * Icon component to display (Lucide React icon)
   */
  icon: React.ReactNode
  
  /**
   * Step title text
   */
  title: string
  
  /**
   * Step description text
   */
  description: string
}

/**
 * Step Component
 * 
 * Individual step in the process flow.
 * Displays centered with number badge, icon, title, and description.
 * 
 * @param {StepProps} props - Step component props
 * @returns {React.ReactElement} Step element
 */
const Step: React.FC<StepProps> = ({ 
  number, 
  icon, 
  title, 
  description 
}) => {
  return (
    /**
     * Step container with centered text layout
     * - flex flex-col items-center: Vertical flex with centered items
     * - text-center: Center-aligned text
     */
    <div className="flex flex-col items-center text-center">
      
      {/* Step number badge - blue background with white text */}
      <div className="mb-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      
      {/* Step icon with blue color */}
      <div className="text-blue-600 mb-4">
        {icon}
      </div>
      
      {/* Step title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      
      {/* Step description with max width */}
      <p className="text-slate-600 max-w-xs">
        {description}
      </p>
    </div>
  )
}

/**
 * HowItWorks Component
 * 
 * Renders a 3-step process showing how the application works.
 * Layout is responsive: stacked on mobile, grid on desktop.
 * 
 * The 3 steps are:
 * 1. Paste your URL - User provides the long URL
 * 2. Get short link - System generates or allows customization
 * 3. Track clicks - User accesses real-time analytics
 * 
 * @returns {React.ReactElement} How it works section
 */
export const HowItWorks: React.FC = () => {
  return (
    /**
     * How it works section container
     * id="how": Anchor link target from navigation
     * bg-slate-50: Light gray background for contrast
     */
    <section id="how" className="py-20 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section header with title and description */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600">
            3 simple steps to get started
          </p>
        </div>
        
        {/* Steps grid - responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Step 1: Paste URL */}
          <Step
            number={1}
            icon={<Copy className="w-8 h-8" />}
            title="Paste Your URL"
            description="Paste any long URL into the field and click shorten."
          />
          
          {/* Step 2: Get Short Link */}
          <Step
            number={2}
            icon={<Link className="w-8 h-8" />}
            title="Get Short Link"
            description="Receive an auto-generated short link or customize the code."
          />
          
          {/* Step 3: Track Clicks */}
          <Step
            number={3}
            icon={<BarChart3 className="w-8 h-8" />}
            title="Track Clicks"
            description="View real-time analytics: clicks, sources, locations."
          />
        </div>
      </div>
    </section>
  )
}
