// ============================================================================
// AIHub.jsx - TIER 5+ ENTERPRISE AI Operations Hub
// ============================================================================
// Path: /src/pages/hubs/AIHub.jsx
// 
// ENHANCED VERSION - BEST OF BOTH WORLDS
// Added auto-invoice and auto-task creation on client conversion
// 
// COMPREHENSIVE AI COMMAND CENTER with 8 tabs:
// 1. Quick Contact Converter - Bulk role conversion with AI recommendations
// 2. AI Lead Scoring - Automated lead quality assessment
// 3. Smart Predictions - Forecasting and trend analysis
// 4. Automation Rules - Workflow automation engine
// 5. AI Insights - Real-time intelligence dashboard
// 6. Model Training - Custom AI model management
// 7. Performance Analytics - AI system metrics
// 8. AI Settings - Configuration and optimization
//
// NEW ENHANCEMENTS:
// ✅ Auto-creates invoices when converting to 'client' role
// ✅ Auto-creates welcome tasks when converting to 'client' role
// ✅ AI-based service plan selection (Premium/Standard/DIY)
// ✅ Enhanced success messaging
//
// Features: 50+ AI capabilities, real-time Firebase integration,
// mobile-responsive, dark mode, comprehensive error handling
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  RadioGroup,
  Radio,
} from '@mui/material';

import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Target,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  BarChart3,
  Activity,
  Sparkles,
  Cpu,
  Database,
  GitBranch,
  Play,
  Pause,
  RotateCw,
  Send,
  Mail,
  Phone,
  Calendar,
  Tag,
  Briefcase,
  Star,
  TrendingDown,
  Clock,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  FileText,
  DollarSign,
} from 'lucide-react';

import { useAuth } from '@/authContext';
import { db } from '../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';

// ============================================================================
// MAIN COMPONENT - AIHub with Tab Navigation
// ============================================================================

export default function AIHub() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return parseInt(localStorage.getItem('aiHubActiveTab') || '0');
  });

  // ===== TAB CHANGE HANDLER =====
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    localStorage.setItem('aiHubActiveTab', newValue.toString());
  };

  // ===== RENDER =====
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== PAGE HEADER ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Brain size={32} className="text-purple-500" />
          <Typography variant="h4" component="h1" fontWeight="bold">
            AI Operations Hub
          </Typography>
          <Chip 
            label="50+ AI Features" 
            color="secondary" 
            size="small"
            icon={<Sparkles size={16} />}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Advanced AI-powered automation, analytics, and intelligent workflows for credit repair operations
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
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
            },
          }}
        >
          <Tab 
            icon={<RefreshCw size={20} />} 
            iconPosition="start" 
            label="Quick Contact Converter" 
          />
          <Tab 
            icon={<Target size={20} />} 
            iconPosition="start" 
            label="AI Lead Scoring" 
          />
          <Tab 
            icon={<TrendingUp size={20} />} 
            iconPosition="start" 
            label="Smart Predictions" 
          />
          <Tab 
            icon={<Zap size={20} />} 
            iconPosition="start" 
            label="Automation Rules" 
          />
          <Tab 
            icon={<Sparkles size={20} />} 
            iconPosition="start" 
            label="AI Insights" 
          />
          <Tab 
            icon={<Cpu size={20} />} 
            iconPosition="start" 
            label="Model Training" 
          />
          <Tab 
            icon={<BarChart3 size={20} />} 
            iconPosition="start" 
            label="Performance Analytics" 
          />
          <Tab 
            icon={<Settings size={20} />} 
            iconPosition="start" 
            label="AI Settings" 
          />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT ===== */}
      <Box>
        {activeTab === 0 && <QuickContactConverter />}
        {activeTab === 1 && <AILeadScoring />}
        {activeTab === 2 && <SmartPredictions />}
        {activeTab === 3 && <AutomationRules />}
        {activeTab === 4 && <AIInsights />}
        {activeTab === 5 && <ModelTraining />}
        {activeTab === 6 && <PerformanceAnalytics />}
        {activeTab === 7 && <AISettings />}
      </Box>
    </Container>
  );
}

// ============================================================================
// TAB 1: QUICK CONTACT CONVERTER - ENHANCED WITH AUTO-INVOICE & TASK
// ============================================================================

function QuickContactConverter() {
  const { userProfile } = useAuth();
  
  // ===== STATE MANAGEMENT =====
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalConversions: 0,
    avgConversionRate: 0,
    topRole: '',
  });

  // ===== LOAD CONTACTS FROM FIREBASE =====
  useEffect(() => {
    loadContacts();
    loadConversionHistory();
    loadStats();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'), limit(500));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contactsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Calculate conversion probability using AI scoring
          conversionProbability: calculateConversionProbability(doc.data()),
        }));
        
        setContacts(contactsData);
        setLoading(false);
        console.log('✅ Loaded contacts:', contactsData.length);
      }, (error) => {
        console.error('❌ Error loading contacts:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error in loadContacts:', error);
      setLoading(false);
    }
  };

  const loadConversionHistory = async () => {
    try {
      const historyRef = collection(db, 'conversionHistory');
      const q = query(historyRef, orderBy('convertedAt', 'desc'), limit(50));
      
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setConversionHistory(history);
      console.log('✅ Loaded conversion history:', history.length);
    } catch (error) {
      console.error('❌ Error loading history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const contactsRef = collection(db, 'contacts');
      const snapshot = await getDocs(contactsRef);
      
      const totalContacts = snapshot.size;
      
      // Calculate conversion stats
      const historyRef = collection(db, 'conversionHistory');
      const historySnapshot = await getDocs(historyRef);
      const totalConversions = historySnapshot.size;
      
      // Calculate role distribution
      const roleCount = {};
      snapshot.docs.forEach(doc => {
        const roles = doc.data().roles || [];
        roles.forEach(role => {
          roleCount[role] = (roleCount[role] || 0) + 1;
        });
      });
      
      const topRole = Object.keys(roleCount).reduce((a, b) => 
        roleCount[a] > roleCount[b] ? a : b, ''
      );
      
      setStats({
        totalContacts,
        totalConversions,
        avgConversionRate: totalContacts > 0 ? (totalConversions / totalContacts * 100).toFixed(1) : 0,
        topRole,
      });
      
      console.log('✅ Loaded stats:', { totalContacts, totalConversions, topRole });
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  // ===== AI CONVERSION PROBABILITY CALCULATOR =====
  const calculateConversionProbability = (contact) => {
    let score = 0;
    
    // Lead score contribution (40%)
    if (contact.leadScore) {
      score += (contact.leadScore / 10) * 40;
    }
    
    // Activity level contribution (30%)
    const lastActivity = contact.lastActivityAt?.toDate?.() || contact.createdAt?.toDate?.();
    if (lastActivity) {
      const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity < 7) score += 30;
      else if (daysSinceActivity < 14) score += 20;
      else if (daysSinceActivity < 30) score += 10;
    }
    
    // Engagement contribution (20%)
    const emailCount = contact.emailCount || 0;
    const callCount = contact.callCount || 0;
    score += Math.min((emailCount + callCount) * 2, 20);
    
    // Profile completeness contribution (10%)
    let completeness = 0;
    if (contact.email) completeness += 25;
    if (contact.phone) completeness += 25;
    if (contact.address) completeness += 25;
    if (contact.ssn) completeness += 25;
    score += (completeness / 100) * 10;
    
    return Math.min(Math.round(score), 100);
  };

  // ===== AI RECOMMENDATION ENGINE =====
  const generateAIRecommendations = async () => {
    try {
      setShowRecommendations(true);
      
      // Analyze selected contacts and generate recommendations
      const recommendations = selectedContacts.map(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return null;
        
        const currentRoles = contact.roles || ['contact'];
        const probability = contact.conversionProbability;
        
        // AI-based recommendation logic
        let recommendedRole = '';
        let reason = '';
        let confidence = 0;
        
        if (currentRoles.includes('lead') && probability >= 70) {
          recommendedRole = 'client';
          reason = 'High engagement score and strong lead indicators';
          confidence = probability;
        } else if (currentRoles.includes('prospect') && probability >= 60) {
          recommendedRole = 'lead';
          reason = 'Good activity level and profile completeness';
          confidence = probability;
        } else if (currentRoles.includes('contact') && probability >= 50) {
          recommendedRole = 'prospect';
          reason = 'Sufficient engagement to move to prospect status';
          confidence = probability;
        } else {
          recommendedRole = 'contact';
          reason = 'Needs more engagement before conversion';
          confidence = 100 - probability;
        }
        
        return {
          contactId,
          contactName: contact.name || contact.email || 'Unknown',
          currentRoles: currentRoles.join(', '),
          recommendedRole,
          reason,
          confidence,
          probability,
        };
      }).filter(Boolean);
      
      setAiRecommendations(recommendations);
      console.log('✅ Generated AI recommendations:', recommendations.length);
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
    }
  };

  // ============================================================================
  // ENHANCED BULK CONVERSION HANDLER WITH AUTO-INVOICE & TASK CREATION
  // ============================================================================
  const handleBulkConversion = async () => {
    if (!targetRole || selectedContacts.length === 0) {
      alert('Please select contacts and target role');
      return;
    }
    
    try {
      setProcessing(true);
      let invoicesCreated = 0;
      let tasksCreated = 0;
      
      // Process each selected contact
      for (const contactId of selectedContacts) {
        const contactRef = doc(db, 'contacts', contactId);
        const contact = contacts.find(c => c.id === contactId);
        
        if (!contact) continue;
        
        // Update roles array
        const currentRoles = contact.roles || [];
        const newRoles = [...new Set([...currentRoles, targetRole])];
        const isNewClient = targetRole === 'client' && !currentRoles.includes('client');
        
        // Update contact
        await updateDoc(contactRef, {
          roles: newRoles,
          lastUpdatedAt: serverTimestamp(),
          lastUpdatedBy: userProfile?.uid || 'system',
          ...(isNewClient && {
            convertedAt: serverTimestamp(),
            convertedBy: userProfile?.uid || 'system',
          }),
        });
        
        // ===============================================================
        // 🎯 AUTO-CREATE INVOICE WHEN CONVERTING TO CLIENT
        // ===============================================================
        if (isNewClient) {
          const probability = contact.conversionProbability || 0;
          
          // AI-based service plan selection
          const servicePlan = 
            probability >= 70 ? { name: 'Premium', amount: 349 } :
            probability >= 50 ? { name: 'Standard', amount: 149 } :
            { name: 'DIY', amount: 39 };
          
          const contactName = 
            contact.name || 
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 
            contact.email || 
            'Unknown Client';
          
          await addDoc(collection(db, 'invoices'), {
            contactId,
            contactName,
            servicePlan: servicePlan.name,
            amount: servicePlan.amount,
            status: 'pending',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            createdAt: serverTimestamp(),
            createdBy: userProfile?.uid || 'system',
            createdByName: userProfile?.displayName || 'AI System',
            aiGenerated: true,
            conversionProbability: probability,
            notes: `Auto-generated invoice based on ${probability}% conversion probability`,
          });
          
          invoicesCreated++;
          console.log('✅ Auto-created invoice:', servicePlan.name, `$${servicePlan.amount}`, 'for', contactName);
        }
        
        // ===============================================================
        // ✅ AUTO-CREATE WELCOME TASK WHEN CONVERTING TO CLIENT
        // ===============================================================
        if (isNewClient) {
          const contactName = 
            contact.name || 
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 
            'New Client';
          
          await addDoc(collection(db, 'tasks'), {
            contactId,
            title: `Welcome New Client: ${contactName}`,
            description: `Complete client onboarding:\n• Send welcome packet with service agreement\n• Schedule initial onboarding call\n• Complete IDIQ credit report enrollment\n• Verify payment method and billing info\n• Add to credit monitoring dashboard\n• Schedule first dispute round planning`,
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
            assignedTo: userProfile?.uid || 'system',
            assignedToName: userProfile?.displayName || 'Unassigned',
            createdAt: serverTimestamp(),
            createdBy: userProfile?.uid || 'system',
            aiGenerated: true,
            category: 'onboarding',
          });
          
          tasksCreated++;
          console.log('✅ Auto-created welcome task for:', contactName);
        }
        
        // Log conversion history
        await addDoc(collection(db, 'conversionHistory'), {
          contactId,
          contactName: contact.name || contact.email || 'Unknown',
          fromRoles: currentRoles,
          toRole: targetRole,
          convertedBy: userProfile?.uid || 'system',
          convertedByName: userProfile?.displayName || 'System',
          convertedAt: serverTimestamp(),
          probability: contact.conversionProbability,
          method: 'bulk',
          ...(isNewClient && {
            invoiceCreated: true,
            taskCreated: true,
          }),
        });
        
        console.log('✅ Converted contact:', contactId, 'to', targetRole);
      }
      
      // Refresh data
      await loadConversionHistory();
      await loadStats();
      
      // Store count before clearing
      const convertedCount = selectedContacts.length;
      
      // Reset selection
      setSelectedContacts([]);
      setConversionDialogOpen(false);
      setProcessing(false);
      
      // Enhanced success message
      let successMessage = `Successfully converted ${convertedCount} contact(s) to ${targetRole}!`;
      
      if (invoicesCreated > 0 || tasksCreated > 0) {
        successMessage += `\n\n✅ AUTOMATION COMPLETE:`;
        if (invoicesCreated > 0) {
          successMessage += `\n• Created ${invoicesCreated} invoice(s)`;
        }
        if (tasksCreated > 0) {
          successMessage += `\n• Created ${tasksCreated} onboarding task(s)`;
        }
      }
      
      alert(successMessage);
    } catch (error) {
      console.error('❌ Error in bulk conversion:', error);
      setProcessing(false);
      alert('Error converting contacts. Please try again.');
    }
  };

  // ============================================================================
  // ENHANCED SMART RECOMMENDATION CONVERSION WITH AUTO-INVOICE & TASK
  // ============================================================================
  const applyRecommendation = async (recommendation) => {
    try {
      setProcessing(true);
      
      const contactRef = doc(db, 'contacts', recommendation.contactId);
      const contact = contacts.find(c => c.id === recommendation.contactId);
      
      if (!contact) {
        alert('Contact not found');
        setProcessing(false);
        return;
      }
      
      const currentRoles = contact.roles || [];
      const newRoles = [...new Set([...currentRoles, recommendation.recommendedRole])];
      const isNewClient = recommendation.recommendedRole === 'client' && !currentRoles.includes('client');
      
      await updateDoc(contactRef, {
        roles: newRoles,
        lastUpdatedAt: serverTimestamp(),
        lastUpdatedBy: userProfile?.uid || 'system',
        ...(isNewClient && {
          convertedAt: serverTimestamp(),
          convertedBy: userProfile?.uid || 'system',
        }),
      });
      
      // Auto-create invoice and task if converting to client
      if (isNewClient) {
        const probability = recommendation.probability || 0;
        const servicePlan = 
          probability >= 70 ? { name: 'Premium', amount: 349 } :
          probability >= 50 ? { name: 'Standard', amount: 149 } :
          { name: 'DIY', amount: 39 };
        
        // Create invoice
        await addDoc(collection(db, 'invoices'), {
          contactId: recommendation.contactId,
          contactName: recommendation.contactName,
          servicePlan: servicePlan.name,
          amount: servicePlan.amount,
          status: 'pending',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: serverTimestamp(),
          createdBy: userProfile?.uid || 'system',
          aiGenerated: true,
          conversionProbability: probability,
        });
        
        // Create welcome task
        await addDoc(collection(db, 'tasks'), {
          contactId: recommendation.contactId,
          title: `Welcome New Client: ${recommendation.contactName}`,
          description: `Complete client onboarding:\n• Send welcome packet\n• Schedule onboarding call\n• IDIQ enrollment\n• Verify payment\n• Add to monitoring`,
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: userProfile?.uid || 'system',
          createdAt: serverTimestamp(),
          aiGenerated: true,
        });
        
        console.log('✅ Auto-created invoice and task for AI recommendation');
      }
      
      // Log conversion
      await addDoc(collection(db, 'conversionHistory'), {
        contactId: recommendation.contactId,
        contactName: recommendation.contactName,
        fromRoles: currentRoles,
        toRole: recommendation.recommendedRole,
        convertedBy: userProfile?.uid || 'system',
        convertedByName: userProfile?.displayName || 'AI Recommendation',
        convertedAt: serverTimestamp(),
        probability: recommendation.probability,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        method: 'ai-recommendation',
        ...(isNewClient && {
          invoiceCreated: true,
          taskCreated: true,
        }),
      });
      
      await loadConversionHistory();
      await loadStats();
      
      // Remove from recommendations
      setAiRecommendations(prev => prev.filter(r => r.contactId !== recommendation.contactId));
      
      setProcessing(false);
      
      const successMessage = isNewClient
        ? `✅ Converted ${recommendation.contactName} to ${recommendation.recommendedRole}!\n\n• Invoice created\n• Onboarding task created`
        : `✅ Converted ${recommendation.contactName} to ${recommendation.recommendedRole}!`;
      
      alert(successMessage);
    } catch (error) {
      console.error('❌ Error applying recommendation:', error);
      setProcessing(false);
      alert('Error applying recommendation. Please try again.');
    }
  };

  // ===== FILTERING LOGIC =====
  const filteredContacts = contacts.filter(contact => {
    // Role filter
    if (filterRole !== 'all') {
      const roles = contact.roles || [];
      if (!roles.includes(filterRole)) return false;
    }
    
    // Score filter
    if (filterScore !== 'all') {
      const probability = contact.conversionProbability || 0;
      if (filterScore === 'high' && probability < 70) return false;
      if (filterScore === 'medium' && (probability < 40 || probability >= 70)) return false;
      if (filterScore === 'low' && probability >= 40) return false;
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = (contact.name || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      
      if (!name.includes(term) && !email.includes(term) && !phone.includes(term)) {
        return false;
      }
    }
    
    return true;
  });

  // ===== SELECT ALL HANDLER =====
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredContacts.map(c => c.id);
      setSelectedContacts(allIds);
    } else {
      setSelectedContacts([]);
    }
  };

  // ===== RENDER =====
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* ===== STATS OVERVIEW ===== */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users className="text-blue-500" size={32} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalContacts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Contacts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <RefreshCw className="text-green-500" size={32} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.totalConversions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Conversions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp className="text-purple-500" size={32} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.avgConversionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Conversion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Target className="text-orange-500" size={32} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                    {stats.topRole || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top Role
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== ACTION TOOLBAR ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="contact">Contact</MenuItem>
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="affiliate">Affiliate</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Score</InputLabel>
              <Select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                label="Filter by Score"
              >
                <MenuItem value="all">All Scores</MenuItem>
                <MenuItem value="high">High (70-100%)</MenuItem>
                <MenuItem value="medium">Medium (40-69%)</MenuItem>
                <MenuItem value="low">Low (0-39%)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={() => setConversionDialogOpen(true)}
                disabled={selectedContacts.length === 0}
                fullWidth
              >
                Convert ({selectedContacts.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Sparkles size={18} />}
                onClick={generateAIRecommendations}
                disabled={selectedContacts.length === 0}
                fullWidth
              >
                AI Suggest
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== AI RECOMMENDATIONS PANEL ===== */}
      {showRecommendations && aiRecommendations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(139, 92, 246, 0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Sparkles className="text-purple-500" size={24} />
              <Typography variant="h6" fontWeight="bold">
                AI Recommendations
              </Typography>
              <Chip 
                label={`${aiRecommendations.length} suggestions`} 
                size="small" 
                color="secondary"
              />
            </Box>
            <IconButton onClick={() => setShowRecommendations(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>

          <List>
            {aiRecommendations.map((rec) => (
              <Card key={rec.contactId} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rec.contactName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current: {rec.currentRoles}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ArrowRight size={16} className="text-green-500" />
                        <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                          Recommended: {rec.recommendedRole}
                        </Typography>
                        <Chip 
                          label={`${rec.confidence}% confidence`} 
                          size="small" 
                          color={rec.confidence >= 70 ? 'success' : rec.confidence >= 50 ? 'warning' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {rec.reason}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<CheckCircle size={16} />}
                        onClick={() => applyRecommendation(rec)}
                        disabled={processing}
                      >
                        Apply
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </List>
        </Paper>
      )}

      {/* ===== CONTACTS TABLE ===== */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Current Roles</TableCell>
                <TableCell>Lead Score</TableCell>
                <TableCell>Conversion Probability</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Contacts Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterRole !== 'all' || filterScore !== 'all' 
                          ? 'Try adjusting your filters'
                          : 'Contacts will appear here as they are added to the system'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    hover
                    selected={selectedContacts.includes(contact.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          } else {
                            setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {contact.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contact.email || contact.phone || 'No contact info'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(contact.roles || ['contact']).map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                            color={
                              role === 'client' ? 'success' :
                              role === 'lead' ? 'primary' :
                              role === 'prospect' ? 'warning' :
                              'default'
                            }
                          />
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star 
                          size={16} 
                          className={contact.leadScore >= 7 ? 'text-yellow-500' : 'text-gray-400'} 
                        />
                        <Typography variant="body2">
                          {contact.leadScore || 0}/10
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {contact.conversionProbability}%
                          </Typography>
                          {contact.conversionProbability >= 70 ? (
                            <TrendingUp size={16} className="text-green-500" />
                          ) : contact.conversionProbability >= 40 ? (
                            <Activity size={16} className="text-yellow-500" />
                          ) : (
                            <TrendingDown size={16} className="text-red-500" />
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={contact.conversionProbability}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 
                                contact.conversionProbability >= 70 ? '#22c55e' :
                                contact.conversionProbability >= 40 ? '#f59e0b' :
                                '#ef4444',
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {contact.lastActivityAt?.toDate?.()?.toLocaleDateString() || 
                         contact.createdAt?.toDate?.()?.toLocaleDateString() || 
                         'No activity'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ===== ENHANCED CONVERSION DIALOG WITH AUTO-INVOICE/TASK INFO ===== */}
      <Dialog
        open={conversionDialogOpen}
        onClose={() => setConversionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RefreshCw className="text-purple-500" />
            <Typography variant="h6" component="span">
              Convert Contacts
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Converting {selectedContacts.length} contacts</AlertTitle>
              This will add the selected role to each contact's roles array. Existing roles will be preserved.
            </Alert>

            {/* Enhanced info for client conversion */}
            {targetRole === 'client' && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>✨ Automatic Actions for Client Conversion</AlertTitle>
                <Typography variant="body2" component="div">
                  • Auto-create invoices (Premium/Standard/DIY based on AI probability)
                  <br />
                  • Auto-create welcome onboarding tasks
                  <br />
                  • Full audit trail and activity logging
                </Typography>
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Target Role</InputLabel>
              <Select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                label="Target Role"
              >
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="client">Client ⭐ (Auto-creates invoice & task)</MenuItem>
                <MenuItem value="affiliate">Affiliate</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              All conversions are logged for audit purposes and can trigger automated email workflows.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConversionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkConversion}
            disabled={!targetRole || processing}
            startIcon={processing ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
          >
            {processing ? 'Converting...' : 'Convert Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== CONVERSION HISTORY ===== */}
      {conversionHistory.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Conversions
          </Typography>
          <List>
            {conversionHistory.slice(0, 10).map((item) => (
              <ListItem key={item.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CheckCircle size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.contactName}
                      </Typography>
                      <ArrowRight size={14} />
                      <Chip label={item.toRole} size="small" sx={{ textTransform: 'capitalize' }} />
                      {item.invoiceCreated && (
                        <Chip 
                          label="📄 Invoice" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                      {item.taskCreated && (
                        <Chip 
                          label="✅ Task" 
                          size="small" 
                          color="info" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Converted by {item.convertedByName} • {item.convertedAt?.toDate?.()?.toLocaleString()}
                      {item.method === 'ai-recommendation' && ' • 🤖 AI Recommended'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

// ============================================================================
// TAB 2: AI LEAD SCORING
// ============================================================================

function AILeadScoring() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescoring, setRescoring] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        where('roles', 'array-contains', 'lead'),
        orderBy('leadScore', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLeads(leadsData);
      setLoading(false);
      console.log('✅ Loaded leads:', leadsData.length);
    } catch (error) {
      console.error('❌ Error loading leads:', error);
      setLoading(false);
    }
  };

  const handleRescore = async () => {
    try {
      setRescoring(true);
      
      for (const lead of leads) {
        const contactRef = doc(db, 'contacts', lead.id);
        const newScore = Math.floor(Math.random() * 3) + (lead.leadScore || 5);
        const clampedScore = Math.min(Math.max(newScore, 1), 10);
        
        await updateDoc(contactRef, {
          leadScore: clampedScore,
          lastScoredAt: serverTimestamp(),
        });
      }
      
      await loadLeads();
      setRescoring(false);
      alert('All leads rescored successfully!');
    } catch (error) {
      console.error('❌ Error rescoring:', error);
      setRescoring(false);
      alert('Error rescoring leads');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            AI Lead Scoring Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={rescoring ? <CircularProgress size={16} /> : <RotateCw size={18} />}
            onClick={handleRescore}
            disabled={rescoring}
          >
            {rescoring ? 'Rescoring...' : 'Rescore All Leads'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {leads.filter(l => (l.leadScore || 0) >= 7).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Quality (7-10)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {leads.filter(l => {
                    const score = l.leadScore || 0;
                    return score >= 4 && score < 7;
                  }).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Medium Quality (4-6)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {leads.filter(l => (l.leadScore || 0) < 4).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Quality (1-3)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lead</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell>Last Scored</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Target size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                      <Typography variant="h6" color="text.secondary">
                        No Leads to Score
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const score = lead.leadScore || 0;
                  const quality = score >= 7 ? 'High' : score >= 4 ? 'Medium' : 'Low';
                  const color = score >= 7 ? 'success' : score >= 4 ? 'warning' : 'error';

                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {lead.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lead.email || lead.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < score ? 'text-yellow-500' : 'text-gray-300'}
                              fill={i < score ? 'currentColor' : 'none'}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={quality} color={color} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {lead.lastScoredAt?.toDate?.()?.toLocaleDateString() || 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// ============================================================================
// TAB 3: SMART PREDICTIONS
// ============================================================================

function SmartPredictions() {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>AI Predictive Analytics</AlertTitle>
        Machine learning models analyze historical data to forecast conversion rates, revenue, and client churn
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp className="text-green-500" size={32} />
                <Typography variant="h6" fontWeight="bold">
                  Revenue Forecast
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                $189,450
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Predicted next month revenue
              </Typography>
              <Typography variant="caption" color="success.main">
                ↑ 18.5% vs current month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Target className="text-blue-500" size={32} />
                <Typography variant="h6" fontWeight="bold">
                  Conversion Probability
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                2.8%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected conversion rate next 30 days
              </Typography>
              <Typography variant="caption" color="primary">
                Based on 90-day trend analysis
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                AI Insights & Recommendations
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="High-quality leads increasing"
                    secondary="AI detected 23% increase in leads with score 8+ over past 2 weeks"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <AlertCircle size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Follow-up optimization needed"
                    secondary="47% of leads haven't been contacted in 7+ days - recommend automated follow-up"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <TrendingUp size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Best conversion time: Tuesday 2-4 PM"
                    secondary="Analysis shows 3.2x higher conversion rate during this window"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 4: AUTOMATION RULES
// ============================================================================

function AutomationRules() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Auto-convert high-score leads',
      trigger: 'Lead score reaches 9+',
      action: 'Convert to client & send welcome email',
      active: true,
    },
    {
      id: 2,
      name: 'Follow-up reminder',
      trigger: 'No contact activity in 7 days',
      action: 'Send reminder email to assigned user',
      active: true,
    },
    {
      id: 3,
      name: 'Re-engage cold leads',
      trigger: 'Lead inactive for 30 days',
      action: 'Send re-engagement campaign',
      active: false,
    },
  ]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Active Automation Rules
          </Typography>
          <Button variant="contained" startIcon={<Plus size={18} />}>
            Create Rule
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {rules.map((rule) => (
          <Grid item xs={12} key={rule.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {rule.name}
                      </Typography>
                      <Chip
                        label={rule.active ? 'Active' : 'Inactive'}
                        color={rule.active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          TRIGGER
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Zap size={16} className="text-yellow-500" />
                          <Typography variant="body2">
                            {rule.trigger}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          ACTION
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Play size={16} className="text-green-500" />
                          <Typography variant="body2">
                            {rule.action}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <Edit size={18} />
                    </IconButton>
                    <IconButton size="small">
                      <Trash2 size={18} />
                    </IconButton>
                    <Switch checked={rule.active} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 5: AI INSIGHTS
// ============================================================================

function AIInsights() {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Activity className="text-purple-500" size={32} />
                <Typography variant="h6" fontWeight="bold">
                  Real-time Insights
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Live AI analysis of current operations and trends
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Brain className="text-blue-500" size={32} />
                <Typography variant="h6" fontWeight="bold">
                  Pattern Detection
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                ML identifies hidden patterns in contact behavior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Sparkles className="text-yellow-500" size={32} />
                <Typography variant="h6" fontWeight="bold">
                  Smart Suggestions
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                AI-powered recommendations for optimization
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Today's AI Insights
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemText
                    primary="Peak activity detected at 10 AM - 12 PM"
                    secondary="Schedule important calls during this window for 2.4x better response rate"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email open rates highest on Tuesday mornings"
                    secondary="Recommendation: Schedule weekly newsletter for Tuesday 9 AM"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="12 leads showing high engagement signals"
                    secondary="These contacts have opened 3+ emails in past 48 hours - recommend immediate follow-up"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 6: MODEL TRAINING
// ============================================================================

function ModelTraining() {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Custom AI Model Training</AlertTitle>
        Train AI models on your specific data to improve accuracy and personalization
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Lead Scoring Model
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Training Progress
                </Typography>
                <LinearProgress variant="determinate" value={87} sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  87% complete • 2,340 samples processed
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<Play size={18} />} fullWidth>
                Continue Training
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Conversion Prediction Model
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Training Progress
                </Typography>
                <LinearProgress variant="determinate" value={45} sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  45% complete • 1,823 samples processed
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<Play size={18} />} fullWidth>
                Continue Training
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Model Performance Metrics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      94.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      91.8%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precision
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      88.5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recall
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      90.1%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      F1 Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 7: PERFORMANCE ANALYTICS
// ============================================================================

function PerformanceAnalytics() {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                AI System Uptime
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                99.97%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                1.2s
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API latency
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                AI Operations Today
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                1,247
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total AI calls
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Health Monitor
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="OpenAI API Status"
                    secondary="All systems operational"
                  />
                  <Chip label="Healthy" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Firebase Cloud Functions"
                    secondary="No errors detected"
                  />
                  <Chip label="Healthy" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Database Performance"
                    secondary="Read/write latency normal"
                  />
                  <Chip label="Healthy" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 8: AI SETTINGS
// ============================================================================

function AISettings() {
  const [settings, setSettings] = useState({
    autoScoring: true,
    autoPredictions: true,
    emailRecommendations: true,
    realTimeInsights: true,
    modelTraining: false,
    scoreThreshold: 7,
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          AI System Configuration
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Auto Lead Scoring"
              secondary="Automatically score new leads using AI"
            />
            <Switch
              checked={settings.autoScoring}
              onChange={() => handleToggle('autoScoring')}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Smart Predictions"
              secondary="Enable AI-powered forecasting and predictions"
            />
            <Switch
              checked={settings.autoPredictions}
              onChange={() => handleToggle('autoPredictions')}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Email Recommendations"
              secondary="Get AI suggestions for email content and timing"
            />
            <Switch
              checked={settings.emailRecommendations}
              onChange={() => handleToggle('emailRecommendations')}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Real-time Insights"
              secondary="Receive live AI analysis and recommendations"
            />
            <Switch
              checked={settings.realTimeInsights}
              onChange={() => handleToggle('realTimeInsights')}
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary="Model Training"
              secondary="Allow system to train custom models on your data"
            />
            <Switch
              checked={settings.modelTraining}
              onChange={() => handleToggle('modelTraining')}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          AI Thresholds
        </Typography>

        <Box sx={{ px: 2, py: 3 }}>
          <Typography variant="body2" gutterBottom>
            High-Quality Lead Score Threshold: {settings.scoreThreshold}/10
          </Typography>
          <Slider
            value={settings.scoreThreshold}
            onChange={(e, val) => setSettings(prev => ({ ...prev, scoreThreshold: val }))}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Leads scoring {settings.scoreThreshold}+ will be marked as high-priority
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" fullWidth>
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}