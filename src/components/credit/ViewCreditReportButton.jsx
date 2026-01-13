// Path: /src/components/credit/ViewCreditReportButton.jsx
// SIMPLE VIEW CREDIT REPORT BUTTON - January 13, 2026

import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { Eye } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

const ViewCreditReportButton = ({ 
  contactId,
  contactEmail,
  membershipNumber,
  variant = 'contained',
  size = 'medium',
  fullWidth = false
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService({
        action: 'retrieveReport',
        contactId,
        email: contactEmail,
        membershipNumber
      });

      if (response.data.success) {
        setReportData(response.data.report);
      } else {
        setError(response.data.error || 'Failed to retrieve report');
      }
    } catch (err) {
      setError(err.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!reportData) fetchReport();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<Eye size={18} />}
        onClick={handleOpen}
      >
        View Credit Report
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Credit Report</DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {reportData && (
            <Box>
              <Typography variant="h6" gutterBottom>Credit Scores</Typography>
              {reportData.scores && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="body2">Equifax</Typography>
                    <Typography variant="h4">{reportData.scores.equifax || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">Experian</Typography>
                    <Typography variant="h4">{reportData.scores.experian || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">TransUnion</Typography>
                    <Typography variant="h4">{reportData.scores.transunion || 'N/A'}</Typography>
                  </Box>
                </Box>
              )}
              <Typography variant="body2">
                Full report details available in Credit Reports Hub
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewCreditReportButton;