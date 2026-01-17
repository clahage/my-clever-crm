// src/components/admin/CancellationManager.jsx
// ============================================================================
// CANCELLATION MANAGER - ADMIN TOOL
// ============================================================================
// Handles client cancellations with term enforcement
// Calculates early termination fees
// Manages post-cancellation access periods
//
// Version: 2.0 COMPLETE
// Date: January 16, 2026
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// 1995-2026 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  AlertTitle,
  Divider,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Cancel,
  Info,
  AttachMoney
} from '@mui/icons-material';

import {
  getPlanById,
  calculateEarlyTerminationFee,
  getCancellationDates
} from '../../constants/servicePlans';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate months completed since service start
 * @param {string|Date} startDate - Service start date
 * @returns {number} Months completed
 */
function calculateMonthsCompleted(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CancellationManager = ({ client, onComplete, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cancellationReason, setCancellationReason] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get plan details
  const plan = getPlanById(client?.servicePlan);
  const monthsCompleted = calculateMonthsCompleted(client?.serviceStartDate);
  const terminationFee = calculateEarlyTerminationFee(client?.servicePlan, monthsCompleted);
  const cancellationDates = getCancellationDates(client?.servicePlan, new Date());

  const steps = [
    'Review Terms',
    'Calculate Fees',
    'Confirm Cancellation',
    'Process'
  ];

  // Expected confirmation code
  const expectedCode = client ? `CANCEL ${(client.lastName || 'CLIENT').toUpperCase()}` : 'CANCEL';

  // ============================================================================
  // PROCESS CANCELLATION
  // ============================================================================

  const processCancellation = async () => {
    setLoading(true);
    setError('');

    try {
      // Update client record in Firestore
      const clientRef = doc(db, 'contacts', client.id);

      await updateDoc(clientRef, {
        status: 'cancelled',
        cancellationDate: serverTimestamp(),
        cancellationReason,
        cancellationProcessedBy: 'admin', // TODO: Get from auth context
        earlyTerminationFee: terminationFee.fee,
        totalAmountDue: terminationFee.fee,
        cancellationEffectiveDate: cancellationDates?.effectiveDate?.toISOString() || null,
        accessEndsDate: cancellationDates?.accessEndsDate?.toISOString() || null,
        finalBillingDate: cancellationDates?.finalBillingDate?.toISOString() || null,
        postCancellationAccessDays: plan?.postCancellationAccessDays || 0,
        updatedAt: serverTimestamp()
      });

      // TODO: Send cancellation email
      // TODO: Create billing record for termination fee
      // TODO: Schedule access termination
      // TODO: Notify team

      setSuccess(true);
      setActiveStep(3);

      if (onComplete) {
        onComplete({
          success: true,
          terminationFee: terminationFee.fee,
          dates: cancellationDates
        });
      }

    } catch (err) {
      console.error('Error processing cancellation:', err);
      setError('Failed to process cancellation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STEP 1: REVIEW TERMS
  // ============================================================================

  const renderReviewTerms = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Cancellation Review</AlertTitle>
        Please review the client's plan terms and cancellation implications
      </Alert>

      <Grid container spacing={3}>
        {/* Client Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Client Information
              </Typography>
              <Typography variant="h6">{client?.firstName} {client?.lastName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {client?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Service Plan: <Chip label={plan?.name || 'Unknown'} size="small" color="primary" />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Service Information
              </Typography>
              <Typography variant="body2">
                Start Date: {client?.serviceStartDate ? new Date(client.serviceStartDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2">
                Months Completed: <strong>{monthsCompleted}</strong>
              </Typography>
              <Typography variant="body2">
                Monthly Rate: <strong>{plan?.priceDisplay || 'N/A'}/mo</strong>
              </Typography>
              {plan?.setupFee > 0 && (
                <Typography variant="body2">
                  Setup Fee Paid: <strong>{plan.setupFeeDisplay}</strong>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Terms Enforcement */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Plan Terms Enforcement
              </Typography>

              {plan?.hasMinimumTerm && (
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                  <AlertTitle>Minimum Term: {plan.minimumTermDisplay}</AlertTitle>
                  {monthsCompleted < plan.minimumTermMonths ? (
                    <Typography variant="body2">
                      Client has completed {monthsCompleted} of {plan.minimumTermMonths} required months.
                      <br />
                      <strong>Early termination fee will apply.</strong>
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      Client has completed the minimum term. No early termination fee.
                    </Typography>
                  )}
                </Alert>
              )}

              {plan?.postCancellationAccessDays > 0 && (
                <Alert severity="info" icon={<Info />}>
                  <AlertTitle>{plan.postCancellationAccessDays}-Day Post-Cancellation Access</AlertTitle>
                  <Typography variant="body2">
                    Credit report access must be maintained for {plan.postCancellationAccessDays} days after cancellation.
                    Client will be charged for any deletions during this period.
                  </Typography>
                </Alert>
              )}

              {!plan?.hasMinimumTerm && !plan?.postCancellationAccessDays && (
                <Alert severity="success" icon={<CheckCircle />}>
                  <AlertTitle>No Special Terms</AlertTitle>
                  <Typography variant="body2">
                    This plan has no minimum term or special cancellation requirements.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => setActiveStep(1)}
          size="large"
        >
          Continue to Fee Calculation
        </Button>
      </Box>
    </Box>
  );

  // ============================================================================
  // STEP 2: CALCULATE FEES
  // ============================================================================

  const renderCalculateFees = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Fee Calculation</AlertTitle>
        Review the cancellation fees and important dates
      </Alert>

      <Grid container spacing={3}>
        {/* Fee Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fee Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Already Paid:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${terminationFee.alreadyPaid}
                </Typography>
              </Box>

              {terminationFee.fee > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="error">
                      Early Termination Fee:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error">
                      ${terminationFee.fee}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {terminationFee.breakdown}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Cost:
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ${terminationFee.total}
                </Typography>
              </Box>

              {terminationFee.setupFeeNote && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  Note: {terminationFee.setupFeeNote}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Important Dates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Important Dates
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {cancellationDates && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cancellation Request:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cancellationDates.requestDate.toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Service Ends:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cancellationDates.effectiveDate.toLocaleDateString()}
                    </Typography>
                    {cancellationDates.noticePeriodDays > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ({cancellationDates.noticePeriodDays}-day notice period)
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Credit Access Ends:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cancellationDates.accessEndsDate.toLocaleDateString()}
                    </Typography>
                    {cancellationDates.postCancelDays > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ({cancellationDates.postCancelDays} days post-cancellation)
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Final Billing Date:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {cancellationDates.finalBillingDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(0)}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveStep(2)}
          size="large"
        >
          Continue to Confirmation
        </Button>
      </Box>
    </Box>
  );

  // ============================================================================
  // STEP 3: CONFIRM CANCELLATION
  // ============================================================================

  const renderConfirmation = () => (
    <Box>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>Final Confirmation Required</AlertTitle>
        This action cannot be undone. Please confirm you want to proceed with cancellation.
      </Alert>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Cancellation Reason"
        value={cancellationReason}
        onChange={(e) => setCancellationReason(e.target.value)}
        placeholder="Enter reason for cancellation (required for records)"
        required
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Confirmation Code"
        value={confirmationCode}
        onChange={(e) => setConfirmationCode(e.target.value)}
        placeholder={`Type "${expectedCode}" to confirm`}
        required
        helperText={`Type "${expectedCode}" to proceed`}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(1)}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={processCancellation}
          disabled={
            !cancellationReason ||
            confirmationCode !== expectedCode ||
            loading
          }
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Cancel />}
        >
          {loading ? 'Processing...' : 'Process Cancellation'}
        </Button>
      </Box>
    </Box>
  );

  // ============================================================================
  // STEP 4: PROCESS (SUCCESS)
  // ============================================================================

  const renderProcess = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      {loading ? (
        <>
          <CircularProgress size={64} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Processing Cancellation...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we update the client record
          </Typography>
        </>
      ) : success ? (
        <>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cancellation Processed
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The client has been successfully cancelled.
          </Typography>

          {terminationFee.fee > 0 && (
            <Alert severity="warning" sx={{ mb: 3, mx: 'auto', maxWidth: 400 }}>
              <AlertTitle>Early Termination Fee Due</AlertTitle>
              <Typography variant="body2">
                Amount due: <strong>${terminationFee.fee}</strong>
              </Typography>
              <Typography variant="caption">
                {terminationFee.breakdown}
              </Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={() => onClose ? onClose() : onComplete?.({ success: true })}
            size="large"
          >
            Close
          </Button>
        </>
      ) : (
        <>
          <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Cancellation Failed
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {error || 'An error occurred while processing the cancellation.'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(2)}
            size="large"
          >
            Try Again
          </Button>
        </>
      )}
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!client) {
    return (
      <Alert severity="error">
        No client data provided. Please select a client to cancel.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Process Cancellation
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Follow the steps below to properly cancel this client's service
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderReviewTerms()}
        {activeStep === 1 && renderCalculateFees()}
        {activeStep === 2 && renderConfirmation()}
        {activeStep === 3 && renderProcess()}
      </Paper>
    </Box>
  );
};

export default CancellationManager;
