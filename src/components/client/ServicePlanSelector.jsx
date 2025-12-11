// ============================================================================
// SERVICE PLAN SELECTOR COMPONENT
// ============================================================================
// Client-facing interface for selecting credit repair service plans
// Features: Plan comparison, pricing calculator, AI recommendations
// Supports bilingual display (English/Spanish)
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as CompareIcon,
  Info as InfoIcon,
  Language as LanguageIcon,
  SelfImprovement,
  Speed,
  MoneyOff,
  Balance,
  Gavel
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import useServicePlans from '../../hooks/useServicePlans';
import { formatCurrency, comparePlans } from '../../lib/pricingCalculator';
import { getPlanName, getPlanDescription, getPlanComparisonData } from '../../lib/servicePlanHelpers';
import GlobalFooter from '../common/GlobalFooter';

const ServicePlanSelector = ({ contactId, onPlanSelected }) => {
  const navigate = useNavigate();

  // ===== STATE =====
  const [language, setLanguage] = useState('en');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showDetails, setShowDetails] = useState(null);

  // ===== LOAD PLANS =====
  const { plans, loading, error } = useServicePlans({ enabledOnly: true });

  // ===== PLAN ICONS =====
  const planIcons = {
    SelfImprovement: SelfImprovement,
    Star: StarIcon,
    Speed: Speed,
    MoneyOff: MoneyOff,
    Balance: Balance,
    Gavel: Gavel
  };

  // ===== RENDER LOADING STATE =====
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {language === 'es' ? 'Cargando planes...' : 'Loading plans...'}
        </Typography>
      </Container>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          {language === 'es'
            ? 'Error al cargar los planes de servicio. Por favor, intente nuevamente.'
            : 'Error loading service plans. Please try again.'}
        </Alert>
      </Container>
    );
  }

  // ===== HANDLE PLAN SELECTION =====
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (onPlanSelected) {
      onPlanSelected(plan);
    } else {
      // Navigate to contract creation
      navigate(`/contracts/create?planId=${plan.id}&contactId=${contactId}`);
    }
  };

  // ===== RENDER PLAN CARD =====
  const renderPlanCard = (plan) => {
    const IconComponent = planIcons[plan.icon] || StarIcon;

    return (
      <Grid item xs={12} sm={6} md={4} key={plan.id}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: plan.popular ? '2px solid' : '1px solid',
            borderColor: plan.popular ? 'primary.main' : 'divider',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}
          className="dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Popular Badge */}
          {plan.popular && (
            <Chip
              label={language === 'es' ? 'MÁS POPULAR' : 'MOST POPULAR'}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontWeight: 'bold'
              }}
            />
          )}

          {/* Best Value Badge */}
          {plan.bestValue && (
            <Chip
              label={language === 'es' ? 'MEJOR VALOR' : 'BEST VALUE'}
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                top: plan.popular ? 48 : 16,
                right: 16,
                fontWeight: 'bold'
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, pt: plan.popular || plan.bestValue ? 6 : 3 }}>
            {/* Plan Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <IconComponent sx={{ fontSize: 48, color: plan.color || 'primary.main' }} />
            </Box>

            {/* Plan Name */}
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              align="center"
              sx={{ fontWeight: 'bold', color: plan.color }}
            >
              {getPlanName(plan, language)}
            </Typography>

            {/* Tagline */}
            <Typography
              variant="subtitle2"
              align="center"
              color="text.secondary"
              sx={{ mb: 3, minHeight: 40 }}
            >
              {language === 'es' ? plan.taglineEs : plan.tagline}
            </Typography>

            {/* Pricing */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {plan.pricing.monthly === 0 ? (
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {language === 'es' ? 'SIN TARIFA MENSUAL' : 'NO MONTHLY FEE'}
                </Typography>
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(plan.pricing.monthly)}
                  <Typography component="span" variant="h6" color="text.secondary">
                    /{language === 'es' ? 'mes' : 'mo'}
                  </Typography>
                </Typography>
              )}

              {/* Per-Deletion Fee */}
              {plan.pricing.perDeletion > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  + {formatCurrency(plan.pricing.perDeletion)} {language === 'es' ? 'por eliminación' : 'per deletion'}
                </Typography>
              )}

              {/* Setup Fee */}
              {plan.pricing.setupFee > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(plan.pricing.setupFee)} {language === 'es' ? 'tarifa de configuración' : 'setup fee'}
                </Typography>
              )}
            </Box>

            {/* Key Features (Top 5) */}
            <List dense>
              {(language === 'es' ? plan.featuresEs : plan.features).slice(0, 5).map((feature, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Success Rate */}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {language === 'es' ? 'Tasa de éxito' : 'Success Rate'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {plan.successRate}%
              </Typography>
            </Box>
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              fullWidth
              variant={plan.popular ? 'contained' : 'outlined'}
              size="large"
              onClick={() => handleSelectPlan(plan)}
              sx={{ mb: 1 }}
            >
              {language === 'es' ? 'Seleccionar Plan' : 'Select Plan'}
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => setShowDetails(plan)}
              startIcon={<InfoIcon />}
            >
              {language === 'es' ? 'Ver Detalles' : 'View Details'}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box className="dark:bg-gray-900">
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {language === 'es' ? 'Elija Su Plan de Servicio' : 'Choose Your Service Plan'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {language === 'es'
                  ? '6 planes diseñados para diferentes necesidades y presupuestos'
                  : '6 plans designed for different needs and budgets'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              {/* Language Toggle */}
              <Tooltip title={language === 'es' ? 'Change Language' : 'Cambiar Idioma'}>
                <IconButton
                  color="inherit"
                  onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                >
                  <LanguageIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Action Buttons */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={() => setShowComparison(true)}
          >
            {language === 'es' ? 'Comparar Planes' : 'Compare Plans'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => navigate('/service-plan-recommender')}
          >
            {language === 'es' ? 'Obtener Recomendación AI' : 'Get AI Recommendation'}
          </Button>
        </Box>
      </Container>

      {/* Plan Cards */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={3}>
          {plans.map(renderPlanCard)}
        </Grid>
      </Container>

      {/* Plan Details Dialog */}
      <Dialog
        open={showDetails !== null}
        onClose={() => setShowDetails(null)}
        maxWidth="md"
        fullWidth
      >
        {showDetails && (
          <>
            <DialogTitle>
              {getPlanName(showDetails, language)}
              <Typography variant="subtitle2" color="text.secondary">
                {language === 'es' ? showDetails.taglineEs : showDetails.tagline}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {language === 'es' ? 'Descripción' : 'Description'}
              </Typography>
              <Typography paragraph>
                {getPlanDescription(showDetails, language)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {language === 'es' ? 'Todas las Características' : 'All Features'}
              </Typography>
              <List>
                {(language === 'es' ? showDetails.featuresEs : showDetails.features).map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {language === 'es' ? 'Precios' : 'Pricing'}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>{language === 'es' ? 'Tarifa Mensual' : 'Monthly Fee'}</TableCell>
                      <TableCell align="right"><strong>{formatCurrency(showDetails.pricing.monthly)}</strong></TableCell>
                    </TableRow>
                    {showDetails.pricing.setupFee > 0 && (
                      <TableRow>
                        <TableCell>{language === 'es' ? 'Tarifa de Configuración' : 'Setup Fee'}</TableCell>
                        <TableCell align="right">{formatCurrency(showDetails.pricing.setupFee)}</TableCell>
                      </TableRow>
                    )}
                    {showDetails.pricing.perDeletion > 0 && (
                      <TableRow>
                        <TableCell>{language === 'es' ? 'Por Eliminación' : 'Per Deletion'}</TableCell>
                        <TableCell align="right">{formatCurrency(showDetails.pricing.perDeletion)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>{language === 'es' ? 'Duración del Contrato' : 'Contract Length'}</TableCell>
                      <TableCell align="right">
                        {showDetails.pricing.contractMonths === 0
                          ? (language === 'es' ? 'Mes a mes' : 'Month-to-month')
                          : `${showDetails.pricing.contractMonths} ${language === 'es' ? 'meses' : 'months'}`
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'es' ? 'Tiempo Estimado' : 'Estimated Timeline'}
                  </Typography>
                  <Typography variant="h6">
                    {showDetails.estimatedMonths} {language === 'es' ? 'meses' : 'months'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'es' ? 'Tasa de Éxito' : 'Success Rate'}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {showDetails.successRate}%
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(null)}>
                {language === 'es' ? 'Cerrar' : 'Close'}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setShowDetails(null);
                  handleSelectPlan(showDetails);
                }}
              >
                {language === 'es' ? 'Seleccionar Este Plan' : 'Select This Plan'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={showComparison}
        onClose={() => setShowComparison(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {language === 'es' ? 'Comparación de Planes' : 'Plan Comparison'}
        </DialogTitle>
        <DialogContent>
          {/* Comparison table implementation would go here */}
          <Typography>Detailed comparison table...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparison(false)}>
            {language === 'es' ? 'Cerrar' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer is rendered by ProtectedLayout; do not render here to avoid duplicates */}
    </Box>
  );
};

export default ServicePlanSelector;
