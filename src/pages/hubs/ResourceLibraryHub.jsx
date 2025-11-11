// ===================================================================
// ResourceLibraryHub.jsx
// Path: /src/pages/resources/ResourceLibraryHub.jsx
// 
// MEGA ULTIMATE Resource Library Hub for SpeedyCRM
// Complete resource management system with AI-powered features
// 
// Features:
// - Document library with AI categorization
// - Template management with AI generation
// - Training center with progress tracking
// - Knowledge base with AI Q&A
// - Tools & calculators
// - Client-shareable resources
// - Compliance resource center
// - AI-powered search and recommendations
// 
// Created: November 10, 2025
// ===================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Checkbox,
  FormControlLabel,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  Calculator,
  Users,
  Shield,
  Sparkles,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Play,
  Bookmark,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  Tag,
  Folder,
  File,
  Plus,
  ChevronDown,
  Award,
  Target,
  Brain,
  Zap,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  BarChart,
  PieChart,
  TrendingDown,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  getDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// ===================================================================
// MAIN HUB COMPONENT
// ===================================================================

const ResourceLibraryHub = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== State Management =====
  const [resources, setResources] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [tools, setTools] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // ===== Search & Filter State =====
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // ===== Dialog State =====
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // ===== AI State =====
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiChatInput, setAiChatInput] = useState('');

  // ===================================================================
  // LOAD DATA
  // ===================================================================

  useEffect(() => {
    loadAllData();
    loadUserPreferences();
    loadAnalytics();

    // Real-time listeners
    const unsubscribeResources = setupResourcesListener();
    const unsubscribeTemplates = setupTemplatesListener();
    const unsubscribeCourses = setupCoursesListener();

    return () => {
      unsubscribeResources();
      unsubscribeTemplates();
      unsubscribeCourses();
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadResources(),
        loadTemplates(),
        loadCourses(),
        loadKnowledgeBase(),
        loadTools(),
        loadFavorites(),
        loadRecentViews(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const resourcesRef = collection(db, 'resources');
      const q = query(resourcesRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(resourcesData);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const kbRef = collection(db, 'knowledgeBase');
      const q = query(kbRef, orderBy('category', 'asc'));
      const snapshot = await getDocs(q);
      const kbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setKnowledgeBase(kbData);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  };

  const loadTools = async () => {
    try {
      const toolsRef = collection(db, 'tools');
      const q = query(toolsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const toolsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTools(toolsData);
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesRef = collection(db, 'users', currentUser.uid, 'favorites');
      const snapshot = await getDocs(favoritesRef);
      const favoritesData = snapshot.docs.map(doc => doc.id);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadRecentViews = async () => {
    try {
      const viewsRef = collection(db, 'users', currentUser.uid, 'recentViews');
      const q = query(viewsRef, orderBy('viewedAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const viewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentViews(viewsData);
    } catch (error) {
      console.error('Error loading recent views:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const prefsDoc = await getDoc(doc(db, 'users', currentUser.uid, 'preferences', 'resources'));
      if (prefsDoc.exists()) {
        const prefs = prefsDoc.data();
        setViewMode(prefs.viewMode || 'grid');
        setSortBy(prefs.sortBy || 'recent');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsDoc = await getDoc(doc(db, 'analytics', 'resources'));
      if (analyticsDoc.exists()) {
        setAnalytics(analyticsDoc.data());
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // ===================================================================
  // REAL-TIME LISTENERS
  // ===================================================================

  const setupResourcesListener = () => {
    const resourcesRef = collection(db, 'resources');
    const q = query(resourcesRef, orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(resourcesData);
    });
  };

  const setupTemplatesListener = () => {
    const templatesRef = collection(db, 'templates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesData);
    });
  };

  const setupCoursesListener = () => {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesData);
    });
  };

  // ===================================================================
  // AI FUNCTIONS
  // ===================================================================

  const getAIRecommendations = useCallback(async () => {
    try {
      setAiSearching(true);

      // Analyze user's role, activity, and preferences
      const userRole = userProfile?.role || 'user';
      const userInterests = recentViews.map(v => v.category);
      const userLevel = userProfile?.skillLevel || 'intermediate';

      // Mock AI recommendations (in production, call OpenAI API)
      const recommendations = [
        {
          id: 'rec1',
          title: 'Advanced Dispute Strategies',
          type: 'course',
          relevance: 95,
          reason: 'Based on your recent dispute activity',
          category: 'Advanced',
        },
        {
          id: 'rec2',
          title: 'FCRA Compliance Update 2025',
          type: 'article',
          relevance: 88,
          reason: 'New regulations affecting your clients',
          category: 'Compliance',
        },
        {
          id: 'rec3',
          title: 'Credit Score Calculator Pro',
          type: 'tool',
          relevance: 82,
          reason: 'Popular among similar users',
          category: 'Tools',
        },
      ];

      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    } finally {
      setAiSearching(false);
    }
  }, [userProfile, recentViews]);

  const aiSmartSearch = async (query) => {
    try {
      setAiSearching(true);

      // In production, this would use OpenAI embeddings for semantic search
      const allContent = [
        ...resources.map(r => ({ ...r, type: 'resource' })),
        ...templates.map(t => ({ ...t, type: 'template' })),
        ...knowledgeBase.map(k => ({ ...k, type: 'article' })),
      ];

      // Simple keyword matching (replace with AI semantic search)
      const results = allContent.filter(item => {
        const searchableText = `${item.title} ${item.description} ${item.category} ${item.tags?.join(' ')}`.toLowerCase();
        return searchableText.includes(query.toLowerCase());
      });

      return results;
    } catch (error) {
      console.error('Error in AI search:', error);
      return [];
    } finally {
      setAiSearching(false);
    }
  };

  const aiGenerateContent = async (type, parameters) => {
    try {
      // In production, call OpenAI API to generate content
      console.log(`Generating ${type} with AI...`, parameters);
      
      // Mock generation
      return {
        title: `AI-Generated ${type}`,
        content: 'This would be AI-generated content...',
        tags: ['AI-Generated', type],
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  };

  const aiCategorizeResource = async (resource) => {
    try {
      // AI would analyze the resource and suggest categories/tags
      const suggestions = {
        category: 'Disputes',
        tags: ['credit-repair', 'consumer-rights', 'fcra'],
        difficulty: 'intermediate',
        estimatedTime: '15 minutes',
      };
      return suggestions;
    } catch (error) {
      console.error('Error categorizing resource:', error);
      return null;
    }
  };

  const aiAnswerQuestion = async (question) => {
    try {
      setAiSearching(true);

      // In production, this would use OpenAI with RAG over knowledge base
      const response = {
        answer: 'This would be an AI-generated answer based on your knowledge base...',
        sources: [
          { id: 'kb1', title: 'Related Article 1' },
          { id: 'kb2', title: 'Related Article 2' },
        ],
        confidence: 0.92,
      };

      return response;
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    } finally {
      setAiSearching(false);
    }
  };

  // ===================================================================
  // RESOURCE MANAGEMENT
  // ===================================================================

  const handleUploadResource = async (file, metadata) => {
    try {
      setLoading(true);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `resources/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Get AI suggestions for categorization
      const aiSuggestions = await aiCategorizeResource({ name: file.name, type: file.type });

      // Create resource document
      const resourceData = {
        ...metadata,
        ...aiSuggestions,
        fileUrl: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: currentUser.uid,
        uploadedByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        downloads: 0,
        favorites: 0,
        rating: 0,
        ratingCount: 0,
      };

      await addDoc(collection(db, 'resources'), resourceData);

      setSuccess('Resource uploaded successfully!');
      setUploadDialogOpen(false);
      loadResources();
    } catch (error) {
      console.error('Error uploading resource:', error);
      setError('Failed to upload resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this resource?')) return;

      setLoading(true);

      const resourceDoc = await getDoc(doc(db, 'resources', resourceId));
      const resourceData = resourceDoc.data();

      // Delete file from storage
      if (resourceData.fileUrl) {
        const fileRef = ref(storage, resourceData.fileUrl);
        await deleteObject(fileRef);
      }

      // Delete document
      await deleteDoc(doc(db, 'resources', resourceId));

      setSuccess('Resource deleted successfully!');
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResource = async (resource) => {
    try {
      setSelectedResource(resource);
      setDetailsDialogOpen(true);

      // Increment view count
      await updateDoc(doc(db, 'resources', resource.id), {
        views: increment(1),
      });

      // Add to recent views
      await addDoc(collection(db, 'users', currentUser.uid, 'recentViews'), {
        resourceId: resource.id,
        resourceType: resource.type,
        viewedAt: serverTimestamp(),
        category: resource.category,
      });

      loadRecentViews();
    } catch (error) {
      console.error('Error viewing resource:', error);
    }
  };

  const handleToggleFavorite = async (resourceId) => {
    try {
      if (favorites.includes(resourceId)) {
        // Remove from favorites
        await deleteDoc(doc(db, 'users', currentUser.uid, 'favorites', resourceId));
        setFavorites(favorites.filter(id => id !== resourceId));

        // Decrement favorite count
        await updateDoc(doc(db, 'resources', resourceId), {
          favorites: increment(-1),
        });
      } else {
        // Add to favorites
        await addDoc(collection(db, 'users', currentUser.uid, 'favorites'), {
          resourceId,
          addedAt: serverTimestamp(),
        });
        setFavorites([...favorites, resourceId]);

        // Increment favorite count
        await updateDoc(doc(db, 'resources', resourceId), {
          favorites: increment(1),
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownloadResource = async (resource) => {
    try {
      // Increment download count
      await updateDoc(doc(db, 'resources', resource.id), {
        downloads: increment(1),
      });

      // Open download URL
      window.open(resource.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const handleRateResource = async (resourceId, rating) => {
    try {
      // In production, track individual ratings per user
      await updateDoc(doc(db, 'resources', resourceId), {
        rating: increment(rating),
        ratingCount: increment(1),
      });

      setSuccess('Rating submitted!');
      loadResources();
    } catch (error) {
      console.error('Error rating resource:', error);
    }
  };

  // ===================================================================
  // TEMPLATE MANAGEMENT
  // ===================================================================

  const handleCreateTemplate = async (templateData) => {
    try {
      setLoading(true);

      const newTemplate = {
        ...templateData,
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        uses: 0,
        favorites: 0,
        rating: 0,
        ratingCount: 0,
      };

      await addDoc(collection(db, 'templates'), newTemplate);

      setSuccess('Template created successfully!');
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      // Increment usage count
      await updateDoc(doc(db, 'templates', template.id), {
        uses: increment(1),
      });

      // Copy template content
      navigator.clipboard.writeText(template.content);
      setSuccess('Template copied to clipboard!');
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  // ===================================================================
  // COURSE/TRAINING MANAGEMENT
  // ===================================================================

  const handleStartCourse = async (courseId) => {
    try {
      // Create or update user progress
      const progressRef = doc(db, 'users', currentUser.uid, 'courseProgress', courseId);
      await updateDoc(progressRef, {
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        progress: 0,
        completed: false,
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'users', currentUser.uid, 'courseProgress'), {
          courseId,
          startedAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp(),
          progress: 0,
          completed: false,
        });
      });

      setSuccess('Course started! Good luck!');
    } catch (error) {
      console.error('Error starting course:', error);
    }
  };

  const handleUpdateProgress = async (courseId, lessonId, completed) => {
    try {
      const progressRef = doc(db, 'users', currentUser.uid, 'courseProgress', courseId);
      await updateDoc(progressRef, {
        [`lessons.${lessonId}`]: completed,
        lastAccessedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // ===================================================================
  // FILTERED & SORTED DATA
  // ===================================================================

  const filteredResources = useMemo(() => {
    let filtered = resources;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [resources, searchQuery, categoryFilter, typeFilter, sortBy]);

  // ===================================================================
  // RENDER HELPERS
  // ===================================================================

  const renderResourceCard = (resource) => (
    <Card
      key={resource.id}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => handleViewResource(resource)}
    >
      <CardContent>
        <Box className="flex justify-between items-start mb-2">
          <Box className="flex items-center gap-2">
            {getResourceIcon(resource.type)}
            <Typography variant="h6" className="font-semibold">
              {resource.title}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(resource.id);
            }}
          >
            {favorites.includes(resource.id) ? (
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
          </IconButton>
        </Box>

        <Typography variant="body2" color="textSecondary" className="mb-3">
          {resource.description}
        </Typography>

        <Box className="flex flex-wrap gap-1 mb-3">
          <Chip label={resource.category} size="small" color="primary" />
          {resource.tags?.slice(0, 2).map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box className="flex justify-between items-center">
          <Box className="flex items-center gap-3 text-sm text-gray-600">
            <Box className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {resource.views || 0}
            </Box>
            <Box className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {resource.downloads || 0}
            </Box>
            <Box className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {resource.rating ? (resource.rating / resource.ratingCount).toFixed(1) : '0.0'}
            </Box>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Download className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadResource(resource);
            }}
          >
            Download
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const getResourceIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'course':
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case 'template':
        return <Copy className="w-5 h-5 text-green-600" />;
      case 'tool':
        return <Calculator className="w-5 h-5 text-orange-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  // ===================================================================
  // TAB COMPONENTS
  // ===================================================================

  const renderLibraryTab = () => (
    <Box>
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search className="w-5 h-5 mr-2 text-gray-400" />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Disputes">Disputes</MenuItem>
                  <MenuItem value="Compliance">Compliance</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                  <MenuItem value="Tools">Tools</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                  <MenuItem value="template">Templates</MenuItem>
                  <MenuItem value="tool">Tools</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Upload className="w-4 h-4" />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent>
            <Box className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <Typography variant="h6" className="font-semibold">
                AI Recommendations for You
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {aiRecommendations.map(rec => (
                <Grid item xs={12} md={4} key={rec.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent>
                      <Box className="flex justify-between items-start mb-2">
                        <Typography variant="subtitle1" className="font-semibold">
                          {rec.title}
                        </Typography>
                        <Chip
                          label={`${rec.relevance}%`}
                          size="small"
                          color="success"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" className="mb-2">
                        {rec.reason}
                      </Typography>
                      <Chip label={rec.category} size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Resources Grid */}
      <Grid container spacing={3}>
        {filteredResources.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <Typography variant="h6" color="textSecondary">
                  No resources found
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mt-2">
                  Try adjusting your filters or upload new resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredResources.map(resource => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              {renderResourceCard(resource)}
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Card className="mb-6">
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="font-semibold">
              Document Templates
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus className="w-4 h-4" />}
              onClick={() => {/* Open create template dialog */}}
            >
              Create Template
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Pre-built templates for dispute letters, contracts, and more
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {templates.map(template => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Box className="flex justify-between items-start mb-2">
                  <Box>
                    <Typography variant="h6" className="font-semibold mb-1">
                      {template.title}
                    </Typography>
                    <Chip label={template.category} size="small" color="primary" />
                  </Box>
                  <IconButton onClick={() => handleToggleFavorite(template.id)}>
                    {favorites.includes(template.id) ? (
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </IconButton>
                </Box>

                <Typography variant="body2" color="textSecondary" className="mb-3">
                  {template.description}
                </Typography>

                <Box className="flex justify-between items-center">
                  <Box className="text-sm text-gray-600">
                    Used {template.uses || 0} times
                  </Box>
                  <Box className="flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye className="w-4 h-4" />}
                      onClick={() => handleViewResource(template)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Copy className="w-4 h-4" />}
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTrainingTab = () => (
    <Box>
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Training & Certification Programs
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Comprehensive courses to master credit repair
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <Box className="flex items-start gap-3 mb-3">
                  <Avatar className="bg-purple-600">
                    <GraduationCap className="w-6 h-6" />
                  </Avatar>
                  <Box className="flex-1">
                    <Typography variant="h6" className="font-semibold mb-1">
                      {course.title}
                    </Typography>
                    <Box className="flex items-center gap-2 mb-2">
                      <Chip label={course.level} size="small" color="secondary" />
                      <Typography variant="caption" color="textSecondary">
                        {course.duration}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" className="mb-3">
                  {course.description}
                </Typography>

                <Box className="mb-3">
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="caption">Progress</Typography>
                    <Typography variant="caption">{course.progress || 0}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress || 0}
                    className="h-2 rounded"
                  />
                </Box>

                <Box className="flex justify-between items-center">
                  <Box className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Play className="w-4 h-4" />}
                    onClick={() => handleStartCourse(course.id)}
                  >
                    {course.progress > 0 ? 'Continue' : 'Start'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderKnowledgeBaseTab = () => (
    <Box>
      <Card className="mb-6">
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="font-semibold">
              Knowledge Base & FAQs
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Brain className="w-4 h-4" />}
              onClick={() => setAiDialogOpen(true)}
            >
              Ask AI
            </Button>
          </Box>
          <TextField
            fullWidth
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search className="w-5 h-5 mr-2 text-gray-400" />,
            }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {knowledgeBase.map((article, index) => (
          <Grid item xs={12} key={article.id}>
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box className="flex items-center gap-3 flex-1">
                  <Info className="w-5 h-5 text-blue-600" />
                  <Box className="flex-1">
                    <Typography variant="subtitle1" className="font-semibold">
                      {article.title}
                    </Typography>
                    <Box className="flex items-center gap-2 mt-1">
                      <Chip label={article.category} size="small" />
                      <Typography variant="caption" color="textSecondary">
                        {article.views || 0} views
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {article.content}
                </Typography>
                {article.relatedArticles && (
                  <Box className="mt-4 pt-4 border-t">
                    <Typography variant="subtitle2" className="mb-2">
                      Related Articles:
                    </Typography>
                    <Box className="flex flex-wrap gap-2">
                      {article.relatedArticles.map(related => (
                        <Chip
                          key={related}
                          label={related}
                          size="small"
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderToolsTab = () => (
    <Box>
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Interactive Tools & Calculators
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Helpful utilities for credit repair professionals
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {tools.map(tool => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent>
                <Box className="flex items-center gap-3 mb-3">
                  <Avatar className="bg-orange-600">
                    <Calculator className="w-6 h-6" />
                  </Avatar>
                  <Typography variant="h6" className="font-semibold">
                    {tool.name}
                  </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" className="mb-3">
                  {tool.description}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Zap className="w-4 h-4" />}
                >
                  Launch Tool
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderClientResourcesTab = () => (
    <Box>
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Client-Shareable Resources
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Educational materials you can share with your clients
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                Consumer Rights Guide
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                Comprehensive guide to FCRA rights and consumer protections
              </Typography>
              <Button
                variant="contained"
                startIcon={<Share2 className="w-4 h-4" />}
              >
                Share with Client
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                Credit Building Tips
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                Best practices for building and maintaining good credit
              </Typography>
              <Button
                variant="contained"
                startIcon={<Share2 className="w-4 h-4" />}
              >
                Share with Client
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderComplianceTab = () => (
    <Box>
      <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20">
        <CardContent>
          <Box className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 mt-1" />
            <Box>
              <Typography variant="h6" className="font-semibold mb-2">
                Compliance & Regulatory Resources
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Stay up-to-date with credit repair regulations and best practices
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                FCRA Guidelines
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                Fair Credit Reporting Act regulations and compliance requirements
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ExternalLink className="w-4 h-4" />}
              >
                View Guidelines
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                CROA Compliance
              </Typography>
              <Typography variant="body2" color="textSecondary" className="mb-4">
                Credit Repair Organizations Act requirements and best practices
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ExternalLink className="w-4 h-4" />}
              >
                View Guidelines
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAIAssistantTab = () => (
    <Box>
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent>
          <Box className="flex items-center gap-3 mb-4">
            <Avatar className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Brain className="w-6 h-6" />
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-semibold">
                AI Resource Assistant
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Get intelligent recommendations and answers
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      <Card className="mb-6">
        <CardContent>
          <Box className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            {aiChatMessages.length === 0 ? (
              <Box className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <Typography variant="body1" color="textSecondary">
                  Ask me anything about credit repair resources!
                </Typography>
              </Box>
            ) : (
              aiChatMessages.map((message, index) => (
                <Box
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <Paper
                    className={`inline-block p-3 max-w-3/4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700'
                    }`}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                  </Paper>
                </Box>
              ))
            )}
          </Box>

          <Box className="flex gap-2">
            <TextField
              fullWidth
              placeholder="Ask about resources, training, compliance..."
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // Handle AI chat
                }
              }}
            />
            <Button
              variant="contained"
              disabled={!aiChatInput.trim() || aiSearching}
              startIcon={aiSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            >
              Ask
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Recommended for You
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Sparkles className="w-4 h-4" />}
            onClick={getAIRecommendations}
            disabled={aiSearching}
          >
            Get Personalized Recommendations
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  // ===================================================================
  // MAIN RENDER
  // ===================================================================

  if (loading && resources.length === 0) {
    return (
      <Box className="flex justify-center items-center h-96">
        <Box className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <Typography>Loading Resource Library...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="mb-6">
        <Box className="flex items-center gap-3 mb-2">
          <Avatar className="bg-gradient-to-r from-purple-600 to-blue-600">
            <BookOpen className="w-6 h-6" />
          </Avatar>
          <Typography variant="h4" className="font-bold">
            Resource Library Hub
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Your complete resource center with AI-powered features
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} className="mb-4">
          {success}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {resources.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Resources
                  </Typography>
                </Box>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {templates.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Templates
                  </Typography>
                </Box>
                <FileText className="w-8 h-8 text-green-600" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {courses.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Courses
                  </Typography>
                </Box>
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {favorites.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Favorites
                  </Typography>
                </Box>
                <Heart className="w-8 h-8 text-red-600" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Library"
            value="library"
            icon={<BookOpen className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Templates"
            value="templates"
            icon={<FileText className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Training"
            value="training"
            icon={<GraduationCap className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Knowledge Base"
            value="knowledge"
            icon={<BookOpen className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Tools"
            value="tools"
            icon={<Calculator className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Client Resources"
            value="client"
            icon={<Users className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label="Compliance"
            value="compliance"
            icon={<Shield className="w-4 h-4" />}
            iconPosition="start"
          />
          <Tab
            label={
              <Box className="flex items-center gap-1">
                AI Assistant
                <Sparkles className="w-4 h-4" />
              </Box>
            }
            value="ai"
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box className="mt-6">
        {activeTab === 'library' && renderLibraryTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'training' && renderTrainingTab()}
        {activeTab === 'knowledge' && renderKnowledgeBaseTab()}
        {activeTab === 'tools' && renderToolsTab()}
        {activeTab === 'client' && renderClientResourcesTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
        {activeTab === 'ai' && renderAIAssistantTab()}
      </Box>

      {/* Upload Dialog */}
      {/* Add dialog components here */}

      {/* Details Dialog */}
      {/* Add dialog components here */}
    </Box>
  );
};

export default ResourceLibraryHub;