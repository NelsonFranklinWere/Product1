import React from 'react';
import { Users, TrendingUp, MessageSquare, Calendar, Target } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { SocialAccountCard } from './SocialAccountCard';
import { Analytics, SocialAccount } from '../../types';

interface DashboardOverviewProps {
  analytics: Analytics;
  socialAccounts: SocialAccount[];
  onConnectAccount: (platform: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  socialAccounts,
  onConnectAccount
}) => {
  const connectedAccounts = socialAccounts.filter(account => account.isConnected);
  const unreadMessages = 3; // This would come from messages data in a real app

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back to SME-Pilot! 👋</h2>
            <p className="text-blue-100">
              Manage your social media presence across all platforms from one unified dashboard.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Target className="w-8 h-8 mb-2" />
              <p className="text-sm font-semibold">Growth Target</p>
              <p className="text-lg font-bold">+15% this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Followers"
          value={analytics.totalFollowers.toLocaleString()}
          change="+12% this week"
          changeType="positive"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Engagement"
          value={analytics.totalEngagement.toLocaleString()}
          change="+8% this week"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Unread Messages"
          value={unreadMessages}
          change="3 need response"
          changeType="neutral"
          icon={MessageSquare}
          color="orange"
        />
        <StatsCard
          title="Posts This Week"
          value={analytics.postsThisWeek}
          change="2 more scheduled"
          changeType="positive"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Social Accounts Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Social Media Accounts</h3>
          <div className="text-sm text-gray-500">
            {connectedAccounts.length} of {socialAccounts.length} connected
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialAccounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onConnect={onConnectAccount}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Schedule Post</h4>
            <p className="text-sm text-gray-600">Create and schedule new content</p>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <MessageSquare className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Check Messages</h4>
            <p className="text-sm text-gray-600">Respond to customer inquiries</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-600">Check performance metrics</p>
          </button>
          
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
            <Users className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Connect Account</h4>
            <p className="text-sm text-gray-600">Link more social platforms</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.recentPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 mb-1">
                  {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{post.platforms.join(', ')}</span>
                  <span>{post.engagement.likes} likes</span>
                  <span>{post.engagement.comments} comments</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};