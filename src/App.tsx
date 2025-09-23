import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './components/Auth/AuthProvider';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardOverview } from './components/Dashboard/Overview';
import { ContentCalendar } from './components/Content/ContentCalendar';
import { MessageCenter } from './components/Messages/MessageCenter';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { AutomationPanel } from './components/Automation/AutomationPanel';
import { ComplianceCenter } from './components/Compliance/ComplianceCenter';
import { 
  mockUser, 
  mockSocialAccounts, 
  mockPosts, 
  mockMessages, 
  mockAnalytics 
} from './data/mockData';
import { Post, Message } from './types';

function AppContent() {
  const { isAuthenticated, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState(mockPosts);
  const [messages, setMessages] = useState(mockMessages);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'content': return 'Content & Scheduling';
      case 'messages': return 'Customer Messages';
      case 'analytics': return 'Performance Analytics';
      case 'automation': return 'AI Automation';
      case 'compliance': return 'Compliance Center';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getPageSubtitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Welcome to your unified business operations center';
      case 'content': return 'Manage and schedule content across all your social platforms';
      case 'messages': return 'Respond to customer inquiries from all connected accounts';
      case 'analytics': return 'Track performance and engagement across all channels';
      case 'automation': return 'Set up AI-powered workflows to save time';
      case 'compliance': return 'Stay compliant with Kenyan business regulations';
      case 'settings': return 'Configure your account and platform preferences';
      default: return '';
    }
  };

  // Event handlers
  const handleConnectAccount = (platform: string) => {
    // This would trigger the actual OAuth flow for the platform
    console.log(`Connecting to ${platform}...`);
    // For demo purposes, we'll just show an alert
    alert(`Connecting to ${platform}... In a real app, this would open the OAuth flow.`);
  };

  const handleCreatePost = () => {
    // This would open a post creation modal or form
    console.log('Creating new post...');
    alert('Post creation modal would open here. This is part of the MVP demo.');
  };

  const handleEditPost = (post: Post) => {
    console.log('Editing post:', post.id);
    alert(`Editing post "${post.content.substring(0, 50)}...". Edit modal would open here.`);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }
  };

  const handleReplyToMessage = (messageId: string, reply: string) => {
    console.log(`Replying to message ${messageId}:`, reply);
    // In a real app, this would send the reply via the appropriate platform API
    alert('Reply sent! In a real app, this would use the platform APIs.');
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, isRead: true }
          : message
      )
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            analytics={mockAnalytics}
            socialAccounts={mockSocialAccounts}
            onConnectAccount={handleConnectAccount}
          />
        );
      case 'content':
        return (
          <ContentCalendar
            posts={posts}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        );
      case 'messages':
        return (
          <MessageCenter
            messages={messages}
            onReply={handleReplyToMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard analytics={mockAnalytics} />;
      case 'automation':
        return <AutomationPanel />;
      case 'compliance':
        return <ComplianceCenter />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">
              Settings panel will include account management, notification preferences, 
              platform integrations, and business profile configuration.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Account Settings</h3>
                <p className="text-sm text-gray-600">Manage your profile and business information</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Notification Preferences</h3>
                <p className="text-sm text-gray-600">Configure how you receive alerts and updates</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Platform Integrations</h3>
                <p className="text-sm text-gray-600">Manage connected social media accounts</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Team Management</h3>
                <p className="text-sm text-gray-600">Add team members and manage permissions</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <DashboardOverview 
            analytics={mockAnalytics}
            socialAccounts={mockSocialAccounts}
            onConnectAccount={handleConnectAccount}
          />
        );
    }
  };

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
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title={getPageTitle(activeTab)} 
          subtitle={getPageSubtitle(activeTab)}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;