/**
 * Footer Component
 * 
 * Main footer section of the application.
 * Displays company information, product links, and social media icons.
 * Organized in a responsive grid layout.
 * 
 * Features:
 * - Responsive grid (1 column mobile, 4 columns desktop)
 * - Social media links with icons
 * - Product and company navigation links
 * - Copyright information
 * - Dark theme for visual separation
 * 
 * Props: None
 * 
 * Usage:
 * <Footer />
 */

import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Footer Component
 * 
 * Renders the footer with:
 * - Company branding and description
 * - Product navigation links
 * - Company information links
 * - Social media links
 * - Copyright notice
 * 
 * @returns {React.ReactElement} Footer element with multiple sections
 */
export const Footer: React.FC = () => {
  const { t } = useTranslation()
  return (
    /**
     * Footer container with dark background and white text
     * margin-top creates space from main content
     */
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main grid layout for footer sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Company branding and tagline section */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              URL Shortener
            </h3>
            <p className="text-slate-400 text-sm">
              {t('footer.tagline')}
            </p>
          </div>
          
          {/* Product navigation links */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.product')}
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  {t('footer.features')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  {t('footer.pricing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.documentation')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company information links */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="https://github.com/mircothibes" className="hover:text-white transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.blog')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social media links section */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.followUs')}
            </h4>
            <div className="flex gap-4">
              <a 
                href="https://github.com/mircothibes" 
                className="text-slate-400 hover:text-blue-400 transition font-medium"
                aria-label="GitHub profile"
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/marcosvtkemer" 
                className="text-slate-400 hover:text-blue-400 transition font-medium"
                aria-label="LinkedIn profile"
              >
                LinkedIn
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-400 transition font-medium"
                aria-label="Twitter profile"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright section with border separator */}
        <div className="border-t border-slate-700 pt-8">
          <p className="text-slate-400 text-sm text-center">
            © {new Date().getFullYear()} URL Shortener. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
