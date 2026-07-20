/**
 * Header Component
 *
 * Main navigation bar for the application.
 * Displays logo, navigation links, and authentication buttons.
 * Adapts based on user authentication status and current route.
 * Supports dark mode.
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
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

export const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const { t } = useTranslation()

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

  /**
   * Routes that already provide their own "Back to Dashboard" link,
   * so the Dashboard button in the header is hidden to avoid redundancy.
   */
  const hasBackToDashboard =
    location.pathname.startsWith('/analytics') ||
    location.pathname === '/settings'

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <Link className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">URL Shortener</span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">{t('nav.features')}</a>
            <a href="#how" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">{t('nav.howItWorks')}</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">{t('nav.pricing')}</a>
          </nav>

          {/* Auth buttons */}
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            {!isAuthenticated && (
              <>
                <button onClick={() => navigate('/login')} className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-medium transition">{t('nav.login')}</button>
                <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">{t('nav.signUp')}</button>
              </>
            )}
            {isAuthenticated && (
              <>
                {/* Home button - always visible when authenticated */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('nav.home')}</span>
                </button>

                {/* Dashboard button - hidden when already on dashboard */}
                {!isOnDashboard && !hasBackToDashboard && (
                  <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                  </button>
                )}

                {/* Logout button - always visible when authenticated */}
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition">{t('nav.logout')}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
