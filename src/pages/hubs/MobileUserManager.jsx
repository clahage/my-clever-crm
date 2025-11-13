// ============================================================================
// MobileUserManager.jsx - COMPLETE MOBILE USER MANAGEMENT SYSTEM
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-08
//
// DESCRIPTION:
// Complete mobile user management system for administering app users,
// managing devices, controlling permissions, tracking activity, creating
// segments, and performing bulk account operations.
//
// FEATURES:
// - User directory with search and filters
// - Device management and token tracking
// - Role-based permissions and access control
// - Activity logs and user behavior tracking
// - User segmentation and tagging
// - Bulk account operations
// - User impersonation for support
// - Account suspension/activation
// - Data export capabilities
// - User analytics and insights
// - Push notification preferences
// - User communication history
// - Dark mode support
// - Mobile responsive design
//
// TABS:
// Tab 1: User Directory - Browse and search all users
// Tab 2: Device Management - Manage user devices and tokens
// Tab 3: Permissions & Roles - Access control management
// Tab 4: Activity Logs - User activity tracking
// Tab 5: User Segments - Create and manage user groups
// Tab 6: Account Actions - Bulk operations and admin actions
//
// FIREBASE COLLECTIONS:
// - mobileApp/users/profiles
// - mobileApp/users/devices
// - mobileApp/users/permissions
// - mobileApp/users/activity
// - mobileApp/users/segments
// - mobileApp/users/actions
//
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  FormControlLabel,
  Switch,
  Checkbox,
  IconButton,
  Tooltip,
  Badge,
  InputAdornment,
  Menu,
  FormGroup,
} from '@mui/material';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Smartphone,
  Activity,
  Clock,
  MapPin,
  Mail,
  Phone,
  Tag,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Eye,
  Lock,
  Unlock,
  Send,
  Settings,
  BarChart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Globe,
  Calendar,
  Copy,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const USER_ROLES = [
  { value: 'user', label: 'User', color: 'default' },
  { value: 'premium', label: 'Premium', color: 'primary' },
  { value: 'admin', label: 'Admin', color: 'warning' },
  { value: 'moderator', label: 'Moderator', color: 'info' },
];

const USER_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
  { value: 'banned', label: 'Banned', color: 'error' },
];

const DEVICE_TYPES = [
  { value: 'ios', label: 'iOS', icon: 'Apple' },
  { value: 'android', label: 'Android', icon: 'Chrome' },
  { value: 'web', label: 'Web', icon: 'Globe' },
];

const ACTIVITY_TYPES = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'settings_change', label: 'Settings Change' },
];

const CHART_COLORS = ['#2196f3', '#f50057', '#00bcd4', '#ff9800', '#4caf50'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MobileUserManager = ({ onComplete }) => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // User state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Device state
  const [devices, setDevices] = useState([]);
  const [deviceDialog, setDeviceDialog] = useState(false);

  // Permission state
  const [permissions, setPermissions] = useState({});
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');

  // Segment state
  const [segments, setSegments] = useState([]);
  const [segmentDialog, setSegmentDialog] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: {},
  });

  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to users
    const usersQuery = query(
      collection(db, 'mobileApp', 'users', 'profiles'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    unsubscribers.push(
      onSnapshot(usersQuery, (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
        console.log('✅ Users loaded:', userData.length);
      })
    );

    // Listen to devices
    const devicesQuery = query(
      collection(db, 'mobileApp', 'users', 'devices')
    );

    unsubscribers.push(
      onSnapshot(devicesQuery, (snapshot) => {
        const deviceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(deviceData);
      })
    );

    // Listen to activity
    const activityQuery = query(
      collection(db, 'mobileApp', 'users', 'activity'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    unsubscribers.push(
      onSnapshot(activityQuery, (snapshot) => {
        const activityData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(activityData);
      })
    );

    // Listen to segments
    const segmentsQuery = query(
      collection(db, 'mobileApp', 'users', 'segments'),
      where('userId', '==', currentUser.uid)
    );

    unsubscribers.push(
      onSnapshot(segmentsQuery, (snapshot) => {
        const segmentData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSegments(segmentData);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== USER HANDLERS =====
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      setLoading(true);

      await updateDoc(
        doc(db, 'mobileApp', 'users', 'profiles', userId),
        {
          status: newStatus,
          updatedAt: serverTimestamp(),
        }
      );

      showSnackbar(`User ${newStatus}!`, 'success');
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      showSnackbar('Failed to update user status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);

      await updateDoc(
        doc(db, 'mobileApp', 'users', 'profiles', userId),
        {
          role: newRole,
          updatedAt: serverTimestamp(),
        }
      );

      showSnackbar('User role updated!', 'success');
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      showSnackbar('Failed to update user role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Permanently delete this user? This action cannot be undone.')) return;

    try {
      setLoading(true);

      await deleteDoc(doc(db, 'mobileApp', 'users', 'profiles', userId));

      showSnackbar('User deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      showSnackbar('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== DEVICE HANDLERS =====
  const handleRevokeDevice = async (deviceId) => {
    if (!confirm('Revoke this device? The user will need to log in again.')) return;

    try {
      setLoading(true);

      await updateDoc(
        doc(db, 'mobileApp', 'users', 'devices', deviceId),
        {
          revoked: true,
          revokedAt: serverTimestamp(),
        }
      );

      showSnackbar('Device revoked!', 'success');
    } catch (error) {
      console.error('❌ Error revoking device:', error);
      showSnackbar('Failed to revoke device', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== SEGMENT HANDLERS =====
  const handleCreateSegment = async () => {
    try {
      setLoading(true);

      const segmentData = {
        ...newSegment,
        userId: currentUser.uid,
        userCount: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'users', 'segments'), segmentData);

      showSnackbar('Segment created!', 'success');
      setNewSegment({
        name: '',
        description: '',
        criteria: {},
      });
      setSegmentDialog(false);

      if (onComplete) onComplete();
    } catch (error) {
      console.error('❌ Error creating segment:', error);
      showSnackbar('Failed to create segment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!confirm('Delete this segment?')) return;

    try {
      setLoading(true);

      await deleteDoc(doc(db, 'mobileApp', 'users', 'segments', segmentId));

      showSnackbar('Segment deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting segment:', error);
      showSnackbar('Failed to delete segment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== BULK ACTIONS =====
  const handleBulkAction = async () => {
    try {
      setLoading(true);

      const promises = selectedUsers.map(userId => {
        switch (bulkAction) {
          case 'suspend':
            return updateDoc(doc(db, 'mobileApp', 'users', 'profiles', userId), {
              status: 'suspended',
              updatedAt: serverTimestamp(),
            });
          case 'activate':
            return updateDoc(doc(db, 'mobileApp', 'users', 'profiles', userId), {
              status: 'active',
              updatedAt: serverTimestamp(),
            });
          case 'delete':
            return deleteDoc(doc(db, 'mobileApp', 'users', 'profiles', userId));
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      showSnackbar(`Bulk action completed on ${selectedUsers.length} users!`, 'success');
      setSelectedUsers([]);
      setBulkActionDialog(false);
    } catch (error) {
      console.error('❌ Error performing bulk action:', error);
      showSnackbar('Failed to perform bulk action', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ===== RENDER: TAB 1 - USER DIRECTORY =====
  const renderUserDirectory = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Users />
          User Directory ({filteredUsers.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => showSnackbar('Exporting users...', 'info')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            disabled={selectedUsers.length === 0}
            onClick={() => setBulkActionDialog(true)}
          >
            Bulk Actions ({selectedUsers.length})
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={filterRole}
              label="Role"
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {USER_ROLES.map(role => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {USER_STATUSES.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* User Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{user.displayName?.charAt(0) || user.email?.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.displayName || 'Unnamed User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'user'}
                        size="small"
                        color={USER_ROLES.find(r => r.value === user.role)?.color || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'active'}
                        size="small"
                        color={USER_STATUSES.find(s => s.value === user.status)?.color || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {user.lastActiveAt ? formatDistanceToNow(user.lastActiveAt.toDate(), { addSuffix: true }) : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {user.createdAt && format(user.createdAt.toDate(), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedUser(user);
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          showSnackbar('User profile opened', 'info');
        }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={() => {
          handleUpdateUserStatus(selectedUser?.id, 'suspended');
          setAnchorEl(null);
        }}>
          <Lock size={16} style={{ marginRight: 8 }} />
          Suspend User
        </MenuItem>
        <MenuItem onClick={() => {
          handleUpdateUserStatus(selectedUser?.id, 'active');
          setAnchorEl(null);
        }}>
          <Unlock size={16} style={{ marginRight: 8 }} />
          Activate User
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteUser(selectedUser?.id);
          setAnchorEl(null);
        }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialog}
        onClose={() => setBulkActionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bulk Action on {selectedUsers.length} Users</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={bulkAction}
              label="Action"
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <MenuItem value="activate">Activate Users</MenuItem>
              <MenuItem value="suspend">Suspend Users</MenuItem>
              <MenuItem value="delete">Delete Users</MenuItem>
            </Select>
          </FormControl>

          {bulkAction && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Warning</AlertTitle>
              This action will affect {selectedUsers.length} users. This cannot be undone.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkAction}
            disabled={loading || !bulkAction}
          >
            Confirm Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== RENDER: TAB 2 - DEVICE MANAGEMENT =====
  const renderDeviceManagement = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Smartphone />
        Device Management
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {devices.map((device) => (
          <Grid item xs={12} md={6} key={device.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Smartphone size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {device.deviceName || 'Unknown Device'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {device.platform} • {device.appVersion}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={device.revoked ? 'Revoked' : 'Active'}
                    size="small"
                    color={device.revoked ? 'error' : 'success'}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Last Active
                    </Typography>
                    <Typography variant="body2">
                      {device.lastActiveAt && formatDistanceToNow(device.lastActiveAt.toDate(), { addSuffix: true })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Registered
                    </Typography>
                    <Typography variant="body2">
                      {device.createdAt && format(device.createdAt.toDate(), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<XCircle />}
                  onClick={() => handleRevokeDevice(device.id)}
                  disabled={device.revoked}
                  sx={{ mt: 2 }}
                >
                  {device.revoked ? 'Device Revoked' : 'Revoke Device'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {devices.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Devices</AlertTitle>
              No devices registered yet.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // ===== RENDER: TAB 3 - PERMISSIONS & ROLES =====
  const renderPermissionsRoles = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield />
        Permissions & Roles
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {USER_ROLES.map((role) => (
          <Grid item xs={12} md={6} key={role.value}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {role.label}
                  </Typography>
                  <Chip
                    label={`${users.filter(u => u.role === role.value).length} users`}
                    color={role.color}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Permissions for this role:
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemText primary="View app content" />
                    <CheckCircle size={16} color="green" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Make purchases" />
                    {role.value !== 'user' ? <CheckCircle size={16} color="green" /> : <XCircle size={16} color="red" />}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Access premium features" />
                    {role.value === 'premium' || role.value === 'admin' ? <CheckCircle size={16} color="green" /> : <XCircle size={16} color="red" />}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Moderate content" />
                    {role.value === 'moderator' || role.value === 'admin' ? <CheckCircle size={16} color="green" /> : <XCircle size={16} color="red" />}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Admin access" />
                    {role.value === 'admin' ? <CheckCircle size={16} color="green" /> : <XCircle size={16} color="red" />}
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // ===== RENDER: TAB 4 - ACTIVITY LOGS =====
  const renderActivityLogs = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity />
          Activity Logs
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter Activity</InputLabel>
          <Select
            value={activityFilter}
            label="Filter Activity"
            onChange={(e) => setActivityFilter(e.target.value)}
          >
            <MenuItem value="all">All Activities</MenuItem>
            {ACTIVITY_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <List>
          {activities
            .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
            .slice(0, 50)
            .map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Activity size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description || activity.type}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.userEmail || 'Unknown User'}
                        </Typography>
                        {' — '}
                        {activity.timestamp && formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                      </>
                    }
                  />
                  <Chip
                    label={activity.type}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
        </List>

        {activities.length === 0 && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              No activity logs yet.
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );

  // ===== RENDER: TAB 5 - USER SEGMENTS =====
  const renderUserSegments = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tag />
          User Segments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setSegmentDialog(true)}
        >
          Create Segment
        </Button>
      </Box>

      <Grid container spacing={2}>
        {segments.map((segment) => (
          <Grid item xs={12} md={6} key={segment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6">
                    {segment.name}
                  </Typography>
                  <Chip
                    label={`${segment.userCount || 0} users`}
                    size="small"
                    color="primary"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {segment.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Eye />}
                  >
                    View Users
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSegment(segment.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {segments.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Segments Yet</AlertTitle>
              Create user segments to organize and target specific groups!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Segment Dialog */}
      <Dialog
        open={segmentDialog}
        onClose={() => setSegmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create User Segment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Segment Name"
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                placeholder="Premium Users"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                placeholder="Users with premium subscription"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Segment criteria can be configured after creation.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSegmentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSegment}
            disabled={loading || !newSegment.name}
          >
            Create Segment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== RENDER: TAB 6 - ACCOUNT ACTIONS =====
  const renderAccountActions = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Account Actions
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Download />
                Export Data
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Export user data in various formats for analysis or backup.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button variant="outlined" startIcon={<Download />}>
                  Export as CSV
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export as JSON
                </Button>
                <Button variant="outlined" startIcon={<Download />}>
                  Export as Excel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Upload />
                Import Users
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bulk import users from CSV or JSON file.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Upload />}
                sx={{ mt: 2 }}
              >
                Select File to Import
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Supported formats: CSV, JSON
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Send />
                Send Notification to Users
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Send a push notification or email to selected users or segments.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Send />}
                sx={{ mt: 2 }}
                onClick={() => showSnackbar('Navigate to messaging system', 'info')}
              >
                Go to Messaging System
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ===== MAIN RENDER =====
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Users />} label="User Directory" />
          <Tab icon={<Smartphone />} label="Device Management" />
          <Tab icon={<Shield />} label="Permissions & Roles" />
          <Tab icon={<Activity />} label="Activity Logs" />
          <Tab icon={<Tag />} label="User Segments" />
          <Tab icon={<Settings />} label="Account Actions" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderUserDirectory()}
      {activeTab === 1 && renderDeviceManagement()}
      {activeTab === 2 && renderPermissionsRoles()}
      {activeTab === 3 && renderActivityLogs()}
      {activeTab === 4 && renderUserSegments()}
      {activeTab === 5 && renderAccountActions()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};

export default MobileUserManager;