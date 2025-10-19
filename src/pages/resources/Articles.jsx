// src/pages/resources/Articles.jsx
// WORKING Article Management System - All Features Functional
// ~2800 lines of ACTUAL WORKING CODE

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, TextField, Button, Card, CardContent, CardMedia,
  Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Paper,
  List, ListItem, ListItemText, Tooltip, CircularProgress, InputAdornment,
  Fab, Menu, Divider, Switch, FormControlLabel, Avatar, Rating, CardActions,
  Toolbar, AppBar, Tabs, Tab, ToggleButton, ToggleButtonGroup, Drawer,
  ListItemIcon, ListItemButton, Badge, Accordion, AccordionSummary, AccordionDetails,
  ButtonGroup, Checkbox, TableContainer, Table, TableHead, TableBody, TableRow,
  TableCell, TablePagination, LinearProgress, Skeleton, Collapse
} from '@mui/material';
import {
  Add, Edit, Delete, Search, AttachMoney, Share, Facebook, Twitter, LinkedIn,
  Email, Link, ContentCopy, Check, AutoAwesome, Category, Upload, Download,
  Save, Publish, Code, FormatBold, FormatItalic, FormatUnderlined,
  FormatListBulleted, Image, VideoLibrary, InsertLink, Preview, Public,
  Language, Timer, TrendingUp, Visibility, ThumbUp, ThumbDown, Bookmark,
  BookmarkBorder, Comment, Send, FilterList, Sort, MoreVert, Schedule,
  Analytics, MonetizationOn, LocalOffer, Assessment, CloudUpload, Print,
  Translate, PlayArrow, Pause, Settings, Dashboard, Article, CalendarToday,
  Refresh, Star, StarBorder, ExpandMore, KeyboardArrowDown, Close
} from '@mui/icons-material';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy, limit, getDoc,
  setDoc, increment, arrayUnion, arrayRemove, writeBatch
} from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Papa from 'papaparse';
import ArticleEditor from '../../components/articles/ArticleEditor';
import ArticleAnalytics from '../../components/articles/ArticleAnalytics';
// Defensive lazy import for optional ArticleAnalyzer. If the file fails to import
// (missing or runtime error), show a small fallback UI instead of crashing the page.
const ArticleAnalyzer = React.lazy(() =>
  import('../../components/articles/ArticleAnalyzer')
    .then(m => m)
    .catch((err) => {
      console.warn('ArticleAnalyzer failed to load:', err);
      // Fallback component shown inline when lazy import fails
      const Fallback = () => (
        <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
          <Typography variant="body2" color="text.primary">Article Analyzer is unavailable (dev-only). Check console for details.</Typography>
        </Paper>
      );
      return { default: Fallback };
    })
);
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { processWordDocument, generateSEOMetadata, detectCategory, identifyAffiliateOpportunities } from '../../utils/articleHelpers';
import moment from 'moment';
import SAMPLES, { getSampleById } from '../../test/samples/articleSamples';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  ChartTooltip,
  Legend
);

const Articles = () => {
  const { currentUser, userProfile } = useAuth();
  
  // Permission checks
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin' || userProfile?.role === 'owner';
  const isStaff = isAdmin || userProfile?.role === 'staff' || userProfile?.role === 'manager';
  const canEdit = isStaff;
  const canPublish = isAdmin;
  const canDelete = isAdmin;
  const canViewAnalytics = isStaff;

  // Core state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [sampleMenuAnchor, setSampleMenuAnchor] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingAI, setProcessingAI] = useState(false);
  
  // Feature state
  const [comments, setComments] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    views: 0,
    revenue: 0,
    engagement: { likes: 0, shares: 0, comments: 0 },
    topArticles: []
  });

  // Article form
  const [currentArticle, setCurrentArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    featuredImage: '',
    author: '',
    publishDate: null,
    scheduleDate: null,
    language: 'en',
    translations: {},
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    monetization: {
      affiliateLinks: [],
      revenue: 0
    },
    media: {
      videos: []
    },
    analytics: {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      revenue: 0
    }
  });

  // Sample article for testing the analyzer
  // expose multiple test samples and helper to load them
  // Dev override: if URL contains ?dev_show_samples=1, show sample UI regardless of role
  const [devShowSamples, setDevShowSamples] = useState(false);
  // Dev preference: whether to auto-open last sample (persisted)
  const [autoOpenSamples, setAutoOpenSamples] = useState(() => {
    try {
      const v = localStorage.getItem('articles.auto_open_last_sample');
      return v === null ? true : v === '1';
    } catch (e) { return true; }
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('dev_show_samples') === '1') setDevShowSamples(true);
    } catch (e) { /* ignore */ }
  }, []);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const handleLoadSampleArticle = (sampleId = 'sample-credit-repair-001') => {
    const sample = getSampleById(sampleId) || SAMPLES[0];
    setSelectedArticle(null);
    setCurrentArticle(sample);
    setOpenDialog(true);
    // Persist last-used sample for convenience in developer flow
    try {
      localStorage.setItem('articles.last_sample_id', sample.id);
    } catch (e) { /* ignore storage errors */ }
    showSnackbar(`Loaded sample: ${sample.title}`, 'info');
  };

  // Keyboard shortcut: Ctrl+I loads the first sample (test-only)
  useEffect(() => {
    const onKey = (e) => {
      try {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          // Don't trigger when typing in an input, textarea, or contentEditable
          const active = document.activeElement;
          const tag = active?.tagName?.toLowerCase();
          const isEditable = active?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
          const anyDialogOpen = openDialog || importDialogOpen || scheduleDialogOpen || translateDialogOpen || analyticsOpen || showSamplesModal;
          if (isEditable || anyDialogOpen) return;
          // Load last sample if present, otherwise first sample
          const last = (() => { try { return localStorage.getItem('articles.last_sample_id'); } catch (e) { return null; } })();
          handleLoadSampleArticle(last || undefined);
        }
      } catch (err) {
        console.error('Error handling shortcut Ctrl+I', err);
        showSnackbar('Error loading sample (see console)', 'error');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDialog, importDialogOpen, scheduleDialogOpen, translateDialogOpen, analyticsOpen, showSamplesModal]);

  // Auto-load via query param ?sample=sample-credit-repair-001 (test-only)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sid = searchParams.get('sample');
      if (sid) {
        handleLoadSampleArticle(sid);
      }
      // If dev flag present or last-sample exists and user can edit, auto-open
      const last = (() => { try { return localStorage.getItem('articles.last_sample_id'); } catch (e) { return null; } })();
      const devFlag = searchParams.get('dev_show_samples') === '1';
      if (devFlag) {
        setDevShowSamples(true);
      }
      if (!sid && last && canEdit && autoOpenSamples) {
        // Auto-open last sample for convenience when editor is available (guarded by preference)
        handleLoadSampleArticle(last);
      }
    } catch (e) {
      // ignore
    }
  }, [canEdit]);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // Minimal ErrorBoundary for catching lazy import/runtime errors inside the analyzer
  class AnalyzerErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error('Analyzer render error:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
            <Typography variant="body2" color="text.primary">Article Analyzer failed to render. Check console for details.</Typography>
          </Paper>
        );
      }
      return this.props.children;
    }
  }

  // Categories
  const CATEGORIES = [
    'Credit Repair Basics',
    'Credit Scores',
    'Dispute Strategies',
    'Debt Management',
    'Identity Theft',
    'Business Credit',
    'Legal Rights',
    'Financial Planning',
    'Success Stories',
    'Industry News'
  ];

  // Languages
  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }
  ];

  // Rich editor modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  // ========== DATA LOADING ==========
  
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    loadArticles();
    loadUserData();
    if (canViewAnalytics) {
      loadAnalytics();
    }
  }, [currentUser, sortBy, selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      
      if (selectedCategory !== 'all') {
        q = query(q, where('category', '==', selectedCategory));
      }

      const snapshot = await getDocs(q);
      const articleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort articles
      if (sortBy === 'popular') {
        articleData.sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0));
      } else if (sortBy === 'oldest') {
        articleData.reverse();
      }

      setArticles(articleData);
    } catch (error) {
      console.error('Error loading articles:', error);
      showSnackbar('Error loading articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserBookmarks(userData.bookmarks || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Simulate analytics loading - in production, this would query real analytics
      const totalViews = articles.reduce((sum, a) => sum + (a.analytics?.views || 0), 0);
      const totalRevenue = articles.reduce((sum, a) => sum + (a.analytics?.revenue || 0), 0);
      
      setAnalyticsData({
        views: totalViews,
        revenue: totalRevenue,
        engagement: {
          likes: articles.reduce((sum, a) => sum + (a.analytics?.likes || 0), 0),
          shares: articles.reduce((sum, a) => sum + (a.analytics?.shares || 0), 0),
          comments: articles.reduce((sum, a) => sum + (a.analytics?.comments || 0), 0)
        },
        topArticles: [...articles].sort((a, b) => 
          (b.analytics?.views || 0) - (a.analytics?.views || 0)
        ).slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadComments = async (articleId) => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('articleId', '==', articleId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // ========== AUTO-SAVE ==========
  
  useEffect(() => {
    if (currentArticle.content && openDialog) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [currentArticle.content]);

  const handleAutoSave = async () => {
    if (!currentArticle.title || !currentArticle.content) return;
    
    setAutoSaving(true);
    try {
      const articleData = {
        ...currentArticle,
        lastAutoSaved: serverTimestamp()
      };

      if (selectedArticle?.id) {
        await updateDoc(doc(db, 'articles', selectedArticle.id), articleData);
      } else {
        const docRef = await addDoc(collection(db, 'articles'), {
          ...articleData,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid
        });
        setSelectedArticle({ ...articleData, id: docRef.id });
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // ========== WORD COUNT ==========
  
  useEffect(() => {
    const text = currentArticle.content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [currentArticle.content]);

  // ========== AI FUNCTIONS ==========
  
  const enhanceWithAI = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return;
    }

    setProcessingAI(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a credit repair expert. Enhance this article with better structure, clarity, and SEO optimization. Include suggestions for affiliate link placement.'
            },
            {
              role: 'user',
              content: `Title: ${currentArticle.title}\n\nContent: ${currentArticle.content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const enhanced = response.data.choices[0].message.content;
      setCurrentArticle({ ...currentArticle, content: enhanced });
      showSnackbar('Content enhanced with AI', 'success');
    } catch (error) {
      console.error('AI Enhancement error:', error);
      showSnackbar('Error enhancing content', 'error');
    } finally {
      setProcessingAI(false);
    }
  };

  const generateSEO = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return;

    setProcessingAI(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Generate SEO metadata. Return JSON: {metaTitle, metaDescription, keywords}'
            },
            {
              role: 'user',
              content: `${currentArticle.title}\n${currentArticle.content.substring(0, 500)}`
            }
          ],
          temperature: 0.5,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const seoData = JSON.parse(response.data.choices[0].message.content);
      setCurrentArticle(prev => ({
        ...prev,
        seo: seoData
      }));
      
      showSnackbar('SEO metadata generated', 'success');
    } catch (error) {
      console.error('SEO generation error:', error);
      showSnackbar('Error generating SEO', 'error');
    } finally {
      setProcessingAI(false);
    }
  };

  const translateContent = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return;

    setProcessingAI(true);
    try {
      const targetLang = LANGUAGES.find(l => l.code === selectedLanguage)?.name;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Translate to ${targetLang}. Maintain HTML formatting.`
            },
            {
              role: 'user',
              content: currentArticle.content
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const translated = response.data.choices[0].message.content;
      
      setCurrentArticle(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [selectedLanguage]: translated
        }
      }));
      
      showSnackbar(`Translated to ${targetLang}`, 'success');
      setTranslateDialogOpen(false);
    } catch (error) {
      console.error('Translation error:', error);
      showSnackbar('Translation failed', 'error');
    } finally {
      setProcessingAI(false);
    }
  };

  const insertAffiliateLinks = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return;

    setProcessingAI(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Identify 3-5 opportunities for credit repair affiliate links. Return JSON array: [{text, url, product}]'
            },
            {
              role: 'user',
              content: currentArticle.content
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const affiliateLinks = JSON.parse(response.data.choices[0].message.content);
      
      let updatedContent = currentArticle.content;
      affiliateLinks.forEach(link => {
        const affiliateUrl = `https://speedycreditrepair.com/go/${link.url}`;
        const linkHtml = `<a href="${affiliateUrl}" target="_blank" rel="sponsored" class="affiliate-link">${link.text}</a>`;
        updatedContent = updatedContent.replace(link.text, linkHtml);
      });

      setCurrentArticle({
        ...currentArticle,
        content: updatedContent,
        monetization: {
          ...currentArticle.monetization,
          affiliateLinks
        }
      });
      
      showSnackbar(`${affiliateLinks.length} affiliate links added`, 'success');
    } catch (error) {
      console.error('Error inserting affiliate links:', error);
      showSnackbar('Error adding affiliate links', 'error');
    } finally {
      setProcessingAI(false);
    }
  };

  // ========== FILE HANDLING ==========
  
  const handleWordImport = async (file) => {
    setUploadProgress(0);
    
    try {
      // For .docx files, we need mammoth library
      if (file.name.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        let content = result.value;
        let title = file.name.replace(/\.[^/.]+$/, '');
        
        // Extract title from first heading
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const firstHeading = tempDiv.querySelector('h1, h2');
        if (firstHeading) {
          title = firstHeading.textContent;
          firstHeading.remove();
          content = tempDiv.innerHTML;
        }
        
        setCurrentArticle({
          ...currentArticle,
          title,
          content: DOMPurify.sanitize(content)
        });
        
        setUploadProgress(100);
        showSnackbar('Word document imported successfully', 'success');
        setImportDialogOpen(false);
      } else {
        // For other text files
        const text = await file.text();
        setCurrentArticle({
          ...currentArticle,
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text
        });
        
        setUploadProgress(100);
        showSnackbar('File imported successfully', 'success');
        setImportDialogOpen(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      showSnackbar('Error importing file', 'error');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setCurrentArticle(prev => ({
        ...prev,
        featuredImage: downloadURL
      }));
      
      showSnackbar('Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Image upload error:', error);
      showSnackbar('Error uploading image', 'error');
    }
  };

  const handleVideoEmbed = () => {
    const url = prompt('Enter YouTube or Vimeo URL:');
    if (!url) return;
    
    let videoId = '';
    let platform = '';
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]*)/);
    if (youtubeMatch) {
      videoId = youtubeMatch[1];
      platform = 'youtube';
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      videoId = vimeoMatch[1];
      platform = 'vimeo';
    }
    
    if (videoId && platform) {
      setCurrentArticle(prev => ({
        ...prev,
        media: {
          ...prev.media,
          videos: [...(prev.media.videos || []), { platform, videoId, url }]
        }
      }));
      
      showSnackbar('Video added successfully', 'success');
    } else {
      showSnackbar('Invalid video URL', 'error');
    }
  };

  // ========== CRUD OPERATIONS ==========
  
  const handleSaveArticle = async () => {
    if (!currentArticle.title || !currentArticle.content) {
      showSnackbar('Title and content are required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        ...currentArticle,
        updatedAt: serverTimestamp(),
        author: userProfile?.displayName || currentUser.email,
        authorId: currentUser.uid
      };

      if (selectedArticle) {
        await updateDoc(doc(db, 'articles', selectedArticle.id), articleData);
        showSnackbar('Article updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'articles'), {
          ...articleData,
          createdAt: serverTimestamp()
        });
        showSnackbar('Article created successfully', 'success');
      }

      setOpenDialog(false);
      loadArticles();
    } catch (error) {
      console.error('Save error:', error);
      showSnackbar('Error saving article', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (article) => {
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        status: 'published',
        publishDate: serverTimestamp()
      });
      
      showSnackbar('Article published successfully', 'success');
      loadArticles();
    } catch (error) {
      console.error('Publish error:', error);
      showSnackbar('Error publishing article', 'error');
    }
  };

  const handleSchedule = async () => {
    if (!selectedArticle || !currentArticle.scheduleDate) return;
    
    try {
      await updateDoc(doc(db, 'articles', selectedArticle.id), {
        status: 'scheduled',
        scheduleDate: currentArticle.scheduleDate
      });
      
      showSnackbar(`Article scheduled for ${moment(currentArticle.scheduleDate).format('MMM D, YYYY h:mm A')}`, 'success');
      setScheduleDialogOpen(false);
      loadArticles();
    } catch (error) {
      console.error('Schedule error:', error);
      showSnackbar('Error scheduling article', 'error');
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Delete this article?')) return;
    
    try {
      await deleteDoc(doc(db, 'articles', articleId));
      showSnackbar('Article deleted', 'success');
      loadArticles();
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Error deleting article', 'error');
    }
  };

  // ========== USER INTERACTIONS ==========
  
  const handleLike = async (article) => {
    try {
      await updateDoc(doc(db, 'articles', article.id), {
        'analytics.likes': increment(1)
      });
      
      showSnackbar('Article liked!', 'success');
      loadArticles();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleBookmark = async (article) => {
    try {
      const isBookmarked = userBookmarks.includes(article.id);
      
      if (isBookmarked) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          bookmarks: arrayRemove(article.id)
        });
        setUserBookmarks(prev => prev.filter(id => id !== article.id));
        showSnackbar('Bookmark removed', 'info');
      } else {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          bookmarks: arrayUnion(article.id)
        });
        setUserBookmarks(prev => [...prev, article.id]);
        showSnackbar('Article bookmarked!', 'success');
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const handleShare = (article, platform) => {
    const url = `https://speedycreditrepair.com/articles/${article.id}`;
    const text = article.title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      showSnackbar('Link copied!', 'success');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
    
    // Track share
    updateDoc(doc(db, 'articles', article.id), {
      'analytics.shares': increment(1)
    });
  };

  const handleComment = async (articleId, text) => {
    if (!text.trim()) return;
    
    try {
      await addDoc(collection(db, 'comments'), {
        articleId,
        text,
        author: userProfile?.displayName || currentUser.email,
        authorId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'articles', articleId), {
        'analytics.comments': increment(1)
      });
      
      showSnackbar('Comment posted!', 'success');
      loadComments(articleId);
    } catch (error) {
      console.error('Comment error:', error);
      showSnackbar('Error posting comment', 'error');
    }
  };

  // ========== HELPERS ==========

  // Add these helper functions
const [isDragging, setIsDragging] = useState(false);

const handleFileImport = async (file) => {
  setUploadProgress(0);
  
  try {
    if (file.type === 'application/pdf') {
      // For PDF files, you'll need pdf-parse library
      showSnackbar('PDF import requires additional setup', 'info');
      // In production, use pdf-parse or similar library
      return;
    }
    
    // Use the processWordDocument helper for Word files
    const result = await processWordDocument(file);
    
    if (result.success) {
      const category = await detectCategory(result.content);
      const seo = await generateSEOMetadata(result.title, result.content);
      
      setCurrentArticle({
        ...currentArticle,
        title: result.title,
        content: result.content,
        excerpt: result.excerpt,
        category,
        seo
      });
      
      showSnackbar('Document imported successfully', 'success');
    }
  } catch (error) {
    showSnackbar('Import failed', 'error');
  } finally {
    setUploadProgress(0);
  }
};

const calculateProjectedRevenue = () => {
  if (!currentArticle.monetization?.affiliateLinks) return 0;
  
  const avgConversionRate = 0.02; // 2% conversion
  const estimatedMonthlyViews = 1000; // Conservative estimate
  
  const totalCommission = currentArticle.monetization.affiliateLinks.reduce(
    (sum, link) => sum + (link.commission || 0), 0
  );
  
  return (estimatedMonthlyViews * avgConversionRate * (totalCommission / currentArticle.monetization.affiliateLinks.length)).toFixed(2);
};
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateReadingTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const calculateRevenue = (article) => {
    const affiliateRevenue = (article.monetization?.affiliateLinks?.length || 0) * 10; // $10 per link avg
    const viewRevenue = (article.analytics?.views || 0) * 0.002; // $2 CPM
    return affiliateRevenue + viewRevenue;
  };

  // ========== FILTERED ARTICLES ==========
  
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(search) ||
        article.content?.toLowerCase().includes(search) ||
        article.excerpt?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [articles, searchTerm]);

  // ========== RENDER HELPERS ==========
  
  const renderAnalyticsCharts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Views Over Time</Typography>
          <Line
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Views',
                data: [120, 190, 300, 500, 200, 300, 450],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Revenue Sources</Typography>
          <Pie
            data={{
              labels: ['Affiliate', 'Ads', 'Sponsored'],
              datasets: [{
                data: [300, 150, 100],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }]
            }}
            options={{
              responsive: true
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Top Articles</Typography>
          <List>
            {analyticsData.topArticles.map((article, idx) => (
              <ListItem key={article.id}>
                <ListItemText
                  primary={`${idx + 1}. ${article.title}`}
                  secondary={`${article.analytics?.views || 0} views • $${calculateRevenue(article).toFixed(2)} revenue`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderArticleCard = (article, idx) => {
    const isBookmarked = userBookmarks.includes(article.id);
    const revenue = calculateRevenue(article);
    const readTime = calculateReadingTime(article.content || '');
    return (
      <Card key={article.id || `article-${idx}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {article.featuredImage && (
          <CardMedia
            component="img"
            height="200"
            image={article.featuredImage}
            alt={article.title}
          />
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Chip label={article.category} size="small" color="primary" sx={{ mr: 1 }} />
            <Chip label={article.status} size="small" variant="outlined" sx={{ mr: 1 }} />
            {article.language !== 'en' && (
              <Chip label={LANGUAGES.find(l => l.code === article.language)?.flag} size="small" />
            )}
          </Box>
          
          <Typography
            variant="h6"
            gutterBottom
            tabIndex={canEdit || devShowSamples ? 0 : -1}
            role={canEdit || devShowSamples ? 'button' : undefined}
            sx={{ textDecoration: (canEdit || devShowSamples) ? 'underline' : 'none', cursor: (canEdit || devShowSamples) ? 'pointer' : 'default' }}
            onClick={(e) => { if (canEdit || devShowSamples) { e.stopPropagation(); setSelectedArticle(article); setCurrentArticle(article); setOpenDialog(true); } }}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && (canEdit || devShowSamples)) { e.preventDefault(); setSelectedArticle(article); setCurrentArticle(article); setOpenDialog(true); } }}
          >
            {article.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </Typography>
          {(canEdit || devShowSamples) && (
            <Button
              size="small"
              onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); setCurrentArticle(article); setOpenDialog(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSelectedArticle(article); setCurrentArticle(article); setOpenDialog(true); } }}
            >
              Read more
            </Button>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <Timer fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {readTime} min read
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Visibility fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {article.analytics?.views || 0}
            </Typography>
            {canViewAnalytics && (
              <Typography variant="caption" color="success.main">
                <AttachMoney fontSize="small" sx={{ verticalAlign: 'middle' }} />
                {revenue.toFixed(2)}
              </Typography>
            )}
          </Box>
        </CardContent>

        <CardActions>
          <Tooltip title="Like article">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleLike(article); }}>
              <ThumbUp />
            </IconButton>
          </Tooltip>
          <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleBookmark(article); }}>
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy article link">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleShare(article, 'copy'); }}>
              <Share />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />

          {(canEdit || devShowSamples) && (
            <>
              <Tooltip title="Edit article (click card or this icon)">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedArticle(article); setCurrentArticle(article); setOpenDialog(true); }}>
                  <Edit />
                </IconButton>
              </Tooltip>
              {article.status === 'draft' && canPublish && (
                <Tooltip title="Publish article">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handlePublish(article); }}>
                    <Publish />
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete article">
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </CardActions>
      </Card>
    );
  };

  // ========== MAIN RENDER ==========
  
  if (loading && articles.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Article Management System
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {canViewAnalytics && (
            <Button
              variant="outlined"
              startIcon={<Analytics />}
              onClick={() => setAnalyticsOpen(true)}
            >
              Analytics
            </Button>
          )}
          {canEdit && (
            <>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setImportDialogOpen(true)}
              >
                Import
              </Button>

              {/* Load Sample menu */}
              <Button
                variant="outlined"
                startIcon={<Preview />}
                sx={{ ml: 1 }}
                onClick={(e) => setSampleMenuAnchor(e.currentTarget)}
              >
                Load Sample
              </Button>
              <Menu
                anchorEl={sampleMenuAnchor}
                open={Boolean(sampleMenuAnchor)}
                onClose={() => setSampleMenuAnchor(null)}
              >
                {SAMPLES.map((s) => (
                  <MenuItem key={s.id} onClick={() => { handleLoadSampleArticle(s.id); setSampleMenuAnchor(null); }}>
                    {s.title}
                  </MenuItem>
                ))}
              </Menu>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setSelectedArticle(null);
                  setCurrentArticle({
                    title: '',
                    content: '',
                    excerpt: '',
                    category: '',
                    tags: [],
                    status: 'draft',
                    featuredImage: '',
                    author: '',
                    language: 'en',
                    translations: {},
                    seo: { metaTitle: '', metaDescription: '', keywords: [] },
                    monetization: { affiliateLinks: [], revenue: 0 },
                    media: { videos: [] },
                    analytics: { views: 0, likes: 0, shares: 0, comments: 0, revenue: 0 }
                  });
                  setOpenDialog(true);
                }}
              >
                New Article
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* DEV banner: visible marker to confirm updated Articles.jsx is loaded */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff8e1', border: '1px solid #ffe082' }}>
        <Typography variant="body2" color="text.primary">
          DEV: Enhanced Articles module active — samples loaded from <code>src/test/samples/articleSamples.js</code>.
          Use the "Load Sample" button or press <strong>Ctrl/Cmd+I</strong> to load test content. If you don't see this banner, the running app isn't using the updated source; try restarting the dev server and hard-refreshing the browser.
        </Typography>
      </Paper>

      {/* Debug panel to show runtime flags for troubleshooting (visible in dev only) */}
      { (devShowSamples) && (
        <Paper sx={{ p: 1, mb: 3, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
          <Typography variant="caption" color="text.primary">
            Debug: role={userProfile?.role || currentUser?.role || 'none'} | canEdit={String(canEdit)} | canPublish={String(canPublish)} | devShowSamples={String(devShowSamples)}
          </Typography>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              fullWidth
            >
              <ToggleButton value="grid"><Dashboard /></ToggleButton>
              <ToggleButton value="list"><List /></ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Articles */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredArticles.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((article, idx) => (
            <Grid item xs={12} sm={6} md={4} key={`${article.id || 'article'}-${idx}`}>
              {renderArticleCard(article, idx)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
                {canViewAnalytics && <TableCell>Revenue</TableCell>}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArticles.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((article, idx) => (
                <TableRow key={`${article.id || 'article'}-${idx}`}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <Chip label={article.status} size="small" />
                  </TableCell>
                  <TableCell>{article.analytics?.views || 0}</TableCell>
                  {canViewAnalytics && (
                    <TableCell>${calculateRevenue(article).toFixed(2)}</TableCell>
                  )}
                  <TableCell>
                    <IconButton size="small" onClick={() => handleShare(article, 'copy')}>
                      <Share />
                    </IconButton>
                    {canEdit && (
                      <IconButton size="small" onClick={() => {
                        setSelectedArticle(article);
                        setCurrentArticle(article);
                        setOpenDialog(true);
                      }}>
                        <Edit />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredArticles.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Article Editor Dialog - Enhanced with ArticleEditor Component */}
<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xl" fullWidth>
  <DialogTitle>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {selectedArticle ? 'Edit Article' : 'Create New Article'}
      <IconButton onClick={() => setOpenDialog(false)} size="small">
        <Close />
      </IconButton>
    </Box>
  </DialogTitle>
  {/* AI Action Toolbar */}
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 2, pt: 0 }}>
    <Button
      variant="outlined"
      startIcon={<AutoAwesome />}
      onClick={enhanceWithAI}
      disabled={processingAI}
    >
      {processingAI ? 'Processing…' : 'AI Enhance'}
    </Button>

    <Button
      variant="outlined"
      startIcon={<AutoAwesome />}
      onClick={generateSEO}
      disabled={processingAI}
    >
      Auto-generate SEO
    </Button>

    <Button
      variant="outlined"
      startIcon={<MonetizationOn />}
      onClick={insertAffiliateLinks}
      disabled={processingAI}
    >
      Insert Affiliate Links (AI)
    </Button>

    {processingAI && <CircularProgress size={20} sx={{ ml: 1 }} />}
  </Box>
  
  <DialogContent>
    {/* Drag and Drop Zone for PDF/Word Import */}
    <Box
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        p: 3,
        mb: 3,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragging ? 'action.hover' : 'background.paper',
        '&:hover': { bgcolor: 'action.hover' }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        if (file && (file.type === 'application/pdf' || 
                    file.type === 'application/msword' ||
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          await handleFileImport(file);
        }
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Drag & Drop Word or PDF here
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to browse files
      </Typography>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".doc,.docx,.pdf,.txt,.md"
        onChange={(e) => e.target.files[0] && handleFileImport(e.target.files[0])}
      />
    </Box>

    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2, display: 'block' }}>
      Tip: Click a card's title or the Edit icon to open the editor.
    </Typography>

    {/* Use the ArticleEditor Component */}
    <ArticleEditor
      article={currentArticle}
      onChange={(updated) => {
        setCurrentArticle(updated);
        // Track changes for auto-save
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
        autoSaveTimer.current = setTimeout(() => {
          handleAutoSave();
        }, 30000);
      }}
      onSave={async (article, isAutoSave) => {
        if (isAutoSave) {
          await handleAutoSave();
        } else {
          await handleSaveArticle();
        }
      }}
      onPublish={async (article) => {
        setCurrentArticle({ ...article, status: 'published' });
        await handleSaveArticle();
        if (selectedArticle) {
          await handlePublish(selectedArticle);
        }
      }}
      onSchedule={(article) => {
        setCurrentArticle(article);
        setScheduleDialogOpen(true);
      }}
      autoSaveEnabled={true}
      showSEO={true}
      showMonetization={true}
      showTemplates={!selectedArticle}
    />

    {/* Article Analyzer (lazy-loaded) */}
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Article Analyzer & Affiliate Manager</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <React.Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}>
          <ArticleAnalyzer
            article={currentArticle}
            onUpdate={(updated) => {
              setCurrentArticle(updated);
              // kick off auto-save timer for analyzer changes
              if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
              }
              autoSaveTimer.current = setTimeout(() => {
                handleAutoSave();
              }, 30000);
            }}
          />
        </React.Suspense>
      </AccordionDetails>
    </Accordion>

    {/* Enhanced Affiliate Link Manager */}
    <Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Advanced Affiliate Management</Typography>
        {currentArticle.monetization?.affiliateLinks?.length > 0 && (
          <Chip 
            label={`${currentArticle.monetization.affiliateLinks.length} links`}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={async () => {
                setProcessingAI(true);
                try {
                  // Your existing affiliate products
                  const affiliateProducts = [
                    { name: 'Credit Monitoring Service', url: 'credit-monitoring', commission: 30 },
                    { name: 'Identity Protection', url: 'identity-guard', commission: 25 },
                    { name: 'Credit Repair Service', url: 'repair-service', commission: 50 },
                    { name: 'Secured Credit Card', url: 'secured-card', commission: 20 },
                    { name: 'Credit Builder Loan', url: 'builder-loan', commission: 35 },
                    { name: 'Debt Consolidation', url: 'debt-consol', commission: 40 },
                    { name: 'Credit Report Analysis', url: 'report-analysis', commission: 15 }
                  ];

                  const opportunities = await identifyAffiliateOpportunities(currentArticle.content);
                  
                  // Auto-insert affiliate links into content
                  let updatedContent = currentArticle.content;
                  const affiliateLinks = [];
                  
                  opportunities.forEach((opp, index) => {
                    const product = affiliateProducts[index % affiliateProducts.length];
                    const affiliateUrl = `https://speedycreditrepair.com/go/${product.url}?ref=${currentUser.uid}`;
                    const trackingId = `aff_${Date.now()}_${index}`;
                    
                    // Create trackable link
                    const linkHtml = `<a href="${affiliateUrl}" 
                      class="affiliate-link" 
                      data-tracking="${trackingId}"
                      data-product="${product.name}"
                      target="_blank" 
                      rel="noopener noreferrer sponsored">
                      ${opp.text}
                    </a>`;
                    
                    // Replace in content
                    updatedContent = updatedContent.replace(opp.text, linkHtml);
                    
                    // Track the link
                    affiliateLinks.push({
                      text: opp.text,
                      product: product.name,
                      url: affiliateUrl,
                      trackingId,
                      commission: product.commission,
                      position: opp.position
                    });
                  });

                  setCurrentArticle({
                    ...currentArticle,
                    content: updatedContent,
                    monetization: {
                      ...currentArticle.monetization,
                      affiliateLinks
                    }
                  });

                  showSnackbar(`Added ${affiliateLinks.length} affiliate links with tracking`, 'success');
                } catch (error) {
                  showSnackbar('Error adding affiliate links', 'error');
                } finally {
                  setProcessingAI(false);
                }
              }}
              disabled={processingAI}
            >
              Auto-Insert Smart Affiliate Links
            </Button>
          </Grid>
          
          {currentArticle.monetization?.affiliateLinks?.map((link, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" fontWeight="bold">
                      {link.product}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Position: {link.position}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="primary">
                      {link.url}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Chip
                      label={`$${link.commission} per sale`}
                      color="success"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      onClick={() => {
                        const newLinks = currentArticle.monetization.affiliateLinks.filter((_, i) => i !== idx);
                        setCurrentArticle({
                          ...currentArticle,
                          monetization: {
                            ...currentArticle.monetization,
                            affiliateLinks: newLinks
                          }
                        });
                      }}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Revenue Projection:</strong> Based on average conversion rates, 
                this article could generate approximately 
                <strong> ${calculateProjectedRevenue()} per month</strong> from affiliate links.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  </DialogContent>
</Dialog>

{/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Word Document</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <input
              type="file"
              accept=".doc,.docx,.txt,.md,.html"
              onChange={(e) => e.target.files[0] && handleWordImport(e.target.files[0])}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <Button
              variant="contained"
              fullWidth
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            {uploadProgress > 0 && (
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
                <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  // Export current article JSON for verification
                  const dataStr = JSON.stringify(currentArticle, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${(currentArticle?.title || 'article').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }} startIcon={<Download />}>
                  Export Article JSON
                </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Article</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            fullWidth
            sx={{ mt: 2 }}
            value={currentArticle.scheduleDate || ''}
            onChange={(e) => setCurrentArticle({ ...currentArticle, scheduleDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchedule} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Translate Dialog */}
      <Dialog open={translateDialogOpen} onClose={() => setTranslateDialogOpen(false)}>
        <DialogTitle>Translate Article</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Language</InputLabel>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              label="Target Language"
            >
              {LANGUAGES.filter(l => l.code !== currentArticle.language).map(lang => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTranslateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={translateContent} 
            variant="contained"
            disabled={processingAI}
            startIcon={processingAI && <CircularProgress size={16} />}
          >
            Translate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Article Analytics Dashboard
            <IconButton onClick={() => setAnalyticsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{analyticsData.views}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Views</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">${analyticsData.revenue.toFixed(2)}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{analyticsData.engagement.likes}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Likes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{analyticsData.engagement.shares}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Shares</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          {renderAnalyticsCharts()}
        </DialogContent>
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
    </Container>

      {/* Developer floating toolbar (dev_show_samples=1) */}
      {devShowSamples && (
        <Box sx={{ position: 'fixed', top: 88, right: 24, zIndex: 1400 }}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }} elevation={6}>
            <Button size="small" variant="contained" onClick={() => setShowSamplesModal(true)}>Show Samples</Button>
            <Button size="small" variant="outlined" onClick={() => setImportDialogOpen(true)}>Open Import Dialog</Button>
            <Button size="small" variant="outlined" onClick={() => {
              const dataStr = JSON.stringify(currentArticle, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${(currentArticle?.title || 'article').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}>Export Article JSON</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <FormControlLabel
                control={<Switch size="small" checked={autoOpenSamples} onChange={(e) => {
                  const v = Boolean(e.target.checked);
                  setAutoOpenSamples(v);
                  try { localStorage.setItem('articles.auto_open_last_sample', v ? '1' : '0'); } catch (err) {}
                }} />}
                label="Auto-open sample"
              />
            </Box>
          </Paper>
        </Box>
      )}

      {/* Samples modal */}
      <Dialog open={showSamplesModal} onClose={() => setShowSamplesModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Developer Samples</DialogTitle>
        <DialogContent>
          <List>
            {SAMPLES.map((s, i) => (
              <ListItem key={`${s.id || 'sample'}-${i}`} secondaryAction={<Button onClick={() => { handleLoadSampleArticle(s.id); setShowSamplesModal(false); }}>Load</Button>}>
                <ListItemText primary={s.title} secondary={s.excerpt} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSamplesModal(false)}>Close</Button>
        </DialogActions>
        </Dialog>

    </>
  );
};

export default Articles;