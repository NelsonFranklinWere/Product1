'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DashboardOverview } from './DashboardOverview'
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

  // This component now only renders the overview content.

  if (loading) {
    return (
      <div className="min-h-[200px] bg-gray-50 flex items-center justify-center rounded-lg border">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

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
