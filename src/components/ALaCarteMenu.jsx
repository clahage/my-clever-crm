// ============================================================
// Path: /src/components/ALaCarteMenu.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
//
// À LA CARTE SERVICES MENU — CLIENT PORTAL COMPONENT
// ============================================================
// This component appears INSIDE the client portal AFTER sign-up.
// It is NOT shown on the public pricing page (that stays clean
// at 3 plans to avoid choice paralysis).
//
// FEATURES:
//   - Shows all à la carte services grouped by category
//   - Plan-aware pricing (shows discounts for Prof/VIP)
//   - "Included" badges for services already in client's plan
//   - Tradeline section with full disclosure
//   - Cart system for purchasing multiple services
//   - Upsell banner when cart exceeds $100
//   - Mobile-responsive with search/filter
//
// PROPS:
//   - clientPlan: 'essentials'|'professional'|'vip' (required)
//   - clientId: Firebase client doc ID (for purchase tracking)
//   - onPurchase: callback when client confirms purchase
//   - onUpgrade: callback when client clicks upgrade suggestion
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';

// ===== Material-UI Imports =====
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Stack,
  Alert,
  AlertTitle,
  TextField,
  InputAdornment,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Collapse,
  IconButton,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// ===== Lucide Icons =====
import {
  Search,
  ShoppingCart,
  FileText,
  Send,
  Phone,
  CreditCard,
  Sparkles,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Info,
  AlertTriangle,
  Star,
  Crown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Tag,
} from 'lucide-react';

// ===== Constants =====
import {
  LETTER_SERVICES,
  SENDING_SERVICES,
  CONSULTATION_SERVICES,
  INTERVENTION_SERVICES,
  CREDIT_BUILDING_SERVICES,
  SPECIALTY_SERVICES,
  TRADELINE_DISCLOSURE,
  UPSELL_TRIGGERS,
  getServicesForPlan,
} from '../../constants/aLaCarteServices';

import {
  SERVICE_PLANS,
  CONSULTATION_RATES,
  getConsultationPrice,
  formatPrice,
} from '../../constants/servicePlans';

// ============================================================
// CATEGORY CONFIG — Icons, labels, display order
// ============================================================
const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'letter', label: 'Letters', icon: FileText },
  { id: 'sending', label: 'Sending', icon: Send },
  { id: 'consultation', label: 'Consultations', icon: Phone },
  { id: 'intervention', label: 'Creditor Calls', icon: Shield },
  { id: 'tradeline', label: 'Tradelines', icon: CreditCard },
  { id: 'credit_building', label: 'Credit Building', icon: TrendingUp },
  { id: 'specialty', label: 'Specialty', icon: Star },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const ALaCarteMenu = ({
  clientPlan = 'essentials',
  clientId = null,
  onPurchase = null,
  onUpgrade = null,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // ===== State =====
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);  // Array of { serviceId, quantity, price }
  const [cartOpen, setCartOpen] = useState(false);
  const [tradelineDisclosureOpen, setTradelineDisclosureOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // ===== Get current plan details =====
  const currentPlan = SERVICE_PLANS[clientPlan];
  const planColor = currentPlan?.badgeColor || '#3b82f6';

  // ============================================================
  // GET ALL SERVICES WITH PLAN-AWARE PRICING
  // ============================================================
  const allServices = useMemo(() => {
    return getServicesForPlan(clientPlan);
  }, [clientPlan]);

  // ============================================================
  // FILTER SERVICES BY CATEGORY + SEARCH
  // ============================================================
  const filteredServices = useMemo(() => {
    let filtered = allServices;

    // ===== Category filter =====
    if (activeCategory !== 'all') {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    // ===== Search filter =====
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query)
        || s.description.toLowerCase().includes(query)
        || s.category.toLowerCase().includes(query)
      );
    }

    // ===== Only show services that are available or included =====
    filtered = filtered.filter(s => s.isAvailable);

    return filtered;
  }, [allServices, activeCategory, searchQuery]);

  // ============================================================
  // CART OPERATIONS
  // ============================================================
  const addToCart = useCallback((service) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        serviceId: service.id,
        name: service.name,
        price: service.adjustedPrice || service.price || service.basePrice,
        quantity: 1,
        category: service.category,
      }];
    });
  }, []);

  const removeFromCart = useCallback((serviceId) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === serviceId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.serviceId === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.serviceId !== serviceId);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // ===== Upsell: Show upgrade banner if à la carte spend > $100 =====
  const showUpsellBanner = clientPlan === 'essentials' && cartTotal > 100;

  // ============================================================
  // HANDLE PURCHASE CONFIRMATION
  // ============================================================
  const handleConfirmPurchase = () => {
    if (onPurchase) {
      onPurchase({
        clientId,
        plan: clientPlan,
        items: cart,
        total: cartTotal,
        timestamp: new Date().toISOString(),
      });
    }
    setConfirmDialogOpen(false);
    setCart([]);
    setCartOpen(false);
  };

  // ============================================================
  // RENDER: INDIVIDUAL SERVICE CARD
  // ============================================================
  const renderServiceCard = (service) => {
    const isIncluded = service.isIncluded;
    const isTradeline = service.category === 'tradeline';
    const isConsultation = service.category === 'consultation';
    const requiresConsultation = service.requiresConsultation;
    const inCart = cart.find(item => item.serviceId === service.id);
    const displayPrice = service.adjustedPrice ?? service.price ?? service.basePrice;

    // ===== VIP tradeline discount display =====
    const hasVipDiscount = isTradeline && clientPlan === 'vip' && service.vipDiscount;
    const originalTradelinePrice = service.price;

    // ===== Consultation plan pricing =====
    let consultPriceInfo = null;
    if (isConsultation) {
      consultPriceInfo = getConsultationPrice(clientPlan, service.minutes);
    }

    return (
      <Card
        key={service.id}
        elevation={service.popular ? 2 : 1}
        sx={{
          position: 'relative',
          border: isIncluded
            ? `1px solid ${planColor}40`
            : service.popular
              ? `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`
              : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 2,
          bgcolor: isIncluded
            ? isDark ? `${planColor}08` : `${planColor}05`
            : isDark ? 'background.paper' : 'background.default',
          opacity: isIncluded ? 0.85 : 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isIncluded ? 'none' : `0 4px 16px rgba(0,0,0,0.1)`,
          },
        }}
      >
        {/* ===== Popular Badge ===== */}
        {service.popular && !isIncluded && (
          <Chip
            label="POPULAR"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: '#f59e0b',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        )}

        {/* ===== Included Badge ===== */}
        {isIncluded && (
          <Chip
            icon={<CheckCircle size={12} />}
            label={`Included in ${currentPlan?.name}`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: `${planColor}20`,
              color: planColor,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 22,
              '& .MuiChip-icon': { color: planColor },
            }}
          />
        )}

        <CardContent sx={{ p: 2.5, pb: 1.5 }}>
          {/* ===== Service Name ===== */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ pr: 10 }}>
            {service.name}
          </Typography>

          {/* ===== Description ===== */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1.5, lineHeight: 1.6, fontSize: '0.82rem' }}
          >
            {service.description}
          </Typography>

          {/* ===== Pricing Display ===== */}
          {!isIncluded && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              {/* Custom price display for tradelines */}
              {isTradeline && service.priceDisplay ? (
                <>
                  {hasVipDiscount && originalTradelinePrice ? (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                      >
                        {service.priceDisplay}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary">
                        {formatPrice(displayPrice)}
                      </Typography>
                      <Chip
                        label={`VIP ${service.vipDiscount}% off`}
                        size="small"
                        sx={{ bgcolor: '#7c3aed20', color: '#7c3aed', height: 18, fontSize: '0.65rem' }}
                      />
                    </>
                  ) : (
                    <Typography variant="h6" fontWeight={600}>
                      {service.priceDisplay}
                    </Typography>
                  )}
                </>
              ) : isConsultation && consultPriceInfo ? (
                <>
                  {consultPriceInfo.isIncluded ? (
                    <Chip
                      icon={<CheckCircle size={12} />}
                      label="Included with VIP (20 min/month)"
                      size="small"
                      sx={{ bgcolor: '#7c3aed20', color: '#7c3aed', fontWeight: 600 }}
                    />
                  ) : (
                    <>
                      {consultPriceInfo.discount && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                        >
                          {formatPrice(consultPriceInfo.originalPrice)}
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight={600}>
                        {formatPrice(consultPriceInfo.price)}
                      </Typography>
                      {consultPriceInfo.discount && (
                        <Chip
                          label={consultPriceInfo.discount}
                          size="small"
                          sx={{ bgcolor: `${planColor}15`, color: planColor, height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={600}>
                    {displayPrice === 0 ? 'FREE' : formatPrice(displayPrice)}
                  </Typography>
                  {service.perUnit && (
                    <Typography variant="caption" color="text.secondary">
                      {service.perUnit}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ===== Bundle Savings ===== */}
          {service.bundleSavings && !isIncluded && (
            <Chip
              icon={<Tag size={12} />}
              label={`Save ${formatPrice(service.bundleSavings)}`}
              size="small"
              variant="outlined"
              sx={{ mb: 1, color: '#059669', borderColor: '#059669', height: 20, fontSize: '0.65rem' }}
            />
          )}

          {/* ===== Delivery Time ===== */}
          {service.deliveryTime && !isIncluded && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Clock size={12} style={{ color: theme.palette.text.disabled }} />
              <Typography variant="caption" color="text.disabled">
                {service.deliveryTime}
              </Typography>
            </Box>
          )}

          {/* ===== Certified Mail Recommendation ===== */}
          {service.recommendCertified && !isIncluded && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Shield size={12} style={{ color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.7rem' }}>
                Certified mail recommended for legal protection
              </Typography>
            </Box>
          )}

          {/* ===== Extension Rate (Tradelines) ===== */}
          {isTradeline && service.extensionRate && !isIncluded && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Extension: {formatPrice(service.extensionRate)}/month beyond initial 2-month period
            </Typography>
          )}
          {isTradeline && service.extensionNote && service.extensionRate === null && service.tier === 'ultra' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {service.extensionNote}
            </Typography>
          )}

          {/* ===== Consultation Pricing Note ===== */}
          {isConsultation && service.pricingNote && !isIncluded && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
              {service.pricingNote}
            </Typography>
          )}

          {/* ===== Consultation Volume Savings ===== */}
          {isConsultation && service.savingsVsFull && !isIncluded && (
            <Chip
              label={`Save ${formatPrice(service.savingsVsFull)} vs. per-block pricing`}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5, color: '#059669', borderColor: '#059669', height: 18, fontSize: '0.6rem' }}
            />
          )}
        </CardContent>

        {/* ===== Card Actions ===== */}
        <CardActions sx={{ px: 2.5, pb: 2 }}>
          {isIncluded ? (
            <Typography variant="caption" sx={{ color: planColor, fontWeight: 600 }}>
              ✓ Already included in your plan
            </Typography>
          ) : requiresConsultation ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Phone size={14} />}
              sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Contact for Custom Quote
            </Button>
          ) : displayPrice === 0 || service.free ? (
            <Typography variant="caption" color="success.main" fontWeight={600}>
              ✓ Included with all plans
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {inCart ? (
                <>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(service.id)}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Minus size={14} />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20, textAlign: 'center' }}>
                    {inCart.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => addToCart(service)}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Plus size={14} />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    Subtotal: {formatPrice(inCart.price * inCart.quantity)}
                  </Typography>
                </>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Plus size={14} />}
                  onClick={() => addToCart(service)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1.5,
                    borderColor: 'divider',
                    '&:hover': { borderColor: planColor, color: planColor },
                  }}
                >
                  Add to Cart
                </Button>
              )}
            </Box>
          )}
        </CardActions>
      </Card>
    );
  };

  // ============================================================
  // RENDER: TRADELINE DISCLOSURE SECTION
  // ============================================================
  const renderTradelineDisclosure = () => {
    if (activeCategory !== 'tradeline' && activeCategory !== 'all') return null;
    // Only show if there are tradeline services visible
    const hasTradelines = filteredServices.some(s => s.category === 'tradeline');
    if (!hasTradelines) return null;

    return (
      <Alert
        severity="warning"
        icon={<AlertTriangle size={20} />}
        sx={{ mt: 2, mb: 2, borderRadius: 2 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          Authorized User Tradeline Disclosure
        </AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {TRADELINE_DISCLOSURE.shortDisclosure}
        </Typography>
        <Button
          size="small"
          onClick={() => setTradelineDisclosureOpen(!tradelineDisclosureOpen)}
          endIcon={tradelineDisclosureOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          sx={{ textTransform: 'none', fontSize: '0.78rem' }}
        >
          {tradelineDisclosureOpen ? 'Hide full disclosure' : 'Read full disclosure'}
        </Button>
        <Collapse in={tradelineDisclosureOpen}>
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 1, lineHeight: 1.7, color: 'text.secondary' }}
          >
            {TRADELINE_DISCLOSURE.fullDisclosure}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 1, lineHeight: 1.7, color: 'warning.dark', fontWeight: 500 }}
          >
            {TRADELINE_DISCLOSURE.riskWarning}
          </Typography>
        </Collapse>
      </Alert>
    );
  };

  // ============================================================
  // RENDER: FLOATING CART
  // ============================================================
  const renderCart = () => {
    if (cart.length === 0) return null;

    return (
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1200,
          borderRadius: 3,
          overflow: 'hidden',
          width: cartOpen ? 360 : 'auto',
          maxHeight: '70vh',
          transition: 'width 0.2s ease',
        }}
      >
        {/* ===== Cart Header / Toggle ===== */}
        <Box
          onClick={() => setCartOpen(!cartOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            bgcolor: planColor,
            color: 'white',
            cursor: 'pointer',
            '&:hover': { bgcolor: `${planColor}dd` },
          }}
        >
          <Badge badgeContent={cartCount} color="error">
            <ShoppingCart size={20} />
          </Badge>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {formatPrice(cartTotal)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {cartCount} item{cartCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          {cartOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Box>

        {/* ===== Cart Contents ===== */}
        <Collapse in={cartOpen}>
          <Box sx={{ p: 2, maxHeight: '50vh', overflow: 'auto' }}>
            <Stack spacing={1.5}>
              {cart.map(item => (
                <Box
                  key={item.serviceId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.82rem' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatPrice(item.price)} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.serviceId)}
                  >
                    <X size={14} />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            {/* ===== Upsell Banner ===== */}
            {showUpsellBanner && (
              <Alert
                severity="info"
                icon={<ArrowUpRight size={18} />}
                sx={{ mt: 2, borderRadius: 1.5 }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  You&apos;ve spent {formatPrice(cartTotal)} on add-ons.
                </Typography>
                <Typography variant="caption" display="block">
                  Upgrade to Professional ($149/mo) and get unlimited everything included — you&apos;d save money!
                </Typography>
                {onUpgrade && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onUpgrade('professional')}
                    sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    View Upgrade
                  </Button>
                )}
              </Alert>
            )}

            {/* ===== Cart Total + Checkout ===== */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>Total</Typography>
              <Typography variant="h6" fontWeight={700}>{formatPrice(cartTotal)}</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                size="small"
                onClick={clearCart}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Clear Cart
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setConfirmDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: planColor,
                  '&:hover': { bgcolor: `${planColor}dd` },
                }}
              >
                Purchase Services
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <Box>
      {/* ===== Header ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Add-On Services
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enhance your {currentPlan?.name || ''} plan with individual services.
          Items already included in your plan are marked accordingly.
        </Typography>
      </Box>

      {/* ===== Search + Category Tabs ===== */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search services..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Tabs
          value={activeCategory}
          onChange={(_, val) => setActiveCategory(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 40,
              fontSize: '0.82rem',
            },
          }}
        >
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            const count = cat.id === 'all'
              ? filteredServices.length
              : allServices.filter(s => s.category === cat.id && s.isAvailable).length;

            return (
              <Tab
                key={cat.id}
                value={cat.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CatIcon size={14} />
                    {cat.label}
                    <Chip label={count} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {/* ===== Tradeline Disclosure (when relevant) ===== */}
      {renderTradelineDisclosure()}

      {/* ===== Services Grid ===== */}
      {filteredServices.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Search size={40} style={{ opacity: 0.2, marginBottom: 8 }} />
          <Typography color="text.secondary">
            No services found matching &quot;{searchQuery}&quot;
          </Typography>
          <Button
            size="small"
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Clear filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredServices.map(service => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              {renderServiceCard(service)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* ===== Floating Cart ===== */}
      {renderCart()}

      {/* ===== Purchase Confirmation Dialog ===== */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Purchase
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {cart.map(item => (
              <Box
                key={item.serviceId}
                sx={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Typography variant="body2">
                  {item.name} {item.quantity > 1 ? `(×${item.quantity})` : ''}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatPrice(item.price * item.quantity)}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="body1" fontWeight={600}>Total</Typography>
            <Typography variant="h6" fontWeight={700}>{formatPrice(cartTotal)}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This will be charged to your account on file. Services will be initiated within 1 business day.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPurchase}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: planColor,
              '&:hover': { bgcolor: `${planColor}dd` },
            }}
          >
            Confirm & Pay {formatPrice(cartTotal)}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ALaCarteMenu;