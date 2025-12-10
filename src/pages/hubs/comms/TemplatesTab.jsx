// Path: /src/pages/hubs/comms/TemplatesTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - TEMPLATES TAB
// ============================================================================
// Purpose: Email and SMS templates with categories and variables
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  FileText,
  Mail,
  MessageSquare,
  Eye,
  Copy
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const TEMPLATE_CATEGORIES = [
  { value: 'welcome', label: 'Welcome & Onboarding' },
  { value: 'follow-up', label: 'Follow-ups' },
  { value: 'promotion', label: 'Promotions' },
  { value: 'notification', label: 'Notifications' },
  { value: 'reminder', label: 'Reminders' },
  { value: 'newsletter', label: 'Newsletters' }
];

const MERGE_VARIABLES = [
  '{{firstName}}',
  '{{lastName}}',
  '{{email}}',
  '{{phone}}',
  '{{companyName}}',
  '{{date}}'
];

const TemplatesTab = () => {
  const { userProfile } = useAuth();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'welcome',
    type: 'email',
    subject: '',
    body: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Subscribe to templates
  useEffect(() => {
    const emailQuery = query(collection(db, 'emailTemplates'), orderBy('createdAt', 'desc'));
    const smsQuery = query(collection(db, 'smsTemplates'), orderBy('createdAt', 'desc'));

    const unsubscribeEmail = onSnapshot(emailQuery, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'email',
        ...doc.data()
      }));
      setEmailTemplates(templatesData);
    });

    const unsubscribeSMS = onSnapshot(smsQuery, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'sms',
        ...doc.data()
      }));
      setSmsTemplates(templatesData);
      setLoading(false);
    });

    return () => {
      unsubscribeEmail();
      unsubscribeSMS();
    };
  }, []);

  // Combined and filtered templates
  const allTemplates = useMemo(() => {
    return [...emailTemplates, ...smsTemplates];
  }, [emailTemplates, smsTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      const matchesSearch =
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.body?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      const matchesType = typeFilter === 'all' || template.type === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allTemplates, searchTerm, categoryFilter, typeFilter]);

  const handleMenuOpen = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setFormData({ name: '', category: 'welcome', type: 'email', subject: '', body: '' });
    setDialogOpen(true);
  };

  const handleEditTemplate = () => {
    setFormData({
      name: selectedTemplate.name || '',
      category: selectedTemplate.category || 'welcome',
      type: selectedTemplate.type || 'email',
      subject: selectedTemplate.subject || '',
      body: selectedTemplate.body || ''
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteTemplate = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      const collectionName = selectedTemplate.type === 'email' ? 'emailTemplates' : 'smsTemplates';
      await deleteDoc(doc(db, collectionName, selectedTemplate.id));
      setSnackbar({ open: true, message: 'Template deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbar({ open: true, message: 'Error deleting template', severity: 'error' });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const collectionName = formData.type === 'email' ? 'emailTemplates' : 'smsTemplates';

      if (selectedTemplate?.id) {
        // Update existing template
        await updateDoc(doc(db, collectionName, selectedTemplate.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Template updated successfully', severity: 'success' });
      } else {
        // Add new template
        await addDoc(collection(db, collectionName), {
          ...formData,
          usageCount: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Template created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({ open: true, message: 'Error saving template', severity: 'error' });
    }
  };

  const insertVariable = (variable) => {
    setFormData({ ...formData, body: formData.body + variable });
  };

  return (
    <Box>
      {/* Header Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search templates..."
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
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleCreateTemplate}
              >
                Create Template
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                    ? 'No templates match your filters'
                    : 'No templates yet. Click "Create Template" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        <Chip
                          icon={template.type === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                          label={template.type}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, template)}>
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>

                  {template.type === 'email' && template.subject && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Subject:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {template.subject}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Preview:
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {template.body?.substring(0, 100)}...
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Used: {template.usageCount || 0} times
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Merge Variables Reference */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Merge Variables
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {MERGE_VARIABLES.map((variable) => (
            <Chip
              key={variable}
              label={variable}
              size="small"
              icon={<Code size={14} />}
              onClick={() => insertVariable(variable)}
            />
          ))}
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={handleEditTemplate}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Copy size={16} style={{ marginRight: 8 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDeleteTemplate} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                  disabled={!!selectedTemplate}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.type === 'email' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message Body"
                multiline
                rows={8}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
                helperText="Use merge variables like {{firstName}}, {{lastName}}, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            {selectedTemplate ? 'Update' : 'Create'} Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this template? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
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

const Code = ({ size }) => <FileText size={size} />;

export default TemplatesTab;
