import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import { Post } from '../../types';

interface ContentCalendarProps {
  posts: Post[];
  onCreatePost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = (
  props: ContentCalendarProps
) => {
  const { posts, onCreatePost, onEditPost, onDeletePost } = props;
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const getStatusColor = (status: Post['status']): string => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-l-lg ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-r-lg ${
                  viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Calendar
              </button>
            </div>
            
            <button
              onClick={onCreatePost}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {posts.map((post: Post) => {
            const scheduledDate = post.scheduledFor instanceof Date
              ? post.scheduledFor
              : new Date(post.scheduledFor);
            return (
            <div key={post.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{scheduledDate.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-900 mb-2">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{post.platforms.join(', ')}</span>
                    </div>
                    <span>{post.engagement.likes} likes</span>
                    <span>{post.engagement.comments} comments</span>
                    <span>{post.engagement.shares} shares</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEditPost(post)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};