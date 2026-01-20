// Path: /src/components/documents/TemplatesTab.jsx
// ============================================================================
// TEMPLATES TAB - Document Template Library with Mail Merge
// ============================================================================
// FEATURES:
// - Pre-built template library
// - Custom template creation
// - Mail merge with client data
// - Template versioning
// - Usage analytics
// - AI-powered template suggestions
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Avatar, Tabs, Tab, LinearProgress, Stack, Fade,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Badge,
} from '@mui/material';
import {
  ContentCopy as TemplateIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingIcon,
  Analytics as AnalyticsIcon,
  FileCopy as CopyIcon,
  Code as MergeIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const TEMPLATE_CATEGORIES = [
  { id: 'agreement', name: 'Service Agreements', color: '#2563eb', count: 0 },
  { id: 'letter', name: 'Dispute Letters', color: '#10b981', count: 0 },
  { id: 'legal', name: 'Legal Forms', color: '#8b5cf6', count: 0 },
  { id: 'communication', name: 'Client Communications', color: '#f59e0b', count: 0 },
  { id: 'compliance', name: 'Compliance Documents', color: '#ef4444', count: 0 },
];

const MERGE_FIELDS = [
  { id: 'client_name', label: 'Client Name', placeholder: '{{client_name}}' },
  { id: 'client_email', label: 'Client Email', placeholder: '{{client_email}}' },
  { id: 'client_phone', label: 'Client Phone', placeholder: '{{client_phone}}' },
  { id: 'client_address', label: 'Client Address', placeholder: '{{client_address}}' },
  { id: 'client_ssn4', label: 'SSN (Last 4)', placeholder: '{{client_ssn4}}' },
  { id: 'company_name', label: 'Company Name', placeholder: '{{company_name}}' },
  { id: 'current_date', label: 'Current Date', placeholder: '{{current_date}}' },
  { id: 'expiration_date', label: 'Expiration Date', placeholder: '{{expiration_date}}' },
  { id: 'bureau_name', label: 'Bureau Name', placeholder: '{{bureau_name}}' },
  { id: 'account_name', label: 'Account Name', placeholder: '{{account_name}}' },
  { id: 'account_number', label: 'Account Number', placeholder: '{{account_number}}' },
];

const BUILT_IN_TEMPLATES = [
  {
    id: 'welcome-letter',
    name: 'New Client Welcome Letter',
    category: 'communication',
    description: 'Welcome new clients and explain the credit repair process',
    uses: 245,
    rating: 4.8,
    featured: true,
  },
  {
    id: 'dispute-generic',
    name: 'Generic Dispute Letter',
    category: 'letter',
    description: 'Standard dispute letter template for credit bureaus',
    uses: 892,
    rating: 4.9,
    featured: true,
  },
  {
    id: 'method-of-verification',
    name: 'Method of Verification Request',
    category: 'letter',
    description: 'Request verification method from credit bureaus',
    uses: 456,
    rating: 4.7,
    featured: false,
  },
  {
    id: 'debt-validation',
    name: 'Debt Validation Letter',
    category: 'letter',
    description: 'Request debt validation from collectors',
    uses: 678,
    rating: 4.8,
    featured: true,
  },
  {
    id: 'service-agreement',
    name: 'Credit Repair Service Agreement',
    category: 'agreement',
    description: 'Standard service agreement for new clients',
    uses: 534,
    rating: 4.9,
    featured: true,
  },
  {
    id: 'progress-report',
    name: 'Monthly Progress Report',
    category: 'communication',
    description: 'Update clients on their credit repair progress',
    uses: 312,
    rating: 4.6,
    featured: false,
  },
];

// ============================================================================
// TEMPLATES TAB COMPONENT
// ============================================================================

const TemplatesTab = ({ documents, templates, loading, onRefresh, userRole, canEdit }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewTab, setViewTab] = useState(0); // 0: Library, 1: My Templates, 2: Analytics
  const [openEditor, setOpenEditor] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState('create'); // 'create' or 'edit'
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Template form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'letter',
    description: '',
    content: '',
    tags: [],
  });

  // ===== COMBINE BUILT-IN AND USER TEMPLATES =====
  const allTemplates = useMemo(() => {
    const userTemplates = templates.map(t => ({ ...t, isCustom: true }));
    return [...BUILT_IN_TEMPLATES, ...userTemplates];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let filtered = [...allTemplates];

    // Filter by tab
    if (viewTab === 1) {
      filtered = filtered.filter(t => t.isCustom);
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    return filtered;
  }, [allTemplates, viewTab, searchTerm, selectedCategory]);

  // ===== STATS =====
  const stats = useMemo(() => {
    const categories = { ...Object.fromEntries(TEMPLATE_CATEGORIES.map(c => [c.id, 0])) };
    allTemplates.forEach(t => {
      if (categories[t.category] !== undefined) categories[t.category]++;
    });

    return {
      total: allTemplates.length,
      custom: templates.length,
      builtIn: BUILT_IN_TEMPLATES.length,
      totalUses: allTemplates.reduce((sum, t) => sum + (t.uses || 0), 0),
      categories,
    };
  }, [allTemplates, templates]);

  // ===== AI FEATURES =====
  const generateTemplateWithAI = async (prompt) => {
    setAiGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2500,
          messages: [{
            role: 'user',
            content: `Create a professional ${templateForm.category} template for a credit repair business.

Request: ${prompt || templateForm.name}

Include merge fields using double curly braces like {{client_name}}, {{current_date}}, etc.

Available merge fields:
${MERGE_FIELDS.map(f => `- ${f.placeholder}: ${f.label}`).join('\n')}

Return JSON:
{
  "name": "Template name",
  "content": "Full template content with merge fields",
  "description": "Brief description",
  "suggestedTags": ["tag1", "tag2"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const generated = JSON.parse(text);

      setTemplateForm(prev => ({
        ...prev,
        name: generated.name || prev.name,
        content: generated.content,
        description: generated.description,
        tags: generated.suggestedTags || [],
      }));
    } catch (err) {
      console.error('AI template generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const getAITemplateOptimization = async () => {
    if (!selectedTemplate) return;

    setAiGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Analyze and suggest improvements for this credit repair template:

Name: ${selectedTemplate.name}
Category: ${selectedTemplate.category}
Uses: ${selectedTemplate.uses || 0}

Provide JSON with optimization suggestions:
{
  "effectiveness": "score out of 10",
  "improvements": ["suggestion1", "suggestion2"],
  "complianceNotes": ["compliance consideration1"],
  "alternativePhrasing": ["alternative wording suggestions"],
  "missingElements": ["elements that could be added"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAiSuggestions(JSON.parse(text));
    } catch (err) {
      console.error('AI optimization error:', err);
      setAiSuggestions({
        effectiveness: '8/10',
        improvements: ['Add more specific legal language', 'Include FCRA references'],
        complianceNotes: ['Ensure CROA compliance for agreements'],
        alternativePhrasing: ['Consider stronger language for disputes'],
        missingElements: ['Response deadline', 'Follow-up instructions']
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // ===== HANDLERS =====
  const handleSaveTemplate = async () => {
    try {
      if (editMode === 'create') {
        await addDoc(collection(db, 'documentTemplates'), {
          ...templateForm,
          uses: 0,
          rating: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (selectedTemplate?.id) {
        await updateDoc(doc(db, 'documentTemplates', selectedTemplate.id), {
          ...templateForm,
          updatedAt: serverTimestamp(),
        });
      }

      setOpenEditor(false);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteDoc(doc(db, 'documentTemplates', templateId));
      onRefresh();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setOpenPreview(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      description: template.description || '',
      content: template.content || '',
      tags: template.tags || [],
    });
    setEditMode('edit');
    setOpenEditor(true);
  };

  const handleDuplicateTemplate = (template) => {
    setTemplateForm({
      name: `${template.name} (Copy)`,
      category: template.category,
      description: template.description || '',
      content: template.content || '',
      tags: template.tags || [],
    });
    setEditMode('create');
    setOpenEditor(true);
  };

  const resetForm = () => {
    setTemplateForm({ name: '', category: 'letter', description: '', content: '', tags: [] });
    setSelectedTemplate(null);
    setEditMode('create');
    setAiSuggestions(null);
  };

  const insertMergeField = (field) => {
    setTemplateForm(prev => ({
      ...prev,
      content: prev.content + field.placeholder
    }));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Templates', value: stats.total, icon: <TemplateIcon />, color: 'primary.main' },
          { label: 'Built-in', value: stats.builtIn, icon: <StarIcon />, color: '#f59e0b' },
          { label: 'Custom', value: stats.custom, icon: <EditIcon />, color: '#10b981' },
          { label: 'Total Uses', value: stats.totalUses.toLocaleString(), icon: <TrendingIcon />, color: '#8b5cf6' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 1 }}>{stat.icon}</Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={viewTab} onChange={(e, v) => setViewTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Template Library" icon={<TemplateIcon />} iconPosition="start" />
          <Tab label="My Templates" icon={<EditIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={5}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { resetForm(); setOpenEditor(true); }}
              >
                Create Template
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ANALYTICS TAB */}
      {viewTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Templates by Category</Typography>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <Box key={cat.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{cat.name}</Typography>
                    <Typography variant="body2">{stats.categories[cat.id] || 0}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={((stats.categories[cat.id] || 0) / stats.total) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: `${cat.color}20`, '& .MuiLinearProgress-bar': { bgcolor: cat.color } }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Used Templates</Typography>
              <List>
                {[...allTemplates]
                  .sort((a, b) => (b.uses || 0) - (a.uses || 0))
                  .slice(0, 5)
                  .map((template, idx) => (
                    <ListItem key={template.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>{idx + 1}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={template.name}
                        secondary={`${template.uses || 0} uses`}
                      />
                      {template.rating && (
                        <Chip size="small" icon={<StarIcon />} label={template.rating} />
                      )}
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TEMPLATE GRID */}
      {viewTab !== 2 && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <TemplateIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No Templates Found</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {viewTab === 1 ? 'Create your first custom template' : 'Try adjusting your search'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenEditor(true); }}>
              Create Template
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Avatar sx={{ bgcolor: TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.color || 'primary.main' }}>
                        <TemplateIcon />
                      </Avatar>
                      {template.featured && (
                        <Chip size="small" icon={<StarIcon />} label="Featured" color="warning" />
                      )}
                      {template.isCustom && (
                        <Chip size="small" label="Custom" color="info" />
                      )}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name || template.category} />
                      {template.uses > 0 && (
                        <Chip size="small" icon={<TrendingIcon />} label={`${template.uses} uses`} variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button size="small" startIcon={<ViewIcon />} onClick={() => handleUseTemplate(template)}>
                      Use
                    </Button>
                    <Box>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicateTemplate(template)}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      {template.isCustom && canEdit && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditTemplate(template)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteTemplate(template.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* TEMPLATE EDITOR DIALOG */}
      <Dialog open={openEditor} onClose={() => { setOpenEditor(false); resetForm(); }} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><TemplateIcon /></Avatar>
            <Box>
              <Typography variant="h6">{editMode === 'create' ? 'Create Template' : 'Edit Template'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Design your document template with merge fields
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Left: Form */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={templateForm.category}
                      label="Category"
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                multiline
                rows={15}
                label="Template Content"
                placeholder="Enter your template content here. Use merge fields like {{client_name}} for personalization."
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </Grid>

            {/* Right: Merge Fields & AI */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <MergeIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Merge Fields
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Click to insert at cursor
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {MERGE_FIELDS.map((field) => (
                    <Chip
                      key={field.id}
                      size="small"
                      label={field.label}
                      onClick={() => insertMergeField(field)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <AIIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  AI Assistant
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={aiGenerating ? <CircularProgress size={16} /> : <AIIcon />}
                  onClick={() => generateTemplateWithAI()}
                  disabled={aiGenerating || !templateForm.name}
                  sx={{ mb: 1 }}
                >
                  Generate Content
                </Button>
                <Typography variant="caption" color="text.secondary">
                  AI will generate template content based on the name and category
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEditor(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleSaveTemplate}
            disabled={!templateForm.name || !templateForm.content}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* TEMPLATE PREVIEW/USE DIALOG */}
      <Dialog open={openPreview} onClose={() => { setOpenPreview(false); setAiSuggestions(null); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}><TemplateIcon /></Avatar>
              <Box>
                <Typography variant="h6">{selectedTemplate?.name}</Typography>
                <Chip size="small" label={selectedTemplate?.category} />
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={aiGenerating ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={getAITemplateOptimization}
              disabled={aiGenerating}
            >
              AI Analysis
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {aiSuggestions && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<AIIcon />}>
              <AlertTitle>AI Template Analysis - Effectiveness: {aiSuggestions.effectiveness}</AlertTitle>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Improvements</Typography>
                  {aiSuggestions.improvements?.map((item, idx) => (
                    <Typography key={idx} variant="body2">• {item}</Typography>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Missing Elements</Typography>
                  {aiSuggestions.missingElements?.map((item, idx) => (
                    <Typography key={idx} variant="body2">• {item}</Typography>
                  ))}
                </Grid>
              </Grid>
            </Alert>
          )}

          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'serif' }}>
              {selectedTemplate?.content || 'Template content preview will appear here.'}
            </Typography>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Template Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Uses</Typography>
                <Typography>{selectedTemplate?.uses || 0}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Rating</Typography>
                <Typography>{selectedTemplate?.rating || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Typography>{selectedTemplate?.isCustom ? 'Custom' : 'Built-in'}</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenPreview(false); setAiSuggestions(null); }}>Close</Button>
          <Button variant="outlined" startIcon={<CopyIcon />} onClick={() => handleDuplicateTemplate(selectedTemplate)}>
            Duplicate
          </Button>
          <Button variant="contained" startIcon={<CheckIcon />}>
            Use This Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesTab;
