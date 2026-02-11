// ============================================================================
// Path: src/pages/PublicContractSigningRoute.jsx
// ============================================================================
//
// PUBLIC CONTRACT SIGNING ROUTE
// ============================================================================
// This component handles the /sign/:token URL that clients receive via email.
// It validates the signing token, loads the client's data, and renders the
// ContractSigningPortal for them to sign — all WITHOUT requiring login.
//
// Flow:
//   1. Client clicks email link → /sign/abc123def456...
//   2. This component extracts the token from the URL
//   3. Calls validateContractSigningToken via operationsManager
//   4. If valid → renders ContractSigningPortal with pre-filled data
//   5. If invalid/expired/used → shows appropriate error message
//   6. On signing completion → calls markContractSigningTokenUsed
//
// Security:
//   - Token is 64-char hex (32 bytes of randomness)
//   - Expires after 72 hours
//   - One-time use (marked as used after signing)
//   - No authentication required (public route)
//   - All sensitive operations happen server-side
//
// © 1995-{currentYear} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Alert,
  Container,
  Fade,
  Chip
} from '@mui/material';
import {
  Shield,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Phone,
  RefreshCw,
  Lock,
  XCircle
} from 'lucide-react';
import ContractSigningPortal from '../components/client-portal/ContractSigningPortal';

// ============================================================================
// CONFIGURATION
// ============================================================================
const OPERATIONS_MANAGER_URL = 'https://operationsmanager-tvkxcewmxq-uc.a.run.app';

// ============================================================================
// HELPER: Call operationsManager (no auth needed for token validation)
// ============================================================================
const callOperationsManager = async (action, params = {}) => {
  console.log(`📡 Calling operationsManager: ${action}`, params);
  
  const response = await fetch(OPERATIONS_MANAGER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { action, ...params } })
  });
  
  const data = await response.json();
  console.log(`📡 Response for ${action}:`, data);
  return data;
};

// ============================================================================
// THEME COLORS
// ============================================================================
const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2d5a8e',
  success: '#059669',
  successLight: '#10b981',
  warning: '#d97706',
  error: '#dc2626',
  bg: '#f8fafc',
  cardBg: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  gradientHeader: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1e3a5f 100%)',
  gradientSuccess: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
};

// ============================================================================
// ERROR STATES
// ============================================================================
const ErrorDisplay = ({ type, message }) => {
  const configs = {
    invalid: {
      icon: <XCircle size={56} color={COLORS.error} />,
      title: 'Invalid Signing Link',
      color: COLORS.error,
      bgColor: '#fef2f2'
    },
    expired: {
      icon: <Clock size={56} color={COLORS.warning} />,
      title: 'Link Expired',
      color: COLORS.warning,
      bgColor: '#fffbeb'
    },
    alreadyUsed: {
      icon: <CheckCircle size={56} color={COLORS.success} />,
      title: 'Already Signed',
      color: COLORS.success,
      bgColor: '#f0fdf4'
    },
    error: {
      icon: <AlertCircle size={56} color={COLORS.error} />,
      title: 'Something Went Wrong',
      color: COLORS.error,
      bgColor: '#fef2f2'
    }
  };
  
  const config = configs[type] || configs.error;
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: COLORS.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 700, mb: 0.5 }}>
            Speedy Credit Repair
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            Trusted Credit Repair Since 1995
          </Typography>
        </Box>
        
        <Paper elevation={0} sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center'
        }}>
          {/* Colored top bar */}
          <Box sx={{ height: 6, background: config.color }} />
          
          <Box sx={{ p: 5 }}>
            {/* Icon */}
            <Box sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: config.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              {config.icon}
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2 }}>
              {config.title}
            </Typography>
            
            <Typography variant="body1" sx={{ color: COLORS.textSecondary, lineHeight: 1.7, mb: 3 }}>
              {message}
            </Typography>
            
            {/* Contact Info */}
            <Paper elevation={0} sx={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 3,
              p: 2.5,
              mb: 2
            }}>
              <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 600, mb: 1 }}>
                Need help? Contact us:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Phone size={16} color="#0369a1" />
                <Typography 
                  component="a" 
                  href="tel:8889601718" 
                  sx={{ color: '#0369a1', fontWeight: 600, textDecoration: 'none', fontSize: '16px' }}
                >
                  (888) 960-1718
                </Typography>
              </Box>
            </Paper>
            
            <Button
              variant="text"
              href="https://speedycreditrepair.com"
              sx={{ color: COLORS.textMuted, textTransform: 'none', mt: 1 }}
            >
              Visit speedycreditrepair.com
            </Button>
          </Box>
        </Paper>
        
        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
            © {new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// ============================================================================
// SIGNING COMPLETE STATE
// ============================================================================
const SigningComplete = ({ contactName }) => (
  <Box sx={{
    minHeight: '100vh',
    background: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
  }}>
    <Container maxWidth="sm">
      <Paper elevation={0} sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        textAlign: 'center'
      }}>
        {/* Success gradient bar */}
        <Box sx={{ height: 6, background: COLORS.gradientSuccess }} />
        
        <Box sx={{ p: 5 }}>
          {/* Animated checkmark */}
          <Box sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { boxShadow: '0 0 0 0 rgba(5,150,105,0.2)' },
              '50%': { boxShadow: '0 0 0 20px rgba(5,150,105,0)' }
            }
          }}>
            <CheckCircle size={56} color={COLORS.success} />
          </Box>
          
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 1 }}>
            All Signed! 🎉
          </Typography>
          
          <Typography variant="h6" sx={{ color: COLORS.success, fontWeight: 600, mb: 2 }}>
            Welcome to Speedy Credit Repair{contactName ? `, ${contactName}` : ''}!
          </Typography>
          
          <Typography variant="body1" sx={{ color: COLORS.textSecondary, lineHeight: 1.7, mb: 3 }}>
            Your contract has been signed and submitted successfully. We're now processing your enrollment and you'll receive a confirmation email shortly with next steps.
          </Typography>
          
          {/* What happens next */}
          <Paper elevation={0} sx={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 3,
            p: 2.5,
            mb: 3,
            textAlign: 'left'
          }}>
            <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 700, mb: 1.5 }}>
              📋 What happens next:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                ✅ You'll receive a confirmation email within minutes
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                📄 We may ask for a few optional documents (ID, proof of address)
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                💳 Your ACH payment will be set up per your authorization
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                🚀 We'll begin analyzing your credit reports right away
              </Typography>
            </Box>
          </Paper>
          
          {/* Trust badges */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip size="small" label="A+ BBB Rating" sx={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600, fontSize: '11px' }} />
            <Chip size="small" label="⭐ 4.9 Google" sx={{ background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '11px' }} />
            <Chip size="small" label="Est. 1995" sx={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '11px' }} />
          </Box>
          
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            Questions? Call <a href="tel:8889601718" style={{ color: '#2563eb', textDecoration: 'none' }}>(888) 960-1718</a>
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
          © {new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        </Typography>
      </Box>
    </Container>
  </Box>
);

// ============================================================================
// LOADING STATE
// ============================================================================
const LoadingState = () => (
  <Box sx={{
    minHeight: '100vh',
    background: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 700, mb: 0.5 }}>
        Speedy Credit Repair
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
        Trusted Credit Repair Since 1995
      </Typography>
    </Box>
    
    <CircularProgress size={48} sx={{ color: COLORS.primary }} />
    
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        <Lock size={16} color={COLORS.success} />
        <Typography variant="body2" sx={{ color: COLORS.success, fontWeight: 600 }}>
          Secure Connection
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
        Verifying your signing link...
      </Typography>
    </Box>
  </Box>
);

// ============================================================================
// MAIN COMPONENT: PublicContractSigningRoute
// ============================================================================
const PublicContractSigningRoute = () => {
  // ===== Extract token from URL =====
  const { token } = useParams();
  
  // ===== State =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('error');
  const [contactData, setContactData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [signingComplete, setSigningComplete] = useState(false);

  // ===== Validate token on mount =====
  useEffect(() => {
    if (!token) {
      setError('No signing token provided. Please use the link from your email.');
      setErrorType('invalid');
      setLoading(false);
      return;
    }
    
    validateToken();
  }, [token]);
  
  // ===== VALIDATE TOKEN =====
  const validateToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callOperationsManager('validateContractSigningToken', { token });
      
      if (result.valid) {
        // ===== TOKEN IS VALID =====
        setContactData(result.contact);
        setPlanData(result.plan);
        setTokenId(result.tokenId);
        console.log('✅ Token validated, loading signing portal for:', result.contact.firstName);
      } else {
        // ===== TOKEN IS INVALID/EXPIRED/USED =====
        setError(result.error || 'Invalid signing link.');
        if (result.alreadyUsed) setErrorType('alreadyUsed');
        else if (result.expired) setErrorType('expired');
        else setErrorType('invalid');
      }
    } catch (err) {
      console.error('❌ Token validation failed:', err);
      setError('Unable to verify your signing link. Please try again or contact us at (888) 960-1718.');
      setErrorType('error');
    } finally {
      setLoading(false);
    }
  };

  // ===== HANDLE SIGNING COMPLETE =====
  // This is called by ContractSigningPortal when the client finishes signing
  const handleSigningComplete = useCallback(async () => {
    console.log('🎉 Contract signing completed!');
    
    try {
      // Mark the token as used
      await callOperationsManager('markContractSigningTokenUsed', {
        token,
        contactId: contactData?.id
      });
      console.log('✅ Token marked as used');
    } catch (err) {
      console.warn('⚠️ Failed to mark token as used (non-fatal):', err);
    }
    
    // Show the success screen
    setSigningComplete(true);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [token, contactData]);

  // ===== RENDER: Loading =====
  if (loading) {
    return <LoadingState />;
  }
  
  // ===== RENDER: Error =====
  if (error) {
    return <ErrorDisplay type={errorType} message={error} />;
  }
  
  // ===== RENDER: Signing Complete =====
  if (signingComplete) {
    return <SigningComplete contactName={contactData?.firstName} />;
  }
  
  // ===== RENDER: Contract Signing Portal =====
  // We render ContractSigningPortal with the contact data pre-filled
  // The portal handles all the actual signing logic
  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.bg }}>
      {/* ===== HEADER BAR ===== */}
      <Box sx={{
        background: COLORS.gradientHeader,
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: { xs: '16px', sm: '20px' } }}>
            Speedy Credit Repair
          </Typography>
          <Typography variant="caption" sx={{ color: '#93c5fd' }}>
            Secure Contract Signing
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={16} color="#10b981" />
          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
            Encrypted & Secure
          </Typography>
        </Box>
      </Box>
      
      {/* ===== WELCOME MESSAGE ===== */}
      <Container maxWidth="md" sx={{ mt: 3, mb: 2 }}>
        <Alert 
          severity="info" 
          icon={<FileText size={20} />}
          sx={{ 
            borderRadius: 3, 
            border: '1px solid #bae6fd',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Welcome{contactData?.firstName ? `, ${contactData.firstName}` : ''}! Please review and sign your contract below.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {planData ? `Plan: ${planData.name} — $${planData.monthlyPrice}/month · ` : ''}
            Take your time reviewing each section. All fields marked with a signature are required.
          </Typography>
        </Alert>
      </Container>
      
      {/* ===== CONTRACT SIGNING PORTAL ===== */}
      <ContractSigningPortal
        contactData={contactData}
        planData={planData}
        isPublicSigning={true}
        onSigningComplete={handleSigningComplete}
        signingToken={token}
      />
      
      {/* ===== FOOTER ===== */}
      <Box sx={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        py: 3,
        mt: 4,
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip size="small" label="A+ BBB Rating" sx={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600, fontSize: '10px' }} />
          <Chip size="small" label="⭐ 4.9 Google (580+ Reviews)" sx={{ background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '10px' }} />
          <Chip size="small" label="Est. 1995" sx={{ background: '#e0e7ff', color: '#3730a3', fontWeight: 600, fontSize: '10px' }} />
          <Chip size="small" label="🔒 256-bit Encryption" sx={{ background: '#f0fdf4', color: '#166534', fontWeight: 600, fontSize: '10px' }} />
        </Box>
        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block' }}>
          © {new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        </Typography>
        <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
          Speedy Credit Repair® — USPTO Registered Trademark
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicContractSigningRoute;