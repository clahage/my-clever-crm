// Location.jsx - Production-Ready Location Management Component
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
  ListItemIcon
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Building,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Navigation,
  Map,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  MoreVertical,
  Settings
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

const Location = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editMode, setEditMode] = useState(false);

  // Form state for new/edit location
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    website: '',
    type: 'office',
    status: 'active',
    manager: '',
    capacity: '',
    timezone: 'PST',
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    coordinates: { lat: null, lng: null },
    metrics: {
      revenue: 0,
      customers: 0,
      employees: 0,
      satisfaction: 0
    }
  });

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const q = query(collection(db, 'locations'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const locationData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setLocations(locationData);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchLocations();
    }
  }, [user]);

  // Statistics calculations
  const statistics = useMemo(() => {
    return {
      total: locations.length,
      active: locations.filter(l => l.status === 'active').length,
      revenue: locations.reduce((sum, l) => sum + (l.metrics?.revenue || 0), 0),
      employees: locations.reduce((sum, l) => sum + (l.metrics?.employees || 0), 0),
      avgSatisfaction: locations.length > 0 
        ? (locations.reduce((sum, l) => sum + (l.metrics?.satisfaction || 0), 0) / locations.length).toFixed(1)
        : 0
    };
  }, [locations]);

  // Performance data for charts
  const performanceData = useMemo(() => {
    return locations.map(loc => ({
      name: loc.name,
      revenue: loc.metrics?.revenue || 0,
      customers: loc.metrics?.customers || 0,
      satisfaction: loc.metrics?.satisfaction || 0
    }));
  }, [locations]);

  const typeDistribution = useMemo(() => {
    const types = locations.reduce((acc, loc) => {
      acc[loc.type] = (acc[loc.type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(types).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
  }, [locations]);

  // Handle location creation
  const handleCreateLocation = async () => {
    try {
      await addDoc(collection(db, 'locations'), {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Location created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating location', severity: 'error' });
    }
  };

  // Handle location update
  const handleUpdateLocation = async () => {
    try {
      const locationRef = doc(db, 'locations', selectedLocation.id);
      await updateDoc(locationRef, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({ open: true, message: 'Location updated successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating location', severity: 'error' });
    }
  };

  // Handle location deletion
  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteDoc(doc(db, 'locations', locationId));
        setSnackbar({ open: true, message: 'Location deleted successfully!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting location', severity: 'error' });
      }
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      phone: '',
      email: '',
      website: '',
      type: 'office',
      status: 'active',
      manager: '',
      capacity: '',
      timezone: 'PST',
      operatingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '', close: '', closed: true }
      },
      coordinates: { lat: null, lng: null },
      metrics: {
        revenue: 0,
        customers: 0,
        employees: 0,
        satisfaction: 0
      }
    });
  };

  // Open edit dialog
  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setFormData(location);
    setEditMode(true);
    setDialogOpen(true);
  };

  // DataGrid columns
  const columns = [
    { 
      field: 'name', 
      headerName: 'Location Name', 
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapPin size={16} />
          <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'address', 
      headerName: 'Address', 
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.address}, {params.row.city}, {params.row.state} {params.row.zipCode}
        </Typography>
      )
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'headquarters' ? 'primary' : 'default'}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'active' ? 'success' : 'warning'}
          icon={params.value === 'active' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        />
      )
    },
    { 
      field: 'employees', 
      headerName: 'Employees', 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Users size={14} />
          <Typography variant="body2">{params.row.metrics?.employees || 0}</Typography>
        </Box>
      )
    },
    { 
      field: 'revenue', 
      headerName: 'Revenue', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="primary">
          ${(params.row.metrics?.revenue || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEditLocation(params.row)}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteLocation(params.row.id)}>
            <Trash2 size={16} />
          </IconButton>
          <IconButton size="small">
            <MoreVertical size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || location.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [locations, searchTerm, filterStatus]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Location Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your business locations and facilities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setDialogOpen(true)}
          >
            Add Location
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Locations</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.total}</Typography>
                </Box>
                <Building size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.active}</Typography>
                </Box>
                <CheckCircle size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h4" fontWeight={600}>${statistics.revenue.toLocaleString()}</Typography>
                </Box>
                <DollarSign size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Employees</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.employees}</Typography>
                </Box>
                <Users size={24} color="#8B5CF6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Satisfaction</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.avgSatisfaction}%</Typography>
                </Box>
                <TrendingUp size={24} color="#EF4444" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Locations" />
          <Tab label="Performance" />
          <Tab label="Map View" />
          <Tab label="Operating Hours" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search locations..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* DataGrid */}
          <DataGrid
            rows={filteredLocations}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Revenue by Location</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                  <Bar dataKey="customers" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Location Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3, height: 500 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Map size={64} color="#9CA3AF" />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Map View Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive map with all your locations will be available here
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Operating Hours by Location</Typography>
          <List>
            {locations.map(location => (
              <ListItem key={location.id} divider>
                <ListItemIcon>
                  <Clock size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={location.name}
                  secondary={`Monday-Friday: ${location.operatingHours?.monday?.open || '9:00'} - ${location.operatingHours?.monday?.close || '18:00'}`}
                />
                <Chip 
                  label={location.status} 
                  size="small" 
                  color={location.status === 'active' ? 'success' : 'default'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Add/Edit Location Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Location' : 'Add New Location'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="office">Office</MenuItem>
                  <MenuItem value="warehouse">Warehouse</MenuItem>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="headquarters">Headquarters</MenuItem>
                  <MenuItem value="branch">Branch</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Globe size={16} /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  label="Timezone"
                >
                  <MenuItem value="PST">PST</MenuItem>
                  <MenuItem value="MST">MST</MenuItem>
                  <MenuItem value="CST">CST</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={editMode ? handleUpdateLocation : handleCreateLocation}
          >
            {editMode ? 'Update' : 'Create'} Location
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

export default Location;