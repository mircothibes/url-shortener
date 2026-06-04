/**
 * Header Component
 * 
 * Main navigation bar for the application.
 * Displays logo, navigation links, and authentication buttons.
 * Adapts based on user authentication status and current route.
 * 
 * Authenticated buttons:
 * - Home: always visible (navigates to landing page "/")
 * - Dashboard: hidden when already on "/dashboard"
 * - Logout: always visible
 * 
 * Props: None
 * Usage: <Header />
 */
import React from 'react'
import { Link, Home, LayoutDashboard } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  /**
   * Whether the user is currently on the dashboard page.
   * Used to hide the Dashboard button when it would be redundant.
   */
  const isOnDashboard = location.pathname === '/dashboard'

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <Link className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">URL Shortener</span>
          </button>
          
          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition font-medium">Features</a>
            <a href="#how" className="text-slate-600 hover:text-blue-600 transition font-medium">How it Works</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition font-medium">Pricing</a>
          </nav>
          
          {/* Auth buttons */}
          <div className="flex gap-3">
            {!isAuthenticated && (
              <>
                <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-slate-800 font-medium transition">Login</button>
                <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">Sign Up</button>
              </>
            )}
            {isAuthenticated && (
              <>
                {/* Home button - always visible when authenticated */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">Home</span>
                </button>

                {/* Dashboard button - hidden when already on dashboard */}
                {!isOnDashboard && (
                  <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                )}

                {/* Logout button - always visible when authenticated */}
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium transition">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


