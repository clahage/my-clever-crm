// ============================================================
// Path: /src/components/ConsultationBooking.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
//
// CONSULTATION BOOKING COMPONENT
// ============================================================
// Shows the 3 consultation tiers (20/40/60 min) with
// plan-aware pricing. Handles:
//   - Non-client / Essentials: Full base price
//   - Professional: 20% off base price
//   - VIP: 20 min/month included on request, then 20% off
//
// Base rate: $250/hour, billed in progressive 20-min blocks.
// Longer sessions have volume discounts built in.
//
// PROPS:
//   - clientPlan: 'essentials'|'professional'|'vip'|'none'
//   - clientId: Firebase client ID (for booking)
//   - onBook: callback when client selects a session
//   - vipMinutesUsedThisMonth: number (tracks VIP included time)
//   - compact: boolean (for embedding in other components)
// ============================================================

import React, { useState, useMemo } from 'react';

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// ===== Lucide Icons =====
import {
  Clock,
  Phone,
  Star,
  Crown,
  CheckCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  Gift,
  Zap,
} from 'lucide-react';

// ===== Constants =====
import {
  CONSULTATION_RATES,
  getConsultationPrice,
  formatPrice,
  SERVICE_PLANS,
} from '../../constants/servicePlans';

// ============================================================
// TIER VISUAL CONFIG
// ============================================================
const TIER_CONFIG = {
  20: {
    icon: Phone,
    color: '#3b82f6',
    label: 'Quick Session',
    bestFor: 'One question, one strategy',
  },
  40: {
    icon: MessageSquare,
    color: '#059669',
    label: 'Deep Session',
    bestFor: 'Multiple accounts or complex scenarios',
  },
  60: {
    icon: Calendar,
    color: '#7c3aed',
    label: 'Comprehensive',
    bestFor: 'Full 3-bureau review + action plan',
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ConsultationBooking = ({
  clientPlan = 'none',
  clientId = null,
  onBook = null,
  vipMinutesUsedThisMonth = 0,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // ===== State =====
  const [selectedTier, setSelectedTier] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');

  // ===== Plan info =====
  const currentPlan = SERVICE_PLANS[clientPlan] || null;
  const planColor = currentPlan?.badgeColor || '#6b7280';
  const isVip = clientPlan === 'vip';
  const isProfessional = clientPlan === 'professional';

  // ===== VIP included time tracking =====
  const vipIncludedMinutes = CONSULTATION_RATES.planDiscounts.vip?.includedMinutesPerMonth || 0;
  const vipMinutesRemaining = Math.max(0, vipIncludedMinutes - vipMinutesUsedThisMonth);
  const hasVipIncludedTime = isVip && vipMinutesRemaining > 0;

  // ============================================================
  // CALCULATE PRICING FOR ALL TIERS
  // ============================================================
  const tiers = useMemo(() => {
    return CONSULTATION_RATES.blocks.map(block => {
      const priceInfo = getConsultationPrice(clientPlan, block.minutes);
      const tierVisual = TIER_CONFIG[block.minutes];

      return {
        ...block,
        ...priceInfo,
        ...tierVisual,
        effectiveHourlyRate: priceInfo.price > 0
          ? Math.round((priceInfo.price / block.minutes) * 60)
          : 0,
      };
    });
  }, [clientPlan]);

  // ============================================================
  // HANDLE BOOKING
  // ============================================================
  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = () => {
    if (onBook) {
      onBook({
        clientId,
        plan: clientPlan,
        minutes: selectedTier.minutes,
        price: selectedTier.price,
        isIncluded: selectedTier.isIncluded,
        notes: bookingNotes,
        timestamp: new Date().toISOString(),
      });
    }
    setBookingDialogOpen(false);
    setBookingNotes('');
    setSelectedTier(null);
  };

  // ============================================================
  // RENDER: TIER CARD
  // ============================================================
  const renderTierCard = (tier) => {
    const TierIcon = tier.icon;
    const isIncluded = tier.isIncluded;
    const hasDiscount = tier.discount && !isIncluded;
    const isRecommended = tier.minutes === 40;  // 40 min is best value

    return (
      <Card
        key={tier.minutes}
        elevation={isRecommended ? 4 : 1}
        sx={{
          flex: 1,
          minWidth: compact ? 200 : 260,
          position: 'relative',
          border: isIncluded
            ? `2px solid #7c3aed`
            : isRecommended
              ? `2px solid ${tier.color}`
              : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 2.5,
          overflow: 'visible',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${tier.color}20`,
          },
        }}
      >
        {/* ===== Badges ===== */}
        {isIncluded && (
          <Chip
            icon={<Gift size={12} />}
            label="INCLUDED WITH VIP"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#7c3aed',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 24,
              '& .MuiChip-icon': { color: 'white' },
            }}
          />
        )}
        {isRecommended && !isIncluded && (
          <Chip
            label="BEST VALUE"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: tier.color,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 24,
            }}
          />
        )}

        <CardContent sx={{ p: compact ? 2 : 3, pt: compact ? 3 : 3.5 }}>
          {/* ===== Icon + Label ===== */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <TierIcon
              size={compact ? 24 : 32}
              style={{ color: tier.color, marginBottom: 8 }}
            />
            <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight={600}>
              {tier.minutes} Minutes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tier.label} — {tier.bestFor}
            </Typography>
          </Box>

          {/* ===== Pricing ===== */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {isIncluded ? (
              <>
                <Typography
                  variant="h4"
                  fontWeight={300}
                  sx={{ color: '#7c3aed', lineHeight: 1 }}
                >
                  FREE
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {vipMinutesRemaining} min remaining this month
                </Typography>
              </>
            ) : (
              <>
                {/* ===== Strikethrough original if discounted ===== */}
                {hasDiscount && (
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'text.disabled',
                      fontSize: '0.9rem',
                    }}
                  >
                    {formatPrice(tier.originalPrice)}
                  </Typography>
                )}
                <Typography
                  variant="h4"
                  fontWeight={300}
                  sx={{ color: tier.color, lineHeight: 1 }}
                >
                  {formatPrice(tier.price)}
                </Typography>

                {/* ===== Effective hourly rate ===== */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Effective: {formatPrice(tier.effectiveHourlyRate)}/hr
                </Typography>

                {/* ===== Discount chip ===== */}
                {hasDiscount && (
                  <Chip
                    label={tier.discount}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: `${planColor}15`,
                      color: planColor,
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 20,
                    }}
                  />
                )}

                {/* ===== Volume savings ===== */}
                {tier.savings > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: '#059669',
                      fontWeight: 500,
                    }}
                  >
                    Save {formatPrice(tier.savings)} vs. per-block rate
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* ===== Description ===== */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            {tier.description}
          </Typography>

          {/* ===== What's Included ===== */}
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
              <CheckCircle size={14} style={{ color: tier.color, flexShrink: 0, marginTop: 2 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                Senior credit repair specialist
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
              <CheckCircle size={14} style={{ color: tier.color, flexShrink: 0, marginTop: 2 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                Written summary of recommendations
              </Typography>
            </Box>
            {tier.minutes >= 40 && (
              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                <CheckCircle size={14} style={{ color: tier.color, flexShrink: 0, marginTop: 2 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                  Multi-account strategy review
                </Typography>
              </Box>
            )}
            {tier.minutes >= 60 && (
              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                <CheckCircle size={14} style={{ color: tier.color, flexShrink: 0, marginTop: 2 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                  Written comprehensive action plan
                </Typography>
              </Box>
            )}
          </Stack>

          {/* ===== Book Button ===== */}
          <Button
            variant={isRecommended || isIncluded ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => handleSelectTier(tier)}
            endIcon={<ArrowRight size={16} />}
            sx={{
              mt: 2.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: (isRecommended || isIncluded) ? tier.color : 'transparent',
              borderColor: tier.color,
              color: (isRecommended || isIncluded) ? 'white' : tier.color,
              '&:hover': {
                bgcolor: (isRecommended || isIncluded)
                  ? `${tier.color}dd`
                  : `${tier.color}15`,
              },
            }}
          >
            {isIncluded ? 'Request Session' : 'Book Session'}
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
      {/* ===== Header ===== */}
      {!compact && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Expert Consultation Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            One-on-one with a senior credit repair specialist.
            $250/hour base rate, billed in 20-minute blocks with volume discounts.
          </Typography>

          {/* ===== Plan-specific pricing note ===== */}
          {isProfessional && (
            <Chip
              icon={<Star size={12} />}
              label="Professional plan: 20% off all sessions"
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: '#05966920',
                color: '#059669',
                fontWeight: 600,
                '& .MuiChip-icon': { color: '#059669' },
              }}
            />
          )}
          {isVip && (
            <Chip
              icon={<Crown size={12} />}
              label={`VIP: ${vipMinutesRemaining} min included this month + 20% off additional`}
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: '#7c3aed20',
                color: '#7c3aed',
                fontWeight: 600,
                '& .MuiChip-icon': { color: '#7c3aed' },
              }}
            />
          )}
        </Box>
      )}

      {/* ===== Tier Cards ===== */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2.5,
          alignItems: isMobile ? 'center' : 'stretch',
          justifyContent: 'center',
        }}
      >
        {tiers.map(tier => renderTierCard(tier))}
      </Box>

      {/* ===== Upgrade Suggestion for non-plan / Essentials ===== */}
      {(clientPlan === 'none' || clientPlan === 'essentials') && !compact && (
        <Alert
          severity="info"
          icon={<Zap size={18} />}
          sx={{ mt: 3, borderRadius: 2 }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>
            Save on consultations with a plan
          </AlertTitle>
          <Typography variant="body2">
            Professional plan members save 20% on every session.
            VIP Concierge members get 20 minutes included every month plus 20% off additional time.
          </Typography>
        </Alert>
      )}

      {/* ===== Booking Dialog ===== */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {selectedTier?.isIncluded
            ? 'Request Included Session'
            : `Book ${selectedTier?.minutes}-Minute Session`
          }
        </DialogTitle>
        <DialogContent>
          {selectedTier && (
            <>
              <Box sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{selectedTier.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedTier.minutes} minutes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Price</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedTier.isIncluded ? 'Included with VIP' : formatPrice(selectedTier.price)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Our team will reach out within 1 business day to schedule your session at a time that works for you.
              </Typography>

              <TextField
                label="What would you like to discuss? (optional)"
                multiline
                rows={3}
                fullWidth
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g., I need help understanding a bureau response, I want to discuss my mortgage readiness timeline..."
                sx={{ mb: 1 }}
              />

              <Typography variant="caption" color="text.secondary">
                Providing context helps our specialist prepare for your call.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBookingDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBooking}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: selectedTier?.color || planColor,
              '&:hover': { bgcolor: `${selectedTier?.color || planColor}dd` },
            }}
          >
            {selectedTier?.isIncluded ? 'Request Session' : `Book & Pay ${formatPrice(selectedTier?.price || 0)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationBooking;