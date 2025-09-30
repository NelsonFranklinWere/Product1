'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Sidebar } from '@/components/Layout/Sidebar'
import { Header } from '@/components/Layout/Header'
import { DashboardOverview } from './DashboardOverview'
import { CommunicationsHub } from './CommunicationsHub'
// import { ProductCatalog } from './ProductCatalog'
// import { AnalyticsDashboard } from './AnalyticsDashboard'
import { BillingDashboard } from '@/components/Analytics/BillingDashboard'
import { Contacts } from '@/components/CRM/Contacts'
// import { Settings } from './Settings'
import { apiClient } from '@/lib/api'
import { Conversation, Product, UsageLog, BusinessMetrics } from '@/types'

export function Dashboard() {
  const { user } = useAuth()
  const { lastMessage } = useWebSocket()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [usageLog, setUsageLog] = useState<UsageLog | null>(null)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        const [conversationsData, productsData, usageData, metricsData] = await Promise.all([
          apiClient.getConversations(),
          apiClient.getProducts(),
          apiClient.getCurrentUsage(),
          apiClient.getCurrentMetrics(),
        ])
        
        setConversations(conversationsData)
        setProducts(productsData)
        setUsageLog(usageData.today)
        setBusinessMetrics(metricsData.today)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'new_message':
          // Refresh conversations when new message arrives
          apiClient.getConversations().then(setConversations)
          break
        case 'payment_notification':
          // Handle payment notifications
          console.log('Payment notification:', lastMessage.data)
          break
        default:
          break
      }
    }
  }, [lastMessage])

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard'
      case 'communications': return 'Communications Hub'
      case 'products': return 'Product Catalog'
      case 'analytics': return 'Analytics'
      case 'settings': return 'Settings'
      default: return 'Dashboard'
    }
  }

  const getPageSubtitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Welcome to your unified business operations center'
      case 'communications': return 'Manage conversations from Facebook and WhatsApp'
      case 'products': return 'Manage your product catalog and inventory'
      case 'analytics': return 'Track performance and usage metrics'
      case 'settings': return 'Configure your account and preferences'
      default: return ''
    }
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            conversations={conversations}
            products={products}
            usageLog={usageLog}
            businessMetrics={businessMetrics}
            loading={loading}
          />
        )
      case 'communications':
        return (
          <CommunicationsHub
            conversations={conversations}
            onConversationsUpdate={setConversations}
          />
        )
      case 'products':
        return (
          <div className="p-6">Product Catalog coming soon...</div>
        )
      case 'analytics':
        return (
          <div className="p-6">Analytics Dashboard coming soon...</div>
        )
      case 'billing':
        return <BillingDashboard />
      case 'contacts':
        return <Contacts />
      case 'settings':
        return <div className="p-6">Settings coming soon...</div>
      default:
        return (
          <DashboardOverview
            conversations={conversations}
            products={products}
            usageLog={usageLog}
            businessMetrics={businessMetrics}
            loading={loading}
          />
        )
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title={getPageTitle(activeTab)} 
          subtitle={getPageSubtitle(activeTab)}
          user={user}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  )
}
