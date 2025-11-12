import React, { useState } from 'react';
import { FileText, Upload, Download, Trash2, Eye, Search, Filter, Folder, File, Calendar, MoreVertical } from 'lucide-react';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Sample documents data
  const documents = [
    {
      id: 1,
      name: 'Credit Report - John Smith.pdf',
      type: 'report',
      size: '2.4 MB',
      uploadedBy: 'Admin',
      uploadedAt: '2024-01-15',
      category: 'Credit Reports'
    },
    {
      id: 2,
      name: 'Dispute Letter Template.docx',
      type: 'template',
      size: '156 KB',
      uploadedBy: 'System',
      uploadedAt: '2024-01-10',
      category: 'Templates'
    },
    {
      id: 3,
      name: 'Client Agreement - Sarah Johnson.pdf',
      type: 'agreement',
      size: '1.2 MB',
      uploadedBy: 'Admin',
      uploadedAt: '2024-01-08',
      category: 'Agreements'
    },
    {
      id: 4,
      name: 'ID Verification - Mike Williams.jpg',
      type: 'identification',
      size: '3.5 MB',
      uploadedBy: 'Client',
      uploadedAt: '2024-01-05',
      category: 'Verification'
    },
    {
      id: 5,
      name: 'Financial Statement Q4 2023.xlsx',
      type: 'financial',
      size: '890 KB',
      uploadedBy: 'Admin',
      uploadedAt: '2024-01-01',
      category: 'Financial'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'report', label: 'Credit Reports' },
    { value: 'template', label: 'Templates' },
    { value: 'agreement', label: 'Agreements' },
    { value: 'identification', label: 'Verification' },
    { value: 'financial', label: 'Financial' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type) => {
    const colors = {
      report: 'text-blue-500',
      template: 'text-green-500',
      agreement: 'text-purple-500',
      identification: 'text-orange-500',
      financial: 'text-red-500'
    };
    return <FileText className={`w-10 h-10 ${colors[type] || 'text-gray-500'}`} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage and organize all your documents</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold">48.2 MB</p>
            </div>
            <Folder className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <Filter className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(doc.type)}
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{doc.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{doc.category}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>{doc.size}</span>
                <span>{doc.uploadedAt}</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found</p>
        </div>
      )}
    </div>
  );
};

export default Documents;