// src/components/ServicePlanSelector.jsx
// ============================================================================
// SERVICE PLAN SELECTOR - WITH TERMS ENFORCEMENT
// ============================================================================
// Displays 4 service plans with complete terms and conditions
// Shows setup fees, minimum terms, early termination fees
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
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Info,
  Gavel,
  AccessTime,
  AttachMoney
} from '@mui/icons-material';

import {
  SERVICE_PLANS,
  getPlansForDisplay,
  calculateEarlyTerminationFee
} from '../constants/servicePlans';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ServicePlanSelector = ({
  selectedPlan,
  onSelectPlan,
  showTermsDialog = true,
  layout = 'grid',
  variant = 'detailed'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const plans = getPlansForDisplay();

  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [selectedPlanForTerms, setSelectedPlanForTerms] = useState(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePlanSelect = (planId) => {
    const plan = plans.find(p => p.id === planId);

    if (showTermsDialog && (plan.hasMinimumTerm || plan.setupFee > 0 || plan.postCancellationAccessDays > 0)) {
      // Show terms dialog for plans with special conditions
      setSelectedPlanForTerms(plan);
      setTermsDialogOpen(true);
    } else {
      // Simple plan, select immediately
      onSelectPlan(planId);
    }
  };

  const handleAcceptTerms = () => {
    if (selectedPlanForTerms) {
      onSelectPlan(selectedPlanForTerms.id);
      setTermsDialogOpen(false);
      setSelectedPlanForTerms(null);
    }
  };

  // ============================================================================
  // RENDER PLAN CARD
  // ============================================================================

  const renderPlanCard = (plan) => {
    const isSelected = selectedPlan === plan.id;
    const isPopular = plan.popular;
    const hasSpecialTerms = plan.hasMinimumTerm || plan.setupFee > 0 || plan.postCancellationAccessDays > 0;

    return (
      <Card
        key={plan.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: 2,
          borderColor: isSelected
            ? 'primary.main'
            : isPopular
            ? 'primary.light'
            : 'divider',
          bgcolor: isSelected ? 'action.selected' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
        onClick={() => handlePlanSelect(plan.id)}
      >
        {/* Badge */}
        {plan.badge && (
          <Chip
            label={plan.badge}
            color={plan.badgeColor}
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              right: 16,
              fontWeight: 'bold',
              fontSize: '0.7rem',
              px: 1
            }}
          />
        )}

        <CardContent sx={{ flexGrow: 1, pt: plan.badge ? 3 : 2 }}>
          {/* Plan Name */}
          <Typography
            variant="h5"
            component="h3"
            gutterBottom
            fontWeight="bold"
            color={isPopular ? 'primary' : 'text.primary'}
          >
            {plan.name}
          </Typography>

          {/* Tagline */}
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            {plan.tagline}
          </Typography>

          {/* Price */}
          <Box sx={{ mb: 2 }}>
            {plan.id === 'pay-for-delete' ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                  <Typography variant="h3" component="span" fontWeight="bold">
                    $0
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                    /mo
                  </Typography>
                </Box>
                <Typography variant="body2" color="primary.main" fontWeight="medium">
                  + $149 per deletion
                </Typography>
                <Chip
                  label={`${plan.setupFeeDisplay} setup`}
                  size="small"
                  color="warning"
                  sx={{ mt: 1 }}
                />
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h3" component="span" fontWeight="bold">
                    {plan.priceDisplay}
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                    /mo
                  </Typography>
                </Box>
                {plan.setupFee > 0 && (
                  <Chip
                    label={`+ ${plan.setupFeeDisplay} setup`}
                    size="small"
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                )}
              </>
            )}
          </Box>

          {/* Special Terms Alert */}
          {hasSpecialTerms && (
            <Alert severity="info" icon={<Info fontSize="small" />} sx={{ mb: 2, py: 0.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {plan.hasMinimumTerm && (
                  <Typography variant="caption">
                    <strong>{plan.minimumTermDisplay} minimum</strong>
                  </Typography>
                )}
                {plan.setupFee > 0 && (
                  <Typography variant="caption">
                    <strong>{plan.setupFeeDisplay} setup fee</strong>
                  </Typography>
                )}
                {plan.postCancellationAccessDays > 0 && (
                  <Typography variant="caption">
                    <strong>{plan.postCancellationAccessDays}-day post-cancel access</strong>
                  </Typography>
                )}
              </Box>
            </Alert>
          )}

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {plan.shortDescription}
          </Typography>

          {/* Features */}
          <List dense disablePadding>
            {plan.features.slice(0, 8).map((feature, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={feature}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontSize: '0.875rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Terms Highlights */}
          {hasSpecialTerms && variant === 'detailed' && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                Important Terms:
              </Typography>
              {plan.termsHighlights.map((term, index) => (
                <Typography key={index} variant="caption" display="block" color="text.secondary">
                  - {term}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant={plan.buttonVariant}
            color={isPopular ? 'primary' : 'inherit'}
            size="large"
            onClick={(e) => {
              e.stopPropagation();
              handlePlanSelect(plan.id);
            }}
            startIcon={isSelected ? <CheckCircle /> : null}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              ...(isSelected && {
                bgcolor: 'success.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'success.dark'
                }
              })
            }}
          >
            {isSelected ? 'Selected' : plan.buttonText}
          </Button>
        </CardActions>
      </Card>
    );
  };

  // ============================================================================
  // RENDER TERMS DIALOG
  // ============================================================================

  const renderTermsDialog = () => {
    if (!selectedPlanForTerms) return null;

    const plan = selectedPlanForTerms;

    return (
      <Dialog
        open={termsDialogOpen}
        onClose={() => setTermsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Gavel color="primary" />
            <Typography variant="h6" component="span">
              {plan.name} Plan - Terms & Conditions
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Setup Fee */}
          {plan.setupFee > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<AttachMoney />}>
              <AlertTitle>Setup Fee: {plan.setupFeeDisplay}</AlertTitle>
              <Typography variant="body2">
                {plan.setupFeeIncludes}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                This fee is NON-REFUNDABLE under all circumstances.
              </Typography>
            </Alert>
          )}

          {/* Minimum Term */}
          {plan.hasMinimumTerm && (
            <Alert severity="info" sx={{ mb: 3 }} icon={<AccessTime />}>
              <AlertTitle>Minimum Term: {plan.minimumTermDisplay}</AlertTitle>
              <Typography variant="body2" paragraph>
                This plan requires a {plan.minimumTermDisplay} minimum commitment.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Early Cancellation:</strong> If you cancel before {plan.minimumTermDisplay},
                you must pay the remaining balance in full.
              </Typography>
              <Typography variant="body2">
                <strong>Example:</strong> {plan.earlyTerminationExample}
              </Typography>
            </Alert>
          )}

          {/* Post-Cancellation Access */}
          {plan.postCancellationAccessDays > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
              <AlertTitle>{plan.postCancellationAccessDays}-Day Post-Cancellation Period</AlertTitle>
              <Typography variant="body2" paragraph>
                You must maintain credit report access for <strong>{plan.postCancellationAccessDays} days after cancellation</strong>.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Why?</strong> {plan.postCancellationAccessReason}
              </Typography>
              <Typography variant="body2">
                You will be charged {plan.perDeleteDisplay} for each item that deletes during this {plan.postCancellationAccessDays}-day period.
              </Typography>
            </Alert>
          )}

          {/* Attorney Review (Premium only) */}
          {plan.includesAttorneyReview && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Credit Attorney Review Included</AlertTitle>
              <Typography variant="body2" paragraph>
                {plan.attorneyReviewDescription}
              </Typography>
              <Typography variant="body2">
                <strong>Delivery:</strong> Within {plan.attorneyReviewDeliveryDays} days of service start
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Full Terms */}
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {plan.termsFull}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Key Points Summary */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Key Points Summary:
            </Typography>
            <List dense>
              {plan.termsHighlights.map((highlight, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={highlight}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setTermsDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAcceptTerms}
            variant="contained"
            size="large"
            startIcon={<CheckCircle />}
          >
            I Accept - Select {plan.name}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
          Choose Your Credit Repair Plan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select the service that best fits your needs and budget
        </Typography>
      </Box>

      {/* Plans Grid */}
      <Grid container spacing={3}>
        {plans.map(plan => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={plan.id}
          >
            {renderPlanCard(plan)}
          </Grid>
        ))}
      </Grid>

      {/* Terms Dialog */}
      {renderTermsDialog()}

      {/* Help Note */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          <strong>Need help choosing?</strong> Most clients choose <strong>Standard</strong> for the best
          balance of service and value. If you need faster results and legal review, go <strong>Premium</strong>.
          Want zero risk? Try <strong>Pay-For-Delete</strong>.
        </Typography>
      </Box>
    </Box>
  );
};

export default ServicePlanSelector;
