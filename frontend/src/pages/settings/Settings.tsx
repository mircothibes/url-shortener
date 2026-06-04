import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ProfileSettings } from '../../components/Settings/ProfileSettings'
import { ChangePassword } from '../../components/Settings/ChangePassword'
import { Preferences } from '../../components/Settings/Preferences'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (confirmed) {
      logout()
      navigate('/login')
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Settings
          </h1>
          <p className="text-slate-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-8">
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Profile
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Security
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        <div className="space-y-6">
          
          {activeTab === 'profile' && (
            <ProfileSettings />
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <ChangePassword />
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Account
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Logged in as: <span className="font-semibold">{user?.email}</span>
                  </p>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <Preferences />
          )}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Need Help?
          </h3>
          <p className="text-sm text-blue-800">
            For security reasons, some settings changes may require email verification.
          </p>
        </div>
      </div>
    </div>
  )
}
