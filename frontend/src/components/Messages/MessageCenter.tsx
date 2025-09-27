import React, { useState } from 'react';
import { MessageCircle, Reply, Star, Archive, Filter, Send, Package, CreditCard } from 'lucide-react';
import { Message } from '../../types';
import apiClient from '@/lib/api'

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
  const [composer, setComposer] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [showProducts, setShowProducts] = useState(false)
  const [products, setProducts] = useState<any[]>([])

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

  const loadProducts = async () => {
    try {
      const list = await apiClient.getProducts()
      setProducts(list)
    } catch {}
  }

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

      {/* Composer */}
      {selectedMessage && (
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
              onClick={async () => { setShowProducts((v) => !v); if (!products.length) await loadProducts() }}
            >
              <Package className="w-4 h-4" /> Insert product
            </button>
            <button
              className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
              onClick={() => setShowPayment(true)}
            >
              <CreditCard className="w-4 h-4" /> Request payment
            </button>
          </div>

          {showProducts && (
            <div className="border rounded p-2 max-h-40 overflow-auto">
              {products.map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left px-2 py-1 hover:bg-gray-50"
                  onClick={() => setComposer((c) => `${c}\n${p.name} - KES ${p.price}\n${p.description}`)}
                >
                  {p.name} • KES {p.price}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              className="flex-1 border rounded p-2 min-h-[60px]"
              placeholder="Type a reply..."
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 h-fit"
              onClick={() => {
                onReply(selectedMessage, composer)
                setComposer('')
              }}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm space-y-3">
            <h3 className="text-lg font-semibold">Request Payment</h3>
            <input
              className="w-full border rounded p-2"
              placeholder="Amount (KES)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="w-full border rounded p-2"
              placeholder="Customer phone (2547...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2" onClick={() => setShowPayment(false)}>Cancel</button>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={async () => {
                  try {
                    // For MVP we don't have the conversation id; backend should infer or we pass placeholder
                    await apiClient.initiateSTKPush({ phone_number: phone, amount: Number(amount) })
                    setShowPayment(false)
                  } catch {
                    // ignore
                  }
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};