import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { ProfileSettings } from '../../components/Settings/ProfileSettings'
import { ChangePassword } from '../../components/Settings/ChangePassword'
import { Preferences } from '../../components/Settings/Preferences'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => {
    const confirmed = window.confirm(t('settings.header.logoutConfirm'))
    if (confirmed) {
      logout()
      navigate('/login')
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('settings.header.backToDashboard')}</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('settings.header.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('settings.header.subtitle')}
          </p>
        </div>

        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-8">

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('settings.header.profile')}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('settings.header.security')}
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('settings.header.preferencesTab')}
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

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  {t('settings.header.account')}
                </h3>

                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('settings.header.loggedInAs')} <span className="font-semibold dark:text-slate-200">{user?.email}</span>
                  </p>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('settings.header.logout')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <Preferences />
          )}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 {t('settings.header.needHelp')}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {t('settings.header.needHelpText')}
          </p>
        </div>
      </div>
    </div>
  )
}
