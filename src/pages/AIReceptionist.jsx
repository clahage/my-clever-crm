import React from 'react';
import { Phone, Bot, Mic, MessageSquare } from 'lucide-react';

export default function AIReceptionist() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Receptionist</h1>
        <p className="text-gray-600">Automated call handling and lead qualification</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Phone className="h-10 w-10 text-blue-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Call Handling</h3>
          <p className="text-gray-600 mb-4">24/7 automated call answering with natural voice AI</p>
          <div className="text-sm text-gray-500">
            <div>Calls Today: 42</div>
            <div>Avg Handle Time: 3.2 min</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Bot className="h-10 w-10 text-green-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Lead Qualification</h3>
          <p className="text-gray-600 mb-4">AI scores and qualifies leads automatically</p>
          <div className="text-sm text-gray-500">
            <div>Qualified Today: 18</div>
            <div>Conversion Rate: 43%</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <MessageSquare className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Smart Routing</h3>
          <p className="text-gray-600 mb-4">Routes to right team member based on intent</p>
          <div className="text-sm text-gray-500">
            <div>Auto-Routed: 89%</div>
            <div>Accuracy: 96%</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transcripts</h2>
        <div className="text-gray-600">Call transcripts and AI analysis will appear here...</div>
      </div>
    </div>
  );
}
