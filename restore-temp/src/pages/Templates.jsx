// src/pages/Templates.jsx - Universal Template Management System
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Tabs, Tab, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip, Alert, Snackbar,
  Card, CardContent, FormControl, InputLabel, Select, MenuItem, IconButton,
  Stack, List, ListItem, ListItemText, Divider, Menu, ToggleButtonGroup,
  ToggleButton, Autocomplete, InputAdornment
} from '@mui/material';
import {
  FileText, Mail, MessageSquare, Send, Edit, Trash2, Copy, Eye,
  Plus, Save, Search, Filter, Star, Download, Upload, Code
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Templates = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'email', // email, sms, letter, dispute, contract
    category: 'general',
    subject: '', // For emails
    content: '',
    variables: [],
    tags: [],
    isPublic: false,
    isFavorite: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const templateTypes = {
    email: { icon: Mail, label: 'Email', color: '#3B82F6' },
    sms: { icon: MessageSquare, label: 'SMS', color: '#10B981' },
    letter: { icon: FileText, label: 'Letter', color: '#8B5CF6' },
    dispute: { icon: Send, label: 'Dispute', color: '#F59E0B' },
    contract: { icon: Code, label: 'Contract', color: '#EF4444' }
  };

  const categories = {
    general: 'General',
    onboarding: 'Onboarding',
    followup: 'Follow-up',
    reminder: 'Reminder',
    update: 'Status Update',
    dispute: 'Dispute',
    legal: 'Legal',
    billing: 'Billing',
    marketing: 'Marketing',
    support: 'Support'
  };

  const commonVariables = [
    '{{firstName}}',
    '{{lastName}}',
    '{{fullName}}',
    '{{email}}',
    '{{phone}}',
    '{{companyName}}',
    '{{date}}',
    '{{time}}',
    '{{amount}}',
    '{{dueDate}}',
    '{{accountNumber}}',
    '{{creditScore}}',
    '{{bureauName}}',
    '{{disputeReason}}',
    '{{link}}',
    '{{signature}}'
  ];

  // Predefined starter templates
  const starterTemplates = {
    email: [
      {
        name: 'Welcome Email',
        category: 'onboarding',
        subject: 'Welcome to {{companyName}}!',
        content: `<h2>Welcome aboard, {{firstName}}!</h2>
<p>We're thrilled to have you join our credit repair journey.</p>
<p>Here's what happens next:</p>
<ul>
  <li>We'll pull your credit reports within 24 hours</li>
  <li>You'll receive a detailed analysis within 3 business days</li>
  <li>Your dedicated specialist will contact you to discuss our strategy</li>
</ul>
<p>In the meantime, feel free to explore your dashboard and access our educational resources.</p>
<p>Best regards,<br>{{companyName}} Team</p>`,
        variables: ['firstName', 'companyName']
      },
      {
        name: 'Progress Update',
        category: 'update',
        subject: 'Great news about your credit score!',
        content: `<p>Hi {{firstName}},</p>
<p>We have some exciting news! Your credit score has improved by {{scoreIncrease}} points!</p>
<p><strong>Current Score: {{currentScore}}</strong></p>
<p>Here's what we accomplished this month:</p>
<ul>
  <li>{{deletedItems}} items successfully removed</li>
  <li>{{disputedItems}} new disputes filed</li>
  <li>{{verifiedItems}} items under review</li>
</ul>
<p>Keep up the great work!</p>`,
        variables: ['firstName', 'scoreIncrease', 'currentScore', 'deletedItems', 'disputedItems', 'verifiedItems']
      }
    ],
    sms: [
      {
        name: 'Payment Reminder',
        category: 'reminder',
        content: 'Hi {{firstName}}, your payment of ${{amount}} is due on {{dueDate}}. Pay now: {{link}} Reply STOP to opt out.',
        variables: ['firstName', 'amount', 'dueDate', 'link']
      },
      {
        name: 'Appointment Confirmation',
        category: 'reminder',
        content: 'Hi {{firstName}}, confirming your appointment on {{date}} at {{time}}. Reply C to confirm or R to reschedule.',
        variables: ['firstName', 'date', 'time']
      }
    ],
    dispute: [
      {
        name: 'Generic Dispute Letter',
        category: 'dispute',
        content: `{{date}}

{{bureauName}}
{{bureauAddress}}

RE: Dispute of Inaccurate Information
Account: {{accountNumber}}

Dear Sir/Madam,

I am writing to dispute the following information on my credit report:

Account Name: {{creditorName}}
Account Number: {{accountNumber}}
Reason for Dispute: {{disputeReason}}

{{disputeDetails}}

Under the Fair Credit Reporting Act, I request that you investigate this matter and remove or correct this inaccurate information within 30 days.

Please send me written confirmation of the results of your investigation.

Sincerely,
{{fullName}}
{{address}}`,
        variables: ['date', 'bureauName', 'bureauAddress', 'accountNumber', 'creditorName', 'disputeReason', 'disputeDetails', 'fullName', 'address']
      }
    ]
  };

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'templates'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templatesData = [];
      
      querySnapshot.forEach((doc) => {
        templatesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      showSnackbar('Error loading templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTemplates();
    }
  }, [currentUser]);

  // Create/Update template
  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      showSnackbar('Please enter template name and content', 'warning');
      return;
    }

    setLoading(true);
    try {
      const templateData = {
        ...templateForm,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      if (selectedTemplate?.id) {
        await updateDoc(doc(db, 'templates', selectedTemplate.id), templateData);
        showSnackbar('Template updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'templates'), {
          ...templateData,
          createdAt: serverTimestamp()
        });
        showSnackbar('Template created successfully', 'success');
      }

      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showSnackbar('Error saving template', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteDoc(doc(db, 'templates', templateId));
      showSnackbar('Template deleted', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showSnackbar('Error deleting template', 'error');
    }
  };

  // Duplicate template
  const handleDuplicate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };
      
      delete newTemplate.id;
      
      await addDoc(collection(db, 'templates'), newTemplate);
      showSnackbar('Template duplicated', 'success');
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      showSnackbar('Error duplicating template', 'error');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (template) => {
    try {
      await updateDoc(doc(db, 'templates', template.id), {
        isFavorite: !template.isFavorite,
        updatedAt: serverTimestamp()
      });
      loadTemplates();
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  // Load starter template
  const loadStarterTemplate = (starter) => {
    setTemplateForm({
      ...templateForm,
      ...starter,
      type: templateForm.type
    });
  };

  // Reset form
  const resetForm = () => {
    setTemplateForm({
      name: '',
      type: 'email',
      category: 'general',
      subject: '',
      content: '',
      variables: [],
      tags: [],
      isPublic: false,
      isFavorite: false
    });
    setSelectedTemplate(null);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    if (filterType !== 'all' && template.type !== filterType) return false;
    if (filterCategory !== 'all' && template.category !== filterCategory) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        template.name?.toLowerCase().includes(search) ||
        template.content?.toLowerCase().includes(search) ||
        template.subject?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage email, SMS, and document templates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Create Template
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {Object.entries(templateTypes).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.entries(categories).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredTemplates.length} templates
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => {
          const TypeIcon = templateTypes[template.type]?.icon || FileText;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TypeIcon size={20} color={templateTypes[template.type]?.color} />
                      <Typography variant="h6" noWrap>
                        {template.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFavorite(template)}
                    >
                      <Star 
                        size={18} 
                        fill={template.isFavorite ? '#F59E0B' : 'none'}
                        color={template.isFavorite ? '#F59E0B' : 'currentColor'}
                      />
                    </IconButton>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      label={templateTypes[template.type]?.label} 
                      size="small"
                      sx={{ backgroundColor: `${templateTypes[template.type]?.color}20` }}
                    />
                    <Chip label={categories[template.category]} size="small" variant="outlined" />
                  </Stack>

                  {template.subject && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Subject:</strong> {template.subject}
                    </Typography>
                  )}

                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {template.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </Typography>

                  {template.variables?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Variables: {template.variables.slice(0, 3).join(', ')}
                        {template.variables.length > 3 && ` +${template.variables.length - 3} more`}
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTemplateForm(template);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FileText size={48} color="#ccc" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first template to get started
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Template Name"
                required
                fullWidth
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  {Object.entries(templateTypes).map(([key, { label }]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.entries(categories).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {(templateForm.type === 'email') && (
              <Grid item xs={12}>
                <TextField
                  label="Subject Line"
                  fullWidth
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  helperText="Use {{variable}} for dynamic content"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Content {templateForm.type === 'email' ? '(HTML supported)' : ''}
              </Typography>
              
              {templateForm.type === 'email' ? (
                <ReactQuill
                  theme="snow"
                  value={templateForm.content}
                  onChange={(content) => setTemplateForm(prev => ({ ...prev, content }))}
                  style={{ height: 300, marginBottom: 50 }}
                />
              ) : (
                <TextField
                  multiline
                  rows={10}
                  fullWidth
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter template content..."
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Available Variables
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {commonVariables.map(variable => (
                  <Chip
                    key={variable}
                    label={variable}
                    size="small"
                    onClick={() => {
                      const newContent = templateForm.content + ' ' + variable;
                      setTemplateForm(prev => ({ ...prev, content: newContent }));
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {!selectedTemplate && starterTemplates[templateForm.type]?.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Start Templates
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {starterTemplates[templateForm.type].map((starter, index) => (
                      <Button
                        key={index}
                        size="small"
                        variant="outlined"
                        onClick={() => loadStarterTemplate(starter)}
                      >
                        {starter.name}
                      </Button>
                    ))}
                  </Stack>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate} disabled={loading}>
            {selectedTemplate ? 'Update' : 'Create'} Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Template Preview
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.name}
              </Typography>
              
              {selectedTemplate.subject && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Subject:</strong> {selectedTemplate.subject}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {selectedTemplate.type === 'email' ? (
                <Box dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTemplate.content}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
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

export default Templates;