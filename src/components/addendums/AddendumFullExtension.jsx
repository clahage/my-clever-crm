// ============================================================================
// Path: /src/components/addendums/AddendumFullExtension.jsx
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// ADDENDUM: FULL CONTRACT EXTENSION (Goodwill)
// ============================================================================
// Extends the service contract term as a goodwill gesture for clients who
// have not achieved reasonable results after 3+ months of service.
//
// CHRISTOPHER'S BUSINESS CONTEXT:
//   "If a client hasn't seen reasonable results after 3 months, I typically
//    offer an extension for the remaining service period charging only items
//    charges, as long as the client agrees and maintains their IDIQ subscription.
//    I often offer an added 3 months of service under the same terms for those
//    who have completed 4-6 months with little results."
//
// TERMS:
//   - Monthly fee: $0 (waived as goodwill)
//   - Per-item fee: Maintain original plan rate ($25 or $75)
//   - Extension period: 3-6 months (admin selects)
//   - IDIQ requirement: Must maintain $21.86/mo subscription
//   - No new setup fee
//
// INTEGRATION:
//   - AdminAddendumFlow: Generates this addendum as part of extension package
//   - AI Eligibility: Analyzes client for qualification before offering
//   - Email: Sends offer email with DocuSign link
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { format, addMonths } from 'date-fns';

export default function AddendumFullExtension({
  contact,
  originalContract,
  extensionMonths = 3,
  itemFee = 25,
  onComplete
}) {
  // ============================================================================
  // ===== STATE =====
  // ============================================================================

  const [formData, setFormData] = useState({
    clientName: `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim(),
    originalContractNumber: originalContract?.contractNumber || originalContract?.id || 'N/A',
    originalStartDate: originalContract?.signedAt ? format(new Date(originalContract.signedAt.toDate()), 'MMMM dd, yyyy') : 'N/A',
    originalEndDate: originalContract?.endDate ? format(new Date(originalContract.endDate), 'MMMM dd, yyyy') : 'N/A',
    extensionMonths: extensionMonths,
    newEndDate: originalContract?.endDate ? 
      format(addMonths(new Date(originalContract.endDate), extensionMonths), 'MMMM dd, yyyy') : 
      format(addMonths(new Date(), extensionMonths), 'MMMM dd, yyyy'),
    itemFee: itemFee,
    idiqSubscription: 21.86,
    agreeToTerms: false
  });

  const [clientSignature, setClientSignature] = useState(null);
  const [scrSignature, setScrSignature] = useState(null);
  const [signatureDate, setSignatureDate] = useState(format(new Date(), 'MMMM dd, yyyy'));

  const clientSigRef = useRef(null);
  const scrSigRef = useRef(null);

  // ============================================================================
  // ===== RENDER =====
  // ============================================================================

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1a365d', fontWeight: 'bold' }}>
          CONTRACT EXTENSION ADDENDUM
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Goodwill Extension Agreement
        </Typography>
        <Chip 
          label={`${extensionMonths}-Month Extension`} 
          color="primary" 
          sx={{ mt: 1 }} 
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Introduction */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d' }}>
          Agreement Overview
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          This Addendum extends the original Service Agreement between <strong>{formData.clientName}</strong> ("Client") 
          and <strong>Speedy Credit Repair Inc.</strong> ("Company") as a goodwill gesture to provide additional time 
          for credit repair services.
        </Typography>
      </Box>

      {/* Original Contract Information */}
      <Card variant="outlined" sx={{ mb: 4, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={20} />
            Original Contract Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Contract Number:</Typography>
              <Typography variant="body1" fontWeight="medium">{formData.originalContractNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Original Start Date:</Typography>
              <Typography variant="body1" fontWeight="medium">{formData.originalStartDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Original End Date:</Typography>
              <Typography variant="body1" fontWeight="medium">{formData.originalEndDate}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">New End Date:</Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ color: '#1976d2' }}>
                {formData.newEndDate}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Extension Terms */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DollarSign size={20} />
          Extension Terms & Pricing
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Goodwill Extension Offer</AlertTitle>
          As a valued client, we are extending your service agreement with special pricing to help you 
          achieve your credit repair goals.
        </Alert>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Service Component</strong></TableCell>
                <TableCell align="right"><strong>Original Price</strong></TableCell>
                <TableCell align="right"><strong>Extension Price</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Monthly Service Fee</TableCell>
                <TableCell align="right">${originalContract?.monthlyPrice || 149}/month</TableCell>
                <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  $0/month (WAIVED)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Per-Item Deletion Fee</TableCell>
                <TableCell align="right">${formData.itemFee}/item</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${formData.itemFee}/item (UNCHANGED)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>IDIQ Credit Monitoring</TableCell>
                <TableCell align="right">${formData.idiqSubscription}/month</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  ${formData.idiqSubscription}/month (REQUIRED)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Terms and Conditions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d' }}>
          Terms and Conditions
        </Typography>

        <Box component="ol" sx={{ pl: 3, '& li': { mb: 2 } }}>
          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Extension Period:</strong> This addendum extends the service agreement for an additional{' '}
              <strong>{formData.extensionMonths} months</strong>, with a new end date of{' '}
              <strong>{formData.newEndDate}</strong>.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Monthly Service Fee Waived:</strong> The regular monthly service fee is completely waived 
              during the extension period as a goodwill gesture. Client will pay <strong>$0 per month</strong> 
              for service fees.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Per-Item Deletion Fees:</strong> Client agrees to pay <strong>${formData.itemFee}</strong> per 
              negative item successfully removed from their credit report during the extension period. This fee 
              applies only when Company verifies deletion with the credit bureaus.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>IDIQ Subscription Requirement:</strong> Client MUST maintain their IDIQ credit monitoring 
              subscription at <strong>${formData.idiqSubscription} per month</strong> throughout the extension period. 
              Cancellation of IDIQ subscription will result in immediate termination of this extension agreement.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>No New Setup Fee:</strong> No additional setup fee or enrollment fee will be charged for 
              this extension.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Same Service Level:</strong> Client will continue to receive the same level of service, 
              including dispute letter generation, bureau submissions, and progress monitoring, as outlined in 
              the original service agreement.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Original Agreement Terms:</strong> All other terms and conditions from the original Service 
              Agreement dated <strong>{formData.originalStartDate}</strong> remain in full force and effect, except 
              as specifically modified by this addendum.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Payment Terms:</strong> All per-item deletion fees will be charged to the payment method 
              on file within 5 business days of verified deletion. Client authorizes Company to charge the 
              payment method on file for these fees.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>Cancellation:</strong> Either party may cancel this extension agreement with 30 days written 
              notice. Original cancellation terms from the Service Agreement apply.
            </Typography>
          </li>

          <li>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <strong>No Guarantee of Results:</strong> Company makes no guarantee of specific results or number 
              of items to be deleted during the extension period. Results vary based on individual circumstances 
              and credit bureau responses.
            </Typography>
          </li>
        </Box>
      </Box>

      {/* Client Acknowledgment */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>Client Acknowledgment</AlertTitle>
        <Typography variant="body2" paragraph>
          By signing below, Client acknowledges that they have read, understood, and agree to all terms of 
          this Contract Extension Addendum. Client understands that:
        </Typography>
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
          <li>Monthly service fees are waived during the extension period</li>
          <li>Per-item deletion fees of ${formData.itemFee} apply to successful removals</li>
          <li>IDIQ subscription must remain active throughout the extension</li>
          <li>All original contract terms remain in effect except as modified herein</li>
        </ul>
      </Alert>

      {/* Signatures */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1a365d' }}>
          Signatures
        </Typography>

        <Grid container spacing={4}>
          {/* Client Signature */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Client Signature
              </Typography>
              <Box
                sx={{
                  border: 2,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'white',
                  mb: 2
                }}
              >
                <SignatureCanvas
                  ref={clientSigRef}
                  canvasProps={{
                    width: 350,
                    height: 150,
                    style: { width: '100%', height: '150px' }
                  }}
                  backgroundColor="white"
                  onEnd={() => setClientSignature(clientSigRef.current?.toDataURL())}
                />
              </Box>
              <Button
                size="small"
                onClick={() => {
                  clientSigRef.current?.clear();
                  setClientSignature(null);
                }}
              >
                Clear
              </Button>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Client Name: <strong>{formData.clientName}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: <strong>{signatureDate}</strong>
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* SCR Signature */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle2" gutterBottom>
                Speedy Credit Repair Inc. Signature
              </Typography>
              <Box sx={{ mb: 2 }}>
                {scrSignature ? (
                  <img src={scrSignature} alt="SCR Signature" style={{ maxWidth: '100%', height: '150px' }} />
                ) : (
                  <Alert severity="info">
                    SCR signature will be applied automatically upon client signature
                  </Alert>
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Authorized Representative: <strong>Christopher Lahage</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Title: <strong>Owner & CEO</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: <strong>{signatureDate}</strong>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => window.print()}
        >
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          disabled={!clientSignature}
          onClick={() => onComplete && onComplete({ clientSignature, scrSignature, formData })}
        >
          Submit Addendum
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Speedy Credit Repair Inc. | 117 Main Street #202, Huntington Beach, CA 92648
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. All Rights Reserved. 
          Trademark #4662906 Serial #86274062
        </Typography>
      </Box>
    </Paper>
  );
}