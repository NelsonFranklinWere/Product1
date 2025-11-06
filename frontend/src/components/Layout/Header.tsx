'use client'

import { Menu } from 'lucide-react'
import { User as UserType } from '@/types'

interface HeaderProps {
  title: string
  subtitle: string
  user: UserType | null
  onOpenMenu?: () => void
}

export function Header({ title, subtitle, user, onOpenMenu }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand left: logo + product name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-fuchsia-700 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SME Pilot</h1>
              <p className="text-xs text-gray-500">Business Operations</p>
            </div>
          </div>

          {/* Title center on larger screens */}
          <div className="hidden md:block text-center">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>

          {/* Hamburger on right (mobile) */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
              onClick={onOpenMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}