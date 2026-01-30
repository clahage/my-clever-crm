// =============================================================================
// Path: /src/components/credit/CreditReportDisplay.jsx
// =============================================================================
// SPEEDY CREDIT REPAIR - ULTIMATE CREDIT REPORT DISPLAY
// =============================================================================
// A stunning, professional credit report display component that showcases
// ALL accounts from the IDIQ credit report with maximum visual impact.
// This is the prospect's FIRST IMPRESSION of your company - make it count!
// =============================================================================
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ===== MATERIAL-UI IMPORTS =====
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Button,
  ButtonGroup,
  Skeleton,
  useTheme,
  alpha,
  Fade,
  Grow,
  Slide,
  Zoom,
} from '@mui/material';

// ===== LUCIDE REACT ICONS =====
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Building2,
  Home,
  Car,
  GraduationCap,
  ShoppingBag,
  Banknote,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sparkles,
  Target,
  Zap,
  Award,
  FileText,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CircleDot,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Printer,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  Briefcase,
  Scale,
  Gavel,
  FileWarning,
  BadgeCheck,
  CircleCheck,
  CircleX,
  CircleMinus,
  Activity,
  Gauge,
} from 'lucide-react';

// =============================================================================
// SECTION: CONSTANTS AND CONFIGURATION
// =============================================================================

// ===== SCORE RANGES FOR COLORING =====
const SCORE_RANGES = {
  EXCELLENT: { min: 750, max: 850, label: 'Excellent', color: '#00C853', gradient: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)' },
  GOOD: { min: 700, max: 749, label: 'Good', color: '#64DD17', gradient: 'linear-gradient(135deg, #64DD17 0%, #AEEA00 100%)' },
  FAIR: { min: 650, max: 699, label: 'Fair', color: '#FFD600', gradient: 'linear-gradient(135deg, #FFD600 0%, #FFFF00 100%)' },
  POOR: { min: 550, max: 649, label: 'Poor', color: '#FF9100', gradient: 'linear-gradient(135deg, #FF9100 0%, #FFAB40 100%)' },
  VERY_POOR: { min: 300, max: 549, label: 'Very Poor', color: '#FF1744', gradient: 'linear-gradient(135deg, #FF1744 0%, #FF5252 100%)' },
};

// ===== BUREAU COLORS =====
const BUREAU_COLORS = {
  TransUnion: { primary: '#0066CC', secondary: '#E3F2FD', text: '#0D47A1', gradient: 'linear-gradient(135deg, #0066CC 0%, #42A5F5 100%)' },
  Experian: { primary: '#9C27B0', secondary: '#F3E5F5', text: '#6A1B9A', gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)' },
  Equifax: { primary: '#D32F2F', secondary: '#FFEBEE', text: '#B71C1C', gradient: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)' },
};

// ===== ACCOUNT TYPE ICONS =====
const ACCOUNT_TYPE_ICONS = {
  'Credit Card': CreditCard,
  'Revolving': CreditCard,
  'Mortgage': Home,
  'Real Estate': Home,
  'Auto Loan': Car,
  'Auto': Car,
  'Student Loan': GraduationCap,
  'Education': GraduationCap,
  'Personal Loan': Banknote,
  'Installment': Banknote,
  'Collection': FileWarning,
  'Collections': FileWarning,
  'Charge Account': ShoppingBag,
  'Retail': ShoppingBag,
  'Line of Credit': Building2,
  'Business': Briefcase,
  'Medical': Activity,
  'Other': CircleDot,
  'Unknown': HelpCircle,
};

// ===== ACCOUNT STATUS COLORS =====
const STATUS_COLORS = {
  'Open': { color: '#00C853', bg: '#E8F5E9', icon: CircleCheck },
  'Current': { color: '#00C853', bg: '#E8F5E9', icon: CircleCheck },
  'Paid': { color: '#2196F3', bg: '#E3F2FD', icon: BadgeCheck },
  'Closed': { color: '#9E9E9E', bg: '#F5F5F5', icon: CircleMinus },
  'Late': { color: '#FF9100', bg: '#FFF3E0', icon: AlertCircle },
  'Delinquent': { color: '#FF5722', bg: '#FBE9E7', icon: AlertTriangle },
  'Collection': { color: '#F44336', bg: '#FFEBEE', icon: FileWarning },
  'Charge-Off': { color: '#D32F2F', bg: '#FFCDD2', icon: CircleX },
  'Derogatory': { color: '#B71C1C', bg: '#FFCDD2', icon: ShieldAlert },
  'Unknown': { color: '#757575', bg: '#EEEEEE', icon: HelpCircle },
};

// ===== PAYMENT STATUS COLORS =====
const PAYMENT_STATUS_COLORS = {
  'Current': { color: '#00C853', label: 'On Time' },
  'Paid as Agreed': { color: '#00C853', label: 'Paid as Agreed' },
  'OK': { color: '#00C853', label: 'OK' },
  '30 Days Late': { color: '#FFB300', label: '30 Days Late' },
  '60 Days Late': { color: '#FF9100', label: '60 Days Late' },
  '90 Days Late': { color: '#FF5722', label: '90 Days Late' },
  '120+ Days Late': { color: '#F44336', label: '120+ Days Late' },
  'Collection': { color: '#D32F2F', label: 'In Collection' },
  'Charge-Off': { color: '#B71C1C', label: 'Charged Off' },
  'Unknown': { color: '#757575', label: 'Unknown' },
};

// =============================================================================
// SECTION: UTILITY FUNCTIONS
// =============================================================================

// ===== GET SCORE RANGE INFO =====
const getScoreRange = (score) => {
  if (!score || score < 300) return SCORE_RANGES.VERY_POOR;
  if (score >= 750) return SCORE_RANGES.EXCELLENT;
  if (score >= 700) return SCORE_RANGES.GOOD;
  if (score >= 650) return SCORE_RANGES.FAIR;
  if (score >= 550) return SCORE_RANGES.POOR;
  return SCORE_RANGES.VERY_POOR;
};

// ===== FORMAT CURRENCY =====
const formatCurrency = (value) => {
  if (!value || value === '0' || value === 0) return '$0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// ===== FORMAT DATE =====
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// ===== MASK ACCOUNT NUMBER =====
const maskAccountNumber = (accountNum, showFull = false) => {
  if (!accountNum || accountNum === '****') return '••••';
  if (showFull) return accountNum;
  const str = String(accountNum);
  if (str.length <= 4) return '••••' + str;
  return '••••' + str.slice(-4);
};

// ===== GET ACCOUNT TYPE ICON =====
const getAccountTypeIcon = (accountType) => {
  if (!accountType) return ACCOUNT_TYPE_ICONS['Unknown'];
  const type = accountType.toLowerCase();
  for (const [key, Icon] of Object.entries(ACCOUNT_TYPE_ICONS)) {
    if (type.includes(key.toLowerCase())) return Icon;
  }
  return ACCOUNT_TYPE_ICONS['Other'];
};

// ===== GET STATUS INFO =====
const getStatusInfo = (status) => {
  if (!status) return STATUS_COLORS['Unknown'];
  const statusLower = status.toLowerCase();
  for (const [key, info] of Object.entries(STATUS_COLORS)) {
    if (statusLower.includes(key.toLowerCase())) return info;
  }
  return STATUS_COLORS['Unknown'];
};

// =============================================================================
// SECTION: ANIMATED SCORE GAUGE COMPONENT
// =============================================================================

const AnimatedScoreGauge = ({ score, label, bureau, size = 'large', delay = 0 }) => {
  const theme = useTheme();
  const [animatedScore, setAnimatedScore] = useState(300);
  const [isVisible, setIsVisible] = useState(false);
  const scoreRange = getScoreRange(score);
  
  // ===== SIZE CONFIGURATIONS =====
  const sizes = {
    small: { width: 140, height: 100, fontSize: 28, strokeWidth: 8 },
    medium: { width: 180, height: 130, fontSize: 36, strokeWidth: 10 },
    large: { width: 240, height: 170, fontSize: 48, strokeWidth: 12 },
  };
  
  const config = sizes[size] || sizes.medium;
  
  // ===== ANIMATION EFFECT =====
  useEffect(() => {
    const visibilityTimer = setTimeout(() => setIsVisible(true), delay);
    
    const animationTimer = setTimeout(() => {
      const duration = 2000;
      const startTime = performance.now();
      const startScore = 300;
      const targetScore = score || 300;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const currentScore = Math.round(startScore + (targetScore - startScore) * easeOutExpo);
        
        setAnimatedScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay + 300);
    
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(animationTimer);
    };
  }, [score, delay]);
  
  // ===== GAUGE CALCULATIONS =====
  const percentage = ((animatedScore - 300) / 550) * 100;
  const circumference = Math.PI * (config.width - config.strokeWidth);
  const offset = circumference - (percentage / 100) * circumference;
  
  // ===== BUREAU STYLING =====
  const bureauStyle = bureau ? BUREAU_COLORS[bureau] : null;
  
  return (
    <Fade in={isVisible} timeout={800}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Bureau Label */}
        {bureau && (
          <Chip
            label={bureau}
            size="small"
            sx={{
              mb: 1,
              background: bureauStyle?.gradient || theme.palette.primary.main,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          />
        )}
        
        {/* SVG Gauge */}
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          style={{ overflow: 'visible' }}
        >
          {/* Background Arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.height - 10}
                A ${(config.width - config.strokeWidth) / 2} ${(config.width - config.strokeWidth) / 2} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height - 10}`}
            fill="none"
            stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored Progress Arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.height - 10}
                A ${(config.width - config.strokeWidth) / 2} ${(config.width - config.strokeWidth) / 2} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height - 10}`}
            fill="none"
            stroke={scoreRange.color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s ease-out',
              filter: `drop-shadow(0 0 8px ${alpha(scoreRange.color, 0.5)})`,
            }}
          />
          
          {/* Score Text */}
          <text
            x={config.width / 2}
            y={config.height - 35}
            textAnchor="middle"
            style={{
              fontSize: config.fontSize,
              fontWeight: 700,
              fontFamily: '"DM Sans", "Segoe UI", sans-serif',
              fill: theme.palette.text.primary,
            }}
          >
            {animatedScore}
          </text>
          
          {/* Score Range Label */}
          <text
            x={config.width / 2}
            y={config.height - 5}
            textAnchor="middle"
            style={{
              fontSize: config.fontSize * 0.35,
              fontWeight: 600,
              fontFamily: '"DM Sans", "Segoe UI", sans-serif',
              fill: scoreRange.color,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {scoreRange.label}
          </text>
          
          {/* Min/Max Labels */}
          <text
            x={config.strokeWidth}
            y={config.height + 5}
            textAnchor="start"
            style={{
              fontSize: 10,
              fill: theme.palette.text.secondary,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            300
          </text>
          <text
            x={config.width - config.strokeWidth}
            y={config.height + 5}
            textAnchor="end"
            style={{
              fontSize: 10,
              fill: theme.palette.text.secondary,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            850
          </text>
        </svg>
        
        {/* Custom Label */}
        {label && (
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

// =============================================================================
// SECTION: CREDIT SUMMARY CARD COMPONENT
// =============================================================================

const CreditSummaryCard = ({ icon: Icon, title, value, subtitle, trend, color, delay = 0 }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <Grow in={isVisible} timeout={600}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(145deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
            : `linear-gradient(145deg, ${alpha(color, 0.08)} 0%, #fff 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
            borderColor: alpha(color, 0.4),
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
              }}
            >
              <Icon size={24} color="#fff" />
            </Box>
            {trend && (
              <Chip
                size="small"
                icon={trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                sx={{
                  bgcolor: trend > 0 ? alpha('#00C853', 0.1) : alpha('#FF1744', 0.1),
                  color: trend > 0 ? '#00C853' : '#FF1744',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Box>
          
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {value}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                display: 'block',
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

// =============================================================================
// SECTION: ACCOUNTS TABLE COMPONENT
// =============================================================================

const AccountsTable = ({ accounts, showAccountNumbers = false }) => {
  const theme = useTheme();
  
  // ===== STATE =====
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('balance');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [bureauFilter, setBureauFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // ===== FILTERING AND SORTING =====
  const filteredAccounts = useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) return [];
    
    return accounts.filter(account => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const creditorMatch = (account.creditorName || account.creditor || '').toLowerCase().includes(query);
        const accountMatch = (account.accountNumber || '').toLowerCase().includes(query);
        if (!creditorMatch && !accountMatch) return false;
      }
      
      // Bureau filter
      if (bureauFilter !== 'all' && account.bureau !== bureauFilter) return false;
      
      // Status filter
      if (statusFilter !== 'all') {
        const accountStatus = (account.accountStatus || account.status || '').toLowerCase();
        if (!accountStatus.includes(statusFilter.toLowerCase())) return false;
      }
      
      // Type filter
      if (typeFilter !== 'all') {
        const accountType = (account.accountType || account.type || '').toLowerCase();
        if (!accountType.includes(typeFilter.toLowerCase())) return false;
      }
      
      return true;
    });
  }, [accounts, searchQuery, bureauFilter, statusFilter, typeFilter]);
  
  const sortedAccounts = useMemo(() => {
    const comparator = (a, b) => {
      let aVal, bVal;
      
      switch (orderBy) {
        case 'creditor':
          aVal = (a.creditorName || a.creditor || '').toLowerCase();
          bVal = (b.creditorName || b.creditor || '').toLowerCase();
          break;
        case 'balance':
          aVal = parseFloat(String(a.currentBalance || a.balance || 0).replace(/[^0-9.-]/g, '')) || 0;
          bVal = parseFloat(String(b.currentBalance || b.balance || 0).replace(/[^0-9.-]/g, '')) || 0;
          break;
        case 'limit':
          aVal = parseFloat(String(a.creditLimit || a.limit || 0).replace(/[^0-9.-]/g, '')) || 0;
          bVal = parseFloat(String(b.creditLimit || b.limit || 0).replace(/[^0-9.-]/g, '')) || 0;
          break;
        case 'dateOpened':
          aVal = new Date(a.dateOpened || 0).getTime();
          bVal = new Date(b.dateOpened || 0).getTime();
          break;
        case 'bureau':
          aVal = a.bureau || '';
          bVal = b.bureau || '';
          break;
        default:
          aVal = a[orderBy] || '';
          bVal = b[orderBy] || '';
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    };
    
    return [...filteredAccounts].sort(comparator);
  }, [filteredAccounts, orderBy, order]);
  
  // ===== GET UNIQUE VALUES FOR FILTERS =====
  const uniqueBureaus = useMemo(() => {
    if (!accounts) return [];
    return [...new Set(accounts.map(a => a.bureau).filter(Boolean))];
  }, [accounts]);
  
  const uniqueStatuses = useMemo(() => {
    if (!accounts) return [];
    return [...new Set(accounts.map(a => a.accountStatus || a.status).filter(Boolean))];
  }, [accounts]);
  
  const uniqueTypes = useMemo(() => {
    if (!accounts) return [];
    return [...new Set(accounts.map(a => a.accountType || a.type).filter(Boolean))];
  }, [accounts]);
  
  // ===== HANDLERS =====
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // ===== CALCULATE UTILIZATION =====
  const calculateUtilization = (balance, limit) => {
    const bal = parseFloat(String(balance || 0).replace(/[^0-9.-]/g, '')) || 0;
    const lim = parseFloat(String(limit || 0).replace(/[^0-9.-]/g, '')) || 0;
    if (lim <= 0) return null;
    return Math.round((bal / lim) * 100);
  };
  
  // ===== RENDER UTILIZATION BAR =====
  const renderUtilizationBar = (utilization) => {
    if (utilization === null) return null;
    
    let color = '#00C853';
    if (utilization > 75) color = '#FF1744';
    else if (utilization > 50) color = '#FF9100';
    else if (utilization > 30) color = '#FFD600';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
        <Box sx={{ flex: 1, bgcolor: alpha(color, 0.2), borderRadius: 1, height: 6 }}>
          <Box
            sx={{
              width: `${Math.min(utilization, 100)}%`,
              bgcolor: color,
              borderRadius: 1,
              height: '100%',
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color, fontWeight: 600, minWidth: 35 }}>
          {utilization}%
        </Typography>
      </Box>
    );
  };
  
  // ===== PAGINATED DATA =====
  const paginatedAccounts = sortedAccounts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  if (!accounts || accounts.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary">
          No Accounts Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Credit report data is still loading or no accounts were detected.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {/* ===== FILTERS SECTION ===== */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search creditors..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          
          {/* Bureau Filter */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Bureau</InputLabel>
              <Select
                value={bureauFilter}
                label="Bureau"
                onChange={(e) => { setBureauFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Bureaus</MenuItem>
                {uniqueBureaus.map(bureau => (
                  <MenuItem key={bureau} value={bureau}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: BUREAU_COLORS[bureau]?.primary || '#999',
                        }}
                      />
                      {bureau}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Status Filter */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {uniqueStatuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Type Filter */}
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Types</MenuItem>
                {uniqueTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Results Count */}
          <Grid item xs={6} sm={3} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                icon={<BarChart3 size={14} />}
                label={`${filteredAccounts.length} of ${accounts.length} accounts`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* ===== TABLE ===== */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <TableCell sx={{ fontWeight: 700, width: 100 }}>
                <TableSortLabel
                  active={orderBy === 'bureau'}
                  direction={orderBy === 'bureau' ? order : 'asc'}
                  onClick={() => handleSort('bureau')}
                >
                  Bureau
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                <TableSortLabel
                  active={orderBy === 'creditor'}
                  direction={orderBy === 'creditor' ? order : 'asc'}
                  onClick={() => handleSort('creditor')}
                >
                  Creditor
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Account #</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                <TableSortLabel
                  active={orderBy === 'balance'}
                  direction={orderBy === 'balance' ? order : 'asc'}
                  onClick={() => handleSort('balance')}
                >
                  Balance
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                <TableSortLabel
                  active={orderBy === 'limit'}
                  direction={orderBy === 'limit' ? order : 'asc'}
                  onClick={() => handleSort('limit')}
                >
                  Limit
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Utilization</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={orderBy === 'dateOpened'}
                  direction={orderBy === 'dateOpened' ? order : 'asc'}
                  onClick={() => handleSort('dateOpened')}
                >
                  Opened
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAccounts.map((account, index) => {
              const AccountIcon = getAccountTypeIcon(account.accountType || account.type);
              const statusInfo = getStatusInfo(account.accountStatus || account.status);
              const StatusIcon = statusInfo.icon;
              const bureauColor = BUREAU_COLORS[account.bureau] || { primary: '#999', secondary: '#f5f5f5' };
              const utilization = calculateUtilization(
                account.currentBalance || account.balance,
                account.creditLimit || account.limit
              );
              
              return (
                <React.Fragment key={`${account.bureau}-${account.accountNumber}-${index}`}>
                  <TableRow
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(bureauColor.primary, 0.05),
                      },
                      '&:nth-of-type(even)': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.3)
                          : alpha(theme.palette.grey[50], 0.5),
                      },
                    }}
                    onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                  >
                    {/* Bureau */}
                    <TableCell>
                      <Chip
                        label={account.bureau}
                        size="small"
                        sx={{
                          bgcolor: bureauColor.secondary,
                          color: bureauColor.text,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    
                    {/* Creditor */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(bureauColor.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AccountIcon size={18} color={bureauColor.primary} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {account.creditorName || account.creditor || 'Unknown Creditor'}
                          </Typography>
                          {account.remarks && (
                            <Typography variant="caption" color="text.secondary">
                              {account.remarks}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* Type */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {account.accountType || account.type || 'Unknown'}
                      </Typography>
                    </TableCell>
                    
                    {/* Account Number */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          color: 'text.secondary',
                        }}
                      >
                        {maskAccountNumber(account.accountNumber, showAccountNumbers)}
                      </Typography>
                    </TableCell>
                    
                    {/* Balance */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(account.currentBalance || account.balance)}
                      </Typography>
                    </TableCell>
                    
                    {/* Limit */}
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(account.creditLimit || account.limit)}
                      </Typography>
                    </TableCell>
                    
                    {/* Utilization */}
                    <TableCell>
                      {renderUtilizationBar(utilization)}
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell>
                      <Chip
                        icon={<StatusIcon size={14} />}
                        label={account.accountStatus || account.status || 'Unknown'}
                        size="small"
                        sx={{
                          bgcolor: statusInfo.bg,
                          color: statusInfo.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          '& .MuiChip-icon': {
                            color: statusInfo.color,
                          },
                        }}
                      />
                    </TableCell>
                    
                    {/* Date Opened */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(account.dateOpened)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Details Row */}
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 0, border: 0 }}>
                      <Collapse in={expandedRow === index} timeout="auto" unmountOnExit>
                        <Box
                          sx={{
                            py: 2,
                            px: 3,
                            bgcolor: alpha(bureauColor.primary, 0.03),
                            borderRadius: 2,
                            my: 1,
                          }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {account.paymentStatus || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">Monthly Payment</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(account.monthlyPayment)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">Last Reported</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatDate(account.dateReported)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">High Credit</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(account.highCredit || account.creditLimit)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAccounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        />
      </TableContainer>
    </Box>
  );
};

// =============================================================================
// SECTION: NEGATIVE ITEMS PANEL
// =============================================================================

const NegativeItemsPanel = ({ accounts }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // ===== IDENTIFY NEGATIVE ITEMS =====
  const negativeItems = useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) return [];
    
    const negativeKeywords = [
      'collection', 'charge-off', 'charged off', 'late', 'delinquent',
      'derogatory', 'past due', 'negative', '30 day', '60 day', '90 day', '120 day'
    ];
    
    return accounts.filter(account => {
      const status = (account.accountStatus || account.status || '').toLowerCase();
      const payStatus = (account.paymentStatus || '').toLowerCase();
      const remarks = (account.remarks || '').toLowerCase();
      
      return negativeKeywords.some(keyword =>
        status.includes(keyword) || payStatus.includes(keyword) || remarks.includes(keyword)
      );
    });
  }, [accounts]);
  
  if (negativeItems.length === 0) {
    return (
      <Alert
        severity="success"
        icon={<ShieldCheck size={24} />}
        sx={{
          borderRadius: 3,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 700 }}>Excellent Credit Health</AlertTitle>
        No negative items detected on your credit report. Keep up the great work!
      </Alert>
    );
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `2px solid ${alpha('#FF1744', 0.3)}`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          bgcolor: alpha('#FF1744', 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha('#FF1744', 0.1),
            }}
          >
            <ShieldAlert size={24} color="#FF1744" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#FF1744">
              {negativeItems.length} Negative Item{negativeItems.length !== 1 ? 's' : ''} Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These items may be hurting your credit score
            </Typography>
          </Box>
        </Box>
        <IconButton>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {negativeItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: index < negativeItems.length - 1 ? 1.5 : 0,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.creditorName || item.creditor || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.bureau} • {item.accountType || item.type || 'Account'}
                  </Typography>
                </Box>
                <Chip
                  label={item.accountStatus || item.status}
                  size="small"
                  sx={{
                    bgcolor: alpha('#FF1744', 0.1),
                    color: '#FF1744',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Balance</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(item.currentBalance || item.balance)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.paymentStatus || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date Opened</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(item.dateOpened)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
          
          <Alert
            severity="info"
            icon={<Sparkles size={20} />}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>We Can Help!</AlertTitle>
            Our credit repair experts can dispute these items with the credit bureaus on your behalf.
            Many negative items can be removed or corrected.
          </Alert>
        </Box>
      </Collapse>
    </Paper>
  );
};

// =============================================================================
// SECTION: MAIN CREDIT REPORT DISPLAY COMPONENT
// =============================================================================

const CreditReportDisplay = ({
  // ===== SCORE DATA =====
  score,                    // Primary VantageScore (number)
  transUnionScore,          // TransUnion specific score
  experianScore,            // Experian specific score
  equifaxScore,             // Equifax specific score
  
  // ===== ACCOUNTS DATA =====
  accounts,                 // Array of account objects from backend
  
  // ===== SUMMARY STATISTICS (from quick-view-report) =====
  summary,                  // Object with openAccounts, closedAccounts, etc.
  
  // ===== DISPLAY OPTIONS =====
  showAccountNumbers,       // Whether to show full account numbers
  showNegativeItems,        // Whether to show negative items panel (default: true)
  compact,                  // Compact view mode
  
  // ===== LOADING STATE =====
  loading,                  // Whether data is still loading
  
  // ===== CALLBACKS =====
  onRefresh,                // Callback to refresh report
  onDownload,               // Callback to download report
  onDispute,                // Callback to dispute an item
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showFullNumbers, setShowFullNumbers] = useState(showAccountNumbers || false);
  
  // ===== CALCULATE SUMMARY STATS =====
  const calculatedSummary = useMemo(() => {
    if (summary) return summary;
    if (!accounts || !Array.isArray(accounts)) return null;
    
    let totalBalance = 0;
    let totalLimit = 0;
    let openCount = 0;
    let closedCount = 0;
    let negativeCount = 0;
    
    accounts.forEach(account => {
      const balance = parseFloat(String(account.currentBalance || account.balance || 0).replace(/[^0-9.-]/g, '')) || 0;
      const limit = parseFloat(String(account.creditLimit || account.limit || 0).replace(/[^0-9.-]/g, '')) || 0;
      const status = (account.accountStatus || account.status || '').toLowerCase();
      
      totalBalance += balance;
      totalLimit += limit;
      
      if (status.includes('open') || status.includes('current')) {
        openCount++;
      } else if (status.includes('closed') || status.includes('paid')) {
        closedCount++;
      }
      
      const negativeKeywords = ['collection', 'charge-off', 'late', 'delinquent', 'derogatory'];
      if (negativeKeywords.some(k => status.includes(k))) {
        negativeCount++;
      }
    });
    
    const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
    
    return {
      totalAccounts: accounts.length,
      openAccounts: openCount,
      closedAccounts: closedCount,
      negativeItems: negativeCount,
      totalBalance,
      totalLimit,
      utilization,
    };
  }, [accounts, summary]);
  
  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        width: '100%',
        fontFamily: '"DM Sans", "Segoe UI", sans-serif',
      }}
    >
      {/* ===== HEADER SECTION ===== */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(0,150,0,0.15) 0%, rgba(0,100,0,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0,153,0,0.08) 0%, rgba(255,255,255,1) 100%)',
          border: `1px solid ${alpha('#009900', 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#009900', 0.1)} 0%, transparent 70%)`,
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #009900 0%, #00CC00 100%)',
                  boxShadow: '0 4px 12px rgba(0,153,0,0.3)',
                }}
              >
                <Shield size={28} color="#fff" />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #009900 0%, #006600 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Your Credit Report
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Comprehensive analysis from all three major credit bureaus
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={18} />}
                onClick={onRefresh}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            )}
            {onDownload && (
              <Button
                variant="contained"
                startIcon={<Download size={18} />}
                onClick={onDownload}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#009900',
                  '&:hover': { bgcolor: '#007700' },
                }}
              >
                Download Report
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* ===== CREDIT SCORES SECTION ===== */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.8)
            : '#fff',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gauge size={24} color="#009900" />
          Credit Scores
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" alignItems="flex-end">
          {/* TransUnion Score */}
          {(transUnionScore || score) && (
            <Grid item xs={12} sm={4}>
              <AnimatedScoreGauge
                score={transUnionScore || score}
                bureau="TransUnion"
                size="medium"
                delay={0}
              />
            </Grid>
          )}
          
          {/* Primary Score (Center, Larger) */}
          <Grid item xs={12} sm={4}>
            <AnimatedScoreGauge
              score={score}
              label="VantageScore 3.0"
              size="large"
              delay={200}
            />
          </Grid>
          
          {/* Equifax Score */}
          {(equifaxScore || score) && (
            <Grid item xs={12} sm={4}>
              <AnimatedScoreGauge
                score={equifaxScore || score}
                bureau="Equifax"
                size="medium"
                delay={400}
              />
            </Grid>
          )}
        </Grid>
        
        {/* Experian - Show below if we have it */}
        {experianScore && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <AnimatedScoreGauge
              score={experianScore}
              bureau="Experian"
              size="medium"
              delay={600}
            />
          </Box>
        )}
      </Paper>
      
      {/* ===== SUMMARY STATISTICS ===== */}
      {calculatedSummary && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={CreditCard}
              title="Total Accounts"
              value={calculatedSummary.totalAccounts || accounts?.length || 0}
              color="#2196F3"
              delay={100}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={CheckCircle}
              title="Open Accounts"
              value={calculatedSummary.openAccounts || 0}
              color="#00C853"
              delay={200}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={XCircle}
              title="Closed Accounts"
              value={calculatedSummary.closedAccounts || 0}
              color="#9E9E9E"
              delay={300}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={DollarSign}
              title="Total Balance"
              value={formatCurrency(calculatedSummary.totalBalance || calculatedSummary.totalBalances)}
              color="#FF9100"
              delay={400}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={Target}
              title="Utilization"
              value={`${calculatedSummary.utilization || 0}%`}
              subtitle={calculatedSummary.utilization > 30 ? 'Aim for under 30%' : 'Great job!'}
              color={calculatedSummary.utilization > 30 ? '#FF5722' : '#00C853'}
              delay={500}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <CreditSummaryCard
              icon={AlertTriangle}
              title="Negative Items"
              value={calculatedSummary.negativeItems || calculatedSummary.derogatoryAccounts || 0}
              color="#FF1744"
              delay={600}
            />
          </Grid>
        </Grid>
      )}
      
      {/* ===== NEGATIVE ITEMS ALERT ===== */}
      {(showNegativeItems !== false) && (
        <Box sx={{ mb: 4 }}>
          <NegativeItemsPanel accounts={accounts} />
        </Box>
      )}
      
      {/* ===== ACCOUNTS TABLE SECTION ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={24} color="#009900" />
              All Credit Accounts
              <Chip
                label={accounts?.length || 0}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: alpha('#009900', 0.1),
                  color: '#009900',
                  fontWeight: 700,
                }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete breakdown of all tradelines from all three bureaus
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={showFullNumbers ? 'Hide account numbers' : 'Show full account numbers'}>
              <IconButton
                onClick={() => setShowFullNumbers(!showFullNumbers)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                {showFullNumbers ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <AccountsTable accounts={accounts} showAccountNumbers={showFullNumbers} />
        </Box>
      </Paper>
      
      {/* ===== FOOTER / CTA SECTION ===== */}
      <Box
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #009900 0%, #006600 100%)',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Sparkles size={40} style={{ marginBottom: 16 }} />
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
            Ready to Improve Your Credit?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Our credit repair experts have helped thousands of clients improve their scores.
            <br />
            Let us review your report and create a personalized action plan.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Phone size={20} />}
            sx={{
              bgcolor: '#fff',
              color: '#009900',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Schedule Free Consultation
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
            Call us: 1-888-724-7344 • support@speedycreditrepair.com
          </Typography>
        </Box>
      </Box>
      
      {/* ===== COPYRIGHT FOOTER ===== */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

// ===== DEFAULT PROPS =====
CreditReportDisplay.defaultProps = {
  showAccountNumbers: false,
  showNegativeItems: true,
  compact: false,
  loading: false,
};

export default CreditReportDisplay;