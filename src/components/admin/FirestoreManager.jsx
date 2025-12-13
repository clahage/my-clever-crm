// Path: src/components/admin/FirestoreManager.jsx
// =====================================================
// FIRESTORE MANAGER - Comprehensive Database Browser
// =====================================================
// Full Firestore collection/document browser and editor
// Features: CRUD operations, bulk delete, search/filter, 
// export/import, activity log integration, real-time updates
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark: SpeedyCRM® (USPTO Registered)
// Unauthorized use will be prosecuted to the fullest extent of the law.
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Divider,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Database,
  FolderOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  RefreshCw,
  Filter,
  X,
  Save,
  Copy,
  MoreVertical,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

// =====================================================
// MAIN COMPONENT
// =====================================================
const FirestoreManager = () => {
  // ===== Authentication & Authorization =====
  const { user, userProfile } = useAuth();

  // ===== State Management =====
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== Dialog States =====
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [editData, setEditData] = useState('');
  const [newDocId, setNewDocId] = useState('');
  const [importData, setImportData] = useState('');

  // ===== Filter & Sort States =====
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // ===== Menu State =====
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDoc, setMenuDoc] = useState(null);

  // ===== Predefined Collections (Common SpeedyCRM Collections) =====
  const predefinedCollections = [
    'contacts',
    'invoices',
    'tasks',
    'disputes',
    'idiqEnrollments',
    'userProfiles',
    'emails',
    'documents',
    'appointments',
    'campaigns',
    'automations',
    'notifications',
    'activityLog',
    'clientDocuments',
    'creditReports',
    'disputeLetters',
    'servicePlans',
    'affiliates',
    'referrals',
  ];

  // =====================================================
  // LIFECYCLE HOOKS
  // =====================================================
  useEffect(() => {
    setCollections(predefinedCollections);
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadDocuments();
    }
  }, [selectedCollection, filterField, filterValue, sortField, sortDirection]);

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================
  
  // Load all documents from selected collection
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      let q = collection(db, selectedCollection);

      // Apply filters if specified
      if (filterField && filterValue) {
        q = query(q, where(filterField, '==', filterValue));
      }

      // Apply sorting if specified
      if (sortField) {
        q = query(q, orderBy(sortField, sortDirection));
      }

      // Limit to 100 documents for performance
      q = query(q, limit(100));

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));

      setDocuments(docs);
      setSelectedDocs([]);

      // Log activity
      await logActivity('view', `Viewed ${docs.length} documents in ${selectedCollection}`);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(`Failed to load documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  // Create new document
  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!newDocId.trim()) {
        setError('Document ID is required');
        return;
      }

      let data;
      try {
        data = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      // Add metadata
      data.createdAt = serverTimestamp();
      data.createdBy = user.uid;
      data.updatedAt = serverTimestamp();
      data.updatedBy = user.uid;

      await setDoc(doc(db, selectedCollection, newDocId), data);

      setSuccess(`Document created successfully: ${newDocId}`);
      setCreateDialogOpen(false);
      setNewDocId('');
      setEditData('');
      loadDocuments();

      // Log activity
      await logActivity('create', `Created document ${newDocId} in ${selectedCollection}`);
    } catch (err) {
      console.error('Error creating document:', err);
      setError(`Failed to create document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update existing document
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      try {
        data = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      // Add update metadata
      data.updatedAt = serverTimestamp();
      data.updatedBy = user.uid;

      await updateDoc(doc(db, selectedCollection, currentDoc.id), data);

      setSuccess(`Document updated successfully: ${currentDoc.id}`);
      setEditDialogOpen(false);
      setCurrentDoc(null);
      setEditData('');
      loadDocuments();

      // Log activity
      await logActivity('update', `Updated document ${currentDoc.id} in ${selectedCollection}`);
    } catch (err) {
      console.error('Error updating document:', err);
      setError(`Failed to update document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete single or multiple documents
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const docsToDelete = currentDoc ? [currentDoc] : selectedDocs;

      if (docsToDelete.length === 0) {
        setError('No documents selected for deletion');
        return;
      }

      // Use batch for multiple deletes
      if (docsToDelete.length > 1) {
        const batch = writeBatch(db);
        docsToDelete.forEach(d => {
          batch.delete(doc(db, selectedCollection, d.id));
        });
        await batch.commit();
      } else {
        await deleteDoc(doc(db, selectedCollection, docsToDelete[0].id));
      }

      setSuccess(`${docsToDelete.length} document(s) deleted successfully`);
      setDeleteDialogOpen(false);
      setCurrentDoc(null);
      setSelectedDocs([]);
      loadDocuments();

      // Log activity
      await logActivity('delete', `Deleted ${docsToDelete.length} document(s) from ${selectedCollection}`);
    } catch (err) {
      console.error('Error deleting documents:', err);
      setError(`Failed to delete documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // IMPORT/EXPORT OPERATIONS
  // =====================================================

  // Export documents to JSON
  const handleExport = () => {
    try {
      const docsToExport = selectedDocs.length > 0 ? selectedDocs : documents;
      const exportData = docsToExport.map(doc => ({
        id: doc.id,
        ...doc.data,
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedCollection}_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(`Exported ${exportData.length} documents`);

      // Log activity
      logActivity('export', `Exported ${exportData.length} documents from ${selectedCollection}`);
    } catch (err) {
      console.error('Error exporting documents:', err);
      setError(`Failed to export documents: ${err.message}`);
    }
  };

  // Import documents from JSON
  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      try {
        data = JSON.parse(importData);
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      if (!Array.isArray(data)) {
        setError('Import data must be an array of documents');
        return;
      }

      // Use batch for multiple imports
      const batch = writeBatch(db);
      let importCount = 0;

      data.forEach(item => {
        const { id, ...docData } = item;
        if (id) {
          // Add metadata
          docData.importedAt = serverTimestamp();
          docData.importedBy = user.uid;
          docData.updatedAt = serverTimestamp();
          docData.updatedBy = user.uid;

          batch.set(doc(db, selectedCollection, id), docData, { merge: true });
          importCount++;
        }
      });

      await batch.commit();

      setSuccess(`Imported ${importCount} documents successfully`);
      setImportDialogOpen(false);
      setImportData('');
      loadDocuments();

      // Log activity
      await logActivity('import', `Imported ${importCount} documents to ${selectedCollection}`);
    } catch (err) {
      console.error('Error importing documents:', err);
      setError(`Failed to import documents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  // Log activity to activityLog collection
  const logActivity = async (action, description) => {
    try {
      const logEntry = {
        action,
        description,
        collection: selectedCollection,
        userId: user.uid,
        userEmail: user.email,
        userName: userProfile?.name || 'Unknown',
        timestamp: serverTimestamp(),
        source: 'FirestoreManager',
      };

      await setDoc(doc(collection(db, 'activityLog')), logEntry);
    } catch (err) {
      console.error('Error logging activity:', err);
      // Don't throw - logging failure shouldn't break main operation
    }
  };

  // Format document data for display
  const formatDocData = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return 'Error formatting data';
    }
  };

  // Get document field value
  const getFieldValue = (doc, field) => {
    const value = doc.data[field];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Select/deselect document
  const toggleDocSelection = (doc) => {
    setSelectedDocs(prev => {
      const isSelected = prev.some(d => d.id === doc.id);
      if (isSelected) {
        return prev.filter(d => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  // Select all documents
  const toggleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs([...documents]);
    }
  };

  // Open document menu
  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setMenuDoc(doc);
  };

  // Close document menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDoc(null);
  };

  // View document
  const handleView = (doc) => {
    setCurrentDoc(doc);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  // Edit document
  const handleEdit = (doc) => {
    setCurrentDoc(doc);
    setEditData(formatDocData(doc.data));
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Prepare delete
  const handleDeleteSingle = (doc) => {
    setCurrentDoc(doc);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Copy document
  const handleCopy = async (doc) => {
    try {
      const newId = `${doc.id}_copy_${Date.now()}`;
      const data = { ...doc.data };
      data.createdAt = serverTimestamp();
      data.createdBy = user.uid;
      data.copiedFrom = doc.id;

      await setDoc(doc(db, selectedCollection, newId), data);
      setSuccess(`Document copied: ${newId}`);
      loadDocuments();

      // Log activity
      await logActivity('copy', `Copied document ${doc.id} to ${newId} in ${selectedCollection}`);
    } catch (err) {
      console.error('Error copying document:', err);
      setError(`Failed to copy document: ${err.message}`);
    }
    handleMenuClose();
  };

  // Get all unique fields from documents
  const getAllFields = () => {
    const fields = new Set();
    documents.forEach(doc => {
      Object.keys(doc.data).forEach(key => fields.add(key));
    });
    return Array.from(fields).sort();
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================
  return (
    <Box sx={{ p: 3 }}>
      {/* ===== Header ===== */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Database size={32} className="text-blue-500" />
          <Typography variant="h4" fontWeight="bold">
            Firestore Manager
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse, edit, and manage Firestore collections and documents
        </Typography>
      </Box>

      {/* ===== Alerts ===== */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* ===== Collection Selection ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Collection</InputLabel>
              <Select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                label="Select Collection"
                startAdornment={
                  <InputAdornment position="start">
                    <FolderOpen size={20} />
                  </InputAdornment>
                }
              >
                {collections.map(col => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => {
                  setEditData('{\n  \n}');
                  setCreateDialogOpen(true);
                }}
                disabled={!selectedCollection}
              >
                Create Document
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload size={20} />}
                onClick={() => setImportDialogOpen(true)}
                disabled={!selectedCollection}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={20} />}
                onClick={handleExport}
                disabled={!selectedCollection || documents.length === 0}
              >
                Export ({selectedDocs.length > 0 ? selectedDocs.length : documents.length})
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={20} />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedDocs.length === 0}
              >
                Delete Selected ({selectedDocs.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={20} />}
                onClick={loadDocuments}
                disabled={!selectedCollection || loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Filters & Search ===== */}
      {selectedCollection && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Field</InputLabel>
                <Select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  label="Filter Field"
                >
                  <MenuItem value="">None</MenuItem>
                  {getAllFields().map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Filter Value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                disabled={!filterField}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="">None</MenuItem>
                  {getAllFields().map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value)}
                  label="Order"
                  disabled={!sortField}
                >
                  <MenuItem value="asc">↑ Asc</MenuItem>
                  <MenuItem value="desc">↓ Desc</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ===== Documents Table ===== */}
      {selectedCollection && (
        <Paper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
              <CircularProgress />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FileText size={48} style={{ opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first document or adjust filters
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => {
                  setEditData('{\n  \n}');
                  setCreateDialogOpen(true);
                }}
                sx={{ mt: 2 }}
              >
                Create Document
              </Button>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDocs.length === documents.length}
                        indeterminate={selectedDocs.length > 0 && selectedDocs.length < documents.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Document ID</TableCell>
                    <TableCell>Preview</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents
                    .filter(doc => {
                      if (!searchQuery) return true;
                      const searchLower = searchQuery.toLowerCase();
                      return (
                        doc.id.toLowerCase().includes(searchLower) ||
                        JSON.stringify(doc.data).toLowerCase().includes(searchLower)
                      );
                    })
                    .map((doc) => (
                      <TableRow
                        key={doc.id}
                        hover
                        sx={{
                          bgcolor: selectedDocs.some(d => d.id === doc.id)
                            ? 'action.selected'
                            : 'inherit',
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedDocs.some(d => d.id === doc.id)}
                            onChange={() => toggleDocSelection(doc)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {doc.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatDocData(doc.data).substring(0, 100)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.data.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.data.updatedAt?.toDate?.()?.toLocaleDateString() || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, doc)}
                          >
                            <MoreVertical size={20} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* ===== Document Actions Menu ===== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(menuDoc)}>
          <ListItemIcon>
            <FileText size={20} />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(menuDoc)}>
          <ListItemIcon>
            <Edit size={20} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopy(menuDoc)}>
          <ListItemIcon>
            <Copy size={20} />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteSingle(menuDoc)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={20} color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== View Document Dialog ===== */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FileText size={24} />
            View Document: {currentDoc?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={currentDoc ? formatDocData(currentDoc.data) : ''}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Create Document Dialog ===== */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Plus size={24} />
            Create New Document
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Document ID"
            value={newDocId}
            onChange={(e) => setNewDocId(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            helperText="Enter a unique document ID (required)"
          />
          <TextField
            fullWidth
            multiline
            rows={15}
            label="Document Data (JSON)"
            value={editData}
            onChange={(e) => setEditData(e.target.value)}
            InputProps={{
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            }}
            helperText="Enter valid JSON data"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            startIcon={<Save size={20} />}
            disabled={loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Edit Document Dialog ===== */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit size={24} />
            Edit Document: {currentDoc?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Edit with caution! Invalid JSON will cause errors.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={18}
            label="Document Data (JSON)"
            value={editData}
            onChange={(e) => setEditData(e.target.value)}
            InputProps={{
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            startIcon={<Save size={20} />}
            disabled={loading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AlertCircle size={24} className="text-red-500" />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete{' '}
            {currentDoc ? (
              <strong>{currentDoc.id}</strong>
            ) : (
              <strong>{selectedDocs.length} document(s)</strong>
            )}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            startIcon={<Trash2 size={20} />}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Import Dialog ===== */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Upload size={24} />
            Import Documents
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Import must be a JSON array of objects with "id" fields. Existing documents will be merged.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={15}
            label="JSON Data"
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='[{"id": "doc1", "field1": "value1"}, {"id": "doc2", "field2": "value2"}]'
            InputProps={{
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImport}
            startIcon={<Upload size={20} />}
            disabled={loading}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FirestoreManager;