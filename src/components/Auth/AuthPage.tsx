import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-5xl font-bold text-white">S</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SME Sales AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform your Nairobi business with unified social media management and AI-powered automation
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Unified Dashboard</h3>
                <p className="text-sm text-gray-600">Manage all social platforms from one place</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">AI Automation</h3>
                <p className="text-sm text-gray-600">Automate responses and scheduling</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">Track performance across all channels</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Compliance</h3>
                <p className="text-sm text-gray-600">Stay compliant with Kenyan regulations</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};