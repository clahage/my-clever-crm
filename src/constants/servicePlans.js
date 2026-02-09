// ============================================================
// Path: /src/constants/servicePlans.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// 
// MASTER SERVICE PLANS CONFIGURATION
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all plan data.
// Every component that references plans imports from here.
// 
// STRUCTURE:
//   - SERVICE_PLANS: The 3 active plans (Essentials, Professional, VIP)
//   - LEGACY_PLANS: Grandfathered plans (Acceleration, Hybrid, Pay-For-Delete)
//   - IDIQ_CONFIG: IDIQ monitoring requirements & pricing
//   - DISPUTE_DELIVERY: Mail/fax/certification configuration
//   - CONSULTATION_RATES: Tiered consultation pricing by plan
//   - Helper functions for lookups, validation, and display
// ============================================================

// ============================================================
// IDIQ CREDIT MONITORING CONFIGURATION
// ============================================================
export const IDIQ_CONFIG = {
  // ===== Partner Info =====
  partnerId: '11981',
  partnerName: 'IdentityIQ',
  partnerAbbrev: 'IDIQ',

  // ===== Pricing =====
  monthlyRate: 21.86,          // Partner discounted rate
  retailRate: 29.99,           // What client would pay without us
  monthlySavings: 8.13,        // retailRate - monthlyRate
  firstReportFree: true,       // First credit report is free via partner link

  // ===== Requirements =====
  enrollmentDeadlineDays: 20,  // Must enroll within 20 days of signing
  postCancelRetentionDays: 45, // Must keep IDIQ active 45 days after cancel
  postCancelExemptPlans: ['essentials'], // These plans skip 45-day retention

  // ===== Disclosure Text =====
  // Use this EXACT language on plan pages, contracts, and onboarding
  disclosureText: `All Speedy Credit Repair service plans require an active IdentityIQ (IDIQ) credit monitoring subscription. This is a separate subscription paid directly to IdentityIQ — not to Speedy Credit Repair. As a Speedy Credit Repair partner client, you receive a discounted rate of $21.86/month (retail value $29.99/month — you save $8.13/month). Your first credit report is FREE through our partner link. We can assist you with enrollment at the time of signing, or you may enroll within 20 days of your service agreement.`,
  
  postCancelText: `If you cancel your Speedy Credit Repair service, your IDIQ subscription must remain active for 45 days to allow billing for any deletions from work in progress (except Essentials plan clients). After that, you are free to keep or cancel your IDIQ subscription at your discretion.`,

  whyRequiredText: `We use your IDIQ account to pull 3-bureau credit reports and scores monthly, track your progress, and generate AI-powered dispute strategies. Standardized monitoring ensures accurate, consistent service.`,
};


// ============================================================
// DISPUTE DELIVERY CONFIGURATION
// ============================================================
// We use MAIL and FAX for disputes. Certification is selective,
// used only when proof of delivery has legal significance.
// ============================================================
export const DISPUTE_DELIVERY = {
  // ===== Primary Methods =====
  methods: ['mail', 'fax'],

  // ===== Certification Rules =====
  // NOT every letter needs certified mail — it adds cost and is
  // overkill for routine round-1 bureau disputes. Use certified
  // ONLY for items where proof of delivery matters legally.
  certification: {
    // These letter types ALWAYS get certified mail
    alwaysCertified: [
      'debt_validation',          // FDCPA requires provable delivery
      'cease_and_desist',         // Legal demand — need proof
      'escalated_dispute',        // After initial dispute was ignored
      'pay_for_delete_offer',     // Financial negotiation — need proof
      'insurance_claim_dispute',  // High-stakes financial item
      'identity_theft_affidavit', // Legal document — always certify
    ],
    // These letter types use STANDARD mail (or fax)
    standardDelivery: [
      'initial_bureau_dispute',   // Round 1 disputes to CRAs
      'goodwill_letter',          // Request, not demand
      'inquiry_removal',          // Low-stakes request
      'information_correction',   // Name/address/SSN corrections
    ],
    // These should be evaluated case-by-case
    caseByCase: [
      'follow_up_dispute',        // Certify if first was ignored
      'creditor_direct_dispute',  // Certify for large balances
      'response_to_verification', // Certify if disputing verification
    ],
  },

  // ===== Cost per letter =====
  costs: {
    standardMail: 1.50,       // Stamp + envelope + printing
    certifiedMail: 8.50,      // Certified mail with return receipt
    fax: 0.75,                // Per page via Telnyx
    faxCoverPage: true,       // Always include cover page
  },

  // ===== Who Sends by Plan =====
  // Essentials: Client sends (or buys à la carte fax/mail service)
  // Professional: We send via standard mail or fax
  // VIP: We send via appropriate method (certified when warranted)
  planDelivery: {
    essentials: {
      whoSends: 'client',
      faxAvailable: false,          // Must buy à la carte
      certifiedAvailable: false,    // Must buy à la carte
      aLaCarteFaxSend: true,        // Can purchase fax sending
      aLaCarteMailSend: true,       // Can purchase we-mail-it
      aLaCarteCertifiedSend: true,  // Can purchase certified
    },
    professional: {
      whoSends: 'speedy',
      faxAvailable: true,
      certifiedAvailable: true,     // For items that warrant it
      aLaCarteFaxSend: false,       // Already included
      aLaCarteMailSend: false,      // Already included
      aLaCarteCertifiedSend: false, // Already included
    },
    vip: {
      whoSends: 'speedy',
      faxAvailable: true,
      certifiedAvailable: true,
      aLaCarteFaxSend: false,
      aLaCarteMailSend: false,
      aLaCarteCertifiedSend: false,
    },
  },
};


// ============================================================
// CONSULTATION PRICING — $250/HOUR BASE
// ============================================================
// Billed in 20-minute blocks with progressive volume discounts.
// Additional plan-level discounts apply.
// VIP gets 20 min/month included on request.
// ============================================================
export const CONSULTATION_RATES = {
  baseHourlyRate: 250,  // $250/hour for a senior credit expert

  // ===== Block Pricing (Non-Client / Essentials = full price) =====
  blocks: [
    {
      minutes: 20,
      basePrice: 85,        // $85 for 20 min ($255/hr effective)
      label: '20-Minute Session',
      description: 'Quick focused session — one topic, one strategy',
    },
    {
      minutes: 40,
      basePrice: 155,        // $155 for 40 min ($232.50/hr — save $15)
      savings: 15,
      label: '40-Minute Session',
      description: 'In-depth review — multiple accounts or complex scenario',
    },
    {
      minutes: 60,
      basePrice: 210,        // $210 for 60 min ($210/hr — save $40)
      savings: 40,
      label: '60-Minute Deep Dive',
      description: 'Comprehensive strategy session — full 3-bureau review with action plan',
    },
  ],

  // ===== Plan-Level Discounts =====
  planDiscounts: {
    // No plan / non-client: full base price
    none: { 
      discountPercent: 0, 
      label: 'Standard Rate',
    },
    // Essentials: full base price (incentive to upgrade)
    essentials: { 
      discountPercent: 0, 
      label: 'Standard Rate',
    },
    // Professional: 20% off base price
    professional: { 
      discountPercent: 20, 
      label: '20% Plan Discount',
    },
    // VIP: 20 min/month included, then 20% off additional
    vip: { 
      discountPercent: 20, 
      label: '20% Plan Discount',
      includedMinutesPerMonth: 20,
      includedNote: '20 min/month included on request',
    },
  },
};


// ============================================================
// THE 3 ACTIVE SERVICE PLANS
// ============================================================
export const SERVICE_PLANS = {
  // ====================================================
  // PLAN 1: ESSENTIALS — "Take Control of Your Credit"
  // ====================================================
  // Client-driven with AI tools. Client creates and sends
  // their own disputes using our templates and guidance.
  // À la carte services available for extra help.
  // ====================================================
  essentials: {
    id: 'essentials',
    name: 'Essentials',
    tagline: 'Take Control of Your Credit',
    badge: 'STARTER',
    badgeColor: '#3b82f6',  // Blue

    // ===== Pricing =====
    monthlyPrice: 79,
    setupFee: 49,
    perItemDeletionFee: null,  // N/A — self-service plan
    totalMonthlyWithIdiq: 100.86,  // 79 + 21.86

    // ===== Contract Terms =====
    contractTerm: 'month-to-month',
    contractMonths: null,       // No commitment
    cancellationPeriod: null,   // Cancel anytime
    earlyExitOption: null,
    idiqPostCancelRetention: false, // Exempt from 45-day rule

    // ===== Who Does What =====
    disputeAuthor: 'client',     // Client selects from AI templates
    disputeSender: 'client',     // Client prints/mails themselves
    portalUpdatedBy: 'client',   // Client logs their own progress
    autoUpdates: ['scores', 'reports', 'ai_strategy'],  // AI + IDIQ auto
    disputeFrequency: 'self-paced',
    faxDisputing: false,         // À la carte only
    certifiedMail: false,        // À la carte only

    // ===== Included Features =====
    features: [
      'AI-powered 3-bureau credit analysis & dispute strategy',
      'Professional dispute letter templates (AI-populated with your data)',
      'Step-by-step video guides for disputing by mail and online',
      'Client portal with progress tracking & score timeline',
      'Monthly AI strategy refresh based on credit report changes',
      'Credit education library (articles, videos, tools)',
      'Email support (24–48 hour response time)',
      'Secured card & credit-building recommendations',
    ],

    // ===== NOT Included (drive à la carte + upgrades) =====
    notIncluded: [
      'We write and send disputes for you',
      'Phone consultations (available à la carte)',
      'Creditor intervention calls (available à la carte)',
      'Fax disputing (available à la carte)',
      'Certified mail sending (available à la carte)',
      'Cease & desist letters',
      '30-day response letters (available à la carte)',
      'Dedicated account manager',
      'Deletion fee billing (self-service results)',
    ],

    // ===== Ideal Customer =====
    idealFor: 'Self-motivated individuals with minor credit issues (1–5 items) who want expert AI tools at a low monthly cost and are willing to do the legwork themselves.',

    // ===== Display Order =====
    displayOrder: 1,
    isPopular: false,
    isActive: true,
  },

  // ====================================================
  // PLAN 2: PROFESSIONAL — "We Handle Everything For You"
  // ====================================================
  // Full-service. We write, send, track, and manage all
  // disputes. Client sits back and watches results in portal.
  // $25 per item deleted per bureau (success fee).
  // ====================================================
  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'We Handle Everything For You',
    badge: 'MOST POPULAR ⭐',
    badgeColor: '#059669',  // Green

    // ===== Pricing =====
    monthlyPrice: 149,
    setupFee: 0,
    perItemDeletionFee: 25,   // $25 per item deleted, per bureau
    totalMonthlyWithIdiq: 170.86,  // 149 + 21.86

    // ===== Contract Terms =====
    contractTerm: '6-month',
    contractMonths: 6,
    cancellationPeriod: 5,      // 5-day right to cancel
    earlyExitOption: 'Cancel after 3rd payment if no results demonstrated',
    idiqPostCancelRetention: true,  // Must keep IDIQ 45 days post-cancel

    // ===== Who Does What =====
    disputeAuthor: 'speedy',     // We write all disputes
    disputeSender: 'speedy',     // We send everything (mail + fax)
    portalUpdatedBy: 'speedy',   // Our team updates portal
    autoUpdates: ['scores', 'reports', 'ai_strategy', 'dispute_status'],
    disputeFrequency: 'monthly',  // Monthly dispute cycles
    faxDisputing: true,
    certifiedMail: true,          // For items that warrant it

    // ===== Included Features =====
    features: [
      'Everything in Essentials, PLUS:',
      'Full-service dispute management — we write, send, and track everything',
      'Unlimited dispute letters per month (mail + fax)',
      'Selective certified mail for legally significant items',
      'Unlimited phone consultations (20% off base rate)',
      'Creditor intervention calls & negotiation',
      'Debt validation requests (we handle start to finish)',
      'Goodwill letter campaigns',
      'Cease & desist letters',
      '30-day bureau response letters (we craft and send follow-ups)',
      'Monthly credit report refresh & AI analysis',
      'Dedicated account manager',
      'Same-day email support + phone support',
      '$25 per item successfully deleted, per bureau',
    ],

    // ===== NOT Included (VIP differentiators) =====
    notIncluded: [
      'Bi-weekly dispute cycles (VIP only)',
      'Deletion fees included (VIP only)',
      'Weekly progress reports (VIP only)',
      'Direct cell phone access to specialist (VIP only)',
      '90-day money-back guarantee (VIP only)',
    ],

    // ===== Ideal Customer =====
    idealFor: 'The typical client who wants professional help without lifting a finger. Best value for moderate-to-complex cases (5–15+ items).',

    // ===== Display Order =====
    displayOrder: 2,
    isPopular: true,
    isActive: true,
  },

  // ====================================================
  // PLAN 3: VIP CONCIERGE — "Maximum Results, Maximum Speed"
  // ====================================================
  // Everything in Professional, but 2× faster with bi-weekly
  // cycles, all deletion fees included, and white-glove service.
  // ====================================================
  vip: {
    id: 'vip',
    name: 'VIP Concierge',
    tagline: 'Maximum Results, Maximum Speed',
    badge: 'WHITE GLOVE',
    badgeColor: '#7c3aed',  // Purple

    // ===== Pricing =====
    monthlyPrice: 299,
    setupFee: 0,
    perItemDeletionFee: 0,    // ALL deletion fees included
    totalMonthlyWithIdiq: 320.86,  // 299 + 21.86

    // ===== Contract Terms =====
    contractTerm: '6-month',
    contractMonths: 6,
    cancellationPeriod: 5,
    earlyExitOption: null,
    resultsGuarantee: '90-day money-back guarantee',
    idiqPostCancelRetention: true,

    // ===== Who Does What =====
    disputeAuthor: 'speedy',
    disputeSender: 'speedy',
    portalUpdatedBy: 'speedy',
    autoUpdates: ['scores', 'reports', 'ai_strategy', 'dispute_status', 'weekly_reports'],
    disputeFrequency: 'bi-weekly',  // 2× faster than Professional
    faxDisputing: true,
    certifiedMail: true,

    // ===== Included Features =====
    features: [
      'Everything in Professional, PLUS:',
      'Bi-weekly dispute cycles (2× faster than Professional)',
      'ALL deletion fees INCLUDED — no per-item charges',
      'Direct-to-creditor escalation campaigns',
      'Goodwill letter campaigns (aggressive multi-round)',
      'Weekly progress reports emailed to you',
      'Priority queue processing on all disputes',
      'Full credit rebuilding strategy (secured cards, tradelines, utilization)',
      '90-day money-back guarantee if no results',
      'Direct cell phone access to senior specialist',
      '20 min/month expert consultation included on request',
      'Discounted tradeline rentals (15% off)',
      'Senior specialist assigned (not rotated)',
    ],

    notIncluded: [],

    // ===== Ideal Customer =====
    idealFor: 'Clients with complex cases, urgency (home purchase, job requirement), or 15+ negative items who want maximum speed and zero surprise charges.',

    // ===== Display Order =====
    displayOrder: 3,
    isPopular: false,
    isActive: true,
  },
};


// ============================================================
// LEGACY / GRANDFATHERED PLANS
// ============================================================
// These are NOT available for new sign-ups.
// Existing clients on these plans are grandfathered.
// Used for validation, display, and migration logic.
// ============================================================
export const LEGACY_PLANS = {
  acceleration: {
    id: 'acceleration',
    name: 'Acceleration',
    monthlyPrice: 199,
    isActive: false,
    migratesTo: 'vip',
    legacyNote: 'Grandfathered. New clients → VIP Concierge.',
  },
  hybrid: {
    id: 'hybrid',
    name: 'Hybrid',
    monthlyPrice: 99,
    isActive: false,
    migratesTo: 'professional',
    legacyNote: 'Grandfathered. New clients → Professional.',
  },
  payForDelete: {
    id: 'payForDelete',
    name: 'Pay-For-Delete',
    monthlyPrice: 0,
    isActive: false,
    migratesTo: 'professional',
    legacyNote: 'Grandfathered. Pay-for-results now built into Professional ($25/item).',
  },
  diy: {
    id: 'diy',
    name: 'DIY',
    monthlyPrice: 39,
    isActive: false,
    migratesTo: 'essentials',
    legacyNote: 'Grandfathered. New clients → Essentials ($79).',
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 149,
    isActive: false,
    migratesTo: 'professional',
    legacyNote: 'Grandfathered. New clients → Professional ($149).',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 349,
    isActive: false,
    migratesTo: 'vip',
    legacyNote: 'Grandfathered. New clients → VIP Concierge ($299).',
  },
};


// ============================================================
// COUPLES / FAMILY DISCOUNT
// ============================================================
export const COUPLES_DISCOUNT = {
  enabled: true,
  discountPercent: 20,       // 20% off the 2nd enrollment
  appliesTo: 'second_person', // Only the 2nd person gets discount
  eligiblePlans: ['essentials', 'professional', 'vip'],
  description: '20% off when a partner or family member enrolls',
  marketingText: 'Repair your credit together — 20% off the 2nd enrollment!',
};


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a plan by ID (active plans only)
 * @param {string} planId - 'essentials', 'professional', or 'vip'
 * @returns {object|null} Plan configuration or null
 */
export const getPlan = (planId) => {
  return SERVICE_PLANS[planId] || null;
};

/**
 * Get a plan by ID (includes legacy plans)
 * @param {string} planId
 * @returns {object|null}
 */
export const getAnyPlan = (planId) => {
  return SERVICE_PLANS[planId] || LEGACY_PLANS[planId] || null;
};

/**
 * Check if a plan ID is valid for new sign-ups
 * @param {string} planId
 * @returns {boolean}
 */
export const isValidNewPlan = (planId) => {
  return Boolean(SERVICE_PLANS[planId]?.isActive);
};

/**
 * Check if a plan ID is valid (including legacy/grandfathered)
 * @param {string} planId
 * @returns {boolean}
 */
export const isValidExistingPlan = (planId) => {
  return Boolean(SERVICE_PLANS[planId] || LEGACY_PLANS[planId]);
};

/**
 * Get active plans as sorted array for display
 * @returns {Array} Plans sorted by displayOrder
 */
export const getActivePlans = () => {
  return Object.values(SERVICE_PLANS)
    .filter(plan => plan.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

/**
 * Calculate consultation price for a plan + duration
 * @param {string} planId - 'essentials', 'professional', 'vip', or 'none'
 * @param {number} minutes - 20, 40, or 60
 * @returns {object} { price, savings, discount, isIncluded, label }
 */
export const getConsultationPrice = (planId, minutes) => {
  const block = CONSULTATION_RATES.blocks.find(b => b.minutes === minutes);
  if (!block) return null;

  const planDiscount = CONSULTATION_RATES.planDiscounts[planId] 
    || CONSULTATION_RATES.planDiscounts.none;

  // ===== VIP: Check if this falls within included time =====
  if (planId === 'vip' && minutes <= (planDiscount.includedMinutesPerMonth || 0)) {
    return {
      price: 0,
      originalPrice: block.basePrice,
      savings: block.basePrice,
      discount: '100% — included in VIP',
      isIncluded: true,
      label: `${block.label} — Included with VIP`,
      description: block.description,
      minutes: block.minutes,
    };
  }

  // ===== Apply plan discount =====
  const discountMultiplier = 1 - (planDiscount.discountPercent / 100);
  const discountedPrice = Math.round(block.basePrice * discountMultiplier);
  const totalSavings = block.basePrice - discountedPrice + (block.savings || 0);

  return {
    price: discountedPrice,
    originalPrice: block.basePrice,
    savings: totalSavings > 0 ? totalSavings : 0,
    discount: planDiscount.discountPercent > 0 
      ? `${planDiscount.discountPercent}% ${planDiscount.label}` 
      : null,
    isIncluded: false,
    label: block.label,
    description: block.description,
    minutes: block.minutes,
  };
};

/**
 * Determine if a letter type should use certified mail
 * @param {string} letterType - e.g. 'debt_validation', 'initial_bureau_dispute'
 * @returns {'certified'|'standard'|'evaluate'} Delivery recommendation
 */
export const getDeliveryRecommendation = (letterType) => {
  const { certification } = DISPUTE_DELIVERY;
  
  if (certification.alwaysCertified.includes(letterType)) return 'certified';
  if (certification.standardDelivery.includes(letterType)) return 'standard';
  if (certification.caseByCase.includes(letterType)) return 'evaluate';
  
  // Default to standard for unknown types
  return 'standard';
};

/**
 * Calculate total monthly cost including IDIQ
 * @param {string} planId
 * @returns {number} Total monthly cost
 */
export const getTotalMonthlyCost = (planId) => {
  const plan = getPlan(planId);
  if (!plan) return 0;
  return plan.monthlyPrice + IDIQ_CONFIG.monthlyRate;
};

/**
 * Format price for display
 * @param {number} amount
 * @returns {string} e.g. "$149.00" or "$0"
 */
export const formatPrice = (amount) => {
  if (amount === 0) return '$0';
  return `$${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};