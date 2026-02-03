// Path: src/components/idiq/LinkExistingIDIQClient.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LINK EXISTING IDIQ CLIENT - CLIENT MIGRATION TOOL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Allows linking existing IDIQ members to SpeedyCRM contacts.
 * Essential for migrating existing clients to the CRM system.
 * 
 * FEATURES:
 * - Search and select existing SpeedyCRM contacts
 * - Enter IDIQ email to link account
 * - Pull credit report from IDIQ API
 * - Store reportHtml in idiqEnrollments collection
 * - Automatically ready for Dispute Scanner
 * 
 * WORKFLOW:
 * 1. Select a contact from SpeedyCRM
 * 2. Enter the email used for their IDIQ account
 * 3. System authenticates with IDIQ API
 * 4. Pulls credit report data
 * 5. Creates idiqEnrollments document with proper fields
 * 6. Contact is now ready for dispute scanning
 * 
 * @version 1.0.0
 * @date February 2026
 *
 * © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
 * Trademark: Speedy Credit Repair® - USPTO Registered
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Alert, AlertTitle,
  Autocomplete, CircularProgress, Stepper, Step, StepLabel,
  Card, CardContent, Chip, Avatar, Stack, Divider, List,
  ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, IconButton,
  Tooltip, Grid
} from '@mui/material';
import {
  User, Mail, Link2, CheckCircle, AlertTriangle, Search,
  CreditCard, Shield, FileText, ArrowRight, RefreshCw,
  Database, Sparkles, Upload, UserCheck, Clock, TrendingUp,
  X, Info, Download, Zap
} from 'lucide-react';
import { db, functions } from '@/lib/firebase';
import { 
  collection, query, getDocs, doc, setDoc, updateDoc, 
  serverTimestamp, where, orderBy, limit 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STEPS = [
  'Select Contact',
  'Enter IDIQ Email',
  'Pull Credit Report',
  'Complete'
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const LinkExistingIDIQClient = ({ 
  onComplete,      // Callback when linking is complete
  onCancel,        // Callback to cancel
  preSelectedContactId = null  // Pre-select a contact if provided
}) => {
  // ═════════════════════════════════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Contact selection state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  
  // IDIQ linking state
  const [idiqEmail, setIdiqEmail] = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  
  // Result state
  const [creditReport, setCreditReport] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [linkingProgress, setLinkingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // ═════════════════════════════════════════════════════════════════════════
  // LOAD CONTACTS ON MOUNT
  // ═════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    fetchContacts();
  }, []);

  // Pre-select contact if provided
  useEffect(() => {
    if (preSelectedContactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === preSelectedContactId);
      if (contact) {
        setSelectedContact(contact);
        setIdiqEmail(contact.email || '');
      }
    }
  }, [preSelectedContactId, contacts]);

  // ═════════════════════════════════════════════════════════════════════════
  // FETCH CONTACTS
  // ═════════════════════════════════════════════════════════════════════════
  
  const fetchContacts = async () => {
    console.log('[LinkExistingIDIQ] Fetching contacts...');
    setContactsLoading(true);
    
    try {
      // Fetch all contacts - we'll filter on the client side for flexibility
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        orderBy('lastName', 'asc'),
        limit(500)
      );
      
      const snapshot = await getDocs(q);
      const contactList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Create display label
        label: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 
               doc.data().email || 
               'Unknown Contact'
      }));
      
      console.log(`[LinkExistingIDIQ] Loaded ${contactList.length} contacts`);
      setContacts(contactList);
      
    } catch (err) {
      console.error('[LinkExistingIDIQ] Error fetching contacts:', err);
      setError('Failed to load contacts. Please refresh and try again.');
    } finally {
      setContactsLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // LINK EXISTING IDIQ ACCOUNT
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleLinkAccount = async () => {
    if (!selectedContact) {
      setError('Please select a contact first');
      return;
    }
    
    if (!idiqEmail) {
      setError('Please enter the IDIQ email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    setLinkingProgress(0);
    setProgressMessage('Initializing...');
    
    try {
      // ═══════════════════════════════════════════════════════════════════
      // STEP 1: Authenticate with IDIQ and get credit report
      // ═══════════════════════════════════════════════════════════════════
      
      setLinkingProgress(10);
      setProgressMessage('Connecting to IDIQ...');
      console.log('[LinkExistingIDIQ] Calling idiqService with getReport action...');
      
      const idiqService = httpsCallable(functions, 'idiqService');
      
      // First try to get the report
      const reportResult = await idiqService({
        action: 'getReport',
        params: {
          email: idiqEmail.trim().toLowerCase()
        }
      });
      
      setLinkingProgress(40);
      setProgressMessage('Credit report retrieved...');
      console.log('[LinkExistingIDIQ] Report result:', reportResult.data);
      
      if (!reportResult.data?.success) {
        throw new Error(reportResult.data?.error || 'Failed to retrieve credit report from IDIQ');
      }
      
      const report = reportResult.data.report;
      setCreditReport(report);
      
      // ═══════════════════════════════════════════════════════════════════
      // STEP 2: Extract membership number if available
      // ═══════════════════════════════════════════════════════════════════
      
      setLinkingProgress(50);
      setProgressMessage('Processing credit report data...');
      
      // Try to get member info for membership number
      let memberInfo = null;
      try {
        const memberResult = await idiqService({
          action: 'getMember',
          params: {
            email: idiqEmail.trim().toLowerCase()
          }
        });
        
        if (memberResult.data?.success) {
          memberInfo = memberResult.data.data;
          setMembershipNumber(memberInfo?.membershipNumber || '');
        }
      } catch (memberErr) {
        console.log('[LinkExistingIDIQ] Could not get member info:', memberErr);
        // Continue without membership number - report is more important
      }
      
      // ═══════════════════════════════════════════════════════════════════
      // STEP 3: Create idiqEnrollments document
      // ═══════════════════════════════════════════════════════════════════
      
      setLinkingProgress(70);
      setProgressMessage('Saving to SpeedyCRM...');
      
      // Determine how to store the report
      // The IDIQ API returns JSON, but our parser expects HTML
      // We'll store both the raw JSON and attempt to create HTML representation
      const reportHtml = convertReportToHtml(report);
      
      const enrollmentData = {
        // ═══════════════════════════════════════════════════════════════
        // REQUIRED FIELDS FOR DISPUTE POPULATION
        // ═══════════════════════════════════════════════════════════════
        contactId: selectedContact.id,
        contactName: `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}`.trim(),
        reportHtml: reportHtml,
        createdAt: serverTimestamp(),
        
        // ═══════════════════════════════════════════════════════════════
        // ADDITIONAL IDIQ DATA
        // ═══════════════════════════════════════════════════════════════
        email: idiqEmail.trim().toLowerCase(),
        membershipNumber: memberInfo?.membershipNumber || membershipNumber || null,
        status: 'active',
        enrollmentStep: 'completed',
        
        // Raw report data for reference
        reportJson: JSON.stringify(report),
        
        // Credit scores if available
        creditScores: extractCreditScores(report),
        
        // Metadata
        linkedAt: serverTimestamp(),
        linkedMethod: 'manual_import',
        source: 'existing_client_migration',
        
        // Member info if available
        memberInfo: memberInfo ? {
          firstName: memberInfo.firstName,
          lastName: memberInfo.lastName,
          currentStatus: memberInfo.currentStatus,
          memberSince: memberInfo.memberSince
        } : null
      };
      
      // Save to Firestore
      const enrollmentRef = doc(collection(db, 'idiqEnrollments'));
      await setDoc(enrollmentRef, enrollmentData);
      
      setEnrollmentId(enrollmentRef.id);
      console.log('[LinkExistingIDIQ] Created enrollment:', enrollmentRef.id);
      
      // ═══════════════════════════════════════════════════════════════════
      // STEP 4: Update contact record
      // ═══════════════════════════════════════════════════════════════════
      
      setLinkingProgress(90);
      setProgressMessage('Updating contact record...');
      
      const contactRef = doc(db, 'contacts', selectedContact.id);
      await updateDoc(contactRef, {
        idiqEnrollmentId: enrollmentRef.id,
        idiqEmail: idiqEmail.trim().toLowerCase(),
        idiqMembershipNumber: memberInfo?.membershipNumber || null,
        idiqLinkedAt: serverTimestamp(),
        idiqStatus: 'active',
        hasCreditReport: true,
        lastCreditReportPull: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETE
      // ═══════════════════════════════════════════════════════════════════
      
      setLinkingProgress(100);
      setProgressMessage('Complete!');
      setSuccess(`Successfully linked ${selectedContact.firstName} ${selectedContact.lastName} to IDIQ!`);
      setActiveStep(3);
      
      console.log('[LinkExistingIDIQ] ✅ Successfully linked contact to IDIQ');
      
    } catch (err) {
      console.error('[LinkExistingIDIQ] Error linking account:', err);
      setError(err.message || 'Failed to link IDIQ account. Please verify the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // HELPER: CONVERT REPORT TO HTML
  // ═════════════════════════════════════════════════════════════════════════
  
  const convertReportToHtml = (report) => {
    // If report is already HTML string, return as-is
    if (typeof report === 'string' && report.includes('<')) {
      return report;
    }
    
    // If report is JSON, convert to HTML format that the parser expects
    try {
      let html = '<html><body>';
      
      // Extract tradelines/accounts if present
      const tradelines = report?.tradelines || 
                        report?.accounts || 
                        report?.tradelineAccounts ||
                        report?.creditAccounts ||
                        [];
      
      for (const tradeline of tradelines) {
        const accountName = tradeline.creditorName || 
                           tradeline.accountName || 
                           tradeline.companyName ||
                           'Unknown';
        
        const accountNumber = tradeline.accountNumber || 
                             tradeline.accountNum ||
                             '****';
        
        const accountType = tradeline.accountType || 
                           tradeline.type ||
                           'Unknown';
        
        const accountStatus = tradeline.accountStatus || 
                             tradeline.status ||
                             tradeline.paymentStatus ||
                             'Unknown';
        
        const balance = tradeline.balance || 
                       tradeline.currentBalance ||
                       tradeline.balanceAmount ||
                       0;
        
        const paymentStatus = tradeline.paymentStatus || 
                             tradeline.payStatus ||
                             tradeline.conditionCode ||
                             'Unknown';
        
        const dateOpened = tradeline.dateOpened || 
                          tradeline.openDate ||
                          tradeline.accountOpenedDate ||
                          'Unknown';
        
        // Determine bureaus reporting
        const bureaus = [];
        if (tradeline.transunion || tradeline.tu || tradeline.bureaus?.includes('TU')) {
          bureaus.push('TUC');
        }
        if (tradeline.experian || tradeline.exp || tradeline.bureaus?.includes('EXP')) {
          bureaus.push('EXP');
        }
        if (tradeline.equifax || tradeline.eqf || tradeline.bureaus?.includes('EQF')) {
          bureaus.push('EQF');
        }
        
        // If no bureaus specified, assume all three
        if (bureaus.length === 0) {
          bureaus.push('TUC', 'EXP', 'EQF');
        }
        
        html += `
          <div class="tradeline" data-account="${accountName}">
            <h3>${accountName}</h3>
            <table>
              <tr><td>Account #:</td><td>${accountNumber}</td></tr>
              <tr><td>Account Type:</td><td>${accountType}</td></tr>
              <tr><td>Account Status:</td><td>${accountStatus}</td></tr>
              <tr><td>Balance:</td><td>$${typeof balance === 'number' ? balance.toFixed(2) : balance}</td></tr>
              <tr><td>Payment Status:</td><td>${paymentStatus}</td></tr>
              <tr><td>Date Opened:</td><td>${dateOpened}</td></tr>
            </table>
            <div class="bureau-reporting">
              ${bureaus.map(b => `<span class="bureau" data-bureau="${b}">${
                b === 'TUC' ? 'TransUnion' : b === 'EXP' ? 'Experian' : 'Equifax'
              }</span>`).join('')}
            </div>
          </div>
        `;
      }
      
      // Extract inquiries if present
      const inquiries = report?.inquiries || report?.creditInquiries || [];
      
      for (const inquiry of inquiries) {
        html += `
          <div class="inquiry" data-creditor="${inquiry.creditorName || inquiry.companyName || 'Unknown'}">
            <span class="creditor">${inquiry.creditorName || inquiry.companyName || 'Unknown'}</span>
            <span class="date">${inquiry.inquiryDate || inquiry.date || 'Unknown'}</span>
            <span class="type">${inquiry.inquiryType || inquiry.type || 'Hard'}</span>
          </div>
        `;
      }
      
      html += '</body></html>';
      
      return html;
      
    } catch (err) {
      console.error('[LinkExistingIDIQ] Error converting report to HTML:', err);
      // Return raw JSON stringified as fallback
      return `<html><body><pre>${JSON.stringify(report, null, 2)}</pre></body></html>`;
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // HELPER: EXTRACT CREDIT SCORES
  // ═════════════════════════════════════════════════════════════════════════
  
  const extractCreditScores = (report) => {
    try {
      return {
        transunion: report?.scores?.transunion || 
                   report?.creditScores?.tu ||
                   report?.tuScore ||
                   null,
        experian: report?.scores?.experian || 
                 report?.creditScores?.exp ||
                 report?.expScore ||
                 null,
        equifax: report?.scores?.equifax || 
                report?.creditScores?.eqf ||
                report?.eqfScore ||
                null
      };
    } catch (err) {
      return { transunion: null, experian: null, equifax: null };
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleNext = () => {
    if (activeStep === 0 && !selectedContact) {
      setError('Please select a contact to continue');
      return;
    }
    if (activeStep === 1 && !idiqEmail) {
      setError('Please enter the IDIQ email address');
      return;
    }
    
    setError(null);
    
    if (activeStep === 1) {
      // Start the linking process
      handleLinkAccount();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setError(null);
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        contactId: selectedContact.id,
        enrollmentId: enrollmentId,
        creditReport: creditReport
      });
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 1 - SELECT CONTACT
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderContactSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <User size={24} />
        Select Contact to Link
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose an existing SpeedyCRM contact to link with their IDIQ account.
      </Typography>
      
      <Autocomplete
        options={contacts}
        getOptionLabel={(option) => option.label || ''}
        value={selectedContact}
        onChange={(event, newValue) => {
          setSelectedContact(newValue);
          if (newValue?.email) {
            setIdiqEmail(newValue.email);
          }
        }}
        inputValue={searchInput}
        onInputChange={(event, newInputValue) => {
          setSearchInput(newInputValue);
        }}
        loading={contactsLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Contacts"
            placeholder="Type name or email to search..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {contactsLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {(option.firstName?.[0] || option.email?.[0] || '?').toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {option.firstName} {option.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.email || 'No email'}
                </Typography>
              </Box>
              {option.roles && (
                <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                  {option.roles.slice(0, 2).map(role => (
                    <Chip 
                      key={role} 
                      label={role} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </li>
        )}
        noOptionsText="No contacts found"
        sx={{ mb: 3 }}
      />
      
      {/* Selected Contact Preview */}
      {selectedContact && (
        <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                <UserCheck size={24} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedContact.firstName} {selectedContact.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedContact.email || 'No email on file'}
                </Typography>
                {selectedContact.phone && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedContact.phone}
                  </Typography>
                )}
              </Box>
              <CheckCircle size={24} color="green" />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 2 - ENTER IDIQ EMAIL
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderIdiqEmail = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Mail size={24} />
        Enter IDIQ Account Email
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter the email address associated with this client's IDIQ account.
        This is the email they used when signing up for IdentityIQ.
      </Typography>
      
      <TextField
        fullWidth
        label="IDIQ Email Address"
        type="email"
        value={idiqEmail}
        onChange={(e) => setIdiqEmail(e.target.value)}
        placeholder="client@email.com"
        variant="outlined"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <Mail size={20} style={{ marginRight: 8, opacity: 0.5 }} />
        }}
      />
      
      <TextField
        fullWidth
        label="Membership Number (Optional)"
        value={membershipNumber}
        onChange={(e) => setMembershipNumber(e.target.value)}
        placeholder="e.g., 26025479159995"
        variant="outlined"
        helperText="Enter if known - otherwise we'll retrieve it automatically"
        InputProps={{
          startAdornment: <CreditCard size={20} style={{ marginRight: 8, opacity: 0.5 }} />
        }}
      />
      
      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>What happens next?</AlertTitle>
        <List dense>
          <ListItem>
            <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
            <ListItemText primary="We'll authenticate with IDIQ using this email" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
            <ListItemText primary="Pull their latest credit report data" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
            <ListItemText primary="Link it to this contact in SpeedyCRM" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
            <ListItemText primary="Enable dispute scanning capabilities" />
          </ListItem>
        </List>
      </Alert>
    </Box>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 3 - PULLING REPORT (LOADING STATE)
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderPullingReport = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        {progressMessage}
      </Typography>
      
      <LinearProgress 
        variant="determinate" 
        value={linkingProgress} 
        sx={{ mb: 2, height: 8, borderRadius: 4 }}
      />
      
      <Typography variant="body2" color="text.secondary">
        {linkingProgress}% complete
      </Typography>
      
      <List sx={{ mt: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
        <ListItem>
          <ListItemIcon>
            {linkingProgress >= 10 ? <CheckCircle size={20} color="green" /> : <Clock size={20} />}
          </ListItemIcon>
          <ListItemText primary="Connecting to IDIQ API" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {linkingProgress >= 40 ? <CheckCircle size={20} color="green" /> : <Clock size={20} />}
          </ListItemIcon>
          <ListItemText primary="Retrieving credit report" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {linkingProgress >= 70 ? <CheckCircle size={20} color="green" /> : <Clock size={20} />}
          </ListItemIcon>
          <ListItemText primary="Saving to SpeedyCRM" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            {linkingProgress >= 90 ? <CheckCircle size={20} color="green" /> : <Clock size={20} />}
          </ListItemIcon>
          <ListItemText primary="Updating contact record" />
        </ListItem>
      </List>
    </Box>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 4 - COMPLETE
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderComplete = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ 
        width: 80, 
        height: 80, 
        bgcolor: 'success.main', 
        mx: 'auto', 
        mb: 3 
      }}>
        <CheckCircle size={48} />
      </Avatar>
      
      <Typography variant="h5" gutterBottom fontWeight="bold" color="success.main">
        Successfully Linked!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {selectedContact?.firstName} {selectedContact?.lastName} is now connected to IDIQ.
      </Typography>
      
      <Card variant="outlined" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Contact</Typography>
              <Typography variant="body2" fontWeight="bold">
                {selectedContact?.firstName} {selectedContact?.lastName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">IDIQ Email</Typography>
              <Typography variant="body2" fontWeight="bold">
                {idiqEmail}
              </Typography>
            </Grid>
            {membershipNumber && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Membership #</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {membershipNumber}
                </Typography>
              </Grid>
            )}
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Enrollment ID</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                {enrollmentId}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Alert severity="success" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
        <AlertTitle>Ready for Dispute Scanning!</AlertTitle>
        You can now use the "Scan from IDIQ Credit Report" feature in the Dispute Hub
        to automatically identify and create disputes for this client.
      </Alert>
      
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          onClick={handleComplete}
          startIcon={<Link2 size={20} />}
        >
          Link Another Client
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (onComplete) {
              onComplete({
                contactId: selectedContact.id,
                enrollmentId: enrollmentId,
                goToDisputes: true
              });
            }
          }}
          startIcon={<Sparkles size={20} />}
        >
          Scan for Disputes
        </Button>
      </Stack>
    </Box>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar sx={{ 
          width: 64, 
          height: 64, 
          bgcolor: 'primary.main', 
          mx: 'auto', 
          mb: 2 
        }}>
          <Link2 size={32} />
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          Link Existing IDIQ Client
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect an existing IDIQ member to SpeedyCRM
        </Typography>
      </Box>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Success Alert */}
      {success && activeStep < 3 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {/* Step Content */}
      <Box sx={{ minHeight: 300 }}>
        {activeStep === 0 && renderContactSelection()}
        {activeStep === 1 && renderIdiqEmail()}
        {activeStep === 2 && renderPullingReport()}
        {activeStep === 3 && renderComplete()}
      </Box>
      
      {/* Navigation Buttons */}
      {activeStep < 3 && !loading && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Box>
            {activeStep > 0 && activeStep < 2 && (
              <Button
                onClick={handleBack}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            )}
            
            {activeStep < 2 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 0 && !selectedContact)}
                endIcon={activeStep === 1 ? <Zap size={20} /> : <ArrowRight size={20} />}
              >
                {activeStep === 1 ? 'Link Account & Pull Report' : 'Continue'}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LinkExistingIDIQClient;