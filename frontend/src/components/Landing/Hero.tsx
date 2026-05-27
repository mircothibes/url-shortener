/**
 * Hero Component
 * 
 * Main hero section of the landing page.
 * Displays the primary value proposition with a large headline,
 * supporting text, call-to-action buttons, and brand mentions.
 * 
 * Features:
 * - Gradient background for visual appeal
 * - Responsive typography (larger on desktop)
 * - Two CTA buttons (primary and secondary)
 * - Brand trust indicators (used by companies)
 * - Smooth transitions and hover effects
 * 
 * Props: None
 * 
 * Usage:
 * <Hero />
 */

import React from 'react'
import { Button } from '../UI/Button'
import { ArrowRight } from 'lucide-react'

/**
 * Hero Component
 * 
 * Renders the hero section with:
 * - Main headline with colored accents
 * - Supporting description text
 * - Primary and secondary call-to-action buttons
 * - Trust indicators showing common use cases
 * 
 * @returns {React.ReactElement} Hero section element
 */
export const Hero: React.FC = () => {
  return (
    /**
     * Hero section container with gradient background
     * - bg-gradient-to-br: Creates diagonal gradient from top-left to bottom-right
     * - from-blue-50 to-indigo-100: Light blue to indigo gradient
     * - py-20 md:py-32: Vertical padding, larger on desktop
     */
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          
          {/* Main headline with color-coded words */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            Shorten URLs.
            <span className="text-blue-600"> Track Clicks.</span>
            <br />
            <span className="text-blue-600">Grow.</span>
          </h1>
          
          {/* Supporting description text */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Transform long URLs into trackable short links with real-time analytics.
            No complications, no setup. Just results.
          </p>
          
          {/* Call-to-action buttons section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Primary button with arrow icon */}
            <Button 
              size="lg" 
              className="flex items-center justify-center gap-2"
              onClick={() => console.log('Get started clicked')}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            {/* Secondary button for demo */}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => console.log('View demo clicked')}
            >
              View Demo
            </Button>
          </div>
          
          {/* Trust indicators - companies/use cases */}
          <div className="pt-8 border-t border-blue-200">
            <p className="text-slate-600 text-sm font-medium mb-4">
              Trusted by businesses like:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm">
              <span>E-commerce</span>
              <span>Marketing</span>
              <span>Influencers</span>
              <span>Journalism</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
