import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Calendar, Download, Bell } from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  type: 'kra' | 'nema' | 'business' | 'other';
  priority: 'high' | 'medium' | 'low';
}

export const ComplianceCenter: React.FC = () => {
  const [complianceItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      title: 'KRA Monthly Returns',
      description: 'Submit monthly VAT and income tax returns to Kenya Revenue Authority',
      dueDate: new Date(2025, 1, 20),
      status: 'pending',
      type: 'kra',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Business Registration Renewal',
      description: 'Renew business registration certificate with Registrar of Companies',
      dueDate: new Date(2025, 2, 15),
      status: 'pending',
      type: 'business',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'NEMA Environmental Compliance',
      description: 'Submit environmental impact assessment report',
      dueDate: new Date(2025, 1, 10),
      status: 'completed',
      type: 'nema',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Social Media Data Protection',
      description: 'Update privacy policies and data handling procedures',
      dueDate: new Date(2025, 1, 25),
      status: 'pending',
      type: 'other',
      priority: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'overdue': return AlertTriangle;
      default: return Calendar;
    }
  };

  const pendingItems = complianceItems.filter(item => item.status === 'pending');
  const completedItems = complianceItems.filter(item => item.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Compliance Center</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Due Soon</h3>
            </div>
            <p className="text-2xl font-bold text-red-900">{pendingItems.filter(item => 
              (item.dueDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000
            ).length}</p>
            <p className="text-sm text-red-600">Within 7 days</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Pending</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{pendingItems.length}</p>
            <p className="text-sm text-yellow-600">Total pending</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Completed</h3>
            </div>
            <p className="text-2xl font-bold text-green-900">{completedItems.length}</p>
            <p className="text-sm text-green-600">This month</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Reminders</h3>
            </div>
            <p className="text-2xl font-bold text-blue-900">5</p>
            <p className="text-sm text-blue-600">Active alerts</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Compliance Items</h3>
            <div className="space-y-4">
              {pendingItems.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                const daysUntilDue = Math.ceil((item.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={item.id} className={`border-l-4 rounded-lg p-4 ${getPriorityColor(item.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <StatusIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <span className="text-xs text-gray-500 uppercase font-medium">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Due: {item.dueDate.toLocaleDateString()}</span>
                            <span className={`font-medium ${daysUntilDue <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                              {daysUntilDue} days remaining
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Download template">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Completions</h3>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">Completed on {item.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">KRA Guidelines</h4>
            <p className="text-sm text-gray-600 mb-3">Latest tax compliance requirements and filing procedures</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              Access Resources →
            </button>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">Business Registration</h4>
            <p className="text-sm text-gray-600 mb-3">Company registration and renewal procedures</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              Learn More →
            </button>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">Data Protection</h4>
            <p className="text-sm text-gray-600 mb-3">GDPR and local data protection compliance</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              View Guidelines →
            </button>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">Environmental Impact</h4>
            <p className="text-sm text-gray-600 mb-3">NEMA requirements for business operations</p>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
              Read More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};