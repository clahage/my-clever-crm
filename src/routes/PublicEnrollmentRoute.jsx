// ============================================================================
// Path: src/routes/PublicEnrollmentRoute.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// PUBLIC ENROLLMENT ROUTE - NO AUTH REQUIRED
// ============================================================================
// Allows unauthenticated website visitors to complete enrollment
// Validates enrollment token before showing form
// Auto-creates Firebase Auth account during enrollment process
//
// CHRISTOPHER'S REQUIREMENT:
// "Take a visitor to my website landing page four question form, redirect them 
// to the CRM's IDIQ application page as an 'Applicant' user (Maybe a default 
// user role for those not yet registered with a login), create a true 
// Lead/Prospect/Client login for them automatically once they add their email 
// address and Password to the IDIQ application"
//
// WORKFLOW:
// 1. Landing page submits form → operationsManager creates contact + token
// 2. Redirect to: /enroll?token=ABC123&contactId=XYZ
// 3. This component validates token (server-side via Cloud Function)
// 4. If valid: Shows CompleteEnrollmentFlow with pre-filled data
// 5. User enters email + password → Auto-creates Firebase Auth account
// 6. User completes IDIQ enrollment → Syncs data to contact
// 7. User selects plan → Upgrades to 'prospect' role
// 8. User signs contract → Upgrades to 'client' role
// 9. Redirects to client portal
//
// SECURITY:
// - Token expires after 24 hours
// - Token can only be used once
// - Server-side validation via Cloud Function
// - No auth required until account is created
// ============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { AlertCircle, CheckCircle, Clock, Lock } from 'lucide-react';

// ===== COMPONENT: PUBLIC ENROLLMENT ROUTE =====

export default function PublicEnrollmentRoute() {
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
  // Calls Cloud Function to verify token is valid, not expired, and not used
  
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

        console.log('📥 Validation response:', result);

        if (result.success && result.valid) {
          // Token is valid!
          console.log('✅ Token is valid');
          setIsValid(true);
          setContactData(result.contact);
          setError(null);
        } else {
          // Token is invalid, expired, or already used
          console.error('❌ Token validation failed:', result.error);
          setIsValid(false);
          setError(result.error || 'Invalid enrollment link');
          
          // Set error type for specific error messages
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
          {/* Error Icon */}
          <Box sx={{ mb: 3 }}>
            {errorType === 'expired' ? (
              <Clock size={80} style={{ color: '#f59e0b', opacity: 0.7 }} />
            ) : errorType === 'used' ? (
              <CheckCircle size={80} style={{ color: '#10b981', opacity: 0.7 }} />
            ) : (
              <AlertCircle size={80} style={{ color: '#ef4444', opacity: 0.7 }} />
            )}
          </Box>

          {/* Error Title */}
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {errorType === 'expired' && 'Enrollment Link Expired'}
            {errorType === 'used' && 'Already Enrolled'}
            {errorType === 'invalid' && 'Invalid Enrollment Link'}
            {errorType === 'error' && 'Validation Error'}
          </Typography>

          {/* Error Message */}
          <Alert severity={errorType === 'used' ? 'success' : 'error'} sx={{ mb: 3 }}>
            {error}
          </Alert>

          {/* Help Text */}
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            {errorType === 'used' ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = '/client-portal'}
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

  // ===== VALID TOKEN - SHOW ENROLLMENT FORM =====
  // Token is valid, contact data is loaded, show CompleteEnrollmentFlow
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome to Speedy Credit Repair! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Complete your enrollment to get started on your credit repair journey
          </Typography>
        </Box>

        {/* Security Badge */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1,
          mb: 3,
          p: 1.5,
          bgcolor: 'success.light',
          borderRadius: 2,
          maxWidth: 400,
          mx: 'auto'
        }}>
          <Lock size={20} style={{ color: '#065f46' }} />
          <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 500 }}>
            Secure enrollment for {contactData?.firstName} {contactData?.lastName}
          </Typography>
        </Box>

        {/* IMPORTANT: CompleteEnrollmentFlow Component */}
        {/* This component needs to be imported from your existing IDIQ components */}
        {/* For now, showing placeholder - Christopher will need to integrate the actual component */}
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            CHRISTOPHER - INTEGRATION NEEDED:
          </Typography>
          <Typography variant="body2">
            Import and render <code>CompleteEnrollmentFlow</code> component here with:
          </Typography>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            <li><code>mode="public"</code> - Enables public enrollment features</li>
            <li><code>prefilledData=&#123;contactData&#125;</code> - Pre-fills contact info</li>
            <li><code>onComplete</code> - Redirects to client portal when done</li>
          </ul>
        </Alert>

        <Box sx={{ 
          p: 4, 
          bgcolor: 'background.paper', 
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography variant="h5" gutterBottom>
            Pre-filled Information:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Name:</strong> {contactData?.firstName} {contactData?.lastName}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Email:</strong> {contactData?.email}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Phone:</strong> {contactData?.phone}
          </Typography>
          
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              To complete integration, uncomment the CompleteEnrollmentFlow component 
              in this file and ensure it's properly imported.
            </Typography>
          </Alert>

          {/* UNCOMMENT THIS AFTER IMPORTING CompleteEnrollmentFlow */}
          {/*
          <CompleteEnrollmentFlow
            mode="public"
            prefilledData={{
              firstName: contactData.firstName,
              lastName: contactData.lastName,
              email: contactData.email,
              phone: contactData.phone,
              contactId: contactData.id
            }}
            onComplete={(data) => {
              console.log('✅ Enrollment complete:', data);
              // Mark token as used
              fetch('https://us-central1-my-clever-crm.cloudfunctions.net/operationsManager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'markTokenUsed',
                  token,
                  contactId
                })
              });
              // Redirect to client portal
              window.location.href = '/client-portal';
            }}
          />
          */}
        </Box>
      </Container>
    </Box>
  );
}

// ===== USAGE NOTES FOR CHRISTOPHER =====
/**
 * TO INTEGRATE THIS COMPONENT:
 * 
 * 1. Add to your router (App.jsx or routes configuration):
 * 
 *    import PublicEnrollmentRoute from '@/routes/PublicEnrollmentRoute';
 *    
 *    <Route path="/enroll" element={<PublicEnrollmentRoute />} />
 * 
 * 2. Import CompleteEnrollmentFlow at the top of this file:
 * 
 *    import CompleteEnrollmentFlow from '@/components/idiq/CompleteEnrollmentFlow';
 * 
 * 3. Uncomment the CompleteEnrollmentFlow component (lines marked with UNCOMMENT)
 * 
 * 4. Update CompleteEnrollmentFlow.jsx to support:
 *    - mode="public" prop
 *    - prefilledData prop
 *    - Auto-registration when email+password entered
 *    - Contact data sync after IDIQ completion
 * 
 * 5. Test the complete flow:
 *    - Submit form on landing page
 *    - Get redirected to /enroll?token=XXX&contactId=YYY
 *    - See pre-filled enrollment form
 *    - Complete enrollment
 *    - Get redirected to client portal
 */