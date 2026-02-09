// ============================================================================
// SERVICE PLANS CONFIGURATION - UPDATED JANUARY 2026
// ============================================================================
// Central configuration for Speedy Credit Repair service plans
// This configuration is synced to Firebase servicePlans collection
// Editable via ServicePlanManager admin interface (role 7+ required)
//
// VERSION 3.0 - JANUARY 2026 UPDATE
// ✅ Updated pricing per Christopher's specifications
// ✅ Phone consultation pricing corrected ($75 first 15min, $50 additional)
// ✅ Premium client benefits (2x 30-min consult credits, priority email)
// ✅ Free 15-min consultation for new prospects
// ✅ IDIQ monitoring requirement clarified (30/60 day post-service)
// ✅ Credit Builder standalone vs add-on pricing
// ✅ DIY ala carte options
// ✅ Business Credit (Tier 4) placeholder
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2026 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

// ============================================================================
// IDIQ MONITORING REQUIREMENT
// ============================================================================
export const IDIQ_REQUIREMENT = {
  monthlyCost: 21.86, // Partner pricing (approximately $20)
  description: 'Credit monitoring with IDIQ Partner',
  
  postServiceDays: {
    standard: 30,      // Days after service end
    payForDelete: 60   // Extended for Pay-for-Delete
  },
  
  notes: [
    'SCR provides the first credit report FREE',
    'All Tiers (except DIY) must upgrade to paid IDIQ monitoring',
    'Monitoring must continue for service duration + post-service period',
    'This allows SCR to bill for pending deletions still awaiting results',
    'DIY clients are encouraged but not required to use IDIQ',
    'Partner pricing available indefinitely, even after service ends',
    'Payment made directly to IDIQ via credit/debit card'
  ],
  
  exemptions: ['diy'], // DIY encouraged but not required
  
  disclosure: `All service tiers (except DIY) require upgrading the initial FREE IDIQ credit report 
to a paid monitoring subscription for the duration of service plus 30 days (60 days for Pay-for-Delete). 
This ensures SCR can bill for items still pending results. Partner pricing of approximately $20/month 
is available for as long as you wish to keep the service.`
};

// ============================================================================
// PHONE CONSULTATION PACKAGES
// ============================================================================
export const phoneConsultation = {
  id: 'phoneConsult',
  name: 'Phone Consultation with Credit Expert',
  description: 'Consult with one of our credit experts by phone',
  
  pricing: {
    first15Min: 75,      // First 15 minutes
    additional15Min: 50, // Each additional 15-minute increment
    maxDuration: 60,     // Maximum 60 minutes per session
    
    // Package pricing
    packages: {
      '15min': { price: 75, duration: 15 },
      '30min': { price: 125, duration: 30 },  // $75 + $50
      '45min': { price: 175, duration: 45 },  // $75 + $50 + $50
      '60min': { price: 225, duration: 60 }   // $75 + $50 + $50 + $50
    }
  },
  
  // Available to everyone
  availableTo: ['visitor', 'prospect', 'client', 'diy', 'standard', 'premium', 'pfd'],
  
  // Free consultation for new prospects
  freeConsultation: {
    enabled: true,
    duration: 15, // minutes
    eligibility: 'new_prospects', // Before signing with SCR
    description: 'Free 15-minute consultation with a credit expert before signing',
    oneTime: true
  },
  
  // Premium client benefits
  premiumBenefits: {
    consultCredits: 2,              // Number of credits
    creditDuration: 30,             // Minutes per credit
    totalMinutes: 60,               // 2 x 30 = 60 total minutes
    validityPeriod: 6,              // Months (service period)
    usageOptions: [
      'One 30-minute session',
      'Two 15-minute sessions'
    ],
    description: 'Premium clients receive two 30-minute phone consultation credits during their 6-month service period. Each credit can be used as one 30-minute session or split into two 15-minute sessions.'
  }
};

// ============================================================================
// EMAIL SUPPORT TIERS
// ============================================================================
export const emailSupport = {
  standard: {
    name: 'Standard Email Support',
    responseTime: '48-72 hours',
    description: 'All clients receive email support'
  },
  premium: {
    name: 'Priority Email Support',
    responseTime: '24 hours or less',
    description: 'Premium add-on clients receive priority response within 24 hours'
  }
};

// ============================================================================
// SERVICE TIERS - UPDATED JANUARY 2026
// ============================================================================
export const serviceTiers = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: STANDARD CREDIT REPAIR
  // ═══════════════════════════════════════════════════════════════════════════
  STANDARD: {
    id: 'standard',
    tier: '1',
    name: 'Standard Credit Repair',
    nameEs: 'Reparación de Crédito Estándar',
    enabled: true,
    displayOrder: 1,
    
    pricing: {
      setupFee: 0,
      monthlyFee: 149,
      perItemFee: 25,        // Per deletion/positive change, per bureau
      commitment: 6,         // Months
      firstPaymentDelay: 30, // Days - first payment 1 month from start
      currency: 'USD'
    },
    
    description: 'Professional credit repair with performance-based pricing',
    descriptionEs: 'Reparación de crédito profesional con precios basados en rendimiento',
    
    tagline: 'Professional Credit Repair Made Simple',
    taglineEs: 'Reparación de Crédito Profesional Simplificada',
    
    features: [
      'Disputes to all 3 credit bureaus (Experian, Equifax, TransUnion)',
      'Professional dispute letter creation',
      'Monthly credit report analysis',
      'Progress tracking via client portal',
      'Email support (48-72 hour response)',
      'AI-powered dispute recommendations',
      'Score tracking and improvement monitoring',
      '$25 per successful deletion/positive change per bureau',
      '6-month service commitment',
      'First payment due 30 days from start'
    ],
    featuresEs: [
      'Disputas a las 3 agencias de crédito',
      'Creación profesional de cartas de disputa',
      'Análisis mensual del informe de crédito',
      'Seguimiento de progreso vía portal del cliente',
      'Soporte por correo electrónico',
      '$25 por eliminación exitosa por agencia'
    ],
    
    includes: {
      creditBuilder: false,
      premiumSupport: false,
      phoneSupport: false,
      creditorInterventions: false,
      priorityEmail: false
    },
    
    idiqRequired: true,
    idiqPostServiceDays: 30,
    
    addOnsAvailable: ['premium', 'creditBuilder'],
    
    // Billing details
    billing: {
      frequency: 'monthly',
      perItemBilling: 'upon_deletion',
      perItemScope: 'per_bureau',
      example: 'Collection removed from all 3 bureaus = $25 × 3 = $75'
    },
    
    // Performance metrics
    estimatedMonths: 6,
    aiRecommendationScore: 8,
    avgConversionRate: 38,
    avgLifetimeValue: 1788,
    successRate: 82,
    
    // Visual
    icon: 'Star',
    color: '#2196F3',
    popular: true,
    bestValue: false
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1B: STANDARD + CREDIT BUILDER BUNDLE
  // ═══════════════════════════════════════════════════════════════════════════
  STANDARD_PLUS: {
    id: 'standard_plus',
    tier: '1B',
    name: 'Standard + Credit Builder',
    nameEs: 'Estándar + Constructor de Crédito',
    enabled: true,
    displayOrder: 2,
    badge: 'BEST VALUE',
    
    pricing: {
      setupFee: 0,
      monthlyFee: 189,
      perItemFee: 15,        // Reduced per-item fee ($10 savings)
      commitment: 6,
      firstPaymentDelay: 30,
      currency: 'USD'
    },
    
    description: 'Complete credit repair with credit building included - our most popular bundle',
    descriptionEs: 'Reparación de crédito completa con construcción de crédito incluida',
    
    tagline: 'Build While You Repair - Best Value',
    taglineEs: 'Construya Mientras Repara - Mejor Valor',
    
    features: [
      'Everything in Standard Credit Repair',
      '✓ CREDIT BUILDER INCLUDED ($39/mo value)',
      'Authorized user tradeline guidance',
      'Secured/unsecured credit card guidance',
      'Credit profile improvement techniques',
      'Lower per-item fee ($15 vs $25 - save $10 per deletion)',
      'Email support (48-72 hour response)',
      '6-month service commitment',
      'First payment due 30 days from start'
    ],
    featuresEs: [
      'Todo en Reparación de Crédito Estándar',
      '✓ CONSTRUCTOR DE CRÉDITO INCLUIDO',
      'Orientación sobre líneas de crédito de usuario autorizado',
      'Tarifa por artículo más baja ($15 vs $25)'
    ],
    
    includes: {
      creditBuilder: true,  // INCLUDED
      premiumSupport: false,
      phoneSupport: false,
      creditorInterventions: false,
      priorityEmail: false
    },
    
    idiqRequired: true,
    idiqPostServiceDays: 30,
    
    addOnsAvailable: ['premium'], // Credit Builder already included
    
    billing: {
      frequency: 'monthly',
      perItemBilling: 'upon_deletion',
      perItemScope: 'per_bureau',
      example: 'Collection removed from all 3 bureaus = $15 × 3 = $45 (save $30)'
    },
    
    savings: {
      creditBuilderValue: 39,
      perItemSavings: 10,
      monthlyValueAdded: 39,
      note: 'Save $10 per deletion + FREE Credit Builder ($39 value)'
    },
    
    estimatedMonths: 6,
    aiRecommendationScore: 9,
    avgConversionRate: 45,
    avgLifetimeValue: 2134,
    successRate: 85,
    
    icon: 'Award',
    color: '#10B981',
    popular: true,
    bestValue: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: PAY-FOR-DELETE (Performance-Based)
  // ═══════════════════════════════════════════════════════════════════════════
  PAY_FOR_DELETE: {
    id: 'pay_for_delete',
    tier: '2',
    name: 'Pay-for-Delete',
    nameEs: 'Pago por Eliminación',
    enabled: true,
    displayOrder: 3,
    badge: 'RESULTS-BASED',
    
    pricing: {
      setupFee: 199,
      monthlyFee: 0,
      perItemFee: 75,        // Per deletion, per bureau
      commitment: 6,
      firstPaymentDelay: 0,  // Setup fee due immediately
      currency: 'USD'
    },
    
    description: 'Pay only for results - no monthly fees, just per-deletion charges',
    descriptionEs: 'Pague solo por resultados - sin tarifas mensuales',
    
    tagline: 'Pay Only When We Deliver Results',
    taglineEs: 'Pague Solo Cuando Entregamos Resultados',
    
    features: [
      'NO monthly fees - pay only for deletions',
      '$199 one-time setup fee',
      '$75 per successful deletion per bureau',
      'Professional dispute management',
      'All 3 credit bureaus covered',
      'Progress tracking via client portal',
      'Email support',
      'Ideal for clients with few negative items',
      '6-month service commitment'
    ],
    featuresEs: [
      'SIN tarifas mensuales - pague solo por eliminaciones',
      '$199 tarifa de configuración única',
      '$75 por eliminación exitosa por agencia'
    ],
    
    includes: {
      creditBuilder: false,
      premiumSupport: false,
      phoneSupport: false,
      creditorInterventions: false,
      priorityEmail: false
    },
    
    idiqRequired: true,
    idiqPostServiceDays: 60, // Extended to 60 days
    
    addOnsAvailable: ['premium', 'creditBuilder'],
    
    billing: {
      frequency: 'per_deletion',
      perItemBilling: 'upon_deletion',
      perItemScope: 'per_bureau',
      example: 'Collection removed from all 3 bureaus = $75 × 3 = $225'
    },
    
    cancellation: {
      noticePeriod: 0,
      idiqRequirement: 'Client must maintain IDIQ for up to 60 days from cancellation notice to allow SCR to bill for deletions still awaiting outcomes'
    },
    
    estimatedMonths: 6,
    aiRecommendationScore: 7,
    avgConversionRate: 32,
    avgLifetimeValue: 950,
    successRate: 78,
    
    icon: 'Target',
    color: '#F59E0B',
    popular: false,
    bestValue: false
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: DIY CREDIT REPAIR
  // ═══════════════════════════════════════════════════════════════════════════
  DIY: {
    id: 'diy',
    tier: '3',
    name: 'DIY Credit Repair',
    nameEs: 'Reparación de Crédito DIY',
    enabled: true,
    displayOrder: 4,
    
    pricing: {
      setupFee: 199,
      monthlyFee: 39,
      perItemFee: 0,         // No per-item charges
      commitment: 0,         // No commitment
      cancellationNotice: 30, // 30 days notice to end
      currency: 'USD'
    },
    
    description: 'Self-service credit repair with expert tools and optional upgrades',
    descriptionEs: 'Reparación de crédito de autoservicio con herramientas expertas',
    
    tagline: 'Take Control of Your Credit Journey',
    taglineEs: 'Tome el Control de su Viaje de Crédito',
    
    features: [
      'Progress Portal access for self-management',
      'Dispute letter template library',
      'Score tracking and monitoring',
      'Educational resources',
      'Update your own results and scores',
      'No per-item charges',
      'Cancel anytime with 30-day notice',
      'IDIQ encouraged but not required',
      'Ala carte upgrades available'
    ],
    featuresEs: [
      'Acceso al Portal de Progreso',
      'Biblioteca de plantillas de cartas de disputa',
      'Seguimiento de puntaje',
      'Recursos educativos',
      'Sin cargos por artículo',
      'Cancelar en cualquier momento con aviso de 30 días'
    ],
    
    includes: {
      creditBuilder: false,
      premiumSupport: false,
      phoneSupport: false,
      creditorInterventions: false,
      priorityEmail: false,
      progressPortal: true
    },
    
    idiqRequired: false,
    idiqRecommended: true,
    
    addOnsAvailable: ['customLetters', 'letterDelivery', 'phoneConsult', 'tradelines', 'creditBuilder'],
    
    billing: {
      frequency: 'monthly',
      perItemBilling: 'none',
      perItemScope: 'none'
    },
    
    estimatedMonths: 6,
    aiRecommendationScore: 5,
    avgConversionRate: 42,
    avgLifetimeValue: 468,
    successRate: 65,
    
    icon: 'Edit',
    color: '#8B5CF6',
    popular: false,
    bestValue: false
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4: BUSINESS CREDIT (Coming Soon)
  // ═══════════════════════════════════════════════════════════════════════════
  BUSINESS_CREDIT: {
    id: 'business_credit',
    tier: '4',
    name: 'Business Credit',
    nameEs: 'Crédito Empresarial',
    enabled: true,
    displayOrder: 5,
    badge: 'NEW',
    comingSoon: true,
    
    subTiers: {
      STARTER: {
        id: 'business_starter',
        name: 'Business Starter',
        pricing: { setupFee: 299, monthlyFee: 149, commitment: 6 },
        features: [
          'D&B (Dun & Bradstreet) profile setup',
          'Experian Business credit file',
          'Equifax Business credit file',
          'EIN verification assistance',
          'DUNS number registration',
          'Business credit monitoring',
          'Monthly progress reports'
        ]
      },
      BUILDER: {
        id: 'business_builder',
        name: 'Business Builder',
        badge: 'POPULAR',
        pricing: { setupFee: 499, monthlyFee: 249, commitment: 6 },
        features: [
          'Everything in Business Starter',
          'Net-30 vendor account placements (5+ accounts)',
          'Business tradeline building',
          'Paydex score optimization',
          'Business credit card applications',
          'Vendor credit guidance'
        ]
      },
      PREMIUM: {
        id: 'business_premium',
        name: 'Business Premium',
        pricing: { setupFee: 799, monthlyFee: 399, commitment: 6 },
        features: [
          'Everything in Business Builder',
          'Net-60/90 vendor accounts',
          'SBA loan preparation',
          'Business line of credit readiness',
          'Personal/business credit separation',
          'Funding consultation',
          'Priority support'
        ]
      }
    },
    
    idiqRequired: false,
    businessBureaus: ['Dun & Bradstreet', 'Experian Business', 'Equifax Business']
  }
};

// ============================================================================
// ADD-ONS
// ============================================================================
export const addOnServices = {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PREMIUM ADD-ON (Available for Tier 1, 1B, 2)
  // ═══════════════════════════════════════════════════════════════════════════
  premium: {
    id: 'premium',
    name: 'Premium Support',
    monthlyFee: 50,
    setupFee: 0,
    availableFor: ['standard', 'standard_plus', 'pay_for_delete'],
    
    features: [
      'Priority dispute processing',
      'Priority email support (24-hour response)',
      'Direct creditor interventions',
      'Expedited bureau communication',
      'Dedicated support representative',
      '2x 30-minute phone consultation credits (use as 30min or 2x15min)'
    ],
    
    benefits: {
      priorityEmail: true,
      responseTime: '24 hours or less',
      phoneCredits: 2,
      phoneCreditsMinutes: 30, // per credit
      creditorInterventions: true
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREDIT BUILDER (Add-On or Standalone)
  // ═══════════════════════════════════════════════════════════════════════════
  creditBuilder: {
    id: 'creditBuilder',
    name: 'Credit Builder',
    tagline: 'Great for new to credit, rebuilding after Bankruptcy, or anyone looking to improve their credit profile',
    
    pricing: {
      addOn: {
        monthlyFee: 19,
        setupFee: 0,
        availableFor: ['standard', 'pay_for_delete', 'diy']
      },
      standalone: {
        monthlyFee: 39,
        setupFee: 0
      }
    },
    
    includedIn: ['standard_plus'], // Free with Tier 1B
    
    features: [
      'Authorized user tradeline guidance',
      'Secured credit card recommendations',
      'Unsecured credit card upgrade paths',
      'Credit utilization optimization',
      'Payment history improvement strategies',
      'Credit mix diversification guidance',
      'Score improvement techniques'
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIY ALA CARTE UPGRADES
  // ═══════════════════════════════════════════════════════════════════════════
  customLetters: {
    id: 'customLetters',
    name: 'Custom Dispute Letters',
    description: 'Custom letters created specifically for your disputes (vs. general library templates)',
    availableFor: ['diy'],
    pricing: {
      perLetter: 25,
      note: 'Per custom dispute letter created for your specific situation'
    }
  },

  letterDelivery: {
    id: 'letterDelivery',
    name: 'Letter Delivery Service',
    description: 'SCR expert edits and delivers disputes directly to credit bureaus on your behalf',
    availableFor: ['diy'],
    pricing: {
      fullDelivery: 35,    // We send on your behalf
      printableOnly: 10    // Prefilled, ready to print and mail yourself
    },
    options: [
      { id: 'full_delivery', name: 'Full Delivery', price: 35, description: 'We send on your behalf to the bureau' },
      { id: 'printable', name: 'Printable Letter', price: 10, description: 'Ready to print, sign, and mail yourself' }
    ]
  },

  tradelines: {
    id: 'tradelines',
    name: 'Tradeline Rental',
    description: 'Authorized user tradeline placement for score boost',
    availableFor: ['diy', 'standard', 'pay_for_delete'],
    comingSoon: true,
    note: 'Pricing to be updated when testing is completed'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate phone consultation cost
 */
export const calculatePhoneConsultCost = (minutes) => {
  if (minutes <= 0) return 0;
  if (minutes <= 15) return phoneConsultation.pricing.first15Min;
  
  const additionalMinutes = minutes - 15;
  const additionalIncrements = Math.ceil(additionalMinutes / 15);
  
  return phoneConsultation.pricing.first15Min + 
         (additionalIncrements * phoneConsultation.pricing.additional15Min);
};

/**
 * Check if client qualifies for free consultation
 */
export const qualifiesForFreeConsult = (clientStatus) => {
  return clientStatus === 'prospect' || clientStatus === 'new' || clientStatus === 'visitor';
};

/**
 * Get remaining phone credits for Premium client
 */
export const getRemainingPhoneCredits = (clientData) => {
  if (!clientData.addOns?.includes('premium')) return 0;
  
  const totalCredits = addOnServices.premium.benefits.phoneCredits;
  const usedCredits = clientData.phoneCreditsUsed || 0;
  
  return Math.max(0, totalCredits - usedCredits);
};

/**
 * Calculate total monthly cost for a plan with add-ons
 */
export const calculateMonthlyCost = (tierId, addOnIds = [], includeIDIQ = true) => {
  const tier = serviceTiers[tierId.toUpperCase()] || 
               Object.values(serviceTiers).find(t => t.id === tierId);
  
  if (!tier) return null;
  
  let total = tier.pricing.monthlyFee;
  
  // Add IDIQ cost if required and requested
  if (includeIDIQ && tier.idiqRequired) {
    total += IDIQ_REQUIREMENT.monthlyCost;
  }
  
  // Add add-ons
  addOnIds.forEach(addOnId => {
    const addOn = addOnServices[addOnId];
    if (addOn) {
      if (addOn.monthlyFee) {
        total += addOn.monthlyFee;
      } else if (addOn.pricing?.addOn?.monthlyFee) {
        total += addOn.pricing.addOn.monthlyFee;
      }
    }
  });
  
  return total;
};

/**
 * Calculate estimated total cost based on negative items
 */
export const calculateEstimatedTotalCost = (tierId, negativeItemCount, months = 6) => {
  const tier = serviceTiers[tierId.toUpperCase()] || 
               Object.values(serviceTiers).find(t => t.id === tierId);
  
  if (!tier) return null;
  
  const setupFee = tier.pricing.setupFee;
  const monthlyTotal = tier.pricing.monthlyFee * months;
  
  // Estimate deletions (assume 60% success rate, average 2.5 bureaus per item)
  const estimatedDeletions = Math.round(negativeItemCount * 0.6);
  const bureausPerItem = 2.5;
  const perItemTotal = tier.pricing.perItemFee * estimatedDeletions * bureausPerItem;
  
  // IDIQ cost
  const idiqTotal = tier.idiqRequired ? IDIQ_REQUIREMENT.monthlyCost * months : 0;
  
  return {
    setupFee,
    monthlyTotal,
    perItemTotal: Math.round(perItemTotal),
    idiqTotal: Math.round(idiqTotal),
    grandTotal: Math.round(setupFee + monthlyTotal + perItemTotal + idiqTotal),
    breakdown: {
      setup: setupFee,
      monthly: `$${tier.pricing.monthlyFee}/mo × ${months} months = $${monthlyTotal}`,
      perItem: tier.pricing.perItemFee > 0 
        ? `~${estimatedDeletions} deletions × ${bureausPerItem} bureaus × $${tier.pricing.perItemFee} = ~$${Math.round(perItemTotal)}`
        : 'No per-item charges',
      idiq: tier.idiqRequired 
        ? `$${IDIQ_REQUIREMENT.monthlyCost}/mo × ${months} months = ~$${Math.round(idiqTotal)}`
        : 'Not required (encouraged)'
    }
  };
};

/**
 * Format price for display
 */
export const formatPrice = (amount) => {
  if (amount === 0) return 'FREE';
  return `$${amount.toLocaleString()}`;
};

// ============================================================================
// LEGACY COMPATIBILITY - Map old plan IDs to new structure
// ============================================================================
export const planMigrationMap = {
  'diy': 'diy',
  'standard': 'standard',
  'standard_plus': 'standard_plus',
  'acceleration': 'standard_plus',  // Migrate to Standard+
  'hybrid': 'standard',             // Migrate to Standard
  'premium': 'standard_plus',       // Migrate to Standard+ with Premium add-on
  'pfd': 'pay_for_delete',
  'pay_for_delete': 'pay_for_delete'
};

// ============================================================================
// BACKWARD COMPATIBILITY - Convert serviceTiers to array format
// ============================================================================
// This maintains compatibility with existing components that expect defaultServicePlans array

export const defaultServicePlans = Object.values(serviceTiers)
  .filter(tier => !tier.comingSoon && !tier.subTiers) // Exclude coming soon and nested tiers
  .map(tier => ({
    id: tier.id,
    name: tier.name,
    nameEs: tier.nameEs || tier.name,
    enabled: tier.enabled !== false,
    displayOrder: tier.displayOrder || 99,
    pricing: {
      monthly: tier.pricing?.monthlyFee || 0,
      setupFee: tier.pricing?.setupFee || 0,
      perDeletion: tier.pricing?.perItemFee || 0,
      contractMonths: tier.pricing?.commitment || 0,
      currency: 'USD'
    },
    description: tier.description || '',
    descriptionEs: tier.descriptionEs || tier.description || '',
    features: tier.features || [],
    featuresEs: tier.featuresEs || tier.features || [],
    targetAudience: tier.targetAudience || 'mainstream',
    idealFor: tier.idealFor || '',
    estimatedMonths: tier.estimatedMonths || 6,
    aiRecommendationScore: tier.aiRecommendationScore || 5,
    avgConversionRate: tier.avgConversionRate || 30,
    avgLifetimeValue: tier.avgLifetimeValue || 500,
    successRate: tier.successRate || 70,
    icon: tier.icon || 'Star',
    color: tier.color || '#2196F3',
    popular: tier.popular || false,
    bestValue: tier.bestValue || false,
    tagline: tier.tagline || '',
    taglineEs: tier.taglineEs || tier.tagline || '',
    addOnsAvailable: Array.isArray(tier.addOnsAvailable) && tier.addOnsAvailable.length > 0,
    includesPhoneSupport: tier.includes?.phoneSupport || false,
    includes3BureauMonitoring: tier.idiqRequired || false
  }));

export const targetAudiences = {
  budget_conscious: {
    label: 'Budget-Conscious',
    labelEs: 'Consciente del Presupuesto',
    description: 'Clients seeking affordable DIY options',
    descriptionEs: 'Clientes que buscan opciones de bricolaje asequibles'
  },
  mainstream: {
    label: 'Mainstream',
    labelEs: 'Convencional',
    description: 'Typical credit repair needs (80% of clients)',
    descriptionEs: 'Necesidades típicas de reparación de crédito (80% de clientes)'
  },
  urgent_needs: {
    label: 'Urgent Needs',
    labelEs: 'Necesidades Urgentes',
    description: 'Clients requiring fast results, time-sensitive',
    descriptionEs: 'Clientes que requieren resultados rápidos, urgentes'
  },
  risk_averse: {
    label: 'Risk-Averse',
    labelEs: 'Averso al Riesgo',
    description: 'Pay only for results, performance-based',
    descriptionEs: 'Pague solo por resultados, basado en rendimiento'
  },
  cost_conscious: {
    label: 'Cost-Conscious',
    labelEs: 'Consciente de Costos',
    description: 'Balance of affordability and professional service',
    descriptionEs: 'Equilibrio de asequibilidad y servicio profesional'
  },
  complex_cases: {
    label: 'Complex Cases',
    labelEs: 'Casos Complejos',
    description: 'Legal issues, bankruptcy, foreclosure, tax liens',
    descriptionEs: 'Problemas legales, bancarrota, ejecución hipotecaria, gravámenes fiscales'
  }
};

// ============================================================================
// EXPORTS
// ============================================================================
export default {
  // New structure
  serviceTiers,
  addOnServices,
  phoneConsultation,
  emailSupport,
  IDIQ_REQUIREMENT,
  
  // Backward compatibility
  defaultServicePlans,
  targetAudiences,
  
  // Helper functions
  calculatePhoneConsultCost,
  qualifiesForFreeConsult,
  getRemainingPhoneCredits,
  calculateMonthlyCost,
  calculateEstimatedTotalCost,
  formatPrice,
  
  // Migration
  planMigrationMap
};