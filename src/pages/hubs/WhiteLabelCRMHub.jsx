/**
 * WhiteLabelCRMHub.jsx
 *
 * White Label CRM Licensing - Enterprise AI Hub
 * Complete platform for licensing your CRM to other credit repair businesses
 *
 * Features:
 * - Partner onboarding and management
 * - White label customization (branding, domains, features)
 * - Revenue tracking and commission management
 * - Partner support and training resources
 * - AI-powered partner success predictions
 * - Multi-tenant administration
 * - Licensing tiers and pricing management
 * - Partner analytics and reporting
 *
 * @version 1.0.0
 * @date November 2025
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Switch,
  FormControlLabel,
  Slider,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Stack,
  Skeleton,
  Fade,
  Zoom,
  Collapse,
  InputAdornment,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';

import {
  Building2,
  Globe,
  Palette,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Shield,
  Zap,
  Star,
  Award,
  Crown,
  Gem,
  Rocket,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Brain,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  CalendarCheck,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Headphones,
  HelpCircle,
  BookOpen,
  GraduationCap,
  FileText,
  FilePlus,
  FolderOpen,
  Download,
  Upload,
  Share2,
  Link2,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List as ListIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExpandMore,
  MoreHorizontal,
  MoreVertical,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Power,
  ToggleLeft,
  ToggleRight,
  Layers,
  Package,
  Box as BoxIcon,
  Server,
  Database,
  Cloud,
  CloudUpload,
  Wifi,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  LayoutDashboard,
  PanelLeft,
  Image,
  Type,
  Brush,
  Droplet,
  Contrast,
  Sun,
  Moon,
  Sliders,
  Gauge,
  Percent,
  Calculator,
  Receipt,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  HandCoins,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Milestone,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Route,
  Send,
  Inbox,
  Bell,
  BellRing,
  Megaphone,
  Gift,
  PartyPopper,
  Confetti,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Handshake,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  UsersRound,
  Building,
  Store,
  ShoppingBag,
  Tag,
  Tags,
  Bookmark,
  Hash,
  AtSign,
  QrCode,
  Barcode,
  Fingerprint,
  ScanLine,
  Code,
  Terminal,
  Bug,
  TestTube,
  Wrench,
  Tool,
  Hammer,
  Cog,
  Settings2,
  SlidersHorizontal,
  LifeBuoy,
  Anchor,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  BadgeCheck,
  Verified,
  CircleDot,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon
} from 'lucide-react';

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STORAGE_KEY = 'white_label_crm_hub_tab';

const LICENSING_TIERS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 297,
    setupFee: 497,
    color: '#4CAF50',
    icon: Rocket,
    clients: 50,
    users: 3,
    features: ['Basic CRM', 'Email Support', 'Standard Templates', 'Basic Reporting'],
    commission: 15
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 597,
    setupFee: 997,
    color: '#2196F3',
    icon: Star,
    clients: 200,
    users: 10,
    features: ['Full CRM Suite', 'Priority Support', 'Custom Templates', 'Advanced Reporting', 'API Access'],
    commission: 20
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1297,
    setupFee: 2497,
    color: '#9C27B0',
    icon: Crown,
    clients: 'Unlimited',
    users: 'Unlimited',
    features: ['Full CRM Suite', 'Dedicated Support', 'White Glove Setup', 'Custom Development', 'Full API Access', 'Priority Features'],
    commission: 25
  },
  FRANCHISE: {
    id: 'franchise',
    name: 'Franchise',
    price: 2497,
    setupFee: 4997,
    color: '#FF9800',
    icon: Gem,
    clients: 'Unlimited',
    users: 'Unlimited',
    features: ['Everything in Enterprise', 'Sub-licensing Rights', 'Territory Exclusivity', 'Revenue Sharing', 'Co-marketing', 'Board Seat'],
    commission: 30
  }
};

const PARTNER_STATUS = {
  PENDING: { label: 'Pending', color: 'warning', icon: Clock },
  ACTIVE: { label: 'Active', color: 'success', icon: CheckCircle },
  SUSPENDED: { label: 'Suspended', color: 'error', icon: AlertCircle },
  CHURNED: { label: 'Churned', color: 'default', icon: XCircle }
};

const CUSTOMIZATION_CATEGORIES = [
  { id: 'branding', name: 'Branding', icon: Palette, description: 'Logo, colors, fonts' },
  { id: 'domain', name: 'Domain', icon: Globe, description: 'Custom domain setup' },
  { id: 'features', name: 'Features', icon: Layers, description: 'Module toggles' },
  { id: 'emails', name: 'Email Templates', icon: Mail, description: 'Custom email branding' },
  { id: 'documents', name: 'Documents', icon: FileText, description: 'Letterheads, contracts' },
  { id: 'integrations', name: 'Integrations', icon: Zap, description: 'Third-party connections' }
];

const CHART_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#795548'];

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPartners = [
  {
    id: 'WL-001',
    companyName: 'CreditPro Solutions',
    contactName: 'Michael Johnson',
    email: 'michael@creditpro.com',
    phone: '(555) 123-4567',
    tier: 'enterprise',
    status: 'active',
    joinDate: '2024-06-15',
    domain: 'app.creditprosolutions.com',
    activeClients: 847,
    monthlyRevenue: 1297,
    totalRevenue: 15564,
    commissionPaid: 3891,
    lastPayment: '2025-11-01',
    healthScore: 92,
    supportTickets: 2,
    customizations: ['branding', 'domain', 'emails', 'documents'],
    notes: 'Top performing partner. Expanding to 3 new states.'
  },
  {
    id: 'WL-002',
    companyName: 'Fresh Start Credit',
    contactName: 'Sarah Williams',
    email: 'sarah@freshstartcredit.com',
    phone: '(555) 234-5678',
    tier: 'professional',
    status: 'active',
    joinDate: '2024-09-20',
    domain: 'portal.freshstartcredit.com',
    activeClients: 312,
    monthlyRevenue: 597,
    totalRevenue: 4179,
    commissionPaid: 836,
    lastPayment: '2025-11-01',
    healthScore: 85,
    supportTickets: 5,
    customizations: ['branding', 'domain', 'emails'],
    notes: 'Growing steadily. Interested in upgrading to Enterprise.'
  },
  {
    id: 'WL-003',
    companyName: 'Credit Repair Masters',
    contactName: 'David Chen',
    email: 'david@creditrepairmasters.com',
    phone: '(555) 345-6789',
    tier: 'starter',
    status: 'active',
    joinDate: '2025-01-10',
    domain: null,
    activeClients: 45,
    monthlyRevenue: 297,
    totalRevenue: 2970,
    commissionPaid: 446,
    lastPayment: '2025-11-01',
    healthScore: 78,
    supportTickets: 8,
    customizations: ['branding'],
    notes: 'New partner, onboarding in progress.'
  },
  {
    id: 'WL-004',
    companyName: 'Elite Credit Services',
    contactName: 'Jennifer Martinez',
    email: 'jennifer@elitecreditservices.com',
    phone: '(555) 456-7890',
    tier: 'franchise',
    status: 'active',
    joinDate: '2024-03-01',
    domain: 'crm.elitecreditservices.com',
    activeClients: 2156,
    monthlyRevenue: 2497,
    totalRevenue: 52437,
    commissionPaid: 15731,
    lastPayment: '2025-11-01',
    healthScore: 98,
    supportTickets: 0,
    customizations: ['branding', 'domain', 'emails', 'documents', 'features', 'integrations'],
    notes: 'Franchise partner with sub-licensing in 5 territories.'
  },
  {
    id: 'WL-005',
    companyName: 'Quick Credit Fix',
    contactName: 'Robert Brown',
    email: 'robert@quickcreditfix.com',
    phone: '(555) 567-8901',
    tier: 'professional',
    status: 'suspended',
    joinDate: '2024-11-15',
    domain: 'app.quickcreditfix.com',
    activeClients: 0,
    monthlyRevenue: 0,
    totalRevenue: 1791,
    commissionPaid: 358,
    lastPayment: '2025-08-01',
    healthScore: 25,
    supportTickets: 12,
    customizations: ['branding', 'domain'],
    notes: 'Payment issues. Account suspended pending resolution.'
  }
];

const mockRevenueData = [
  { month: 'Jun', revenue: 8750, partners: 12, newPartners: 3 },
  { month: 'Jul', revenue: 10200, partners: 14, newPartners: 2 },
  { month: 'Aug', revenue: 12500, partners: 16, newPartners: 3 },
  { month: 'Sep', revenue: 14800, partners: 18, newPartners: 2 },
  { month: 'Oct', revenue: 16200, partners: 19, newPartners: 1 },
  { month: 'Nov', revenue: 18500, partners: 22, newPartners: 4 }
];

const mockTierDistribution = [
  { name: 'Starter', value: 8, color: '#4CAF50' },
  { name: 'Professional', value: 9, color: '#2196F3' },
  { name: 'Enterprise', value: 4, color: '#9C27B0' },
  { name: 'Franchise', value: 1, color: '#FF9800' }
];

const mockPendingApplications = [
  {
    id: 'APP-001',
    companyName: 'Credit Builders Inc',
    contactName: 'Amanda Lee',
    email: 'amanda@creditbuilders.com',
    phone: '(555) 678-9012',
    requestedTier: 'professional',
    submittedDate: '2025-11-20',
    businessYears: 3,
    currentClients: 85,
    website: 'www.creditbuilders.com',
    notes: 'Strong application. 3 years in business.',
    score: 85
  },
  {
    id: 'APP-002',
    companyName: 'New Horizon Credit',
    contactName: 'Thomas Wilson',
    email: 'thomas@newhorizoncredit.com',
    phone: '(555) 789-0123',
    requestedTier: 'starter',
    submittedDate: '2025-11-22',
    businessYears: 1,
    currentClients: 25,
    website: 'www.newhorizoncredit.com',
    notes: 'New business, enthusiastic owner.',
    score: 72
  }
];

const mockSupportTickets = [
  {
    id: 'TKT-001',
    partner: 'CreditPro Solutions',
    partnerId: 'WL-001',
    subject: 'Custom report integration',
    priority: 'medium',
    status: 'open',
    created: '2025-11-23',
    lastUpdate: '2025-11-24',
    assignee: 'Tech Support'
  },
  {
    id: 'TKT-002',
    partner: 'Fresh Start Credit',
    partnerId: 'WL-002',
    subject: 'Domain SSL certificate renewal',
    priority: 'high',
    status: 'in_progress',
    created: '2025-11-22',
    lastUpdate: '2025-11-24',
    assignee: 'DevOps'
  },
  {
    id: 'TKT-003',
    partner: 'Credit Repair Masters',
    partnerId: 'WL-003',
    subject: 'Email template customization help',
    priority: 'low',
    status: 'open',
    created: '2025-11-24',
    lastUpdate: '2025-11-24',
    assignee: 'Onboarding'
  }
];

const mockTrainingResources = [
  {
    id: 'TR-001',
    title: 'White Label Partner Onboarding Guide',
    type: 'document',
    category: 'Getting Started',
    downloads: 156,
    lastUpdated: '2025-10-15'
  },
  {
    id: 'TR-002',
    title: 'Branding Customization Walkthrough',
    type: 'video',
    category: 'Customization',
    duration: '18 min',
    views: 234,
    lastUpdated: '2025-09-20'
  },
  {
    id: 'TR-003',
    title: 'Domain Setup & SSL Configuration',
    type: 'video',
    category: 'Technical',
    duration: '12 min',
    views: 189,
    lastUpdated: '2025-10-01'
  },
  {
    id: 'TR-004',
    title: 'Partner Sales & Marketing Toolkit',
    type: 'document',
    category: 'Marketing',
    downloads: 98,
    lastUpdated: '2025-11-01'
  }
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend, trendLabel }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48 }}>
            <Icon size={24} />
          </Avatar>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              color={trend >= 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{value}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        {trendLabel && <Typography variant="caption" color="text.secondary">{trendLabel}</Typography>}
      </CardContent>
    </Card>
  );
};

const TierBadge = ({ tier, size = 'medium' }) => {
  const config = LICENSING_TIERS[tier?.toUpperCase()] || LICENSING_TIERS.STARTER;
  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon size={size === 'small' ? 14 : 16} />}
      label={config.name}
      size={size}
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        fontWeight: 600,
        borderColor: config.color,
        border: '1px solid'
      }}
    />
  );
};

const StatusBadge = ({ status }) => {
  const config = PARTNER_STATUS[status?.toUpperCase()] || PARTNER_STATUS.PENDING;
  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon size={14} />}
      label={config.label}
      size="small"
      color={config.color}
      variant="outlined"
    />
  );
};

const HealthScoreGauge = ({ score, size = 'medium' }) => {
  const getColor = (s) => {
    if (s >= 80) return '#4CAF50';
    if (s >= 60) return '#FF9800';
    return '#F44336';
  };

  const gaugeSize = size === 'small' ? 48 : size === 'large' ? 80 : 64;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={gaugeSize}
        thickness={4}
        sx={{ color: getColor(score) }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant={size === 'small' ? 'caption' : 'body2'} fontWeight={700}>
          {score}
        </Typography>
      </Box>
    </Box>
  );
};

const PartnerCard = ({ partner, onView, onEdit }) => {
  const theme = useTheme();
  const tierConfig = LICENSING_TIERS[partner.tier?.toUpperCase()] || LICENSING_TIERS.STARTER;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(tierConfig.color, 0.1), color: tierConfig.color, width: 48, height: 48 }}>
              <Building2 size={24} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{partner.companyName}</Typography>
              <Typography variant="body2" color="text.secondary">{partner.contactName}</Typography>
            </Box>
          </Box>
          <HealthScoreGauge score={partner.healthScore} size="small" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TierBadge tier={partner.tier} size="small" />
          <StatusBadge status={partner.status} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Active Clients</Typography>
            <Typography variant="h6" fontWeight={600}>{partner.activeClients.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Monthly Revenue</Typography>
            <Typography variant="h6" fontWeight={600}>${partner.monthlyRevenue.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
            <Typography variant="body2" fontWeight={600}>${partner.totalRevenue.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Commission Paid</Typography>
            <Typography variant="body2" fontWeight={600}>${partner.commissionPaid.toLocaleString()}</Typography>
          </Grid>
        </Grid>

        {partner.domain && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Globe size={14} />
            <Typography variant="caption" color="primary.main">
              {partner.domain}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {partner.customizations?.map(c => (
            <Chip key={c} label={c} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
          ))}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" startIcon={<Eye size={16} />} onClick={() => onView?.(partner)}>
          View
        </Button>
        <Button size="small" startIcon={<Edit size={16} />} onClick={() => onEdit?.(partner)}>
          Edit
        </Button>
        <Button size="small" startIcon={<MessageSquare size={16} />}>
          Contact
        </Button>
      </CardActions>
    </Card>
  );
};

// ============================================================================
// TAB PANELS
// ============================================================================

// Tab 0: Dashboard
const DashboardTab = ({ partners, revenueData }) => {
  const theme = useTheme();

  const activePartners = partners.filter(p => p.status === 'active');
  const totalMRR = activePartners.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const totalClients = activePartners.reduce((sum, p) => sum + p.activeClients, 0);
  const avgHealthScore = Math.round(activePartners.reduce((sum, p) => sum + p.healthScore, 0) / activePartners.length);

  return (
    <Box>
      {/* Welcome Banner */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              White Label Partner Network
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              Manage your white label partners, track revenue, and grow your licensing business.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                icon={<Users size={16} />}
                label={`${activePartners.length} Active Partners`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<DollarSign size={16} />}
                label={`$${totalMRR.toLocaleString()} MRR`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<TrendingUp size={16} />}
                label={`${avgHealthScore}% Avg Health`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<UserPlus size={20} />}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Add New Partner
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Users}
            title="Total Partners"
            value={partners.length}
            subtitle={`${activePartners.length} active`}
            color="#4CAF50"
            trend={18}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${totalMRR.toLocaleString()}`}
            subtitle="Recurring revenue"
            color="#2196F3"
            trend={12}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Building2}
            title="Partner Clients"
            value={totalClients.toLocaleString()}
            subtitle="Across all partners"
            color="#FF9800"
            trend={24}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Activity}
            title="Health Score"
            value={`${avgHealthScore}%`}
            subtitle="Average partner health"
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Revenue & Partner Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#4CAF50" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="partners" stroke="#2196F3" strokeWidth={2} name="Partners" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tier Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Partner Tiers
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={mockTierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockTierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {mockTierDistribution.map(tier => (
                <Chip
                  key={tier.name}
                  size="small"
                  label={`${tier.name}: ${tier.value}`}
                  sx={{ bgcolor: alpha(tier.color, 0.1), color: tier.color }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pending Applications
            </Typography>
            <List disablePadding>
              {mockPendingApplications.map((app, index) => (
                <React.Fragment key={app.id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <Building2 size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={app.companyName}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {app.contactName} • Requested: {LICENSING_TIERS[app.requestedTier?.toUpperCase()]?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Score: {app.score}/100 • {app.currentClients} current clients
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success">Approve</Button>
                      <Button size="small" variant="outlined">Review</Button>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Support Tickets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Open Support Tickets
            </Typography>
            <List disablePadding>
              {mockSupportTickets.map((ticket, index) => (
                <React.Fragment key={ticket.id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: ticket.priority === 'high' ? 'error.light' :
                                 ticket.priority === 'medium' ? 'warning.light' : 'grey.200'
                      }}>
                        <Headphones size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={ticket.subject}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {ticket.partner} • {ticket.assignee}
                          </Typography>
                          <Chip
                            label={ticket.status.replace('_', ' ')}
                            size="small"
                            color={ticket.status === 'open' ? 'warning' : 'info'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                    <Button size="small">View</Button>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 1: Partner Management
const PartnerManagementTab = ({ partners }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = partner.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           partner.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'all' || partner.tier === selectedTier;
      const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [partners, searchQuery, selectedTier, selectedStatus]);

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tier</InputLabel>
              <Select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)} label="Tier">
                <MenuItem value="all">All Tiers</MenuItem>
                {Object.values(LICENSING_TIERS).map(tier => (
                  <MenuItem key={tier.id} value={tier.id}>{tier.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Status">
                <MenuItem value="all">All Statuses</MenuItem>
                {Object.entries(PARTNER_STATUS).map(([key, config]) => (
                  <MenuItem key={key} value={key.toLowerCase()}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
                <Grid3X3 size={20} />
              </IconButton>
              <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? 'primary' : 'default'}>
                <ListIcon size={20} />
              </IconButton>
              <Button variant="contained" startIcon={<UserPlus size={18} />}>
                Add Partner
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Partner Grid/List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredPartners.map(partner => (
            <Grid item xs={12} sm={6} md={4} key={partner.id}>
              <PartnerCard partner={partner} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Clients</TableCell>
                <TableCell align="right">MRR</TableCell>
                <TableCell align="center">Health</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPartners.map(partner => (
                <TableRow key={partner.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <Building2 size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{partner.companyName}</Typography>
                        <Typography variant="caption" color="text.secondary">{partner.contactName}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><TierBadge tier={partner.tier} size="small" /></TableCell>
                  <TableCell><StatusBadge status={partner.status} /></TableCell>
                  <TableCell align="right">{partner.activeClients.toLocaleString()}</TableCell>
                  <TableCell align="right">${partner.monthlyRevenue.toLocaleString()}</TableCell>
                  <TableCell align="center"><HealthScoreGauge score={partner.healthScore} size="small" /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small"><Eye size={16} /></IconButton>
                    <IconButton size="small"><Edit size={16} /></IconButton>
                    <IconButton size="small"><MoreHorizontal size={16} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredPartners.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No partners found matching your criteria.
        </Alert>
      )}
    </Box>
  );
};

// Tab 2: Licensing Tiers
const LicensingTiersTab = () => {
  const theme = useTheme();

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          White Label Licensing Tiers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your licensing tiers, pricing, and features for white label partners.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {Object.values(LICENSING_TIERS).map((tier, index) => {
          const Icon = tier.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={tier.id}>
              <Card sx={{
                height: '100%',
                border: `2px solid ${tier.color}`,
                position: 'relative',
                overflow: 'visible'
              }}>
                {tier.id === 'enterprise' && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: alpha(tier.color, 0.1),
                      color: tier.color,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Icon size={32} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: tier.color }}>
                    {tier.name}
                  </Typography>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      ${tier.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">/month</Typography>
                    <Typography variant="caption" color="text.secondary">
                      + ${tier.setupFee} setup fee
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: 'left', mb: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Users size={16} /> Up to {tier.clients} clients
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <UserCheck size={16} /> {tier.users} team members
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Percent size={16} /> {tier.commission}% commission
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense disablePadding>
                    {tier.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle size={16} color={tier.color} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2">{feature}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button fullWidth variant="outlined" sx={{ borderColor: tier.color, color: tier.color }}>
                    Edit Tier
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Commission Structure */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Commission Structure
        </Typography>
        <Grid container spacing={3}>
          {Object.values(LICENSING_TIERS).map(tier => (
            <Grid item xs={6} sm={3} key={tier.id}>
              <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: alpha(tier.color, 0.05) }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: tier.color }}>
                  {tier.commission}%
                </Typography>
                <Typography variant="body2">{tier.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ${Math.round(tier.price * tier.commission / 100)}/mo per partner
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

// Tab 3: Customization
const CustomizationTab = () => {
  const [selectedPartner, setSelectedPartner] = useState(mockPartners[0]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Partner Customization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure white label settings for each partner
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Partner</InputLabel>
              <Select
                value={selectedPartner?.id || ''}
                onChange={(e) => setSelectedPartner(mockPartners.find(p => p.id === e.target.value))}
                label="Select Partner"
              >
                {mockPartners.filter(p => p.status === 'active').map(partner => (
                  <MenuItem key={partner.id} value={partner.id}>
                    {partner.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedPartner && (
        <Grid container spacing={3}>
          {CUSTOMIZATION_CATEGORIES.map(category => {
            const Icon = category.icon;
            const isEnabled = selectedPartner.customizations?.includes(category.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: isEnabled ? 'primary.light' : 'grey.200' }}>
                        <Icon size={24} />
                      </Avatar>
                      <Switch checked={isEnabled} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant={isEnabled ? 'contained' : 'outlined'}
                      disabled={!isEnabled}
                      startIcon={<Settings size={16} />}
                    >
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Branding Preview */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Branding Preview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Logo Preview</Typography>
              <Avatar sx={{ width: 120, height: 120, mx: 'auto', bgcolor: 'grey.200' }}>
                <Image size={48} />
              </Avatar>
              <Button size="small" sx={{ mt: 2 }} startIcon={<Upload size={16} />}>
                Upload Logo
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Color Palette</Typography>
            <Grid container spacing={2}>
              {['Primary', 'Secondary', 'Accent', 'Background'].map(color => (
                <Grid item xs={6} key={color}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.main', border: '1px solid', borderColor: 'divider' }} />
                    <Box>
                      <Typography variant="body2">{color}</Typography>
                      <Typography variant="caption" color="text.secondary">#1976d2</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Tab 4: Revenue & Commissions
const RevenueTab = ({ partners, revenueData }) => {
  const theme = useTheme();

  const activePartners = partners.filter(p => p.status === 'active');
  const totalRevenue = activePartners.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCommissions = activePartners.reduce((sum, p) => sum + p.commissionPaid, 0);
  const totalMRR = activePartners.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const projectedARR = totalMRR * 12;

  return (
    <Box>
      {/* Revenue Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="All time"
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Coins}
            title="MRR"
            value={`$${totalMRR.toLocaleString()}`}
            subtitle="Monthly recurring"
            color="#2196F3"
            trend={12}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={TrendingUp}
            title="Projected ARR"
            value={`$${projectedARR.toLocaleString()}`}
            subtitle="Annual run rate"
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={HandCoins}
            title="Commissions Paid"
            value={`$${totalCommissions.toLocaleString()}`}
            subtitle="To partners"
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue by Tier */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Revenue by Tier
            </Typography>
            <Stack spacing={2}>
              {Object.values(LICENSING_TIERS).map(tier => {
                const tierPartners = activePartners.filter(p => p.tier === tier.id);
                const tierRevenue = tierPartners.reduce((sum, p) => sum + p.monthlyRevenue, 0);
                const percentage = totalMRR > 0 ? Math.round((tierRevenue / totalMRR) * 100) : 0;

                return (
                  <Box key={tier.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{tier.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>${tierRevenue.toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(tier.color, 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: tier.color }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {tierPartners.length} partners • {percentage}% of MRR
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Partner Revenue Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Partner Revenue Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Partner</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell align="right">MRR</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                    <TableCell align="right">Commission Rate</TableCell>
                    <TableCell align="right">Commission Paid</TableCell>
                    <TableCell align="right">Last Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activePartners.map(partner => {
                    const tier = LICENSING_TIERS[partner.tier?.toUpperCase()] || LICENSING_TIERS.STARTER;
                    return (
                      <TableRow key={partner.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{partner.companyName}</Typography>
                        </TableCell>
                        <TableCell><TierBadge tier={partner.tier} size="small" /></TableCell>
                        <TableCell align="right">${partner.monthlyRevenue.toLocaleString()}</TableCell>
                        <TableCell align="right">${partner.totalRevenue.toLocaleString()}</TableCell>
                        <TableCell align="right">{tier.commission}%</TableCell>
                        <TableCell align="right">${partner.commissionPaid.toLocaleString()}</TableCell>
                        <TableCell align="right">{partner.lastPayment}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 5: Partner Support
const PartnerSupportTab = () => {
  const [ticketFilter, setTicketFilter] = useState('all');

  const filteredTickets = mockSupportTickets.filter(t =>
    ticketFilter === 'all' || t.status === ticketFilter
  );

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Support Stats */}
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Headphones}
            title="Open Tickets"
            value={mockSupportTickets.filter(t => t.status === 'open').length}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Clock}
            title="In Progress"
            value={mockSupportTickets.filter(t => t.status === 'in_progress').length}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={CheckCircle}
            title="Resolved Today"
            value={5}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            icon={Activity}
            title="Avg Response"
            value="2.4h"
            subtitle="Last 7 days"
            color="#9C27B0"
          />
        </Grid>

        {/* Ticket List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Support Tickets
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setTicketFilter('all')}
                  color={ticketFilter === 'all' ? 'primary' : 'default'}
                  variant={ticketFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Open"
                  onClick={() => setTicketFilter('open')}
                  color={ticketFilter === 'open' ? 'warning' : 'default'}
                  variant={ticketFilter === 'open' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="In Progress"
                  onClick={() => setTicketFilter('in_progress')}
                  color={ticketFilter === 'in_progress' ? 'info' : 'default'}
                  variant={ticketFilter === 'in_progress' ? 'filled' : 'outlined'}
                />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Last Update</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map(ticket => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{ticket.id}</Typography>
                      </TableCell>
                      <TableCell>{ticket.partner}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          size="small"
                          color={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status.replace('_', ' ')}
                          size="small"
                          color={ticket.status === 'open' ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell>{ticket.assignee}</TableCell>
                      <TableCell>{ticket.lastUpdate}</TableCell>
                      <TableCell align="right">
                        <Button size="small">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 6: Training Resources
const TrainingResourcesTab = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Partner Training Resources
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Documentation, videos, and guides for your white label partners
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button variant="contained" startIcon={<FilePlus size={18} />}>
              Add Resource
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {mockTrainingResources.map(resource => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar sx={{
                    bgcolor: resource.type === 'video' ? 'error.light' : 'primary.light',
                    width: 48,
                    height: 48
                  }}>
                    {resource.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                  </Avatar>
                  <Box>
                    <Chip label={resource.category} size="small" variant="outlined" />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {resource.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {resource.type === 'video' ? (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {resource.duration}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Eye size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {resource.views} views
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      <Download size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {resource.downloads} downloads
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Updated: {resource.lastUpdated}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={resource.type === 'video' ? <Video size={16} /> : <Download size={16} />}
                >
                  {resource.type === 'video' ? 'Watch' : 'Download'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Tab 7: Applications
const ApplicationsTab = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Partner Applications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and process white label partner applications
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {mockPendingApplications.map(app => (
          <Grid item xs={12} key={app.id}>
            <Card>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.light' }}>
                        <Building2 size={28} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{app.companyName}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.contactName}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Requested Tier</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <TierBadge tier={app.requestedTier} />
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Application Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <HealthScoreGauge score={app.score} size="small" />
                      <Typography variant="body2" fontWeight={600}>{app.score}/100</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">Business Details</Typography>
                    <Typography variant="body2">{app.businessYears} years in business</Typography>
                    <Typography variant="body2">{app.currentClients} current clients</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Stack spacing={1}>
                      <Button fullWidth variant="contained" color="success" startIcon={<CheckCircle size={16} />}>
                        Approve
                      </Button>
                      <Button fullWidth variant="outlined" startIcon={<Eye size={16} />}>
                        Review
                      </Button>
                      <Button fullWidth variant="outlined" color="error" startIcon={<XCircle size={16} />}>
                        Decline
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {mockPendingApplications.length === 0 && (
        <Alert severity="info">
          No pending applications at this time.
        </Alert>
      )}
    </Box>
  );
};

// Tab 8: AI Partner Insights
const AIInsightsTab = ({ partners }) => {
  const [analyzing, setAnalyzing] = useState(false);

  const atRiskPartners = partners.filter(p => p.healthScore < 60);
  const growthOpportunities = partners.filter(p => p.healthScore >= 80 && p.tier !== 'franchise');

  return (
    <Box>
      <Paper sx={{
        p: 3,
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Brain size={32} />
              <Typography variant="h5" fontWeight={700}>AI Partner Intelligence</Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              AI-powered insights to optimize partner success and identify growth opportunities.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
              onClick={() => setAnalyzing(true)}
              disabled={analyzing}
              sx={{ bgcolor: 'white', color: 'primary.main' }}
            >
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* At Risk Partners */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AlertCircle size={20} color="#F44336" />
              <Typography variant="h6" fontWeight={600}>At-Risk Partners</Typography>
              <Chip label={atRiskPartners.length} size="small" color="error" />
            </Box>
            {atRiskPartners.length > 0 ? (
              <List disablePadding>
                {atRiskPartners.map(partner => (
                  <ListItem key={partner.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <HealthScoreGauge score={partner.healthScore} size="small" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={partner.companyName}
                      secondary={
                        <Typography variant="caption" color="error">
                          {partner.supportTickets} open tickets • MRR dropped
                        </Typography>
                      }
                    />
                    <Button size="small" color="error">Intervene</Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="success" icon={<CheckCircle />}>
                All partners are healthy! No intervention needed.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Upgrade Opportunities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp size={20} color="#4CAF50" />
              <Typography variant="h6" fontWeight={600}>Upgrade Opportunities</Typography>
              <Chip label={growthOpportunities.length} size="small" color="success" />
            </Box>
            <List disablePadding>
              {growthOpportunities.slice(0, 3).map(partner => {
                const currentTier = LICENSING_TIERS[partner.tier?.toUpperCase()];
                const nextTierKey = Object.keys(LICENSING_TIERS)[Object.keys(LICENSING_TIERS).indexOf(partner.tier?.toUpperCase()) + 1];
                const nextTier = LICENSING_TIERS[nextTierKey];

                return (
                  <ListItem key={partner.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <ArrowUpRight size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={partner.companyName}
                      secondary={
                        nextTier ? (
                          <Typography variant="caption" color="success.main">
                            Ready for {nextTier.name} upgrade (+${nextTier.price - currentTier.price}/mo)
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            At highest tier
                          </Typography>
                        )
                      }
                    />
                    {nextTier && <Button size="small" color="success">Offer Upgrade</Button>}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={20} /> AI Recommendations
            </Typography>
            <Grid container spacing={2}>
              {[
                { title: 'Launch Partner Webinar', description: 'High engagement predicted. 15 partners interested in advanced features training.', impact: 'High', icon: Video },
                { title: 'Offer Q4 Promotion', description: 'Seasonal upgrade incentive could convert 3 Professional partners to Enterprise.', impact: 'Medium', icon: Gift },
                { title: 'Improve Onboarding', description: 'New partners taking 2 weeks longer than average. Streamline setup process.', impact: 'High', icon: Rocket },
                { title: 'Add Slack Integration', description: '8 partners requested this feature. Could improve retention by 15%.', impact: 'Medium', icon: MessageSquare }
              ].map((rec, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <rec.icon size={20} />
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>{rec.title}</Typography>
                          <Chip
                            label={rec.impact}
                            size="small"
                            color={rec.impact === 'High' ? 'error' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">{rec.description}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Tab 9: Settings
const SettingsTab = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          White Label Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure global settings for your white label program
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              General Settings
            </Typography>
            <Stack spacing={3}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Accept new partner applications"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Auto-approve starter tier applications"
              />
              <FormControlLabel
                control={<Switch />}
                label="Require business verification"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Send welcome email to new partners"
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Commission Settings
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Payment Schedule"
                select
                defaultValue="monthly"
                fullWidth
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </TextField>
              <TextField
                label="Minimum Payout"
                type="number"
                defaultValue={100}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                fullWidth
              />
              <TextField
                label="Payment Method"
                select
                defaultValue="ach"
                fullWidth
              >
                <MenuItem value="ach">ACH Transfer</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="check">Check</MenuItem>
              </TextField>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Default Customization Options
            </Typography>
            <Grid container spacing={2}>
              {CUSTOMIZATION_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Grid item xs={6} sm={4} md={2} key={cat.id}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 1 }}>
                        <Icon size={20} />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{cat.name}</Typography>
                      <FormControlLabel
                        control={<Switch size="small" defaultChecked />}
                        label=""
                        sx={{ mt: 1 }}
                      />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WhiteLabelCRMHub = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState(mockPartners);
  const [revenueData, setRevenueData] = useState(mockRevenueData);

  // Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeTab.toString());
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Tab Configuration
  const tabs = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Partners', icon: Users },
    { label: 'Licensing Tiers', icon: Layers },
    { label: 'Customization', icon: Palette },
    { label: 'Revenue', icon: DollarSign },
    { label: 'Support', icon: Headphones },
    { label: 'Training', icon: GraduationCap },
    { label: 'Applications', icon: FilePlus },
    { label: 'AI Insights', icon: Brain },
    { label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading White Label Hub...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <Building2 size={32} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              White Label CRM Licensing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your white label partner network and grow your licensing business
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip icon={<Sparkles size={16} />} label="AI-Powered" color="primary" />
            <Chip icon={<Crown size={16} />} label="Enterprise" color="secondary" />
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={<tab.icon size={20} />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ minHeight: '60vh' }}>
        {activeTab === 0 && <DashboardTab partners={partners} revenueData={revenueData} />}
        {activeTab === 1 && <PartnerManagementTab partners={partners} />}
        {activeTab === 2 && <LicensingTiersTab />}
        {activeTab === 3 && <CustomizationTab />}
        {activeTab === 4 && <RevenueTab partners={partners} revenueData={revenueData} />}
        {activeTab === 5 && <PartnerSupportTab />}
        {activeTab === 6 && <TrainingResourcesTab />}
        {activeTab === 7 && <ApplicationsTab />}
        {activeTab === 8 && <AIInsightsTab partners={partners} />}
        {activeTab === 9 && <SettingsTab />}
      </Box>
    </Container>
  );
};

export default WhiteLabelCRMHub;
