export interface User {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  location: string;
  avatar?: string;
}

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'linkedin';
  accountName: string;
  followers: number;
  isConnected: boolean;
  lastSync?: Date;
}

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  createdAt: Date;
}

export interface Message {
  id: string;
  platform: string;
  from: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'message' | 'comment' | 'mention';
}

export interface Analytics {
  totalFollowers: number;
  totalEngagement: number;
  postsThisWeek: number;
  responseRate: number;
  recentPosts: Post[];
  engagementTrends: Array<{
    date: string;
    value: number;
  }>;
}