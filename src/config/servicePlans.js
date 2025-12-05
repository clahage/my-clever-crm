// ============================================================================
// SERVICE PLANS CONFIGURATION - Speedy Credit Repair
// ============================================================================
// Path: /src/config/servicePlans.js
//
// This file defines all service tier plans with pricing, features, and
// eligibility criteria. Used by AI recommendation engine and workflow system.
//
// IMPORTANT: All pricing follows CROA compliance rules:
// - No upfront fees for credit repair services (except DIY)
// - First payment due AFTER Month 1 of service ends
// - DIY can be prepaid (educational product, not credit repair service)
//
// Last updated: [Current Date]
// Owner: Christopher - Speedy Credit Repair
// ============================================================================

/**
 * SERVICE TIER STRUCTURE (5 Active + 1 Hidden)
 *
 * 1. DIY Credit Builder ($49/mo prepaid)
 * 2. Standard Plan ($179 fixed OR $129 + $25/item/bureau performance)
 * 3. Acceleration Plan ($249 fixed OR $169 + $20/item/bureau performance)
 * 4. Premium Comprehensive ($349 fixed OR $249 + $15/item/bureau performance)
 * 5. VIP Elite ($599 fixed only) - HIDDEN until activated
 */

export const SERVICE_PLANS = {
  // =========================================================================
  // TIER 1: DIY CREDIT BUILDER
  // =========================================================================
  diy: {
    id: 'diy',
    name: 'DIY Credit Builder',
    slug: 'diy-credit-builder',
    tier: 1,
    active: true,
    hidden: false,

    // Pricing (CROA Compliant - Educational product)
    pricing: {
      fixed: {
        monthlyPrice: 49,
        setupFee: 0,
        paymentDue: 'immediate', // Can be prepaid (legal for DIY)
        billingCycle: 'monthly',
        contractLength: 1, // Month-to-month
        cancellationPolicy: 'anytime'
      },
      performance: null // DIY doesn't offer performance pricing
    },

    // Features included
    features: {
      included: [
        'Dispute letter library (50+ templates)',
        'Step-by-step video tutorials',
        'Credit education portal',
        'Basic score tracking dashboard',
        'Email support (48-hour response)',
        'Monthly group coaching webinar',
        'Self-service dispute tools',
        'Educational resources library'
      ],
      notIncluded: [
        'Professional disputes filed',
        'Dedicated credit specialist',
        'Phone support',
        'Creditor negotiations',
        'Attorney consultations',
        'Priority support'
      ]
    },

    // Eligibility criteria for AI recommendations
    eligibility: {
      minScore: 620,
      maxScore: 850,
      minNegativeItems: 1,
      maxNegativeItems: 5,
      complexity: { min: 0, max: 30 }, // 0-100 scale
      customRules: {
        budgetMax: 50,
        timeCommitment: 'high', // Client must be willing to do the work
        technicalAbility: 'moderate'
      }
    },

    // Target audience
    targetAudience: 'Budget-conscious consumers, young adults building credit, simple cases with 1-5 items, DIY learners',
    estimatedTimeline: '6-12 months',
    estimatedScoreIncrease: { min: 20, realistic: 40, max: 70 },

    // UI display
    color: '#10B981', // Green
    icon: 'BookOpen',
    badge: null,
    displayOrder: 1,

    // 3-month opt-out clause
    optOutClause: false, // DIY is month-to-month, no need for opt-out

    // Upsell paths
    upsellTo: ['standard_fixed', 'standard_performance'],
    upsellTriggers: [
      'no_progress_30_days',
      'client_frustrated',
      'complexity_higher_than_expected'
    ],

    // Stats (updated by system)
    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 2: STANDARD PLAN (FIXED PRICING)
  // =========================================================================
  standard_fixed: {
    id: 'standard_fixed',
    name: 'Standard Plan',
    slug: 'standard-plan-fixed',
    tier: 2,
    active: true,
    hidden: false,
    pricingModel: 'fixed',

    // Pricing (CROA Compliant)
    pricing: {
      fixed: {
        monthlyPrice: 179,
        setupFee: 0,
        paymentDue: 'after_month_1', // First payment AFTER Month 1 ends (CROA)
        billingCycle: 'monthly',
        contractLength: 6, // 6-month minimum
        cancellationPolicy: '3_month_opt_out' // In contract, not prompted
      },
      performance: null
    },

    // Features included
    features: {
      included: [
        'Unlimited professional disputes',
        'All 3 credit bureaus covered',
        'Dedicated credit specialist (yours exclusively)',
        'Phone + email support (business hours)',
        'Monthly credit report review',
        'Monthly strategy call',
        'Creditor negotiations included',
        'Goodwill letter campaigns',
        'Progress tracking dashboard',
        'Educational resources',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Expedited processing (48hr turnaround)',
        'Weekly updates (monthly only)',
        'Attorney consultations',
        'Identity theft resolution',
        '24/7 support',
        'Priority phone support'
      ]
    },

    // Eligibility criteria
    eligibility: {
      minScore: 500,
      maxScore: 680,
      minNegativeItems: 8,
      maxNegativeItems: 15,
      complexity: { min: 30, max: 60 },
      customRules: {
        budgetMin: 150,
        budgetMax: 200,
        wantsPredictability: true,
        timeline: 'normal' // Not urgent
      }
    },

    targetAudience: 'Typical credit repair cases, 8-15 disputable items, moderate complexity, wants predictable monthly costs',
    estimatedTimeline: '4-6 months',
    estimatedScoreIncrease: { min: 60, realistic: 85, max: 120 },

    color: '#3B82F6', // Blue
    icon: 'CheckCircle',
    badge: 'Most Popular',
    displayOrder: 2,

    optOutClause: true, // 3-month satisfaction clause (in contract only)

    upsellTo: ['acceleration_fixed', 'premium_fixed'],
    upsellTriggers: [
      'mentions_urgent_timeline',
      'complexity_increased',
      'identity_theft_discovered'
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 2: STANDARD PLAN (PERFORMANCE PRICING)
  // =========================================================================
  standard_performance: {
    id: 'standard_performance',
    name: 'Standard Plan',
    slug: 'standard-plan-performance',
    tier: 2,
    active: true,
    hidden: false,
    pricingModel: 'performance',

    // Pricing (CROA Compliant + Performance-based)
    pricing: {
      fixed: null,
      performance: {
        monthlyBase: 129,
        perDeletionFee: 25, // Per item, per bureau
        perDeletionCalculation: 'per_bureau', // $25 × 3 bureaus = $75 per item max
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: '3_month_opt_out'
      }
    },

    // Features (same as fixed)
    features: {
      included: [
        'Unlimited professional disputes',
        'All 3 credit bureaus covered',
        'Dedicated credit specialist (yours exclusively)',
        'Phone + email support (business hours)',
        'Monthly credit report review',
        'Monthly strategy call',
        'Creditor negotiations included',
        'Goodwill letter campaigns',
        'Progress tracking dashboard',
        'Pay-for-results accountability',
        'Transparent deletion tracking',
        'Monthly itemized billing',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Expedited processing (48hr turnaround)',
        'Weekly updates (monthly only)',
        'Attorney consultations',
        'Identity theft resolution',
        '24/7 support',
        'Priority phone support'
      ]
    },

    // Eligibility criteria
    eligibility: {
      minScore: 500,
      maxScore: 680,
      minNegativeItems: 8,
      maxNegativeItems: 20,
      complexity: { min: 30, max: 65 },
      customRules: {
        budgetMin: 100,
        budgetMax: 180,
        wantsAccountability: true,
        skepticalOfIndustry: true,
        timeline: 'normal'
      }
    },

    targetAudience: 'Skeptical buyers, want pay-for-results, 8-20 items, prefer lower monthly commitment',
    estimatedTimeline: '4-6 months',
    estimatedScoreIncrease: { min: 60, realistic: 85, max: 120 },

    color: '#3B82F6', // Blue
    icon: 'TrendingUp',
    badge: 'Pay for Results',
    displayOrder: 3,

    optOutClause: true,

    upsellTo: ['acceleration_performance', 'premium_performance'],
    upsellTriggers: [
      'mentions_urgent_timeline',
      'complexity_increased',
      'high_deletion_count' // If lots of deletions, might benefit from fixed pricing
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 3: ACCELERATION PLAN (FIXED PRICING)
  // =========================================================================
  acceleration_fixed: {
    id: 'acceleration_fixed',
    name: 'Acceleration Plan',
    slug: 'acceleration-plan-fixed',
    tier: 3,
    active: true,
    hidden: false,
    pricingModel: 'fixed',

    pricing: {
      fixed: {
        monthlyPrice: 249,
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: '3_month_opt_out'
      },
      performance: null
    },

    features: {
      included: [
        '✅ Everything in Standard Plan PLUS:',
        'Expedited processing (48-hour turnaround vs. 5-7 days)',
        'Priority dispute filing',
        'Weekly progress updates (vs. monthly)',
        'Priority phone support (2-hour response)',
        'Aggressive creditor negotiations',
        'Advanced dispute strategies',
        'Credit building product recommendations (affiliate)',
        'Faster bureau follow-ups',
        'Escalation procedures for stubborn items',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Attorney consultations',
        'Identity theft resolution',
        '24/7 support',
        'Personal credit coach',
        'Legal letter templates'
      ]
    },

    eligibility: {
      minScore: 400,
      maxScore: 600,
      minNegativeItems: 15,
      maxNegativeItems: 25,
      complexity: { min: 50, max: 75 },
      customRules: {
        budgetMin: 200,
        budgetMax: 300,
        urgentTimeline: true, // Buying house, car, refinancing
        timeline: 'urgent' // 3-5 months vs. 4-6 months
      }
    },

    targetAudience: 'Urgent timeline (buying home/car), complex cases, 15-25 items, willing to pay premium for speed',
    estimatedTimeline: '3-5 months',
    estimatedScoreIncrease: { min: 80, realistic: 110, max: 150 },

    color: '#F59E0B', // Orange
    icon: 'Zap',
    badge: 'Fast Track',
    displayOrder: 4,

    optOutClause: true,

    upsellTo: ['premium_fixed'],
    upsellTriggers: [
      'identity_theft_discovered',
      'legal_issues_found',
      'complexity_very_high',
      'needs_attorney_help'
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 3: ACCELERATION PLAN (PERFORMANCE PRICING)
  // =========================================================================
  acceleration_performance: {
    id: 'acceleration_performance',
    name: 'Acceleration Plan',
    slug: 'acceleration-plan-performance',
    tier: 3,
    active: true,
    hidden: false,
    pricingModel: 'performance',

    pricing: {
      fixed: null,
      performance: {
        monthlyBase: 169,
        perDeletionFee: 20, // Lower fee for higher tier
        perDeletionCalculation: 'per_bureau',
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: '3_month_opt_out'
      }
    },

    features: {
      included: [
        '✅ Everything in Standard Performance PLUS:',
        'Expedited processing (48-hour turnaround)',
        'Priority dispute filing',
        'Weekly progress updates',
        'Priority phone support (2-hour response)',
        'Aggressive creditor negotiations',
        'Advanced dispute strategies',
        'Credit building product recommendations',
        'Lower per-deletion fee ($20 vs $25)',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Attorney consultations',
        'Identity theft resolution',
        '24/7 support',
        'Personal credit coach'
      ]
    },

    eligibility: {
      minScore: 400,
      maxScore: 600,
      minNegativeItems: 15,
      maxNegativeItems: 25,
      complexity: { min: 50, max: 75 },
      customRules: {
        budgetMin: 150,
        budgetMax: 250,
        wantsAccountability: true,
        urgentTimeline: true,
        timeline: 'urgent'
      }
    },

    targetAudience: 'Urgent timeline + wants pay-for-results, complex cases, 15-25 items, lower per-deletion fee',
    estimatedTimeline: '3-5 months',
    estimatedScoreIncrease: { min: 80, realistic: 110, max: 150 },

    color: '#F59E0B', // Orange
    icon: 'Zap',
    badge: 'Fast Track + Pay for Results',
    displayOrder: 5,

    optOutClause: true,

    upsellTo: ['premium_performance'],
    upsellTriggers: [
      'identity_theft_discovered',
      'legal_issues_found',
      'needs_attorney_help'
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 4: PREMIUM COMPREHENSIVE (FIXED PRICING)
  // =========================================================================
  premium_fixed: {
    id: 'premium_fixed',
    name: 'Premium Comprehensive',
    slug: 'premium-comprehensive-fixed',
    tier: 4,
    active: true,
    hidden: false,
    pricingModel: 'fixed',

    pricing: {
      fixed: {
        monthlyPrice: 349,
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: '3_month_opt_out'
      },
      performance: null
    },

    features: {
      included: [
        '✅ Everything in Acceleration Plan PLUS:',
        'Attorney consultation (quarterly)',
        'Legal letter templates (attorney letterhead)',
        'Identity theft resolution',
        '24/7 priority support',
        'Personal credit coach',
        'Financial planning guidance',
        'VIP client portal with real-time updates',
        'Credit score simulation tools',
        'Custom payment plans for settled debts',
        'Advanced legal strategies',
        'FTC complaint filing assistance',
        'CFPB dispute assistance',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Direct access to Christopher (VIP tier only)',
        'Same-day response guarantee (VIP tier only)'
      ]
    },

    eligibility: {
      minScore: 300,
      maxScore: 550,
      minNegativeItems: 25,
      maxNegativeItems: 999,
      complexity: { min: 70, max: 100 },
      customRules: {
        budgetMin: 300,
        budgetMax: 500,
        complexCase: true,
        identityTheft: true, // Optional trigger
        legalIssues: true, // Bankruptcies, judgments, etc.
        timeline: 'flexible' // 6-12 months
      }
    },

    targetAudience: 'Very complex cases (25+ items), identity theft victims, legal issues, high-income professionals, wants best service',
    estimatedTimeline: '6-12 months',
    estimatedScoreIncrease: { min: 100, realistic: 150, max: 250 },

    color: '#8B5CF6', // Purple
    icon: 'Crown',
    badge: 'VIP Service',
    displayOrder: 6,

    optOutClause: true,

    upsellTo: ['vip_elite'], // Can upsell to hidden VIP tier
    upsellTriggers: [
      'requests_christopher_personally',
      'high_net_worth',
      'executive',
      'needs_white_glove'
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 4: PREMIUM COMPREHENSIVE (PERFORMANCE PRICING)
  // =========================================================================
  premium_performance: {
    id: 'premium_performance',
    name: 'Premium Comprehensive',
    slug: 'premium-comprehensive-performance',
    tier: 4,
    active: true,
    hidden: false,
    pricingModel: 'performance',

    pricing: {
      fixed: null,
      performance: {
        monthlyBase: 249,
        perDeletionFee: 15, // Best per-unit pricing (reward for premium)
        perDeletionCalculation: 'per_bureau',
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: '3_month_opt_out'
      }
    },

    features: {
      included: [
        '✅ Everything in Acceleration Performance PLUS:',
        'Attorney consultation (quarterly)',
        'Legal letter templates',
        'Identity theft resolution',
        '24/7 priority support',
        'Personal credit coach',
        'Financial planning guidance',
        'VIP client portal',
        'Best per-deletion fee ($15 vs $20 or $25)',
        'Reward pricing for premium tier',
        'IDIQ monitoring required (~$20/mo via affiliate)'
      ],
      notIncluded: [
        'Direct access to Christopher (VIP tier only)',
        'Same-day response guarantee (VIP tier only)'
      ]
    },

    eligibility: {
      minScore: 300,
      maxScore: 550,
      minNegativeItems: 25,
      maxNegativeItems: 999,
      complexity: { min: 70, max: 100 },
      customRules: {
        budgetMin: 200,
        budgetMax: 400,
        complexCase: true,
        wantsAccountability: true,
        wantsBestPerUnitPricing: true,
        timeline: 'flexible'
      }
    },

    targetAudience: 'Very complex cases + wants pay-for-results, 25+ items, best per-deletion fee as reward',
    estimatedTimeline: '6-12 months',
    estimatedScoreIncrease: { min: 100, realistic: 150, max: 250 },

    color: '#8B5CF6', // Purple
    icon: 'Crown',
    badge: 'VIP + Best Pricing',
    displayOrder: 7,

    optOutClause: true,

    upsellTo: ['vip_elite'],
    upsellTriggers: [
      'requests_christopher_personally',
      'high_net_worth',
      'needs_white_glove'
    ],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    }
  },

  // =========================================================================
  // TIER 5: VIP ELITE (HIDDEN - Build but don't display)
  // =========================================================================
  vip_elite: {
    id: 'vip_elite',
    name: 'VIP Elite',
    slug: 'vip-elite',
    tier: 5,
    active: true,
    hidden: true, // Built but not displayed until manually activated
    pricingModel: 'fixed',

    pricing: {
      fixed: {
        monthlyPrice: 599,
        setupFee: 0,
        paymentDue: 'after_month_1',
        billingCycle: 'monthly',
        contractLength: 6,
        cancellationPolicy: 'none' // No opt-out clause, 6-month minimum
      },
      performance: null // VIP doesn't offer performance pricing
    },

    features: {
      included: [
        '✅ Everything in Premium Plan PLUS:',
        'White-glove concierge service',
        'Direct access to Christopher (phone/text)',
        'Same-day response guarantee',
        'Unlimited strategy calls',
        'Legal representation if needed',
        'Debt settlement negotiation on your behalf',
        'Personalized financial roadmap',
        'Quarterly in-person or video meetings',
        'Maximum 10 VIP clients (exclusivity)',
        'Christopher personally handles case',
        'Priority above all other tiers',
        'IDIQ monitoring included (Christopher pays)'
      ],
      notIncluded: []
    },

    eligibility: {
      minScore: 0,
      maxScore: 850,
      minNegativeItems: 0,
      maxNegativeItems: 999,
      complexity: { min: 0, max: 100 },
      customRules: {
        budgetMin: 500,
        mustRequestDirectly: true, // Only offered when client asks
        highNetWorth: true,
        executive: true,
        wantsFounderAttention: true
      }
    },

    targetAudience: 'High-net-worth individuals, executives, business owners, wants Christopher personally, unlimited budget',
    estimatedTimeline: 'Custom (3-12 months)',
    estimatedScoreIncrease: { min: 50, realistic: 150, max: 300 },

    color: '#DC2626', // Red
    icon: 'Star',
    badge: 'Ultra Premium',
    displayOrder: 8,

    optOutClause: false, // 6-month minimum, no exceptions

    upsellTo: [], // Highest tier
    upsellTriggers: [],

    stats: {
      timesRecommended: 0,
      conversionRate: 0,
      avgClientLifetime: 0,
      avgLTV: 0
    },

    // Special VIP settings
    vipSettings: {
      maxClients: 10, // Never take more than 10 VIP clients
      autoRejectWhenFull: true,
      requiresApproval: true, // Christopher must approve all VIP clients
      priorityLevel: 'maximum'
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all active, non-hidden service plans
 * @returns {Array} Array of active service plans
 */
export const getActiveServicePlans = () => {
  return Object.values(SERVICE_PLANS).filter(plan => plan.active && !plan.hidden);
};

/**
 * Get a service plan by ID
 * @param {string} planId - The plan ID
 * @returns {Object|null} Service plan object or null if not found
 */
export const getServicePlanById = (planId) => {
  return SERVICE_PLANS[planId] || null;
};

/**
 * Get service plans sorted by display order
 * @param {boolean} includeHidden - Include hidden plans (default: false)
 * @returns {Array} Sorted array of service plans
 */
export const getServicePlansSorted = (includeHidden = false) => {
  return Object.values(SERVICE_PLANS)
    .filter(plan => plan.active && (includeHidden || !plan.hidden))
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Get pricing display text for a service plan
 * @param {string} planId - The plan ID
 * @returns {string} Formatted pricing text
 */
export const getPricingDisplay = (planId) => {
  const plan = SERVICE_PLANS[planId];
  if (!plan) return 'Pricing not available';

  if (plan.pricing.fixed) {
    return `$${plan.pricing.fixed.monthlyPrice}/month`;
  }

  if (plan.pricing.performance) {
    return `$${plan.pricing.performance.monthlyBase}/month + $${plan.pricing.performance.perDeletionFee} per item per bureau`;
  }

  return 'Custom pricing';
};

/**
 * Calculate expected total cost for performance pricing
 * @param {string} planId - The plan ID
 * @param {number} estimatedDeletions - Estimated number of item deletions
 * @param {number} months - Number of months (default: 6)
 * @returns {Object} Cost breakdown
 */
export const calculatePerformanceCost = (planId, estimatedDeletions, months = 6) => {
  const plan = SERVICE_PLANS[planId];
  if (!plan || !plan.pricing.performance) {
    return null;
  }

  const { monthlyBase, perDeletionFee } = plan.pricing.performance;

  // Assume deletions spread across all 3 bureaus (worst case)
  const deletionCostPerItem = perDeletionFee * 3; // $25 × 3 = $75 per item
  const totalDeletionCost = estimatedDeletions * deletionCostPerItem;
  const totalMonthlyBase = monthlyBase * months;
  const grandTotal = totalMonthlyBase + totalDeletionCost;

  return {
    monthlyBase,
    months,
    totalMonthlyBase,
    estimatedDeletions,
    deletionCostPerItem,
    totalDeletionCost,
    grandTotal,
    breakdown: `$${monthlyBase} × ${months} months = $${totalMonthlyBase} + ${estimatedDeletions} items × $${deletionCostPerItem} = $${totalDeletionCost}. Total: $${grandTotal}`
  };
};

/**
 * Compare fixed vs performance pricing for a tier
 * @param {string} fixedPlanId - Fixed plan ID
 * @param {string} performancePlanId - Performance plan ID
 * @param {number} estimatedDeletions - Estimated deletions
 * @param {number} months - Months (default: 6)
 * @returns {Object} Comparison data
 */
export const compareFixedVsPerformance = (fixedPlanId, performancePlanId, estimatedDeletions, months = 6) => {
  const fixedPlan = SERVICE_PLANS[fixedPlanId];
  const perfPlan = SERVICE_PLANS[performancePlanId];

  if (!fixedPlan || !perfPlan) return null;

  const fixedTotal = fixedPlan.pricing.fixed.monthlyPrice * months;
  const perfCost = calculatePerformanceCost(performancePlanId, estimatedDeletions, months);

  const difference = perfCost.grandTotal - fixedTotal;
  const percentDiff = ((difference / fixedTotal) * 100).toFixed(1);

  return {
    fixed: {
      planId: fixedPlanId,
      monthlyPrice: fixedPlan.pricing.fixed.monthlyPrice,
      total: fixedTotal
    },
    performance: {
      planId: performancePlanId,
      monthlyBase: perfCost.monthlyBase,
      deletionFees: perfCost.totalDeletionCost,
      total: perfCost.grandTotal
    },
    comparison: {
      difference,
      percentDiff,
      recommendation: difference > 0
        ? `Performance pricing costs $${Math.abs(difference)} MORE (${percentDiff}% higher)`
        : `Performance pricing saves $${Math.abs(difference)} (${Math.abs(percentDiff)}% lower)`
    }
  };
};

// ============================================================================
// IDIQ CONFIGURATION
// ============================================================================

export const IDIQ_CONFIG = {
  partnerId: '11981',
  apiBaseUrl: 'https://api.identityiq.com/pif-service/',
  affiliateMonthlyPrice: 20, // Approximate, keep vague ("about $20/month")
  requiredForTiers: ['standard_fixed', 'standard_performance', 'acceleration_fixed', 'acceleration_performance', 'premium_fixed', 'premium_performance'],
  notRequiredForTiers: ['diy'], // DIY doesn't require IDIQ
  includedInTiers: ['vip_elite'], // VIP includes IDIQ (Christopher pays)

  // IDIQ lapse handling (3-tier response)
  lapseHandling: {
    tier1: {
      delay: 0, // Immediate
      actions: ['send_email_urgent', 'send_sms'],
      emailTemplate: 'idiq_lapse_tier1',
      smsTemplate: 'idiq_lapse_sms_tier1'
    },
    tier2: {
      delay: 48, // 48 hours after tier 1
      actions: ['send_email_second_notice', 'phone_call_reminder'],
      emailTemplate: 'idiq_lapse_tier2'
    },
    tier3: {
      delay: 48, // 48 hours after tier 2 (96 hours total)
      actions: ['alert_staff', 'pause_service', 'send_email_service_paused'],
      staffAlert: {
        assignTo: 'laurie',
        priority: 'urgent',
        title: 'URGENT - Client IDIQ Lapsed',
        description: 'Client has not reinstated IDIQ after 2 reminders. Service paused. May cause underperformance.'
      },
      emailTemplate: 'idiq_lapse_tier3_service_paused'
    }
  }
};

// ============================================================================
// PAYMENT TERMS (CROA COMPLIANCE)
// ============================================================================

export const PAYMENT_TERMS = {
  // CROA-compliant payment rules
  croa: {
    noUpfrontFees: true, // Cannot charge before services performed
    firstPaymentTiming: 'after_month_1', // First payment AFTER Month 1 ends
    exceptions: ['diy'], // DIY is educational product, can be prepaid

    // 3-day right to cancel (federal law)
    rightToCancel: {
      days: 3,
      mustBeInContract: true,
      noFeesIfCanceled: true
    },

    // Contract requirements
    contractRequirements: {
      writtenContract: true,
      signatureRequired: true,
      mustInclude: [
        'Services to be performed',
        'Total cost',
        'Payment schedule',
        'Right to cancel',
        '3-month opt-out clause (if applicable)',
        'Refund policy',
        'Business contact information'
      ]
    }
  },

  // Billing cycles
  billingCycles: {
    monthly: 'Monthly billing (due after each month of service)',
    quarterly: 'Not offered (would violate CROA prepayment rules)',
    annual: 'Not offered (would violate CROA prepayment rules)',
    diySonly: 'DIY can offer prepaid discounts (legal exception)'
  },

  // Performance-based fee collection
  performanceFees: {
    timing: 'end_of_month', // Collect deletion fees at month end
    verificationRequired: true, // Must verify deletion before charging
    itemizedBilling: true, // Show each deletion on invoice
    calculation: 'per_bureau', // $25 per item per bureau
    maxPerItem: 75 // 3 bureaus × $25 = $75 max per item
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  SERVICE_PLANS,
  getActiveServicePlans,
  getServicePlanById,
  getServicePlansSorted,
  getPricingDisplay,
  calculatePerformanceCost,
  compareFixedVsPerformance,
  IDIQ_CONFIG,
  PAYMENT_TERMS
};
