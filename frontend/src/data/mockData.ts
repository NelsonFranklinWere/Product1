import { User, SocialAccount, Post, Message, Analytics } from '../types';

// Mock user data
export const mockUser: User = {
  id: '1',
  name: 'John Kimani',
  email: 'john@nairobitechsolutions.com',
  businessName: 'Nairobi Tech Solutions',
  businessType: 'Technology Services',
  location: 'Nairobi, Kenya',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1'
};

// Mock social accounts data
export const mockSocialAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'facebook',
    accountName: 'Nairobi Tech Solutions',
    followers: 2847,
    isConnected: true,
    lastSync: new Date('2025-01-15T10:30:00')
  },
  {
    id: '2',
    platform: 'instagram',
    accountName: '@nairobitecsolutions',
    followers: 1923,
    isConnected: true,
    lastSync: new Date('2025-01-15T09:15:00')
  },
  {
    id: '3',
    platform: 'whatsapp',
    accountName: 'WhatsApp Business',
    followers: 456,
    isConnected: false
  },
  {
    id: '4',
    platform: 'linkedin',
    accountName: 'Nairobi Tech Solutions Ltd',
    followers: 834,
    isConnected: true,
    lastSync: new Date('2025-01-15T08:45:00')
  },
  {
    id: '5',
    platform: 'tiktok',
    accountName: '@nairobitecsolutions',
    followers: 1247,
    isConnected: false
  }
];

// Mock posts data
export const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Exciting news! We\'ve just launched our new mobile app development services specifically for Nairobi small businesses. Get your business online with our affordable solutions! 📱💼 #NairobiTech #SmallBusiness #AppDevelopment',
    platforms: ['facebook', 'instagram', 'linkedin'],
    scheduledFor: new Date('2025-01-20T14:00:00'),
    status: 'scheduled',
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0
    },
    createdAt: new Date('2025-01-15T10:00:00')
  },
  {
    id: '2',
    content: 'Thank you to all our clients who joined our digital transformation workshop last week! 🙏 Here are the key takeaways for growing your business online in Kenya. Swipe to see the highlights! 👉',
    platforms: ['facebook', 'instagram'],
    scheduledFor: new Date('2025-01-14T16:30:00'),
    status: 'published',
    engagement: {
      likes: 47,
      comments: 12,
      shares: 8,
      reach: 892
    },
    createdAt: new Date('2025-01-14T08:00:00')
  },
  {
    id: '3',
    content: 'Looking to digitize your business operations? Our team specializes in creating custom solutions for Kenyan SMEs. From inventory management to customer relationship systems - we\'ve got you covered! 🚀',
    platforms: ['linkedin'],
    scheduledFor: new Date('2025-01-13T11:00:00'),
    status: 'published',
    engagement: {
      likes: 23,
      comments: 5,
      shares: 12,
      reach: 567
    },
    createdAt: new Date('2025-01-13T09:30:00')
  },
  {
    id: '4',
    content: 'Happy new year from the Nairobi Tech Solutions family! 🎉 This year, we\'re committed to helping 100 more Kenyan businesses go digital. Who\'s ready to transform their operations?',
    platforms: ['facebook', 'instagram', 'linkedin'],
    scheduledFor: new Date('2025-01-02T10:00:00'),
    status: 'published',
    engagement: {
      likes: 156,
      comments: 23,
      shares: 34,
      reach: 2341
    },
    createdAt: new Date('2025-01-01T12:00:00')
  },
  {
    id: '5',
    content: 'Draft: New blog post about mobile payment integration for small retailers in Kenya...',
    platforms: ['facebook', 'linkedin'],
    scheduledFor: new Date('2025-01-25T09:00:00'),
    status: 'draft',
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0
    },
    createdAt: new Date('2025-01-15T15:30:00')
  }
];

// Mock messages data
export const mockMessages: Message[] = [
  {
    id: '1',
    platform: 'facebook',
    from: 'Sarah Wanjiku',
    content: 'Hi! I saw your post about app development. Can you help me create an app for my catering business? What are your rates?',
    timestamp: new Date('2025-01-15T14:30:00'),
    isRead: false,
    type: 'message'
  },
  {
    id: '2',
    platform: 'instagram',
    from: 'david_ke',
    content: 'Love your work! Do you offer website design services as well?',
    timestamp: new Date('2025-01-15T13:45:00'),
    isRead: false,
    type: 'comment'
  },
  {
    id: '3',
    platform: 'whatsapp',
    from: 'Michael Ochieng',
    content: 'Good morning. I need help setting up online payments for my shop. Are you available for a consultation this week?',
    timestamp: new Date('2025-01-15T09:20:00'),
    isRead: true,
    type: 'message'
  },
  {
    id: '4',
    platform: 'linkedin',
    from: 'Grace Muthoni',
    content: 'Thank you for the insightful workshop! Could you share the presentation slides?',
    timestamp: new Date('2025-01-14T17:15:00'),
    isRead: true,
    type: 'message'
  },
  {
    id: '5',
    platform: 'facebook',
    from: 'Peter Kamau',
    content: 'Your digital transformation workshop was amazing! When is the next one?',
    timestamp: new Date('2025-01-14T16:45:00'),
    isRead: false,
    type: 'comment'
  },
  {
    id: '6',
    platform: 'instagram',
    from: 'mary_nairobi',
    content: '@nairobitecsolutions mentioned our business in their story! Thank you for the great service! 🙏',
    timestamp: new Date('2025-01-13T12:30:00'),
    isRead: true,
    type: 'mention'
  }
];

// Mock analytics data
export const mockAnalytics: Analytics = {
  totalFollowers: 6307,
  totalEngagement: 2847,
  postsThisWeek: 3,
  responseRate: 94.5,
  recentPosts: mockPosts.filter(post => post.status === 'published').slice(0, 3),
  engagementTrends: [
    { date: '2025-01-09', value: 234 },
    { date: '2025-01-10', value: 312 },
    { date: '2025-01-11', value: 189 },
    { date: '2025-01-12', value: 445 },
    { date: '2025-01-13', value: 567 },
    { date: '2025-01-14', value: 892 },
    { date: '2025-01-15', value: 208 }
  ]
};