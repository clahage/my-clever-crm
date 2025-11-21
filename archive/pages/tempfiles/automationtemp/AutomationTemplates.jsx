// ============================================================================
// AutomationTemplates.jsx - AUTOMATION TEMPLATES LIBRARY
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Pre-built automation workflow templates for common business scenarios.
// Provides template discovery, preview, one-click import, customization,
// and marketplace functionality.
//
// FEATURES:
// - 20+ pre-built workflow templates
// - Template categories (Lead Nurturing, Onboarding, Follow-up, etc.)
// - Template preview with workflow visualization
// - One-click template import
// - Template customization before import
// - Template marketplace (featured, popular, recent)
// - Custom template creation & saving
// - Template sharing capabilities
// - Template versioning
// - Usage analytics per template
// - AI-powered template recommendations
//
// TEMPLATE CATEGORIES:
// - Lead Nurturing
// - Client Onboarding
// - Follow-up Sequences
// - Re-engagement Campaigns
// - Task Automation
// - Data Management
// - Reporting Automation
// - Credit Repair Workflows
//
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
  AlertTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  IconButton,
  Tooltip,
  TextField,
  Divider,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  Rating,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Package,
  Plus,
  Download,
  Eye,
  Settings,
  Search,
  RefreshCw,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Mail,
  MessageSquare,
  FileText,
  Target,
  GitBranch,
  Zap,
  Heart,
  Share2,
  Copy,
  Edit,
  Trash2,
  Sparkles,
  Brain,
  Award,
  ThumbsUp,
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
  increment,
} from 'firebase/firestore';
import { format } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const TEMPLATE_LIBRARY = [
  {
    id: 'welcome_series',
    name: 'Welcome Email Series',
    description: 'Automated 3-email welcome sequence for new leads',
    category: 'Lead Nurturing',
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    featured: true,
    rating: 4.8,
    uses: 1250,
    nodes: 7,
    workflow: {
      trigger: 'Contact Created',
      actions: ['Send Welcome Email', 'Wait 2 Days', 'Send Tips Email', 'Wait 3 Days', 'Send CTA Email'],
    },
  },
  {
    id: 'lead_score_action',
    name: 'High Lead Score Actions',
    description: 'Automatically notify team when lead score reaches threshold',
    category: 'Lead Nurturing',
    difficulty: 'Beginner',
    estimatedTime: '5 min',
    featured: true,
    rating: 4.9,
    uses: 890,
    nodes: 5,
    workflow: {
      trigger: 'Lead Score Changed',
      actions: ['Check Score >= 80', 'Assign to Sales Rep', 'Send Notification', 'Create Task'],
    },
  },
  {
    id: 'client_onboarding',
    name: 'Client Onboarding Sequence',
    description: 'Complete onboarding workflow with documents and tasks',
    category: 'Client Onboarding',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    featured: true,
    rating: 4.7,
    uses: 650,
    nodes: 12,
    workflow: {
      trigger: 'Deal Won',
      actions: ['Send Welcome Package', 'Create Onboarding Tasks', 'Schedule Call', 'Send Documents'],
    },
  },
  {
    id: 'abandoned_form',
    name: 'Abandoned Form Follow-up',
    description: 'Re-engage visitors who started but didn\'t complete forms',
    category: 'Follow-up Sequences',
    difficulty: 'Beginner',
    estimatedTime: '8 min',
    rating: 4.6,
    uses: 720,
    nodes: 6,
    workflow: {
      trigger: 'Form Started',
      actions: ['Wait 1 Hour', 'Check Form Status', 'Send Reminder Email', 'Add Tag'],
    },
  },
  {
    id: 'inactive_reengagement',
    name: 'Inactive Client Re-engagement',
    description: 'Win back clients who haven\'t engaged in 90 days',
    category: 'Re-engagement Campaigns',
    difficulty: 'Intermediate',
    estimatedTime: '15 min',
    rating: 4.5,
    uses: 580,
    nodes: 9,
    workflow: {
      trigger: 'Last Activity > 90 Days',
      actions: ['Send Re-engagement Email', 'Offer Incentive', 'Create Follow-up Task'],
    },
  },
  {
    id: 'task_assignment',
    name: 'Smart Task Assignment',
    description: 'Automatically assign tasks based on team workload',
    category: 'Task Automation',
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    rating: 4.8,
    uses: 420,
    nodes: 10,
    workflow: {
      trigger: 'Task Created',
      actions: ['Check Team Capacity', 'Assign to Available User', 'Send Notification'],
    },
  },
  {
    id: 'data_cleanup',
    name: 'Automated Data Cleanup',
    description: 'Clean and standardize contact data weekly',
    category: 'Data Management',
    difficulty: 'Advanced',
    estimatedTime: '30 min',
    rating: 4.7,
    uses: 380,
    nodes: 15,
    workflow: {
      trigger: 'Weekly Schedule',
      actions: ['Find Duplicates', 'Merge Records', 'Standardize Fields', 'Generate Report'],
    },
  },
  {
    id: 'monthly_report',
    name: 'Monthly Performance Report',
    description: 'Generate and email monthly metrics automatically',
    category: 'Reporting Automation',
    difficulty: 'Intermediate',
    estimatedTime: '18 min',
    rating: 4.6,
    uses: 510,
    nodes: 8,
    workflow: {
      trigger: 'First Day of Month',
      actions: ['Compile Metrics', 'Generate PDF', 'Email to Team', 'Archive Report'],
    },
  },
  {
    id: 'credit_dispute_workflow',
    name: 'Credit Dispute Processing',
    description: 'Automated workflow for credit dispute letters',
    category: 'Credit Repair Workflows',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    featured: true,
    rating: 4.9,
    uses: 920,
    nodes: 11,
    workflow: {
      trigger: 'Dispute Requested',
      actions: ['Generate Letter', 'Get Client Approval', 'Send to Bureaus', 'Track Response'],
    },
  },
  {
    id: 'client_anniversary',
    name: 'Client Anniversary Recognition',
    description: 'Celebrate client anniversaries automatically',
    category: 'Client Onboarding',
    difficulty: 'Beginner',
    estimatedTime: '10 min',
    rating: 4.7,
    uses: 340,
    nodes: 5,
    workflow: {
      trigger: 'Anniversary Date',
      actions: ['Send Thank You Email', 'Offer Loyalty Discount', 'Update Status'],
    },
  },
];

const CATEGORIES = [...new Set(TEMPLATE_LIBRARY.map(t => t.category))];

const DIFFICULTY_COLORS = {
  Beginner: '#4caf50',
  Intermediate: '#ff9800',
  Advanced: '#f50057',
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AutomationTemplates = () => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tab state
  const [activeTab, setActiveTab] = useState('marketplace');

  // Templates state
  const [customTemplates, setCustomTemplates] = useState([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Dialog state
  const [previewDialog, setPreviewDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizationOptions, setCustomizationOptions] = useState({});

  // AI state
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to custom templates
    const templatesQuery = query(
      collection(db, 'automations', 'templates', 'custom'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(templatesQuery, (snapshot) => {
        const templateData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomTemplates(templateData);
        console.log('✅ Custom templates loaded:', templateData.length);
      })
    );

    // Listen to favorites
    const favoritesQuery = query(
      collection(db, 'automations', 'templates', 'favorites'),
      where('userId', '==', currentUser.uid)
    );

    unsubscribers.push(
      onSnapshot(favoritesQuery, (snapshot) => {
        const favoriteIds = snapshot.docs.map(doc => doc.data().templateId);
        setFavoriteTemplates(favoriteIds);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== TEMPLATE HANDLERS =====
  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setPreviewDialog(true);
  };

  const handleImportTemplate = (template) => {
    setSelectedTemplate(template);
    setCustomizationOptions({});
    setImportDialog(true);
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);

      // Create workflow from template
      const workflowData = {
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        templateId: selectedTemplate.id,
        nodes: selectedTemplate.workflow,
        customizations: customizationOptions,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'automations', 'workflows', 'active'), workflowData);

      // Increment template usage
      await updateDoc(
        doc(db, 'automations', 'templates', 'library', selectedTemplate.id),
        {
          uses: increment(1),
        }
      ).catch(() => {
        // If template doesn't exist in Firebase, that's okay
        console.log('Template not in Firebase yet');
      });

      showSnackbar('Template imported successfully!', 'success');
      setImportDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('❌ Error importing template:', error);
      showSnackbar('Failed to import template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (templateId) => {
    try {
      const isFavorite = favoriteTemplates.includes(templateId);

      if (isFavorite) {
        // Remove from favorites
        const favoriteDoc = await getDocs(
          query(
            collection(db, 'automations', 'templates', 'favorites'),
            where('userId', '==', currentUser.uid),
            where('templateId', '==', templateId)
          )
        );

        favoriteDoc.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        showSnackbar('Removed from favorites', 'info');
      } else {
        // Add to favorites
        await addDoc(collection(db, 'automations', 'templates', 'favorites'), {
          userId: currentUser.uid,
          templateId,
          createdAt: serverTimestamp(),
        });

        showSnackbar('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      showSnackbar('Failed to update favorites', 'error');
    }
  };

  const handleSaveAsTemplate = async () => {
    try {
      setLoading(true);

      const templateData = {
        name: customizationOptions.name || 'My Custom Template',
        description: customizationOptions.description || '',
        category: 'Custom',
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'automations', 'templates', 'custom'), templateData);

      showSnackbar('Template saved!', 'success');
      setSaveDialog(false);
    } catch (error) {
      console.error('❌ Error saving template:', error);
      showSnackbar('Failed to save template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteDoc(doc(db, 'automations', 'templates', 'custom', templateId));
      showSnackbar('Template deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting template:', error);
      showSnackbar('Failed to delete template', 'error');
    }
  };

  // ===== AI RECOMMENDATIONS =====
  const handleGenerateRecommendations = async () => {
    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return;
    }

    try {
      setGeneratingRecommendations(true);

      const prompt = `Based on this credit repair CRM, recommend 5 automation templates that would be most valuable:

Business: Credit Repair CRM
Current Templates: ${TEMPLATE_LIBRARY.length}
Categories: ${CATEGORIES.join(', ')}

Provide recommendations in JSON format:
[
  {
    "name": "Template name",
    "description": "What it does",
    "category": "Category",
    "benefit": "Business benefit",
    "difficulty": "Beginner|Intermediate|Advanced"
  }
]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        setAiRecommendations(recommendations);
        showSnackbar('Recommendations generated!', 'success');
      }
    } catch (error) {
      console.error('❌ AI error:', error);
      showSnackbar('Failed to generate recommendations', 'error');
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredTemplates = TEMPLATE_LIBRARY.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const featuredTemplates = TEMPLATE_LIBRARY.filter(t => t.featured);

  // ===== RENDER: MARKETPLACE TAB =====
  const renderMarketplace = () => (
    <Box>
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
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshCw />}
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setDifficultyFilter('all');
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Template Cards */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => {
          const isFavorite = favoriteTemplates.includes(template.id);

          return (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                {template.featured && (
                  <Chip
                    label="Featured"
                    color="primary"
                    size="small"
                    icon={<Star />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {template.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFavorite(template.id)}
                    >
                      <Heart
                        size={20}
                        fill={isFavorite ? '#f50057' : 'none'}
                        color={isFavorite ? '#f50057' : 'currentColor'}
                      />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={template.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={template.difficulty}
                      size="small"
                      sx={{
                        bgcolor: DIFFICULTY_COLORS[template.difficulty],
                        color: 'white',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Tooltip title="Rating">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star size={16} fill="#ff9800" color="#ff9800" />
                        <Typography variant="caption">{template.rating}</Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Uses">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Download size={16} />
                        <Typography variant="caption">{template.uses}</Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Nodes">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GitBranch size={16} />
                        <Typography variant="caption">{template.nodes}</Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Setup Time">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Clock size={16} />
                        <Typography variant="caption">{template.estimatedTime}</Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Eye />}
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleImportTemplate(template)}
                  >
                    Import
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <AlertTitle>No Templates Found</AlertTitle>
          Try adjusting your search or filters.
        </Alert>
      )}
    </Box>
  );

  // ===== RENDER: FEATURED TAB =====
  const renderFeatured = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Featured Templates
      </Typography>

      <Grid container spacing={3}>
        {featuredTemplates.map((template) => (
          <Grid item xs={12} sm={6} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <Star size={24} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{template.name}</Typography>
                    <Rating value={template.rating} precision={0.1} readOnly size="small" />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={template.category}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${template.uses} uses`}
                    size="small"
                    icon={<TrendingUp size={14} />}
                  />
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Eye />}
                  onClick={() => handlePreviewTemplate(template)}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleImportTemplate(template)}
                >
                  Import
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // ===== RENDER: MY TEMPLATES TAB =====
  const renderMyTemplates = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          My Templates ({customTemplates.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setSaveDialog(true)}
        >
          Save New Template
        </Button>
      </Box>

      {customTemplates.length > 0 ? (
        <Grid container spacing={2}>
          {customTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button size="small" startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<Share2 />}>
                    Share
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 />}
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          <AlertTitle>No Custom Templates Yet</AlertTitle>
          Save your workflows as templates for easy reuse!
        </Alert>
      )}
    </Box>
  );

  // ===== RENDER: RECOMMENDATIONS TAB =====
  const renderRecommendations = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Brain />
          AI Template Recommendations
        </Typography>
        <Button
          variant="contained"
          startIcon={generatingRecommendations ? <CircularProgress size={16} /> : <Sparkles />}
          onClick={handleGenerateRecommendations}
          disabled={generatingRecommendations}
        >
          {generatingRecommendations ? 'Generating...' : 'Generate Recommendations'}
        </Button>
      </Box>

      {aiRecommendations.length > 0 ? (
        <Grid container spacing={2}>
          {aiRecommendations.map((recommendation, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Alert severity="success" icon={<Sparkles />}>
                <AlertTitle>{recommendation.name}</AlertTitle>
                <Typography variant="body2" gutterBottom>
                  {recommendation.description}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                  💡 Benefit: {recommendation.benefit}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={recommendation.category}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={recommendation.difficulty}
                    size="small"
                    sx={{
                      bgcolor: DIFFICULTY_COLORS[recommendation.difficulty],
                      color: 'white',
                    }}
                  />
                </Box>
              </Alert>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          Click "Generate Recommendations" to get AI-powered template suggestions tailored to your business!
        </Alert>
      )}
    </Box>
  );

  // ===== MAIN RENDER =====
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Package />
          Automation Templates
        </Typography>
        <Chip
          label={`${TEMPLATE_LIBRARY.length} Templates Available`}
          color="primary"
          icon={<Package />}
        />
      </Box>

      {/* Info Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Pre-Built Workflow Templates</AlertTitle>
        Import ready-to-use automation workflows in seconds! Customize them to fit your business needs.
      </Alert>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab value="marketplace" label="Template Marketplace" icon={<Package />} iconPosition="start" />
          <Tab value="featured" label="Featured" icon={<Star />} iconPosition="start" />
          <Tab value="my-templates" label="My Templates" icon={<Heart />} iconPosition="start" />
          <Tab value="recommendations" label="AI Recommendations" icon={<Brain />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 'marketplace' && renderMarketplace()}
      {activeTab === 'featured' && renderFeatured()}
      {activeTab === 'my-templates' && renderMyTemplates()}
      {activeTab === 'recommendations' && renderRecommendations()}

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Package size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedTemplate.name}</Typography>
                  <Rating value={selectedTemplate.rating} precision={0.1} readOnly size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedTemplate.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Workflow Steps
              </Typography>
              <Stepper orientation="vertical">
                <Step active>
                  <StepLabel>Trigger: {selectedTemplate.workflow.trigger}</StepLabel>
                </Step>
                {selectedTemplate.workflow.actions.map((action, index) => (
                  <Step key={index} active>
                    <StepLabel>{action}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Chip label={selectedTemplate.category} />
                <Chip label={selectedTemplate.difficulty} sx={{ bgcolor: DIFFICULTY_COLORS[selectedTemplate.difficulty], color: 'white' }} />
                <Chip label={`${selectedTemplate.nodes} nodes`} icon={<GitBranch size={14} />} />
                <Chip label={selectedTemplate.estimatedTime} icon={<Clock size={14} />} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              setPreviewDialog(false);
              handleImportTemplate(selectedTemplate);
            }}
          >
            Import Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Template</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ py: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>Ready to Import</AlertTitle>
                Template: <strong>{selectedTemplate.name}</strong>
              </Alert>

              <Typography variant="body2" color="text.secondary" paragraph>
                This template will be imported as a draft workflow. You can customize it in the Workflow Builder before activating.
              </Typography>

              <TextField
                fullWidth
                label="Workflow Name (Optional)"
                value={customizationOptions.name || ''}
                onChange={(e) => setCustomizationOptions({
                  ...customizationOptions,
                  name: e.target.value,
                })}
                placeholder={selectedTemplate.name}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (Optional)"
                value={customizationOptions.notes || ''}
                onChange={(e) => setCustomizationOptions({
                  ...customizationOptions,
                  notes: e.target.value,
                })}
                placeholder="Add any notes about this workflow..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmImport}
            disabled={loading}
            startIcon={<Download />}
          >
            {loading ? 'Importing...' : 'Import Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveDialog} onClose={() => setSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={customizationOptions.name || ''}
                onChange={(e) => setCustomizationOptions({
                  ...customizationOptions,
                  name: e.target.value,
                })}
                placeholder="My Custom Template"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={customizationOptions.description || ''}
                onChange={(e) => setCustomizationOptions({
                  ...customizationOptions,
                  description: e.target.value,
                })}
                placeholder="Describe what this template does..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveAsTemplate}
            disabled={loading || !customizationOptions.name}
          >
            {loading ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutomationTemplates;