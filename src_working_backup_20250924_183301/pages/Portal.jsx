import React from 'react';
import { Briefcase, FileText, TrendingUp, MessageSquare } from 'lucide-react';

export default function Portal() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Portal Configuration</h1>
        <p className="text-gray-600">Manage client portal settings and content</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Portal Features</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-semibold">Progress Tracking</div>
                <div className="text-sm text-gray-600">Clients can view their credit repair progress</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Configure</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-semibold">Document Upload</div>
                <div className="text-sm text-gray-600">Secure document sharing with clients</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Configure</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-semibold">Secure Messaging</div>
                <div className="text-sm text-gray-600">Direct communication with clients</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Configure</button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Portal Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">127</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">Engagement Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <div className="text-sm text-gray-600">Satisfaction Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
