'use client'

import React from 'react'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">Settings page coming soon...</p>
      </div>
    </div>
  )
}

