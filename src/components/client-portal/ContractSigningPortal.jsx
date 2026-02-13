// ============================================================================
// Path: /src/components/client-portal/ContractSigningPortal.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// CONTRACT SIGNING PORTAL — VERSION 3.0 MERGED 🚀
// ============================================================================
// V2.0 full infrastructure PRESERVED + V3.0 fixes applied:
//   ✅ __INITIAL_N__ marker-based click-to-initial (replaces DOM walker)
//   ✅ __SIGNATURE__ / __SCR_SIGNATURE__ / __DATE__ marker rendering
//   ✅ Tab "3-Day Right" → "5-Day Right" (federal law)
//   ✅ Enhanced document metadata (signatureType from contractTemplates V3)
//   ✅ SCR auto-signature rendered as cursive text in HTML
//   ✅ All V2.0 features intact: InitialEntryModal, SignatureCanvas,
//      callOperationsManager, Zelle, public signing, Stepper, audit trail
//
// TAB STRUCTURE (6 tabs after ACH merge):
//   Tab 0: Information Statement (CROA — MUST BE VIEWED FIRST)
//   Tab 1: Privacy Notice
//   Tab 2: Service Contract (with click-to-initial __INITIAL_N__ markers)
//   Tab 3: ACH Authorization (unified - interactive banking form)
//   Tab 4: Power of Attorney
//   Tab 5: Notice of Cancellation (5-Day Right)
//
// WORKFLOW:
//   1. Client views all documents
//   2. Client fills banking info (or defers for 7 days)
//   3. Client initials Service Contract (8+ places)
//   4. Client signs all applicable documents
//   5. SCR signature auto-applies
//   6. Submit creates: contract record, audit trail, grace period (if deferred)
//   7. Email automation triggers via Cloud Function
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Tooltip,
  Snackbar,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Grid
} from '@mui/material';
import {
  FileText,
  CheckCircle,
  Download,
  AlertTriangle,
  Shield,
  Calendar,
  User,
  DollarSign,
  X,
  Info,
  Eye,
  Lock,
  Clock,
  CreditCard,
  Scale,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Check,
  AlertCircle,
  Edit,
  Save,
  Zap
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { db, auth, storage, functions } from '../../lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { updateContactWorkflowStage, WORKFLOW_STAGES } from '@/services/workflowRouterService';
// COMPATIBILITY: Import whatever contract template function you have
import ACHBankingForm from '@/components/contract/ACHBankingForm';
import { getCachedSCRSignature } from '@/utils/scrSignatureGenerator';
import { generateZellePaymentCard } from '@/utils/zelleQRGenerator';

// ============================================================================
// ===== OPERATIONS MANAGER URL (for secure server-side public signing) =====
// When isPublicSigning=true, ALL Firestore writes route through this API
// instead of direct client-side writes (client has no Firebase auth).
// ============================================================================
const OPERATIONS_MANAGER_URL = 'https://operationsmanager-tvkxcewmxq-uc.a.run.app';

// ===== Helper: Call operationsManager API =====
const callOperationsManager = async (action, data = {}) => {
  console.log(`📡 [ContractSigningPortal] Calling operationsManager: ${action}`);
  const response = await fetch(OPERATIONS_MANAGER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { action, ...data } })
  });
  const result = await response.json();
  console.log(`📡 [ContractSigningPortal] Response for ${action}:`, result);
  if (!result.success && result.error) {
    throw new Error(result.error);
  }
  return result;
};

// ============================================================================
// ===== TAB ICON MAP =====
// ============================================================================
const TAB_ICONS = {
  Info: Info,
  Shield: Shield,
  FileText: FileText,
  CreditCard: CreditCard,
  DollarSign: DollarSign,
  Scale: Scale,
  XCircle: XCircle
};

// ============================================================================
// ===== INITIAL ENTRY MODAL COMPONENT =====
// Client can TYPE initials or DRAW them
// ============================================================================
function InitialEntryModal({ open, onClose, onSave, docId, fieldIndex }) {
  const [mode, setMode] = useState('type'); // 'type' or 'draw'
  const [typedInitials, setTypedInitials] = useState('');
  const canvasRef = useRef(null);

  const handleSave = () => {
    if (mode === 'type' && typedInitials.trim().length >= 2) {
      onSave(docId, fieldIndex, typedInitials.trim());
      handleClose();
    } else if (mode === 'draw' && canvasRef.current && !canvasRef.current.isEmpty()) {
      const dataURL = canvasRef.current.toDataURL();
      onSave(docId, fieldIndex, dataURL);
      handleClose();
    }
  };

  const handleClose = () => {
    setTypedInitials('');
    setMode('type');
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit size={24} />
          Enter Your Initials
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please enter your initials to acknowledge this section of the contract.
          </Typography>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(e, newMode) => newMode && setMode(newMode)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="type">
              <Typography sx={{ ml: 1 }}>Type Initials</Typography>
            </ToggleButton>
            <ToggleButton value="draw">
              <Typography sx={{ ml: 1 }}>Draw Initials</Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          {mode === 'type' ? (
            <TextField
              fullWidth
              label="Your Initials"
              placeholder="e.g., JD"
              value={typedInitials}
              onChange={(e) => setTypedInitials(e.target.value.slice(0, 3).toUpperCase())}
              inputProps={{ maxLength: 3 }}
              autoFocus
              helperText="2-3 characters (your first and last name initials)"
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Draw your initials below:
              </Typography>
              <Box
                sx={{
                  border: 2,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}
              >
                <SignatureCanvas
                  ref={canvasRef}
                  canvasProps={{
                    width: 500,
                    height: 150,
                    style: { width: '100%', height: '150px', touchAction: 'none' }
                  }}
                  backgroundColor="white"
                />
              </Box>
              <Button
                size="small"
                onClick={() => canvasRef.current?.clear()}
                sx={{ mt: 1 }}
              >
                Clear
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={
            (mode === 'type' && typedInitials.trim().length < 2) ||
            (mode === 'draw' && canvasRef.current?.isEmpty())
          }
        >
          Save Initials
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// ===== SIGNATURE CANVAS COMPONENT (ENHANCED) =====
// ============================================================================
function DocumentSignatureCanvas({ docId, onSignatureChange, signatureType, existingSignature }) {
  const canvasRef = useRef(null);

  const handleEnd = () => {
    if (canvasRef.current && !canvasRef.current.isEmpty()) {
      onSignatureChange(docId, canvasRef.current.toDataURL());
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      onSignatureChange(docId, null);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {signatureType === 'acknowledgment' ? '✍️ Acknowledgment Signature' : '✍️ Signature Required'}
      </Typography>

      <Box
        sx={{
          border: 2,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'white',
          overflow: 'hidden'
        }}
      >
        <SignatureCanvas
          key={`sig-${docId}`}
          ref={canvasRef}
          canvasProps={{
            width: 600,
            height: 180,
            style: { width: '100%', height: '180px', touchAction: 'none' }
          }}
          backgroundColor="white"
          onEnd={handleEnd}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<X size={16} />}
          onClick={handleClear}
        >
          Clear
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {signatureType === 'acknowledgment'
            ? 'Sign above to acknowledge you have read this document'
            : 'Sign above to agree to the terms of this document'}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// ===== MAIN COMPONENT: ContractSigningPortal (ENHANCED) =====
// ============================================================================

export default function ContractSigningPortal({ 
  contractId: propContractId, 
  onComplete,
  // ===== NEW: Public signing props (from email link flow) =====
  contactData: propContactData,   // Pre-loaded contact from token validation
  planData: propPlanData,         // Pre-loaded plan from token validation
  isPublicSigning = false,        // true = via email link, no auth required
  onSigningComplete = null,       // Callback when signing finishes (public flow)
  signingToken = null             // Token for marking as used after signing
}) {
  const { contactId: urlContactId } = useParams();
  const navigate = useNavigate();
  // Use contactId from props (public signing) or URL params (normal flow)
  const contactId = propContactData?.id || urlContactId;
  const [contractId, setContractId] = useState(propContractId);

  // ============================================================================
  // ===== STATE =====
  // ============================================================================

  // ----- Core state -----
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ----- Contact and contract data -----
  const [contact, setContact] = useState(null);
  const [contract, setContract] = useState(null);
  const [planConfig, setPlanConfig] = useState(null);

  // ----- Documents from contractTemplates.js -----
  const [documents, setDocuments] = useState([]);

  // ----- Tab and document tracking -----
  const [activeTab, setActiveTab] = useState(0);
  const [viewedTabs, setViewedTabs] = useState(new Set());
  const [signatures, setSignatures] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasViewedInfoStatement, setHasViewedInfoStatement] = useState(false);

  // ----- NEW: Initials tracking -----
  const [initials, setInitials] = useState({}); // { 'doc2_0': 'JD', 'doc2_1': 'JD', ... }
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [currentInitialField, setCurrentInitialField] = useState({ docId: null, fieldIndex: null });

  // ----- NEW: Banking info tracking -----
  const [bankingInfo, setBankingInfo] = useState({
    accountType: 'checking',
    accountName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [deferBanking, setDeferBanking] = useState(false);

  // ----- NEW: SCR signature tracking -----
  const [scrSignature, setScrSignature] = useState(null);
  const [scrSignatureApplied, setScrSignatureApplied] = useState(false);

  // ----- NEW: Zelle payment for setup fee -----
  const [zelleCard, setZelleCard] = useState(null);

  // ----- Stepper -----
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Review All Documents', 'Sign Each Document', 'Final Confirmation'];

  // ----- Session tracking -----
  const [sessionData, setSessionData] = useState({
    startTime: Date.now(),
    totalTime: 0,
    timeSpent: 0,
    currentIP: null,
    documentsViewed: 0
  });

  // ----- Confirm dialog -----
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // ============================================================================
  // ===== COMPATIBILITY HELPER: Generate contract documents =====
  // This function works with both old and new contractTemplates.js versions
  // ============================================================================
  const generateContractDocuments = async (contactData, planData) => {
    try {
      // Try to dynamically import the contract templates
      const contractTemplates = await import('@/utils/contractTemplates');
      
      // ===== Check ALL possible function names (varies by contractTemplates version) =====
      // Named exports first (most reliable)
      const generatorFn =
        contractTemplates.generateAllContractDocuments ||  // v2 format
        contractTemplates.generateAllDocuments ||          // v1 format
        contractTemplates.getContractDocuments ||          // alternate name
        // Default export might be an OBJECT containing the function (not a function itself)
        (contractTemplates.default && typeof contractTemplates.default === 'object'
          ? (contractTemplates.default.generateAllContractDocuments ||
             contractTemplates.default.generateAllDocuments ||
             contractTemplates.default.getContractDocuments)
          : null) ||
        // Default export might be a function directly
        (typeof contractTemplates.default === 'function' ? contractTemplates.default : null);

      if (generatorFn) {
        console.log('✅ Found contract template generator function');
        const result = generatorFn(contactData, planData);
        // Handle both Promise and sync returns
        const docs = result instanceof Promise ? await result : result;
        // If result is { documents: [...] } format, unwrap it
        const rawDocs = Array.isArray(docs) ? docs : (docs?.documents || docs);
        if (Array.isArray(rawDocs) && rawDocs.length > 0) {
          // Normalize docs to portal format (handles both v1 and v2 template versions)
          return normalizeDocuments(rawDocs);
        }
      }

      // No function found or returned empty
      console.warn('⚠️ No contract template function found, using fallback');
      return createFallbackDocuments(contactData, planData);
    } catch (error) {
      console.error('❌ Error loading contract templates:', error);
      return createFallbackDocuments(contactData, planData);
    }
  };

  // ===== Normalize documents from any contractTemplates version to portal format =====
  const normalizeDocuments = (docs) => {
    const shortTitleMap = {
      'Information Statement': 'Info',
      'Privacy Notice': 'Privacy',
      'Service Contract': 'Contract',
      'Contract for Credit Repair Service': 'Contract',
      'ACH Authorization': 'ACH',
      'ACH Authorization — Monthly Service': 'ACH Monthly',
      'ACH Authorization — Items & Charges': 'ACH Items',
      'Power of Attorney': 'POA',
      'Notice of Cancellation': '5-Day Right',
    };

    const iconMap = {
      'Information Statement': 'Info',
      'Privacy Notice': 'Shield',
      'Service Contract': 'FileText',
      'Contract for Credit Repair Service': 'FileText',
      'ACH Authorization': 'CreditCard',
      'ACH Authorization — Monthly Service': 'CreditCard',
      'ACH Authorization — Items & Charges': 'CreditCard',
      'Power of Attorney': 'Scale',
      'Notice of Cancellation': 'FileCheck',
    };

    return docs.map((doc, i) => ({
      id: doc.id || `doc${i}`,
      tabIndex: doc.tabIndex ?? i,
      title: doc.title || `Document ${i + 1}`,
      shortTitle: doc.shortTitle || shortTitleMap[doc.title] || doc.title?.split(' ')[0] || `Doc ${i + 1}`,
      description: doc.description || doc.subtitle || doc.title || '',
      icon: doc.icon || iconMap[doc.title] || 'FileText',
      requiresSignature: doc.requiresSignature ?? doc.requiresInitial ?? false,
      signatureType: doc.signatureType || (doc.requiresSignature ? 'signature' : 'acknowledgment'),
      isApplicable: doc.isApplicable ?? true,
      html: doc.html || '',
      // Preserve any extra fields from the template
      ...(doc.mustReadFirst && { mustReadFirst: true }),
      ...(doc.requiresBankingInfo && { requiresBankingInfo: true }),
      ...(doc.initialCount && { initialCount: doc.initialCount }),
    }));
  };

  // ===== Fallback document structure =====
  const createFallbackDocuments = (contactData, planData) => {
    return [
      {
        id: 'doc0',
        tabIndex: 0,
        title: 'Information Statement',
        shortTitle: 'Info',
        description: 'CROA Information Statement',
        icon: 'Info',
        requiresSignature: false,
        signatureType: 'acknowledgment',
        isApplicable: true,
        html: '<h1>Credit Repair Organizations Act (CROA) Disclosure</h1><p>Please review this important information...</p>'
      },
      {
        id: 'doc1',
        tabIndex: 1,
        title: 'Privacy Notice',
        shortTitle: 'Privacy',
        description: 'Privacy Policy',
        icon: 'Shield',
        requiresSignature: false,
        isApplicable: true,
        html: '<h1>Privacy Notice</h1><p>Your privacy is important to us...</p>'
      },
      {
        id: 'doc2',
        tabIndex: 2,
        title: 'Service Contract',
        shortTitle: 'Contract',
        description: 'Service Agreement',
        icon: 'FileText',
        requiresSignature: true,
        signatureType: 'agreement',
        isApplicable: true,
        html: '<h1>Service Agreement</h1><p>I ____ (initial) agree to the terms...</p>'
      },
      {
        id: 'doc3',
        tabIndex: 3,
        title: 'ACH Authorization',
        shortTitle: 'ACH',
        description: 'Payment Authorization',
        icon: 'CreditCard',
        requiresSignature: true,
        isApplicable: true,
        html: '' // Will use ACHBankingForm component
      },
      {
        id: 'doc4',
        tabIndex: 4,
        title: 'Power of Attorney',
        shortTitle: 'POA',
        description: 'Authorization',
        icon: 'Scale',
        requiresSignature: true,
        isApplicable: true,
        html: '<h1>Power of Attorney</h1><p>I authorize Speedy Credit Repair...</p>'
      },
      {
        id: 'doc5',
        tabIndex: 5,
        title: 'Notice of Cancellation',
        shortTitle: '5-Day Right',
        description: 'Your Right to Cancel',
        icon: 'FileCheck',
        requiresSignature: false,
        isApplicable: true,
        html: '<h1>Notice of Right to Cancel</h1><p>You have the right to cancel...</p>'
      }
    ];
  };

  // ============================================================================
  // ===== LIFECYCLE: Load contract on mount =====
  // ============================================================================

  useEffect(() => {
    if (contractId || contactId) {
      console.log('📄 ContractSigningPortal MERGED v3.0 initialized');
      console.log('   - contactId:', contactId);
      console.log('   - contractId:', contractId);
      loadContractData();
      detectIP();
      preloadSCRSignature();
    }
  }, [contractId, contactId]);

  // ===== Track time on page =====
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
        totalTime: Date.now() - prev.startTime
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===== Mark tab as viewed when activeTab changes =====
  useEffect(() => {
    if (documents.length > 0 && activeTab >= 0) {
      setViewedTabs(prev => {
        const next = new Set(prev);
        next.add(activeTab);
        return next;
      });
      setSessionData(prev => ({
        ...prev,
        documentsViewed: Math.max(prev.documentsViewed, activeTab + 1)
      }));

      if (activeTab === 0) {
        setHasViewedInfoStatement(true);
      }
    }
  }, [activeTab, documents.length]);

  // ===== NEW: Auto-apply SCR signature when all client signatures complete =====
  useEffect(() => {
    checkAndApplySCRSignature();
  }, [signatures, initials, bankingInfo, deferBanking]);

  // ============================================================================
  // ===== V3.0: PROCESS DOCUMENT HTML (marker-based system) =====
  // ============================================================================
  // Replaces V2's DOM walker with explicit marker processing.
  // contractTemplates V3.0 uses these markers in HTML:
  //   __INITIAL_N__     → Clickable initial button
  //   __SIGNATURE__     → Clickable sign button (or placed signature image)
  //   __SCR_SIGNATURE__ → SCR auto-signature (cursive text or placeholder)
  //   __DATE__          → Current date
  // ============================================================================

  const processDocumentHtml = (docObj) => {
    let html = docObj.html || '';
    const docId = docObj.id;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // ===== Replace __DATE__ with formatted date =====
    html = html.replace(/__DATE__/g, today);

    // ===== Replace __INITIAL_N__ with clickable buttons =====
    html = html.replace(/__INITIAL_(\d+)__/g, (match, index) => {
      const key = `${docId}_${index}`;
      const hasInitial = initials[key];
      if (hasInitial) {
        // Show completed initial (green badge)
        if (hasInitial.startsWith('data:image')) {
          return `<span style="display:inline-block; padding:2px 8px; background:#e8f5e9; border:2px solid #4caf50; border-radius:4px; vertical-align:middle;"><img src="${hasInitial}" style="height:24px;" /> ✓</span>`;
        }
        return `<span style="display:inline-block; padding:4px 12px; background:#e8f5e9; border:2px solid #4caf50; border-radius:4px; font-weight:bold; color:#2e7d32; cursor:pointer;" data-initial-field="${key}" title="Click to change initials">${hasInitial} ✓</span>`;
      }
      // Show clickable placeholder (yellow button)
      return `<span style="display:inline-block; padding:4px 12px; background:#fff3cd; border:2px solid #ffc107; border-radius:4px; font-weight:bold; color:#856404; cursor:pointer; transition:background-color 0.2s;" data-initial-field="${key}" title="Click to add your initials">____ (click to initial)</span>`;
    });

    // ===== Replace __SIGNATURE__ with sign button or placed signature =====
    if (signatures[docId]) {
      // Signature already placed — show confirmation
      html = html.replace(/__SIGNATURE__/g,
        `<span style="display:inline-block; padding:4px 12px; background:#e8f5e9; border:2px solid #4caf50; border-radius:4px; color:#2e7d32; font-weight:bold;">✓ Signed</span>`
      );
    } else {
      // Show "Sign Here" placeholder
      html = html.replace(/__SIGNATURE__/g,
        `<span style="display:inline-block; padding:4px 12px; background:#e3f2fd; border:2px solid #1976d2; border-radius:4px; color:#1565c0; font-weight:bold; cursor:default;">⬇ Sign below ⬇</span>`
      );
    }

    // ===== Replace __SCR_SIGNATURE__ with auto-signature or placeholder =====
    if (scrSignatureApplied && scrSignature) {
      html = html.replace(/__SCR_SIGNATURE__/g,
        `<span style="font-family:'Brush Script MT','Segoe Script',cursive; font-size:22px; color:#1a365d; font-weight:bold;">Christopher Lahage</span> <span style="color:#4caf50;">✓</span>`
      );
    } else {
      html = html.replace(/__SCR_SIGNATURE__/g,
        `<span style="display:inline-block; padding:4px 12px; background:#f5f5f5; border:1px dashed #999; border-radius:4px; color:#999; font-style:italic;">(SCR signature — auto-applied when complete)</span>`
      );
    }

    return html;
  };

  // ===== V3.0: Handle clicks on initial markers (event delegation) =====
  const handleDocumentClick = (e) => {
    const initialField = e.target.closest('[data-initial-field]');
    if (initialField) {
      const key = initialField.getAttribute('data-initial-field');
      // key format: "doc2_3" → docId = "doc2", fieldIndex = 3
      const parts = key.split('_');
      const docId = parts[0];
      const fieldIndex = parseInt(parts[1], 10);
      handleInitialClick(docId, fieldIndex);
    }
  };

  // ============================================================================
  // ===== DETECT IP ADDRESS =====
  // ============================================================================

  const detectIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setSessionData(prev => ({ ...prev, currentIP: data.ip }));
      console.log('✅ IP detected:', data.ip);
    } catch (err) {
      console.warn('⚠️ Could not detect IP:', err);
    }
  };

  // ============================================================================
  // ===== NEW: Preload SCR signature =====
  // ============================================================================

  const preloadSCRSignature = async () => {
    try {
      const signature = await getCachedSCRSignature();
      setScrSignature(signature);
      console.log('✅ SCR signature preloaded');
    } catch (err) {
      console.error('❌ Failed to preload SCR signature:', err);
    }
  };

  // ============================================================================
  // ===== LOAD CONTRACT DATA =====
  // ============================================================================

  const loadContractData = async () => {
    try {
      setLoading(true);
      setError(null);

      let contactData;
      let selectedPlan;

      // ===== PUBLIC SIGNING: Use prop data (from email link token validation) =====
      if (isPublicSigning && propContactData) {
        console.log('📝 Public signing mode — using pre-loaded contact data');
        contactData = { ...propContactData };
        setContact(contactData);
        console.log('✅ Contact loaded from props:', contactData.firstName, contactData.lastName);

        // Use prop plan data or default
        if (propPlanData) {
          selectedPlan = propPlanData;
        } else {
          selectedPlan = { id: 'standard', name: 'Standard Plan', monthlyPrice: 149, setupFee: 99 };
        }
        setPlanConfig(selectedPlan);

        // ===== PUBLIC SIGNING: In-memory contract placeholder =====
        // We do NOT create a Firestore contract doc here because the client
        // has no Firebase auth. The real contract will be created server-side
        // by the `submitSignedContract` case block when they hit Submit.
        // This placeholder just satisfies the UI's need for a contract object.
        const placeholderContractId = `pending_${Date.now()}`;
        const contractData2 = { 
          id: placeholderContractId, 
          planId: selectedPlan.id, 
          planName: selectedPlan.name,
          status: 'pending_public_signing'
        };
        setContract(contractData2);
        setContractId(placeholderContractId);
        console.log('✅ In-memory contract placeholder created:', placeholderContractId);
        console.log('   (Real contract will be created server-side on Submit)');


      } else {
        // ===== NORMAL FLOW: Load from Firestore =====

      // Load contact
      const contactRef = doc(db, 'contacts', contactId);
      const contactSnap = await getDoc(contactRef);

      if (!contactSnap.exists()) {
        throw new Error('Contact not found');
      }

      contactData = { id: contactSnap.id, ...contactSnap.data() };
      setContact(contactData);
      console.log('✅ Contact loaded:', contactData.firstName, contactData.lastName);

      // Load or create contract
      let contractData;

      if (contractId) {
        const contractRef = doc(db, 'contracts', contractId);
        const contractSnap = await getDoc(contractRef);

        if (!contractSnap.exists()) {
          throw new Error('Contract not found');
        }

        contractData = { id: contractSnap.id, ...contractSnap.data() };
      } else {
        // Create new contract
        const newContractRef = await addDoc(collection(db, 'contracts'), {
          contactId: contactId,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        contractData = { id: newContractRef.id };
        setContractId(newContractRef.id);
      }

      setContract(contractData);

      // Load plan configuration
      const planId = contractData.planId || contactData.selectedPlan || 'standard';
      const plansQuery = query(collection(db, 'servicePlans'), where('id', '==', planId), limit(1));
      const plansSnap = await getDocs(plansQuery);

      if (!plansSnap.empty) {
        selectedPlan = plansSnap.docs[0].data();
      } else {
        selectedPlan = { id: 'standard', name: 'Standard Plan', monthlyPrice: 149, setupFee: 99 };
      }

      setPlanConfig(selectedPlan);

      } // end normal flow

      // Generate documents
      const generatedDocs = await generateContractDocuments(contactData, selectedPlan);
      setDocuments(generatedDocs);
      console.log(`✅ Generated ${generatedDocs.length} contract documents`);

      // Auto-populate banking info
      if (contactData.firstName && contactData.lastName) {
        setBankingInfo(prev => ({
          ...prev,
          accountName: `${contactData.firstName} ${contactData.lastName}`.trim()
        }));
      }

      // Generate Zelle card if setup fee exists
      if (selectedPlan.setupFee && selectedPlan.setupFee > 0) {
        const card = await generateZellePaymentCard({
          email: 'Pay@speedycreditrepair.com',
          displayEmail: 'Pay@speedycreditrepair.com',
          amount: selectedPlan.setupFee,
          note: `Setup Fee - ${contactData.firstName} ${contactData.lastName}`,
          title: 'Pay Setup Fee via Zelle',
          description: 'Start your service immediately'
        });
        setZelleCard(card);
        console.log('✅ Zelle payment card generated');
      }

      setViewedTabs(new Set([0]));
      setHasViewedInfoStatement(true);

    } catch (err) {
      console.error('❌ Error loading contract data:', err);
      setError(err.message || 'Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ===== HANDLE TAB CHANGE =====
  // ============================================================================

  const handleTabChange = (event, newValue) => {
    if (!hasViewedInfoStatement && newValue !== 0) {
      setSnackbar({
        open: true,
        message: '⚠️ Federal law (CROA) requires you to read the Information Statement first.',
        severity: 'warning'
      });
      setActiveTab(0);
      return;
    }

    setActiveTab(newValue);
  };

  // ============================================================================
  // ===== NEW: Handle initials entry =====
  // ============================================================================

  const handleInitialClick = (docId, fieldIndex) => {
    setCurrentInitialField({ docId, fieldIndex });
    setInitialModalOpen(true);
  };

  const handleInitialSave = (docId, fieldIndex, initialValue) => {
    const key = `${docId}_${fieldIndex}`;
    setInitials(prev => ({
      ...prev,
      [key]: initialValue
    }));
    console.log(`✅ Initial saved: ${key} = ${initialValue}`);
  };

  // ============================================================================
  // ===== Handle signature change =====
  // ============================================================================

  const handleSignatureChange = useCallback((docId, signatureData) => {
    setSignatures(prev => {
      const next = { ...prev };
      if (signatureData) {
        next[docId] = signatureData;
      } else {
        delete next[docId];
      }
      return next;
    });
  }, []);

  // ============================================================================
  // ===== NEW: Handle banking info change =====
  // ============================================================================

  const handleBankingChange = (field, value) => {
    setBankingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ============================================================================
  // ===== NEW: Check and apply SCR signature =====
  // ============================================================================

  const checkAndApplySCRSignature = () => {
    if (scrSignatureApplied || !scrSignature) return;

    // Check if all CLIENT requirements are complete
    const allClientInitialsComplete = checkAllInitialsComplete();
    const allClientSignaturesComplete = checkAllClientSignaturesComplete();
    const bankingComplete = deferBanking || isBankingInfoComplete();

    if (allClientInitialsComplete && allClientSignaturesComplete && bankingComplete) {
      console.log('✅ All client requirements complete — applying SCR signature');

      // Apply SCR signature to all applicable documents
      setSignatures(prev => {
        const updated = { ...prev };

        // Add SCR signature to documents that need it
        // (This would be refined based on which docs need SCR signature)
        documents.forEach(doc => {
          if (doc.requiresSignature && doc.id !== 'doc0' && doc.id !== 'doc1') {
            // Don't override client signatures, add SCR as separate field
            // For now, we'll store as 'scr_sig' suffix
            updated[`${doc.id}_scr`] = scrSignature;
          }
        });

        return updated;
      });

      setScrSignatureApplied(true);

      setSnackbar({
        open: true,
        message: '✅ Speedy Credit Repair signature applied automatically',
        severity: 'success'
      });
    }
  };

  const checkAllInitialsComplete = () => {
    // Service Contract (doc2) typically has 8 initial fields
    // For now, we'll check if at least 5 initials are present
    const serviceContractInitials = Object.keys(initials).filter(key => key.startsWith('doc2_'));
    return serviceContractInitials.length >= 5;
  };

  const checkAllClientSignaturesComplete = () => {
    const signableDocs = documents.filter(d => d.isApplicable && d.requiresSignature);
    const signedCount = signableDocs.filter(d => signatures[d.id]).length;
    return signedCount === signableDocs.length;
  };

  const isBankingInfoComplete = () => {
    return (
      bankingInfo.accountType &&
      bankingInfo.accountName &&
      bankingInfo.bankName &&
      bankingInfo.accountNumber &&
      bankingInfo.routingNumber &&
      bankingInfo.routingNumber.length === 9 &&
      bankingInfo.accountNumber.length >= 4
    );
  };

  // ============================================================================
  // ===== COMPUTED: Progress tracking =====
  // ============================================================================

  const applicableDocs = documents.filter(d => d.isApplicable);
  const signableApplicableDocs = applicableDocs.filter(d => d.requiresSignature);
  const viewedCount = applicableDocs.filter(d => viewedTabs.has(d.tabIndex)).length;
  const signedCount = signableApplicableDocs.filter(d => signatures[d.id]).length;
  const allViewed = viewedCount === applicableDocs.length;
  const allSigned = signedCount === signableApplicableDocs.length;
  const allInitialsComplete = checkAllInitialsComplete();
  const bankingComplete = deferBanking || isBankingInfoComplete();

  const progressPercent = applicableDocs.length > 0
    ? Math.round(((viewedCount + signedCount) / (applicableDocs.length + signableApplicableDocs.length)) * 100)
    : 0;

  const canSubmit = allViewed && allSigned && allInitialsComplete && bankingComplete && agreedToTerms && !processing;

  // ============================================================================
  // ===== GET TAB STATUS =====
  // ============================================================================

  const getTabStatus = (docIndex) => {
    const docObj = documents[docIndex];
    if (!docObj) return 'not_viewed';

    if (!hasViewedInfoStatement && docIndex !== 0) return 'locked';

    const isViewed = viewedTabs.has(docIndex);
    const isSigned = docObj.requiresSignature && signatures[docObj.id];

    if (isSigned) return 'signed';
    if (isViewed) return 'viewed';
    return 'not_viewed';
  };

  // ============================================================================
  // ===== HANDLE SUBMIT =====
  // ============================================================================

  const handleSubmit = async () => {
    try {
      setProcessing(true);
      setError(null);
      setConfirmDialogOpen(false);
      console.log('📝 Submitting signed contract...');

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine
      };

      // =================================================================
      // PUBLIC SIGNING PATH: Route ALL writes through backend API
      // =================================================================
      // When signing via email link, the client has no Firebase auth.
      // Instead of writing to Firestore directly (which would fail),
      // we send everything to the `submitSignedContract` case block
      // in operationsManager. The server handles:
      //   - Contract creation
      //   - Signature uploads to Storage
      //   - ACH authorization / grace period
      //   - Audit trail
      //   - Contact update (triggers Scenario 3 automation)
      //   - Token invalidation
      // =================================================================
      if (isPublicSigning && signingToken) {
        console.log('🔒 PUBLIC SIGNING: Routing through secure server-side API');
        
        try {
          const apiResult = await callOperationsManager('submitSignedContract', {
            token: signingToken,
            contactId: contact.id,
            // Send raw base64 signatures — server uploads to Storage
            signatures: { ...signatures },
            // Send raw initials (base64 for drawn, text for typed)
            initials: { ...initials },
            // Banking info (or null if deferred)
            bankingInfo: deferBanking ? null : bankingInfo,
            deferBanking: deferBanking,
            // Session forensics for audit trail
            sessionData: {
              currentIP: sessionData.currentIP,
              timeSpent: sessionData.timeSpent,
              totalTime: sessionData.totalTime,
              documentsViewed: sessionData.documentsViewed,
              startTime: sessionData.startTime
            },
            deviceInfo: JSON.stringify(deviceInfo),
            scrSignatureApplied: scrSignatureApplied,
            viewedTabs: Array.from(viewedTabs),
            planId: contract.planId || planConfig?.id,
            planName: contract.planName || planConfig?.name,
            agreedToTerms: true
          });
          
          console.log('✅ Server-side contract submission successful:', apiResult);
          
          // Update local state with real contract ID from server
          if (apiResult.contractId) {
            setContract(prev => ({ ...prev, id: apiResult.contractId }));
            setContractId(apiResult.contractId);
          }
          
          // Success
          setSuccess(true);
          setActiveStep(2);
          
          setSnackbar({
            open: true,
            message: '🎉 All documents signed successfully!',
            severity: 'success'
          });
          
          // Call the PublicContractSigningRoute completion callback
          if (onSigningComplete) {
            console.log('📝 Public signing complete — calling onSigningComplete callback');
            onSigningComplete(apiResult.contractId);
          }
          
          return; // Don't continue to the in-app Firestore path below
          
        } catch (apiError) {
          console.error('❌ Server-side submission failed:', apiError);
          throw new Error(apiError.message || 'Failed to submit contract. Please try again or call (888) 960-1718.');
        }
      }

      // =================================================================
      // IN-APP SIGNING PATH: Direct Firestore writes (user is authenticated)
      // =================================================================
      console.log('📝 IN-APP SIGNING: Using direct Firestore writes');

      // Upload signatures
      const signatureURLs = {};
      for (const [docId, dataURL] of Object.entries(signatures)) {
        try {
          const sigRef = ref(storage, `signatures/${contract.id}/${docId}_${Date.now()}.png`);
          const blob = await (await fetch(dataURL)).blob();
          await uploadBytes(sigRef, blob);
          const url = await getDownloadURL(sigRef);
          signatureURLs[docId] = url;
          console.log(`  ✅ Signature uploaded: ${docId}`);
        } catch (sigErr) {
          console.error(`  ❌ Signature upload failed for ${docId}:`, sigErr);
          signatureURLs[docId] = dataURL;
        }
      }

      // Upload initials
      const initialURLs = {};
      for (const [key, initialValue] of Object.entries(initials)) {
        try {
          if (initialValue.startsWith('data:image')) {
            // It's a drawn initial (dataURL)
            const initRef = ref(storage, `initials/${contract.id}/${key}_${Date.now()}.png`);
            const blob = await (await fetch(initialValue)).blob();
            await uploadBytes(initRef, blob);
            const url = await getDownloadURL(initRef);
            initialURLs[key] = url;
          } else {
            // It's typed initials (text)
            initialURLs[key] = initialValue;
          }
        } catch (err) {
          console.error(`  ❌ Initial upload failed for ${key}:`, err);
          initialURLs[key] = initialValue;
        }
      }

      // Update contract
      const contractRef = doc(db, 'contracts', contract.id);
      await updateDoc(contractRef, {
        status: 'signed',
        signedAt: serverTimestamp(),
        signatures: signatureURLs,
        initials: initialURLs,
        scrSignatureApplied: scrSignatureApplied,
        ipAddress: sessionData.currentIP,
        deviceInfo,
        sessionData: {
          totalTime: sessionData.totalTime,
          timeSpent: sessionData.timeSpent,
          documentsViewed: sessionData.documentsViewed,
          startTime: sessionData.startTime
        },
        viewedTabs: Array.from(viewedTabs),
        agreedToTerms: true,
        bankingInfo: deferBanking ? null : bankingInfo,
        bankingDeferred: deferBanking,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contract updated');

      // Create ACH authorization record (if banking provided)
      if (!deferBanking) {
        await addDoc(collection(db, 'achAuthorizations'), {
          contactId: contact.id,
          contractId: contract.id,
          status: 'authorized',
          bankingInfo: {
            ...bankingInfo,
            accountNumber: `****${bankingInfo.accountNumber.slice(-4)}`, // Mask for storage
            routingNumber: bankingInfo.routingNumber
          },
          authorizedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        console.log('✅ ACH authorization created');
      } else {
        // Create grace period record
        const gracePeriodDeadline = new Date();
        gracePeriodDeadline.setDate(gracePeriodDeadline.getDate() + 7);

        await addDoc(collection(db, 'paymentIntents'), {
          contactId: contact.id,
          contractId: contract.id,
          type: 'setup_fee',
          amount: planConfig?.setupFee || 0,
          status: 'pending_ach_setup',
          gracePeriodDeadline: gracePeriodDeadline.toISOString(),
          remindersSent: 0,
          createdAt: serverTimestamp()
        });
        console.log('✅ Grace period tracking created');
      }

      // Create audit trail
      await addDoc(collection(db, 'auditTrail'), {
        contractId: contract.id,
        contactId: contact.id,
        action: 'contract_signed',
        timestamp: serverTimestamp(),
        ipAddress: sessionData.currentIP,
        deviceInfo,
        signatureCount: Object.keys(signatureURLs).length,
        initialCount: Object.keys(initialURLs).length,
        bankingDeferred: deferBanking,
        scrSignatureApplied: scrSignatureApplied,
        documentsViewed: Array.from(viewedTabs).length,
        totalTimeSeconds: Math.round(sessionData.timeSpent),
        planId: contract.planId || planConfig?.id,
        planName: contract.planName || planConfig?.name
      });
      console.log('✅ Audit trail created');

      // Update contact
      const contactRef = doc(db, 'contacts', contact.id);
      await updateDoc(contactRef, {
        pipelineStage: 'contract_signed',
        contractSigned: true,
        contractSignedAt: serverTimestamp(),
        contractSignedVia: isPublicSigning ? 'email_link' : 'in_app',
        contractId: contract.id,
        achAuthorized: !deferBanking,
        bankingDeferred: deferBanking,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Contact updated');

      // Update workflow
      try {
        await updateContactWorkflowStage(contact.id, WORKFLOW_STAGES.CONTRACT_SIGNED, {
          contractId: contract.id,
          signedAt: new Date().toISOString(),
          planId: contract.planId || planConfig?.id,
          planName: contract.planName || planConfig?.name,
          bankingDeferred: deferBanking
        });
        console.log('✅ Workflow updated');
      } catch (wfErr) {
        console.warn('⚠️ Workflow update failed (non-critical):', wfErr);
      }

      // Success
      setSuccess(true);
      setActiveStep(2);

      setSnackbar({
        open: true,
        message: '🎉 All documents signed successfully!',
        severity: 'success'
      });

      if (onComplete) {
        onComplete(contract.id);
      }

      setTimeout(() => {
        navigate(`/ach-authorization/${contact.id}`);
      }, 3000);

    } catch (err) {
      console.error('❌ Error signing contract:', err);
      setError(err.message || 'Failed to sign contract');
      setSnackbar({
        open: true,
        message: err.message || 'Error signing contract',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // ============================================================================
  // ===== RENDER: Loading =====
  // ============================================================================

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">Loading your contract documents...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Generating personalized agreements
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ============================================================================
  // ===== RENDER: Error =====
  // ============================================================================

  if (error && !contract) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Unable to Load Contract</AlertTitle>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} startIcon={<ArrowLeft size={18} />}>
          Go Back
        </Button>
      </Container>
    );
  }

  // ============================================================================
  // ===== RENDER: Success =====
  // ============================================================================

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckCircle size={80} color="#4caf50" style={{ marginBottom: 16 }} />
            <Typography variant="h4" gutterBottom>
              All Documents Signed! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your {planConfig?.name || 'service'} contract has been signed and recorded.
              You'll receive a confirmation email shortly.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to document upload...
            </Typography>
            <LinearProgress sx={{ mt: 3, maxWidth: 300, mx: 'auto' }} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ============================================================================
  // ===== RENDER: Main UI =====
  // ============================================================================

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: 'primary.main', 
        color: 'white',
        borderRadius: 2,
        boxShadow: 2
      }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
          <FileText size={32} />
          Contract Signing Portal
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Please review and sign all documents for your {planConfig?.name || 'service'} plan
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Overall Progress</Typography>
            <Typography variant="h6" color="primary.main" fontWeight={600}>{progressPercent}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                bgcolor: progressPercent === 100 ? 'success.main' : 'primary.main'
              }
            }} 
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              icon={allViewed ? <CheckCircle size={14} /> : <Clock size={14} />}
              label={`Viewed: ${viewedCount}/${applicableDocs.length}`}
              color={allViewed ? 'success' : 'default'}
            />
            <Chip
              size="small"
              icon={allSigned ? <CheckCircle size={14} /> : <Clock size={14} />}
              label={`Signed: ${signedCount}/${signableApplicableDocs.length}`}
              color={allSigned ? 'success' : 'default'}
            />
            <Chip
              size="small"
              icon={allInitialsComplete ? <CheckCircle size={14} /> : <Clock size={14} />}
              label={`Initials: ${Object.keys(initials).length}`}
              color={allInitialsComplete ? 'success' : 'default'}
            />
            <Chip
              size="small"
              icon={bankingComplete ? <CheckCircle size={14} /> : <Clock size={14} />}
              label={`Banking: ${deferBanking ? 'Deferred' : bankingComplete ? 'Complete' : 'Pending'}`}
              color={bankingComplete ? 'success' : 'default'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Documents Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 80,
              py: 2
            }
          }}
        >
          {documents.map((docObj, index) => {
            const status = getTabStatus(index);
            const isActive = index === activeTab;

            return (
              <Tab
                key={docObj.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status === 'signed' && <CheckCircle size={16} color="#4caf50" />}
                    {status === 'viewed' && <Eye size={16} color="#ff9800" />}
                    {status === 'locked' && <Lock size={16} color="#999" />}
                    {status === 'not_viewed' && <AlertCircle size={16} color="#999" />}

                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" fontWeight={isActive ? 'bold' : 'normal'}>
                        {docObj.shortTitle}
                      </Typography>
                      {!docObj.isApplicable && (
                        <Typography variant="caption" color="text.disabled" display="block">
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
                disabled={status === 'locked'}
                sx={{
                  opacity: status === 'locked' ? 0.5 : 1,
                  borderBottom: status === 'signed' ? '3px solid #4caf50' :
                                status === 'viewed' ? '3px solid #ff9800' : 'none'
                }}
              />
            );
          })}
        </Tabs>

        {/* Tab Content */}
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {documents.map((docObj, index) => {
            if (index !== activeTab) return null;

            return (
              <Box key={docObj.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {React.createElement(TAB_ICONS[docObj.icon] || FileText, { size: 24, color: '#1976d2' })}
                  <Box>
                    <Typography variant="h6">{docObj.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {docObj.description}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {docObj.isApplicable ? (
                  <>
                    {/* ACH Tab: Use interactive component */}
                    {docObj.id === 'doc3' ? (
                      <ACHBankingForm
                        contact={contact}
                        plan={planConfig}
                        bankingInfo={bankingInfo}
                        onBankingChange={handleBankingChange}
                        deferBanking={deferBanking}
                        onDeferChange={setDeferBanking}
                      />
                    ) : (
                      /* Other tabs: HTML content with V3.0 marker processing */
                      <Paper
                        variant="outlined"
                        className="document-content"
                        onClick={handleDocumentClick}
                        sx={{
                          p: { xs: 2, md: 3 },
                          maxHeight: 600, // ✅ C10: Increased from 500 to 600 for less scrolling
                          overflow: 'auto',
                          bgcolor: '#fafafa',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '& h1': { fontSize: '1.5rem', color: '#1a365d', mb: 2, fontWeight: 600 },
                          '& h2': { fontSize: '1.2rem', color: '#2d3748', mt: 2, mb: 1.5, fontWeight: 600 },
                          '& h3': { fontSize: '1.1rem', color: '#4a5568', mt: 1.5, mb: 1, fontWeight: 500 },
                          '& p': { mb: 1.5, lineHeight: 1.7, color: '#2d3748' },
                          '& ul, & ol': { pl: 3, mb: 1.5 },
                          '& li': { mb: 0.5, lineHeight: 1.6 },
                          '& strong': { color: '#1a202c', fontWeight: 600 },
                          '& .initial-marker': { 
                            display: 'inline-block',
                            minWidth: '80px',
                            borderBottom: '2px solid #1976d2',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: '#1976d2',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: processDocumentHtml(docObj) }}
                      />
                    )}

                    {/* Signature Canvas */}
                    {docObj.requiresSignature && (
                      <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '2px dashed', borderColor: 'primary.main' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Edit size={20} />
                          Signature Required
                        </Typography>

                        {signatures[docObj.id] ? (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle size={18} />
                              Document signed ✓
                            </Box>
                          </Alert>
                        ) : (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Please sign below to acknowledge this document
                          </Alert>
                        )}

                        <DocumentSignatureCanvas
                          docId={docObj.id}
                          onSignatureChange={handleSignatureChange}
                          signatureType={docObj.signatureType}
                        />
                      </Box>
                    )}

                    {/* Zelle Payment Card (if banking deferred and setup fee exists) */}
                    {docObj.id === 'doc3' && deferBanking && zelleCard && (
                      <Box sx={{ mt: 4 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <AlertTitle>Alternative Payment Option</AlertTitle>
                          Since you've deferred banking information, you can pay your setup fee via Zelle
                          to start service immediately:
                        </Alert>
                        <Box dangerouslySetInnerHTML={{ __html: zelleCard.htmlCard }} />
                      </Box>
                    )}
                  </>
                ) : (
                  <Alert severity="info">
                    <AlertTitle>Not Applicable</AlertTitle>
                    This document does not apply to your selected plan ({planConfig?.name}).
                  </Alert>
                )}

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={() => activeTab > 0 && setActiveTab(activeTab - 1)}
                    disabled={activeTab === 0}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={<ArrowRight size={18} />}
                    onClick={() => activeTab < documents.length - 1 && setActiveTab(activeTab + 1)}
                    disabled={activeTab === documents.length - 1}
                  >
                    Next Document
                  </Button>
                </Box>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>Document Status</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {documents.map((docObj) => {
              const status = getTabStatus(docObj.tabIndex);
              return (
                <Chip
                  key={docObj.id}
                  size="small"
                  icon={
                    status === 'signed' ? <CheckCircle size={14} /> :
                    status === 'viewed' ? <Eye size={14} /> :
                    status === 'locked' ? <Lock size={14} /> :
                    <AlertCircle size={14} />
                  }
                  label={docObj.shortTitle}
                  color={
                    status === 'signed' ? 'success' :
                    status === 'viewed' ? 'warning' :
                    'default'
                  }
                  variant={status === 'signed' ? 'filled' : 'outlined'}
                  onClick={() => status !== 'locked' && setActiveTab(docObj.tabIndex)}
                  sx={{ cursor: status === 'locked' ? 'not-allowed' : 'pointer' }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Final Submission */}
      <Card sx={{ mt: 3, border: canSubmit ? '2px solid #4caf50' : '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Send size={22} />
            Submit All Documents
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {allViewed ? <CheckCircle size={18} color="#4caf50" /> : <AlertCircle size={18} color="#ff9800" />}
              <Typography variant="body2">
                {allViewed ? 'All documents viewed ✓' : `View all documents (${viewedCount}/${applicableDocs.length})`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {allSigned ? <CheckCircle size={18} color="#4caf50" /> : <AlertCircle size={18} color="#ff9800" />}
              <Typography variant="body2">
                {allSigned ? 'All documents signed ✓' : `Sign all documents (${signedCount}/${signableApplicableDocs.length})`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {allInitialsComplete ? <CheckCircle size={18} color="#4caf50" /> : <AlertCircle size={18} color="#ff9800" />}
              <Typography variant="body2">
                {allInitialsComplete ? 'All initials provided ✓' : `Add initials to Service Contract (${Object.keys(initials).length} provided)`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {bankingComplete ? <CheckCircle size={18} color="#4caf50" /> : <AlertCircle size={18} color="#ff9800" />}
              <Typography variant="body2">
                {bankingComplete ? (deferBanking ? 'Banking deferred for 7 days ✓' : 'Banking information complete ✓') : 'Provide banking information'}
              </Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
            }
            label="I have read and agree to all terms and conditions in these documents"
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!canSubmit}
            onClick={() => setConfirmDialogOpen(true)}
            startIcon={processing ? <CircularProgress size={20} /> : <Send size={20} />}
            sx={{ mt: 2 }}
          >
            {processing ? 'Submitting...' : 'Submit All Signed Documents'}
          </Button>

          {!canSubmit && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please complete all requirements above before submitting.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Document Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You are about to submit {documents.filter(d => d.isApplicable).length} signed legal documents.
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            By submitting, you confirm that:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><Typography variant="body2">All information provided is accurate</Typography></li>
            <li><Typography variant="body2">You have read and understood all documents</Typography></li>
            <li><Typography variant="body2">Your signatures and initials are legally binding</Typography></li>
            {deferBanking && (
              <li><Typography variant="body2">You will provide banking information within 7 days</Typography></li>
            )}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Confirm and Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Initial Entry Modal */}
      <InitialEntryModal
        open={initialModalOpen}
        onClose={() => setInitialModalOpen(false)}
        onSave={handleInitialSave}
        docId={currentInitialField.docId}
        fieldIndex={currentInitialField.fieldIndex}
      />
    </Container>
  );
}