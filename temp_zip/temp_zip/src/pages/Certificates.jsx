// src/pages/Certificates.jsx
import React from 'react';
import { Award } from 'lucide-react';

const Certificates = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          My Certificates
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              View and download your earned certificates. Coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;