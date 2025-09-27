import React from 'react'
import { AnalyticsDashboard } from '@/components/Analytics/AnalyticsDashboard'
import { mockAnalytics } from '@/data/mockData'

export default function BillingPage() {
  return <AnalyticsDashboard analytics={mockAnalytics} />
}


