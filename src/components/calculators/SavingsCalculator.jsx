// Path: src/components/calculators/SavingsCalculator.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAVINGS CALCULATOR - "See How Much You Could Save"
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Prospect-friendly calculator showing potential savings from credit improvement
 * Covers: Mortgages, Auto Loans, Credit Cards, Rental Applications, Employment
 * 
 * @version 1.0.0
 * @date February 2026
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Slider, Grid, Card, CardContent,
  Tabs, Tab, Divider, Chip, Stack, Avatar, Alert,
  Table, TableBody, TableRow, TableCell, IconButton,
  LinearProgress, Tooltip
} from '@mui/material';
import {
  Home, Car, CreditCard, Building, Briefcase, TrendingUp,
  DollarSign, Calculator, Sparkles, X, ChevronRight,
  Award, CheckCircle, AlertTriangle, Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// INTEREST RATE DATA BY SCORE RANGE
// ═══════════════════════════════════════════════════════════════════════════

const MORTGAGE_RATES = {
  // Score Range: APR for 30-year fixed
  '300-579': 10.5,
  '580-619': 8.5,
  '620-659': 7.2,
  '660-699': 6.5,
  '700-739': 6.0,
  '740-799': 5.5,
  '800-850': 5.25
};

const AUTO_RATES = {
  // Score Range: APR for new car 60-month
  '300-579': 18.5,
  '580-619': 15.0,
  '620-659': 11.5,
  '660-699': 8.5,
  '700-739': 6.0,
  '740-799': 4.5,
  '800-850': 3.5
};

const CREDIT_CARD_RATES = {
  // Score Range: Typical APR
  '300-579': 29.99,
  '580-619': 26.99,
  '620-659': 24.99,
  '660-699': 21.99,
  '700-739': 18.99,
  '740-799': 15.99,
  '800-850': 12.99
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getScoreRange = (score) => {
  if (score < 580) return '300-579';
  if (score < 620) return '580-619';
  if (score < 660) return '620-659';
  if (score < 700) return '660-699';
  if (score < 740) return '700-739';
  if (score < 800) return '740-799';
  return '800-850';
};

const getScoreCategory = (score) => {
  if (score < 580) return { label: 'Very Poor', color: 'error' };
  if (score < 670) return { label: 'Fair', color: 'warning' };
  if (score < 740) return { label: 'Good', color: 'info' };
  if (score < 800) return { label: 'Very Good', color: 'success' };
  return { label: 'Exceptional', color: 'success' };
};

const calculateMonthlyPayment = (principal, annualRate, months) => {
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ═══════════════════════════════════════════════════════════════════════════

const TabPanel = ({ children, value, index, ...other }) => (
  <div hidden={value !== index} {...other}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const SavingsCalculator = ({ 
  open, 
  onClose, 
  currentScore = 580,
  projectedIncrease = 100 
}) => {
  // ═════════════════════════════════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  const [activeTab, setActiveTab] = useState(0);
  const [scoreSlider, setScoreSlider] = useState(currentScore);
  const [targetScore, setTargetScore] = useState(Math.min(currentScore + projectedIncrease, 850));
  
  // Loan amounts for calculations
  const [mortgageAmount, setMortgageAmount] = useState(300000);
  const [autoAmount, setAutoAmount] = useState(35000);
  const [creditCardBalance, setCreditCardBalance] = useState(5000);
  
  // ═════════════════════════════════════════════════════════════════════════
  // CALCULATIONS
  // ═════════════════════════════════════════════════════════════════════════
  
  const calculations = useMemo(() => {
    const currentRange = getScoreRange(scoreSlider);
    const targetRange = getScoreRange(targetScore);
    
    // Mortgage Savings (30-year)
    const currentMortgageRate = MORTGAGE_RATES[currentRange];
    const targetMortgageRate = MORTGAGE_RATES[targetRange];
    const currentMortgagePayment = calculateMonthlyPayment(mortgageAmount, currentMortgageRate, 360);
    const targetMortgagePayment = calculateMonthlyPayment(mortgageAmount, targetMortgageRate, 360);
    const mortgageMonthly = currentMortgagePayment - targetMortgagePayment;
    const mortgageTotal = mortgageMonthly * 360;
    
    // Auto Loan Savings (60-month)
    const currentAutoRate = AUTO_RATES[currentRange];
    const targetAutoRate = AUTO_RATES[targetRange];
    const currentAutoPayment = calculateMonthlyPayment(autoAmount, currentAutoRate, 60);
    const targetAutoPayment = calculateMonthlyPayment(autoAmount, targetAutoRate, 60);
    const autoMonthly = currentAutoPayment - targetAutoPayment;
    const autoTotal = autoMonthly * 60;
    
    // Credit Card Savings (assuming minimum payments on balance)
    const currentCCRate = CREDIT_CARD_RATES[currentRange];
    const targetCCRate = CREDIT_CARD_RATES[targetRange];
    const currentCCInterest = creditCardBalance * (currentCCRate / 100);
    const targetCCInterest = creditCardBalance * (targetCCRate / 100);
    const ccAnnualSavings = currentCCInterest - targetCCInterest;
    
    return {
      mortgage: {
        currentRate: currentMortgageRate,
        targetRate: targetMortgageRate,
        monthlyPaymentCurrent: currentMortgagePayment,
        monthlyPaymentTarget: targetMortgagePayment,
        monthlySavings: mortgageMonthly,
        totalSavings: mortgageTotal
      },
      auto: {
        currentRate: currentAutoRate,
        targetRate: targetAutoRate,
        monthlyPaymentCurrent: currentAutoPayment,
        monthlyPaymentTarget: targetAutoPayment,
        monthlySavings: autoMonthly,
        totalSavings: autoTotal
      },
      creditCard: {
        currentRate: currentCCRate,
        targetRate: targetCCRate,
        annualSavings: ccAnnualSavings
      },
      totalLifetimeSavings: mortgageTotal + autoTotal + (ccAnnualSavings * 5)
    };
  }, [scoreSlider, targetScore, mortgageAmount, autoAmount, creditCardBalance]);
  
  const currentCategory = getScoreCategory(scoreSlider);
  const targetCategory = getScoreCategory(targetScore);
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Calculator size={24} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              See How Much You Could Save
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Better credit = Lower rates = More money in your pocket
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SCORE COMPARISON HEADER */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={3} alignItems="center">
            {/* Current Score */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Your Current Score
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color={`${currentCategory.color}.main`}>
                    {scoreSlider}
                  </Typography>
                  <Chip 
                    label={currentCategory.label} 
                    color={currentCategory.color}
                    size="small"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Slider
                      value={scoreSlider}
                      onChange={(e, v) => setScoreSlider(v)}
                      min={300}
                      max={850}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ width: '80%' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Arrow */}
            <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 1 
              }}>
                <TrendingUp size={32} color="#22c55e" />
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  +{targetScore - scoreSlider} points
                </Typography>
              </Box>
            </Grid>
            
            {/* Target Score */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ borderColor: 'success.main', borderWidth: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Your Target Score
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color={`${targetCategory.color}.main`}>
                    {targetScore}
                  </Typography>
                  <Chip 
                    label={targetCategory.label} 
                    color={targetCategory.color}
                    size="small"
                    icon={<Sparkles size={14} />}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Slider
                      value={targetScore}
                      onChange={(e, v) => setTargetScore(v)}
                      min={scoreSlider}
                      max={850}
                      step={1}
                      valueLabelDisplay="auto"
                      color="success"
                      sx={{ width: '80%' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Total Savings Banner */}
          <Card sx={{ 
            mt: 3, 
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="overline">
                Potential Lifetime Savings
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(calculations.totalLifetimeSavings)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                On mortgage, auto loans, and credit cards combined
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SAVINGS TABS */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            variant="fullWidth"
          >
            <Tab icon={<Home size={18} />} label="Mortgage" />
            <Tab icon={<Car size={18} />} label="Auto Loan" />
            <Tab icon={<CreditCard size={18} />} label="Credit Cards" />
            <Tab icon={<Building size={18} />} label="Rentals" />
            <Tab icon={<Briefcase size={18} />} label="Employment" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 0: MORTGAGE */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom>
              🏠 Mortgage Savings on a {formatCurrency(mortgageAmount)} Home
            </Typography>
            
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Interest Rate (Current)</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {calculations.mortgage.currentRate}% APR
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Interest Rate (After Improvement)</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {calculations.mortgage.targetRate}% APR
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Payment (Current)</TableCell>
                  <TableCell align="right">
                    {formatCurrency(calculations.mortgage.monthlyPaymentCurrent)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Payment (After)</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(calculations.mortgage.monthlyPaymentTarget)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Monthly Savings</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatCurrency(calculations.mortgage.monthlySavings)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    30-Year Total Savings
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {formatCurrency(calculations.mortgage.totalSavings)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <Alert severity="success" sx={{ mt: 2 }}>
              <strong>That's {formatCurrency(calculations.mortgage.monthlySavings)} more in your pocket every month!</strong>
              <br />
              Over the life of your mortgage, you could save enough to buy a car, fund college, or take dream vacations!
            </Alert>
          </TabPanel>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: AUTO LOAN */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              🚗 Auto Loan Savings on a {formatCurrency(autoAmount)} Vehicle
            </Typography>
            
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Interest Rate (Current)</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {calculations.auto.currentRate}% APR
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Interest Rate (After Improvement)</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {calculations.auto.targetRate}% APR
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Payment (Current)</TableCell>
                  <TableCell align="right">
                    {formatCurrency(calculations.auto.monthlyPaymentCurrent)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Payment (After)</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(calculations.auto.monthlyPaymentTarget)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Monthly Savings</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatCurrency(calculations.auto.monthlySavings)}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    5-Year Loan Total Savings
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {formatCurrency(calculations.auto.totalSavings)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Pro Tip from Chris:</strong> As a Finance Director at one of Toyota's top franchises, 
              I see this every day - buyers with better credit scores get approved for better rates, 
              lower payments, AND more vehicle options. A 100-point improvement can mean the 
              difference between "approved" and "declined" for your dream car!
            </Alert>
          </TabPanel>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CREDIT CARDS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              💳 Credit Card Benefits
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Credit Card APR
                    </Typography>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {calculations.creditCard.currentRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      After Score Improvement
                    </Typography>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {calculations.creditCard.targetRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                With a higher credit score, you'll also get:
              </Typography>
              <Stack spacing={1}>
                <Chip icon={<CheckCircle size={16} />} label="Higher approval rates for new cards" color="success" variant="outlined" />
                <Chip icon={<CheckCircle size={16} />} label="Better rewards cards (cash back, travel points)" color="success" variant="outlined" />
                <Chip icon={<CheckCircle size={16} />} label="Higher credit limits" color="success" variant="outlined" />
                <Chip icon={<CheckCircle size={16} />} label="0% APR introductory offers" color="success" variant="outlined" />
                <Chip icon={<CheckCircle size={16} />} label="Balance transfer opportunities" color="success" variant="outlined" />
              </Stack>
            </Box>
            
            <Alert severity="success" sx={{ mt: 2 }}>
              Annual interest savings on a ${creditCardBalance.toLocaleString()} balance: 
              <strong> {formatCurrency(calculations.creditCard.annualSavings)}</strong>
            </Alert>
          </TabPanel>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: RENTALS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom>
              🏢 Rental Application Advantages
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>Did you know?</strong> 90% of landlords check credit scores before approving tenants.
              A low score can mean being denied the apartment you want - or paying extra security deposits.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'error.50', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      With Lower Score ({scoreSlider})
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Typography variant="body2">❌ May be denied for preferred apartments</Typography>
                      <Typography variant="body2">❌ Requires larger security deposits (2-3 months)</Typography>
                      <Typography variant="body2">❌ May need a co-signer</Typography>
                      <Typography variant="body2">❌ Limited to less desirable areas</Typography>
                      <Typography variant="body2">❌ Higher rent prices offered</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'success.50', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      <CheckCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      With Higher Score ({targetScore})
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      <Typography variant="body2">✅ First choice of apartments</Typography>
                      <Typography variant="body2">✅ Standard security deposit (1 month)</Typography>
                      <Typography variant="body2">✅ No co-signer needed</Typography>
                      <Typography variant="body2">✅ Live in the neighborhood you want</Typography>
                      <Typography variant="body2">✅ Negotiating power on rent</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Alert severity="success" sx={{ mt: 3 }}>
              <strong>Beat out other applicants!</strong> When multiple people apply for the same 
              rental, the person with the better credit score usually wins.
            </Alert>
          </TabPanel>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: EMPLOYMENT */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom>
              💼 Employment & Career Opportunities
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Important:</strong> Many employers check credit reports as part of the hiring process, 
              especially for positions involving finances, security clearance, or management responsibilities.
            </Alert>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Industries That Commonly Check Credit:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { icon: '🏦', label: 'Banking & Finance' },
                { icon: '🛡️', label: 'Security & Law Enforcement' },
                { icon: '🏛️', label: 'Government & Military' },
                { icon: '💼', label: 'Management Positions' },
                { icon: '🏥', label: 'Healthcare Administration' },
                { icon: '🔑', label: 'Property Management' },
                { icon: '💰', label: 'Accounting & Bookkeeping' },
                { icon: '🎰', label: 'Gaming & Casinos' }
              ].map(item => (
                <Grid item xs={6} md={3} key={item.label}>
                  <Card variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5">{item.icon}</Typography>
                    <Typography variant="caption">{item.label}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              What Employers Look For:
            </Typography>
            
            <Stack spacing={1}>
              <Typography variant="body2">
                • <strong>Responsibility Level:</strong> How you manage your finances reflects how you might manage company resources
              </Typography>
              <Typography variant="body2">
                • <strong>Trustworthiness:</strong> Financial stability is often correlated with reliability
              </Typography>
              <Typography variant="body2">
                • <strong>Security Risk:</strong> High debt or financial distress could indicate vulnerability to bribery or theft
              </Typography>
              <Typography variant="body2">
                • <strong>Judgment:</strong> Financial decisions reflect overall decision-making abilities
              </Typography>
            </Stack>
            
            <Alert severity="success" sx={{ mt: 3 }}>
              <strong>Don't let your credit hold you back!</strong> Improving your score opens doors 
              to better career opportunities and higher salaries.
            </Alert>
          </TabPanel>
        </Box>
      </DialogContent>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ready to start saving? Let's improve your credit score together.
          </Typography>
        </Box>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="success"
          endIcon={<ChevronRight size={18} />}
          onClick={onClose}
        >
          See My Plan Options
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsCalculator;