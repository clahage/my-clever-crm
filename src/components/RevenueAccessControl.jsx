// src/components/RevenueAccessControl.jsx
// Component to filter revenue data based on user role

import React from 'react';
import { Box, Alert, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleConfig } from '@/config/roleConfig';

/**
 * Filter revenue data based on user's revenueVisibility level
 */
export const filterRevenueData = (data, revenueVisibility) => {
  if (!revenueVisibility || revenueVisibility === 'full') {
    return data; // Return all data for full access
  }

  if (revenueVisibility === 'summary') {
    // Filter out detailed breakdowns, only show totals
    const filtered = { ...data };

    // Remove detailed revenue streams if they exist
    if (filtered.revenueStreams) {
      filtered.revenueStreams = filtered.revenueStreams.map((stream) => ({
        ...stream,
        // Keep basic info but remove sensitive details
        clients: undefined,
        individualTransactions: undefined,
        clientList: undefined,
      }));
    }

    // Remove individual transaction details
    if (filtered.transactions) {
      delete filtered.transactions;
    }

    // Remove client-specific revenue data
    if (filtered.clientRevenue) {
      delete filtered.clientRevenue;
    }

    // Keep only aggregated metrics
    return filtered;
  }

  if (revenueVisibility === 'none') {
    // Return null or empty object for no access
    return null;
  }

  return data;
};

/**
 * Check if user can see specific revenue metric
 */
export const canSeeRevenueMetric = (metricType, revenueVisibility) => {
  if (!revenueVisibility || revenueVisibility === 'full') {
    return true;
  }

  if (revenueVisibility === 'summary') {
    const allowedMetrics = [
      'totalRevenue',
      'monthlyRevenue',
      'activeSubscriptions',
      'totalClients',
      'revenueGrowth',
      'mrr',
      'arr',
    ];
    return allowedMetrics.includes(metricType);
  }

  return false;
};

/**
 * Wrapper component that shows/hides content based on revenue access
 */
export const RevenueProtectedContent = ({ children, metricType, fallback = null }) => {
  const { userProfile } = useAuth();
  const roleConfig = getRoleConfig(userProfile?.role);
  const revenueVisibility = roleConfig?.revenueVisibility || 'none';

  const canSee = canSeeRevenueMetric(metricType, revenueVisibility);

  if (!canSee) {
    return (
      fallback || (
        <Card sx={{ bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
          <CardContent>
            <Stack spacing={2} alignItems="center" py={2}>
              <Lock size={32} color="#9ca3af" />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                You don't have permission to view this revenue metric
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
};

/**
 * Banner to show current revenue access level
 */
export const RevenueAccessBanner = () => {
  const { userProfile } = useAuth();
  const roleConfig = getRoleConfig(userProfile?.role);
  const revenueVisibility = roleConfig?.revenueVisibility || 'none';

  if (revenueVisibility === 'full') {
    return null; // No banner needed for full access
  }

  const getAccessInfo = () => {
    switch (revenueVisibility) {
      case 'summary':
        return {
          severity: 'info',
          icon: <Eye size={20} />,
          title: 'Summary View',
          message:
            'You have access to summary revenue metrics and totals. Detailed revenue breakdowns and individual client revenue data are restricted.',
        };
      case 'none':
        return {
          severity: 'warning',
          icon: <EyeOff size={20} />,
          title: 'No Revenue Access',
          message: 'You do not have permission to view revenue data.',
        };
      default:
        return {
          severity: 'info',
          icon: <Shield size={20} />,
          title: 'Limited Access',
          message: 'Your access to revenue data is limited based on your role.',
        };
    }
  };

  const accessInfo = getAccessInfo();

  return (
    <Box mb={3}>
      <Alert severity={accessInfo.severity} icon={accessInfo.icon}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {accessInfo.title}
            </Typography>
            <Typography variant="body2" fontSize="0.875rem">
              {accessInfo.message}
            </Typography>
          </Box>
          <Chip
            label={revenueVisibility.toUpperCase()}
            size="small"
            color={revenueVisibility === 'full' ? 'success' : 'default'}
          />
        </Stack>
      </Alert>
    </Box>
  );
};

/**
 * Hook to use revenue access control
 */
export const useRevenueAccess = () => {
  const { userProfile } = useAuth();
  const roleConfig = getRoleConfig(userProfile?.role);
  const revenueVisibility = roleConfig?.revenueVisibility || 'none';

  return {
    revenueVisibility,
    hasFullAccess: revenueVisibility === 'full',
    hasSummaryAccess: revenueVisibility === 'summary' || revenueVisibility === 'full',
    hasNoAccess: revenueVisibility === 'none',
    canSeeMetric: (metricType) => canSeeRevenueMetric(metricType, revenueVisibility),
    filterData: (data) => filterRevenueData(data, revenueVisibility),
  };
};

/**
 * Format currency with access control
 */
export const ProtectedCurrency = ({ amount, metricType, ...props }) => {
  const { canSeeMetric } = useRevenueAccess();

  if (!canSeeMetric(metricType)) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Lock size={16} color="#9ca3af" />
        <Typography variant="body2" color="text.secondary" {...props}>
          Hidden
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography {...props}>
      ${typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
    </Typography>
  );
};

export default {
  filterRevenueData,
  canSeeRevenueMetric,
  RevenueProtectedContent,
  RevenueAccessBanner,
  useRevenueAccess,
  ProtectedCurrency,
};
