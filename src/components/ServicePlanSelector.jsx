// ============================================================
// Path: /src/components/ServicePlanSelector.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
//
// SERVICE PLAN SELECTOR COMPONENT
// ============================================================
// This is the PRICING PAGE component — shows the 3 plans
// side-by-side with clear differentiation and "Most Popular"
// badge on Professional. Used on:
//   - Public website pricing page
//   - Client portal upgrade screen
//   - Admin new-client enrollment
//
// IMPORTANT: No à la carte items shown here. This page stays
// clean at 3 options to avoid choice paralysis. À la carte
// appears INSIDE the portal after sign-up.
// ============================================================

import React, { useState } from 'react';

// ===== Material-UI Imports =====
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// ===== Lucide Icons =====
import {
  Check,
  X,
  Star,
  Crown,
  Zap,
  Wrench,
  ArrowRight,
  Info,
  Shield,
  Users,
  Clock,
  CreditCard,
} from 'lucide-react';

// ===== Service Plans Config =====
import {
  SERVICE_PLANS,
  IDIQ_CONFIG,
  COUPLES_DISCOUNT,
  getActivePlans,
  formatPrice,
} from '@/constants/servicePlans';

// ============================================================
// PLAN CARD ICONS
// ============================================================
const PLAN_ICONS = {
  essentials: Wrench,
  professional: Star,
  vip: Crown,
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ServicePlanSelector = ({
  onSelectPlan,         // Callback: (planId) => void
  currentPlan = null,   // If user already has a plan (for upgrades)
  showIdiqInfo = true,  // Show IDIQ disclosure section
  showCouples = true,   // Show couples discount banner
  compact = false,      // Compact mode for modals/sidebars
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // ===== Local State =====
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showFullFeatures, setShowFullFeatures] = useState({});

  // ===== Get the 3 active plans =====
  const plans = getActivePlans();

  // ===== Toggle expanded features for a plan =====
  const toggleFeatures = (planId) => {
    setShowFullFeatures(prev => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  // ===== Handle plan selection =====
  const handleSelect = (planId) => {
    setSelectedPlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  // ============================================================
  // RENDER: INDIVIDUAL PLAN CARD
  // ============================================================
  const renderPlanCard = (plan, index) => {
    const isPopular = plan.isPopular;
    const isSelected = selectedPlan === plan.id;
    const isCurrent = currentPlan === plan.id;
    const isUpgrade = currentPlan && plan.displayOrder > (SERVICE_PLANS[currentPlan]?.displayOrder || 0);
    const PlanIcon = PLAN_ICONS[plan.id];
    const showAll = showFullFeatures[plan.id];

    // ===== How many features to show initially =====
    const initialFeatureCount = compact ? 4 : 6;
    const visibleFeatures = showAll
      ? plan.features
      : plan.features.slice(0, initialFeatureCount);

    return (
      <Card
        key={plan.id}
        elevation={isPopular ? 8 : 2}
        sx={{
          position: 'relative',
          flex: 1,
          minWidth: compact ? 260 : 300,
          maxWidth: compact ? 340 : 400,
          border: isPopular
            ? `2px solid ${plan.badgeColor}`
            : isSelected
              ? `2px solid ${plan.badgeColor}`
              : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 3,
          transform: isPopular && !isMobile ? 'scale(1.03)' : 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: isPopular && !isMobile ? 'scale(1.05)' : 'scale(1.02)',
            boxShadow: `0 8px 32px ${plan.badgeColor}20`,
          },
          overflow: 'visible',
          bgcolor: isDark ? 'background.paper' : 'background.default',
        }}
      >
        {/* ===== Popular Badge (floats above card) ===== */}
        {isPopular && (
          <Chip
            label={plan.badge}
            size="small"
            sx={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: plan.badgeColor,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              px: 2,
              height: 28,
            }}
          />
        )}

        {/* ===== Non-Popular Badge ===== */}
        {!isPopular && (
          <Chip
            label={plan.badge}
            size="small"
            variant="outlined"
            sx={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              borderColor: plan.badgeColor,
              color: plan.badgeColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              height: 28,
            }}
          />
        )}

        <CardContent sx={{ p: compact ? 2.5 : 3, pt: compact ? 3.5 : 4 }}>
          {/* ===== Plan Header ===== */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <PlanIcon
              size={compact ? 28 : 36}
              style={{ color: plan.badgeColor, marginBottom: 8 }}
            />
            <Typography variant={compact ? 'h6' : 'h5'} fontWeight={600}>
              {plan.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic', mt: 0.5 }}
            >
              {plan.tagline}
            </Typography>
          </Box>

          {/* ===== Pricing ===== */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
              <Typography
                variant="h3"
                fontWeight={300}
                sx={{ color: plan.badgeColor, lineHeight: 1 }}
              >
                {formatPrice(plan.monthlyPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                /month
              </Typography>
            </Box>

            {/* ===== Setup Fee ===== */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {plan.setupFee > 0
                ? `+ ${formatPrice(plan.setupFee)} one-time setup fee`
                : 'No setup fee'
              }
            </Typography>

            {/* ===== Per-Item Fee ===== */}
            {plan.perItemDeletionFee !== null && plan.perItemDeletionFee > 0 && (
              <Typography variant="caption" sx={{ color: plan.badgeColor, display: 'block' }}>
                + {formatPrice(plan.perItemDeletionFee)} per item deleted, per bureau
              </Typography>
            )}
            {plan.perItemDeletionFee === 0 && plan.id === 'vip' && (
              <Typography variant="caption" sx={{ color: plan.badgeColor, fontWeight: 600, display: 'block' }}>
                All deletion fees included
              </Typography>
            )}

            {/* ===== Total with IDIQ ===== */}
            <Tooltip
              title={`${formatPrice(plan.monthlyPrice)} plan + ${formatPrice(IDIQ_CONFIG.monthlyRate)} IDIQ monitoring (paid separately to IdentityIQ)`}
              arrow
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                  cursor: 'help',
                  borderBottom: '1px dashed',
                  borderColor: 'text.disabled',
                }}
              >
                <Info size={12} />
                Total with IDIQ: {formatPrice(plan.totalMonthlyWithIdiq)}/mo
              </Typography>
            </Tooltip>
          </Box>

          {/* ===== Contract Term ===== */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 2,
              py: 1,
              px: 2,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {plan.contractTerm === 'month-to-month'
                ? 'Month-to-month · Cancel anytime'
                : `${plan.contractMonths}-month commitment`
              }
              {plan.earlyExitOption && (
                <>
                  <br />
                  <span style={{ fontSize: '0.7rem' }}>{plan.earlyExitOption}</span>
                </>
              )}
              {plan.resultsGuarantee && (
                <>
                  <br />
                  <Shield size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                  <span style={{ fontWeight: 600, color: plan.badgeColor }}>{plan.resultsGuarantee}</span>
                </>
              )}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ===== Features List ===== */}
          <Stack spacing={1}>
            {visibleFeatures.map((feature, fi) => {
              // First feature of Professional/VIP is "Everything in X, PLUS:"
              const isHeader = feature.includes('PLUS:') || feature.includes('Everything in');

              return (
                <Box
                  key={fi}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-start',
                  }}
                >
                  {!isHeader && (
                    <Check
                      size={16}
                      style={{
                        color: plan.badgeColor,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      fontWeight: isHeader ? 600 : 400,
                      color: isHeader ? 'text.secondary' : 'text.primary',
                      fontStyle: isHeader ? 'italic' : 'normal',
                    }}
                  >
                    {feature}
                  </Typography>
                </Box>
              );
            })}

            {/* ===== Show More / Less ===== */}
            {plan.features.length > initialFeatureCount && (
              <Button
                size="small"
                onClick={() => toggleFeatures(plan.id)}
                sx={{
                  textTransform: 'none',
                  color: plan.badgeColor,
                  fontSize: '0.78rem',
                  mt: 0.5,
                }}
              >
                {showAll
                  ? 'Show less'
                  : `+ ${plan.features.length - initialFeatureCount} more features`
                }
              </Button>
            )}
          </Stack>

          {/* ===== Not Included (dimmed) ===== */}
          {!compact && plan.notIncluded.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: 'block', mb: 1 }}
              >
                Not included:
              </Typography>
              <Stack spacing={0.5}>
                {plan.notIncluded.slice(0, 3).map((item, ni) => (
                  <Box key={ni} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <X size={12} style={{ color: theme.palette.text.disabled, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
                {plan.notIncluded.length > 3 && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', pl: 2.5 }}>
                    + {plan.notIncluded.length - 3} more (available in higher plans)
                  </Typography>
                )}
              </Stack>
            </>
          )}

          {/* ===== Ideal For ===== */}
          {!compact && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
                <strong>Ideal for:</strong> {plan.idealFor}
              </Typography>
            </Box>
          )}

          {/* ===== CTA Button ===== */}
          <Button
            variant={isPopular ? 'contained' : 'outlined'}
            fullWidth
            size="large"
            onClick={() => handleSelect(plan.id)}
            disabled={isCurrent}
            endIcon={<ArrowRight size={18} />}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              bgcolor: isPopular ? plan.badgeColor : 'transparent',
              borderColor: plan.badgeColor,
              color: isPopular ? 'white' : plan.badgeColor,
              '&:hover': {
                bgcolor: isPopular
                  ? `${plan.badgeColor}dd`
                  : `${plan.badgeColor}15`,
                borderColor: plan.badgeColor,
              },
              '&.Mui-disabled': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              },
            }}
          >
            {isCurrent
              ? 'Current Plan'
              : isUpgrade
                ? `Upgrade to ${plan.name}`
                : `Choose ${plan.name}`
            }
          </Button>
        </CardContent>
      </Card>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <Box>
      {/* ===== Section Header ===== */}
      {!compact && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Choose Your Credit Repair Plan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Three simple options — tools, full service, or white-glove VIP.
            All plans include AI-powered credit analysis and client portal access.
          </Typography>
        </Box>
      )}

      {/* ===== Couples Discount Banner ===== */}
      {showCouples && COUPLES_DISCOUNT.enabled && (
        <Alert
          severity="info"
          icon={<Users size={20} />}
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            Couples & Family Discount — {COUPLES_DISCOUNT.discountPercent}% Off
          </AlertTitle>
          {COUPLES_DISCOUNT.marketingText}
        </Alert>
      )}

      {/* ===== Plan Cards ===== */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          alignItems: isMobile ? 'center' : 'stretch',
          justifyContent: 'center',
        }}
      >
        {plans.map((plan, index) => renderPlanCard(plan, index))}
      </Box>

      {/* ===== IDIQ Disclosure ===== */}
      {showIdiqInfo && (
        <Alert
          severity="info"
          icon={<CreditCard size={20} />}
          sx={{
            mt: 4,
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            Credit Monitoring Requirement — {IDIQ_CONFIG.partnerName}
          </AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {IDIQ_CONFIG.disclosureText}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {IDIQ_CONFIG.whyRequiredText}
          </Typography>
        </Alert>
      )}

      {/* ===== Free Consultation CTA ===== */}
      {!compact && (
        <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Not sure which plan is right for you?
          </Typography>
          <Button
            variant="text"
            size="large"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Schedule a Free Credit Review — No Obligation
          </Button>
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>
            30 years of credit repair experience · A+ BBB Rating · 4.9★ Google (580+ reviews)
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ServicePlanSelector;