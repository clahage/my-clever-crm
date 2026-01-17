// src/components/TermsAgreement.jsx
// ============================================================================
// TERMS AGREEMENT COMPONENT
// ============================================================================
// Displays and captures acceptance of service terms
// Must be accepted before enrollment completion
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
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Warning,
  Gavel
} from '@mui/icons-material';

import { getPlanById } from '../constants/servicePlans';

const TermsAgreement = ({ planId, onAccept, onDecline }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToMinimumTerm, setAgreedToMinimumTerm] = useState(false);
  const [agreedToSetupFee, setAgreedToSetupFee] = useState(false);
  const [agreedToPostCancel, setAgreedToPostCancel] = useState(false);
  const [error, setError] = useState('');

  const plan = getPlanById(planId);

  if (!plan) {
    return (
      <Alert severity="error">
        Invalid service plan selected. Please go back and select a plan.
      </Alert>
    );
  }

  const handleAccept = () => {
    // Validate all required agreements
    if (!agreedToTerms) {
      setError('You must agree to the general terms and conditions');
      return;
    }

    if (plan.hasMinimumTerm && !agreedToMinimumTerm) {
      setError(`You must acknowledge the ${plan.minimumTermDisplay} minimum term`);
      return;
    }

    if (plan.setupFee > 0 && !agreedToSetupFee) {
      setError(`You must acknowledge the ${plan.setupFeeDisplay} setup fee`);
      return;
    }

    if (plan.postCancellationAccessDays > 0 && !agreedToPostCancel) {
      setError(`You must acknowledge the ${plan.postCancellationAccessDays}-day post-cancellation period`);
      return;
    }

    // All agreements accepted
    setError('');
    onAccept({
      planId: plan.id,
      agreedToTerms: true,
      agreedAt: new Date().toISOString(),
      ipAddress: 'captured-by-server', // Server will capture actual IP
      agreements: {
        generalTerms: agreedToTerms,
        minimumTerm: plan.hasMinimumTerm ? agreedToMinimumTerm : null,
        setupFee: plan.setupFee > 0 ? agreedToSetupFee : null,
        postCancelAccess: plan.postCancellationAccessDays > 0 ? agreedToPostCancel : null
      }
    });
  };

  const allRequiredAgreed = () => {
    let required = agreedToTerms;
    if (plan.hasMinimumTerm) required = required && agreedToMinimumTerm;
    if (plan.setupFee > 0) required = required && agreedToSetupFee;
    if (plan.postCancellationAccessDays > 0) required = required && agreedToPostCancel;
    return required;
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Gavel fontSize="large" color="primary" />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {plan.name} Plan - Terms & Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review and accept the following terms
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Plan Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 1, border: '1px solid', borderColor: 'primary.light' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Selected Plan: {plan.name}
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={`Monthly: ${plan.priceDisplay}`}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          {plan.perDeleteFee > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Per Deletion: ${plan.perDeleteDisplay}`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          )}
          {plan.setupFee > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Warning color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Setup Fee: ${plan.setupFeeDisplay} (non-refundable)`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
              />
            </ListItem>
          )}
          {plan.hasMinimumTerm && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Warning color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Minimum Term: ${plan.minimumTermDisplay}`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
              />
            </ListItem>
          )}
          {plan.postCancellationAccessDays > 0 && (
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Warning color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={`Post-Cancel: ${plan.postCancellationAccessDays} days access required`}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
              />
            </ListItem>
          )}
        </List>
      </Box>

      {/* Expandable Full Terms */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2" fontWeight="bold">
            View Full Terms & Conditions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {plan.termsFull}
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Agreement Checkboxes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Required Agreements:
        </Typography>

        {/* General Terms */}
        <FormControlLabel
          control={
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I have read and agree to the general terms and conditions for the {plan.name} plan
            </Typography>
          }
          sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
        />

        {/* Minimum Term Agreement */}
        {plan.hasMinimumTerm && (
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToMinimumTerm}
                onChange={(e) => setAgreedToMinimumTerm(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  I understand and agree to the <strong>{plan.minimumTermDisplay} minimum service commitment</strong>.
                  If I cancel before {plan.minimumTermDisplay}, I will pay the remaining balance in full.
                </Typography>
                {plan.earlyTerminationExample && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Example: {plan.earlyTerminationExample}
                  </Typography>
                )}
              </Box>
            }
            sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
          />
        )}

        {/* Setup Fee Agreement */}
        {plan.setupFee > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToSetupFee}
                onChange={(e) => setAgreedToSetupFee(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  I understand the <strong>{plan.setupFeeDisplay} setup fee is NON-REFUNDABLE</strong> under all circumstances.
                </Typography>
                {plan.setupFeeIncludes && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Setup fee includes: {plan.setupFeeIncludes}
                  </Typography>
                )}
              </Box>
            }
            sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
          />
        )}

        {/* Post-Cancellation Agreement */}
        {plan.postCancellationAccessDays > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToPostCancel}
                onChange={(e) => setAgreedToPostCancel(e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  I understand I must maintain credit report access for <strong>{plan.postCancellationAccessDays} days after cancellation</strong>.
                  I will be charged {plan.perDeleteDisplay} for each item that deletes during this period.
                </Typography>
                {plan.postCancellationAccessReason && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Reason: {plan.postCancellationAccessReason}
                  </Typography>
                )}
              </Box>
            }
            sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
          />
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onDecline}
          size="large"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAccept}
          disabled={!allRequiredAgreed()}
          size="large"
          startIcon={<CheckCircle />}
        >
          I Agree - Continue to Payment
        </Button>
      </Box>

      {/* Legal Notice */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        By clicking "I Agree", you are entering into a legally binding agreement with Speedy Credit Repair Inc.
        Your IP address and timestamp will be recorded for verification purposes.
      </Typography>
    </Paper>
  );
};

export default TermsAgreement;
