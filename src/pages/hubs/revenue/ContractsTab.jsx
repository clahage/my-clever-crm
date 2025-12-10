// Path: /src/pages/hubs/revenue/ContractsTab.jsx
// ============================================================================
// REVENUE HUB - CONTRACTS TAB
// ============================================================================
// Purpose: Contract lifecycle management
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Search
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ContractsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    value: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    type: 'service',
    description: ''
  });

  useEffect(() => {
    const contractsQuery = query(
      collection(db, 'contracts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(contractsQuery, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContracts(contractsData);
      setFilteredContracts(contractsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching contracts:', error);
      setSnackbar({ open: true, message: 'Error loading contracts', severity: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter contracts
  useEffect(() => {
    let filtered = [...contracts];

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    setFilteredContracts(filtered);
  }, [searchTerm, statusFilter, contracts]);

  const handleOpenDialog = (contract = null) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        title: contract.title || '',
        clientName: contract.clientName || '',
        value: contract.value || '',
        startDate: contract.startDate?.toDate ? contract.startDate.toDate().toISOString().split('T')[0] : '',
        endDate: contract.endDate?.toDate ? contract.endDate.toDate().toISOString().split('T')[0] : '',
        status: contract.status || 'draft',
        type: contract.type || 'service',
        description: contract.description || ''
      });
    } else {
      setEditingContract(null);
      setFormData({
        title: '',
        clientName: '',
        value: '',
        startDate: '',
        endDate: '',
        status: 'draft',
        type: 'service',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const contractData = {
        ...formData,
        value: parseFloat(formData.value),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: serverTimestamp()
      };

      if (editingContract) {
        await updateDoc(doc(db, 'contracts', editingContract.id), contractData);
        setSnackbar({ open: true, message: 'Contract updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'contracts'), {
          ...contractData,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.uid
        });
        setSnackbar({ open: true, message: 'Contract created successfully', severity: 'success' });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving contract:', error);
      setSnackbar({ open: true, message: 'Error saving contract', severity: 'error' });
    }
  };

  const handleDelete = async (contractId) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteDoc(doc(db, 'contracts', contractId));
        setSnackbar({ open: true, message: 'Contract deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting contract:', error);
        setSnackbar({ open: true, message: 'Error deleting contract', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'draft': return 'default';
      case 'signed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'expired': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.value || 0), 0)
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Contract Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
        >
          Create Contract
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {stats.expired}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ${stats.totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No contracts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {contract.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{contract.clientName}</TableCell>
                    <TableCell>
                      <Chip
                        label={contract.type}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${(contract.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {contract.startDate?.toDate ? contract.startDate.toDate().toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {contract.endDate?.toDate ? contract.endDate.toDate().toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(contract.status)}
                        label={contract.status}
                        size="small"
                        color={getStatusColor(contract.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="Download">
                        <Download size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(contract)}>
                        <Edit size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(contract.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* E-Signature Integration */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            E-Signature Integration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" fullWidth disabled>
                Connect DocuSign (Coming Soon)
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" fullWidth disabled>
                Connect HelloSign (Coming Soon)
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" fullWidth disabled>
                Connect Adobe Sign (Coming Soon)
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContract ? 'Edit Contract' : 'Create Contract'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Contract Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Client Name"
              fullWidth
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contract Value"
                  fullWidth
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Contract Type"
                  fullWidth
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="service">Service Agreement</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="subscription">Subscription</MenuItem>
                  <MenuItem value="license">License</MenuItem>
                  <MenuItem value="partnership">Partnership</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Date"
                  fullWidth
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="End Date"
                  fullWidth
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="signed">Signed</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContract ? 'Update' : 'Create'}
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

export default ContractsTab;
