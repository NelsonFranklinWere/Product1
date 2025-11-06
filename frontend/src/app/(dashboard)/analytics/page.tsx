'use client'

import React from 'react'
import { AnalyticsDashboard } from '@/components/Analytics/AnalyticsDashboard'

export default function AnalyticsPage() {
  const mockAnalytics = {
    totalFollowers: 0,
    totalEngagement: 0,
    postsThisWeek: 0,
    responseRate: 0,
    recentPosts: [],
    engagementTrends: []
  }
  
  return <AnalyticsDashboard analytics={mockAnalytics} />
}

