// src/pages/AICommandCenter.jsx
// FIXED VERSION - Uses Real Components Only
// This replaces the broken version that imported a deleted demo component

import React from 'react';
import AIActivityFeed from '../components/AIActivityFeed';

export default function AICommandCenter() {
  return (
    <div className="space-y-6 p-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Command Center</h1>
        <p className="text-purple-100">
          Monitor your AI Receptionist activity and lead capture performance
        </p>
      </div>

      {/* Real-time Activity Feed - Uses the existing working component */}
      <AIActivityFeed />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="/ai-receptionist"
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📞</span>
            <h3 className="text-xl font-bold">AI Receptionist</h3>
          </div>
          <p className="text-gray-600">View detailed stats, lead scores, and processing tools</p>
        </a>

        <a 
          href="/pipeline"
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold">Pipeline</h3>
          </div>
          <p className="text-gray-600">Manage leads through your sales pipeline</p>
        </a>

        <a 
          href="/contacts"
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👥</span>
            <h3 className="text-xl font-bold">Contacts</h3>
          </div>
          <p className="text-gray-600">View all contacts created from AI calls</p>
        </a>
      </div>

      {/* System Status Dashboard */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">●</span>
              <span className="font-medium">AI Receptionist (Taylor)</span>
            </div>
            <span className="text-green-600 font-bold">ACTIVE</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">●</span>
              <span className="font-medium">Webhook Receiver</span>
            </div>
            <span className="text-green-600 font-bold">ONLINE</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">●</span>
              <span className="font-medium">Call Processor</span>
            </div>
            <span className="text-green-600 font-bold">RUNNING</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">●</span>
              <span className="font-medium">OpenAI Integration</span>
            </div>
            <span className="text-blue-600 font-bold">READY</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">💡 How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>AI Receptionist (Taylor) receives incoming calls</li>
          <li>Call transcript sent to webhook receiver</li>
          <li>OpenAI analyzes call and scores lead quality (0-10)</li>
          <li>Contact automatically created/updated in CRM</li>
          <li>Lead added to Pipeline based on score</li>
          <li>You get notified for high-score leads (8+)</li>
          <li>Follow-up tasks created automatically</li>
        </ol>
      </div>

      {/* Key Metrics Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📊 Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Calls Today</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Leads Created</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">High Quality (8+)</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">--</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Visit the AI Receptionist page for detailed analytics
        </p>
      </div>

      {/* Team Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">👥 Your Team</h3>
        <div className="space-y-2 text-indigo-800">
          <div className="flex items-center gap-2">
            <span className="font-bold">Chris:</span>
            <span>Owner - Receives all high-priority lead alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Laurie:</span>
            <span>Operations Manager - Handles lead processing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Taylor:</span>
            <span>AI Receptionist - Captures leads 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}