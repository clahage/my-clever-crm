// ============================================================
// NEW 3-PLAN SERVICE_PLANS_CONFIG
// ============================================================
// Replace your existing SERVICE_PLANS_CONFIG in index.js with this.
// This matches the new frontend servicePlans.js constants.
// No legacy mapping — fresh system, no old clients.
// ============================================================

const SERVICE_PLANS_CONFIG = {
  ESSENTIALS: {
    id: 'essentials',
    name: 'Essentials',
    tagline: 'Take Control of Your Credit',
    monthlyPrice: 79,
    setupFee: 49,
    perDeletion: 0,
    timeline: '3-9 months (self-paced)',
    successRate: '55% (client-driven)',
    avgPointIncrease: '40-80 points',
    effortRequired: 'High (client does the work)',
    idealFor: [
      'Self-motivated individuals',
      'Minor credit issues (1-5 items)',
      'Budget-conscious clients',
      'DIY mindset with expert tools'
    ],
    keyFeatures: [
      'AI-powered credit analysis & dispute strategy',
      'Professional dispute letter templates (AI-populated)',
      'Step-by-step video guides',
      'Client portal with progress tracking',
      'Monthly AI strategy refresh',
      'Credit education library',
      'Email support (24-48hr response)',
      'Secured card recommendations'
    ],
    disputeMethod: 'Client sends (mail). Fax available à la carte ($10/letter).',
    consultationRate: 'Full price ($85/20min, $155/40min, $210/60min)'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    tagline: 'We Handle Everything For You',
    monthlyPrice: 149,
    setupFee: 0,
    perDeletion: 25,
    timeline: '4-8 months',
    successRate: '82%',
    avgPointIncrease: '80-150 points',
    effortRequired: 'Zero (full service)',
    idealFor: [
      'Typical credit repair client',
      'Moderate-to-complex cases (5-15+ items)',
      'Wants professional help without lifting a finger',
      'Best overall value'
    ],
    keyFeatures: [
      'Full-service dispute management (we write, send, track)',
      'Unlimited dispute letters (mail + fax)',
      'Selective certified mail for legally significant items',
      'Unlimited phone consultations (20% off)',
      'Creditor intervention & negotiation',
      'Debt validation requests',
      'Goodwill & cease-and-desist letters',
      '30-day bureau response letters',
      'Monthly credit report refresh & AI analysis',
      'Dedicated account manager',
      'Same-day email + phone support',
      '$25 per item successfully deleted per bureau'
    ],
    disputeMethod: 'We send via mail + fax. Certified when warranted.',
    consultationRate: '20% off ($68/20min, $124/40min, $168/60min)'
  },
  VIP: {
    id: 'vip',
    name: 'VIP Concierge',
    tagline: 'Maximum Results, Maximum Speed',
    monthlyPrice: 299,
    setupFee: 0,
    perDeletion: 0,
    timeline: '2-5 months (accelerated)',
    successRate: '95%',
    avgPointIncrease: '120-250 points',
    effortRequired: 'Zero (white glove)',
    idealFor: [
      'Complex cases (15+ negative items)',
      'Urgency (home purchase, job requirement)',
      'Maximum speed needed',
      'Want zero surprise charges'
    ],
    keyFeatures: [
      'Everything in Professional',
      'Bi-weekly dispute cycles (2x faster)',
      'ALL deletion fees INCLUDED ($0 per-item)',
      'Direct-to-creditor escalation campaigns',
      'Aggressive multi-round goodwill campaigns',
      'Weekly progress reports',
      'Priority queue processing',
      'Full credit rebuilding strategy',
      '90-day money-back guarantee',
      'Direct cell phone access to senior specialist',
      '20 min/month expert consultation included',
      '15% off tradeline rentals',
      'Senior specialist assigned (not rotated)'
    ],
    disputeMethod: 'We send via mail + fax. Certified when warranted. Priority processing.',
    consultationRate: '20 min/mo included, then 20% off ($68/20min, $124/40min, $168/60min)'
  }
};
