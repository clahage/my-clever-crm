// src/pages/Letters.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Download, Upload, Send, Edit3, Trash2, Copy,
  Eye, CheckCircle, XCircle, Clock, AlertCircle, Star, Archive, Folder,
  Mail, Printer, Share2, Tag, Calendar, User, Building, CreditCard, Shield,
  BarChart3, TrendingUp, DollarSign, Target, Zap, RefreshCw, Settings,
  ChevronRight, ChevronDown, ChevronUp, X, Check, Info, HelpCircle,
  Paperclip, Link, Lock, Unlock, BookOpen, MessageSquare, Bell,
  Activity, Globe, Briefcase, Award, Flag, Hash, Layers, Grid, List,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoreVertical, Wand2,
  Sparkles, Brain, Lightbulb, Package, Palette, PenTool, Save
} from 'lucide-react';

const Letters = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Mock data for letters
  const [letters] = useState([
    {
      id: 1,
      title: 'Dispute Letter - Equifax Collection Account',
      type: 'dispute',
      bureau: 'Equifax',
      client: 'John Smith',
      status: 'sent',
      sentDate: '2024-01-15',
      responseDate: '2024-02-01',
      result: 'removed',
      template: 'Round 1 Dispute',
      items: ['Collection Account #4521', 'Late Payment 03/2023'],
      score_impact: '+45',
      tracking: 'USPS #7845123698',
      ai_confidence: 92,
      tags: ['collections', 'high-priority']
    },
    {
      id: 2,
      title: 'Goodwill Letter - Capital One',
      type: 'goodwill',
      creditor: 'Capital One',
      client: 'Sarah Johnson',
      status: 'pending',
      sentDate: '2024-01-20',
      template: 'Goodwill Request',
      items: ['Late Payment 06/2023'],
      ai_confidence: 78,
      tags: ['late-payment', 'goodwill']
    },
    {
      id: 3,
      title: 'Validation Letter - Portfolio Recovery',
      type: 'validation',
      collector: 'Portfolio Recovery Associates',
      client: 'Michael Brown',
      status: 'draft',
      template: 'Debt Validation Request',
      items: ['Alleged Debt $3,450'],
      ai_confidence: 85,
      tags: ['validation', 'collections']
    },
    {
      id: 4,
      title: 'Pay for Delete - Medical Collection',
      type: 'pay-for-delete',
      collector: 'Medical Revenue Service',
      client: 'Emma Wilson',
      status: 'negotiating',
      sentDate: '2024-01-18',
      template: 'Pay for Delete Offer',
      items: ['Medical Bill $1,250'],
      offer_amount: '$625',
      ai_confidence: 71,
      tags: ['medical', 'negotiation']
    },
    {
      id: 5,
      title: 'Cease and Desist - Dynamic Recovery',
      type: 'cease-desist',
      collector: 'Dynamic Recovery Solutions',
      client: 'Robert Davis',
      status: 'sent',
      sentDate: '2024-01-12',
      template: 'Cease and Desist',
      certified: true,
      tracking: 'Certified #7845236985',
      ai_confidence: 95,
      tags: ['harassment', 'fdcpa']
    },
    {
      id: 6,
      title: 'Method of Verification - TransUnion',
      type: 'mov',
      bureau: 'TransUnion',
      client: 'Lisa Martinez',
      status: 'awaiting',
      sentDate: '2024-01-22',
      template: 'MOV Request',
      items: ['Student Loan #8974', 'Credit Card #2356'],
      ai_confidence: 88,
      tags: ['verification', 'round-2']
    }
  ]);

  const letterTemplates = [
    {
      category: 'Credit Bureaus',
      templates: [
        { name: 'Round 1 Dispute', uses: 1250, success_rate: 78, ai_optimized: true },
        { name: 'Round 2 - MOV Request', uses: 890, success_rate: 82, ai_optimized: true },
        { name: 'Round 3 - Procedural Request', uses: 567, success_rate: 71, ai_optimized: false },
        { name: 'Identity Theft Affidavit', uses: 234, success_rate: 91, ai_optimized: true },
        { name: 'Fraud Alert Request', uses: 156, success_rate: 95, ai_optimized: true }
      ]
    },
    {
      category: 'Creditors',
      templates: [
        { name: 'Goodwill Letter', uses: 890, success_rate: 45, ai_optimized: true },
        { name: 'Pay for Delete Offer', uses: 678, success_rate: 62, ai_optimized: true },
        { name: 'Direct Dispute', uses: 456, success_rate: 58, ai_optimized: false },
        { name: 'Hardship Request', uses: 345, success_rate: 38, ai_optimized: true }
      ]
    },
    {
      category: 'Collectors',
      templates: [
        { name: 'Debt Validation', uses: 1456, success_rate: 85, ai_optimized: true },
        { name: 'Cease and Desist', uses: 789, success_rate: 92, ai_optimized: true },
        { name: 'FDCPA Violation Notice', uses: 234, success_rate: 78, ai_optimized: false },
        { name: 'Settlement Offer', uses: 567, success_rate: 55, ai_optimized: true }
      ]
    }
  ];

  const aiSuggestions = [
    {
      type: 'optimization',
      title: 'Improve Dispute Success Rate',
      description: 'Add specific FCRA citations to increase removal probability by 23%',
      impact: 'high',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      type: 'timing',
      title: 'Optimal Send Window',
      description: 'Send disputes on Tuesday mornings for 15% faster processing',
      impact: 'medium',
      icon: <Clock className="w-5 h-5" />
    },
    {
      type: 'strategy',
      title: 'Staggered Approach Recommended',
      description: 'Split disputes across bureaus for better success rates',
      impact: 'high',
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      awaiting: 'bg-purple-100 text-purple-800',
      negotiating: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      dispute: <Shield className="w-5 h-5" />,
      goodwill: <Award className="w-5 h-5" />,
      validation: <CheckCircle className="w-5 h-5" />,
      'pay-for-delete': <DollarSign className="w-5 h-5" />,
      'cease-desist': <XCircle className="w-5 h-5" />,
      mov: <Search className="w-5 h-5" />
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         letter.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || letter.type === filterCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && ['sent', 'pending', 'awaiting', 'negotiating'].includes(letter.status)) ||
                      (activeTab === 'drafts' && letter.status === 'draft') ||
                      (activeTab === 'completed' && letter.status === 'completed');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const CreateLetterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Create New Letter</h2>
              <p className="text-gray-600 mt-1">AI-powered letter generation with proven templates</p>
            </div>
            <button onClick={() => setShowCreateModal(false)}>
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Letter Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Letter Type</label>
            <div className="grid grid-cols-3 gap-4">
              {['Dispute', 'Goodwill', 'Validation', 'Pay for Delete', 'Cease & Desist', 'MOV'].map((type) => (
                <button
                  key={type}
                  className="p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex flex-col items-center">
                    {getTypeIcon(type.toLowerCase().replace(/[& ]/g, '-'))}
                    <span className="mt-2 font-medium">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Client Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
            <select className="w-full p-3 border rounded-lg">
              <option>Choose a client...</option>
              <option>John Smith</option>
              <option>Sarah Johnson</option>
              <option>Michael Brown</option>
              <option>Emma Wilson</option>
            </select>
          </div>

          {/* Bureau/Recipient */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-3 border rounded-lg hover:border-blue-500">Equifax</button>
              <button className="p-3 border rounded-lg hover:border-blue-500">Experian</button>
              <button className="p-3 border rounded-lg hover:border-blue-500">TransUnion</button>
            </div>
          </div>

          {/* Items to Dispute */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Items to Include</label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {[
                'Collection Account #4521 - Portfolio Recovery',
                'Late Payment 03/2023 - Capital One',
                'Charge-off - Chase Bank',
                'Medical Collection - $1,250',
                'Student Loan Default - Navient'
              ].map((item, index) => (
                <label key={index} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">AI Recommendations</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>Include FCRA Section 611 citation for 23% higher success rate</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>Dispute no more than 5 items per letter for optimal results</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <span>Send via certified mail for legal documentation</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Save as Draft
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TemplateLibraryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Letter Template Library</h2>
              <p className="text-gray-600 mt-1">Proven templates with success metrics</p>
            </div>
            <button onClick={() => setShowTemplateModal(false)}>
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {letterTemplates.map((category) => (
            <div key={category.category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
              <div className="grid grid-cols-1 gap-4">
                {category.templates.map((template) => (
                  <div key={template.name} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.ai_optimized && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Optimized
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {template.uses} uses
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {template.success_rate}% success
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                          <Copy className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dispute Letters</h1>
            <p className="text-gray-600 mt-1">AI-powered letter generation and tracking</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Template Library
            </button>
            <button 
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center"
            >
              <Brain className="w-5 h-5 mr-2" />
              AI Assistant
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Letter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Letters</p>
                <p className="text-2xl font-bold mt-1">248</p>
                <p className="text-xs text-green-600 mt-1">+12% this month</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold mt-1">76%</p>
                <p className="text-xs text-green-600 mt-1">+5% vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Removed</p>
                <p className="text-2xl font-bold mt-1">142</p>
                <p className="text-xs text-blue-600 mt-1">$45K+ saved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Response</p>
                <p className="text-2xl font-bold mt-1">18</p>
                <p className="text-xs text-orange-600 mt-1">3 overdue</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="font-semibold text-gray-900">AI Strategy Assistant</h3>
            </div>
            <button onClick={() => setShowAIAssistant(false)}>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${suggestion.impact === 'high' ? 'bg-red-100' : 'bg-yellow-100'} mr-3`}>
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">Apply →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="border-b px-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              {['all', 'active', 'drafts', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab} {tab === 'active' && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">18</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search letters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="dispute">Disputes</option>
                <option value="goodwill">Goodwill</option>
                <option value="validation">Validation</option>
                <option value="pay-for-delete">Pay for Delete</option>
                <option value="cease-desist">Cease & Desist</option>
              </select>
              <div className="flex border rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedLetters.length > 0 && (
          <div className="bg-blue-50 px-6 py-3 flex justify-between items-center">
            <span className="text-blue-700">{selectedLetters.length} letters selected</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">
                <Send className="w-4 h-4 inline mr-1" /> Send
              </button>
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">
                <Archive className="w-4 h-4 inline mr-1" /> Archive
              </button>
              <button className="px-3 py-1 bg-white border rounded hover:bg-gray-50">
                <Tag className="w-4 h-4 inline mr-1" /> Tag
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Letters Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredLetters.map((letter) => (
                <div key={letter.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-3"
                        checked={selectedLetters.includes(letter.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLetters([...selectedLetters, letter.id]);
                          } else {
                            setSelectedLetters(selectedLetters.filter(id => id !== letter.id));
                          }
                        }}
                      />
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        {getTypeIcon(letter.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{letter.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Client: {letter.client}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(letter.status)}`}>
                      {letter.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {letter.bureau && (
                      <div className="flex items-center text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        {letter.bureau}
                      </div>
                    )}
                    {letter.sentDate && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Sent: {letter.sentDate}
                      </div>
                    )}
                    {letter.items && (
                      <div className="flex items-start text-gray-600">
                        <FileText className="w-4 h-4 mr-2 mt-0.5" />
                        <div>
                          {letter.items.map((item, i) => (
                            <div key={i} className="text-xs">{item}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {letter.ai_confidence && (
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-purple-600" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              letter.ai_confidence >= 80 ? 'bg-green-500' : 
                              letter.ai_confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${letter.ai_confidence}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">{letter.ai_confidence}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      {letter.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Send className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-2">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left py-3">Type</th>
                  <th className="text-left py-3">Title</th>
                  <th className="text-left py-3">Client</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Sent Date</th>
                  <th className="text-left py-3">AI Score</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <input type="checkbox" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        {getTypeIcon(letter.type)}
                      </div>
                    </td>
                    <td className="py-3 font-medium">{letter.title}</td>
                    <td className="py-3">{letter.client}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(letter.status)}`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="py-3">{letter.sentDate || '-'}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              letter.ai_confidence >= 80 ? 'bg-green-500' : 
                              letter.ai_confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${letter.ai_confidence}%` }}
                          />
                        </div>
                        <span className="text-xs">{letter.ai_confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateLetterModal />}
      {showTemplateModal && <TemplateLibraryModal />}
    </div>
  );
};

// ...existing code...
export default Letters;