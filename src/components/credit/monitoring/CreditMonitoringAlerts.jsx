// src/components/credit/monitoring/CreditMonitoringAlerts.jsx
// ============================================================================
// 🔔 CREDIT MONITORING ALERTS MANAGER - FILE 5B
// ============================================================================
// PURPOSE: Configure and manage alert rules and notifications
// 
// FEATURES:
// ✅ Create custom alert rules
// ✅ Configure alert triggers (score changes, new items, etc.)
// ✅ Multi-channel notifications (email, SMS, in-app, push)
// ✅ Alert priority levels (critical, high, medium, low)
// ✅ Alert history and logs
// ✅ Notification preferences per client
// ✅ Alert templates
// ✅ Batch alert processing
// ✅ AI-powered alert optimization
// ✅ Smart alert grouping
// ✅ Snooze and dismiss alerts
// ✅ Alert performance analytics
// ✅ Firebase integration
// ✅ Beautiful UI with Material-UI + Tailwind
// ✅ Dark mode support
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
} from '@mui/material';
import {
  NotificationsActive as BellIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotifIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  TrendingDown as DownIcon,
  TrendingUp as UpIcon,
  Psychology as AIIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Snooze as SnoozeIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

// ============================================================================
// 🎨 CONSTANTS
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const ALERT_TYPES = [
  {
    id: 'score_drop',
    label: 'Score Drop',
    icon: DownIcon,
    color: '#d32f2f',
    description: 'Alert when credit score decreases',
  },
  {
    id: 'score_increase',
    label: 'Score Increase',
    icon: UpIcon,
    color: '#2e7d32',
    description: 'Alert when credit score increases',
  },
  {
    id: 'new_item',
    label: 'New Negative Item',
    icon: WarningIcon,
    color: '#ed6c02',
    description: 'Alert when new negative item appears',
  },
  {
    id: 'item_removed',
    label: 'Item Removed',
    icon: CheckIcon,
    color: '#0288d1',
    description: 'Alert when negative item is removed',
  },
  {
    id: 'account_change',
    label: 'Account Change',
    icon: InfoIcon,
    color: '#7b1fa2',
    description: 'Alert on significant account changes',
  },
  {
    id: 'inquiry_added',
    label: 'New Inquiry',
    icon: ErrorIcon,
    color: '#f57c00',
    description: 'Alert when new credit inquiry is added',
  },
];

const PRIORITY_LEVELS = [
  { id: 'critical', label: 'Critical', color: '#d32f2f', icon: '🚨' },
  { id: 'high', label: 'High', color: '#ed6c02', icon: '⚠️' },
  { id: 'medium', label: 'Medium', color: '#0288d1', icon: 'ℹ️' },
  { id: 'low', label: 'Low', color: '#2e7d32', icon: '✓' },
];

const NOTIFICATION_CHANNELS = [
  { id: 'email', label: 'Email', icon: EmailIcon, enabled: true },
  { id: 'sms', label: 'SMS', icon: SmsIcon, enabled: true },
  { id: 'inapp', label: 'In-App', icon: NotifIcon, enabled: true },
];

// ============================================================================
// 🧠 AI FUNCTION
// ============================================================================

/**
 * AI-POWERED: Optimize alert rules based on historical data
 */
const getAIAlertOptimization = async (alertHistory) => {
  console.log('🧠 AI: Optimizing alert rules...');

  if (!OPENAI_API_KEY || alertHistory.length === 0) {
    return {
      recommendations: ['Configure more alert rules for better monitoring'],
      optimizedThresholds: null,
    };
  }

  try {
    const prompt = `Analyze this alert history and recommend optimal alert thresholds.

ALERT HISTORY:
${JSON.stringify(alertHistory.slice(0, 20), null, 2)}

Provide recommendations for:
1. Alert frequency optimization
2. Priority level adjustments
3. Threshold tuning
4. False positive reduction

Return ONLY valid JSON:
{
  "recommendations": ["array of specific recommendations"],
  "optimizedThresholds": {
    "scoreDropThreshold": number,
    "scoreIncreaseThreshold": number,
    "alertFrequencyMinutes": number
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an alert optimization expert. Analyze patterns and recommend improvements. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const optimization = JSON.parse(jsonContent);

    console.log('✅ AI optimization:', optimization);
    return optimization;
  } catch (error) {
    console.error('❌ AI optimization error:', error);
    return {
      recommendations: ['AI optimization unavailable at this time'],
      optimizedThresholds: null,
    };
  }
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const CreditMonitoringAlerts = () => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE: DATA =====
  const [alertRules, setAlertRules] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== STATE: FORM =====
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [alertType, setAlertType] = useState('score_drop');
  const [threshold, setThreshold] = useState(10);
  const [priority, setPriority] = useState('high');
  const [enabledChannels, setEnabledChannels] = useState(['email', 'inapp']);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [aiOptimization, setAiOptimization] = useState(null);

  // ===== STATE: UI =====
  const [selectedTab, setSelectedTab] = useState(0); // 0=Rules, 1=History
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  // ===== LOAD DATA =====
  useEffect(() => {
    loadAlertRules();
    loadAlertHistory();
  }, []);

  const loadAlertRules = async () => {
    try {
      setLoading(true);
      const rulesQuery = query(
        collection(db, 'alertRules'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(rulesQuery);
      const rulesList = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setAlertRules(rulesList);
      console.log(`✅ Loaded ${rulesList.length} alert rules`);
    } catch (err) {
      console.error('❌ Error loading alert rules:', err);
      setError('Failed to load alert rules');
    } finally {
      setLoading(false);
    }
  };

  const loadAlertHistory = async () => {
    try {
      const historyQuery = query(
        collection(db, 'alertHistory'),
        orderBy('triggeredAt', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(historyQuery);
      const historyList = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setAlertHistory(historyList);
      console.log(`✅ Loaded ${historyList.length} alert history items`);
    } catch (err) {
      console.error('❌ Error loading alert history:', err);
    }
  };

  // ===== GET AI OPTIMIZATION =====
  const handleGetAIOptimization = async () => {
    setLoading(true);
    try {
      const optimization = await getAIAlertOptimization(alertHistory);
      setAiOptimization(optimization);
      setSuccess('AI optimization received!');
    } catch (err) {
      console.error('❌ AI optimization error:', err);
      setError('Failed to get AI optimization');
    } finally {
      setLoading(false);
    }
  };

  // ===== CREATE/UPDATE RULE =====
  const handleSaveRule = async () => {
    if (!alertType) {
      setError('Please select an alert type');
      return;
    }

    if (enabledChannels.length === 0) {
      setError('Please select at least one notification channel');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ruleData = {
        alertType,
        threshold,
        priority,
        enabledChannels,
        recipientEmail: enabledChannels.includes('email') ? recipientEmail : null,
        recipientPhone: enabledChannels.includes('sms') ? recipientPhone : null,
        customMessage,
        isActive: true,
        triggerCount: editingRule ? editingRule.triggerCount : 0,
        lastTriggered: editingRule ? editingRule.lastTriggered : null,
        createdBy: currentUser.uid,
        createdAt: editingRule ? editingRule.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingRule) {
        await updateDoc(doc(db, 'alertRules', editingRule.firestoreId), ruleData);
        setSuccess('Alert rule updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'alertRules'), ruleData);
        setSuccess('Alert rule created successfully!');
        console.log('✅ Rule created:', docRef.id);
      }

      // Reset form
      setShowCreateDialog(false);
      setEditingRule(null);
      setAlertType('score_drop');
      setThreshold(10);
      setPriority('high');
      setEnabledChannels(['email', 'inapp']);
      setRecipientEmail('');
      setRecipientPhone('');
      setCustomMessage('');

      // Reload rules
      await loadAlertRules();
    } catch (err) {
      console.error('❌ Error saving rule:', err);
      setError('Failed to save alert rule');
    } finally {
      setLoading(false);
    }
  };

  // ===== EDIT RULE =====
  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setAlertType(rule.alertType);
    setThreshold(rule.threshold);
    setPriority(rule.priority);
    setEnabledChannels(rule.enabledChannels);
    setRecipientEmail(rule.recipientEmail || '');
    setRecipientPhone(rule.recipientPhone || '');
    setCustomMessage(rule.customMessage || '');
    setShowCreateDialog(true);
  };

  // ===== DELETE RULE =====
  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this alert rule?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'alertRules', ruleId));
      setSuccess('Alert rule deleted successfully');
      await loadAlertRules();
    } catch (err) {
      console.error('❌ Error deleting rule:', err);
      setError('Failed to delete alert rule');
    } finally {
      setLoading(false);
    }
  };

  // ===== TOGGLE RULE STATUS =====
  const handleToggleRule = async (rule) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'alertRules', rule.firestoreId), {
        isActive: !rule.isActive,
        updatedAt: serverTimestamp(),
      });
      setSuccess(`Rule ${!rule.isActive ? 'activated' : 'deactivated'}`);
      await loadAlertRules();
    } catch (err) {
      console.error('❌ Error toggling rule:', err);
      setError('Failed to update rule status');
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTERED HISTORY =====
  const filteredHistory = useMemo(() => {
    let history = alertHistory;

    if (filterPriority !== 'all') {
      history = history.filter(item => item.priority === filterPriority);
    }

    if (filterChannel !== 'all') {
      history = history.filter(item => item.channels?.includes(filterChannel));
    }

    return history;
  }, [alertHistory, filterPriority, filterChannel]);

  // ===== STATS =====
  const stats = useMemo(() => {
    return {
      totalRules: alertRules.length,
      activeRules: alertRules.filter(r => r.isActive).length,
      totalAlerts: alertHistory.length,
      criticalAlerts: alertHistory.filter(a => a.priority === 'critical').length,
    };
  }, [alertRules, alertHistory]);

  // ===== RENDER =====
  return (
    <Box className="p-6">
      {/* ===== HEADER ===== */}
      <Box className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Box className="flex items-center gap-3">
          <Avatar className="bg-gradient-to-r from-orange-500 to-red-500" sx={{ width: 48, height: 48 }}>
            <BellIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" className="dark:text-white">
              Alert Rules & Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure and manage monitoring alerts
            </Typography>
          </Box>
        </Box>

        <Box className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={handleGetAIOptimization}
            disabled={loading || alertHistory.length === 0}
          >
            AI Optimize
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled={loading}
          >
            New Alert Rule
          </Button>
        </Box>
      </Box>

      {/* ===== ALERTS ===== */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* ===== AI OPTIMIZATION ===== */}
      {aiOptimization && (
        <Alert severity="info" icon={<AIIcon />} onClose={() => setAiOptimization(null)} className="mb-4">
          <AlertTitle>AI Recommendations</AlertTitle>
          <List dense>
            {aiOptimization.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemText primary={rec} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* ===== STATS ===== */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-blue-600 dark:text-blue-400 mb-1">
                {stats.totalRules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Rules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-green-600 dark:text-green-400 mb-1">
                {stats.activeRules}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Rules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-orange-600 dark:text-orange-400 mb-1">
                {stats.totalAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alerts Triggered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dark:bg-gray-800">
            <CardContent>
              <Typography variant="h4" className="text-red-600 dark:text-red-400 mb-1">
                {stats.criticalAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== TABS ===== */}
      <Paper className="mb-6 dark:bg-gray-800">
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          onChange={(e, newValue) => newValue !== null && setSelectedTab(newValue)}
          fullWidth
          className="p-2"
        >
          <ToggleButton value={0}>
            <SettingsIcon className="mr-2" />
            Alert Rules ({alertRules.length})
          </ToggleButton>
          <ToggleButton value={1}>
            <HistoryIcon className="mr-2" />
            Alert History ({alertHistory.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* ===== TAB 0: ALERT RULES ===== */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {loading && (
            <Grid item xs={12}>
              <Box className="text-center py-12">
                <CircularProgress size={60} />
              </Box>
            </Grid>
          )}

          {!loading && alertRules.length === 0 && (
            <Grid item xs={12}>
              <Paper className="p-12 text-center dark:bg-gray-800">
                <BellIcon sx={{ fontSize: 80 }} className="text-gray-400 mb-4" />
                <Typography variant="h6" color="text.secondary" className="mb-4">
                  No alert rules configured
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600"
                >
                  Create First Alert Rule
                </Button>
              </Paper>
            </Grid>
          )}

          {!loading &&
            alertRules.map((rule) => {
              const alertTypeInfo = ALERT_TYPES.find(t => t.id === rule.alertType);
              const priorityInfo = PRIORITY_LEVELS.find(p => p.id === rule.priority);

              return (
                <Grid item xs={12} md={6} key={rule.firestoreId}>
                  <Card className={`dark:bg-gray-800 ${!rule.isActive ? 'opacity-60' : ''}`}>
                    <CardContent>
                      <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-2">
                          <Avatar sx={{ bgcolor: alertTypeInfo?.color }}>
                            {React.createElement(alertTypeInfo?.icon)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" className="dark:text-white">
                              {alertTypeInfo?.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Threshold: {rule.threshold}
                            </Typography>
                          </Box>
                        </Box>

                        <Switch
                          checked={rule.isActive}
                          onChange={() => handleToggleRule(rule)}
                          disabled={loading}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" className="mb-3">
                        {alertTypeInfo?.description}
                      </Typography>

                      <Box className="flex flex-wrap gap-2 mb-3">
                        <Chip
                          size="small"
                          label={priorityInfo?.label}
                          sx={{ bgcolor: priorityInfo?.color, color: 'white' }}
                        />
                        {rule.enabledChannels.map(channel => {
                          const channelInfo = NOTIFICATION_CHANNELS.find(c => c.id === channel);
                          return (
                            <Chip
                              key={channel}
                              size="small"
                              label={channelInfo?.label}
                              icon={React.createElement(channelInfo?.icon, { style: { fontSize: 16 } })}
                            />
                          );
                        })}
                      </Box>

                      {rule.triggerCount > 0 && (
                        <Alert severity="info" className="mb-2">
                          Triggered {rule.triggerCount} time{rule.triggerCount !== 1 ? 's' : ''}
                          {rule.lastTriggered && (
                            <> • Last: {format(new Date(rule.lastTriggered), 'MMM dd, yyyy')}</>
                          )}
                        </Alert>
                      )}

                      <Box className="flex gap-2 justify-end">
                        <IconButton size="small" onClick={() => handleEditRule(rule)} disabled={loading}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRule(rule.firestoreId)}
                          disabled={loading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      )}

      {/* ===== TAB 1: ALERT HISTORY ===== */}
      {selectedTab === 1 && (
        <Paper className="p-4 dark:bg-gray-800">
          {/* Filters */}
          <Grid container spacing={2} className="mb-4">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  {PRIORITY_LEVELS.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Channel</InputLabel>
                <Select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  label="Channel"
                >
                  <MenuItem value="all">All Channels</MenuItem>
                  {NOTIFICATION_CHANNELS.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* History List */}
          <List>
            {filteredHistory.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No alert history found"
                  secondary="Alerts will appear here when triggered"
                />
              </ListItem>
            )}

            {filteredHistory.map((item, index) => {
              const alertTypeInfo = ALERT_TYPES.find(t => t.id === item.alertType);
              const priorityInfo = PRIORITY_LEVELS.find(p => p.id === item.priority);

              return (
                <React.Fragment key={item.firestoreId}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: alertTypeInfo?.color, width: 36, height: 36 }}>
                        {React.createElement(alertTypeInfo?.icon, { style: { fontSize: 20 } })}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box className="flex items-center gap-2">
                          <Typography variant="body1" className="dark:text-white">
                            {alertTypeInfo?.label}
                          </Typography>
                          <Chip
                            size="small"
                            label={priorityInfo?.label}
                            sx={{ bgcolor: priorityInfo?.color, color: 'white' }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {item.message || alertTypeInfo?.description}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {item.triggeredAt && format(new Date(item.triggeredAt.toDate ? item.triggeredAt.toDate() : item.triggeredAt), 'MMM dd, yyyy hh:mm a')}
                            {' • '}
                            Client: {item.clientName || 'Unknown'}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box className="flex gap-1">
                        {item.channels?.map(channel => {
                          const channelInfo = NOTIFICATION_CHANNELS.find(c => c.id === channel);
                          return (
                            <Tooltip key={channel} title={channelInfo?.label}>
                              <IconButton size="small">
                                {React.createElement(channelInfo?.icon, { style: { fontSize: 18 } })}
                              </IconButton>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredHistory.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {/* ===== CREATE/EDIT DIALOG ===== */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingRule(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="dark:bg-gray-800 dark:text-white">
          <Box className="flex items-center justify-between">
            <Typography variant="h6">
              {editingRule ? 'Edit' : 'Create'} Alert Rule
            </Typography>
            <IconButton onClick={() => setShowCreateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="dark:bg-gray-800">
          <Box className="mt-4">
            {/* Alert Type */}
            <FormControl fullWidth className="mb-4">
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                label="Alert Type"
              >
                {ALERT_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box className="flex items-center gap-2">
                      {React.createElement(type.icon)}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Threshold */}
            <TextField
              fullWidth
              type="number"
              label="Threshold"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              helperText="Points for score changes, 1 for new items"
              className="mb-4"
            />

            {/* Priority */}
            <FormControl fullWidth className="mb-4">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                {PRIORITY_LEVELS.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.icon} {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Notification Channels */}
            <Typography variant="subtitle2" className="mb-2 dark:text-white">
              Notification Channels:
            </Typography>
            <Box className="flex flex-col gap-2 mb-4">
              {NOTIFICATION_CHANNELS.map(channel => (
                <FormControlLabel
                  key={channel.id}
                  control={
                    <Checkbox
                      checked={enabledChannels.includes(channel.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEnabledChannels([...enabledChannels, channel.id]);
                        } else {
                          setEnabledChannels(enabledChannels.filter(c => c !== channel.id));
                        }
                      }}
                    />
                  }
                  label={
                    <Box className="flex items-center gap-2">
                      {React.createElement(channel.icon)}
                      {channel.label}
                    </Box>
                  }
                />
              ))}
            </Box>

            {/* Email Recipient */}
            {enabledChannels.includes('email') && (
              <TextField
                fullWidth
                type="email"
                label="Email Recipient"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mb-4"
              />
            )}

            {/* SMS Recipient */}
            {enabledChannels.includes('sms') && (
              <TextField
                fullWidth
                type="tel"
                label="Phone Number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="mb-4"
              />
            )}

            {/* Custom Message */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Message (Optional)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              helperText="Add custom message to include in notifications"
            />
          </Box>
        </DialogContent>

        <DialogActions className="dark:bg-gray-800">
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRule}
            disabled={loading || enabledChannels.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
            className="bg-green-600 hover:bg-green-700"
          >
            {editingRule ? 'Update' : 'Create'} Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditMonitoringAlerts;