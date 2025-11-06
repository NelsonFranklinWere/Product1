'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPage } from '@/components/Auth/AuthPage'
import { useAuth } from '@/hooks/useAuth'
import { PublicNavbar } from '@/components/Layout/PublicNavbar'
import { AppFooter } from '@/components/Layout/AppFooter'

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <>
      <PublicNavbar />
      <AuthPage />
      <AppFooter />
    </>
  )
}


