// ===== src/pages/ContactImport.jsx =====
import React from 'react';
import { Upload } from 'lucide-react';

const ContactImport = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Import Contacts
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Bulk contact import feature coming soon. Upload CSV, Excel, or VCF files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactImport;