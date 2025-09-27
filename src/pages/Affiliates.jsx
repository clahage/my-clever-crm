// src/pages/Affiliates.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Link2, 
  Share2,
  Download,
  Upload,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Trophy,
  Gift,
  Zap,
  Shield,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  FileText,
  Video,
  Image,
  Megaphone,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Settings,
  HelpCircle,
  Copy,
  ExternalLink,
  QrCode,
  Smartphone,
  Monitor,
  MousePointer,
  Eye,
  UserPlus,
  UserCheck,
  Package,
  Rocket,
  Crown,
  Diamond,
  Gem
} from 'lucide-react';

const Affiliates = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState('silver');

  // Enhanced mock data
  const [affiliateData] = useState({
    tier: 'Gold',
    tierProgress: 75,
    nextTier: 'Platinum',
    remainingForNextTier: 25,
    totalEarnings: 45678.90,
    currentBalance: 3456.78,
    pendingCommissions: 1234.56,
    lifetimeReferrals: 234,
    activeReferrals: 89,
    conversionRate: 34.5,
    averageOrderValue: 297.50,
    recurringRevenue: 8900.00,
    lastPayout: '2024-01-15',
    nextPayout: '2024-02-15',
    affiliateId: 'AFF-2024-0042',
    joinDate: '2023-06-15',
    performanceScore: 92
  });

  // Referral links with tracking
  const referralLinks = [
    {
      id: 1,
      name: 'Main Landing Page',
      url: 'https://clevercrm.com/ref/john2024',
      clicks: 1234,
      conversions: 42,
      conversionRate: 3.4,
      revenue: 12460.00,
      qrCode: true,
      shortUrl: 'bit.ly/clevercrm-j24'
    },
    {
      id: 2,
      name: 'Special Offer - 30% Off',
      url: 'https://clevercrm.com/promo/newyear?ref=john2024',
      clicks: 567,
      conversions: 28,
      conversionRate: 4.9,
      revenue: 8340.00,
      qrCode: true,
      shortUrl: 'bit.ly/clever30-j24'
    },
    {
      id: 3,
      name: 'Business Credit Tool',
      url: 'https://clevercrm.com/business-credit?ref=john2024',
      clicks: 890,
      conversions: 15,
      conversionRate: 1.7,
      revenue: 4470.00,
      qrCode: true,
      shortUrl: 'bit.ly/clever-biz-j24'
    }
  ];

  // Team members (for multi-tier affiliates)
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      tier: 'Silver',
      joined: '2023-09-15',
      referrals: 23,
      earnings: 3450.00,
      status: 'active',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Mike Chen',
      tier: 'Bronze',
      joined: '2023-11-20',
      referrals: 12,
      earnings: 1780.00,
      status: 'active',
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Emily Davis',
      tier: 'Silver',
      joined: '2023-10-05',
      referrals: 31,
      earnings: 4620.00,
      status: 'active',
      lastActive: '5 minutes ago'
    },
    {
      id: 4,
      name: 'James Wilson',
      tier: 'Bronze',
      joined: '2024-01-02',
      referrals: 5,
      earnings: 745.00,
      status: 'pending',
      lastActive: '3 days ago'
    }
  ];

  // Commission tiers with detailed benefits
  const commissionTiers = [
    {
      name: 'Bronze',
      icon: <Package className="w-8 h-8" />,
      color: 'orange',
      requirements: '0-10 active referrals',
      commission: '20%',
      recurringCommission: '10%',
      teamCommission: '0%',
      benefits: [
        'Basic marketing materials',
        'Monthly newsletter',
        'Email support',
        'Basic analytics dashboard'
      ],
      monthlyTarget: 5,
      bonus: '$50'
    },
    {
      name: 'Silver',
      icon: <Shield className="w-8 h-8" />,
      color: 'gray',
      requirements: '11-50 active referrals',
      commission: '25%',
      recurringCommission: '15%',
      teamCommission: '5%',
      benefits: [
        'Premium marketing materials',
        'Bi-weekly webinars',
        'Priority email support',
        'Advanced analytics',
        'Custom referral links',
        'Social media templates'
      ],
      monthlyTarget: 10,
      bonus: '$150'
    },
    {
      name: 'Gold',
      icon: <Crown className="w-8 h-8" />,
      color: 'yellow',
      requirements: '51-100 active referrals',
      commission: '30%',
      recurringCommission: '20%',
      teamCommission: '10%',
      benefits: [
        'All Silver benefits',
        'Weekly coaching calls',
        'Phone support',
        'Co-branded materials',
        'Lead generation tools',
        'Exclusive promotions',
        'Event invitations'
      ],
      monthlyTarget: 20,
      bonus: '$500',
      current: true
    },
    {
      name: 'Platinum',
      icon: <Star className="w-8 h-8" />,
      color: 'purple',
      requirements: '100+ active referrals',
      commission: '35%',
      recurringCommission: '25%',
      teamCommission: '15%',
      benefits: [
        'All Gold benefits',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom landing pages',
        'API access',
        'Quarterly strategy sessions',
        'VIP conference access',
        'Profit sharing eligible'
      ],
      monthlyTarget: 30,
      bonus: '$1000'
    }
  ];

  // Marketing materials
  const marketingMaterials = [
    {
      category: 'Social Media',
      items: [
        { name: 'Instagram Story Templates', type: 'image', downloads: 234, rating: 4.8, size: '12 MB' },
        { name: 'Facebook Ad Creatives', type: 'image', downloads: 189, rating: 4.6, size: '8 MB' },
        { name: 'LinkedIn Post Templates', type: 'document', downloads: 156, rating: 4.7, size: '3 MB' },
        { name: 'Twitter/X Thread Templates', type: 'document', downloads: 98, rating: 4.5, size: '1 MB' }
      ]
    },
    {
      category: 'Email Templates',
      items: [
        { name: 'Cold Outreach Sequence', type: 'document', downloads: 345, rating: 4.9, size: '2 MB' },
        { name: 'Nurture Campaign Series', type: 'document', downloads: 267, rating: 4.7, size: '3 MB' },
        { name: 'Product Launch Emails', type: 'document', downloads: 198, rating: 4.8, size: '2 MB' }
      ]
    },
    {
      category: 'Videos & Webinars',
      items: [
        { name: 'Product Demo Video', type: 'video', downloads: 456, rating: 4.9, size: '150 MB', duration: '12:30' },
        { name: 'Success Stories Compilation', type: 'video', downloads: 389, rating: 5.0, size: '200 MB', duration: '18:45' },
        { name: 'How Credit Repair Works', type: 'video', downloads: 512, rating: 4.8, size: '120 MB', duration: '15:20' }
      ]
    },
    {
      category: 'Print Materials',
      items: [
        { name: 'Business Cards Template', type: 'document', downloads: 123, rating: 4.6, size: '5 MB' },
        { name: 'Brochure Designs', type: 'document', downloads: 167, rating: 4.7, size: '15 MB' },
        { name: 'Flyer Templates', type: 'document', downloads: 201, rating: 4.5, size: '10 MB' }
      ]
    }
  ];

  // Performance metrics
  const performanceMetrics = {
    daily: [
      { date: 'Mon', clicks: 45, signups: 3, conversions: 2, revenue: 594 },
      { date: 'Tue', clicks: 52, signups: 4, conversions: 3, revenue: 891 },
      { date: 'Wed', clicks: 38, signups: 2, conversions: 1, revenue: 297 },
      { date: 'Thu', clicks: 61, signups: 5, conversions: 4, revenue: 1188 },
      { date: 'Fri', clicks: 73, signups: 6, conversions: 5, revenue: 1485 },
      { date: 'Sat', clicks: 29, signups: 2, conversions: 1, revenue: 297 },
      { date: 'Sun', clicks: 34, signups: 3, conversions: 2, revenue: 594 }
    ],
    sources: [
      { name: 'Facebook', value: 35, color: '#1877f2' },
      { name: 'Instagram', value: 25, color: '#e4405f' },
      { name: 'Email', value: 20, color: '#ea4335' },
      { name: 'LinkedIn', value: 15, color: '#0077b5' },
      { name: 'Direct', value: 5, color: '#34a853' }
    ]
  };

  // Leaderboard
  const leaderboard = [
    { rank: 1, name: 'Michael Roberts', tier: 'Platinum', referrals: 156, earnings: 23450, trend: 'up', change: 12 },
    { rank: 2, name: 'Jessica Lee', tier: 'Platinum', referrals: 142, earnings: 21200, trend: 'up', change: 8 },
    { rank: 3, name: 'David Kim', tier: 'Gold', referrals: 98, earnings: 14700, trend: 'down', change: -3 },
    { rank: 4, name: 'You', tier: 'Gold', referrals: 89, earnings: 13350, trend: 'up', change: 15, highlight: true },
    { rank: 5, name: 'Amanda Chen', tier: 'Gold', referrals: 87, earnings: 13050, trend: 'up', change: 5 }
  ];

  // Campaigns
  const campaigns = [
    {
      id: 1,
      name: 'New Year Special 2024',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      discount: '30%',
      commission: '35%',
      clicks: 2341,
      conversions: 89,
      revenue: 26493,
      materials: 12
    },
    {
      id: 2,
      name: 'Valentine\'s Day Promo',
      status: 'scheduled',
      startDate: '2024-02-10',
      endDate: '2024-02-20',
      discount: '25%',
      commission: '30%',
      clicks: 0,
      conversions: 0,
      revenue: 0,
      materials: 8
    },
    {
      id: 3,
      name: 'Black Friday 2023',
      status: 'completed',
      startDate: '2023-11-24',
      endDate: '2023-11-27',
      discount: '50%',
      commission: '40%',
      clicks: 5678,
      conversions: 234,
      revenue: 69666,
      materials: 15
    }
  ];

  // Training resources
  const trainingResources = [
    {
      category: 'Getting Started',
      resources: [
        { title: 'Affiliate Program Overview', type: 'video', duration: '15 min', completed: true },
        { title: 'Setting Up Your First Campaign', type: 'article', duration: '10 min read', completed: true },
        { title: 'Understanding Commission Structure', type: 'video', duration: '12 min', completed: false }
      ]
    },
    {
      category: 'Advanced Strategies',
      resources: [
        { title: 'Facebook Ads Mastery', type: 'course', duration: '2.5 hours', completed: false },
        { title: 'Email Marketing Best Practices', type: 'video', duration: '45 min', completed: false },
        { title: 'SEO for Affiliates', type: 'article', duration: '20 min read', completed: false }
      ]
    }
  ];

  // Payment history
  const paymentHistory = [
    { id: 'PAY-001', date: '2024-01-15', amount: 3456.78, method: 'Bank Transfer', status: 'completed' },
    { id: 'PAY-002', date: '2023-12-15', amount: 2890.45, method: 'PayPal', status: 'completed' },
    { id: 'PAY-003', date: '2023-11-15', amount: 4123.90, method: 'Bank Transfer', status: 'completed' },
    { id: 'PAY-004', date: '2023-10-15', amount: 2567.30, method: 'Stripe', status: 'completed' }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Crown className="w-4 h-4 mr-1" />
                {affiliateData.tier} Tier
              </span>
            </div>
            <p className="text-xl opacity-90">
              Welcome back! You're in the top 5% of affiliates
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Performance Score: {affiliateData.performanceScore}/100</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Team Size: {teamMembers.length}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Member Since: {affiliateData.joinDate}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">${affiliateData.currentBalance.toLocaleString()}</div>
            <div className="text-sm opacity-75">Available Balance</div>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="mt-3 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Progress to {affiliateData.nextTier}</span>
            <span className="text-sm">{affiliateData.tierProgress}% Complete</span>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${affiliateData.tierProgress}%` }}
            />
          </div>
          <p className="text-xs mt-2 opacity-75">
            {affiliateData.remainingForNextTier} more referrals needed for {affiliateData.nextTier} tier
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <DollarSign className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">${(affiliateData.totalEarnings / 1000).toFixed(1)}K</div>
            <div className="text-xs opacity-75">Total Earnings</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Users className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{affiliateData.lifetimeReferrals}</div>
            <div className="text-xs opacity-75">Total Referrals</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <UserCheck className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{affiliateData.activeReferrals}</div>
            <div className="text-xs opacity-75">Active Clients</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <TrendingUp className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{affiliateData.conversionRate}%</div>
            <div className="text-xs opacity-75">Conversion Rate</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <CreditCard className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">${affiliateData.averageOrderValue}</div>
            <div className="text-xs opacity-75">Avg Order Value</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <Wallet className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">${(affiliateData.recurringRevenue / 1000).toFixed(1)}K</div>
            <div className="text-xs opacity-75">MRR Generated</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'links', label: 'Referral Links', icon: <Link2 className="w-4 h-4" /> },
              { id: 'team', label: 'My Team', icon: <Users className="w-4 h-4" /> },
              { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-4 h-4" /> },
              { id: 'materials', label: 'Marketing', icon: <Download className="w-4 h-4" /> },
              { id: 'commissions', label: 'Commissions', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'training', label: 'Training', icon: <Award className="w-4 h-4" /> },
              { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
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
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-3 gap-6">
                {/* Weekly Performance Chart */}
                <div className="col-span-2 bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Weekly Performance</h3>
                    <select className="text-sm border rounded-lg px-3 py-1">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {performanceMetrics.daily.map((day, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm text-gray-600 w-12">{day.date}</span>
                        <div className="flex-1 mx-4">
                          <div className="flex space-x-2">
                            <div className="bg-blue-200 h-6 rounded" style={{ width: `${(day.clicks / 80) * 100}%` }} />
                            <div className="bg-green-200 h-6 rounded" style={{ width: `${(day.conversions / 10) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{day.clicks} clicks</span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-sm font-semibold text-green-600">${day.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-200 rounded mr-2" />
                      <span>Clicks</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-200 rounded mr-2" />
                      <span>Conversions</span>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {performanceMetrics.sources.map((source, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{source.name}</span>
                          <span className="text-sm text-gray-600">{source.value}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${source.value}%`,
                              backgroundColor: source.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-2">
                        <span>Total Traffic</span>
                        <span className="font-semibold">3,456 visits</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unique Visitors</span>
                        <span className="font-semibold">2,890</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <UserPlus className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">New Referral Signup</div>
                        <div className="text-sm text-gray-500">John Smith signed up via your link</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Commission Earned</div>
                        <div className="text-sm text-gray-500">$297 from Emily Davis's subscription</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Achievement Unlocked</div>
                        <div className="text-sm text-gray-500">Reached 50 active referrals milestone</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Link Generator */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Create Custom Link</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Spring Sale 2024"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Page
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Homepage</option>
                      <option>Pricing</option>
                      <option>Features</option>
                      <option>Business Credit</option>
                      <option>Free Trial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTM Source
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., facebook, email"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Generate Link
                </button>
              </div>

              {/* Existing Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Referral Links</h3>
                <div className="space-y-4">
                  {referralLinks.map((link) => (
                    <div key={link.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{link.name}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">{link.url}</span>
                            <button
                              onClick={() => copyToClipboard(link.url)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {link.qrCode && (
                              <button className="text-purple-600 hover:text-purple-700">
                                <QrCode className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {link.shortUrl && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">Short URL:</span>
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{link.shortUrl}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">${link.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Revenue</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MousePointer className="w-4 h-4 mr-1" />
                            Clicks
                          </div>
                          <div className="text-xl font-semibold">{link.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Conversions
                          </div>
                          <div className="text-xl font-semibold">{link.conversions}</div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Conv. Rate
                          </div>
                          <div className="text-xl font-semibold">{link.conversionRate}%</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            View Stats
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link Performance Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Pro Tip: Optimize Your Links</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Links with custom campaigns and UTM parameters see 45% higher conversion rates. 
                      Always use descriptive names and track your sources for better insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <div className="text-sm text-gray-600">Team Members</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">$10,595</div>
                  <div className="text-sm text-gray-600">Team Earnings</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <Award className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">71</div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="text-2xl font-bold">15%</div>
                  <div className="text-sm text-gray-600">Team Commission</div>
                </div>
              </div>

              {/* Team Members Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-y">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Member</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Referrals</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Earnings</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-purple-600 font-semibold">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.lastActive}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {member.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{member.joined}</td>
                          <td className="py-3 px-4 text-center font-semibold">{member.referrals}</td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">
                            ${member.earnings.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 mr-2">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-700">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Recruitment Tools */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Recruitment Tools</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow">
                    <Mail className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="font-medium">Email Templates</div>
                    <div className="text-sm text-gray-600">Pre-written recruitment emails</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow">
                    <Share2 className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="font-medium">Social Media Kit</div>
                    <div className="text-sm text-gray-600">Graphics and posts for recruiting</div>
                  </button>
                  <button className="bg-white rounded-lg p-4 text-left hover:shadow-md transition-shadow">
                    <Video className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="font-medium">Webinar Access</div>
                    <div className="text-sm text-gray-600">Host recruitment webinars</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaign Filters */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <select 
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="all">All Campaigns</option>
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button className="text-purple-600 hover:text-purple-700 flex items-center">
                    <Filter className="w-4 h-4 mr-1" />
                    More Filters
                  </button>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Request Campaign
                </button>
              </div>

              {/* Campaign Cards */}
              <div className="grid grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <Megaphone className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{campaign.startDate} - {campaign.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-red-600">{campaign.discount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission</span>
                        <span className="font-medium text-green-600">{campaign.commission}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold">{campaign.conversions}</div>
                        <div className="text-xs text-gray-500">Conversions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">${(campaign.revenue / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Get Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Calendar */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Campaigns</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-lg mr-3">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">Valentine's Day Special</div>
                        <div className="text-sm text-gray-500">Feb 10-20, 2024 • 25% off + 30% commission</div>
                      </div>
                    </div>
                    <button className="text-purple-600 hover:text-purple-700">
                      Set Reminder
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Spring Sale 2024</div>
                        <div className="text-sm text-gray-500">Mar 1-15, 2024 • 20% off + 25% commission</div>
                      </div>
                    </div>
                    <button className="text-purple-600 hover:text-purple-700">
                      Set Reminder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-gray-600">Total Downloads</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">48</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Image className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-sm text-gray-600">Graphics</div>
                </div>
              </div>

              {/* Materials by Category */}
              {marketingMaterials.map((category, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-gray-100 p-2 rounded-lg mr-3">
                              {item.type === 'video' && <Video className="w-5 h-5 text-purple-600" />}
                              {item.type === 'image' && <Image className="w-5 h-5 text-blue-600" />}
                              {item.type === 'document' && <FileText className="w-5 h-5 text-green-600" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                                <span>{item.size}</span>
                                {item.duration && <span>{item.duration}</span>}
                                <span className="flex items-center">
                                  <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                  {item.rating}
                                </span>
                                <span>{item.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                          <button className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Social Media Scheduler */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Social Media Scheduler</h3>
                <p className="text-gray-600 mb-4">
                  Schedule and automate your social media posts across all platforms
                </p>
                <div className="flex space-x-4">
                  <button className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                    <Facebook className="w-6 h-6 text-blue-600" />
                  </button>
                  <button className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </button>
                  <button className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                    <Twitter className="w-6 h-6 text-blue-400" />
                  </button>
                  <button className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                    <Linkedin className="w-6 h-6 text-blue-700" />
                  </button>
                  <button className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                    <Youtube className="w-6 h-6 text-red-600" />
                  </button>
                </div>
                <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Open Scheduler
                </button>
              </div>
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              {/* Commission Overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">${affiliateData.currentBalance.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Available Balance</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="text-2xl font-bold">${affiliateData.pendingCommissions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-sm text-gray-600">Commission Rate</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <Award className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">${affiliateData.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Lifetime Earnings</div>
                </div>
              </div>

              {/* Commission Tiers */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
                <div className="grid grid-cols-4 gap-4">
                  {commissionTiers.map((tier, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-5 ${tier.current ? 'border-purple-500 bg-purple-50' : 'hover:shadow-md'} transition-shadow`}
                    >
                      {tier.current && (
                        <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full inline-block mb-3">
                          Current Tier
                        </div>
                      )}
                      <div className={`text-${tier.color}-600 mb-3`}>{tier.icon}</div>
                      <h4 className="font-semibold text-lg mb-2">{tier.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{tier.requirements}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Initial</span>
                          <span className="font-semibold">{tier.commission}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Recurring</span>
                          <span className="font-semibold">{tier.recurringCommission}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Team</span>
                          <span className="font-semibold">{tier.teamCommission}</span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm text-gray-600 mb-2">Monthly Bonus</div>
                        <div className="font-semibold">{tier.bonus}</div>
                        <div className="text-xs text-gray-500">at {tier.monthlyTarget} sales</div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-gray-600 mb-2">Benefits:</div>
                        <ul className="text-xs space-y-1">
                          {tier.benefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{benefit}</span>
                            </li>
                          ))}
                          {tier.benefits.length > 3 && (
                            <li className="text-purple-600 font-medium">
                              +{tier.benefits.length - 3} more benefits
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">This Month's Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium">New Customer Commissions</div>
                      <div className="text-sm text-gray-500">12 new signups × $297 × 30%</div>
                    </div>
                    <div className="text-xl font-bold text-green-600">$1,069.20</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium">Recurring Commissions</div>
                      <div className="text-sm text-gray-500">89 active subscriptions × $97 × 20%</div>
                    </div>
                    <div className="text-xl font-bold text-green-600">$1,726.60</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium">Team Commissions</div>
                      <div className="text-sm text-gray-500">4 team members earnings × 10%</div>
                    </div>
                    <div className="text-xl font-bold text-green-600">$659.50</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-purple-500">
                    <div>
                      <div className="font-semibold text-purple-900">Total This Month</div>
                      <div className="text-sm text-purple-600">Pending payout on Feb 15</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">$3,455.30</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              {/* Training Progress */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Your Learning Journey</h3>
                    <p className="opacity-90">Complete courses to unlock new commission tiers and bonuses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">42%</div>
                    <div className="text-sm opacity-75">Completed</div>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-3">
                  <div className="bg-white h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              {/* Training Modules */}
              {trainingResources.map((category, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
                  <div className="space-y-3">
                    {category.resources.map((resource, resourceIndex) => (
                      <div key={resourceIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              resource.completed ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {resource.type === 'video' && <Video className={`w-5 h-5 ${resource.completed ? 'text-green-600' : 'text-gray-600'}`} />}
                              {resource.type === 'article' && <FileText className={`w-5 h-5 ${resource.completed ? 'text-green-600' : 'text-gray-600'}`} />}
                              {resource.type === 'course' && <Award className={`w-5 h-5 ${resource.completed ? 'text-green-600' : 'text-gray-600'}`} />}
                            </div>
                            <div>
                              <div className="font-medium flex items-center">
                                {resource.title}
                                {resource.completed && (
                                  <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{resource.duration}</div>
                            </div>
                          </div>
                          <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            resource.completed 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}>
                            {resource.completed ? 'Review' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Certificates & Achievements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <div className="font-medium">Top Performer</div>
                    <div className="text-xs text-gray-500">January 2024</div>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Award className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <div className="font-medium">50 Sales</div>
                    <div className="text-xs text-gray-500">Milestone</div>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Star className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <div className="font-medium">5-Star Mentor</div>
                    <div className="text-xs text-gray-500">Team Builder</div>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center opacity-50">
                    <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="font-medium">100 Sales</div>
                    <div className="text-xs text-gray-500">11 more to unlock</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              {/* Period Selector */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Top Performers</h3>
                <div className="flex space-x-2">
                  {['week', 'month', 'year', 'all-time'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-700">Rank</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700">Affiliate</th>
                      <th className="text-center py-4 px-6 font-medium text-gray-700">Tier</th>
                      <th className="text-center py-4 px-6 font-medium text-gray-700">Referrals</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-700">Earnings</th>
                      <th className="text-center py-4 px-6 font-medium text-gray-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className={entry.highlight ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500 mr-2" />}
                            {entry.rank === 2 && <Trophy className="w-5 h-5 text-gray-400 mr-2" />}
                            {entry.rank === 3 && <Trophy className="w-5 h-5 text-orange-600 mr-2" />}
                            <span className="font-semibold">#{entry.rank}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-600 font-semibold">
                                {entry.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {entry.name}
                                {entry.highlight && <span className="ml-2 text-purple-600">(You)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                            entry.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.tier}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-semibold">{entry.referrals}</td>
                        <td className="py-4 px-6 text-right font-semibold text-green-600">
                          ${entry.earnings.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            {entry.trend === 'up' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={entry.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                              {Math.abs(entry.change)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Achievements & Rewards */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Contest</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <div className="font-semibold">1st Place</div>
                    <div className="text-2xl font-bold text-yellow-600">$5,000</div>
                    <div className="text-sm text-gray-600">+ MacBook Pro</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="font-semibold">2nd Place</div>
                    <div className="text-2xl font-bold text-gray-600">$2,500</div>
                    <div className="text-sm text-gray-600">+ iPad Pro</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <Trophy className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold">3rd Place</div>
                    <div className="text-2xl font-bold text-orange-600">$1,000</div>
                    <div className="text-sm text-gray-600">+ AirPods Pro</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Contest ends in 14 days. You're currently in 4th place - keep pushing!
                </p>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Payment Settings */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Payment Method
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Bank Transfer (ACH)</option>
                      <option>PayPal</option>
                      <option>Stripe</option>
                      <option>Wise</option>
                      <option>Cryptocurrency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Schedule
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Monthly (15th)</option>
                      <option>Bi-weekly</option>
                      <option>Weekly</option>
                      <option>On-demand ($100 minimum)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">Next Payout Date</div>
                    <div className="text-sm text-gray-500">Estimated amount: ${affiliateData.currentBalance.toLocaleString()}</div>
                  </div>
                  <div className="text-xl font-semibold">{affiliateData.nextPayout}</div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-y">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Payment ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Method</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{payment.id}</td>
                          <td className="py-3 px-4">{payment.date}</td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">
                            ${payment.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">{payment.method}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 mr-2">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-700">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Tax Documents Ready</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your 1099 form for 2023 is available for download. Remember to include your affiliate earnings in your tax filing.
                    </p>
                    <button className="mt-2 text-yellow-900 underline text-sm font-medium">
                      Download Tax Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Request Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  max={affiliateData.currentBalance}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${affiliateData.currentBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Bank Transfer (2-3 days)</option>
                  <option>PayPal (Instant)</option>
                  <option>Stripe (1-2 days)</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliates;