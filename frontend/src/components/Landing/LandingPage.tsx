/**
 * LandingPage Component
 * 
 * Main landing page that composes all landing page sections.
 * Brings together Hero, Features, HowItWorks, and Pricing components.
 * This is the root component for the public-facing landing page.
 * 
 * Sections included:
 * 1. Hero - Main value proposition
 * 2. Features - 6 key features
 * 3. HowItWorks - 3-step process
 * 4. Pricing - 3 pricing plans
 * 
 * Props: None
 * 
 * Usage:
 * <LandingPage />
 */

import React from 'react'
import { Hero } from './Hero'
import { Features } from './Features'
import { HowItWorks } from './HowItWorks'
import { Pricing } from './Pricing'

/**
 * LandingPage Component
 * 
 * Composes all landing page sections in vertical order:
 * 1. Hero section - catches attention, main CTA
 * 2. Features section - showcases capabilities
 * 3. HowItWorks section - educates on process
 * 4. Pricing section - conversion opportunity
 * 
 * This component acts as a layout for the landing page,
 * importing and arranging all major sections.
 * 
 * @returns {React.ReactElement} Complete landing page with all sections
 */
export const LandingPage: React.FC = () => {
  return (
    /**
     * Fragment wrapper to avoid extra div
     * Renders all sections in order
     */
    <>
      {/* Hero section - main headline and CTAs */}
      <Hero />
      
      {/* Features section - 6 capabilities in grid */}
      <Features />
      
      {/* How it works section - 3-step process */}
      <HowItWorks />
      
      {/* Pricing section - 3 pricing plans */}
      <Pricing />
    </>
  )
}
