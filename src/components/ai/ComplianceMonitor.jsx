// ============================================================================
// REGULATORY COMPLIANCE MONITOR - FCRA/FDCPA CHECKER
// ============================================================================
// Analyze dispute letters for legal compliance issues
// ============================================================================

import React, { useState } from 'react';
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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Gavel,
  Security,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  Info,
  ExpandMore,
  ContentPaste,
  PlayArrow,
  Shield,
  Description,
  Edit,
  Lightbulb,
  Flag,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Severity Badge
const SeverityBadge = ({ severity }) => {
  const config = {
    critical: { color: 'error', icon: <ErrorIcon />, label: 'CRITICAL' },
    high: { color: 'warning', icon: <Warning />, label: 'HIGH' },
    medium: { color: 'info', icon: <Info />, label: 'MEDIUM' },
    low: { color: 'default', icon: <CheckCircle />, label: 'LOW' },
  };
  const cfg = config[severity] || config.low;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
};

// Compliance Score Gauge
const ComplianceGauge = ({ score, status }) => {
  const getColor = () => {
    if (status === 'compliant') return '#22c55e';
    if (status === 'minor_issues') return '#84cc16';
    if (status === 'major_issues') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Box
        sx={{
          position: 'relative',
          width: 150,
          height: 150,
          mx: 'auto',
          mb: 2,
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={150}
          thickness={4}
          sx={{ color: 'grey.200', position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={150}
          thickness={4}
          sx={{ color: getColor(), position: 'absolute' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" fontWeight="bold" sx={{ color: getColor() }}>
            {score}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            /100
          </Typography>
        </Box>
      </Box>
      <Chip
        label={status?.replace(/_/g, ' ').toUpperCase()}
        sx={{ bgcolor: `${getColor()}20`, color: getColor() }}
      />
    </Box>
  );
};

const ComplianceMonitor = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [letterContent, setLetterContent] = useState('');
  const [letterType, setLetterType] = useState('dispute');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const checkCompliance = async () => {
    if (!letterContent.trim()) {
      setError('Please enter letter content to check');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const check = httpsCallable(functions, 'checkRegulatoryCompliance');
      const response = await check({
        letterContent,
        letterType,
      });

      if (response.data.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error('Compliance check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleLetter = `Dear Credit Bureau,

I am writing to dispute the following information in my credit file. The items I dispute are listed below:

Account Name: ABC Collections
Account Number: XXXX-1234
Reason for Dispute: This account is not mine. I have never had any dealings with this creditor.

I request that you investigate this matter and remove the inaccurate information from my credit report.

Under the Fair Credit Reporting Act, you are required to investigate disputed items within 30 days.

Sincerely,
John Doe`;

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
            <Gavel sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Regulatory Compliance Monitor
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              FCRA • FDCPA • State Credit Repair Laws
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
              Letter Content
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                label="Dispute Letter"
                onClick={() => setLetterType('dispute')}
                color={letterType === 'dispute' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Validation Letter"
                onClick={() => setLetterType('validation')}
                color={letterType === 'validation' ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label="Goodwill Letter"
                onClick={() => setLetterType('goodwill')}
                color={letterType === 'goodwill' ? 'primary' : 'default'}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={15}
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              placeholder="Paste your dispute letter here..."
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Security />}
                onClick={checkCompliance}
                disabled={loading || !letterContent.trim()}
                fullWidth
              >
                Check Compliance
              </Button>
              <Tooltip title="Load sample letter">
                <IconButton onClick={() => setLetterContent(sampleLetter)}>
                  <ContentPaste />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result ? (
            <Paper sx={{ p: 3 }}>
              {/* Compliance Score */}
              <ComplianceGauge
                score={result.complianceScore}
                status={result.overallCompliance}
              />

              {/* Tabs */}
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Issues (${result.issues?.length || 0})`} />
                <Tab label="Missing Elements" />
                <Tab label="Revisions" />
                <Tab label="Legal Risks" />
              </Tabs>

              {/* Issues Tab */}
              {activeTab === 0 && (
                <Box>
                  {result.issues?.length > 0 ? (
                    <List>
                      {result.issues.map((issue, idx) => (
                        <Accordion key={idx}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <SeverityBadge severity={issue.severity} />
                              <Typography variant="body2">{issue.issue}</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="caption" color="text.secondary" display="block">
                              <strong>Regulation:</strong> {issue.regulation}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              <strong>Location:</strong> {issue.location}
                            </Typography>
                            <Alert severity="info" sx={{ mt: 1 }}>
                              <strong>Fix:</strong> {issue.fix}
                            </Alert>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success" icon={<CheckCircle />}>
                      No compliance issues found!
                    </Alert>
                  )}
                </Box>
              )}

              {/* Missing Elements Tab */}
              {activeTab === 1 && (
                <Box>
                  {result.missingElements?.length > 0 ? (
                    <List>
                      {result.missingElements.map((elem, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Warning color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={elem.element}
                            secondary={`Required by: ${elem.required_by}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success">All required elements present!</Alert>
                  )}
                </Box>
              )}

              {/* Revisions Tab */}
              {activeTab === 2 && (
                <Box>
                  {result.suggestedRevisions?.length > 0 ? (
                    result.suggestedRevisions.map((rev, idx) => (
                      <Card key={idx} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="error.main">Original:</Typography>
                            <Typography variant="body2" sx={{ bgcolor: 'error.lighter', p: 1, borderRadius: 1 }}>
                              {rev.original}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="success.main">Suggested:</Typography>
                            <Typography variant="body2" sx={{ bgcolor: 'success.lighter', p: 1, borderRadius: 1 }}>
                              {rev.revised}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Reason: {rev.reason}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Alert severity="success">No revisions needed!</Alert>
                  )}
                </Box>
              )}

              {/* Legal Risks Tab */}
              {activeTab === 3 && (
                <Box>
                  {result.legalRisks?.length > 0 ? (
                    <List>
                      {result.legalRisks.map((risk, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <Flag color={risk.probability === 'high' ? 'error' : 'warning'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={risk.risk}
                            secondary={`Probability: ${risk.probability} • Mitigation: ${risk.mitigation}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success">No significant legal risks identified!</Alert>
                  )}
                </Box>
              )}

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <CheckCircle sx={{ verticalAlign: 'middle', mr: 1, color: 'success.main' }} />
                    Letter Strengths
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {result.strengths.map((s, idx) => (
                      <Chip key={idx} label={s} color="success" size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <Lightbulb sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                    Recommendations
                  </Typography>
                  <List dense>
                    {result.recommendations.map((rec, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Gavel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Paste a letter to check compliance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI will analyze for FCRA, FDCPA, and state law compliance
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceMonitor;
