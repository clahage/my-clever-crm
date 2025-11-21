// ===================================================================
// TemplateEditor.jsx
// Path: /src/components/resources/TemplateEditor.jsx
// 
// Template Editor Component
// Rich text editor for creating and editing document templates
// 
// Features:
// - Rich text editing
// - Variable insertion
// - Template preview
// - AI content generation
// - Save and export
// - Template versioning
// 
// Created: November 10, 2025
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Save,
  X,
  Eye,
  Sparkles,
  Copy,
  Download,
  Plus,
  Code,
  Type,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

const TemplateEditor = ({
  open,
  onClose,
  template = null,
  onSave,
  currentUser,
  userProfile,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState([]);
  const [activeTab, setActiveTab] = useState('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Template categories
  const categories = [
    'Dispute Letters',
    'Client Contracts',
    'Email Templates',
    'SMS Templates',
    'Forms',
    'Reports',
    'Agreements',
    'Notices',
  ];

  // Common variables
  const commonVariables = [
    { name: 'Client Name', value: '{{clientName}}' },
    { name: 'Client First Name', value: '{{clientFirstName}}' },
    { name: 'Client Last Name', value: '{{clientLastName}}' },
    { name: 'Client Email', value: '{{clientEmail}}' },
    { name: 'Client Phone', value: '{{clientPhone}}' },
    { name: 'Client Address', value: '{{clientAddress}}' },
    { name: 'Company Name', value: '{{companyName}}' },
    { name: 'Today\'s Date', value: '{{todayDate}}' },
    { name: 'Account Number', value: '{{accountNumber}}' },
    { name: 'Bureau Name', value: '{{bureauName}}' },
    { name: 'Dispute Reason', value: '{{disputeReason}}' },
    { name: 'Item Description', value: '{{itemDescription}}' },
  ];

  useEffect(() => {
    if (template) {
      setTitle(template.title || '');
      setCategory(template.category || '');
      setDescription(template.description || '');
      setContent(template.content || '');
      setVariables(template.variables || []);
    }
  }, [template]);

  const handleInsertVariable = (variable) => {
    // Insert at cursor position
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + variable.value + content.substring(end);
    setContent(newContent);

    // Track used variables
    if (!variables.includes(variable.value)) {
      setVariables([...variables, variable.value]);
    }
  };

  const handleAIGenerate = async () => {
    try {
      setAiGenerating(true);

      // In production, call OpenAI API with prompt
      const prompt = `Generate a professional ${category} template for credit repair business`;
      
      // Mock AI generation
      const generatedContent = `Dear {{clientName}},

Thank you for choosing our credit repair services. This letter confirms our agreement to help you improve your credit profile.

[AI-generated content would appear here in production]

We will work diligently to:
- Review your credit reports from all three bureaus
- Identify inaccurate or outdated information
- Prepare and submit dispute letters on your behalf
- Track progress and provide regular updates

If you have any questions, please don't hesitate to contact us at {{companyPhone}}.

Sincerely,
{{companyName}}
{{todayDate}}`;

      setContent(generatedContent);
      
      // Extract variables used
      const usedVars = generatedContent.match(/\{\{[^}]+\}\}/g) || [];
      setVariables(usedVars);

    } catch (error) {
      console.error('Error generating template:', error);
      setError('Failed to generate template with AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!title || !category || !content) {
        setError('Please fill in all required fields');
        return;
      }

      setSaving(true);
      setError(null);

      const templateData = {
        title,
        category,
        description,
        content,
        variables,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByName: userProfile?.displayName || currentUser.email,
      };

      if (template?.id) {
        // Update existing template
        await updateDoc(doc(db, 'templates', template.id), templateData);
      } else {
        // Create new template
        await addDoc(collection(db, 'templates'), {
          ...templateData,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
          createdByName: userProfile?.displayName || currentUser.email,
          uses: 0,
          favorites: 0,
          rating: 0,
          ratingCount: 0,
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  const renderPreview = () => {
    let previewContent = content;
    
    // Replace variables with sample data for preview
    const sampleData = {
      '{{clientName}}': 'John Doe',
      '{{clientFirstName}}': 'John',
      '{{clientLastName}}': 'Doe',
      '{{clientEmail}}': 'john.doe@example.com',
      '{{clientPhone}}': '(555) 123-4567',
      '{{clientAddress}}': '123 Main St, City, ST 12345',
      '{{companyName}}': 'Speedy Credit Repair',
      '{{todayDate}}': new Date().toLocaleDateString(),
      '{{accountNumber}}': '****1234',
      '{{bureauName}}': 'Experian',
      '{{disputeReason}}': 'This account is not mine',
      '{{itemDescription}}': 'Credit card account',
    };

    Object.entries(sampleData).forEach(([variable, value]) => {
      previewContent = previewContent.replace(new RegExp(variable, 'g'), value);
    });

    return (
      <Paper className="p-6 bg-white" elevation={0}>
        <Typography
          component="div"
          style={{ whiteSpace: 'pre-wrap', fontFamily: 'Times New Roman, serif' }}
        >
          {previewContent}
        </Typography>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h6">
            {template ? 'Edit Template' : 'Create New Template'}
          </Typography>
          <IconButton onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Basic Info */}
        <Grid container spacing={2} className="mb-4">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Template Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Credit Bureau Dispute Letter"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template's purpose"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Edit" value="edit" icon={<Type className="w-4 h-4" />} iconPosition="start" />
          <Tab label="Preview" value="preview" icon={<Eye className="w-4 h-4" />} iconPosition="start" />
          <Tab label="Variables" value="variables" icon={<Code className="w-4 h-4" />} iconPosition="start" />
        </Tabs>

        <Divider className="my-4" />

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <Box>
            {/* AI Generate Button */}
            <Box className="flex justify-between items-center mb-3">
              <Typography variant="body2" color="textSecondary">
                Content supports variables like {'{{clientName}}'}, {'{{todayDate}}'}, etc.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={aiGenerating ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                onClick={handleAIGenerate}
                disabled={aiGenerating || !category}
              >
                {aiGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
            </Box>

            {/* Content Editor */}
            <TextField
              id="template-content"
              fullWidth
              multiline
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter template content here. Use {{variableName}} for dynamic fields."
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                },
              }}
            />

            {/* Variables Used */}
            {variables.length > 0 && (
              <Box className="mt-3">
                <Typography variant="body2" className="mb-2">
                  Variables used in this template:
                </Typography>
                <Box className="flex flex-wrap gap-1">
                  {variables.map((variable, index) => (
                    <Chip key={index} label={variable} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <Box>
            <Alert severity="info" className="mb-4">
              Preview with sample data. Variables will be replaced with actual data when used.
            </Alert>
            {renderPreview()}
          </Box>
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <Box>
            <Typography variant="body2" color="textSecondary" className="mb-3">
              Click any variable to insert it into your template
            </Typography>
            <List>
              {commonVariables.map((variable, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleInsertVariable(variable)}>
                    <ListItemText
                      primary={variable.name}
                      secondary={variable.value}
                    />
                    <IconButton size="small">
                      <Plus className="w-4 h-4" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={handlePreview}
          startIcon={<Eye className="w-4 h-4" />}
        >
          Preview
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !title || !category || !content}
          startIcon={saving ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
        >
          {saving ? 'Saving...' : template ? 'Update' : 'Create'} Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateEditor;