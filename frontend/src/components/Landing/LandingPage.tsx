'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import { 
  MessageSquare, 
  Package, 
  Wallet, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp,
  Smartphone,
  Globe,
  Lock,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    total_businesses: 500,
    total_messages: 50000,
    total_mpesa_value: 10000000,
    avg_cost_reduction: 35,
    sample_revenue: 1240000,
    sample_response_time: 134,
    trend_data: [120, 140, 160, 180, 200, 220, 240]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getPublicStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching public stats:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M+`
    } else if (value >= 1000) {
      return `KES ${(value / 1000).toFixed(0)}K+`
    }
    return `KES ${value.toLocaleString()}`
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const displayStats = [
    { value: `${stats.total_businesses}+`, label: 'Growing SME Customers' },
    { value: `${stats.avg_cost_reduction}%`, label: 'Avg. Ops Cost Reduction' },
    { value: formatCurrency(stats.total_mpesa_value), label: 'Payments Processed' },
    { value: '2x', label: 'Faster Customer Response' }
  ]

  const features = [
    {
      icon: MessageSquare,
      title: 'Unified Communications',
      description: 'One inbox for WhatsApp and Facebook. Faster replies, fewer missed sales.',
      color: 'from-fuchsia-500 to-amber-400'
    },
    {
      icon: Package,
      title: 'Product Catalog',
      description: 'A clean, sharable catalog. Send products in-chat and convert faster.',
      color: 'from-slate-600 to-fuchsia-500'
    },
    {
      icon: Wallet,
      title: 'M-Pesa Integration',
      description: 'Get paid instantly with M-Pesa. Reduce chasing payments and manual reconciliation.',
      color: 'from-amber-400 to-amber-500'
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      description: 'See progress at a glance: revenue, engagement, and response time improvements.',
      color: 'from-slate-700 to-slate-500'
    },
    {
      icon: Users,
      title: 'CRM & Contacts',
      description: 'Know every customer. Track interactions and increase repeat purchases.',
      color: 'from-fuchsia-600 to-slate-600'
    },
    {
      icon: Zap,
      title: 'AI Automation',
      description: 'Automate replies and routine tasks. Save time and cut operational costs.',
      color: 'from-amber-400 to-fuchsia-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Wanjiku',
      business: 'Fashion Boutique, Nairobi',
      image: '👩‍💼',
      text: 'SME Pilot transformed how I handle customer inquiries. Sales increased by 40% in just 3 months!',
      rating: 5
    },
    {
      name: 'James Ochieng',
      business: 'Tech Solutions Ltd',
      image: '👨‍💻',
      text: 'The M-Pesa integration is a game-changer. Getting paid has never been this easy.',
      rating: 5
    },
    {
      name: 'Mary Akinyi',
      business: 'Beauty Salon & Spa',
      image: '👩‍🦱',
      text: 'Managing all my customer conversations in one place saved me hours every day. Highly recommend!',
      rating: 5
    }
  ]


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
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
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-700 hover:to-amber-600 text-white"
              >
                Get Started Free
              </Button>
            </div>
            {/* Mobile hamburger */}
            <div className="sm:hidden">
              <button
                aria-label="Open menu"
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <button onClick={() => { setMobileMenuOpen(false); router.push('/login') }} className="block w-full text-left px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">Sign In</button>
              <button onClick={() => { setMobileMenuOpen(false); router.push('/register') }} className="block w-full text-left px-3 py-2 rounded-md text-white bg-gradient-to-r from-fuchsia-600 to-amber-500">Get Started Free</button>
              <button onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">Close</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-fuchsia-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4 mr-2" />
              Proven to cut ops costs while growing revenue
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Run Your Business
              <span className="block bg-gradient-to-r from-slate-900 to-fuchsia-700 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Show measurable progress: reduce costs, accelerate payments, and respond faster. One platform to manage conversations, products, and growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                className="bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-700 hover:to-amber-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 rounded-xl border-2 border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="text-sm">Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-fuchsia-600" />
                <span className="text-sm">M-Pesa Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-slate-700" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="relative rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-fuchsia-600/10"></div>
              <div className="relative p-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-slate-500 mb-1">Revenue (This Month)</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loading ? (<div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />) : formatCurrency(stats.sample_revenue)}
                    </div>
                    <div className="text-xs text-amber-700 bg-amber-50 inline-flex mt-2 px-2 py-1 rounded-md">+18% vs last month</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-slate-500 mb-1">Avg Response Time</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loading ? (<div className="h-7 w-28 bg-slate-200 rounded animate-pulse" />) : formatTime(stats.sample_response_time)}
                    </div>
                    <div className="text-xs text-fuchsia-700 bg-fuchsia-50 inline-flex mt-2 px-2 py-1 rounded-md">-32% faster</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-slate-500 mb-1">Ops Cost Saved</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loading ? (<div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />) : `${stats.avg_cost_reduction}%`}
                    </div>
                    <div className="text-xs text-slate-700 bg-slate-100 inline-flex mt-2 px-2 py-1 rounded-md">Automation impact</div>
                  </div>
                </div>

                {/* Mini Trend Preview */}
                <div className="h-64 rounded-xl border bg-gradient-to-br from-slate-50 to-fuchsia-50 p-4 flex items-end gap-2">
                  {loading ? (
                    [...Array(12)].map((_, i) => (
                      <div key={i} className="flex-1 bg-slate-200 rounded-lg animate-pulse" style={{ height: `${10 + (i % 6) * 10}%` }} />
                    ))
                  ) : (
                    stats.trend_data.map((value, index) => {
                      const maxValue = Math.max(...stats.trend_data)
                      const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                      const colors = [
                        'bg-slate-300',
                        'bg-slate-400',
                        'bg-fuchsia-300',
                        'bg-fuchsia-400',
                        'bg-amber-300',
                        'bg-amber-400',
                        'bg-fuchsia-500'
                      ]
                      return (
                        <div
                          key={index}
                          className={`flex-1 ${colors[index % colors.length]} rounded-lg transition-all hover:opacity-80`}
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`Day ${index + 1}: ${value.toFixed(0)}K`}
                        />
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 min-h-[48px] flex items-center justify-center">
                  {loading ? (
                    <span className="h-8 w-20 bg-slate-200 rounded animate-pulse inline-block" />
                  ) : stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Progress You Can Measure
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cut operational costs, speed up payments, and delight customers with faster responses.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-fuchsia-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Kenyan Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-fuchsia-100 flex items-center justify-center text-2xl mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-fuchsia-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-fuchsia-100 mb-8">
            Join hundreds of Kenyan businesses cutting costs and accelerating growth with SME Pilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-amber-400 text-slate-900 hover:bg-amber-300 text-lg px-8 py-6 rounded-xl shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
            >
              Contact Sales
            </Button>
          </div>
          <p className="text-fuchsia-100 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">SME Pilot</h3>
                </div>
              </div>
              <p className="text-sm">
                Empowering Kenyan SMEs with powerful business management tools.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2025 SME Pilot. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
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
        </div>
      </footer>
    </div>
  )
}

