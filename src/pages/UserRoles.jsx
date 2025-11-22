// src/pages/UserRoleManager.jsx - Team & Permission Management
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, IconButton, Stack, Switch,
  FormControlLabel, Checkbox, Avatar, List, ListItem, ListItemText,
  ListItemIcon, Divider, Badge, Tabs, Tab
} from '@mui/material';
import {
  Users, UserPlus, Edit, Trash2, Shield, Lock, Eye, CheckCircle, XCircle,
  Mail, Phone, Calendar, Settings, Key, AlertCircle, Crown, Clock
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import DeletionApprovalSystem, { DeletionRequestsDashboard } from '@/components/DeletionApprovalSystem';
import { canManageRole } from '@/config/roleConfig';
import { logRoleChange } from '@/services/roleChangeNotificationService';

const UserRoleManager = () => {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    permissions: {
      // Contact Management
      viewContacts: true,
      addContacts: true,
      editContacts: false,
      deleteContacts: false,
      exportContacts: false,
      
      // Disputes
      viewDisputes: true,
      createDisputes: true,
      editDisputes: false,
      deleteDisputes: false,
      approveDisputes: false,
      
      // Documents
      viewDocuments: true,
      uploadDocuments: true,
      deleteDocuments: false,
      
      // Communication
      sendEmails: true,
      sendSMS: true,
      viewCallLogs: true,
      makeNotes: true,
      
      // Financial
      viewInvoices: false,
      createInvoices: false,
      processPayments: false,
      viewReports: false,
      
      // Settings
      manageUsers: false,
      manageSettings: false,
      viewAuditLog: false
    }
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const roles = {
    owner: {
      label: 'Owner',
      color: '#8B5CF6',
      icon: Crown,
      description: 'Full system access and ownership',
      defaultPermissions: 'all'
    },
    admin: {
      label: 'Administrator',
      color: '#3B82F6',
      icon: Shield,
      description: 'Full access except ownership transfer',
      defaultPermissions: 'all_except_owner'
    },
    manager: {
      label: 'Manager',
      color: '#10B981',
      icon: Users,
      description: 'Can manage team and operations',
      defaultPermissions: 'management'
    },
    specialist: {
      label: 'Credit Specialist',
      color: '#F59E0B',
      icon: Key,
      description: 'Can work on client cases',
      defaultPermissions: 'specialist'
    },
    user: {
      label: 'User',
      color: '#6B7280',
      icon: Users,
      description: 'Basic access',
      defaultPermissions: 'basic'
    }
  };

  const permissionGroups = {
    contacts: {
      label: 'Contact Management',
      permissions: ['viewContacts', 'addContacts', 'editContacts', 'deleteContacts', 'exportContacts']
    },
    disputes: {
      label: 'Dispute Management',
      permissions: ['viewDisputes', 'createDisputes', 'editDisputes', 'deleteDisputes', 'approveDisputes']
    },
    documents: {
      label: 'Documents',
      permissions: ['viewDocuments', 'uploadDocuments', 'deleteDocuments']
    },
    communication: {
      label: 'Communication',
      permissions: ['sendEmails', 'sendSMS', 'viewCallLogs', 'makeNotes']
    },
    financial: {
      label: 'Financial',
      permissions: ['viewInvoices', 'createInvoices', 'processPayments', 'viewReports']
    },
    settings: {
      label: 'Settings & Admin',
      permissions: ['manageUsers', 'manageSettings', 'viewAuditLog']
    }
  };

  const permissionLabels = {
    viewContacts: 'View Contacts',
    addContacts: 'Add Contacts',
    editContacts: 'Edit Contacts',
    deleteContacts: 'Delete Contacts',
    exportContacts: 'Export Contacts',
    
    viewDisputes: 'View Disputes',
    createDisputes: 'Create Disputes',
    editDisputes: 'Edit Disputes',
    deleteDisputes: 'Delete Disputes',
    approveDisputes: 'Approve Disputes',
    
    viewDocuments: 'View Documents',
    uploadDocuments: 'Upload Documents',
    deleteDocuments: 'Delete Documents',
    
    sendEmails: 'Send Emails',
    sendSMS: 'Send SMS Messages',
    viewCallLogs: 'View Call Logs',
    makeNotes: 'Create Notes',
    
    viewInvoices: 'View Invoices',
    createInvoices: 'Create Invoices',
    processPayments: 'Process Payments',
    viewReports: 'View Financial Reports',
    
    manageUsers: 'Manage Users',
    manageSettings: 'Manage System Settings',
    viewAuditLog: 'View Audit Log'
  };

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const usersData = [];
      
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  // Apply role default permissions
  const applyRolePermissions = (role) => {
    const allTrue = Object.keys(userForm.permissions).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    const allFalse = Object.keys(userForm.permissions).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    switch (role) {
      case 'owner':
      case 'admin':
        return allTrue;
      
      case 'manager':
        return {
          ...allTrue,
          deleteContacts: false,
          deleteDisputes: false,
          manageSettings: false
        };
      
      case 'specialist':
        return {
          ...allFalse,
          viewContacts: true,
          addContacts: true,
          editContacts: true,
          viewDisputes: true,
          createDisputes: true,
          editDisputes: true,
          viewDocuments: true,
          uploadDocuments: true,
          sendEmails: true,
          sendSMS: true,
          viewCallLogs: true,
          makeNotes: true
        };
      
      case 'user':
        return {
          ...allFalse,
          viewContacts: true,
          viewDisputes: true,
          viewDocuments: true,
          viewCallLogs: true,
          makeNotes: true
        };
      
      default:
        return userForm.permissions;
    }
  };

  // Create/Update user
  const handleSaveUser = async () => {
    if (!userForm.email || !userForm.firstName || !userForm.lastName) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    // Validate role management permissions for updates
    if (selectedUser?.id && selectedUser.role !== userForm.role) {
      const canChange = canManageRole(userProfile?.role, userForm.role);
      if (!canChange) {
        showSnackbar(`You cannot assign ${userForm.role} role`, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const userData = {
        ...userForm,
        organizationId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (selectedUser?.id) {
        // Check if role changed and log it
        const roleChanged = selectedUser.role !== userForm.role;
        
        await updateDoc(doc(db, 'users', selectedUser.id), userData);
        
        // Log role change if applicable
        if (roleChanged) {
          await logRoleChange({
            targetUserId: selectedUser.id,
            targetUserEmail: selectedUser.email,
            targetUserName: `${selectedUser.firstName} ${selectedUser.lastName}`,
            previousRole: selectedUser.role,
            newRole: userForm.role,
            changedBy: currentUser.uid,
            changedByEmail: currentUser.email,
            changedByName: userProfile?.displayName || currentUser.email,
            changedByRole: userProfile?.role,
          });
        }
        
        showSnackbar('User updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'users'), {
          ...userData,
          createdAt: serverTimestamp(),
          inviteStatus: 'pending'
        });
        showSnackbar('User created and invitation sent', 'success');
      }

      setDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar('Error saving user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', user.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showSnackbar(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Error updating status', 'error');
    }
  };

  // Delete user - Now handled by DeletionApprovalSystem component

  // Reset form
  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      permissions: applyRolePermissions('user')
    });
    setSelectedUser(null);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            User & Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team members and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={20} />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Team Members" icon={<Users size={18} />} iconPosition="start" />
          {(userProfile?.role === 'masterAdmin' || userProfile?.role === 'officeManager') && (
            <Tab label="Deletion Requests" icon={<Clock size={18} />} iconPosition="start" />
          )}
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Team Members */}
      {tabValue === 0 && (
        <>
          {/* Role Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {Object.entries(roles).map(([key, role]) => {
              const RoleIcon = role.icon;
              const userCount = users.filter(u => u.role === key).length;
              
              return (
                <Grid item xs={12} md={4} lg={2.4} key={key}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <RoleIcon size={20} color={role.color} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {role.label}
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight={600}>
                        {userCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Users Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const RoleIcon = roles[user.role]?.icon || Users;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: roles[user.role]?.color }}>
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<RoleIcon size={14} />}
                            label={roles[user.role]?.label}
                            size="small"
                            sx={{ backgroundColor: `${roles[user.role]?.color}20` }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={user.status === 'active'}
                            onChange={() => handleToggleStatus(user)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.lastActiveAt ? format(
                            user.lastActiveAt.toDate ? user.lastActiveAt.toDate() : new Date(user.lastActiveAt),
                            'MM/dd/yyyy'
                          ) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserForm(user);
                                setPermissionsDialogOpen(true);
                              }}
                            >
                              <Shield size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserForm(user);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <DeletionApprovalSystem
                              targetUser={user}
                              onSuccess={() => loadUsers()}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Tab Panel 1: Deletion Requests */}
      {tabValue === 1 && (userProfile?.role === 'masterAdmin' || userProfile?.role === 'officeManager') && (
        <DeletionRequestsDashboard />
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={userForm.firstName}
                onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={userForm.lastName}
                onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                required
                fullWidth
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone"
                fullWidth
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setUserForm(prev => ({ 
                      ...prev, 
                      role: newRole,
                      permissions: applyRolePermissions(newRole)
                    }));
                  }}
                >
                  {Object.entries(roles).map(([key, role]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <role.icon size={16} />
                        {role.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                {roles[userForm.role]?.description}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                An invitation email will be sent to this user
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser} disabled={loading}>
            {selectedUser ? 'Update' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onClose={() => setPermissionsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Permissions - {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Changing permissions will override role defaults. Be careful when granting sensitive permissions.
          </Alert>

          {Object.entries(permissionGroups).map(([groupKey, group]) => (
            <Box key={groupKey} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {group.label}
              </Typography>
              <Grid container spacing={1}>
                {group.permissions.map(permission => (
                  <Grid item xs={12} md={6} key={permission}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={userForm.permissions?.[permission] || false}
                          onChange={(e) => setUserForm(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [permission]: e.target.checked
                            }
                          }))}
                        />
                      }
                      label={permissionLabels[permission]}
                    />
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRoleManager;