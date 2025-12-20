// ============================================================================
// AI INTELLIGENCE HUB - UNIFIED AI FEATURES DASHBOARD
// ============================================================================
// Central hub for all AI-powered credit analysis and automation tools
// ============================================================================

import React, { useState, Suspense, lazy, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Psychology,
  Speed,
  Sort,
  BugReport,
  SmartToy,
  Gavel,
  Timeline,
  Security,
  AutoAwesome,
  TrendingUp,
  Lightbulb,
  Menu as MenuIcon,
  Close,
  ChevronRight,
  Refresh,
  Info,
  Star,
  BarChart,
  AttachMoney,
  Warning,
  CreditCard,
  Email,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HIERARCHY } from '@/layout/navConfig';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Lazy load AI components
const AIScorePredictor = lazy(() => import('../../components/ai/AIScorePredictor'));
const SmartPrioritization = lazy(() => import('../../components/ai/SmartPrioritization'));
const AnomalyDetector = lazy(() => import('../../components/ai/AnomalyDetector'));
const CreditCoachChat = lazy(() => import('../../components/ai/CreditCoachChat'));
const AIBusinessDashboard = lazy(() => import('../../components/ai/AIBusinessDashboard'));

// Placeholder components for features to be built
const createPlaceholder = (title, description, icon) => () => (
  <Paper sx={{ p: 6, textAlign: 'center' }}>
    {icon}
    <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      {description}
    </Typography>
    <Chip label="Coming Soon" color="primary" />
  </Paper>
);

const StrategyPlanner = lazy(() => Promise.resolve({
  default: createPlaceholder(
    'Multi-Round Strategy Planner',
    'AI-powered 3-6 month credit repair strategy planning with milestone tracking.',
    <Timeline sx={{ fontSize: 64, color: 'primary.main' }} />
  )
}));

const ComplianceGuardian = lazy(() => Promise.resolve({
  default: createPlaceholder(
    'Legal Compliance Guardian',
    'Ensure all dispute letters comply with FCRA, FDCPA, and state regulations.',
    <Gavel sx={{ fontSize: 64, color: 'warning.main' }} />
  )
}));

const GoodwillGenerator = lazy(() => Promise.resolve({
  default: createPlaceholder(
    'AI Goodwill Letter Generator',
    'Generate personalized goodwill letters for paid collections and late payments.',
    <AutoAwesome sx={{ fontSize: 64, color: 'secondary.main' }} />
  )
}));

const NegotiationAssistant = lazy(() => Promise.resolve({
  default: createPlaceholder(
    'Creditor Negotiation Assistant',
    'AI-generated pay-for-delete negotiation scripts and settlement strategies.',
    <Security sx={{ fontSize: 64, color: 'success.main' }} />
  )
}));

// Tab configuration
const TABS = [
  {
    id: 'predictor',
    label: 'Score Predictor',
    icon: Speed,
    component: AIScorePredictor,
    permission: 'user',
    description: 'Predict future credit scores',
    color: '#667eea',
    badge: 'AI',
  },
  {
    id: 'prioritization',
    label: 'Smart Prioritization',
    icon: Sort,
    component: SmartPrioritization,
    permission: 'user',
    description: 'Rank items by impact',
    color: '#11998e',
    badge: 'AI',
  },
  {
    id: 'anomalies',
    label: 'Anomaly Detector',
    icon: BugReport,
    component: AnomalyDetector,
    permission: 'user',
    description: 'Find hidden errors',
    color: '#f093fb',
    badge: 'AI',
  },
  {
    id: 'coach',
    label: 'Credit Coach',
    icon: SmartToy,
    component: CreditCoachChat,
    permission: 'user',
    description: '24/7 AI assistant',
    color: '#6366f1',
    badge: 'CHAT',
  },
  {
    id: 'strategy',
    label: 'Strategy Planner',
    icon: Timeline,
    component: StrategyPlanner,
    permission: 'manager',
    description: 'Multi-round planning',
    color: '#ff6b6b',
    badge: 'PRO',
  },
  {
    id: 'compliance',
    label: 'Compliance Guardian',
    icon: Gavel,
    component: ComplianceGuardian,
    permission: 'admin',
    description: 'Legal verification',
    color: '#feca57',
    badge: 'PRO',
  },
  {
    id: 'goodwill',
    label: 'Goodwill Letters',
    icon: AutoAwesome,
    component: GoodwillGenerator,
    permission: 'user',
    description: 'Personalized letters',
    color: '#a29bfe',
    badge: 'AI',
  },
  {
    id: 'negotiation',
    label: 'Negotiation Scripts',
    icon: Security,
    component: NegotiationAssistant,
    permission: 'user',
    description: 'Pay-for-delete scripts',
    color: '#00b894',
    badge: 'AI',
  },
  {
    id: 'business',
    label: 'Business Intelligence',
    icon: BarChart,
    component: AIBusinessDashboard,
    permission: 'manager',
    description: 'Revenue & churn analytics',
    color: '#1a1a2e',
    badge: 'EXEC',
  },
];

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
  <Card
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Loading Fallback
const LoadingFallback = ({ label }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: 2 }}>
    <CircularProgress size={60} />
    <Typography variant="body2" color="text.secondary">
      Loading {label}...
    </Typography>
  </Box>
);

const AIIntelligenceHub = () => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('aiHubActiveTab');
    return saved || 'predictor';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    predictionsToday: 0,
    anomaliesFound: 0,
    chatSessions: 0,
    strategiesCreated: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Permission check
  const hasPermission = (requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 5;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 5;
    return userLevel >= requiredLevel;
  };

  // Load stats
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count predictions
      const predictionsQuery = query(
        collection(db, 'scorePredictions'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const predictionsSnap = await getDocs(predictionsQuery);

      // Count anomaly reports
      const anomaliesQuery = query(
        collection(db, 'anomalyReports'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const anomaliesSnap = await getDocs(anomaliesQuery);

      // Count chat sessions
      const chatQuery = query(
        collection(db, 'coachConversations'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const chatSnap = await getDocs(chatQuery);

      // Count strategies
      const strategiesQuery = query(
        collection(db, 'strategyPlans'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const strategiesSnap = await getDocs(strategiesQuery);

      setStats({
        predictionsToday: predictionsSnap.size,
        anomaliesFound: anomaliesSnap.docs.reduce((sum, doc) => {
          return sum + (doc.data().results?.totalAnomaliesFound || 0);
        }, 0),
        chatSessions: chatSnap.size,
        strategiesCreated: strategiesSnap.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    const tab = TABS.find(t => t.id === newValue);
    if (tab && hasPermission(tab.permission)) {
      setActiveTab(newValue);
      localStorage.setItem('aiHubActiveTab', newValue);
      if (isMobile) setDrawerOpen(false);
    }
  };

  // Get accessible tabs
  const accessibleTabs = TABS.filter(tab => hasPermission(tab.permission));

  // Get active component
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;
  const activeTabConfig = TABS.find(t => t.id === activeTab);

  // Mobile drawer
  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{ sx: { width: 280 } }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              AI Hub
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {accessibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <ListItem
                key={tab.id}
                button
                onClick={() => handleTabChange(null, tab.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : tab.color, minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.label}
                      {tab.badge && (
                        <Chip
                          label={tab.badge}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : tab.color,
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={!isActive && tab.description}
                />
                {isActive && <ChevronRight />}
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white', mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Avatar sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
              <Psychology sx={{ fontSize: { xs: 28, md: 36 } }} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                AI Intelligence Hub
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Advanced AI-powered credit analysis and automation
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh Statistics">
            <IconButton onClick={loadStats} sx={{ color: 'white' }} disabled={statsLoading}>
              <Refresh sx={{ animation: statsLoading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {statsLoading ? '-' : stats.predictionsToday}
              </Typography>
              <Typography variant="caption">Predictions Made</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {statsLoading ? '-' : stats.anomaliesFound}
              </Typography>
              <Typography variant="caption">Anomalies Found</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {statsLoading ? '-' : stats.chatSessions}
              </Typography>
              <Typography variant="caption">Coach Sessions</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {statsLoading ? '-' : stats.strategiesCreated}
              </Typography>
              <Typography variant="caption">Strategies Created</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Feature Cards (on landing) */}
      {activeTab === 'overview' && (
        <Grid container spacing={3} sx={{ mb: 3, px: 2 }}>
          {accessibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={tab.id}>
                <StatsCard
                  icon={Icon}
                  title={tab.label}
                  value={tab.badge}
                  subtitle={tab.description}
                  color={tab.color}
                  onClick={() => handleTabChange(null, tab.id)}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Tabs (Desktop) */}
      {!isMobile && (
        <Paper sx={{ mb: 3, mx: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '0.95rem',
              },
            }}
          >
            {accessibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ color: tab.color }} />
                        <span>{tab.label}</span>
                        {tab.badge && (
                          <Chip
                            label={tab.badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor: tab.color,
                              color: 'white',
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {tab.description}
                      </Typography>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Paper>
      )}

      {/* Mobile Drawer */}
      {isMobile && renderMobileDrawer()}

      {/* Tab Description Bar */}
      {activeTabConfig && (
        <Box sx={{ px: 2, mb: 2 }}>
          <Alert
            severity="info"
            icon={<Star sx={{ color: activeTabConfig.color }} />}
            sx={{
              bgcolor: `${activeTabConfig.color}10`,
              borderLeft: `4px solid ${activeTabConfig.color}`,
            }}
          >
            <Typography variant="body2">
              <strong>{activeTabConfig.label}:</strong> {activeTabConfig.description}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ px: 2, pb: 4 }}>
        {ActiveComponent ? (
          <Suspense fallback={<LoadingFallback label={activeTabConfig?.label} />}>
            <ActiveComponent />
          </Suspense>
        ) : (
          <Alert severity="warning">
            You don't have permission to access this feature.
          </Alert>
        )}
      </Box>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default AIIntelligenceHub;
