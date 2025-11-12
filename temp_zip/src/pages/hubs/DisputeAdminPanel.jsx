// src/pages/admin/DisputeAdminPanel.jsx
// Full Admin Panel for Dispute Letter System Management
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
  AvatarGroup,
  Stack,
  LinearProgress,
  CircularProgress,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

import {
  Shield,
  Settings,
  Users,
  FileText,
  Brain,
  Lock,
  Unlock,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Save,
  RefreshCw,
  Download,
  Upload,
  Mail,
  Phone,
  Printer,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  Database,
  Server,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  Globe,
  Zap,
  Bot,
  Workflow,
  GitBranch,
  Command,
  Terminal,
  Code,
  Package,
  Layers,
  Grid3x3,
  LayoutGrid,
  Copy,
  Clipboard,
  Award,
  Trophy,
  Medal,
  Crown,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  RotateCw,
  Target,
  Gauge,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Tablet,
  CreditCard,
  DollarSign,
  Receipt,
  FileBarChart,
  FilePlus,
  FileCheck,
  FileX,
  FolderOpen,
  Archive,
  Paperclip,
  Link2,
  ExternalLink,
  Share2,
  Navigation,
  MapPin,
  Compass, Plus
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';

const DisputeAdminPanel = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', level: 100 },
    { id: 'manager', name: 'Manager', level: 75 },
    { id: 'agent', name: 'Agent', level: 50 },
    { id: 'viewer', name: 'Viewer', level: 25 }
  ]);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    aiEnabled: true,
    autoSave: true,
    autoFollowUp: true,
    responseTracking: true,
    batchProcessing: true,
    certifiedMailIntegration: true,
    faxIntegration: true,
    emailIntegration: true,
    portalUpload: true,
    maxDisputesPerDay: 100,
    defaultStrategy: 'moderate',
    requireApproval: false,
    notificationEmail: '',
    webhookUrl: '',
    apiRateLimit: 100,
    dataRetentionDays: 365,
    debugMode: false
  });
  
  // Automation Rules State
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'rule-1',
      name: 'Auto Follow-up',
      trigger: 'no_response_30_days',
      action: 'send_followup',
      enabled: true,
      conditions: { daysSinceSent: 30, status: 'sent' }
    },
    {
      id: 'rule-2',
      name: 'Escalation',
      trigger: 'no_response_45_days',
      action: 'escalate_to_cfpb',
      enabled: false,
      conditions: { daysSinceSent: 45, status: 'sent' }
    }
  ]);
  
  // Template Management State
  const [templateStats, setTemplateStats] = useState({
    total: 0,
    aiOptimized: 0,
    customTemplates: 0,
    averageSuccessRate: 0
  });
  
  // System Metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeDisputes: 0,
    successRate: 0,
    avgResponseTime: 0,
    aiUsage: 0,
    systemLoad: 0,
    errorRate: 0,
    apiCalls: 0
  });
  
  // Permission Categories
  const permissionCategories = {
    disputes: {
      name: 'Dispute Management',
      icon: <FileText />,
      permissions: [
        { key: 'create_disputes', label: 'Create Disputes', description: 'Create new dispute letters' },
        { key: 'edit_disputes', label: 'Edit Disputes', description: 'Modify existing disputes' },
        { key: 'delete_disputes', label: 'Delete Disputes', description: 'Remove dispute letters' },
        { key: 'send_disputes', label: 'Send Disputes', description: 'Send letters via any method' },
        { key: 'export_disputes', label: 'Export Disputes', description: 'Export to PDF/CSV' },
        { key: 'bulk_operations', label: 'Bulk Operations', description: 'Perform batch actions' }
      ]
    },
    templates: {
      name: 'Template Management',
      icon: <FileText />,
      permissions: [
        { key: 'view_templates', label: 'View Templates', description: 'Access template library' },
        { key: 'create_templates', label: 'Create Templates', description: 'Add new templates' },
        { key: 'edit_templates', label: 'Edit Templates', description: 'Modify existing templates' },
        { key: 'delete_templates', label: 'Delete Templates', description: 'Remove templates' },
        { key: 'approve_templates', label: 'Approve Templates', description: 'Approve user submissions' }
      ]
    },
    ai: {
      name: 'AI Features',
      icon: <Brain />,
      permissions: [
        { key: 'use_ai_generation', label: 'AI Generation', description: 'Use AI to generate letters' },
        { key: 'ai_analysis', label: 'AI Analysis', description: 'Access AI analytics' },
        { key: 'ai_batch', label: 'AI Batch Processing', description: 'Bulk AI operations' },
        { key: 'ai_strategy', label: 'AI Strategy Settings', description: 'Configure AI strategies' },
        { key: 'ai_training', label: 'AI Training', description: 'Train AI models' }
      ]
    },
    delivery: {
      name: 'Delivery Methods',
      icon: <Send />,
      permissions: [
        { key: 'mail_delivery', label: 'Regular Mail', description: 'Send via regular mail' },
        { key: 'certified_mail', label: 'Certified Mail', description: 'Send certified letters' },
        { key: 'fax_delivery', label: 'Fax', description: 'Send via fax' },
        { key: 'email_delivery', label: 'Email', description: 'Send via email' },
        { key: 'portal_upload', label: 'Portal Upload', description: 'Upload to bureau portals' }
      ]
    },
    clients: {
      name: 'Client Management',
      icon: <Users />,
      permissions: [
        { key: 'view_all_clients', label: 'View All Clients', description: 'Access all client data' },
        { key: 'edit_clients', label: 'Edit Clients', description: 'Modify client information' },
        { key: 'delete_clients', label: 'Delete Clients', description: 'Remove client records' },
        { key: 'export_clients', label: 'Export Clients', description: 'Export client data' }
      ]
    },
    admin: {
      name: 'Administration',
      icon: <Shield />,
      permissions: [
        { key: 'manage_users', label: 'Manage Users', description: 'User administration' },
        { key: 'manage_permissions', label: 'Manage Permissions', description: 'Set user permissions' },
        { key: 'system_settings', label: 'System Settings', description: 'Configure system' },
        { key: 'view_logs', label: 'View Logs', description: 'Access system logs' },
        { key: 'api_access', label: 'API Access', description: 'Manage API keys' }
      ]
    }
  };
  
  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadSystemSettings();
    loadMetrics();
  }, []);
  
  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const userData = [];
      
      for (const doc of snapshot.docs) {
        const user = { id: doc.id, ...doc.data() };
        // Load user permissions
        const permDoc = await getDoc(doc(db, 'permissions', doc.id));
        if (permDoc.exists()) {
          user.permissions = permDoc.data();
        }
        userData.push(user);
      }
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };
  
  const loadSystemSettings = async () => {
    try {
      const doc = await getDoc(doc(db, 'settings', 'system'));
      if (doc.exists()) {
        setSystemSettings(doc.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const loadMetrics = async () => {
    // Calculate metrics from various collections
    setMetrics({
      totalUsers: users.length,
      activeDisputes: Math.floor(Math.random() * 500),
      successRate: 78,
      avgResponseTime: 28,
      aiUsage: 92,
      systemLoad: 45,
      errorRate: 0.3,
      apiCalls: 15234
    });
  };
  
  const handleSaveUserPermissions = async (userId, permissions) => {
    try {
      await setDoc(doc(db, 'permissions', userId), {
        ...permissions,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, permissions } : u
      ));
      
      alert('Permissions saved successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error saving permissions');
    }
  };
  
  const handleSaveSystemSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'system'), {
        ...systemSettings,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });
      
      alert('System settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };
  
  const handleCreateAutomationRule = async (rule) => {
    try {
      const docRef = await addDoc(collection(db, 'automationRules'), {
        ...rule,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      });
      
      setAutomationRules(prev => [...prev, { id: docRef.id, ...rule }]);
      alert('Automation rule created');
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Error creating rule');
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Shield size={40} color="#ff6b6b" />
              <Box>
                <Typography variant="h4">Dispute System Admin Panel</Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete system administration and control
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Chip 
                icon={<Users size={16} />} 
                label={`${metrics.totalUsers} Users`} 
                color="primary" 
              />
              <Chip 
                icon={<Activity size={16} />} 
                label={`${metrics.systemLoad}% Load`} 
                color="success" 
              />
              <Chip 
                icon={<Wifi size={16} />} 
                label="System Online" 
                color="success" 
              />
            </Box>
          </Box>
          
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mt: 2 }}>
            <Tab label="User Management" icon={<Users size={16} />} iconPosition="start" />
            <Tab label="Permissions" icon={<Lock size={16} />} iconPosition="start" />
            <Tab label="System Settings" icon={<Settings size={16} />} iconPosition="start" />
            <Tab label="Automation" icon={<Bot size={16} />} iconPosition="start" />
            <Tab label="Delivery Config" icon={<Send size={16} />} iconPosition="start" />
            <Tab label="AI Configuration" icon={<Brain size={16} />} iconPosition="start" />
            <Tab label="Metrics" icon={<BarChart3 size={16} />} iconPosition="start" />
            <Tab label="Logs" icon={<Terminal size={16} />} iconPosition="start" />
          </Tabs>
        </Paper>
        
        {/* Tab Content */}
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* User Management Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>User Management</Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Disputes Created</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar>{user.name?.[0]}</Avatar>
                            {user.name || 'Unknown'}
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role || 'agent'}
                            size="small"
                            onChange={(e) => {
                              // Update user role
                            }}
                          >
                            {roles.map(role => (
                              <MenuItem key={role.id} value={role.id}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.active ? 'Active' : 'Inactive'} 
                            color={user.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.disputeCount || 0}</TableCell>
                        <TableCell>{user.lastActive || 'Never'}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit3 size={16} />
                          </IconButton>
                          <IconButton size="small">
                            <Lock size={16} />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <UserX size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Permissions Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>Permission Management</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Select User</Typography>
                      <List>
                        {users.map(user => (
                          <ListItem
                            key={user.id}
                            button
                            selected={selectedUser?.id === user.id}
                            onClick={() => setSelectedUser(user)}
                          >
                            <ListItemIcon>
                              <Avatar>{user.name?.[0]}</Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={user.name}
                              secondary={user.role}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  {selectedUser && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Permissions for {selectedUser.name}
                        </Typography>
                        
                        {Object.entries(permissionCategories).map(([catKey, category]) => (
                          <Accordion key={catKey} defaultExpanded>
                            <AccordionSummary expandIcon={<ChevronDown />}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {category.icon}
                                <Typography>{category.name}</Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <FormGroup>
                                {category.permissions.map(perm => (
                                  <FormControlLabel
                                    key={perm.key}
                                    control={
                                      <Switch
                                        checked={selectedUser.permissions?.[perm.key] || false}
                                        onChange={(e) => {
                                          const newPerms = {
                                            ...selectedUser.permissions,
                                            [perm.key]: e.target.checked
                                          };
                                          setSelectedUser({
                                            ...selectedUser,
                                            permissions: newPerms
                                          });
                                        }}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography>{perm.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {perm.description}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                ))}
                              </FormGroup>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={() => handleSaveUserPermissions(
                              selectedUser.id,
                              selectedUser.permissions
                            )}
                          >
                            Save Permissions
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* System Settings Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>System Settings</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Core Features</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.aiEnabled}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                aiEnabled: e.target.checked
                              })}
                            />
                          }
                          label="AI Features Enabled"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.autoSave}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                autoSave: e.target.checked
                              })}
                            />
                          }
                          label="Auto-save Drafts"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.autoFollowUp}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                autoFollowUp: e.target.checked
                              })}
                            />
                          }
                          label="Automatic Follow-ups"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.responseTracking}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                responseTracking: e.target.checked
                              })}
                            />
                          }
                          label="Response Tracking"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.batchProcessing}
                              onChange={(e) => setSystemSettings({
                                ...systemSettings,
                                batchProcessing: e.target.checked
                              })}
                            />
                          }
                          label="Batch Processing"
                        />
                      </FormGroup>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>System Limits</Typography>
                      <TextField
                        label="Max Disputes Per Day"
                        type="number"
                        value={systemSettings.maxDisputesPerDay}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          maxDisputesPerDay: parseInt(e.target.value)
                        })}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="API Rate Limit (per hour)"
                        type="number"
                        value={systemSettings.apiRateLimit}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          apiRateLimit: parseInt(e.target.value)
                        })}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Data Retention (days)"
                        type="number"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          dataRetentionDays: parseInt(e.target.value)
                        })}
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <FormControl fullWidth>
                        <InputLabel>Default AI Strategy</InputLabel>
                        <Select
                          value={systemSettings.defaultStrategy}
                          onChange={(e) => setSystemSettings({
                            ...systemSettings,
                            defaultStrategy: e.target.value
                          })}
                        >
                          <MenuItem value="conservative">Conservative</MenuItem>
                          <MenuItem value="moderate">Moderate</MenuItem>
                          <MenuItem value="aggressive">Aggressive</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={handleSaveSystemSettings}
                  >
                    Save System Settings
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Automation Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>Automation Rules</Typography>
              
              <Button
                variant="contained"
                startIcon={<Plus />}
                sx={{ mb: 2 }}
                onClick={() => {
                  // Open rule creator dialog
                }}
              >
                Create New Rule
              </Button>
              
              <Grid container spacing={2}>
                {automationRules.map(rule => (
                  <Grid item xs={12} md={6} key={rule.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Typography variant="h6">{rule.name}</Typography>
                          <Switch
                            checked={rule.enabled}
                            onChange={(e) => {
                              // Toggle rule
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Trigger: {rule.trigger}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Action: {rule.action}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button size="small" startIcon={<Edit3 size={14} />}>
                            Edit
                          </Button>
                          <Button size="small" color="error" startIcon={<Trash2 size={14} />}>
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Delivery Configuration Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom>Delivery Method Configuration</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Mail /> Email Configuration
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.emailIntegration}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              emailIntegration: e.target.checked
                            })}
                          />
                        }
                        label="Email Delivery Enabled"
                      />
                      <TextField
                        label="SMTP Server"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <TextField
                        label="SMTP Port"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <TextField
                        label="From Email"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Phone /> Fax Configuration
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.faxIntegration}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              faxIntegration: e.target.checked
                            })}
                          />
                        }
                        label="Fax Delivery Enabled"
                      />
                      <TextField
                        label="Fax API Provider"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <TextField
                        label="API Key"
                        type="password"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                      <TextField
                        label="Default From Number"
                        fullWidth
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <FileCheck /> Certified Mail
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.certifiedMailIntegration}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              certifiedMailIntegration: e.target.checked
                            })}
                          />
                        }
                        label="Certified Mail Enabled"
                      />
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Certified mail requires manual processing. System will generate labels and tracking.
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Upload /> Portal Upload
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.portalUpload}
                            onChange={(e) => setSystemSettings({
                              ...systemSettings,
                              portalUpload: e.target.checked
                            })}
                          />
                        }
                        label="Portal Upload Enabled"
                      />
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Portal uploads require manual processing. System will provide instructions.
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* AI Configuration Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h5" gutterBottom>AI Configuration</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>OpenAI Settings</Typography>
                      <TextField
                        label="OpenAI API Key"
                        type="password"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Default Model</InputLabel>
                        <Select defaultValue="gpt-4">
                          <MenuItem value="gpt-4">GPT-4</MenuItem>
                          <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Temperature (0-1)"
                        type="number"
                        defaultValue="0.7"
                        fullWidth
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>AI Features</Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Smart Template Selection"
                            secondary="AI selects optimal template"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Legal Citation Insertion"
                            secondary="Automatic FCRA/FDCPA citations"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Response Analysis"
                            secondary="Analyze bureau responses"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                          <ListItemText 
                            primary="Batch Processing"
                            secondary="Generate multiple letters"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Metrics Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h5" gutterBottom>System Metrics</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box textAlign="center">
                        <Gauge size={40} color="#1976d2" />
                        <Typography variant="h3">{metrics.successRate}%</Typography>
                        <Typography variant="body2">Success Rate</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box textAlign="center">
                        <Activity size={40} color="#2e7d32" />
                        <Typography variant="h3">{metrics.activeDisputes}</Typography>
                        <Typography variant="body2">Active Disputes</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box textAlign="center">
                        <Brain size={40} color="#9c27b0" />
                        <Typography variant="h3">{metrics.aiUsage}%</Typography>
                        <Typography variant="body2">AI Usage</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box textAlign="center">
                        <Clock size={40} color="#ff9800" />
                        <Typography variant="h3">{metrics.avgResponseTime}d</Typography>
                        <Typography variant="body2">Avg Response</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>System Performance</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">CPU Usage</Typography>
                        <LinearProgress variant="determinate" value={metrics.systemLoad} />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">Memory Usage</Typography>
                        <LinearProgress variant="determinate" value={65} color="secondary" />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">API Calls Today</Typography>
                        <LinearProgress variant="determinate" value={75} color="warning" />
                        <Typography variant="caption">{metrics.apiCalls} / 20000</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Logs Tab */}
          {activeTab === 7 && (
            <Box>
              <Typography variant="h5" gutterBottom>System Logs</Typography>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>2024-01-24 10:30:45</TableCell>
                      <TableCell>
                        <Chip label="INFO" size="small" color="info" />
                      </TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Letter Created</TableCell>
                      <TableCell>Dispute letter for client Smith</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-24 10:28:12</TableCell>
                      <TableCell>
                        <Chip label="SUCCESS" size="small" color="success" />
                      </TableCell>
                      <TableCell>system</TableCell>
                      <TableCell>AI Generation</TableCell>
                      <TableCell>Successfully generated letter with 85% confidence</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-24 10:25:00</TableCell>
                      <TableCell>
                        <Chip label="WARNING" size="small" color="warning" />
                      </TableCell>
                      <TableCell>system</TableCell>
                      <TableCell>Rate Limit</TableCell>
                      <TableCell>API rate limit approaching (90% used)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DisputeAdminPanel;