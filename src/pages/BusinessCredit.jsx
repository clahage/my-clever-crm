// src/pages/BusinessCredit.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  CreditCard, 
  FileText,
  DollarSign,
  Shield,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Download,
  Calculator,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  Globe,
  Lock,
  Zap,
  Phone,
  Mail
} from 'lucide-react';

const BusinessCredit = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTradeline, setSelectedTradeline] = useState(null);
  const [creditScore, setCreditScore] = useState({ paydex: 0, experian: 0, equifax: 0 });
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Business Credit Score Ranges
  const scoreRanges = {
    paydex: { min: 0, max: 100, good: 80, excellent: 90 },
    experian: { min: 0, max: 100, good: 76, excellent: 90 },
    equifax: { min: 101, max: 992, good: 700, excellent: 750 }
  };

  // Available Tradelines
  const tradelines = [
    {
      id: 1,
      vendor: 'Uline',
      category: 'Shipping Supplies',
      reportingTo: ['Dun & Bradstreet', 'Experian', 'Equifax'],
      netTerms: 'Net 30',
      personalGuarantee: false,
      minPurchase: 50,
      approvalRate: '95%',
      tier: 'starter'
    },
    {
      id: 2,
      vendor: 'Grainger',
      category: 'Industrial Supplies',
      reportingTo: ['Dun & Bradstreet', 'Experian'],
      netTerms: 'Net 30',
      personalGuarantee: false,
      minPurchase: 100,
      approvalRate: '90%',
      tier: 'starter'
    },
    {
      id: 3,
      vendor: 'Quill',
      category: 'Office Supplies',
      reportingTo: ['Dun & Bradstreet', 'Equifax'],
      netTerms: 'Net 30',
      personalGuarantee: false,
      minPurchase: 100,
      approvalRate: '93%',
      tier: 'starter'
    },
    {
      id: 4,
      vendor: 'Home Depot',
      category: 'Building Materials',
      reportingTo: ['Dun & Bradstreet'],
      netTerms: 'Net 30/60',
      personalGuarantee: true,
      minPurchase: 300,
      approvalRate: '75%',
      tier: 'advanced'
    },
    {
      id: 5,
      vendor: 'Amazon Business',
      category: 'General Supplies',
      reportingTo: ['Dun & Bradstreet'],
      netTerms: 'Net 30',
      personalGuarantee: false,
      minPurchase: 150,
      approvalRate: '85%',
      tier: 'intermediate'
    },
    {
      id: 6,
      vendor: 'BP/Gulf',
      category: 'Fleet Gas Cards',
      reportingTo: ['Dun & Bradstreet', 'Experian'],
      netTerms: 'Net 30',
      personalGuarantee: true,
      minPurchase: 500,
      approvalRate: '70%',
      tier: 'advanced'
    }
  ];

  // Business Credit Building Steps
  const creditBuildingSteps = [
    {
      step: 1,
      title: 'Entity Setup',
      description: 'Establish your business foundation',
      tasks: [
        'Form LLC or Corporation',
        'Obtain EIN from IRS',
        'Open business bank account',
        'Get business license',
        'Register with Secretary of State'
      ],
      timeframe: '1-2 weeks',
      status: 'completed'
    },
    {
      step: 2,
      title: 'Business Credibility',
      description: 'Build your business presence',
      tasks: [
        'Get business phone number',
        'Create professional website',
        'Setup business email (@yourdomain.com)',
        'Get business address (no P.O. Box)',
        'List in 411 directories'
      ],
      timeframe: '2-3 weeks',
      status: 'in-progress'
    },
    {
      step: 3,
      title: 'DUNS Number',
      description: 'Register with Dun & Bradstreet',
      tasks: [
        'Apply for DUNS number (free)',
        'Verify business information',
        'Wait for activation',
        'Check initial Paydex score',
        'Update company profile'
      ],
      timeframe: '2-4 weeks',
      status: 'pending'
    },
    {
      step: 4,
      title: 'Starter Tradelines',
      description: 'Establish initial trade credit',
      tasks: [
        'Apply for Net 30 accounts',
        'Make initial purchases',
        'Pay early or on time',
        'Build payment history',
        'Monitor reporting'
      ],
      timeframe: '3-6 months',
      status: 'pending'
    },
    {
      step: 5,
      title: 'Credit Expansion',
      description: 'Scale your credit profile',
      tasks: [
        'Add revolving credit accounts',
        'Apply for business credit cards',
        'Increase credit limits',
        'Diversify vendor types',
        'Maintain low utilization'
      ],
      timeframe: '6-12 months',
      status: 'pending'
    }
  ];

  // FAQs
  const faqs = [
    {
      question: 'What is a Paydex score?',
      answer: 'A Paydex score is Dun & Bradstreet\'s business credit scoring system that ranges from 1-100. It measures how promptly a business pays its bills. A score of 80 or higher is considered good and means you pay on time. Scores above 80 indicate early payment.'
    },
    {
      question: 'Do I need a personal guarantee?',
      answer: 'Initially, no. Many starter vendors offer Net 30 terms without personal guarantees. As you build business credit and apply for larger credit lines or loans, personal guarantees may be required until your business credit is well-established.'
    },
    {
      question: 'How long does it take to build business credit?',
      answer: 'You can establish initial tradelines within 30-60 days, but building a strong business credit profile typically takes 6-12 months of consistent, on-time payments. A robust profile with multiple tradelines and high scores usually takes 12-24 months.'
    },
    {
      question: 'What\'s the difference between Net 30 and Net 60?',
      answer: 'Net 30 means payment is due within 30 days of the invoice date. Net 60 gives you 60 days to pay. Starting with Net 30 accounts is easier for approval, and paying early (within 10 days) can boost your Paydex score above 80.'
    },
    {
      question: 'Which credit bureaus matter for business?',
      answer: 'The three main business credit bureaus are Dun & Bradstreet (Paydex), Experian Business, and Equifax Business. Each has different scoring models. Most lenders check D&B first, but having good scores with all three provides the best opportunities.'
    }
  ];

  // Calculate score status
  const getScoreStatus = (score, type) => {
    const range = scoreRanges[type];
    if (score >= range.excellent) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= range.good) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score > range.min) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Building', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  // Simulate score loading
  useEffect(() => {
    setTimeout(() => {
      setCreditScore({ paydex: 82, experian: 78, equifax: 720 });
    }, 1000);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Business Credit Builder</h1>
        </div>
        <p className="text-gray-600">Build strong business credit to access funding without personal guarantees</p>
      </div>

      {/* Credit Score Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Dun & Bradstreet</p>
              <p className="text-3xl font-bold text-gray-900">{creditScore.paydex || '--'}</p>
              <p className={`text-sm font-medium ${getScoreStatus(creditScore.paydex, 'paydex').color}`}>
                {getScoreStatus(creditScore.paydex, 'paydex').label}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${creditScore.paydex}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Paydex Score (0-100)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Experian Business</p>
              <p className="text-3xl font-bold text-gray-900">{creditScore.experian || '--'}</p>
              <p className={`text-sm font-medium ${getScoreStatus(creditScore.experian, 'experian').color}`}>
                {getScoreStatus(creditScore.experian, 'experian').label}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <PieChart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${creditScore.experian}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Intelliscore Plus (0-100)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Equifax Business</p>
              <p className="text-3xl font-bold text-gray-900">{creditScore.equifax || '--'}</p>
              <p className={`text-sm font-medium ${getScoreStatus(creditScore.equifax, 'equifax').color}`}>
                {getScoreStatus(creditScore.equifax, 'equifax').label}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((creditScore.equifax - 101) / 891) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Business Credit Score (101-992)</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tradelines')}
            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'tradelines' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tradelines
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'steps' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Building Steps
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'resources' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Shield className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Personal Guarantee</h3>
              <p className="text-sm text-gray-600">Access funding without risking personal assets</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <DollarSign className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Higher Credit Limits</h3>
              <p className="text-sm text-gray-600">10-100x higher than personal credit cards</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Better Terms</h3>
              <p className="text-sm text-gray-600">Lower rates and longer payment terms</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Award className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Business Growth</h3>
              <p className="text-sm text-gray-600">Build credibility with suppliers and lenders</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Build Business Credit?</h2>
            <p className="mb-6 text-blue-100">Get your free business credit assessment and personalized roadmap</p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Free Assessment
              </button>
              <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Consultation
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {expandedFaq === index && (
                    <p className="mt-3 text-gray-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tradelines' && (
        <div className="space-y-6">
          {/* Tradeline Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Starter Vendors</h3>
              <p className="text-sm text-green-700">No personal guarantee required</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Intermediate</h3>
              <p className="text-sm text-blue-700">Some business history required</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Advanced</h3>
              <p className="text-sm text-purple-700">Established business credit needed</p>
            </div>
          </div>

          {/* Tradeline List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Tradelines</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {tradelines.map((tradeline) => (
                <div key={tradeline.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{tradeline.vendor}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tradeline.tier === 'starter' ? 'bg-green-100 text-green-700' :
                          tradeline.tier === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {tradeline.tier}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="font-medium">{tradeline.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Terms:</span>
                          <p className="font-medium">{tradeline.netTerms}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Min Purchase:</span>
                          <p className="font-medium">${tradeline.minPurchase}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Approval Rate:</span>
                          <p className="font-medium text-green-600">{tradeline.approvalRate}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tradeline.reportingTo.map((bureau) => (
                          <span key={bureau} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            Reports to {bureau}
                          </span>
                        ))}
                        {!tradeline.personalGuarantee && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            No PG Required
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Overall Completion</span>
              <span className="text-sm font-semibold text-gray-900">40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Building Steps */}
          <div className="space-y-4">
            {creditBuildingSteps.map((step, index) => (
              <div key={step.step} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                     step.status === 'in-progress' ? <Clock className="h-6 w-6" /> :
                     <span className="font-semibold">{step.step}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <span className="text-sm text-gray-500">{step.timeframe}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <div className="space-y-2">
                      {step.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            step.status === 'completed' ? 'border-green-500 bg-green-500' :
                            'border-gray-300'
                          }`}>
                            {step.status === 'completed' && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className={`text-sm ${
                            step.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-700'
                          }`}>
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>
                    {step.status === 'in-progress' && (
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Continue Setup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Business Credit Guide</h3>
              <p className="text-sm text-gray-600 mb-4">Complete guide to building business credit from scratch</p>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Calculator className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Credit Calculator</h3>
              <p className="text-sm text-gray-600 mb-4">Calculate potential credit limits and funding amounts</p>
              <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                <ArrowRight className="h-4 w-4" />
                Use Calculator
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <BookOpen className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Vendor Directory</h3>
              <p className="text-sm text-gray-600 mb-4">Complete list of business credit vendors and requirements</p>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
                <ArrowRight className="h-4 w-4" />
                Browse Vendors
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Users className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">1-on-1 Consultation</h3>
              <p className="text-sm text-gray-600 mb-4">Get personalized guidance from credit experts</p>
              <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
                <Phone className="h-4 w-4" />
                Schedule Call
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Zap className="h-8 w-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Quick Start Package</h3>
              <p className="text-sm text-gray-600 mb-4">Done-for-you business credit building service</p>
              <button className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium">
                <ArrowRight className="h-4 w-4" />
                Learn More
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Mail className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Course</h3>
              <p className="text-sm text-gray-600 mb-4">7-day email course on business credit fundamentals</p>
              <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                <ArrowRight className="h-4 w-4" />
                Sign Up Free
              </button>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Expert Help?</h2>
            <p className="mb-6 text-gray-300">Our business credit specialists are here to help you build a strong credit profile</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Call Us</p>
                  <p className="font-semibold">(800) 555-0123</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">business@speedycredit.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Hours</p>
                  <p className="font-semibold">Mon-Fri 9AM-6PM PST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCredit;