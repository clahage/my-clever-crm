// ============================================================================
// Path: /src/components/addendums/AddendumACH.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================
// ADDENDUM: ACH AUTHORIZATION EXTENSION
// Extends ACH authorization for per-item charges during extension period
// ============================================================================

import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, Button, Grid, Alert, Chip, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { CreditCard, CheckCircle, Download } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';

export default function AddendumACH({ contact, originalContract, newEndDate, itemFee, onComplete }) {
  const [clientSignature, setClientSignature] = useState(null);
  const clientSigRef = useRef(null);
  const signatureDate = format(new Date(), 'MMMM dd, yyyy');

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1a365d', fontWeight: 'bold' }}>
          ACH AUTHORIZATION EXTENSION
        </Typography>
        <Chip label="Payment Authorization" color="primary" sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          This addendum extends the ACH payment authorization for <strong>{contact?.firstName} {contact?.lastName}</strong> 
          to cover per-item deletion charges during the contract extension period.
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Good News:</strong> No monthly service fees during the extension period! 
          You only pay when we successfully remove items.
        </Alert>

        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d', mt: 3 }}>
          Payment Authorization
        </Typography>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell><strong>Authorization Period:</strong></TableCell>
              <TableCell>Through {newEndDate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Monthly Service Fee:</strong></TableCell>
              <TableCell sx={{ color: '#2e7d32', fontWeight: 'bold' }}>$0 (WAIVED)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Per-Item Deletion Fee:</strong></TableCell>
              <TableCell>${itemFee} per successful removal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>NSF Fee (if payment fails):</strong></TableCell>
              <TableCell>$25</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1a365d' }}>
            Terms
          </Typography>
          <Box component="ol" sx={{ pl: 3, '& li': { mb: 1.5 } }}>
            <li>
              <Typography variant="body2">
                Banking information remains the same as original authorization unless updated separately.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Charges apply only when Company verifies deletion with credit bureaus.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Charges will be processed within 5 business days of verified deletion.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Client may revoke authorization with 3 business days written notice.
              </Typography>
            </li>
          </Box>
        </Box>
      </Box>

      {/* Signature */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Client Signature</Typography>
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 500 }}>
          <Box sx={{ border: 2, borderColor: 'divider', borderRadius: 1, bgcolor: 'white', mb: 2 }}>
            <SignatureCanvas
              ref={clientSigRef}
              canvasProps={{ width: 450, height: 150, style: { width: '100%', height: '150px' } }}
              backgroundColor="white"
              onEnd={() => setClientSignature(clientSigRef.current?.toDataURL())}
            />
          </Box>
          <Button size="small" onClick={() => { clientSigRef.current?.clear(); setClientSignature(null); }}>
            Clear
          </Button>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Client: <strong>{contact?.firstName} {contact?.lastName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: <strong>{signatureDate}</strong>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<Download />} onClick={() => window.print()}>
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={!clientSignature}
          onClick={() => onComplete && onComplete({ clientSignature })}
        >
          Submit
        </Button>
      </Box>

      <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. All Rights Reserved.
        </Typography>
      </Box>
    </Paper>
  );
}