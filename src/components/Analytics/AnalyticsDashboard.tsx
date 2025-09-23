import React from 'react';
import { BarChart3, TrendingUp, Eye, MessageSquare, Share2, Users } from 'lucide-react';
import { Analytics, Post } from '../../types';

interface AnalyticsDashboardProps {
  analytics: Analytics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  const metricCards = [
    {
      title: 'Total Followers',
      value: analytics.totalFollowers.toLocaleString(),
      change: '+12% this week',
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Total Engagement',
      value: analytics.totalEngagement.toLocaleString(),
      change: '+8% this week',
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Posts This Week',
      value: analytics.postsThisWeek,
      change: '3 more than last week',
      icon: BarChart3,
      color: 'orange' as const
    },
    {
      title: 'Response Rate',
      value: `${analytics.responseRate}%`,
      change: '+2% improvement',
      icon: MessageSquare,
      color: 'purple' as const
    }
  ];

  const getMetricCardColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getMetricCardColor(metric.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Engagement Trends Chart Placeholder */}
        <div className="border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Interactive chart will be implemented here</p>
              <p className="text-sm">Showing engagement over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts Performance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Post Performance</h3>
        <div className="space-y-4">
          {analytics.recentPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{post.content.substring(0, 100)}...</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.engagement.reach}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{post.engagement.likes}</div>
                    <div className="text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{post.engagement.comments}</div>
                    <div className="text-gray-500">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{post.engagement.shares}</div>
                    <div className="text-gray-500">Shares</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};