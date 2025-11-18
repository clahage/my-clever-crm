// Permissions.jsx - Production-Ready Permission Management Component
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  LinearProgress,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  MoreVertical,
  ChevronDown,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Clock,
  Activity,
  Database,
  Globe,
  Zap
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const Permissions = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('role'); // 'role', 'user', 'permission'
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Predefined permissions structure
  const permissionCategories = {
    dashboard: {
      label: 'Dashboard',
      permissions: [
        { key: 'dashboard.view', label: 'View Dashboard', description: 'Access to main dashboard' },
        { key: 'dashboard.analytics', label: 'View Analytics', description: 'Access to analytics data' },
        { key: 'dashboard.export', label: 'Export Data', description: 'Export dashboard reports' }
      ]
    },
    leads: {
      label: 'Leads Management',
      permissions: [
        { key: 'leads.view', label: 'View Leads', description: 'View lead information' },
        { key: 'leads.create', label: 'Create Leads', description: 'Add new leads' },
        { key: 'leads.edit', label: 'Edit Leads', description: 'Modify lead information' },
        { key: 'leads.delete', label: 'Delete Leads', description: 'Remove leads from system' },
        { key: 'leads.export', label: 'Export Leads', description: 'Export lead data' },
        { key: 'leads.import', label: 'Import Leads', description: 'Import leads from files' }
      ]
    },
    campaigns: {
      label: 'Campaign Management',
      permissions: [
        { key: 'campaigns.view', label: 'View Campaigns', description: 'Access campaign list' },
        { key: 'campaigns.create', label: 'Create Campaigns', description: 'Create new campaigns' },
        { key: 'campaigns.edit', label: 'Edit Campaigns', description: 'Modify campaign settings' },
        { key: 'campaigns.delete', label: 'Delete Campaigns', description: 'Remove campaigns' },
        { key: 'campaigns.send', label: 'Send Campaigns', description: 'Execute campaign sends' },
        { key: 'campaigns.schedule', label: 'Schedule Campaigns', description: 'Schedule campaign timing' }
      ]
    },
    billing: {
      label: 'Billing & Finance',
      permissions: [
        { key: 'billing.view', label: 'View Billing', description: 'Access billing information' },
        { key: 'billing.manage', label: 'Manage Billing', description: 'Modify billing settings' },
        { key: 'billing.invoices', label: 'Manage Invoices', description: 'Create and edit invoices' },
        { key: 'billing.payments', label: 'Process Payments', description: 'Handle payment processing' }
      ]
    },
    settings: {
      label: 'System Settings',
      permissions: [
        { key: 'settings.view', label: 'View Settings', description: 'Access system settings' },
        { key: 'settings.edit', label: 'Edit Settings', description: 'Modify system configuration' },
        { key: 'settings.users', label: 'Manage Users', description: 'Add/remove users' },
        { key: 'settings.roles', label: 'Manage Roles', description: 'Create and modify roles' },
        { key: 'settings.api', label: 'API Access', description: 'Manage API keys and webhooks' }
      ]
    }
  };

  // Form state for new/edit role
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: 'user',
    permissions: [],
    color: '#3B82F6',
    isActive: true
  });

  // Form state for new/edit user
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    phone: '',
    isActive: true,
    permissions: [] // Custom permissions override
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const rolesQuery = query(collection(db, 'roles'), where('organizationId', '==', user.uid));
        const rolesUnsubscribe = onSnapshot(rolesQuery, (snapshot) => {
          const rolesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRoles(rolesData);
        });

        // Fetch team users
        const usersQuery = query(collection(db, 'teamUsers'), where('organizationId', '==', user.uid));
        const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersData);
        });

        setLoading(false);

        return () => {
          rolesUnsubscribe();
          usersUnsubscribe();
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Statistics
  const statistics = useMemo(() => {
    const activeUsers = users.filter(u => u.isActive).length;
    const adminUsers = users.filter(u => {
      const role = roles.find(r => r.id === u.role);
      return role?.level === 'admin';
    }).length;

    return {
      totalRoles: roles.length,
      totalUsers: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      adminUsers,
      standardUsers: users.length - adminUsers
    };
  }, [roles, users]);

  // Handle role creation
  const handleCreateRole = async () => {
    try {
      await addDoc(collection(db, 'roles'), {
        ...roleForm,
        organizationId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Role created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating role', severity: 'error' });
    }
  };

  // Handle role update
  const handleUpdateRole = async () => {
    try {
      const roleRef = doc(db, 'roles', selectedItem.id);
      await updateDoc(roleRef, {
        ...roleForm,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Role updated successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating role', severity: 'error' });
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    try {
      await addDoc(collection(db, 'teamUsers'), {
        ...userForm,
        organizationId: user.uid,
        createdAt: new Date().toISOString(),
        lastLogin: null
      });
      
      setSnackbar({ open: true, message: 'User added successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding user', severity: 'error' });
    }
  };

  // Handle user update
  const handleUpdateUser = async () => {
    try {
      const userRef = doc(db, 'teamUsers', selectedItem.id);
      await updateDoc(userRef, {
        ...userForm,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating user', severity: 'error' });
    }
  };

  // Handle deletion
  const handleDelete = async (type, id) => {
    const confirmMessage = type === 'role' 
      ? 'Are you sure you want to delete this role? Users with this role will need reassignment.'
      : 'Are you sure you want to remove this user?';
    
    if (window.confirm(confirmMessage)) {
      try {
        const collectionName = type === 'role' ? 'roles' : 'teamUsers';
        await deleteDoc(doc(db, collectionName, id));
        setSnackbar({ 
          open: true, 
          message: `${type === 'role' ? 'Role' : 'User'} deleted successfully!`, 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: `Error deleting ${type === 'role' ? 'role' : 'user'}`, 
          severity: 'error' 
        });
      }
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'teamUsers', userId);
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ 
        open: true, 
        message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating user status', severity: 'error' });
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey) => {
    const currentPermissions = roleForm.permissions || [];
    const newPermissions = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter(p => p !== permissionKey)
      : [...currentPermissions, permissionKey];
    
    setRoleForm({ ...roleForm, permissions: newPermissions });
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setRoleForm({
      name: '',
      description: '',
      level: 'user',
      permissions: [],
      color: '#3B82F6',
      isActive: true
    });
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      department: '',
      phone: '',
      isActive: true,
      permissions: []
    });
  };

  // Open edit dialog
  const handleEdit = (type, item) => {
    setDialogType(type);
    setSelectedItem(item);
    
    if (type === 'role') {
      setRoleForm(item);
    } else {
      setUserForm(item);
    }
    
    setDialogOpen(true);
  };

  // Open create dialog
  const handleOpenCreateDialog = (type) => {
    setDialogType(type);
    setSelectedItem(null);
    setDialogOpen(true);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterRole]);

  // Users DataGrid columns
  const userColumns = [
    { 
      field: 'name', 
      headerName: 'User', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.firstName?.[0]}{params.row.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => {
        const role = roles.find(r => r.id === params.value);
        return (
          <Chip 
            label={role?.name || 'No Role'} 
            size="small"
            style={{ backgroundColor: role?.color + '20', color: role?.color }}
          />
        );
      }
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      width: 150
    },
    { 
      field: 'lastLogin', 
      headerName: 'Last Login', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'Never'}
        </Typography>
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          size="small"
          color={params.value ? 'success' : 'default'}
          icon={params.value ? <CheckCircle size={14} /> : <XCircle size={14} />}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit('user', params.row)}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleToggleUserStatus(params.row.id, params.row.isActive)}
          >
            {params.row.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete('user', params.row.id)}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Permissions & Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles, users, and system permissions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Shield size={20} />}
          >
            Security Audit
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => handleOpenCreateDialog('user')}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Roles</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalRoles}</Typography>
                </Box>
                <Shield size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalUsers}</Typography>
                </Box>
                <Users size={24} color="#8B5CF6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Users</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.activeUsers}</Typography>
                </Box>
                <UserCheck size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Inactive</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.inactiveUsers}</Typography>
                </Box>
                <UserX size={24} color="#EF4444" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Admins</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.adminUsers}</Typography>
                </Box>
                <Key size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Standard</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.standardUsers}</Typography>
                </Box>
                <Users size={24} color="#6B7280" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Users" />
          <Tab label="Roles" />
          <Tab label="Permissions Matrix" />
          <Tab label="Activity Log" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search users..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<UserPlus size={20} />}
              onClick={() => handleOpenCreateDialog('user')}
            >
              Add User
            </Button>
          </Box>

          {/* Users DataGrid */}
          <DataGrid
            rows={filteredUsers}
            columns={userColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">System Roles</Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => handleOpenCreateDialog('role')}
            >
              Create Role
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {roles.map(role => (
              <Grid item xs={12} md={4} key={role.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: role.color 
                          }} 
                        />
                        <Typography variant="h6">{role.name}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleEdit('role', role)}>
                        <Edit2 size={16} />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {role.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Users size={16} />
                      <Typography variant="body2">
                        {users.filter(u => u.role === role.id).length} users
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Shield size={16} />
                      <Typography variant="body2">
                        {role.permissions?.length || 0} permissions
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Chip 
                        label={role.level} 
                        size="small"
                        color={role.level === 'admin' ? 'error' : 'default'}
                      />
                      <Chip 
                        label={role.isActive ? 'Active' : 'Inactive'} 
                        size="small"
                        color={role.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Permission Matrix</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  {roles.map(role => (
                    <TableCell key={role.id} align="center">
                      {role.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(permissionCategories).map(([category, data]) => (
                  <React.Fragment key={category}>
                    <TableRow>
                      <TableCell colSpan={roles.length + 1} sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>
                        {data.label}
                      </TableCell>
                    </TableRow>
                    {data.permissions.map(permission => (
                      <TableRow key={permission.key}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{permission.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        {roles.map(role => (
                          <TableCell key={role.id} align="center">
                            {role.permissions?.includes(permission.key) ? (
                              <CheckCircle size={16} color="#10B981" />
                            ) : (
                              <XCircle size={16} color="#EF4444" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Activity Log</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Activity logging will track all permission changes and user access events.
          </Alert>
          <List>
            {[...Array(5)].map((_, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <Activity size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={`User ${index + 1} permission updated`}
                  secondary={`${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`}
                />
                <Chip label="Permission Change" size="small" />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'role' 
            ? (selectedItem ? 'Edit Role' : 'Create New Role')
            : (selectedItem ? 'Edit User' : 'Add New User')}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'role' ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role Name"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Level</InputLabel>
                    <Select
                      value={roleForm.level}
                      onChange={(e) => setRoleForm({ ...roleForm, level: e.target.value })}
                      label="Level"
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="viewer">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Permissions</Typography>
                  {Object.entries(permissionCategories).map(([category, data]) => (
                    <Accordion key={category} defaultExpanded={category === 'dashboard'}>
                      <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                        <Typography>{data.label}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup>
                          {data.permissions.map(permission => (
                            <FormControlLabel
                              key={permission.key}
                              control={
                                <Checkbox
                                  checked={roleForm.permissions?.includes(permission.key) || false}
                                  onChange={() => handlePermissionToggle(permission.key)}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2">{permission.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {permission.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      label="Role"
                    >
                      {roles.map(role => (
                        <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userForm.isActive}
                        onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                      />
                    }
                    label="User is active"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={dialogType === 'role' 
              ? (selectedItem ? handleUpdateRole : handleCreateRole)
              : (selectedItem ? handleUpdateUser : handleCreateUser)
            }
          >
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Permissions;