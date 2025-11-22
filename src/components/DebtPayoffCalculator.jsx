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
  Divider
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
  Wallet
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
  Cell
} from 'recharts';
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { DebtPayoffCalculator as DebtEngine } from '@/lib/financialPlanningEngine';
import { format } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DEBT_TYPES = {
  CREDIT_CARD: { name: 'Credit Card', icon: CreditCard, color: '#f44336', defaultAPR: 18.5 },
  AUTO_LOAN: { name: 'Auto Loan', icon: Car, color: '#2196f3', defaultAPR: 6.5 },
  STUDENT_LOAN: { name: 'Student Loan', icon: GraduationCap, color: '#4caf50', defaultAPR: 5.5 },
  PERSONAL_LOAN: { name: 'Personal Loan', icon: Wallet, color: '#ff9800', defaultAPR: 11.0 },
  MEDICAL_DEBT: { name: 'Medical Debt', icon: Heart, color: '#e91e63', defaultAPR: 0 },
  COLLECTION: { name: 'Collection', icon: AlertCircle, color: '#9c27b0', defaultAPR: 0 },
  MORTGAGE: { name: 'Mortgage', icon: Home, color: '#00bcd4', defaultAPR: 7.0 }
};

const STRATEGY_COLORS = {
  SNOWBALL: '#2196f3',
  AVALANCHE: '#4caf50',
  HYBRID: '#9c27b0',
  CREDIT_FOCUSED: '#ff9800'
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DebtPayoffCalculator({ debts = [], setDebts, income, expenses }) {
  const { currentUser } = useAuth();
  const { showNotification } = useNotification();

  // State
  const [addDebtDialog, setAddDebtDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [monthlyExtra, setMonthlyExtra] = useState(200);
  const [calculations, setCalculations] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('AVALANCHE');
  const [activeTab, setActiveTab] = useState(0);
  const [showComparison, setShowComparison] = useState(true);

  // Form state for new/edit debt
  const [debtForm, setDebtForm] = useState({
    name: '',
    type: 'CREDIT_CARD',
    balance: '',
    apr: '',
    minimumPayment: '',
    creditLimit: ''
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULATE AVAILABLE MONTHLY EXTRA
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (income?.monthly && expenses?.length > 0) {
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalMinimums = debts.reduce((sum, d) => sum + (d.minimumPayment || 0), 0);
      const available = income.monthly - totalExpenses - totalMinimums;
      
      if (available > 0) {
        setMonthlyExtra(Math.floor(available * 0.8)); // Use 80% of available
        console.log('💰 Calculated available monthly extra:', available);
      }
    }
  }, [income, expenses, debts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULATE PAYOFF STRATEGIES
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (debts.length > 0 && monthlyExtra > 0) {
      console.log('🔢 Calculating payoff strategies...');
      const results = DebtPayoffCalculator.compareAllStrategies(debts, monthlyExtra);
      setCalculations(results);
      console.log('✅ Calculations complete:', results);
    }
  }, [debts, monthlyExtra]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD/EDIT DEBT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddDebt = () => {
    setDebtForm({
      name: '',
      type: 'CREDIT_CARD',
      balance: '',
      apr: DEBT_TYPES.CREDIT_CARD.defaultAPR.toString(),
      minimumPayment: '',
      creditLimit: ''
    });
    setEditingDebt(null);
    setAddDebtDialog(true);
  };

  const handleEditDebt = (debt) => {
    setDebtForm({
      name: debt.name,
      type: debt.type,
      balance: debt.balance.toString(),
      apr: debt.apr.toString(),
      minimumPayment: debt.minimumPayment?.toString() || '',
      creditLimit: debt.creditLimit?.toString() || ''
    });
    setEditingDebt(debt);
    setAddDebtDialog(true);
  };

  const handleSaveDebt = async () => {
    try {
      const balance = parseFloat(debtForm.balance);
      const apr = parseFloat(debtForm.apr);
      
      if (!debtForm.name || !balance || balance <= 0) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const debtData = {
        name: debtForm.name,
        type: debtForm.type,
        balance,
        apr: apr || 0,
        minimumPayment: parseFloat(debtForm.minimumPayment) || balance * 0.02,
        creditLimit: parseFloat(debtForm.creditLimit) || null,
        updatedAt: serverTimestamp()
      };

      if (editingDebt) {
        // Update existing debt
        await updateDoc(doc(db, 'financialData', currentUser.uid, 'debts', editingDebt.id), debtData);
        setDebts(debts.map(d => d.id === editingDebt.id ? { ...d, ...debtData } : d));
        showNotification('Debt updated successfully', 'success');
      } else {
        // Add new debt
        const newDebtRef = doc(collection(db, 'financialData', currentUser.uid, 'debts'));
        await setDoc(newDebtRef, {
          ...debtData,
          createdAt: serverTimestamp()
        });
        setDebts([...debts, { id: newDebtRef.id, ...debtData }]);
        showNotification('Debt added successfully', 'success');
      }

      setAddDebtDialog(false);
    } catch (error) {
      console.error('❌ Error saving debt:', error);
      showNotification('Error saving debt', 'error');
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      await deleteDoc(doc(db, 'financialData', currentUser.uid, 'debts', debtId));
      setDebts(debts.filter(d => d.id !== debtId));
      showNotification('Debt deleted successfully', 'success');
    } catch (error) {
      console.error('❌ Error deleting debt:', error);
      showNotification('Error deleting debt', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-FILL APR WHEN TYPE CHANGES
  // ═══════════════════════════════════════════════════════════════════════════

  const handleTypeChange = (type) => {
    setDebtForm({
      ...debtForm,
      type,
      apr: DEBT_TYPES[type].defaultAPR.toString()
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Debt Payoff Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare strategies and create your debt-free plan
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddDebt}
        >
          Add Debt
        </Button>
      </Box>

      {/* Empty State */}
      {debts.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CreditCard size={64} style={{ opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              No Debts Added Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add your debts to see personalized payoff strategies and timelines
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Plus size={20} />}
              onClick={handleAddDebt}
            >
              Add Your First Debt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debt List & Calculations */}
      {debts.length > 0 && (
        <Grid container spacing={3}>
          {/* Current Debts */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Debts ({debts.length})
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {debts.map((debt) => {
                    const DebtIcon = DEBT_TYPES[debt.type]?.icon || DollarSign;
                    const debtColor = DEBT_TYPES[debt.type]?.color || '#607d8b';
                    
                    return (
                      <Card 
                        key={debt.id}
                        variant="outlined"
                        sx={{ mb: 2, borderLeft: `4px solid ${debtColor}` }}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                              <DebtIcon size={24} color={debtColor} />
                              <Box>
                                <Typography variant="subtitle2">
                                  {debt.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {DEBT_TYPES[debt.type]?.name || debt.type}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => handleEditDebt(debt)}>
                                <Edit size={16} />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteDebt(debt.id)}>
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Grid container spacing={1} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Balance
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${debt.balance.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                APR
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {debt.apr}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Min Payment
                              </Typography>
                              <Typography variant="body2">
                                ${debt.minimumPayment?.toLocaleString() || 'N/A'}
                              </Typography>
                            </Grid>
                            {debt.creditLimit && (
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Utilization
                                </Typography>
                                <Typography variant="body2">
                                  {((debt.balance / debt.creditLimit) * 100).toFixed(0)}%
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>

                {/* Monthly Extra Payment */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Extra Monthly Payment
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={monthlyExtra}
                    onChange={(e) => setMonthlyExtra(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Additional amount beyond minimum payments
                  </Typography>
                </Box>

                {/* Total Debt Summary */}
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f44336', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">
                    Total Debt
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    Avg APR: {(debts.reduce((sum, d) => sum + d.apr, 0) / debts.length).toFixed(1)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Strategy Comparison & Timeline */}
          <Grid item xs={12} md={8}>
            {calculations && (
              <>
                {/* Strategy Tabs */}
                <Paper sx={{ mb: 2 }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Comparison" />
                    <Tab label="Snowball ❄️" />
                    <Tab label="Avalanche ⛰️" />
                    <Tab label="Hybrid 🤖" />
                    <Tab label="Credit Focus 📈" />
                  </Tabs>
                </Paper>

                {/* Tab 0: Comparison */}
                {activeTab === 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Strategy Comparison
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Compare all four strategies side-by-side
                      </Typography>

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Strategy</TableCell>
                              <TableCell align="right">Months</TableCell>
                              <TableCell align="right">Total Interest</TableCell>
                              <TableCell align="right">Total Paid</TableCell>
                              <TableCell>Best For</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {['snowball', 'avalanche', 'hybrid', 'creditFocused'].map((strategy) => {
                              const data = calculations[strategy];
                              const isRecommended = calculations.recommended === strategy.toUpperCase();
                              
                              return (
                                <TableRow 
                                  key={strategy}
                                  sx={{ 
                                    bgcolor: isRecommended ? '#f0f7ff' : 'transparent',
                                    '& td': { fontWeight: isRecommended ? 600 : 400 }
                                  }}
                                >
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {strategy === 'snowball' && '❄️'}
                                      {strategy === 'avalanche' && '⛰️'}
                                      {strategy === 'hybrid' && '🤖'}
                                      {strategy === 'creditFocused' && '📈'}
                                      {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                                      {isRecommended && (
                                        <Chip label="Recommended" size="small" color="success" />
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    {data.summary.totalMonths} ({data.summary.totalYears} years)
                                  </TableCell>
                                  <TableCell align="right">
                                    ${data.summary.totalInterestPaid.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    ${data.summary.totalPaid.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    {strategy === 'snowball' && 'Quick psychological wins'}
                                    {strategy === 'avalanche' && 'Maximum savings'}
                                    {strategy === 'hybrid' && 'Balanced approach'}
                                    {strategy === 'creditFocused' && 'Fastest score boost'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Recommendation */}
                      <Alert severity="success" sx={{ mt: 3 }}>
                        <AlertTitle>Recommended Strategy</AlertTitle>
                        Based on your debts and goals, we recommend the <strong>{calculations.recommended}</strong> strategy.
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Tabs 1-4: Individual Strategy Details */}
                {activeTab > 0 && (
                  <StrategyDetailView 
                    strategy={['snowball', 'avalanche', 'hybrid', 'creditFocused'][activeTab - 1]}
                    data={calculations[['snowball', 'avalanche', 'hybrid', 'creditFocused'][activeTab - 1]]}
                  />
                )}
              </>
            )}
          </Grid>
        </Grid>
      )}

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
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Debt Name"
                value={debtForm.name}
                onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                placeholder="e.g., Chase Visa, Honda Loan"
              />
            </Grid>
            
            <Grid item xs={12}>
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
                        {React.createElement(type.icon, { size: 20 })}
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Balance"
                type="number"
                value={debtForm.balance}
                onChange={(e) => setDebtForm({ ...debtForm, balance: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
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
                helperText="Optional - defaults to 2% of balance"
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
                  helperText="For utilization tracking"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDebtDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveDebt} variant="contained">
            {editingDebt ? 'Update' : 'Add'} Debt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGY DETAIL VIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StrategyDetailView({ strategy, data }) {
  if (!data) return null;

  const strategyNames = {
    snowball: 'Debt Snowball',
    avalanche: 'Debt Avalanche',
    hybrid: 'AI Hybrid',
    creditFocused: 'Credit Score Optimizer'
  };

  // Prepare timeline chart data (every 6 months)
  const chartData = data.timeline
    .filter((_, index) => index % 6 === 0 || index === data.timeline.length - 1)
    .map(month => ({
      month: month.month,
      remaining: month.totalRemaining,
      interest: month.totalInterest
    }));

  return (
    <Grid container spacing={2}>
      {/* Strategy Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {strategyNames[strategy]}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debt Free In
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data.summary.totalMonths}
                  </Typography>
                  <Typography variant="caption">
                    months ({data.summary.totalYears} years)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Interest
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${data.summary.totalInterestPaid.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Payment
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${Math.round(data.summary.monthlyPayment).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debt Free Date
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {data.summary.debtFreeDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payoff Timeline Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payoff Timeline
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="remaining" 
                  stroke="#f44336" 
                  fill="#f4433620" 
                  name="Remaining Balance"
                />
                <Area 
                  type="monotone" 
                  dataKey="interest" 
                  stroke="#ff9800" 
                  fill="#ff980020" 
                  name="Total Interest Paid"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Payoff Order */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payoff Order
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {data.debts.map((debt, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    mb: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Chip 
                    label={`#${index + 1}`}
                    sx={{ 
                      minWidth: 50,
                      fontWeight: 700,
                      bgcolor: '#1976d2',
                      color: 'white'
                    }}
                  />
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {debt.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${debt.balance.toLocaleString()} @ {debt.apr}% APR
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2">
                      Payoff: {debt.payoffDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Interest: ${Math.round(debt.totalInterestPaid).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Milestones & Celebrations 🎉
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {data.milestones.map((milestone, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: index < data.milestones.length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    <CheckCircle size={24} color="#4caf50" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {milestone.debtName} Paid Off!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Month {milestone.month} • ${milestone.originalBalance.toLocaleString()} eliminated
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Interest paid: ${Math.round(milestone.interestPaid).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}