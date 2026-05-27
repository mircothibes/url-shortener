/**
 * Layout Component
 * 
 * Main layout wrapper for the entire application.
 * Provides consistent structure with header, main content area, and footer.
 * Uses flexbox to ensure footer sticks to bottom on short pages.
 * 
 * Features:
 * - Sticky footer (always at bottom even with little content)
 * - Flex layout for proper spacing
 * - Wraps all page content
 * 
 * Props:
 * - children: React.ReactNode - Page content to render between header and footer
 * 
 * Usage:
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 */

import React from 'react'
import { Header } from './Header.tsx'
import { Footer } from './Footer.tsx'

/**
 * Props interface for Layout component
 */
interface LayoutProps {
  /**
   * Child components to render in the main content area
   * Typically represents the page content
   */
  children: React.ReactNode
}

/**
 * Layout Component
 * 
 * Renders the main application layout with:
 * - Header at the top (sticky)
 * - Main content area in the middle (grows to fill space)
 * - Footer at the bottom (sticky)
 * 
 * The flex container ensures that even with minimal content,
 * the footer will remain at the bottom of the viewport.
 * 
 * @param {LayoutProps} props - Component props
 * @param {React.ReactNode} props.children - Content to render in main area
 * @returns {React.ReactElement} Layout wrapper element
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    /**
     * Main layout container using flexbox
     * - min-h-screen: Ensures minimum 100vh height
     * - flex flex-col: Creates vertical flex layout
     * Allows footer to stick to bottom when content is short
     */
    <div className="min-h-screen flex flex-col">
      {/* Header component - always visible at top */}
      <Header />
      
      {/* Main content area - grows to fill available space */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer component - sticks to bottom */}
      <Footer />
    </div>
  )
}
