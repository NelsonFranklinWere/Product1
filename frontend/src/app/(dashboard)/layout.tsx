'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Header } from '@/components/Layout/Header'
import { AppFooter } from '@/components/Layout/AppFooter'
import { useAuth } from '@/hooks/useAuth'

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Header title="" subtitle="" user={user} onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        <AppFooter />
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>
}


