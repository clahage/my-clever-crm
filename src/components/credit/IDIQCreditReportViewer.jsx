// ===========================================================================
// Path: src/components/credit/IDIQCreditReportViewer.jsx
// IDIQ Credit Report Viewer using IDIQ's MicroFrontend Widget
// FIXED: Sets IDIQ_CREDIT_REPORT_CONFIG BEFORE loading script (like PHP)
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ===========================================================================

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  Shield,
  User,
  Calendar
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// ===== IDIQ CREDIT REPORT VIEWER COMPONENT =====
// ===== FIXED: Config set BEFORE script loads (matches working PHP pattern) =====
const IDIQCreditReportViewer = ({
  contactId,
  enrollmentId,
  memberToken: propMemberToken,  // ===== NEW: Accept token as prop =====
  showHeader = true,
  minHeight = 600,
  onReportLoaded = null,
  onError = null
}) => {
  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberToken, setMemberToken] = useState(propMemberToken || null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [contact, setContact] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  const widgetContainerRef = useRef(null);
  const scriptLoadAttempted = useRef(false);

  // ===== UPDATE TOKEN FROM PROP =====
  useEffect(() => {
    if (propMemberToken && propMemberToken !== memberToken) {
      console.log('🔑 Member token received from prop');
      setMemberToken(propMemberToken);
    }
  }, [propMemberToken]);

  // ===== FETCH CONTACT DATA =====
  useEffect(() => {
    if (!contactId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'contacts', contactId),
      (docSnap) => {
        if (docSnap.exists()) {
          setContact({ id: docSnap.id, ...docSnap.data() });
        }
      },
      (err) => {
        console.error('Error fetching contact:', err);
      }
    );

    return () => unsubscribe();
  }, [contactId]);

  // ===== FETCH ENROLLMENT DATA AND MEMBER TOKEN =====
  const fetchMemberToken = useCallback(async (forceRefresh = false) => {
    // If we already have a token from props, use it
    if (propMemberToken && !forceRefresh) {
      console.log('✅ Using member token from props');
      setMemberToken(propMemberToken);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Fetching member token...', { enrollmentId, contactId, forceRefresh });

      // First try to get stored token from enrollment
      if (enrollmentId && !forceRefresh) {
        const enrollmentDoc = await getDoc(doc(db, 'idiqEnrollments', enrollmentId));

        if (enrollmentDoc.exists()) {
          const enrollmentData = enrollmentDoc.data();
          setEnrollment({ id: enrollmentDoc.id, ...enrollmentData });

          // Check if we have a valid token
          if (enrollmentData.memberAccessToken) {
            const expiresAt = enrollmentData.tokenExpiresAt?.toDate?.() ||
                            new Date(enrollmentData.tokenExpiresAt);

            // Token is valid if it expires more than 5 minutes from now
            if (expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
              console.log('✅ Using cached member token (expires:', expiresAt, ')');
              setMemberToken(enrollmentData.memberAccessToken);
              setLoading(false);
              onReportLoaded?.({
                token: enrollmentData.memberAccessToken,
                enrollment: enrollmentData
              });
              return;
            }
          }
        }
      }

      // Token expired or not found - get a fresh one from backend
      console.log('🔄 Getting fresh member token from IDIQ...');
      setTokenRefreshing(true);

      const idiqService = httpsCallable(functions, 'idiqService');
      const result = await idiqService({
        action: 'getMemberToken',
        enrollmentId,
        contactId
      });

      if (result.data?.success && result.data?.memberToken) {
        console.log('✅ Fresh member token received');
        setMemberToken(result.data.memberToken);
        onReportLoaded?.({
          token: result.data.memberToken,
          email: result.data.email
        });
      } else {
        throw new Error(result.data?.error || 'Failed to get member token');
      }
    } catch (err) {
      console.error('❌ Error fetching member token:', err);
      setError(err.message || 'Failed to load credit report');
      onError?.(err.message);
    } finally {
      setLoading(false);
      setTokenRefreshing(false);
    }
  }, [enrollmentId, contactId, propMemberToken, onReportLoaded, onError]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    // If we have a token from props, we're ready
    if (propMemberToken) {
      setMemberToken(propMemberToken);
      setLoading(false);
    } else if (contactId || enrollmentId) {
      fetchMemberToken();
    } else {
      setLoading(false);
      setError('No contact or enrollment ID provided');
    }
  }, [contactId, enrollmentId, propMemberToken, fetchMemberToken]);

  // ===========================================================================
  // ===== CRITICAL FIX: Load script ONLY AFTER we have the token =====
  // ===== This matches your PHP pattern exactly! =====
  // ===========================================================================
  useEffect(() => {
    // Don't do anything until we have a token
    if (!memberToken) {
      console.log('⏳ Waiting for member token before loading IDIQ script...');
      return;
    }

    // Only attempt to load once per token
    if (scriptLoadAttempted.current) {
      return;
    }

    console.log('🚀 Member token ready, initializing IDIQ widget...');

    // ===== STEP 1: Set the config FIRST (like your PHP did) =====
    window.IDIQ_CREDIT_REPORT_CONFIG = {
      jwtToken: memberToken,
    };
    console.log('✅ IDIQ_CREDIT_REPORT_CONFIG set with token');

    // ===== STEP 2: Remove any existing script to force fresh load =====
    const existingScript = document.querySelector('script[src*="idiq-credit-report"]');
    if (existingScript) {
      console.log('🗑️ Removing existing IDIQ script to reload with new config...');
      existingScript.remove();
    }

    // ===== STEP 3: Remove any existing widget =====
    const existingWidget = document.querySelector('idiq-credit-report');
    if (existingWidget) {
      existingWidget.remove();
    }

    // ===== STEP 4: Load the script AFTER config is set =====
    console.log('📜 Loading IDIQ Credit Report widget script...');
    scriptLoadAttempted.current = true;

    const script = document.createElement('script');
    script.src = 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js';
    script.async = false; // ===== IMPORTANT: Load synchronously =====

    script.onload = () => {
      console.log('✅ IDIQ script loaded AFTER config was set');
      
      // ===== STEP 5: Create widget element AFTER script loads =====
      setTimeout(() => {
        if (widgetContainerRef.current) {
          // Clear container
          widgetContainerRef.current.innerHTML = '';
          
          // Create fresh widget
          const widget = document.createElement('idiq-credit-report');
          widgetContainerRef.current.appendChild(widget);
          
          console.log('✅ IDIQ widget element created');
          setWidgetReady(true);
        }
      }, 100); // Small delay to ensure script is fully initialized
    };

    script.onerror = (err) => {
      console.error('❌ Failed to load IDIQ widget script:', err);
      setError('Failed to load credit report viewer. Please refresh the page.');
      onError?.('Script load failed');
      scriptLoadAttempted.current = false; // Allow retry
    };

    document.body.appendChild(script);

    // Cleanup - do NOT reset scriptLoadAttempted to prevent reload loops
    return () => {
      // Intentionally empty - keep scriptLoadAttempted true to prevent reloads
    };
  }, [memberToken, onError]);

  // ===== REFRESH TOKEN HANDLER =====
  const handleRefreshToken = async () => {
    setTokenRefreshing(true);
    setWidgetReady(false);
    scriptLoadAttempted.current = false; // Allow script reload
    
    // Clear existing widget
    if (widgetContainerRef.current) {
      widgetContainerRef.current.innerHTML = '';
    }
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="idiq-credit-report"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    await fetchMemberToken(true);
  };

  // ===== RENDER LOADING STATE =====
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: minHeight,
        gap: 2
      }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading credit report...
        </Typography>
        <Typography variant="caption" color="text.disabled">
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={handleRefreshToken}
          >
            Retry
          </Button>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={20} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Failed to Load Credit Report
            </Typography>
            <Typography variant="caption">{error}</Typography>
          </Box>
        </Box>
      </Alert>
    );
  }

  // ===== RENDER NO TOKEN STATE =====
  if (!memberToken) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          No credit report available. Please complete enrollment first.
        </Typography>
      </Alert>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <Box>
      {/* Header Section */}
      {showHeader && enrollment && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {/* Left Side - Member Info */}
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={20} />
                Credit Report
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {enrollment.membershipNumber && (
                  <Chip
                    icon={<Shield size={14} />}
                    label={`Member #${enrollment.membershipNumber}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {enrollment.verificationStatus === 'verified' && (
                  <Chip
                    icon={<CheckCircle size={14} />}
                    label="Verified"
                    size="small"
                    color="success"
                  />
                )}
                {contact?.firstName && (
                  <Chip
                    icon={<User size={14} />}
                    label={`${contact.firstName} ${contact.lastName || ''}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              {enrollment.verifiedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <Calendar size={12} />
                  Verified: {new Date(enrollment.verifiedAt?.toDate?.() || enrollment.verifiedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            {/* Right Side - Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Token">
                <IconButton
                  onClick={handleRefreshToken}
                  disabled={tokenRefreshing}
                  size="small"
                >
                  <RefreshCw size={18} className={tokenRefreshing ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      )}

      {/* IDIQ Widget Container */}
      <Paper
        sx={{
          minHeight: minHeight,
          overflow: 'auto',
          p: 0,
          position: 'relative',
          '& idiq-credit-report': {
            display: 'block',
            width: '100%',
            minHeight: minHeight
          }
        }}
      >
        {/* Widget container - widget inserted programmatically */}
        <Box 
          ref={widgetContainerRef}
          sx={{ minHeight: minHeight }}
        />

        {/* Loading overlay while widget initializes */}
        {memberToken && !widgetReady && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.paper',
            zIndex: 1
          }}>
            <CircularProgress size={48} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Initializing credit report viewer...
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
              Please wait while we securely load your report
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Footer Note */}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: 'block', textAlign: 'center', mt: 1 }}
      >
        Credit report data provided by IdentityIQ • Partner ID: 11981
      </Typography>
    </Box>
  );
};

export default IDIQCreditReportViewer;