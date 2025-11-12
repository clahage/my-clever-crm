// src/pages/Communications.jsx
import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Bot, Send, Archive, Clock, Eye } from 'lucide-react';
import EmailComposer from '../components/EmailComposer';

const Communications = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats for overview
  const stats = {
    messages: 24,
    emails: 156,
    calls: 42,
    aiHandled: 89
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communications Hub</h1>
          <p className="text-gray-600">Manage all client communications and track engagement</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'email' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email Center
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                History
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tracking' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Tracking Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-gray-700">Messages</h3>
                <p className="text-2xl font-bold">{stats.messages}</p>
                <p className="text-sm text-gray-500 mt-1">Active conversations</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Mail className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-700">Emails</h3>
                <p className="text-2xl font-bold">{stats.emails}</p>
                <p className="text-sm text-gray-500 mt-1">Sent this month</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Phone className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold text-gray-700">Calls</h3>
                <p className="text-2xl font-bold">{stats.calls}</p>
                <p className="text-sm text-gray-500 mt-1">This week</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Bot className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-gray-700">AI Handled</h3>
                <p className="text-2xl font-bold">{stats.aiHandled}%</p>
                <p className="text-sm text-gray-500 mt-1">Automation rate</p>
              </div>
            </div>

            {/* Recent Communications Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Communications</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-gray-600">Contact</th>
                        <th className="text-left py-3 px-4 text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 text-gray-600">Subject</th>
                        <th className="text-left py-3 px-4 text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">John Doe</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Email
                          </span>
                        </td>
                        <td className="py-3 px-4">Credit Report Review</td>
                        <td className="py-3 px-4">Today, 2:30 PM</td>
                        <td className="py-3 px-4">
                          <span className="text-green-600 text-sm">Opened</span>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Jane Smith</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            SMS
                          </span>
                        </td>
                        <td className="py-3 px-4">Appointment Reminder</td>
                        <td className="py-3 px-4">Today, 11:15 AM</td>
                        <td className="py-3 px-4">
                          <span className="text-blue-600 text-sm">Delivered</span>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Mike Johnson</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Call
                          </span>
                        </td>
                        <td className="py-3 px-4">Follow-up Call</td>
                        <td className="py-3 px-4">Yesterday, 4:45 PM</td>
                        <td className="py-3 px-4">
                          <span className="text-gray-600 text-sm">Completed</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div>
            <EmailComposer />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Communication History</h2>
            <p className="text-gray-600">Full communication history will be displayed here.</p>
            <div className="mt-6 space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-medium">Email to John Doe</div>
                <div className="text-sm text-gray-600">Subject: Welcome to Speedy Credit Repair</div>
                <div className="text-xs text-gray-500 mt-1">Sent 3 days ago • Opened 2 days ago</div>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="font-medium">SMS to Jane Smith</div>
                <div className="text-sm text-gray-600">Appointment reminder for tomorrow at 2 PM</div>
                <div className="text-xs text-gray-500 mt-1">Sent 5 days ago • Delivered</div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="font-medium">Call with Mike Johnson</div>
                <div className="text-sm text-gray-600">Discussed dispute letter progress</div>
                <div className="text-xs text-gray-500 mt-1">1 week ago • Duration: 12 minutes</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Email Tracking Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Email Tracking Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-600">Emails Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">68%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">42%</div>
                  <div className="text-sm text-gray-600">Click Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">23%</div>
                  <div className="text-sm text-gray-600">Reply Rate</div>
                </div>
              </div>
            </div>

            {/* Website Visitor Tracking */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Website Visitor Tracking</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">247</div>
                  <div className="text-sm text-gray-600">Unique Visitors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">3:42</div>
                  <div className="text-sm text-gray-600">Avg. Session Duration</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">5.3</div>
                  <div className="text-sm text-gray-600">Pages per Visit</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">Top Visited Pages:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Home Page (89 visits)</li>
                  <li>Services (67 visits)</li>
                  <li>Contact Us (45 visits)</li>
                  <li>About (38 visits)</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communications;