import React from 'react';
import { Facebook, Instagram, MessageCircle, Linkedin } from 'lucide-react';
import { SocialAccount } from '../../types';

interface SocialAccountCardProps {
  account: SocialAccount;
  onConnect: (platform: string) => void;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: () => <div className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center">T</div>,
  linkedin: Linkedin,
};

const platformColors = {
  facebook: 'bg-blue-600',
  instagram: 'bg-pink-600',
  whatsapp: 'bg-green-600',
  tiktok: 'bg-black',
  linkedin: 'bg-blue-800',
};

export const SocialAccountCard: React.FC<SocialAccountCardProps> = ({ account, onConnect }) => {
  const Icon = platformIcons[account.platform];
  const colorClass = platformColors[account.platform];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{account.platform}</h3>
            {account.isConnected && (
              <p className="text-sm text-gray-500">{account.accountName}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {account.isConnected ? (
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
              <p className="text-sm text-gray-500 mt-1">{account.followers.toLocaleString()} followers</p>
            </div>
          ) : (
            <button
              onClick={() => onConnect(account.platform)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};