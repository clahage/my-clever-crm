// ═══════════════════════════════════════════════════════════════════════════
// FILE: /src/components/testing/IDIQTestHistory.jsx
// ═══════════════════════════════════════════════════════════════════════════
// IDIQ TEST HISTORY VIEWER
//
// View and compare past IDIQ test results
// Track performance improvements over time
//
// © 1995-2025 Speedy Credit Repair Inc. | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';

import {
  History as HistoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

const IDIQTestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'idiqTestResults'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(results);
      calculateStats(results);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results) => {
    if (results.length === 0) return;

    const totalTests = results.reduce((sum, r) => sum + (r.passed + r.failed), 0);
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const avgSuccessRate = Math.round(results.reduce((sum, r) => sum + r.successRate, 0) / results.length);
    const avgDuration = Math.round(results.reduce((sum, r) => sum + r.averageDuration, 0) / results.length);

    setStats({
      totalTestRuns: results.length,
      totalTests,
      totalPassed,
      avgSuccessRate,
      avgDuration
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading test history...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon sx={{ fontSize: 40, color: 'white' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              Test History
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              View past IDIQ test results
            </Typography>
          </Box>
        </Box>
      </Paper>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {stats.totalTestRuns}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Test Runs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.avgSuccessRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {stats.avgDuration}ms
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Duration
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.totalTests}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Test Runs
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {history.length === 0 ? (
          <Alert severity="info">
            No test history yet. Run some tests to see results here!
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Passed</TableCell>
                  <TableCell align="center">Failed</TableCell>
                  <TableCell align="center">Success Rate</TableCell>
                  <TableCell align="right">Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>
                      {new Date(test.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={test.type === 'automated_suite' ? 'Automated Suite' : 'Manual Test'}
                        size="small"
                        color={test.type === 'automated_suite' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        icon={<CheckIcon />}
                        label={test.passed}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {test.failed > 0 ? (
                        <Chip 
                          icon={<CloseIcon />}
                          label={test.failed}
                          size="small"
                          color="error"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">0</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={test.successRate}
                          sx={{ width: 100, height: 6, borderRadius: 1 }}
                          color={test.successRate === 100 ? 'success' : test.successRate >= 80 ? 'primary' : 'warning'}
                        />
                        <Typography variant="caption" fontWeight="bold">
                          {test.successRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {test.totalDuration}ms
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default IDIQTestHistory;