'use client'

import React from 'react'
import { Shield, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Top: Brand + Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-fuchsia-700 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-white font-semibold">SME Pilot</p>
              <p className="text-xs text-gray-500">Business Operations</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="w-4 h-4" />
              <span>Made in Kenya</span>
            </div>
          </div>
        </div>

        {/* Middle: Quick Links + Company + Resources + Social */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-white" href="/features">Features</a></li>
              <li><a className="hover:text-white" href="/pricing">Pricing</a></li>
              <li><a className="hover:text-white" href="/login">Sign In</a></li>
              <li><a className="hover:text-white" href="/register">Get Started</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-white" href="#">About</a></li>
              <li><a className="hover:text-white" href="#">Blog</a></li>
              <li><a className="hover:text-white" href="#">Careers</a></li>
              <li><a className="hover:text-white" href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-white" href="#">Help Center</a></li>
              <li><a className="hover:text-white" href="#">Status</a></li>
              <li><a className="hover:text-white" href="#">Security</a></li>
              <li><a className="hover:text-white" href="#">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex items-center space-x-3">
              <a aria-label="Facebook" href="#" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a aria-label="Twitter" href="#" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                <Twitter className="w-4 h-4 text-white" />
              </a>
              <a aria-label="Instagram" href="#" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a aria-label="LinkedIn" href="#" className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SME Pilot. All rights reserved.</p>
          <div className="space-x-4">
            <a className="hover:text-white" href="#">Privacy</a>
            <a className="hover:text-white" href="#">Terms</a>
            <a className="hover:text-white" href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


