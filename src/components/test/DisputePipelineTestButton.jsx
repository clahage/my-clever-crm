import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import { Rocket, Bug, CheckCircle, XCircle, Zap } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function DisputePipelineTestButton() {
  const [open, setOpen] = useState(false);
  const [contactId, setContactId] = useState('20JlaX9NVp2G9Y5SasGn');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('');

  const runPipeline = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setStep('Connecting to Cloud Function...');

    try {
      const functions = getFunctions();
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');

      setStep('🚀 Running Full Dispute Pipeline...');
      console.log('🚀 Triggering pipeline for contact:', contactId);

      const response = await aiContentGenerator({
        type: 'runFullDisputePipeline',
        contactId: contactId
      });

      console.log('🚀 Pipeline result:', JSON.stringify(response.data, null, 2));
      setResult(response.data);
      setStep('✅ Complete!');

    } catch (err) {
      console.error('❌ Pipeline error:', err);
      setError(err.message || 'Unknown error');
      setStep('❌ Failed');
    } finally {
      setLoading(false);
    }
  };

  // ═════ Individual step testers ═════
  const runStep = async (type, extraParams = {}) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setStep(`Running ${type}...`);

    try {
      const functions = getFunctions();
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');

      const response = await aiContentGenerator({
        type,
        contactId,
        ...extraParams
      });

      console.log(`✅ ${type} result:`, JSON.stringify(response.data, null, 2));
      setResult(response.data);
      setStep('✅ Complete!');

    } catch (err) {
      console.error(`❌ ${type} error:`, err);
      setError(err.message || 'Unknown error');
      setStep('❌ Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ═════ FLOATING TEST BUTTON ═════ */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: '#f57c00',
            color: 'white',
            borderRadius: '50px',
            px: 3,
            py: 1.5,
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(245,124,0,0.4)',
            '&:hover': { bgcolor: '#e65100' }
          }}
          startIcon={<Bug size={20} />}
        >
          🧪 Test Pipeline
        </Button>
      </Box>

      {/* ═════ TEST DIALOG ═════ */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rocket size={24} />
          AI Dispute Pipeline Test Console
        </DialogTitle>

        <DialogContent sx={{ bgcolor: '#16213e', color: 'white', pt: 3 }}>
          {/* ═════ Contact ID Input ═════ */}
          <TextField
            fullWidth
            label="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            disabled={loading}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { color: 'white' },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
            }}
          />

          {/* ═════ Action Buttons ═════ */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={runPipeline}
              disabled={loading || !contactId}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Rocket size={16} />}
              sx={{ fontWeight: 'bold' }}
            >
              🚀 Run FULL Pipeline
            </Button>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#444', mx: 1 }} />

            <Button
              variant="outlined"
              onClick={() => runStep('populateDisputes')}
              disabled={loading || !contactId}
              sx={{ color: '#4fc3f7', borderColor: '#4fc3f7', fontSize: '12px' }}
            >
              Step 1: Populate
            </Button>

            <Button
              variant="outlined"
              onClick={() => runStep('generateDisputeStrategy')}
              disabled={loading || !contactId}
              sx={{ color: '#ab47bc', borderColor: '#ab47bc', fontSize: '12px' }}
            >
              Step 2: Strategy
            </Button>

            <Button
              variant="outlined"
              onClick={() => runStep('generateDisputeLetters', { round: 1 })}
              disabled={loading || !contactId}
              sx={{ color: '#66bb6a', borderColor: '#66bb6a', fontSize: '12px' }}
            >
              Step 3: Letters (R1)
            </Button>

            <Button
              variant="outlined"
              onClick={() => runStep('getDisputeLetters')}
              disabled={loading || !contactId}
              sx={{ color: '#ffa726', borderColor: '#ffa726', fontSize: '12px' }}
            >
              Get Letters
            </Button>

            <Button
              variant="outlined"
              onClick={() => runStep('getDisputeSummary')}
              disabled={loading || !contactId}
              sx={{ color: '#78909c', borderColor: '#78909c', fontSize: '12px' }}
            >
              Get Summary
            </Button>
          </Box>

          {/* ═════ Status ═════ */}
          {step && (
            <Alert
              severity={loading ? 'info' : error ? 'error' : 'success'}
              sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}
            >
              {step}
            </Alert>
          )}

          {/* ═════ Error Display ═════ */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {error}
              </Typography>
            </Alert>
          )}

          {/* ═════ Result Display ═════ */}
          {result && (
            <Paper sx={{ bgcolor: '#0d1b2a', p: 2, borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
              {/* Quick Stats */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  icon={result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  label={result.success ? 'SUCCESS' : 'FAILED'}
                  color={result.success ? 'success' : 'error'}
                  size="small"
                />
                {result.populate?.disputeCount != null && (
                  <Chip label={`${result.populate.disputeCount} disputes`} size="small" sx={{ bgcolor: '#1565c0', color: 'white' }} />
                )}
                {result.strategy?.plan?.totalRounds != null && (
                  <Chip label={`${result.strategy.plan.totalRounds} rounds`} size="small" sx={{ bgcolor: '#7b1fa2', color: 'white' }} />
                )}
                {result.letters?.letterCount != null && (
                  <Chip label={`${result.letters.letterCount} letters`} size="small" sx={{ bgcolor: '#2e7d32', color: 'white' }} />
                )}
                {result.disputeCount != null && (
                  <Chip label={`${result.disputeCount} disputes`} size="small" sx={{ bgcolor: '#1565c0', color: 'white' }} />
                )}
                {result.letterCount != null && (
                  <Chip label={`${result.letterCount} letters`} size="small" sx={{ bgcolor: '#2e7d32', color: 'white' }} />
                )}
              </Box>

              {/* Raw JSON */}
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#4fc3f7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: '#1a1a2e', p: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', flex: 1 }}>
            🧪 TEMPORARY TEST TOOL — Remove after testing!
          </Typography>
          <Button onClick={() => setOpen(false)} sx={{ color: '#aaa' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}