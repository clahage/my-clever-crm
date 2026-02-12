// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLIENT PROGRESS PORTAL - EXTREME EDITION
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Path: src/pages/ClientProgressPortal.jsx
// Version: 3.0.0 - ULTIMATE CLIENT EXPERIENCE
// 
// THE FOCAL POINT FOR CLIENT FIRST IMPRESSIONS
// Built with extreme attention to visual appeal, detail, and ease of navigation
// 
// FEATURES:
// ✅ Stunning Animated Credit Score Gauges with 3D Effects
// ✅ Interactive Progress Timeline with Milestone Celebrations
// ✅ Real-time Dispute Tracking with Visual Status Indicators
// ✅ Financial Impact Calculator showing Potential Savings
// ✅ Achievement System with Confetti Celebrations
// ✅ AI-Powered Insights Panel with Personalized Recommendations
// ✅ Score Comparison Dashboard (All 3 Bureaus)
// ✅ Document Status Tracker with Progress Indicators
// ✅ Payment History & Upcoming Payments
// ✅ Personalized Goal Progress Visualization
// ✅ Mobile-First Responsive Design
// ✅ Dark Mode Support
// ✅ Real-time Firebase Integration
// ✅ Human Touch Messaging Throughout
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, doc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp, updateDoc
} from 'firebase/firestore';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MATERIAL-UI IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════
import {
  Box, Container, Paper, Typography, Button, IconButton, Grid, Card, CardContent, CardActions,
  Chip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, List, ListItem, ListItemText,
  ListItemIcon, CircularProgress, Stepper, Step, StepLabel, StepContent, Divider, Avatar, Tooltip,
  Badge, LinearProgress, Rating, Accordion, AccordionSummary, AccordionDetails, Stack, Collapse,
  Fab, Menu, MenuItem, Skeleton, useTheme, useMediaQuery, Fade, Zoom, Slide, Grow, SwipeableDrawer
} from '@mui/material';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LUCIDE REACT ICONS
// ═══════════════════════════════════════════════════════════════════════════════════════════
import {
  TrendingUp, TrendingDown, Activity, Target, Award, BarChart3, Shield, ShieldCheck,
  Plus, Edit2, Download, Upload, RefreshCw, Filter, Search, Eye, Home, FileText,
  CreditCard, Users, Settings, Bell, HelpCircle, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertCircle, Clock, Calendar, Mail, Phone, DollarSign, Wallet,
  Star, Gift, Trophy, Medal, Zap, Sparkles, Crown, Gem, MessageSquare, Send,
  PieChart, Flag, Bookmark, Heart, Info, AlertTriangle, ExternalLink, Moon, Sun,
  MoreVertical, User, LogOut, Smartphone, Globe, PlayCircle, ThumbsUp, ThumbsDown,
  ArrowUpRight, ArrowDownRight, Rocket, PartyPopper, BadgeCheck, Building2, Car, Home as HomeIcon,
  Percent, Calculator, FileCheck, FileClock, FileX, Scale, Brain, Bot, Lightbulb, Lock
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CHART.JS IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CONFETTI FOR CELEBRATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════
import Confetti from 'react-confetti';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, ChartTooltip, Legend, Filler
);

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CHRIS LAHAGE CONTACT INFO (HUMAN TOUCH)
// ═══════════════════════════════════════════════════════════════════════════════════════════
const CHRIS_INFO = {
  name: 'Chris Lahage',
  title: 'Credit Expert & Owner',
  company: 'Speedy Credit Repair Inc.',
  phone: '(888) 724-7344',
  phoneNote: 'Call and ask for me directly',
  email: 'chris@speedycreditrepair.com',
  experience: '30 Years Credit Repair Experience',
  currentPosition: 'Current Finance Director at one of Toyota\'s top franchises',
  bbbRating: 'A+ BBB Rating',
  googleRating: '4.9★ Google (580+ Reviews)',
  established: '1995'
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CREDIT SCORE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════
const getScoreColor = (score) => {
  if (score >= 800) return { main: '#10B981', light: '#D1FAE5', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' };
  if (score >= 740) return { main: '#3B82F6', light: '#DBEAFE', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' };
  if (score >= 670) return { main: '#F59E0B', light: '#FEF3C7', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' };
  if (score >= 580) return { main: '#EF4444', light: '#FEE2E2', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' };
  return { main: '#991B1B', light: '#FEE2E2', gradient: 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)' };
};

const getScoreRating = (score) => {
  if (score >= 800) return { text: 'Exceptional', emoji: '🌟' };
  if (score >= 740) return { text: 'Very Good', emoji: '✨' };
  if (score >= 670) return { text: 'Good', emoji: '👍' };
  if (score >= 580) return { text: 'Fair', emoji: '📈' };
  return { text: 'Needs Work', emoji: '🚀' };
};

const getScorePercentile = (score) => {
  if (score >= 800) return 96;
  if (score >= 780) return 90;
  if (score >= 740) return 80;
  if (score >= 700) return 65;
  if (score >= 670) return 50;
  if (score >= 620) return 35;
  if (score >= 580) return 20;
  return 10;
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ANIMATED CREDIT SCORE GAUGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const AnimatedScoreGauge = ({ score, previousScore, bureau, size = 200, showDetails = true }) => {
  const [displayScore, setDisplayScore] = useState(previousScore || 300);
  const [isAnimating, setIsAnimating] = useState(true);
  const colors = getScoreColor(score);
  const rating = getScoreRating(score);
  const change = score - (previousScore || score);
  const percentile = getScorePercentile(score);

  // ===== ANIMATE SCORE ON MOUNT =====
  useEffect(() => {
    if (!score) return;
    
    const startScore = previousScore || 300;
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(startScore + (score - startScore) * easeOut);
      
      setDisplayScore(currentScore);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score, previousScore]);

  // ===== GAUGE CALCULATIONS =====
  const radius = (size - 20) / 2;
  const circumference = radius * Math.PI;
  const minScore = 300;
  const maxScore = 850;
  const scorePercent = ((displayScore - minScore) / (maxScore - minScore)) * 100;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  const bureauLogos = {
    experian: { name: 'Experian', color: '#1D4ED8' },
    equifax: { name: 'Equifax', color: '#DC2626' },
    transunion: { name: 'TransUnion', color: '#059669' }
  };

  const bureauInfo = bureauLogos[bureau?.toLowerCase()] || { name: bureau, color: '#6B7280' };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* ===== BUREAU BADGE ===== */}
      <Chip
        label={bureauInfo.name}
        size="small"
        sx={{
          mb: 1,
          bgcolor: bureauInfo.color,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem'
        }}
      />

      {/* ===== GAUGE CONTAINER ===== */}
      <Box sx={{ 
        position: 'relative', 
        width: size, 
        height: size / 2 + 40,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: size * 0.9,
          height: size * 0.45,
          background: `radial-gradient(ellipse at center, ${colors.main}20 0%, transparent 70%)`,
          filter: 'blur(20px)',
          opacity: isAnimating ? 1 : 0.6,
          transition: 'opacity 0.5s ease'
        }
      }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* ===== GRADIENT DEFINITIONS ===== */}
          <defs>
            <linearGradient id={`gradient-${bureau}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="75%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id={`glow-${bureau}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id={`shadow-${bureau}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* ===== BACKGROUND ARC ===== */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* ===== COLORED ARC ===== */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={`url(#gradient-${bureau})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter={`url(#glow-${bureau})`}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />

          {/* ===== SCORE MARKERS ===== */}
          {[300, 580, 670, 740, 800, 850].map((marker, idx) => {
            const markerPercent = ((marker - minScore) / (maxScore - minScore));
            const angle = Math.PI - (markerPercent * Math.PI);
            const x = size / 2 + (radius - 25) * Math.cos(angle);
            const y = size / 2 - (radius - 25) * Math.sin(angle);
            return (
              <text
                key={marker}
                x={x}
                y={y}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
                fontWeight="500"
              >
                {marker}
              </text>
            );
          })}

          {/* ===== NEEDLE ===== */}
          {(() => {
            const needleAngle = Math.PI - (scorePercent / 100) * Math.PI;
            const needleLength = radius - 35;
            const needleX = size / 2 + needleLength * Math.cos(needleAngle);
            const needleY = size / 2 - needleLength * Math.sin(needleAngle);
            return (
              <g filter={`url(#shadow-${bureau})`}>
                <line
                  x1={size / 2}
                  y1={size / 2}
                  x2={needleX}
                  y2={needleY}
                  stroke={colors.main}
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ transition: 'all 0.1s ease-out' }}
                />
                <circle cx={size / 2} cy={size / 2} r="8" fill={colors.main} />
                <circle cx={size / 2} cy={size / 2} r="4" fill="white" />
              </g>
            );
          })()}
        </svg>

        {/* ===== CENTER SCORE DISPLAY ===== */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: size > 180 ? '2.5rem' : '2rem',
              lineHeight: 1
            }}
          >
            {displayScore}
          </Typography>
        </Box>
      </Box>

      {/* ===== SCORE DETAILS ===== */}
      {showDetails && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.main }}>
              {rating.emoji} {rating.text}
            </Typography>
          </Box>
          
          {change !== 0 && (
            <Chip
              icon={change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              label={`${change > 0 ? '+' : ''}${change} pts`}
              size="small"
              sx={{
                mt: 1,
                bgcolor: change > 0 ? '#D1FAE5' : '#FEE2E2',
                color: change > 0 ? '#059669' : '#DC2626',
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: change > 0 ? '#059669' : '#DC2626'
                }
              }}
            />
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Better than {percentile}% of Americans
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// FINANCIAL IMPACT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const FinancialImpactCard = ({ currentScore, targetScore, icon: Icon, title, description, calculateSavings }) => {
  const savings = calculateSavings(currentScore, targetScore);
  const isPositive = savings > 0;

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid',
        borderColor: isPositive ? 'success.light' : 'grey.200',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isPositive 
            ? '0 12px 24px -8px rgba(16, 185, 129, 0.25)'
            : '0 12px 24px -8px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: isPositive ? 'success.light' : 'grey.100',
              color: isPositive ? 'success.main' : 'grey.500',
              width: 48,
              height: 48
            }}
          >
            <Icon size={24} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: isPositive ? 'success.main' : 'text.secondary'
            }}
          >
            {isPositive ? `$${savings.toLocaleString()}` : '$0'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPositive ? 'Potential Lifetime Savings' : 'Complete your profile to see savings'}
          </Typography>
        </Box>

        {isPositive && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (savings / 50000) * 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'success.light',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round((savings / 50000) * 100)}% of max potential
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// DISPUTE STATUS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const DisputeStatusCard = ({ dispute, index }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: '#F59E0B', bgcolor: '#FEF3C7', icon: FileClock, label: 'Pending' },
      'in_progress': { color: '#3B82F6', bgcolor: '#DBEAFE', icon: RefreshCw, label: 'In Progress' },
      'investigating': { color: '#8B5CF6', bgcolor: '#EDE9FE', icon: Search, label: 'Investigating' },
      'completed': { color: '#10B981', bgcolor: '#D1FAE5', icon: CheckCircle, label: 'Completed' },
      'deleted': { color: '#10B981', bgcolor: '#D1FAE5', icon: Trophy, label: 'DELETED! 🎉' },
      'verified': { color: '#EF4444', bgcolor: '#FEE2E2', icon: XCircle, label: 'Verified' },
      'disputed': { color: '#F59E0B', bgcolor: '#FEF3C7', icon: Mail, label: 'Disputed' }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const statusConfig = getStatusConfig(dispute.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Grow in timeout={300 + index * 100}>
      <Card
        sx={{
          mb: 2,
          border: '1px solid',
          borderColor: dispute.status === 'deleted' ? 'success.main' : 'grey.200',
          bgcolor: dispute.status === 'deleted' ? 'success.light' : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent sx={{ pb: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <Avatar
                sx={{
                  bgcolor: statusConfig.bgcolor,
                  color: statusConfig.color,
                  width: 40,
                  height: 40
                }}
              >
                <StatusIcon size={20} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {dispute.creditorName || 'Unknown Creditor'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dispute.accountType || 'Account'} • {dispute.bureau || 'All Bureaus'}
                </Typography>
                {dispute.balance && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                    Balance: ${Number(dispute.balance).toLocaleString()}
                  </Typography>
                )}
                {dispute.reason && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Reason: {dispute.reason}
                  </Typography>
                )}
              </Box>
            </Box>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                bgcolor: statusConfig.bgcolor,
                color: statusConfig.color,
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>

          {/* ===== PROGRESS INDICATOR ===== */}
          {dispute.status !== 'deleted' && dispute.status !== 'completed' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Progress</Typography>
                <Typography variant="caption" color="text.secondary">
                  {dispute.daysRemaining || 30} days remaining
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={dispute.progress || 25}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: statusConfig.color,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {dispute.status === 'deleted' && (
            <Alert 
              severity="success" 
              icon={<Trophy size={20} />}
              sx={{ mt: 2, py: 0 }}
            >
              <Typography variant="caption">
                Successfully removed from your credit report!
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MILESTONE TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const MilestoneTimeline = ({ milestones, currentStage }) => {
  const defaultMilestones = [
    { id: 1, label: 'Enrolled', description: 'Welcome to Speedy Credit Repair!', icon: BadgeCheck, completed: true },
    { id: 2, label: 'Credit Pulled', description: 'Credit report retrieved', icon: FileText, completed: true },
    { id: 3, label: 'Analysis Complete', description: 'Identified disputable items', icon: Search, completed: true },
    { id: 4, label: 'First Disputes Filed', description: 'Letters sent to bureaus', icon: Mail, completed: currentStage >= 4 },
    { id: 5, label: 'Results Received', description: 'Bureau responses received', icon: FileCheck, completed: currentStage >= 5 },
    { id: 6, label: 'Score Improved', description: 'Credit score increased!', icon: TrendingUp, completed: currentStage >= 6 },
    { id: 7, label: 'Goal Reached', description: 'Target score achieved!', icon: Trophy, completed: currentStage >= 7 }
  ];

  const displayMilestones = milestones?.length > 0 ? milestones : defaultMilestones;

  return (
    <Box sx={{ position: 'relative' }}>
      {displayMilestones.map((milestone, index) => {
        const Icon = milestone.icon || CheckCircle;
        const isActive = !milestone.completed && index === currentStage - 1;
        const isCompleted = milestone.completed;

        return (
          <Grow in timeout={300 + index * 150} key={milestone.id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 3,
                position: 'relative',
                '&:last-child': { mb: 0 }
              }}
            >
              {/* ===== CONNECTOR LINE ===== */}
              {index < displayMilestones.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 19,
                    top: 40,
                    width: 2,
                    height: 'calc(100% + 4px)',
                    bgcolor: isCompleted ? 'success.main' : 'grey.300',
                    transition: 'background-color 0.5s ease'
                  }}
                />
              )}

              {/* ===== ICON ===== */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.200',
                  color: isCompleted || isActive ? 'white' : 'grey.400',
                  mr: 2,
                  transition: 'all 0.3s ease',
                  animation: isActive ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }
                  }
                }}
              >
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </Avatar>

              {/* ===== CONTENT ===== */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      color: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {milestone.label}
                  </Typography>
                  {isActive && (
                    <Chip
                      label="In Progress"
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                  {isCompleted && milestone.completedDate && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(milestone.completedDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {milestone.description}
                </Typography>
              </Box>
            </Box>
          </Grow>
        );
      })}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENT BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const AchievementBadge = ({ achievement, unlocked = false }) => {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{achievement.name}</Typography>
          <Typography variant="caption">{achievement.description}</Typography>
          {achievement.points && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#F59E0B' }}>
              +{achievement.points} points
            </Typography>
          )}
        </Box>
      }
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: unlocked
            ? 'linear-gradient(145deg, #FEF3C7 0%, #FCD34D 100%)'
            : 'linear-gradient(145deg, #F3F4F6 0%, #E5E7EB 100%)',
          border: '3px solid',
          borderColor: unlocked ? '#F59E0B' : '#D1D5DB',
          fontSize: '1.5rem',
          filter: unlocked ? 'none' : 'grayscale(100%)',
          opacity: unlocked ? 1 : 0.5,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: unlocked ? '0 8px 20px rgba(245, 158, 11, 0.3)' : 'none'
          }
        }}
      >
        {achievement.icon}
      </Box>
    </Tooltip>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// AI INSIGHTS PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const AIInsightsPanel = ({ clientData, creditScores, disputes }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ===== GENERATE PERSONALIZED INSIGHTS =====
    const generateInsights = () => {
      const newInsights = [];
      const avgScore = creditScores ? 
        Math.round((creditScores.experian?.current + creditScores.equifax?.current + creditScores.transunion?.current) / 3) : 0;

      if (avgScore > 0 && avgScore < 670) {
        newInsights.push({
          type: 'opportunity',
          icon: Lightbulb,
          title: 'Score Improvement Opportunity',
          message: `Your average score of ${avgScore} has significant room for improvement. Based on your profile, I believe we can get you into the "Good" range (670+) within 4-6 months.`,
          action: 'View Recommendations',
          priority: 'high'
        });
      }

      const pendingDisputes = disputes?.filter(d => d.status === 'pending' || d.status === 'in_progress') || [];
      if (pendingDisputes.length > 0) {
        newInsights.push({
          type: 'update',
          icon: Clock,
          title: 'Active Disputes Update',
          message: `You have ${pendingDisputes.length} active dispute${pendingDisputes.length > 1 ? 's' : ''} being processed. Bureau responses typically arrive within 30-45 days.`,
          action: 'View Details',
          priority: 'medium'
        });
      }

      const deletedDisputes = disputes?.filter(d => d.status === 'deleted') || [];
      if (deletedDisputes.length > 0) {
        newInsights.push({
          type: 'celebration',
          icon: PartyPopper,
          title: 'Congratulations! 🎉',
          message: `We've successfully removed ${deletedDisputes.length} negative item${deletedDisputes.length > 1 ? 's' : ''} from your credit report! This should positively impact your score.`,
          action: 'See Impact',
          priority: 'high'
        });
      }

      if (newInsights.length === 0) {
        newInsights.push({
          type: 'info',
          icon: Brain,
          title: 'Your Journey is Beginning',
          message: "I'm personally reviewing your credit report and will have personalized recommendations for you shortly. In the meantime, continue making on-time payments!",
          priority: 'low'
        });
      }

      setInsights(newInsights);
      setLoading(false);
    };

    setTimeout(generateInsights, 500);
  }, [clientData, creditScores, disputes]);

  const getInsightStyle = (type) => {
    const styles = {
      'opportunity': { bgcolor: '#FEF3C7', borderColor: '#F59E0B', iconColor: '#D97706' },
      'update': { bgcolor: '#DBEAFE', borderColor: '#3B82F6', iconColor: '#2563EB' },
      'celebration': { bgcolor: '#D1FAE5', borderColor: '#10B981', iconColor: '#059669' },
      'warning': { bgcolor: '#FEE2E2', borderColor: '#EF4444', iconColor: '#DC2626' },
      'info': { bgcolor: '#F3F4F6', borderColor: '#6B7280', iconColor: '#4B5563' }
    };
    return styles[type] || styles.info;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Analyzing your profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* ===== HEADER WITH CHRIS'S AVATAR ===== */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
          <Brain size={24} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            Personalized Insights from Chris
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {CHRIS_INFO.experience}
          </Typography>
        </Box>
      </Box>

      {/* ===== INSIGHTS LIST ===== */}
      <Stack spacing={2}>
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight.type);
          const Icon = insight.icon;
          
          return (
            <Grow in timeout={300 + index * 150} key={index}>
              <Card
                sx={{
                  bgcolor: style.bgcolor,
                  border: '1px solid',
                  borderColor: style.borderColor,
                  borderLeft: '4px solid',
                  borderLeftColor: style.borderColor
                }}
              >
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'white', color: style.iconColor, width: 36, height: 36 }}>
                      <Icon size={18} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.message}
                      </Typography>
                      {insight.action && (
                        <Button
                          size="small"
                          sx={{ mt: 1, textTransform: 'none' }}
                          endIcon={<ChevronRight size={16} />}
                        >
                          {insight.action}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          );
        })}
      </Stack>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// HUMAN TOUCH WELCOME CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const HumanTouchWelcomeCard = ({ clientName }) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* ===== DECORATIVE ELEMENTS ===== */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 56,
              height: 56,
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <ShieldCheck size={28} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Welcome{clientName ? `, ${clientName}` : ''}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your credit improvement journey starts here
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              width: 48,
              height: 48
            }}
          >
            <User size={24} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {CHRIS_INFO.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              {CHRIS_INFO.title} • {CHRIS_INFO.experience}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {CHRIS_INFO.currentPosition}
            </Typography>
          </Box>
        </Box>

        <Alert
          severity="info"
          icon={<Phone size={20} />}
          sx={{
            mt: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          <Typography variant="body2">
            <strong>Have questions?</strong> Call {CHRIS_INFO.phone} and ask for me directly!
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SCORE TREND CHART COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const ScoreTrendChart = ({ history, bureau }) => {
  const bureauColors = {
    experian: '#1D4ED8',
    equifax: '#DC2626',
    transunion: '#059669'
  };

  const data = {
    labels: history?.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || 
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: bureau || 'Score',
        data: history?.map(h => h.score) || [580, 595, 612, 628, 645, 660],
        borderColor: bureauColors[bureau?.toLowerCase()] || '#3B82F6',
        backgroundColor: `${bureauColors[bureau?.toLowerCase()] || '#3B82F6'}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: bureauColors[bureau?.toLowerCase()] || '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9CA3AF' }
      },
      y: {
        min: 300,
        max: 850,
        grid: { color: '#F3F4F6' },
        ticks: { font: { size: 10 }, color: '#9CA3AF' }
      }
    }
  };

  return (
    <Box sx={{ height: 200, p: 1 }}>
      <Line data={data} options={options} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// DOCUMENT STATUS TRACKER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const DocumentStatusTracker = ({ documents }) => {
  const requiredDocs = [
    { id: 'id', name: 'Government ID', description: "Driver's license or passport", icon: BadgeCheck },
    { id: 'ssn', name: 'Social Security Card', description: 'Front of SSN card', icon: Lock },
    { id: 'address', name: 'Proof of Address', description: 'Utility bill or bank statement', icon: HomeIcon },
  ];

  const getDocStatus = (docType) => {
    const doc = documents?.find(d => d.type?.toLowerCase() === docType.toLowerCase());
    if (doc?.verified) return 'verified';
    if (doc) return 'uploaded';
    return 'missing';
  };

  const getStatusConfig = (status) => {
    const configs = {
      'verified': { color: '#10B981', bgcolor: '#D1FAE5', label: 'Verified ✓', icon: CheckCircle },
      'uploaded': { color: '#F59E0B', bgcolor: '#FEF3C7', label: 'Under Review', icon: Clock },
      'missing': { color: '#6B7280', bgcolor: '#F3F4F6', label: 'Not Uploaded', icon: Upload }
    };
    return configs[status] || configs.missing;
  };

  const completedCount = requiredDocs.filter(d => getDocStatus(d.id) !== 'missing').length;
  const progress = (completedCount / requiredDocs.length) * 100;

  return (
    <Box>
      {/* ===== PROGRESS HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Document Verification
          </Typography>
          <Chip
            label={`${completedCount}/${requiredDocs.length} Complete`}
            size="small"
            color={completedCount === requiredDocs.length ? 'success' : 'default'}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: progress === 100 
                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)'
            }
          }}
        />
      </Box>

      {/* ===== DOCUMENT LIST ===== */}
      <Stack spacing={2}>
        {requiredDocs.map((doc) => {
          const status = getDocStatus(doc.id);
          const statusConfig = getStatusConfig(status);
          const DocIcon = doc.icon;
          const StatusIcon = statusConfig.icon;

          return (
            <Box
              key={doc.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: statusConfig.bgcolor,
                border: '1px solid',
                borderColor: status === 'verified' ? 'success.main' : 'transparent'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'white',
                  color: statusConfig.color,
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                <DocIcon size={20} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {doc.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.description}
                </Typography>
              </Box>
              <Chip
                icon={<StatusIcon size={14} />}
                label={statusConfig.label}
                size="small"
                sx={{
                  bgcolor: 'white',
                  color: statusConfig.color,
                  fontWeight: 'medium',
                  '& .MuiChip-icon': { color: statusConfig.color }
                }}
              />
            </Box>
          );
        })}
      </Stack>

      {completedCount < requiredDocs.length && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Upload size={18} />}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Upload Missing Documents
        </Button>
      )}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// QUICK STATS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const QuickStatCard = ({ icon: Icon, label, value, subValue, color, trend }) => {
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(145deg, ${color}08 0%, ${color}15 100%)`,
        border: '1px solid',
        borderColor: `${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}20`
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Avatar
          sx={{
            bgcolor: `${color}20`,
            color: color,
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2
          }}
        >
          <Icon size={28} />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          {label}
        </Typography>
        {subValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            {trend && (
              trend > 0 ? (
                <TrendingUp size={14} color="#10B981" />
              ) : (
                <TrendingDown size={14} color="#EF4444" />
              )
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {subValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT PROGRESS PORTAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════
const ClientProgressPortal = () => {
  const { user, userProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // ===== DATA STATE =====
  const [clientData, setClientData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [creditScores, setCreditScores] = useState({
    experian: { current: 0, previous: 0, history: [] },
    equifax: { current: 0, previous: 0, history: [] },
    transunion: { current: 0, previous: 0, history: [] }
  });
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [idiqData, setIdiqData] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // ===== STATS STATE =====
  const [stats, setStats] = useState({
    totalDisputes: 0,
    successfulDeletions: 0,
    pendingDisputes: 0,
    scoreIncrease: 0,
    daysActive: 0,
    completionRate: 0,
    estimatedSavings: 0,
    currentStage: 3
  });

  // ===== HELPER FUNCTIONS =====
  const showNotificationMessage = useCallback((message, type = 'info') => {
    setNotification({ show: true, message, type });
  }, []);

  // ===== LOAD CLIENT DATA =====
  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClientProfile(),
        loadCreditScores(),
        loadDisputes(),
        loadDocuments(),
        loadAchievements(),
        loadIdiqData(),
        loadInvoices()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error loading data:', error);
      showNotificationMessage('Error loading your data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadClientProfile = async () => {
    try {
      // ===== FIRST TRY CLIENTS COLLECTION =====
      const clientQuery = query(collection(db, 'clients'), where('userId', '==', user.uid));
      const clientSnapshot = await getDocs(clientQuery);
      
      if (!clientSnapshot.empty) {
        const data = clientSnapshot.docs[0].data();
        setClientData({ id: clientSnapshot.docs[0].id, ...data });
      }

      // ===== ALSO TRY CONTACTS COLLECTION =====
      const contactQuery = query(collection(db, 'contacts'), where('userId', '==', user.uid));
      const contactSnapshot = await getDocs(contactQuery);
      
      if (!contactSnapshot.empty) {
        const data = contactSnapshot.docs[0].data();
        setContactData({ id: contactSnapshot.docs[0].id, ...data });
      }
    } catch (error) {
      console.error('Error loading client profile:', error);
    }
  };

  const loadCreditScores = async () => {
    try {
      // ===== FETCH FROM IDIQ ENROLLMENTS =====
      const enrollmentQuery = query(
        collection(db, 'idiqEnrollments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const enrollmentSnapshot = await getDocs(enrollmentQuery);
      
      if (!enrollmentSnapshot.empty) {
        const data = enrollmentSnapshot.docs[0].data();
        const creditReport = data.creditReport;
        
        if (creditReport) {
          setCreditScores({
            experian: { 
              current: creditReport.experian?.score || 0, 
              previous: creditReport.experian?.previousScore || 0,
              history: creditReport.experian?.history || []
            },
            equifax: { 
              current: creditReport.equifax?.score || 0, 
              previous: creditReport.equifax?.previousScore || 0,
              history: creditReport.equifax?.history || []
            },
            transunion: { 
              current: creditReport.transunion?.score || 0, 
              previous: creditReport.transunion?.previousScore || 0,
              history: creditReport.transunion?.history || []
            }
          });
        }
      }

      // ===== ALSO CHECK CREDIT SCORES COLLECTION =====
      const scoresQuery = query(
        collection(db, 'creditScores'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(12)
      );
      const scoresSnapshot = await getDocs(scoresQuery);
      
      if (!scoresSnapshot.empty) {
        const scores = scoresSnapshot.docs.map(doc => doc.data());
        // Process historical scores...
      }
    } catch (error) {
      console.error('Error loading credit scores:', error);
    }
  };

  const loadDisputes = async () => {
    try {
      // ===== TRY MULTIPLE QUERIES =====
      // Query by userId, clientId, AND contactId to support all dispute creation methods
      const queries = [
        query(collection(db, 'disputes'), where('userId', '==', user.uid)),
        query(collection(db, 'disputes'), where('clientId', '==', user.uid))
      ];

      // ===== ADD CONTACTID QUERY IF CONTACT DATA LOADED =====
      // This supports disputes created by the AI pipeline during enrollment
      if (contactData?.id) {
        queries.push(query(collection(db, 'disputes'), where('contactId', '==', contactData.id)));
      }

      let allDisputes = [];

      for (const q of queries) {
        try {
          const snapshot = await getDocs(q);
          const disputeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          allDisputes = [...allDisputes, ...disputeData];
        } catch (e) {
          // Query may fail if index doesn't exist, continue
          console.log('Dispute query failed (index may not exist):', e.message);
        }
      }

      // ===== REMOVE DUPLICATES =====
      const uniqueDisputes = Array.from(new Map(allDisputes.map(d => [d.id, d])).values());
      setDisputes(uniqueDisputes);
      console.log(`✅ Loaded ${uniqueDisputes.length} disputes for user ${user.uid}`);
    } catch (error) {
      console.error('Error loading disputes:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const docQuery = query(
        collection(db, 'documents'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(docQuery);
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const achQuery = query(
        collection(db, 'achievements'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(achQuery);
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadIdiqData = async () => {
    try {
      const idiqQuery = query(
        collection(db, 'idiqEnrollments'),
        where('userId', '==', user.uid),
        limit(1)
      );
      const snapshot = await getDocs(idiqQuery);
      if (!snapshot.empty) {
        setIdiqData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    } catch (error) {
      console.error('Error loading IDIQ data:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const invoiceQuery = query(
        collection(db, 'invoices'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(invoiceQuery);
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const calculateStats = () => {
    const totalDisputes = disputes.length;
    const successfulDeletions = disputes.filter(d => d.status === 'deleted' || d.status === 'completed').length;
    const pendingDisputes = disputes.filter(d => d.status === 'pending' || d.status === 'in_progress').length;
    
    const avgScore = Math.round(
      (creditScores.experian.current + creditScores.equifax.current + creditScores.transunion.current) / 3
    );
    const avgPrevScore = Math.round(
      (creditScores.experian.previous + creditScores.equifax.previous + creditScores.transunion.previous) / 3
    );
    const scoreIncrease = avgScore - (avgPrevScore || avgScore);

    // ===== CALCULATE DAYS ACTIVE =====
    const joinDate = clientData?.joinedAt?.toDate?.() || clientData?.createdAt?.toDate?.() || new Date();
    const daysActive = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));

    // ===== CALCULATE ESTIMATED SAVINGS =====
    let estimatedSavings = 0;
    if (avgScore > 0) {
      // Mortgage savings estimation
      if (avgScore >= 740) estimatedSavings += 50000;
      else if (avgScore >= 670) estimatedSavings += 30000;
      else if (avgScore >= 620) estimatedSavings += 15000;
      
      // Auto loan savings
      if (avgScore >= 700) estimatedSavings += 5000;
      else if (avgScore >= 650) estimatedSavings += 2500;
      
      // Credit card savings
      estimatedSavings += successfulDeletions * 1000;
    }

    // ===== DETERMINE CURRENT STAGE =====
    let currentStage = 1;
    if (clientData) currentStage = 2;
    if (idiqData) currentStage = 3;
    if (disputes.length > 0) currentStage = 4;
    if (successfulDeletions > 0) currentStage = 5;
    if (scoreIncrease > 20) currentStage = 6;
    if (avgScore >= 700) currentStage = 7;

    setStats({
      totalDisputes,
      successfulDeletions,
      pendingDisputes,
      scoreIncrease,
      daysActive,
      completionRate: totalDisputes > 0 ? Math.round((successfulDeletions / totalDisputes) * 100) : 0,
      estimatedSavings,
      currentStage
    });

    // ===== TRIGGER CONFETTI FOR WINS =====
    if (successfulDeletions > 0 && !sessionStorage.getItem('celebratedDeletions')) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      sessionStorage.setItem('celebratedDeletions', 'true');
    }
  };

  // ===== RECALCULATE STATS WHEN DATA CHANGES =====
  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [disputes, creditScores, clientData, idiqData]);

  // ===== RELOAD DISPUTES WHEN CONTACT DATA LOADS =====
  // This ensures disputes created with contactId (from AI pipeline) are loaded
  useEffect(() => {
    if (contactData?.id && !loading) {
      console.log('📋 Contact data loaded - reloading disputes to include contactId query');
      loadDisputes();
    }
  }, [contactData?.id]);

  // ===== FINANCIAL IMPACT CALCULATORS =====
  const calculateMortgageSavings = (currentScore, targetScore) => {
    const getRateForScore = (score) => {
      if (score >= 760) return 6.5;
      if (score >= 700) return 6.875;
      if (score >= 680) return 7.25;
      if (score >= 660) return 7.625;
      if (score >= 620) return 8.125;
      return 9.0;
    };

    const loanAmount = 400000;
    const loanTermYears = 30;
    const currentRate = getRateForScore(currentScore);
    const targetRate = getRateForScore(targetScore || currentScore + 50);

    const calculateMonthlyPayment = (principal, annualRate, years) => {
      const monthlyRate = annualRate / 100 / 12;
      const numPayments = years * 12;
      return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    };

    const currentPayment = calculateMonthlyPayment(loanAmount, currentRate, loanTermYears);
    const targetPayment = calculateMonthlyPayment(loanAmount, targetRate, loanTermYears);
    const monthlySavings = currentPayment - targetPayment;
    
    return Math.round(monthlySavings * 12 * loanTermYears);
  };

  const calculateAutoSavings = (currentScore, targetScore) => {
    const getRateForScore = (score) => {
      if (score >= 720) return 5.5;
      if (score >= 680) return 7.5;
      if (score >= 640) return 10.5;
      if (score >= 600) return 15.0;
      return 20.0;
    };

    const loanAmount = 35000;
    const loanTermYears = 5;
    const currentRate = getRateForScore(currentScore);
    const targetRate = getRateForScore(targetScore || currentScore + 50);

    const calculateTotalInterest = (principal, annualRate, years) => {
      const monthlyRate = annualRate / 100 / 12;
      const numPayments = years * 12;
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      return (payment * numPayments) - principal;
    };

    const currentInterest = calculateTotalInterest(loanAmount, currentRate, loanTermYears);
    const targetInterest = calculateTotalInterest(loanAmount, targetRate, loanTermYears);
    
    return Math.round(currentInterest - targetInterest);
  };

  const calculateCreditCardSavings = (currentScore, targetScore) => {
    const getRateForScore = (score) => {
      if (score >= 720) return 16.99;
      if (score >= 680) return 21.99;
      if (score >= 640) return 24.99;
      return 29.99;
    };

    const avgBalance = 8000;
    const yearsToPayoff = 3;
    const currentRate = getRateForScore(currentScore);
    const targetRate = getRateForScore(targetScore || currentScore + 50);

    const currentInterest = avgBalance * (currentRate / 100) * yearsToPayoff;
    const targetInterest = avgBalance * (targetRate / 100) * yearsToPayoff;
    
    return Math.round(currentInterest - targetInterest);
  };

  // ===== GET AVERAGE SCORE =====
  const avgScore = useMemo(() => {
    const scores = [creditScores.experian.current, creditScores.equifax.current, creditScores.transunion.current].filter(s => s > 0);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [creditScores]);

  const targetScore = avgScore > 0 ? Math.min(avgScore + 100, 800) : 700;

  // ===== ACHIEVEMENT DEFINITIONS =====
  const achievementDefinitions = [
    { id: 'welcome', name: 'Welcome!', description: 'Started your credit journey', icon: '🎉', points: 10 },
    { id: 'first-dispute', name: 'First Strike', description: 'Filed your first dispute', icon: '⚔️', points: 25 },
    { id: 'first-deletion', name: 'Victory!', description: 'Got your first item deleted', icon: '🏆', points: 50 },
    { id: 'score-50', name: 'Rising Star', description: 'Improved score by 50 points', icon: '⭐', points: 100 },
    { id: 'score-100', name: 'Superstar', description: 'Improved score by 100 points', icon: '🌟', points: 200 },
    { id: 'good-credit', name: 'Good Standing', description: 'Reached 670+ credit score', icon: '👍', points: 150 },
    { id: 'excellent-credit', name: 'Excellent!', description: 'Reached 740+ credit score', icon: '🎯', points: 300 },
    { id: 'perfect-docs', name: 'Organized', description: 'Submitted all documents', icon: '📋', points: 25 },
    { id: 'referral', name: 'Friend Helper', description: 'Referred a friend', icon: '🤝', points: 50 },
    { id: 'loyal', name: 'Loyal Member', description: '3 months as a client', icon: '💎', points: 75 }
  ];

  // ===== TAB DEFINITIONS =====
  const tabs = [
    { label: 'Dashboard', icon: Home },
    { label: 'My Scores', icon: BarChart3 },
    { label: 'Disputes', icon: Shield },
    { label: 'Documents', icon: FileText },
    { label: 'Savings', icon: DollarSign },
    { label: 'Achievements', icon: Trophy }
  ];

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 'medium' }}>
            Loading your progress...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Gathering your credit data and achievements
          </Typography>
        </Box>
      </Container>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* ===== CONFETTI CELEBRATION ===== */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}

      {/* ===== WELCOME CARD ===== */}
      <HumanTouchWelcomeCard 
        clientName={clientData?.firstName || contactData?.firstName || user?.displayName?.split(' ')[0]}
      />

      {/* ===== NAVIGATION TABS ===== */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 'medium'
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <tab.icon size={20} />
                  {!isMobile && tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: DASHBOARD */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Fade in timeout={500}>
          <Box>
            {/* ===== QUICK STATS ROW ===== */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <QuickStatCard
                  icon={BarChart3}
                  label="Average Score"
                  value={avgScore || '—'}
                  subValue={stats.scoreIncrease !== 0 ? `${stats.scoreIncrease > 0 ? '+' : ''}${stats.scoreIncrease} pts` : null}
                  color="#3B82F6"
                  trend={stats.scoreIncrease}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <QuickStatCard
                  icon={Shield}
                  label="Active Disputes"
                  value={stats.pendingDisputes}
                  subValue={`${stats.totalDisputes} total filed`}
                  color="#8B5CF6"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <QuickStatCard
                  icon={Trophy}
                  label="Items Deleted"
                  value={stats.successfulDeletions}
                  subValue={stats.completionRate > 0 ? `${stats.completionRate}% success rate` : null}
                  color="#10B981"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <QuickStatCard
                  icon={Calendar}
                  label="Days Active"
                  value={stats.daysActive}
                  subValue="Keep going!"
                  color="#F59E0B"
                />
              </Grid>
            </Grid>

            {/* ===== MAIN CONTENT GRID ===== */}
            <Grid container spacing={3}>
              {/* ===== LEFT COLUMN: SCORES ===== */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChart3 size={24} /> Your Credit Scores
                    </Typography>
                    <Tooltip title="Refresh Scores">
                      <IconButton onClick={loadCreditScores}>
                        <RefreshCw size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {avgScore > 0 ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.experian.current}
                          previousScore={creditScores.experian.previous}
                          bureau="Experian"
                          size={180}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.equifax.current}
                          previousScore={creditScores.equifax.previous}
                          bureau="Equifax"
                          size={180}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.transunion.current}
                          previousScore={creditScores.transunion.previous}
                          bureau="TransUnion"
                          size={180}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <BarChart3 size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Credit Scores Coming Soon
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Once your credit report is pulled, your scores will appear here
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Zap size={18} />}
                        onClick={() => window.location.href = '/idiq-enrollment'}
                      >
                        Get Your Free Credit Report
                      </Button>
                    </Box>
                  )}
                </Paper>

                {/* ===== AI INSIGHTS ===== */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <AIInsightsPanel
                    clientData={clientData}
                    creditScores={creditScores}
                    disputes={disputes}
                  />
                </Paper>
              </Grid>

              {/* ===== RIGHT COLUMN: TIMELINE & PROGRESS ===== */}
              <Grid item xs={12} lg={4}>
                {/* ===== JOURNEY PROGRESS ===== */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rocket size={24} /> Your Journey
                  </Typography>
                  <MilestoneTimeline
                    milestones={milestones}
                    currentStage={stats.currentStage}
                  />
                </Paper>

                {/* ===== DOCUMENT STATUS ===== */}
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={24} /> Document Status
                  </Typography>
                  <DocumentStatusTracker documents={documents} />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MY SCORES */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Fade in timeout={500}>
          <Box>
            <Grid container spacing={3}>
              {/* ===== LARGE SCORE DISPLAY ===== */}
              <Grid item xs={12}>
                <Paper sx={{ p: 4, borderRadius: 2, background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
                    Credit Score Overview
                  </Typography>
                  
                  {avgScore > 0 ? (
                    <Grid container spacing={4} justifyContent="center">
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.experian.current}
                          previousScore={creditScores.experian.previous}
                          bureau="Experian"
                          size={220}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.equifax.current}
                          previousScore={creditScores.equifax.previous}
                          bureau="Equifax"
                          size={220}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <AnimatedScoreGauge
                          score={creditScores.transunion.current}
                          previousScore={creditScores.transunion.previous}
                          bureau="TransUnion"
                          size={220}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <BarChart3 size={80} style={{ color: '#D1D5DB', marginBottom: 24 }} />
                      <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                        No Credit Scores Yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        Your credit scores will appear here once we pull your credit report. This typically happens within 24 hours of enrollment.
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Zap size={20} />}
                      >
                        Get Your Free Credit Report
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* ===== SCORE HISTORY CHARTS ===== */}
              {avgScore > 0 && (
                <>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Experian History
                      </Typography>
                      <ScoreTrendChart 
                        history={creditScores.experian.history}
                        bureau="experian"
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Equifax History
                      </Typography>
                      <ScoreTrendChart 
                        history={creditScores.equifax.history}
                        bureau="equifax"
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        TransUnion History
                      </Typography>
                      <ScoreTrendChart 
                        history={creditScores.transunion.history}
                        bureau="transunion"
                      />
                    </Paper>
                  </Grid>
                </>
              )}

              {/* ===== SCORE FACTORS ===== */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Understanding Your Score
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { name: 'Payment History', weight: 35, description: 'On-time payments are crucial', icon: Calendar, color: '#10B981' },
                      { name: 'Credit Utilization', weight: 30, description: 'Keep balances below 30%', icon: CreditCard, color: '#3B82F6' },
                      { name: 'Length of History', weight: 15, description: 'Older accounts help your score', icon: Clock, color: '#8B5CF6' },
                      { name: 'Credit Mix', weight: 10, description: 'Different types of credit', icon: PieChart, color: '#F59E0B' },
                      { name: 'New Credit', weight: 10, description: 'Limit new applications', icon: Plus, color: '#EF4444' }
                    ].map((factor) => (
                      <Grid item xs={12} sm={6} md={2.4} key={factor.name}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                          <Avatar sx={{ bgcolor: `${factor.color}20`, color: factor.color, mx: 'auto', mb: 1 }}>
                            <factor.icon size={20} />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {factor.name}
                          </Typography>
                          <Typography variant="h5" sx={{ color: factor.color, fontWeight: 'bold', my: 1 }}>
                            {factor.weight}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {factor.description}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: DISPUTES */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Fade in timeout={500}>
          <Box>
            {/* ===== DISPUTES OVERVIEW ===== */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: '#DBEAFE', border: '1px solid #3B82F6' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1D4ED8' }}>
                      {stats.totalDisputes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Disputes</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: '#FEF3C7', border: '1px solid #F59E0B' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#D97706' }}>
                      {stats.pendingDisputes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: '#D1FAE5', border: '1px solid #10B981' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {stats.successfulDeletions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Deleted! 🎉</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ bgcolor: '#EDE9FE', border: '1px solid #8B5CF6' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#7C3AED' }}>
                      {stats.completionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ===== DISPUTES LIST ===== */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={24} /> Your Disputes
                </Typography>
              </Box>

              {disputes.length > 0 ? (
                <Box>
                  {disputes.map((dispute, index) => (
                    <DisputeStatusCard key={dispute.id} dispute={dispute} index={index} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Shield size={80} style={{ color: '#D1D5DB', marginBottom: 24 }} />
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                    No Disputes Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                    Once I review your credit report, I'll identify items that can potentially be disputed 
                    and removed. This process typically begins within 24-48 hours of receiving your credit report.
                  </Typography>
                  <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto' }}>
                    <Typography variant="body2">
                      <strong>What happens next?</strong> I personally review every credit report to identify 
                      inaccurate, incomplete, or unverifiable information that can be disputed under the FCRA.
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: DOCUMENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <Fade in timeout={500}>
          <Box>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={24} /> Document Center
              </Typography>
              
              <DocumentStatusTracker documents={documents} />

              <Divider sx={{ my: 4 }} />

              {/* ===== DOCUMENT UPLOAD AREA ===== */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Upload New Documents
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.light'
                  }
                }}
              >
                <Upload size={48} style={{ color: '#9CA3AF', marginBottom: 16 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Drag and drop files here, or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Upload size={18} />}
                  sx={{ mt: 2 }}
                >
                  Select Files
                </Button>
              </Box>

              {/* ===== UPLOADED DOCUMENTS LIST ===== */}
              {documents.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Uploaded Documents ({documents.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {documents.map((doc) => (
                      <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card variant="outlined">
                          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                              <FileText size={20} />
                            </Avatar>
                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                              <Typography variant="subtitle2" noWrap>
                                {doc.name || doc.type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {doc.uploadedAt ? new Date(doc.uploadedAt.toDate()).toLocaleDateString() : 'Recently'}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={doc.verified ? 'Verified' : 'Pending'}
                              color={doc.verified ? 'success' : 'warning'}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: SAVINGS CALCULATOR */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 4 && (
        <Fade in timeout={500}>
          <Box>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#065F46', mb: 1 }}>
                  💰 Your Potential Savings
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  ${stats.estimatedSavings.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Estimated lifetime savings with improved credit
                </Typography>
              </Box>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FinancialImpactCard
                  icon={HomeIcon}
                  title="Mortgage Savings"
                  description="On a $400,000 30-year loan"
                  currentScore={avgScore}
                  targetScore={targetScore}
                  calculateSavings={calculateMortgageSavings}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FinancialImpactCard
                  icon={Car}
                  title="Auto Loan Savings"
                  description="On a $35,000 5-year loan"
                  currentScore={avgScore}
                  targetScore={targetScore}
                  calculateSavings={calculateAutoSavings}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FinancialImpactCard
                  icon={CreditCard}
                  title="Credit Card Savings"
                  description="On $8,000 average balance"
                  currentScore={avgScore}
                  targetScore={targetScore}
                  calculateSavings={calculateCreditCardSavings}
                />
              </Grid>
            </Grid>

            {/* ===== PRO TIP FROM CHRIS ===== */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F59E0B', color: 'white' }}>
                  <Lightbulb size={24} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#92400E', mb: 1 }}>
                    Pro Tip from Chris
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    As a current Finance Director at one of Toyota's top franchises, I see firsthand how much 
                    credit scores affect auto loan rates. Even a 50-point improvement can save you thousands. 
                    The best part? Many of my clients achieve 100+ point improvements within 6 months. 
                    <strong> Call me at {CHRIS_INFO.phone} and I'll personally review your situation.</strong>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: ACHIEVEMENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 5 && (
        <Fade in timeout={500}>
          <Box>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Trophy size={24} /> Your Achievements
              </Typography>

              <Grid container spacing={3}>
                {achievementDefinitions.map((achievement) => {
                  const unlocked = achievements.some(a => a.id === achievement.id) || 
                    (achievement.id === 'welcome') ||
                    (achievement.id === 'first-dispute' && stats.totalDisputes > 0) ||
                    (achievement.id === 'first-deletion' && stats.successfulDeletions > 0);

                  return (
                    <Grid item xs={6} sm={4} md={2.4} key={achievement.id}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AchievementBadge achievement={achievement} unlocked={unlocked} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 1, 
                            fontWeight: 'medium',
                            opacity: unlocked ? 1 : 0.5 
                          }}
                        >
                          {achievement.name}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* ===== POINTS SUMMARY ===== */}
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                  ⭐ {achievementDefinitions.filter(a => 
                    achievements.some(ua => ua.id === a.id) || 
                    a.id === 'welcome' ||
                    (a.id === 'first-dispute' && stats.totalDisputes > 0) ||
                    (a.id === 'first-deletion' && stats.successfulDeletions > 0)
                  ).reduce((sum, a) => sum + a.points, 0)} Points
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep going to unlock more achievements!
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
          }
        }}
        onClick={() => window.location.href = `tel:${CHRIS_INFO.phone.replace(/[^\d]/g, '')}`}
      >
        <Phone size={24} />
      </Fab>

      {/* ===== NOTIFICATION SNACKBAR ===== */}
      <Snackbar
        open={notification.show}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientProgressPortal;