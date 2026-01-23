// ============================================================================
// Path: src/components/enrollment/IDIQVerificationQuestions.jsx
// ============================================================================
// IDIQ IDENTITY VERIFICATION QUESTIONS COMPONENT
// ============================================================================
// Displays identity verification questions from credit bureaus and handles
// the user's answers submission.
//
// This component should be shown AFTER successful IDIQ enrollment and BEFORE
// credit report retrieval.
//
// USAGE in CompleteEnrollmentFlow.jsx:
//   <IDIQVerificationQuestions
//     email={formData.email}
//     onVerificationComplete={(result) => handleVerificationComplete(result)}
//     onError={(error) => handleVerificationError(error)}
//   />
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
  LinearProgress,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Phone,
  Lock,
  Info,
  ChevronRight
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ============================================================================
// MAIN COMPONENT: IDIQVerificationQuestions
// ============================================================================
const IDIQVerificationQuestions = ({
  email,                      // Required: User's email from enrollment
  contactId = null,           // Optional: Firestore contact ID
  onVerificationComplete,     // Callback when verification succeeds
  onError,                    // Callback when error occurs
  onCancel,                   // Optional: Callback to cancel/go back
  showTips = true,            // Show helpful tips about verification
  maxAttempts = 3             // Maximum verification attempts
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [error, setError] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(maxAttempts);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, verified, failed, locked
  const [additionalQuestion, setAdditionalQuestion] = useState(null);
  const [showTipsExpanded, setShowTipsExpanded] = useState(true);

  // ============================================================
  // FIREBASE FUNCTIONS
  // ============================================================
  const functions = getFunctions();
  const idiqService = httpsCallable(functions, 'idiqService');

  // ============================================================
  // LOAD VERIFICATION QUESTIONS ON MOUNT
  // ============================================================
  useEffect(() => {
    loadVerificationQuestions();
  }, [email]);

  const loadVerificationQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Loading verification questions for:', email);

      const result = await idiqService({
        action: 'getVerificationQuestions',
        email: email
      });

      console.log('📥 Verification questions result:', result.data);

      if (result.data.alreadyVerified) {
        // User is already verified!
        setVerificationStatus('verified');
        if (onVerificationComplete) {
          onVerificationComplete({ verified: true, alreadyVerified: true });
        }
        return;
      }

      if (!result.data.success) {
        throw new Error(result.data.message || 'Failed to load verification questions');
      }

      // Set questions
      setQuestions(result.data.questions || []);

      // Initialize selected answers state
      const initialAnswers = {};
      (result.data.questions || []).forEach((q, index) => {
        initialAnswers[index] = null;
      });
      setSelectedAnswers(initialAnswers);

    } catch (err) {
      console.error('❌ Error loading questions:', err);
      setError(err.message || 'Failed to load verification questions');
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [email, idiqService, onError, onVerificationComplete]);

  // ============================================================
  // HANDLE ANSWER SELECTION
  // ============================================================
  const handleAnswerChange = (questionIndex, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerId
    }));
    // Clear any previous error when user makes a selection
    setError(null);
  };

  // ============================================================
  // CHECK IF ALL QUESTIONS ANSWERED
  // ============================================================
  const allQuestionsAnswered = useCallback(() => {
    // Check regular questions
    for (let i = 0; i < questions.length; i++) {
      if (!selectedAnswers[i]) {
        return false;
      }
    }
    // Check additional question if present
    if (additionalQuestion && !selectedAnswers['additional']) {
      return false;
    }
    return true;
  }, [questions, selectedAnswers, additionalQuestion]);

  // ============================================================
  // SUBMIT VERIFICATION ANSWERS
  // ============================================================
  const handleSubmit = async () => {
    try {
      // Validate all questions are answered
      if (!allQuestionsAnswered()) {
        setError('Please answer all questions before submitting.');
        return;
      }

      setSubmitting(true);
      setError(null);

      // Build answers array (just the IDs)
      const answersArray = [];
      for (let i = 0; i < questions.length; i++) {
        if (selectedAnswers[i]) {
          answersArray.push(selectedAnswers[i]);
        }
      }
      // Add additional question answer if present
      if (additionalQuestion && selectedAnswers['additional']) {
        answersArray.push(selectedAnswers['additional']);
      }

      console.log('📤 Submitting verification answers:', answersArray.length, 'answers');

      const result = await idiqService({
        action: 'submitVerificationAnswers',
        email: email,
        answers: answersArray
      });

      console.log('📥 Verification result:', result.data);

      // Handle different statuses
      if (result.data.verified) {
        // ✅ VERIFICATION PASSED!
        setVerificationStatus('verified');
        if (onVerificationComplete) {
          onVerificationComplete({
            verified: true,
            message: result.data.message
          });
        }
        return;
      }

      if (result.data.locked) {
        // 🔒 ACCOUNT LOCKED
        setVerificationStatus('locked');
        setAttemptsRemaining(0);
        setError(result.data.message);
        return;
      }

      if (result.data.status === 'MoreQuestions') {
        // ❓ ADDITIONAL QUESTION REQUIRED
        setAdditionalQuestion(result.data.additionalQuestion);
        setError(null);
        return;
      }

      if (result.data.status === 'Incorrect') {
        // ❌ INCORRECT ANSWERS
        setAttemptCount(prev => prev + 1);
        setAttemptsRemaining(result.data.attemptsRemaining || (maxAttempts - attemptCount - 1));
        setError(result.data.message);

        // Clear answers so user can try again
        const resetAnswers = {};
        questions.forEach((q, index) => {
          resetAnswers[index] = null;
        });
        setSelectedAnswers(resetAnswers);
        setAdditionalQuestion(null);

        // Reload questions (they may be different on retry)
        await loadVerificationQuestions();
        return;
      }

      // Handle other errors
      throw new Error(result.data.message || 'Verification failed');

    } catch (err) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      if (onError) {
        onError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER: LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading verification questions...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Retrieving identity verification questions from credit bureaus
        </Typography>
      </Box>
    );
  }

  // ============================================================
  // RENDER: VERIFICATION COMPLETE
  // ============================================================
  if (verificationStatus === 'verified') {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle size={64} color="#4caf50" style={{ marginBottom: 16 }} />
          <Typography variant="h5" color="success.main" gutterBottom>
            Identity Verified!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your identity has been successfully verified. You can now access your credit report.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => onVerificationComplete && onVerificationComplete({ verified: true })}
            endIcon={<ChevronRight />}
          >
            Continue to Credit Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // RENDER: ACCOUNT LOCKED
  // ============================================================
  if (verificationStatus === 'locked') {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', border: '2px solid #f44336' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Lock size={64} color="#f44336" style={{ marginBottom: 16 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Verification Locked
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Your account has been locked due to too many failed verification attempts.
          </Typography>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Need Help?</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>IDIQ Support:</strong> 1-877-875-4347
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Hours: Monday - Friday, 5AM - 4PM Pacific Time
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              <strong>Speedy Credit Repair:</strong> (714) 912-6966
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Phone />}
            href="tel:+18778754347"
          >
            Call IDIQ Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // RENDER: VERIFICATION QUESTIONS FORM
  // ============================================================
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ShieldCheck size={32} />
          <Typography variant="h5" fontWeight="bold">
            Identity Verification
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Please answer the following security questions to verify your identity.
          These questions are based on information from your credit file.
        </Typography>

        {/* Attempts Progress */}
        {attemptCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Attempts: {attemptCount} of {maxAttempts}
              </Typography>
              <Typography variant="body2">
                {attemptsRemaining} remaining
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(attemptCount / maxAttempts) * 100}
              color={attemptsRemaining <= 1 ? 'error' : 'warning'}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}
      </Paper>

      {/* ======================================== */}
      {/* HELPFUL TIPS */}
      {/* ======================================== */}
      {showTips && (
        <Collapse in={showTipsExpanded}>
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <IconButton
                size="small"
                onClick={() => setShowTipsExpanded(false)}
              >
                <XCircle size={18} />
              </IconButton>
            }
          >
            <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info size={18} /> Tips for Answering
            </AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>These questions come from your credit file history</li>
              <li>Think about past addresses, employers, and loans</li>
              <li>If none of the options match, select "None of the Above"</li>
              <li>Take your time - you have {attemptsRemaining} attempt(s) remaining</li>
            </Box>
          </Alert>
        </Collapse>
      )}

      {/* ======================================== */}
      {/* ERROR MESSAGE */}
      {/* ======================================== */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Verification Issue</AlertTitle>
          {error}
        </Alert>
      )}

      {/* ======================================== */}
      {/* QUESTIONS */}
      {/* ======================================== */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {questions.map((question, qIndex) => (
            <FormControl
              key={qIndex}
              component="fieldset"
              sx={{
                width: '100%',
                mb: qIndex < questions.length - 1 ? 4 : 0,
                pb: qIndex < questions.length - 1 ? 3 : 0,
                borderBottom: qIndex < questions.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              <FormLabel
                component="legend"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 2,
                  '&.Mui-focused': { color: 'text.primary' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Chip
                    label={qIndex + 1}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 28 }}
                  />
                  <span>{question.question || question.text}</span>
                </Box>
              </FormLabel>

              <RadioGroup
                value={selectedAnswers[qIndex] || ''}
                onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
              >
                {(question.answers || []).map((answer, aIndex) => (
                  <FormControlLabel
                    key={aIndex}
                    value={answer.id}
                    control={<Radio />}
                    label={answer.answer || answer.text}
                    sx={{
                      ml: 1,
                      py: 0.5,
                      '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ))}

          {/* ======================================== */}
          {/* ADDITIONAL QUESTION (if needed) */}
          {/* ======================================== */}
          {additionalQuestion && (
            <>
              <Divider sx={{ my: 3 }} />
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Additional Verification Required</AlertTitle>
                Please answer one more question to complete verification.
              </Alert>

              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel
                  component="legend"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: 2,
                    '&.Mui-focused': { color: 'text.primary' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Chip
                      label="+"
                      size="small"
                      color="warning"
                      sx={{ minWidth: 28 }}
                    />
                    <span>{additionalQuestion.question || additionalQuestion.text}</span>
                  </Box>
                </FormLabel>

                <RadioGroup
                  value={selectedAnswers['additional'] || ''}
                  onChange={(e) => handleAnswerChange('additional', e.target.value)}
                >
                  {(additionalQuestion.answers || []).map((answer, aIndex) => (
                    <FormControlLabel
                      key={aIndex}
                      value={answer.id}
                      control={<Radio />}
                      label={answer.answer || answer.text}
                      sx={{
                        ml: 1,
                        py: 0.5,
                        '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </>
          )}
        </CardContent>
      </Card>

      {/* ======================================== */}
      {/* ACTION BUTTONS */}
      {/* ======================================== */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        {onCancel && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Tooltip title="Load new questions">
            <Button
              variant="outlined"
              onClick={loadVerificationQuestions}
              disabled={loading || submitting}
              startIcon={<RefreshCw size={18} />}
            >
              Refresh
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered() || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ShieldCheck size={20} />}
          >
            {submitting ? 'Verifying...' : 'Verify Identity'}
          </Button>
        </Box>
      </Box>

      {/* ======================================== */}
      {/* SUPPORT FOOTER */}
      {/* ======================================== */}
      <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Having trouble? Contact{' '}
          <strong>Speedy Credit Repair</strong> at{' '}
          <a href="tel:+17149126966" style={{ color: 'inherit' }}>(714) 912-6966</a>
          {' '}or{' '}
          <strong>IDIQ</strong> at{' '}
          <a href="tel:+18778754347" style={{ color: 'inherit' }}>1-877-875-4347</a>
        </Typography>
      </Paper>
    </Box>
  );
};

export default IDIQVerificationQuestions;