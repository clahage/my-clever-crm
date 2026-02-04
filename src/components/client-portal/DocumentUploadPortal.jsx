// FILE: /src/components/client-portal/DocumentUploadPortal.jsx
// =====================================================
// DOCUMENT UPLOAD PORTAL - TIER 3 ENTERPRISE (FIXED)
// =====================================================
// Purpose: Client-facing document upload page for optional documents
// Triggered by: Email link after contract signing
// URL: /portal/documents?contactId=xxx
// 
// FEATURES:
// - Optional document uploads (ID, Proof of Address, SSN Card)
// - Drag & drop file upload
// - Real-time upload progress
// - File type validation
// - Mobile-responsive design
// - Dark mode support
// - Writes to CORRECT fields matching UltimateContactForm
// - Also writes to clientDocuments collection for portal view
// - Secure Firebase Storage
// - Progress tracking
//
// FIELD MAPPING (matches UltimateContactForm.jsx):
// - Government ID → photoIdUrl (top), documents.idReceived, documents.idFileUrl, documents.idUploadDate
// - Proof of Address → documents.proofOfAddressReceived, documents.proofOfAddressFileUrl
// - SSN Card → documents.ssnCardReceived, documents.ssnCardFileUrl, documents.ssnCardUploadDate
//
// © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
// =====================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Paper,
  Grid,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Cancel,
  Description,
  CreditCard,
  Home,
  Badge,
  Delete,
  Visibility,
  Download,
  Info,
  Security,
  Timer,
  Phone,
  Email,
  ArrowBack,
  Celebration
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

// =====================================================
// DOCUMENT TYPES CONFIGURATION
// =====================================================
// IMPORTANT: Field names MUST match UltimateContactForm.jsx exactly!
// =====================================================
const DOCUMENT_TYPES = [
  {
    id: 'governmentId',
    label: 'Government-Issued ID',
    description: 'Driver\'s license, passport, or state ID',
    icon: Badge,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    // ===== CORRECT FIELD MAPPINGS FOR ULTIMATE CONTACT FORM =====
    firestoreFields: {
      received: 'documents.idReceived',
      fileUrl: 'documents.idFileUrl',
      uploadDate: 'documents.idUploadDate',
      topLevelUrl: 'photoIdUrl'  // Also set at top level for thumbnail!
    },
    helpText: 'Clear photo showing your full name and photo'
  },
  {
    id: 'proofOfAddress',
    label: 'Proof of Address',
    description: 'Utility bill, bank statement, or lease agreement',
    icon: Home,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 10 * 1024 * 1024,
    firestoreFields: {
      received: 'documents.proofOfAddressReceived',
      fileUrl: 'documents.proofOfAddressFileUrl',
      uploadDate: null  // No upload date field for this one
    },
    helpText: 'Document dated within the last 60 days'
  },
  {
    id: 'ssnCard',
    label: 'Social Security Card',
    description: 'Front of your Social Security card',
    icon: CreditCard,
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSize: 10 * 1024 * 1024,
    firestoreFields: {
      received: 'documents.ssnCardReceived',
      fileUrl: 'documents.ssnCardFileUrl',
      uploadDate: 'documents.ssnCardUploadDate'
    },
    helpText: 'Helps verify identity with credit bureaus'
  }
];

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function DocumentUploadPortal() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contactId = searchParams.get('contactId');

  // ===== STATE =====
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(null);
  const [uploads, setUploads] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [allComplete, setAllComplete] = useState(false);

  // ===== LOAD CONTACT DATA =====
  useEffect(() => {
    const loadContact = async () => {
      if (!contactId) {
        setError('No contact ID provided');
        setLoading(false);
        return;
      }

      try {
        const contactRef = doc(db, 'contacts', contactId);
        const contactSnap = await getDoc(contactRef);

        if (!contactSnap.exists()) {
          setError('Contact not found');
          setLoading(false);
          return;
        }

        const contactData = { id: contactSnap.id, ...contactSnap.data() };
        setContact(contactData);

        // Initialize uploads state based on existing documents
        const existingUploads = {};
        DOCUMENT_TYPES.forEach(docType => {
          // Check the correct field paths
          let received = false;
          let url = '';
          
          if (docType.id === 'governmentId') {
            received = contactData.documents?.idReceived || false;
            url = contactData.documents?.idFileUrl || contactData.photoIdUrl || '';
          } else if (docType.id === 'proofOfAddress') {
            received = contactData.documents?.proofOfAddressReceived || false;
            url = contactData.documents?.proofOfAddressFileUrl || '';
          } else if (docType.id === 'ssnCard') {
            received = contactData.documents?.ssnCardReceived || false;
            url = contactData.documents?.ssnCardFileUrl || '';
          }
          
          if (received && url) {
            existingUploads[docType.id] = { url, uploaded: true };
          }
        });
        setUploads(existingUploads);

        setLoading(false);
      } catch (err) {
        console.error('Error loading contact:', err);
        setError('Failed to load contact information');
        setLoading(false);
      }
    };

    loadContact();
  }, [contactId]);

  // ===== FILE UPLOAD HANDLER =====
  const handleFileUpload = useCallback(async (docType, file) => {
    if (!file || !contact) return;

    // Validate file type
    if (!docType.acceptedFormats.includes(file.type)) {
      setSnackbar({
        open: true,
        message: `Invalid file type. Please upload: ${docType.acceptedFormats.map(f => f.split('/')[1]).join(', ')}`,
        severity: 'error'
      });
      return;
    }

    // Validate file size
    if (file.size > docType.maxSize) {
      setSnackbar({
        open: true,
        message: `File too large. Maximum size: ${docType.maxSize / (1024 * 1024)}MB`,
        severity: 'error'
      });
      return;
    }

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${docType.id}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `contact-documents/${contactId}/${fileName}`);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [docType.id]: progress }));
        },
        (error) => {
          console.error('Upload error:', error);
          setSnackbar({
            open: true,
            message: 'Upload failed. Please try again.',
            severity: 'error'
          });
          setUploadProgress(prev => ({ ...prev, [docType.id]: 0 }));
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // =====================================================
          // UPDATE FIRESTORE - CORRECT FIELD MAPPINGS
          // =====================================================
          const contactRef = doc(db, 'contacts', contactId);
          const updateData = {
            updatedAt: serverTimestamp(),
            timeline: arrayUnion({
              id: timestamp,
              type: 'document_uploaded',
              description: `${docType.label} uploaded via Document Portal`,
              timestamp: new Date().toISOString(),
              metadata: {
                documentType: docType.id,
                fileName: file.name,
                source: 'document_upload_portal'
              }
            })
          };

          // ===== SET CORRECT FIELDS BASED ON DOCUMENT TYPE =====
          // These field names match UltimateContactForm.jsx exactly!
          if (docType.id === 'governmentId') {
            // Government ID - set multiple fields including top-level photoIdUrl
            updateData['documents.idReceived'] = true;
            updateData['documents.idFileUrl'] = downloadURL;
            updateData['documents.idUploadDate'] = new Date().toISOString();
            updateData['photoIdUrl'] = downloadURL;  // For thumbnail in UltimateContactForm!
            console.log('📷 Government ID: Setting photoIdUrl for thumbnail display');
          } else if (docType.id === 'proofOfAddress') {
            // Proof of Address
            updateData['documents.proofOfAddressReceived'] = true;
            updateData['documents.proofOfAddressFileUrl'] = downloadURL;
          } else if (docType.id === 'ssnCard') {
            // SSN Card
            updateData['documents.ssnCardReceived'] = true;
            updateData['documents.ssnCardFileUrl'] = downloadURL;
            updateData['documents.ssnCardUploadDate'] = new Date().toISOString();
          }

          await updateDoc(contactRef, updateData);
          console.log(`✅ ${docType.label} uploaded - Firestore contact updated`);

          // =====================================================
          // ALSO WRITE TO clientDocuments COLLECTION
          // =====================================================
          // This makes documents appear in the ClientPortal Documents tab
          // and makes them available for dispute letters, etc.
          try {
            await addDoc(collection(db, 'clientDocuments'), {
              // Link to user and contact
              userId: contact.userId || null,
              contactId: contactId,
              
              // Document info
              type: docType.id,
              name: docType.label,
              fileName: file.name,
              fileUrl: downloadURL,
              fileSize: file.size,
              fileType: file.type,
              
              // Categorization for easy retrieval
              category: 'onboarding',
              documentCategory: docType.id === 'governmentId' ? 'identification' :
                               docType.id === 'proofOfAddress' ? 'address_verification' :
                               docType.id === 'ssnCard' ? 'identification' : 'other',
              
              // Status
              status: 'uploaded',
              verified: false,
              
              // Timestamps
              uploadedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
              
              // Source tracking
              source: 'document_upload_portal',
              uploadedBy: 'client',
              
              // Metadata for search and filtering
              metadata: {
                contactName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                contactEmail: contact.email || '',
                contactPhone: contact.phone || '',
                originalFileName: file.name,
                storagePath: `contact-documents/${contactId}/${fileName}`
              },
              
              // For dispute letter attachments
              canAttachToDispute: true,
              attachmentType: docType.id === 'governmentId' ? 'id_copy' :
                             docType.id === 'proofOfAddress' ? 'utility_bill' :
                             docType.id === 'ssnCard' ? 'ssn_card' : 'other'
            });
            console.log(`📁 ${docType.label} also added to clientDocuments collection`);
          } catch (clientDocErr) {
            // Don't fail the whole upload if clientDocuments write fails
            console.error('Warning: Could not add to clientDocuments:', clientDocErr);
          }

          // =====================================================
          // UPDATE LOCAL STATE
          // =====================================================
          setUploads(prev => ({
            ...prev,
            [docType.id]: { url: downloadURL, uploaded: true, fileName: file.name }
          }));
          setUploadProgress(prev => ({ ...prev, [docType.id]: 0 }));

          setSnackbar({
            open: true,
            message: `${docType.label} uploaded successfully!`,
            severity: 'success'
          });

          console.log(`✅ ${docType.label} uploaded for contact ${contactId}`);
        }
      );
    } catch (err) {
      console.error('Error uploading file:', err);
      setSnackbar({
        open: true,
        message: 'Upload failed. Please try again.',
        severity: 'error'
      });
    }
  }, [contact, contactId]);

  // ===== DRAG AND DROP HANDLERS =====
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (docType) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(docType, file);
    }
  };

  // ===== DELETE DOCUMENT =====
  const handleDelete = async (docType) => {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      
      // Build update object with correct field names
      const updateData = {
        updatedAt: serverTimestamp()
      };
      
      if (docType.id === 'governmentId') {
        updateData['documents.idReceived'] = false;
        updateData['documents.idFileUrl'] = '';
        updateData['photoIdUrl'] = '';
      } else if (docType.id === 'proofOfAddress') {
        updateData['documents.proofOfAddressReceived'] = false;
        updateData['documents.proofOfAddressFileUrl'] = '';
      } else if (docType.id === 'ssnCard') {
        updateData['documents.ssnCardReceived'] = false;
        updateData['documents.ssnCardFileUrl'] = '';
      }
      
      await updateDoc(contactRef, updateData);

      setUploads(prev => {
        const newUploads = { ...prev };
        delete newUploads[docType.id];
        return newUploads;
      });

      setSnackbar({
        open: true,
        message: `${docType.label} removed`,
        severity: 'info'
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      setSnackbar({
        open: true,
        message: 'Failed to remove document',
        severity: 'error'
      });
    }
  };

  // ===== RENDER LOADING STATE =====
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
        }}
      >
        <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4 }}>
          <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {error}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please contact support if you need assistance.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Phone />}
            href="tel:8887247344"
          >
            Call (888) 724-7344
          </Button>
        </Card>
      </Box>
    );
  }

  // ===== COUNT UPLOADED DOCUMENTS =====
  const uploadedCount = Object.keys(uploads).length;
  const totalDocTypes = DOCUMENT_TYPES.length;

  // ===== MAIN RENDER =====
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
      }}
    >
      <Container maxWidth="md">
        {/* ===== HEADER ===== */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            ⚡ Document Upload
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome, {contact?.firstName}!
          </Typography>
        </Box>

        {/* ===== INFO ALERT ===== */}
        <Alert
          severity="info"
          icon={<Info />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
            <strong>These documents are completely optional</strong> but help us verify your identity 
            and speed up the dispute process with credit bureaus. You can skip this step and upload 
            them later if you prefer.
          </Typography>
        </Alert>

        {/* ===== SECURITY BADGE ===== */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
          }}
        >
          <Security sx={{ color: 'success.main', fontSize: 32 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Bank-Level Security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your documents are encrypted and stored securely. We never share your information.
            </Typography>
          </Box>
        </Paper>

        {/* ===== PROGRESS INDICATOR ===== */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Documents Uploaded
              </Typography>
              <Chip
                label={`${uploadedCount} of ${totalDocTypes}`}
                color={uploadedCount === totalDocTypes ? 'success' : 'primary'}
                size="small"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={(uploadedCount / totalDocTypes) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>

        {/* ===== DOCUMENT UPLOAD CARDS ===== */}
        <Grid container spacing={3}>
          {DOCUMENT_TYPES.map((docType) => {
            const DocIcon = docType.icon;
            const isUploaded = uploads[docType.id]?.uploaded;
            const progress = uploadProgress[docType.id] || 0;

            return (
              <Grid item xs={12} key={docType.id}>
                <Card
                  sx={{
                    border: isUploaded
                      ? `2px solid ${theme.palette.success.main}`
                      : `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(docType)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isUploaded
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        {isUploaded ? (
                          <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />
                        ) : (
                          <DocIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {docType.label}
                          </Typography>
                          <Chip
                            label="Optional"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {docType.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          💡 {docType.helpText}
                        </Typography>

                        {/* Upload Progress */}
                        {progress > 0 && progress < 100 && (
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Uploading... {Math.round(progress)}%
                            </Typography>
                          </Box>
                        )}

                        {/* Uploaded File Info */}
                        {isUploaded && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 1.5,
                              borderRadius: 1,
                              background: alpha(theme.palette.success.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Document uploaded
                              </Typography>
                            </Box>
                            <Box>
                              <Tooltip title="View Document">
                                <IconButton
                                  size="small"
                                  href={uploads[docType.id]?.url}
                                  target="_blank"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(docType)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Upload Button */}
                      {!isUploaded && (
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<CloudUpload />}
                          disabled={progress > 0}
                          sx={{ minWidth: 140 }}
                        >
                          Upload
                          <input
                            type="file"
                            hidden
                            accept={docType.acceptedFormats.join(',')}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(docType, file);
                            }}
                          />
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ===== COMPLETION MESSAGE ===== */}
        {uploadedCount === totalDocTypes && (
          <Card sx={{ mt: 3, background: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Celebration sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Documents Uploaded! 🎉
              </Typography>
              <Typography color="text.secondary">
                Thank you! We'll start processing your credit repair right away.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ===== SKIP / CONTINUE BUTTON ===== */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/client-portal')}
            sx={{ mr: 2 }}
          >
            {uploadedCount > 0 ? 'Continue to Portal' : 'Skip for Now'}
          </Button>
          {uploadedCount === 0 && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              You can always upload documents later from your client portal
            </Typography>
          )}
        </Box>

        {/* ===== CONTACT INFO ===== */}
        <Paper sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Need Help?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Button startIcon={<Phone />} href="tel:8887247344">
              (888) 724-7344
            </Button>
            <Button startIcon={<Email />} href="mailto:chris@speedycreditrepair.com">
              Email Support
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. | All Rights Reserved
          </Typography>
        </Paper>
      </Container>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}