/**
 * App Component
 * 
 * Root component of the entire application.
 * Integrates the Layout wrapper with the LandingPage component.
 * 
 * This is the main entry point that gets rendered in index.html.
 * 
 * Structure:
 * - Layout (Header + Footer wrapper)
 *   - LandingPage (all sections)
 * 
 * Props: None
 * 
 * Usage:
 * This component is automatically rendered by main.tsx
 */

import { Layout } from './components/Layout/Layout'
import { LandingPage } from './components/Landing/LandingPage'
import './styles/globals.css'

/**
 * App Component
 * 
 * Main application component that renders:
 * - Layout wrapper with Header and Footer
 * - LandingPage content in the middle
 * 
 * The Layout component ensures consistent structure across all pages:
 * Header (sticky) → Main Content → Footer (sticky to bottom)
 * 
 * @returns {React.ReactElement} Complete app with layout and landing page
 */
function App() {
  return (
    <Layout>
      <LandingPage />
    </Layout>
  )
}

export default App
