// src/data/sampleProducts.js
// Sample Credit Repair Pricing Models
// Based on industry standards (2025)

export const creditRepairProducts = [
  // ==========================================================================
  // MONTHLY SUBSCRIPTION TIERS
  // ==========================================================================
  {
    id: 'basic-monthly',
    name: 'Credit Essentials',
    category: 'Monthly Subscription',
    price: 89.00,
    billingCycle: 'monthly',
    setupFee: 0,
    popular: false,
    features: [
      '✅ Up to 5 disputes per month',
      '✅ 1 bureau (choose Experian, Equifax, or TransUnion)',
      '✅ Monthly credit score updates',
      '✅ Basic credit education resources',
      '✅ Email support (48hr response)',
      '✅ Standard dispute letter templates',
      '❌ Goodwill letters',
      '❌ Creditor intervention',
      '❌ Identity theft assistance'
    ],
    limitations: [
      'Single bureau only',
      'Up to 5 items disputed per month',
      'No priority support',
      'No direct creditor negotiations'
    ],
    idealFor: [
      'First-time credit repair clients',
      'Minor credit issues (1-5 items)',
      'Budget-conscious consumers',
      'Single bureau problems'
    ],
    estimatedDuration: '3-6 months',
    successRate: '65-75%',
    active: true,
    color: '#3B82F6', // blue
    icon: 'Shield'
  },

  {
    id: 'standard-monthly',
    name: 'Credit Pro',
    category: 'Monthly Subscription',
    price: 119.00,
    billingCycle: 'monthly',
    setupFee: 0,
    popular: true, // Most popular tier
    badge: 'MOST POPULAR',
    features: [
      '✅ Unlimited disputes per month',
      '✅ All 3 bureaus (Experian, Equifax, TransUnion)',
      '✅ Weekly credit score tracking',
      '✅ Advanced credit education & webinars',
      '✅ Priority email support (24hr response)',
      '✅ Phone support (business hours)',
      '✅ Custom dispute strategies',
      '✅ Goodwill letter campaigns',
      '✅ Basic creditor intervention',
      '✅ Monthly progress reports',
      '❌ 24/7 support',
      '❌ Dedicated account manager'
    ],
    limitations: [
      'Phone support: M-F 9am-5pm EST only',
      'No direct lender negotiations',
      'Standard processing times'
    ],
    idealFor: [
      'Moderate credit issues (6-15 items)',
      'Clients needing multi-bureau repair',
      'Those wanting regular updates',
      'Average credit repair timeline'
    ],
    estimatedDuration: '4-8 months',
    successRate: '75-85%',
    active: true,
    color: '#10B981', // green
    icon: 'TrendingUp'
  },

  {
    id: 'premium-monthly',
    name: 'Credit Elite',
    category: 'Monthly Subscription',
    price: 169.00,
    billingCycle: 'monthly',
    setupFee: 0,
    popular: false,
    badge: 'PREMIUM',
    features: [
      '✅ Unlimited disputes per month',
      '✅ All 3 bureaus + specialty reports (ChexSystems, LexisNexis)',
      '✅ Real-time credit monitoring & alerts',
      '✅ Dedicated account manager',
      '✅ 24/7 priority support (phone, email, chat)',
      '✅ Advanced AI-powered dispute strategies',
      '✅ Aggressive creditor intervention',
      '✅ Goodwill & pay-for-delete negotiations',
      '✅ Court-ready documentation',
      '✅ Identity theft restoration',
      '✅ Weekly progress calls',
      '✅ Bi-weekly detailed reports',
      '✅ Credit-building tradeline referrals',
      '✅ Mortgage/loan pre-qualification assistance'
    ],
    limitations: [
      'Premium pricing tier',
      'Requires initial consultation'
    ],
    idealFor: [
      'Complex credit situations (15+ items)',
      'Identity theft victims',
      'Time-sensitive repairs (home buying, etc.)',
      'High-net-worth individuals',
      'Business credit repair needs'
    ],
    estimatedDuration: '3-6 months',
    successRate: '85-95%',
    active: true,
    color: '#8B5CF6', // purple
    icon: 'Crown'
  },

  {
    id: 'business-credit',
    name: 'Business Credit Builder',
    category: 'Monthly Subscription',
    price: 249.00,
    billingCycle: 'monthly',
    setupFee: 195.00,
    popular: false,
    badge: 'BUSINESS',
    features: [
      '✅ Personal credit repair (all 3 bureaus)',
      '✅ Business credit establishment & repair',
      '✅ D&B, Experian Business, Equifax Business',
      '✅ Business credit profile optimization',
      '✅ Vendor tradeline establishment',
      '✅ Business credit monitoring',
      '✅ EIN consultation & setup',
      '✅ Business entity structuring advice',
      '✅ Dedicated business credit specialist',
      '✅ Monthly strategy sessions',
      '✅ Net-30 vendor network access',
      '✅ Business credit card referrals'
    ],
    limitations: [
      'Requires active business entity',
      'Initial setup fee required',
      'Minimum 6-month commitment'
    ],
    idealFor: [
      'Small business owners',
      'Entrepreneurs',
      'Business loan applicants',
      'Contractors & freelancers',
      'Franchise owners'
    ],
    estimatedDuration: '6-12 months',
    successRate: '80-90%',
    active: true,
    color: '#EF4444', // red
    icon: 'Briefcase'
  },

  // ==========================================================================
  // ONE-TIME SERVICES
  // ==========================================================================
  {
    id: 'credit-audit',
    name: 'Comprehensive Credit Audit',
    category: 'One-Time Service',
    price: 197.00,
    billingCycle: 'one-time',
    setupFee: 0,
    popular: false,
    features: [
      '✅ Full 3-bureau credit report analysis',
      '✅ Identification of all negative items',
      '✅ Error detection & validation',
      '✅ Actionable repair roadmap',
      '✅ Score improvement projections',
      '✅ Personalized strategy document',
      '✅ 60-minute consultation call',
      '✅ Written report (20-30 pages)',
      '✅ Priority processing (3-5 business days)'
    ],
    limitations: [
      'Analysis only - no dispute filing',
      'Does not include ongoing support',
      'Valid for 30 days from delivery'
    ],
    idealFor: [
      'DIY credit repair clients',
      'Those wanting a second opinion',
      'Pre-planning major purchases',
      'Understanding credit before repair'
    ],
    estimatedDuration: '3-5 business days',
    deliverables: 'PDF report + consultation call',
    active: true,
    color: '#F59E0B', // amber
    icon: 'Search'
  },

  {
    id: 'rapid-rescore',
    name: 'Rapid Rescore Service',
    category: 'One-Time Service',
    price: 395.00,
    billingCycle: 'one-time',
    setupFee: 0,
    popular: false,
    badge: 'URGENT',
    features: [
      '✅ Emergency 3-7 day credit repair',
      '✅ Direct lender communication',
      '✅ Rapid dispute filing (all 3 bureaus)',
      '✅ Pay-for-delete negotiations',
      '✅ Goodwill letter blitz',
      '✅ Daily progress updates',
      '✅ Dedicated rush handler',
      '✅ Weekend & evening support',
      '✅ Results guarantee or money back'
    ],
    limitations: [
      'Limited to 10 disputed items',
      'Not all items eligible for rapid processing',
      'Higher pricing due to expedited service',
      'Requires upfront payment'
    ],
    idealFor: [
      'Emergency mortgage approval',
      'Last-minute loan qualification',
      'Job applications requiring credit check',
      'Time-sensitive financial deadlines'
    ],
    estimatedDuration: '3-7 days',
    successRate: '60-70% (time-limited)',
    active: true,
    color: '#DC2626', // bright red
    icon: 'Zap'
  },

  {
    id: 'consultation-hour',
    name: 'Expert Consultation (1 Hour)',
    category: 'Consultation',
    price: 150.00,
    billingCycle: 'one-time',
    setupFee: 0,
    popular: false,
    features: [
      '✅ 60-minute phone or video call',
      '✅ Credit report review',
      '✅ Strategy recommendations',
      '✅ Q&A session',
      '✅ Follow-up email summary',
      '✅ Resource document',
      '✅ Scheduling within 48 hours'
    ],
    limitations: [
      'Consultation only - no action taken',
      'No written detailed report',
      'Single session'
    ],
    idealFor: [
      'Quick credit questions',
      'Strategy validation',
      'DIY guidance',
      'Second opinions'
    ],
    estimatedDuration: '1 hour',
    active: true,
    color: '#06B6D4', // cyan
    icon: 'MessageCircle'
  },

  // ==========================================================================
  // ADD-ON SERVICES
  // ==========================================================================
  {
    id: 'identity-theft-protection',
    name: 'Identity Theft Resolution',
    category: 'Add-On Service',
    price: 79.00,
    billingCycle: 'monthly-addon',
    setupFee: 0,
    popular: false,
    features: [
      '✅ 24/7 identity monitoring',
      '✅ Dark web surveillance',
      '✅ Social Security number tracking',
      '✅ $1M identity theft insurance',
      '✅ Dedicated fraud specialist',
      '✅ Police report assistance',
      '✅ Creditor notification service',
      '✅ FTC Identity Theft Report filing',
      '✅ Account takeover alerts'
    ],
    limitations: [
      'Requires active credit repair subscription',
      'Insurance subject to terms & conditions'
    ],
    idealFor: [
      'Identity theft victims',
      'High-risk professions',
      'Recent data breach victims',
      'Peace of mind'
    ],
    active: true,
    color: '#64748B', // slate
    icon: 'ShieldAlert'
  },

  {
    id: 'credit-monitoring',
    name: 'Premium Credit Monitoring',
    category: 'Add-On Service',
    price: 29.00,
    billingCycle: 'monthly-addon',
    setupFee: 0,
    popular: true,
    features: [
      '✅ Daily 3-bureau credit monitoring',
      '✅ Real-time score updates',
      '✅ Instant alerts for changes',
      '✅ New account notifications',
      '✅ Hard inquiry alerts',
      '✅ Score simulator tool',
      '✅ Mobile app access'
    ],
    limitations: [
      'Requires active subscription',
      'Alerts may have slight delay'
    ],
    idealFor: [
      'Ongoing credit maintenance',
      'Post-repair monitoring',
      'Fraud prevention',
      'Credit-building tracking'
    ],
    active: true,
    color: '#10B981', // green
    icon: 'Eye'
  },

  {
    id: 'extra-dispute-round',
    name: 'Additional Dispute Round',
    category: 'Add-On Service',
    price: 75.00,
    billingCycle: 'one-time-addon',
    setupFee: 0,
    popular: false,
    features: [
      '✅ Additional monthly dispute round',
      '✅ All 3 bureaus',
      '✅ Up to 10 additional items',
      '✅ Same-day processing',
      '✅ Tracking & updates included'
    ],
    limitations: [
      'Requires active Basic tier subscription',
      'Pro & Elite tiers include unlimited disputes'
    ],
    idealFor: [
      'Basic tier clients needing more disputes',
      'Time-sensitive additional items',
      'Newly discovered errors'
    ],
    active: true,
    color: '#F59E0B', // amber
    icon: 'Plus'
  },

  // ==========================================================================
  // SPECIALIZED PACKAGES
  // ==========================================================================
  {
    id: 'student-credit-repair',
    name: 'Student Credit Rescue',
    category: 'Specialized Package',
    price: 69.00,
    billingCycle: 'monthly',
    setupFee: 0,
    popular: false,
    badge: 'STUDENT',
    features: [
      '✅ Student loan default resolution',
      '✅ Collection account disputes',
      '✅ All 3 bureaus',
      '✅ Student-focused education',
      '✅ Budget counseling',
      '✅ Young adult credit building tips',
      '✅ Email support',
      '✅ Monthly updates'
    ],
    limitations: [
      'Must provide valid student ID',
      'Limited to student loan and collection issues',
      'Age 18-26 only'
    ],
    idealFor: [
      'College students',
      'Recent graduates',
      'Those with student loan issues',
      'First-time credit users'
    ],
    estimatedDuration: '4-6 months',
    successRate: '70-80%',
    discountNote: '30% off standard pricing for verified students',
    active: true,
    color: '#8B5CF6', // purple
    icon: 'GraduationCap'
  },

  {
    id: 'divorce-credit-recovery',
    name: 'Divorce Credit Recovery',
    category: 'Specialized Package',
    price: 149.00,
    billingCycle: 'monthly',
    setupFee: 99.00,
    popular: false,
    badge: 'SPECIALIZED',
    features: [
      '✅ Joint account separation assistance',
      '✅ Authorized user removal',
      '✅ Ex-spouse credit damage repair',
      '✅ Legal documentation review',
      '✅ Court-ordered debt disputes',
      '✅ All 3 bureaus',
      '✅ Dedicated divorce credit specialist',
      '✅ Bi-weekly progress calls',
      '✅ Attorney referral network'
    ],
    limitations: [
      'Requires divorce decree or separation agreement',
      'Cannot violate court orders',
      'Initial consultation required'
    ],
    idealFor: [
      'Recently divorced individuals',
      'Those with ex-spouse credit damage',
      'Joint account separation needs',
      'Post-divorce credit rebuilding'
    ],
    estimatedDuration: '6-12 months',
    successRate: '75-85%',
    active: true,
    color: '#EF4444', // red
    icon: 'Users'
  }
];

// ==========================================================================
// PRODUCT CATEGORIES
// ==========================================================================
export const productCategories = [
  { id: 'monthly', name: 'Monthly Subscription', icon: 'CreditCard', color: '#3B82F6' },
  { id: 'one-time', name: 'One-Time Service', icon: 'Zap', color: '#F59E0B' },
  { id: 'addon', name: 'Add-On Service', icon: 'Plus', color: '#10B981' },
  { id: 'consultation', name: 'Consultation', icon: 'MessageCircle', color: '#06B6D4' },
  { id: 'specialized', name: 'Specialized Package', icon: 'Star', color: '#8B5CF6' }
];

// ==========================================================================
// PRICING COMPARISON MATRIX
// ==========================================================================
export const pricingComparison = {
  features: [
    'Number of bureaus',
    'Disputes per month',
    'Credit monitoring',
    'Support response time',
    'Phone support',
    'Dedicated account manager',
    'Goodwill letters',
    'Creditor intervention',
    'Identity theft assistance',
    'Business credit',
    'Monthly reports',
    'Setup fee'
  ],
  tiers: [
    {
      name: 'Credit Essentials',
      values: ['1', '5', 'Monthly', '48hrs', '❌', '❌', '❌', '❌', '❌', '❌', '✅', '$0']
    },
    {
      name: 'Credit Pro',
      values: ['3', 'Unlimited', 'Weekly', '24hrs', '✅', '❌', '✅', 'Basic', '❌', '❌', '✅', '$0']
    },
    {
      name: 'Credit Elite',
      values: ['3+', 'Unlimited', 'Real-time', 'Immediate', '✅', '✅', '✅', 'Advanced', '✅', '❌', '✅', '$0']
    },
    {
      name: 'Business Credit',
      values: ['3+', 'Unlimited', 'Real-time', '24hrs', '✅', '✅', '✅', 'Advanced', '✅', '✅', '✅', '$195']
    }
  ]
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const calculateAnnualPrice = (monthlyPrice) => {
  return monthlyPrice * 12;
};

export const calculateSavings = (monthlyPrice, annualPrice) => {
  const fullYearPrice = monthlyPrice * 12;
  return fullYearPrice - annualPrice;
};

export default creditRepairProducts;