// Path: /src/pages/hubs/credit/ReportsTab.jsx
// ============================================================================
// CREDIT HUB - CREDIT REPORTS TAB
// ============================================================================
// Purpose: View credit reports
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  FileText,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { collection, query, onSnapshot, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ReportsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bureauTab, setBureauTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const unsubscribers = [];

    // For clients, only show their reports
    const reportsQuery = userProfile?.role === 'client'
      ? query(
          collection(db, 'creditReports'),
          where('clientId', '==', userProfile.uid),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'creditReports'), orderBy('createdAt', 'desc'));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
      setLoading(false);
    });
    unsubscribers.push(unsubReports);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
    setBureauTab(0);
  };

  const handleDownloadReport = async (report) => {
    try {
      // TODO: Implement report download functionality
      setSnackbar({
        open: true,
        message: 'Report download will be available soon',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading report',
        severity: 'error'
      });
    }
  };

  const handleRefreshReport = async (report) => {
    try {
      // TODO: Fetch latest report from IDIQ API
      setSnackbar({
        open: true,
        message: 'Refreshing report...',
        severity: 'info'
      });

      // IDIQ API integration point
      // const updatedReport = await fetchReportFromIDIQ(report.clientId);
      // await updateDoc(doc(db, 'creditReports', report.id), {
      //   ...updatedReport,
      //   updatedAt: serverTimestamp()
      // });

    } catch (error) {
      console.error('Error refreshing report:', error);
      setSnackbar({
        open: true,
        message: 'Error refreshing report',
        severity: 'error'
      });
    }
  };

  const getScoreTrend = (current, previous) => {
    if (!previous) return <Minus size={16} />;
    const diff = current - previous;
    if (diff > 0) return <TrendingUp size={16} color="green" />;
    if (diff < 0) return <TrendingDown size={16} color="red" />;
    return <Minus size={16} />;
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'success.main';
    if (score >= 650) return 'warning.main';
    return 'error.main';
  };

  const renderBureauContent = (bureau) => {
    if (!selectedReport) return null;

    const bureauData = selectedReport.bureaus?.[bureau] || {};
    const accounts = bureauData.accounts || [];
    const inquiries = bureauData.inquiries || [];
    const publicRecords = bureauData.publicRecords || [];

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Score Card */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {bureau} Credit Score
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: getScoreColor(bureauData.score) }}>
                      {bureauData.score || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      Previous: {bureauData.previousScore || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {getScoreTrend(bureauData.score, bureauData.previousScore)}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Accounts */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Accounts ({accounts.length})
            </Typography>
            <Card>
              <List>
                {accounts.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No accounts found"
                      secondary="This report has no account information"
                    />
                  </ListItem>
                ) : (
                  accounts.map((account, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={account.creditor || 'Unknown Creditor'}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Account Type: {account.type || 'N/A'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Balance: ${account.balance?.toLocaleString() || '0'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Status: <Chip
                                  label={account.status || 'Unknown'}
                                  size="small"
                                  color={account.status === 'Current' ? 'success' : 'default'}
                                  sx={{ height: 18 }}
                                />
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </Card>
          </Grid>

          {/* Inquiries */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Inquiries ({inquiries.length})
            </Typography>
            <Card>
              <List>
                {inquiries.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No inquiries found"
                      secondary="This report has no inquiry information"
                    />
                  </ListItem>
                ) : (
                  inquiries.map((inquiry, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={inquiry.creditor || 'Unknown Creditor'}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Date: {inquiry.date || 'N/A'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Type: {inquiry.type || 'Hard Inquiry'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </Card>
          </Grid>

          {/* Public Records */}
          {publicRecords.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Public Records ({publicRecords.length})
              </Typography>
              <Card>
                <List>
                  {publicRecords.map((record, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={record.type || 'Unknown Record'}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Filed Date: {record.filedDate || 'N/A'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Status: {record.status || 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          Credit Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and download credit reports from all three bureaus
        </Typography>
      </Box>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {userProfile?.role !== 'client' && <TableCell>Client</TableCell>}
                  <TableCell>Report Date</TableCell>
                  <TableCell>Equifax</TableCell>
                  <TableCell>Experian</TableCell>
                  <TableCell>TransUnion</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userProfile?.role !== 'client' ? 6 : 5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No credit reports available yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      {userProfile?.role !== 'client' && (
                        <TableCell>{report.clientName}</TableCell>
                      )}
                      <TableCell>
                        {report.createdAt?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: getScoreColor(report.bureaus?.equifax?.score) }}>
                          {report.bureaus?.equifax?.score || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: getScoreColor(report.bureaus?.experian?.score) }}>
                          {report.bureaus?.experian?.score || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: getScoreColor(report.bureaus?.transunion?.score) }}>
                          {report.bureaus?.transunion?.score || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewReport(report)} title="View Report">
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDownloadReport(report)} title="Download">
                          <Download size={18} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRefreshReport(report)} title="Refresh">
                          <RefreshCw size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Credit Report Details
          {selectedReport && (
            <Typography variant="caption" display="block" color="text.secondary">
              Report Date: {selectedReport.createdAt?.toDate().toLocaleDateString()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Tabs value={bureauTab} onChange={(e, v) => setBureauTab(v)}>
            <Tab label="Equifax" />
            <Tab label="Experian" />
            <Tab label="TransUnion" />
          </Tabs>
          {bureauTab === 0 && renderBureauContent('equifax')}
          {bureauTab === 1 && renderBureauContent('experian')}
          {bureauTab === 2 && renderBureauContent('transunion')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => handleDownloadReport(selectedReport)}
          >
            Download Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsTab;
