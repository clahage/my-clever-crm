// ============================================================================
// Path: /src/components/addendums/AddendumPOA.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================
// ADDENDUM: POWER OF ATTORNEY EXTENSION
// Extends POA authorization to match the new contract end date
// ============================================================================

import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, Button, Grid, Alert, Chip } from '@mui/material';
import { Scale, CheckCircle, Download } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';

export default function AddendumPOA({ contact, originalContract, newEndDate, onComplete }) {
  const [clientSignature, setClientSignature] = useState(null);
  const clientSigRef = useRef(null);
  const signatureDate = format(new Date(), 'MMMM dd, yyyy');

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1a365d', fontWeight: 'bold' }}>
          POWER OF ATTORNEY EXTENSION
        </Typography>
        <Chip label="Authorization Extension" color="primary" sx={{ mt: 1 }} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          This addendum extends the Power of Attorney granted to <strong>Speedy Credit Repair Inc.</strong> by{' '}
          <strong>{contact?.firstName} {contact?.lastName}</strong> under the original Service Agreement.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          The powers granted in your original Power of Attorney remain unchanged. This addendum simply extends 
          the authorization period to match your extended service agreement through <strong>{newEndDate}</strong>.
        </Alert>

        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d', mt: 3 }}>
          Extension Terms
        </Typography>

        <Box component="ol" sx={{ pl: 3, '& li': { mb: 1.5 } }}>
          <li>
            <Typography variant="body2">
              The Power of Attorney authorization is extended through <strong>{newEndDate}</strong>.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              All powers granted in the original POA remain in full effect (bureau communications, 
              document submission, dispute representation).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              All terms and conditions of the original Power of Attorney remain unchanged.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Client may revoke this authorization at any time with written notice.
            </Typography>
          </li>
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