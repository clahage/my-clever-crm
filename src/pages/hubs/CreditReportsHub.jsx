// src/pages/credit/CreditReportsHub.jsx
// ============================================================================
// 📊 CREDIT REPORTS HUB - IDIQ SYSTEM UNIFIED INTERFACE
// ============================================================================
// UPDATED: 2026-01-22 - Added Contact Selector for Enroll Contact tab
// Fixed: Contact selection now shows searchable list before enrollment form
// ============================================================================
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, Suspense, lazy } from 'react';
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
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Tooltip,
  Badge,
  Fade,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  PersonAdd as EnrollIcon,
  Assessment as ReportIcon,
  Workspaces as WorkflowIcon,
  Gavel as DisputeIcon,
  Timeline as MonitorIcon,
  Dashboard as ControlIcon,
  Settings as ConfigIcon,
  TrendingUp as OptimizerIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewerIcon,
  AutoAwesome as ReviewIcon,
  DirectionsCar as AutoIcon,
  Link as AffiliateIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CreditScore as CreditScoreIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HIERARCHY } from '@/layout/navConfig';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Lazy load components
const IDIQEnrollment = lazy(() => import('../../components/IDIQEnrollment'));
const CompleteEnrollmentFlow = lazy(() => import('../../components/idiq/CompleteEnrollmentFlow'));
const ClientCreditReport = lazy(() => import('../../components/credit/ClientCreditReport'));
const CreditReportWorkflow = lazy(() => import('../../components/credit/CreditReportWorkflow'));
const AIDisputeGenerator = lazy(() => import('../../components/credit/AIDisputeGenerator'));
const CreditMonitoringSystem = lazy(() => import('../../components/credit/CreditMonitoringSystem'));
const CreditScoreOptimizer = lazy(() => import('../hubs/CreditScoreOptimizer'));
const IDIQControlCenter = lazy(() => import('../../components/credit/IDIQControlCenter'));
const IDIQConfig = lazy(() => import('../../components/credit/IDIQConfig'));
// Credit Report Upload & Viewer components
const CreditReportUploader = lazy(() => import('../../components/credit/CreditReportUploader'));
const CreditReportViewer = lazy(() => import('../../components/credit/CreditReportViewer'));
// Revenue & Affiliate Integration components
const CreditReviewGenerator = lazy(() => import('../../components/revenue/CreditReviewGenerator'));
const AutoOpportunityDashboard = lazy(() => import('../../components/revenue/AutoOpportunityDashboard'));
const AffiliateLinkManager = lazy(() => import('../../components/revenue/AffiliateLinkManager'));
// IDIQ Credit Report Widget Viewer (uses IDIQ's MicroFrontend)
const IDIQCreditReportViewer = lazy(() => import('../../components/credit/IDIQCreditReportViewer'));
// Tab configuration
const TABS = [
  { id: 'upload', label: 'Upload & Parse', icon: UploadIcon, component: 'CreditReportUploader', permission: 'user', badge: 'NEW' },
  { id: 'viewer', label: 'Report Viewer', icon: ViewerIcon, component: 'CreditReportViewer', permission: 'user', badge: 'AI' },
  { id: 'review', label: 'AI Review', icon: ReviewIcon, component: 'CreditReviewGenerator', permission: 'user', badge: 'REV' },
  { id: 'auto', label: 'Auto Financing', icon: AutoIcon, component: 'AutoOpportunityDashboard', permission: 'manager', badge: '$$$' },
  { id: 'affiliates', label: 'Affiliates', icon: AffiliateIcon, component: 'AffiliateLinkManager', permission: 'admin', badge: 'REV' },
  { id: 'enroll', label: 'Enroll Contact', icon: EnrollIcon, component: 'CompleteEnrollmentFlow', permission: 'user' },
  { id: 'idiq-report', label: 'IDIQ Report', icon: CreditScoreIcon, component: 'IDIQCreditReportViewer', permission: 'user', badge: 'LIVE' },
  { id: 'reports', label: 'View Reports', icon: ReportIcon, component: 'ClientCreditReport', permission: 'client' },
  { id: 'workflow', label: 'Workflows', icon: WorkflowIcon, component: 'CreditReportWorkflow', permission: 'user' },
  { id: 'disputes', label: 'Disputes', icon: DisputeIcon, component: 'AIDisputeGenerator', permission: 'client' },
  { id: 'monitoring', label: 'Monitoring', icon: MonitorIcon, component: 'CreditMonitoringSystem', permission: 'client' },
  { id: 'optimizer', label: 'Score Optimizer', icon: OptimizerIcon, component: 'CreditScoreOptimizer', permission: 'client', badge: 'AI' },
  { id: 'control', label: 'Control Center', icon: ControlIcon, component: 'IDIQControlCenter', permission: 'admin' },
  { id: 'config', label: 'Settings', icon: ConfigIcon, component: 'IDIQConfig', permission: 'admin' },
];

// Component map for dynamic rendering
const COMPONENT_MAP = {
  CreditReportUploader,
  CreditReportViewer,
  CreditReviewGenerator,
  AutoOpportunityDashboard,
  AffiliateLinkManager,
  CompleteEnrollmentFlow,
  IDIQEnrollment,
  ClientCreditReport,
  CreditReportWorkflow,
  AIDisputeGenerator,
  CreditMonitoringSystem,
  CreditScoreOptimizer,
  IDIQControlCenter,
  IDIQConfig,
  IDIQCreditReportViewer,
};

// ============================================================================
// CONTACT SELECTOR COMPONENT - For Enroll Contact Tab
// ============================================================================
const ContactSelector = ({ onSelectContact, onNewEnrollment }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load contacts from Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Real-time listener for contacts
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsList);
        setFilteredContacts(contactsList);
        setLoading(false);
        console.log(`✅ Loaded ${contactsList.length} contacts for enrollment selection`);
      }, (err) => {
        console.error('❌ Error loading contacts:', err);
        setError('Failed to load contacts. Please try again.');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('❌ Error setting up contacts listener:', err);
      setError('Failed to connect to database.');
      setLoading(false);
    }
  }, []);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(contact => {
      const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
      const email = (contact.emails?.[0]?.address || contact.email || '').toLowerCase();
      const phone = (contact.phones?.[0]?.number || contact.phone || '').toLowerCase();
      
      return fullName.includes(term) || 
             email.includes(term) || 
             phone.includes(term);
    });

    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  // Get primary email from contact
  const getPrimaryEmail = (contact) => {
    if (contact.emails && contact.emails.length > 0) {
      const primary = contact.emails.find(e => e.isPrimary) || contact.emails[0];
      return primary.address;
    }
    return contact.email || 'No email';
  };

  // Get primary phone from contact
  const getPrimaryPhone = (contact) => {
    if (contact.phones && contact.phones.length > 0) {
      const primary = contact.phones.find(p => p.isPrimary) || contact.phones[0];
      return primary.number;
    }
    return contact.phone || 'No phone';
  };

  // Check if contact already has IDIQ enrollment
  const hasIDIQEnrollment = (contact) => {
    return contact.idiq?.enrolled === true || 
           contact.idiqEnrollment?.status === 'active' ||
           contact.idiq?.membershipStatus === 'active';
  };

  // Get enrollment status badge
  const getEnrollmentStatus = (contact) => {
    if (hasIDIQEnrollment(contact)) {
      return { label: 'Enrolled', color: 'success', icon: CheckCircleIcon };
    }
    if (contact.idiq?.membershipStatus === 'pending' || contact.idiqEnrollment?.status === 'pending') {
      return { label: 'Pending', color: 'warning', icon: WarningIcon };
    }
    return { label: 'Not Enrolled', color: 'default', icon: CreditScoreIcon };
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading contacts...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📋 Select Contact to Enroll in IDIQ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Choose an existing contact to pre-fill the enrollment form, or start a new enrollment from scratch.
        </Typography>
      </Paper>

      {/* Search & Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AddIcon />}
              onClick={onNewEnrollment}
            >
              New Enrollment (No Contact)
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </Typography>
        <Chip 
          label={`${contacts.filter(c => !hasIDIQEnrollment(c)).length} not enrolled`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Empty state */}
      {filteredContacts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {searchTerm ? 'No contacts match your search' : 'No contacts found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm ? 'Try a different search term' : 'Add contacts in the Contacts Hub first'}
          </Typography>
          <Button variant="outlined" onClick={onNewEnrollment} startIcon={<AddIcon />}>
            Start New Enrollment
          </Button>
        </Paper>
      )}

      {/* Contact Cards Grid */}
      <Grid container spacing={2}>
        {filteredContacts.map((contact) => {
          const status = getEnrollmentStatus(contact);
          const StatusIcon = status.icon;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  border: hasIDIQEnrollment(contact) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                }}
              >
                <CardActionArea 
                  onClick={() => onSelectContact(contact.id)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    {/* Status Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar sx={{ bgcolor: hasIDIQEnrollment(contact) ? 'success.main' : 'primary.main' }}>
                        {(contact.firstName?.[0] || 'U').toUpperCase()}
                      </Avatar>
                      <Chip
                        size="small"
                        label={status.label}
                        color={status.color}
                        icon={<StatusIcon sx={{ fontSize: 16 }} />}
                      />
                    </Box>

                    {/* Name */}
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {contact.firstName || 'Unknown'} {contact.lastName || ''}
                    </Typography>

                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {getPrimaryEmail(contact)}
                      </Typography>
                    </Box>

                    {/* Phone */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {getPrimaryPhone(contact)}
                      </Typography>
                    </Box>

                    {/* Lead Score */}
                    {contact.leadScore && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={`Lead Score: ${contact.leadScore}/10`}
                          color={contact.leadScore >= 7 ? 'success' : contact.leadScore >= 4 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {/* Enroll Button */}
                    <Button
                      variant={hasIDIQEnrollment(contact) ? 'outlined' : 'contained'}
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      {hasIDIQEnrollment(contact) ? 'View / Re-enroll' : 'Enroll Now'}
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const CreditReportsHub = () => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  
  // ===== SELECTED CONTACT STATE (for Enroll Contact tab) =====
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [showContactSelector, setShowContactSelector] = useState(true);

  // Permission check function - DEFINED FIRST
  const hasPermission = (requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 5;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 5;
    return userLevel >= requiredLevel;
  };

  // Get initial tab - USES hasPermission
  const getInitialTab = () => {
    const saved = localStorage.getItem('creditHubActiveTab');
    if (saved) {
      const savedTab = TABS.find(t => t.id === saved);
      if (savedTab && hasPermission(savedTab.permission)) {
        return saved;
      }
    }
    const firstAccessible = TABS.find(t => hasPermission(t.permission));
    return firstAccessible?.id || 'enroll';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Reset contact selector when switching to enroll tab
  useEffect(() => {
    if (activeTab === 'enroll') {
      setShowContactSelector(true);
      setSelectedContactId(null);
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    const tab = TABS.find(t => t.id === newValue);
    if (tab && hasPermission(tab.permission)) {
      setActiveTab(newValue);
      localStorage.setItem('creditHubActiveTab', newValue);
    }
  };

  // ===== CONTACT SELECTION HANDLER =====
  const handleSelectContact = (contactId) => {
    console.log('📋 Contact selected for enrollment:', contactId);
    setSelectedContactId(contactId);
    setShowContactSelector(false);
  };

  // ===== NEW ENROLLMENT (NO CONTACT) HANDLER =====
  const handleNewEnrollment = () => {
    console.log('📋 Starting new enrollment without pre-selected contact');
    setSelectedContactId(null);
    setShowContactSelector(false);
  };

  // ===== BACK TO CONTACT SELECTOR =====
  const handleBackToSelector = () => {
    setSelectedContactId(null);
    setShowContactSelector(true);
  };

  // ===== ENROLLMENT COMPLETION HANDLER =====
  const handleEnrollmentComplete = (contactId, enrollmentData) => {
    console.log('✅ Enrollment completed:', { contactId, enrollmentData });
    // Clear selected contact after completion
    setSelectedContactId(null);
    setShowContactSelector(true);
    // Optionally switch to View Reports tab
    setActiveTab('reports');
  };

  // Get accessible tabs
  const accessibleTabs = TABS.filter(tab => hasPermission(tab.permission));

  // Get active tab config
  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabConfig ? COMPONENT_MAP[activeTabConfig.component] : null;

  // Loading fallback
  const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress size={60} />
    </Box>
  );

  // ===== RENDER COMPONENT WITH PROPS =====
  const renderActiveComponent = () => {
    if (!ActiveComponent) {
      return (
        <Alert severity="warning">
          You don't have permission to access this tab.
        </Alert>
      );
    }

    // Special handling for CompleteEnrollmentFlow - show contact selector first
    if (activeTab === 'enroll') {
      // Show contact selector if no contact selected yet
      if (showContactSelector) {
        return (
          <ContactSelector
            onSelectContact={handleSelectContact}
            onNewEnrollment={handleNewEnrollment}
          />
        );
      }

      // Show enrollment form with selected contact (or blank for new)
      return (
        <Box>
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={handleBackToSelector}
            sx={{ mb: 2 }}
            startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
          >
            Back to Contact Selection
          </Button>

          <Suspense fallback={<LoadingFallback />}>
            <CompleteEnrollmentFlow
              mode="crm"
              preFilledContactId={selectedContactId}
              onComplete={handleEnrollmentComplete}
              skipCelebration={true}
            />
          </Suspense>
        </Box>
      );
    }

    // ===== SPECIAL HANDLING: IDIQ Credit Report Viewer =====
    // Shows contact selector first, then displays IDIQ widget with member token
    if (activeTab === 'idiq-report') {
      // Show contact selector if no contact selected yet
      if (showContactSelector) {
        return (
          <ContactSelector
            onSelectContact={handleSelectContact}
            onNewEnrollment={() => {
              // Can't view report without a contact
              alert('Please select an enrolled contact to view their credit report.');
            }}
          />
        );
      }

      // Show IDIQ Report viewer with selected contact
      return (
        <Box>
          {/* Back Button */}
          <Button
            variant="outlined"
            onClick={handleBackToSelector}
            sx={{ mb: 2 }}
            startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
          >
            Back to Contact Selection
          </Button>

          <Suspense fallback={<LoadingFallback />}>
            <IDIQCreditReportViewer
              contactId={selectedContactId}
              showHeader={true}
              minHeight={700}
              onReportLoaded={(data) => console.log('✅ IDIQ Report loaded:', data)}
              onError={(err) => console.error('❌ IDIQ Report error:', err)}
            />
          </Suspense>
        </Box>
      );
    }

    // Default rendering for other components
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ActiveComponent 
          // Pass contact selection handler to components that might need it
          onSelectContact={(contactId) => {
            setSelectedContactId(contactId);
            setShowContactSelector(false);
            setActiveTab('enroll');
          }}
        />
      </Suspense>
    );
  };

  return (
    <Box className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #5e35b1 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'white',
              color: 'primary.main',
              mr: 2,
            }}
          >
            <ShieldIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Credit Reports Hub
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Complete IDIQ credit management system
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
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
              fontSize: '1rem',
            },
          }}
        >
          {accessibleTabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={<IconComponent />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {renderActiveComponent()}
      </Box>
    </Box>
  );
};

export default CreditReportsHub;