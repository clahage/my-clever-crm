import React from 'react';
import { Layers, Users, Mail, Tag } from 'lucide-react';

export default function BulkActions() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Actions</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <Users className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Bulk Assign</h3>
          <p className="text-sm text-gray-600">Assign multiple contacts</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <Tag className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Bulk Tag</h3>
          <p className="text-sm text-gray-600">Add tags to multiple items</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <Mail className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Bulk Email</h3>
          <p className="text-sm text-gray-600">Send to multiple recipients</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
          <Layers className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">Bulk Update</h3>
          <p className="text-sm text-gray-600">Update multiple records</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Select Items for Bulk Action</h2>
        <p className="text-gray-600">Bulk action interface will appear here...</p>
      </div>
    </div>
  );
}
