// ============================================
// DISPUTE TRACKER WIDGET
// Path: /src/components/widgets/DisputeTrackerWidget.jsx
// ============================================
// Compact dispute progress tracking widget
// Shows active disputes, status, and success rate
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  TrendingUp,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

// ============================================
// CONSTANTS
// ============================================

const DISPUTE_STATUSES = {
  pending: { 
    label: 'Pending', 
    color: '#f59e0b', 
    icon: Clock,
    description: 'Dispute sent, awaiting response'
  },
  investigating: { 
    label: 'Under Investigation', 
    color: '#3b82f6', 
    icon: Activity,
    description: 'Bureau is investigating'
  },
  resolved: { 
    label: 'Resolved', 
    color: '#10b981', 
    icon: CheckCircle,
    description: 'Successfully resolved'
  },
  verified: { 
    label: 'Verified', 
    color: '#6b7280', 
    icon: AlertCircle,
    description: 'Item verified as accurate'
  },
  deleted: { 
    label: 'Deleted', 
    color: '#10b981', 
    icon: CheckCircle,
    description: 'Item successfully deleted'
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    icon: XCircle,
    description: 'Dispute was rejected'
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

const DisputeTrackerWidget = ({ 
  clientId = null, 
  compact = false,
  showDetails = true,
  maxItems = 5,
  onDisputeClick = null,
}) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    successRate: 0,
  });

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    if (clientId) {
      loadDisputes();
    }
  }, [clientId]);

  const loadDisputes = async () => {
    console.log('📊 Loading disputes for widget');
    setLoading(true);

    try {
      const disputesRef = collection(db, 'disputes');
      let q = query(disputesRef);

      if (clientId) {
        q = query(disputesRef, where('clientId', '==', clientId));
      }

      const snapshot = await getDocs(q);
      const disputeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDisputes(disputeData);
      calculateStats(disputeData);

    } catch (error) {
      console.error('❌ Error loading disputes:', error);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (disputeData) => {
    const total = disputeData.length;
    const active = disputeData.filter(d => 
      d.status === 'pending' || d.status === 'investigating'
    ).length;
    const resolved = disputeData.filter(d => 
      d.status === 'resolved' || d.status === 'deleted'
    ).length;
    const successRate = total > 0 ? (resolved / total) * 100 : 0;

    setStats({
      total,
      active,
      resolved,
      successRate: successRate.toFixed(0),
    });
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderStatusBreakdown = () => {
    const statusCounts = {};
    
    Object.keys(DISPUTE_STATUSES).forEach(status => {
      statusCounts[status] = disputes.filter(d => d.status === status).length;
    });

    return (
      <Box className="space-y-2 mb-4">
        {Object.entries(DISPUTE_STATUSES).map(([status, config]) => {
          const count = statusCounts[status];
          if (count === 0) return null;

          const StatusIcon = config.icon;
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

          return (
            <Box key={status}>
              <Box className="flex items-center justify-between mb-1">
                <Box className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
                  <Typography variant="caption" className="text-gray-600">
                    {config.label}
                  </Typography>
                </Box>
                <Typography variant="caption" className="font-semibold">
                  {count}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: config.color,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderDisputeList = () => {
    const activeDisputes = disputes
      .filter(d => d.status === 'pending' || d.status === 'investigating')
      .slice(0, maxItems);

    if (activeDisputes.length === 0) {
      return (
        <Box className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <Typography variant="body2" className="text-gray-600">
            No active disputes
          </Typography>
        </Box>
      );
    }

    return (
      <List dense>
        {activeDisputes.map((dispute, index) => {
          const statusConfig = DISPUTE_STATUSES[dispute.status];
          const StatusIcon = statusConfig.icon;
          const daysSince = dispute.sentDate ? 
            Math.floor((Date.now() - dispute.sentDate.toDate()) / (1000 * 60 * 60 * 24)) : 0;

          return (
            <React.Fragment key={dispute.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{ px: 0 }}
                secondaryAction={
                  onDisputeClick && (
                    <IconButton 
                      size="small"
                      onClick={() => onDisputeClick(dispute)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </IconButton>
                  )
                }
              >
                <Avatar
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    mr: 2,
                    bgcolor: statusConfig.color,
                  }}
                >
                  <StatusIcon className="w-4 h-4" />
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" className="font-semibold">
                      {dispute.itemName || 'Unknown Item'}
                    </Typography>
                  }
                  secondary={
                    <Box className="flex items-center gap-2 mt-1">
                      <Chip
                        label={dispute.bureau}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 18 }}
                      />
                      <Typography variant="caption" className="text-gray-600">
                        {daysSince} days ago
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  // ============================================
  // COMPACT VIEW
  // ============================================

  if (compact) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box className="flex items-center justify-between mb-3">
            <Box className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <Typography variant="subtitle2" className="font-semibold">
                Disputes
              </Typography>
            </Box>
            <Chip
              label={`${stats.active} Active`}
              size="small"
              color="primary"
            />
          </Box>

          <Box className="grid grid-cols-3 gap-2">
            <Box className="text-center">
              <Typography variant="h6" className="font-bold">
                {stats.total}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Total
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h6" className="font-bold text-green-600">
                {stats.resolved}
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Resolved
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h6" className="font-bold text-blue-600">
                {stats.successRate}%
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Success
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // FULL VIEW
  // ============================================

  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" className="text-center mt-2 text-gray-600">
            Loading disputes...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        {/* ===== HEADER ===== */}
        <Box className="flex items-center justify-between mb-4">
          <Box className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <Typography variant="h6" className="font-semibold">
              Dispute Tracker
            </Typography>
          </Box>
          {onDisputeClick && (
            <IconButton size="small">
              <Eye className="w-5 h-5" />
            </IconButton>
          )}
        </Box>

        {/* ===== KEY METRICS ===== */}
        <Box className="grid grid-cols-3 gap-3 mb-4">
          <Box className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Typography variant="h5" className="font-bold">
              {stats.total}
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Total Disputes
            </Typography>
          </Box>
          <Box className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Typography variant="h5" className="font-bold text-blue-600">
              {stats.active}
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Active
            </Typography>
          </Box>
          <Box className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <Typography variant="h5" className="font-bold text-green-600">
              {stats.successRate}%
            </Typography>
            <Typography variant="caption" className="text-gray-600">
              Success Rate
            </Typography>
          </Box>
        </Box>

        {/* ===== STATUS BREAKDOWN ===== */}
        {showDetails && (
          <>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Status Breakdown
            </Typography>
            {renderStatusBreakdown()}
          </>
        )}

        {/* ===== ACTIVE DISPUTES LIST ===== */}
        <Typography variant="subtitle2" className="font-semibold mb-2">
          Active Disputes
        </Typography>
        {renderDisputeList()}

        {/* ===== FOOTER ===== */}
        {stats.resolved > 0 && (
          <Box className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <Box className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <Typography variant="body2" className="font-semibold text-green-600">
                Great progress!
              </Typography>
            </Box>
            <Typography variant="caption" className="text-gray-600">
              {stats.resolved} items successfully resolved
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// DISPUTE SUCCESS INDICATOR
// ============================================

export const DisputeSuccessIndicator = ({ successRate }) => {
  const getColor = (rate) => {
    if (rate >= 70) return '#10b981'; // green
    if (rate >= 50) return '#3b82f6'; // blue
    if (rate >= 30) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getLabel = (rate) => {
    if (rate >= 70) return 'Excellent';
    if (rate >= 50) return 'Good';
    if (rate >= 30) return 'Fair';
    return 'Needs Improvement';
  };

  const color = getColor(successRate);
  const label = getLabel(successRate);

  return (
    <Box className="text-center">
      <Typography 
        variant="h3" 
        className="font-bold"
        style={{ color }}
      >
        {successRate}%
      </Typography>
      <Typography variant="body2" className="font-semibold" style={{ color }}>
        {label}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={successRate}
        sx={{
          mt: 2,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e5e7eb',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </Box>
  );
};

export default DisputeTrackerWidget;