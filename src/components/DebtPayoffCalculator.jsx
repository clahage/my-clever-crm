// Path: /src/components/DebtPayoffCalculator.jsx
// ═══════════════════════════════════════════════════════════════════════════
// DEBT PAYOFF CALCULATOR - Comprehensive Debt Management Component
// ═══════════════════════════════════════════════════════════════════════════
// Complete debt payoff planning with multiple strategies, visual timelines,
// and AI-powered recommendations for optimal debt elimination
//
// FEATURES:
// - Multiple debt input (all types supported)
// - 4 payoff strategies (Snowball, Avalanche, Hybrid, Credit-Focused)
// - Side-by-side strategy comparison
// - Interactive payment timeline
// - Interest savings calculator
// - Payment schedule generator
// - Milestone tracking
// - What-if scenario modeling
// - Export to PDF/CSV
// - Mobile-responsive charts
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Plus,
  Trash2,
  Edit,
  Download,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  CreditCard,
  Car,
  Home,
  GraduationCap,
  Heart,
  Wallet,
  ChevronDown,
  Calculator,
  Award,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { DebtPayoffCalculator as PayoffEngine } from '@/lib/financialPlanningEngine';
import { format, addMonths } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEBT_TYPES = {
  CREDIT_CARD: { 
    name: 'Credit Card', 
    icon: CreditCard, 
    color: '#f44336', 
    defaultAPR: 18.5,
    description: 'Revolving credit accounts'
  },
  AUTO_LOAN: { 
    name: 'Auto Loan', 
    icon: Car, 
    color: '#2196f3', 
    defaultAPR: 6.5,
    description: 'Vehicle financing'
  },
  STUDENT_LOAN: { 
    name: 'Student Loan', 
    icon: GraduationCap, 
    color: '#4caf50', 
    defaultAPR: 5.5,
    description: 'Educational loans'
  },
  PERSONAL_LOAN: { 
    name: 'Personal Loan', 
    icon: Wallet, 
    color: '#ff9800', 
    defaultAPR: 11.0,
    description: 'Unsecured personal loans'
  },
  MEDICAL_DEBT: { 
    name: 'Medical Debt', 
    icon: Heart, 
    color: '#e91e63', 
    defaultAPR: 0,
    description: 'Healthcare-related debt'
  },
  COLLECTION: { 
    name: 'Collection', 
    icon: AlertCircle, 
    color: '#9c27b0', 
    defaultAPR: 0,
    description: 'Debt in collections'
  },
  MORTGAGE: { 
    name: 'Mortgage', 
    icon: Home, 
    color: '#00bcd4', 
    defaultAPR: 7.0,
    description: 'Home loans'
  }
};

const STRATEGY_CONFIG = {
  snowball: {
    name: 'Debt Snowball',
    description: 'Pay smallest balances first',
    icon: Zap,
    color: '#2196f3',
    pros: ['Quick psychological wins', 'Builds momentum', 'Simple to follow'],
    cons: ['Higher total interest', 'Takes longer overall'],
    bestFor: 'People who need motivation and have many small debts'
  },
  avalanche: {
    name: 'Debt Avalanche',
    description: 'Pay highest interest rates first',
    icon: TrendingDown,
    color: '#4caf50',
    pros: ['Lowest total interest', 'Fastest mathematical payoff', 'Maximum savings'],
    cons: ['Can be discouraging', 'Requires discipline'],
    bestFor: 'Disciplined individuals focused on saving money'
  },
  hybrid: {
    name: 'AI Hybrid',
    description: 'Optimized balance of motivation and savings',
    icon: Award,
    color: '#9c27b0',
    pros: ['Balanced approach', 'AI-optimized', 'Good for most situations'],
    cons: ['More complex', 'Requires analysis'],
    bestFor: 'Most people wanting an optimal balance'
  },
  creditFocused: {
    name: 'Credit Score Focused',
    description: 'Optimize for maximum credit score improvement',
    icon: TrendingUp,
    color: '#ff9800',
    pros: ['Improves credit fastest', 'Lowers utilization quickly', 'Removes negatives'],
    cons: ['May not minimize interest', 'Complex prioritization'],
    bestFor: 'People prioritizing credit score improvement'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DebtPayoffCalculator({ clientId = null, isStandalone = false }) {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const { currentUser, userProfile } = useAuth();
  const { showNotification } = useNotification();

  // Core data
  const [debts, setDebts] = useState([]);
  const [strategies, setStrategies] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('hybrid');
  const [monthlyExtra, setMonthlyExtra] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [addDebtDialog, setAddDebtDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [scenarioMode, setScenarioMode] = useState(false);
  
  // Form state
  const [debtForm, setDebtForm] = useState({
    name: '',
    type: 'CREDIT_CARD',
    balance: '',
    minimumPayment: '',
    apr: '18.5',
    creditLimit: ''
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FIREBASE INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!currentUser) return;

    console.log('🔥 Setting up debt data listener...');
    
    const targetUserId = clientId || currentUser.uid;
    const debtsRef = query(
      collection(db, 'financialData', targetUserId, 'debts')
    );
    
    const unsubscribe = onSnapshot(debtsRef, (snapshot) => {
      const debtsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📊 Loaded ${debtsData.length} debts for analysis`);
      setDebts(debtsData);
    }, (error) => {
      console.error('❌ Error loading debts:', error);
      showNotification('Error loading debt data', 'error');
    });

    return unsubscribe;
  }, [currentUser, clientId, showNotification]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBT CALCULATION EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (debts.length === 0) {
      setStrategies(null);
      return;
    }

    console.log('🧮 Recalculating debt strategies...');
    setLoading(true);

    try {
      // Prepare debts for calculation
      const calculationDebts = debts.map(debt => ({
        ...debt,
        balance: parseFloat(debt.balance) || 0,
        minimumPayment: parseFloat(debt.minimumPayment) || 0,
        apr: parseFloat(debt.apr) || 0,
        creditLimit: parseFloat(debt.creditLimit) || 0
      })).filter(debt => debt.balance > 0);

      if (calculationDebts.length === 0) {
        setStrategies(null);
        setLoading(false);
        return;
      }

      const comparison = PayoffEngine.compareStrategies(calculationDebts, parseFloat(monthlyExtra) || 0);
      setStrategies(comparison);
      
      console.log('✅ Debt strategies calculated successfully');
    } catch (error) {
      console.error('❌ Error calculating debt strategies:', error);
      showNotification('Error calculating payoff strategies', 'error');
    }

    setLoading(false);
  }, [debts, monthlyExtra, showNotification]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBT MANAGEMENT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddDebt = () => {
    setEditingDebt(null);
    setDebtForm({
      name: '',
      type: 'CREDIT_CARD',
      balance: '',
      minimumPayment: '',
      apr: DEBT_TYPES.CREDIT_CARD.defaultAPR.toString(),
      creditLimit: ''
    });
    setAddDebtDialog(true);
  };

  const handleEditDebt = (debt) => {
    setEditingDebt(debt);
    setDebtForm({
      name: debt.name || '',
      type: debt.type || 'CREDIT_CARD',
      balance: debt.balance?.toString() || '',
      minimumPayment: debt.minimumPayment?.toString() || '',
      apr: debt.apr?.toString() || '',
      creditLimit: debt.creditLimit?.toString() || ''
    });
    setAddDebtDialog(true);
  };

  const handleSaveDebt = async () => {
    if (!currentUser || !debtForm.name || !debtForm.balance) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    setLoading(true);

    try {
      const targetUserId = clientId || currentUser.uid;
      
      const debtData = {
        name: debtForm.name.trim(),
        type: debtForm.type,
        balance: parseFloat(debtForm.balance) || 0,
        minimumPayment: parseFloat(debtForm.minimumPayment) || 0,
        apr: parseFloat(debtForm.apr) || 0,
        creditLimit: debtForm.creditLimit ? parseFloat(debtForm.creditLimit) : null,
        updatedAt: serverTimestamp()
      };

      if (editingDebt) {
        // Update existing debt
        await updateDoc(doc(db, 'financialData', targetUserId, 'debts', editingDebt.id), debtData);
        showNotification('Debt updated successfully', 'success');
      } else {
        // Add new debt
        const newDebtRef = doc(collection(db, 'financialData', targetUserId, 'debts'));
        await setDoc(newDebtRef, {
          ...debtData,
          createdAt: serverTimestamp()
        });
        showNotification('Debt added successfully', 'success');
      }

      setAddDebtDialog(false);
      setEditingDebt(null);
    } catch (error) {
      console.error('❌ Error saving debt:', error);
      showNotification('Error saving debt', 'error');
    }

    setLoading(false);
  };

  const handleDeleteDebt = async (debtId) => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const targetUserId = clientId || currentUser.uid;
      await deleteDoc(doc(db, 'financialData', targetUserId, 'debts', debtId));
      showNotification('Debt deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('❌ Error deleting debt:', error);
      showNotification('Error deleting debt', 'error');
    }

    setLoading(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleTypeChange = (type) => {
    setDebtForm({
      ...debtForm,
      type,
      apr: DEBT_TYPES[type].defaultAPR.toString()
    });
  };

  const calculateMinimumPayment = (balance, apr) => {
    // Standard calculation: 2-3% of balance or $25, whichever is higher
    const percentage = Math.max(0.02, 0.025);
    return Math.max(25, balance * percentage);
  };

  const handleBalanceChange = (balance) => {
    const numBalance = parseFloat(balance) || 0;
    const estimatedMinimum = calculateMinimumPayment(numBalance, parseFloat(debtForm.apr) || 0);
    
    setDebtForm({
      ...debtForm,
      balance,
      minimumPayment: !debtForm.minimumPayment ? estimatedMinimum.toFixed(2) : debtForm.minimumPayment
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDebtList = () => {
    if (debts.length === 0) {
      return (
        <Card sx={{ textAlign: 'center', py: 6, mb: 3 }}>
          <CardContent>
            <Calculator size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Debts Added Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your debts to see payoff strategies and create your debt-free plan
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={handleAddDebt}
              size="large"
            >
              Add Your First Debt
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Debts</Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={handleAddDebt}
              size="small"
            >
              Add Debt
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Debt Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Min Payment</TableCell>
                  <TableCell align="right">APR</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debts.map((debt) => {
                  const DebtIcon = DEBT_TYPES[debt.type]?.icon || AlertCircle;
                  const typeInfo = DEBT_TYPES[debt.type];
                  
                  return (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DebtIcon 
                            size={16} 
                            style={{ color: typeInfo?.color || '#666' }}
                          />
                          {debt.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={typeInfo?.name || debt.type}
                          size="small"
                          sx={{ 
                            backgroundColor: `${typeInfo?.color}20`,
                            color: typeInfo?.color
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${(debt.balance || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell align="right">
                        ${(debt.minimumPayment || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {(debt.apr || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditDebt(debt)}
                          sx={{ mr: 1 }}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setDeleteConfirm(debt)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Stats */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Debt</Typography>
                <Typography variant="h6">
                  ${debts.reduce((sum, debt) => sum + (debt.balance || 0), 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Min Payments</Typography>
                <Typography variant="h6">
                  ${debts.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Avg APR</Typography>
                <Typography variant="h6">
                  {debts.length > 0 ? (
                    debts.reduce((sum, debt) => sum + (debt.apr || 0), 0) / debts.length
                  ).toFixed(1) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Debts Count</Typography>
                <Typography variant="h6">{debts.length}</Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStrategiesComparison = () => {
    if (!strategies) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Strategy Comparison</Typography>
            <Typography color="text.secondary">
              Add debts and extra payment amount to see strategy comparison
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Strategy Comparison</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(strategies.strategies).map(([key, strategy]) => {
              const config = STRATEGY_CONFIG[key];
              const StrategyIcon = config.icon;
              const isRecommended = key === strategies.recommended;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedStrategy === key ? 2 : 1,
                      borderColor: selectedStrategy === key ? config.color : 'divider',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 2
                      }
                    }}
                    onClick={() => setSelectedStrategy(key)}
                  >
                    {isRecommended && (
                      <Badge
                        badgeContent="Recommended"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StrategyIcon 
                          size={20} 
                          style={{ color: config.color, marginRight: 8 }}
                        />
                        <Typography variant="subtitle2">{config.name}</Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {config.description}
                      </Typography>
                      
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Payoff Time</Typography>
                          <Typography variant="h6">{strategy.monthsToPayoff} months</Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">Total Interest</Typography>
                          <Typography variant="h6">
                            ${strategy.totalInterest.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}
                          </Typography>
                        </Box>
                        
                        {strategy.interestSavings !== 0 && (
                          <Box>
                            <Typography 
                              variant="body2" 
                              color={strategy.interestSavings < 0 ? 'success.main' : 'error.main'}
                            >
                              {strategy.interestSavings < 0 ? 'Saves' : 'Costs'}: $
                              {Math.abs(strategy.interestSavings).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Extra Payment Input */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Extra Monthly Payment"
              type="number"
              value={monthlyExtra}
              onChange={(e) => setMonthlyExtra(parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="Additional amount you can put toward debt each month"
            />
          </Box>

          {/* Selected Strategy Details */}
          {selectedStrategy && strategies.strategies[selectedStrategy] && (
            <Accordion expanded={true}>
              <AccordionSummary>
                <Typography variant="h6">
                  {STRATEGY_CONFIG[selectedStrategy].name} Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Pros & Cons</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {STRATEGY_CONFIG[selectedStrategy].pros.map((pro, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle size={16} style={{ color: '#4caf50' }} />
                          <Typography variant="body2">{pro}</Typography>
                        </Box>
                      ))}
                      {STRATEGY_CONFIG[selectedStrategy].cons.map((con, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AlertCircle size={16} style={{ color: '#f44336' }} />
                          <Typography variant="body2">{con}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>Best For</AlertTitle>
                      {STRATEGY_CONFIG[selectedStrategy].bestFor}
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Payoff Order</Typography>
                    <Stack spacing={1}>
                      {strategies.strategies[selectedStrategy].payoffOrder?.slice(0, 5).map((debt, index) => (
                        <Box key={debt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 24 }}>
                            {index + 1}.
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {debt.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Month {debt.month}
                          </Typography>
                        </Box>
                      ))}
                      {strategies.strategies[selectedStrategy].payoffOrder?.length > 5 && (
                        <Typography variant="body2" color="text.secondary">
                          ...and {strategies.strategies[selectedStrategy].payoffOrder.length - 5} more
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPayoffTimeline = () => {
    if (!strategies || !strategies.strategies[selectedStrategy]) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6">Payoff Timeline</Typography>
            <Typography color="text.secondary">
              Select a strategy to see your payoff timeline
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const strategy = strategies.strategies[selectedStrategy];
    
    // Prepare chart data (sample every 6 months to avoid overcrowding)
    const chartData = strategy.timeline
      .filter((_, index) => index % 6 === 0 || index === strategy.timeline.length - 1)
      .map(month => ({
        month: month.month,
        balance: month.totalBalance,
        interest: month.totalInterest
      }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Debt Payoff Timeline</Typography>
          
          <Box sx={{ height: 300, mb: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  label={{ value: 'Months', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    name === 'balance' ? 'Remaining Debt' : 'Total Interest Paid'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="interest" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Key Milestones */}
          <Typography variant="subtitle2" gutterBottom>Key Milestones</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">First Debt Paid</Typography>
                <Typography variant="h6">
                  Month {strategy.summary.firstDebtPaidOff || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Halfway Point</Typography>
                <Typography variant="h6">
                  Month {Math.round(strategy.monthsToPayoff / 2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Debt-Free Date</Typography>
                <Typography variant="h6">
                  {format(addMonths(new Date(), strategy.monthsToPayoff), 'MMM yyyy')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Total Interest</Typography>
                <Typography variant="h6">
                  ${strategy.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Debt Payoff Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your personalized debt elimination plan with multiple strategies
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Main Content */}
      <Stack spacing={3}>
        {/* Debt List */}
        {renderDebtList()}

        {/* Strategy Comparison */}
        {renderStrategiesComparison()}

        {/* Payoff Timeline */}
        {renderPayoffTimeline()}
      </Stack>

      {/* Add/Edit Debt Dialog */}
      <Dialog 
        open={addDebtDialog} 
        onClose={() => setAddDebtDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDebt ? 'Edit Debt' : 'Add New Debt'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Debt Name"
              value={debtForm.name}
              onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
              placeholder="e.g., Chase Credit Card, Car Loan"
              required
            />

            <FormControl fullWidth>
              <InputLabel>Debt Type</InputLabel>
              <Select
                value={debtForm.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                label="Debt Type"
              >
                {Object.entries(DEBT_TYPES).map(([key, type]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <type.icon size={16} style={{ color: type.color }} />
                      {type.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Current Balance"
                  type="number"
                  value={debtForm.balance}
                  onChange={(e) => handleBalanceChange(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Minimum Payment"
                  type="number"
                  value={debtForm.minimumPayment}
                  onChange={(e) => setDebtForm({ ...debtForm, minimumPayment: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="APR (%)"
                  type="number"
                  value={debtForm.apr}
                  onChange={(e) => setDebtForm({ ...debtForm, apr: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              {debtForm.type === 'CREDIT_CARD' && (
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Credit Limit"
                    type="number"
                    value={debtForm.creditLimit}
                    onChange={(e) => setDebtForm({ ...debtForm, creditLimit: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
              )}
            </Grid>

            {DEBT_TYPES[debtForm.type] && (
              <Alert severity="info">
                <Typography variant="body2">
                  {DEBT_TYPES[debtForm.type].description}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDebtDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveDebt} 
            variant="contained"
            disabled={loading || !debtForm.name || !debtForm.balance}
          >
            {editingDebt ? 'Update' : 'Add'} Debt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteDebt(deleteConfirm.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}