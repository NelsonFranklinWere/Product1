import React, { useState } from 'react';
import { MessageCircle, Reply, Star, Archive, Filter } from 'lucide-react';
import { Message } from '../../types';

interface MessageCenterProps {
  messages: Message[];
  onReply: (messageId: string, reply: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  messages,
  onReply,
  onMarkAsRead
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'comments'>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const filteredMessages = messages.filter(message => {
    switch (filter) {
      case 'unread': return !message.isRead;
      case 'messages': return message.type === 'message';
      case 'comments': return message.type === 'comment';
      default: return true;
    }
  });

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      whatsapp: 'bg-green-100 text-green-800',
      linkedin: 'bg-blue-100 text-blue-800',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Messages</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 border rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border-none focus:ring-0"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="messages">Direct Messages</option>
                <option value="comments">Comments</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              !message.isRead ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedMessage(message.id);
              if (!message.isRead) {
                onMarkAsRead(message.id);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(message.platform)}`}>
                    {message.platform}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{message.from}</span>
                  <span className="text-sm text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-900 mb-2">{message.content}</p>
                
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-yellow-500 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {!message.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-4"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};