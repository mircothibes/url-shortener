import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={handleBack} className="text-blue-600 mb-6">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-600 mb-8">Manage your account and preferences</p>
        <div className="bg-white rounded-lg p-6">
          <p className="text-slate-700">Logged in as: <strong>{user?.email}</strong></p>
        </div>
      </div>
    </div>
  )
}
