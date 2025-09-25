import React from 'react';
import { MessageSquare, Mail, Phone, Bot } from 'lucide-react';

export default function CommunicationsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communications Hub</h1>
        <p className="text-gray-600">Manage all client communications in one place</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Messages</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Mail className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Emails</h3>
          <p className="text-2xl font-bold">156</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Phone className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Calls</h3>
          <p className="text-2xl font-bold">42</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Bot className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">AI Handled</h3>
          <p className="text-2xl font-bold">89%</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Communications</h2>
          <div className="text-gray-600">Communication inbox will be integrated here...</div>
        </div>
      </div>
    </div>
  );
}
