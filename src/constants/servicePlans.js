// src/constants/servicePlans.js
// ============================================================================
// SERVICE PLANS CONFIGURATION - COMPLETE WITH BUSINESS TERMS
// ============================================================================
// Version: 2.0 COMPLETE
// Date: January 16, 2026
//
// BUSINESS RULES:
// - Standard: 6-month minimum, early termination = remaining balance
// - Premium: 6-month minimum + $200 setup (attorney review within 30 days)
// - Pay-For-Delete: $49 setup + 45-day post-cancellation access required
// - DIY: No minimum, cancel anytime
// ============================================================================

export const SERVICE_PLANS = [
  {
    id: 'diy',
    name: 'DIY',
    slug: 'diy',

    // Pricing
    price: 39,
    priceDisplay: '$39',
    priceAnnual: 468,
    setupFee: 0,
    setupFeeDisplay: '$0',
    billingCycle: 'month',

    // Terms
    minimumTermMonths: 0,
    minimumTermDisplay: 'None',
    hasMinimumTerm: false,
    cancellationPolicy: 'Cancel anytime',
    earlyTerminationFee: false,
    earlyTerminationFormula: null,
    postCancellationAccessDays: 0,
    requiresCreditReportAccess: false,
    refundPolicy: '30-day money back guarantee',
    refundPeriodDays: 30,

    // UI
    popular: false,
    recommended: false,
    position: 1,
    category: 'self-service',
    level: 'budget',
    badge: null,
    badgeColor: null,
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    highlightColor: '#6b7280',

    // Marketing
    tagline: 'Take Control of Your Credit',
    description: 'Self-service credit repair with templates and guidance',
    shortDescription: 'Budget-friendly self-service option',

    // Features
    features: [
      'Dispute letter templates library',
      'Step-by-step video guidance',
      'Educational resource center',
      'Email support (24-48 hour response)',
      'Monthly credit report check',
      'Member portal access',
      'Progress tracking tools'
    ],

    // Service Details
    idealFor: 'Self-motivated individuals on a budget',
    timeline: '6-12 months typical',
    support: 'Email only (24-48hr response)',
    successRate: '65%',
    avgDeletions: '3-5 items',

    // Terms Details
    termsHighlights: [
      'No minimum commitment',
      'Cancel anytime',
      '30-day money back guarantee',
      'No early termination fees'
    ],
    termsFull: `
**DIY Service Terms:**
- Month-to-month subscription
- No minimum term commitment
- Cancel anytime with immediate effect
- 30-day money back guarantee
- Access ends upon cancellation
- No contracts required
    `.trim()
  },

  {
    id: 'standard',
    name: 'Standard',
    slug: 'standard',

    // Pricing
    price: 149,
    priceDisplay: '$149',
    priceAnnual: 1788,
    setupFee: 0,
    setupFeeDisplay: '$0',
    billingCycle: 'month',

    // Terms
    minimumTermMonths: 6,
    minimumTermDisplay: '6 months',
    hasMinimumTerm: true,
    cancellationPolicy: 'Cancel after 6 months with 30-day notice',
    earlyTerminationFee: true,
    earlyTerminationFormula: 'Remaining months × $149',
    earlyTerminationExample: 'Cancel after 3 months = $447 due (3 × $149)',
    postCancellationAccessDays: 0,
    requiresCreditReportAccess: true,
    refundPolicy: '60-day money back guarantee (first 60 days only)',
    refundPeriodDays: 60,

    // UI
    popular: true,
    recommended: true,
    position: 2,
    category: 'full-service',
    level: 'standard',
    badge: 'MOST POPULAR',
    badgeColor: 'primary',
    buttonText: 'Get Started',
    buttonVariant: 'contained',
    highlightColor: '#3b82f6',

    // Marketing
    tagline: 'Professional Full-Service Credit Repair',
    description: 'Professional credit repair at an affordable price',
    shortDescription: 'Full-service with dedicated support',

    // Features
    features: [
      'Professional dispute letter creation',
      'Direct communication with all 3 bureaus',
      'Real-time credit monitoring',
      'Online dispute tracking dashboard',
      'Monthly detailed progress reports',
      'Phone + email support (same-day response)',
      'Dedicated support team',
      'Member portal with full access',
      'Typically complete in 3-6 months',
      '6-MONTH MINIMUM COMMITMENT REQUIRED'
    ],

    // Service Details
    idealFor: 'Most clients seeking professional help and best value',
    timeline: '3-6 months typical',
    support: 'Phone + Email (same-day response)',
    successRate: '85%',
    avgDeletions: '5-10 items',

    // Terms Details
    termsHighlights: [
      '6-month minimum commitment',
      'Early cancellation = remaining balance due',
      '60-day money back guarantee',
      'After 6 months: cancel with 30-day notice'
    ],
    termsFull: `
**Standard Service Terms:**
- 6-month minimum service commitment required
- Monthly billing at $149/month
- Early cancellation fee: Remaining months × $149
- Example: Cancel after 3 months = $447 due
- After 6 months: Cancel anytime with 30-day notice
- 60-day money back guarantee (first 60 days only)
- Credit report authorization required for service duration
- Services continue during 30-day notice period
    `.trim()
  },

  {
    id: 'premium',
    name: 'Premium',
    slug: 'premium',

    // Pricing
    price: 349,
    priceDisplay: '$349',
    priceAnnual: 4188,
    setupFee: 200,
    setupFeeDisplay: '$200',
    setupFeeIncludes: 'Credit Attorney Overview (delivered within 30 days)',
    billingCycle: 'month',

    // Terms
    minimumTermMonths: 6,
    minimumTermDisplay: '6 months',
    hasMinimumTerm: true,
    cancellationPolicy: 'Cancel after 6 months with 30-day notice',
    earlyTerminationFee: true,
    earlyTerminationFormula: 'Remaining months × $349 (setup fee non-refundable)',
    earlyTerminationExample: 'Cancel after 2 months = $1,396 due (4 × $349), $200 setup non-refundable',
    postCancellationAccessDays: 0,
    requiresCreditReportAccess: true,
    refundPolicy: '90-day money back guarantee (first 90 days, excludes $200 setup fee)',
    refundPeriodDays: 90,

    // Attorney Review
    includesAttorneyReview: true,
    attorneyReviewDeliveryDays: 30,
    attorneyReviewDescription: 'Licensed credit attorney reviews complete credit profile, identifies violations, provides written legal assessment and dispute strategy',

    // UI
    popular: false,
    recommended: false,
    position: 3,
    category: 'full-service',
    level: 'premium',
    badge: 'FASTEST + ATTORNEY',
    badgeColor: 'success',
    buttonText: 'Go Premium',
    buttonVariant: 'contained',
    highlightColor: '#10b981',

    // Marketing
    tagline: 'VIP Service with Credit Attorney Review',
    description: 'Maximum results in minimum time with legal expertise',
    shortDescription: 'VIP service with attorney review included',

    // Features
    features: [
      '$200 SETUP INCLUDES CREDIT ATTORNEY REVIEW',
      'Attorney review delivered within 30 days',
      'Everything in Standard PLUS:',
      'Priority processing (expedited handling)',
      'Dedicated personal credit specialist',
      'Aggressive dispute strategies',
      'Direct creditor negotiations',
      'Goodwill letter campaigns',
      'Personalized credit building plan',
      'Bi-weekly detailed updates',
      '24/7 priority phone support',
      'Text message updates available',
      'Typically complete in 1-3 months',
      '6-MONTH MINIMUM COMMITMENT REQUIRED'
    ],

    // Service Details
    idealFor: 'Clients needing fast results, legal review, and premium white-glove service',
    timeline: '1-3 months typical',
    support: '24/7 Priority (immediate response)',
    successRate: '92%',
    avgDeletions: '8-15 items',

    // Terms Details
    termsHighlights: [
      '$200 setup fee (includes attorney review)',
      'Attorney review within 30 days',
      '6-month minimum commitment',
      'Setup fee non-refundable',
      'Early cancellation = remaining balance due',
      '90-day money back (excludes setup fee)'
    ],
    termsFull: `
**Premium Service Terms:**
- $200 one-time setup fee (non-refundable under all circumstances)
- Setup fee includes licensed credit attorney review
- Attorney review delivered within 30 days of service start
- 6-month minimum service commitment required
- Monthly billing at $349/month
- Early cancellation fee: Remaining months × $349
- Example: Cancel after 2 months = $1,396 due + $200 setup non-refundable
- After 6 months: Cancel anytime with 30-day notice
- 90-day money back guarantee (first 90 days, excludes $200 setup fee)
- Attorney review provided even if service cancelled early
- Credit report authorization required for service duration
- Services continue during 30-day notice period
    `.trim()
  },

  {
    id: 'pay-for-delete',
    name: 'Pay-For-Delete',
    slug: 'pay-for-delete',

    // Pricing
    price: 0,
    priceDisplay: '$0',
    priceAnnual: 0,
    perDeleteFee: 149,
    perDeleteDisplay: '$149',
    setupFee: 49,
    setupFeeDisplay: '$49',
    setupFeeIncludes: 'Account setup + Credit monitoring access',
    billingCycle: 'per-result',

    // Terms
    minimumTermMonths: 0,
    minimumTermDisplay: 'None',
    hasMinimumTerm: false,
    cancellationPolicy: 'Cancel anytime (45-day monitoring period applies)',
    earlyTerminationFee: false,
    earlyTerminationFormula: null,
    postCancellationAccessDays: 45,
    postCancellationAccessRequired: true,
    postCancellationAccessReason: 'Items disputed before cancellation may delete within 45 days',
    requiresCreditReportAccess: true,
    requiresCreditReportAccessPostCancel: true,
    refundPolicy: 'No monthly fees - only pay for results (setup fee non-refundable)',
    refundPeriodDays: 0,

    // UI
    popular: false,
    recommended: false,
    position: 4,
    category: 'results-based',
    level: 'performance',
    badge: 'NO RISK + $49 SETUP',
    badgeColor: 'warning',
    buttonText: 'Try Risk-Free',
    buttonVariant: 'outlined',
    highlightColor: '#f59e0b',

    // Marketing
    tagline: 'Zero Monthly Fees - Only Pay for Deletions',
    description: 'Only pay for verified results with $49 setup',
    shortDescription: '$49 setup, then only pay when items delete',

    // Features
    features: [
      '$49 one-time setup fee (account + monitoring)',
      'Zero monthly fees',
      '$149 only when items successfully deleted',
      'Same proven process as Standard plan',
      'No contracts required',
      'Pay only for verified results',
      'Email support included',
      '45-DAY POST-CANCELLATION ACCESS REQUIRED',
      'You pay for deletions within 45 days after cancel',
      'Example: Cancel Day 60, item deletes Day 90 = You pay $149'
    ],

    // Service Details
    idealFor: 'Risk-averse clients who want guaranteed results before paying',
    timeline: '3-6 months typical',
    support: 'Email (24-48hr response)',
    successRate: '85%',
    avgDeletions: '5-8 items',
    avgCost: '$794-$1,241 (setup + deletions)',

    // Terms Details
    termsHighlights: [
      '$49 setup fee (non-refundable)',
      'No monthly fees ever',
      '$149 per successful deletion',
      '45-day post-cancellation monitoring REQUIRED',
      'Pay for deletions within 45 days after cancel',
      'Credit report access mandatory for 45 days'
    ],
    termsFull: `
**Pay-For-Delete Service Terms:**
- $49 one-time setup fee (non-refundable)
- Setup fee covers account setup and credit monitoring access
- Zero monthly fees - only pay per deletion
- $149 charged for each successful deletion
- No contracts or minimum commitments
- 45-DAY POST-CANCELLATION PERIOD MANDATORY:
  * You must maintain credit report access for 45 days after cancellation
  * Items disputed before cancellation may delete during this period
  * You pay $149 for each deletion occurring within 45-day window
  * Example: Cancel on Day 60, item deletes on Day 90 (within 45 days) = $149 due
  * After 45 days from cancellation, no further charges
- Credit report authorization required during service AND 45 days post-cancel
- Monthly billing for prior month's deletions
- Cancellation confirmed after 45-day period ends + all payments settled
    `.trim()
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate early termination fee for plans with minimum terms
 * @param {string} planId - Plan ID
 * @param {number} monthsCompleted - Number of months completed
 * @returns {object} { fee, remaining, total, breakdown }
 */
export const calculateEarlyTerminationFee = (planId, monthsCompleted) => {
  const plan = getPlanById(planId);

  if (!plan || !plan.hasMinimumTerm) {
    return { fee: 0, remaining: 0, total: 0, breakdown: 'No early termination fee' };
  }

  const remainingMonths = Math.max(0, plan.minimumTermMonths - monthsCompleted);
  const fee = remainingMonths * plan.price;
  const alreadyPaid = monthsCompleted * plan.price + plan.setupFee;
  const totalCost = (plan.minimumTermMonths * plan.price) + plan.setupFee;

  return {
    fee,
    remaining: remainingMonths,
    total: totalCost,
    alreadyPaid,
    breakdown: `${remainingMonths} months × $${plan.price} = $${fee}`,
    setupFeeNote: plan.setupFee > 0 ? `Setup fee $${plan.setupFee} non-refundable` : null
  };
};

/**
 * Check if plan can be cancelled without fee
 * @param {string} planId - Plan ID
 * @param {number} monthsCompleted - Months completed
 * @returns {boolean} True if can cancel without fee
 */
export const canCancelWithoutFee = (planId, monthsCompleted) => {
  const plan = getPlanById(planId);

  if (!plan) return false;
  if (!plan.hasMinimumTerm) return true;

  return monthsCompleted >= plan.minimumTermMonths;
};

/**
 * Get cancellation date considering post-cancellation periods
 * @param {string} planId - Plan ID
 * @param {Date} requestDate - Cancellation request date
 * @returns {object} { effectiveDate, finalBillingDate, accessEndsDate }
 */
export const getCancellationDates = (planId, requestDate = new Date()) => {
  const plan = getPlanById(planId);

  if (!plan) return null;

  const request = new Date(requestDate);

  // Effective date (when billing stops)
  let effectiveDate = new Date(request);
  if (plan.id !== 'diy' && plan.id !== 'pay-for-delete') {
    // 30-day notice for Standard/Premium
    effectiveDate.setDate(effectiveDate.getDate() + 30);
  }

  // Access ends date
  let accessEndsDate = new Date(effectiveDate);
  if (plan.postCancellationAccessDays > 0) {
    accessEndsDate.setDate(accessEndsDate.getDate() + plan.postCancellationAccessDays);
  }

  // Final billing date (last day of charges)
  let finalBillingDate = new Date(accessEndsDate);

  return {
    requestDate: request,
    effectiveDate, // When service stops
    accessEndsDate, // When credit report access ends
    finalBillingDate, // Last possible billing date
    noticePeriodDays: plan.id === 'diy' || plan.id === 'pay-for-delete' ? 0 : 30,
    postCancelDays: plan.postCancellationAccessDays || 0
  };
};

/**
 * Get plan by ID
 * @param {string} id - Plan ID
 * @returns {object|null} Plan object or null
 */
export const getPlanById = (id) => {
  return SERVICE_PLANS.find(plan => plan.id === id) || null;
};

/**
 * Get plan by slug
 * @param {string} slug - Plan slug
 * @returns {object|null} Plan object or null
 */
export const getPlanBySlug = (slug) => {
  return SERVICE_PLANS.find(plan => plan.slug === slug) || null;
};

/**
 * Get popular plan
 * @returns {object} Popular plan object
 */
export const getPopularPlan = () => {
  return SERVICE_PLANS.find(plan => plan.popular) || SERVICE_PLANS[1];
};

/**
 * Get plans for display (sorted by position)
 * @returns {array} Array of plans sorted by position
 */
export const getPlansForDisplay = () => {
  return [...SERVICE_PLANS].sort((a, b) => a.position - b.position);
};

/**
 * Validate plan ID
 * @param {string} planId - Plan ID to validate
 * @returns {boolean} True if valid
 */
export const isValidPlanId = (planId) => {
  return SERVICE_PLANS.some(plan => plan.id === planId);
};

/**
 * Get total first payment amount
 * @param {string} planId - Plan ID
 * @returns {object} { total, breakdown }
 */
export const getFirstPaymentAmount = (planId) => {
  const plan = getPlanById(planId);
  if (!plan) return { total: 0, breakdown: 'Invalid plan' };

  const total = plan.price + plan.setupFee;
  const parts = [];

  if (plan.price > 0) {
    parts.push(`$${plan.price} (first month)`);
  }
  if (plan.setupFee > 0) {
    parts.push(`$${plan.setupFee} (setup fee)`);
  }

  return {
    total,
    monthlyRate: plan.price,
    setupFee: plan.setupFee,
    breakdown: parts.length > 0 ? parts.join(' + ') : '$0 (pay-per-delete)',
    perDeleteFee: plan.perDeleteFee || 0
  };
};

/**
 * Check if plan has special terms that require acknowledgment
 * @param {string} planId - Plan ID
 * @returns {object} { hasSpecialTerms, requirements }
 */
export const getPlanTermRequirements = (planId) => {
  const plan = getPlanById(planId);
  if (!plan) return { hasSpecialTerms: false, requirements: [] };

  const requirements = [];

  if (plan.hasMinimumTerm) {
    requirements.push({
      type: 'minimumTerm',
      label: `${plan.minimumTermDisplay} minimum commitment`,
      description: `Early cancellation requires payment of remaining balance (${plan.earlyTerminationFormula})`
    });
  }

  if (plan.setupFee > 0) {
    requirements.push({
      type: 'setupFee',
      label: `${plan.setupFeeDisplay} setup fee`,
      description: plan.setupFeeIncludes || 'Non-refundable setup fee'
    });
  }

  if (plan.postCancellationAccessDays > 0) {
    requirements.push({
      type: 'postCancellationAccess',
      label: `${plan.postCancellationAccessDays}-day post-cancellation access`,
      description: plan.postCancellationAccessReason || 'Credit report access maintained after cancellation'
    });
  }

  if (plan.includesAttorneyReview) {
    requirements.push({
      type: 'attorneyReview',
      label: 'Attorney review included',
      description: `${plan.attorneyReviewDescription} - Delivered within ${plan.attorneyReviewDeliveryDays} days`
    });
  }

  return {
    hasSpecialTerms: requirements.length > 0,
    requirements
  };
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const PLAN_IDS = {
  DIY: 'diy',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  PAY_FOR_DELETE: 'pay-for-delete'
};

export const VALID_PLAN_IDS = ['diy', 'standard', 'premium', 'pay-for-delete'];

export default SERVICE_PLANS;
