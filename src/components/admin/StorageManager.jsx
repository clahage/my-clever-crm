// Path: src/components/admin/StorageManager.jsx
// =====================================================
// STORAGE MANAGER - Firebase Storage Browser/Uploader
// =====================================================
// Full Firebase Storage file management system
// Features: File/folder browser, upload/download/delete,
// image preview, bulk operations, search/filter, activity log
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
  Checkbox,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  LinearProgress,
} from '@mui/material';
import {
  FolderOpen,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  X,
  MoreVertical,
  Eye,
  Copy,
  AlertCircle,
  HardDrive,
  RefreshCw,
  ArrowLeft,
  FolderPlus,
} from 'lucide-react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage, db } from '../../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// =====================================================
// MAIN COMPONENT
// =====================================================
const StorageManager = () => {
  // ===== Authentication =====
  const { user, userProfile } = useAuth();

  // ===== State Management =====
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // ===== Dialog States =====
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  // ===== Upload States =====
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  // ===== Menu State =====
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  // ===== Storage Statistics =====
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
  });

  // =====================================================
  // LIFECYCLE HOOKS
  // =====================================================
  useEffect(() => {
    loadItems();
  }, [currentPath]);

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================

  // Load files and folders from current path
  const loadItems = async () => {
      // DEBUG: Log currentPath before using it
      console.log('[StorageManager] loadItems currentPath:', JSON.stringify(currentPath));
    try {
      setLoading(true);
      setError(null);

      // DEBUG: Log exactly what is passed to ref()
      let storageRef;
      if (!currentPath || currentPath === '/') {
        console.log('[StorageManager] Calling ref(storage)');
        storageRef = ref(storage);
      } else {
        console.log('[StorageManager] Calling ref(storage, currentPath):', JSON.stringify(currentPath));
        storageRef = ref(storage, currentPath);
      }
      const result = await listAll(storageRef);

      // Process folders
      const folders = result.prefixes.map(folderRef => ({
        type: 'folder',
        name: folderRef.name,
        fullPath: !folderRef.fullPath || folderRef.fullPath === '' ? '/' : folderRef.fullPath,
        ref: folderRef,
      }));

      // Process files
      const filesPromises = result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);

          return {
            type: 'file',
            name: itemRef.name,
            fullPath: !itemRef.fullPath || itemRef.fullPath === '' ? '/' : itemRef.fullPath,
            ref: itemRef,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            downloadURL,
            metadata,
          };
        } catch (err) {
          console.error(`Error loading metadata for ${itemRef.name}:`, err);
          return null;
        }
      });

      const files = (await Promise.all(filesPromises)).filter(Boolean);

      // Combine and sort
      const allItems = [...folders, ...files].sort((a, b) => {
        // Folders first
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        // Then alphabetically
        return a.name.localeCompare(b.name);
      });

      setItems(allItems);
      setSelectedItems([]);

      // Calculate statistics
      calculateStats(files);

      // Log activity
      await logActivity('view', `Viewed ${allItems.length} items in ${currentPath || 'root'}`);
    } catch (err) {
      console.error('Error loading storage items:', err);
      setError(`Failed to load items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate storage statistics
  const calculateStats = (files) => {
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
      fileTypes: {},
    };

    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    });

    setStorageStats(stats);
  };

  // =====================================================
  // FILE OPERATIONS
  // =====================================================

  // Upload files
  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      if (selectedFiles.length === 0) {
        setError('Please select files to upload');
        return;
      }

      const uploadPromises = Array.from(selectedFiles).map((file) => {
        return new Promise((resolve, reject) => {
          const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
          const storageRef = ref(storage, filePath);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress,
              }));
            },
            (error) => {
              console.error(`Error uploading ${file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Log upload to activityLog
                await logActivity('upload', `Uploaded ${file.name} to ${currentPath || 'root'}`);
                
                resolve({ name: file.name, downloadURL });
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      });

      await Promise.all(uploadPromises);

      setSuccess(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setUploadProgress({});
      loadItems();
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(`Failed to upload files: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Download file
  const handleDownload = async (item) => {
    try {
      if (item.type === 'folder') {
        setError('Cannot download folders (download individual files)');
        return;
      }

      const link = document.createElement('a');
      link.href = item.downloadURL;
      link.download = item.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Downloaded: ${item.name}`);

      // Log activity
      await logActivity('download', `Downloaded ${item.name} from ${currentPath || 'root'}`);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(`Failed to download file: ${err.message}`);
    }
    handleMenuClose();
  };

  // Delete file or folder
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const itemsToDelete = currentItem ? [currentItem] : selectedItems;

      if (itemsToDelete.length === 0) {
        setError('No items selected for deletion');
        return;
      }

      // Delete each item
      for (const item of itemsToDelete) {
        if (item.type === 'file') {
          await deleteObject(item.ref);
        } else {
          // Delete folder (delete all files in folder recursively)
          await deleteFolderRecursive(item.ref);
        }
      }

      setSuccess(`Deleted ${itemsToDelete.length} item(s)`);
      setDeleteDialogOpen(false);
      setCurrentItem(null);
      setSelectedItems([]);
      loadItems();

      // Log activity
      await logActivity('delete', `Deleted ${itemsToDelete.length} item(s) from ${currentPath || 'root'}`);
    } catch (err) {
      console.error('Error deleting items:', err);
      setError(`Failed to delete items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Recursive folder deletion
  const deleteFolderRecursive = async (folderRef) => {
    const result = await listAll(folderRef);
    
    // Delete all files in folder
    const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);

    // Recursively delete subfolders
    for (const subFolder of result.prefixes) {
      await deleteFolderRecursive(subFolder);
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!newFolderName.trim()) {
        setError('Folder name is required');
        return;
      }

      // Create a placeholder file in the folder (Firebase Storage doesn't support empty folders)
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
      const placeholderRef = ref(storage, `${folderPath}/.placeholder`);
      
      // Upload empty placeholder file
      const emptyBlob = new Blob([''], { type: 'text/plain' });
      await uploadBytesResumable(placeholderRef, emptyBlob);

      setSuccess(`Created folder: ${newFolderName}`);
      setCreateFolderDialogOpen(false);
      setNewFolderName('');
      loadItems();

      // Log activity
      await logActivity('create', `Created folder ${newFolderName} in ${currentPath || 'root'}`);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(`Failed to create folder: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION FUNCTIONS
  // =====================================================

  // Navigate to folder
  const navigateToFolder = (folder) => {
    setCurrentPath(!folder.fullPath || folder.fullPath === '' ? '/' : folder.fullPath);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (!currentPath || currentPath === '/') {
      // Already at root, do nothing
      return;
    }
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/');
    setCurrentPath(newPath === '' ? '/' : newPath);
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    // Always start with root
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    if (!currentPath || currentPath === '/') return breadcrumbs;
    const parts = currentPath.split('/').filter(Boolean);
    let currentBreadcrumbPath = '';
    parts.forEach(part => {
      currentBreadcrumbPath += '/' + part;
      breadcrumbs.push({ name: part, path: currentBreadcrumbPath });
    });
    return breadcrumbs;
  };

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  // Log activity
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
        source: 'StorageManager',
      };

      await setDoc(doc(collection(db, 'activityLog')), logEntry);
    } catch (err) {
      console.error('Error logging activity:', err);
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

  // Get file icon
  const getFileIcon = (item) => {
    if (item.type === 'folder') return <FolderOpen size={24} className="text-blue-500" />;
    
    const contentType = item.contentType || '';
    if (contentType.startsWith('image/')) return <ImageIcon size={24} className="text-green-500" />;
    if (contentType.startsWith('video/')) return <Video size={24} className="text-purple-500" />;
    if (contentType.startsWith('audio/')) return <Music size={24} className="text-orange-500" />;
    if (contentType === 'application/pdf') return <FileText size={24} className="text-red-500" />;
    if (contentType.includes('zip') || contentType.includes('compressed')) {
      return <Archive size={24} className="text-yellow-500" />;
    }
    return <File size={24} className="text-gray-500" />;
  };

  // Check if file is previewable
  const isPreviewable = (item) => {
    if (item.type === 'folder') return false;
    const contentType = item.contentType || '';
    return contentType.startsWith('image/') || contentType === 'application/pdf';
  };

  // Toggle item selection
  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.fullPath === item.fullPath);
      if (isSelected) {
        return prev.filter(i => i.fullPath !== item.fullPath);
      } else {
        return [...prev, item];
      }
    });
  };

  // Select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  };

  // Open item menu
  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setMenuItem(item);
  };

  // Close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  // Preview item
  const handlePreview = (item) => {
    setCurrentItem(item);
    setPreviewDialogOpen(true);
    handleMenuClose();
  };

  // Prepare delete
  const handleDeleteSingle = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
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
          <HardDrive size={32} className="text-purple-500" />
          <Typography variant="h4" fontWeight="bold">
            Storage Manager
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse, upload, and manage Firebase Storage files
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

      {/* ===== Storage Statistics ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {storageStats.totalFiles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Files
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {formatFileSize(storageStats.totalSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Size
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {Object.keys(storageStats.fileTypes).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File Types
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Navigation & Actions ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            {/* Breadcrumb Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {currentPath && currentPath !== '/' && (
                <IconButton size="small" onClick={navigateUp}>
                  <ArrowLeft size={20} />
                </IconButton>
              )}
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <Typography color="text.secondary">/</Typography>}
                  <Button
                    size="small"
                    onClick={() => setCurrentPath(!crumb.path || crumb.path === '' ? '/' : crumb.path)}
                    sx={{
                      fontWeight: index === getBreadcrumbs().length - 1 ? 'bold' : 'normal',
                    }}
                  >
                    {crumb.name}
                  </Button>
                </React.Fragment>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Upload size={20} />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Files
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderPlus size={20} />}
                onClick={() => setCreateFolderDialogOpen(true)}
              >
                New Folder
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={20} />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedItems.length === 0}
              >
                Delete ({selectedItems.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={20} />}
                onClick={loadItems}
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
          placeholder="Search files and folders..."
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

      {/* ===== Items Display ===== */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FolderOpen size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No files or folders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload files or create a folder to get started
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Upload size={20} />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Files
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderPlus size={20} />}
                onClick={() => setCreateFolderDialogOpen(true)}
              >
                Create Folder
              </Button>
            </Box>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.length === items.length}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Modified</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items
                  .filter(item => {
                    if (!searchQuery) return true;
                    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((item) => (
                    <TableRow
                      key={item.fullPath}
                      hover
                      sx={{
                        bgcolor: selectedItems.some(i => i.fullPath === item.fullPath)
                          ? 'action.selected'
                          : 'inherit',
                        cursor: item.type === 'folder' ? 'pointer' : 'default',
                      }}
                      onDoubleClick={() => item.type === 'folder' && navigateToFolder(item)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.some(i => i.fullPath === item.fullPath)}
                          onChange={() => toggleItemSelection(item)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFileIcon(item)}
                          <Typography variant="body2" fontWeight="medium">
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.type === 'folder' ? 'Folder' : item.contentType || 'File'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.type === 'file' ? formatFileSize(item.size) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.updated
                            ? new Date(item.updated).toLocaleDateString()
                            : '-'}
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
        )}
      </Paper>

      {/* ===== Item Actions Menu ===== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItem?.type === 'folder' && (
          <MenuItem onClick={() => { navigateToFolder(menuItem); handleMenuClose(); }}>
            <ListItemIcon>
              <FolderOpen size={20} />
            </ListItemIcon>
            <ListItemText>Open Folder</ListItemText>
          </MenuItem>
        )}
        {menuItem?.type === 'file' && (
          <>
            {isPreviewable(menuItem) && (
              <MenuItem onClick={() => handlePreview(menuItem)}>
                <ListItemIcon>
                  <Eye size={20} />
                </ListItemIcon>
                <ListItemText>Preview</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDownload(menuItem)}>
              <ListItemIcon>
                <Download size={20} />
              </ListItemIcon>
              <ListItemText>Download</ListItemText>
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={() => handleDeleteSingle(menuItem)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={20} color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== Upload Dialog ===== */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Upload size={24} />
            Upload Files
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Plus size={20} />}
                fullWidth
              >
                Select Files
              </Button>
            </label>
          </Box>

          {selectedFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Files ({selectedFiles.length}):
              </Typography>
              {Array.from(selectedFiles).map((file, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {file.name} ({formatFileSize(file.size)})
                  </Typography>
                  {uploadProgress[file.name] !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress[file.name]}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            startIcon={<Upload size={20} />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Preview Dialog ===== */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Eye size={24} />
            Preview: {currentItem?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentItem?.contentType?.startsWith('image/') ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={currentItem.downloadURL}
                alt={currentItem.name}
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
            </Box>
          ) : currentItem?.contentType === 'application/pdf' ? (
            <Box sx={{ height: '500px' }}>
              <iframe
                src={currentItem.downloadURL}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={currentItem.name}
              />
            </Box>
          ) : (
            <Typography>Preview not available for this file type</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleDownload(currentItem)}
            startIcon={<Download size={20} />}
          >
            Download
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
            {currentItem ? (
              <strong>{currentItem.name}</strong>
            ) : (
              <strong>{selectedItems.length} item(s)</strong>
            )}?
          </Typography>
          {currentItem?.type === 'folder' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Deleting a folder will delete all files inside it!
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

      {/* ===== Create Folder Dialog ===== */}
      <Dialog
        open={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FolderPlus size={24} />
            Create New Folder
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ mt: 1 }}
            helperText="Enter a name for the new folder"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            startIcon={<FolderPlus size={20} />}
            disabled={loading || !newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StorageManager;