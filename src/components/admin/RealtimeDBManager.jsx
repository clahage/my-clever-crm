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
  const rtdb = getDatabase();

  // ===== State Management =====
  const [currentPath, setCurrentPath] = useState('/');
  const [data, setData] = useState(null);
  const [children, setChildren] = useState([]);
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
  // LIFECYCLE HOOKS
  // =====================================================
  useEffect(() => {
    loadData();
    
    // Set up real-time listener
    const dataRef = ref(rtdb, currentPath);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        processData(snapshot.val());
      } else {
        setData(null);
        setChildren([]);
      }
    }, (error) => {
      console.error('Real-time listener error:', error);
    });

    // Cleanup listener on unmount or path change
    return () => {
      off(dataRef);
    };
  }, [currentPath]);

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================

  // Load data from current path
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dataRef = ref(rtdb, currentPath);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const value = snapshot.val();
        processData(value);

        // Log activity
        await logActivity('view', `Viewed data at ${currentPath}`);
      } else {
        setData(null);
        setChildren([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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
    try {
      setLoading(true);
      setError(null);

      if (!newKey.trim()) {
        setError('Key is required');
        return;
      }

      let value;
      try {
        value = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
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
    try {
      setLoading(true);
      setError(null);

      if (!currentItem) return;

      let value;
      try {
        value = JSON.parse(editData);
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      const itemPath = currentPath === '/' ? `/${currentItem.key}` : `${currentPath}/${currentItem.key}`;
      const dataRef = ref(rtdb, itemPath);
      
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
    try {
      setLoading(true);
      setError(null);

      if (!currentItem) return;

      const itemPath = currentPath === '/' ? `/${currentItem.key}` : `${currentPath}/${currentItem.key}`;
      const dataRef = ref(rtdb, itemPath);
      
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
  // IMPORT/EXPORT OPERATIONS
  // =====================================================

  // Export data to JSON
  const handleExport = () => {
    try {
      const exportData = data || {};
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = currentPath === '/' ? 'root' : currentPath.split('/').pop();
      link.download = `rtdb_${fileName}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully');

      // Log activity
      logActivity('export', `Exported data from ${currentPath}`);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(`Failed to export data: ${err.message}`);
    }
  };

  // Import data from JSON
  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      let value;
      try {
        value = JSON.parse(importData);
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      const dataRef = ref(rtdb, currentPath);
      await set(dataRef, value);

      setSuccess('Data imported successfully');
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

  // =====================================================
  // NAVIGATION FUNCTIONS
  // =====================================================

  // Navigate to child
  const navigateToChild = (key) => {
    const newPath = currentPath === '/' ? `/${key}` : `${currentPath}/${key}`;
    setCurrentPath(newPath);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    setCurrentPath(newPath);
  };

  // Navigate to root
  const navigateToRoot = () => {
    setCurrentPath('/');
  };

  // Navigate to specific path from breadcrumb
  const navigateToPath = (index) => {
    const parts = currentPath.split('/').filter(Boolean);
    if (index === 0) {
      setCurrentPath('/');
    } else {
      const newPath = '/' + parts.slice(0, index).join('/');
      setCurrentPath(newPath);
    }
  };

  // Get breadcrumb parts
  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: 'root', path: '/' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'root', path: '/' }];
    
    parts.forEach((part, index) => {
      breadcrumbs.push({
        name: part,
        path: '/' + parts.slice(0, index + 1).join('/'),
      });
    });
    
    return breadcrumbs;
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  // Log activity to Firestore
  const logActivity = async (action, description) => {
    try {
      const logEntry = {
        action,
        description,
        path: currentPath,
        userId: user.uid,
        userEmail: user.email,
        userName: userProfile?.name || 'Unknown',
        timestamp: serverTimestamp(),
        source: 'RealtimeDBManager',
      };

      await setDoc(doc(collection(db, 'activityLog')), logEntry);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Format data for display
  const formatData = (value) => {
    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {
      return 'Error formatting data';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'object': return 'primary';
      case 'array': return 'secondary';
      case 'string': return 'success';
      case 'number': return 'warning';
      case 'boolean': return 'info';
      case 'null': return 'default';
      default: return 'default';
    }
  };

  // Get value preview
  const getValuePreview = (value) => {
    if (value === null) return 'null';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `Array[${value.length}]`;
      }
      return `Object{${Object.keys(value).length}}`;
    }
    const stringValue = String(value);
    return stringValue.length > 50 ? stringValue.substring(0, 50) + '...' : stringValue;
  };

  // Menu handlers
  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // View item
  const handleView = (item) => {
    setCurrentItem(item);
    setViewDialogOpen(true);
    handleMenuClose();
  };

  // Edit item
  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditData(formatData(item.value));
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Prepare delete
  const handleDeleteSingle = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Copy item
  const handleCopy = async (item) => {
    try {
      const newKey = `${item.key}_copy_${Date.now()}`;
      const newPath = currentPath === '/' ? `/${newKey}` : `${currentPath}/${newKey}`;
      const dataRef = ref(rtdb, newPath);
      
      await set(dataRef, item.value);

      setSuccess(`Node copied: ${newKey}`);
      loadData();

      // Log activity
      await logActivity('copy', `Copied node ${item.key} to ${newKey} at ${currentPath}`);
    } catch (err) {
      console.error('Error copying node:', err);
      setError(`Failed to copy node: ${err.message}`);
    }
    handleMenuClose();
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================
  return (
    <Box sx={{ p: 3 }}>
      {/* ===== Header ===== */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Database size={32} className="text-orange-500" />
          <Typography variant="h4" fontWeight="bold">
            Realtime Database Manager
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse and manage Firebase Realtime Database with real-time updates
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

      {/* ===== Statistics Cards ===== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Database size={32} className="text-blue-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalNodes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Nodes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FileText size={32} className="text-green-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatFileSize(stats.dataSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data Size
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== Navigation & Actions ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            {/* Breadcrumb Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={navigateToRoot} disabled={currentPath === '/'}>
                <Home size={20} />
              </IconButton>
              {currentPath !== '/' && (
                <IconButton size="small" onClick={navigateUp}>
                  <ArrowLeft size={20} />
                </IconButton>
              )}
              <Breadcrumbs separator={<ChevronRight size={16} />}>
                {getBreadcrumbs().map((crumb, index) => (
                  <Link
                    key={crumb.path}
                    component="button"
                    variant="body2"
                    onClick={() => navigateToPath(index)}
                    sx={{
                      fontWeight: index === getBreadcrumbs().length - 1 ? 'bold' : 'normal',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {crumb.name}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => {
                  setEditData('{\n  \n}');
                  setCreateDialogOpen(true);
                }}
              >
                Create Node
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload size={20} />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={20} />}
                onClick={handleExport}
                disabled={!data}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={20} />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Search Bar ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : !data ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Database size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No data at this path
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first node to get started
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
              Create Node
            </Button>
          </Box>
        ) : children.length > 0 ? (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value Preview</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {children
                  .filter(item => {
                    if (!searchQuery) return true;
                    const search = searchQuery.toLowerCase();
                    return (
                      item.key.toLowerCase().includes(search) ||
                      getValuePreview(item.value).toLowerCase().includes(search)
                    );
                  })
                  .map((item) => (
                    <TableRow
                      key={item.key}
                      hover
                      sx={{
                        cursor: item.type === 'object' || item.type === 'array' ? 'pointer' : 'default',
                      }}
                      onDoubleClick={() => {
                        if (item.type === 'object' || item.type === 'array') {
                          navigateToChild(item.key);
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {(item.type === 'object' || item.type === 'array') && (
                            <FolderOpen size={20} className="text-blue-500" />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {item.key}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type}
                          color={getTypeColor(item.type)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getValuePreview(item.value)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
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