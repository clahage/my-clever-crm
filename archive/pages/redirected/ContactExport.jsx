// ===== src/pages/ContactExport.jsx =====
import React from 'react';
import { Download } from 'lucide-react';

const ContactExport = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Export Contacts
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Export your contacts to CSV, Excel, or PDF format. Coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactExport;