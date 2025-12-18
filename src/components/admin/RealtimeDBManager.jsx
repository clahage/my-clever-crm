// Path: src/components/admin/RealtimeDBManager.jsx
// =====================================================
// REALTIME DATABASE MANAGER - Firebase RTDB Browser/Editor
// =====================================================
// Complete Firebase Realtime Database management system
// Features: Data browser, CRUD operations, bulk actions,
// search/filter, JSON editor, real-time updates, activity log
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
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
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
  ArrowLeft,
  Copy,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Home,
} from 'lucide-react';
import { getDatabase, ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

// =====================================================
// MAIN COMPONENT
// =====================================================
const RealtimeDBManager = () => {
  // ===== Authentication =====
  const { user, userProfile } = useAuth();

  // ===== Realtime Database Instance =====
  const [rtdb, setRtdb] = useState(null);
  const [dbError, setDbError] = useState(null);

  // ===== State Management =====
  const [currentPath, setCurrentPath] = useState('/');
  const [data, setData] = useState(null);
  const [children, setChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true); // Start with true to show initial loading
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== Dialog States =====
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState('');
  const [newKey, setNewKey] = useState('');
  const [importData, setImportData] = useState('');

  // ===== Menu State =====
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  // ===== Statistics =====
  const [stats, setStats] = useState({
    totalNodes: 0,
    dataSize: 0,
  });

  // =====================================================
  // INITIALIZE REALTIME DATABASE
  // =====================================================
  useEffect(() => {
    try {
      console.log('🔄 Initializing Firebase Realtime Database...');
      const database = getDatabase();
      setRtdb(database);
      console.log('✅ Firebase Realtime Database initialized');
    } catch (err) {
      console.error('❌ Firebase Realtime Database initialization error:', err);
      setDbError(err.message);
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LIFECYCLE HOOKS - Load data when DB is ready
  // =====================================================
  useEffect(() => {
    if (!rtdb) return;

    const loadTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⏱️ Load timeout - setting loading to false');
        setLoading(false);
        setError('Connection timeout. The Realtime Database may not be configured or accessible.');
      }
    }, 10000); // 10 second timeout

    loadData();
    
    // Set up real-time listener
    const dataRef = ref(rtdb, currentPath);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        clearTimeout(loadTimeout);
        if (snapshot.exists()) {
          processData(snapshot.val());
        } else {
          setData(null);
          setChildren([]);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(loadTimeout);
        console.error('❌ Real-time listener error:', error);
        setError(`Database error: ${error.message}`);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or path change
    return () => {
      clearTimeout(loadTimeout);
      off(dataRef);
    };
  }, [currentPath, rtdb]);

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================

  // Load data from current path
  const loadData = async () => {
    if (!rtdb) {
      setError('Realtime Database not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📂 Loading data from path: ${currentPath}`);
      const dataRef = ref(rtdb, currentPath);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const value = snapshot.val();
        processData(value);
        console.log('✅ Data loaded successfully');

        // Log activity
        await logActivity('view', `Viewed data at ${currentPath}`);
      } else {
        console.log('ℹ️ No data at this path');
        setData(null);
        setChildren([]);
      }
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process data and extract children
  const processData = (value) => {
    setData(value);

    // Calculate statistics
    const dataString = JSON.stringify(value);
    setStats({
      totalNodes: countNodes(value),
      dataSize: new Blob([dataString]).size,
    });

    // Extract children if object
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const childrenArray = Object.keys(value).map(key => ({
        key,
        value: value[key],
        type: getDataType(value[key]),
      }));
      setChildren(childrenArray);
    } else {
      setChildren([]);
    }
  };

  // Count total nodes recursively
  const countNodes = (obj, count = 0) => {
    if (obj && typeof obj === 'object') {
      count += Object.keys(obj).length;
      Object.values(obj).forEach(value => {
        if (value && typeof value === 'object') {
          count = countNodes(value, count);
        }
      });
    }
    return count;
  };

  // Get data type
  const getDataType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  };

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  // Create new node
  const handleCreate = async () => {
    if (!rtdb) return;

    try {
      setLoading(true);
      setError(null);

      if (!newKey.trim()) {
        setError('Key is required');
        setLoading(false);
        return;
      }

      let value;
      try {
        value = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
        setLoading(false);
        return;
      }

      const newPath = currentPath === '/' ? `/${newKey}` : `${currentPath}/${newKey}`;
      const dataRef = ref(rtdb, newPath);
      
      await set(dataRef, value);

      setSuccess(`Node created: ${newKey}`);
      setCreateDialogOpen(false);
      setNewKey('');
      setEditData('');
      loadData();

      // Log activity
      await logActivity('create', `Created node ${newKey} at ${currentPath}`);
    } catch (err) {
      console.error('Error creating node:', err);
      setError(`Failed to create node: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update existing node
  const handleUpdate = async () => {
    if (!rtdb || !currentItem) return;

    try {
      setLoading(true);
      setError(null);

      let value;
      try {
        value = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
        setLoading(false);
        return;
      }

      const updatePath = currentPath === '/' ? `/${currentItem.key}` : `${currentPath}/${currentItem.key}`;
      const dataRef = ref(rtdb, updatePath);
      
      await set(dataRef, value);

      setSuccess(`Node updated: ${currentItem.key}`);
      setEditDialogOpen(false);
      setCurrentItem(null);
      setEditData('');
      loadData();

      // Log activity
      await logActivity('update', `Updated node ${currentItem.key} at ${currentPath}`);
    } catch (err) {
      console.error('Error updating node:', err);
      setError(`Failed to update node: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete node
  const handleDelete = async () => {
    if (!rtdb || !currentItem) return;

    try {
      setLoading(true);
      setError(null);

      const deletePath = currentPath === '/' ? `/${currentItem.key}` : `${currentPath}/${currentItem.key}`;
      const dataRef = ref(rtdb, deletePath);
      
      await remove(dataRef);

      setSuccess(`Node deleted: ${currentItem.key}`);
      setDeleteDialogOpen(false);
      setCurrentItem(null);
      loadData();

      // Log activity
      await logActivity('delete', `Deleted node ${currentItem.key} from ${currentPath}`);
    } catch (err) {
      console.error('Error deleting node:', err);
      setError(`Failed to delete node: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  // Navigate to child node
  const navigateToChild = (key) => {
    const newPath = currentPath === '/' ? `/${key}` : `${currentPath}/${key}`;
    setCurrentPath(newPath);
  };

  // Navigate up one level
  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      setCurrentPath(pathParts.length > 0 ? `/${pathParts.join('/')}` : '/');
    }
  };

  // Navigate to root
  const navigateToRoot = () => {
    setCurrentPath('/');
  };

  // Format data for display
  const formatData = (value) => {
    try {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    } catch (err) {
      return 'Error formatting data';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Log activity to Firestore
  const logActivity = async (action, details) => {
    try {
      await setDoc(doc(collection(db, 'activityLogs')), {
        type: 'realtimedb',
        action,
        details,
        path: currentPath,
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // Handle view
  const handleView = (item) => {
    setCurrentItem(item);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  // Handle edit
  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditData(formatData(item.value));
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete single
  const handleDeleteSingle = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle copy
  const handleCopy = (item) => {
    const text = formatData(item.value);
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    handleMenuClose();
  };

  // Handle export
  const handleExport = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rtdb-export-${currentPath.replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = async () => {
    if (!rtdb) return;

    try {
      setLoading(true);
      setError(null);

      let value;
      try {
        value = JSON.parse(importData);
      } catch (err) {
        setError('Invalid JSON format');
        setLoading(false);
        return;
      }

      const dataRef = ref(rtdb, currentPath);
      await set(dataRef, value);

      setSuccess('Data imported successfully!');
      setImportDialogOpen(false);
      setImportData('');
      loadData();

      // Log activity
      await logActivity('import', `Imported data to ${currentPath}`);
    } catch (err) {
      console.error('Error importing data:', err);
      setError(`Failed to import data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter children based on search query
  const filteredChildren = searchQuery
    ? children.filter(item =>
        item.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : children;

  // =====================================================
  // RENDER - Database not initialized
  // =====================================================
  if (dbError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Firebase Realtime Database Not Available
          </Typography>
          <Typography variant="body2">
            {dbError}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            This feature requires Firebase Realtime Database to be enabled in your Firebase project.
            Currently, SpeedyCRM uses Firestore as the primary database.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>To enable Realtime Database:</strong>
          </Typography>
          <ol>
            <li>Go to Firebase Console → Realtime Database</li>
            <li>Click "Create Database"</li>
            <li>Choose your security rules</li>
            <li>Refresh this page</li>
          </ol>
        </Alert>
      </Box>
    );
  }

  // =====================================================
  // RENDER - Main UI
  // =====================================================
  return (
    <Box>
      {/* ===== Alerts ===== */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* ===== Header with Statistics ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Current Path
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                  {currentPath}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Nodes
                </Typography>
                <Typography variant="h6">
                  {stats.totalNodes.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Data Size
                </Typography>
                <Typography variant="h6">
                  {formatFileSize(stats.dataSize)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={loading ? 'Loading...' : 'Connected'}
                  color={loading ? 'warning' : 'success'}
                  size="small"
                  icon={loading ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Breadcrumb Navigation ===== */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body2"
              onClick={navigateToRoot}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Home size={16} />
              Root
            </Link>
            {currentPath.split('/').filter(Boolean).map((part, index, arr) => {
              const isLast = index === arr.length - 1;
              return (
                <Typography
                  key={index}
                  color={isLast ? 'text.primary' : 'text.secondary'}
                  sx={{ fontFamily: 'monospace' }}
                >
                  {part}
                </Typography>
              );
            })}
          </Breadcrumbs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Go Back">
              <IconButton onClick={navigateUp} disabled={currentPath === '/'} size="small">
                <ArrowLeft size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={loadData} disabled={loading} size="small">
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ===== Action Buttons ===== */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => {
              setNewKey('');
              setEditData('{\n  "key": "value"\n}');
              setCreateDialogOpen(true);
            }}
            disabled={loading}
          >
            Create Node
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
            onClick={handleExport}
            disabled={!data || loading}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload size={20} />}
            onClick={() => {
              setImportData('');
              setImportDialogOpen(true);
            }}
            disabled={loading}
          >
            Import
          </Button>
        </Box>
      </Paper>

      {/* ===== Search Bar ===== */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search nodes..."
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
      </Paper>

      {/* ===== Data Display ===== */}
      <Paper sx={{ mb: 2 }}>
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading database...
            </Typography>
          </Box>
        ) : data === null ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Database size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No data at this path
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new node to get started
            </Typography>
          </Box>
        ) : typeof data === 'object' && !Array.isArray(data) && children.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Preview</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChildren.map((item) => (
                  <TableRow key={item.key} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.type === 'object' || item.type === 'array' ? (
                          <FolderOpen size={16} />
                        ) : (
                          <FileText size={16} />
                        )}
                        <Typography sx={{ fontFamily: 'monospace' }}>
                          {item.key}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={item.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          maxWidth: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatData(item.value).substring(0, 100)}
                        {formatData(item.value).length > 100 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {item.type === 'object' || item.type === 'array' ? (
                        <Tooltip title="Open">
                          <IconButton
                            size="small"
                            onClick={() => navigateToChild(item.key)}
                          >
                            <ChevronRight size={20} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVertical size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Primitive value at this path:
            </Typography>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100', fontFamily: 'monospace' }}>
              {formatData(data)}
            </Paper>
          </Box>
        )}
      </Paper>

      {/* ===== Node Actions Menu ===== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItem?.type === 'object' || menuItem?.type === 'array' ? (
          <MenuItem onClick={() => { navigateToChild(menuItem.key); handleMenuClose(); }}>
            <ListItemIcon>
              <FolderOpen size={20} />
            </ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => handleView(menuItem)}>
          <ListItemIcon>
            <FileText size={20} />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(menuItem)}>
          <ListItemIcon>
            <Edit size={20} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopy(menuItem)}>
          <ListItemIcon>
            <Copy size={20} />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteSingle(menuItem)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={20} color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== View Node Dialog ===== */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FileText size={24} />
            View Node: {currentItem?.key}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={20}
            value={currentItem ? formatData(currentItem.value) : ''}
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

      {/* ===== Create Node Dialog ===== */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Plus size={24} />
            Create New Node
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Node Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            helperText="Enter a unique key for the new node"
          />
          <TextField
            fullWidth
            multiline
            rows={15}
            label="Node Value (JSON)"
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
            startIcon={<Plus size={20} />}
            disabled={loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Edit Node Dialog ===== */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit size={24} />
            Edit Node: {currentItem?.key}
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
            label="Node Value (JSON)"
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
            startIcon={<Edit size={20} />}
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
            Are you sure you want to delete node <strong>{currentItem?.key}</strong>?
          </Typography>
          {(currentItem?.type === 'object' || currentItem?.type === 'array') && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will delete all child nodes as well!
            </Alert>
          )}
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
            Import Data
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Import will replace all data at the current path. Existing data will be overwritten.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={15}
            label="JSON Data"
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='{"key1": "value1", "key2": {"nested": "value"}}'
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

export default RealtimeDBManager;