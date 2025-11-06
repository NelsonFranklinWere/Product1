'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PublicNavbar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-fuchsia-700 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SME Pilot</h1>
              <p className="text-xs text-gray-500">Business Operations</p>
            </div>
          </div>
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white"
            >
              Get Started Free
            </button>
          </div>
          {/* Mobile hamburger */}
          <div className="sm:hidden">
            <button
              aria-label="Open menu"
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <button onClick={() => { setMobileOpen(false); router.push('/login') }} className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">Sign In</button>
            <button onClick={() => { setMobileOpen(false); router.push('/register') }} className="block w-full text-left px-3 py-2 rounded-md text-white bg-gradient-to-r from-fuchsia-600 to-amber-500">Get Started Free</button>
            <button onClick={() => setMobileOpen(false)} className="block w-full text-left px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">Close</button>
          </div>
        </div>
      )}
    </nav>
  )
}


