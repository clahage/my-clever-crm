import React from 'react';
import { HelpCircle, MessageCircle, Book, Phone } from 'lucide-react';

export default function Support() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
        <p className="text-gray-600">Help resources and support tools</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Book className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">Knowledge Base</h3>
          <p className="text-sm text-gray-600">Browse help articles</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <MessageCircle className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">Support Tickets</h3>
          <p className="text-sm text-gray-600">View open tickets</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Phone className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-1">Contact Support</h3>
          <p className="text-sm text-gray-600">Get direct help</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <HelpCircle className="h-8 w-8 text-orange-600 mb-3" />
          <h3 className="font-semibold mb-1">FAQs</h3>
          <p className="text-sm text-gray-600">Common questions</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Popular Help Topics</h2>
          <div className="space-y-3">
            <a href="#" className="block p-3 hover:bg-gray-50 rounded-lg">
              <div className="font-medium text-blue-600">Getting Started with SpeedyCRM</div>
              <div className="text-sm text-gray-600">Learn the basics of the platform</div>
            </a>
            <a href="#" className="block p-3 hover:bg-gray-50 rounded-lg">
              <div className="font-medium text-blue-600">Managing Disputes</div>
              <div className="text-sm text-gray-600">How to create and track dispute letters</div>
            </a>
            <a href="#" className="block p-3 hover:bg-gray-50 rounded-lg">
              <div className="font-medium text-blue-600">Client Portal Setup</div>
              <div className="text-sm text-gray-600">Configure client access and features</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
