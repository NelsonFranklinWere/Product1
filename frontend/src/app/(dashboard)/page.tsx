import React from 'react'
import { DashboardOverview } from '@/components/Dashboard/Overview'
import { mockAnalytics } from '@/data/mockData'

export default function DashboardPage() {
  return (
    <DashboardOverview 
      analytics={mockAnalytics}
      socialAccounts={[]}
      onConnectAccount={() => {}}
    />
  )
}


