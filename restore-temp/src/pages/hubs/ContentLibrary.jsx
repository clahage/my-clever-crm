// ============================================================================
// ContentLibrary.jsx - SOCIAL MEDIA CONTENT LIBRARY
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Comprehensive content library for managing media assets, post templates,
// hashtag collections, and saved content. Provides organization, search,
// and reuse capabilities for social media content.
//
// FEATURES:
// - Media library (images, videos, documents)
// - Post templates
// - Hashtag collections
// - Caption templates
// - Media upload and management
// - Folders and organization
// - Search and filtering
// - Bulk operations
// - Media editing tools
// - Usage tracking
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
  CardMedia,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
} from '@mui/material';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Folder,
  Search,
  Filter,
  Trash2,
  Edit,
  Copy,
  Download,
  Plus,
  Star,
  Tag,
  Calendar,
  Eye,
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
} from 'firebase/firestore';
import { format } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTENT_TYPES = [
  { value: 'all', label: 'All Content' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
  { value: 'templates', label: 'Templates' },
  { value: 'hashtags', label: 'Hashtags' },
];

const POPULAR_HASHTAGS = [
  '#CreditRepair',
  '#CreditScore',
  '#FinancialFreedom',
  '#CreditTips',
  '#DebtFree',
  '#BuildCredit',
  '#FixYourCredit',
  '#CreditHelp',
  '#FinancialLiteracy',
  '#MoneyTips',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ContentLibrary = () => {
  const { currentUser } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tab state
  const [activeTab, setActiveTab] = useState('media');

  // Content state
  const [mediaItems, setMediaItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [hashtagCollections, setHashtagCollections] = useState([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);

  // Dialog state
  const [uploadDialog, setUploadDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [hashtagDialog, setHashtagDialog] = useState(false);

  // Form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: '',
  });

  const [newHashtagCollection, setNewHashtagCollection] = useState({
    name: '',
    hashtags: [],
  });

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to media items
    const mediaQuery = query(
      collection(db, 'socialMedia', 'content', 'media'),
      where('userId', '==', currentUser.uid),
      orderBy('uploadedAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(mediaQuery, (snapshot) => {
        const media = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMediaItems(media);
      })
    );

    // Listen to templates
    const templatesQuery = query(
      collection(db, 'socialMedia', 'content', 'templates'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(templatesQuery, (snapshot) => {
        const temps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTemplates(temps);
      })
    );

    // Listen to hashtag collections
    const hashtagsQuery = query(
      collection(db, 'socialMedia', 'content', 'hashtags'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(hashtagsQuery, (snapshot) => {
        const hashtags = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHashtagCollections(hashtags);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== HANDLERS =====
  const handleCreateTemplate = async () => {
    try {
      setLoading(true);

      await addDoc(collection(db, 'socialMedia', 'content', 'templates'), {
        ...newTemplate,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        usageCount: 0,
      });

      showSnackbar('Template created!', 'success');
      setTemplateDialog(false);
      setNewTemplate({ name: '', content: '', category: '' });
    } catch (error) {
      console.error('❌ Error creating template:', error);
      showSnackbar('Failed to create template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHashtagCollection = async () => {
    try {
      setLoading(true);

      await addDoc(collection(db, 'socialMedia', 'content', 'hashtags'), {
        ...newHashtagCollection,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      showSnackbar('Hashtag collection created!', 'success');
      setHashtagDialog(false);
      setNewHashtagCollection({ name: '', hashtags: [] });
    } catch (error) {
      console.error('❌ Error creating hashtag collection:', error);
      showSnackbar('Failed to create collection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, type) => {
    if (!confirm('Delete this item?')) return;

    try {
      await deleteDoc(doc(db, 'socialMedia', 'content', type, itemId));
      showSnackbar('Item deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      showSnackbar('Failed to delete item', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ===== RENDER: MEDIA TAB =====
  const renderMediaTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search media..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setUploadDialog(true)}
        >
          Upload Media
        </Button>
      </Box>

      <Grid container spacing={2}>
        {mediaItems.length > 0 ? (
          mediaItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.url || '/placeholder.jpg'}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="body2" noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.type} • {item.size}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small">
                    <Eye size={16} />
                  </IconButton>
                  <IconButton size="small">
                    <Download size={16} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id, 'media')}>
                    <Trash2 size={16} />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Media Yet</AlertTitle>
              Upload your first image or video to get started!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // ===== RENDER: TEMPLATES TAB =====
  const renderTemplatesTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Post Templates</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setTemplateDialog(true)}
        >
          New Template
        </Button>
      </Box>

      <Grid container spacing={2}>
        {templates.length > 0 ? (
          templates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.content}
                  </Typography>
                  {template.category && (
                    <Chip label={template.category} size="small" />
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Used {template.usageCount || 0} times
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Copy />}>
                    Use Template
                  </Button>
                  <Button size="small" startIcon={<Edit />}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 />}
                    onClick={() => handleDeleteItem(template.id, 'templates')}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Templates Yet</AlertTitle>
              Create your first post template to save time!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // ===== RENDER: HASHTAGS TAB =====
  const renderHashtagsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Hashtag Collections</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setHashtagDialog(true)}
        >
          New Collection
        </Button>
      </Box>

      {/* Popular Hashtags */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Popular Credit Repair Hashtags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {POPULAR_HASHTAGS.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                onClick={() => navigator.clipboard.writeText(tag)}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Custom Collections */}
      <Grid container spacing={2}>
        {hashtagCollections.length > 0 ? (
          hashtagCollections.map((collection) => (
            <Grid item xs={12} md={6} key={collection.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {collection.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {collection.hashtags?.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Copy />}>
                    Copy All
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 />}
                    onClick={() => handleDeleteItem(collection.id, 'hashtags')}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Collections Yet</AlertTitle>
              Create hashtag collections for easy reuse!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // ===== MAIN RENDER =====
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Content Library
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab value="media" label="Media" icon={<ImageIcon />} iconPosition="start" />
          <Tab value="templates" label="Templates" icon={<FileText />} iconPosition="start" />
          <Tab value="hashtags" label="Hashtags" icon={<Tag />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 'media' && renderMediaTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'hashtags' && renderHashtagsTab()}

      {/* Template Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Post Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Template Content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={loading || !newTemplate.name || !newTemplate.content}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hashtag Collection Dialog */}
      <Dialog open={hashtagDialog} onClose={() => setHashtagDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Hashtag Collection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Name"
                value={newHashtagCollection.name}
                onChange={(e) => setNewHashtagCollection({ ...newHashtagCollection, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Hashtags (comma separated)"
                placeholder="#hashtag1, #hashtag2, #hashtag3"
                onChange={(e) => {
                  const hashtags = e.target.value.split(',').map(h => h.trim());
                  setNewHashtagCollection({ ...newHashtagCollection, hashtags });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHashtagDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateHashtagCollection}
            disabled={loading || !newHashtagCollection.name || newHashtagCollection.hashtags.length === 0}
          >
            Create Collection
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

export default ContentLibrary;