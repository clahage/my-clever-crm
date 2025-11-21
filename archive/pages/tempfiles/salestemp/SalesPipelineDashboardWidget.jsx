// ============================================
// SALES PIPELINE DASHBOARD WIDGET
// Path: /src/components/widgets/SalesPipelineDashboardWidget.jsx
// ============================================
// Dashboard widget for sales pipeline overview
// Shows hot leads, urgent tasks, closing deals
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  ArrowRight,
  Target,
  Users,
  Clock,
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

// ============================================
// MAIN COMPONENT
// ============================================

const SalesPipelineDashboardWidget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hotLeads: [],
    urgentFollowUps: [],
    closingThisWeek: [],
    pipelineHealth: 0,
  });

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('📊 Loading sales pipeline dashboard data');
    setLoading(true);

    try {
      // Load hot leads (score >= 80)
      const hotLeads = await loadHotLeads();
      
      // Load urgent follow-ups (overdue or due today)
      const urgentFollowUps = await loadUrgentFollowUps();
      
      // Load deals closing this week
      const closingDeals = await loadClosingDeals();
      
      // Calculate pipeline health
      const health = calculatePipelineHealth(hotLeads, urgentFollowUps, closingDeals);

      setStats({
        hotLeads,
        urgentFollowUps,
        closingThisWeek: closingDeals,
        pipelineHealth: health,
      });

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHotLeads = async () => {
    try {
      const leadsRef = collection(db, 'contacts');
      const q = query(
        leadsRef,
        where('roles', 'array-contains', 'lead'),
        where('leadScore', '>=', 80),
        orderBy('leadScore', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('❌ Error loading hot leads:', error);
      return [];
    }
  };

  const loadUrgentFollowUps = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('status', '==', 'pending'),
        where('dueDate', '<=', today),
        orderBy('dueDate', 'asc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('❌ Error loading urgent follow-ups:', error);
      return [];
    }
  };

  const loadClosingDeals = async () => {
    try {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const dealsRef = collection(db, 'deals');
      const q = query(
        dealsRef,
        where('status', '==', 'active'),
        where('expectedCloseDate', '>=', today),
        where('expectedCloseDate', '<=', weekFromNow),
        orderBy('expectedCloseDate', 'asc'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('❌ Error loading closing deals:', error);
      return [];
    }
  };

  const calculatePipelineHealth = (hotLeads, urgentTasks, closingDeals) => {
    // Simple health calculation
    // 100 = perfect, 0 = critical
    let health = 100;

    // Deduct points for issues
    health -= (urgentTasks.length * 5); // -5 per overdue task
    health -= (hotLeads.length < 3 ? 20 : 0); // -20 if less than 3 hot leads
    health -= (closingDeals.length === 0 ? 15 : 0); // -15 if no deals closing

    return Math.max(0, Math.min(100, health));
  };

  // ============================================
  // QUICK ACTIONS
  // ============================================

  const handleCallLead = (lead) => {
    console.log('📞 Initiating call to:', lead.firstName, lead.lastName);
    // Open dialer or initiate call
    window.location.href = `tel:${lead.phone}`;
  };

  const handleEmailLead = (lead) => {
    console.log('📧 Opening email for:', lead.email);
    // Open email client
    window.location.href = `mailto:${lead.email}`;
  };

  const handleViewPipeline = () => {
    navigate('/sales-pipeline');
  };

  const handleViewLead = (leadId) => {
    navigate(`/clients/${leadId}`);
  };

  const handleViewDeal = (dealId) => {
    navigate(`/sales-pipeline?deal=${dealId}`);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderHealthIndicator = () => {
    const { pipelineHealth } = stats;
    
    let color = '#10b981'; // green
    let label = 'Healthy';
    
    if (pipelineHealth < 50) {
      color = '#ef4444'; // red
      label = 'Needs Attention';
    } else if (pipelineHealth < 75) {
      color = '#f59e0b'; // orange
      label = 'Fair';
    }

    return (
      <Box className="flex items-center gap-2">
        <Box className="flex-1">
          <Box className="flex items-center justify-between mb-1">
            <Typography variant="body2" className="text-gray-600">
              Pipeline Health
            </Typography>
            <Typography variant="body2" className="font-semibold" style={{ color }}>
              {label}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pipelineHealth}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
              },
            }}
          />
        </Box>
        <Typography variant="h6" className="font-bold" style={{ color }}>
          {pipelineHealth}%
        </Typography>
      </Box>
    );
  };

  const renderHotLeads = () => {
    if (stats.hotLeads.length === 0) {
      return (
        <Box className="text-center py-4">
          <Typography variant="body2" className="text-gray-500">
            No hot leads right now
          </Typography>
        </Box>
      );
    }

    return (
      <Box className="space-y-2">
        {stats.hotLeads.map((lead) => (
          <Box
            key={lead.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => handleViewLead(lead.id)}
          >
            <Box className="flex items-center gap-3">
              <Avatar
                sx={{ width: 40, height: 40, bgcolor: '#ef4444' }}
              >
                {lead.firstName?.[0]}{lead.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" className="font-semibold">
                  {lead.firstName} {lead.lastName}
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  Score: {lead.leadScore} • {lead.source || 'Unknown source'}
                </Typography>
              </Box>
            </Box>
            <Box className="flex items-center gap-1">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCallLead(lead);
                }}
              >
                <Phone className="w-4 h-4" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmailLead(lead);
                }}
              >
                <Mail className="w-4 h-4" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderUrgentFollowUps = () => {
    if (stats.urgentFollowUps.length === 0) {
      return (
        <Box className="text-center py-4">
          <Typography variant="body2" className="text-gray-500">
            All caught up! 🎉
          </Typography>
        </Box>
      );
    }

    return (
      <Box className="space-y-2">
        {stats.urgentFollowUps.map((task) => (
          <Box
            key={task.id}
            className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Box className="flex-1">
              <Typography variant="body2" className="font-semibold">
                {task.title}
              </Typography>
              <Box className="flex items-center gap-2 mt-1">
                <Chip
                  size="small"
                  label={task.priority || 'Medium'}
                  color={
                    task.priority === 'high' ? 'error' :
                    task.priority === 'medium' ? 'warning' : 'default'
                  }
                />
                <Typography variant="caption" className="text-gray-600">
                  {task.dueDate?.toDate().toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small">
              <ArrowRight className="w-4 h-4" />
            </IconButton>
          </Box>
        ))}
      </Box>
    );
  };

  const renderClosingDeals = () => {
    if (stats.closingThisWeek.length === 0) {
      return (
        <Box className="text-center py-4">
          <Typography variant="body2" className="text-gray-500">
            No deals closing this week
          </Typography>
        </Box>
      );
    }

    return (
      <Box className="space-y-2">
        {stats.closingThisWeek.map((deal) => (
          <Box
            key={deal.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            onClick={() => handleViewDeal(deal.id)}
          >
            <Box>
              <Typography variant="body2" className="font-semibold">
                {deal.name}
              </Typography>
              <Box className="flex items-center gap-2 mt-1">
                <Chip
                  size="small"
                  icon={<DollarSign className="w-3 h-3" />}
                  label={`$${(deal.value || 0).toLocaleString()}`}
                  color="success"
                />
                <Typography variant="caption" className="text-gray-600">
                  {deal.expectedCloseDate?.toDate().toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={`${((deal.winProbability || 0.5) * 100).toFixed(0)}%`}
              color="primary"
            />
          </Box>
        ))}
      </Box>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box className="text-center py-8">
            <LinearProgress />
            <Typography variant="body2" className="mt-4 text-gray-600">
              Loading sales pipeline...
            </Typography>
          </Box>
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
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <Typography variant="h6" className="font-semibold">
              Sales Pipeline
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowRight className="w-4 h-4" />}
            onClick={handleViewPipeline}
          >
            View Full Pipeline
          </Button>
        </Box>

        {/* ===== PIPELINE HEALTH ===== */}
        <Box className="mb-4">
          {renderHealthIndicator()}
        </Box>

        <Divider className="my-4" />

        {/* ===== HOT LEADS ===== */}
        <Box className="mb-4">
          <Box className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <Typography variant="subtitle2" className="font-semibold">
              Hot Leads ({stats.hotLeads.length})
            </Typography>
          </Box>
          {renderHotLeads()}
        </Box>

        <Divider className="my-4" />

        {/* ===== URGENT FOLLOW-UPS ===== */}
        <Box className="mb-4">
          <Box className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-600" />
            <Typography variant="subtitle2" className="font-semibold">
              Urgent Follow-ups ({stats.urgentFollowUps.length})
            </Typography>
          </Box>
          {renderUrgentFollowUps()}
        </Box>

        <Divider className="my-4" />

        {/* ===== CLOSING THIS WEEK ===== */}
        <Box className="mb-2">
          <Box className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-green-600" />
            <Typography variant="subtitle2" className="font-semibold">
              Closing This Week ({stats.closingThisWeek.length})
            </Typography>
          </Box>
          {renderClosingDeals()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesPipelineDashboardWidget;