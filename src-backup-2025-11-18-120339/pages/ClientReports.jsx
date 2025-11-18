// src/pages/ClientReports.jsx
// Client Reports View - Coming Soon

import React from 'react';
import { FileText, Download, Eye, Construction } from 'lucide-react';

export default function ClientReports() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-8 text-center">
          <Construction className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Reports Coming Soon!</h1>
          <p className="text-green-100">
            View and download your credit reports here
          </p>
        </div>
      </div>
    </div>
  );
}