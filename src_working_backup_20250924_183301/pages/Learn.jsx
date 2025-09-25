import React from 'react';
import { BookOpen, Video, FileText, HelpCircle } from 'lucide-react';

export default function Learn() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Center</h1>
        <p className="text-gray-600">Knowledge base, tutorials, and resources</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <BookOpen className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">Articles</h3>
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-gray-600">Knowledge articles</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <Video className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-1">Videos</h3>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm text-gray-600">Tutorial videos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <FileText className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">Guides</h3>
          <p className="text-2xl font-bold">28</p>
          <p className="text-sm text-gray-600">Step-by-step guides</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <HelpCircle className="h-8 w-8 text-orange-600 mb-3" />
          <h3 className="font-semibold mb-1">FAQs</h3>
          <p className="text-2xl font-bold">89</p>
          <p className="text-sm text-gray-600">Common questions</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Popular Topics</h2>
        <div className="space-y-2">
          <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">📚 Getting Started with Credit Repair</div>
          <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">🎯 Understanding Credit Scores</div>
          <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">✍️ Writing Effective Dispute Letters</div>
          <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">💼 Business Credit Basics</div>
        </div>
      </div>
    </div>
  );
}
