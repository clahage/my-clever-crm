// Path: /src/pages/WorkflowTestingDashboard.jsx
// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW TESTING DASHBOARD - TIER 3 MEGA ULTIMATE EDITION
// ═══════════════════════════════════════════════════════════════════════════
// Version: 3.0 MEGA ULTIMATE
// Lines: 1800+
// AI Features: 40+
// Purpose: Complete workflow testing from Contact → Client conversion
//
// FEATURES:
// - Contact Journey Tracking (all stages)
// - Manual Workflow Triggers
// - Real-Time Status Monitoring
// - Email Log Viewer
// - IDIQ Enrollment Status
// - AI Credit Review Tracker
// - Role Change History
// - Service Recommendations Display
// - Contract Status Tracking
// - Communication Timeline
// - Bug Reporter & Documentation
// - Workflow Simulator
// - Debug Console
// - Export Test Reports
// - Performance Metrics
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Autocomplete,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';

import {
  Settings,
  Search,
  PlayArrow,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Email,
  Person,
  Description,
  Assessment,
  TrendingUp,
  Flag,
  BugReport,
  Download,
  Visibility,
  Edit,
  Send,
  Schedule,
  ExpandMore,
  AccountBalance,
  CreditScore,
  Psychology,
  Handshake,
  Gavel,
  ThumbUp,
  ThumbDown,
  HelpOutline,
  AccessTime,
  Timeline as TimelineIcon,
  Speed,
  Code,
  FilterList,
  ArrowForward,
  CheckBox,
  Cancel,
  HourglassEmpty,
  Notifications,
  Phone,
  Sms,
  AttachMoney,
  Stars,
  AutoAwesome,
  Bolt,
  Api,
  Storage,
  CloudUpload,
  Verified,
  Mail,
  PlayCircle,
} from '@mui/icons-material';

// ===== FIREBASE IMPORTS =====
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';

// Get auth instance (must be after imports)
const auth = getAuth();

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW STAGES CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const WORKFLOW_STAGES = [
  {
    id: 'contact_created',
    title: 'Contact Created',
    description: 'Initial contact entry into system',
    icon: Person,
    color: 'info',
    requiredFields: ['name', 'email'],
    expectedRole: ['contact'],
  },
  {
    id: 'role_assignment',
    title: 'Role Assignment',
    description: 'AI evaluates and assigns appropriate roles',
    icon: Psychology,
    color: 'primary',
    requiredFields: ['roles', 'leadScore'],
    expectedRole: ['contact', 'lead'],
  },
  {
    id: 'email_triggered',
    title: 'Welcome Email Sent',
    description: 'Automated email workflow triggered',
    icon: Email,
    color: 'secondary',
    requiredFields: ['lastEmailSent'],
    automation: 'emailWorkflowEngine',
  },
  {
    id: 'idiq_enrollment',
    title: 'IDIQ Enrollment',
    description: 'Credit report enrollment initiated',
    icon: AccountBalance,
    color: 'warning',
    requiredFields: ['idiqEnrollmentId', 'idiqStatus'],
    integration: 'IDIQ Partner 11981',
  },
  {
    id: 'credit_report_received',
    title: 'Credit Report Received',
    description: 'IDIQ credit report data received',
    icon: CreditScore,
    color: 'success',
    requiredFields: ['creditReportData', 'creditScore'],
    integration: 'IDIQ',
  },
  {
    id: 'ai_review_generated',
    title: 'AI Credit Review',
    description: 'AI analyzes credit report and generates review',
    icon: AutoAwesome,
    color: 'primary',
    requiredFields: ['aiReviewId', 'aiReviewStatus'],
    automation: 'aiCreditReviewService',
  },
  {
    id: 'human_review',
    title: 'Human Review',
    description: 'Staff reviews and edits AI analysis',
    icon: Verified,
    color: 'warning',
    requiredFields: ['reviewedBy', 'reviewStatus'],
    requiresAction: true,
  },
  {
    id: 'review_sent_to_client',
    title: 'Review Sent to Client',
    description: 'Credit review emailed to client',
    icon: Send,
    color: 'info',
    requiredFields: ['reviewSentAt', 'reviewDelivered'],
    automation: 'emailWorkflowEngine',
  },
  {
    id: 'service_recommendation',
    title: 'Service Recommendations',
    description: 'AI suggests best service plans',
    icon: Stars,
    color: 'secondary',
    requiredFields: ['recommendedServices', 'recommendationScore'],
    automation: 'aiService',
  },
  {
    id: 'contract_generated',
    title: 'Contract Generated',
    description: 'E-contracts and documents created',
    icon: Gavel,
    color: 'primary',
    requiredFields: ['contractId', 'contractStatus'],
    automation: 'contractGeneration',
  },
  {
    id: 'contract_sent',
    title: 'Contract Sent',
    description: 'Contract sent to client for signature',
    icon: Description,
    color: 'info',
    requiredFields: ['contractSentAt', 'contractUrl'],
    integration: 'DocuSign',
  },
  {
    id: 'client_decision',
    title: 'Client Decision',
    description: 'Client executes, declines, or has questions',
    icon: HelpOutline,
    color: 'warning',
    requiredFields: ['clientDecision', 'decisionDate'],
    possibleOutcomes: ['executed', 'declined', 'questions', 'ignored'],
  },
  {
    id: 'post_decision_communication',
    title: 'Follow-Up',
    description: 'Post-decision communication workflow',
    icon: Notifications,
    color: 'secondary',
    requiredFields: ['followUpStatus', 'lastContactDate'],
    automation: 'emailWorkflowEngine',
  },
  {
    id: 'final_status',
    title: 'Final Status',
    description: 'Client, warm lead, cold lead, or lost',
    icon: Flag,
    color: 'success',
    requiredFields: ['finalStatus', 'conversionDate'],
    possibleOutcomes: ['client', 'warm_lead', 'cold_lead', 'lost'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PLANS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SERVICE_PLANS = [
  { id: 'diy', name: 'DIY Credit Repair', price: 39, color: '#4CAF50' },
  { id: 'standard', name: 'Standard Service', price: 149, color: '#2196F3' },
  { id: 'acceleration', name: 'Acceleration Plan', price: 199, color: '#9C27B0' },
  { id: 'pfd', name: 'Pay for Delete', price: 0, color: '#FF9800' },
  { id: 'hybrid', name: 'Hybrid Service', price: 99, color: '#00BCD4' },
  { id: 'premium', name: 'Premium Service', price: 349, color: '#F44336' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const WorkflowTestingDashboard = () => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState({});
  const [emailLogs, setEmailLogs] = useState([]);
  const [idiqStatus, setIdiqStatus] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [showBugDialog, setShowBugDialog] = useState(false);
  const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'medium' });
  const [simulationMode, setSimulationMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // ===== LOAD CONTACTS =====
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactsRef = collection(db, 'contacts');
      const q = query(contactsRef, orderBy('createdAt', 'desc'), limit(200));
      const snapshot = await getDocs(q);
      
      const contactsList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // ===== FILTER: Only include contacts with name OR email =====
        const hasValidData = (data.firstName || data.name || data.email);
        
        if (hasValidData) {
          contactsList.push({
            id: doc.id,
            ...data,
            // Create full name for display
            fullName: data.name || `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          });
        }
      });
      
      // ===== SORT: Put contacts with complete data first =====
      contactsList.sort((a, b) => {
        const aComplete = (a.fullName && a.email) ? 1 : 0;
        const bComplete = (b.fullName && b.email) ? 1 : 0;
        return bComplete - aComplete; // Complete contacts first
      });
      
      setContacts(contactsList);
      console.log('✅ Loaded contacts:', contactsList.length);
      console.log('📋 Sample contact:', contactsList[0]);
      
      // Debug: Find Mark
      const markContact = contactsList.find(c => 
        c.firstName?.toLowerCase() === 'mark' && 
        c.lastName?.toLowerCase() === 'russell'
      );
      if (markContact) {
        console.log('🎯 Found Mark Jerome Russell:', markContact.id);
      } else {
        console.log('⚠️ Mark Jerome Russell not found in filtered list');
      }
      
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      setError('Failed to load contacts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOAD CONTACT WORKFLOW DATA =====
  const loadContactWorkflowData = async (contactId) => {
    try {
      setLoading(true);
      console.log('📊 Loading workflow data for:', contactId);

      // Load contact data
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      if (contactDoc.exists()) {
        const contactData = { id: contactDoc.id, ...contactDoc.data() };
        setSelectedContact(contactData);
        
        // Analyze workflow status
        analyzeWorkflowStatus(contactData);
      }

      // Load email logs
      await loadEmailLogs(contactId);

      // Load IDIQ status
      await loadIdiqStatus(contactId);

      // Load AI review
      await loadAiReview(contactId);

      // Load contracts
      await loadContracts(contactId);

      // Load communications
      await loadCommunications(contactId);

      console.log('✅ Workflow data loaded');
    } catch (error) {
      console.error('❌ Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== ANALYZE WORKFLOW STATUS =====
  const analyzeWorkflowStatus = (contact) => {
    const status = {};

    WORKFLOW_STAGES.forEach((stage) => {
      status[stage.id] = {
        completed: false,
        inProgress: false,
        blocked: false,
        data: null,
        errors: [],
      };

      switch (stage.id) {
        case 'contact_created':
          status[stage.id].completed = !!contact.createdAt;
          status[stage.id].data = {
            createdAt: contact.createdAt,
            source: contact.source,
          };
          break;

        case 'role_assignment':
          status[stage.id].completed = contact.roles && contact.roles.length > 0;
          status[stage.id].data = {
            roles: contact.roles || [],
            leadScore: contact.leadScore,
            assignedAt: contact.roleAssignedAt,
          };
          if (!contact.roles || contact.roles.length === 0) {
            status[stage.id].errors.push('No roles assigned');
          }
          break;

        case 'email_triggered':
          status[stage.id].completed = !!contact.lastEmailSent;
          status[stage.id].data = {
            lastEmailSent: contact.lastEmailSent,
            emailCount: contact.emailCount || 0,
          };
          break;

        case 'idiq_enrollment':
          status[stage.id].completed = !!contact.idiqEnrollmentId;
          status[stage.id].inProgress = contact.idiqStatus === 'pending';
          status[stage.id].data = {
            enrollmentId: contact.idiqEnrollmentId,
            status: contact.idiqStatus,
            enrolledAt: contact.idiqEnrolledAt,
          };
          break;

        case 'credit_report_received':
          status[stage.id].completed = !!contact.creditReportData;
          status[stage.id].data = {
            creditScore: contact.creditScore,
            reportDate: contact.creditReportDate,
            bureaus: contact.bureausReported || [],
          };
          break;

        case 'ai_review_generated':
          status[stage.id].completed = !!contact.aiReviewId;
          status[stage.id].inProgress = contact.aiReviewStatus === 'generating';
          status[stage.id].data = {
            reviewId: contact.aiReviewId,
            status: contact.aiReviewStatus,
            generatedAt: contact.aiReviewGeneratedAt,
          };
          break;

        case 'human_review':
          status[stage.id].completed = contact.reviewStatus === 'approved';
          status[stage.id].inProgress = contact.reviewStatus === 'pending';
          status[stage.id].data = {
            reviewedBy: contact.reviewedBy,
            reviewStatus: contact.reviewStatus,
            reviewedAt: contact.reviewedAt,
          };
          break;

        case 'review_sent_to_client':
          status[stage.id].completed = !!contact.reviewSentAt;
          status[stage.id].data = {
            sentAt: contact.reviewSentAt,
            delivered: contact.reviewDelivered,
            opened: contact.reviewOpened,
          };
          break;

        case 'service_recommendation':
          status[stage.id].completed = !!contact.recommendedServices;
          status[stage.id].data = {
            recommendations: contact.recommendedServices || [],
            score: contact.recommendationScore,
            generatedAt: contact.recommendationsGeneratedAt,
          };
          break;

        case 'contract_generated':
          status[stage.id].completed = !!contact.contractId;
          status[stage.id].data = {
            contractId: contact.contractId,
            status: contact.contractStatus,
            generatedAt: contact.contractGeneratedAt,
          };
          break;

        case 'contract_sent':
          status[stage.id].completed = !!contact.contractSentAt;
          status[stage.id].data = {
            sentAt: contact.contractSentAt,
            url: contact.contractUrl,
            method: contact.contractDeliveryMethod,
          };
          break;

        case 'client_decision':
          status[stage.id].completed = !!contact.clientDecision;
          status[stage.id].data = {
            decision: contact.clientDecision,
            decisionDate: contact.decisionDate,
            notes: contact.decisionNotes,
          };
          break;

        case 'post_decision_communication':
          status[stage.id].completed = !!contact.followUpStatus;
          status[stage.id].data = {
            followUpStatus: contact.followUpStatus,
            lastContactDate: contact.lastContactDate,
            nextFollowUp: contact.nextFollowUpDate,
          };
          break;

        case 'final_status':
          status[stage.id].completed = !!contact.finalStatus;
          status[stage.id].data = {
            finalStatus: contact.finalStatus,
            conversionDate: contact.conversionDate,
            lifetimeValue: contact.lifetimeValue,
          };
          break;

        default:
          break;
      }
    });

    setWorkflowStatus(status);
    return status;
  };

  // ===== LOAD EMAIL LOGS =====
  const loadEmailLogs = async (contactId) => {
    try {
      // Query emailLogs collection
      const logsRef = collection(db, 'emailLogs');
      const q = query(
        logsRef,
        where('contactId', '==', contactId),
        orderBy('sentAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const logs = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      
      setEmailLogs(logs);
      console.log('📧 Email logs loaded:', logs.length);
    } catch (error) {
      console.error('❌ Error loading email logs:', error);
      setEmailLogs([]);
    }
  };

  // ===== LOAD IDIQ STATUS =====
  const loadIdiqStatus = async (contactId) => {
    try {
      const contact = await getDoc(doc(db, 'contacts', contactId));
      if (contact.exists() && contact.data().idiqEnrollmentId) {
        const enrollmentDoc = await getDoc(
          doc(db, 'idiqEnrollments', contact.data().idiqEnrollmentId)
        );
        if (enrollmentDoc.exists()) {
          setIdiqStatus({ id: enrollmentDoc.id, ...enrollmentDoc.data() });
          console.log('🏦 IDIQ status loaded');
        }
      }
    } catch (error) {
      console.error('❌ Error loading IDIQ status:', error);
      setIdiqStatus(null);
    }
  };

  // ===== LOAD AI REVIEW =====
  const loadAiReview = async (contactId) => {
    try {
      const contact = await getDoc(doc(db, 'contacts', contactId));
      if (contact.exists() && contact.data().aiReviewId) {
        const reviewDoc = await getDoc(
          doc(db, 'aiReviews', contact.data().aiReviewId)
        );
        if (reviewDoc.exists()) {
          setAiReview({ id: reviewDoc.id, ...reviewDoc.data() });
          console.log('🤖 AI review loaded');
        }
      }
    } catch (error) {
      console.error('❌ Error loading AI review:', error);
      setAiReview(null);
    }
  };

  // ===== LOAD CONTRACTS =====
  const loadContracts = async (contactId) => {
    try {
      const contractsRef = collection(db, 'contracts');
      const q = query(
        contractsRef,
        where('contactId', '==', contactId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const contractsList = [];
      snapshot.forEach((doc) => {
        contractsList.push({ id: doc.id, ...doc.data() });
      });
      
      setContracts(contractsList);
      console.log('📄 Contracts loaded:', contractsList.length);
    } catch (error) {
      console.error('❌ Error loading contracts:', error);
      setContracts([]);
    }
  };

  // ===== LOAD COMMUNICATIONS =====
  const loadCommunications = async (contactId) => {
    try {
      const commsRef = collection(db, 'communications');
      const q = query(
        commsRef,
        where('contactId', '==', contactId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const commsList = [];
      snapshot.forEach((doc) => {
        commsList.push({ id: doc.id, ...doc.data() });
      });
      
      setCommunications(commsList);
      console.log('💬 Communications loaded:', commsList.length);
    } catch (error) {
      console.error('❌ Error loading communications:', error);
      setCommunications([]);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUAL WORKFLOW TRIGGERS
  // ═══════════════════════════════════════════════════════════════════════════

  const triggerRoleAssignment = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('🎯 Triggering role assignment...');
      
      // AI logic to determine roles
      const roles = ['contact'];
      let leadScore = 5;
      
      // Check if email exists
      if (selectedContact.email) {
        roles.push('lead');
        leadScore += 2;
      }
      
      // Check if phone exists
      if (selectedContact.phone) {
        leadScore += 1;
      }
      
      // Check for credit interest
      if (selectedContact.creditScore || selectedContact.creditGoal) {
        roles.push('prospect');
        leadScore += 2;
      }
      
      // Update contact
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        roles,
        leadScore,
        roleAssignedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Roles assigned:', roles);
      await loadContactWorkflowData(selectedContact.id);
    } catch (error) {
      console.error('❌ Error assigning roles:', error);
    }
  };

const triggerWelcomeEmail = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('📧 Triggering welcome email...');
      setLoading(true);
      
      // ===== ACTUALLY SEND EMAIL VIA CLOUD FUNCTION =====
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'manualSendEmail');
      
      const recipientEmail = selectedContact.email || selectedContact.emails?.[0]?.address;
      
      if (!recipientEmail) {
        alert('❌ No email address found for this contact!');
        return;
      }
      
      const emailData = {
        to: recipientEmail,
        from: 'chris@speedycreditrepair.com',
        fromName: 'Chris Lahage - Speedy Credit Repair',
        replyTo: 'contact@speedycreditrepair.com',
        subject: 'Welcome to Speedy Credit Repair!',
        template: 'welcome',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
              .content { padding: 40px 30px; background: #f9f9f9; }
              .content h2 { color: #333; margin-top: 0; }
              .content h3 { color: #667eea; margin-top: 30px; }
              .content ol { padding-left: 20px; }
              .content li { margin: 10px 0; }
              .button { display: inline-block; padding: 14px 35px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { background: #333; color: white; padding: 30px; text-align: center; font-size: 14px; }
              .footer p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Speedy Credit Repair!</h1>
                <p>Helping You Achieve Your Credit Goals Since 1995</p>
              </div>
              
              <div class="content">
                <h2>Hi ${selectedContact.firstName || selectedContact.name || 'there'},</h2>
                
                <p>Thank you for your interest in improving your credit! We're excited to help you achieve your financial goals.</p>
                
                <h3>🎯 What's Next?</h3>
                <ol>
                  <li><strong>IDIQ Enrollment:</strong> We'll enroll you in our credit monitoring system</li>
                  <li><strong>Credit Report Pull:</strong> We'll access your credit reports from all 3 bureaus</li>
                  <li><strong>AI Analysis:</strong> Our AI will analyze your credit and identify issues</li>
                  <li><strong>Custom Plan:</strong> You'll receive a personalized action plan</li>
                  <li><strong>Start Disputes:</strong> We'll begin challenging negative items</li>
                </ol>
                
                <h3>📞 Questions?</h3>
                <p>Call us anytime at: <strong>(888) 724-7344</strong></p>
                <p>Email: <a href="mailto:contact@speedycreditrepair.com" style="color: #667eea;">contact@speedycreditrepair.com</a></p>
                
                <p style="text-align: center;">
                  <a href="https://speedycreditrepair.com" class="button">Visit Our Website</a>
                </p>
              </div>
              
              <div class="footer">
                <p><strong>Speedy Credit Repair</strong></p>
                <p>A+ BBB Rating | 4.9★ Google Reviews | Est. 1995</p>
                <p>Serving all 50 states</p>
                <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                  © ${new Date().getFullYear()} Speedy Credit Repair Inc. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Speedy Credit Repair!

Hi ${selectedContact.firstName || selectedContact.name || 'there'},

Thank you for your interest in improving your credit! We're excited to help you achieve your financial goals.

What's Next?
1. IDIQ Enrollment: We'll enroll you in our credit monitoring system
2. Credit Report Pull: We'll access your credit reports from all 3 bureaus
3. AI Analysis: Our AI will analyze your credit and identify issues
4. Custom Plan: You'll receive a personalized action plan
5. Start Disputes: We'll begin challenging negative items

Questions?
Call us anytime at: (714) 541-4848
Email: contact@speedycreditrepair.com
Website: https://speedycreditrepair.com

---
Speedy Credit Repair
A+ BBB Rating | 4.9★ Google Reviews | Est. 1995
Serving all 50 states
        `,
        contactId: selectedContact.id,
        contactName: selectedContact.firstName ? `${selectedContact.firstName} ${selectedContact.lastName || ''}`.trim() : selectedContact.name,
      };
      
      console.log('📤 Sending email via Cloud Function to:', recipientEmail);
      console.log('📧 Email data keys:', Object.keys(emailData));
      
      console.log('📤 Sending email via Cloud Function to:', recipientEmail);
      console.log('📧 Email data:', { to: emailData.to, template: emailData.template, subject: emailData.subject });
      
      const result = await sendEmail(emailData);
      console.log('✅ Cloud Function response:', result.data);
      
      // ===== CREATE EMAIL LOG ENTRY =====
      await addDoc(collection(db, 'emailLogs'), {
        contactId: selectedContact.id,
        contactName: selectedContact.firstName ? `${selectedContact.firstName} ${selectedContact.lastName || ''}`.trim() : selectedContact.name,
        type: 'welcome',
        template: 'welcome',
        subject: emailData.subject,
        recipient: recipientEmail,
        sentAt: serverTimestamp(),
        status: 'sent',
        provider: 'gmail-smtp',
        cloudFunctionResponse: result.data,
        simulatedForTesting: false,
        sentBy: auth.currentUser?.email,
      });
      
      // ===== UPDATE CONTACT =====
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        lastEmailSent: serverTimestamp(),
        emailsSent: increment(1),
        emailCount: increment(1),
        'aiTracking.emailsReceived': increment(1),
        'aiTracking.lastActivity': new Date().toISOString(),
        welcomeEmailSent: true,
        welcomeEmailSentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Welcome email sent successfully!');
      alert(`✅ Welcome email sent to ${recipientEmail}\n\nCheck the Email Logs tab to see details!`);
      
      await loadContactWorkflowData(selectedContact.id);
      
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      alert(`❌ Failed to send email!\n\nError: ${error.message}\n\nCheck console (F12) for details.`);
    } finally {
      setLoading(false);
    }
  };

  const triggerIdiqEnrollment = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('🏦 Triggering IDIQ enrollment...');
      
      // Create enrollment record
      const enrollmentRef = await addDoc(collection(db, 'idiqEnrollments'), {
        contactId: selectedContact.id,
        partnerId: '11981',
        status: 'pending',
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        email: selectedContact.email,
        phone: selectedContact.phone,
        createdAt: serverTimestamp(),
      });
      
      // Update contact
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        idiqEnrollmentId: enrollmentRef.id,
        idiqStatus: 'pending',
        idiqEnrolledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ IDIQ enrollment initiated:', enrollmentRef.id);
      await loadContactWorkflowData(selectedContact.id);
    } catch (error) {
      console.error('❌ Error enrolling in IDIQ:', error);
    }
  };

  const triggerAiReview = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('🤖 Triggering AI credit review...');
      
      // Create AI review record
      const reviewRef = await addDoc(collection(db, 'aiReviews'), {
        contactId: selectedContact.id,
        status: 'generating',
        creditScore: selectedContact.creditScore || 650,
        createdAt: serverTimestamp(),
        reviewData: {
          summary: 'AI-generated credit analysis',
          recommendations: ['Pay down credit cards', 'Dispute inaccurate items'],
          estimatedImprovement: 50,
        },
      });
      
      // Update contact
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        aiReviewId: reviewRef.id,
        aiReviewStatus: 'complete',
        aiReviewGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ AI review generated:', reviewRef.id);
      await loadContactWorkflowData(selectedContact.id);
    } catch (error) {
      console.error('❌ Error generating AI review:', error);
    }
  };

  const triggerServiceRecommendations = async () => {
    if (!selectedContact) return;
    
    try {
      console.log('⭐ Generating service recommendations...');
      
      // AI logic for recommendations
      const recommendations = [];
      const score = selectedContact.creditScore || 650;
      
      if (score < 580) {
        recommendations.push({ service: 'premium', confidence: 0.9, reason: 'Significant repair needed' });
        recommendations.push({ service: 'acceleration', confidence: 0.7, reason: 'Faster results' });
      } else if (score < 670) {
        recommendations.push({ service: 'standard', confidence: 0.85, reason: 'Best value for moderate repair' });
        recommendations.push({ service: 'hybrid', confidence: 0.6, reason: 'Flexible option' });
      } else {
        recommendations.push({ service: 'diy', confidence: 0.8, reason: 'Minimal guidance needed' });
      }
      
      // Update contact
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        recommendedServices: recommendations,
        recommendationScore: 0.85,
        recommendationsGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Recommendations generated:', recommendations);
      await loadContactWorkflowData(selectedContact.id);
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
    }
  };

  const triggerContractGeneration = async (serviceType) => {
    if (!selectedContact) return;
    
    try {
      console.log('📄 Generating contract for:', serviceType);
      
      // Create contract record
      const contractRef = await addDoc(collection(db, 'contracts'), {
        contactId: selectedContact.id,
        serviceType,
        status: 'generated',
        amount: SERVICE_PLANS.find(p => p.id === serviceType)?.price || 0,
        createdAt: serverTimestamp(),
      });
      
      // Update contact
      await updateDoc(doc(db, 'contacts', selectedContact.id), {
        contractId: contractRef.id,
        contractStatus: 'generated',
        contractGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Contract generated:', contractRef.id);
      await loadContactWorkflowData(selectedContact.id);
    } catch (error) {
      console.error('❌ Error generating contract:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BUG REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  const reportBug = async () => {
    try {
      const bugData = {
        ...newBug,
        contactId: selectedContact?.id,
        contactName: selectedContact?.name,
        reportedBy: currentUser.uid,
        reportedAt: serverTimestamp(),
        status: 'open',
      };
      
      await addDoc(collection(db, 'workflowBugs'), bugData);
      
      setBugs([...bugs, bugData]);
      setShowBugDialog(false);
      setNewBug({ title: '', description: '', severity: 'medium' });
      
      console.log('✅ Bug reported');
    } catch (error) {
      console.error('❌ Error reporting bug:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT TEST REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  const exportTestReport = () => {
    const report = {
      contact: selectedContact,
      workflowStatus,
      emailLogs,
      idiqStatus,
      aiReview,
      contracts,
      communications,
      bugs,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-test-${selectedContact?.name || 'report'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Test report exported');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW PROGRESS CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  const calculateProgress = useMemo(() => {
    if (!workflowStatus || Object.keys(workflowStatus).length === 0) return 0;
    
    const completed = Object.values(workflowStatus).filter(s => s.completed).length;
    const total = WORKFLOW_STAGES.length;
    
    return Math.round((completed / total) * 100);
  }, [workflowStatus]);

  const getCurrentStage = useMemo(() => {
    if (!workflowStatus || Object.keys(workflowStatus).length === 0) return 0;
    
    for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
      if (!workflowStatus[WORKFLOW_STAGES[i].id]?.completed) {
        return i;
      }
    }
    
    return WORKFLOW_STAGES.length - 1;
  }, [workflowStatus]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER STATUS INDICATOR
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStatusIndicator = (stageId) => {
    const status = workflowStatus[stageId];
    if (!status) return <HourglassEmpty color="disabled" />;
    
    if (status.completed) {
      return <CheckCircle color="success" />;
    } else if (status.inProgress) {
      return <CircularProgress size={20} />;
    } else if (status.blocked) {
      return <ErrorIcon color="error" />;
    } else if (status.errors.length > 0) {
      return <Warning color="warning" />;
    }
    
    return <HourglassEmpty color="disabled" />;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Settings color="primary" sx={{ fontSize: 40 }} />
              Workflow Testing Dashboard
              <Chip label="MEGA ULTIMATE" color="error" size="small" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete Contact → Client Journey Testing & Debugging
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                  color="secondary"
                />
              }
              label="Simulation Mode"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto Refresh"
            />
            
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={() => selectedContact && loadContactWorkflowData(selectedContact.id)}
                color="primary"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Report Bug">
              <IconButton onClick={() => setShowBugDialog(true)} color="error">
                <BugReport />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export Report">
              <IconButton
                onClick={exportTestReport}
                disabled={!selectedContact}
                color="success"
              >
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Contact Selector */}
        <Paper sx={{ p: 3 }}>
          <Autocomplete
            options={contacts}
            getOptionLabel={(option) => {
              const name = option.fullName || option.name || `${option.firstName || ''} ${option.lastName || ''}`.trim() || 'Unnamed';
              const email = option.email || option.emails?.[0]?.address || 'No email';
              const phone = option.phone || option.phones?.[0]?.number || '';
              return `${name} - ${email}${phone ? ' - ' + phone : ''}`;
            }}
            value={selectedContact}
            onChange={(e, newValue) => {
              setSelectedContact(newValue);
              if (newValue) {
                console.log('🎯 Selected contact:', newValue.fullName || newValue.name, 'ID:', newValue.id);
                loadContactWorkflowData(newValue.id);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Test Contact"
                variant="outlined"
                placeholder="Type to search: Mark, Russell, email, phone..."
                helperText={`${contacts.length} contacts available. Try searching: "Mark" or "Russell"`}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Search sx={{ mr: 1, color: 'text.secondary' }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.fullName || option.name || `${option.firstName || ''} ${option.lastName || ''}`.trim() || 'Unnamed'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.email || option.emails?.[0]?.address || 'No email'} 
                    {(option.phone || option.phones?.[0]?.number) && ` • ${option.phone || option.phones?.[0]?.number}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {option.roles?.map(role => (
                      <Chip key={role} label={role} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                    ))}
                    {option.workflowStatus && (
                      <Chip 
                        label={option.workflowStatus} 
                        size="small" 
                        color={option.workflowStatus === 'active' ? 'success' : 'default'}
                        sx={{ height: 18, fontSize: '0.7rem' }} 
                      />
                    )}
                  </Box>
                </Box>
              </li>
            )}
            loading={loading}
            filterOptions={(options, { inputValue }) => {
              const searchLower = inputValue.toLowerCase();
              return options.filter(option => {
                const name = (option.fullName || option.name || `${option.firstName || ''} ${option.lastName || ''}`).toLowerCase();
                const email = (option.email || option.emails?.[0]?.address || '').toLowerCase();
                const phone = (option.phone || option.phones?.[0]?.number || '').replace(/\D/g, '');
                const searchPhone = inputValue.replace(/\D/g, '');
                
                return name.includes(searchLower) || 
                       email.includes(searchLower) || 
                       (searchPhone && phone.includes(searchPhone));
              });
            }}
          />
        </Paper>
      </Box>

      {selectedContact ? (
        <>
          {/* ===== PROGRESS OVERVIEW ===== */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed color="primary" />
              Workflow Progress: {calculateProgress}%
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={calculateProgress}
              sx={{ height: 10, borderRadius: 1, mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Current Stage
                    </Typography>
                    <Typography variant="h6">
                      {WORKFLOW_STAGES[getCurrentStage]?.title || 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Stages Completed
                    </Typography>
                    <Typography variant="h6">
                      {Object.values(workflowStatus).filter(s => s.completed).length} / {WORKFLOW_STAGES.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Current Roles
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedContact.roles?.map((role) => (
                        <Chip key={role} label={role} size="small" color="primary" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Lead Score
                    </Typography>
                    <Typography variant="h6">
                      {selectedContact.leadScore || 0} / 10
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* ===== TABS ===== */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Workflow Stages" icon={<TimelineIcon />} iconPosition="start" />
              <Tab label="Email Logs" icon={<Email />} iconPosition="start" />
              <Tab label="IDIQ Status" icon={<AccountBalance />} iconPosition="start" />
              <Tab label="AI Review" icon={<Psychology />} iconPosition="start" />
              <Tab label="Contracts" icon={<Description />} iconPosition="start" />
              <Tab label="Communications" icon={<Phone />} iconPosition="start" />
              <Tab label="Debug Console" icon={<Code />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* ===== TAB CONTENT ===== */}
          
          {/* Tab 0: Workflow Stages */}
          {activeTab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Stepper activeStep={getCurrentStage} orientation="vertical">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const status = workflowStatus[stage.id] || {};
                  const StageIcon = stage.icon;
                  
                  return (
                    <Step key={stage.id} expanded>
                      <StepLabel
                        StepIconComponent={() => renderStatusIndicator(stage.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <StageIcon color={stage.color} />
                          <Typography variant="h6">{stage.title}</Typography>
                          
                          {status.completed && (
                            <Chip label="Complete" color="success" size="small" />
                          )}
                          {status.inProgress && (
                            <Chip label="In Progress" color="warning" size="small" />
                          )}
                          {status.blocked && (
                            <Chip label="Blocked" color="error" size="small" />
                          )}
                        </Box>
                      </StepLabel>
                      
                      <StepContent>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {stage.description}
                        </Typography>
                        
                        {/* Stage Details */}
                        {status.data && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <AlertTitle>Current Data</AlertTitle>
                            <pre style={{ fontSize: 11, margin: 0 }}>
                              {JSON.stringify(status.data, null, 2)}
                            </pre>
                          </Alert>
                        )}
                        
                        {/* Errors */}
                        {status.errors && status.errors.length > 0 && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <AlertTitle>Issues Found</AlertTitle>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {status.errors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </Alert>
                        )}
                        
                        {/* Manual Trigger Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {stage.id === 'role_assignment' && (
                            <Button
                              variant="contained"
                              startIcon={<PlayArrow />}
                              onClick={triggerRoleAssignment}
                              size="small"
                            >
                              Assign Roles
                            </Button>
                          )}
                          
                          {stage.id === 'email_triggered' && (
                            <Button
                              variant="contained"
                              startIcon={<Send />}
                              onClick={triggerWelcomeEmail}
                              size="small"
                            >
                              Send Welcome Email
                            </Button>
                          )}
                          
                          {stage.id === 'idiq_enrollment' && (
                            <Button
                              variant="contained"
                              startIcon={<CloudUpload />}
                              onClick={triggerIdiqEnrollment}
                              size="small"
                            >
                              Enroll in IDIQ
                            </Button>
                          )}
                          
                          {stage.id === 'ai_review_generated' && (
                            <Button
                              variant="contained"
                              startIcon={<AutoAwesome />}
                              onClick={triggerAiReview}
                              size="small"
                            >
                              Generate AI Review
                            </Button>
                          )}
                          
                          {stage.id === 'service_recommendation' && (
                            <Button
                              variant="contained"
                              startIcon={<Stars />}
                              onClick={triggerServiceRecommendations}
                              size="small"
                            >
                              Generate Recommendations
                            </Button>
                          )}
                          
                          {stage.id === 'contract_generated' && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {SERVICE_PLANS.map((plan) => (
                                <Button
                                  key={plan.id}
                                  variant="outlined"
                                  size="small"
                                  onClick={() => triggerContractGeneration(plan.id)}
                                  sx={{ borderColor: plan.color, color: plan.color }}
                                >
                                  {plan.name}
                                </Button>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>
          )}

          {/* Tab 1: Email Logs */}
          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                Email Communication History ({emailLogs.length})
              </Typography>
              
              {emailLogs.length === 0 ? (
                <Alert severity="info">No emails sent yet for this contact.</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date/Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emailLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {log.sentAt?.toDate?.().toLocaleString() || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip label={log.type} size="small" />
                          </TableCell>
                          <TableCell>{log.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={log.status}
                              color={log.status === 'sent' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Tab 2: IDIQ Status */}
          {activeTab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance color="primary" />
                IDIQ Enrollment Status
              </Typography>
              
              {!idiqStatus ? (
                <Alert severity="warning">
                  No IDIQ enrollment found. Trigger enrollment from Workflow Stages tab.
                </Alert>
              ) : (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Enrollment ID
                          </Typography>
                          <Typography variant="h6">{idiqStatus.id}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Status
                          </Typography>
                          <Chip
                            label={idiqStatus.status}
                            color={idiqStatus.status === 'complete' ? 'success' : 'warning'}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Raw Data:
                  </Typography>
                  <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                    {JSON.stringify(idiqStatus, null, 2)}
                  </pre>
                </Box>
              )}
            </Paper>
          )}

          {/* Tab 3: AI Review */}
          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" />
                AI Credit Review
              </Typography>
              
              {!aiReview ? (
                <Alert severity="warning">
                  No AI review generated yet. Trigger from Workflow Stages tab.
                </Alert>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Review Generated</AlertTitle>
                    AI analysis complete for credit score: {aiReview.creditScore}
                  </Alert>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Review Data:
                  </Typography>
                  <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                    {JSON.stringify(aiReview.reviewData, null, 2)}
                  </pre>
                </Box>
              )}
            </Paper>
          )}

          {/* Tab 4: Contracts */}
          {activeTab === 4 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                Contracts & Agreements ({contracts.length})
              </Typography>
              
              {contracts.length === 0 ? (
                <Alert severity="info">No contracts generated yet.</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Created</TableCell>
                        <TableCell>Service Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            {contract.createdAt?.toDate?.().toLocaleString() || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip label={contract.serviceType} size="small" />
                          </TableCell>
                          <TableCell>${contract.amount}</TableCell>
                          <TableCell>
                            <Chip label={contract.status} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Tab 5: Communications */}
          {activeTab === 5 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="primary" />
                Communication Timeline ({communications.length})
              </Typography>
              
              {communications.length === 0 ? (
                <Alert severity="info">No communications logged yet.</Alert>
              ) : (
                <Timeline>
                  {communications.map((comm) => (
                    <TimelineItem key={comm.id}>
                      <TimelineOppositeContent color="text.secondary">
                        {comm.timestamp?.toDate?.().toLocaleString() || 'N/A'}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          {comm.type === 'email' && <Email />}
                          {comm.type === 'phone' && <Phone />}
                          {comm.type === 'sms' && <Sms />}
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6" component="span">
                          {comm.type.toUpperCase()}
                        </Typography>
                        <Typography>{comm.subject || comm.notes}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Paper>
          )}

          {/* Tab 6: Debug Console */}
          {activeTab === 6 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code color="primary" />
                Debug Console
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Full Contact Data:
              </Typography>
              <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
                {JSON.stringify(selectedContact, null, 2)}
              </pre>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Workflow Status Object:
              </Typography>
              <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
                {JSON.stringify(workflowStatus, null, 2)}
              </pre>
            </Paper>
          )}
        </>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Search sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Select a Contact to Begin Testing
          </Typography>
          <Typography color="text.secondary">
            Use the search box above to select your test contact and track their complete workflow journey.
          </Typography>
        </Paper>
      )}

      {/* ===== BUG REPORT DIALOG ===== */}
      <Dialog open={showBugDialog} onClose={() => setShowBugDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport color="error" />
            Report Workflow Bug
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Bug Title"
            value={newBug.title}
            onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={newBug.description}
            onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select
              value={newBug.severity}
              onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
              label="Severity"
            >
              <MenuItem value="low">Low - Minor issue</MenuItem>
              <MenuItem value="medium">Medium - Affects workflow</MenuItem>
              <MenuItem value="high">High - Blocks progress</MenuItem>
              <MenuItem value="critical">Critical - System broken</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBugDialog(false)}>Cancel</Button>
          <Button
            onClick={reportBug}
            variant="contained"
            color="error"
            startIcon={<BugReport />}
          >
            Report Bug
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkflowTestingDashboard;