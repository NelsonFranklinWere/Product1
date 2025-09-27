'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { UsageLog, User } from '@/types'

type Estimates = {
  whatsappCostKES: number
  mpesaFeesKES: number
  totalKES: number
}

function estimateCosts(usage: UsageLog, tier: User['subscription_tier']): Estimates {
  const whatsappRate = tier === 'premium' ? 0.003 : tier === 'basic' ? 0.004 : 0.005
  const whatsappMessages = (usage.whatsapp_business_initiated || 0) + (usage.whatsapp_user_initiated || 0)
  const whatsappCostUSD = whatsappMessages * whatsappRate
  const usdToKes = 130 // rough; could be fetched dynamically
  const whatsappCostKES = Math.round(whatsappCostUSD * usdToKes)

  const mpesaValue = Number(usage.mpesa_transaction_value || 0)
  const mpesaFeesKES = Math.round(mpesaValue * 0.01)

  return {
    whatsappCostKES,
    mpesaFeesKES,
    totalKES: whatsappCostKES + mpesaFeesKES,
  }
}

export function BillingDashboard() {
  const [usageToday, setUsageToday] = useState<UsageLog | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, usage] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getCurrentUsage(),
        ])
        setUser(profile)
        setUsageToday(usage.today)
      } catch (e) {
        console.error('Failed to load billing data', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="bg-white border rounded-lg p-6">Loading billing…</div>
  }

  if (!usageToday || !user) {
    return <div className="bg-white border rounded-lg p-6">No usage data available.</div>
  }

  const est = estimateCosts(usageToday, user.subscription_tier)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing & Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">WhatsApp messages (today)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{(usageToday.whatsapp_business_initiated || 0) + (usageToday.whatsapp_user_initiated || 0)}</div>
            <div className="text-sm text-gray-500 mt-1">Estimated cost: KES {est.whatsappCostKES}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">M-Pesa volume (today)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">KES {Number(usageToday.mpesa_transaction_value || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Estimated fees (1%): KES {est.mpesaFeesKES}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Estimated total (today)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">KES {est.totalKES}</div>
            <div className="text-sm text-gray-500 mt-1">Tier: {user.subscription_tier}</div>
          </div>
        </div>
      </div>
    </div>
  )
}


