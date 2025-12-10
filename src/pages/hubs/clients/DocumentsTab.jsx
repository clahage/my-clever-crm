// Path: /src/pages/hubs/clients/DocumentsTab.jsx
// ============================================================================
// CLIENTS HUB - DOCUMENTS TAB
// ============================================================================
// Purpose: Client document management with upload/download capabilities
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Upload,
  Download,
  FileText,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  File,
  Image,
  FileArchive,
  Eye,
  Folder,
  Plus,
  CheckCircle
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const DocumentsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const [uploadFormData, setUploadFormData] = useState({
    category: 'credit_report',
    description: '',
    file: null
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const q = query(
        collection(db, 'clientDocuments'),
        where('clientId', '==', selectedClient),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const documentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDocuments(documentsData);
      });

      return () => unsubscribe();
    }
  }, [selectedClient]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 10MB',
          severity: 'error'
        });
        return;
      }
      setUploadFormData({ ...uploadFormData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadFormData.file || !selectedClient) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = `${Date.now()}_${uploadFormData.file.name}`;
      const storageRef = ref(storage, `clients/${selectedClient}/documents/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadFormData.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setSnackbar({
            open: true,
            message: 'Error uploading file',
            severity: 'error'
          });
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, 'clientDocuments'), {
            clientId: selectedClient,
            fileName: uploadFormData.file.name,
            fileSize: uploadFormData.file.size,
            fileType: uploadFormData.file.type,
            category: uploadFormData.category,
            description: uploadFormData.description,
            storagePath: storageRef.fullPath,
            downloadURL: downloadURL,
            createdAt: serverTimestamp(),
            createdBy: userProfile?.email
          });

          setSnackbar({
            open: true,
            message: 'Document uploaded successfully',
            severity: 'success'
          });

          setUploadDialogOpen(false);
          setUploadFormData({ category: 'credit_report', description: '', file: null });
          setUploading(false);
          setUploadProgress(0);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (error) {
      console.error('Error uploading document:', error);
      setSnackbar({
        open: true,
        message: 'Error uploading document',
        severity: 'error'
      });
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const link = document.createElement('a');
      link.href = document.downloadURL;
      link.download = document.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: 'Download started',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading document',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      if (selectedDoc.storagePath) {
        const storageRef = ref(storage, selectedDoc.storagePath);
        await deleteObject(storageRef);
      }

      await deleteDoc(doc(db, 'clientDocuments', selectedDoc.id));

      setSnackbar({
        open: true,
        message: 'Document deleted successfully',
        severity: 'success'
      });

      setDeleteDialogOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting document',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image size={20} />;
    if (fileType?.includes('pdf')) return <FileText size={20} />;
    if (fileType?.includes('zip') || fileType?.includes('compressed')) return <FileArchive size={20} />;
    return <File size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      credit_report: 'primary',
      identity: 'warning',
      financial: 'success',
      legal: 'error',
      correspondence: 'info',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Client Selection & Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Select Client"
                >
                  <MenuItem value="">
                    <em>Choose a client</em>
                  </MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedClient}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth disabled={!selectedClient}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="credit_report">Credit Report</MenuItem>
                  <MenuItem value="identity">Identity</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="correspondence">Correspondence</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Upload size={18} />}
                onClick={() => setUploadDialogOpen(true)}
                disabled={!selectedClient}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedClient ? (
        <>
          {/* Document Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        color: 'primary.main'
                      }}
                    >
                      <Folder size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Documents
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {documents.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'success.50',
                        color: 'success.main'
                      }}
                    >
                      <FileText size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Credit Reports
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {documents.filter(d => d.category === 'credit_report').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        color: 'warning.main'
                      }}
                    >
                      <Image size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Identity Docs
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {documents.filter(d => d.category === 'identity').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'info.50',
                        color: 'info.main'
                      }}
                    >
                      <File size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Other Files
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {documents.filter(d => d.category === 'other').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Documents Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 6 }}>
                          <Folder size={48} color="#999" style={{ marginBottom: 16 }} />
                          <Typography variant="body1" color="text.secondary">
                            {documents.length === 0
                              ? 'No documents uploaded yet'
                              : 'No documents match your filters'}
                          </Typography>
                          {documents.length === 0 && (
                            <Button
                              variant="outlined"
                              startIcon={<Upload size={18} />}
                              onClick={() => setUploadDialogOpen(true)}
                              sx={{ mt: 2 }}
                            >
                              Upload First Document
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((document) => (
                      <TableRow key={document.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getFileIcon(document.fileType)}
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {document.fileName}
                              </Typography>
                              {document.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {document.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={document.category?.replace('_', ' ')}
                            color={getCategoryColor(document.category)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFileSize(document.fileSize)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {document.createdAt?.toDate().toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {document.createdBy || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, document)}>
                            <MoreVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Folder size={64} color="#999" style={{ marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                Select a Client
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a client from the dropdown above to view and manage their documents
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownload(selectedDoc)}>
          <Download size={16} style={{ marginRight: 8 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => window.open(selectedDoc?.downloadURL, '_blank')}>
          <Eye size={16} style={{ marginRight: 8 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Uploading: {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                startIcon={<Upload size={18} />}
              >
                {uploadFormData.file ? uploadFormData.file.name : 'Choose File'}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Max file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={uploadFormData.category}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="credit_report">Credit Report</MenuItem>
                  <MenuItem value="identity">Identity Document</MenuItem>
                  <MenuItem value="financial">Financial Document</MenuItem>
                  <MenuItem value="legal">Legal Document</MenuItem>
                  <MenuItem value="correspondence">Correspondence</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                placeholder="Optional description..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFormData.file || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDoc?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsTab;
