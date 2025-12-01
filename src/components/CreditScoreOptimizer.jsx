// ================================================================================
// CREDIT SCORE OPTIMIZER - TIER 5+ ENTERPRISE EDITION
// ================================================================================
// Path: src/components/CreditScoreOptimizer.jsx
// Version: 1.0.0 - COMPLETE PRODUCTION RELEASE
// Purpose: Optimize debt paydown for maximum credit score improvement
// Features: IDIQ integration, AI optimization, 5 strategies, visual analytics
// Lines: 1200+
// Owner: Christopher - Speedy Credit Repair
// Created: November 28, 2025
// ================================================================================
// 
// CRITICAL CREDIT SCORING KNOWLEDGE (Christopher's 30 Years Experience):
// -----------------------------------------------------------------------
// CREDIT UTILIZATION IMPACT ON SCORES:
// - 0-9% utilization = EXCELLENT (maximum points, +40-50 points potential)
// - 10-29% utilization = GOOD (optimal range, +20-30 points potential)  
// - 30-49% utilization = MODERATE (neutral, minor impact)
// - 50-69% utilization = HIGH (score reduction, -20-40 points)
// - 70%+ utilization = CRITICAL (severe score impact, -50-80 points)
//
// STRATEGIC PRIORITIES (in order of importance):
// 1. Get overall utilization UNDER 30% (most critical factor)
// 2. Get individual card utilization UNDER 10% (per-card scoring)
// 3. Keep at least one card reporting <10% balance (not $0, prevents "no activity")
// 4. Closed accounts with balances HURT MORE than open accounts
// 5. Pay off closed accounts FIRST (they count as 100% utilization)
// 6. Spread remaining funds to get open accounts under 30%, then 10%
//
// SCORE IMPACT ESTIMATION:
// - Each card moved from 70%+ to <30% = +8-12 points
// - Each card moved from 30-69% to <10% = +5-8 points
// - Overall utilization <30% = +15-25 points
// - Overall utilization <10% = +30-50 points
// - Closed account paid off = +10-15 points per account
//
// IMPORTANT: Target is 19% utilization NOT 30% and <1% NOT 10%
// Anything over 1% starts reducing points. 0% is actually bad (shows no activity).
// The sweet spot is 0.5-1.9% utilization for maximum score.
// ================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Calculator,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Info,
  Target,
  Zap,
  Award,
  BarChart,
  PieChart,
  Activity,
  ChevronDown,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// ================================================================================
// MAIN COMPONENT
// ================================================================================
const CreditScoreOptimizer = ({ clientId, clientName = '', onClose }) => {
  // ===== STATE MANAGEMENT =====
  
  // ===== DISPLAY CLIENT NAME =====
  const renderClientName = () => (
    clientName ? (
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Client: {clientName}
        </Typography>
      </Box>
    ) : null
  );
  const [accounts, setAccounts] = useState([]);
  const [availableFunds, setAvailableFunds] = useState(8000);
  const [selectedStrategy, setSelectedStrategy] = useState('ai-optimized');
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [importSource, setImportSource] = useState('manual');
  const [idiqReportId, setIdiqReportId] = useState('');
  const [language, setLanguage] = useState('en');
  const [showExplanation, setShowExplanation] = useState(true);

  // ===== NEW ACCOUNT FORM STATE =====
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'open', // open, closed, charge-off
    creditLimit: '',
    currentBalance: '',
    minimumPayment: '',
    interestRate: '',
    accountAge: '',
    isRevolving: true
  });

  // ===== TRANSLATION OBJECT =====
  const t = {
    en: {
      title: 'Credit Score Optimizer',
      subtitle: 'Maximize credit score improvement with strategic debt paydown',
      addAccount: 'Add Account',
      importIDIQ: 'Import from IDIQ Report',
      calculate: 'Calculate Optimization',
      reset: 'Reset All',
      availableFunds: 'Available Funds to Apply',
      currentSituation: 'Current Situation',
      optimizedStrategy: 'Optimized Strategy',
      recommendations: 'Recommendations',
      scoreImpact: 'Score Impact',
      beforeAfter: 'Before & After',
      accountName: 'Account Name',
      creditLimit: 'Credit Limit',
      currentBalance: 'Current Balance',
      utilization: 'Utilization',
      status: 'Status',
      actions: 'Actions',
      strategy: {
        'ai-optimized': 'AI-Optimized (Max Score Impact)',
        'highest-utilization': 'Highest Utilization First',
        'closed-accounts': 'Closed Accounts First',
        'snowball': 'Snowball (Smallest First)',
        'avalanche': 'Avalanche (Highest Interest)'
      },
      explanation: {
        title: 'How Credit Utilization Works',
        intro: 'Understanding the impact of utilization on your credit score:',
        optimal: 'OPTIMAL: 0.5-1.9% utilization (maximum points)',
        excellent: 'EXCELLENT: Under 10% (very strong)',
        good: 'GOOD: 10-29% (acceptable)',
        moderate: 'MODERATE: 30-49% (starts hurting)',
        high: 'HIGH: 50-69% (significant damage)',
        critical: 'CRITICAL: 70%+ (severe score reduction)',
        closedAccount: 'Closed accounts with balances hurt even more - pay these FIRST',
        strategy: 'Our AI strategy prioritizes closed accounts, then gets you under 30%, then under 1%'
      }
    },
    es: {
      title: 'Optimizador de Puntaje de Crédito',
      subtitle: 'Maximice la mejora del puntaje con pago estratégico de deudas',
      addAccount: 'Agregar Cuenta',
      importIDIQ: 'Importar desde Informe IDIQ',
      calculate: 'Calcular Optimización',
      reset: 'Reiniciar Todo',
      availableFunds: 'Fondos Disponibles',
      currentSituation: 'Situación Actual',
      optimizedStrategy: 'Estrategia Optimizada',
      recommendations: 'Recomendaciones',
      scoreImpact: 'Impacto en Puntaje',
      beforeAfter: 'Antes y Después',
      accountName: 'Nombre de Cuenta',
      creditLimit: 'Límite de Crédito',
      currentBalance: 'Saldo Actual',
      utilization: 'Utilización',
      status: 'Estado',
      actions: 'Acciones',
      strategy: {
        'ai-optimized': 'Optimizado IA (Máximo Impacto)',
        'highest-utilization': 'Mayor Utilización Primero',
        'closed-accounts': 'Cuentas Cerradas Primero',
        'snowball': 'Bola de Nieve (Menor Primero)',
        'avalanche': 'Avalancha (Mayor Interés)'
      },
      explanation: {
        title: 'Cómo Funciona la Utilización de Crédito',
        intro: 'Entendiendo el impacto de la utilización en su puntaje:',
        optimal: 'ÓPTIMO: 0.5-1.9% utilización (puntos máximos)',
        excellent: 'EXCELENTE: Menos de 10% (muy fuerte)',
        good: 'BUENO: 10-29% (aceptable)',
        moderate: 'MODERADO: 30-49% (empieza a dañar)',
        high: 'ALTO: 50-69% (daño significativo)',
        critical: 'CRÍTICO: 70%+ (reducción severa)',
        closedAccount: 'Cuentas cerradas con saldos dañan aún más - pague estas PRIMERO',
        strategy: 'Nuestra estrategia IA prioriza cuentas cerradas, luego lo lleva bajo 30%, luego bajo 1%'
      }
    }
  };

  const translate = (key) => {
    const keys = key.split('.');
    let value = t[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // ===== LOAD AVAILABLE IDIQ REPORTS =====
  const [availableReports, setAvailableReports] = useState([]);

  useEffect(() => {
    const loadIDIQReports = async () => {
      if (!clientId) return;
      
      try {
        const reportsQuery = query(
          collection(db, 'idiqEnrollments'),
          where('clientId', '==', clientId)
        );
        const snapshot = await getDocs(reportsQuery);
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAvailableReports(reports);
        
        if (reports.length > 0) {
          setIdiqReportId(reports[0].id); // Auto-select first report
        }
      } catch (error) {
        console.error('Error loading IDIQ reports:', error);
      }
    };

    loadIDIQReports();
  }, [clientId]);

  // ===== IMPORT FROM IDIQ CREDIT REPORT =====
  const importFromIDIQ = async () => {
    if (!idiqReportId) {
      alert('Please select an IDIQ report to import from');
      return;
    }

    setLoading(true);
    try {
      console.log('[IDIQ Import] Starting import for idiqReportId:', idiqReportId);
      const enrollmentRef = doc(db, 'idiqEnrollments', idiqReportId);
      const enrollmentSnap = await getDoc(enrollmentRef);

      if (!enrollmentSnap.exists()) {
        console.warn('[IDIQ Import] No document found for idiqReportId:', idiqReportId);
        alert('IDIQ report not found');
        setLoading(false);
        return;
      }

      const reportData = enrollmentSnap.data();
      console.log('[IDIQ Import] Loaded reportData:', reportData);

      // Diagnostics: show keys and types
      if (!reportData) {
        console.error('[IDIQ Import] reportData is undefined or null');
        alert('IDIQ report data is missing.');
        setLoading(false);
        return;
      }
      console.log('[IDIQ Import] reportData keys:', Object.keys(reportData));
      if (reportData.tradelines) {
        console.log('[IDIQ Import] tradelines:', reportData.tradelines);
      }
      if (reportData.accounts) {
        console.log('[IDIQ Import] accounts:', reportData.accounts);
      }

      // Parse credit report tradelines (supports multiple formats)
      const tradelines = reportData.tradelines || reportData.accounts || [];
      console.log('[IDIQ Import] Parsed tradelines:', tradelines);
      const revolvingAccounts = tradelines
        .filter(t => {
          const accountType = (t.accountType || t.type || '').toLowerCase();
          const isRevolving = accountType.includes('revolving') || accountType.includes('credit card') || accountType.includes('card');
          if (!isRevolving) {
            console.log('[IDIQ Import] Skipping non-revolving tradeline:', t);
          }
          return isRevolving;
        })
        .map(tradeline => {
          const acc = {
            id: `idiq-${tradeline.accountNumber || Math.random().toString(36).substr(2, 9)}`,
            name: tradeline.creditorName || tradeline.accountName || tradeline.name || 'Unknown Account',
            type: (tradeline.accountStatus || tradeline.status || '').toLowerCase().includes('closed') ? 'closed' : 'open',
            creditLimit: parseFloat(tradeline.creditLimit || tradeline.highCredit || tradeline.limit || 0),
            currentBalance: parseFloat(tradeline.balance || tradeline.currentBalance || tradeline.amount || 0),
            minimumPayment: parseFloat(tradeline.minimumPayment || tradeline.minPayment || 0),
            interestRate: parseFloat(tradeline.interestRate || tradeline.apr || tradeline.rate || 18.99),
            accountAge: tradeline.dateOpened ? Math.floor((Date.now() - new Date(tradeline.dateOpened).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0,
            isRevolving: true,
            source: 'idiq',
            bureau: tradeline.bureau || 'Unknown'
          };
          console.log('[IDIQ Import] Parsed revolving account:', acc);
          return acc;
        });

      if (revolvingAccounts.length === 0) {
        console.warn('[IDIQ Import] No revolving accounts found. Tradelines:', tradelines);
        alert('No revolving accounts found in this IDIQ report. Make sure the report contains credit card or revolving accounts.');
        setLoading(false);
        return;
      }

      setAccounts(revolvingAccounts);
      alert(`✅ Successfully imported ${revolvingAccounts.length} revolving accounts from IDIQ report`);
      console.log('[IDIQ Import] Successfully imported accounts:', revolvingAccounts);

    } catch (error) {
      console.error('[IDIQ Import] Error importing IDIQ report:', error);
      alert('❌ Failed to import IDIQ report. Please check console for details or enter accounts manually.');
    }
    setLoading(false);
  };

  // ===== ADD ACCOUNT MANUALLY =====
  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.creditLimit || !newAccount.currentBalance) {
      alert('⚠️ Please fill in required fields: Account Name, Credit Limit, and Current Balance');
      return;
    }

    const account = {
      id: Date.now().toString(),
      ...newAccount,
      creditLimit: parseFloat(newAccount.creditLimit),
      currentBalance: parseFloat(newAccount.currentBalance),
      minimumPayment: parseFloat(newAccount.minimumPayment || 0),
      interestRate: parseFloat(newAccount.interestRate || 18.99),
      accountAge: parseInt(newAccount.accountAge || 0)
    };

    setAccounts([...accounts, account]);
    setNewAccount({
      name: '',
      type: 'open',
      creditLimit: '',
      currentBalance: '',
      minimumPayment: '',
      interestRate: '',
      accountAge: '',
      isRevolving: true
    });
    setShowAddDialog(false);
  };

  // ===== DELETE ACCOUNT =====
  const handleDeleteAccount = (accountId) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      setAccounts(accounts.filter(a => a.id !== accountId));
      setOptimization(null); // Clear optimization when accounts change
    }
  };

  // ===== RESET ALL =====
  const handleReset = () => {
    if (window.confirm('Reset all data? This will clear all accounts and calculations.')) {
      setAccounts([]);
      setOptimization(null);
      setAvailableFunds(8000);
    }
  };

  // ===== CALCULATE CURRENT METRICS =====
  const currentMetrics = useMemo(() => {
    if (accounts.length === 0) return null;

    const totalDebt = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const totalCredit = accounts.reduce((sum, a) => sum + a.creditLimit, 0);
    const overallUtilization = totalCredit > 0 ? (totalDebt / totalCredit) * 100 : 0;

    // Calculate per-account utilization
    const accountsWithUtil = accounts.map(a => ({
      ...a,
      utilization: a.creditLimit > 0 ? (a.currentBalance / a.creditLimit) * 100 : 0
    }));

    // Count problematic accounts
    const highUtilAccounts = accountsWithUtil.filter(a => a.utilization >= 70).length;
    const closedWithBalance = accountsWithUtil.filter(a => a.type === 'closed' && a.currentBalance > 0).length;
    const moderateUtilAccounts = accountsWithUtil.filter(a => a.utilization >= 30 && a.utilization < 70).length;

    // Estimate current score impact (negative) - Based on Christopher's expertise
    let scoreImpact = 0;
    
    // Overall utilization impact
    if (overallUtilization > 70) scoreImpact -= 60;
    else if (overallUtilization > 50) scoreImpact -= 40;
    else if (overallUtilization > 30) scoreImpact -= 20;
    else if (overallUtilization > 10) scoreImpact -= 10;
    else if (overallUtilization > 1.9) scoreImpact -= 5;
    // 0.5-1.9% is optimal (0 points impact)

    // Per-card impacts
    scoreImpact -= (highUtilAccounts * 8); // Each high-util card hurts
    scoreImpact -= (moderateUtilAccounts * 4); // Moderate util cards hurt less
    scoreImpact -= (closedWithBalance * 12); // Closed accounts hurt more

    return {
      totalDebt,
      totalCredit,
      overallUtilization,
      accountsWithUtil,
      highUtilAccounts,
      moderateUtilAccounts,
      closedWithBalance,
      estimatedScoreImpact: scoreImpact
    };
  }, [accounts]);

  // ===== AI-OPTIMIZED STRATEGY (Christopher's 30-Year Expertise) =====
  // This is the BEST strategy for maximum credit score improvement
  const calculateAIOptimizedStrategy = () => {
    if (!currentMetrics) return null;

    let remainingFunds = availableFunds;
    const payments = [];
    let projectedAccounts = [...currentMetrics.accountsWithUtil];

    // ===== PHASE 1: Pay off ALL closed accounts first (CRITICAL priority) =====
    const closedAccounts = projectedAccounts
      .filter(a => a.type === 'closed' && a.currentBalance > 0)
      .sort((a, b) => a.currentBalance - b.currentBalance); // Smallest first for quick wins

    closedAccounts.forEach(account => {
      if (remainingFunds >= account.currentBalance) {
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: account.currentBalance,
          currentBalance: account.currentBalance,
          newBalance: 0,
          currentUtil: account.utilization,
          newUtil: 0,
          scoreImpact: 15,
          priority: 'CRITICAL',
          reason: 'Closed account with balance - counts as 100% utilization equivalent. MUST pay off.',
          phase: 1
        });
        remainingFunds -= account.currentBalance;
        
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: 0, utilization: 0 };
        }
      } else if (remainingFunds > 0) {
        // Partial payment if we can't pay in full
        const payment = remainingFunds;
        const newBalance = account.currentBalance - payment;
        const newUtil = (newBalance / account.creditLimit) * 100;
        
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: 8,
          priority: 'HIGH',
          reason: 'Partial payment on closed account (full payoff preferred)',
          phase: 1
        });
        remainingFunds = 0;
        
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    // ===== PHASE 2: Get high-utilization (70%+) accounts under 30% =====
    const highUtilAccounts = projectedAccounts
      .filter(a => a.type === 'open' && a.utilization >= 70)
      .sort((a, b) => b.utilization - a.utilization); // Highest first

    highUtilAccounts.forEach(account => {
      const targetBalance = account.creditLimit * 0.29; // Target 29% utilization
      const paymentNeeded = Math.max(0, account.currentBalance - targetBalance);

      if (remainingFunds > 0 && paymentNeeded > 0) {
        const payment = Math.min(remainingFunds, paymentNeeded);
        const newBalance = account.currentBalance - payment;
        const newUtil = (newBalance / account.creditLimit) * 100;

        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: 10,
          priority: 'HIGH',
          reason: `Critical utilization reduction: ${account.utilization.toFixed(0)}% → ${newUtil.toFixed(0)}%`,
          phase: 2
        });

        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    // ===== PHASE 3: Get moderate utilization (30-69%) accounts under 10% =====
    const moderateUtilAccounts = projectedAccounts
      .filter(a => a.type === 'open' && a.utilization >= 30 && a.utilization < 70)
      .sort((a, b) => b.utilization - a.utilization);

    moderateUtilAccounts.forEach(account => {
      const targetBalance = account.creditLimit * 0.09; // Target 9% utilization
      const paymentNeeded = Math.max(0, account.currentBalance - targetBalance);

      if (remainingFunds > 0 && paymentNeeded > 0) {
        const payment = Math.min(remainingFunds, paymentNeeded);
        const newBalance = account.currentBalance - payment;
        const newUtil = (newBalance / account.creditLimit) * 100;

        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: 6,
          priority: 'MEDIUM',
          reason: `Moderate to excellent: ${account.utilization.toFixed(0)}% → ${newUtil.toFixed(0)}%`,
          phase: 3
        });

        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    // ===== PHASE 4: Get accounts under 1.9% (OPTIMAL utilization) =====
    const lowUtilAccounts = projectedAccounts
      .filter(a => a.type === 'open' && a.utilization > 1.9 && a.utilization < 30)
      .sort((a, b) => b.utilization - a.utilization);

    lowUtilAccounts.forEach(account => {
      const targetBalance = account.creditLimit * 0.019; // Target 1.9% utilization (optimal)
      const paymentNeeded = Math.max(0, account.currentBalance - targetBalance);

      if (remainingFunds > 0 && paymentNeeded > 0) {
        const payment = Math.min(remainingFunds, paymentNeeded);
        const newBalance = account.currentBalance - payment;
        const newUtil = (newBalance / account.creditLimit) * 100;

        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: 4,
          priority: 'LOW',
          reason: `Fine-tune to optimal: ${account.utilization.toFixed(1)}% → ${newUtil.toFixed(1)}%`,
          phase: 4
        });

        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    // ===== CALCULATE FINAL METRICS =====
    const newTotalDebt = projectedAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const newOverallUtil = (newTotalDebt / currentMetrics.totalCredit) * 100;

    // Estimate total score improvement
    let totalScoreImpact = payments.reduce((sum, p) => sum + p.scoreImpact, 0);
    
    // Bonus points for crossing utilization thresholds
    if (currentMetrics.overallUtilization > 30 && newOverallUtil < 30) totalScoreImpact += 20;
    if (currentMetrics.overallUtilization > 10 && newOverallUtil < 10) totalScoreImpact += 15;
    if (newOverallUtil < 1.9) totalScoreImpact += 25; // Major bonus for optimal utilization

    return {
      payments,
      projectedAccounts,
      newTotalDebt,
      newOverallUtil,
      totalScoreImpact,
      fundsUsed: availableFunds - remainingFunds,
      fundsRemaining: remainingFunds
    };
  };

  // ===== OTHER STRATEGIES (Simplified versions) =====
  const calculateHighestUtilizationStrategy = () => {
    if (!currentMetrics) return null;
    let remainingFunds = availableFunds;
    const payments = [];
    let projectedAccounts = [...currentMetrics.accountsWithUtil];
    
    const sortedAccounts = [...projectedAccounts]
      .filter(a => a.currentBalance > 0)
      .sort((a, b) => b.utilization - a.utilization);

    sortedAccounts.forEach(account => {
      if (remainingFunds > 0) {
        const payment = Math.min(remainingFunds, account.currentBalance);
        const newBalance = account.currentBalance - payment;
        const newUtil = account.creditLimit > 0 ? (newBalance / account.creditLimit) * 100 : 0;
        
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: account.utilization >= 70 ? 10 : account.utilization >= 30 ? 6 : 3,
          priority: account.utilization >= 70 ? 'HIGH' : 'MEDIUM',
          reason: `Highest utilization: ${account.utilization.toFixed(0)}%`
        });
        
        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    const newTotalDebt = projectedAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const newOverallUtil = (newTotalDebt / currentMetrics.totalCredit) * 100;
    const totalScoreImpact = payments.reduce((sum, p) => sum + p.scoreImpact, 0);

    return {
      payments,
      projectedAccounts,
      newTotalDebt,
      newOverallUtil,
      totalScoreImpact,
      fundsUsed: availableFunds - remainingFunds,
      fundsRemaining: remainingFunds
    };
  };

  const calculateClosedAccountsStrategy = () => {
    if (!currentMetrics) return null;
    let remainingFunds = availableFunds;
    const payments = [];
    let projectedAccounts = [...currentMetrics.accountsWithUtil];
    
    const closedAccounts = projectedAccounts.filter(a => a.type === 'closed' && a.currentBalance > 0).sort((a, b) => a.currentBalance - b.currentBalance);
    const openAccounts = projectedAccounts.filter(a => a.type === 'open' && a.currentBalance > 0).sort((a, b) => b.utilization - a.utilization);

    [...closedAccounts, ...openAccounts].forEach(account => {
      if (remainingFunds > 0) {
        const payment = Math.min(remainingFunds, account.currentBalance);
        const newBalance = account.currentBalance - payment;
        const newUtil = account.creditLimit > 0 ? (newBalance / account.creditLimit) * 100 : 0;
        
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: account.type === 'closed' ? 15 : 8,
          priority: account.type === 'closed' ? 'CRITICAL' : 'MEDIUM',
          reason: account.type === 'closed' ? 'Closed account' : `Open at ${account.utilization.toFixed(0)}%`
        });
        
        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    const newTotalDebt = projectedAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const newOverallUtil = (newTotalDebt / currentMetrics.totalCredit) * 100;
    const totalScoreImpact = payments.reduce((sum, p) => sum + p.scoreImpact, 0);

    return { payments, projectedAccounts, newTotalDebt, newOverallUtil, totalScoreImpact, fundsUsed: availableFunds - remainingFunds, fundsRemaining: remainingFunds };
  };

  const calculateSnowballStrategy = () => {
    if (!currentMetrics) return null;
    let remainingFunds = availableFunds;
    const payments = [];
    let projectedAccounts = [...currentMetrics.accountsWithUtil];
    
    const sortedAccounts = [...projectedAccounts].filter(a => a.currentBalance > 0).sort((a, b) => a.currentBalance - b.currentBalance);

    sortedAccounts.forEach(account => {
      if (remainingFunds > 0) {
        const payment = Math.min(remainingFunds, account.currentBalance);
        const newBalance = account.currentBalance - payment;
        const newUtil = account.creditLimit > 0 ? (newBalance / account.creditLimit) * 100 : 0;
        
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: newBalance === 0 ? 8 : 4,
          priority: 'MEDIUM',
          reason: `Smallest balance: $${account.currentBalance.toFixed(2)}`
        });
        
        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    const newTotalDebt = projectedAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const newOverallUtil = (newTotalDebt / currentMetrics.totalCredit) * 100;
    const totalScoreImpact = payments.reduce((sum, p) => sum + p.scoreImpact, 0);

    return { payments, projectedAccounts, newTotalDebt, newOverallUtil, totalScoreImpact, fundsUsed: availableFunds - remainingFunds, fundsRemaining: remainingFunds };
  };

  const calculateAvalancheStrategy = () => {
    if (!currentMetrics) return null;
    let remainingFunds = availableFunds;
    const payments = [];
    let projectedAccounts = [...currentMetrics.accountsWithUtil];
    
    const sortedAccounts = [...projectedAccounts].filter(a => a.currentBalance > 0).sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));

    sortedAccounts.forEach(account => {
      if (remainingFunds > 0) {
        const payment = Math.min(remainingFunds, account.currentBalance);
        const newBalance = account.currentBalance - payment;
        const newUtil = account.creditLimit > 0 ? (newBalance / account.creditLimit) * 100 : 0;
        
        payments.push({
          accountId: account.id,
          accountName: account.name,
          paymentAmount: payment,
          currentBalance: account.currentBalance,
          newBalance,
          currentUtil: account.utilization,
          newUtil,
          scoreImpact: 5,
          priority: 'MEDIUM',
          reason: `Highest interest: ${account.interestRate || 0}% APR`
        });
        
        remainingFunds -= payment;
        const idx = projectedAccounts.findIndex(a => a.id === account.id);
        if (idx !== -1) {
          projectedAccounts[idx] = { ...projectedAccounts[idx], currentBalance: newBalance, utilization: newUtil };
        }
      }
    });

    const newTotalDebt = projectedAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const newOverallUtil = (newTotalDebt / currentMetrics.totalCredit) * 100;
    const totalScoreImpact = payments.reduce((sum, p) => sum + p.scoreImpact, 0);

    return { payments, projectedAccounts, newTotalDebt, newOverallUtil, totalScoreImpact, fundsUsed: availableFunds - remainingFunds, fundsRemaining: remainingFunds };
  };

  // ===== CALCULATE OPTIMIZATION =====
  const handleCalculateOptimization = () => {
    if (accounts.length === 0) {
      alert('⚠️ Please add accounts first');
      return;
    }
    if (availableFunds <= 0) {
      alert('⚠️ Please enter available funds');
      return;
    }

    let result;
    switch (selectedStrategy) {
      case 'ai-optimized': result = calculateAIOptimizedStrategy(); break;
      case 'highest-utilization': result = calculateHighestUtilizationStrategy(); break;
      case 'closed-accounts': result = calculateClosedAccountsStrategy(); break;
      case 'snowball': result = calculateSnowballStrategy(); break;
      case 'avalanche': result = calculateAvalancheStrategy(); break;
      default: result = calculateAIOptimizedStrategy();
    }

    setOptimization(result);
  };

  // ===== UTILITY FUNCTIONS =====
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 70) return '#EF4444'; // Red - Critical
    if (utilization >= 50) return '#F59E0B'; // Orange - High
    if (utilization >= 30) return '#FBBF24'; // Yellow - Moderate
    if (utilization >= 10) return '#10B981'; // Green - Good
    if (utilization >= 1.9) return '#059669'; // Dark Green - Excellent
    return '#047857'; // Darker Green - Optimal (0.5-1.9%)
  };

  const getUtilizationLabel = (utilization) => {
    if (utilization >= 70) return 'CRITICAL';
    if (utilization >= 50) return 'HIGH';
    if (utilization >= 30) return 'MODERATE';
    if (utilization >= 10) return 'GOOD';
    if (utilization >= 1.9) return 'EXCELLENT';
    return 'OPTIMAL';
  };

  // ===== RENDER =====
  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Target size={32} color="#3B82F6" />
            {translate('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {translate('subtitle')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup value={language} exclusive onChange={(e, val) => val && setLanguage(val)} size="small">
            <ToggleButton value="en">🇺🇸 EN</ToggleButton>
            <ToggleButton value="es">🇪🇸 ES</ToggleButton>
          </ToggleButtonGroup>
          
          {accounts.length > 0 && (
            <Button variant="outlined" color="error" startIcon={<RefreshCw size={18} />} onClick={handleReset}>
              {translate('reset')}
            </Button>
          )}
        </Stack>
      </Box>

      {/* EXPLANATION CARD */}
      {showExplanation && (
        <Card sx={{ mb: 3, backgroundColor: '#F0F9FF', borderLeft: '4px solid #3B82F6' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info size={20} color="#3B82F6" />
                  {translate('explanation.title')}
                </Typography>
                <Typography variant="body2" paragraph>{translate('explanation.intro')}</Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle size={18} color="#047857" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.optimal')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle size={18} color="#059669" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.excellent')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle size={18} color="#10B981" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.good')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AlertCircle size={18} color="#FBBF24" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.moderate')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AlertCircle size={18} color="#F59E0B" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.high')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><XCircle size={18} color="#EF4444" /></ListItemIcon>
                    <ListItemText primary={translate('explanation.critical')} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                </List>
                
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>{translate('explanation.closedAccount')}</strong>
                </Alert>
              </Box>
              
              <IconButton onClick={() => setShowExplanation(false)} size="small">
                <X size={18} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container columns={12} columnSpacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} columns={6}>
          {/* Import Options */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Data Source</Typography>

              <ToggleButtonGroup value={importSource} exclusive onChange={(e, val) => val && setImportSource(val)} fullWidth sx={{ mb: 2 }}>
                <ToggleButton value="manual"><Edit size={18} style={{ marginRight: 8 }} />Manual Input</ToggleButton>
                <ToggleButton value="idiq"><Upload size={18} style={{ marginRight: 8 }} />IDIQ Report</ToggleButton>
              </ToggleButtonGroup>

              {importSource === 'idiq' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {availableReports.length > 0 ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Report</InputLabel>
                      <Select value={idiqReportId} onChange={(e) => setIdiqReportId(e.target.value)} label="Select Report">
                        {availableReports.map(report => (
                          <MenuItem key={report.id} value={report.id}>
                            {(() => {
                              const dateObj = report.createdAt?.toDate ? report.createdAt.toDate() : new Date(report.createdAt);
                              return dateObj ? dateObj.toLocaleDateString() : '';
                            })()} - {report.status || 'Complete'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField fullWidth label="IDIQ Report ID" value={idiqReportId} onChange={(e) => setIdiqReportId(e.target.value)} size="small" placeholder="Enter IDIQ enrollment ID" />
                  )}
                  <Button variant="contained" onClick={importFromIDIQ} disabled={!idiqReportId || loading} startIcon={loading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}>
                    Import
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Available Funds */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{translate('availableFunds')}</Typography>
              <TextField fullWidth type="number" value={availableFunds} onChange={(e) => setAvailableFunds(parseFloat(e.target.value) || 0)} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} inputProps={{ min: 0, step: 100 }} />
            </CardContent>
          </Card>

          {/* Accounts List */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Accounts ({accounts.length})</Typography>
                <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setShowAddDialog(true)} disabled={importSource === 'idiq'}>
                  {translate('addAccount')}
                </Button>
              </Box>

              {accounts.length === 0 ? (
                <Alert severity="info">
                  {importSource === 'manual' ? 'Click "Add Account" to manually enter credit card accounts' : 'Import accounts from an IDIQ credit report above'}
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell align="right">Limit</TableCell>
                        <TableCell align="right">Util%</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accounts.map((account) => {
                        const util = account.creditLimit > 0 ? (account.currentBalance / account.creditLimit) * 100 : 0;
                        return (
                          <TableRow key={account.id}>
                            <TableCell>{account.name}</TableCell>
                            <TableCell align="right">{formatCurrency(account.currentBalance)}</TableCell>
                            <TableCell align="right">{formatCurrency(account.creditLimit)}</TableCell>
                            <TableCell align="right">
                              <Chip label={`${util.toFixed(0)}%`} size="small" sx={{ backgroundColor: getUtilizationColor(util), color: 'white', fontWeight: 'bold' }} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={account.type} size="small" color={account.type === 'open' ? 'success' : 'default'} />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={() => handleDeleteAccount(account.id)} color="error">
                                <Trash2 size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Strategy Selection */}
          {accounts.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Optimization Strategy</InputLabel>
                  <Select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)} label="Optimization Strategy">
                    <MenuItem value="ai-optimized"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Zap size={18} color="#8B5CF6" />{translate('strategy.ai-optimized')}</Box></MenuItem>
                    <MenuItem value="highest-utilization"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUp size={18} />{translate('strategy.highest-utilization')}</Box></MenuItem>
                    <MenuItem value="closed-accounts"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><X size={18} />{translate('strategy.closed-accounts')}</Box></MenuItem>
                    <MenuItem value="snowball"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Target size={18} />{translate('strategy.snowball')}</Box></MenuItem>
                    <MenuItem value="avalanche"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DollarSign size={18} />{translate('strategy.avalanche')}</Box></MenuItem>
                  </Select>
                </FormControl>

                <Button variant="contained" fullWidth size="large" startIcon={<Calculator size={20} />} onClick={handleCalculateOptimization} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' } }}>
                  {translate('calculate')}
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* RIGHT COLUMN - RESULTS */}
        <Grid item xs={12} columns={6}>
          {currentMetrics && (
            <>
              {/* Current Situation */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Activity size={20} />
                    {translate('currentSituation')}
                  </Typography>

                  <Grid container columns={12} columnSpacing={2}>
                    <Grid item xs={6} columns={6}>
                      <Typography variant="body2" color="text.secondary">Total Debt</Typography>
                      <Typography variant="h5">{formatCurrency(currentMetrics.totalDebt)}</Typography>
                    </Grid>
                    <Grid item xs={6} columns={6}>
                      <Typography variant="body2" color="text.secondary">Total Credit</Typography>
                      <Typography variant="h5">{formatCurrency(currentMetrics.totalCredit)}</Typography>
                    </Grid>
                    <Grid item xs={12} columns={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Overall Utilization</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress variant="determinate" value={Math.min(100, currentMetrics.overallUtilization)} sx={{ height: 12, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', '& .MuiLinearProgress-bar': { backgroundColor: getUtilizationColor(currentMetrics.overallUtilization) } }} />
                        </Box>
                        <Chip label={`${currentMetrics.overallUtilization.toFixed(1)}%`} sx={{ backgroundColor: getUtilizationColor(currentMetrics.overallUtilization), color: 'white', fontWeight: 'bold' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {getUtilizationLabel(currentMetrics.overallUtilization)} - Target: Under 1.9% (Optimal: 0.5-1.9%)
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <AlertTitle>Estimated Score Impact</AlertTitle>
                        Current utilization is costing you approximately <strong>{Math.abs(currentMetrics.estimatedScoreImpact)} points</strong>
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Optimization Results */}
              {optimization && (
                <>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Award size={20} color="#10B981" />
                        {translate('optimizedStrategy')}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">Funds Used</Typography>
                          <Typography variant="h6" color="primary">{formatCurrency(optimization.fundsUsed)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">New Utilization</Typography>
                          <Typography variant="h6" sx={{ color: getUtilizationColor(optimization.newOverallUtil) }}>
                            {optimization.newOverallUtil.toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">Score Gain</Typography>
                          <Typography variant="h6" color="success.main">+{optimization.totalScoreImpact} pts</Typography>
                        </Grid>
                      </Grid>

                      <Alert severity="success" sx={{ mb: 2 }}>
                        <AlertTitle>Projected Improvement</AlertTitle>
                        By applying <strong>{formatCurrency(optimization.fundsUsed)}</strong>, your client's overall utilization will improve from <strong>{currentMetrics.overallUtilization.toFixed(1)}%</strong> to <strong>{optimization.newOverallUtil.toFixed(1)}%</strong>, potentially adding <strong>+{optimization.totalScoreImpact} points</strong> to their credit score.
                      </Alert>

                      {/* Payment Plan */}
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Recommended Payment Plan ({optimization.payments.length} payments)
                      </Typography>

                      {optimization.payments.map((payment, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={`#${index + 1}`} size="small" sx={{ minWidth: 40 }} />
                                <Typography variant="body2"><strong>{payment.accountName}</strong></Typography>
                              </Box>
                              <Chip label={formatCurrency(payment.paymentAmount)} size="small" color="primary" />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                                <Typography variant="body2">{formatCurrency(payment.currentBalance)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">New Balance</Typography>
                                <Typography variant="body2">{formatCurrency(payment.newBalance)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Current Utilization</Typography>
                                <Typography variant="body2" sx={{ color: getUtilizationColor(payment.currentUtil) }}>
                                  {payment.currentUtil.toFixed(1)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">New Utilization</Typography>
                                <Typography variant="body2" sx={{ color: getUtilizationColor(payment.newUtil) }}>
                                  {payment.newUtil.toFixed(1)}%
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Alert severity="info" icon={<Info size={16} />}>
                                  <Typography variant="caption">
                                    <strong>Reason:</strong> {payment.reason}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption">
                                    <strong>Priority:</strong> {payment.priority} | <strong>Score Impact:</strong> +{payment.scoreImpact} pts
                                  </Typography>
                                </Alert>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}

                      {optimization.fundsRemaining > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <strong>{formatCurrency(optimization.fundsRemaining)}</strong> remaining - Consider keeping as emergency fund or saving for future paydown rounds.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Before/After Chart */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{translate('beforeAfter')} Comparison</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={[{ name: 'Before', utilization: currentMetrics.overallUtilization, score: 100 + currentMetrics.estimatedScoreImpact }, { name: 'After', utilization: optimization.newOverallUtil, score: 100 + currentMetrics.estimatedScoreImpact + optimization.totalScoreImpact }]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Score (Relative)', angle: 90, position: 'insideRight' }} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="utilization" fill="#EF4444" name="Utilization %" />
                          <Bar yAxisId="right" dataKey="score" fill="#10B981" name="Credit Score (Relative)" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {!currentMetrics && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Calculator size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>Ready to Optimize</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add accounts and available funds, then click "Calculate Optimization" to see results
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* ADD ACCOUNT DIALOG */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Account Name" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="e.g., Chase Sapphire" />
            <FormControl fullWidth>
              <InputLabel>Account Status</InputLabel>
              <Select value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })} label="Account Status">
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed (with balance)</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth type="number" label="Credit Limit" value={newAccount.creditLimit} onChange={(e) => setNewAccount({ ...newAccount, creditLimit: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            <TextField fullWidth type="number" label="Current Balance" value={newAccount.currentBalance} onChange={(e) => setNewAccount({ ...newAccount, currentBalance: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            <TextField fullWidth type="number" label="Interest Rate (APR)" value={newAccount.interestRate} onChange={(e) => setNewAccount({ ...newAccount, interestRate: e.target.value })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAccount}>Add Account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditScoreOptimizer;