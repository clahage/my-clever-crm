// src/contexts/TaxContext.jsx
// ============================================================================
// 🏛️ SPEEDY TAX SERVICES - COMPREHENSIVE TAX CONTEXT PROVIDER
// ============================================================================
// COMPLETE STATE MANAGEMENT FOR TAX MODULE
// Version: 1.0.0 | T-3 MEGA ULTIMATE Implementation
// ============================================================================
// FEATURES:
// ✅ Complete tax return lifecycle management
// ✅ Multi-language support (English, Spanish, French, Chinese, Vietnamese, Korean)
// ✅ Real-time Firestore synchronization
// ✅ Preparer management and assignment
// ✅ Document tracking and OCR integration
// ✅ Payment and commission tracking
// ✅ AI-powered analysis integration
// ✅ Client protection mechanisms
// ✅ Role-based access control
// ✅ Comprehensive error handling
// ✅ Offline support with queue management
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef
} from 'react';

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  endBefore,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';

import { httpsCallable } from 'firebase/functions';

import { db, storage, functions } from '../lib/firebase';
import { useAuth } from './AuthContext';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Multi-language support
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
};

// Tax return status workflow
export const TAX_RETURN_STATUSES = {
  INTAKE: 'intake',
  DOCUMENTS_PENDING: 'documents_pending',
  READY_FOR_PREP: 'ready_for_prep',
  IN_PREPARATION: 'in_preparation',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  CLIENT_REVIEW: 'client_review',
  PENDING_SIGNATURE: 'pending_signature',
  READY_TO_FILE: 'ready_to_file',
  FILED: 'filed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
};

// Status display configuration
export const STATUS_CONFIG = {
  [TAX_RETURN_STATUSES.INTAKE]: {
    label: { en: 'Intake', es: 'Admisión', fr: 'Admission', zh: '接收' },
    color: 'info',
    icon: 'FileText',
    description: { en: 'Initial client intake', es: 'Admisión inicial del cliente' }
  },
  [TAX_RETURN_STATUSES.DOCUMENTS_PENDING]: {
    label: { en: 'Documents Pending', es: 'Documentos Pendientes', fr: 'Documents en attente', zh: '待处理文件' },
    color: 'warning',
    icon: 'Clock',
    description: { en: 'Waiting for client documents', es: 'Esperando documentos del cliente' }
  },
  [TAX_RETURN_STATUSES.READY_FOR_PREP]: {
    label: { en: 'Ready for Prep', es: 'Listo para Preparar', fr: 'Prêt à préparer', zh: '准备就绪' },
    color: 'primary',
    icon: 'CheckCircle',
    description: { en: 'All documents received, ready for preparation', es: 'Todos los documentos recibidos' }
  },
  [TAX_RETURN_STATUSES.IN_PREPARATION]: {
    label: { en: 'In Preparation', es: 'En Preparación', fr: 'En préparation', zh: '准备中' },
    color: 'secondary',
    icon: 'Edit',
    description: { en: 'Preparer is working on return', es: 'El preparador está trabajando' }
  },
  [TAX_RETURN_STATUSES.PENDING_REVIEW]: {
    label: { en: 'Pending Review', es: 'Revisión Pendiente', fr: 'En attente de révision', zh: '待审核' },
    color: 'warning',
    icon: 'Eye',
    description: { en: 'Awaiting quality review', es: 'Esperando revisión de calidad' }
  },
  [TAX_RETURN_STATUSES.APPROVED]: {
    label: { en: 'Approved', es: 'Aprobado', fr: 'Approuvé', zh: '已批准' },
    color: 'success',
    icon: 'CheckCircle2',
    description: { en: 'Review passed, ready for client', es: 'Revisión aprobada' }
  },
  [TAX_RETURN_STATUSES.CLIENT_REVIEW]: {
    label: { en: 'Client Review', es: 'Revisión del Cliente', fr: 'Révision client', zh: '客户审核' },
    color: 'info',
    icon: 'User',
    description: { en: 'Client reviewing return', es: 'El cliente está revisando' }
  },
  [TAX_RETURN_STATUSES.PENDING_SIGNATURE]: {
    label: { en: 'Pending Signature', es: 'Firma Pendiente', fr: 'Signature en attente', zh: '待签名' },
    color: 'warning',
    icon: 'Pen',
    description: { en: 'Awaiting e-signature', es: 'Esperando firma electrónica' }
  },
  [TAX_RETURN_STATUSES.READY_TO_FILE]: {
    label: { en: 'Ready to File', es: 'Listo para Presentar', fr: 'Prêt à déposer', zh: '准备提交' },
    color: 'primary',
    icon: 'Send',
    description: { en: 'Ready for e-file submission', es: 'Listo para presentación electrónica' }
  },
  [TAX_RETURN_STATUSES.FILED]: {
    label: { en: 'Filed', es: 'Presentado', fr: 'Déposé', zh: '已提交' },
    color: 'secondary',
    icon: 'Upload',
    description: { en: 'Submitted to IRS', es: 'Presentado al IRS' }
  },
  [TAX_RETURN_STATUSES.ACCEPTED]: {
    label: { en: 'Accepted', es: 'Aceptado', fr: 'Accepté', zh: '已接受' },
    color: 'success',
    icon: 'CheckCircle',
    description: { en: 'IRS accepted return', es: 'IRS aceptó la declaración' }
  },
  [TAX_RETURN_STATUSES.REJECTED]: {
    label: { en: 'Rejected', es: 'Rechazado', fr: 'Rejeté', zh: '已拒绝' },
    color: 'error',
    icon: 'XCircle',
    description: { en: 'IRS rejected - needs correction', es: 'IRS rechazó - necesita corrección' }
  },
  [TAX_RETURN_STATUSES.COMPLETED]: {
    label: { en: 'Completed', es: 'Completado', fr: 'Terminé', zh: '已完成' },
    color: 'success',
    icon: 'Award',
    description: { en: 'Return fully processed', es: 'Declaración completamente procesada' }
  },
  [TAX_RETURN_STATUSES.ON_HOLD]: {
    label: { en: 'On Hold', es: 'En Espera', fr: 'En attente', zh: '暂停' },
    color: 'default',
    icon: 'Pause',
    description: { en: 'Processing paused', es: 'Procesamiento pausado' }
  },
  [TAX_RETURN_STATUSES.CANCELLED]: {
    label: { en: 'Cancelled', es: 'Cancelado', fr: 'Annulé', zh: '已取消' },
    color: 'error',
    icon: 'X',
    description: { en: 'Return cancelled', es: 'Declaración cancelada' }
  }
};

// Return types and subtypes
export const RETURN_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business'
};

export const RETURN_SUBTYPES = {
  // Personal
  SIMPLE_1040: 'simple_1040',
  MODERATE_1040: 'moderate_1040',
  COMPLEX_1040: 'complex_1040',
  PREMIUM_1040: 'premium_1040',
  MILITARY: 'military',
  EXPAT: 'expat',
  AMENDED: 'amended',
  BACK_YEAR: 'back_year',
  // Business
  SOLE_PROP: 'sole_prop',
  PARTNERSHIP: 'partnership',
  S_CORP: 's_corp',
  C_CORP: 'c_corp',
  NONPROFIT: 'nonprofit',
  PAYROLL: 'payroll'
};

// Fee structure
export const FEE_STRUCTURE = {
  [RETURN_SUBTYPES.SIMPLE_1040]: {
    fee: 199,
    preparerPayout: 99,
    platformRevenue: 100,
    label: { en: 'Simple 1040 (W-2, standard deduction)', es: '1040 Simple (W-2, deducción estándar)' }
  },
  [RETURN_SUBTYPES.MODERATE_1040]: {
    fee: 349,
    preparerPayout: 175,
    platformRevenue: 174,
    label: { en: 'Moderate 1040 (itemized deductions)', es: '1040 Moderado (deducciones detalladas)' }
  },
  [RETURN_SUBTYPES.COMPLEX_1040]: {
    fee: 549,
    preparerPayout: 275,
    platformRevenue: 274,
    label: { en: 'Complex 1040 (self-employment)', es: '1040 Complejo (autónomo)' }
  },
  [RETURN_SUBTYPES.PREMIUM_1040]: {
    fee: 749,
    preparerPayout: 375,
    platformRevenue: 374,
    label: { en: 'Premium 1040 (multi-state/rental)', es: '1040 Premium (multi-estado/alquiler)' }
  },
  [RETURN_SUBTYPES.MILITARY]: {
    fee: 299,
    preparerPayout: 150,
    platformRevenue: 149,
    label: { en: 'Military Special', es: 'Especial Militar' }
  },
  [RETURN_SUBTYPES.EXPAT]: {
    fee: 599,
    preparerPayout: 300,
    platformRevenue: 299,
    label: { en: 'Expat Returns', es: 'Declaraciones de Expatriados' }
  },
  [RETURN_SUBTYPES.AMENDED]: {
    fee: 299,
    preparerPayout: 150,
    platformRevenue: 149,
    label: { en: 'Amended Return (1040-X)', es: 'Declaración Enmendada (1040-X)' }
  },
  [RETURN_SUBTYPES.BACK_YEAR]: {
    fee: 399,
    preparerPayout: 200,
    platformRevenue: 199,
    label: { en: 'Back Year (unfiled)', es: 'Año Anterior (no presentado)' }
  },
  [RETURN_SUBTYPES.SOLE_PROP]: {
    fee: 399,
    preparerPayout: 200,
    platformRevenue: 199,
    label: { en: 'Sole Proprietor (Schedule C)', es: 'Propietario Único (Anexo C)' }
  },
  [RETURN_SUBTYPES.PARTNERSHIP]: {
    fee: 799,
    preparerPayout: 400,
    platformRevenue: 399,
    label: { en: 'Partnership (Form 1065)', es: 'Sociedad (Formulario 1065)' }
  },
  [RETURN_SUBTYPES.S_CORP]: {
    fee: 999,
    preparerPayout: 500,
    platformRevenue: 499,
    label: { en: 'S-Corporation (Form 1120-S)', es: 'Corporación S (Formulario 1120-S)' }
  },
  [RETURN_SUBTYPES.C_CORP]: {
    fee: 1499,
    preparerPayout: 750,
    platformRevenue: 749,
    label: { en: 'C-Corporation (Form 1120)', es: 'Corporación C (Formulario 1120)' }
  },
  [RETURN_SUBTYPES.NONPROFIT]: {
    fee: 899,
    preparerPayout: 450,
    platformRevenue: 449,
    label: { en: 'Non-Profit (Form 990)', es: 'Sin Fines de Lucro (Formulario 990)' }
  },
  [RETURN_SUBTYPES.PAYROLL]: {
    fee: 599,
    preparerPayout: 300,
    platformRevenue: 299,
    label: { en: 'Quarterly Payroll (941s)', es: 'Nómina Trimestral (941s)' }
  }
};

// Add-on services
export const ADDON_SERVICES = {
  SCHEDULE_C: { fee: 175, preparerPayout: 88, label: { en: 'Schedule C Add-on', es: 'Anexo C Adicional' } },
  RENTAL_PROPERTY: { fee: 125, preparerPayout: 63, label: { en: 'Rental Property (each)', es: 'Propiedad en Alquiler (cada una)' } },
  STATE_RETURN: { fee: 75, preparerPayout: 38, label: { en: 'State Return (each)', es: 'Declaración Estatal (cada una)' } },
  AUDIT_PROTECTION: { fee: 99, preparerPayout: 0, label: { en: 'Audit Protection Plan', es: 'Plan de Protección de Auditoría' } },
  RUSH_PROCESSING: { fee: 150, preparerPayout: 75, label: { en: 'Rush Processing (24-48hr)', es: 'Procesamiento Urgente (24-48hr)' } },
  PRIOR_YEAR_COMPARISON: { fee: 50, preparerPayout: 25, label: { en: 'Prior Year Comparison Report', es: 'Informe Comparativo de Año Anterior' } }
};

// Upsell services
export const UPSELL_SERVICES = {
  IRS_DEBT_RESOLUTION: {
    minFee: 1500,
    maxFee: 5000,
    minCost: 500,
    maxCost: 1500,
    label: { en: 'IRS Debt Resolution', es: 'Resolución de Deuda del IRS' }
  },
  AUDIT_REPRESENTATION: {
    hourlyFee: 250,
    hourlyCost: 125,
    label: { en: 'Audit Representation', es: 'Representación en Auditoría' }
  },
  BOOKKEEPING_MONTHLY: {
    minFee: 299,
    maxFee: 799,
    minCost: 150,
    maxCost: 400,
    label: { en: 'Bookkeeping (monthly)', es: 'Contabilidad (mensual)' }
  },
  PAYROLL_SERVICE: {
    minFee: 99,
    maxFee: 299,
    minCost: 50,
    maxCost: 150,
    label: { en: 'Payroll Service (monthly)', es: 'Servicio de Nómina (mensual)' }
  },
  QUARTERLY_PLANNING: {
    fee: 199,
    cost: 100,
    label: { en: 'Quarterly Tax Planning', es: 'Planificación Tributaria Trimestral' }
  },
  ENTITY_FORMATION: {
    fee: 499,
    cost: 150,
    label: { en: 'Entity Formation (LLC)', es: 'Formación de Entidad (LLC)' }
  },
  SCORP_ELECTION: {
    fee: 299,
    cost: 100,
    label: { en: 'S-Corp Election', es: 'Elección de Corporación S' }
  },
  NOTARY_SERVICES: {
    fee: 25,
    cost: 10,
    label: { en: 'Notary Services (per signature)', es: 'Servicios Notariales (por firma)' }
  }
};

// Document types
export const DOCUMENT_TYPES = {
  // Income documents
  W2: { category: 'income', label: { en: 'W-2 Wage Statement', es: 'Declaración de Salarios W-2' } },
  '1099_INT': { category: 'income', label: { en: '1099-INT Interest Income', es: '1099-INT Ingresos por Intereses' } },
  '1099_DIV': { category: 'income', label: { en: '1099-DIV Dividends', es: '1099-DIV Dividendos' } },
  '1099_B': { category: 'income', label: { en: '1099-B Stock Sales', es: '1099-B Ventas de Acciones' } },
  '1099_R': { category: 'income', label: { en: '1099-R Retirement Distributions', es: '1099-R Distribuciones de Jubilación' } },
  '1099_MISC': { category: 'income', label: { en: '1099-MISC Miscellaneous Income', es: '1099-MISC Ingresos Varios' } },
  '1099_NEC': { category: 'income', label: { en: '1099-NEC Nonemployee Compensation', es: '1099-NEC Compensación No Empleado' } },
  '1099_G': { category: 'income', label: { en: '1099-G Government Payments', es: '1099-G Pagos del Gobierno' } },
  '1099_SSA': { category: 'income', label: { en: 'SSA-1099 Social Security', es: 'SSA-1099 Seguro Social' } },
  '1099_K': { category: 'income', label: { en: '1099-K Payment Card Income', es: '1099-K Ingresos por Tarjeta' } },
  // Deduction documents
  '1098': { category: 'deduction', label: { en: '1098 Mortgage Interest', es: '1098 Intereses Hipotecarios' } },
  '1098_E': { category: 'deduction', label: { en: '1098-E Student Loan Interest', es: '1098-E Intereses de Préstamos Estudiantiles' } },
  '1098_T': { category: 'deduction', label: { en: '1098-T Tuition Statement', es: '1098-T Declaración de Matrícula' } },
  PROPERTY_TAX: { category: 'deduction', label: { en: 'Property Tax Statement', es: 'Declaración de Impuestos sobre la Propiedad' } },
  CHARITY_RECEIPT: { category: 'deduction', label: { en: 'Charitable Donation Receipt', es: 'Recibo de Donación Caritativa' } },
  MEDICAL_RECEIPT: { category: 'deduction', label: { en: 'Medical Expense Receipt', es: 'Recibo de Gastos Médicos' } },
  // Business documents
  K1_1065: { category: 'business', label: { en: 'K-1 (Form 1065) Partnership', es: 'K-1 (Formulario 1065) Sociedad' } },
  K1_1120S: { category: 'business', label: { en: 'K-1 (Form 1120-S) S-Corp', es: 'K-1 (Formulario 1120-S) Corp-S' } },
  K1_1041: { category: 'business', label: { en: 'K-1 (Form 1041) Trust/Estate', es: 'K-1 (Formulario 1041) Fideicomiso' } },
  BUSINESS_EXPENSE: { category: 'business', label: { en: 'Business Expense Receipt', es: 'Recibo de Gasto Comercial' } },
  BUSINESS_INCOME: { category: 'business', label: { en: 'Business Income Statement', es: 'Estado de Ingresos Comerciales' } },
  // Identity documents
  ID_FRONT: { category: 'identity', label: { en: 'ID Card (Front)', es: 'Tarjeta de ID (Frente)' } },
  ID_BACK: { category: 'identity', label: { en: 'ID Card (Back)', es: 'Tarjeta de ID (Reverso)' } },
  SSN_CARD: { category: 'identity', label: { en: 'Social Security Card', es: 'Tarjeta de Seguro Social' } },
  PASSPORT: { category: 'identity', label: { en: 'Passport', es: 'Pasaporte' } },
  // Prior year
  PRIOR_RETURN: { category: 'prior_year', label: { en: 'Prior Year Tax Return', es: 'Declaración del Año Anterior' } },
  // Other
  OTHER: { category: 'other', label: { en: 'Other Document', es: 'Otro Documento' } }
};

// Filing statuses
export const FILING_STATUSES = {
  SINGLE: { value: 'single', label: { en: 'Single', es: 'Soltero/a' } },
  MARRIED_JOINT: { value: 'married_joint', label: { en: 'Married Filing Jointly', es: 'Casado/a Declarando Conjuntamente' } },
  MARRIED_SEPARATE: { value: 'married_separate', label: { en: 'Married Filing Separately', es: 'Casado/a Declarando Por Separado' } },
  HEAD_OF_HOUSEHOLD: { value: 'head_of_household', label: { en: 'Head of Household', es: 'Cabeza de Familia' } },
  QUALIFYING_WIDOW: { value: 'qualifying_widow', label: { en: 'Qualifying Widow(er)', es: 'Viudo/a Calificado/a' } }
};

// Preparer tiers
export const PREPARER_TIERS = {
  JUNIOR: { level: 1, label: { en: 'Junior Preparer', es: 'Preparador Junior' }, maxReturns: 5 },
  STANDARD: { level: 2, label: { en: 'Standard Preparer', es: 'Preparador Estándar' }, maxReturns: 10 },
  SENIOR: { level: 3, label: { en: 'Senior Preparer', es: 'Preparador Senior' }, maxReturns: 15 },
  SPECIALIST: { level: 4, label: { en: 'Tax Specialist', es: 'Especialista en Impuestos' }, maxReturns: 20 },
  REVIEWER: { level: 5, label: { en: 'Review Specialist', es: 'Especialista en Revisión' }, maxReturns: 25 }
};

// Tax roles
export const TAX_ROLES = {
  TAX_CLIENT: 'tax_client',
  TAX_PREPARER: 'tax_preparer',
  TAX_REVIEWER: 'tax_reviewer',
  TAX_ADMIN: 'tax_admin',
  TAX_OWNER: 'tax_owner'
};

// ============================================================================
// ACTION TYPES FOR REDUCER
// ============================================================================

const ACTION_TYPES = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Tax returns
  SET_TAX_RETURNS: 'SET_TAX_RETURNS',
  ADD_TAX_RETURN: 'ADD_TAX_RETURN',
  UPDATE_TAX_RETURN: 'UPDATE_TAX_RETURN',
  DELETE_TAX_RETURN: 'DELETE_TAX_RETURN',
  SET_SELECTED_RETURN: 'SET_SELECTED_RETURN',

  // Preparers
  SET_PREPARERS: 'SET_PREPARERS',
  ADD_PREPARER: 'ADD_PREPARER',
  UPDATE_PREPARER: 'UPDATE_PREPARER',
  DELETE_PREPARER: 'DELETE_PREPARER',

  // Documents
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',

  // Payments
  SET_PAYMENTS: 'SET_PAYMENTS',
  ADD_PAYMENT: 'ADD_PAYMENT',
  UPDATE_PAYMENT: 'UPDATE_PAYMENT',

  // Analytics
  SET_ANALYTICS: 'SET_ANALYTICS',

  // Language
  SET_LANGUAGE: 'SET_LANGUAGE',

  // UI State
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_VIEW_MODE: 'SET_VIEW_MODE',

  // Queue management
  ADD_TO_QUEUE: 'ADD_TO_QUEUE',
  REMOVE_FROM_QUEUE: 'REMOVE_FROM_QUEUE',
  PROCESS_QUEUE: 'PROCESS_QUEUE'
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Loading and error states
  loading: {
    global: false,
    returns: false,
    preparers: false,
    documents: false,
    payments: false,
    analytics: false
  },
  error: null,

  // Tax returns
  taxReturns: [],
  selectedReturn: null,
  returnsPagination: {
    page: 0,
    pageSize: 25,
    total: 0,
    hasMore: true
  },

  // Preparers
  preparers: [],
  currentPreparer: null,

  // Documents
  documents: [],
  documentUploadProgress: {},

  // Payments
  payments: [],
  pendingPayouts: [],

  // Analytics
  analytics: {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalReturns: 0,
    completedReturns: 0,
    pendingReturns: 0,
    averagePrepTime: 0,
    clientSatisfaction: 0,
    preparerPerformance: [],
    revenueByMonth: [],
    returnsByStatus: {},
    returnsByType: {}
  },

  // Language settings
  language: {
    preparer: 'en',
    client: 'en',
    owner: 'en',
    system: 'en'
  },

  // UI state
  filters: {
    status: [],
    type: [],
    preparer: null,
    dateRange: { start: null, end: null },
    searchQuery: '',
    taxYear: new Date().getFullYear()
  },
  sort: {
    field: 'createdAt',
    direction: 'desc'
  },
  viewMode: 'list', // 'list' | 'kanban' | 'calendar'

  // Offline queue
  offlineQueue: [],
  isOnline: navigator.onLine
};

// ============================================================================
// REDUCER
// ============================================================================

function taxReducer(state, action) {
  switch (action.type) {
    // Loading states
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    // Tax returns
    case ACTION_TYPES.SET_TAX_RETURNS:
      return {
        ...state,
        taxReturns: action.payload.returns,
        returnsPagination: {
          ...state.returnsPagination,
          total: action.payload.total || action.payload.returns.length,
          hasMore: action.payload.hasMore !== undefined ? action.payload.hasMore : true
        }
      };

    case ACTION_TYPES.ADD_TAX_RETURN:
      return {
        ...state,
        taxReturns: [action.payload, ...state.taxReturns],
        returnsPagination: {
          ...state.returnsPagination,
          total: state.returnsPagination.total + 1
        }
      };

    case ACTION_TYPES.UPDATE_TAX_RETURN:
      return {
        ...state,
        taxReturns: state.taxReturns.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
        selectedReturn: state.selectedReturn?.id === action.payload.id
          ? { ...state.selectedReturn, ...action.payload }
          : state.selectedReturn
      };

    case ACTION_TYPES.DELETE_TAX_RETURN:
      return {
        ...state,
        taxReturns: state.taxReturns.filter(r => r.id !== action.payload),
        selectedReturn: state.selectedReturn?.id === action.payload ? null : state.selectedReturn,
        returnsPagination: {
          ...state.returnsPagination,
          total: state.returnsPagination.total - 1
        }
      };

    case ACTION_TYPES.SET_SELECTED_RETURN:
      return {
        ...state,
        selectedReturn: action.payload
      };

    // Preparers
    case ACTION_TYPES.SET_PREPARERS:
      return {
        ...state,
        preparers: action.payload
      };

    case ACTION_TYPES.ADD_PREPARER:
      return {
        ...state,
        preparers: [...state.preparers, action.payload]
      };

    case ACTION_TYPES.UPDATE_PREPARER:
      return {
        ...state,
        preparers: state.preparers.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };

    case ACTION_TYPES.DELETE_PREPARER:
      return {
        ...state,
        preparers: state.preparers.filter(p => p.id !== action.payload)
      };

    // Documents
    case ACTION_TYPES.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.payload
      };

    case ACTION_TYPES.ADD_DOCUMENT:
      return {
        ...state,
        documents: [...state.documents, action.payload]
      };

    case ACTION_TYPES.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload } : d
        )
      };

    case ACTION_TYPES.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(d => d.id !== action.payload)
      };

    // Payments
    case ACTION_TYPES.SET_PAYMENTS:
      return {
        ...state,
        payments: action.payload
      };

    case ACTION_TYPES.ADD_PAYMENT:
      return {
        ...state,
        payments: [...state.payments, action.payload]
      };

    case ACTION_TYPES.UPDATE_PAYMENT:
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };

    // Analytics
    case ACTION_TYPES.SET_ANALYTICS:
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        }
      };

    // Language
    case ACTION_TYPES.SET_LANGUAGE:
      return {
        ...state,
        language: {
          ...state.language,
          [action.payload.role]: action.payload.language
        }
      };

    // UI State
    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case ACTION_TYPES.SET_SORT:
      return {
        ...state,
        sort: action.payload
      };

    case ACTION_TYPES.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };

    // Queue management
    case ACTION_TYPES.ADD_TO_QUEUE:
      return {
        ...state,
        offlineQueue: [...state.offlineQueue, action.payload]
      };

    case ACTION_TYPES.REMOVE_FROM_QUEUE:
      return {
        ...state,
        offlineQueue: state.offlineQueue.filter(item => item.id !== action.payload)
      };

    case ACTION_TYPES.PROCESS_QUEUE:
      return {
        ...state,
        offlineQueue: []
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const TaxContext = createContext(null);

export const useTax = () => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};

// ============================================================================
// TAX PROVIDER COMPONENT
// ============================================================================

export const TaxProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [state, dispatch] = useReducer(taxReducer, initialState);

  // Refs for cleanup
  const unsubscribeRefs = useRef({});
  const processingQueueRef = useRef(false);

  // ============================================================================
  // LANGUAGE MANAGEMENT
  // ============================================================================

  const setLanguage = useCallback((role, languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      dispatch({
        type: ACTION_TYPES.SET_LANGUAGE,
        payload: { role, language: languageCode }
      });

      // Persist to localStorage
      const savedLanguages = JSON.parse(localStorage.getItem('taxLanguages') || '{}');
      savedLanguages[role] = languageCode;
      localStorage.setItem('taxLanguages', JSON.stringify(savedLanguages));
    }
  }, []);

  const getLocalizedText = useCallback((textObject, role = 'system') => {
    if (!textObject) return '';
    if (typeof textObject === 'string') return textObject;

    const lang = state.language[role] || state.language.system || 'en';
    return textObject[lang] || textObject.en || Object.values(textObject)[0] || '';
  }, [state.language]);

  const t = useMemo(() => ({
    preparer: (text) => getLocalizedText(text, 'preparer'),
    client: (text) => getLocalizedText(text, 'client'),
    owner: (text) => getLocalizedText(text, 'owner'),
    system: (text) => getLocalizedText(text, 'system')
  }), [getLocalizedText]);

  // Load saved languages on mount
  useEffect(() => {
    const savedLanguages = JSON.parse(localStorage.getItem('taxLanguages') || '{}');
    Object.entries(savedLanguages).forEach(([role, lang]) => {
      dispatch({
        type: ACTION_TYPES.SET_LANGUAGE,
        payload: { role, language: lang }
      });
    });
  }, []);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const setError = useCallback((error) => {
    console.error('Tax Context Error:', error);
    dispatch({
      type: ACTION_TYPES.SET_ERROR,
      payload: typeof error === 'string' ? error : error.message || 'An error occurred'
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  // ============================================================================
  // TAX RETURN CRUD OPERATIONS
  // ============================================================================

  // Fetch tax returns with filters and pagination
  const fetchTaxReturns = useCallback(async (options = {}) => {
    if (!currentUser) return;

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'returns', value: true } });

    try {
      const {
        status = state.filters.status,
        type = state.filters.type,
        preparerId = state.filters.preparer,
        taxYear = state.filters.taxYear,
        searchQuery = state.filters.searchQuery,
        pageSize = state.returnsPagination.pageSize,
        startAfterDoc = null
      } = options;

      let q = query(collection(db, 'taxReturns'));

      // Apply filters
      if (status && status.length > 0) {
        q = query(q, where('status', 'in', status));
      }

      if (type && type.length > 0) {
        q = query(q, where('returnType', 'in', type));
      }

      if (preparerId) {
        q = query(q, where('preparerId', '==', preparerId));
      }

      if (taxYear) {
        q = query(q, where('taxYear', '==', taxYear));
      }

      // Apply sorting
      q = query(q, orderBy(state.sort.field, state.sort.direction));

      // Apply pagination
      q = query(q, limit(pageSize));

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(q);
      const returns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));

      // Apply client-side search filter if needed
      let filteredReturns = returns;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredReturns = returns.filter(r =>
          r.clientName?.toLowerCase().includes(query) ||
          r.clientEmail?.toLowerCase().includes(query) ||
          r.id.toLowerCase().includes(query)
        );
      }

      dispatch({
        type: ACTION_TYPES.SET_TAX_RETURNS,
        payload: {
          returns: startAfterDoc ? [...state.taxReturns, ...filteredReturns] : filteredReturns,
          hasMore: snapshot.docs.length === pageSize
        }
      });

      return filteredReturns;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'returns', value: false } });
    }
  }, [currentUser, state.filters, state.sort, state.returnsPagination.pageSize, state.taxReturns, setError]);

  // Create new tax return
  const createTaxReturn = useCallback(async (returnData) => {
    if (!currentUser) throw new Error('Not authenticated');

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'returns', value: true } });

    try {
      // Calculate fees based on return type
      const feeConfig = FEE_STRUCTURE[returnData.subType] || FEE_STRUCTURE[RETURN_SUBTYPES.SIMPLE_1040];

      const newReturn = {
        // Client info
        clientId: returnData.clientId,
        clientName: returnData.clientName,
        clientEmail: returnData.clientEmail,

        // Return info
        taxYear: returnData.taxYear || new Date().getFullYear() - 1,
        returnType: returnData.returnType || RETURN_TYPES.PERSONAL,
        subType: returnData.subType || RETURN_SUBTYPES.SIMPLE_1040,
        filingStatus: returnData.filingStatus || FILING_STATUSES.SINGLE.value,

        // Status
        status: TAX_RETURN_STATUSES.INTAKE,
        statusHistory: [{
          status: TAX_RETURN_STATUSES.INTAKE,
          changedAt: serverTimestamp(),
          changedBy: currentUser.uid,
          notes: 'Return created'
        }],

        // Assignment
        preparerId: null,
        reviewerId: null,
        createdBy: currentUser.uid,

        // Dependents
        dependents: returnData.dependents || [],

        // Income summary
        incomeSummary: {
          wages: 0,
          selfEmployment: 0,
          investments: 0,
          rentalIncome: 0,
          retirement: 0,
          socialSecurity: 0,
          unemployment: 0,
          gambling: 0,
          other: 0,
          totalIncome: 0
        },

        // Deduction summary
        deductionSummary: {
          method: 'standard',
          standardAmount: 0,
          itemizedTotal: 0,
          medical: 0,
          stateLocalTaxes: 0,
          mortgageInterest: 0,
          charitableCash: 0,
          charitableNonCash: 0,
          casualtyLoss: 0,
          other: 0
        },

        // Results
        results: {
          agi: 0,
          taxableIncome: 0,
          totalTax: 0,
          totalCredits: 0,
          totalPayments: 0,
          refundAmount: 0,
          balanceDue: 0,
          effectiveRate: 0
        },

        // State returns
        stateReturns: returnData.states?.map(state => ({
          state,
          status: 'not_started',
          refundAmount: 0,
          balanceDue: 0
        })) || [],

        // Fees
        fees: {
          baseService: feeConfig.fee,
          scheduleC: 0,
          rentalProperties: 0,
          stateReturns: (returnData.states?.length || 0) * ADDON_SERVICES.STATE_RETURN.fee,
          amendments: 0,
          addOns: [],
          discounts: [],
          totalFee: feeConfig.fee + ((returnData.states?.length || 0) * ADDON_SERVICES.STATE_RETURN.fee),
          paid: 0,
          balance: feeConfig.fee + ((returnData.states?.length || 0) * ADDON_SERVICES.STATE_RETURN.fee),
          preparerPayout: feeConfig.preparerPayout,
          platformRevenue: feeConfig.platformRevenue
        },

        // Documents
        documentIds: [],

        // Questionnaire
        questionnaireCompleted: false,
        questionnaireData: {},

        // Preparer work area
        preparerNotes: [],
        preparerQuestions: [],

        // Review
        reviewNotes: [],

        // E-file
        efileData: {
          federalSubmissionId: null,
          federalStatus: 'pending',
          federalAcceptedAt: null,
          federalRejectionCode: null,
          federalRejectionMessage: null,
          stateSubmissions: []
        },

        // Signatures
        signatures: {
          form8879: { signed: false, signedAt: null, ipAddress: null, signatureImage: null },
          stateAuths: [],
          engagementLetter: { signed: false, signedAt: null }
        },

        // Timeline
        timeline: {
          createdAt: serverTimestamp(),
          questionnaireCompletedAt: null,
          documentsCompletedAt: null,
          assignedAt: null,
          preparationStartedAt: null,
          preparationCompletedAt: null,
          reviewStartedAt: null,
          reviewCompletedAt: null,
          clientReviewStartedAt: null,
          clientApprovedAt: null,
          signedAt: null,
          filedAt: null,
          acceptedAt: null,
          completedAt: null,
          dueDate: new Date(returnData.taxYear + 1, 3, 15), // April 15
          extensionFiled: false,
          extensionDate: null
        },

        // AI Analysis
        aiAnalysis: {
          complexityScore: 0,
          complexityFactors: [],
          estimatedPrepTime: 0,
          riskScore: 0,
          riskFactors: [],
          suggestedDeductions: [],
          anomalies: [],
          upsellOpportunities: []
        },

        // Metadata
        source: returnData.source || 'website',
        referralCode: returnData.referralCode || null,
        tags: returnData.tags || [],
        archived: false,
        archivedAt: null,
        archivedBy: null,

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'taxReturns'), newReturn);

      const createdReturn = {
        id: docRef.id,
        ...newReturn,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({
        type: ACTION_TYPES.ADD_TAX_RETURN,
        payload: createdReturn
      });

      return createdReturn;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'returns', value: false } });
    }
  }, [currentUser, setError]);

  // Update tax return
  const updateTaxReturn = useCallback(async (returnId, updates) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const returnRef = doc(db, 'taxReturns', returnId);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // If status is being updated, add to history
      if (updates.status) {
        const currentReturn = state.taxReturns.find(r => r.id === returnId);
        if (currentReturn && currentReturn.status !== updates.status) {
          updateData.statusHistory = arrayUnion({
            status: updates.status,
            changedAt: Timestamp.now(),
            changedBy: currentUser.uid,
            notes: updates.statusNote || `Status changed to ${updates.status}`
          });
        }
      }

      await updateDoc(returnRef, updateData);

      dispatch({
        type: ACTION_TYPES.UPDATE_TAX_RETURN,
        payload: { id: returnId, ...updates, updatedAt: new Date() }
      });

      return { id: returnId, ...updates };
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, state.taxReturns, setError]);

  // Delete tax return
  const deleteTaxReturn = useCallback(async (returnId) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      // Check user permissions
      const userRole = userProfile?.role;
      if (!['admin', 'masterAdmin', 'tax_admin', 'tax_owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to delete tax return');
      }

      await deleteDoc(doc(db, 'taxReturns', returnId));

      dispatch({
        type: ACTION_TYPES.DELETE_TAX_RETURN,
        payload: returnId
      });

      return true;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, userProfile, setError]);

  // Get single tax return
  const getTaxReturn = useCallback(async (returnId) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const returnRef = doc(db, 'taxReturns', returnId);
      const returnSnap = await getDoc(returnRef);

      if (!returnSnap.exists()) {
        throw new Error('Tax return not found');
      }

      const returnData = {
        id: returnSnap.id,
        ...returnSnap.data(),
        createdAt: returnSnap.data().createdAt?.toDate?.() || returnSnap.data().createdAt,
        updatedAt: returnSnap.data().updatedAt?.toDate?.() || returnSnap.data().updatedAt
      };

      dispatch({
        type: ACTION_TYPES.SET_SELECTED_RETURN,
        payload: returnData
      });

      return returnData;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // Update tax return status
  const updateReturnStatus = useCallback(async (returnId, newStatus, note = '') => {
    return updateTaxReturn(returnId, {
      status: newStatus,
      statusNote: note,
      [`timeline.${getTimelineFieldForStatus(newStatus)}`]: serverTimestamp()
    });
  }, [updateTaxReturn]);

  // Assign preparer to return
  const assignPreparer = useCallback(async (returnId, preparerId) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const batch = writeBatch(db);

      // Update return
      const returnRef = doc(db, 'taxReturns', returnId);
      batch.update(returnRef, {
        preparerId,
        status: TAX_RETURN_STATUSES.IN_PREPARATION,
        'timeline.assignedAt': serverTimestamp(),
        'timeline.preparationStartedAt': serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: TAX_RETURN_STATUSES.IN_PREPARATION,
          changedAt: Timestamp.now(),
          changedBy: currentUser.uid,
          notes: `Assigned to preparer ${preparerId}`
        })
      });

      // Update preparer metrics
      const preparerRef = doc(db, 'taxPreparers', preparerId);
      batch.update(preparerRef, {
        'metrics.currentAssignedCount': increment(1),
        'availability.currentWeeklyHours': increment(2), // Estimate 2 hours per return
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      dispatch({
        type: ACTION_TYPES.UPDATE_TAX_RETURN,
        payload: {
          id: returnId,
          preparerId,
          status: TAX_RETURN_STATUSES.IN_PREPARATION,
          updatedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================

  // Upload document
  const uploadDocument = useCallback(async (returnId, file, documentType, metadata = {}) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `tax-documents/${returnId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Track progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          dispatch({
            type: ACTION_TYPES.UPDATE_DOCUMENT,
            payload: {
              id: `temp_${timestamp}`,
              uploadProgress: progress
            }
          });
        },
        (error) => {
          setError(error);
        }
      );

      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Create document record
      const documentData = {
        returnId,
        clientId: metadata.clientId,
        uploadedBy: currentUser.uid,
        documentType: documentType || DOCUMENT_TYPES.OTHER,
        documentCategory: DOCUMENT_TYPES[documentType]?.category || 'other',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath,
        downloadUrl,
        ocrStatus: 'pending',
        ocrData: {
          rawText: '',
          confidence: 0,
          extractedFields: {},
          processedAt: null
        },
        verificationStatus: 'unverified',
        verifiedBy: null,
        verifiedAt: null,
        verificationNotes: '',
        aiAnalysis: {
          documentQuality: 'pending',
          qualityIssues: [],
          suggestedCategory: null,
          suggestedType: null,
          confidenceScore: 0,
          potentialIssues: [],
          duplicateOf: null
        },
        viewLog: [],
        watermarkId: `WM_${timestamp}_${currentUser.uid.slice(0, 8)}`,
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        description: metadata.description || '',
        notes: metadata.notes || '',
        year: metadata.year || new Date().getFullYear() - 1,
        archived: false
      };

      const docRef = await addDoc(collection(db, 'taxDocuments'), documentData);

      // Update return with document reference
      await updateDoc(doc(db, 'taxReturns', returnId), {
        documentIds: arrayUnion(docRef.id),
        updatedAt: serverTimestamp()
      });

      const createdDoc = {
        id: docRef.id,
        ...documentData,
        uploadedAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({
        type: ACTION_TYPES.ADD_DOCUMENT,
        payload: createdDoc
      });

      // Trigger OCR processing
      try {
        const processOCR = httpsCallable(functions, 'processDocumentOCR');
        processOCR({ documentId: docRef.id });
      } catch (ocrError) {
        console.warn('OCR processing trigger failed:', ocrError);
      }

      return createdDoc;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // Fetch documents for a return
  const fetchDocuments = useCallback(async (returnId) => {
    if (!currentUser) return [];

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'documents', value: true } });

    try {
      const q = query(
        collection(db, 'taxDocuments'),
        where('returnId', '==', returnId),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || doc.data().uploadedAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));

      dispatch({
        type: ACTION_TYPES.SET_DOCUMENTS,
        payload: documents
      });

      return documents;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'documents', value: false } });
    }
  }, [currentUser, setError]);

  // Delete document
  const deleteDocument = useCallback(async (documentId, returnId) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const docRef = doc(db, 'taxDocuments', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const docData = docSnap.data();

      // Delete from storage
      if (docData.storagePath) {
        try {
          await deleteObject(ref(storage, docData.storagePath));
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }

      // Delete document record
      await deleteDoc(docRef);

      // Remove from return
      if (returnId) {
        await updateDoc(doc(db, 'taxReturns', returnId), {
          documentIds: arrayRemove(documentId),
          updatedAt: serverTimestamp()
        });
      }

      dispatch({
        type: ACTION_TYPES.DELETE_DOCUMENT,
        payload: documentId
      });

      return true;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // Log document view
  const logDocumentView = useCallback(async (documentId, duration = 0) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'taxDocuments', documentId), {
        viewLog: arrayUnion({
          viewedBy: currentUser.uid,
          viewedAt: Timestamp.now(),
          ipAddress: 'client-side',
          duration
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Failed to log document view:', error);
    }
  }, [currentUser]);

  // ============================================================================
  // PREPARER OPERATIONS
  // ============================================================================

  // Fetch all preparers
  const fetchPreparers = useCallback(async () => {
    if (!currentUser) return [];

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'preparers', value: true } });

    try {
      const q = query(
        collection(db, 'taxPreparers'),
        where('status', '==', 'active'),
        orderBy('lastName', 'asc')
      );

      const snapshot = await getDocs(q);
      const preparers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));

      dispatch({
        type: ACTION_TYPES.SET_PREPARERS,
        payload: preparers
      });

      return preparers;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'preparers', value: false } });
    }
  }, [currentUser, setError]);

  // Create preparer
  const createPreparer = useCallback(async (preparerData) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const newPreparer = {
        userId: preparerData.userId,
        firstName: preparerData.firstName,
        lastName: preparerData.lastName,
        email: preparerData.email,
        phone: preparerData.phone || '',
        timezone: preparerData.timezone || 'America/New_York',
        profilePhoto: preparerData.profilePhoto || '',

        credentials: {
          type: preparerData.credentialType || 'ptin_only',
          ptinNumber: preparerData.ptinNumber || '',
          ptinExpiration: preparerData.ptinExpiration || null,
          eaNumber: preparerData.eaNumber || '',
          eaState: preparerData.eaState || '',
          cpaLicense: preparerData.cpaLicense || '',
          cpaState: preparerData.cpaState || '',
          barNumber: preparerData.barNumber || '',
          barState: preparerData.barState || '',
          verifiedAt: null,
          verifiedBy: null
        },

        tier: preparerData.tier || 'junior',
        specializations: preparerData.specializations || ['personal'],
        canPrepare: preparerData.canPrepare || [RETURN_SUBTYPES.SIMPLE_1040, RETURN_SUBTYPES.MODERATE_1040],
        requiresReview: preparerData.tier === 'junior',
        canReview: ['senior', 'specialist', 'reviewer'].includes(preparerData.tier),
        maxSimultaneousReturns: PREPARER_TIERS[preparerData.tier?.toUpperCase()]?.maxReturns || 5,

        availability: {
          status: 'available',
          maxWeeklyHours: preparerData.maxWeeklyHours || 40,
          currentWeeklyHours: 0,
          vacationStart: null,
          vacationEnd: null,
          preferredReturnTypes: preparerData.preferredReturnTypes || []
        },

        metrics: {
          totalReturnsCompleted: 0,
          returnsThisSeason: 0,
          averagePrepTime: 0,
          accuracyRate: 100,
          clientSatisfactionScore: 5,
          reviewPassRate: 100,
          onTimeRate: 100,
          currentAssignedCount: 0
        },

        ratings: [],
        averageRating: 5,

        commission: {
          rate: preparerData.commissionRate || 50,
          type: 'percentage',
          tiers: []
        },

        payoutMethod: preparerData.payoutMethod || 'direct_deposit',
        payoutDetails: {},
        payouts: [],
        totalEarnings: 0,
        pendingPayout: 0,

        agreements: {
          nonCompete: { signed: false, signedAt: null, expiresAt: null },
          nonSolicitation: { signed: false, signedAt: null },
          dataProtection: { signed: false, signedAt: null },
          backgroundCheck: { completed: false, completedAt: null, result: 'pending' }
        },

        activityLog: [{
          action: 'account_created',
          details: { createdBy: currentUser.uid },
          timestamp: Timestamp.now()
        }],

        status: 'active',
        suspensionReason: null,
        terminationReason: null,
        notes: [],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        lastLoginAt: null
      };

      const docRef = await addDoc(collection(db, 'taxPreparers'), newPreparer);

      const createdPreparer = {
        id: docRef.id,
        ...newPreparer,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({
        type: ACTION_TYPES.ADD_PREPARER,
        payload: createdPreparer
      });

      return createdPreparer;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // Update preparer
  const updatePreparer = useCallback(async (preparerId, updates) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      await updateDoc(doc(db, 'taxPreparers', preparerId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      dispatch({
        type: ACTION_TYPES.UPDATE_PREPARER,
        payload: { id: preparerId, ...updates, updatedAt: new Date() }
      });

      return { id: preparerId, ...updates };
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, setError]);

  // Get preparer performance
  const getPreparerPerformance = useCallback(async (preparerId) => {
    if (!currentUser) return null;

    try {
      const preparerRef = doc(db, 'taxPreparers', preparerId);
      const preparerSnap = await getDoc(preparerRef);

      if (!preparerSnap.exists()) return null;

      const preparerData = preparerSnap.data();

      // Get completed returns count
      const returnsQuery = query(
        collection(db, 'taxReturns'),
        where('preparerId', '==', preparerId),
        where('status', '==', TAX_RETURN_STATUSES.COMPLETED)
      );
      const returnsSnap = await getDocs(returnsQuery);

      return {
        ...preparerData.metrics,
        completedReturns: returnsSnap.size,
        preparer: {
          id: preparerSnap.id,
          name: `${preparerData.firstName} ${preparerData.lastName}`,
          tier: preparerData.tier
        }
      };
    } catch (error) {
      console.error('Failed to get preparer performance:', error);
      return null;
    }
  }, [currentUser]);

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  // Create payment
  const createPayment = useCallback(async (paymentData) => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const taxReturn = state.taxReturns.find(r => r.id === paymentData.returnId);
      const preparer = taxReturn?.preparerId
        ? state.preparers.find(p => p.id === taxReturn.preparerId)
        : null;

      const newPayment = {
        returnId: paymentData.returnId,
        clientId: paymentData.clientId,
        amount: paymentData.amount,
        type: paymentData.type || 'final_payment',
        method: paymentData.method || 'credit_card',
        status: 'pending',
        processorTransactionId: null,
        processorResponse: null,
        processedAt: null,
        platformAmount: paymentData.platformAmount || paymentData.amount * 0.5,
        preparerAmount: paymentData.preparerAmount || paymentData.amount * 0.5,
        processingFee: paymentData.processingFee || paymentData.amount * 0.029 + 0.30,
        preparerPayoutId: null,
        preparerPayoutStatus: 'pending',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        notes: paymentData.notes || '',
        receiptUrl: null,
        invoiceId: paymentData.invoiceId || null
      };

      const docRef = await addDoc(collection(db, 'taxPayments'), newPayment);

      // Update return fees
      if (paymentData.returnId) {
        const returnRef = doc(db, 'taxReturns', paymentData.returnId);
        await updateDoc(returnRef, {
          'fees.paid': increment(paymentData.amount),
          'fees.balance': increment(-paymentData.amount),
          updatedAt: serverTimestamp()
        });
      }

      const createdPayment = {
        id: docRef.id,
        ...newPayment,
        createdAt: new Date()
      };

      dispatch({
        type: ACTION_TYPES.ADD_PAYMENT,
        payload: createdPayment
      });

      return createdPayment;
    } catch (error) {
      setError(error);
      throw error;
    }
  }, [currentUser, state.taxReturns, state.preparers, setError]);

  // Fetch payments
  const fetchPayments = useCallback(async (returnId = null) => {
    if (!currentUser) return [];

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'payments', value: true } });

    try {
      let q = query(
        collection(db, 'taxPayments'),
        orderBy('createdAt', 'desc')
      );

      if (returnId) {
        q = query(q, where('returnId', '==', returnId));
      }

      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));

      dispatch({
        type: ACTION_TYPES.SET_PAYMENTS,
        payload: payments
      });

      return payments;
    } catch (error) {
      setError(error);
      return [];
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'payments', value: false } });
    }
  }, [currentUser, setError]);

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  const fetchAnalytics = useCallback(async (options = {}) => {
    if (!currentUser) return null;

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'analytics', value: true } });

    try {
      const { startDate, endDate, taxYear } = options;

      // Fetch all returns for analytics
      let returnsQuery = query(collection(db, 'taxReturns'));

      if (taxYear) {
        returnsQuery = query(returnsQuery, where('taxYear', '==', taxYear));
      }

      const returnsSnap = await getDocs(returnsQuery);
      const returns = returnsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all payments
      const paymentsSnap = await getDocs(collection(db, 'taxPayments'));
      const payments = paymentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics
      const completedReturns = returns.filter(r => r.status === TAX_RETURN_STATUSES.COMPLETED);
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.platformAmount || 0), 0);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyPayments = payments.filter(p => {
        const paymentDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
        return paymentDate >= monthStart && p.status === 'completed';
      });
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.platformAmount || 0), 0);

      // Returns by status
      const returnsByStatus = {};
      Object.values(TAX_RETURN_STATUSES).forEach(status => {
        returnsByStatus[status] = returns.filter(r => r.status === status).length;
      });

      // Returns by type
      const returnsByType = {};
      Object.values(RETURN_SUBTYPES).forEach(type => {
        returnsByType[type] = returns.filter(r => r.subType === type).length;
      });

      // Revenue by month (last 12 months)
      const revenueByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthPayments = payments.filter(p => {
          const paymentDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
          return paymentDate >= monthDate && paymentDate <= monthEnd && p.status === 'completed';
        });

        revenueByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: monthPayments.reduce((sum, p) => sum + (p.platformAmount || 0), 0),
          returns: monthPayments.length
        });
      }

      // Preparer performance
      const preparerPerformance = state.preparers.map(preparer => {
        const preparerReturns = returns.filter(r => r.preparerId === preparer.id);
        const completedByPreparer = preparerReturns.filter(r => r.status === TAX_RETURN_STATUSES.COMPLETED);

        return {
          id: preparer.id,
          name: `${preparer.firstName} ${preparer.lastName}`,
          tier: preparer.tier,
          totalReturns: preparerReturns.length,
          completedReturns: completedByPreparer.length,
          averageRating: preparer.averageRating || 5,
          ...preparer.metrics
        };
      });

      const analytics = {
        totalRevenue,
        monthlyRevenue,
        totalReturns: returns.length,
        completedReturns: completedReturns.length,
        pendingReturns: returns.filter(r =>
          ![TAX_RETURN_STATUSES.COMPLETED, TAX_RETURN_STATUSES.CANCELLED].includes(r.status)
        ).length,
        averagePrepTime: completedReturns.length > 0
          ? completedReturns.reduce((sum, r) => sum + (r.aiAnalysis?.estimatedPrepTime || 60), 0) / completedReturns.length
          : 0,
        clientSatisfaction: 4.8, // Calculate from ratings
        preparerPerformance,
        revenueByMonth,
        returnsByStatus,
        returnsByType
      };

      dispatch({
        type: ACTION_TYPES.SET_ANALYTICS,
        payload: analytics
      });

      return analytics;
    } catch (error) {
      setError(error);
      return null;
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: 'analytics', value: false } });
    }
  }, [currentUser, state.preparers, setError]);

  // ============================================================================
  // FEE CALCULATION
  // ============================================================================

  const calculateFees = useCallback((returnData) => {
    const baseFee = FEE_STRUCTURE[returnData.subType] || FEE_STRUCTURE[RETURN_SUBTYPES.SIMPLE_1040];

    let totalFee = baseFee.fee;
    let preparerPayout = baseFee.preparerPayout;
    let platformRevenue = baseFee.platformRevenue;

    const addOns = [];

    // Schedule C add-on
    if (returnData.hasScheduleC) {
      totalFee += ADDON_SERVICES.SCHEDULE_C.fee;
      preparerPayout += ADDON_SERVICES.SCHEDULE_C.preparerPayout;
      addOns.push({
        type: 'SCHEDULE_C',
        ...ADDON_SERVICES.SCHEDULE_C
      });
    }

    // Rental properties
    if (returnData.rentalProperties && returnData.rentalProperties > 0) {
      const rentalFee = ADDON_SERVICES.RENTAL_PROPERTY.fee * returnData.rentalProperties;
      const rentalPayout = ADDON_SERVICES.RENTAL_PROPERTY.preparerPayout * returnData.rentalProperties;
      totalFee += rentalFee;
      preparerPayout += rentalPayout;
      addOns.push({
        type: 'RENTAL_PROPERTY',
        count: returnData.rentalProperties,
        fee: rentalFee,
        preparerPayout: rentalPayout
      });
    }

    // State returns
    if (returnData.states && returnData.states.length > 0) {
      const stateFee = ADDON_SERVICES.STATE_RETURN.fee * returnData.states.length;
      const statePayout = ADDON_SERVICES.STATE_RETURN.preparerPayout * returnData.states.length;
      totalFee += stateFee;
      preparerPayout += statePayout;
      addOns.push({
        type: 'STATE_RETURN',
        states: returnData.states,
        fee: stateFee,
        preparerPayout: statePayout
      });
    }

    // Rush processing
    if (returnData.rushProcessing) {
      totalFee += ADDON_SERVICES.RUSH_PROCESSING.fee;
      preparerPayout += ADDON_SERVICES.RUSH_PROCESSING.preparerPayout;
      addOns.push({
        type: 'RUSH_PROCESSING',
        ...ADDON_SERVICES.RUSH_PROCESSING
      });
    }

    // Audit protection
    if (returnData.auditProtection) {
      totalFee += ADDON_SERVICES.AUDIT_PROTECTION.fee;
      addOns.push({
        type: 'AUDIT_PROTECTION',
        ...ADDON_SERVICES.AUDIT_PROTECTION
      });
    }

    // Apply discounts
    const discounts = [];
    let discountAmount = 0;

    if (returnData.discountCode) {
      // Implement discount logic
      // For now, standard 10% discount for returning clients
      if (returnData.isReturningClient) {
        discountAmount = totalFee * 0.10;
        discounts.push({
          code: 'RETURNING_CLIENT',
          description: 'Returning Client Discount',
          amount: -discountAmount
        });
      }
    }

    platformRevenue = totalFee - preparerPayout - discountAmount;

    return {
      baseService: baseFee.fee,
      addOns,
      discounts,
      totalFee,
      discountAmount,
      finalFee: totalFee - discountAmount,
      preparerPayout,
      platformRevenue,
      breakdown: {
        base: baseFee.fee,
        scheduleC: returnData.hasScheduleC ? ADDON_SERVICES.SCHEDULE_C.fee : 0,
        rentalProperties: (returnData.rentalProperties || 0) * ADDON_SERVICES.RENTAL_PROPERTY.fee,
        stateReturns: (returnData.states?.length || 0) * ADDON_SERVICES.STATE_RETURN.fee,
        rushProcessing: returnData.rushProcessing ? ADDON_SERVICES.RUSH_PROCESSING.fee : 0,
        auditProtection: returnData.auditProtection ? ADDON_SERVICES.AUDIT_PROTECTION.fee : 0,
        discounts: -discountAmount
      }
    };
  }, []);

  // ============================================================================
  // FILTER AND SORT MANAGEMENT
  // ============================================================================

  const setFilters = useCallback((newFilters) => {
    dispatch({
      type: ACTION_TYPES.SET_FILTERS,
      payload: newFilters
    });
  }, []);

  const setSort = useCallback((sortConfig) => {
    dispatch({
      type: ACTION_TYPES.SET_SORT,
      payload: sortConfig
    });
  }, []);

  const setViewMode = useCallback((mode) => {
    dispatch({
      type: ACTION_TYPES.SET_VIEW_MODE,
      payload: mode
    });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.SET_FILTERS,
      payload: initialState.filters
    });
  }, []);

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to tax returns
    const returnsQuery = query(
      collection(db, 'taxReturns'),
      orderBy('updatedAt', 'desc'),
      limit(100)
    );

    const unsubscribeReturns = onSnapshot(returnsQuery, (snapshot) => {
      const returns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));

      dispatch({
        type: ACTION_TYPES.SET_TAX_RETURNS,
        payload: { returns, total: returns.length }
      });
    }, (error) => {
      console.error('Tax returns subscription error:', error);
    });

    unsubscribeRefs.current.returns = unsubscribeReturns;

    // Subscribe to preparers
    const preparersQuery = query(
      collection(db, 'taxPreparers'),
      where('status', '==', 'active')
    );

    const unsubscribePreparers = onSnapshot(preparersQuery, (snapshot) => {
      const preparers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      dispatch({
        type: ACTION_TYPES.SET_PREPARERS,
        payload: preparers
      });
    }, (error) => {
      console.error('Preparers subscription error:', error);
    });

    unsubscribeRefs.current.preparers = unsubscribePreparers;

    return () => {
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [currentUser]);

  // ============================================================================
  // OFFLINE QUEUE MANAGEMENT
  // ============================================================================

  useEffect(() => {
    const handleOnline = async () => {
      if (processingQueueRef.current) return;
      processingQueueRef.current = true;

      for (const item of state.offlineQueue) {
        try {
          switch (item.type) {
            case 'CREATE_RETURN':
              await createTaxReturn(item.data);
              break;
            case 'UPDATE_RETURN':
              await updateTaxReturn(item.data.id, item.data.updates);
              break;
            case 'UPLOAD_DOCUMENT':
              await uploadDocument(item.data.returnId, item.data.file, item.data.documentType);
              break;
            default:
              console.warn('Unknown queue item type:', item.type);
          }

          dispatch({
            type: ACTION_TYPES.REMOVE_FROM_QUEUE,
            payload: item.id
          });
        } catch (error) {
          console.error('Failed to process queue item:', error);
        }
      }

      processingQueueRef.current = false;
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [state.offlineQueue, createTaxReturn, updateTaxReturn, uploadDocument]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getStatusLabel = useCallback((status, lang = state.language.system) => {
    const config = STATUS_CONFIG[status];
    if (!config) return status;
    return config.label[lang] || config.label.en || status;
  }, [state.language.system]);

  const getStatusColor = useCallback((status) => {
    return STATUS_CONFIG[status]?.color || 'default';
  }, []);

  const getReturnTypeLabel = useCallback((subType, lang = state.language.system) => {
    const config = FEE_STRUCTURE[subType];
    if (!config) return subType;
    return config.label[lang] || config.label.en || subType;
  }, [state.language.system]);

  const getDocumentTypeLabel = useCallback((docType, lang = state.language.system) => {
    const config = DOCUMENT_TYPES[docType];
    if (!config) return docType;
    return config.label[lang] || config.label.en || docType;
  }, [state.language.system]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo(() => ({
    // State
    ...state,

    // Language
    setLanguage,
    getLocalizedText,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,

    // Error handling
    setError,
    clearError,

    // Tax returns
    fetchTaxReturns,
    createTaxReturn,
    updateTaxReturn,
    deleteTaxReturn,
    getTaxReturn,
    updateReturnStatus,
    assignPreparer,

    // Documents
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    logDocumentView,

    // Preparers
    fetchPreparers,
    createPreparer,
    updatePreparer,
    getPreparerPerformance,

    // Payments
    createPayment,
    fetchPayments,

    // Analytics
    fetchAnalytics,

    // Fee calculation
    calculateFees,

    // Filters and sorting
    setFilters,
    setSort,
    setViewMode,
    clearFilters,

    // Helpers
    getStatusLabel,
    getStatusColor,
    getReturnTypeLabel,
    getDocumentTypeLabel,

    // Constants
    TAX_RETURN_STATUSES,
    STATUS_CONFIG,
    RETURN_TYPES,
    RETURN_SUBTYPES,
    FEE_STRUCTURE,
    ADDON_SERVICES,
    UPSELL_SERVICES,
    DOCUMENT_TYPES,
    FILING_STATUSES,
    PREPARER_TIERS,
    TAX_ROLES
  }), [
    state,
    setLanguage,
    getLocalizedText,
    t,
    setError,
    clearError,
    fetchTaxReturns,
    createTaxReturn,
    updateTaxReturn,
    deleteTaxReturn,
    getTaxReturn,
    updateReturnStatus,
    assignPreparer,
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    logDocumentView,
    fetchPreparers,
    createPreparer,
    updatePreparer,
    getPreparerPerformance,
    createPayment,
    fetchPayments,
    fetchAnalytics,
    calculateFees,
    setFilters,
    setSort,
    setViewMode,
    clearFilters,
    getStatusLabel,
    getStatusColor,
    getReturnTypeLabel,
    getDocumentTypeLabel
  ]);

  return (
    <TaxContext.Provider value={contextValue}>
      {children}
    </TaxContext.Provider>
  );
};

// ============================================================================
// HELPER FUNCTION - Get timeline field for status
// ============================================================================

function getTimelineFieldForStatus(status) {
  const statusToTimelineField = {
    [TAX_RETURN_STATUSES.INTAKE]: 'createdAt',
    [TAX_RETURN_STATUSES.DOCUMENTS_PENDING]: 'documentsRequestedAt',
    [TAX_RETURN_STATUSES.READY_FOR_PREP]: 'documentsCompletedAt',
    [TAX_RETURN_STATUSES.IN_PREPARATION]: 'preparationStartedAt',
    [TAX_RETURN_STATUSES.PENDING_REVIEW]: 'preparationCompletedAt',
    [TAX_RETURN_STATUSES.APPROVED]: 'reviewCompletedAt',
    [TAX_RETURN_STATUSES.CLIENT_REVIEW]: 'clientReviewStartedAt',
    [TAX_RETURN_STATUSES.PENDING_SIGNATURE]: 'clientApprovedAt',
    [TAX_RETURN_STATUSES.READY_TO_FILE]: 'signedAt',
    [TAX_RETURN_STATUSES.FILED]: 'filedAt',
    [TAX_RETURN_STATUSES.ACCEPTED]: 'acceptedAt',
    [TAX_RETURN_STATUSES.COMPLETED]: 'completedAt'
  };

  return statusToTimelineField[status] || 'updatedAt';
}

export default TaxContext;
