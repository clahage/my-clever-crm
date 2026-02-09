// ============================================================
// Path: /src/constants/aLaCarteServices.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
//
// À LA CARTE SERVICES MENU
// ============================================================
// Available to Essentials clients (and non-clients for some).
// Professional and VIP clients already have most items included.
// This menu appears INSIDE the client portal after sign-up,
// NOT on the pricing page (keeps plan selection clean at 3).
//
// CATEGORIES:
//   1. Letter Services (dispute, goodwill, validation, etc.)
//   2. Sending Services (we-mail-it, fax-send, certified)
//   3. Consultation Services (20/40/60 min tiers)
//   4. Creditor Intervention (phone calls on client's behalf)
//   5. Credit Building (tradelines, utilization, rental reporting)
//   6. Specialty Services (mortgage readiness, identity theft, etc.)
// ============================================================

import { CONSULTATION_RATES } from './servicePlans';

// ============================================================
// LETTER SERVICES
// ============================================================
// Client-ready letters written by our team. On Essentials,
// the client gets AI templates for free — these are CUSTOM
// letters written by a human expert for specific situations.
// ============================================================
export const LETTER_SERVICES = [
  {
    id: 'custom_dispute_letter',
    name: 'Custom Dispute Letter',
    price: 35,
    category: 'letter',
    description: 'Professionally written dispute letter personalized to a specific account and bureau. Our expert writes it using proven language tailored to your exact situation.',
    details: 'Includes: account-specific legal citations, bureau-specific formatting, and strategic dispute reason selection. We write it — you send it (or add We-Send-It service).',
    availableTo: ['essentials'],        // Prof/VIP already included
    includedIn: ['professional', 'vip'],
    deliveryTime: '1–2 business days',
    popular: true,
  },
  {
    id: 'thirty_day_response_letter',
    name: '30-Day Response Letter',
    price: 45,
    category: 'letter',
    description: 'Follow-up letter when a bureau or creditor responds to your dispute. These require careful legal language and escalation strategy.',
    details: 'Includes: analysis of the bureau/creditor response, identification of procedural violations, strategic next-step recommendation, and the crafted follow-up letter. Critical for round 2+ disputes.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '1–2 business days',
    popular: true,
  },
  {
    id: 'goodwill_letter',
    name: 'Goodwill Letter',
    price: 35,
    category: 'letter',
    description: 'Request to a creditor to remove a legitimate late payment based on your overall good payment history. AI-crafted with personal narrative elements.',
    details: 'Most effective when the client has a strong overall history with the creditor and a genuine reason for the late payment (job loss, medical emergency, etc.). We customize the story and tone for maximum impact.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '1–2 business days',
    popular: false,
  },
  {
    id: 'debt_validation_letter',
    name: 'Debt Validation Letter',
    price: 35,
    category: 'letter',
    description: 'Formal request to a collection agency to prove the debt is valid and they have legal authority to collect. Often results in removal when they cannot produce documentation.',
    details: 'Sent via certified mail (recommended — proof of delivery has legal significance under FDCPA). Requests: original signed agreement, complete payment history, chain of ownership, and license to collect in your state.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '1–2 business days',
    recommendCertified: true,  // This letter type warrants certified mail
    popular: true,
  },
  {
    id: 'cease_and_desist_letter',
    name: 'Cease & Desist Letter',
    price: 35,
    category: 'letter',
    description: 'Legal demand that a collection agency stop all communication with you. Does not remove the debt, but stops harassment calls, letters, and threats.',
    details: 'Under the FDCPA, once a collector receives a cease & desist, they may only contact you to confirm they are ceasing communication or to notify you of legal action. Sent certified for legal proof.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '1 business day',
    recommendCertified: true,
    popular: false,
  },
  {
    id: 'pay_for_delete_letter',
    name: 'Pay-For-Delete Negotiation Letter',
    price: 45,
    category: 'letter',
    description: 'Strategically crafted offer to a creditor or collector: you will pay a negotiated amount if they agree to delete the tradeline entirely from your credit report.',
    details: 'Requires careful wording — we never admit liability, frame it as a "goodwill gesture" settlement, and include specific terms for deletion reporting. The offer amount is discussed with you before sending.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '2–3 business days',
    recommendCertified: true,
    popular: true,
  },
  {
    id: 'inquiry_removal_letter',
    name: 'Inquiry Removal Letter',
    price: 25,
    category: 'letter',
    description: 'Challenge unauthorized or unrecognized hard inquiries that are dragging down your score. Each hard inquiry can reduce your score by 5–10 points.',
    details: 'Effective for inquiries you did not authorize. Less effective for legitimate inquiries, but worth challenging if you do not recall applying for credit with that company.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    deliveryTime: '1 business day',
    popular: false,
  },
];


// ============================================================
// SENDING SERVICES
// ============================================================
// For Essentials clients who have letters but need help
// getting them delivered. Professional/VIP already included.
// ============================================================
export const SENDING_SERVICES = [
  {
    id: 'we_mail_it',
    name: 'We-Mail-It Service',
    price: 15,
    category: 'sending',
    description: 'We print and mail any letter on your behalf via standard USPS mail. Includes professional formatting on Speedy Credit Repair letterhead.',
    details: 'Turnaround: next business day. You provide the letter content (or purchase a letter service above), we print, stuff, stamp, and mail.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    perUnit: 'per letter',
    popular: true,
  },
  {
    id: 'we_fax_it',
    name: 'We-Fax-It Service',
    price: 10,
    category: 'sending',
    description: 'We fax any dispute letter directly to the bureau or creditor on your behalf via our Telnyx fax system. Includes cover page and confirmation.',
    details: 'Faster than mail — most bureaus process faxed disputes within 24–48 hours of receipt. Includes fax confirmation receipt for your records. Cover page included.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    perUnit: 'per letter',
    popular: true,
  },
  {
    id: 'certified_mail_upgrade',
    name: 'Certified Mail Upgrade',
    price: 12,
    category: 'sending',
    description: 'Upgrade any letter to USPS Certified Mail with Return Receipt. Provides legal proof of delivery — essential for debt validation, cease & desist, and escalated disputes.',
    details: 'Added on top of We-Mail-It ($15 + $12 = $27 total for certified). Includes tracking number, return receipt, and we notify you when delivery is confirmed. Recommended for all legally significant letters.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    perUnit: 'per letter',
    popular: false,
  },
  {
    id: 'send_bundle_3',
    name: '3-Letter Send Bundle',
    price: 40,
    bundleSavings: 5,
    category: 'sending',
    description: 'We mail 3 letters on your behalf (one to each bureau). Save $5 vs. purchasing individually.',
    details: 'Perfect for round 1 disputes to all 3 bureaus. Standard mail. Upgrade individual letters to certified for $12 each if warranted.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    perUnit: 'per bundle of 3',
    popular: true,
  },
];


// ============================================================
// CONSULTATION SERVICES
// ============================================================
// $250/hour base, billed in 20-minute progressive blocks.
// Prices shown are for Essentials / non-client (full price).
// Professional gets 20% off. VIP gets 20 min/mo included + 20% off.
// See servicePlans.js → CONSULTATION_RATES for full logic.
// ============================================================
export const CONSULTATION_SERVICES = [
  {
    id: 'consultation_20',
    name: '20-Minute Expert Session',
    basePrice: 85,
    category: 'consultation',
    minutes: 20,
    description: 'Quick, focused call with a senior credit repair specialist. Best for one specific question, account review, or strategy check-in.',
    details: 'Covers: one topic deep-dive, specific account strategy, bureau response interpretation, or next-step planning. You receive a written summary of recommendations after the call.',
    pricingNote: 'Professional clients: $68 (20% off) · VIP clients: 20 min/month included, then $68',
    availableTo: ['essentials', 'none'],  // Prof/VIP get discounts
    popular: true,
  },
  {
    id: 'consultation_40',
    name: '40-Minute Expert Session',
    basePrice: 155,
    savingsVsFull: 15,
    category: 'consultation',
    minutes: 40,
    description: 'In-depth session for multiple accounts or complex scenarios. Enough time to review several dispute responses and plan next rounds.',
    details: 'Covers: multi-account strategy, dispute response analysis, creditor negotiation planning, or comprehensive score improvement roadmap. Written action plan included.',
    pricingNote: 'Professional clients: $124 (20% off) · VIP clients: $124 (20% off, after included 20 min used)',
    availableTo: ['essentials', 'none'],
    popular: true,
  },
  {
    id: 'consultation_60',
    name: '60-Minute Deep Dive Session',
    basePrice: 210,
    savingsVsFull: 40,
    category: 'consultation',
    minutes: 60,
    description: 'Comprehensive strategy session covering all 3 bureau reports with a detailed, prioritized action plan. Our most thorough consultation.',
    details: 'Covers: full 3-bureau review, item-by-item dispute priority ranking, credit rebuilding strategy, timeline to target score, and written comprehensive plan. Ideal for clients considering an upgrade to Professional.',
    pricingNote: 'Professional clients: $168 (20% off) · VIP clients: $168 (20% off, after included 20 min used)',
    availableTo: ['essentials', 'none'],
    popular: false,
  },
];


// ============================================================
// CREDITOR INTERVENTION SERVICES
// ============================================================
export const INTERVENTION_SERVICES = [
  {
    id: 'creditor_call',
    name: 'Creditor Intervention Call',
    price: 75,
    category: 'intervention',
    description: 'We call the creditor or collection agency on your behalf to negotiate removal, settlement terms, or payment arrangements.',
    details: 'Our specialist handles the conversation using proven negotiation techniques. You receive a detailed summary of the call outcome and recommended next steps. If a follow-up letter is needed, we can prepare one ($35 additional or included with Professional/VIP).',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    popular: true,
  },
  {
    id: 'settlement_negotiation',
    name: 'Settlement Negotiation Package',
    price: 125,
    category: 'intervention',
    description: 'Full settlement negotiation service: we contact the creditor/collector, negotiate terms, draft the settlement agreement, and ensure the tradeline is updated correctly post-payment.',
    details: 'Includes: initial negotiation call, written settlement offer/counter-offer, confirmation letter, and post-settlement credit report verification. Does NOT include the settlement payment itself.',
    availableTo: ['essentials'],
    includedIn: ['vip'],  // Professional pays, VIP included
    professionalPrice: 95,  // 20% discount for Professional
    popular: false,
  },
];


// ============================================================
// CREDIT BUILDING SERVICES
// ============================================================
export const CREDIT_BUILDING_SERVICES = [
  // ===========================================================
  // TRADELINE RENTALS — Authorized User Tradelines
  // ===========================================================
  // Base price: $300+ (doubled from original). No maximum cap.
  // Ultra-premium seasoned lines can go up to $3,800+ for 2 cards.
  // Extension rate for months beyond initial 2-month posting period.
  //
  // IMPORTANT DISCLOSURES:
  // - Legal but in a gray area with card issuers
  // - Never promise specific score increases
  // - Maximum 2 tradelines recommended per client
  // - Space placements at least 30 days apart
  // - Client is added as authorized user for ~60-90 days
  // - Closed tradeline may remain on report for years
  // ===========================================================
  {
    id: 'tradeline_starter',
    name: 'Starter Tradeline',
    price: 300,
    priceDisplay: '$300',
    category: 'tradeline',
    tier: 'starter',
    description: 'Entry-level authorized user tradeline. 2–5 year account age with $5,000–$15,000 credit limit and perfect payment history.',
    details: 'Best for: Thin credit files, building initial credit mix, or adding a positive revolving account. Posts to credit report within 1–2 statement cycles. Active for approximately 60–90 days. Ideal for clients with few existing tradelines who need to establish a baseline.',
    postingPeriod: '60–90 days (2 reporting cycles)',
    extensionRate: null,  // No extension on starter
    estimatedWholesale: '~$120–$180',
    availableTo: ['essentials', 'professional', 'vip'],
    vipDiscount: 15,  // VIP gets 15% off = $255
    popular: true,
  },
  {
    id: 'tradeline_standard',
    name: 'Standard Tradeline',
    price: 600,
    priceDisplay: '$600',
    category: 'tradeline',
    tier: 'standard',
    description: 'Mid-range authorized user tradeline. 5–10 year account age with $15,000–$30,000 credit limit and flawless payment history.',
    details: 'Best for: Clients who already have some credit history but need to boost average age of accounts and overall credit mix. Significant impact on average account age and utilization ratios.',
    postingPeriod: '60–90 days (2 reporting cycles)',
    extensionRate: 175,  // Per month beyond initial 2 months
    extensionNote: 'Reduced rate of $175/month for continued posting beyond initial period (must purchase before initial period expires)',
    estimatedWholesale: '~$250–$350',
    availableTo: ['essentials', 'professional', 'vip'],
    vipDiscount: 15,
    popular: true,
  },
  {
    id: 'tradeline_premium',
    name: 'Premium Tradeline',
    price: 1200,
    priceDisplay: '$1,200+',
    category: 'tradeline',
    tier: 'premium',
    description: 'High-impact authorized user tradeline. 10–20+ year account age with $30,000–$80,000+ credit limit and spotless payment history.',
    details: 'Best for: Clients preparing for major financing (mortgage, business loan) who need maximum age and limit impact. Can dramatically improve average account age and available credit calculations.',
    postingPeriod: '60–90 days (2 reporting cycles)',
    extensionRate: 350,
    extensionNote: 'Reduced rate of $350/month for continued posting beyond initial period (must purchase before initial period expires)',
    estimatedWholesale: '~$500–$800',
    availableTo: ['essentials', 'professional', 'vip'],
    vipDiscount: 15,
    popular: false,
  },
  {
    id: 'tradeline_ultra',
    name: 'Ultra-Premium Tradeline Package',
    price: null,  // Custom pricing — no cap
    priceDisplay: '$1,800–$3,800+',
    category: 'tradeline',
    tier: 'ultra',
    description: 'Custom-matched ultra-seasoned tradeline packages. Multiple cards, maximum age (20+ years), highest limits ($50,000–$100,000+). Pricing based on specific cards sourced.',
    details: 'Best for: Clients with specific financing targets (e.g., mortgage qualification by a deadline) who need maximum credit profile enhancement. Typically 2 cards for 2-month initial period. Reduced per-month extension rate available if continued posting is purchased before initial 2-month expiration.',
    postingPeriod: '60–90 days per card (2 reporting cycles)',
    extensionRate: null,  // Custom — negotiated per package
    extensionNote: 'Reduced monthly rate for continued posting — negotiated per package. Must purchase before initial 2-month period expires.',
    estimatedWholesale: 'Custom sourcing',
    availableTo: ['essentials', 'professional', 'vip'],
    vipDiscount: 15,
    requiresConsultation: true,  // Must speak with specialist first
    popular: false,
  },

  // ===========================================================
  // OTHER CREDIT BUILDING SERVICES
  // ===========================================================
  {
    id: 'utilization_plan',
    name: 'Credit Utilization Optimization Plan',
    price: 35,
    category: 'credit_building',
    description: 'AI-generated plan showing exactly which balances to pay down, in what order, and by how much for maximum score impact.',
    details: 'Our AI analyzes your 3-bureau utilization across all accounts and generates a prioritized paydown strategy. Shows: optimal balance targets per card, order of paydown for maximum score lift, and estimated score impact per action.',
    availableTo: ['essentials'],
    includedIn: ['professional', 'vip'],
    popular: false,
  },
  {
    id: 'rental_reporting',
    name: 'Rental Reporting Setup',
    price: 25,
    category: 'credit_building',
    description: 'We help you enroll in a rental reporting service so your on-time rent payments are reported to all 3 bureaus. One-time setup assistance.',
    details: 'Rental payments are often the largest monthly expense — and they should count toward your credit. We set you up with a verified rental reporting service and confirm the tradeline appears on your reports.',
    availableTo: ['essentials', 'professional'],
    includedIn: ['vip'],
    oneTime: true,
    popular: false,
  },
  {
    id: 'secured_card_guidance',
    name: 'Secured Card & Credit Builder Guidance',
    price: 0,
    category: 'credit_building',
    description: 'Personalized recommendations for the best secured credit cards and credit builder loans based on your current credit profile.',
    details: 'Included with all plans at no charge. Our AI matches you with the cards most likely to approve you and graduate you to unsecured credit fastest.',
    availableTo: ['essentials', 'professional', 'vip'],
    includedIn: ['essentials', 'professional', 'vip'],
    free: true,
    popular: false,
  },
];


// ============================================================
// SPECIALTY SERVICES
// ============================================================
export const SPECIALTY_SERVICES = [
  {
    id: 'mortgage_readiness',
    name: 'Mortgage Readiness Review',
    price: 79,
    category: 'specialty',
    description: 'Focused session for clients preparing for a home purchase. We identify exactly what needs to happen — and by when — to qualify for the best mortgage rates.',
    details: 'Includes: target score analysis for your desired loan type (FHA, conventional, VA), item-by-item priority list, estimated timeline, and written action plan. Typically a 40-minute session with a senior specialist.',
    availableTo: ['essentials', 'professional'],
    includedIn: ['vip'],
    popular: true,
  },
  {
    id: 'identity_theft_package',
    name: 'Identity Theft Recovery Package',
    price: 199,
    category: 'specialty',
    description: 'Comprehensive identity theft recovery service. We handle fraud alerts, police reports, FTC affidavits, and dispute all fraudulent accounts across all 3 bureaus.',
    details: 'Includes: fraud alert placement, FTC Identity Theft Report filing assistance, dispute letters for all fraudulent accounts, extended fraud alert guidance, and credit freeze management. Price is in addition to any monthly plan.',
    availableTo: ['essentials', 'professional', 'vip'],
    includedIn: [],
    popular: false,
  },
  {
    id: 'rapid_rescore',
    name: 'Rapid Rescore Consultation',
    price: 59,
    category: 'specialty',
    description: 'Guidance on obtaining a rapid rescore through your mortgage lender during the loan process. We identify the quickest actions to boost your score before closing.',
    details: 'Note: We do not perform rapid rescoring directly (only mortgage lenders can request this). We identify which accounts to pay down or dispute, and prepare the documentation your lender needs to request the rescore.',
    availableTo: ['essentials', 'professional'],
    includedIn: ['vip'],
    popular: false,
  },
];


// ============================================================
// TRADELINE DISCLOSURE TEXT
// ============================================================
// ALWAYS display this when showing tradeline services.
// ============================================================
export const TRADELINE_DISCLOSURE = {
  shortDisclosure: 'Authorized user tradeline placement. Results are not guaranteed. Score impact varies based on individual credit profile. Maximum 2 tradelines recommended.',
  
  fullDisclosure: `AUTHORIZED USER TRADELINE DISCLOSURE: Tradeline rental involves being added as an authorized user to an existing revolving credit account for a temporary period (typically 60–90 days / 2 reporting cycles). You will NOT receive a physical credit card or have access to the account. The tradeline history will appear on your credit report and may positively impact your credit score. However, results are not guaranteed — score impact varies significantly based on your existing credit profile, the number and type of existing tradelines, and the credit scoring model used. Some lenders and scoring models give reduced weight to authorized user accounts. Banks may flag more than 3 authorized user tradelines. Speedy Credit Repair recommends a maximum of 2 tradeline placements per client, spaced at least 30 days apart. After the posting period, the authorized user relationship ends, but the closed tradeline may remain on your credit report for up to 10 years. Extended posting beyond the initial period must be purchased before the initial period expires and is subject to availability.`,

  riskWarning: 'Tradeline placement carries inherent risks including: no guarantee of score improvement, potential for the account to be closed by the issuer at any time, and the possibility that lenders may view authorized user accounts unfavorably. Speedy Credit Repair is not responsible for actions taken by card issuers or credit bureaus regarding authorized user accounts.',
};


// ============================================================
// HELPER: GET ALL SERVICES FOR A PLAN
// ============================================================
/**
 * Returns all à la carte services available for a given plan,
 * with correct pricing and included/available flags.
 * @param {string} planId - 'essentials', 'professional', 'vip', or 'none'
 * @returns {Array} All services with availability and pricing
 */
export const getServicesForPlan = (planId) => {
  const allServices = [
    ...LETTER_SERVICES,
    ...SENDING_SERVICES,
    ...CONSULTATION_SERVICES,
    ...INTERVENTION_SERVICES,
    ...CREDIT_BUILDING_SERVICES,
    ...SPECIALTY_SERVICES,
  ];

  return allServices.map(service => {
    const isIncluded = service.includedIn?.includes(planId) || false;
    const isAvailable = service.availableTo?.includes(planId) 
      || service.availableTo?.includes('none') 
      || false;

    // ===== Calculate plan-adjusted price =====
    let adjustedPrice = service.price;
    
    // Consultation pricing uses the CONSULTATION_RATES system
    if (service.category === 'consultation') {
      const consultPrice = getConsultationPriceForPlan(planId, service.minutes);
      adjustedPrice = consultPrice?.price ?? service.basePrice;
    }

    // VIP tradeline discount
    if (service.category === 'tradeline' && planId === 'vip' && service.vipDiscount) {
      adjustedPrice = service.price 
        ? Math.round(service.price * (1 - service.vipDiscount / 100)) 
        : null;
    }

    return {
      ...service,
      isIncluded,
      isAvailable: isIncluded || isAvailable,
      adjustedPrice,
      planId,
    };
  });
};


// ============================================================
// HELPER: CONSULTATION PRICE FOR PLAN (wrapper)
// ============================================================
// Imported from servicePlans.js but re-exported here for
// convenience when working with à la carte services.
// ============================================================
import { getConsultationPrice as getConsultationPriceForPlan } from './servicePlans';
export { getConsultationPriceForPlan };


// ============================================================
// UPSELL TRIGGER CONFIGURATIONS
// ============================================================
// These define when SpeedyCRM should auto-suggest an à la carte
// purchase or plan upgrade. Used by the AI upsell engine.
// ============================================================
export const UPSELL_TRIGGERS = [
  {
    id: 'alacarte_spend_threshold',
    trigger: 'Client à la carte spend exceeds $100 in a calendar month',
    targetPlan: 'essentials',
    action: 'upgrade_to_professional',
    message: "You've spent {{amount}} on add-on services this month. Upgrade to Professional ($149/mo) and get unlimited everything included — you'd actually save money!",
    priority: 'high',
  },
  {
    id: 'template_download_threshold',
    trigger: 'Client downloads 3+ dispute templates without marking any as sent',
    targetPlan: 'essentials',
    action: 'suggest_send_bundle',
    message: "Need help getting your disputes out? Our 3-Letter Send Bundle ($40) mails all 3 bureau letters for you — save $5 vs. individual. Or upgrade to Professional where we handle everything.",
    priority: 'medium',
  },
  {
    id: 'support_question_complex',
    trigger: 'Client submits a support question flagged as complex by AI',
    targetPlan: 'essentials',
    action: 'suggest_consultation',
    message: "Great question — this deserves a detailed answer. Book a 20-minute expert session ($85) for personalized guidance. Or upgrade to Professional for unlimited consultations at 20% off.",
    priority: 'medium',
  },
  {
    id: 'low_score_after_60_days',
    trigger: 'Client score still under 600 after 60+ days on Essentials',
    targetPlan: 'essentials',
    action: 'suggest_tradeline',
    message: "Your disputes are making progress! Want to accelerate? An authorized user tradeline could add positive history to your report while we work on removing negatives. Starting at $300.",
    priority: 'medium',
  },
  {
    id: 'bureau_response_confusion',
    trigger: 'Client uploads a bureau response and marks it as "need help"',
    targetPlan: 'essentials',
    action: 'suggest_response_letter',
    message: "Got a response from the bureau? Our 30-Day Response Letter service ($45) crafts the perfect follow-up. Or upgrade to Professional where we handle all responses automatically.",
    priority: 'high',
  },
  {
    id: 'mortgage_goal_detected',
    trigger: 'Client profile or notes mention mortgage/home purchase goal',
    targetPlan: 'essentials',
    action: 'suggest_mortgage_readiness',
    message: "Getting ready to buy a home? Our Mortgage Readiness Review ($79) maps out exactly what you need — and by when — to qualify for the best rates.",
    priority: 'medium',
  },
  {
    id: 'complex_case_on_professional',
    trigger: 'Professional client has 15+ items with disputes active past 90 days',
    targetPlan: 'professional',
    action: 'upgrade_to_vip',
    message: "With {{itemCount}} items still in progress, bi-weekly dispute cycles would cut your timeline in half. VIP Concierge also includes all deletion fees ($25/item savings per deletion) and a 90-day guarantee.",
    priority: 'high',
  },
  {
    id: 'referral_detected',
    trigger: 'Client refers a friend or family member',
    targetPlan: 'all',
    action: 'offer_couples_discount',
    message: "Thanks for the referral! Your {{referralName}} gets 20% off their enrollment when they sign up. You both get faster results when you repair together!",
    priority: 'low',
  },
];