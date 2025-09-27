'use client'

import { 
  MessageSquare, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Conversation, Product, UsageLog, BusinessMetrics } from '@/types'

interface DashboardOverviewProps {
  conversations: Conversation[]
  products: Product[]
  usageLog: UsageLog | null
  businessMetrics: BusinessMetrics | null
  loading: boolean
}

export function DashboardOverview({ 
  conversations, 
  products, 
  usageLog, 
  businessMetrics, 
  loading 
}: DashboardOverviewProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalConversations = conversations.length
  const activeConversations = conversations.filter(c => !c.is_resolved).length
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0)
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const lowStockProducts = products.filter(p => p.is_low_stock).length

  const stats = [
    {
      title: 'Total Conversations',
      value: totalConversations,
      change: '+12%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Active Conversations',
      value: activeConversations,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      change: unreadMessages > 0 ? `${unreadMessages} new` : 'All caught up',
      changeType: unreadMessages > 0 ? 'negative' as const : 'positive' as const,
      icon: AlertCircle,
      color: unreadMessages > 0 ? 'red' : 'green'
    },
    {
      title: 'Total Products',
      value: totalProducts,
      change: '+5%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'purple'
    },
    {
      title: 'Active Products',
      value: activeProducts,
      change: `${Math.round((activeProducts / totalProducts) * 100)}% active`,
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      change: lowStockProducts > 0 ? 'Needs attention' : 'All good',
      changeType: lowStockProducts > 0 ? 'negative' as const : 'positive' as const,
      icon: AlertCircle,
      color: lowStockProducts > 0 ? 'red' : 'green'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const recentConversations = conversations
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    .slice(0, 5)

  const recentProducts = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
          </div>
          <div className="p-6">
            {recentConversations.length > 0 ? (
              <div className="space-y-4">
                {recentConversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      conversation.source_platform === 'whatsapp' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.contact.name || 'Unknown Contact'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conversation.source_platform} • {conversation.unread_count} unread
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
          </div>
          <div className="p-6">
            {recentProducts.length > 0 ? (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        KES {product.price} • {product.stock_quantity} in stock
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <MessageSquare className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Start New Conversation</h4>
            <p className="text-sm text-gray-500">Connect with customers</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Package className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add New Product</h4>
            <p className="text-sm text-gray-500">Expand your catalog</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-500">Track performance</p>
          </button>
        </div>
      </div>
    </div>
  )
}
