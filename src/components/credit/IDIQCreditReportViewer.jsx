// ===========================================================================
// Path: src/components/credit/IDIQCreditReportViewer.jsx
// IDIQ Credit Report Viewer using IDIQ's MicroFrontend Widget
// This replicates how your old PHP site displayed credit reports!
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
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Download,
  ExternalLink,
  Shield,
  User,
  Calendar
} from 'lucide-react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// ===== IDIQ CREDIT REPORT VIEWER COMPONENT =====
const IDIQCreditReportViewer = ({ 
  contactId, 
  enrollmentId,
  showHeader = true,
  minHeight = 600,
  onReportLoaded = null,
  onError = null
}) => {
  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberToken, setMemberToken] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [contact, setContact] = useState(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  
  const widgetContainerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // ===== LOAD IDIQ WIDGET SCRIPT =====
  useEffect(() => {
    // Only load script once
    if (scriptLoadedRef.current) {
      setScriptLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="idiq-credit-report"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      setScriptLoaded(true);
      return;
    }

    console.log('📊 Loading IDIQ Credit Report widget script...');
    
    const script = document.createElement('script');
    script.src = 'https://idiq-prod-web-api.web.app/idiq-credit-report/index.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ IDIQ Credit Report widget script loaded');
      scriptLoadedRef.current = true;
      setScriptLoaded(true);
    };
    
    script.onerror = (err) => {
      console.error('❌ Failed to load IDIQ widget script:', err);
      setError('Failed to load credit report viewer. Please refresh the page.');
      onError?.('Script load failed');
    };
    
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount - it may be needed by other components
    };
  }, [onError]);

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
  }, [enrollmentId, contactId, onReportLoaded, onError]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    if (contactId || enrollmentId) {
      fetchMemberToken();
    } else {
      setLoading(false);
      setError('No contact or enrollment ID provided');
    }
  }, [contactId, enrollmentId, fetchMemberToken]);

  // ===== CONFIGURE IDIQ WIDGET WHEN TOKEN IS READY =====
  useEffect(() => {
    if (memberToken && scriptLoaded) {
      console.log('🔧 Configuring IDIQ Credit Report widget...');
      
      // Set global config (how your old PHP site did it)
      window.IDIQ_CREDIT_REPORT_CONFIG = {
        jwtToken: memberToken,
      };
      
      // Force widget to re-render by removing and re-adding
      if (widgetContainerRef.current) {
        const existingWidget = widgetContainerRef.current.querySelector('idiq-credit-report');
        if (existingWidget) {
          existingWidget.remove();
        }
        
        // Create new widget element
        const widget = document.createElement('idiq-credit-report');
        widgetContainerRef.current.appendChild(widget);
        
        console.log('✅ IDIQ Credit Report widget initialized');
      }
    }
  }, [memberToken, scriptLoaded]);

  // ===== REFRESH TOKEN HANDLER =====
  const handleRefreshToken = async () => {
    setTokenRefreshing(true);
    await fetchMemberToken(true);
    setTokenRefreshing(false);
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
            onClick={() => fetchMemberToken(true)}
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
        ref={widgetContainerRef}
        sx={{ 
          minHeight: minHeight,
          overflow: 'auto',
          p: 0,
          '& idiq-credit-report': {
            display: 'block',
            width: '100%',
            minHeight: minHeight
          }
        }}
      >
        {/* The IDIQ widget will be inserted here programmatically */}
        {scriptLoaded && memberToken && (
          <idiq-credit-report></idiq-credit-report>
        )}
        
        {!scriptLoaded && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: minHeight 
          }}>
            <CircularProgress size={32} />
            <Typography sx={{ ml: 2 }}>Loading widget...</Typography>
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