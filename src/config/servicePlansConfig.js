// ============================================================================
// SERVICE PLANS CONFIGURATION
// ============================================================================
// Central configuration for all 6 Speedy Credit Repair service plans
// This configuration is synced to Firebase servicePlans collection
// Editable via ServicePlanManager admin interface (role 7+ required)
//
// PLANS:
// 1. DIY Credit Repair - Self-service ($39/mo)
// 2. Standard Plan - Full-service ($149/mo + $25/deletion)
// 3. Acceleration Plan - Expedited ($199/mo, deletions included)
// 4. Pay-For-Delete Only - Results-based ($0/mo + per-deletion fees)
// 5. Hybrid Plan - Mixed pricing ($99/mo + $75/deletion)
// 6. Premium Attorney-Backed - Comprehensive ($349/mo + $199 setup)
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

// ===== DEFAULT SERVICE PLANS CONFIGURATION =====
// These are the initial service plans loaded into Firebase
// Admins can modify all aspects via ServicePlanManager interface

export const defaultServicePlans = [
  // ===== PLAN 1: DIY CREDIT REPAIR =====
  {
    id: 'diy',
    name: 'DIY Credit Repair',
    nameEs: 'Reparación de Crédito DIY',
    enabled: true,
    displayOrder: 1,

    // Pricing structure
    pricing: {
      monthly: 39,
      setupFee: 0,
      perDeletion: 0,
      contractMonths: 0, // Month-to-month, no contract required
      currency: 'USD'
    },

    // Plan descriptions
    description: 'Self-service credit repair with AI-powered tools and educational guidance',
    descriptionEs: 'Reparación de crédito de autoservicio con herramientas impulsadas por IA y orientación educativa',

    // Detailed feature list
    features: [
      'AI-generated dispute letter templates',
      'Credit monitoring dashboard (basic)',
      'Educational resources library',
      'Email support only',
      'Client portal access',
      'Self-service dispute tools',
      'Progress tracking',
      'Cancel anytime (no contract)'
    ],
    featuresEs: [
      'Plantillas de cartas de disputa generadas por IA',
      'Panel de monitoreo de crédito (básico)',
      'Biblioteca de recursos educativos',
      'Soporte solo por correo electrónico',
      'Acceso al portal del cliente',
      'Herramientas de disputa de autoservicio',
      'Seguimiento de progreso',
      'Cancelar en cualquier momento (sin contrato)'
    ],

    // Target audience and ideal use cases
    targetAudience: 'budget_conscious',
    idealFor: '1-3 negative items, tech-savvy clients who prefer DIY approach',
    idealForEs: '1-3 artículos negativos, clientes conocedores de la tecnología que prefieren el enfoque de bricolaje',

    // Performance metrics
    estimatedMonths: 6,
    aiRecommendationScore: 5, // 1-10 scale, used by AI recommender
    avgConversionRate: 42, // Percentage
    avgLifetimeValue: 234, // Dollars
    churnRate: 35, // Percentage
    successRate: 68, // Percentage of clients who achieve results

    // Additional metadata
    icon: 'SelfImprovement',
    color: '#4CAF50',
    popular: false,
    bestValue: false,

    // Contract template reference
    contractTemplate: 'service-agreement-diy.html',

    // Requirements and limitations
    minCreditScore: 0,
    maxNegativeItems: 5,
    includesAttorneyConsult: false,
    includesPhoneSupport: false,
    includes3BureauMonitoring: false,

    // Marketing copy
    tagline: 'Take Control of Your Credit Journey',
    taglineEs: 'Tome el Control de su Viaje de Crédito',

    // Created/updated timestamps (set by Firebase)
    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 2: STANDARD PLAN =====
  {
    id: 'standard',
    name: 'Standard Plan',
    nameEs: 'Plan Estándar',
    enabled: true,
    displayOrder: 2,

    pricing: {
      monthly: 149,
      setupFee: 0,
      perDeletion: 25,
      contractMonths: 6,
      currency: 'USD'
    },

    description: 'Full-service credit repair with professional dispute handling and expert support',
    descriptionEs: 'Reparación de crédito de servicio completo con manejo profesional de disputas y soporte experto',

    features: [
      'Full-service professional dispute handling',
      '3-bureau credit monitoring (Equifax, Experian, TransUnion)',
      'Monthly progress reports',
      'Unlimited disputes per month',
      'Phone & email support',
      '30-day money-back guarantee',
      'Dedicated dispute specialist',
      'Client portal with real-time updates',
      '$25 per successful deletion'
    ],
    featuresEs: [
      'Manejo profesional de disputas de servicio completo',
      'Monitoreo de crédito de 3 agencias (Equifax, Experian, TransUnion)',
      'Informes de progreso mensuales',
      'Disputas ilimitadas por mes',
      'Soporte telefónico y por correo electrónico',
      'Garantía de devolución de dinero de 30 días',
      'Especialista en disputas dedicado',
      'Portal del cliente con actualizaciones en tiempo real',
      '$25 por eliminación exitosa'
    ],

    targetAudience: 'mainstream',
    idealFor: '4-10 negative items, typical credit repair needs',
    idealForEs: '4-10 artículos negativos, necesidades típicas de reparación de crédito',

    estimatedMonths: 12,
    aiRecommendationScore: 8,
    avgConversionRate: 38,
    avgLifetimeValue: 1788,
    churnRate: 18,
    successRate: 82,

    icon: 'Star',
    color: '#2196F3',
    popular: true,
    bestValue: true,

    contractTemplate: 'service-agreement-standard.html',

    minCreditScore: 0,
    maxNegativeItems: 15,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Professional Credit Repair Made Simple',
    taglineEs: 'Reparación de Crédito Profesional Simplificada',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 3: ACCELERATION PLAN =====
  {
    id: 'acceleration',
    name: 'Acceleration Plan',
    nameEs: 'Plan Aceleración',
    enabled: true,
    displayOrder: 3,

    pricing: {
      monthly: 199,
      setupFee: 0,
      perDeletion: 0, // Deletions included in monthly fee
      contractMonths: 9,
      currency: 'USD'
    },

    description: 'Expedited credit repair with aggressive dispute strategies and priority processing',
    descriptionEs: 'Reparación de crédito acelerada con estrategias de disputa agresivas y procesamiento prioritario',

    features: [
      'Aggressive multi-round dispute strategies',
      'Bi-weekly disputes (2x faster than standard)',
      'Creditor intervention & negotiation',
      'Priority processing queue',
      'Dedicated account manager',
      'Debt validation requests',
      'Weekly progress update reports',
      'Advanced escalation tactics',
      '90-day deletion guarantee',
      'All deletions included in monthly fee'
    ],
    featuresEs: [
      'Estrategias de disputa agresivas de múltiples rondas',
      'Disputas quincenales (2 veces más rápido que el estándar)',
      'Intervención y negociación con acreedores',
      'Cola de procesamiento prioritario',
      'Gerente de cuenta dedicado',
      'Solicitudes de validación de deuda',
      'Informes de actualización de progreso semanales',
      'Tácticas de escalada avanzadas',
      'Garantía de eliminación de 90 días',
      'Todas las eliminaciones incluidas en la tarifa mensual'
    ],

    targetAudience: 'urgent_needs',
    idealFor: '5-15 negative items, complex cases requiring urgent resolution',
    idealForEs: '5-15 artículos negativos, casos complejos que requieren resolución urgente',

    estimatedMonths: 12,
    aiRecommendationScore: 9,
    avgConversionRate: 28,
    avgLifetimeValue: 2388,
    churnRate: 15,
    successRate: 87,

    icon: 'Speed',
    color: '#FF9800',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-acceleration.html',

    minCreditScore: 0,
    maxNegativeItems: 20,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Fast-Track Your Credit Recovery',
    taglineEs: 'Acelere su Recuperación de Crédito',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 4: PAY-FOR-DELETE ONLY =====
  {
    id: 'pfd',
    name: 'Pay-For-Delete Only',
    nameEs: 'Pago por Eliminación Solamente',
    enabled: true,
    displayOrder: 4,

    pricing: {
      monthly: 0,
      setupFee: 0,
      perDeletion: 75, // Base rate for collections
      contractMonths: 0,
      currency: 'USD',
      // Tiered deletion pricing by item type
      deletionPricing: {
        collection: 75,
        chargeOff: 100,
        latePayment: 50,
        judgment: 150,
        taxLien: 150,
        bankruptcy: 250,
        foreclosure: 200,
        repossession: 125
      }
    },

    description: 'Results-based pricing - pay only when we successfully delete negative items from your credit report',
    descriptionEs: 'Precios basados en resultados: pague solo cuando eliminemos exitosamente artículos negativos de su informe de crédito',

    features: [
      'No monthly fees whatsoever',
      'Pay only for successful deletions',
      '100% risk-free service',
      '60-day deletion guarantee',
      'Success-based pricing only',
      'Collection deletion: $75',
      'Charge-off deletion: $100',
      'Late payment deletion: $50',
      'Judgment/Tax lien deletion: $150',
      'Bankruptcy deletion: $250',
      'Foreclosure deletion: $200',
      'Repossession deletion: $125',
      'No charge if we don\'t succeed'
    ],
    featuresEs: [
      'Sin tarifas mensuales en absoluto',
      'Pague solo por eliminaciones exitosas',
      'Servicio 100% sin riesgo',
      'Garantía de eliminación de 60 días',
      'Precios solo basados en el éxito',
      'Eliminación de cobranza: $75',
      'Eliminación de cargo: $100',
      'Eliminación de pago atrasado: $50',
      'Eliminación de juicio/gravamen fiscal: $150',
      'Eliminación de bancarrota: $250',
      'Eliminación de ejecución hipotecaria: $200',
      'Eliminación de recuperación: $125',
      'Sin cargo si no tenemos éxito'
    ],

    targetAudience: 'risk_averse',
    idealFor: '1-5 negative items, skeptical prospects who want guaranteed results',
    idealForEs: '1-5 artículos negativos, prospectos escépticos que quieren resultados garantizados',

    estimatedMonths: 6,
    aiRecommendationScore: 7,
    avgConversionRate: 45,
    avgLifetimeValue: 895,
    churnRate: 5,
    successRate: 91,

    icon: 'MoneyOff',
    color: '#9C27B0',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-pfd.html',

    minCreditScore: 0,
    maxNegativeItems: 10,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: false,

    tagline: 'Zero Risk, Results-Only Pricing',
    taglineEs: 'Cero Riesgo, Precios Solo por Resultados',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 5: HYBRID PLAN =====
  {
    id: 'hybrid',
    name: 'Hybrid Plan',
    nameEs: 'Plan Híbrido',
    enabled: true,
    displayOrder: 5,

    pricing: {
      monthly: 99,
      setupFee: 0,
      perDeletion: 75,
      contractMonths: 6,
      currency: 'USD'
    },

    description: 'Best of both worlds - affordable monthly service combined with pay-per-result incentives',
    descriptionEs: 'Lo mejor de ambos mundos: servicio mensual asequible combinado con incentivos de pago por resultados',

    features: [
      'Lower monthly barrier ($99 vs $149)',
      'Full 3-bureau credit monitoring',
      'Guided DIY tools & AI templates',
      'Monthly professional review & consultation',
      'Phone & email support',
      'Pay-per-deletion option ($75 per item)',
      'Best of both pricing models',
      'Flexible dispute handling',
      'Educational resources included',
      'Progress tracking dashboard'
    ],
    featuresEs: [
      'Barrera mensual más baja ($99 vs $149)',
      'Monitoreo completo de crédito de 3 agencias',
      'Herramientas de bricolaje guiadas y plantillas de IA',
      'Revisión profesional mensual y consulta',
      'Soporte telefónico y por correo electrónico',
      'Opción de pago por eliminación ($75 por artículo)',
      'Lo mejor de ambos modelos de precios',
      'Manejo de disputas flexible',
      'Recursos educativos incluidos',
      'Panel de seguimiento de progreso'
    ],

    targetAudience: 'cost_conscious',
    idealFor: '3-8 negative items, budget-conscious clients wanting professional support',
    idealForEs: '3-8 artículos negativos, clientes conscientes del presupuesto que desean apoyo profesional',

    estimatedMonths: 9,
    aiRecommendationScore: 7,
    avgConversionRate: 35,
    avgLifetimeValue: 1194,
    churnRate: 22,
    successRate: 79,

    icon: 'Balance',
    color: '#00BCD4',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-hybrid.html',

    minCreditScore: 0,
    maxNegativeItems: 12,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Affordable Professional Support',
    taglineEs: 'Apoyo Profesional Asequible',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 6: PREMIUM ATTORNEY-BACKED =====
  {
    id: 'premium',
    name: 'Premium Attorney-Backed',
    nameEs: 'Premium Respaldado por Abogado',
    enabled: true,
    displayOrder: 6,

    pricing: {
      monthly: 349,
      setupFee: 199, // One-time legal case review
      perDeletion: 0, // All deletions included
      contractMonths: 12,
      currency: 'USD'
    },

    description: 'Comprehensive attorney-backed service for complex credit repair cases and legal challenges',
    descriptionEs: 'Servicio integral respaldado por abogado para casos complejos de reparación de crédito y desafíos legales',

    features: [
      'Attorney consultation included ($199 legal case review)',
      'Advanced legal dispute strategies',
      'Bankruptcy & foreclosure support',
      'Tax lien removal assistance',
      'Business credit building',
      'Dedicated senior account manager',
      '24/7 priority support',
      'Custom legal documentation',
      'Federal law expertise (FCRA, FDCPA, FCBA)',
      'Creditor lawsuit defense coordination',
      'Court representation referrals',
      'All deletions included in monthly fee',
      'Bi-weekly attorney strategy calls',
      'Comprehensive credit rebuilding plan'
    ],
    featuresEs: [
      'Consulta de abogado incluida (revisión de caso legal de $199)',
      'Estrategias legales avanzadas de disputa',
      'Apoyo de bancarrota y ejecución hipotecaria',
      'Asistencia para eliminar gravámenes fiscales',
      'Construcción de crédito comercial',
      'Gerente de cuenta senior dedicado',
      'Soporte prioritario 24/7',
      'Documentación legal personalizada',
      'Experiencia en leyes federales (FCRA, FDCPA, FCBA)',
      'Coordinación de defensa de demandas de acreedores',
      'Referencias de representación judicial',
      'Todas las eliminaciones incluidas en la tarifa mensual',
      'Llamadas de estrategia de abogado quincenales',
      'Plan integral de reconstrucción de crédito'
    ],

    targetAudience: 'complex_cases',
    idealFor: '10+ negative items, bankruptcy, foreclosure, tax liens, or active lawsuits',
    idealForEs: '10+ artículos negativos, bancarrota, ejecución hipotecaria, gravámenes fiscales o demandas activas',

    estimatedMonths: 12,
    aiRecommendationScore: 10,
    avgConversionRate: 18,
    avgLifetimeValue: 4788,
    churnRate: 12,
    successRate: 94,

    icon: 'Gavel',
    color: '#D32F2F',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-premium.html',

    minCreditScore: 0,
    maxNegativeItems: 999, // No limit
    includesAttorneyConsult: true,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Elite Legal Protection for Complex Cases',
    taglineEs: 'Protección Legal de Elite para Casos Complejos',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  }
];

// ===== PLAN COMPARISON HELPER =====
// Used by ServicePlanSelector to build comparison tables
export const planComparisonCategories = [
  {
    category: 'Pricing',
    categoryEs: 'Precios',
    features: [
      { key: 'monthly', label: 'Monthly Fee', labelEs: 'Tarifa Mensual' },
      { key: 'setupFee', label: 'Setup Fee', labelEs: 'Tarifa de Configuración' },
      { key: 'perDeletion', label: 'Per Deletion', labelEs: 'Por Eliminación' },
      { key: 'contractMonths', label: 'Contract Length', labelEs: 'Duración del Contrato' }
    ]
  },
  {
    category: 'Support',
    categoryEs: 'Soporte',
    features: [
      { key: 'includesPhoneSupport', label: 'Phone Support', labelEs: 'Soporte Telefónico' },
      { key: 'includesAttorneyConsult', label: 'Attorney Consultation', labelEs: 'Consulta de Abogado' }
    ]
  },
  {
    category: 'Monitoring',
    categoryEs: 'Monitoreo',
    features: [
      { key: 'includes3BureauMonitoring', label: '3-Bureau Monitoring', labelEs: 'Monitoreo de 3 Agencias' }
    ]
  }
];

// ===== TARGET AUDIENCE DEFINITIONS =====
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
    description: 'Typical credit repair needs',
    descriptionEs: 'Necesidades típicas de reparación de crédito'
  },
  urgent_needs: {
    label: 'Urgent Needs',
    labelEs: 'Necesidades Urgentes',
    description: 'Clients requiring fast results',
    descriptionEs: 'Clientes que requieren resultados rápidos'
  },
  risk_averse: {
    label: 'Risk-Averse',
    labelEs: 'Averso al Riesgo',
    description: 'Pay only for results',
    descriptionEs: 'Pague solo por resultados'
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
    description: 'Legal issues, bankruptcy, foreclosure',
    descriptionEs: 'Problemas legales, bancarrota, ejecución hipotecaria'
  }
};

// ===== AI RECOMMENDATION SCORING CRITERIA =====
// Used by ServicePlanRecommender to calculate optimal plan
export const recommendationCriteria = {
  // Score multipliers for different factors
  negativeItemsWeight: 0.30,
  creditScoreWeight: 0.25,
  complexityWeight: 0.20,
  urgencyWeight: 0.15,
  budgetWeight: 0.10,

  // Negative items thresholds
  itemThresholds: {
    minimal: { max: 3, preferredPlans: ['diy', 'pfd'] },
    moderate: { max: 8, preferredPlans: ['standard', 'hybrid'] },
    significant: { max: 15, preferredPlans: ['acceleration', 'standard'] },
    severe: { max: 999, preferredPlans: ['premium', 'acceleration'] }
  },

  // Credit score ranges
  scoreRanges: {
    poor: { max: 579, urgency: 'high' },
    fair: { max: 669, urgency: 'medium' },
    good: { max: 739, urgency: 'low' },
    veryGood: { max: 799, urgency: 'low' },
    excellent: { max: 850, urgency: 'low' }
  },

  // Complexity indicators (if any present, increase complexity score)
  complexityIndicators: {
    bankruptcy: { weight: 10, requiresPremium: true },
    foreclosure: { weight: 8, requiresPremium: true },
    taxLien: { weight: 8, requiresPremium: true },
    judgment: { weight: 6, requiresPremium: false },
    lawsuit: { weight: 10, requiresPremium: true },
    multipleChargeOffs: { weight: 5, requiresPremium: false } // 3+ charge-offs
  }
};

// ===== EXPORT ALL CONFIGURATIONS =====
export default {
  defaultServicePlans,
  planComparisonCategories,
  targetAudiences,
  recommendationCriteria
};
