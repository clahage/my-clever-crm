// ============================================================================
// Path: /src/components/contract/ACHBankingForm.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// ACH BANKING FORM — INTERACTIVE COMPONENT FOR CONTRACT SIGNING
// ============================================================================
// Replaces static HTML in ContractSigningPortal Tab 3 with live React form.
// Handles banking information collection with real-time validation.
//
// FEATURES:
//   - Live Material-UI input fields (bound to React state)
//   - Real-time validation (routing number 9 digits, required fields)
//   - Account type selection (checking/savings radio buttons)
//   - Optional deferred banking checkbox (7-day grace period)
//   - Masked account number input for security
//   - Auto-populated name from contact data
//   - Fee breakdown table based on service plan
//   - Clear NSF policy and terms display
//
// INTEGRATION:
//   - Used in ContractSigningPortal.jsx for Tab 3 (ACH Authorization)
//   - Passes banking data up via onBankingChange callback
//   - Supports deferred banking option with onDeferChange callback
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Stack,
  InputAdornment,
  FormHelperText,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle,
  Shield,
  Info,
  Lock
} from 'lucide-react';

// ============================================================================
// ===== SERVICE PLAN FEE CONFIGURATIONS =====
// Maps plan IDs to their fee structures for the fee breakdown table
// ============================================================================
const PLAN_FEES = {
  diy: {
    setupFee: 39,
    monthlyFee: 39,
    itemFee: 25,
    description: 'DIY Plan - Self-service credit repair'
  },
  standard: {
    setupFee: 99,
    monthlyFee: 149,
    itemFee: 25,
    description: 'Standard Plan - Full-service credit repair'
  },
  acceleration: {
    setupFee: 149,
    monthlyFee: 199,
    itemFee: 75,
    description: 'Acceleration Plan - Expedited service with premium items'
  },
  payForDelete: {
    setupFee: 0,
    monthlyFee: 0,
    itemFee: 75,
    description: 'Pay-For-Delete Plan - No monthly fee, per-item only'
  },
  hybrid: {
    setupFee: 49,
    monthlyFee: 99,
    itemFee: 25,
    description: 'Hybrid Plan - Balanced service and pricing'
  },
  premium: {
    setupFee: 199,
    monthlyFee: 349,
    itemFee: 75,
    description: 'Premium Plan - Comprehensive service with priority support'
  }
};

// ============================================================================
// ===== HELPER: Format currency =====
// ============================================================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// ============================================================================
// ===== MAIN COMPONENT =====
// ============================================================================
export default function ACHBankingForm({
  contact,           // Contact object with name, email, etc.
  plan,              // Plan object with id and name
  bankingInfo,       // Current banking info state from parent
  onBankingChange,   // Callback: (field, value) => void
  deferBanking,      // Boolean: is banking deferred?
  onDeferChange      // Callback: (deferred) => void
}) {
  // ============================================================================
  // ===== STATE =====
  // ============================================================================

  const [validationErrors, setValidationErrors] = useState({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // ===== Get plan fees =====
  const planFees = PLAN_FEES[plan?.id] || PLAN_FEES.standard;

  // ===== Auto-populate account holder name from contact =====
  useEffect(() => {
    if (contact && !bankingInfo.accountName) {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      if (fullName) {
        onBankingChange('accountName', fullName);
      }
    }
  }, [contact, bankingInfo.accountName, onBankingChange]);

  // ============================================================================
  // ===== VALIDATION HELPERS =====
  // ============================================================================

  const validateRoutingNumber = (value) => {
    if (!value) return 'Routing number is required';
    if (!/^\d{9}$/.test(value)) return 'Routing number must be exactly 9 digits';
    return null;
  };

  const validateAccountNumber = (value) => {
    if (!value) return 'Account number is required';
    if (!/^\d{4,17}$/.test(value)) return 'Account number must be 4-17 digits';
    return null;
  };

  const validateBankName = (value) => {
    if (!value || value.trim().length < 2) return 'Bank name is required';
    return null;
  };

  const validateAccountName = (value) => {
    if (!value || value.trim().length < 2) return 'Account holder name is required';
    return null;
  };

  // ===== Real-time validation on change =====
  const handleFieldChange = (field, value) => {
    // Update parent state
    onBankingChange(field, value);

    // Validate and update errors
    let error = null;
    switch (field) {
      case 'routingNumber':
        error = validateRoutingNumber(value);
        break;
      case 'accountNumber':
        error = validateAccountNumber(value);
        break;
      case 'bankName':
        error = validateBankName(value);
        break;
      case 'accountName':
        error = validateAccountName(value);
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // ============================================================================
  // ===== CHECK IF ALL REQUIRED FIELDS ARE VALID =====
  // ============================================================================
  const isFormValid = () => {
    if (deferBanking) return true; // Deferred banking bypasses validation

    return (
      bankingInfo.accountType &&
      bankingInfo.accountName &&
      bankingInfo.bankName &&
      bankingInfo.accountNumber &&
      bankingInfo.routingNumber &&
      !validateRoutingNumber(bankingInfo.routingNumber) &&
      !validateAccountNumber(bankingInfo.accountNumber) &&
      !validateBankName(bankingInfo.bankName) &&
      !validateAccountName(bankingInfo.accountName)
    );
  };

  // ============================================================================
  // ===== RENDER =====
  // ============================================================================

  return (
    <Box>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard size={28} color="#1976d2" />
          ACH Payment Authorization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This authorization covers all payment types for your {planFees.description}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ===== FEE BREAKDOWN TABLE ===== */}
      <Paper variant="outlined" sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info size={20} />
          Fee Structure for Your Plan
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your authorization will cover the following charges:
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Charge Type</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell><strong>Frequency</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planFees.setupFee > 0 && (
                <TableRow>
                  <TableCell>Setup Fee</TableCell>
                  <TableCell align="right">{formatCurrency(planFees.setupFee)}</TableCell>
                  <TableCell>One-time (first payment)</TableCell>
                </TableRow>
              )}
              {planFees.monthlyFee > 0 && (
                <TableRow>
                  <TableCell>Monthly Service Fee</TableCell>
                  <TableCell align="right">{formatCurrency(planFees.monthlyFee)}</TableCell>
                  <TableCell>Monthly (recurring)</TableCell>
                </TableRow>
              )}
              {planFees.itemFee > 0 && (
                <TableRow>
                  <TableCell>Per-Item Removal Fee</TableCell>
                  <TableCell align="right">{formatCurrency(planFees.itemFee)}</TableCell>
                  <TableCell>Per successful removal</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>NSF/Returned Payment Fee</TableCell>
                <TableCell align="right">{formatCurrency(25)}</TableCell>
                <TableCell>If payment fails</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ===== DEFERRED BANKING OPTION ===== */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        icon={<Info size={20} />}
      >
        <AlertTitle>Banking Information Required</AlertTitle>
        <FormControlLabel
          control={
            <Checkbox
              checked={deferBanking}
              onChange={(e) => onDeferChange(e.target.checked)}
              sx={{ mt: 1 }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight="medium">
                I need more time to provide my banking information
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You'll have <strong>7 days</strong> to submit your banking details. 
                We'll send you reminder emails with a secure link. Service will be held until 
                banking information is received.
              </Typography>
            </Box>
          }
        />
      </Alert>

      {/* ===== BANKING FORM FIELDS (hidden if deferred) ===== */}
      {!deferBanking && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Building2 size={20} />
            Bank Account Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please provide your banking details below. All information is encrypted and secure.
          </Typography>

          <Stack spacing={3}>
            {/* ===== ACCOUNT TYPE ===== */}
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <Typography variant="subtitle2" gutterBottom>
                  Account Type <span style={{ color: '#d32f2f' }}>*</span>
                </Typography>
              </FormLabel>
              <RadioGroup
                row
                value={bankingInfo.accountType || 'checking'}
                onChange={(e) => handleFieldChange('accountType', e.target.value)}
              >
                <FormControlLabel
                  value="checking"
                  control={<Radio />}
                  label="Checking Account"
                />
                <FormControlLabel
                  value="savings"
                  control={<Radio />}
                  label="Savings Account"
                />
              </RadioGroup>
            </FormControl>

            {/* ===== ACCOUNT HOLDER NAME ===== */}
            <TextField
              fullWidth
              required
              label="Account Holder Name"
              placeholder="Full name on bank account"
              value={bankingInfo.accountName || ''}
              onChange={(e) => handleFieldChange('accountName', e.target.value)}
              error={!!validationErrors.accountName}
              helperText={validationErrors.accountName || 'Must match the name on your bank account'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Shield size={18} />
                  </InputAdornment>
                )
              }}
            />

            {/* ===== BANK NAME ===== */}
            <TextField
              fullWidth
              required
              label="Bank Name"
              placeholder="e.g., Chase, Bank of America, Wells Fargo"
              value={bankingInfo.bankName || ''}
              onChange={(e) => handleFieldChange('bankName', e.target.value)}
              error={!!validationErrors.bankName}
              helperText={validationErrors.bankName || 'Enter the name of your financial institution'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Building2 size={18} />
                  </InputAdornment>
                )
              }}
            />

            {/* ===== ROUTING NUMBER ===== */}
            <TextField
              fullWidth
              required
              label="Routing Number"
              placeholder="9-digit routing number"
              value={bankingInfo.routingNumber || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                handleFieldChange('routingNumber', value);
              }}
              error={!!validationErrors.routingNumber}
              helperText={
                validationErrors.routingNumber || 
                'Find this on your check or bank statement (9 digits)'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} />
                  </InputAdornment>
                )
              }}
              inputProps={{ maxLength: 9 }}
            />

            {/* ===== ACCOUNT NUMBER ===== */}
            <TextField
              fullWidth
              required
              label="Account Number"
              placeholder="Enter your account number"
              type={showAccountNumber ? 'text' : 'password'}
              value={bankingInfo.accountNumber || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 17);
                handleFieldChange('accountNumber', value);
              }}
              error={!!validationErrors.accountNumber}
              helperText={
                validationErrors.accountNumber || 
                'Your account number (4-17 digits). Click eye icon to show/hide.'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      component="span"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showAccountNumber ? '👁️' : '👁️‍🗨️'}
                    </Box>
                  </InputAdornment>
                )
              }}
              inputProps={{ maxLength: 17 }}
            />
          </Stack>

          {/* ===== FORM STATUS INDICATOR ===== */}
          <Box sx={{ mt: 3 }}>
            {isFormValid() ? (
              <Alert severity="success" icon={<CheckCircle size={20} />}>
                <AlertTitle>Banking information complete</AlertTitle>
                All required fields are filled and valid. You may proceed to signature.
              </Alert>
            ) : (
              <Alert severity="warning" icon={<AlertCircle size={20} />}>
                <AlertTitle>Please complete all required fields</AlertTitle>
                Fill in all banking information above to enable contract submission.
              </Alert>
            )}
          </Box>
        </Paper>
      )}

      {/* ===== DEFERRED BANKING CONFIRMATION ===== */}
      {deferBanking && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Banking Information Deferred</AlertTitle>
          <Typography variant="body2" paragraph>
            You've chosen to provide banking information later. Here's what happens next:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <Typography variant="body2">
                <strong>Day 1:</strong> You'll receive an email with a secure link to submit banking details
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Day 3:</strong> Friendly reminder email
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Day 5:</strong> Urgent reminder email + SMS
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Day 7:</strong> Final notice before service hold
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Day 8:</strong> Service suspended until banking info received
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Setup Fee Payment:</strong> You may pay the setup fee via Zelle to 
            <Chip 
              label="CLahage@Gmail.com" 
              size="small" 
              sx={{ mx: 1, fontWeight: 'bold' }} 
            />
            to begin service immediately.
          </Typography>
        </Alert>
      )}

      {/* ===== LEGAL TERMS & NSF POLICY ===== */}
      <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={20} />
          Authorization Terms & NSF Policy
        </Typography>
        
        <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
          By providing your banking information and signing below, you authorize Speedy Credit Repair Inc. 
          to initiate electronic debit entries (ACH transactions) to your bank account for:
        </Typography>

        <ul style={{ marginLeft: 20, marginBottom: 16 }}>
          <li>
            <Typography variant="body2">
              <strong>Setup Fee:</strong> {formatCurrency(planFees.setupFee)} (one-time, if applicable)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Monthly Service Fee:</strong> {formatCurrency(planFees.monthlyFee)} 
              (recurring monthly, if applicable)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Per-Item Removal Fees:</strong> {formatCurrency(planFees.itemFee)} per successful 
              item removal (as applicable)
            </Typography>
          </li>
        </ul>

        <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>NSF/Returned Payment Policy:</strong> In the event that any ACH debit is returned for 
          insufficient funds (NSF) or any other reason, you agree to pay a {formatCurrency(25)} returned 
          payment fee. This fee will be added to your next scheduled payment.
        </Typography>

        <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
          <strong>Payment Retry:</strong> If a payment fails, we will retry on days 1, 4, and 7. After 
          3 failed attempts, your account will be marked past due and service may be suspended.
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
          <strong>Revocation Rights:</strong> You may revoke this authorization at any time by providing 
          written notice to Speedy Credit Repair Inc. at least 3 business days before the next scheduled 
          payment. Revocation of authorization may result in termination of services.
        </Typography>
      </Paper>

      {/* ===== VALIDATION SUMMARY FOR DEBUGGING ===== */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block">
            <strong>Debug Info:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            Form Valid: {isFormValid() ? '✅' : '❌'}
          </Typography>
          <Typography variant="caption" display="block">
            Deferred: {deferBanking ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="caption" display="block">
            Errors: {JSON.stringify(validationErrors)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}