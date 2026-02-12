// ============================================================================
// CalendarSchedulingHub.jsx - TIER 5+ ENTERPRISE Calendar & Scheduling Hub
// ============================================================================
// Path: /src/pages/hubs/CalendarSchedulingHub.jsx
//
// MEGA ENHANCED VERSION - 8 TABS, 60+ AI FEATURES
// Merged: CalendarSchedulingHub (appointments/availability/Firebase) +
//         Calendar.jsx backup (AI Engine/conflict detection/optimization)
//
// COMPREHENSIVE SCHEDULING COMMAND CENTER with 8 tabs:
// 1. Calendar View - Interactive month/week calendar with appointment overlay
// 2. Appointments - Full CRUD appointment management with status tracking
// 3. AI Smart Scheduler - AI-powered optimal time slot suggestions
// 4. Conflict Detector - Real-time conflict detection & resolution engine
// 5. Schedule Optimizer - Gap analysis, workload balancing, efficiency scoring
// 6. Team Availability - Per-member availability management with Firebase
// 7. Pattern Analytics - Calendar pattern analysis & productivity insights
// 8. Settings - Scheduling preferences with Firebase persistence
//
// AI FEATURES FROM BACKUP CALENDAR ENGINE:
// ✅ Energy-level-aware scheduling (peak productivity hours)
// ✅ Conflict detection with severity levels (critical/high/medium)
// ✅ Travel time estimation between locations
// ✅ Schedule scoring & optimization recommendations
// ✅ Pattern analysis (busiest day, peak hours, meeting load)
// ✅ Recurrence pattern detection
// ✅ Day load balancing across the week
// ✅ Buffer time enforcement between appointments
// ✅ No-show risk prediction with recommendations
// ✅ Mutual availability finder for multi-attendee meetings
//
// Zero new Cloud Functions - all client-side Firestore operations
// Zero mock data - every tab pulls from Firebase or shows clean empty states
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Skeleton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Bell,
  Settings,
  Repeat,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Link as LinkIcon,
  Copy,
  Send,
  Eye,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  Brain,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Save,
  Info,
  Lightbulb,
  Timer,
  Gauge,
  Shield,
  Star,
  DollarSign,
  FileText,
  BarChart,
  PieChart,
  Layers,
  GitBranch,
  Coffee,
} from 'lucide-react';
import {
  collection, query, where, orderBy, getDocs, getDoc, doc, setDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, onSnapshot,
  limit, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// HELPER FUNCTIONS FOR AI ENGINE (defined before AICalendarEngine)
// ============================================================================

function calculateEnergyLevel(hour) {
  // Models human energy/productivity throughout the day
  if (hour >= 9 && hour <= 11) return 90;   // Peak morning focus
  if (hour >= 14 && hour <= 16) return 85;   // Afternoon steady
  if (hour >= 7 && hour <= 9) return 75;     // Early morning ramp-up
  if (hour >= 16 && hour <= 18) return 70;   // Late afternoon wind-down
  if (hour >= 11 && hour <= 14) return 60;   // Post-lunch dip
  return 50;                                  // Outside business hours
}

function calculateConflictScore(slotStart, events) {
  // How conflict-free is this time slot? (100 = no conflicts nearby)
  const dayEvents = events.filter(e => {
    const eDate = e.scheduledFor?.toDate?.() ? e.scheduledFor.toDate() : new Date(e.start || e.scheduledFor);
    return eDate.toDateString() === slotStart.toDateString();
  });
  return Math.max(0, 100 - (dayEvents.length * 10));
}

function calculateDayLoadScore(slotStart, events) {
  // How loaded is this day? (100 = empty day, 25 = very busy)
  const dayEvents = events.filter(e => {
    const eDate = e.scheduledFor?.toDate?.() ? e.scheduledFor.toDate() : new Date(e.start || e.scheduledFor);
    return eDate.toDateString() === slotStart.toDateString();
  });
  if (dayEvents.length === 0) return 100;
  if (dayEvents.length <= 2) return 90;
  if (dayEvents.length <= 4) return 75;
  if (dayEvents.length <= 6) return 50;
  return 25;
}

function calculateSlotConfidence(metrics) {
  // Weighted confidence score for a suggested time slot
  const { energyLevel, conflictScore, dayLoadScore, hour, dayOfWeek } = metrics;
  let confidence =
    (energyLevel * 0.3) +
    (conflictScore * 0.3) +
    (dayLoadScore * 0.2);
  if (hour >= 9 && hour <= 11) confidence += 10;     // Morning bonus
  if (dayOfWeek >= 1 && dayOfWeek <= 5) confidence += 5; // Weekday bonus
  return Math.min(100, Math.round(confidence));
}

function generateSlotReason(hour, energyLevel, dayLoadScore) {
  if (energyLevel >= 85 && dayLoadScore >= 90) return 'Optimal time — high energy, light schedule';
  if (energyLevel >= 80) return 'Great time — peak productivity hours';
  if (dayLoadScore >= 90) return 'Good time — schedule is light';
  if (hour >= 9 && hour <= 11) return 'Morning slot — fresh start';
  if (hour >= 14 && hour <= 16) return 'Afternoon slot — steady focus';
  return 'Available slot';
}

function generateConflictResolution(overlapMinutes) {
  if (overlapMinutes < 15) return 'Shift one event by 15 minutes';
  if (overlapMinutes < 30) return 'Shift one event by 30 minutes or shorten duration';
  return 'Reschedule to a different time slot';
}

function estimateTravelTime(location1, location2) {
  // AI travel time estimation between appointment locations
  if (!location1 || !location2) return 0;
  if (location1.toLowerCase() === location2.toLowerCase()) return 0;
  const remoteKeywords = ['zoom', 'teams', 'meet', 'video', 'call', 'remote', 'virtual', 'phone'];
  const isRemote1 = remoteKeywords.some(k => location1.toLowerCase().includes(k));
  const isRemote2 = remoteKeywords.some(k => location2.toLowerCase().includes(k));
  if (isRemote1 || isRemote2) return 5;
  if (location1.includes('Room') || location2.includes('Room')) return 10;
  return 30; // Default for different physical locations
}

// ============================================================================
// AI CALENDAR ENGINE - Advanced Scheduling Intelligence
// ============================================================================
// Ported from Calendar.jsx backup (300+ lines of AI logic)
// Works with both appointment objects (scheduledFor Timestamp) and
// event objects (start/end Date strings) for maximum compatibility
// ============================================================================

const AICalendarEngine = {
  // ===== AI-Powered Smart Scheduling Algorithm =====
  // Scans next 14 days for optimal time slots based on energy levels,
  // existing load, conflicts, and buffer time requirements
  suggestOptimalTimeSlots: (appointments, preferences = {}, duration = 30) => {
    const {
      preferredHours = { start: 9, end: 17 },
      preferredDays = [1, 2, 3, 4, 5],
      bufferTime = 15,
    } = preferences;

    const suggestions = [];
    const now = new Date();
    const scanEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    for (let date = new Date(now); date <= scanEnd; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (!preferredDays.includes(dayOfWeek)) continue;

      for (let hour = preferredHours.start; hour < preferredHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          if (slotStart <= now) continue;

          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          // Check availability against existing appointments
          const isAvailable = !appointments.some(appt => {
            const apptStart = appt.scheduledFor?.toDate?.() ? appt.scheduledFor.toDate() : new Date(appt.start || appt.scheduledFor);
            const apptDuration = appt.duration || 30;
            const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);

            const bufferedStart = new Date(apptStart.getTime() - bufferTime * 60000);
            const bufferedEnd = new Date(apptEnd.getTime() + bufferTime * 60000);

            return (
              (slotStart >= bufferedStart && slotStart < bufferedEnd) ||
              (slotEnd > bufferedStart && slotEnd <= bufferedEnd) ||
              (slotStart <= bufferedStart && slotEnd >= bufferedEnd)
            );
          });

          if (isAvailable) {
            const energyLevel = calculateEnergyLevel(hour);
            const conflictScore = calculateConflictScore(slotStart, appointments);
            const dayLoadScore = calculateDayLoadScore(slotStart, appointments);

            const confidence = calculateSlotConfidence({
              energyLevel, conflictScore, dayLoadScore, hour, dayOfWeek,
            });

            suggestions.push({
              start: new Date(slotStart),
              end: new Date(slotEnd),
              duration,
              confidence,
              energyLevel,
              dayLoadScore,
              reason: generateSlotReason(hour, energyLevel, dayLoadScore),
            });
          }
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 20);
  },

  // ===== Conflict Detection with Severity & Resolution =====
  detectConflicts: (appointments, newAppt) => {
    const conflicts = [];
    const newStart = newAppt.scheduledFor?.toDate?.() ? newAppt.scheduledFor.toDate() : new Date(newAppt.start || newAppt.scheduledFor);
    const newDuration = newAppt.duration || 30;
    const newEnd = new Date(newStart.getTime() + newDuration * 60000);

    appointments.forEach(appt => {
      if (appt.id === newAppt.id) return; // Skip self
      const apptStart = appt.scheduledFor?.toDate?.() ? appt.scheduledFor.toDate() : new Date(appt.start || appt.scheduledFor);
      const apptDuration = appt.duration || 30;
      const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);

      // Check time overlap
      const hasOverlap = (newStart < apptEnd && newEnd > apptStart);

      if (hasOverlap) {
        const overlapMs = Math.min(newEnd, apptEnd) - Math.max(newStart, apptStart);
        const overlapMinutes = Math.round(overlapMs / 60000);

        conflicts.push({
          type: 'time_overlap',
          severity: overlapMinutes > 30 ? 'critical' : overlapMinutes > 15 ? 'high' : 'medium',
          conflictingAppt: appt,
          overlapMinutes,
          suggestion: `Overlaps with "${appt.clientName || appt.title || 'appointment'}" by ${overlapMinutes} min`,
          resolution: generateConflictResolution(overlapMinutes),
        });
      }

      // Check travel time between locations
      if (appt.location && newAppt.location && appt.location !== newAppt.location) {
        const timeBetween = Math.abs(newStart - apptEnd) / 60000;
        const travelNeeded = estimateTravelTime(appt.location, newAppt.location);

        if (timeBetween < travelNeeded && timeBetween < 60) {
          conflicts.push({
            type: 'travel_time',
            severity: 'medium',
            conflictingAppt: appt,
            travelTime: travelNeeded,
            availableTime: Math.round(timeBetween),
            suggestion: `Only ${Math.round(timeBetween)} min between locations (need ~${travelNeeded} min)`,
            resolution: `Add ${Math.ceil(travelNeeded - timeBetween)} min buffer or switch to video call`,
          });
        }
      }
    });

    // Check daily overload
    const dayEvents = appointments.filter(a => {
      const d = a.scheduledFor?.toDate?.() ? a.scheduledFor.toDate() : new Date(a.start || a.scheduledFor);
      return d.toDateString() === newStart.toDateString();
    });

    if (dayEvents.length >= 8) {
      conflicts.push({
        type: 'daily_overload',
        severity: 'high',
        suggestion: `Already ${dayEvents.length} appointments scheduled this day`,
        resolution: 'Consider rescheduling to a lighter day',
      });
    }

    return conflicts;
  },

  // ===== Schedule Optimization - Gap Analysis & Workload Balancing =====
  optimizeSchedule: (appointments) => {
    const optimizations = [];
    const sorted = [...appointments]
      .filter(a => a.scheduledFor)
      .sort((a, b) => {
        const aDate = a.scheduledFor?.toDate?.() ? a.scheduledFor.toDate() : new Date(a.scheduledFor);
        const bDate = b.scheduledFor?.toDate?.() ? b.scheduledFor.toDate() : new Date(b.scheduledFor);
        return aDate - bDate;
      });

    // Detect gaps between consecutive appointments
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentStart = sorted[i].scheduledFor?.toDate?.() ? sorted[i].scheduledFor.toDate() : new Date(sorted[i].scheduledFor);
      const currentEnd = new Date(currentStart.getTime() + (sorted[i].duration || 30) * 60000);
      const nextStart = sorted[i + 1].scheduledFor?.toDate?.() ? sorted[i + 1].scheduledFor.toDate() : new Date(sorted[i + 1].scheduledFor);

      // Only check same-day gaps
      if (currentEnd.toDateString() === nextStart.toDateString()) {
        const gap = (nextStart - currentEnd) / 60000;
        if (gap > 60 && gap < 180) {
          optimizations.push({
            type: 'gap',
            severity: 'low',
            gap: Math.round(gap),
            between: [sorted[i], sorted[i + 1]],
            suggestion: `${Math.round(gap)} min gap — consider adding a task or consolidating`,
          });
        }
      }
    }

    // Detect overloaded days
    const dailyLoads = {};
    sorted.forEach(a => {
      const d = a.scheduledFor?.toDate?.() ? a.scheduledFor.toDate() : new Date(a.scheduledFor);
      const dateStr = d.toDateString();
      dailyLoads[dateStr] = (dailyLoads[dateStr] || 0) + 1;
    });

    const dayValues = Object.values(dailyLoads);
    const avgLoad = dayValues.length > 0 ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length : 0;

    Object.entries(dailyLoads).forEach(([dateStr, load]) => {
      if (load > Math.max(avgLoad * 1.5, 5)) {
        optimizations.push({
          type: 'overloaded_day',
          severity: 'high',
          date: dateStr,
          eventCount: load,
          average: Math.round(avgLoad),
          suggestion: `${load} appointments (${Math.round(avgLoad > 0 ? ((load / avgLoad) - 1) * 100 : 0)}% above average)`,
        });
      }
    });

    // Detect scattered similar appointment types
    const typeGroups = {};
    sorted.forEach(a => {
      const t = a.type || 'general';
      if (!typeGroups[t]) typeGroups[t] = [];
      typeGroups[t].push(a);
    });

    Object.entries(typeGroups).forEach(([type, group]) => {
      if (group.length >= 3) {
        const scattered = group.some((a, i) => {
          if (i === 0) return false;
          const prevEnd = (() => {
            const d = group[i - 1].scheduledFor?.toDate?.() ? group[i - 1].scheduledFor.toDate() : new Date(group[i - 1].scheduledFor);
            return new Date(d.getTime() + (group[i - 1].duration || 30) * 60000);
          })();
          const currStart = a.scheduledFor?.toDate?.() ? a.scheduledFor.toDate() : new Date(a.scheduledFor);
          return (currStart - prevEnd) / 60000 > 240;
        });

        if (scattered) {
          optimizations.push({
            type: 'scattered_events',
            severity: 'medium',
            eventType: type,
            count: group.length,
            suggestion: `${group.length} "${type}" appointments scattered — group for better focus`,
          });
        }
      }
    });

    // Calculate overall schedule score
    let score = 100;
    optimizations.forEach(opt => {
      if (opt.severity === 'critical') score -= 20;
      else if (opt.severity === 'high') score -= 15;
      else if (opt.severity === 'medium') score -= 10;
      else if (opt.severity === 'low') score -= 5;
    });

    // Generate recommendations
    const recommendations = [];
    const gaps = optimizations.filter(o => o.type === 'gap');
    if (gaps.length > 0) recommendations.push(`Found ${gaps.length} scheduling gaps — consider filling with tasks or consolidating`);
    const overloaded = optimizations.filter(o => o.type === 'overloaded_day');
    if (overloaded.length > 0) recommendations.push(`${overloaded.length} overloaded days — redistribute for better balance`);
    const scattered = optimizations.filter(o => o.type === 'scattered_events');
    if (scattered.length > 0) recommendations.push(`Similar appointments scattered — group by type for better focus`);
    if (recommendations.length === 0) recommendations.push('Schedule is well optimized!');

    return { optimizations, score: Math.max(0, score), recommendations };
  },

  // ===== Calendar Pattern Analysis =====
  analyzePatterns: (appointments) => {
    const patterns = {
      busiestDay: null, busiestHour: null, mostCommonType: null,
      avgPerDay: 0, avgDuration: 0, meetingLoad: 0,
      typeDistribution: {}, hourDistribution: {}, dayOfWeekDistribution: {},
    };

    if (appointments.length === 0) return patterns;

    const dayCount = {};
    const dowCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dowNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    appointments.forEach(a => {
      const d = a.scheduledFor?.toDate?.() ? a.scheduledFor.toDate() : new Date(a.start || a.scheduledFor);
      const dateStr = d.toLocaleDateString();
      dayCount[dateStr] = (dayCount[dateStr] || 0) + 1;

      const hour = d.getHours();
      patterns.hourDistribution[hour] = (patterns.hourDistribution[hour] || 0) + 1;

      const dow = dowNames[d.getDay()];
      dowCount[dow] = (dowCount[dow] || 0) + 1;

      const type = a.type || 'general';
      patterns.typeDistribution[type] = (patterns.typeDistribution[type] || 0) + 1;
    });

    patterns.dayOfWeekDistribution = dowCount;

    if (Object.keys(dayCount).length > 0) {
      patterns.busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    if (Object.keys(patterns.hourDistribution).length > 0) {
      patterns.busiestHour = parseInt(Object.entries(patterns.hourDistribution).sort((a, b) => b[1] - a[1])[0][0]);
    }

    if (Object.keys(patterns.typeDistribution).length > 0) {
      patterns.mostCommonType = Object.entries(patterns.typeDistribution).sort((a, b) => b[1] - a[1])[0][0];
    }

    const totalDuration = appointments.reduce((sum, a) => sum + (a.duration || 30), 0);
    patterns.avgDuration = Math.round(totalDuration / appointments.length);

    const uniqueDays = new Set(Object.keys(dayCount)).size;
    patterns.avgPerDay = parseFloat((appointments.length / Math.max(uniqueDays, 1)).toFixed(1));

    // Meeting load as percentage of work hours
    const meetingTypes = ['consultation', 'followup', 'strategy', 'review', 'meeting'];
    const meetingMinutes = appointments
      .filter(a => meetingTypes.includes(a.type))
      .reduce((sum, a) => sum + (a.duration || 30), 0);
    const totalWorkMinutes = Math.max(uniqueDays, 1) * 8 * 60;
    patterns.meetingLoad = parseFloat(((meetingMinutes / totalWorkMinutes) * 100).toFixed(1));

    return patterns;
  },

  // ===== No-Show Risk Prediction =====
  predictNoShowRisk: (appointment) => {
    let riskScore = 0;
    const factors = [];

    if (appointment.status !== 'confirmed') {
      riskScore += 30;
      factors.push('Not yet confirmed');
    }

    const now = new Date();
    const apptTime = appointment.scheduledFor?.toDate?.() ? appointment.scheduledFor.toDate() : new Date(appointment.scheduledFor);
    const hoursUntil = (apptTime - now) / (1000 * 60 * 60);

    if (hoursUntil < 2 && hoursUntil > 0) {
      riskScore += 20;
      factors.push('Less than 2 hours away');
    }

    if (appointment.isFirstAppointment) {
      riskScore += 25;
      factors.push('First-time appointment');
    }

    if (appointment.previousNoShows > 0) {
      riskScore += Math.min(appointment.previousNoShows * 15, 30);
      factors.push(`${appointment.previousNoShows} previous no-show(s)`);
    }

    const level = riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

    return {
      level,
      score: Math.min(riskScore, 100),
      factors: factors.length > 0 ? factors : ['No risk factors detected'],
      recommendations: [
        level === 'high' ? 'Send confirmation reminder ASAP' : null,
        level !== 'low' ? 'Call to confirm attendance' : null,
        'Ensure calendar invite was sent',
      ].filter(Boolean),
    };
  },
};

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const APPOINTMENT_TYPES = {
  consultation: { label: 'Free Consultation', duration: 30, color: '#3b82f6', icon: Users },
  followup: { label: 'Follow-up Call', duration: 15, color: '#10b981', icon: Phone },
  strategy: { label: 'Strategy Session', duration: 60, color: '#8b5cf6', icon: Target },
  review: { label: 'Credit Review', duration: 45, color: '#f59e0b', icon: Activity },
  onboarding: { label: 'Client Onboarding', duration: 60, color: '#ec4899', icon: UserPlus },
  dispute: { label: 'Dispute Planning', duration: 30, color: '#ef4444', icon: Shield },
};

const APPOINTMENT_STATUSES = {
  scheduled: { label: 'Scheduled', color: '#3b82f6', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#10b981', icon: CheckCircle },
  completed: { label: 'Completed', color: '#6b7280', icon: Check },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: XCircle },
  noshow: { label: 'No-Show', color: '#f59e0b', icon: AlertCircle },
};

const MEETING_PLATFORMS = {
  zoom: { label: 'Zoom', icon: Video, color: '#2d8cff' },
  phone: { label: 'Phone Call', icon: Phone, color: '#10b981' },
  inperson: { label: 'In-Person', icon: MapPin, color: '#f59e0b' },
  video: { label: 'Video Call', icon: Video, color: '#8b5cf6' },
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const TAB_CONFIG = [
  { id: 0, label: 'Calendar', icon: CalendarIcon, badge: null },
  { id: 1, label: 'Appointments', icon: Clock, badge: null },
  { id: 2, label: 'Smart Scheduler', icon: Sparkles, badge: 'AI' },
  { id: 3, label: 'Conflicts', icon: AlertTriangle, badge: 'AI' },
  { id: 4, label: 'Optimizer', icon: Gauge, badge: 'AI' },
  { id: 5, label: 'Availability', icon: Users, badge: null },
  { id: 6, label: 'Patterns', icon: BarChart3, badge: 'AI' },
  { id: 7, label: 'Settings', icon: Settings, badge: null },
];

// ============================================================================
// HELPER: Notification Snackbar Hook
// ============================================================================
function useNotification() {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);
  const NotificationBar = () => (
    <Snackbar open={notification.open} autoHideDuration={4000} onClose={closeNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert onClose={closeNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
  return { showNotification, NotificationBar };
}

// ============================================================================
// HELPER: Stats Card Component
// ============================================================================
function StatsCard({ icon: Icon, title, value, subtitle, color = 'primary.main', trend }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48 }}>
              <Icon size={24} style={{ color }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">{value}</Typography>
              <Typography variant="body2" color="text.secondary">{title}</Typography>
            </Box>
          </Box>
          {trend !== undefined && (
            <Chip
              icon={trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              size="small"
              color={trend >= 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

// ============================================================================

// ============================================================================
// TAB 1: CALENDAR VIEW - Interactive month calendar with appointment overlay
// ============================================================================

function CalendarViewTab({ appointments, currentDate, setCurrentDate, filterTeamMember,
  setFilterTeamMember, teamMembers, setAppointmentDialogOpen, setSelectedAppointment }) {

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // ===== BUILD CALENDAR GRID =====
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    let day = new Date(startDate);
    while (days.length < 42) { // Always 6 rows for consistent layout
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // ===== APPOINTMENT COUNT BY DAY (for quick stats) =====
  const todayAppts = appointments.filter(a => {
    try {
      return a.scheduledFor.toDate().toDateString() === new Date().toDateString();
    } catch { return false; }
  });
  const upcomingAppts = appointments.filter(a => {
    try { return a.scheduledFor.toDate() >= new Date(); } catch { return false; }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== QUICK STATS ===== */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={CalendarIcon} title="This Month" value={appointments.length} color="#3b82f6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Clock} title="Today" value={todayAppts.length} color="#10b981" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={ArrowRight} title="Upcoming" value={upcomingAppts.length} color="#8b5cf6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={CheckCircle} title="Completed"
            value={appointments.filter(a => a.status === 'completed').length} color="#6b7280" />
        </Grid>
      </Grid>

      {/* ===== CALENDAR CONTROLS ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => {
                const d = new Date(currentDate);
                d.setMonth(d.getMonth() - 1);
                setCurrentDate(d);
              }}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" fontWeight="bold">{monthName}</Typography>
              <IconButton onClick={() => {
                const d = new Date(currentDate);
                d.setMonth(d.getMonth() + 1);
                setCurrentDate(d);
              }}>
                <ChevronRight />
              </IconButton>
              <Button size="small" onClick={() => setCurrentDate(new Date())}>Today</Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Team Member</InputLabel>
                <Select value={filterTeamMember} label="Team Member"
                  onChange={(e) => setFilterTeamMember(e.target.value)}>
                  <MenuItem value="all">All Team</MenuItem>
                  {teamMembers.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Plus size={16} />}
                onClick={() => setAppointmentDialogOpen(true)}>
                New Appointment
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ===== CALENDAR GRID ===== */}
      <Card>
        <CardContent>
          {/* Day headers */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {DAYS_OF_WEEK.map(day => (
              <Grid item xs key={day} sx={{ width: `${100 / 7}%` }}>
                <Typography variant="caption" fontWeight="bold" align="center" display="block"
                  sx={{ color: day === 'Sunday' || day === 'Saturday' ? 'text.disabled' : 'text.primary' }}>
                  {day.substring(0, 3)}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar cells */}
          <Grid container spacing={1}>
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayAppts = appointments.filter(a => {
                try { return a.scheduledFor.toDate().toDateString() === day.toDateString(); }
                catch { return false; }
              });

              return (
                <Grid item xs key={index} sx={{ width: `${100 / 7}%` }}>
                  <Paper
                    elevation={isToday ? 3 : 0}
                    sx={{
                      p: 1, minHeight: 90, cursor: 'pointer',
                      opacity: isCurrentMonth ? 1 : 0.4,
                      borderTop: isToday ? '3px solid #3b82f6' : '1px solid transparent',
                      bgcolor: isToday ? 'action.hover' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}
                        color={isToday ? 'primary.main' : 'text.primary'}>
                        {day.getDate()}
                      </Typography>
                      {dayAppts.length > 0 && (
                        <Badge badgeContent={dayAppts.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }} />
                      )}
                    </Box>

                    {dayAppts.slice(0, 3).map(appt => {
                      const typeConfig = APPOINTMENT_TYPES[appt.type];
                      return (
                        <Chip key={appt.id} label={appt.clientName} size="small"
                          sx={{
                            width: '100%', mb: 0.5, fontSize: '0.6rem', height: 20,
                            bgcolor: typeConfig?.color || '#3b82f6', color: 'white',
                            '& .MuiChip-label': { px: 0.5 },
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }}
                        />
                      );
                    })}
                    {dayAppts.length > 3 && (
                      <Typography variant="caption" color="text.secondary" fontSize="0.6rem">
                        +{dayAppts.length - 3} more
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* ===== UPCOMING APPOINTMENTS LIST ===== */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Upcoming Appointments
          </Typography>
          {upcomingAppts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarIcon size={40} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No upcoming appointments this month</Typography>
              <Button sx={{ mt: 2 }} variant="outlined" startIcon={<Plus size={16} />}
                onClick={() => setAppointmentDialogOpen(true)}>
                Schedule First Appointment
              </Button>
            </Box>
          ) : (
            <List>
              {upcomingAppts.slice(0, 8).map(appt => {
                const typeConfig = APPOINTMENT_TYPES[appt.type];
                const statusConfig = APPOINTMENT_STATUSES[appt.status] || APPOINTMENT_STATUSES.scheduled;
                const TypeIcon = typeConfig?.icon || CalendarIcon;
                const noShowRisk = AICalendarEngine.predictNoShowRisk(appt);

                return (
                  <ListItem key={appt.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: typeConfig?.color || '#3b82f6' }}>
                        <TypeIcon size={20} color="white" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography fontWeight="bold">{appt.clientName}</Typography>
                          {noShowRisk.level !== 'low' && (
                            <Chip label={`${noShowRisk.level} no-show risk`} size="small"
                              color={noShowRisk.level === 'high' ? 'error' : 'warning'}
                              variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {appt.scheduledFor.toDate().toLocaleString()}
                          {' · '}{appt.duration || 30} min
                          {' · '}{typeConfig?.label || appt.type}
                        </>
                      }
                    />
                    <Chip label={statusConfig.label} size="small"
                      sx={{ bgcolor: statusConfig.color, color: 'white' }} />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================================
// TAB 2: APPOINTMENTS - Full CRUD management with status tracking
// ============================================================================

function AppointmentsTab({ appointments, handleUpdateStatus, handleDeleteAppointment, setAppointmentDialogOpen }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filtered = useMemo(() => {
    let result = [...appointments];
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter(a => a.type === typeFilter);

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const da = a.scheduledFor?.toDate?.() || new Date(0);
        const db = b.scheduledFor?.toDate?.() || new Date(0);
        return da - db;
      }
      if (sortBy === 'name') return (a.clientName || '').localeCompare(b.clientName || '');
      if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
      return 0;
    });
    return result;
  }, [appointments, statusFilter, typeFilter, sortBy]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {};
    appointments.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return counts;
  }, [appointments]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== STATUS SUMMARY CARDS ===== */}
      <Grid container spacing={2}>
        {Object.entries(APPOINTMENT_STATUSES).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <Grid item xs={6} sm={4} md={2.4} key={key}>
              <Card sx={{ cursor: 'pointer', border: statusFilter === key ? 2 : 0, borderColor: config.color }}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <StatusIcon size={24} style={{ color: config.color }} />
                  <Typography variant="h5" fontWeight="bold">{statusCounts[key] || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">{config.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ===== FILTERS & ACTIONS ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  {Object.entries(APPOINTMENT_TYPES).map(([key, val]) => (
                    <MenuItem key={key} value={key}>{val.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button variant="contained" startIcon={<Plus size={16} />}
              onClick={() => setAppointmentDialogOpen(true)}>
              New Appointment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ===== APPOINTMENTS TABLE ===== */}
      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Clock size={48} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 2 }}>No appointments found</Typography>
              <Typography variant="caption" color="text.secondary">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first appointment to get started'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>No-Show Risk</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(appt => {
                    const typeConfig = APPOINTMENT_TYPES[appt.type];
                    const statusConfig = APPOINTMENT_STATUSES[appt.status] || APPOINTMENT_STATUSES.scheduled;
                    const platformConfig = MEETING_PLATFORMS[appt.platform];
                    const noShowRisk = AICalendarEngine.predictNoShowRisk(appt);

                    return (
                      <TableRow key={appt.id} hover>
                        <TableCell>
                          <Typography fontWeight="bold">{appt.clientName}</Typography>
                          {appt.notes && (
                            <Typography variant="caption" color="text.secondary">{appt.notes.substring(0, 40)}...</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {appt.scheduledFor?.toDate?.() ? appt.scheduledFor.toDate().toLocaleString() : 'No date'}
                        </TableCell>
                        <TableCell>
                          <Chip label={typeConfig?.label || appt.type} size="small"
                            sx={{ bgcolor: typeConfig?.color || '#999', color: 'white' }} />
                        </TableCell>
                        <TableCell>{appt.duration || 30} min</TableCell>
                        <TableCell>
                          <Chip label={platformConfig?.label || appt.platform || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select value={appt.status || 'scheduled'} size="small"
                              onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                              sx={{ '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' } }}>
                              {Object.entries(APPOINTMENT_STATUSES).map(([key, val]) => (
                                <MenuItem key={key} value={key}>{val.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${noShowRisk.level} (${noShowRisk.score}%)`}
                            size="small"
                            color={noShowRisk.level === 'high' ? 'error' : noShowRisk.level === 'medium' ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteAppointment(appt.id)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================================
// TAB 3: AI SMART SCHEDULER - Optimal time slot suggestions
// ============================================================================

function SmartSchedulerTab({ appointments, showNotification }) {
  const [suggestions, setSuggestions] = useState([]);
  const [duration, setDuration] = useState(30);
  const [preferMorning, setPreferMorning] = useState(true);
  const [bufferTime, setBufferTime] = useState(15);
  const [analyzing, setAnalyzing] = useState(false);

  const runSmartScheduler = () => {
    setAnalyzing(true);
    try {
      const prefs = {
        preferredHours: preferMorning ? { start: 8, end: 13 } : { start: 9, end: 17 },
        preferredDays: [1, 2, 3, 4, 5],
        bufferTime,
      };

      const results = AICalendarEngine.suggestOptimalTimeSlots(appointments, prefs, duration);
      setSuggestions(results);

      if (results.length === 0) {
        showNotification('No available slots found — try different preferences', 'info');
      } else {
        showNotification(`Found ${results.length} optimal time slots`, 'success');
      }
    } catch (error) {
      console.error('❌ Smart scheduler error:', error);
      showNotification('Error running smart scheduler', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getEnergyLabel = (level) => {
    if (level >= 85) return 'Peak Energy';
    if (level >= 70) return 'Good Energy';
    if (level >= 55) return 'Moderate';
    return 'Low Energy';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== AI SCHEDULING CONTROLS ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Sparkles size={24} className="text-purple-500" />
            <Typography variant="h6" fontWeight="bold">AI Smart Scheduler</Typography>
            <Chip label="AI" size="small" sx={{ bgcolor: '#8b5cf6', color: 'white' }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The AI analyzes your existing appointments, energy levels, buffer time needs, and day load
            to find the optimal time slots for your next appointment.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Appointment Duration</InputLabel>
                <Select value={duration} label="Appointment Duration"
                  onChange={(e) => setDuration(e.target.value)}>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                  <MenuItem value={90}>90 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  Buffer Time: {bufferTime} min
                </Typography>
                <Slider value={bufferTime} onChange={(e, v) => setBufferTime(v)}
                  min={0} max={30} step={5} marks valueLabelDisplay="auto" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={<Switch checked={preferMorning} onChange={(e) => setPreferMorning(e.target.checked)} />}
                label="Prefer morning slots"
              />
            </Grid>
          </Grid>

          <Button variant="contained" onClick={runSmartScheduler} disabled={analyzing}
            startIcon={analyzing ? <CircularProgress size={16} /> : <Brain size={16} />}
            sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
            {analyzing ? 'Analyzing...' : 'Find Optimal Time Slots'}
          </Button>
        </CardContent>
      </Card>

      {/* ===== SUGGESTIONS RESULTS ===== */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Top {suggestions.length} Recommended Slots
            </Typography>
            <Grid container spacing={2}>
              {suggestions.map((slot, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{
                    border: index === 0 ? '2px solid #10b981' : undefined,
                    position: 'relative',
                  }}>
                    {index === 0 && (
                      <Chip label="BEST MATCH" size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }} />
                    )}
                    <CardContent>
                      <Typography variant="body1" fontWeight="bold">
                        {slot.start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {slot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {' - '}
                        {slot.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Confidence bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Confidence</Typography>
                          <Typography variant="caption" fontWeight="bold"
                            sx={{ color: getConfidenceColor(slot.confidence) }}>
                            {slot.confidence}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={slot.confidence}
                          sx={{
                            height: 6, borderRadius: 3,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: getConfidenceColor(slot.confidence), borderRadius: 3 },
                          }} />

                        {/* Energy level */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                          <Chip icon={<Zap size={12} />} label={getEnergyLabel(slot.energyLevel)} size="small" variant="outlined" />
                          <Chip icon={<Layers size={12} />}
                            label={`Day Load: ${slot.dayLoadScore >= 80 ? 'Light' : slot.dayLoadScore >= 50 ? 'Moderate' : 'Heavy'}`}
                            size="small" variant="outlined" />
                        </Box>

                        {/* Reason */}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          {slot.reason}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ===== EMPTY STATE ===== */}
      {suggestions.length === 0 && !analyzing && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Brain size={48} style={{ opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Configure your preferences and click "Find Optimal Time Slots" to get AI recommendations
            </Typography>
            <Typography variant="caption" color="text.secondary">
              The AI considers energy levels, existing load, conflicts, and buffer time requirements
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ============================================================================
// TAB 4: CONFLICT DETECTOR - Real-time conflict detection & resolution
// ============================================================================

function ConflictDetectorTab({ appointments }) {
  const [allConflicts, setAllConflicts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  // ===== SCAN ALL APPOINTMENTS FOR CONFLICTS =====
  const runConflictScan = () => {
    setScanning(true);
    try {
      const conflicts = [];

      // Compare every appointment pair
      for (let i = 0; i < appointments.length; i++) {
        const appt = appointments[i];
        if (appt.status === 'cancelled') continue;

        const detected = AICalendarEngine.detectConflicts(
          appointments.filter((_, idx) => idx !== i),
          appt
        );

        detected.forEach(conflict => {
          // Avoid duplicate conflict pairs
          const isDuplicate = conflicts.some(c =>
            c.type === conflict.type &&
            c.conflictingAppt?.id === appt.id &&
            c.sourceAppt?.id === conflict.conflictingAppt?.id
          );

          if (!isDuplicate) {
            conflicts.push({
              ...conflict,
              sourceAppt: appt,
            });
          }
        });
      }

      setAllConflicts(conflicts);
      setLastScanned(new Date());
    } catch (error) {
      console.error('❌ Conflict scan error:', error);
    } finally {
      setScanning(false);
    }
  };

  // Auto-scan on mount
  useEffect(() => {
    if (appointments.length > 0) runConflictScan();
  }, [appointments]);

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return '#ef4444';
    if (severity === 'high') return '#f59e0b';
    if (severity === 'medium') return '#3b82f6';
    return '#10b981';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return XCircle;
    if (severity === 'high') return AlertTriangle;
    return AlertCircle;
  };

  const criticalCount = allConflicts.filter(c => c.severity === 'critical').length;
  const highCount = allConflicts.filter(c => c.severity === 'high').length;
  const mediumCount = allConflicts.filter(c => c.severity === 'medium').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== CONFLICT SUMMARY ===== */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={AlertTriangle} title="Total Conflicts" value={allConflicts.length}
            color={allConflicts.length > 0 ? '#ef4444' : '#10b981'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={XCircle} title="Critical" value={criticalCount} color="#ef4444" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={AlertCircle} title="High" value={highCount} color="#f59e0b" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Shield} title="Medium" value={mediumCount} color="#3b82f6" />
        </Grid>
      </Grid>

      {/* ===== SCAN CONTROLS ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlertTriangle size={24} className="text-orange-500" />
              <Typography variant="h6" fontWeight="bold">AI Conflict Detection Engine</Typography>
              <Chip label="AI" size="small" sx={{ bgcolor: '#f59e0b', color: 'white' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {lastScanned && (
                <Typography variant="caption" color="text.secondary">
                  Last scan: {lastScanned.toLocaleTimeString()}
                </Typography>
              )}
              <Button variant="contained" onClick={runConflictScan} disabled={scanning}
                startIcon={scanning ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
                color="warning">
                {scanning ? 'Scanning...' : 'Re-Scan'}
              </Button>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Detects time overlaps, travel time issues, and daily overload across all appointments.
            Provides severity ratings and resolution suggestions.
          </Typography>
        </CardContent>
      </Card>

      {/* ===== CONFLICT RESULTS ===== */}
      {allConflicts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, color: '#10b981' }}>
              No Conflicts Detected
            </Typography>
            <Typography color="text.secondary">
              {appointments.length > 0
                ? `All ${appointments.length} appointments are conflict-free this month`
                : 'No appointments to scan — create some appointments first'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {allConflicts
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3 };
              return (order[a.severity] || 3) - (order[b.severity] || 3);
            })
            .map((conflict, index) => {
              const SevIcon = getSeverityIcon(conflict.severity);
              return (
                <Card key={index} sx={{ borderLeft: `4px solid ${getSeverityColor(conflict.severity)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${getSeverityColor(conflict.severity)}20`, width: 40, height: 40 }}>
                        <SevIcon size={20} style={{ color: getSeverityColor(conflict.severity) }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip label={conflict.severity.toUpperCase()} size="small"
                            sx={{ bgcolor: getSeverityColor(conflict.severity), color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }} />
                          <Chip label={conflict.type.replace('_', ' ')} size="small" variant="outlined" />
                        </Box>

                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {conflict.sourceAppt?.clientName || 'Appointment'}
                          {conflict.conflictingAppt && ` vs ${conflict.conflictingAppt.clientName || 'another appointment'}`}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {conflict.suggestion}
                        </Typography>

                        {conflict.resolution && (
                          <Alert severity="info" sx={{ mt: 1 }} icon={<Lightbulb size={16} />}>
                            <Typography variant="body2"><strong>Resolution:</strong> {conflict.resolution}</Typography>
                          </Alert>
                        )}

                        {conflict.overlapMinutes && (
                          <Typography variant="caption" color="error">
                            Overlap: {conflict.overlapMinutes} minutes
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// TAB 5: SCHEDULE OPTIMIZER - Gap analysis, workload balancing, scoring
// ============================================================================

function ScheduleOptimizerTab({ appointments }) {
  const [optimization, setOptimization] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runOptimization = () => {
    setAnalyzing(true);
    try {
      const result = AICalendarEngine.optimizeSchedule(appointments);
      setOptimization(result);
    } catch (error) {
      console.error('❌ Optimization error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-run on mount
  useEffect(() => {
    if (appointments.length > 0) runOptimization();
  }, [appointments]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  // Calculate utilization from appointments
  const utilization = useMemo(() => {
    if (appointments.length === 0) return 0;
    const totalMinutes = appointments.reduce((sum, a) => sum + (a.duration || 30), 0);
    const uniqueDays = new Set(appointments.map(a => {
      try { return a.scheduledFor.toDate().toDateString(); } catch { return ''; }
    }).filter(Boolean)).size;
    const workMinutes = Math.max(uniqueDays, 1) * 8 * 60;
    return Math.min(100, Math.round((totalMinutes / workMinutes) * 100));
  }, [appointments]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== SCHEDULE SCORE ===== */}
      <Card sx={{ background: optimization
        ? `linear-gradient(135deg, ${getScoreColor(optimization.score)}15, ${getScoreColor(optimization.score)}05)`
        : undefined }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Gauge size={24} className="text-blue-500" />
            <Typography variant="h6" fontWeight="bold">Schedule Health Score</Typography>
            <Chip label="AI" size="small" sx={{ bgcolor: '#3b82f6', color: 'white' }} />
          </Box>

          {appointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Gauge size={48} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No appointments to analyze — create some appointments first
              </Typography>
            </Box>
          ) : optimization ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={optimization.score}
                      size={120} thickness={6}
                      sx={{ color: getScoreColor(optimization.score), '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(optimization.score) }}>
                        {optimization.score}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getScoreLabel(optimization.score)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatsCard icon={CalendarIcon} title="Appointments" value={appointments.length} color="#3b82f6"
                  subtitle="This month" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatsCard icon={Activity} title="Utilization" value={`${utilization}%`} color="#8b5cf6"
                  subtitle="Of available work hours" />
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Button variant="contained" onClick={runOptimization} disabled={analyzing}
                startIcon={analyzing ? <CircularProgress size={16} /> : <Gauge size={16} />}>
                {analyzing ? 'Analyzing...' : 'Analyze Schedule'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ===== RECOMMENDATIONS ===== */}
      {optimization && optimization.recommendations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              AI Recommendations
            </Typography>
            {optimization.recommendations.map((rec, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }} icon={<Lightbulb size={18} />}>
                {rec}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ===== OPTIMIZATION ISSUES ===== */}
      {optimization && optimization.optimizations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Issues Found ({optimization.optimizations.length})
            </Typography>
            {optimization.optimizations.map((opt, index) => {
              const getSevColor = (s) => s === 'high' ? '#f59e0b' : s === 'medium' ? '#3b82f6' : '#10b981';
              return (
                <Card key={index} variant="outlined" sx={{ mb: 2, borderLeft: `3px solid ${getSevColor(opt.severity)}` }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={opt.severity} size="small"
                        sx={{ bgcolor: getSevColor(opt.severity), color: 'white', textTransform: 'capitalize', fontSize: '0.65rem' }} />
                      <Chip label={opt.type.replace(/_/g, ' ')} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                      {opt.date && <Typography variant="caption" color="text.secondary">{opt.date}</Typography>}
                    </Box>
                    <Typography variant="body2">{opt.suggestion}</Typography>
                    {opt.gap && <Typography variant="caption" color="text.secondary">Gap: {opt.gap} minutes</Typography>}
                    {opt.eventCount && <Typography variant="caption" color="text.secondary">Events: {opt.eventCount} (avg: {opt.average})</Typography>}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ===== NO ISSUES STATE ===== */}
      {optimization && optimization.optimizations.length === 0 && appointments.length > 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, color: '#10b981' }}>
              Schedule is Well Optimized
            </Typography>
            <Typography color="text.secondary">
              No gaps, overloads, or scattered appointments detected
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ============================================================================
// TAB 6: TEAM AVAILABILITY - Per-member availability with Firebase
// ============================================================================

function AvailabilityTab({ teamMembers, availability }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== HEADER ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Users size={24} className="text-green-500" />
            <Typography variant="h6" fontWeight="bold">Team Availability</Typography>
            <Chip label={`${teamMembers.length} members`} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            View team member schedules and availability windows. Availability is loaded from the "availability" Firestore collection.
          </Typography>
        </CardContent>
      </Card>

      {/* ===== TEAM MEMBER CARDS ===== */}
      {teamMembers.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Users size={48} style={{ opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No team members found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Team members are contacts with user, manager, or admin roles
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {teamMembers.map(member => {
            const memberAvail = availability[member.id] || {};
            const availableDays = DAYS_OF_WEEK.filter(day => memberAvail[day]?.enabled).length;

            return (
              <Grid item xs={12} md={6} key={member.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: '#3b82f6' }}>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="bold">
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.roles?.join(', ') || 'Team Member'}
                        </Typography>
                      </Box>
                      <Chip label={`${availableDays} days`} size="small"
                        color={availableDays >= 5 ? 'success' : availableDays >= 3 ? 'warning' : 'error'}
                        variant="outlined" />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <List dense disablePadding>
                      {DAYS_OF_WEEK.map(day => {
                        const dayAvail = memberAvail[day] || { enabled: false };
                        return (
                          <ListItem key={day} sx={{ px: 0 }}>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={dayAvail.enabled ? 'bold' : 'normal'}
                                  color={dayAvail.enabled ? 'text.primary' : 'text.disabled'}>
                                  {day}
                                </Typography>
                              }
                              secondary={
                                dayAvail.enabled
                                  ? `${dayAvail.start || '09:00'} - ${dayAvail.end || '17:00'}`
                                  : 'Unavailable'
                              }
                            />
                            <Chip
                              label={dayAvail.enabled ? 'Available' : 'Off'}
                              size="small"
                              color={dayAvail.enabled ? 'success' : 'default'}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>

                    {/* Contact info if available */}
                    {(member.email || member.phone) && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {member.email && (
                            <Chip icon={<Mail size={12} />} label={member.email} size="small" variant="outlined" />
                          )}
                          {member.phone && (
                            <Chip icon={<Phone size={12} />} label={member.phone} size="small" variant="outlined" />
                          )}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

// ============================================================================
// TAB 7: PATTERN ANALYTICS - Calendar pattern analysis & insights
// ============================================================================

function PatternAnalyticsTab({ appointments }) {
  const patterns = useMemo(() => {
    return AICalendarEngine.analyzePatterns(appointments);
  }, [appointments]);

  const hourLabels = {
    7: '7 AM', 8: '8 AM', 9: '9 AM', 10: '10 AM', 11: '11 AM', 12: '12 PM',
    13: '1 PM', 14: '2 PM', 15: '3 PM', 16: '4 PM', 17: '5 PM', 18: '6 PM',
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <BarChart3 size={48} style={{ opacity: 0.3 }} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No appointment data to analyze yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pattern analytics will populate as appointments are created and completed
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== KEY METRICS ===== */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={CalendarIcon} title="Avg Per Day" value={patterns.avgPerDay} color="#3b82f6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Timer} title="Avg Duration" value={`${patterns.avgDuration}m`} color="#10b981" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Clock} title="Busiest Hour"
            value={patterns.busiestHour !== null ? (hourLabels[patterns.busiestHour] || `${patterns.busiestHour}:00`) : 'N/A'}
            color="#8b5cf6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Activity} title="Meeting Load" value={`${patterns.meetingLoad}%`} color="#f59e0b"
            subtitle="Of work hours" />
        </Grid>
      </Grid>

      {/* ===== HOUR DISTRIBUTION ===== */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Appointment Distribution by Hour
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(patterns.hourDistribution)
              .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
              .map(([hour, count]) => {
                const maxCount = Math.max(...Object.values(patterns.hourDistribution));
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const energy = calculateEnergyLevel(parseInt(hour));

                return (
                  <Box key={hour} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 55, fontWeight: 'bold' }}>
                      {hourLabels[parseInt(hour)] || `${hour}:00`}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{
                          height: 20, borderRadius: 2,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: energy >= 85 ? '#10b981' : energy >= 70 ? '#3b82f6' : '#f59e0b',
                            borderRadius: 2,
                          },
                        }} />
                    </Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 30, textAlign: 'right' }}>
                      {count}
                    </Typography>
                    <Chip label={energy >= 85 ? 'Peak' : energy >= 70 ? 'Good' : 'Low'} size="small"
                      sx={{ fontSize: '0.6rem', height: 20, minWidth: 45 }}
                      color={energy >= 85 ? 'success' : energy >= 70 ? 'primary' : 'warning'} variant="outlined" />
                  </Box>
                );
              })}
          </Box>
        </CardContent>
      </Card>

      {/* ===== DAY OF WEEK DISTRIBUTION ===== */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Appointments by Day of Week
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(patterns.dayOfWeekDistribution).map(([day, count]) => {
              const maxDow = Math.max(...Object.values(patterns.dayOfWeekDistribution), 1);
              const pct = (count / maxDow) * 100;
              const isBusiest = count === maxDow && count > 0;

              return (
                <Grid item xs key={day}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight="bold">{day}</Typography>
                    <Box sx={{
                      height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      mt: 1, mb: 1,
                    }}>
                      <Box sx={{
                        width: '60%', height: `${Math.max(pct, 5)}%`,
                        bgcolor: isBusiest ? '#3b82f6' : 'action.selected',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s',
                      }} />
                    </Box>
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                    {isBusiest && count > 0 && (
                      <Chip label="Busiest" size="small" color="primary" sx={{ fontSize: '0.55rem', height: 16, mt: 0.5 }} />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* ===== TYPE DISTRIBUTION ===== */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Appointment Type Breakdown
          </Typography>
          {Object.entries(patterns.typeDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
              const typeConfig = APPOINTMENT_TYPES[type];
              const pct = appointments.length > 0 ? ((count / appointments.length) * 100).toFixed(0) : 0;

              return (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: typeConfig?.color || '#999', width: 36, height: 36 }}>
                    {typeConfig?.icon ? React.createElement(typeConfig.icon, { size: 18, color: 'white' }) : type[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {typeConfig?.label || type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} ({pct}%)
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={parseFloat(pct)}
                      sx={{
                        height: 8, borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': { bgcolor: typeConfig?.color || '#999', borderRadius: 4 },
                      }} />
                  </Box>
                </Box>
              );
            })}
        </CardContent>
      </Card>

      {/* ===== AI INSIGHTS ===== */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            AI Scheduling Insights
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {patterns.busiestDay && (
              <Alert severity="info" icon={<CalendarIcon size={18} />}>
                Busiest day was <strong>{patterns.busiestDay}</strong>
              </Alert>
            )}
            {patterns.busiestHour !== null && (
              <Alert severity="info" icon={<Clock size={18} />}>
                Peak scheduling hour: <strong>{hourLabels[patterns.busiestHour] || `${patterns.busiestHour}:00`}</strong>
                {' '}(Energy level: {calculateEnergyLevel(patterns.busiestHour)}%)
              </Alert>
            )}
            {patterns.mostCommonType && (
              <Alert severity="info" icon={<Target size={18} />}>
                Most common type: <strong>{APPOINTMENT_TYPES[patterns.mostCommonType]?.label || patterns.mostCommonType}</strong>
              </Alert>
            )}
            {patterns.meetingLoad > 50 && (
              <Alert severity="warning" icon={<AlertTriangle size={18} />}>
                Meeting load is <strong>{patterns.meetingLoad}%</strong> of work hours — consider blocking focus time
              </Alert>
            )}
            {patterns.avgPerDay > 6 && (
              <Alert severity="warning" icon={<AlertCircle size={18} />}>
                Averaging <strong>{patterns.avgPerDay}</strong> appointments per day — risk of burnout
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================================
// TAB 8: SCHEDULE SETTINGS - Preferences with Firebase persistence
// ============================================================================

function ScheduleSettingsTab({ showNotification }) {
  const [settings, setSettings] = useState({
    defaultDuration: 30,
    bufferBetweenAppts: 15,
    workdayStart: '09:00',
    workdayEnd: '17:00',
    workDays: [1, 2, 3, 4, 5],
    autoConflictDetection: true,
    autoNoShowAlerts: true,
    smartScheduling: true,
    reminderBefore: 60,
    defaultPlatform: 'phone',
    allowWeekendBooking: false,
    maxDailyAppointments: 8,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ===== LOAD SETTINGS FROM FIREBASE =====
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'schedulingConfig'));
        if (settingsDoc.exists()) {
          setSettings(prev => ({ ...prev, ...settingsDoc.data() }));
        }
        setLoaded(true);
      } catch (error) {
        console.error('❌ Error loading scheduling settings:', error);
        setLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // ===== SAVE SETTINGS TO FIREBASE =====
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'schedulingConfig'), {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ===== HEADER ===== */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Settings size={24} className="text-gray-500" />
              <Typography variant="h6" fontWeight="bold">Scheduling Settings</Typography>
            </Box>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <Save size={16} />}
              onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ===== DEFAULT APPOINTMENT SETTINGS ===== */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
            Default Appointment Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Duration</InputLabel>
                <Select value={settings.defaultDuration} label="Default Duration"
                  onChange={(e) => setSettings(p => ({ ...p, defaultDuration: e.target.value }))}>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                  <MenuItem value={90}>90 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Platform</InputLabel>
                <Select value={settings.defaultPlatform} label="Default Platform"
                  onChange={(e) => setSettings(p => ({ ...p, defaultPlatform: e.target.value }))}>
                  {Object.entries(MEETING_PLATFORMS).map(([key, val]) => (
                    <MenuItem key={key} value={key}>{val.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Buffer Between Appointments: {settings.bufferBetweenAppts} min
                </Typography>
                <Slider value={settings.bufferBetweenAppts} min={0} max={60} step={5}
                  onChange={(e, v) => setSettings(p => ({ ...p, bufferBetweenAppts: v }))}
                  marks valueLabelDisplay="auto" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Reminder Before: {settings.reminderBefore} min
                </Typography>
                <Slider value={settings.reminderBefore} min={15} max={120} step={15}
                  onChange={(e, v) => setSettings(p => ({ ...p, reminderBefore: v }))}
                  marks valueLabelDisplay="auto" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===== WORK HOURS ===== */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
            Work Hours & Days
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Workday Start" type="time" value={settings.workdayStart}
                onChange={(e) => setSettings(p => ({ ...p, workdayStart: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Workday End" type="time" value={settings.workdayEnd}
                onChange={(e) => setSettings(p => ({ ...p, workdayEnd: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Max Daily Appointments: {settings.maxDailyAppointments}
                </Typography>
                <Slider value={settings.maxDailyAppointments} min={1} max={15} step={1}
                  onChange={(e, v) => setSettings(p => ({ ...p, maxDailyAppointments: v }))}
                  marks valueLabelDisplay="auto" />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={settings.allowWeekendBooking}
                  onChange={(e) => setSettings(p => ({ ...p, allowWeekendBooking: e.target.checked }))} />}
                label="Allow weekend booking"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===== AI FEATURES TOGGLES ===== */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
            AI Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={settings.autoConflictDetection}
                  onChange={(e) => setSettings(p => ({ ...p, autoConflictDetection: e.target.checked }))} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Auto Conflict Detection</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically scan for conflicts when creating appointments
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={settings.autoNoShowAlerts}
                  onChange={(e) => setSettings(p => ({ ...p, autoNoShowAlerts: e.target.checked }))} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">No-Show Risk Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Highlight high-risk appointments in calendar view
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={settings.smartScheduling}
                  onChange={(e) => setSettings(p => ({ ...p, smartScheduling: e.target.checked }))} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Smart Scheduling</Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI suggests optimal time slots based on energy levels and load
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

// MAIN COMPONENT
// ============================================================================

const CalendarSchedulingHub = () => {
  const { currentUser, userProfile } = useAuth();
  const { showNotification, NotificationBar } = useNotification();
  const [activeTab, setActiveTab] = useState(() => {
    return parseInt(localStorage.getItem('calendarHubActiveTab') || '0');
  });
  const [loading, setLoading] = useState(true);

  // ===== SHARED STATE (used across tabs) =====
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterTeamMember, setFilterTeamMember] = useState('all');

  // ===== DIALOG STATE =====
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [newApptData, setNewApptData] = useState({
    clientName: '', type: 'consultation', duration: 30,
    platform: 'phone', location: '', notes: '', assignedTo: '',
    scheduledFor: null, status: 'scheduled',
  });

  // ===== TAB CHANGE HANDLER =====
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    localStorage.setItem('calendarHubActiveTab', newValue.toString());
  };

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadAllData();
  }, [currentDate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAppointments(),
        loadTeamMembers(),
        loadAvailability(),
      ]);
      console.log('✅ Calendar data loaded');
    } catch (error) {
      console.error('❌ Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const apptRef = collection(db, 'appointments');
      const q = query(
        apptRef,
        where('scheduledFor', '>=', Timestamp.fromDate(startOfMonth)),
        where('scheduledFor', '<=', Timestamp.fromDate(endOfMonth)),
        orderBy('scheduledFor', 'asc')
      );

      const snapshot = await getDocs(q);
      const apptData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(apptData);
      console.log('✅ Loaded appointments:', apptData.length);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const teamRef = collection(db, 'contacts');
      const q = query(teamRef, where('roles', 'array-contains-any', ['user', 'manager', 'admin']));
      const snapshot = await getDocs(q);
      const teamData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeamMembers(teamData);
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      setTeamMembers([]);
    }
  };

  const loadAvailability = async () => {
    try {
      const availRef = collection(db, 'availability');
      const snapshot = await getDocs(availRef);
      const availData = {};
      snapshot.docs.forEach(d => { availData[d.id] = d.data(); });
      setAvailability(availData);
    } catch (error) {
      console.error('❌ Error loading availability:', error);
      setAvailability({});
    }
  };

  // ============================================
  // APPOINTMENT CRUD
  // ============================================

  const handleCreateAppointment = async () => {
    if (!newApptData.clientName || !newApptData.scheduledFor) {
      showNotification('Please fill in client name and date/time', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'appointments'), {
        ...newApptData,
        scheduledFor: Timestamp.fromDate(new Date(newApptData.scheduledFor)),
        createdAt: serverTimestamp(),
        createdBy: currentUser?.uid || 'system',
      });

      showNotification('Appointment created successfully', 'success');
      setAppointmentDialogOpen(false);
      setNewApptData({
        clientName: '', type: 'consultation', duration: 30,
        platform: 'phone', location: '', notes: '', assignedTo: '',
        scheduledFor: null, status: 'scheduled',
      });
      await loadAppointments();
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      showNotification('Error creating appointment', 'error');
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      showNotification(`Status updated to ${newStatus}`, 'success');
      await loadAppointments();
    } catch (error) {
      console.error('❌ Error updating status:', error);
      showNotification('Error updating status', 'error');
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteDoc(doc(db, 'appointments', apptId));
      showNotification('Appointment deleted', 'success');
      await loadAppointments();
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      showNotification('Error deleting appointment', 'error');
    }
  };

  // ===== FILTERED APPOINTMENTS =====
  const filteredAppointments = useMemo(() => {
    if (filterTeamMember === 'all') return appointments;
    return appointments.filter(a => a.assignedTo === filterTeamMember);
  }, [appointments, filterTeamMember]);

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">Loading calendar data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <NotificationBar />

      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <CalendarIcon size={32} className="text-blue-500" />
          <Typography variant="h4" component="h1" fontWeight="bold">Calendar & Scheduling Hub</Typography>
          <Chip label="60+ AI Features" color="primary" size="small" icon={<Brain size={16} />} />
          <Chip label={`${filteredAppointments.length} appointments`} variant="outlined" size="small" />
        </Box>
        <Typography variant="body1" color="text.secondary">
          AI-powered scheduling with conflict detection, optimization, and pattern analysis
        </Typography>
      </Box>

      {/* ===== TAB NAVIGATION ===== */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1, borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 64, textTransform: 'none', fontSize: '0.9rem' },
          }}
        >
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                icon={<Icon size={18} />}
                iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    {tab.badge && (
                      <Chip label={tab.badge} size="small"
                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'secondary.main', color: 'white' }} />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT ===== */}
      <Box>
        {activeTab === 0 && <CalendarViewTab
          appointments={filteredAppointments} currentDate={currentDate} setCurrentDate={setCurrentDate}
          filterTeamMember={filterTeamMember} setFilterTeamMember={setFilterTeamMember}
          teamMembers={teamMembers} setAppointmentDialogOpen={setAppointmentDialogOpen}
          setSelectedAppointment={setSelectedAppointment}
        />}
        {activeTab === 1 && <AppointmentsTab
          appointments={filteredAppointments} handleUpdateStatus={handleUpdateStatus}
          handleDeleteAppointment={handleDeleteAppointment}
          setAppointmentDialogOpen={setAppointmentDialogOpen}
        />}
        {activeTab === 2 && <SmartSchedulerTab appointments={appointments} showNotification={showNotification} />}
        {activeTab === 3 && <ConflictDetectorTab appointments={appointments} />}
        {activeTab === 4 && <ScheduleOptimizerTab appointments={appointments} />}
        {activeTab === 5 && <AvailabilityTab teamMembers={teamMembers} availability={availability} />}
        {activeTab === 6 && <PatternAnalyticsTab appointments={appointments} />}
        {activeTab === 7 && <ScheduleSettingsTab showNotification={showNotification} />}
      </Box>

      {/* ===== CREATE APPOINTMENT DIALOG ===== */}
      <Dialog open={appointmentDialogOpen} onClose={() => setAppointmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Plus className="text-blue-500" />
            <Typography variant="h6" component="span">New Appointment</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField fullWidth label="Client Name" value={newApptData.clientName}
              onChange={(e) => setNewApptData(p => ({ ...p, clientName: e.target.value }))} />

            <TextField fullWidth type="datetime-local" label="Date & Time"
              value={newApptData.scheduledFor || ''} InputLabelProps={{ shrink: true }}
              onChange={(e) => setNewApptData(p => ({ ...p, scheduledFor: e.target.value }))} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={newApptData.type} label="Type"
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewApptData(p => ({ ...p, type, duration: APPOINTMENT_TYPES[type]?.duration || 30 }));
                    }}>
                    {Object.entries(APPOINTMENT_TYPES).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.label} ({val.duration} min)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select value={newApptData.platform} label="Platform"
                    onChange={(e) => setNewApptData(p => ({ ...p, platform: e.target.value }))}>
                    {Object.entries(MEETING_PLATFORMS).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select value={newApptData.assignedTo} label="Assigned To"
                onChange={(e) => setNewApptData(p => ({ ...p, assignedTo: e.target.value }))}>
                <MenuItem value="">Unassigned</MenuItem>
                {teamMembers.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth label="Location (optional)" value={newApptData.location}
              onChange={(e) => setNewApptData(p => ({ ...p, location: e.target.value }))} />

            <TextField fullWidth label="Notes" multiline rows={2} value={newApptData.notes}
              onChange={(e) => setNewApptData(p => ({ ...p, notes: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppointmentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAppointment} startIcon={<Plus size={16} />}>
            Create Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarSchedulingHub;