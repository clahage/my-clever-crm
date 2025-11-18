// src/pages/Support.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Video, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  PlayCircle,
  Book,
  Users,
  Shield,
  Zap,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  Send,
  Paperclip,
  Download,
  ExternalLink,
  User,
  Calendar,
  Tag,
  TrendingUp,
  Award
} from 'lucide-react';

const Support = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    attachments: []
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Mock data for tickets
  const [tickets] = useState([
    {
      id: 'TCK-001',
      subject: 'Unable to generate dispute letters',
      status: 'in-progress',
      priority: 'high',
      created: '2024-01-15',
      lastUpdate: '2024-01-16',
      agent: 'Sarah M.'
    },
    {
      id: 'TCK-002',
      subject: 'Question about affiliate commission',
      status: 'resolved',
      priority: 'medium',
      created: '2024-01-14',
      lastUpdate: '2024-01-15',
      agent: 'John D.'
    },
    {
      id: 'TCK-003',
      subject: 'Need help with credit monitoring setup',
      status: 'open',
      priority: 'low',
      created: '2024-01-16',
      lastUpdate: '2024-01-16',
      agent: 'Pending'
    }
  ]);

  // Knowledge base articles
  const knowledgeBaseArticles = [
    {
      id: 1,
      category: 'Getting Started',
      title: 'How to Set Up Your CleverCRM Account',
      views: 1234,
      helpful: 89,
      content: 'Step-by-step guide to setting up your account and configuring initial settings...',
      tags: ['setup', 'account', 'beginner']
    },
    {
      id: 2,
      category: 'Dispute Management',
      title: 'Creating and Sending Dispute Letters',
      views: 987,
      helpful: 92,
      content: 'Learn how to create, customize, and send dispute letters to credit bureaus...',
      tags: ['disputes', 'letters', 'credit bureaus']
    },
    {
      id: 3,
      category: 'Client Management',
      title: 'Managing Client Profiles and Documents',
      views: 756,
      helpful: 85,
      content: 'Best practices for organizing client information and documents...',
      tags: ['clients', 'documents', 'organization']
    },
    {
      id: 4,
      category: 'Billing & Payments',
      title: 'Setting Up Automatic Billing',
      views: 645,
      helpful: 90,
      content: 'Configure automatic billing and payment processing for your clients...',
      tags: ['billing', 'payments', 'automation']
    },
    {
      id: 5,
      category: 'Credit Monitoring',
      title: 'Understanding Credit Score Changes',
      views: 1456,
      helpful: 94,
      content: 'How to interpret credit score fluctuations and explain them to clients...',
      tags: ['credit score', 'monitoring', 'analysis']
    },
    {
      id: 6,
      category: 'Business Credit',
      title: 'Building Business Credit Profiles',
      views: 523,
      helpful: 88,
      content: 'Guide to establishing and improving business credit for your clients...',
      tags: ['business credit', 'tradelines', 'D&B']
    }
  ];

  // FAQ data
  const faqs = [
    {
      category: 'Account & Billing',
      questions: [
        {
          q: 'How do I upgrade my subscription plan?',
          a: 'To upgrade your plan, go to Settings > Billing > Change Plan. Select your desired plan and follow the payment prompts. Changes take effect immediately.'
        },
        {
          q: 'Can I cancel my subscription anytime?',
          a: 'Yes, you can cancel your subscription at any time from the Billing settings. Your access will continue until the end of your current billing period.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We offer a 14-day money-back guarantee for new subscriptions. After that, refunds are evaluated on a case-by-case basis.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'Why are my dispute letters not generating?',
          a: 'Ensure all required client information is filled in, including SSN, addresses, and dispute items. Check your template settings and make sure you have an active subscription.'
        },
        {
          q: 'How do I import client data from another CRM?',
          a: 'Go to Settings > Import/Export > Import Data. Upload your CSV file following our template format. The system will map fields automatically.'
        },
        {
          q: 'Is my data backed up automatically?',
          a: 'Yes, we perform automatic backups every 24 hours. You can also create manual backups anytime from Settings > Data Management.'
        }
      ]
    },
    {
      category: 'Features & Functionality',
      questions: [
        {
          q: 'How many dispute letters can I send per month?',
          a: 'The number of dispute letters depends on your plan. Basic: 50/month, Professional: 200/month, Enterprise: Unlimited.'
        },
        {
          q: 'Can I white-label the client portal?',
          a: 'Yes, white-labeling is available on Professional and Enterprise plans. You can customize logos, colors, and domain.'
        },
        {
          q: 'Does CleverCRM integrate with credit monitoring services?',
          a: 'Yes, we integrate with IdentityIQ, SmartCredit, and MyScoreIQ. Set up integrations in Settings > Integrations.'
        }
      ]
    }
  ];

  // Video tutorials
  const videoTutorials = [
    {
      id: 1,
      title: 'Getting Started with CleverCRM',
      duration: '12:45',
      category: 'Basics',
      thumbnail: '🎬',
      views: 2341,
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Advanced Dispute Letter Strategies',
      duration: '18:30',
      category: 'Disputes',
      thumbnail: '📝',
      views: 1876,
      level: 'Advanced'
    },
    {
      id: 3,
      title: 'Setting Up Automated Workflows',
      duration: '15:20',
      category: 'Automation',
      thumbnail: '⚙️',
      views: 1543,
      level: 'Intermediate'
    },
    {
      id: 4,
      title: 'Client Portal Walkthrough',
      duration: '10:15',
      category: 'Clients',
      thumbnail: '👥',
      views: 1234,
      level: 'Beginner'
    },
    {
      id: 5,
      title: 'Credit Report Analysis Techniques',
      duration: '22:10',
      category: 'Credit Analysis',
      thumbnail: '📊',
      views: 2109,
      level: 'Intermediate'
    },
    {
      id: 6,
      title: 'Growing Your Credit Repair Business',
      duration: '25:30',
      category: 'Business Growth',
      thumbnail: '📈',
      views: 3456,
      level: 'All Levels'
    }
  ];

  // Support tiers
  const supportTiers = [
    {
      name: 'Basic Support',
      icon: <HelpCircle className="w-8 h-8" />,
      features: [
        'Email support (48-hour response)',
        'Access to knowledge base',
        'Community forum access',
        'Basic video tutorials'
      ],
      price: 'Included with all plans',
      color: 'blue'
    },
    {
      name: 'Priority Support',
      icon: <Zap className="w-8 h-8" />,
      features: [
        'Priority email (12-hour response)',
        'Live chat support (business hours)',
        'Phone support (scheduled calls)',
        'Advanced video tutorials',
        'Dedicated account manager'
      ],
      price: '$49/month',
      color: 'purple'
    },
    {
      name: 'Enterprise Support',
      icon: <Shield className="w-8 h-8" />,
      features: [
        '24/7 phone and chat support',
        'Dedicated success manager',
        'Custom training sessions',
        'Priority feature requests',
        'SLA guarantee',
        'Quarterly business reviews'
      ],
      price: 'Custom pricing',
      color: 'yellow'
    }
  ];

  // Filter knowledge base articles
  const filteredArticles = knowledgeBaseArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'open': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Ticket submitted:', ticketForm);
    // Reset form
    setTicketForm({
      subject: '',
      category: '',
      priority: 'medium',
      message: '',
      attachments: []
    });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-xl opacity-90 mb-6">
          Get help, find answers, and connect with our support team
        </p>
        
        {/* Quick Search */}
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-75">Active Tickets</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">24hr</div>
            <div className="text-sm opacity-75">Avg Response</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm opacity-75">Satisfaction</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="text-2xl font-bold">150+</div>
            <div className="text-sm opacity-75">Help Articles</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <HelpCircle className="w-4 h-4" /> },
              { id: 'tickets', label: 'My Tickets', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'knowledge', label: 'Knowledge Base', icon: <Book className="w-4 h-4" /> },
              { id: 'faq', label: 'FAQs', icon: <FileText className="w-4 h-4" /> },
              { id: 'videos', label: 'Video Tutorials', icon: <Video className="w-4 h-4" /> },
              { id: 'contact', label: 'Contact Us', icon: <Mail className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <MessageSquare className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Submit a Ticket</h3>
                  <p className="text-sm opacity-90">Get help from our support team</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <Book className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Browse Articles</h3>
                  <p className="text-sm opacity-90">Find answers in our knowledge base</p>
                </button>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                  <Phone className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Live Chat</h3>
                  <p className="text-sm opacity-90">Chat with us Mon-Fri 9AM-6PM EST</p>
                  <button className="mt-3 bg-white/20 backdrop-blur px-4 py-2 rounded text-sm font-medium hover:bg-white/30 transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>

              {/* Support Tiers */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Support Plans</h3>
                <div className="grid grid-cols-3 gap-4">
                  {supportTiers.map((tier, index) => (
                    <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className={`text-${tier.color}-600 mb-4`}>{tier.icon}</div>
                      <h4 className="font-semibold text-lg mb-2">{tier.name}</h4>
                      <p className="text-2xl font-bold mb-4">{tier.price}</p>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {tier.name !== 'Basic Support' && (
                        <button className={`w-full mt-6 bg-${tier.color}-600 text-white py-2 rounded-lg font-medium hover:bg-${tier.color}-700 transition-colors`}>
                          Upgrade Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Articles */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Popular Help Articles</h3>
                <div className="grid grid-cols-2 gap-4">
                  {knowledgeBaseArticles.slice(0, 4).map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {article.views} views
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {article.helpful}% helpful
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* New Ticket Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Submit New Ticket</h3>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="features">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <div className="flex space-x-4">
                      {['low', 'medium', 'high'].map((priority) => (
                        <label key={priority} className="flex items-center">
                          <input
                            type="radio"
                            name="priority"
                            value={priority}
                            checked={ticketForm.priority === priority}
                            onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                            className="mr-2"
                          />
                          <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(priority)}`}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach files
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Tickets */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Tickets</h3>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mt-1">{ticket.subject}</h4>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Created: {ticket.created}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Updated: {ticket.lastUpdate}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {ticket.agent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Getting Started">Getting Started</option>
                  <option value="Dispute Management">Dispute Management</option>
                  <option value="Client Management">Client Management</option>
                  <option value="Billing & Payments">Billing & Payments</option>
                  <option value="Credit Monitoring">Credit Monitoring</option>
                  <option value="Business Credit">Business Credit</option>
                </select>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {article.views} views
                      </span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {article.helpful}% found helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Load more articles →
                </button>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{category.category}</h3>
                  <div className="space-y-3">
                    {category.questions.map((item, questionIndex) => {
                      const isExpanded = expandedFAQ === `${categoryIndex}-${questionIndex}`;
                      return (
                        <div key={questionIndex} className="border rounded-lg">
                          <button
                            onClick={() => setExpandedFAQ(isExpanded ? null : `${categoryIndex}-${questionIndex}`)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">{item.q}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-5 pb-4 text-gray-600 border-t">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Still Need Help */}
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* Video Tutorials Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Featured Video */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="text-sm font-medium">Featured Tutorial</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Getting Started with CleverCRM</h3>
                    <p className="opacity-90 mb-4">Learn the basics and set up your account in minutes</p>
                    <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Watch Now
                    </button>
                  </div>
                  <div className="text-6xl">🎬</div>
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-3 gap-4">
                {videoTutorials.map((video) => (
                  <div key={video.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="bg-gray-100 h-32 flex items-center justify-center text-4xl">
                      {video.thumbnail}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {video.category}
                        </span>
                        <span className="text-xs text-gray-500">{video.duration}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{video.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {video.views} views
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {video.level}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['Basics', 'Disputes', 'Automation', 'Clients', 'Billing', 'Advanced', 'Business Growth', 'Integrations'].map((cat) => (
                    <button
                      key={cat}
                      className="border rounded-lg p-3 text-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Contact Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Send us a message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Get in touch</h3>
                  
                  {/* Contact Methods */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Email Support</div>
                        <div className="text-sm text-gray-600">support@clevercrm.com</div>
                        <div className="text-xs text-gray-500 mt-1">Response time: 24-48 hours</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Live Chat</div>
                        <div className="text-sm text-gray-600">Available Mon-Fri, 9AM-6PM EST</div>
                        <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                          Start chat now →
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Phone Support</div>
                        <div className="text-sm text-gray-600">1-800-CLEVER-1</div>
                        <div className="text-xs text-gray-500 mt-1">Priority support only</div>
                      </div>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Support Hours</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium text-gray-900">9:00 AM - 6:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium text-gray-900">10:00 AM - 4:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium text-gray-900">Closed</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Support */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-900">Emergency Support</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      For critical issues affecting your business operations, Enterprise customers can contact our 24/7 emergency hotline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Chat Widget Placeholder */}
              <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-blue-600 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;