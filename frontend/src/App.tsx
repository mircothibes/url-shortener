/**
 * App Component
 * 
 * Root application component with routing configuration.
 * Sets up React Router with all application routes.
 * Wraps app with AuthProvider for global authentication.
 * 
 * Routes:
 * - / — Landing page (public)
 * - /login — Login page (public)
 * - /register — Register page (public)
 * - /dashboard — Dashboard (protected)
 * 
 * Props: None
 * 
 * Usage:
 * This component is automatically rendered by main.tsx
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout/Layout'
import { LandingPage } from './components/Landing/LandingPage'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Dashboard } from './pages/dashboard/Dashboard'
import './styles/globals.css'

/**
 * App Component
 * 
 * Main application component with routing setup.
 * Provides authentication context to entire app.
 * Configures all public and protected routes.
 * 
 * @returns {React.ReactElement} Complete app with routing
 */
function App() {
  return (
    /**
     * Wrap entire app with React Router
     */
    <Router>
      {/* Wrap with authentication provider */}
      <AuthProvider>
        {/* Route configuration */}
        <Routes>
          {/* Landing page route (public) */}
          <Route
            path="/"
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />

          {/* Login page route (public) */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Register page route (public) */}
          <Route
            path="/register"
            element={<Register />}
          />

          {/* Dashboard route (protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
