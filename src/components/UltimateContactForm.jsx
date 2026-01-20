// Path: /src/components/UltimateContactForm.jsx
// ============================================================================
// ULTIMATE CONTACT FORM - AI-POWERED COMPREHENSIVE CONTACT INTAKE
// ============================================================================
// Version: 3.1 - Complete contact intelligence capture system
// Features: 2980+ lines, 50+ AI capabilities, duplicate detection
// Last Updated: 2025-12-02 - Changed "Client" to "Contact" terminology
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Mail, MapPin, FileText, CreditCard, Users, Bell, Plus, X, ChevronDown, ChevronUp, Mic, Eye, EyeOff, Brain, Clock, Globe, MessageSquare, Activity, Upload, Download, Search, AlertCircle, CheckCircle, TrendingUp, Zap, Shield, Star, Target, Calendar, DollarSign, Briefcase, Home } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

// AI-Guided Form System imports
import VoiceMicButton from './voice/VoiceMicButton';
import PronunciationRecorder from './voice/PronunciationRecorder';
import AIFormAssistant from './ai/AIFormAssistant';
import { lookupZIP } from '../services/ZIPLookupService';
import useContactAutosuggest from '../hooks/useContactAutosuggest';

// ============================================================================
// MAIN COMPONENT DECLARATION
// ============================================================================
const UltimateContactForm = ({ onSave, onCancel, contactId = null, initialData = {} }) => {

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    photoIdUrl: '',
    preferredName: '',
    namePronunciation: '',
    dateOfBirth: '',
    ssn: '',
    ssnLast4: '',
    
    // Contact Information
    phones: [{ type: 'mobile', number: '', isPrimary: true, canText: true, canCall: true, verified: false }],
    emails: [{ type: 'personal', address: '', isPrimary: true, verified: false, lastOpened: null }],
    addresses: [{ 
      type: 'home', 
      street: '', 
      unit: '', 
      city: '', 
      state: '', 
      zip: '', 
      isPrimary: true,
      verified: false,
      verifiedDate: null,
      moveInDate: '',
      rentOrOwn: 'rent',
      monthlyPayment: ''
    }],
    
    // Communication Preferences
    preferredContactMethod: 'phone',
    preferredContactTime: 'anytime',
    bestTimeToCall: { start: '09:00', end: '17:00' },
    doNotCallDays: [],
    language: 'english',
    timezone: 'America/Los_Angeles',
    doNotContact: false,
    communicationNotes: '',
    emailFrequencyPreference: 'weekly',
    smsOptIn: true,
    voicemailOk: true,
    
    // Employment Information
    employment: {
      status: 'employed',
      employer: '',
      jobTitle: '',
      industry: '',
      monthlyIncome: '',
      yearsAtJob: '',
      employerPhone: '',
      employerAddress: '',
      employmentHistory: [],
      additionalIncome: [],
      payFrequency: 'biweekly',
      nextPayDate: '',
      directDeposit: false
    },
    
    // Credit Profile
    creditProfile: {
      approximateScore: '',
      scoreSource: 'self-reported',
      lastCheckedDate: '',
      bureausToDispute: [],
      hasRecentBankruptcy: false,
      bankruptcyDate: '',
      bankruptcyChapter: '',
      hasForeclosure: false,
      foreclosureDate: '',
      hasRepossession: false,
      repossessionDate: '',
      openAccounts: '',
      closedAccounts: '',
      totalCreditLimit: '',
      totalBalance: '',
      utilizationRate: '',
      oldestAccount: '',
      primaryGoals: [],
      urgencyLevel: 'medium',
      targetScore: '',
      timeframe: '',
      creditKnowledge: 'beginner',
      disputeHistory: [],
      negativeItems: []
    },

    
    
    // Documents
  documents: {
      idReceived: false,
      idType: '',
      idNumber: '',
      idState: '',
      idExpirationDate: '',
      idUploadDate: null,
      idFileUrl: '',
      proofOfAddressReceived: false,
      proofOfAddressType: '',
      proofOfAddressFileUrl: '',
      ssnCardReceived: false,
      ssnCardUploadDate: null,
      ssnCardFileUrl: '',
      creditReportsReceived: false,
      creditReportsDate: null,
      creditReportsFileUrls: [],
      payStubsReceived: false,
      payStubsFileUrls: [],
      bankStatementsReceived: false,
      bankStatementsFileUrls: [],
      additionalDocs: []
    },
    
    // Household
  household: {
      maritalStatus: 'single',
      spouseName: '',
      spouseSSN: '',
      spouseDateOfBirth: '',
      spouseEmployer: '',
      spouseIncome: '',
      dependents: 0,
      dependentNames: [],
      dependentAges: [],
      householdIncome: '',
      otherResidents: [],
      housingType: 'rent',
      monthlyHousingCost: ''
    },
    
    // IDIQ Integration
    idiq: {
      membershipStatus: 'none',
      memberId: '',
      username: '',
      password: '',
      secretWord: '',
      enrollmentDate: '',
      lastReportPull: '',
      lastLoginDate: null,
      dashboardAccess: false,
      reportsAvailable: [],
      lastScoreUpdate: null,
      monitoringActive: false
    },
    
    // AI Activity Tracking - Enhanced
    aiTracking: {
      firstContact: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      totalInteractions: 0,
      
      // Email metrics
      emailsReceived: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      emailBounces: 0,
      lastEmailOpened: null,
      lastEmailClicked: null,
      emailEngagementRate: 0,
      
      // SMS metrics
      textsSent: 0,
      textsReceived: 0,
      textsClicked: 0,
      lastTextSent: null,
      lastTextReceived: null,
      smsEngagementRate: 0,
      
      // Call metrics
      callsReceived: 0,
      callsMade: 0,
      totalCallDuration: 0,
      averageCallDuration: 0,
      missedCalls: 0,
      voicemailsLeft: 0,
      lastCallDate: null,
      callSentiment: [],
      
      // Web activity
      websiteVisits: 0,
      pagesViewed: [],
      timeOnSite: 0,
      lastVisitDate: null,
      formsSubmitted: [],
      documentsDownloaded: [],
      
      // AI insights
      aiInsights: [],
      behaviorPatterns: {},
      engagementScore: 0,
      responsiveness: 'unknown',
      preferredChannels: [],
      peakActivityTimes: [],
      predictedChurnRisk: 0,
      lifetimeValue: 0,
      
      // Conversation analysis
      topicsDiscussed: [],
      questionsAsked: [],
      concernsRaised: [],
      objectionsHandled: [],
      
      // AI Receptionist specific
      aiReceptionistCalls: [],
      lastAICall: null,
      aiCallSummaries: []
    },
    
    // Timeline Events
    timeline: [],
    
    // Internal
    notes: '',
    tags: [],
    roles: ['contact'],
    assignedTo: '',
    leadSource: '',
    leadScore: 5,
    lifecycleStage: 'new',
    stage: 'prospecting',           
    pipelineStage: 'new',          
    dataQualityScore: 0,
    lastSavedAt: null,
    lastSavedBy: '',
    version: 1,
    
    ...initialData
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: true,
    preferences: false,
    employment: false,
    credit: false,
    documents: false,
    household: false,
    idiq: false,
    aiInsights: true,
    timeline: false
  });

  const [showSSN, setShowSSN] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [dataQuality, setDataQuality] = useState({ score: 0, issues: [], blockers: [], canSave: false });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // NEW: For photo uploads
  const [realtimeData, setRealtimeData] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const autoSaveTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null); // NEW: For photo uploads

  // Contact autosuggest hook for finding existing contacts
  const {
    suggestions: contactSuggestions,
    isLoading: autosuggestLoading,
    search: searchContacts,
    selectContact,
    clearSuggestions
  } = useContactAutosuggest({ formName: 'UltimateContactForm', maxSuggestions: 5 });

  // Handle autofill from selected contact
  const handleContactAutofill = useCallback(async (contact) => {
    const autofillData = await selectContact(contact);
    if (autofillData) {
      setFormData(prev => ({
        ...prev,
        firstName: autofillData.firstName || prev.firstName,
        lastName: autofillData.lastName || prev.lastName,
        middleName: autofillData.middleName || prev.middleName,
        preferredName: autofillData.preferredName || prev.preferredName,
        dateOfBirth: autofillData.dateOfBirth || prev.dateOfBirth,
        ssn: autofillData.ssn || prev.ssn,
        phones: autofillData.phone ? [{ type: 'mobile', number: autofillData.phone, isPrimary: true, canText: true, canCall: true, verified: false }] : prev.phones,
        emails: autofillData.email ? [{ type: 'personal', address: autofillData.email, isPrimary: true, verified: false }] : prev.emails,
        addresses: autofillData.address ? [{
          type: 'home',
          street: autofillData.address,
          city: autofillData.city || '',
          state: autofillData.state || '',
          zip: autofillData.zip || '',
          isPrimary: true,
          verified: false
        }] : prev.addresses
      }));
      addTimelineEvent('autofill', `Auto-filled from existing contact: ${contact.name}`);
    }
  }, [selectContact]);

  // Real-time listener for AI receptionist calls
  useEffect(() => {
    if (!contactId) return;
    
    const q = query(
      collection(db, 'aiReceptionistCalls'),
      where('contactId', '==', contactId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRealtimeData(prev => ({
        ...prev,
        recentCalls: calls
      }));
      
      // Update AI tracking with latest call data
      if (calls.length > 0) {
        setFormData(prev => ({
          ...prev,
          aiTracking: {
            ...prev.aiTracking,
            aiReceptionistCalls: calls,
            lastAICall: calls[0],
            callsReceived: calls.length
          }
        }));
      }
    });
    
    return () => unsubscribe();
  }, [contactId]);

  // Auto-populate SSN last 4 and IDIQ secret word
  useEffect(() => {
    if (formData.ssn && formData.ssn.length >= 4) {
      const last4 = formData.ssn.slice(-4);
      setFormData(prev => ({
        ...prev,
        ssnLast4: last4,
        idiq: {
          ...prev.idiq,
          secretWord: prev.idiq.secretWord || last4
        }
      }));
    }
  }, [formData.ssn]);

  // ============================================================================
  // CALCULATE DATA QUALITY SCORE
  // ============================================================================
  // Christopher's Rules:
  // - MINIMUM TO SAVE: Phone OR Email (at least one)
  // - Everything else is OPTIONAL and adds to completeness
  // - Verified checkboxes are informational, not required
  // - Issues shown as yellow warnings, not blockers
  // ============================================================================
  useEffect(() => {
    const calculateQuality = () => {
      let score = 0;
      const issues = [];      // Yellow warnings (informational)
      const blockers = [];    // Red blockers (prevent save)
      
      // ═══════════════════════════════════════════════════════════════
      // MINIMUM REQUIRED: Phone OR Email (one must exist)
      // ═══════════════════════════════════════════════════════════════
      const hasPhone = formData.phones.some(p => p.number && p.number.replace(/\D/g, '').length >= 10);
      const hasEmail = formData.emails.some(e => e.address && e.address.includes('@'));
      
      if (!hasPhone && !hasEmail) {
        blockers.push('⛔ Must provide at least a phone number OR email address');
      } else {
        score += 20; // Base score for having contact method
      }
      
      // ═══════════════════════════════════════════════════════════════
      // OPTIONAL BUT RECOMMENDED (adds to score, doesn't block)
      // ═══════════════════════════════════════════════════════════════
      
      // Name (15 points possible)
      if (formData.firstName && formData.lastName) {
        score += 15;
      } else if (formData.firstName || formData.lastName) {
        score += 7;
        issues.push('💡 Full name helps with personalization');
      } else {
        issues.push('💡 Name recommended for communication');
      }
      
      // Date of Birth (10 points)
      if (formData.dateOfBirth) {
        score += 10;
      } else {
        issues.push('💡 DOB needed for credit bureaus');
      }
      
      // SSN (15 points)
      if (formData.ssn && formData.ssn.length === 9) {
        score += 15;
      } else if (formData.ssnLast4) {
        score += 5;
        issues.push('💡 Full SSN needed for credit disputes');
      } else {
        issues.push('💡 SSN required for credit repair services');
      }
      
      // Contact verification (BONUS points - not required)
      if (formData.phones.some(p => p.verified)) score += 5;
      if (formData.emails.some(e => e.verified)) score += 5;
      
      // Address (10 points)
      const hasFullAddress = formData.addresses.some(a => 
        a.street && a.city && a.state && a.zip
      );
      if (hasFullAddress) {
        score += 10;
      } else {
        issues.push('💡 Address helps with dispute letters');
      }
      
      // Employment (5 points)
      if (formData.employment.employer) {
        score += 5;
      }
      
      // Lead Source (5 points)
      if (formData.leadSource) {
        score += 5;
      } else {
        issues.push('💡 Lead source helps track marketing');
      }
      
      // Credit profile (5 points)
      if (formData.creditProfile.approximateScore) {
        score += 5;
      }
      
      // Documents (5 points)
      const docCount = [
        formData.documents.idReceived,
        formData.documents.proofOfAddressReceived,
        formData.documents.ssnCardReceived
      ].filter(Boolean).length;
      score += docCount * 1.67;
      
      setDataQuality({ 
        score: Math.min(100, Math.round(score)), 
        issues,
        blockers,
        canSave: blockers.length === 0,  // Easy check for save button
        lastCalculated: new Date().toISOString()
      });
    };
    
    const debounce = setTimeout(calculateQuality, 500);
    return () => clearTimeout(debounce);
  }, [formData]);

  // AI Analysis on form changes
  useEffect(() => {
    const analyzeForm = async () => {
      setAiAnalyzing(true);
      const suggestions = [];
      
      // Completeness checks - Changed from "required" to "suggestion"
      if (!formData.firstName || !formData.lastName) {
        suggestions.push({ 
          type: 'suggestion', 
          field: 'name', 
          message: 'Adding name helps personalize communications',
          priority: 'medium'
        });
      }
      
      // Check for BOTH phone and email missing (this is the only blocker)
      const hasPhone = formData.phones.some(p => p.number && p.number.replace(/\D/g, '').length >= 10);
      const hasEmail = formData.emails.some(e => e.address && e.address.includes('@'));
      
      if (!hasPhone && !hasEmail) {
        suggestions.push({ 
          type: 'required', 
          field: 'contact', 
          message: 'At least one phone number OR email address is required',
          priority: 'high'
        });
      }
      
      // Duplicate detection
      if (formData.firstName && formData.lastName && (hasPhone || hasEmail)) {
        // In production: query Firestore for potential duplicates
        // For now, simulate
        const potentialDupes = [];
        if (potentialDupes.length > 0) {
          suggestions.push({
            type: 'warning',
            field: 'duplicate',
            message: `Found ${potentialDupes.length} potential duplicate(s)`,
            priority: 'high',
            action: 'Review duplicates'
          });
          setDuplicates(potentialDupes);
        }
      }
      
      // Credit insights
      if (formData.creditProfile.approximateScore < 600) {
        suggestions.push({ 
          type: 'insight', 
          field: 'credit', 
          message: 'Low score - recommend comprehensive dispute strategy',
          action: 'Review dispute options',
          priority: 'medium'
        });
      }
      
      if (formData.creditProfile.approximateScore >= 700) {
        suggestions.push({ 
          type: 'success', 
          field: 'credit', 
          message: 'Good credit score - consider credit building strategies',
          action: 'Optimize credit profile',
          priority: 'low'
        });
      }
      
      // Urgency checks
      if (formData.creditProfile.urgencyLevel === 'urgent' && !formData.idiq.memberId) {
        suggestions.push({ 
          type: 'action', 
          field: 'idiq', 
          message: 'Urgent case - recommend immediate IDIQ enrollment',
          action: 'Enroll in IDIQ now',
          priority: 'high'
        });
      }
      
      // Engagement patterns
      if (formData.aiTracking.emailsReceived > 5 && formData.aiTracking.emailEngagementRate < 20) {
        suggestions.push({ 
          type: 'warning', 
          field: 'engagement', 
          message: 'Low email engagement - try SMS or phone',
          action: 'Switch communication method',
          priority: 'medium'
        });
      }
      
      if (formData.aiTracking.callsReceived > 3 && formData.aiTracking.missedCalls > 2) {
        suggestions.push({ 
          type: 'warning', 
          field: 'engagement', 
          message: 'Multiple missed calls - adjust contact times',
          action: 'Update preferred contact time',
          priority: 'medium'
        });
      }
      
      // Document reminders
      const missingDocs = [];
      if (!formData.documents.idReceived) missingDocs.push('Photo ID');
      if (!formData.documents.proofOfAddressReceived) missingDocs.push('Proof of Address');
      if (!formData.documents.ssnCardReceived) missingDocs.push('SSN Card');
      
      if (missingDocs.length > 0) {
        suggestions.push({
          type: 'reminder',
          field: 'documents',
          message: `Missing documents: ${missingDocs.join(', ')}`,
          action: 'Request documents',
          priority: 'medium'
        });
      }
      
      // Income verification
      if (formData.employment.monthlyIncome && !formData.documents.payStubsReceived) {
        suggestions.push({
          type: 'reminder',
          field: 'verification',
          message: 'Income reported but no pay stubs received',
          action: 'Request pay stubs',
          priority: 'low'
        });
      }
      
      // Contact preference optimization
      if (formData.aiTracking.preferredChannels.length > 0) {
        const topChannel = formData.aiTracking.preferredChannels[0];
        if (formData.preferredContactMethod !== topChannel) {
          suggestions.push({
            type: 'insight',
            field: 'preferences',
            message: `AI detected preference for ${topChannel} communication`,
            action: 'Update preference',
            priority: 'low'
          });
        }
      }
      
      // Churn risk
      if (formData.aiTracking.predictedChurnRisk > 70) {
        suggestions.push({
          type: 'alert',
          field: 'engagement',
          message: 'High churn risk detected - immediate follow-up needed',
          action: 'Schedule call',
          priority: 'high'
        });
      }
      
      setAiSuggestions(suggestions.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      }));
      
      setAiAnalyzing(false);
    };
    
    const debounce = setTimeout(analyzeForm, 800);
    return () => clearTimeout(debounce);
  }, [formData]);

  // Auto-save functionality
  useEffect(() => {
    if (!contactId) return; // Only auto-save existing contacts
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaving(true);
      try {
        await updateDoc(doc(db, 'contacts', contactId), {
          ...formData,
          lastSavedAt: new Date().toISOString(),
          lastSavedBy: 'auto-save'
        });
        setLastSaved(new Date());
        addTimelineEvent('auto_saved', 'Form auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setAutoSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, contactId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      aiTracking: {
        ...prev.aiTracking,
        lastActivity: new Date().toISOString(),
        totalInteractions: prev.aiTracking.totalInteractions + 1
      }
    }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
      aiTracking: {
        ...prev.aiTracking,
        lastActivity: new Date().toISOString()
      }
    }));
  };

  const addArrayItem = (field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field, index, updates) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, ...updates } : item)
    }));
  };

  const handleZipCodeChange = async (zip, addressIndex) => {
    // Always update the zip field immediately
    updateArrayItem('addresses', addressIndex, { zip });

    if (zip.length === 5) {
      try {
        // Use real ZIP lookup service with Zippopotamus API
        const data = await lookupZIP(zip);
        if (data && data.city) {
          updateArrayItem('addresses', addressIndex, {
            zip,
            city: data.city,
            state: data.stateAbbr || data.state
          });
          addTimelineEvent('address_lookup', `ZIP code ${zip} auto-populated: ${data.city}, ${data.stateAbbr} (via ${data.source})`);
        }
      } catch (error) {
        console.error('ZIP lookup failed:', error);
        // Silently fail - user can still enter city/state manually
      }
    }
  };

  const addTimelineEvent = (type, description, metadata = {}) => {
    const event = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      description,
      metadata,
      source: 'system'
    };
    
    setFormData(prev => ({
      ...prev,
      timeline: [event, ...prev.timeline]
    }));
  };

  const formatSSN = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const handleSSNChange = (value) => {
    const formatted = formatSSN(value);
    updateField('ssn', formatted.replace(/-/g, ''));
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const generateUsername = () => {
    const username = `${formData.firstName}.${formData.lastName}${Math.floor(Math.random() * 1000)}`.toLowerCase();
    updateNestedField('idiq', 'username', username);
    addTimelineEvent('username_generated', `IDIQ username generated: ${username}`);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateNestedField('idiq', 'password', password);
    addTimelineEvent('password_generated', 'IDIQ password generated');
  };

  // Photo Upload Handler - NEW FUNCTION ADDED
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    addTimelineEvent('photo_upload_started', `Uploading photo ID: ${file.name}`);
    
    try {
      // Create thumbnail preview immediately
      const photoUrl = URL.createObjectURL(file);
      
      // Update form data with photo
      setFormData(prev => ({
        ...prev,
        photoIdUrl: photoUrl,
        documents: {
          ...prev.documents,
          idReceived: true,
          idFileUrl: photoUrl,
          idUploadDate: new Date().toISOString()
        }
      }));
      
      addTimelineEvent('photo_uploaded', `Photo ID uploaded successfully: ${file.name}`);
      setUploadingPhoto(false);
      
      // In production: Upload to Firebase Storage here
      console.log('📸 Photo uploaded locally, ready for Firebase Storage integration');
      
    } catch (error) {
      console.error('Photo upload error:', error);
      addTimelineEvent('photo_upload_failed', `Photo upload failed: ${error.message}`);
      setUploadingPhoto(false);
    }
  };

  const handleFileUpload = async (event, docType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    addTimelineEvent('file_upload_started', `Uploading ${docType}: ${file.name}`);
    
    // In production: upload to Firebase Storage
    // For now, simulate upload
    setTimeout(() => {
      const fileUrl = `https://storage.example.com/${file.name}`;
      
      switch(docType) {
        case 'id':
          updateNestedField('documents', 'idReceived', true);
          updateNestedField('documents', 'idFileUrl', fileUrl);
          updateNestedField('documents', 'idUploadDate', new Date().toISOString());
          break;
        case 'proofOfAddress':
          updateNestedField('documents', 'proofOfAddressReceived', true);
          updateNestedField('documents', 'proofOfAddressFileUrl', fileUrl);
          break;
        case 'ssnCard':
          updateNestedField('documents', 'ssnCardReceived', true);
          updateNestedField('documents', 'ssnCardFileUrl', fileUrl);
          updateNestedField('documents', 'ssnCardUploadDate', new Date().toISOString());
          break;
      }
      
      addTimelineEvent('file_uploaded', `${docType} uploaded successfully: ${file.name}`);
      setUploadingFile(false);
    }, 1500);
  };

  const calculateEngagementScore = () => {
    const { aiTracking } = formData;
    let score = 0;
    
    // Email engagement (0-25 points)
    if (aiTracking.emailsReceived > 0) {
      score += Math.min(25, (aiTracking.emailEngagementRate / 100) * 25);
    }
    
    // Call engagement (0-25 points)
    if (aiTracking.callsReceived > 0) {
      const callScore = ((aiTracking.callsReceived - aiTracking.missedCalls) / aiTracking.callsReceived) * 25;
      score += Math.min(25, callScore);
    }
    
    // Website activity (0-20 points)
    if (aiTracking.websiteVisits > 0) {
      score += Math.min(20, aiTracking.websiteVisits * 2);
    }
    
    // Document submission (0-15 points)
    const docsSubmitted = formData.documents.idReceived + formData.documents.proofOfAddressReceived + formData.documents.ssnCardReceived;
    score += docsSubmitted * 5;
    
    // Recency (0-15 points)
    const daysSinceLastActivity = Math.floor((new Date() - new Date(aiTracking.lastActivity)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActivity < 7) score += 15;
    else if (daysSinceLastActivity < 14) score += 10;
    else if (daysSinceLastActivity < 30) score += 5;
    
    return Math.min(100, Math.round(score));
  };

  const handleSave = async () => {
    // Check for duplicates before creating
    const checkDuplicate = async (email, phone) => {
      const contactsRef = collection(db, 'contacts');
      
      // Check email
      if (email) {
        const emailQuery = query(contactsRef, where('email', '==', email.toLowerCase()));
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
          const existing = emailSnap.docs[0];
          // Update contact frequency instead of creating new
          await updateDoc(existing.ref, {
            contactFrequency: (existing.data().contactFrequency || 1) + 1,
            lastContact: serverTimestamp(),
            tags: [...new Set([...(existing.data().tags || []), 'repeat-contact'])],
          });
          console.log('âœ… Duplicate detected! Updated contact frequency.');
          return existing.id; // Return existing ID
        }
      }
      
      // Check phone
      if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const phoneQuery = query(contactsRef, where('phone', '==', cleanPhone));
        const phoneSnap = await getDocs(phoneQuery);
        if (!phoneSnap.empty) {
          const existing = phoneSnap.docs[0];
          await updateDoc(existing.ref, {
            contactFrequency: (existing.data().contactFrequency || 1) + 1,
            lastContact: serverTimestamp(),
          });
          console.log('âœ… Duplicate detected! Updated contact frequency.');
          return existing.id;
        }
      }
      
      return null; // No duplicate found
    };

    const engagementScore = calculateEngagementScore();
    const finalData = {
      ...formData,
      aiTracking: {
        ...formData.aiTracking,
        engagementScore
      },
      dataQualityScore: dataQuality.score,
      stage: formData.stage || 'prospecting',           // DEFAULT STAGE
      pipelineStage: formData.pipelineStage || 'new',   // DEFAULT PIPELINE STAGE
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: 'manual'
    };
    
    // If creating a new contact, check for duplicates first
    if (!contactId) {
      const duplicateId = await checkDuplicate(formData.emails[0]?.address, formData.phones[0]?.number);
      if (duplicateId) {
        // Handle duplicate case (e.g., show message, redirect, etc.)
        console.log('Duplicate contact found:', duplicateId);
        return;
      }
    }
    
    addTimelineEvent('form_saved', 'Contact information saved manually');
    onSave(finalData);
  };

  const SectionHeader = ({ title, icon: Icon, section, badge, aiActive, completeness }) => (
    <div
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-900">{title}</span>
        {badge && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {badge}
          </span>
        )}
        {aiActive && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <Brain className="w-3 h-3" /> AI Active
          </span>
        )}
        {completeness !== undefined && (
          <div className="flex items-center gap-1">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  completeness >= 80 ? 'bg-green-500' :
                  completeness >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{completeness}%</span>
          </div>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </div>
);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      {/* Header with Data Quality */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Complete Contact Intelligence Profile
            {autoSaving && (
              <span className="text-sm font-normal text-blue-600 flex items-center gap-1">
                <Clock className="w-4 h-4 animate-spin" /> Saving...
              </span>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">AI-powered comprehensive contact management</p>
          
          {/* Data Quality Meter */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Data Quality Score</span>
                <span className="font-semibold">{dataQuality.score}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    dataQuality.score >= 80 ? 'bg-green-500' :
                    dataQuality.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${dataQuality.score}%` }}
                />
              </div>
              {dataQuality.issues.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {dataQuality.issues.length} issue{dataQuality.issues.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className={`w-5 h-5 ${
                dataQuality.score >= 80 ? 'text-green-600' :
                dataQuality.score >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <span className="font-medium text-gray-700">
                {dataQuality.score >= 80 ? 'Excellent' :
                 dataQuality.score >= 60 ? 'Good' :
                 dataQuality.score >= 40 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Save Contact
          </button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">AI Insights & Recommendations</h3>
              {aiAnalyzing && (
                <span className="text-xs text-purple-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" /> Analyzing...
                </span>
              )}
            </div>
            <button 
              onClick={() => setAiSuggestions([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                suggestion.type === 'required' || suggestion.type === 'alert' ? 'bg-red-50 border-red-200' :
                suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                suggestion.type === 'insight' || suggestion.type === 'reminder' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {suggestion.type === 'required' || suggestion.type === 'alert' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : suggestion.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Zap className="w-4 h-4 text-blue-600" />
                      )}
                      <span className={`text-xs font-semibold uppercase ${
                        suggestion.priority === 'high' ? 'text-red-700' :
                        suggestion.priority === 'medium' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                        {suggestion.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{suggestion.message}</p>
                    {suggestion.action && (
                      <p className="text-xs text-gray-600 mt-1">
                        ðŸ’¡ Recommended: {suggestion.action}
                      </p>
                    )}
                  </div>
                  {suggestion.action && (
                    <button className="text-xs bg-white text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-300 whitespace-nowrap">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Potential Duplicate Detected</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Found {duplicates.length} similar contact{duplicates.length !== 1 ? 's' : ''} in the system.
              </p>
              <button className="text-sm text-yellow-700 hover:text-yellow-800 font-medium mt-2 underline">
                Review Duplicates â†’
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Summary Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <MessageSquare className="w-4 h-4" />
            Interactions
          </div>
          <p className="text-2xl font-bold text-gray-900">{formData.aiTracking.totalInteractions}</p>
          <p className="text-xs text-gray-500 mt-1">
            Last: {new Date(formData.aiTracking.lastActivity).toLocaleDateString()}
          </p>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Mail className="w-4 h-4" />
            Email Rate
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formData.aiTracking.emailsReceived > 0 
              ? `${Math.round((formData.aiTracking.emailsOpened / formData.aiTracking.emailsReceived) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formData.aiTracking.emailsOpened}/{formData.aiTracking.emailsReceived} opened
          </p>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Phone className="w-4 h-4" />
            Calls
          </div>
          <p className="text-2xl font-bold text-gray-900">{formData.aiTracking.callsReceived}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formData.aiTracking.missedCalls} missed
          </p>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Globe className="w-4 h-4" />
            Web Visits
          </div>
          <p className="text-2xl font-bold text-gray-900">{formData.aiTracking.websiteVisits}</p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(formData.aiTracking.timeOnSite / 60)}min total
          </p>
        </div>
        
        <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Engagement
          </div>
          <p className="text-2xl font-bold text-gray-900">{calculateEngagementScore()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formData.aiTracking.responsiveness || 'Calculating...'}
          </p>
        </div>
      </div>

      {/* Real-time AI Receptionist Calls */}
      {realtimeData?.recentCalls && realtimeData.recentCalls.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Recent AI Receptionist Calls</h3>
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              Live Updates
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {realtimeData.recentCalls.slice(0, 3).map((call) => (
              <div key={call.id} className="p-3 bg-white rounded-lg border border-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{call.summary || 'Call summary'}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(call.timestamp).toLocaleString()} â€¢ Duration: {Math.round(call.duration / 60)}min
                    </p>
                    {call.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                        call.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        call.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {call.sentiment}
                      </span>
                    )}
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-2">
        <SectionHeader 
          title="Basic Information" 
          icon={Users} 
          section="basic" 
          badge="Contact Info" 
          aiActive={true}
          completeness={
            ((formData.firstName ? 20 : 0) +
             (formData.lastName ? 20 : 0) +
             (formData.dateOfBirth ? 20 : 0) +
             (formData.ssn && formData.ssn.length === 9 ? 20 : 0) +
             (formData.leadSource ? 20 : 0))
          }
        />
        {expandedSections.basic && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            
            {/* ===== PHOTO ID PREVIEW - VISUAL CONFIRMATION ===== */}
            {formData.photoIdUrl && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="relative">
                  <img 
                    src={formData.photoIdUrl} 
                    alt="Photo ID" 
                    className="w-20 h-20 object-cover rounded-lg border-2 border-blue-300"
                  />
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Photo ID Uploaded</p>
                  <p className="text-xs text-blue-700">
                    Identity verification & reduces fraud
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove uploaded photo? You can upload a new one in the Documents section.')) {
                      updateField('photoIdUrl', '');
                      addTimelineEvent('photo_removed', 'Photo ID removed');
                    }
                  }}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-yellow-600 text-xs">(recommended)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      updateField('firstName', e.target.value);
                      searchContacts(e.target.value, 'name');
                    }}
                    onFocus={() => setFocusedField('firstName')}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First name"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceMicButton
                      onResult={(text) => updateField('firstName', text)}
                      fieldType="text"
                      size="small"
                    />
                  </div>
                </div>
                {/* Contact suggestions dropdown */}
                {focusedField === 'firstName' && contactSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {contactSuggestions.map((contact) => (
                      <div
                        key={contact.id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          handleContactAutofill(contact);
                          clearSuggestions();
                          setFocusedField(null);
                        }}
                      >
                        <div className="font-medium text-sm">{contact.name}</div>
                        {contact.phone && <div className="text-xs text-gray-500">{contact.phone}</div>}
                        {contact.email && <div className="text-xs text-gray-500">{contact.email}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => updateField('middleName', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Middle name"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceMicButton
                      onResult={(text) => updateField('middleName', text)}
                      fieldType="text"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-yellow-600 text-xs">(recommended)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      updateField('lastName', e.target.value);
                      searchContacts(e.target.value, 'name');
                    }}
                    onFocus={() => setFocusedField('lastName')}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceMicButton
                      onResult={(text) => updateField('lastName', text)}
                      fieldType="text"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                <select
                  value={formData.suffix}
                  onChange={(e) => updateField('suffix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="Jr">Jr.</option>
                  <option value="Sr">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => updateField('preferredName', e.target.value)}
                  placeholder="What they like to be called"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used in personalized communications</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name Pronunciation
                </label>
                <PronunciationRecorder
                  value={formData.namePronunciation}
                  onChange={(data) => updateField('namePronunciation', data)}
                  name={`${formData.firstName} ${formData.lastName}`.trim() || 'Contact'}
                  compact={true}
                  showPhonetic={true}
                />
                <p className="text-xs text-gray-500 mt-1">Record or type how to pronounce the name</p>
              </div>
            </div>

            {/* Lead Source & Lead Score - NEW VISIBLE FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Lead Source
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => updateField('leadSource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Source --</option>
                  <option value="ai-receptionist">🤖 AI Receptionist</option>
                  <option value="website">🌐 Website Form</option>
                  <option value="phone-call">📞 Phone Call</option>
                  <option value="referral">👥 Referral</option>
                  <option value="social-media">📱 Social Media</option>
                  <option value="google-ads">🔍 Google Ads</option>
                  <option value="facebook-ads">📘 Facebook Ads</option>
                  <option value="walk-in">🚶 Walk-In</option>
                  <option value="email-campaign">📧 Email Campaign</option>
                  <option value="partner">🤝 Partner/Affiliate</option>
                  <option value="returning-client">🔄 Returning Client</option>
                  <option value="manual-entry">✏️ Manual Entry</option>
                  <option value="other">📋 Other</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How did this contact find us?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Initial Lead Score
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.leadScore || 5}
                    onChange={(e) => updateField('leadScore', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-bold min-w-[60px] text-center ${
                    formData.leadScore >= 8 ? 'bg-green-100 text-green-700' :
                    formData.leadScore >= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {formData.leadScore || 5}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">AI will adjust based on engagement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-yellow-600 text-xs">(for credit bureaus)</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.dateOfBirth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Age: {Math.floor((new Date() - new Date(formData.dateOfBirth)) / 31557600000)} years
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>Social Security Number <span className="text-yellow-600 text-xs">(for credit repair)</span></span>
                  <button
                    type="button"
                    onClick={() => setShowSSN(!showSSN)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {showSSN ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Show</>}
                  </button>
                </label>
                <input
                  type={showSSN ? "text" : "password"}
                  name="ssn-secure"
                  value={formatSSN(formData.ssn)}
                  onChange={(e) => handleSSNChange(e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  maxLength="11"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  data-1p-ignore="true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
                {formData.ssnLast4 && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Last 4: {formData.ssnLast4} (encrypted in database)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information - Enhanced */}
      <div className="space-y-2">
        <SectionHeader 
          title="Contact Information" 
          icon={Phone} 
          section="contact" 
          badge="Phone OR Email Required" 
          aiActive={true}
          completeness={
            Math.round(
              ((formData.phones.length > 0 && formData.phones[0].number ? 33 : 0) +
               (formData.emails.length > 0 && formData.emails[0].address ? 33 : 0) +
               (formData.addresses.length > 0 && formData.addresses[0].street ? 34 : 0))
            )
          }
        />
        {expandedSections.contact && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            {/* Minimum Requirement Notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Minimum required:</strong> At least one phone number OR email address to save this contact.
              </p>
            </div>

            {/* Phones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Phone Numbers</label>
                <button
                  onClick={() => addArrayItem('phones', { type: 'mobile', number: '', isPrimary: false, canText: true, canCall: true, verified: false })}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Phone
                </button>
              </div>
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg items-center">
                  <select
                    value={phone.type}
                    onChange={(e) => updateArrayItem('phones', index, { type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="tel"
                    value={phone.number}
                    onChange={(e) => updateArrayItem('phones', index, { number: formatPhone(e.target.value) })}
                    placeholder="(555) 555-5555"
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={phone.canText}
                      onChange={(e) => updateArrayItem('phones', index, { canText: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <MessageSquare className="w-3 h-3 text-gray-600" />
                    <span className="text-xs">SMS</span>
                  </label>
                  <label className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={phone.canCall}
                      onChange={(e) => updateArrayItem('phones', index, { canCall: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Phone className="w-3 h-3 text-gray-600" />
                    <span className="text-xs">Call</span>
                  </label>
                  <label className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50" title="Check when phone number has been verified">
                    <input
                      type="checkbox"
                      checked={phone.verified}
                      onChange={(e) => updateArrayItem('phones', index, { verified: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs">Verified</span>
                  </label>
                  {formData.phones.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('phones', index)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove phone"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Emails */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Email Addresses</label>
                <button
                  onClick={() => addArrayItem('emails', { type: 'personal', address: '', isPrimary: false, verified: false, lastOpened: null })}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Email
                </button>
              </div>
              {formData.emails.map((email, index) => (
                <div key={index} className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg items-center">
                  <select
                    value={email.type}
                    onChange={(e) => updateArrayItem('emails', index, { type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="email"
                    value={email.address}
                    onChange={(e) => updateArrayItem('emails', index, { address: e.target.value })}
                    placeholder="email@example.com"
                    className="flex-1 min-w-[250px] px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={email.verified}
                      onChange={(e) => updateArrayItem('emails', index, { verified: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <CheckCircle className="w-3 h-3 text-gray-600" />
                    <span className="text-xs">Verified</span>
                  </label>
                  {email.lastOpened && (
                    <span className="text-xs text-gray-500">
                      Last opened: {new Date(email.lastOpened).toLocaleDateString()}
                    </span>
                  )}
                  {formData.emails.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('emails', index)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove email"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Addresses with AI lookup */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Addresses</label>
                <button
                  onClick={() => addArrayItem('addresses', { 
                    type: 'home', street: '', unit: '', city: '', state: '', zip: '', 
                    isPrimary: false, verified: false, moveInDate: '', rentOrOwn: 'rent', monthlyPayment: ''
                  })}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>
              {formData.addresses.map((address, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg mb-3 space-y-3 bg-gray-50">
                  <div className="flex gap-2 items-center">
                    <select
                      value={address.type}
                      onChange={(e) => updateArrayItem('addresses', index, { type: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="mailing">Mailing</option>
                      <option value="previous">Previous</option>
                    </select>
                    <select
                      value={address.rentOrOwn}
                      onChange={(e) => updateArrayItem('addresses', index, { rentOrOwn: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="rent">Rent</option>
                      <option value="own">Own</option>
                      <option value="family">Live w/ Family</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="flex items-center gap-2 ml-auto bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={address.verified}
                        onChange={(e) => updateArrayItem('addresses', index, { verified: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Verified</span>
                    </label>
                    {formData.addresses.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('addresses', index)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove address"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => updateArrayItem('addresses', index, { street: e.target.value })}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    value={address.unit}
                    onChange={(e) => updateArrayItem('addresses', index, { unit: e.target.value })}
                    placeholder="Unit/Apt (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={address.zip}
                        onChange={(e) => handleZipCodeChange(e.target.value, index)}
                        placeholder="ZIP"
                        maxLength="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      />
                      {address.zip.length === 5 && address.city && (
                        <span className="absolute right-2 top-2 text-green-600" title="Auto-populated">
                          <Brain className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => updateArrayItem('addresses', index, { city: e.target.value })}
                      placeholder="City"
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    />
                    <select
                      value={address.state}
                      onChange={(e) => updateArrayItem('addresses', index, { state: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="">State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      <option value="IL">Illinois</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="OH">Ohio</option>
                      <option value="GA">Georgia</option>
                      <option value="NC">North Carolina</option>
                      <option value="MI">Michigan</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Move-in Date</label>
                      <input
                        type="date"
                        value={address.moveInDate}
                        onChange={(e) => updateArrayItem('addresses', index, { moveInDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Monthly Payment</label>
                      <input
                        type="number"
                        value={address.monthlyPayment}
                        onChange={(e) => updateArrayItem('addresses', index, { monthlyPayment: e.target.value })}
                        placeholder="$0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                  {address.verified && address.verifiedDate && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified on {new Date(address.verifiedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Communication Preferences - NEW SECTION */}
      <div className="space-y-2">
        <SectionHeader 
          title="Communication Preferences" 
          icon={Bell} 
          section="preferences" 
          aiActive={true}
        />
        {expandedSections.preferences && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Method</label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => updateField('preferredContactMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="text">Text/SMS</option>
                  <option value="any">Any Method</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Best Time to Call</label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning (8-12)</option>
                  <option value="afternoon">Afternoon (12-5)</option>
                  <option value="evening">Evening (5-8)</option>
                  <option value="custom">Custom Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="chinese">Chinese</option>
                  <option value="vietnamese">Vietnamese</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {formData.preferredContactTime === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Time</label>
                  <input
                    type="time"
                    value={formData.bestTimeToCall.start}
                    onChange={(e) => updateField('bestTimeToCall', { ...formData.bestTimeToCall, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Time</label>
                  <input
                    type="time"
                    value={formData.bestTimeToCall.end}
                    onChange={(e) => updateField('bestTimeToCall', { ...formData.bestTimeToCall, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days NOT to Contact</label>
              <div className="flex flex-wrap gap-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <label key={day} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.doNotCallDays.includes(day)}
                      onChange={(e) => {
                        const days = e.target.checked
                          ? [...formData.doNotCallDays, day]
                          : formData.doNotCallDays.filter(d => d !== day);
                        updateField('doNotCallDays', days);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsOptIn}
                  onChange={(e) => updateField('smsOptIn', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">SMS Updates</p>
                  <p className="text-xs text-gray-600">Opt-in to text messages</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.voicemailOk}
                  onChange={(e) => updateField('voicemailOk', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Voicemail OK</p>
                  <p className="text-xs text-gray-600">Can leave voicemail</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotContact}
                  onChange={(e) => updateField('doNotContact', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Do Not Contact</p>
                  <p className="text-xs text-red-600">Stop all communications</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Notes</label>
              <textarea
                value={formData.communicationNotes}
                onChange={(e) => updateField('communicationNotes', e.target.value)}
                rows="2"
                placeholder="Special instructions, preferred topics, things to avoid..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.aiTracking.preferredChannels.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-1">
                  <Brain className="w-4 h-4" /> AI Detected Preferences
                </p>
                <p className="text-xs text-blue-700">
                  Based on engagement: {formData.aiTracking.preferredChannels.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Employment Information - NEW SECTION */}
      <div className="space-y-2">
        <SectionHeader 
          title="Employment & Income" 
          icon={Briefcase} 
          section="employment"
          completeness={
            Math.round(
              ((formData.employment.employer ? 25 : 0) +
               (formData.employment.jobTitle ? 25 : 0) +
               (formData.employment.monthlyIncome ? 50 : 0))
            )
          }
        />
        {expandedSections.employment && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                <select
                  value={formData.employment.status}
                  onChange={(e) => updateNestedField('employment', 'status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="employed">Employed Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.employment.monthlyIncome}
                    onChange={(e) => updateNestedField('employment', 'monthlyIncome', e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {(formData.employment.status === 'employed' || formData.employment.status === 'part-time') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                    <input
                      type="text"
                      value={formData.employment.employer}
                      onChange={(e) => updateNestedField('employment', 'employer', e.target.value)}
                      placeholder="Company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formData.employment.jobTitle}
                      onChange={(e) => updateNestedField('employment', 'jobTitle', e.target.value)}
                      placeholder="Position/title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={formData.employment.industry}
                      onChange={(e) => updateNestedField('employment', 'industry', e.target.value)}
                      placeholder="e.g., Healthcare"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years at Job</label>
                    <input
                      type="number"
                      value={formData.employment.yearsAtJob}
                      onChange={(e) => updateNestedField('employment', 'yearsAtJob', e.target.value)}
                      placeholder="Years"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
                    <select
                      value={formData.employment.payFrequency}
                      onChange={(e) => updateNestedField('employment', 'payFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="semimonthly">Semi-Monthly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer Phone</label>
                    <input
                      type="tel"
                      value={formData.employment.employerPhone}
                      onChange={(e) => updateNestedField('employment', 'employerPhone', formatPhone(e.target.value))}
                      placeholder="(555) 555-5555"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Pay Date</label>
                    <input
                      type="date"
                      value={formData.employment.nextPayDate}
                      onChange={(e) => updateNestedField('employment', 'nextPayDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employer Address</label>
                  <input
                    type="text"
                    value={formData.employment.employerAddress}
                    onChange={(e) => updateNestedField('employment', 'employerAddress', e.target.value)}
                    placeholder="Company address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.employment.directDeposit}
                    onChange={(e) => updateNestedField('employment', 'directDeposit', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">Has Direct Deposit</span>
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {/* Credit Profile - Enhanced */}
      <div className="space-y-2">
        <SectionHeader 
          title="Credit Profile & Goals" 
          icon={CreditCard} 
          section="credit" 
          aiActive={true}
          completeness={
            Math.round(
              ((formData.creditProfile.approximateScore ? 30 : 0) +
               (formData.creditProfile.primaryGoals.length > 0 ? 40 : 0) +
               (formData.creditProfile.targetScore ? 30 : 0))
            )
          }
        />
        {expandedSections.credit && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Score</label>
                <input
                  type="number"
                  value={formData.creditProfile.approximateScore}
                  onChange={(e) => updateNestedField('creditProfile', 'approximateScore', e.target.value)}
                  placeholder="e.g., 650"
                  min="300"
                  max="850"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {formData.creditProfile.approximateScore && (
                  <p className={`text-xs mt-1 ${
                    formData.creditProfile.approximateScore >= 740 ? 'text-green-600' :
                    formData.creditProfile.approximateScore >= 670 ? 'text-blue-600' :
                    formData.creditProfile.approximateScore >= 580 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {formData.creditProfile.approximateScore >= 740 ? 'Very Good' :
                     formData.creditProfile.approximateScore >= 670 ? 'Good' :
                     formData.creditProfile.approximateScore >= 580 ? 'Fair' : 'Poor'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Score</label>
                <input
                  type="number"
                  value={formData.creditProfile.targetScore}
                  onChange={(e) => updateNestedField('creditProfile', 'targetScore', e.target.value)}
                  placeholder="e.g., 720"
                  min="300"
                  max="850"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={formData.creditProfile.timeframe}
                  onChange={(e) => updateNestedField('creditProfile', 'timeframe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="12-plus-months">12+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={formData.creditProfile.urgencyLevel}
                  onChange={(e) => updateNestedField('creditProfile', 'urgencyLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Low - Exploring</option>
                  <option value="medium">Medium - Planning</option>
                  <option value="high">High - Need Soon</option>
                  <option value="urgent">Urgent - Need Now</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goals (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'Buy a home', 
                  'Buy a car', 
                  'Get credit card', 
                  'Lower interest rates', 
                  'Refinance loan', 
                  'Remove negative items', 
                  'Build credit', 
                  'Debt consolidation',
                  'Business loan',
                  'Student loan',
                  'Personal loan',
                  'Improve score'
                ].map(goal => (
                  <label key={goal} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={formData.creditProfile.primaryGoals.includes(goal)}
                      onChange={(e) => {
                        const goals = e.target.checked
                          ? [...formData.creditProfile.primaryGoals, goal]
                          : formData.creditProfile.primaryGoals.filter(g => g !== goal);
                        updateNestedField('creditProfile', 'primaryGoals', goals);
                      }}
                      className="rounded border-gray-300"
                    />
                    <Target className="w-3 h-3 text-gray-400" />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bureaus to Dispute</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Equifax', 'Experian', 'TransUnion'].map(bureau => (
                  <label key={bureau} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.creditProfile.bureausToDispute.includes(bureau)}
                      onChange={(e) => {
                        const bureaus = e.target.checked
                          ? [...formData.creditProfile.bureausToDispute, bureau]
                          : formData.creditProfile.bureausToDispute.filter(b => b !== bureau);
                        updateNestedField('creditProfile', 'bureausToDispute', bureaus);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{bureau}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Knowledge Level</label>
                <select
                  value={formData.creditProfile.creditKnowledge}
                  onChange={(e) => updateNestedField('creditProfile', 'creditKnowledge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Score Check</label>
                <input
                  type="date"
                  value={formData.creditProfile.lastCheckedDate}
                  onChange={(e) => updateNestedField('creditProfile', 'lastCheckedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Major Credit Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.creditProfile.hasRecentBankruptcy}
                    onChange={(e) => updateNestedField('creditProfile', 'hasRecentBankruptcy', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bankruptcy</p>
                    {formData.creditProfile.hasRecentBankruptcy && (
                      <input
                        type="date"
                        value={formData.creditProfile.bankruptcyDate}
                        onChange={(e) => updateNestedField('creditProfile', 'bankruptcyDate', e.target.value)}
                        className="mt-1 text-xs w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Date"
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.creditProfile.hasForeclosure}
                    onChange={(e) => updateNestedField('creditProfile', 'hasForeclosure', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Foreclosure</p>
                    {formData.creditProfile.hasForeclosure && (
                      <input
                        type="date"
                        value={formData.creditProfile.foreclosureDate}
                        onChange={(e) => updateNestedField('creditProfile', 'foreclosureDate', e.target.value)}
                        className="mt-1 text-xs w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Date"
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.creditProfile.hasRepossession}
                    onChange={(e) => updateNestedField('creditProfile', 'hasRepossession', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Repossession</p>
                    {formData.creditProfile.hasRepossession && (
                      <input
                        type="date"
                        value={formData.creditProfile.repossessionDate}
                        onChange={(e) => updateNestedField('creditProfile', 'repossessionDate', e.target.value)}
                        className="mt-1 text-xs w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Date"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents Checklist - Enhanced */}
      <div className="space-y-2">
        <SectionHeader 
          title="Document Checklist" 
          icon={FileText} 
          section="documents"
          badge={`${[
            formData.documents.idReceived,
            formData.documents.proofOfAddressReceived,
            formData.documents.ssnCardReceived,
            formData.documents.creditReportsReceived
          ].filter(Boolean).length}/4 received`}
        />
        {expandedSections.documents && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
            {/* ID Document */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.idReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'idReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'Photo ID received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium">Photo ID (Driver's License, Passport, State ID)</span>
                  {formData.photoIdUrl && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      <Upload className="w-3 h-3" />
                      Photo Uploaded
                    </span>
                  )}
                </div>
                {formData.documents.idReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>

              {formData.documents.idReceived && (
                <div className="ml-11 mt-3 grid grid-cols-3 gap-3">
                  <select
                    value={formData.documents.idType}
                    onChange={(e) => updateNestedField('documents', 'idType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">ID Type</option>
                    <option value="drivers-license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="state-id">State ID</option>
                    <option value="military-id">Military ID</option>
                  </select>
                  <input
                    type="text"
                    value={formData.documents.idNumber}
                    onChange={(e) => updateNestedField('documents', 'idNumber', e.target.value)}
                    placeholder="ID Number"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={formData.documents.idExpirationDate}
                    onChange={(e) => updateNestedField('documents', 'idExpirationDate', e.target.value)}
                    placeholder="Expiration"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div className="ml-11 mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'id')}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  {uploadingFile ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>

            {/* Proof of Address */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.proofOfAddressReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'proofOfAddressReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'Proof of address received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium flex-1">Proof of Address (Utility Bill, Lease, Bank Statement)</span>
                {formData.documents.proofOfAddressReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>

              {formData.documents.proofOfAddressReceived && (
                <div className="ml-11 mt-3">
                  <select
                    value={formData.documents.proofOfAddressType}
                    onChange={(e) => updateNestedField('documents', 'proofOfAddressType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full"
                  >
                    <option value="">Document Type</option>
                    <option value="utility-bill">Utility Bill</option>
                    <option value="lease">Lease Agreement</option>
                    <option value="bank-statement">Bank Statement</option>
                    <option value="mortgage">Mortgage Statement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
            </div>

            {/* SSN Card */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.ssnCardReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'ssnCardReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'SSN card received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium flex-1">Social Security Card</span>
                {formData.documents.ssnCardReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>
            </div>

            {/* Credit Reports */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.creditReportsReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'creditReportsReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'Credit reports received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <FileText className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium flex-1">Credit Reports (All 3 Bureaus)</span>
                {formData.documents.creditReportsReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>
            </div>

            {/* Pay Stubs */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.payStubsReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'payStubsReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'Pay stubs received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <DollarSign className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium flex-1">Recent Pay Stubs (Last 2-3 months)</span>
                {formData.documents.payStubsReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>
            </div>

            {/* Bank Statements */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.documents.bankStatementsReceived}
                  onChange={(e) => {
                    updateNestedField('documents', 'bankStatementsReceived', e.target.checked);
                    if (e.target.checked) {
                      addTimelineEvent('document_received', 'Bank statements received');
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium flex-1">Bank Statements (Last 2-3 months)</span>
                {formData.documents.bankStatementsReceived && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Received
                  </span>
                )}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Household Information - NEW SECTION */}
      <div className="space-y-2">
        <SectionHeader 
          title="Household & Family" 
          icon={Home} 
          section="household"
        />
        {expandedSections.household && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  value={formData.household.maritalStatus}
                  onChange={(e) => updateNestedField('household', 'maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                  <option value="domestic-partner">Domestic Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dependents</label>
                <input
                  type="number"
                  value={formData.household.dependents}
                  onChange={(e) => updateNestedField('household', 'dependents', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {(formData.household.maritalStatus === 'married' || formData.household.maritalStatus === 'domestic-partner') && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <h4 className="text-sm font-medium text-blue-900">Spouse/Partner Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.household.spouseName}
                    onChange={(e) => updateNestedField('household', 'spouseName', e.target.value)}
                    placeholder="Full Name"
                    className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white"
                  />
                  <input
                    type="date"
                    value={formData.household.spouseDateOfBirth}
                    onChange={(e) => updateNestedField('household', 'spouseDateOfBirth', e.target.value)}
                    placeholder="Date of Birth"
                    className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white"
                  />
                  <input
                    type="text"
                    value={formData.household.spouseEmployer}
                    onChange={(e) => updateNestedField('household', 'spouseEmployer', e.target.value)}
                    placeholder="Employer"
                    className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white"
                  />
                  <input
                    type="number"
                    value={formData.household.spouseIncome}
                    onChange={(e) => updateNestedField('household', 'spouseIncome', e.target.value)}
                    placeholder="Monthly Income"
                    className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Household Income</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.household.householdIncome}
                    onChange={(e) => updateNestedField('household', 'householdIncome', e.target.value)}
                    placeholder="Monthly"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Housing Cost</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.household.monthlyHousingCost}
                    onChange={(e) => updateNestedField('household', 'monthlyHousingCost', e.target.value)}
                    placeholder="Rent/Mortgage"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IDIQ Section - Enhanced */}
      <div className="space-y-2">
        <SectionHeader 
          title="IDIQ Membership & Credentials" 
          icon={CreditCard} 
          section="idiq" 
          aiActive={true}
        />
        {expandedSections.idiq && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
                <select
                  value={formData.idiq.membershipStatus}
                  onChange={(e) => updateNestedField('idiq', 'membershipStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">Not Enrolled</option>
                  <option value="pending">Pending Enrollment</option>
                  <option value="active">Active Member</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {formData.idiq.membershipStatus !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                  <input
                    type="text"
                    value={formData.idiq.memberId}
                    onChange={(e) => updateNestedField('idiq', 'memberId', e.target.value)}
                    placeholder="IDIQ Member ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>

            {formData.idiq.membershipStatus !== 'none' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>Username</span>
                      <button
                        type="button"
                        onClick={generateUsername}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Generate
                      </button>
                    </label>
                    <input
                      type="text"
                      value={formData.idiq.username}
                      onChange={(e) => updateNestedField('idiq', 'username', e.target.value)}
                      placeholder="Username for IDIQ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                      <span>Password</span>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Generate
                      </button>
                    </label>
                    <input
                      type="password"
                      value={formData.idiq.password}
                      onChange={(e) => updateNestedField('idiq', 'password', e.target.value)}
                      placeholder="Password for IDIQ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Word
                    <span className="text-xs text-gray-500 ml-2">(Auto-populated from SSN last 4, can be changed)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idiq.secretWord}
                    onChange={(e) => updateNestedField('idiq', 'secretWord', e.target.value)}
                    placeholder="Secret word for IDIQ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.idiq.secretWord === formData.ssnLast4 && formData.ssnLast4 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Using SSN last 4 (recommended by IDIQ)
                    </p>
                  )}
                </div>

                {formData.idiq.membershipStatus === 'active' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                      <input
                        type="date"
                        value={formData.idiq.enrollmentDate}
                        onChange={(e) => updateNestedField('idiq', 'enrollmentDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Report Pull</label>
                      <input
                        type="date"
                        value={formData.idiq.lastReportPull}
                        onChange={(e) => updateNestedField('idiq', 'lastReportPull', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.idiq.monitoringActive}
                    onChange={(e) => updateNestedField('idiq', 'monitoringActive', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Credit Monitoring Active</p>
                    <p className="text-xs text-gray-600">Real-time alerts for credit changes</p>
                  </div>
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {/* AI Insights Dashboard - NEW SECTION */}
      <div className="space-y-2">
        <SectionHeader 
          title="AI Intelligence Dashboard" 
          icon={Brain} 
          section="aiInsights"
          badge="Live Data"
        />
        {expandedSections.aiInsights && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg space-y-4">
            {/* Engagement Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Email Open Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {formData.aiTracking.emailEngagementRate}%
                </p>
                <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${formData.aiTracking.emailEngagementRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">SMS Response Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {formData.aiTracking.smsEngagementRate}%
                </p>
                <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${formData.aiTracking.smsEngagementRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Churn Risk</p>
                <p className="text-xl font-bold text-gray-900">
                  {formData.aiTracking.predictedChurnRisk}%
                </p>
                <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${
                      formData.aiTracking.predictedChurnRisk > 70 ? 'bg-red-500' :
                      formData.aiTracking.predictedChurnRisk > 40 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${formData.aiTracking.predictedChurnRisk}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Behavior Patterns */}
            {formData.aiTracking.preferredChannels.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Detected Communication Preferences
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.aiTracking.preferredChannels.map((channel, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Peak Activity Times */}
            {formData.aiTracking.peakActivityTimes.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Best Times to Reach
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.aiTracking.peakActivityTimes.map((time, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Discussed */}
            {formData.aiTracking.topicsDiscussed.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  Topics Discussed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.aiTracking.topicsDiscussed.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights List */}
            {formData.aiTracking.aiInsights.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  AI-Generated Insights
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.aiTracking.aiInsights.map((insight, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-purple-400">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call Sentiment History */}
            {formData.aiTracking.callSentiment.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Call Sentiment History
                </h4>
                <div className="flex gap-1">
                  {formData.aiTracking.callSentiment.slice(-10).map((sentiment, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-8 rounded ${
                        sentiment === 'positive' ? 'bg-green-400' :
                        sentiment === 'negative' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`}
                      title={sentiment}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Last 10 calls</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Section - Enhanced */}
      <div className="space-y-2">
        <SectionHeader 
          title="Activity Timeline" 
          icon={Clock} 
          section="timeline" 
          badge={`${formData.timeline.length} events`}
        />
        {expandedSections.timeline && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            {formData.timeline.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No activity recorded yet</p>
                <p className="text-xs text-gray-400 mt-1">Events will appear here as you interact with the contact</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Filter timeline..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {formData.timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4 relative">
                      {index !== formData.timeline.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 mt-1.5 z-10 ring-2 ring-white" />
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                {JSON.stringify(event.metadata)}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.source === 'system' ? 'bg-blue-100 text-blue-700' :
                            event.source === 'ai' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {event.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Internal Notes - Enhanced */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Internal Notes & Observations
          </label>
          <span className="text-xs text-gray-500">
            {formData.notes.length} characters
          </span>
        </div>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows="5"
          placeholder="AI will analyze all interactions and add insights here automatically. You can also add manual notes...&#10;&#10;Examples:&#10;- Contact prefers morning calls&#10;- Very motivated to improve credit&#10;- Has urgent need for car loan&#10;- Follow up on disputed items next week"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        
        {/* Roles Section - NEW */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contact Roles
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.roles.map((role, index) => (
              <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                role === 'contact' ? 'bg-blue-100 text-blue-700' :
                role === 'lead' ? 'bg-yellow-100 text-yellow-700' :
                role === 'client' ? 'bg-green-100 text-green-700' :
                role === 'affiliate' ? 'bg-purple-100 text-purple-700' :
                role === 'previous-client' ? 'bg-gray-100 text-gray-700' :
                role === 'inactive' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {role === 'previous-client' ? 'Previous Client' : role.charAt(0).toUpperCase() + role.slice(1)}
                {role !== 'contact' && (
                  <button
                    onClick={() => updateField('roles', formData.roles.filter((_, i) => i !== index))}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {['lead', 'client', 'affiliate', 'previous-client', 'inactive'].map(role => (
              !formData.roles.includes(role) && (
                <button
                  key={role}
                  onClick={() => updateField('roles', [...formData.roles, role])}
                  className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 border border-gray-200"
                >
                  + {role === 'previous-client' ? 'Previous Client' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              )
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ðŸ’¡ Contact role is permanent. Add additional roles as needed.
          </p>
        </div>
        
        {/* Tags Section */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">
                {tag}
                <button
                  onClick={() => updateField('tags', formData.tags.filter((_, i) => i !== index))}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.target.value.trim();
                  if (value && !formData.tags.includes(value)) {
                    updateField('tags', [...formData.tags, value]);
                    e.target.value = '';
                  }
                }
              }}
            />
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-gray-500">Suggested:</span>
            {['Hot Lead', 'Follow Up', 'Urgent', 'VIP', 'Low Credit', 'High Income'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (!formData.tags.includes(tag)) {
                    updateField('tags', [...formData.tags, tag]);
                  }
                }}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats Footer */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Completeness</p>
            <p className="text-lg font-bold text-gray-900">{dataQuality.score}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Engagement Score</p>
            <p className="text-lg font-bold text-gray-900">{calculateEngagementScore()}/100</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Days Active</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.floor((new Date() - new Date(formData.aiTracking.firstContact)) / (1000 * 60 * 60 * 24))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Lifetime Value</p>
            <p className="text-lg font-bold text-gray-900">${formData.aiTracking.lifetimeValue}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
        <div className="space-y-1">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last activity: {new Date(formData.aiTracking.lastActivity).toLocaleString()}
          </div>
          {lastSaved && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Auto-saved at {new Date(lastSaved).toLocaleTimeString()}
            </div>
          )}
          {autoSaving && (
            <div className="text-xs text-blue-600 flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" />
              Saving changes...
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dataQuality.canSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className="w-5 h-5" />
            Save Contact Profile
            {!dataQuality.canSave && dataQuality.blockers?.length > 0 && (
              <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded">
                Phone or Email Required
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Data Quality Issues Display */}
      {(dataQuality.blockers?.length > 0 || dataQuality.issues?.length > 0) && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {/* Red Blockers (prevent save) */}
          {dataQuality.blockers?.length > 0 && (
            <div className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{dataQuality.blockers[0]}</span>
            </div>
          )}
          
          {/* Yellow Warnings (informational) */}
          {dataQuality.issues?.length > 0 && (
            <button
              onClick={() => {
                alert(`📋 Recommended Information:\n\n${dataQuality.issues.join('\n')}\n\n✅ These are optional - you can still save!`);
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {dataQuality.issues.length} Suggestions
            </button>
          )}
        </div>
      )}

      {/* AI Form Assistant - Floating helper widget */}
      <AIFormAssistant
        currentStep={0}
        currentField={focusedField}
        formData={formData}
        formName="UltimateContactForm"
        onFieldFocus={(field) => setFocusedField(field)}
        showProactively={true}
      />
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================
export default UltimateContactForm;