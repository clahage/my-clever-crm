/**
 * DEBT PAYOFF CALCULATOR COMPONENT - MEGA AI ENTERPRISE EDITION
 *
 * Purpose:
 * Interactive UI for debt payoff calculation with multiple strategies,
 * visual timeline, comparison charts, and AI-powered recommendations.
 *
 * Features:
 * - Add/edit/remove debts with detailed information
 * - Compare 3 payoff strategies side-by-side
 * - Visual timeline with month-by-month breakdown
 * - Credit score impact projections
 * - Debt consolidation analysis
 * - Export reports and payment schedules
 * - AI-powered strategy recommendations
 *
 * Created: 2025-12-06
 * Part of: Speedy Credit Repair Financial Planning System
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingDown,
  AttachMoney,
  Calculate,
  Assessment,
  CheckCircle,
  Warning,
  CompareArrows,
  Download,
  ExpandMore,
  ExpandLess,
  Info,
  Lightbulb,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  DebtPayoffCalculator,
  CreditScoreProjector,
  DebtConsolidationAnalyzer
} from '@/lib/financialPlanningEngine';

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function DebtPayoffCalculatorComponent({ contactId, onSave }) {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const [debts, setDebts] = useState([
    {
      id: 1,
      name: 'Credit Card 1',
      balance: 5000,
      interestRate: 18.99,
      minimumPayment: 150,
      type: 'credit_card'
    },
    {
      id: 2,
      name: 'Credit Card 2',
      balance: 3000,
      interestRate: 24.99,
      minimumPayment: 100,
      type: 'credit_card'
    },
    {
      id: 3,
      name: 'Auto Loan',
      balance: 12000,
      interestRate: 6.5,
      minimumPayment: 350,
      type: 'auto_loan'
    }
  ]);

  const [monthlyBudget, setMonthlyBudget] = useState(800);
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');
  const [currentCreditScore, setCurrentCreditScore] = useState(620);
  const [totalCreditLimit, setTotalCreditLimit] = useState(15000);
  const [consolidationRate, setConsolidationRate] = useState(9.99);

  const [activeTab, setActiveTab] = useState(0);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    comparison: false,
    consolidation: false
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULATIONS (Memoized for performance)
  // ═══════════════════════════════════════════════════════════════════════════

  const payoffResult = useMemo(() => {
    if (debts.length === 0) return null;
    const calculator = new DebtPayoffCalculator(debts, monthlyBudget, selectedStrategy);
    return calculator.calculatePayoffTimeline();
  }, [debts, monthlyBudget, selectedStrategy]);

  const strategyComparison = useMemo(() => {
    if (debts.length === 0) return null;
    return DebtPayoffCalculator.compareStrategies(debts, monthlyBudget);
  }, [debts, monthlyBudget]);

  const creditScoreProjection = useMemo(() => {
    if (!payoffResult) return null;
    const creditCardDebt = debts
      .filter(d => d.type === 'credit_card')
      .reduce((sum, d) => sum + d.balance, 0);
    const utilization = (creditCardDebt / totalCreditLimit) * 100;

    const projector = new CreditScoreProjector(currentCreditScore, debts, totalCreditLimit);
    return projector.projectScoreImprovement(payoffResult.timeline);
  }, [payoffResult, currentCreditScore, debts, totalCreditLimit]);

  const consolidationAnalysis = useMemo(() => {
    if (debts.length === 0) return null;
    return DebtConsolidationAnalyzer.analyze(debts, consolidationRate);
  }, [debts, consolidationRate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBT MANAGEMENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddDebt = () => {
    setEditingDebt({
      id: Date.now(),
      name: '',
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
      type: 'credit_card'
    });
    setDebtDialogOpen(true);
  };

  const handleEditDebt = (debt) => {
    setEditingDebt({ ...debt });
    setDebtDialogOpen(true);
  };

  const handleDeleteDebt = (debtId) => {
    setDebts(debts.filter(d => d.id !== debtId));
  };

  const handleSaveDebt = () => {
    if (editingDebt) {
      const existingIndex = debts.findIndex(d => d.id === editingDebt.id);
      if (existingIndex >= 0) {
        // Update existing debt
        const updatedDebts = [...debts];
        updatedDebts[existingIndex] = editingDebt;
        setDebts(updatedDebts);
      } else {
        // Add new debt
        setDebts([...debts, editingDebt]);
      }
    }
    setDebtDialogOpen(false);
    setEditingDebt(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDebtList = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Your Debts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">APR</TableCell>
                <TableCell align="right">Min Payment</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.name}</TableCell>
                  <TableCell align="right">${debt.balance.toLocaleString()}</TableCell>
                  <TableCell align="right">{debt.interestRate}%</TableCell>
                  <TableCell align="right">${debt.minimumPayment}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={debt.type.replace('_', ' ')}
                      size="small"
                      color={debt.type === 'credit_card' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditDebt(debt)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteDebt(debt.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>TOTAL</strong></TableCell>
                <TableCell align="right">
                  <strong>${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}</strong>
                </TableCell>
                <TableCell align="right">-</TableCell>
                <TableCell align="right">
                  <strong>${debts.reduce((sum, d) => sum + d.minimumPayment, 0)}</strong>
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderPayoffSummary = () => {
    if (!payoffResult) return null;

    const { summary } = payoffResult;

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Debt-Free Date</Typography>
              <Typography variant="h5">{summary.payoffDate.toLocaleDateString()}</Typography>
              <Typography variant="body2">{summary.totalYears} years</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Total Interest</Typography>
              <Typography variant="h5">${summary.totalInterestPaid.toLocaleString()}</Typography>
              <Typography variant="body2">${summary.avgMonthlyInterest}/mo avg</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Total Paid</Typography>
              <Typography variant="h5">${summary.totalAmountPaid.toLocaleString()}</Typography>
              <Typography variant="body2">${monthlyBudget}/month</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline">Months to Freedom</Typography>
              <Typography variant="h5">{summary.totalMonths}</Typography>
              <Typography variant="body2">{summary.totalYears} years</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderAIRecommendation = () => {
    if (!strategyComparison) return null;

    const { aiRecommendation } = strategyComparison;

    return (
      <Alert
        severity="info"
        icon={<Lightbulb />}
        sx={{ mt: 2 }}
        action={
          <Chip
            label={`${aiRecommendation.confidenceScore}% Confident`}
            color="primary"
            size="small"
          />
        }
      >
        <AlertTitle>AI Recommendation: {aiRecommendation.recommended.toUpperCase()} Strategy</AlertTitle>
        {aiRecommendation.reason}
        {aiRecommendation.insights.potentialInterestSavings > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Potential Savings:</strong> ${aiRecommendation.insights.potentialInterestSavings.toLocaleString()} in interest
            {aiRecommendation.insights.potentialTimeSavings > 0 && ` and ${aiRecommendation.insights.potentialTimeSavings} months`}
          </Typography>
        )}
      </Alert>
    );
  };

  const renderStrategyComparison = () => {
    if (!strategyComparison) return null;

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
              Strategy Comparison
            </Typography>
            <IconButton onClick={() => toggleSection('comparison')}>
              {expandedSections.comparison ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.comparison}>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Strategy</TableCell>
                    <TableCell align="right">Total Interest</TableCell>
                    <TableCell align="right">Total Paid</TableCell>
                    <TableCell align="right">Months</TableCell>
                    <TableCell align="right">Payoff Date</TableCell>
                    <TableCell align="right">vs Avalanche</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {strategyComparison.comparison.map((comp) => (
                    <TableRow
                      key={comp.strategy}
                      sx={{
                        bgcolor: comp.strategy === strategyComparison.aiRecommendation.recommended
                          ? 'action.selected'
                          : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {comp.strategy.toUpperCase()}
                          {comp.strategy === strategyComparison.bestMathStrategy && (
                            <Chip label="Best Math" size="small" color="success" sx={{ ml: 1 }} />
                          )}
                          {comp.strategy === strategyComparison.aiRecommendation.recommended && (
                            <Chip label="AI Pick" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">${comp.totalInterestPaid.toLocaleString()}</TableCell>
                      <TableCell align="right">${comp.totalAmountPaid.toLocaleString()}</TableCell>
                      <TableCell align="right">{comp.totalMonths}</TableCell>
                      <TableCell align="right">{comp.payoffDate.toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        {comp.vsAvalanche.extraInterest !== 0 && (
                          <Chip
                            label={`${comp.vsAvalanche.extraInterest > 0 ? '+' : ''}$${comp.vsAvalanche.extraInterest.toLocaleString()}`}
                            size="small"
                            color={comp.vsAvalanche.extraInterest > 0 ? 'error' : 'success'}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Strategy Comparison Chart */}
            <Box sx={{ mt: 3, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategyComparison.comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strategy" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="totalInterestPaid" fill="#f5576c" name="Interest Paid" />
                  <Bar dataKey="totalMonths" fill="#667eea" name="Months" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const renderPayoffTimeline = () => {
    if (!payoffResult) return null;

    // Sample every 6 months for chart (too many data points otherwise)
    const chartData = payoffResult.timeline
      .filter((_, index) => index % 6 === 0 || index === payoffResult.timeline.length - 1)
      .map(month => ({
        month: month.month,
        date: month.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        remainingDebt: Math.round(month.remainingDebt),
        interest: Math.round(month.totalInterest),
        principal: Math.round(month.totalPrincipal)
      }));

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Debt Payoff Timeline
            </Typography>
            <IconButton onClick={() => toggleSection('timeline')}>
              {expandedSections.timeline ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.timeline}>
            <Box sx={{ mt: 2, height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="remainingDebt"
                    stackId="1"
                    stroke="#667eea"
                    fill="#667eea"
                    name="Remaining Debt"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* Monthly breakdown table (first 12 months) */}
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Payment</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payoffResult.timeline.slice(0, 12).map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>{month.month}</TableCell>
                      <TableCell align="right">${month.totalPayment.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        ${month.totalInterest.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        ${month.totalPrincipal.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">${month.remainingDebt.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {payoffResult.timeline.length > 12 && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Showing first 12 months of {payoffResult.timeline.length} total months
              </Typography>
            )}
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const renderCreditScoreProjection = () => {
    if (!creditScoreProjection) return null;

    const chartData = creditScoreProjection.projections
      .filter((_, index) => index % 6 === 0 || index === creditScoreProjection.projections.length - 1)
      .map(proj => ({
        month: proj.month,
        date: proj.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        score: proj.projectedScore
      }));

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Credit Score Projection
          </Typography>

          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Projected Improvement: +{creditScoreProjection.totalImprovement} Points</AlertTitle>
            Your credit score could improve from <strong>{currentCreditScore}</strong> to{' '}
            <strong>{creditScoreProjection.finalScore}</strong> as you pay off your debts.
          </Alert>

          <Box sx={{ height: 300, mb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[Math.floor(currentCreditScore / 50) * 50, 850]} />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#43e97b"
                  strokeWidth={2}
                  name="Projected Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {creditScoreProjection.milestones.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>Credit Score Milestones:</Typography>
              <List dense>
                {creditScoreProjection.milestones.map((milestone, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={milestone.label}
                      secondary={`Month ${milestone.monthsToReach} - ${milestone.dateReached?.toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderConsolidationAnalysis = () => {
    if (!consolidationAnalysis) return null;

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              <Calculate sx={{ mr: 1, verticalAlign: 'middle' }} />
              Debt Consolidation Analysis
            </Typography>
            <IconButton onClick={() => toggleSection('consolidation')}>
              {expandedSections.consolidation ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.consolidation}>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Consolidation Loan APR"
                type="number"
                value={consolidationRate}
                onChange={(e) => setConsolidationRate(parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                size="small"
                sx={{ mb: 2 }}
              />

              <Alert
                severity={consolidationAnalysis.recommended ? 'success' : 'warning'}
                icon={consolidationAnalysis.recommended ? <CheckCircle /> : <Warning />}
                sx={{ mb: 2 }}
              >
                <AlertTitle>{consolidationAnalysis.analysis.recommendation}</AlertTitle>
                {consolidationAnalysis.analysis.reason}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Confidence:</strong> {consolidationAnalysis.analysis.confidence}%
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Current Strategy</Typography>
                    <Typography variant="h6">${consolidationAnalysis.currentScenario.monthlyPayment}/month</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Interest: ${consolidationAnalysis.currentScenario.totalInterest.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Months: {consolidationAnalysis.currentScenario.months}
                    </Typography>
                    <Typography variant="body2">
                      Avg Rate: {consolidationAnalysis.currentScenario.avgRate}%
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: consolidationAnalysis.recommended ? 'success.light' : 'inherit',
                      borderColor: consolidationAnalysis.recommended ? 'success.main' : 'inherit'
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">Consolidation Loan</Typography>
                    <Typography variant="h6">${consolidationAnalysis.consolidationScenario.monthlyPayment}/month</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Interest: ${consolidationAnalysis.consolidationScenario.totalInterest.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Months: {consolidationAnalysis.consolidationScenario.months}
                    </Typography>
                    <Typography variant="body2">
                      Rate: {consolidationAnalysis.consolidationScenario.rate}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {consolidationAnalysis.recommended && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Consolidation Savings:</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Total Interest Savings:</strong> ${consolidationAnalysis.savings.totalInterestSavings.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Monthly Payment Savings:</strong> ${consolidationAnalysis.savings.monthlyPaymentSavings.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Time Savings:</strong> {consolidationAnalysis.savings.timeSavings} months
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Percent Savings:</strong> {consolidationAnalysis.savings.percentSavings}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DEBT DIALOG
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDebtDialog = () => (
    <Dialog open={debtDialogOpen} onClose={() => setDebtDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{editingDebt?.name ? 'Edit Debt' : 'Add New Debt'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Debt Name"
              fullWidth
              value={editingDebt?.name || ''}
              onChange={(e) => setEditingDebt({ ...editingDebt, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Current Balance"
              type="number"
              fullWidth
              value={editingDebt?.balance || 0}
              onChange={(e) => setEditingDebt({ ...editingDebt, balance: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Interest Rate (APR)"
              type="number"
              fullWidth
              value={editingDebt?.interestRate || 0}
              onChange={(e) => setEditingDebt({ ...editingDebt, interestRate: parseFloat(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Minimum Payment"
              type="number"
              fullWidth
              value={editingDebt?.minimumPayment || 0}
              onChange={(e) => setEditingDebt({ ...editingDebt, minimumPayment: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Debt Type</InputLabel>
              <Select
                value={editingDebt?.type || 'credit_card'}
                onChange={(e) => setEditingDebt({ ...editingDebt, type: e.target.value })}
                label="Debt Type"
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="personal_loan">Personal Loan</MenuItem>
                <MenuItem value="auto_loan">Auto Loan</MenuItem>
                <MenuItem value="student_loan">Student Loan</MenuItem>
                <MenuItem value="medical">Medical Debt</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDebtDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleSaveDebt} variant="contained" color="primary">
          Save Debt
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <TrendingDown sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
        AI-Powered Debt Payoff Calculator
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate your debt-free date with multiple payoff strategies, get AI-powered recommendations,
        and see how paying off debt will improve your credit score.
      </Typography>

      {/* Configuration Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Monthly Payment Budget"
            type="number"
            fullWidth
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            helperText="Total you can pay toward all debts monthly"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Payoff Strategy</InputLabel>
            <Select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              label="Payoff Strategy"
            >
              <MenuItem value="snowball">Snowball (Smallest Balance First)</MenuItem>
              <MenuItem value="avalanche">Avalanche (Highest Interest First)</MenuItem>
              <MenuItem value="hybrid">Hybrid (Balanced Approach)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Current Credit Score"
            type="number"
            fullWidth
            value={currentCreditScore}
            onChange={(e) => setCurrentCreditScore(parseInt(e.target.value))}
            helperText="For credit score projections"
          />
        </Grid>
      </Grid>

      {/* Debt List */}
      {renderDebtList()}

      {/* AI Recommendation */}
      {renderAIRecommendation()}

      {/* Payoff Summary Cards */}
      {renderPayoffSummary()}

      {/* Strategy Comparison */}
      {renderStrategyComparison()}

      {/* Payoff Timeline */}
      {renderPayoffTimeline()}

      {/* Credit Score Projection */}
      {renderCreditScoreProjection()}

      {/* Consolidation Analysis */}
      {renderConsolidationAnalysis()}

      {/* Debt Dialog */}
      {renderDebtDialog()}
    </Box>
  );
}
