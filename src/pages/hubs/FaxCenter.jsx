// Path: src/pages/hubs/FaxCenter.jsx
// ============================================================================
// FAX CENTER — Send & Track Faxes via Telnyx + Fax Health Monitoring
// ============================================================================
// TIER 5+ ENTERPRISE fax management with smart number health monitoring.
//
// FEATURES:
//   - Send faxes to credit bureaus (pre-filled primary + backup numbers)
//   - Smart auto-rotation: picks the healthiest number per bureau
//   - Real-time health tracking from bureauFaxHealth Firestore collection
//   - Upload documents to Firebase Storage → get URL → send via Telnyx
//   - Select from existing contact documents
//   - Contact search & selection from Firestore
//   - Real-time fax history with delivery status (webhook-updated)
//   - Bureau directory with fax/mail/phone info + health indicators
//   - Batch fax: send same document to multiple bureaus at once
//   - Staff notifications when a number goes dead (3+ consecutive failures)
//
// CLOUD FUNCTION: sendFaxOutbound (onRequest)
//   URL: https://sendfaxoutbound-tvkxcewmxq-uc.a.run.app
//   Body: { to, documentUrl, bureau, contactId, bureauId, sentBy }
//
// WEBHOOK: Telnyx → operationsManager?webhook=telnyx_fax
//   Updates faxLog status + bureauFaxHealth success/failure tracking
//
// FIRESTORE COLLECTIONS:
//   - faxLog: Sent fax records (created by sendFaxOutbound, updated by webhook)
//   - bureauFaxHealth: Per-number health tracking (success rate, consecutive fails)
//   - contacts: Contact lookup
//   - clientDocuments: Existing uploaded documents
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, TextField,
  Tabs, Tab, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, AlertTitle,
  CircularProgress, LinearProgress, Divider, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, FormControlLabel, Snackbar, InputAdornment, Autocomplete,
  Switch, Grid, Stack
} from '@mui/material';
import {
  Send, FileText, Phone, Building2, Clock, CheckCircle, XCircle,
  Upload, Search, RefreshCw, Printer,
  MapPin, Globe, History,
  Copy, Filter, HeartPulse,
  ShieldAlert, ShieldCheck, Activity, RotateCcw
} from 'lucide-react';
import { db, storage } from '../../lib/firebase';
import {
  collection, query, where, orderBy, limit, getDocs, onSnapshot,
  doc, addDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// CREDIT BUREAU DIRECTORY — Primary + backup fax numbers per bureau
// ============================================================================
// Each bureau has a primary fax number and 2 backup numbers.
// The system auto-selects the healthiest active number based on
// real-time delivery success tracking from Telnyx webhooks.
//
// ⚠️ IMPORTANT: Bureau fax numbers change periodically. If a number
// stops working, the system auto-disables it after 3 consecutive failures
// and switches to the next backup. Staff gets a bell/toast notification.
// ============================================================================
const BUREAU_DIRECTORY = {
  experian: {
    id: 'experian',
    name: 'Experian',
    faxNumbers: [
      { number: '+19723903837', display: '(972) 390-3837', label: 'Primary', isPrimary: true },
      { number: '+17148307505', display: '(714) 830-7505', label: 'Backup 1', isPrimary: false },
      { number: '+19723904970', display: '(972) 390-4970', label: 'Backup 2', isPrimary: false }
    ],
    phone: '(888) 397-3742',
    address: 'P.O. Box 4500, Allen, TX 75013',
    disputeAddress: 'Experian, P.O. Box 4500, Allen, TX 75013',
    website: 'https://www.experian.com',
    color: '#0033a0',
    icon: '🔵',
    avgResponseDays: 30,
    notes: 'Fax disputes accepted. Include SSN last 4 and DOB for faster processing.'
  },
  transunion: {
    id: 'transunion',
    name: 'TransUnion',
    faxNumbers: [
      { number: '+16105464606', display: '(610) 546-4606', label: 'Primary', isPrimary: true },
      { number: '+16105464605', display: '(610) 546-4605', label: 'Backup 1', isPrimary: false },
      { number: '+16027946189', display: '(602) 794-6189', label: 'Backup 2', isPrimary: false }
    ],
    phone: '(800) 916-8800',
    address: 'P.O. Box 2000, Chester, PA 19016',
    disputeAddress: 'TransUnion Consumer Solutions, P.O. Box 2000, Chester, PA 19016',
    website: 'https://www.transunion.com',
    color: '#00a4e4',
    icon: '🟦',
    avgResponseDays: 30,
    notes: 'TransUnion accepts fax disputes. Always include your dispute reason code.'
  },
  equifax: {
    id: 'equifax',
    name: 'Equifax',
    faxNumbers: [
      { number: '+18888260549', display: '(888) 826-0549', label: 'Primary', isPrimary: true },
      { number: '+17703752821', display: '(770) 375-2821', label: 'Backup 1', isPrimary: false },
      { number: '+18883882784', display: '(888) 388-2784', label: 'Backup 2', isPrimary: false }
    ],
    phone: '(866) 349-5191',
    address: 'P.O. Box 740256, Atlanta, GA 30374',
    disputeAddress: 'Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374-0256',
    website: 'https://www.equifax.com',
    color: '#e31837',
    icon: '🔴',
    avgResponseDays: 30,
    notes: 'Equifax prefers mail but accepts fax disputes. Include account numbers when possible.'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function formatFaxNumber(number) {
  if (!number) return '';
  const digits = number.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return number;
}

function normalizeFaxNumber(number) {
  if (!number) return '';
  const digits = number.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return number;
}

function timeAgo(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== Health score color: green (>80%), yellow (50-80%), red (<50%) =====
function healthColor(rate) {
  if (rate === null || rate === undefined) return '#9ca3af'; // gray = no data
  if (rate >= 0.8) return '#059669'; // green
  if (rate >= 0.5) return '#d97706'; // yellow
  return '#dc2626'; // red
}

function healthLabel(rate) {
  if (rate === null || rate === undefined) return 'No data';
  if (rate >= 0.8) return 'Healthy';
  if (rate >= 0.5) return 'Degraded';
  return 'Unhealthy';
}

// ============================================================================
// SMART NUMBER SELECTOR — Pick the best active fax number for a bureau
// ============================================================================
// Priority: 1) Active numbers only, 2) Highest success rate, 3) Primary first if tied
function getBestFaxNumber(bureau, healthData) {
  const numbers = bureau.faxNumbers;
  if (!numbers || numbers.length === 0) return null;

  // Build scored list
  const scored = numbers.map(num => {
    const cleanNum = num.number.replace(/[^0-9]/g, '');
    const health = healthData[cleanNum];

    return {
      ...num,
      cleanNum,
      isActive: health ? health.isActive !== false : true, // Active by default if no health data
      successRate: health?.successRate ?? null,
      totalAttempts: health?.totalAttempts || 0,
      consecutiveFailures: health?.consecutiveFailures || 0,
      health
    };
  });

  // Filter to active numbers only
  const active = scored.filter(n => n.isActive);

  // If no active numbers, return primary anyway with warning
  if (active.length === 0) {
    console.warn(`⚠️ All fax numbers disabled for ${bureau.name}! Falling back to primary.`);
    return { ...scored[0], warning: 'All numbers disabled — using primary as fallback' };
  }

  // Sort: highest success rate first, primary wins ties, untested last
  active.sort((a, b) => {
    // Numbers with data beat untested numbers
    if (a.totalAttempts > 0 && b.totalAttempts === 0) return -1;
    if (b.totalAttempts > 0 && a.totalAttempts === 0) return 1;

    // Both untested: primary wins
    if (a.totalAttempts === 0 && b.totalAttempts === 0) {
      return a.isPrimary ? -1 : 1;
    }

    // Both tested: highest success rate wins
    if ((a.successRate || 0) !== (b.successRate || 0)) {
      return (b.successRate || 0) - (a.successRate || 0);
    }

    // Tied rate: fewer consecutive failures wins
    if (a.consecutiveFailures !== b.consecutiveFailures) {
      return a.consecutiveFailures - b.consecutiveFailures;
    }

    // Still tied: primary wins
    return a.isPrimary ? -1 : 1;
  });

  return active[0];
}

// ============================================================================
// MAIN COMPONENT: FaxCenter
// ============================================================================
export default function FaxCenter() {
  const { currentUser, userProfile } = useAuth();

  // ===== TAB STATE =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== SEND FAX STATE =====
  const [selectedBureaus, setSelectedBureaus] = useState([]);
  const [customFaxNumber, setCustomFaxNumber] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // ===== FAX HISTORY STATE =====
  const [faxHistory, setFaxHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');

  // ===== FAX HEALTH STATE =====
  const [healthData, setHealthData] = useState({}); // keyed by clean number (no +)
  const [healthLoading, setHealthLoading] = useState(true);

  // ===== UI STATE =====
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ============================================================================
  // LOAD FAX HEALTH — Real-time listener on bureauFaxHealth collection
  // ============================================================================
  useEffect(() => {
    console.log('📊 FaxCenter: Setting up bureauFaxHealth listener...');

    const unsubscribe = onSnapshot(
      collection(db, 'bureauFaxHealth'),
      (snapshot) => {
        const health = {};
        snapshot.docs.forEach(doc => {
          health[doc.id] = { id: doc.id, ...doc.data() };
        });
        setHealthData(health);
        setHealthLoading(false);
        console.log(`📊 Loaded health data for ${Object.keys(health).length} fax numbers`);
      },
      (error) => {
        console.error('❌ bureauFaxHealth listener error:', error);
        setHealthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // LOAD FAX HISTORY — Real-time listener on faxLog collection
  // ============================================================================
  useEffect(() => {
    const faxQuery = query(
      collection(db, 'faxLog'),
      orderBy('sentAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(faxQuery, (snapshot) => {
      const faxes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFaxHistory(faxes);
      setHistoryLoading(false);
    }, (error) => {
      console.error('❌ FaxLog listener error:', error);
      setHistoryLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // COMPUTED: Best fax number per bureau (auto-rotation)
  // ============================================================================
  const bestNumbers = useMemo(() => {
    const result = {};
    Object.values(BUREAU_DIRECTORY).forEach(bureau => {
      result[bureau.id] = getBestFaxNumber(bureau, healthData);
    });
    return result;
  }, [healthData]);

  // ============================================================================
  // SEARCH CONTACTS — Debounced Firestore search
  // ============================================================================
  useEffect(() => {
    if (!contactSearch || contactSearch.length < 2) {
      setContactResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setContactLoading(true);
      try {
        const searchCap = contactSearch.charAt(0).toUpperCase() + contactSearch.slice(1).toLowerCase();
        const q1 = query(collection(db, 'contacts'), where('firstName', '>=', searchCap), where('firstName', '<=', searchCap + '\uf8ff'), limit(10));
        const snap1 = await getDocs(q1);
        const results = snap1.docs.map(d => ({ id: d.id, ...d.data() }));

        if (results.length < 5) {
          const q2 = query(collection(db, 'contacts'), where('lastName', '>=', searchCap), where('lastName', '<=', searchCap + '\uf8ff'), limit(10));
          const snap2 = await getDocs(q2);
          const ids = new Set(results.map(r => r.id));
          snap2.docs.forEach(d => { if (!ids.has(d.id)) results.push({ id: d.id, ...d.data() }); });
        }

        setContactResults(results);
      } catch (err) {
        console.error('❌ Contact search error:', err);
      }
      setContactLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [contactSearch]);

  // ============================================================================
  // LOAD CONTACT DOCUMENTS
  // ============================================================================
  useEffect(() => {
    if (!selectedContact?.id) { setExistingDocs([]); return; }

    const loadDocs = async () => {
      setDocsLoading(true);
      try {
        const q = query(collection(db, 'clientDocuments'), where('contactId', '==', selectedContact.id), orderBy('uploadedAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        setExistingDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        try {
          const q2 = query(collection(db, 'documents'), where('contactId', '==', selectedContact.id), limit(20));
          const snap2 = await getDocs(q2);
          setExistingDocs(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch { setExistingDocs([]); }
      }
      setDocsLoading(false);
    };
    loadDocs();
  }, [selectedContact?.id]);

  // ============================================================================
  // UPLOAD DOCUMENT — Firebase Storage → download URL
  // ============================================================================
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/tiff', 'image/tif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|tiff|tif)$/i)) {
      setSnackbar({ open: true, message: 'Please upload a PDF or TIFF file.', severity: 'warning' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'File too large. Maximum 10MB.', severity: 'warning' });
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const prefix = selectedContact?.id ? `${selectedContact.id}/` : 'general/';
      const path = `fax-documents/${prefix}${ts}_${safeName}`;

      setUploadProgress(30);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      setUploadProgress(70);
      const url = await getDownloadURL(storageRef);
      setUploadProgress(100);

      setSelectedDocument({ name: file.name, url, path, size: file.size, type: file.type });
      setSnackbar({ open: true, message: `"${file.name}" uploaded!`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `Upload failed: ${err.message}`, severity: 'error' });
    }

    setUploading(false);
    setUploadProgress(0);
  }, [selectedContact?.id]);

  // ============================================================================
  // SEND FAX — Uses smart number selection, calls sendFaxOutbound
  // ============================================================================
  const handleSendFax = useCallback(async () => {
    setConfirmOpen(false);

    if (!selectedDocument?.url) {
      setSnackbar({ open: true, message: 'Please select a document first.', severity: 'warning' });
      return;
    }

    // ===== BUILD RECIPIENT LIST =====
    const recipients = [];

    if (useCustomNumber) {
      const normalized = normalizeFaxNumber(customFaxNumber);
      if (!normalized || normalized.length < 10) {
        setSnackbar({ open: true, message: 'Please enter a valid fax number.', severity: 'warning' });
        return;
      }
      recipients.push({ to: normalized, bureau: customRecipient || 'Custom', bureauId: null, display: formatFaxNumber(customFaxNumber) });
    } else {
      if (selectedBureaus.length === 0) {
        setSnackbar({ open: true, message: 'Please select at least one bureau.', severity: 'warning' });
        return;
      }
      // ===== SMART NUMBER SELECTION — Use healthiest number per bureau =====
      selectedBureaus.forEach(bureauId => {
        const bureau = BUREAU_DIRECTORY[bureauId];
        const best = bestNumbers[bureauId];
        if (bureau && best) {
          recipients.push({
            to: best.number,
            bureau: bureau.name,
            bureauId: bureau.id,
            display: `${bureau.name} — ${best.display} (${best.label})`,
            warning: best.warning || null
          });
        }
      });
    }

    setSending(true);
    setSendResults([]);
    const results = [];

    for (const recipient of recipients) {
      try {
        const response = await fetch('https://sendfaxoutbound-tvkxcewmxq-uc.a.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient.to,
            documentUrl: selectedDocument.url,
            bureau: recipient.bureau,
            bureauId: recipient.bureauId,
            contactId: selectedContact?.id || null,
            sentBy: currentUser?.uid || 'unknown'
          })
        });

        const data = await response.json();

        results.push({
          bureau: recipient.bureau,
          display: recipient.display,
          success: data.success,
          faxId: data.faxId || null,
          status: data.status || null,
          error: data.success ? null : (data.error || 'Unknown error'),
          warning: recipient.warning
        });
      } catch (err) {
        results.push({
          bureau: recipient.bureau,
          display: recipient.display,
          success: false,
          error: err.message
        });
      }
    }

    setSendResults(results);
    setSending(false);

    // Log activity
    if (selectedContact?.id) {
      try {
        await addDoc(collection(db, 'activityLogs'), {
          type: 'fax_sent',
          contactId: selectedContact.id,
          action: 'send_fax',
          details: { bureaus: recipients.map(r => r.bureau), document: selectedDocument.name, results, notes },
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid || 'unknown'
        });
      } catch (logErr) {
        console.warn('⚠️ Activity log failed:', logErr);
      }
    }

    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;
    if (ok > 0 && fail === 0) setSnackbar({ open: true, message: `✅ All ${ok} fax(es) sent!`, severity: 'success' });
    else if (ok > 0) setSnackbar({ open: true, message: `⚠️ ${ok} sent, ${fail} failed.`, severity: 'warning' });
    else setSnackbar({ open: true, message: `❌ All ${fail} fax(es) failed.`, severity: 'error' });
  }, [selectedDocument, selectedBureaus, useCustomNumber, customFaxNumber, customRecipient, selectedContact, notes, currentUser, bestNumbers]);

  // ============================================================================
  // RESET FORM
  // ============================================================================
  const handleReset = () => {
    setSelectedBureaus([]);
    setCustomFaxNumber('');
    setCustomRecipient('');
    setUseCustomNumber(false);
    setSelectedContact(null);
    setContactSearch('');
    setSelectedDocument(null);
    setSendResults([]);
    setNotes('');
    setExistingDocs([]);
  };

  // ============================================================================
  // MANUAL RE-ENABLE — Allow staff to re-activate a disabled number
  // ============================================================================
  const handleReEnableNumber = async (cleanNum) => {
    try {
      const healthRef = doc(db, 'bureauFaxHealth', cleanNum);
      await updateDoc(healthRef, {
        isActive: true,
        consecutiveFailures: 0,
        disabledAt: null,
        disableReason: null,
        reEnabledAt: serverTimestamp(),
        reEnabledBy: currentUser?.uid || 'manual',
        updatedAt: serverTimestamp()
      });
      setSnackbar({ open: true, message: 'Number re-enabled! It will be used for the next fax.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `Re-enable failed: ${err.message}`, severity: 'error' });
    }
  };

  // ============================================================================
  // FILTERED HISTORY
  // ============================================================================
  const filteredHistory = historyFilter === 'all'
    ? faxHistory
    : faxHistory.filter(f => f.bureau?.toLowerCase() === historyFilter);

  // ============================================================================
  // RENDER: HEALTH BADGE — Shows next to bureau name
  // ============================================================================
  const renderHealthBadge = (bureauId) => {
    const best = bestNumbers[bureauId];
    if (!best || best.totalAttempts === 0) {
      return <Chip label="No data" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />;
    }

    const rate = best.successRate;
    const color = healthColor(rate);
    const label = healthLabel(rate);

    return (
      <Tooltip title={`${best.display} — ${Math.round((rate || 0) * 100)}% success (${best.totalAttempts} faxes) ${best.consecutiveFailures > 0 ? `• ${best.consecutiveFailures} consecutive fails` : ''}`}>
        <Chip
          icon={rate >= 0.8 ? <ShieldCheck size={14} /> : rate >= 0.5 ? <Activity size={14} /> : <ShieldAlert size={14} />}
          label={`${label} ${Math.round((rate || 0) * 100)}%`}
          size="small"
          sx={{ bgcolor: `${color}18`, color, fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Tooltip>
    );
  };

  // ============================================================================
  // RENDER: TAB 0 — SEND FAX
  // ============================================================================
  const renderSendFax = () => (
    <Box>
      {/* ===== STEP 1: SELECT CONTACT ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search size={20} /> Step 1: Select Contact (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Associate this fax with a contact for record-keeping. Skip if sending a general fax.
        </Typography>
        <Autocomplete
          options={contactResults}
          getOptionLabel={(o) => o ? `${o.firstName || ''} ${o.lastName || ''} ${o.email ? `(${o.email})` : ''}`.trim() : ''}
          value={selectedContact}
          onChange={(_, v) => setSelectedContact(v)}
          onInputChange={(_, v) => setContactSearch(v)}
          loading={contactLoading}
          renderInput={(params) => (
            <TextField {...params} label="Search contacts by name..." placeholder="Start typing a name..." size="small"
              InputProps={{ ...params.InputProps, endAdornment: (<>{contactLoading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>) }}
            />
          )}
          noOptionsText={contactSearch.length < 2 ? "Type at least 2 characters..." : "No contacts found"}
        />
        {selectedContact && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <strong>Selected:</strong> {selectedContact.firstName} {selectedContact.lastName}
            {selectedContact.email && ` — ${selectedContact.email}`}
            {selectedContact.phone && ` — ${selectedContact.phone}`}
          </Alert>
        )}
      </Paper>

      {/* ===== STEP 2: SELECT RECIPIENT(S) ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Building2 size={20} /> Step 2: Select Recipient(s)
        </Typography>

        <FormControlLabel
          control={<Switch checked={useCustomNumber} onChange={(e) => { setUseCustomNumber(e.target.checked); setSelectedBureaus([]); setCustomFaxNumber(''); }} />}
          label="Use custom fax number instead of bureau"
          sx={{ mb: 2 }}
        />

        {!useCustomNumber ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select bureaus below. The system auto-picks the healthiest fax number for each.
            </Typography>
            <Grid container spacing={2}>
              {Object.values(BUREAU_DIRECTORY).map((bureau) => {
                const isSelected = selectedBureaus.includes(bureau.id);
                const best = bestNumbers[bureau.id];
                return (
                  <Grid item xs={12} sm={4} key={bureau.id}>
                    <Card
                      onClick={() => setSelectedBureaus(prev => isSelected ? prev.filter(id => id !== bureau.id) : [...prev, bureau.id])}
                      sx={{
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${bureau.color}` : '2px solid transparent',
                        bgcolor: isSelected ? `${bureau.color}11` : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: bureau.color, transform: 'translateY(-2px)' }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ mb: 0.5 }}>{bureau.icon}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: bureau.color }}>{bureau.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📠 {best?.display || bureau.faxNumbers[0].display}
                        </Typography>
                        {best?.label !== 'Primary' && best?.totalAttempts > 0 && (
                          <Typography variant="caption" sx={{ color: '#d97706', display: 'block' }}>
                            ⚡ Using {best?.label} (auto-rotated)
                          </Typography>
                        )}
                        <Box sx={{ mt: 0.5 }}>{renderHealthBadge(bureau.id)}</Box>
                        <Checkbox
                          checked={isSelected}
                          sx={{ color: bureau.color, '&.Mui-checked': { color: bureau.color } }}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => setSelectedBureaus(prev => isSelected ? prev.filter(id => id !== bureau.id) : [...prev, bureau.id])}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {selectedBureaus.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>Sending to:</Typography>
                {selectedBureaus.map(id => {
                  const best = bestNumbers[id];
                  return (
                    <Chip
                      key={id}
                      label={`${BUREAU_DIRECTORY[id].name} → ${best?.display || '?'} (${best?.label || 'Primary'})`}
                      onDelete={() => setSelectedBureaus(prev => prev.filter(b => b !== id))}
                      sx={{ bgcolor: `${BUREAU_DIRECTORY[id].color}22`, color: BUREAU_DIRECTORY[id].color, fontWeight: 600 }}
                    />
                  );
                })}
              </Box>
            )}
          </>
        ) : (
          <Stack spacing={2}>
            <TextField label="Fax Number" value={customFaxNumber} onChange={(e) => setCustomFaxNumber(e.target.value)}
              placeholder="(555) 123-4567" size="small" fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> }}
            />
            <TextField label="Recipient Name (for records)" value={customRecipient} onChange={(e) => setCustomRecipient(e.target.value)}
              placeholder="e.g., Chase Bank Disputes Dept" size="small" fullWidth
            />
          </Stack>
        )}
      </Paper>

      {/* ===== STEP 3: DOCUMENT ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileText size={20} /> Step 3: Select Document
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a dispute letter (PDF or TIFF, max 10MB) or select an existing document.
        </Typography>

        {/* Upload area */}
        <Box
          sx={{
            border: '2px dashed', borderColor: selectedDocument ? 'success.main' : 'divider',
            borderRadius: 2, p: 3, textAlign: 'center',
            bgcolor: selectedDocument ? 'success.main' + '08' : 'action.hover',
            cursor: 'pointer', transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.main' + '08' }
          }}
          onClick={() => document.getElementById('fax-file-input').click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0]); }}
        >
          <input id="fax-file-input" type="file" accept=".pdf,.tiff,.tif" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files.length) handleFileUpload(e.target.files[0]); }}
          />
          {uploading ? (
            <>
              <CircularProgress size={40} sx={{ mb: 1 }} />
              <Typography>Uploading... {uploadProgress}%</Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1, maxWidth: 300, mx: 'auto' }} />
            </>
          ) : selectedDocument ? (
            <>
              <CheckCircle size={40} color="#059669" style={{ marginBottom: 8 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>✅ {selectedDocument.name}</Typography>
              <Typography variant="body2" color="text.secondary">{(selectedDocument.size / 1024).toFixed(1)} KB — Click to replace</Typography>
            </>
          ) : (
            <>
              <Upload size={40} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Typography variant="subtitle1" color="text.secondary">Click or drag a PDF/TIFF file here</Typography>
              <Typography variant="body2" color="text.secondary">Dispute letters, authorization forms, supporting documents</Typography>
            </>
          )}
        </Box>

        {/* Existing contact documents */}
        {selectedContact && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={16} /> Existing Documents for {selectedContact.firstName} {selectedContact.lastName}
            </Typography>
            {docsLoading ? (
              <CircularProgress size={24} />
            ) : existingDocs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No existing documents found.</Typography>
            ) : (
              <Stack spacing={1}>
                {existingDocs.map(d => (
                  <Card key={d.id} onClick={() => {
                    const url = d.url || d.downloadUrl || d.fileUrl;
                    if (url) {
                      setSelectedDocument({ name: d.fileName || d.name || 'Document', url, size: d.size || 0, type: d.type || 'application/pdf' });
                      setSnackbar({ open: true, message: `Selected: ${d.fileName || d.name}`, severity: 'info' });
                    }
                  }}
                    sx={{
                      cursor: 'pointer', p: 1.5,
                      border: selectedDocument?.url === (d.url || d.downloadUrl || d.fileUrl) ? '2px solid #059669' : '1px solid',
                      borderColor: selectedDocument?.url === (d.url || d.downloadUrl || d.fileUrl) ? '#059669' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileText size={16} />
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{d.fileName || d.name || 'Untitled'}</Typography>
                      <Typography variant="caption" color="text.secondary">{timeAgo(d.uploadedAt)}</Typography>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      {/* ===== STEP 4: REVIEW & SEND ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send size={20} /> Step 4: Review & Send
        </Typography>

        <TextField label="Notes (optional — saved to activity log)" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Round 2 dispute letters for collections accounts" multiline rows={2} fullWidth size="small" sx={{ mb: 2 }}
        />

        {/* Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Fax Summary</AlertTitle>
          <strong>Document:</strong> {selectedDocument?.name || '❌ Not selected'}<br />
          <strong>Recipient(s):</strong>{' '}
          {useCustomNumber
            ? (customFaxNumber ? `${customRecipient || 'Custom'} — ${formatFaxNumber(customFaxNumber)}` : '❌ Not entered')
            : (selectedBureaus.length > 0
              ? selectedBureaus.map(id => { const b = bestNumbers[id]; return `${BUREAU_DIRECTORY[id].name} → ${b?.display} (${b?.label})`; }).join(' | ')
              : '❌ None selected')
          }<br />
          <strong>Contact:</strong> {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : 'None (general fax)'}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large"
            startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
            onClick={() => setConfirmOpen(true)}
            disabled={sending || !selectedDocument?.url || (!useCustomNumber && selectedBureaus.length === 0) || (useCustomNumber && !customFaxNumber)}
            sx={{ flex: 1, py: 1.5 }}
          >
            {sending ? 'Sending...' : `Send Fax${!useCustomNumber && selectedBureaus.length > 1 ? ` to ${selectedBureaus.length} Bureaus` : ''}`}
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleReset} startIcon={<RefreshCw size={18} />}>Reset</Button>
        </Box>
      </Paper>

      {/* Send Results */}
      {sendResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>📠 Send Results</Typography>
          {sendResults.map((r, i) => (
            <Alert key={i} severity={r.success ? 'success' : 'error'} sx={{ mb: 1 }}>
              <strong>{r.bureau}:</strong>{' '}
              {r.success ? `Sent! Fax ID: ${r.faxId} — Status: ${r.status}` : `Failed — ${r.error}`}
              {r.warning && <><br /><em>⚠️ {r.warning}</em></>}
            </Alert>
          ))}
        </Paper>
      )}
    </Box>
  );

  // ============================================================================
  // RENDER: TAB 1 — FAX HISTORY
  // ============================================================================
  const renderFaxHistory = () => (
    <Box>
      {/* Filter chips */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} />
        <Chip label="All" onClick={() => setHistoryFilter('all')} color={historyFilter === 'all' ? 'primary' : 'default'} variant={historyFilter === 'all' ? 'filled' : 'outlined'} size="small" />
        {Object.values(BUREAU_DIRECTORY).map(b => (
          <Chip key={b.id} label={b.name} onClick={() => setHistoryFilter(b.id)}
            sx={{ bgcolor: historyFilter === b.id ? `${b.color}22` : undefined, color: historyFilter === b.id ? b.color : undefined, borderColor: b.color }}
            variant={historyFilter === b.id ? 'filled' : 'outlined'} size="small"
          />
        ))}
        <Chip label={`${filteredHistory.length} faxes`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
      </Box>

      {historyLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /><Typography sx={{ mt: 1 }}>Loading fax history...</Typography></Box>
      ) : filteredHistory.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8 }}>
          <History size={48} style={{ opacity: 0.3 }} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>No fax records found</Typography>
          <Typography variant="body2" color="text.secondary">Faxes sent through this tool will appear here automatically.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setActiveTab(0)} startIcon={<Send size={16} />}>Send Your First Fax</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Bureau</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fax Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fax ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((fax) => {
                const bureau = Object.values(BUREAU_DIRECTORY).find(b => b.name.toLowerCase() === (fax.bureau || '').toLowerCase());
                const isDelivered = fax.status === 'delivered';
                const isFailed = ['failed', 'no_answer', 'busy', 'line_disconnected', 'rejected', 'technical_failure'].includes(fax.status);
                return (
                  <TableRow key={fax.id} hover>
                    <TableCell>
                      <Chip label={fax.bureau || 'Unknown'} size="small"
                        sx={{ bgcolor: bureau ? `${bureau.color}22` : undefined, color: bureau ? bureau.color : undefined, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{formatFaxNumber(fax.to)}</TableCell>
                    <TableCell>
                      <Chip label={fax.status || 'queued'} size="small"
                        color={isDelivered ? 'success' : isFailed ? 'error' : 'default'} variant="outlined"
                        icon={isDelivered ? <CheckCircle size={14} /> : isFailed ? <XCircle size={14} /> : <Clock size={14} />}
                      />
                      {fax.failureReason && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{fax.failureReason}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {fax.faxId ? fax.faxId.substring(0, 16) + '...' : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {fax.contactId ? (
                        <Tooltip title={`Contact: ${fax.contactId}`}>
                          <Chip label={fax.contactId.substring(0, 8) + '...'} size="small" variant="outlined" />
                        </Tooltip>
                      ) : <Typography variant="body2" color="text.secondary">—</Typography>}
                    </TableCell>
                    <TableCell><Typography variant="body2">{timeAgo(fax.sentAt)}</Typography></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // ============================================================================
  // RENDER: TAB 2 — BUREAU DIRECTORY + FAX NUMBER HEALTH
  // ============================================================================
  const renderBureauDirectory = () => (
    <Grid container spacing={3}>
      {Object.values(BUREAU_DIRECTORY).map((bureau) => (
        <Grid item xs={12} md={4} key={bureau.id}>
          <Paper sx={{ p: 3, borderTop: `4px solid ${bureau.color}`, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              {bureau.icon} {bureau.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* ===== FAX NUMBERS WITH HEALTH STATUS ===== */}
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HeartPulse size={16} style={{ color: bureau.color }} /> Fax Numbers & Health
            </Typography>

            <Stack spacing={1} sx={{ mb: 2 }}>
              {bureau.faxNumbers.map((num) => {
                const cleanNum = num.number.replace(/[^0-9]/g, '');
                const health = healthData[cleanNum];
                const rate = health?.successRate;
                const isActive = health ? health.isActive !== false : true;
                const isBest = bestNumbers[bureau.id]?.number === num.number;

                return (
                  <Card key={num.number} variant="outlined" sx={{
                    p: 1.5,
                    border: isBest ? `2px solid ${bureau.color}` : '1px solid',
                    borderColor: isBest ? bureau.color : 'divider',
                    bgcolor: !isActive ? 'error.main' + '08' : isBest ? `${bureau.color}08` : undefined,
                    opacity: !isActive ? 0.7 : 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Printer size={14} style={{ color: bureau.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{num.display}</Typography>
                      <Chip label={num.label} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      {isBest && <Chip label="✓ Active" size="small" sx={{ bgcolor: `${bureau.color}22`, color: bureau.color, fontSize: '0.65rem', fontWeight: 700 }} />}
                    </Box>

                    {health && health.totalAttempts > 0 ? (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Activity size={12} />}
                          label={`${Math.round((rate || 0) * 100)}% success`}
                          size="small"
                          sx={{ bgcolor: `${healthColor(rate)}18`, color: healthColor(rate), fontSize: '0.65rem', fontWeight: 600 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {health.totalSuccess || 0}/{health.totalAttempts} delivered
                        </Typography>
                        {health.consecutiveFailures > 0 && (
                          <Chip label={`${health.consecutiveFailures} consecutive fails`} size="small" color="error" variant="outlined" sx={{ fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>No delivery data yet</Typography>
                    )}

                    {!isActive && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Alert severity="error" sx={{ flex: 1, py: 0, '& .MuiAlert-message': { fontSize: '0.7rem' } }}>
                          Auto-disabled: {health?.disableReason || 'Multiple failures'}
                        </Alert>
                        <Tooltip title="Re-enable this number (reset failure count)">
                          <IconButton size="small" color="primary" onClick={() => handleReEnableNumber(cleanNum)}>
                            <RotateCcw size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Card>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* ===== CONTACT INFO ===== */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone size={16} style={{ color: bureau.color }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{bureau.phone}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <MapPin size={16} style={{ color: bureau.color, marginTop: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Dispute Mailing Address</Typography>
                  <Typography variant="body2">{bureau.disputeAddress}</Typography>
                </Box>
                <Tooltip title="Copy address">
                  <IconButton size="small" onClick={() => {
                    navigator.clipboard.writeText(bureau.disputeAddress);
                    setSnackbar({ open: true, message: `${bureau.name} address copied!`, severity: 'info' });
                  }}>
                    <Copy size={14} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Globe size={16} style={{ color: bureau.color }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Website</Typography>
                  <Typography variant="body2" component="a" href={bureau.website} target="_blank" rel="noopener"
                    sx={{ color: bureau.color, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {bureau.website.replace('https://', '')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} style={{ color: bureau.color }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Avg Response Time</Typography>
                  <Typography variant="body2">{bureau.avgResponseDays} days</Typography>
                </Box>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>{bureau.notes}</Alert>

            <Button variant="outlined" fullWidth sx={{ mt: 2, borderColor: bureau.color, color: bureau.color }}
              onClick={() => { setActiveTab(0); setUseCustomNumber(false); setSelectedBureaus([bureau.id]); }}
              startIcon={<Send size={16} />}
            >
              Fax {bureau.name}
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          📠 Fax Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Send dispute letters to credit bureaus via Telnyx. Smart auto-rotation picks the healthiest fax number.
        </Typography>
      </Box>

      {/* ===== QUICK STATS ===== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{faxHistory.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total Faxes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
              {faxHistory.filter(f => ['queued', 'sending', 'delivered', 'sent'].includes(f.status)).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Successful</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
              {faxHistory.filter(f => ['failed', 'no_answer', 'busy', 'line_disconnected', 'rejected'].includes(f.status)).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Failed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed' }}>
              {Object.values(healthData).filter(h => h.isActive === false).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Numbers Disabled</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== DISABLED NUMBERS WARNING ===== */}
      {Object.values(healthData).some(h => h.isActive === false) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>⚠️ Fax Number(s) Auto-Disabled</AlertTitle>
          {Object.values(healthData).filter(h => h.isActive === false).map(h => (
            <Typography key={h.id} variant="body2">
              <strong>{h.bureauName || 'Unknown'}:</strong> {formatFaxNumber(h.faxNumber)} — {h.disableReason || 'Multiple failures'}
            </Typography>
          ))}
          <Typography variant="body2" sx={{ mt: 1 }}>
            The system has auto-switched to backup numbers. Check the Bureau Directory tab to re-enable or update numbers.
          </Typography>
        </Alert>
      )}

      {/* ===== TABS ===== */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Send Fax" icon={<Send size={18} />} iconPosition="start" />
          <Tab label={`Fax History (${faxHistory.length})`} icon={<History size={18} />} iconPosition="start" />
          <Tab label="Bureau Directory" icon={<Building2 size={18} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === 0 && renderSendFax()}
      {activeTab === 1 && renderFaxHistory()}
      {activeTab === 2 && renderBureauDirectory()}

      {/* ===== CONFIRM DIALOG ===== */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send size={20} /> Confirm Fax Send
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Are you sure you want to send this fax?</Typography>
          <Alert severity="info">
            <strong>Document:</strong> {selectedDocument?.name}<br />
            <strong>To:</strong>{' '}
            {useCustomNumber
              ? `${customRecipient || 'Custom'} — ${formatFaxNumber(customFaxNumber)}`
              : selectedBureaus.map(id => { const b = bestNumbers[id]; return `${BUREAU_DIRECTORY[id].name} → ${b?.display} (${b?.label})`; }).join(' | ')
            }<br />
            {selectedContact && (<><strong>Contact:</strong> {selectedContact.firstName} {selectedContact.lastName}<br /></>)}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSendFax} variant="contained" startIcon={<Send size={16} />}>Send Now</Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

      {/* ===== FOOTER ===== */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
        © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        <br />Powered by Telnyx Fax API • Smart health monitoring auto-rotates to backup numbers
      </Typography>
    </Box>
  );
}