/**
 * Header Component
 * 
 * Main navigation bar for the application.
 * Displays the logo, navigation links, and authentication buttons.
 * Sticky positioning keeps it visible while scrolling.
 * 
 * Features:
 * - Responsive design (mobile menu hidden on small screens)
 * - Smooth navigation with anchor links
 * - Call-to-action buttons (Login and Sign Up)
 * - Logo with icon
 * 
 * Props: None
 * 
 * Usage:
 * <Header />
 */

import React from 'react'
import { Link } from 'lucide-react'

/**
 * Header Component
 * 
 * Renders the main navigation bar with:
 * - Company logo and name
 * - Navigation links to key sections (features, how it works, pricing)
 * - Authentication buttons (login and sign up)
 * 
 * @returns {React.ReactElement} Header element with navigation
 */
export const Header: React.FC = () => {
  return (
    /**
     * Header container with sticky positioning and shadow
     * z-50 ensures it stays above other content when scrolling
     */
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo section with icon and brand name */}
          <div className="flex items-center gap-2">
            <Link className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">
              URL Shortener
            </span>
          </div>
          
          {/* Navigation links - hidden on mobile, visible on medium screens and up */}
          <nav className="hidden md:flex gap-8">
            <a 
              href="#features" 
              className="text-slate-600 hover:text-blue-600 transition"
            >
              Features
            </a>
            <a 
              href="#how" 
              className="text-slate-600 hover:text-blue-600 transition"
            >
              How it Works
            </a>
            <a 
              href="#pricing" 
              className="text-slate-600 hover:text-blue-600 transition"
            >
              Pricing
            </a>
          </nav>
          
          {/* Authentication buttons - login and sign up */}
          <div className="flex gap-3">
            <button 
              className="text-slate-600 hover:text-slate-800 font-medium transition"
              aria-label="Login to your account"
            >
              Login
            </button>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              aria-label="Sign up for a new account"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
