// ============================================================================
// AI CREDIT REVIEW GENERATOR - WITH AFFILIATE & AUTO INTEGRATION
// ============================================================================
// Generate comprehensive credit reviews with revenue opportunities
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  TextField,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Assessment,
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  DirectionsCar,
  CreditCard,
  Print,
  Download,
  Email,
  Refresh,
  CheckCircle,
  Warning,
  Info,
  Link as LinkIcon,
  ContentCopy,
  Visibility,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Score Display
const ScoreDisplay = ({ score, bureau, change }) => {
  const getColor = (s) => {
    if (s >= 740) return '#22c55e';
    if (s >= 670) return '#84cc16';
    if (s >= 580) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary">{bureau}</Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ color: getColor(score) }}>
        {score || 'N/A'}
      </Typography>
      {change !== undefined && change !== 0 && (
        <Chip
          size="small"
          icon={change > 0 ? <TrendingUp /> : <TrendingDown />}
          label={`${change > 0 ? '+' : ''}${change}`}
          color={change > 0 ? 'success' : 'error'}
          sx={{ mt: 0.5 }}
        />
      )}
    </Box>
  );
};

// Affiliate Link Card
const AffiliateLinkCard = ({ affiliate, onTrackClick }) => (
  <Card sx={{ mb: 1 }}>
    <CardContent sx={{ py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">{affiliate.name}</Typography>
          <Typography variant="caption" color="text.secondary">{affiliate.category}</Typography>
        </Box>
        <Tooltip title="This link appears in the review">
          <Chip label="Included" size="small" color="success" icon={<CheckCircle />} />
        </Tooltip>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {affiliate.reason}
      </Typography>
    </CardContent>
  </Card>
);

const CreditReviewGenerator = () => {
  const { userProfile } = useAuth();
  const reviewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Client selection
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Report type
  const [reportType, setReportType] = useState('initial');

  // Generated review
  const [review, setReview] = useState(null);

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const clientsQuery = query(
        collection(db, 'contacts'),
        where('type', '==', 'client'),
        orderBy('lastName'),
        limit(200)
      );
      const snap = await getDocs(clientsQuery);
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate review
  const generateReview = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setGenerating(true);
    setError(null);
    setReview(null);

    try {
      const generate = httpsCallable(functions, 'generateCreditReview');
      const result = await generate({
        clientId: selectedClient.id,
        reportType,
      });

      if (result.data.success) {
        setReview(result.data);
        setSuccess('Credit review generated successfully!');
      }
    } catch (err) {
      console.error('Generate review error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Print review
  const printReview = () => {
    const printContent = reviewRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Credit Review - ${selectedClient?.firstName} ${selectedClient?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1, h2, h3 { color: #1e40af; }
              .affiliate-link { color: #059669; font-weight: bold; text-decoration: underline; }
              .score-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
              .positive { color: #22c55e; }
              .negative { color: #ef4444; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (review?.narrative) {
      // Strip HTML for clipboard
      const text = review.narrative.replace(/<[^>]*>/g, '');
      navigator.clipboard.writeText(text);
      setSuccess('Review copied to clipboard!');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <AutoAwesome sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                AI Credit Review Generator
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Generate personalized reviews with affiliate recommendations
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left: Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Review
            </Typography>

            <Autocomplete
              options={clients}
              getOptionLabel={(c) => `${c.firstName} ${c.lastName} - ${c.email}`}
              value={selectedClient}
              onChange={(e, v) => setSelectedClient(v)}
              renderInput={(params) => (
                <TextField {...params} label="Select Client" variant="outlined" />
              )}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="initial">Initial Credit Review</MenuItem>
                <MenuItem value="monthly_update">Monthly Update</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              onClick={generateReview}
              disabled={generating || !selectedClient}
              sx={{ mb: 3 }}
            >
              {generating ? 'Generating...' : 'Generate Review'}
            </Button>

            {generating && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Analyzing credit report and generating personalized review...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {/* Affiliate Links Included */}
            {review?.affiliateRecommendations?.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon sx={{ color: 'success.main' }} />
                  Affiliate Links Included
                </Typography>
                {review.affiliateRecommendations.map((aff, idx) => (
                  <AffiliateLinkCard key={idx} affiliate={aff} />
                ))}
              </Box>
            )}

            {/* Analysis Summary */}
            {review?.analysis && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Credit Profile Summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CreditCard color="primary" /></ListItemIcon>
                    <ListItemText
                      primary={`${review.analysis.accountCounts?.revolving || 0} Revolving Accounts`}
                      secondary={`Utilization: ${review.analysis.utilization}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><DirectionsCar color="info" /></ListItemIcon>
                    <ListItemText
                      primary={review.analysis.hasAutoLoan ? 'Has Auto Loan' : 'No Auto Loan'}
                      secondary={review.analysis.autoOpportunities?.noAutoLoan ? 'Opportunity identified' : ''}
                    />
                  </ListItem>
                  {review.analysis.accountCounts?.collections > 0 && (
                    <ListItem>
                      <ListItemIcon><Warning color="error" /></ListItemIcon>
                      <ListItemText
                        primary={`${review.analysis.accountCounts.collections} Collections`}
                        secondary="Being addressed"
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Review Preview */}
        <Grid item xs={12} md={8}>
          {review ? (
            <Paper sx={{ p: 3 }}>
              {/* Review Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  {reportType === 'initial' ? 'Initial Credit Review' : 'Monthly Update Report'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Copy to Clipboard">
                    <IconButton onClick={copyToClipboard}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print">
                    <IconButton onClick={printReview}>
                      <Print />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send via Email">
                    <IconButton color="primary">
                      <Email />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Scores */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Credit Scores</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ScoreDisplay score={review.scores?.experian} bureau="Experian" />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreDisplay score={review.scores?.equifax} bureau="Equifax" />
                  </Grid>
                  <Grid item xs={4}>
                    <ScoreDisplay score={review.scores?.transunion} bureau="TransUnion" />
                  </Grid>
                </Grid>
              </Paper>

              {/* Narrative */}
              <Box
                ref={reviewRef}
                sx={{
                  '& .affiliate-link': {
                    color: 'success.main',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    '&:hover': { color: 'success.dark' },
                  },
                  '& h2': { color: 'primary.main', mt: 3, mb: 1 },
                  '& h3': { color: 'text.primary', mt: 2, mb: 1 },
                  '& p': { mb: 1.5, lineHeight: 1.7 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& li': { mb: 0.5 },
                }}
                dangerouslySetInnerHTML={{ __html: review.narrative }}
              />

              {/* Auto Opportunities Alert */}
              {(review.analysis?.autoOpportunities?.noAutoLoan ||
                review.analysis?.autoOpportunities?.highInterestAuto?.length > 0 ||
                review.analysis?.autoOpportunities?.nearingMaturity?.length > 0) && (
                <Alert
                  severity="info"
                  icon={<DirectionsCar />}
                  sx={{ mt: 3 }}
                  action={
                    <Button color="inherit" size="small">
                      View Details
                    </Button>
                  }
                >
                  <Typography variant="subtitle2">Auto Financing Opportunity Detected</Typography>
                  <Typography variant="body2">
                    {review.analysis.autoOpportunities.noAutoLoan
                      ? 'Client has no auto loan - could benefit from adding installment credit'
                      : review.analysis.autoOpportunities.highInterestAuto?.length > 0
                        ? 'High interest auto loan detected - refinance opportunity'
                        : 'Auto loan nearing maturity - new vehicle opportunity'}
                  </Typography>
                </Alert>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a client and generate a review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The AI will analyze their credit report and create a personalized review
                with affiliate product recommendations and auto financing opportunities
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditReviewGenerator;
