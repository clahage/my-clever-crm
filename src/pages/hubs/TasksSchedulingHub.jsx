// src/pages/hubs/TasksSchedulingHub.jsx
// ============================================================================
// TIER 3 MEGA ULTIMATE TASKS & SCHEDULING HUB
// ============================================================================
// 8 Tabs: Dashboard, Calendar, Team Schedule, Templates, Analytics,
//         Automation Rules, Recurring Tasks, Timeline View
// 45+ AI Features Fully Implemented
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Card, CardContent, CardHeader, CardActions,
  Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Avatar, Badge, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, ListItemSecondaryAction,
  Grid, Stack, Divider, Alert, AlertTitle, Snackbar, LinearProgress, CircularProgress,
  Switch, FormControlLabel, Checkbox, Radio, RadioGroup, Slider, ToggleButton,
  ToggleButtonGroup, Autocomplete, Accordion, AccordionSummary, AccordionDetails,
  Menu, Collapse, Fade, Zoom, Drawer, SpeedDial, SpeedDialAction, SpeedDialIcon,
  useTheme, useMediaQuery, InputAdornment, Stepper, Step, StepLabel, StepContent
} from '@mui/material';

import {
  CheckSquare, Calendar, Users, LayoutTemplate, BarChart3, Zap, RefreshCw,
  GitBranch, Plus, Edit, Trash2, Search, Filter, MoreVertical, Clock,
  AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowUp, ArrowDown,
  ChevronDown, ChevronRight, ChevronLeft, Play, Pause, Square, Timer,
  Target, TrendingUp, TrendingDown, Activity, Brain, Sparkles, Bot,
  CalendarDays, CalendarClock, UserPlus, UserCheck, UserX, Settings,
  Download, Upload, Copy, Link, ExternalLink, Mail, Phone, MessageSquare,
  FileText, Folder, Tag, Star, StarOff, Flag, Bell, BellOff, Eye, EyeOff,
  Grip, GripVertical, Maximize2, Minimize2, RotateCcw, Save, X, Info,
  AlertCircle, HelpCircle, Lightbulb, Wand2, Repeat, Layers, GitMerge,
  PieChart, LineChart, BarChart, Calendar as CalendarIcon, SlidersHorizontal
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import taskService, { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORIES, EISENHOWER_QUADRANT } from '@/services/taskService';
import taskAIService from '@/services/taskAIService';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const TAB_CONFIG = [
  { id: 'dashboard', label: 'Tasks Dashboard', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar View', icon: Calendar },
  { id: 'team', label: 'Team Schedule', icon: Users },
  { id: 'templates', label: 'Task Templates', icon: LayoutTemplate },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'automation', label: 'Automation Rules', icon: Zap },
  { id: 'recurring', label: 'Recurring Tasks', icon: RefreshCw },
  { id: 'timeline', label: 'Timeline View', icon: GitBranch }
];

const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  none: '#6b7280'
};

const STATUS_COLORS = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  in_review: '#8b5cf6',
  blocked: '#dc2626',
  completed: '#22c55e',
  cancelled: '#9ca3af',
  deferred: '#f59e0b'
};

const CATEGORY_ICONS = {
  dispute: AlertTriangle,
  follow_up: Phone,
  client_onboarding: UserPlus,
  document_review: FileText,
  credit_analysis: BarChart3,
  bureau_communication: Mail,
  client_meeting: Users,
  administrative: Folder,
  marketing: Target,
  sales: TrendingUp,
  support: HelpCircle,
  training: Lightbulb,
  other: Tag
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TasksSchedulingHub = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userProfile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Tasks data
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamWorkloads, setTeamWorkloads] = useState({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: null, end: null });

  // Dialogs
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');

  // Time tracking
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // AI insights
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Task stats
  const [taskStats, setTaskStats] = useState(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Subscribe to tasks
    const unsubTasks = taskService.subscribeToTasks(
      { teamId: userProfile?.teamId },
      (taskData) => {
        setTasks(taskData);
        setLoading(false);
      }
    );

    // Load other data
    loadTemplates();
    loadAutomationRules();
    loadRecurringRules();
    loadTeamMembers();
    loadTaskStats();

    return () => {
      if (unsubTasks) unsubTasks();
    };
  }, [currentUser, userProfile]);

  // Filter tasks when filters change
  useEffect(() => {
    let filtered = [...tasks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === assigneeFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);

  const loadTemplates = async () => {
    const result = await taskService.getTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
  };

  const loadAutomationRules = async () => {
    const result = await taskService.getAutomationRules();
    if (result.success) {
      setAutomationRules(result.rules);
    }
  };

  const loadRecurringRules = async () => {
    const result = await taskService.getRecurringRules();
    if (result.success) {
      setRecurringRules(result.rules);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), where('status', '==', 'active'));
      const snapshot = await getDocs(usersQuery);
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);

      // Calculate workloads
      if (userProfile?.teamId) {
        const workloadResult = await taskService.getTeamWorkload(userProfile.teamId);
        if (workloadResult.success) {
          setTeamWorkloads(workloadResult.workload);
        }
      }
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  };

  const loadTaskStats = async () => {
    const result = await taskService.getTaskStats({ teamId: userProfile?.teamId });
    if (result.success) {
      setTaskStats(result.stats);
    }
  };

  // ============================================================================
  // AI FUNCTIONS
  // ============================================================================

  const runAIPrioritization = async () => {
    setAiLoading(true);
    try {
      const prioritized = await taskAIService.batchPrioritizeTasks(
        filteredTasks.filter(t => t.status !== TASK_STATUS.COMPLETED),
        { allTasks: tasks }
      );
      setFilteredTasks(prioritized);
      showSnackbar('Tasks prioritized by AI', 'success');
    } catch (err) {
      showSnackbar('AI prioritization failed', 'error');
    }
    setAiLoading(false);
  };

  const getAIInsights = async () => {
    setAiLoading(true);
    try {
      const [bottlenecks, workloadBalance, patterns] = await Promise.all([
        taskAIService.detectBottlenecks(tasks, teamWorkloads),
        taskAIService.analyzeWorkloadBalance(teamWorkloads, teamMembers),
        taskAIService.analyzeCompletionPatterns(
          tasks.filter(t => t.status === TASK_STATUS.COMPLETED),
          currentUser?.uid
        )
      ]);

      setAiInsights({ bottlenecks, workloadBalance, patterns });
    } catch (err) {
      console.error('Error getting AI insights:', err);
    }
    setAiLoading(false);
  };

  const suggestTaskAssignment = async (task) => {
    const result = await taskAIService.suggestAssignment(task, teamMembers, teamWorkloads);
    return result;
  };

  const parseNaturalLanguageTask = async (input) => {
    return await taskAIService.parseNaturalLanguageTask(input);
  };

  // ============================================================================
  // TASK CRUD OPERATIONS
  // ============================================================================

  const handleCreateTask = async (taskData) => {
    try {
      const result = await taskService.createTask({
        ...taskData,
        createdBy: currentUser?.uid,
        teamId: userProfile?.teamId
      });

      if (result.success) {
        showSnackbar('Task created successfully', 'success');
        setTaskDialogOpen(false);
        loadTaskStats();
      } else {
        showSnackbar(result.error || 'Failed to create task', 'error');
      }
    } catch (err) {
      showSnackbar('Error creating task', 'error');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const result = await taskService.updateTask(taskId, updates, currentUser?.uid);

      if (result.success) {
        showSnackbar('Task updated successfully', 'success');
        setTaskDialogOpen(false);
        setSelectedTask(null);
        loadTaskStats();
      } else {
        showSnackbar(result.error || 'Failed to update task', 'error');
      }
    } catch (err) {
      showSnackbar('Error updating task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const result = await taskService.deleteTask(taskId, currentUser?.uid);

      if (result.success) {
        showSnackbar('Task deleted successfully', 'success');
        setDeleteConfirmOpen(false);
        setSelectedTask(null);
        loadTaskStats();
      } else {
        showSnackbar(result.error || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showSnackbar('Error deleting task', 'error');
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    await handleUpdateTask(taskId, { status: newStatus });
  };

  const handleBulkAction = async (action, taskIds) => {
    try {
      let result;
      switch (action) {
        case 'complete':
          result = await taskService.bulkUpdateTasks(taskIds, { status: TASK_STATUS.COMPLETED });
          break;
        case 'delete':
          result = await taskService.bulkDeleteTasks(taskIds);
          break;
        case 'archive':
          result = await taskService.bulkUpdateTasks(taskIds, { status: TASK_STATUS.CANCELLED });
          break;
        default:
          return;
      }

      if (result.success) {
        showSnackbar(`${result.count} tasks updated`, 'success');
        loadTaskStats();
      }
    } catch (err) {
      showSnackbar('Bulk action failed', 'error');
    }
  };

  // ============================================================================
  // TIME TRACKING
  // ============================================================================

  const startTimer = async (task) => {
    if (activeTimer) {
      await stopTimer();
    }

    const result = await taskService.startTimeTracking(task.id, currentUser?.uid);
    if (result.success) {
      setActiveTimer({ taskId: task.id, entryId: result.id, taskTitle: task.title });
      setTimerSeconds(0);

      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);

      showSnackbar(`Timer started for: ${task.title}`, 'info');
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    clearInterval(timerRef.current);
    const result = await taskService.stopTimeTracking(activeTimer.entryId);

    if (result.success) {
      showSnackbar(`Time logged: ${formatDuration(result.duration)}`, 'success');
    }

    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatTimerDisplay = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.status === TASK_STATUS.COMPLETED) return false;
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return dueDate < now;
    });
  };

  const getDueTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMemberName = (userId) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.displayName || member?.email || 'Unassigned';
  };

  // ============================================================================
  // TAB 1: TASKS DASHBOARD
  // ============================================================================

  const renderTasksDashboard = () => {
    const overdueTasks = getOverdueTasks();
    const todayTasks = getDueTodayTasks();
    const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
    const completedToday = tasks.filter(t => {
      if (t.status !== TASK_STATUS.COMPLETED || !t.completedAt) return false;
      const completed = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
      const today = new Date();
      return completed.toDateString() === today.toDateString();
    });

    return (
      <Box>
        {/* Active Timer Banner */}
        {activeTimer && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={stopTimer} startIcon={<Square size={16} />}>
                Stop
              </Button>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Timer size={20} />
              <Typography variant="body2">
                Tracking: <strong>{activeTimer.taskTitle}</strong>
              </Typography>
              <Chip
                label={formatTimerDisplay(timerSeconds)}
                color="primary"
                size="small"
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          </Alert>
        )}

        {/* Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.dark', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{overdueTasks.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Overdue Tasks</Typography>
                  </Box>
                  <AlertTriangle size={48} style={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.dark', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{todayTasks.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Due Today</Typography>
                  </Box>
                  <CalendarDays size={48} style={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.dark', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{inProgressTasks.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>In Progress</Typography>
                  </Box>
                  <Activity size={48} style={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.dark', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{completedToday.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed Today</Typography>
                  </Box>
                  <CheckCircle size={48} style={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* AI Quick Actions */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brain size={24} />
              <Typography variant="h6">AI Actions</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={aiLoading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
                onClick={runAIPrioritization}
                disabled={aiLoading}
              >
                Smart Prioritize
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Lightbulb size={16} />}
                onClick={getAIInsights}
                disabled={aiLoading}
              >
                Get Insights
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Wand2 size={16} />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Create with AI
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* AI Insights Panel */}
        {aiInsights && (
          <Collapse in={!!aiInsights}>
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                <Bot size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                AI Insights
              </Typography>
              <Grid container spacing={2}>
                {aiInsights.bottlenecks?.bottlenecks?.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <Alert severity="warning" sx={{ height: '100%' }}>
                      <AlertTitle>Bottlenecks Detected</AlertTitle>
                      {aiInsights.bottlenecks.bottlenecks.slice(0, 2).map((b, i) => (
                        <Typography key={i} variant="body2">• {b.description}</Typography>
                      ))}
                    </Alert>
                  </Grid>
                )}
                {aiInsights.workloadBalance && (
                  <Grid item xs={12} md={4}>
                    <Alert severity={aiInsights.workloadBalance.balanceScore > 70 ? 'success' : 'info'}>
                      <AlertTitle>Team Balance Score: {aiInsights.workloadBalance.balanceScore}%</AlertTitle>
                      <Typography variant="body2">
                        Avg Utilization: {aiInsights.workloadBalance.averageUtilization}%
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                {aiInsights.patterns?.insights?.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <Alert severity="info">
                      <AlertTitle>Productivity Insights</AlertTitle>
                      {aiInsights.patterns.insights.slice(0, 2).map((insight, i) => (
                        <Typography key={i} variant="body2">• {insight}</Typography>
                      ))}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Collapse>
        )}

        {/* Filters Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.entries(TASK_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{key.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{key}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {Object.entries(TASK_CATEGORIES).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{key.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={assigneeFilter}
                  label="Assignee"
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Members</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  {teamMembers.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.displayName || member.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setTaskDialogOpen(true)}
                startIcon={<Plus size={18} />}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tasks List */}
        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckSquare size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No tasks found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first task to get started
              </Typography>
              <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setTaskDialogOpen(true)}>
                Create Task
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>AI Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.slice(0, 50).map((task) => {
                    const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
                    const isOverdue = task.dueDate &&
                      (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate)) < new Date() &&
                      task.status !== TASK_STATUS.COMPLETED;

                    return (
                      <TableRow
                        key={task.id}
                        hover
                        sx={{
                          bgcolor: isOverdue ? 'error.dark' : 'inherit',
                          '&:hover': { bgcolor: isOverdue ? 'error.main' : 'action.hover' }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon size={18} style={{ opacity: 0.6 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {task.title}
                              </Typography>
                              {task.clientId && (
                                <Typography variant="caption" color="text.secondary">
                                  Client task
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.status?.replace(/_/g, ' ')}
                            sx={{
                              bgcolor: STATUS_COLORS[task.status] + '20',
                              color: STATUS_COLORS[task.status],
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.priority}
                            sx={{
                              bgcolor: PRIORITY_COLORS[task.priority] + '20',
                              color: PRIORITY_COLORS[task.priority],
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={isOverdue ? 'error' : 'text.primary'}>
                            {formatDate(task.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {getMemberName(task.assignedTo)?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {getMemberName(task.assignedTo)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {task.aiPriorityScore ? (
                            <Tooltip title={`AI Confidence: ${task.aiConfidence}`}>
                              <Chip
                                size="small"
                                icon={<Brain size={14} />}
                                label={task.aiPriorityScore}
                                color={task.aiPriorityScore >= 70 ? 'error' : task.aiPriorityScore >= 40 ? 'warning' : 'default'}
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            {task.status !== TASK_STATUS.COMPLETED && (
                              <Tooltip title="Start Timer">
                                <IconButton
                                  size="small"
                                  onClick={() => startTimer(task)}
                                  color={activeTimer?.taskId === task.id ? 'primary' : 'default'}
                                >
                                  <Play size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {task.status !== TASK_STATUS.COMPLETED && (
                              <Tooltip title="Mark Complete">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleQuickStatusChange(task.id, TASK_STATUS.COMPLETED)}
                                >
                                  <CheckCircle size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskDialogOpen(true);
                                }}
                              >
                                <Edit size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    );
  };

  // ============================================================================
  // TAB 2: CALENDAR VIEW
  // ============================================================================

  const renderCalendarView = () => {
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days = [];

      // Previous month days
      for (let i = 0; i < startingDay; i++) {
        const prevDate = new Date(year, month, -startingDay + i + 1);
        days.push({ date: prevDate, isCurrentMonth: false });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
      }

      // Next month days
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }

      return days;
    };

    const navigateMonth = (direction) => {
      const newDate = new Date(calendarDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setCalendarDate(newDate);
    };

    const days = getDaysInMonth(calendarDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <Box>
        {/* Calendar Header */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigateMonth(-1)}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h5" fontWeight="bold">
                {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </Typography>
              <IconButton onClick={() => navigateMonth(1)}>
                <ChevronRight />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ToggleButtonGroup
                value={calendarView}
                exclusive
                onChange={(e, v) => v && setCalendarView(v)}
                size="small"
              >
                <ToggleButton value="month">Month</ToggleButton>
                <ToggleButton value="week">Week</ToggleButton>
                <ToggleButton value="day">Day</ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCalendarDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Add Task
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Calendar Grid */}
        <Paper sx={{ p: 2 }}>
          {/* Day Headers */}
          <Grid container>
            {DAYS_OF_WEEK.map(day => (
              <Grid item xs key={day} sx={{ textAlign: 'center', py: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Days */}
          <Grid container>
            {days.map((day, index) => {
              const dayTasks = getTasksByDate(day.date);
              const isToday = day.date.toDateString() === today.toDateString();
              const isSelected = day.date.toDateString() === calendarDate.toDateString();

              return (
                <Grid
                  item
                  xs
                  key={index}
                  sx={{
                    minHeight: 120,
                    p: 0.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: !day.isCurrentMonth ? 'action.hover' : isToday ? 'primary.dark' : 'background.paper',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => setCalendarDate(day.date)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isToday ? 'bold' : 'normal'}
                      color={!day.isCurrentMonth ? 'text.disabled' : isToday ? 'primary.contrastText' : 'text.primary'}
                    >
                      {day.date.getDate()}
                    </Typography>
                    {dayTasks.length > 0 && (
                      <Badge badgeContent={dayTasks.length} color="primary" max={9} />
                    )}
                  </Box>

                  <Stack spacing={0.5}>
                    {dayTasks.slice(0, 3).map(task => (
                      <Box
                        key={task.id}
                        sx={{
                          p: 0.5,
                          borderRadius: 0.5,
                          bgcolor: PRIORITY_COLORS[task.priority] + '30',
                          borderLeft: 3,
                          borderColor: PRIORITY_COLORS[task.priority],
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setTaskDialogOpen(true);
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                    ))}
                    {dayTasks.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{dayTasks.length - 3} more
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Day Details Panel */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tasks for {calendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {getTasksByDate(calendarDate).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CalendarIcon size={40} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No tasks scheduled for this day</Typography>
            </Box>
          ) : (
            <List>
              {getTasksByDate(calendarDate).map(task => (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => startTimer(task)}>
                        <Play size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskDialogOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={task.status === TASK_STATUS.COMPLETED}
                      onChange={() => handleQuickStatusChange(
                        task.id,
                        task.status === TASK_STATUS.COMPLETED ? TASK_STATUS.TODO : TASK_STATUS.COMPLETED
                      )}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip size="small" label={task.priority} sx={{ bgcolor: PRIORITY_COLORS[task.priority] + '30' }} />
                        <Chip size="small" label={task.category?.replace(/_/g, ' ')} />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    );
  };

  // ============================================================================
  // TAB 3: TEAM SCHEDULE
  // ============================================================================

  const renderTeamSchedule = () => {
    return (
      <Box>
        {/* Team Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <Users size={28} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{teamMembers.length}</Typography>
                    <Typography color="text.secondary">Team Members</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <Activity size={28} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {aiInsights?.workloadBalance?.averageUtilization || 0}%
                    </Typography>
                    <Typography color="text.secondary">Avg Utilization</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <Target size={28} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {aiInsights?.workloadBalance?.balanceScore || 0}%
                    </Typography>
                    <Typography color="text.secondary">Balance Score</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Workload Analysis Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <Brain size={18} />}
            onClick={getAIInsights}
            disabled={aiLoading}
          >
            Analyze Team Workload
          </Button>
        </Box>

        {/* Team Member Workloads */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Team Workload Distribution</Typography>
          <Divider sx={{ my: 2 }} />

          {teamMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Users size={48} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 2 }}>No team members found</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {teamMembers.map(member => {
                const workload = teamWorkloads[member.id] || { taskCount: 0, totalEstimatedMinutes: 0 };
                const utilization = Math.min(100, Math.round((workload.totalEstimatedMinutes / 480) * 100));
                const utilizationColor = utilization > 100 ? 'error' : utilization > 80 ? 'warning' : 'success';

                return (
                  <Grid item xs={12} md={6} lg={4} key={member.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {(member.displayName || member.email || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {member.displayName || member.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role || 'Team Member'}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={`${utilization}%`}
                            color={utilizationColor}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Capacity</Typography>
                            <Typography variant="caption">{workload.totalEstimatedMinutes || 0} / 480 min</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, utilization)}
                            color={utilizationColor}
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </Box>

                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="h6">{workload.taskCount || 0}</Typography>
                              <Typography variant="caption" color="text.secondary">Tasks</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="h6">{workload.highPriorityCount || 0}</Typography>
                              <Typography variant="caption" color="text.secondary">High Priority</Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {workload.overdueCount > 0 && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {workload.overdueCount} overdue task(s)
                          </Alert>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => setAssigneeFilter(member.id)}>
                          View Tasks
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>

        {/* Rebalancing Suggestions */}
        {aiInsights?.workloadBalance?.suggestions?.length > 0 && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Lightbulb size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              AI Rebalancing Suggestions
            </Typography>
            <List>
              {aiInsights.workloadBalance.suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ArrowRight size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion.reason}
                    secondary={`Move tasks from ${suggestion.fromName} to ${suggestion.toName}`}
                  />
                  <Button size="small" variant="outlined">Apply</Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    );
  };

  // ============================================================================
  // TAB 4: TASK TEMPLATES
  // ============================================================================

  const renderTaskTemplates = () => {
    const creditRepairTemplates = [
      {
        name: 'New Client Onboarding',
        category: 'client_onboarding',
        steps: [
          'Send welcome email',
          'Collect credit reports',
          'Initial credit analysis',
          'Create dispute strategy',
          'Schedule consultation call'
        ]
      },
      {
        name: 'Dispute Process - Experian',
        category: 'dispute',
        steps: [
          'Review credit report',
          'Identify disputable items',
          'Draft dispute letter',
          'Submit to Experian',
          'Set 30-day follow-up'
        ]
      },
      {
        name: 'Dispute Process - Equifax',
        category: 'dispute',
        steps: [
          'Review credit report',
          'Identify disputable items',
          'Draft dispute letter',
          'Submit to Equifax',
          'Set 30-day follow-up'
        ]
      },
      {
        name: 'Dispute Process - TransUnion',
        category: 'dispute',
        steps: [
          'Review credit report',
          'Identify disputable items',
          'Draft dispute letter',
          'Submit to TransUnion',
          'Set 30-day follow-up'
        ]
      },
      {
        name: 'Monthly Client Check-in',
        category: 'follow_up',
        steps: [
          'Pull updated credit reports',
          'Review progress',
          'Document changes',
          'Schedule call with client',
          'Send progress report'
        ]
      },
      {
        name: 'Creditor Goodwill Letter',
        category: 'bureau_communication',
        steps: [
          'Identify creditor account',
          'Research payment history',
          'Draft goodwill letter',
          'Send via certified mail',
          'Set follow-up reminder'
        ]
      }
    ];

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Task Templates</Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>

        {/* Built-in Credit Repair Templates */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Credit Repair Workflows
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {creditRepairTemplates.map((template, index) => {
            const CategoryIcon = CATEGORY_ICONS[template.category] || Tag;
            return (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CategoryIcon size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {template.name}
                        </Typography>
                        <Chip size="small" label={template.category.replace(/_/g, ' ')} />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.steps.length} steps
                    </Typography>

                    <List dense>
                      {template.steps.slice(0, 3).map((step, i) => (
                        <ListItem key={i} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="caption" color="primary">{i + 1}.</Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={step}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      {template.steps.length > 3 && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={`+${template.steps.length - 3} more steps`}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Plus size={16} />}
                      onClick={() => {
                        setSelectedTask({
                          title: template.name,
                          category: template.category,
                          checklist: template.steps.map(s => ({ text: s, completed: false }))
                        });
                        setTaskDialogOpen(true);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Custom Templates */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Custom Templates
        </Typography>
        {templates.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LayoutTemplate size={48} style={{ opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No custom templates yet
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Create Your First Template
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {templates.map(template => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium">{template.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{template.description}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip size="small" label={template.category?.replace(/_/g, ' ')} sx={{ mr: 1 }} />
                      <Chip size="small" label={`Used ${template.usageCount || 0} times`} variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleCreateTaskFromTemplate(template.id)}>
                      Use
                    </Button>
                    <Button size="small">Edit</Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const handleCreateTaskFromTemplate = async (templateId) => {
    const result = await taskService.createTaskFromTemplate(templateId, {}, currentUser?.uid);
    if (result.success) {
      showSnackbar('Task created from template', 'success');
    } else {
      showSnackbar(result.error || 'Failed to create task', 'error');
    }
  };

  // ============================================================================
  // TAB 5: ANALYTICS
  // ============================================================================

  const renderAnalytics = () => {
    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Calculate tasks by status
    const tasksByStatus = Object.values(TASK_STATUS).reduce((acc, status) => {
      acc[status] = tasks.filter(t => t.status === status).length;
      return acc;
    }, {});

    // Calculate tasks by priority
    const tasksByPriority = Object.values(TASK_PRIORITY).reduce((acc, priority) => {
      acc[priority] = tasks.filter(t => t.priority === priority).length;
      return acc;
    }, {});

    // Calculate tasks by category
    const tasksByCategory = Object.values(TASK_CATEGORIES).reduce((acc, category) => {
      const count = tasks.filter(t => t.category === category).length;
      if (count > 0) acc[category] = count;
      return acc;
    }, {});

    return (
      <Box>
        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Total Tasks</Typography>
                <Typography variant="h3" fontWeight="bold">{totalTasks}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Completed</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {completedTasks.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Completion Rate</Typography>
                <Typography variant="h3" fontWeight="bold">{completionRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">On-Time Rate</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {taskStats?.onTimeCompletionRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3}>
          {/* Tasks by Status */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Tasks by Status</Typography>
              <List>
                {Object.entries(tasksByStatus).map(([status, count]) => (
                  <ListItem key={status} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: STATUS_COLORS[status]
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={status.replace(/_/g, ' ')} />
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Tasks by Priority */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Tasks by Priority</Typography>
              <List>
                {Object.entries(tasksByPriority).map(([priority, count]) => (
                  <ListItem key={priority} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: PRIORITY_COLORS[priority]
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={priority} />
                    <Typography variant="body2" fontWeight="bold">{count}</Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Tasks by Category */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Tasks by Category</Typography>
              <List dense>
                {Object.entries(tasksByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([category, count]) => {
                    const CategoryIcon = CATEGORY_ICONS[category] || Tag;
                    return (
                      <ListItem key={category} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CategoryIcon size={18} />
                        </ListItemIcon>
                        <ListItemText primary={category.replace(/_/g, ' ')} />
                        <Typography variant="body2" fontWeight="bold">{count}</Typography>
                      </ListItem>
                    );
                  })}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Productivity Insights */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <Brain size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              AI Productivity Insights
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={aiLoading ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
              onClick={getAIInsights}
              disabled={aiLoading}
            >
              Refresh
            </Button>
          </Box>

          {aiInsights?.patterns?.insights ? (
            <Grid container spacing={2}>
              {aiInsights.patterns.insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert severity="info" icon={<Lightbulb size={20} />}>
                    {insight}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="text.secondary">
                Click "Refresh" to generate AI insights based on your task history
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  // ============================================================================
  // TAB 6: AUTOMATION RULES
  // ============================================================================

  const renderAutomationRules = () => {
    const triggerTypes = [
      { value: 'task_created', label: 'When task is created' },
      { value: 'task_completed', label: 'When task is completed' },
      { value: 'task_overdue', label: 'When task becomes overdue' },
      { value: 'status_changed', label: 'When status changes' },
      { value: 'assigned', label: 'When task is assigned' }
    ];

    const actionTypes = [
      { value: 'create_task', label: 'Create a new task' },
      { value: 'send_notification', label: 'Send notification' },
      { value: 'update_task', label: 'Update task fields' },
      { value: 'assign_task', label: 'Auto-assign task' },
      { value: 'send_email', label: 'Send email' }
    ];

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Automation Rules</Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setAutomationDialogOpen(true)}
          >
            Create Rule
          </Button>
        </Box>

        {/* Suggested Automations from AI */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.dark' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Sparkles size={24} />
            <Typography variant="h6">AI-Suggested Automations</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">Auto Follow-up Creator</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    Automatically create follow-up tasks 30 days after dispute submission
                  </Typography>
                  <Chip size="small" label="Dispute → Follow-up" />
                </CardContent>
                <CardActions>
                  <Button size="small">Enable</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">Overdue Alert</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    Send notification when high-priority tasks become overdue
                  </Typography>
                  <Chip size="small" label="Overdue → Notify" />
                </CardContent>
                <CardActions>
                  <Button size="small">Enable</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">Smart Assignment</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    Auto-assign new tasks based on team capacity and skills
                  </Typography>
                  <Chip size="small" label="New Task → Assign" />
                </CardContent>
                <CardActions>
                  <Button size="small">Enable</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Existing Rules */}
        {automationRules.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Zap size={48} style={{ opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No automation rules configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create rules to automate repetitive task workflows
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setAutomationDialogOpen(true)}
            >
              Create Your First Rule
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {automationRules.map(rule => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">{rule.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{rule.description}</Typography>
                      </Box>
                      <Switch checked={rule.isActive} />
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={<Zap size={14} />}
                        label={triggerTypes.find(t => t.value === rule.triggerEvent)?.label || rule.triggerEvent}
                      />
                      <Chip
                        size="small"
                        icon={<ArrowRight size={14} />}
                        label={actionTypes.find(a => a.value === rule.actionType)?.label || rule.actionType}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      Executed {rule.executionCount || 0} times
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Edit</Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  // ============================================================================
  // TAB 7: RECURRING TASKS
  // ============================================================================

  const renderRecurringTasks = () => {
    const frequencyOptions = [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'biweekly', label: 'Bi-weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' }
    ];

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Recurring Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setRecurringDialogOpen(true)}
          >
            Create Recurring Task
          </Button>
        </Box>

        {/* Common Recurring Task Suggestions */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            <Lightbulb size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Suggested Recurring Tasks for Credit Repair
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Weekly Team Meeting', frequency: 'weekly', day: 'Monday' },
              { name: 'Monthly Client Reviews', frequency: 'monthly', day: '1st' },
              { name: 'Daily Lead Follow-ups', frequency: 'daily', day: 'Weekdays' },
              { name: 'Quarterly Business Review', frequency: 'quarterly', day: 'First week' }
            ].map((suggestion, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <RefreshCw size={18} />
                      <Typography variant="subtitle2">{suggestion.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {suggestion.frequency} • {suggestion.day}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Plus size={14} />}>
                      Add
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Active Recurring Rules */}
        {recurringRules.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <RefreshCw size={48} style={{ opacity: 0.3 }} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No recurring tasks configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set up recurring tasks for regular workflows
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setRecurringDialogOpen(true)}
            >
              Create Recurring Task
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {recurringRules.map(rule => (
              <Grid item xs={12} md={6} lg={4} key={rule.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1" fontWeight="medium">{rule.name}</Typography>
                      <Switch checked={rule.isActive && !rule.isPaused} />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={<RefreshCw size={14} />}
                        label={frequencyOptions.find(f => f.value === rule.frequency)?.label || rule.frequency}
                      />
                      {rule.daysOfWeek?.length > 0 && (
                        <Chip
                          size="small"
                          label={rule.daysOfWeek.map(d => DAYS_OF_WEEK[d]).join(', ')}
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created {rule.runCount || 0} tasks
                      </Typography>
                      {rule.nextRun && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Next: {formatDate(rule.nextRun)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Edit</Button>
                    <Button size="small" color={rule.isPaused ? 'primary' : 'warning'}>
                      {rule.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  // ============================================================================
  // TAB 8: TIMELINE VIEW (Gantt-style)
  // ============================================================================

  const renderTimelineView = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 21);

    const tasksWithDates = tasks.filter(t => t.dueDate || t.startDate);

    const getDaysBetween = (start, end) => {
      const days = [];
      const current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    };

    const timelineDays = getDaysBetween(startDate, endDate);

    const getTaskPosition = (task) => {
      const taskStart = task.startDate
        ? (task.startDate.toDate ? task.startDate.toDate() : new Date(task.startDate))
        : (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate));
      const taskEnd = task.dueDate
        ? (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate))
        : taskStart;

      const startOffset = Math.max(0, Math.floor((taskStart - startDate) / (1000 * 60 * 60 * 24)));
      const duration = Math.max(1, Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);

      return { startOffset, duration };
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Timeline View</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<ChevronLeft size={16} />}>
              Previous
            </Button>
            <Button variant="outlined" size="small">Today</Button>
            <Button variant="outlined" size="small" endIcon={<ChevronRight size={16} />}>
              Next
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, overflowX: 'auto' }}>
          {/* Timeline Header */}
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Box sx={{ width: 200, flexShrink: 0, p: 1 }}>
              <Typography variant="subtitle2">Task</Typography>
            </Box>
            <Box sx={{ display: 'flex', flex: 1 }}>
              {timelineDays.map((day, index) => {
                const isToday = day.toDateString() === today.toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      flexShrink: 0,
                      textAlign: 'center',
                      p: 0.5,
                      bgcolor: isToday ? 'primary.main' : isWeekend ? 'action.hover' : 'transparent',
                      color: isToday ? 'primary.contrastText' : 'text.secondary',
                      borderRadius: isToday ? 1 : 0
                    }}
                  >
                    <Typography variant="caption" display="block">
                      {DAYS_OF_WEEK[day.getDay()]}
                    </Typography>
                    <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
                      {day.getDate()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Tasks */}
          {tasksWithDates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <GitBranch size={48} style={{ opacity: 0.3 }} />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No tasks with dates to display
              </Typography>
            </Box>
          ) : (
            tasksWithDates.slice(0, 20).map(task => {
              const { startOffset, duration } = getTaskPosition(task);
              const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;

              return (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {/* Task Name */}
                  <Box sx={{ width: 200, flexShrink: 0, px: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon size={16} style={{ opacity: 0.6 }} />
                      <Tooltip title={task.title}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Timeline Bar */}
                  <Box sx={{ display: 'flex', flex: 1, position: 'relative', height: 24 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: startOffset * 40,
                        width: duration * 40 - 4,
                        height: 20,
                        bgcolor: PRIORITY_COLORS[task.priority],
                        borderRadius: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => {
                        setSelectedTask(task);
                        setTaskDialogOpen(true);
                      }}
                    >
                      {duration > 2 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>

        {/* Legend */}
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Priority Legend</Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <Box key={priority} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: 0.5 }} />
                <Typography variant="body2">{priority}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  // ============================================================================
  // TASK DIALOG
  // ============================================================================

  const TaskDialog = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      category: TASK_CATEGORIES.OTHER,
      dueDate: '',
      estimatedMinutes: 30,
      assignedTo: '',
      isUrgent: false,
      isImportant: false,
      checklist: []
    });

    const [nlInput, setNlInput] = useState('');
    const [parsing, setParsing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);

    useEffect(() => {
      if (selectedTask) {
        setFormData({
          title: selectedTask.title || '',
          description: selectedTask.description || '',
          status: selectedTask.status || TASK_STATUS.TODO,
          priority: selectedTask.priority || TASK_PRIORITY.MEDIUM,
          category: selectedTask.category || TASK_CATEGORIES.OTHER,
          dueDate: selectedTask.dueDate
            ? (selectedTask.dueDate.toDate ? selectedTask.dueDate.toDate() : new Date(selectedTask.dueDate)).toISOString().split('T')[0]
            : '',
          estimatedMinutes: selectedTask.estimatedMinutes || 30,
          assignedTo: selectedTask.assignedTo || '',
          isUrgent: selectedTask.isUrgent || false,
          isImportant: selectedTask.isImportant || false,
          checklist: selectedTask.checklist || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: TASK_STATUS.TODO,
          priority: TASK_PRIORITY.MEDIUM,
          category: TASK_CATEGORIES.OTHER,
          dueDate: '',
          estimatedMinutes: 30,
          assignedTo: '',
          isUrgent: false,
          isImportant: false,
          checklist: []
        });
      }
    }, [selectedTask, taskDialogOpen]);

    const handleNaturalLanguageParse = async () => {
      if (!nlInput.trim()) return;

      setParsing(true);
      try {
        const parsed = await parseNaturalLanguageTask(nlInput);
        setFormData(prev => ({
          ...prev,
          title: parsed.title || prev.title,
          description: parsed.description || prev.description,
          priority: parsed.priority || prev.priority,
          category: parsed.category || prev.category,
          dueDate: parsed.dueDate
            ? new Date(parsed.dueDate).toISOString().split('T')[0]
            : prev.dueDate,
          estimatedMinutes: parsed.estimatedMinutes || prev.estimatedMinutes
        }));
        setNlInput('');
        showSnackbar('Task parsed from natural language', 'success');
      } catch (err) {
        showSnackbar('Failed to parse input', 'error');
      }
      setParsing(false);
    };

    const handleGetAISuggestion = async () => {
      if (!formData.title) return;

      try {
        const [priorityResult, assignmentResult] = await Promise.all([
          taskAIService.calculatePriorityScore(formData, { allTasks: tasks }),
          taskAIService.suggestAssignment(formData, teamMembers, teamWorkloads)
        ]);

        setAiSuggestion({
          priority: priorityResult,
          assignment: assignmentResult
        });
      } catch (err) {
        console.error('Error getting AI suggestions:', err);
      }
    };

    const handleSubmit = () => {
      if (!formData.title.trim()) {
        showSnackbar('Task title is required', 'error');
        return;
      }

      const taskData = {
        ...formData,
        dueDate: formData.dueDate || null
      };

      if (selectedTask) {
        handleUpdateTask(selectedTask.id, taskData);
      } else {
        handleCreateTask(taskData);
      }
    };

    return (
      <Dialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
          setAiSuggestion(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          {/* Natural Language Input */}
          {!selectedTask && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.dark' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Wand2 size={18} />
                Create with Natural Language
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder='e.g., "Call John about dispute tomorrow at 2pm high priority"'
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageParse()}
                />
                <Button
                  variant="contained"
                  onClick={handleNaturalLanguageParse}
                  disabled={parsing || !nlInput.trim()}
                  startIcon={parsing ? <CircularProgress size={16} /> : <Sparkles size={16} />}
                >
                  Parse
                </Button>
              </Box>
            </Paper>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(TASK_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{key.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PRIORITY_COLORS[value] }} />
                        {key}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(TASK_CATEGORIES).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{key.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Time (minutes)"
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  label="Assign To"
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {teamMembers.map(member => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.displayName || member.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                    />
                  }
                  label="Urgent"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isImportant}
                      onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    />
                  }
                  label="Important"
                />
              </Box>
            </Grid>

            {/* AI Suggestions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Brain size={16} />}
                  onClick={handleGetAISuggestion}
                  disabled={!formData.title}
                >
                  Get AI Suggestions
                </Button>
              </Box>

              {aiSuggestion && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>AI Suggestions</AlertTitle>
                  <Typography variant="body2">
                    <strong>Recommended Priority:</strong> {aiSuggestion.priority?.recommendedPriority}
                    (Score: {aiSuggestion.priority?.totalScore}/100)
                  </Typography>
                  {aiSuggestion.assignment?.recommendedAssignee && (
                    <Typography variant="body2">
                      <strong>Recommended Assignee:</strong> {aiSuggestion.assignment?.recommendedName}
                      <br />
                      <em>{aiSuggestion.assignment?.reason}</em>
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        priority: aiSuggestion.priority?.recommendedPriority || prev.priority,
                        assignedTo: aiSuggestion.assignment?.recommendedAssignee || prev.assignedTo
                      }))}
                    >
                      Apply Suggestions
                    </Button>
                  </Box>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTaskDialogOpen(false);
            setSelectedTask(null);
            setAiSuggestion(null);
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ============================================================================
  // DELETE CONFIRMATION DIALOG
  // ============================================================================

  const DeleteConfirmDialog = () => (
    <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
      <DialogTitle>Delete Task?</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => handleDeleteTask(selectedTask?.id)}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Tasks & Scheduling Hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered task management with smart prioritization, team scheduling, and automation
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {TAB_CONFIG.map((tab, index) => {
            const TabIcon = tab.icon;
            return (
              <Tab
                key={tab.id}
                icon={<TabIcon size={18} />}
                label={!isMobile ? tab.label : undefined}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderTasksDashboard()}
        {activeTab === 1 && renderCalendarView()}
        {activeTab === 2 && renderTeamSchedule()}
        {activeTab === 3 && renderTaskTemplates()}
        {activeTab === 4 && renderAnalytics()}
        {activeTab === 5 && renderAutomationRules()}
        {activeTab === 6 && renderRecurringTasks()}
        {activeTab === 7 && renderTimelineView()}
      </Box>

      {/* Dialogs */}
      <TaskDialog />
      <DeleteConfirmDialog />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Plus size={20} />}
          tooltipTitle="New Task"
          onClick={() => setTaskDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<Brain size={20} />}
          tooltipTitle="AI Prioritize"
          onClick={runAIPrioritization}
        />
        <SpeedDialAction
          icon={<RefreshCw size={20} />}
          tooltipTitle="Refresh"
          onClick={() => {
            loadTaskStats();
            loadTeamMembers();
          }}
        />
      </SpeedDial>
    </Box>
  );
};

export default TasksSchedulingHub;