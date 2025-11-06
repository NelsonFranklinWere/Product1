'use client'

import { 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  BarChart3, 
  Settings,
  Users,
  Wallet,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'

export function Sidebar() {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
    { id: 'contacts', label: 'Contacts', icon: Users, path: '/contacts' },
    { id: 'products', label: 'Products', icon: Package, path: '/products' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'billing', label: 'Billing', icon: Wallet, path: '/billing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SME Pilot</h1>
            <p className="text-sm text-gray-500">Business Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Mobile-only utilities */}
        <div className="mt-6 border-t border-gray-200 pt-4 md:hidden">
          <button
            onClick={() => router.push('/messages')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
            <span className="font-medium">Notifications</span>
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">Profile & Settings</span>
          </button>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}