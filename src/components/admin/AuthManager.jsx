// Path: src/components/admin/AuthManager.jsx
// =====================================================
// AUTH MANAGER - User/Role/Permission Management
// =====================================================
// Complete user authentication and authorization management
// Features: User CRUD, role assignments (8-level hierarchy),
// password resets, email verification, search/filter, bulk actions
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
  Grid,
  Divider,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Card,
  CardContent,
} from '@mui/material';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Key,
  Mail,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock,
  Crown,
  X,
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
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

// =====================================================
// ROLE HIERARCHY CONFIGURATION
// =====================================================
const ROLE_LEVELS = {
  masterAdmin: 8,
  admin: 7,
  manager: 6,
  user: 5,
  affiliate: 4,
  client: 3,
  prospect: 2,
  viewer: 1,
};

const ROLE_COLORS = {
  masterAdmin: 'error',
  admin: 'warning',
  manager: 'info',
  user: 'primary',
  affiliate: 'success',
  client: 'secondary',
  prospect: 'default',
  viewer: 'default',
};

const ROLE_LABELS = {
  masterAdmin: 'Master Admin',
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
  affiliate: 'Affiliate',
  client: 'Client',
  prospect: 'Prospect',
  viewer: 'Viewer',
};

// =====================================================
// MAIN COMPONENT
// =====================================================
const AuthManager = () => {
  // ===== Authentication =====
  const { user, userProfile } = useAuth();

  // ===== State Management =====
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== Dialog States =====
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ===== Form States =====
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer',
    roles: ['contact'],
    phone: '',
    company: '',
    status: 'active',
  });

  // ===== Filter States =====
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ===== Menu State =====
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);

  // ===== Statistics =====
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    roleDistribution: {},
  });

  // =====================================================
  // LIFECYCLE HOOKS
  // =====================================================
  useEffect(() => {
    loadUsers();
  }, [filterRole, filterStatus]);

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================

  // Load all users from userProfiles collection
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let q = collection(db, 'userProfiles');

      // Apply role filter
      if (filterRole) {
        q = query(q, where('role', '==', filterRole));
      }

      // Apply status filter
      if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
      }

      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
      calculateStats(userList);

      // Log activity
      await logActivity('view', `Viewed ${userList.length} users`);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user statistics
  const calculateStats = (userList) => {
    const newStats = {
      totalUsers: userList.length,
      activeUsers: userList.filter(u => u.status === 'active').length,
      verifiedUsers: userList.filter(u => u.emailVerified).length,
      roleDistribution: {},
    };

    // Count users by role
    userList.forEach(u => {
      const role = u.role || 'viewer';
      newStats.roleDistribution[role] = (newStats.roleDistribution[role] || 0) + 1;
    });

    setStats(newStats);
  };

  // =====================================================
  // USER CRUD OPERATIONS
  // =====================================================

  // Create new user
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return;
      }

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const newUser = userCredential.user;

      // Update display name if provided
      if (formData.displayName) {
        await updateProfile(newUser, {
          displayName: formData.displayName,
        });
      }

      // Send verification email
      await sendEmailVerification(newUser);

      // Create user profile in Firestore
      const userProfileData = {
        uid: newUser.uid,
        email: formData.email,
        displayName: formData.displayName || '',
        role: formData.role,
        roles: formData.roles,
        phone: formData.phone || '',
        company: formData.company || '',
        status: formData.status,
        emailVerified: false,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      await setDoc(doc(db, 'userProfiles', newUser.uid), userProfileData);

      setSuccess(`User created successfully: ${formData.email}`);
      setCreateDialogOpen(false);
      resetForm();
      loadUsers();

      // Log activity
      await logActivity('create', `Created user ${formData.email} with role ${formData.role}`);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(`Failed to create user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update existing user
  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) return;

      // Update user profile in Firestore
      const updates = {
        displayName: formData.displayName,
        role: formData.role,
        roles: formData.roles,
        phone: formData.phone,
        company: formData.company,
        status: formData.status,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      await updateDoc(doc(db, 'userProfiles', currentUser.id), updates);

      setSuccess(`User updated successfully: ${currentUser.email}`);
      setEditDialogOpen(false);
      setCurrentUser(null);
      resetForm();
      loadUsers();

      // Log activity
      await logActivity('update', `Updated user ${currentUser.email}`);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) return;

      // Note: Firebase Auth user deletion requires re-authentication
      // This only deletes the Firestore profile
      await deleteDoc(doc(db, 'userProfiles', currentUser.id));

      setSuccess(`User profile deleted: ${currentUser.email}`);
      setDeleteDialogOpen(false);
      setCurrentUser(null);
      loadUsers();

      // Log activity
      await logActivity('delete', `Deleted user profile ${currentUser.email}`);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PASSWORD & EMAIL OPERATIONS
  // =====================================================

  // Send password reset email
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) return;

      await sendPasswordResetEmail(auth, currentUser.email);

      setSuccess(`Password reset email sent to ${currentUser.email}`);
      setResetPasswordDialogOpen(false);
      setCurrentUser(null);

      // Log activity
      await logActivity('reset', `Sent password reset to ${currentUser.email}`);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError(`Failed to send password reset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (selectedUser) => {
    try {
      const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';

      await updateDoc(doc(db, 'userProfiles', selectedUser.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });

      setSuccess(`User ${newStatus}: ${selectedUser.email}`);
      loadUsers();

      // Log activity
      await logActivity('status', `Changed ${selectedUser.email} status to ${newStatus}`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(`Failed to update status: ${err.message}`);
    }
    handleMenuClose();
  };

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  // Update role for multiple users
  const handleBulkRoleUpdate = async (newRole) => {
    try {
      setLoading(true);
      setError(null);

      for (const selectedUser of selectedUsers) {
        await updateDoc(doc(db, 'userProfiles', selectedUser.id), {
          role: newRole,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        });
      }

      setSuccess(`Updated role for ${selectedUsers.length} user(s)`);
      setSelectedUsers([]);
      loadUsers();

      // Log activity
      await logActivity('bulk', `Updated role to ${newRole} for ${selectedUsers.length} users`);
    } catch (err) {
      console.error('Error in bulk update:', err);
      setError(`Failed to update users: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
        userId: user.uid,
        userEmail: user.email,
        userName: userProfile?.name || 'Unknown',
        timestamp: serverTimestamp(),
        source: 'AuthManager',
      };

      await setDoc(doc(collection(db, 'activityLog')), logEntry);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      displayName: '',
      role: 'viewer',
      roles: ['contact'],
      phone: '',
      company: '',
      status: 'active',
    });
  };

  // Open edit dialog
  const handleEdit = (selectedUser) => {
    setCurrentUser(selectedUser);
    setFormData({
      email: selectedUser.email || '',
      password: '',
      displayName: selectedUser.displayName || '',
      role: selectedUser.role || 'viewer',
      roles: selectedUser.roles || ['contact'],
      phone: selectedUser.phone || '',
      company: selectedUser.company || '',
      status: selectedUser.status || 'active',
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Open delete dialog
  const handleDeleteSingle = (selectedUser) => {
    setCurrentUser(selectedUser);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Open reset password dialog
  const handleResetPasswordSingle = (selectedUser) => {
    setCurrentUser(selectedUser);
    setResetPasswordDialogOpen(true);
    handleMenuClose();
  };

  // Toggle user selection
  const toggleUserSelection = (selectedUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  // Select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...users]);
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, selectedUser) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(selectedUser);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  // Get role badge icon
  const getRoleIcon = (role) => {
    if (ROLE_LEVELS[role] >= 7) return <Crown size={16} />;
    if (ROLE_LEVELS[role] >= 5) return <Shield size={16} />;
    return <UserCheck size={16} />;
  };

  // Export users to CSV
  const handleExport = () => {
    try {
      const usersToExport = selectedUsers.length > 0 ? selectedUsers : users;
      
      const csv = [
        ['Email', 'Name', 'Role', 'Status', 'Phone', 'Company', 'Created'],
        ...usersToExport.map(u => [
          u.email,
          u.displayName || '',
          u.role,
          u.status,
          u.phone || '',
          u.company || '',
          u.createdAt?.toDate?.()?.toISOString() || '',
        ]),
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(`Exported ${usersToExport.length} users`);

      // Log activity
      logActivity('export', `Exported ${usersToExport.length} users`);
    } catch (err) {
      console.error('Error exporting users:', err);
      setError(`Failed to export users: ${err.message}`);
    }
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================
  return (
    <Box sx={{ p: 3 }}>
      {/* ===== Header ===== */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Users size={32} className="text-green-500" />
          <Typography variant="h4" fontWeight="bold">
            User & Role Manager
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage users, roles, and permissions across the system
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users size={32} className="text-blue-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle size={32} className="text-green-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Mail size={32} className="text-purple-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.verifiedUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Emails
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield size={32} className="text-orange-500" />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {Object.keys(stats.roleDistribution).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== Actions Bar ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<UserPlus size={20} />}
                onClick={() => {
                  resetForm();
                  setCreateDialogOpen(true);
                }}
              >
                Create User
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download size={20} />}
                onClick={handleExport}
                disabled={users.length === 0}
              >
                Export ({selectedUsers.length > 0 ? selectedUsers.length : users.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshCw size={20} />}
                onClick={loadUsers}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedUsers.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Bulk Role Update</InputLabel>
                  <Select
                    label="Bulk Role Update"
                    onChange={(e) => handleBulkRoleUpdate(e.target.value)}
                    value=""
                  >
                    {Object.keys(ROLE_LEVELS).map(role => (
                      <MenuItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                  {selectedUsers.length} selected
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Filters ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Users"
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Filter by Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {Object.keys(ROLE_LEVELS).map(role => (
                  <MenuItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== Users Table ===== */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Users size={48} style={{ opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first user to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<UserPlus size={20} />}
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
              sx={{ mt: 2 }}
            >
              Create User
            </Button>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email Verified</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .filter(u => {
                    if (!searchQuery) return true;
                    const search = searchQuery.toLowerCase();
                    return (
                      u.email?.toLowerCase().includes(search) ||
                      u.displayName?.toLowerCase().includes(search) ||
                      u.phone?.toLowerCase().includes(search)
                    );
                  })
                  .map((userData) => (
                    <TableRow
                      key={userData.id}
                      hover
                      sx={{
                        bgcolor: selectedUsers.some(u => u.id === userData.id)
                          ? 'action.selected'
                          : 'inherit',
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.some(u => u.id === userData.id)}
                          onChange={() => toggleUserSelection(userData)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {userData.displayName?.charAt(0) || userData.email?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {userData.displayName || 'No Name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userData.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(userData.role)}
                          label={ROLE_LABELS[userData.role] || userData.role}
                          color={ROLE_COLORS[userData.role] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={userData.status === 'active' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          label={userData.status === 'active' ? 'Active' : 'Inactive'}
                          color={userData.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {userData.emailVerified ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <X size={20} className="text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {userData.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, userData)}
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

      {/* ===== User Actions Menu ===== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(menuUser)}>
          <ListItemIcon>
            <Edit size={20} />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleResetPasswordSingle(menuUser)}>
          <ListItemIcon>
            <Key size={20} />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(menuUser)}>
          <ListItemIcon>
            {menuUser?.status === 'active' ? <Lock size={20} /> : <Unlock size={20} />}
          </ListItemIcon>
          <ListItemText>
            {menuUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteSingle(menuUser)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={20} color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* ===== Create User Dialog ===== */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserPlus size={24} />
            Create New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Role *</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Primary Role *"
                >
                  {Object.keys(ROLE_LEVELS).map(role => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            startIcon={<UserPlus size={20} />}
            disabled={loading}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Edit User Dialog ===== */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit size={24} />
            Edit User: {currentUser?.email}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Primary Role"
                >
                  {Object.keys(ROLE_LEVELS).map(role => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
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
            Are you sure you want to delete the user profile for{' '}
            <strong>{currentUser?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Note: This only deletes the Firestore profile. The Firebase Auth account
            requires manual deletion or re-authentication.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            startIcon={<Trash2 size={20} />}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Reset Password Dialog ===== */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Key size={24} />
            Reset Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Send a password reset email to{' '}
            <strong>{currentUser?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The user will receive an email with instructions to reset their password.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            startIcon={<Mail size={20} />}
            disabled={loading}
          >
            Send Reset Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuthManager;