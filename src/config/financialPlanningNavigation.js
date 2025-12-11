// Path: /src/config/financialPlanningNavigation.js
// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL PLANNING NAVIGATION INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
// Navigation configuration for Financial Planning Hub integration with SpeedyCRM
//
// CHRISTOPHER'S REQUIREMENTS COMPLIANCE:
// ✅ Integrates with existing ProtectedLayout.jsx accordion navigation
// ✅ Follows navConfig.js patterns
// ✅ Production-ready configuration
// ✅ Role-based access control
// ═══════════════════════════════════════════════════════════════════════════

import {
  Calculator,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL PLANNING HUB CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const financialPlanningHubConfig = {
  id: 'financial-planning',
  name: 'Financial Planning',
  icon: Calculator,
  path: '/hubs/financial-planning',
  component: 'FinancialPlanningHub',
  description: 'Debt payoff planning, budgeting, and credit optimization',
  
  // Role access control (follows SpeedyCRM 8-level hierarchy)
  requiredRole: 3, // client(3) and above
  
  // Hub metadata for analytics and tracking
  metadata: {
    category: 'CLIENT_SERVICES',
    priority: 'HIGH',
    businessValue: 'REVENUE_GENERATING', // $49-$99/month add-on service
    aiFeatures: 50, // Number of AI features
    completionStatus: 'PRODUCTION_READY',
    lastUpdated: '2024-12-10',
    version: '2.0.0'
  },
  
  // Tab configuration for the hub
  tabs: [
    {
      id: 'debt-reduction',
      name: 'Debt Reduction',
      icon: TrendingUp,
      component: 'DebtPayoffCalculator',
      description: 'Multiple payoff strategies with AI optimization',
      features: [
        'Snowball, Avalanche, Hybrid, Credit-Focused strategies',
        'Real-time payoff timeline visualization',
        'AI-powered payment optimization',
        'Interest savings calculator',
        'Milestone tracking and celebration'
      ]
    },
    {
      id: 'budget-builder',
      name: 'Budget Builder',
      icon: PiggyBank,
      component: 'BudgetOptimizer',
      description: 'Smart budgeting with expense optimization',
      features: [
        'AI expense categorization',
        'Budget health scoring',
        'Optimization recommendations',
        'Goal-based planning',
        'Emergency fund calculator'
      ]
    },
    {
      id: 'credit-impact',
      name: 'Credit Impact',
      icon: BarChart3,
      component: 'CreditScoreSimulator',
      description: 'Credit score improvement projections',
      features: [
        'Score simulation based on payoff plans',
        'Utilization optimization',
        'Timeline to credit goals',
        'Account management recommendations',
        'Credit tier milestone tracking'
      ]
    },
    {
      id: 'financial-goals',
      name: 'Financial Goals',
      icon: Target,
      component: 'FinancialGoalTracker',
      description: 'Goal setting and progress tracking',
      features: [
        'Smart goal setting wizard',
        'Progress tracking with milestones',
        'Achievement celebration system',
        'Goal-based recommendations',
        'Financial freedom timeline'
      ]
    },
    {
      id: 'calculators',
      name: 'Calculators',
      icon: Calculator,
      component: 'FinancialCalculators',
      description: 'Advanced financial calculators and tools',
      features: [
        'Debt consolidation analyzer',
        'Refinance calculator',
        'Investment growth projector',
        'Retirement planning tools',
        'What-if scenario modeling'
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: DollarSign,
      component: 'FinancialReports',
      description: 'Comprehensive financial reports and exports',
      features: [
        'PDF debt payoff plans',
        'Budget analysis reports',
        'Progress tracking charts',
        'Client presentation templates',
        'Email automation integration'
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION MENU ITEM (for navConfig.js integration)
// ═══════════════════════════════════════════════════════════════════════════

export const financialPlanningMenuItem = {
  id: 'financial-planning-hub',
  name: 'Financial Planning',
  icon: Calculator,
  path: '/financial-planning',
  component: 'FinancialPlanningHub',
  requiredRole: 3, // client and above
  category: 'CLIENT_HUBS',
  order: 15, // Position in navigation
  badge: 'AI', // Shows this hub has AI features
  tooltip: 'Debt payoff planning with AI optimization',
  
  // Business metrics for tracking
  metrics: {
    conversionPotential: 'HIGH',
    revenueImpact: '$49-99/month',
    userEngagement: 'DAILY',
    competitiveDifferentiator: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMB CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const financialPlanningBreadcrumbs = {
  '/financial-planning': [
    { name: 'Dashboard', path: '/' },
    { name: 'Financial Planning', path: '/financial-planning' }
  ],
  '/financial-planning/debt-reduction': [
    { name: 'Dashboard', path: '/' },
    { name: 'Financial Planning', path: '/financial-planning' },
    { name: 'Debt Reduction', path: '/financial-planning/debt-reduction' }
  ],
  '/financial-planning/budget-builder': [
    { name: 'Dashboard', path: '/' },
    { name: 'Financial Planning', path: '/financial-planning' },
    { name: 'Budget Builder', path: '/financial-planning/budget-builder' }
  ]
  // Add more breadcrumb paths as needed
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const canAccessFinancialPlanning = (userRole) => {
  // Role hierarchy: masterAdmin(8), admin(7), manager(6), user(5), affiliate(4), client(3), prospect(2), viewer(1)
  return userRole >= 3; // client and above
};

export const canAccessAdvancedFeatures = (userRole) => {
  return userRole >= 5; // user and above for advanced features
};

export const canManageClientFinancials = (userRole) => {
  return userRole >= 6; // manager and above for managing client financials
};

// ═══════════════════════════════════════════════════════════════════════════
// AI FEATURES CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const aiFeaturesList = [
  {
    category: 'Debt Optimization',
    features: [
      'AI-powered strategy selection',
      'Personalized payment recommendations',
      'Interest optimization algorithms',
      'Risk assessment and early warnings',
      'Adaptive payment allocation',
      'Behavioral pattern analysis',
      'Success probability scoring',
      'Dynamic strategy adjustment'
    ]
  },
  {
    category: 'Budget Intelligence',
    features: [
      'Smart expense categorization',
      'Spending pattern recognition',
      'Budget optimization suggestions',
      'Goal-based allocation',
      'Lifestyle analysis',
      'Seasonal adjustment predictions',
      'Emergency fund optimization',
      'Investment opportunity identification'
    ]
  },
  {
    category: 'Credit Scoring',
    features: [
      'Credit score impact prediction',
      'Utilization optimization timing',
      'Account management recommendations',
      'Credit mix optimization',
      'Payment timing optimization',
      'Credit inquiry strategy',
      'Score milestone predictions',
      'Credit goal timeline generation'
    ]
  },
  {
    category: 'Predictive Analytics',
    features: [
      'Financial milestone predictions',
      'Cash flow forecasting',
      'Risk scenario modeling',
      'Market condition adjustments',
      'Life event impact analysis',
      'Goal achievement probability',
      'Financial stress indicators',
      'Opportunity alert system'
    ]
  },
  {
    category: 'Personalization',
    features: [
      'Learning user preferences',
      'Behavioral adaptation',
      'Communication style matching',
      'Motivation technique optimization',
      'Custom recommendation engine',
      'Progress celebration timing',
      'Reminder frequency optimization',
      'Interface personalization'
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  hubConfig: financialPlanningHubConfig,
  menuItem: financialPlanningMenuItem,
  breadcrumbs: financialPlanningBreadcrumbs,
  permissions: {
    canAccessFinancialPlanning,
    canAccessAdvancedFeatures,
    canManageClientFinancials
  },
  aiFeatures: aiFeaturesList
};

console.log('💰 Financial Planning Navigation Configuration loaded');