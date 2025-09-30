import React from 'react'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Header } from '@/components/Layout/Header'
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { useAuth } from '@/hooks/useAuth'

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={''} onTabChange={() => {}} />
      <div className="flex-1 flex flex-col">
  <Header title="" subtitle="" user={null} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedShell>{children}</ProtectedShell>
    </AuthProvider>
  )
}


