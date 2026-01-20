// ============================================================================
// SERVICE PLANS CONFIGURATION - MERGED COMPLETE VERSION
// ============================================================================
// Central configuration for Speedy Credit Repair service plans
// This configuration is synced to Firebase servicePlans collection
// Editable via ServicePlanManager admin interface (role 7+ required)
//
// VERSION 2.0 - MERGED FEATURES:
// ✅ Preserves ALL original 6 plans for backward compatibility
// ✅ Adds new 3-tier simplified structure for higher conversions
// ✅ Includes Spanish translations throughout
// ✅ Maintains performance metrics and AI scoring
// ✅ Adds regional pricing support
// ✅ Includes à la carte add-ons
// ✅ Adds discount codes system
// ✅ Includes consultation packages
// ✅ Adds additional revenue streams
//
// ORIGINAL 6 PLANS (for existing components):
// 1. DIY Credit Repair - Self-service ($39/mo)
// 2. Standard Plan - Full-service ($149/mo + $25/deletion)
// 3. Acceleration Plan - Expedited ($199/mo, deletions included)
// 4. Pay-For-Delete Only - Results-based ($0/mo + per-deletion fees)
// 5. Hybrid Plan - Mixed pricing ($99/mo + $75/deletion)
// 6. Premium Attorney-Backed - Comprehensive ($349/mo + $199 setup)
//
// NEW 3-TIER STRUCTURE (for optimization):
// 1. Starter (DIY Guide) - $39/mo
// 2. Professional (Full Service) - $149/mo - MOST POPULAR
// 3. VIP Fast Track - $249/mo - FASTEST RESULTS
// + Pay-for-Delete (Special Program)
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

// ===== ORIGINAL 6 SERVICE PLANS (PRESERVED FOR BACKWARD COMPATIBILITY) =====
// These are the existing plans - keep using these until migration tested
// All existing components (ServicePlanManager, ServicePlanSelector, etc.) work with these

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
      setupFee: 69,
      perDeletion: 0,
      contractMonths: 0, // Month-to-month, no contract required
      currency: 'USD',
      
      // NEW: Regional pricing support
      regions: {
        'CA,NY,MA,CT,WA': 39,  // High-income states (keep base price)
        'TX,FL,NC,GA,AZ': 34,  // Mid-range states ($5 less)
        'DEFAULT': 29          // Other states ($10 less)
      }
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
      'Cancel anytime (no contract)',
'IDIQ subscription required: $21.86/month (maintained up to 45 days from service end)'
    ],
    featuresEs: [
      'Plantillas de cartas de disputa generadas por IA',
      'Panel de monitoreo de crédito (básico)',
      'Biblioteca de recursos educativos',
      'Soporte solo por correo electrónico',
      'Acceso al portal del cliente',
      'Herramientas de disputa de autoservicio',
      'Seguimiento de progreso',
      'Cancelar en cualquier momento (sin contrato)',
'Suscripción IDIQ requerida: $21.86/mes (mantenida hasta 45 días desde el final del servicio)'
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

    // NEW: Add-ons available
    addOnsAvailable: true,
    upgradeMessage: 'Upgrade to Standard Plan and we handle everything for you!',

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
      currency: 'USD',
      
      // NEW: Regional pricing
      regions: {
        'CA,NY,MA,CT,WA': 149,
        'TX,FL,NC,GA,AZ': 129,
        'DEFAULT': 119
      }
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

    addOnsAvailable: false,
    upgradeMessage: 'Upgrade to Acceleration Plan for 2x faster results!',

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
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 199,
        'TX,FL,NC,GA,AZ': 179,
        'DEFAULT': 169
      }
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

    icon: 'Bolt',
    color: '#FF9800',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-acceleration.html',

    minCreditScore: 0,
    maxNegativeItems: 20,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Fast-Track to Better Credit',
    taglineEs: 'Vía Rápida a Mejor Crédito',

    addOnsAvailable: false,
    upgradeMessage: null,

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ===== PLAN 4: PAY-FOR-DELETE ONLY =====
  {
    id: 'pfd',
    name: 'Pay-For-Delete Only',
    nameEs: 'Solo Pago por Eliminación',
    enabled: true,
    displayOrder: 4,

    pricing: {
      monthly: 0,
      setupFee: 99, // NEW: Added setup fee
      perDeletion: 100, // NEW: Changed from 150 to 100
      contractMonths: 0,
      currency: 'USD',
      
      // NEW: Tiered pricing
      tiers: [
        { min: 1, max: 3, price: 100 },   // $100 each for 1-3 deletions
        { min: 4, max: 6, price: 90 },    // $90 each for 4-6 deletions
        { min: 7, max: 999, price: 80 }   // $80 each for 7+ deletions
      ]
    },

    description: 'Results-based pricing - only pay for successful deletions with $69 setup fee',
    descriptionEs: 'Precios basados en resultados - solo pague por eliminaciones exitosas con tarifa de configuración de $69',

    features: [
      'No monthly fees - pay only for results',
      'Professional dispute handling',
      'Bureau challenges & negotiations',
      'Monthly progress tracking',
      'Credit monitoring included',
      'No risk - no deletions, no charge',
      'Transparent pricing per deletion',
      'Flexible contract - cancel anytime',
      '$69 setup fee',
      'IDIQ subscription required: $21.86/month (maintained up to 45 days from service end or cancellation)'
    ],
    featuresEs: [
      'Sin tarifas mensuales - pague solo por resultados',
      'Manejo profesional de disputas',
      'Desafíos y negociaciones de agencias',
      'Seguimiento de progreso mensual',
      'Monitoreo de crédito incluido',
      'Sin riesgo - sin eliminaciones, sin cargo',
      'Precios transparentes por eliminación',
      'Contrato flexible - cancelar en cualquier momento',
      'Tarifa de configuración de $69',
      'Suscripción IDIQ requerida: $21.86/mes (mantenida hasta 45 días desde el final del servicio o cancelación)'
    ],

    targetAudience: 'risk_averse',
    idealFor: '3-10 negative items, clients seeking performance-based guarantee',
    idealForEs: '3-10 artículos negativos, clientes que buscan garantía basada en rendimiento',

    estimatedMonths: 12,
    aiRecommendationScore: 6,
    avgConversionRate: 32,
    avgLifetimeValue: 890,
    churnRate: 28,
    successRate: 75,

    icon: 'CheckCircle',
    color: '#4CAF50',
    popular: false,
    bestValue: false,

    contractTemplate: 'service-agreement-pfd.html',

    minCreditScore: 0,
    maxNegativeItems: 15,
    includesAttorneyConsult: false,
    includesPhoneSupport: false,
    includes3BureauMonitoring: true,

    tagline: 'Results First, Payment After',
    taglineEs: 'Resultados Primero, Pago Después',

    addOnsAvailable: true,
    upgradeMessage: 'After deletions, upgrade to Standard to build your credit!',

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
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 99,
        'TX,FL,NC,GA,AZ': 89,
        'DEFAULT': 79
      }
    },

    description: 'Balanced approach with affordable monthly fee plus performance-based deletion fees',
    descriptionEs: 'Enfoque equilibrado con tarifa mensual asequible más tarifas de eliminación basadas en rendimiento',

    features: [
      'Low monthly fee ($99/mo)',
      'Professional dispute services',
      'Phone & email support',
      '3-bureau credit monitoring',
      'Monthly progress reports',
      'Pay per successful deletion ($75 each)',
      'Flexible pricing structure',
      'Best of both worlds'
    ],
    featuresEs: [
      'Tarifa mensual baja ($99/mes)',
      'Servicios profesionales de disputa',
      'Soporte telefónico y por correo electrónico',
      'Monitoreo de crédito de 3 agencias',
      'Informes de progreso mensuales',
      'Pague por eliminación exitosa ($75 cada una)',
      'Estructura de precios flexible',
      'Lo mejor de ambos mundos'
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

    addOnsAvailable: false,
    upgradeMessage: 'Upgrade to Standard for unlimited deletions included!',

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
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 349,
        'TX,FL,NC,GA,AZ': 329,
        'DEFAULT': 309
      }
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

    addOnsAvailable: false,
    upgradeMessage: null,

    createdAt: null,
    updatedAt: null,
    createdBy: null
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// NEW: 3-TIER SIMPLIFIED PLANS (FOR A/B TESTING & CONVERSION OPTIMIZATION)
// ═══════════════════════════════════════════════════════════════════════════
// Use these for new sign-ups to test conversion rate improvement
// Psychology: 3 choices = optimal decision-making vs 6 choices = paralysis

export const simplifiedServicePlans = [
  // ═════════════════════════════════════════════════════════════════════════
  // TIER 1: STARTER (DIY GUIDE)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'starter',
    name: 'DIY Guide',
    nameEs: 'Guía de Bricolaje',
    enabled: true,
    displayOrder: 1,

    pricing: {
      monthly: 39,
      setupFee: 0,
      perDeletion: 0,
      contractMonths: 0,
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 39,
        'TX,FL,NC,GA,AZ': 34,
        'DEFAULT': 29
      }
    },

    description: 'Self-service credit repair with AI-powered tools and expert guidance',
    descriptionEs: 'Reparación de crédito de autoservicio con herramientas impulsadas por IA y orientación experta',

    features: [
      'AI-generated dispute letter templates',
      'Credit monitoring dashboard',
      'Video tutorials & guides',
      'Email support (48hr response)',
      'Client portal access',
      'Self-service dispute tools',
      'Progress tracking',
      'Educational resources library',
      'Cancel anytime (no contract)'
    ],
    featuresEs: [
      'Plantillas de cartas de disputa generadas por IA',
      'Panel de monitoreo de crédito',
      'Tutoriales en video y guías',
      'Soporte por correo electrónico (respuesta en 48 horas)',
      'Acceso al portal del cliente',
      'Herramientas de disputa de autoservicio',
      'Seguimiento de progreso',
      'Biblioteca de recursos educativos',
      'Cancelar en cualquier momento (sin contrato)'
    ],

    targetAudience: 'budget_conscious',
    idealFor: '1-3 negative items, tech-savvy clients who prefer DIY approach',
    idealForEs: '1-3 artículos negativos, clientes conocedores de la tecnología que prefieren el enfoque de bricolaje',

    estimatedMonths: 6,
    aiRecommendationScore: 5,
    avgConversionRate: 42,
    avgLifetimeValue: 234,
    churnRate: 35,
    successRate: 68,

    icon: 'SelfImprovement',
    color: '#4CAF50',
    popular: false,
    bestValue: false,
    badge: null,

    contractTemplate: 'service-agreement-starter.html',

    minCreditScore: 0,
    maxNegativeItems: 5,
    includesAttorneyConsult: false,
    includesPhoneSupport: false,
    includes3BureauMonitoring: false,

    tagline: 'Take Control of Your Credit Journey',
    taglineEs: 'Tome el Control de su Viaje de Crédito',

    addOnsAvailable: true,
    upgradeMessage: 'Upgrade to Professional and we handle everything for you!',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TIER 2: PROFESSIONAL (FULL SERVICE) - MOST POPULAR
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'professional',
    name: 'Professional',
    nameEs: 'Profesional',
    enabled: true,
    displayOrder: 2,

    pricing: {
      monthly: 149,
      setupFee: 0,
      perDeletion: 0,  // Simplified: deletions included
      contractMonths: 6,
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 149,
        'TX,FL,NC,GA,AZ': 129,
        'DEFAULT': 119
      }
    },

    description: 'Full-service credit repair with unlimited professional support and all deletions included',
    descriptionEs: 'Reparación de crédito de servicio completo con soporte profesional ilimitado y todas las eliminaciones incluidas',

    features: [
      '✨ Everything handled by experts',
      '✨ Unlimited bureau disputes',
      '✨ Creditor negotiations',
      '✨ Phone & email support',
      '✨ 3-bureau credit monitoring',
      '✨ Monthly progress reports',
      '✨ Client portal access',
      '✨ FREE 15-min consultation (1/month)',
      '✨ 50% OFF strategy sessions',
      '✨ Fax dispute service included',
      '✨ Custom goodwill letters',
      '✨ Debt validation letters',
      '✨ 30-day money-back guarantee'
    ],
    featuresEs: [
      '✨ Todo manejado por expertos',
      '✨ Disputas ilimitadas de agencias',
      '✨ Negociaciones con acreedores',
      '✨ Soporte telefónico y por correo electrónico',
      '✨ Monitoreo de crédito de 3 agencias',
      '✨ Informes de progreso mensuales',
      '✨ Acceso al portal del cliente',
      '✨ Consulta GRATIS de 15 minutos (1/mes)',
      '✨ 50% de descuento en sesiones de estrategia',
      '✨ Servicio de disputa por fax incluido',
      '✨ Cartas de buena voluntad personalizadas',
      '✨ Cartas de validación de deuda',
      '✨ Garantía de devolución de dinero de 30 días'
    ],

    targetAudience: 'mainstream',
    idealFor: '4-8 negative items, most clients (80% choose this plan)',
    idealForEs: '4-8 artículos negativos, la mayoría de los clientes (80% eligen este plan)',

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
    badge: 'MOST POPULAR',

    contractTemplate: 'service-agreement-professional.html',

    minCreditScore: 0,
    maxNegativeItems: 15,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Professional Credit Repair Made Simple',
    taglineEs: 'Reparación de Crédito Profesional Simplificada',

    addOnsAvailable: false,
    upgradeMessage: 'Need faster results? Try VIP Fast Track!',

    createdAt: null,
    updatedAt: null,
    createdBy: null
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TIER 3: VIP FAST TRACK (Combines Acceleration + Premium features)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'vip',
    name: 'VIP Fast Track',
    nameEs: 'VIP Vía Rápida',
    enabled: true,
    displayOrder: 3,

    pricing: {
      monthly: 249,
      setupFee: 0,
      perDeletion: 0,
      contractMonths: 9,
      currency: 'USD',
      
      regions: {
        'CA,NY,MA,CT,WA': 249,
        'TX,FL,NC,GA,AZ': 229,
        'DEFAULT': 209
      }
    },

    description: 'Accelerated results with white-glove service, priority processing, and direct access to Chris Lahage',
    descriptionEs: 'Resultados acelerados con servicio de guante blanco, procesamiento prioritario y acceso directo a Chris Lahage',

    features: [
      '🌟 Everything in Professional',
      '🌟 Priority processing (2x faster)',
      '🌟 Bi-weekly disputes',
      '🌟 Weekly progress updates',
      '🌟 Direct access to Chris Lahage',
      '🌟 Dedicated senior account manager',
      '🌟 FREE 15-min calls (2/month)',
      '🌟 FREE 30-min strategy (1/month)',
      '🌟 FREE 60-min deep dive (1/quarter)',
      '🌟 Advanced dispute strategies',
      '🌟 Creditor intervention',
      '🌟 Concierge service',
      '🌟 90-day deletion guarantee',
      '🌟 24/7 priority support'
    ],
    featuresEs: [
      '🌟 Todo en Profesional',
      '🌟 Procesamiento prioritario (2 veces más rápido)',
      '🌟 Disputas quincenales',
      '🌟 Actualizaciones de progreso semanales',
      '🌟 Acceso directo a Chris Lahage',
      '🌟 Gerente de cuenta senior dedicado',
      '🌟 Llamadas GRATIS de 15 minutos (2/mes)',
      '🌟 Estrategia GRATIS de 30 minutos (1/mes)',
      '🌟 Inmersión profunda GRATIS de 60 minutos (1/trimestre)',
      '🌟 Estrategias de disputa avanzadas',
      '🌟 Intervención con acreedores',
      '🌟 Servicio de conserjería',
      '🌟 Garantía de eliminación de 90 días',
      '🌟 Soporte prioritario 24/7'
    ],

    targetAudience: 'urgent_needs',
    idealFor: '8+ negative items, complex cases, time-sensitive needs, high-value clients',
    idealForEs: '8+ artículos negativos, casos complejos, necesidades urgentes, clientes de alto valor',

    estimatedMonths: 12,
    aiRecommendationScore: 9,
    avgConversionRate: 25,
    avgLifetimeValue: 3000,
    churnRate: 14,
    successRate: 90,

    icon: 'Verified',
    color: '#9C27B0',
    popular: false,
    bestValue: false,
    badge: 'FASTEST RESULTS',

    contractTemplate: 'service-agreement-vip.html',

    minCreditScore: 0,
    maxNegativeItems: 999,
    includesAttorneyConsult: false,
    includesPhoneSupport: true,
    includes3BureauMonitoring: true,

    tagline: 'Elite Credit Repair for Maximum Results',
    taglineEs: 'Reparación de Crédito de Elite para Resultados Máximos',

    addOnsAvailable: false,
    upgradeMessage: null,

    createdAt: null,
    updatedAt: null,
    createdBy: null
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// À LA CARTE ADD-ONS (DIY/Starter & Pay-for-Delete Plans Only)
// ═══════════════════════════════════════════════════════════════════════════

export const addOnServices = {
  faxDispute: {
    id: 'fax-dispute',
    name: 'Fax Dispute Service',
    nameEs: 'Servicio de Disputa por Fax',
    description: 'We fax your disputes to bureaus (faster delivery than mail)',
    descriptionEs: 'Enviamos por fax sus disputas a las agencias (entrega más rápida que el correo)',
    price: 15,
    per: 'round',
    includedIn: ['standard', 'professional', 'acceleration', 'vip', 'premium'],
    conversionMessage: 'Upgrade to Professional and get unlimited fax disputes FREE!',
    conversionMessageEs: '¡Actualice a Profesional y obtenga disputas por fax ilimitadas GRATIS!'
  },

  goodwillLetter: {
    id: 'goodwill-letter',
    name: 'Custom Goodwill Letter',
    nameEs: 'Carta de Buena Voluntad Personalizada',
    description: 'Personalized letter to creditors requesting removal as courtesy',
    descriptionEs: 'Carta personalizada a acreedores solicitando eliminación como cortesía',
    price: 25,
    per: 'letter',
    includedIn: ['standard', 'professional', 'acceleration', 'vip', 'premium'],
    conversionMessage: 'Professional plan includes unlimited custom letters!',
    conversionMessageEs: '¡El plan Profesional incluye cartas personalizadas ilimitadas!'
  },

  responseLetter: {
    id: 'response-letter',
    name: '30-Day Response Letter',
    nameEs: 'Carta de Respuesta de 30 Días',
    description: 'Expert response to bureau verification requests',
    descriptionEs: 'Respuesta experta a solicitudes de verificación de agencias',
    price: 35,
    per: 'letter',
    includedIn: ['standard', 'professional', 'acceleration', 'vip', 'premium']
  },

  validationLetter: {
    id: 'validation-letter',
    name: 'Debt Validation Letter',
    nameEs: 'Carta de Validación de Deuda',
    description: 'Force creditors to prove debt is valid and accurate',
    descriptionEs: 'Obligar a los acreedores a probar que la deuda es válida y precisa',
    price: 25,
    per: 'letter',
    includedIn: ['standard', 'professional', 'acceleration', 'vip', 'premium']
  },

  creditRoadmap: {
    id: 'credit-roadmap',
    name: 'Credit Builder Roadmap',
    nameEs: 'Hoja de Ruta del Constructor de Crédito',
    description: '6-month personalized credit building plan with milestones',
    descriptionEs: 'Plan personalizado de construcción de crédito de 6 meses con hitos',
    price: 49,
    per: 'one-time',
    includedIn: ['vip', 'premium']
  },

  disputePackage: {
    id: 'dispute-package',
    name: '609 Dispute Package',
    nameEs: 'Paquete de Disputa 609',
    description: '3 advanced dispute letters using Section 609 strategy',
    descriptionEs: '3 cartas de disputa avanzadas usando la estrategia de la Sección 609',
    price: 75,
    per: 'package',
    includedIn: ['standard', 'professional', 'acceleration', 'vip', 'premium']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONSULTATION PACKAGES (Tiered Pricing by Plan Level)
// ═══════════════════════════════════════════════════════════════════════════

export const consultationPackages = {
  quick: {
    id: 'quick-qa',
    duration: 15,
    name: 'Quick Q&A',
    nameEs: 'Preguntas Rápidas',
    description: 'Quick questions answered by credit repair expert',
    descriptionEs: 'Preguntas rápidas respondidas por experto en reparación de crédito',
    pricing: {
      diy: 25,
      starter: 25,
      standard: 0,        // 1 FREE per month
      professional: 0,    // 1 FREE per month
      acceleration: 0,    // 2 FREE per month
      vip: 0,            // 2 FREE per month
      premium: 0,        // Unlimited FREE
      public: 49
    }
  },

  strategy: {
    id: 'strategy-session',
    duration: 30,
    name: 'Strategy Session',
    nameEs: 'Sesión de Estrategia',
    description: 'In-depth strategy planning with Chris Lahage',
    descriptionEs: 'Planificación de estrategia en profundidad con Chris Lahage',
    pricing: {
      diy: 75,
      starter: 75,
      standard: 50,       // 50% off
      professional: 50,   // 50% off
      acceleration: 0,    // 1 FREE per month
      vip: 0,            // 1 FREE per month
      premium: 0,        // Unlimited FREE
      public: 99
    }
  },

  deepDive: {
    id: 'deep-dive',
    duration: 60,
    name: 'Deep Dive',
    nameEs: 'Inmersión Profunda',
    description: 'Comprehensive review and planning with Chris Lahage',
    descriptionEs: 'Revisión y planificación integral con Chris Lahage',
    pricing: {
      diy: 150,
      starter: 150,
      standard: 99,
      professional: 99,
      acceleration: 0,    // 1 FREE per quarter
      vip: 0,            // 1 FREE per quarter
      premium: 0,        // Unlimited FREE
      public: 199
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADDITIONAL REVENUE STREAMS
// ═══════════════════════════════════════════════════════════════════════════

export const additionalServices = {
  tradelines: {
    name: 'Authorized User Tradelines',
    nameEs: 'Líneas Comerciales de Usuario Autorizado',
    pricing: [
      { tier: 'Silver', limit: 2000, history: 2, cost: 150, price: 299, margin: 149 },
      { tier: 'Gold', limit: 5000, history: 5, cost: 250, price: 499, margin: 249 },
      { tier: 'Platinum', limit: 10000, history: 10, cost: 450, price: 899, margin: 449 }
    ],
    description: 'Boost score 40-100 points in 30 days with authorized user accounts',
    descriptionEs: 'Aumente el puntaje de 40 a 100 puntos en 30 días con cuentas de usuario autorizado'
  },

  securedCardStrategy: {
    name: 'Secured Card Strategy',
    nameEs: 'Estrategia de Tarjeta Asegurada',
    price: 49,
    description: 'Expert guidance on which secured cards to get and how to use them strategically',
    descriptionEs: 'Orientación experta sobre qué tarjetas aseguradas obtener y cómo usarlas estratégicamente'
  },

  creditBuilderLoan: {
    name: 'Credit Builder Loan Setup',
    nameEs: 'Configuración de Préstamo Constructor de Crédito',
    price: 99,
    description: 'Strategic guidance on credit builder loans (SELF affiliate)',
    descriptionEs: 'Orientación estratégica sobre préstamos constructores de crédito (afiliado SELF)',
    affiliateCommission: 20
  },

  monthlyMaintenance: {
    name: 'Monthly Maintenance Program',
    nameEs: 'Programa de Mantenimiento Mensual',
    price: 49,
    description: 'Post-deletion ongoing protection and monitoring',
    descriptionEs: 'Protección y monitoreo continuo posterior a la eliminación'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT CODES
// ═══════════════════════════════════════════════════════════════════════════

export const discountCodes = {
  // Regional discounts
  'SOUTH20': {
    amount: 20,
    description: 'Southern States Discount',
    descriptionEs: 'Descuento de Estados del Sur',
    regions: ['TX', 'FL', 'GA', 'NC', 'SC']
  },
  'MIDWEST25': {
    amount: 25,
    description: 'Midwest Discount',
    descriptionEs: 'Descuento del Medio Oeste',
    regions: ['OH', 'IN', 'MI', 'IL', 'WI']
  },

  // Campaign discounts
  'EXITINTENT50': {
    amount: 50,
    description: 'Exit Intent Special',
    descriptionEs: 'Especial de Intención de Salida',
    oneTimeUse: true,
    expirationHours: 24
  },
  'FIRSTMONTH50': {
    amount: 50,
    description: 'First Month Discount',
    descriptionEs: 'Descuento del Primer Mes',
    firstMonthOnly: true
  },

  // Affiliate discounts
  'REFERRAL20': {
    amount: 20,
    description: 'Referral Discount',
    descriptionEs: 'Descuento por Referencia',
    recurring: false
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PLAN COMPARISON HELPER (Preserved from original)
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// TARGET AUDIENCE DEFINITIONS (Preserved from original)
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// AI RECOMMENDATION SCORING CRITERIA (Updated for new structure)
// ═══════════════════════════════════════════════════════════════════════════

export const recommendationCriteria = {
  // Score multipliers for different factors
  negativeItemsWeight: 0.30,
  creditScoreWeight: 0.25,
  complexityWeight: 0.20,
  urgencyWeight: 0.15,
  budgetWeight: 0.10,

  // Negative items thresholds (UPDATED for both plan structures)
  itemThresholds: {
    minimal: {
      max: 3,
      preferredPlans: ['diy', 'starter', 'pfd'],
      preferredPlansSimplified: ['starter', 'pfd']
    },
    moderate: {
      max: 8,
      preferredPlans: ['standard', 'hybrid', 'professional', 'pfd'],
      preferredPlansSimplified: ['professional', 'pfd']
    },
    significant: {
      max: 15,
      preferredPlans: ['acceleration', 'standard', 'vip', 'professional'],
      preferredPlansSimplified: ['vip', 'professional']
    },
    severe: {
      max: 999,
      preferredPlans: ['premium', 'acceleration', 'vip'],
      preferredPlansSimplified: ['vip']
    }
  },

  // Credit score ranges
  scoreRanges: {
    poor: { max: 579, urgency: 'high' },
    fair: { max: 669, urgency: 'medium' },
    good: { max: 739, urgency: 'low' },
    veryGood: { max: 799, urgency: 'low' },
    excellent: { max: 850, urgency: 'low' }
  },

  // Complexity indicators
  complexityIndicators: {
    bankruptcy: { weight: 10, requiresVIP: true, requiresPremium: true },
    foreclosure: { weight: 8, requiresVIP: true, requiresPremium: true },
    taxLien: { weight: 8, requiresVIP: true, requiresPremium: true },
    judgment: { weight: 6, requiresVIP: false, requiresPremium: false },
    lawsuit: { weight: 10, requiresVIP: true, requiresPremium: true },
    multipleChargeOffs: { weight: 5, requiresVIP: false, requiresPremium: false }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get regional price for a plan
 * @param {string} planId - Plan ID (e.g., 'standard', 'professional')
 * @param {string} zipCode - User's zip code
 * @param {boolean} useSimplified - Use simplified 3-tier plans (default: false)
 * @returns {number} Regional price
 */
export function getRegionalPrice(planId, zipCode, useSimplified = false) {
  const plans = useSimplified ? simplifiedServicePlans : defaultServicePlans;
  const plan = plans.find(p => p.id === planId);
  
  if (!plan || !plan.pricing.regions) {
    return plan?.pricing.monthly || null;
  }

  const state = getStateFromZip(zipCode);

  // Check each region
  for (const [states, price] of Object.entries(plan.pricing.regions)) {
    if (states === 'DEFAULT') continue;
    if (states.split(',').includes(state)) {
      return price;
    }
  }

  // Return default regional price
  return plan.pricing.regions.DEFAULT || plan.pricing.monthly;
}

/**
 * Get state from zip code (placeholder - integrate with real zip database)
 * @param {string} zipCode - 5-digit zip code
 * @returns {string} State abbreviation
 */
function getStateFromZip(zipCode) {
  const zip = parseInt(zipCode);
  
  // California
  if (zip >= 90000 && zip <= 96199) return 'CA';
  // New York
  if (zip >= 10000 && zip <= 14999) return 'NY';
  // Texas
  if (zip >= 75000 && zip <= 79999 || zip >= 73000 && zip <= 73999 || zip >= 77000 && zip <= 77999 || zip >= 78000 && zip <= 78999) return 'TX';
  // Florida
  if (zip >= 32000 && zip <= 34999) return 'FL';
  // Add more...
  
  return 'DEFAULT';
}

/**
 * Check if add-on is included in plan
 * @param {string} addOnId - Add-on ID
 * @param {string} planId - Plan ID
 * @returns {boolean}
 */
export function isAddOnIncluded(addOnId, planId) {
  const addOn = addOnServices[addOnId];
  return addOn && addOn.includedIn && addOn.includedIn.includes(planId);
}

/**
 * Get consultation price for plan level
 * @param {string} consultationType - 'quick', 'strategy', or 'deepDive'
 * @param {string} planId - Plan ID
 * @returns {number} Price (0 if free)
 */
export function getConsultationPrice(consultationType, planId) {
  const consultation = consultationPackages[consultationType];
  if (!consultation) return null;
  
  return consultation.pricing[planId] !== undefined 
    ? consultation.pricing[planId] 
    : consultation.pricing.public;
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map old plan IDs to new simplified structure
 * For A/B testing and gradual migration
 */
export const planMigrationMap = {
  'diy': 'starter',
  'standard': 'professional',
  'hybrid': 'professional',  // Consolidate into Professional
  'acceleration': 'vip',
  'premium': 'vip',          // Consolidate into VIP
  'pfd': 'pfd'              // Keep as special program
};

/**
 * Get equivalent simplified plan
 * @param {string} originalPlanId - Original plan ID
 * @returns {string} Simplified plan ID
 */
export function getSimplifiedPlanId(originalPlanId) {
  return planMigrationMap[originalPlanId] || originalPlanId;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Original plans (for existing components)
  defaultServicePlans,
  
  // New simplified plans (for A/B testing)
  simplifiedServicePlans,
  
  // Revenue optimization features
  addOnServices,
  consultationPackages,
  additionalServices,
  discountCodes,
  
  // Preserved features
  planComparisonCategories,
  targetAudiences,
  recommendationCriteria,
  
  // Helper functions
  getRegionalPrice,
  isAddOnIncluded,
  getConsultationPrice,
  getSimplifiedPlanId,
  planMigrationMap
};