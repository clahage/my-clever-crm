import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, IconButton,
  Alert, CircularProgress, Divider, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControlLabel, Checkbox, FormGroup
} from '@mui/material';
import { Shield, Edit, Users as UsersIcon } from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ROLE_LEVELS = [
  {
    value: 8,
    label: 'Master Admin',
    color: '#EF4444',
    description: 'Full system access with all permissions',
    permissions: [
      'Full System Access',
      'User Management',
      'Role Management',
      'Billing & Subscriptions',
      'Security Settings',
      'System Configuration',
      'API Management',
      'Integration Management',
      'Audit Log Access',
      'Delete Users',
      'Delete Data'
    ]
  },
  {
    value: 7,
    label: 'Admin',
    color: '#F59E0B',
    description: 'Administrative access to most features',
    permissions: [
      'User Management',
      'Client Management',
      'Report Access',
      'Team Management',
      'Integration Setup',
      'View Audit Logs',
      'Billing View',
      'Workflow Management'
    ]
  },
  {
    value: 6,
    label: 'Manager',
    color: '#3B82F6',
    description: 'Team and client management',
    permissions: [
      'Team Management',
      'Client Management',
      'Report Access',
      'Task Assignment',
      'View Analytics',
      'Dispute Management',
      'Communication Access'
    ]
  },
  {
    value: 5,
    label: 'User',
    color: '#10B981',
    description: 'Standard user access',
    permissions: [
      'Client View',
      'Task Management',
      'Basic Reports',
      'Communication',
      'Document Upload',
      'Dispute Tracking'
    ]
  },
  {
    value: 4,
    label: 'Affiliate',
    color: '#8B5CF6',
    description: 'Affiliate partner access',
    permissions: [
      'Lead Tracking',
      'Commission View',
      'Basic Reports',
      'Client Referrals',
      'Marketing Materials'
    ]
  },
  {
    value: 3,
    label: 'Client',
    color: '#EC4899',
    description: 'Client portal access',
    permissions: [
      'View Own Data',
      'Update Profile',
      'View Reports',
      'Communication',
      'Document Upload',
      'Payment Management'
    ]
  },
  {
    value: 2,
    label: 'Prospect',
    color: '#6B7280',
    description: 'Limited prospect access',
    permissions: [
      'View Basic Info',
      'Contact Support',
      'Registration'
    ]
  },
  {
    value: 1,
    label: 'Viewer',
    color: '#9CA3AF',
    description: 'View-only access',
    permissions: [
      'View Dashboard',
      'View Reports',
      'Read-Only Access'
    ]
  }
];

const RolesTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMasterAdmin = userProfile?.role === 8;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getUserCountByRole = (roleValue) => {
    return users.filter(u => u.role === roleValue).length;
  };

  const handleOpenDialog = (role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Shield size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Roles & Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            8-level role hierarchy with granular permissions
          </Typography>
        </div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {ROLE_LEVELS.map((role) => (
          <Grid item xs={12} md={6} key={role.value}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${role.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ color: role.color }}>
                        {role.value}
                      </Typography>
                    </Box>
                    <div>
                      <Typography variant="h6" fontWeight="600">
                        {role.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </div>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(role)}
                    disabled={!isMasterAdmin}
                  >
                    <Edit size={16} />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                    PERMISSIONS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions.slice(0, 4).map((perm, idx) => (
                      <Chip
                        key={idx}
                        label={perm}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {role.permissions.length > 4 && (
                      <Chip
                        label={`+${role.permissions.length - 4} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UsersIcon size={14} />
                    <Typography variant="caption">
                      {getUserCountByRole(role.value)} {getUserCountByRole(role.value) === 1 ? 'user' : 'users'} with this role
                    </Typography>
                  </Box>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Role Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole?.label} - Permissions
        </DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ pt: 2 }}>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: `${selectedRole.color}10`,
                  border: `1px solid ${selectedRole.color}40`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${selectedRole.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" sx={{ color: selectedRole.color }}>
                      {selectedRole.value}
                    </Typography>
                  </Box>
                  <div>
                    <Typography variant="h6" fontWeight="600">
                      {selectedRole.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRole.description}
                    </Typography>
                  </div>
                </Box>
                <Alert severity="info">
                  <Typography variant="caption">
                    {getUserCountByRole(selectedRole.value)} users currently have this role
                  </Typography>
                </Alert>
              </Box>

              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
                Permissions
              </Typography>
              <FormGroup>
                {selectedRole.permissions.map((permission, idx) => (
                  <FormControlLabel
                    key={idx}
                    control={<Checkbox defaultChecked disabled={!isMasterAdmin} />}
                    label={permission}
                  />
                ))}
              </FormGroup>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="caption">
                  Modifying role permissions will affect all users assigned to this role.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="contained" onClick={handleCloseDialog} disabled={!isMasterAdmin}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesTab;
