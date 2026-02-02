// ============================================
// AIReportGenerator.jsx - AI CREDIT REVIEW GENERATOR
// ============================================
// Path: src/components/AIReportGenerator.jsx
// TIER 5+ ENTERPRISE - Complete AI Credit Review Workflow
//
// PURPOSE: Automates the promise made on speedycreditrepair.com:
// "You will receive a personalized credit review from one of our
// credit experts via email at no additional cost."
//
// FEATURES:
// - AI-powered credit report analysis using OpenAI
// - Personalized review generation based on credit data
// - Human-in-the-loop approval workflow
// - Email automation integration
// - Comprehensive audit trail
// - Real-time preview and editing
// - Batch processing capabilities
// - Template customization
// - CONTACT SELECTOR for standalone mode
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, CircularProgress,
  Alert, AlertTitle, Chip, Divider, Card, CardContent, CardActions,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel,
  Accordion, AccordionSummary, AccordionDetails, Badge, LinearProgress,
  Snackbar, Skeleton, Avatar, List, ListItem, ListItemText, ListItemIcon,
  ListItemAvatar, ListItemButton,
  Grid, Rating, Stepper, Step, StepLabel, StepContent, Autocomplete,
  InputAdornment
} from '@mui/material';

import {
  Brain, Send, CheckCircle, XCircle, Edit3, RefreshCw, Eye, EyeOff,
  Mail, Clock, AlertTriangle, TrendingUp, TrendingDown, Target,
  FileText, User, Calendar, DollarSign, Shield, Award, Zap,
  ChevronDown, Copy, Download, History, Settings, Play, Pause,
  BarChart2, PieChart, Activity, Sparkles, MessageSquare, Phone,
  CreditCard, Building, Car, Home, AlertCircle, CheckSquare,
  ThumbsUp, ThumbsDown, RotateCcw, Save, Trash2, ExternalLink,
  Search, Users, UserCheck
} from 'lucide-react';

import { db, auth } from '@/lib/firebase';
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const REVIEW_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  READY: 'ready_for_review',
  APPROVED: 'approved',
  SENT: 'sent',
  REJECTED: 'rejected',
  EDITED: 'edited',
  FAILED: 'failed'
};

const SCORE_RANGES = {
  EXCELLENT: { min: 750, max: 850, label: 'Excellent', color: '#10B981', icon: Award },
  GOOD: { min: 700, max: 749, label: 'Good', color: '#22C55E', icon: ThumbsUp },
  FAIR: { min: 650, max: 699, label: 'Fair', color: '#F59E0B', icon: Target },
  POOR: { min: 550, max: 649, label: 'Poor', color: '#F97316', icon: AlertTriangle },
  VERY_POOR: { min: 300, max: 549, label: 'Very Poor', color: '#EF4444', icon: AlertCircle }
};

const EMAIL_TEMPLATES = {
  STANDARD: 'standard',
  URGENT: 'urgent',
  FOLLOW_UP: 'follow_up',
  CONGRATULATORY: 'congratulatory'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getScoreRange = (score) => {
  if (!score) return null;
  const s = parseInt(score, 10);
  if (s >= 750) return SCORE_RANGES.EXCELLENT;
  if (s >= 700) return SCORE_RANGES.GOOD;
  if (s >= 650) return SCORE_RANGES.FAIR;
  if (s >= 550) return SCORE_RANGES.POOR;
  return SCORE_RANGES.VERY_POOR;
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case REVIEW_STATUS.PENDING: return 'default';
    case REVIEW_STATUS.GENERATING: return 'info';
    case REVIEW_STATUS.READY: return 'warning';
    case REVIEW_STATUS.APPROVED: return 'success';
    case REVIEW_STATUS.SENT: return 'success';
    case REVIEW_STATUS.REJECTED: return 'error';
    case REVIEW_STATUS.EDITED: return 'info';
    case REVIEW_STATUS.FAILED: return 'error';
    default: return 'default';
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const AIReportGenerator = ({
  contactId: initialContactId = null,
  creditReportData = null,
  enrollmentData = null,
  onReviewGenerated = null,
  onEmailSent = null,
  mode = 'standalone' // 'standalone' | 'embedded' | 'batch'
}) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // ===== CONTACT SELECTOR STATE (NEW) =====
  const [contactId, setContactId] = useState(initialContactId);
  const [contactsList, setContactsList] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Contact & Report Data
  const [contact, setContact] = useState(null);
  const [reportData, setReportData] = useState(creditReportData);
  const [score, setScore] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [negativeItems, setNegativeItems] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  // AI Review Data
  const [generatedReview, setGeneratedReview] = useState(null);
  const [editedReview, setEditedReview] = useState('');
  const [reviewSubject, setReviewSubject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES.STANDARD);
  
  // Review Queue (for batch mode)
  const [reviewQueue, setReviewQueue] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);
  
  // History & Analytics
  const [reviewHistory, setReviewHistory] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalGenerated: 0,
    totalSent: 0,
    totalApproved: 0,
    totalRejected: 0,
    avgGenerationTime: 0,
    conversionRate: 0
  });
  
  // Settings
  const [settings, setSettings] = useState({
    autoApprove: false,
    includeServiceRecommendation: true,
    includeScoreFactors: true,
    includeActionItems: true,
    signatureName: 'Chris Lahage',
    signatureTitle: 'Credit Expert',
    replyToEmail: 'chris@speedycreditrepair.com'
  });
  
  // Dialogs
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [confirmSendDialogOpen, setConfirmSendDialogOpen] = useState(false);

  // ============================================
  // FIREBASE FUNCTIONS REFERENCE
  // ============================================
  
  const functions = getFunctions();
  const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
  const emailService = httpsCallable(functions, 'emailService');

  // ============================================
  // DATA LOADING
  // ============================================
  
  // Load contacts with credit reports on mount (for standalone mode)
  useEffect(() => {
    if (mode === 'standalone' && !initialContactId) {
      loadContactsWithReports();
    }
  }, [mode]);
  
  useEffect(() => {
    if (contactId) {
      loadContactData();
    }
    loadReviewHistory();
    loadAnalytics();
  }, [contactId]);
  
  useEffect(() => {
    if (creditReportData) {
      parseReportData(creditReportData);
    }
  }, [creditReportData]);

  // ============================================
  // LOAD CONTACTS WITH CREDIT REPORTS (NEW)
  // ============================================
  
  const loadContactsWithReports = async () => {
    setContactsLoading(true);
    try {
      console.log('📋 Loading contacts with credit reports...');
      
      // Query contacts that have IDIQ enrollment data
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('idiqEnrollment.status', 'in', ['completed', 'active', 'enrolled']),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(contactsQuery);
      const contacts = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        contacts.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          score: data.idiqEnrollment?.vantageScore || data.idiqEnrollment?.creditScore || data.creditScore || null,
          hasReport: !!data.idiqEnrollment?.memberToken || !!data.idiqEnrollment?.vantageScore,
          enrollmentDate: data.idiqEnrollment?.enrolledAt || data.idiqEnrollment?.createdAt,
          ...data
        });
      });
      
      console.log(`✅ Loaded ${contacts.length} contacts with credit reports`);
      setContactsList(contacts);
      
      // If no contacts found with enrollment status, try broader query
      if (contacts.length === 0) {
        console.log('📋 No enrolled contacts found, trying broader search...');
        const broaderQuery = query(
          collection(db, 'contacts'),
          orderBy('updatedAt', 'desc'),
          limit(50)
        );
        
        const broaderSnapshot = await getDocs(broaderQuery);
        const broaderContacts = [];
        
        broaderSnapshot.forEach(doc => {
          const data = doc.data();
          // Only include if they have some credit-related data
          if (data.idiqEnrollment || data.creditScore || data.vantageScore) {
            broaderContacts.push({
              id: doc.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || '',
              score: data.idiqEnrollment?.vantageScore || data.creditScore || data.vantageScore || null,
              hasReport: !!(data.idiqEnrollment || data.creditScore),
              ...data
            });
          }
        });
        
        console.log(`✅ Loaded ${broaderContacts.length} contacts from broader search`);
        setContactsList(broaderContacts);
      }
      
    } catch (err) {
      console.error('❌ Error loading contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setContactsLoading(false);
    }
  };

  const loadContactData = async () => {
    if (!contactId) return;
    
    setLoading(true);
    try {
      const contactDoc = await getDoc(doc(db, 'contacts', contactId));
      if (contactDoc.exists()) {
        const contactData = { id: contactDoc.id, ...contactDoc.data() };
        setContact(contactData);
        
        // Extract score from IDIQ enrollment data
        const contactScore = 
  contactData.idiqEnrollment?.vantageScore ||
  contactData.idiqEnrollment?.creditScore ||
  contactData.creditScore ||
  contactData.vantageScore ||
  null;
        
        if (contactScore) {
          setScore(contactScore);
        }
        
        // ===== CRITICAL FIX: Extract account counts from IDIQ enrollment data =====
        // This ensures the card shows correct counts even when creditReports collection is empty
        const accountCount = contactData.idiqEnrollment?.accountCount || 0;
        const negativeCount = contactData.idiqEnrollment?.negativeItemCount || 0;
        const inquiryCount = contactData.idiqEnrollment?.inquiryCount || 0;
        
        console.log('📊 IDIQ Enrollment counts:', { accountCount, negativeCount, inquiryCount });
        
        // Set placeholder arrays based on counts (for .length to work in UI and AI generation)
        if (accountCount > 0) {
          setAccounts(Array(accountCount).fill({ placeholder: true }));
        }
        if (negativeCount > 0) {
          setNegativeItems(Array(negativeCount).fill({ placeholder: true }));
        }
        if (inquiryCount > 0) {
          setInquiries(Array(inquiryCount).fill({ placeholder: true }));
        }
        
        // Load latest credit report if not provided (may override above counts with actual data)
        if (!creditReportData) {
          const reportsQuery = query(
            collection(db, 'creditReports'),
            where('contactId', '==', contactId),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const reportsSnapshot = await getDocs(reportsQuery);
          if (!reportsSnapshot.empty) {
            const reportDoc = reportsSnapshot.docs[0];
            setReportData({ id: reportDoc.id, ...reportDoc.data() });
            parseReportData(reportDoc.data());
          }
        }
      }
    } catch (err) {
      console.error('Error loading contact:', err);
      setError('Failed to load contact data');
    } finally {
      setLoading(false);
    }
  };

  const parseReportData = (data) => {
    if (!data) return;
    
    console.log('📊 Parsing credit report data...');
    
    // Extract score
    const extractedScore = 
      data.vantageScore ||
      data.score ||
      data.data?.vantageScore ||
      data.reportData?.vantageScore ||
      data.BundleComponents?.BundleComponent?.CreditScoreType?.['@riskScore'];
    
    if (extractedScore) {
      setScore(extractedScore);
    }
    console.log('📈 Score extracted:', extractedScore);
    
    // Extract accounts
    const extractedAccounts = 
      data.accounts ||
      data.data?.accounts ||
      data.reportData?.accounts ||
      [];
    setAccounts(extractedAccounts);
    console.log('📋 Accounts extracted:', extractedAccounts.length);
    
    // Extract negative items (accounts with negative payment status)
    const negItems = extractedAccounts.filter(acc => 
      acc.paymentStatus?.toLowerCase().includes('late') ||
      acc.paymentStatus?.toLowerCase().includes('delinquent') ||
      acc.paymentStatus?.toLowerCase().includes('collection') ||
      acc.accountStatus?.toLowerCase().includes('charged') ||
      acc.accountStatus?.toLowerCase().includes('collection')
    );
    setNegativeItems(negItems);
    console.log('⚠️ Negative items found:', negItems.length);
    
    // Extract inquiries from TrueLinkCreditReportType if available
    const trueLinkData = 
      data.BundleComponents?.BundleComponent?.TrueLinkCreditReportType ||
      data.data?.BundleComponents?.BundleComponent?.TrueLinkCreditReportType ||
      data.reportData?.BundleComponents?.BundleComponent?.TrueLinkCreditReportType;
    
    if (trueLinkData?.InquiryPartition) {
      const inquiryPartition = trueLinkData.InquiryPartition;
      const allInquiries = [];
      
      if (Array.isArray(inquiryPartition)) {
        inquiryPartition.forEach(partition => {
          const inqs = partition.Inquiry || [];
          allInquiries.push(...(Array.isArray(inqs) ? inqs : [inqs]));
        });
      } else if (inquiryPartition.Inquiry) {
        const inqs = inquiryPartition.Inquiry;
        allInquiries.push(...(Array.isArray(inqs) ? inqs : [inqs]));
      }
      
      setInquiries(allInquiries);
      console.log('🔍 Inquiries found:', allInquiries.length);
    }
  };

  const loadReviewHistory = async () => {
    try {
      const historyQuery = query(
        collection(db, 'aiCreditReviews'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(historyQuery);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReviewHistory(history);
    } catch (err) {
      console.error('Error loading review history:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get analytics from reviews collection
      const reviewsQuery = query(
        collection(db, 'aiCreditReviews'),
        where('createdAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => doc.data());
      
      const stats = {
        totalGenerated: reviews.length,
        totalSent: reviews.filter(r => r.status === REVIEW_STATUS.SENT).length,
        totalApproved: reviews.filter(r => r.status === REVIEW_STATUS.APPROVED || r.status === REVIEW_STATUS.SENT).length,
        totalRejected: reviews.filter(r => r.status === REVIEW_STATUS.REJECTED).length,
        avgGenerationTime: 0,
        conversionRate: 0
      };
      
      // Calculate conversion rate (sent / generated)
      if (stats.totalGenerated > 0) {
        stats.conversionRate = Math.round((stats.totalSent / stats.totalGenerated) * 100);
      }
      
      setAnalytics(stats);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  // ============================================
  // CONTACT SELECTION HANDLER (NEW)
  // ============================================
  
  const handleContactSelect = (selectedContact) => {
    if (selectedContact) {
      console.log('📋 Contact selected:', selectedContact.id, selectedContact.firstName, selectedContact.lastName);
      setContactId(selectedContact.id);
      setContact(selectedContact);
      
      // ===== CRITICAL: Reset ALL credit data when switching contacts =====
      setScore(selectedContact.score || null);
      setAccounts([]);
      setNegativeItems([]);
      setInquiries([]);
      setReportData(null);
      
      // Reset generated review when switching contacts
      setGeneratedReview(null);
      setEditedReview('');
      setReviewSubject('');
    }
  };

  // Filter contacts based on search term
  const filteredContacts = contactsList.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(search) ||
      c.lastName?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search)
    );
  });

  // ============================================
  // AI REVIEW GENERATION
  // ============================================
  
  const generateReview = async () => {
    if (!contact && !contactId) {
      setError('Please select a contact first');
      return;
    }
    
    if (!score) {
      setError('No credit score available for this contact. Please ensure they have a credit report.');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      console.log('🤖 Starting AI credit review generation...');
      
      // Build the analysis prompt
      const analysisPrompt = buildAnalysisPrompt();
      
      // Call AI Content Generator Firebase Function
      const response = await aiContentGenerator({
        type: 'generateCreditReview',
        params: {
          contactId: contactId || contact?.id,
          firstName: contact?.firstName || enrollmentData?.firstName,
          lastName: contact?.lastName || enrollmentData?.lastName,
          email: contact?.email || enrollmentData?.email,
          score: score,
          scoreRange: getScoreRange(score)?.label || 'Unknown',
          accountCount: accounts.length,
          negativeItemCount: negativeItems.length,
          inquiryCount: inquiries.length,
          negativeItems: negativeItems.slice(0, 10), // Limit to top 10
          inquiries: inquiries.slice(0, 5), // Limit to top 5
          settings: settings,
          prompt: analysisPrompt
        }
      });
      
      const generationTime = Date.now() - startTime;
      console.log(`✅ AI review generated in ${generationTime}ms`);
      
      if (response.data?.success) {
        const review = response.data.review;
        
        setGeneratedReview(review);
        setEditedReview(review.body || review.content);
        setReviewSubject(review.subject || `Your Personalized Credit Review - ${contact?.firstName || 'Valued Customer'}`);
        
        // Save to Firestore
        const reviewDoc = await addDoc(collection(db, 'aiCreditReviews'), {
          contactId: contactId || contact?.id,
          contactName: `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim(),
          contactEmail: contact?.email || enrollmentData?.email,
          score: score,
          accountCount: accounts.length,
          negativeItemCount: negativeItems.length,
          inquiryCount: inquiries.length,
          subject: review.subject,
          body: review.body || review.content,
          status: settings.autoApprove ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.READY,
          generationTimeMs: generationTime,
          template: selectedTemplate,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid || 'system',
          settings: settings
        });
        
        console.log('📝 Review saved to Firestore:', reviewDoc.id);
        
        // Callback if provided
        if (onReviewGenerated) {
          onReviewGenerated({
            reviewId: reviewDoc.id,
            review: review,
            generationTime
          });
        }
        
        setSuccess('Credit review generated successfully!');
        
        // Auto-approve if setting enabled
        if (settings.autoApprove) {
          await approveReview(reviewDoc.id);
        }
        
      } else {
        throw new Error(response.data?.error || 'Failed to generate review');
      }
      
    } catch (err) {
      console.error('❌ Error generating review:', err);
      setError(`Failed to generate review: ${err.message}`);
      
      // Save failed attempt
      await addDoc(collection(db, 'aiCreditReviews'), {
        contactId: contactId || contact?.id,
        contactEmail: contact?.email || enrollmentData?.email,
        score: score,
        status: REVIEW_STATUS.FAILED,
        error: err.message,
        createdAt: serverTimestamp()
      });
      
    } finally {
      setGenerating(false);
    }
  };

  const buildAnalysisPrompt = () => {
    const firstName = contact?.firstName || enrollmentData?.firstName || 'Valued Customer';
    const scoreInfo = getScoreRange(score);
    
    let prompt = `
Generate a personalized credit review email for ${firstName}.

CREDIT PROFILE:
- VantageScore 3.0: ${score} (${scoreInfo?.label || 'Unknown'})
- Total Accounts: ${accounts.length}
- Negative Items: ${negativeItems.length}
- Hard Inquiries: ${inquiries.length}

${negativeItems.length > 0 ? `
NEGATIVE ITEMS TO ADDRESS:
${negativeItems.slice(0, 5).map((item, i) => 
  `${i + 1}. ${item.creditorName || 'Unknown'} - ${item.accountType || 'Account'} - Status: ${item.paymentStatus || item.accountStatus || 'Unknown'}`
).join('\n')}
` : ''}

${inquiries.length > 2 ? `
NOTE: Customer has ${inquiries.length} hard inquiries which may be impacting their score.
` : ''}

REQUIREMENTS:
1. Be encouraging and professional
2. Explain the score in plain language
3. ${settings.includeScoreFactors ? 'Include the main factors affecting their score' : ''}
4. ${settings.includeActionItems ? 'Provide 3-5 specific action items they can take' : ''}
5. ${settings.includeServiceRecommendation ? 'Include a soft recommendation for credit repair services if score is below 700' : ''}
6. End with a call to action to contact us at (888) 724-7344

TONE: Warm, professional, helpful - as if coming from a personal credit coach
LENGTH: 400-600 words
FORMAT: Plain text email body (no HTML)

SIGNATURE:
${settings.signatureName}
${settings.signatureTitle}
Speedy Credit Repair Inc.
(888) 724-7344
chris@speedycreditrepair.com
`;
    
    return prompt;
  };

  // ============================================
  // REVIEW ACTIONS
  // ============================================
  
  const approveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'aiCreditReviews', reviewId), {
        status: REVIEW_STATUS.APPROVED,
        approvedAt: serverTimestamp(),
        approvedBy: auth.currentUser?.uid || 'system'
      });
      
      setSuccess('Review approved!');
      loadReviewHistory();
      
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    }
  };

  const rejectReview = async (reviewId, reason = '') => {
    try {
      await updateDoc(doc(db, 'aiCreditReviews', reviewId), {
        status: REVIEW_STATUS.REJECTED,
        rejectedAt: serverTimestamp(),
        rejectedBy: auth.currentUser?.uid || 'system',
        rejectionReason: reason
      });
      
      setSuccess('Review rejected');
      loadReviewHistory();
      
    } catch (err) {
      console.error('Error rejecting review:', err);
      setError('Failed to reject review');
    }
  };

  const saveEditedReview = async () => {
    if (!generatedReview) return;
    
    try {
      // Find the review document to update
      const reviewsQuery = query(
        collection(db, 'aiCreditReviews'),
        where('contactId', '==', contactId || contact?.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(reviewsQuery);
      if (!snapshot.empty) {
        const reviewDoc = snapshot.docs[0];
        
        await updateDoc(doc(db, 'aiCreditReviews', reviewDoc.id), {
          body: editedReview,
          subject: reviewSubject,
          status: REVIEW_STATUS.EDITED,
          editedAt: serverTimestamp(),
          editedBy: auth.currentUser?.uid || 'system',
          originalBody: generatedReview.body || generatedReview.content
        });
        
        setGeneratedReview({
          ...generatedReview,
          body: editedReview,
          subject: reviewSubject
        });
        
        setIsEditing(false);
        setSuccess('Changes saved!');
      }
      
    } catch (err) {
      console.error('Error saving edited review:', err);
      setError('Failed to save changes');
    }
  };

  // ============================================
  // EMAIL SENDING
  // ============================================
  
  const sendReviewEmail = async () => {
    if (!editedReview || !contact?.email) {
      setError('Missing review content or recipient email');
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      console.log('📧 Sending credit review email...');
      
      const response = await emailService({
        action: 'send',
        to: contact.email,
        subject: reviewSubject,
        body: editedReview,
        recipientName: contact.firstName || '',
        contactId: contactId || contact?.id,
        templateType: 'ai_credit_review'
      });
      
      if (response.data?.success) {
        // Update review status
        const reviewsQuery = query(
          collection(db, 'aiCreditReviews'),
          where('contactId', '==', contactId || contact?.id),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const snapshot = await getDocs(reviewsQuery);
        if (!snapshot.empty) {
          await updateDoc(doc(db, 'aiCreditReviews', snapshot.docs[0].id), {
            status: REVIEW_STATUS.SENT,
            sentAt: serverTimestamp(),
            sentTo: contact.email,
            sentBy: auth.currentUser?.uid || 'system'
          });
        }
        
        // Update contact record
        if (contactId || contact?.id) {
          await updateDoc(doc(db, 'contacts', contactId || contact.id), {
            'aiReview.sent': true,
            'aiReview.sentAt': serverTimestamp(),
            'aiReview.score': score
          });
        }
        
        setSuccess(`Credit review sent to ${contact.email}!`);
        setConfirmSendDialogOpen(false);
        
        // Callback if provided
        if (onEmailSent) {
          onEmailSent({
            email: contact.email,
            subject: reviewSubject
          });
        }
        
        loadReviewHistory();
        loadAnalytics();
        
      } else {
        throw new Error(response.data?.error || 'Failed to send email');
      }
      
    } catch (err) {
      console.error('❌ Error sending email:', err);
      setError(`Failed to send email: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // RENDER - CONTACT SELECTOR (NEW)
  // ============================================
  
  const renderContactSelector = () => (
    <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: contact ? 'success.main' : 'primary.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Users size={24} />
        <Typography variant="h6" fontWeight={600}>
          Select Contact
        </Typography>
        {contact && (
          <Chip 
            label="Contact Selected" 
            color="success" 
            size="small"
            icon={<UserCheck size={14} />}
          />
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose a contact with a credit report to generate their personalized AI review.
      </Typography>
      
      {/* Search Field */}
      <TextField
        fullWidth
        placeholder="Search contacts by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          )
        }}
      />
      
      {/* Contacts List */}
      {contactsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredContacts.length === 0 ? (
        <Alert severity="info">
          No contacts with credit reports found. Pull a credit report in the Credit Reports Hub first.
        </Alert>
      ) : (
        <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <List dense>
            {filteredContacts.map((c) => (
              <ListItemButton
                key={c.id}
                selected={contactId === c.id}
                onClick={() => handleContactSelect(c)}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'success.light',
                    '&:hover': { bgcolor: 'success.light' }
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: c.score ? getScoreRange(c.score)?.color : 'grey.400' }}>
                    {c.firstName?.[0] || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {c.firstName} {c.lastName}
                      </Typography>
                      {c.score && (
                        <Chip 
                          label={c.score} 
                          size="small"
                          sx={{ 
                            bgcolor: getScoreRange(c.score)?.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={c.email}
                />
                {contactId === c.id && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
      
      {/* Refresh Button */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshCw size={16} />}
          onClick={loadContactsWithReports}
          disabled={contactsLoading}
        >
          Refresh List
        </Button>
      </Box>
    </Paper>
  );

  // ============================================
  // RENDER - TAB PANELS
  // ============================================
  
  const renderGeneratorTab = () => (
    <Box>
      {/* ===== CONTACT SELECTOR (Show in standalone mode without initial contact) ===== */}
      {mode === 'standalone' && !initialContactId && renderContactSelector()}
      
      {/* ===== CONTACT & SCORE SUMMARY ===== */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Contact Info Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <User size={28} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {contact?.firstName || enrollmentData?.firstName || 'Select a Contact'}{' '}
                    {contact?.lastName || enrollmentData?.lastName || ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact?.email || enrollmentData?.email || 'No contact selected'}
                  </Typography>
                </Box>
              </Box>
              
              {contact?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Phone size={16} />
                  <Typography variant="body2">{contact.phone}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Score Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            background: score ? `linear-gradient(135deg, ${getScoreRange(score)?.color}20, ${getScoreRange(score)?.color}10)` : undefined,
            border: score ? `2px solid ${getScoreRange(score)?.color}40` : undefined
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary">
                VantageScore 3.0
              </Typography>
              
              {score ? (
                <>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: getScoreRange(score)?.color,
                      my: 1
                    }}
                  >
                    {score}
                  </Typography>
                  <Chip 
                    label={getScoreRange(score)?.label}
                    sx={{ 
                      bgcolor: getScoreRange(score)?.color,
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </>
              ) : (
                <Box sx={{ py: 2 }}>
                  <AlertCircle size={48} style={{ opacity: 0.3 }} />
                  <Typography color="text.secondary">No score available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Stats Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Credit Profile Summary
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Accounts</Typography>
                  <Typography variant="body2" fontWeight={600}>{accounts.length}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Negative Items</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={negativeItems.length > 0 ? 'error.main' : 'success.main'}
                  >
                    {negativeItems.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Hard Inquiries</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={inquiries.length > 3 ? 'warning.main' : 'text.primary'}
                  >
                    {inquiries.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* ===== GENERATION CONTROLS ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Brain size={24} />
            <Typography variant="h6" fontWeight={600}>
              AI Credit Review Generator
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Template</InputLabel>
              <Select
                value={selectedTemplate}
                label="Template"
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <MenuItem value={EMAIL_TEMPLATES.STANDARD}>Standard Review</MenuItem>
                <MenuItem value={EMAIL_TEMPLATES.URGENT}>Urgent Action</MenuItem>
                <MenuItem value={EMAIL_TEMPLATES.FOLLOW_UP}>Follow Up</MenuItem>
                <MenuItem value={EMAIL_TEMPLATES.CONGRATULATORY}>Congratulatory</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsDialogOpen(true)}>
                <Settings size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Generation Options */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.includeScoreFactors}
                onChange={(e) => setSettings({ ...settings, includeScoreFactors: e.target.checked })}
              />
            }
            label="Include Score Factors"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.includeActionItems}
                onChange={(e) => setSettings({ ...settings, includeActionItems: e.target.checked })}
              />
            }
            label="Include Action Items"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.includeServiceRecommendation}
                onChange={(e) => setSettings({ ...settings, includeServiceRecommendation: e.target.checked })}
              />
            }
            label="Service Recommendation"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoApprove}
                onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
              />
            }
            label="Auto-Approve"
          />
        </Box>
        
        {/* Generate Button */}
        <Button
          variant="contained"
          size="large"
          onClick={generateReview}
          disabled={generating || !contact}
          startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Sparkles />}
          sx={{ 
            py: 1.5, 
            px: 4,
            background: contact ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : undefined,
            '&:hover': {
              background: contact ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : undefined
            }
          }}
        >
          {generating ? 'Generating Review...' : contact ? 'Generate AI Credit Review' : 'Select a Contact First'}
        </Button>
        
        {generating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              AI is analyzing the credit report and generating personalized recommendations...
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* ===== GENERATED REVIEW DISPLAY ===== */}
      {generatedReview && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Mail size={24} />
              <Typography variant="h6" fontWeight={600}>
                Generated Credit Review
              </Typography>
              <Chip 
                label={isEditing ? 'Editing' : 'Ready'} 
                color={isEditing ? 'info' : 'success'} 
                size="small" 
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Preview">
                <IconButton onClick={() => setPreviewDialogOpen(true)}>
                  <Eye size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title={isEditing ? 'Cancel Edit' : 'Edit Review'}>
                <IconButton onClick={() => setIsEditing(!isEditing)}>
                  <Edit3 size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Regenerate">
                <IconButton onClick={generateReview} disabled={generating}>
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy to Clipboard">
                <IconButton onClick={() => {
                  navigator.clipboard.writeText(editedReview);
                  setSuccess('Copied to clipboard!');
                }}>
                  <Copy size={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Subject Line */}
          <TextField
            fullWidth
            label="Email Subject"
            value={reviewSubject}
            onChange={(e) => setReviewSubject(e.target.value)}
            disabled={!isEditing}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Mail size={18} style={{ marginRight: 8, opacity: 0.5 }} />
            }}
          />
          
          {/* Review Body */}
          <TextField
            fullWidth
            multiline
            rows={isEditing ? 15 : 10}
            label="Email Body"
            value={editedReview}
            onChange={(e) => setEditedReview(e.target.value)}
            disabled={!isEditing}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }
            }}
          />
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedReview(generatedReview.body || generatedReview.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save size={18} />}
                  onClick={saveEditedReview}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<XCircle size={18} />}
                  onClick={() => rejectReview()}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Send size={18} />}
                  onClick={() => setConfirmSendDialogOpen(true)}
                  disabled={!contact?.email}
                >
                  Send to {contact?.firstName || 'Contact'}
                </Button>
              </>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );

  const renderQueueTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Clock size={20} />
        Pending Reviews Queue
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Reviews pending human approval before sending. Auto-approve can be enabled in settings.
      </Alert>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviewHistory
              .filter(r => r.status === REVIEW_STATUS.READY || r.status === REVIEW_STATUS.EDITED)
              .map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {review.contactName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.contactEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={review.score || 'N/A'} 
                      size="small"
                      sx={{ 
                        bgcolor: getScoreRange(review.score)?.color || '#gray',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={review.status} 
                      color={getStatusColor(review.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Preview">
                        <IconButton size="small">
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve & Send">
                        <IconButton size="small" color="success">
                          <CheckCircle size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton size="small" color="error">
                          <XCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            
            {reviewHistory.filter(r => r.status === REVIEW_STATUS.READY || r.status === REVIEW_STATUS.EDITED).length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckSquare size={48} style={{ opacity: 0.3 }} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      No pending reviews
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderHistoryTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History size={20} />
          Review History
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download size={16} />}
        >
          Export
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Sent</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviewHistory.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {review.contactName || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.contactEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={review.score || 'N/A'} 
                    size="small"
                    sx={{ 
                      bgcolor: getScoreRange(review.score)?.color || 'gray',
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={review.status} 
                    color={getStatusColor(review.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDate(review.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {review.sentAt ? formatDate(review.sentAt) : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <Eye size={16} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            
            {reviewHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <History size={48} style={{ opacity: 0.3 }} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      No review history yet
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BarChart2 size={20} />
        Review Analytics (Last 30 Days)
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" fontWeight={700}>
                {analytics.totalGenerated}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reviews Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                {analytics.totalSent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Emails Sent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main" fontWeight={700}>
                {analytics.totalApproved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {analytics.conversionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Alert severity="info">
        AI Credit Reviews help convert free credit report users into paying clients by providing
        personalized, professional analysis that demonstrates your expertise.
      </Alert>
    </Box>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  
  if (loading && !contactsList.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: mode === 'embedded' ? 0 : 3 }}>
      {/* ===== HEADER ===== */}
      {mode !== 'embedded' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Brain size={32} />
            AI Credit Review Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate personalized credit reviews using AI analysis. Fulfill the promise of a 
            "free personalized credit review from one of our credit experts."
          </Typography>
        </Box>
      )}
      
      {/* ===== ALERTS ===== */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* ===== TABS ===== */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="Generate Review" 
            icon={<Sparkles size={18} />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={reviewHistory.filter(r => r.status === REVIEW_STATUS.READY).length} color="warning">
                Pending Queue
              </Badge>
            } 
            icon={<Clock size={18} />} 
            iconPosition="start"
          />
          <Tab 
            label="History" 
            icon={<History size={18} />} 
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<BarChart2 size={18} />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* ===== TAB CONTENT ===== */}
      {activeTab === 0 && renderGeneratorTab()}
      {activeTab === 1 && renderQueueTab()}
      {activeTab === 2 && renderHistoryTab()}
      {activeTab === 3 && renderAnalyticsTab()}
      
      {/* ===== DIALOGS ===== */}
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Eye size={20} />
          Email Preview
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              To: {contact?.email || 'recipient@email.com'}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Subject: {reviewSubject}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography 
              component="pre" 
              sx={{ 
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem',
                lineHeight: 1.7
              }}
            >
              {editedReview}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Send Dialog */}
      <Dialog
        open={confirmSendDialogOpen}
        onClose={() => setConfirmSendDialogOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send size={20} />
          Confirm Send
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send this credit review to{' '}
            <strong>{contact?.email}</strong>?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            This email will be sent from {settings.replyToEmail} and signed by {settings.signatureName}.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSendDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
            onClick={sendReviewEmail}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings size={20} />
          Review Generator Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Signature Name"
              value={settings.signatureName}
              onChange={(e) => setSettings({ ...settings, signatureName: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Signature Title"
              value={settings.signatureTitle}
              onChange={(e) => setSettings({ ...settings, signatureTitle: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Reply-To Email"
              value={settings.replyToEmail}
              onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoApprove}
                  onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                />
              }
              label="Auto-approve generated reviews (skip human review)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIReportGenerator;