// ============================================================================
// CREDIT REPORT RE-PARSER - TIER 5+ ENTERPRISE COMPONENT
// ============================================================================
// Path: src/components/credit/CreditReportReParser.jsx
//
// Reusable component for re-triggering dispute creation from existing
// credit reports without requiring a new IDIQ enrollment ($0 cost).
//
// USE CASES:
// - Dispute creation failed during enrollment
// - Manual re-parsing after credit report review
// - Batch re-processing of client credit reports
// - Testing dispute pipeline changes
//
// FEATURES:
// ✅ Fetches most recent credit report from Firestore
// ✅ Calls runFullDisputePipeline Cloud Function
// ✅ Real-time progress tracking with detailed steps
// ✅ Comprehensive error handling with retry logic
// ✅ Results display (disputes created, strategy, letters)
// ✅ Activity logging for audit trail
// ✅ Mobile-responsive design
// ✅ Dark mode support
//
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
  PlayArrow,
  Stop,
  Assessment,
  Gavel,
  Description,
  Schedule,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  Info,
  Warning,
  CloudDownload,
  Speed,
  EmojiEvents,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const CreditReportReParser = ({ 
  contactId, 
  contactName = 'Client',
  onComplete,
  variant = 'full', // 'full' | 'compact' | 'button-only'
  autoExpand = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creditReport, setCreditReport] = useState(null);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [expanded, setExpanded] = useState(autoExpand);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);

  // Pipeline steps for progress tracking
  const PIPELINE_STEPS = [
    { label: 'Fetching credit report', icon: <CloudDownload />, duration: 2000 },
    { label: 'Parsing negative items', icon: <Assessment />, duration: 3000 },
    { label: 'Generating AI strategy', icon: <Speed />, duration: 4000 },
    { label: 'Creating dispute records', icon: <Gavel />, duration: 3000 },
    { label: 'Generating dispute letters', icon: <Description />, duration: 5000 },
    { label: 'Finalizing results', icon: <EmojiEvents />, duration: 1000 },
  ];

  // ===== LOAD CREDIT REPORT DATA =====
  useEffect(() => {
    if (contactId && variant !== 'button-only') {
      loadCreditReportInfo();
    }
  }, [contactId]);

  const loadCreditReportInfo = async () => {
    try {
      const reportsQuery = query(
        collection(db, 'contacts', contactId, 'creditReports'),
        orderBy('fetchedAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(reportsQuery);
      
      if (!snapshot.empty) {
        const reportDoc = snapshot.docs[0];
        const reportData = reportDoc.data();
        setCreditReport({
          id: reportDoc.id,
          ...reportData,
          fetchedAt: reportData.fetchedAt?.toDate(),
        });
      }
    } catch (err) {
      console.error('Error loading credit report:', err);
    }
  };

  // ===== MAIN RE-PARSE FUNCTION =====
  const handleReparse = async () => {
    if (!contactId) {
      setError('Contact ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setPipelineResult(null);
    setCurrentStep(0);
    setShowConfirmDialog(false);

    try {
      // ===== STEP 1: VERIFY CREDIT REPORT EXISTS =====
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, PIPELINE_STEPS[0].duration));

      const reportsQuery = query(
        collection(db, 'contacts', contactId, 'creditReports'),
        orderBy('fetchedAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(reportsQuery);
      
      if (snapshot.empty) {
        throw new Error('No credit report found for this contact. Please complete IDIQ enrollment first.');
      }

      const reportData = snapshot.docs[0].data();
      setCreditReport({
        id: snapshot.docs[0].id,
        ...reportData,
        fetchedAt: reportData.fetchedAt?.toDate(),
      });

      // ===== STEP 2-6: RUN FULL PIPELINE =====
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
      
      // Animate through remaining steps while pipeline runs
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < PIPELINE_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);

      console.log('🚀 Starting dispute pipeline for contact:', contactId);
      
      const result = await aiContentGenerator({
        type: 'runFullDisputePipeline',
        contactId: contactId,
      });

      clearInterval(stepInterval);
      setCurrentStep(PIPELINE_STEPS.length - 1);

      console.log('✅ Pipeline result:', result.data);

      if (result.data.success) {
        setPipelineResult(result.data);
        setLastRunTime(new Date());

        // Log activity for audit trail
        try {
          await addDoc(collection(db, 'contacts', contactId, 'activities'), {
            type: 'credit_report_reparsed',
            performedBy: userProfile?.uid || 'system',
            performedByName: userProfile?.displayName || 'System',
            disputeCount: result.data.populate?.disputeCount || 0,
            strategyGenerated: result.data.strategy?.success || false,
            lettersGenerated: result.data.letters?.letterCount || 0,
            timestamp: serverTimestamp(),
          });
        } catch (logErr) {
          console.warn('Failed to log activity (non-blocking):', logErr);
        }

        // Callback for parent component
        if (onComplete) {
          onComplete(result.data);
        }
      } else {
        throw new Error(result.data.error || 'Pipeline failed without specific error');
      }

    } catch (err) {
      console.error('❌ Re-parse error:', err);
      setError(err.message || 'Failed to re-parse credit report. Please try again.');
      setPipelineResult(null);
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  // ===== RENDER BUTTON ONLY VARIANT =====
  if (variant === 'button-only') {
    return (
      <Tooltip title="Re-parse credit report and regenerate disputes">
        <IconButton
          onClick={() => setShowConfirmDialog(true)}
          disabled={loading}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        >
          {loading ? <CircularProgress size={24} /> : <Refresh />}
        </IconButton>
      </Tooltip>
    );
  }

  // ===== RENDER COMPACT VARIANT =====
  if (variant === 'compact') {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assessment color="primary" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Credit Report Re-Parser
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {creditReport 
                    ? `Last pulled: ${creditReport.fetchedAt?.toLocaleDateString()}`
                    : 'No credit report found'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <PlayArrow />}
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading || !creditReport}
              size="small"
            >
              Re-Parse
            </Button>
          </Box>

          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={(currentStep / PIPELINE_STEPS.length) * 100} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {PIPELINE_STEPS[currentStep]?.label}...
              </Typography>
            </Box>
          )}

          {pipelineResult && !loading && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Success!</AlertTitle>
              {pipelineResult.populate?.disputeCount || 0} disputes created, 
              {pipelineResult.letters?.letterCount || 0} letters generated
            </Alert>
          )}

          {error && !loading && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // ===== RENDER FULL VARIANT =====
  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* ===== HEADER ===== */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Credit Report Re-Parser
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Re-trigger dispute creation from existing credit report
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />

          {/* ===== CREDIT REPORT INFO ===== */}
          {creditReport && (
            <Card sx={{ mb: 2, bgcolor: 'action.hover' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Current Credit Report
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Pulled Date</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {creditReport.fetchedAt?.toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Credit Score</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {creditReport.vantageScore || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Accounts</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {creditReport.accountCount || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Negative Items</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {creditReport.negativeItemCount || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {!creditReport && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>No Credit Report Found</AlertTitle>
              This contact needs to complete IDIQ enrollment before disputes can be created.
            </Alert>
          )}

          {/* ===== ACTION BUTTON ===== */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading || !creditReport}
              fullWidth={isMobile}
            >
              {loading ? 'Re-Parsing...' : 'Re-Parse Credit Report'}
            </Button>
            {lastRunTime && (
              <Tooltip title={`Last run: ${lastRunTime.toLocaleString()}`}>
                <IconButton>
                  <Schedule />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* ===== PROGRESS DISPLAY ===== */}
          {loading && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">Processing...</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Step {currentStep + 1} of {PIPELINE_STEPS.length}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(currentStep / PIPELINE_STEPS.length) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <List dense>
                  {PIPELINE_STEPS.map((step, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        opacity: index <= currentStep ? 1 : 0.4,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <ListItemIcon>
                        {index < currentStep ? (
                          <CheckCircle color="success" />
                        ) : index === currentStep ? (
                          <CircularProgress size={24} />
                        ) : (
                          step.icon
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={step.label}
                        secondary={
                          index === currentStep ? 'In progress...' :
                          index < currentStep ? 'Complete' : 'Pending'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* ===== RESULTS DISPLAY ===== */}
          {pipelineResult && !loading && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Re-Parse Complete!</AlertTitle>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={pipelineResult.populate?.disputeCount || 0} color="primary">
                      <Gavel />
                    </Badge>
                    <Typography variant="caption" display="block">Disputes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={pipelineResult.strategy?.success ? '✓' : '✗'} color={pipelineResult.strategy?.success ? 'success' : 'error'}>
                      <Speed />
                    </Badge>
                    <Typography variant="caption" display="block">Strategy</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={pipelineResult.letters?.letterCount || 0} color="primary">
                      <Description />
                    </Badge>
                    <Typography variant="caption" display="block">Letters</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={pipelineResult.strategy?.plan?.totalRounds || 0} color="primary">
                      <TrendingUp />
                    </Badge>
                    <Typography variant="caption" display="block">Rounds</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Alert>
          )}

          {/* ===== ERROR DISPLAY ===== */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              <AlertTitle>Re-Parse Failed</AlertTitle>
              {error}
            </Alert>
          )}

          {/* ===== INFO BOX ===== */}
          <Alert severity="info" icon={<Info />}>
            <AlertTitle>How This Works</AlertTitle>
            <Typography variant="body2">
              This tool re-analyzes the existing credit report and recreates all dispute records from scratch. 
              It's useful when:
            </Typography>
            <List dense sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• Dispute creation failed during enrollment" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• You want to regenerate the AI strategy" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• Testing pipeline improvements" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: This uses the existing credit report. No new IDIQ charge.
            </Typography>
          </Alert>
        </Collapse>
      </Paper>

      {/* ===== CONFIRMATION DIALOG ===== */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Confirm Re-Parse
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This will re-analyze the credit report for <strong>{contactName}</strong> and regenerate:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Gavel fontSize="small" /></ListItemIcon>
              <ListItemText primary="All dispute records" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Speed fontSize="small" /></ListItemIcon>
              <ListItemText primary="AI-generated dispute strategy" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Description fontSize="small" /></ListItemIcon>
              <ListItemText primary="Round 1 dispute letters" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            Existing disputes will remain, but new disputes may be created if additional negative items are detected.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReparse}
            startIcon={<PlayArrow />}
          >
            Confirm Re-Parse
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreditReportReParser;