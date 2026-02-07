// ============================================================================
// Path: src/routes/PublicEnrollmentRoute.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// 
// PUBLIC ENROLLMENT ROUTE - PRODUCTION READY
// ============================================================================
// Complete, working version with token validation and error handling
// This file has been tested and verified to work correctly
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Button, Paper } from '@mui/material';
import { AlertCircle, CheckCircle, Clock, Lock, Sparkles } from 'lucide-react';
import CompleteEnrollmentFlow from '@/components/idiq/CompleteEnrollmentFlow';

// ===== COMPONENT: PUBLIC ENROLLMENT ROUTE =====

export default function PublicEnrollmentRoute() {
  console.log('🎯 PublicEnrollmentRoute component RENDERING');
  
  // ===== NAVIGATION =====
  const navigate = useNavigate();
  
  // ===== URL PARAMETERS =====
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const contactId = searchParams.get('contactId');
  
  // ===== STATE MANAGEMENT =====
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'expired', 'used', 'invalid'

  // ===== VALIDATE ENROLLMENT TOKEN =====
  
  useEffect(() => {
    const validateToken = async () => {
      console.log('🔍 Validating enrollment token...');
      console.log('   Token:', token?.substring(0, 10) + '...');
      console.log('   Contact ID:', contactId);

      // Check if token and contactId are present
      if (!token || !contactId) {
        console.error('❌ Missing token or contactId in URL');
        setError('Invalid enrollment link. Please check your URL or request a new enrollment link.');
        setErrorType('invalid');
        setValidating(false);
        return;
      }

      try {
        // Call Cloud Function to validate token
        const response = await fetch(
          'https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'validateEnrollmentToken',
              token,
              contactId
            })
          }
        );

        const result = await response.json();

        console.log('🔥 Validation response:', result);

        if (result.success && result.valid) {
          console.log('✅ Token is valid');
          setIsValid(true);
          setContactData(result.contact);
          setError(null);
        } else {
          console.error('❌ Token validation failed:', result.error);
          setIsValid(false);
          setError(result.error || 'Invalid enrollment link');
          
          if (result.expired) {
            setErrorType('expired');
          } else if (result.alreadyUsed) {
            setErrorType('used');
          } else {
            setErrorType('invalid');
          }
        }

      } catch (error) {
        console.error('❌ Token validation error:', error);
        setIsValid(false);
        setError('Failed to validate enrollment link. Please try again or contact support.');
        setErrorType('error');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, contactId]);

  // ===== HANDLE ENROLLMENT COMPLETION =====
  
  const handleEnrollmentComplete = async (enrollmentData) => {
    console.log('🎉 Enrollment completed!', enrollmentData);

    try {
      // Mark token as used
      console.log('🔒 Marking token as used...');
      const response = await fetch(
        'https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'markTokenUsed',
            token,
            contactId
          })
        }
      );

      const result = await response.json();
      console.log('✅ Token marked as used:', result);

      // Redirect to client portal
      if (enrollmentData.contractSigned) {
        navigate('/client-portal');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('❌ Error completing enrollment:', error);
      navigate('/dashboard');
    }
  };

  // ===== LOADING STATE =====
  if (validating) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Validating enrollment link...
          </Typography>
          <Typography color="text.secondary">
            Please wait while we verify your enrollment invitation.
          </Typography>
        </Box>
      </Container>
    );
  }

  // ===== ERROR STATES =====
  if (!isValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            {errorType === 'expired' ? (
              <Clock size={80} style={{ color: '#f59e0b', opacity: 0.7 }} />
            ) : errorType === 'used' ? (
              <CheckCircle size={80} style={{ color: '#10b981', opacity: 0.7 }} />
            ) : (
              <AlertCircle size={80} style={{ color: '#ef4444', opacity: 0.7 }} />
            )}
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {errorType === 'expired' && 'Enrollment Link Expired'}
            {errorType === 'used' && 'Already Enrolled'}
            {errorType === 'invalid' && 'Invalid Enrollment Link'}
            {errorType === 'error' && 'Validation Error'}
          </Typography>

          <Alert severity={errorType === 'used' ? 'success' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>

          <Typography color="text.secondary" paragraph>
            {errorType === 'expired' && (
              <>
                Your enrollment link was valid for 24 hours and has now expired. 
                Please visit our website to request a new enrollment link.
              </>
            )}
            {errorType === 'used' && (
              <>
                You've already completed enrollment with this link. 
                Please sign in to access your client portal.
              </>
            )}
            {errorType === 'invalid' && (
              <>
                This enrollment link is not valid. Please check the URL or 
                request a new enrollment link from our website.
              </>
            )}
            {errorType === 'error' && (
              <>
                We couldn't validate your enrollment link. Please try again 
                or contact our support team for assistance.
              </>
            )}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            {errorType === 'used' ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/client-portal')}
              >
                Go to Client Portal
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => window.location.href = 'https://speedycreditrepair.com'}
                >
                  Return to Website
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.location.href = 'mailto:chris@speedycreditrepair.com'}
                >
                  Contact Support
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>
    );
  }

  // ===== VALID TOKEN - SHOW ENROLLMENT FLOW =====
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Sparkles size={40} style={{ color: '#fbbf24' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
              Welcome to Speedy Credit Repair!
            </Typography>
            <Sparkles size={40} style={{ color: '#fbbf24' }} />
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Complete your enrollment to get started on your credit repair journey
          </Typography>
        </Box>

        {/* SECURITY BADGE */}
        <Paper 
          elevation={3}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            mb: 3,
            p: 1.5,
            bgcolor: '#10b981',
            borderRadius: 2,
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <Lock size={20} style={{ color: 'white' }} />
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            Secure enrollment for {contactData?.firstName} {contactData?.lastName}
          </Typography>
        </Paper>

        {/* ENROLLMENT FLOW */}
        <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CompleteEnrollmentFlow
        mode="public"
        initialData={{
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          contactId: contactData.id,
          enrollmentToken: token,  // Passes URL token so CompleteEnrollmentFlow can call markTokenUsed after Phase 1
        }}
        onComplete={handleEnrollmentComplete}
      />
        </Paper>

        {/* TRUST INDICATORS */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            🔒 Bank-level encryption • 🏆 A+ BBB Rating • ⭐ 4.9/5 Stars (580+ reviews) • 📞 1-888-724-7344
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 1995-2026 Speedy Credit Repair Inc. | Serving all 50 states since 1995
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}