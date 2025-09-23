import React, { useState } from 'react';
import { Bot, Zap, Clock, Brain, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  type: 'response' | 'scheduling' | 'analytics' | 'compliance';
  trigger: string;
  action: string;
}

export const AutomationPanel: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-Response for Common Inquiries',
      description: 'Automatically respond to frequently asked questions about business hours and location',
      isActive: true,
      type: 'response',
      trigger: 'Keywords: "hours", "location", "contact"',
      action: 'Send predefined response with business details'
    },
    {
      id: '2',
      name: 'Optimal Posting Times',
      description: 'Schedule posts during peak engagement hours for your audience',
      isActive: false,
      type: 'scheduling',
      trigger: 'New post created',
      action: 'Suggest optimal posting time based on audience data'
    },
    {
      id: '3',
      name: 'Engagement Alerts',
      description: 'Get notified when posts perform exceptionally well or poorly',
      isActive: true,
      type: 'analytics',
      trigger: 'Post engagement threshold reached',
      action: 'Send notification with performance summary'
    },
    {
      id: '4',
      name: 'KRA Filing Reminders',
      description: 'Automatic reminders for Kenyan tax compliance deadlines',
      isActive: false,
      type: 'compliance',
      trigger: 'Approaching tax deadline',
      action: 'Send reminder with filing checklist'
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { ...automation, isActive: !automation.isActive }
          : automation
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'response': return Brain;
      case 'scheduling': return Clock;
      case 'analytics': return Zap;
      case 'compliance': return AlertTriangle;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'response': return 'bg-blue-100 text-blue-600';
      case 'scheduling': return 'bg-green-100 text-green-600';
      case 'analytics': return 'bg-purple-100 text-purple-600';
      case 'compliance': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Automation Center</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Active Rules</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900">{automations.filter(a => a.isActive).length}</p>
            <p className="text-sm text-blue-600">Currently running</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Responses Sent</h3>
            </div>
            <p className="text-2xl font-bold text-green-900">47</p>
            <p className="text-sm text-green-600">This week</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Time Saved</h3>
            </div>
            <p className="text-2xl font-bold text-orange-900">12.5</p>
            <p className="text-sm text-orange-600">Hours this week</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
          
          {automations.map((automation) => {
            const TypeIcon = getTypeIcon(automation.type);
            return (
              <div key={automation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(automation.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{automation.name}</h4>
                        {automation.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{automation.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Trigger:</span>
                          <p className="text-gray-600 mt-1">{automation.trigger}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Action:</span>
                          <p className="text-gray-600 mt-1">{automation.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        automation.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {automation.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Future AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg border-dashed border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-2">Content Generation</h4>
            <p className="text-sm text-gray-600">AI-powered content suggestions based on local Kenyan context and cultural relevance.</p>
          </div>
          
          <div className="p-4 border rounded-lg border-dashed border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-2">Customer Segmentation</h4>
            <p className="text-sm text-gray-600">Automatically categorize customers and personalize interactions based on behavior.</p>
          </div>
          
          <div className="p-4 border rounded-lg border-dashed border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-2">Predictive Analytics</h4>
            <p className="text-sm text-gray-600">Forecast engagement trends and optimal posting schedules.</p>
          </div>
          
          <div className="p-4 border rounded-lg border-dashed border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-2">Financial Data Trail</h4>
            <p className="text-sm text-gray-600">Generate verifiable digital records for easier access to financing opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};