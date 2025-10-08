// src/pages/DocumentCenter.jsx - AI-Powered Enterprise Document Management Hub
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, Snackbar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton, Stack, Tooltip,
  Menu, MenuItem, FormControl, InputLabel, Select, Autocomplete,
  LinearProgress, Avatar, List, ListItem, ListItemText, ListItemIcon,
  Divider, InputAdornment, ToggleButton, ToggleButtonGroup, Badge,
  Breadcrumbs, Link as MuiLink, CircularProgress, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Stepper, Step, StepLabel,
  CardHeader, CardActions, Collapse, Rating, SpeedDial, SpeedDialAction,
  SpeedDialIcon, Drawer, ListItemButton, Checkbox, FormGroup
} from '@mui/material';
import {
  FileText, Download, Upload, Eye, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Search, Filter, X, Plus,
  RefreshCw, BarChart2, PieChart, Calendar, User, Building2,
  CreditCard, DollarSign, FileSpreadsheet, Mail, Send, Share2,
  ArrowUp, ArrowDown, Minus, Info, ExternalLink, History,
  Target, Zap, Award, Activity, Edit, Trash2, FolderOpen,
  File, MoreVertical, Tag,
  Brain, Sparkles, Lock, Shield, Layers, Settings,
  Grid as GridIcon, List as ListIcon, FolderPlus,
  ChevronDown, ArrowRight, Archive, FileCheck2
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import OpenAI from 'openai';

const DocumentCenter = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);

  // Initialize OpenAI
  const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [versions, setVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date_desc');
  
  // Dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [aiAnalysisDialogOpen, setAiAnalysisDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContact, setFilterContact] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({ start: null, end: null });
  const [filterTags, setFilterTags] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    file: null,
    name: '',
    type: 'general',
    contact: null,
    folder: null,
    tags: [],
    description: '',
    category: 'general',
    aiAutoProcess: true,
    aiAutoTag: true,
    aiAutoSummarize: true,
    expirationDate: null,
    reminderDays: null,
    isConfidential: false,
    requiresSignature: false
  });

  // Folder Form
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder',
    permissions: 'private',
    autoArchiveDays: null
  });

  // Share Form
  const [shareForm, setShareForm] = useState({
    document: null,
    shareWith: [],
    permissions: 'view',
    expiresAt: null,
    requirePassword: false,
    password: '',
    allowDownload: true,
    notifyRecipients: true
  });

  // Template Form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'agreement',
    content: '',
    variables: [],
    aiGenerate: false,
    aiPrompt: ''
  });

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    autoCategorizeDocs: true,
    autoExtractData: true,
    autoSummarize: true,
    autoTag: true,
    intelligentSearch: true,
    contentAnalysis: true,
    smartRecommendations: true,
    sentimentAnalysis: false
  });

  // Batch Operations
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Document Types with AI Enhancement Flags
  const documentTypes = {
    agreement: { 
      label: 'Service Agreement', 
  icon: FileCheck2, 
      color: '#10B981', 
      route: '/full-agreement',
      aiProcessable: true,
      requiresReview: true
    },
    addendum: { 
      label: 'Addendum', 
      icon: Layers, 
      color: '#F59E0B', 
      route: '/addendums',
      aiProcessable: true,
      requiresReview: true
    },
    poa: { 
      label: 'Power of Attorney', 
      icon: Shield, 
      color: '#EF4444', 
      route: '/power-of-attorney',
      aiProcessable: true,
      requiresReview: true
    },
    ach: { 
      label: 'ACH Authorization', 
      icon: CreditCard, 
      color: '#3B82F6', 
      route: '/ach-authorization',
      aiProcessable: true,
      requiresReview: true
    },
    info_sheet: { 
      label: 'Information Sheet', 
      icon: FileText, 
      color: '#8B5CF6', 
      route: '/information-sheet',
      aiProcessable: true,
      requiresReview: false
    },
    contract: { 
      label: 'E-Contract', 
  icon: FileCheck2, 
      color: '#06B6D4',
      aiProcessable: true,
      requiresReview: true
    },
    form: { 
      label: 'Form', 
      icon: File, 
      color: '#EC4899',
      aiProcessable: true,
      requiresReview: false
    },
    letter: { 
      label: 'Letter', 
      icon: Mail, 
      color: '#84CC16',
      aiProcessable: true,
      requiresReview: false
    },
    dispute: {
      label: 'Dispute Letter',
      icon: FileText,
      color: '#F43F5E',
      aiProcessable: true,
      requiresReview: true
    },
    report: {
      label: 'Credit Report',
      icon: BarChart2,
      color: '#14B8A6',
      aiProcessable: true,
      requiresReview: false
    },
    invoice: {
      label: 'Invoice',
      icon: DollarSign,
      color: '#F59E0B',
      aiProcessable: true,
      requiresReview: false
    },
    receipt: {
      label: 'Receipt',
  icon: FileCheck2,
      color: '#10B981',
      aiProcessable: true,
      requiresReview: false
    },
    general: { 
      label: 'General Document', 
      icon: FileText, 
      color: '#6B7280',
      aiProcessable: true,
      requiresReview: false
    }
  };

  // Quick Actions with AI
  const quickActions = [
    { 
      id: 'ai-generate', 
      label: 'AI Generate Doc', 
      icon: Sparkles, 
      color: 'secondary',
      action: () => handleAiGenerateDocument()
    },
    { 
      id: 'new-agreement', 
      label: 'New Agreement', 
      icon: FileCheck2, 
      color: 'success',
      action: () => navigate('/full-agreement')
    },
    { 
      id: 'new-addendum', 
      label: 'New Addendum', 
      icon: Layers, 
      color: 'warning',
      action: () => navigate('/addendums')
    },
    { 
      id: 'batch-upload', 
      label: 'Batch Upload', 
      icon: Upload, 
      color: 'info',
      action: () => handleBatchUpload()
    },
    { 
      id: 'upload', 
      label: 'Upload Document', 
      icon: Upload, 
      color: 'primary',
      action: () => setUploadDialogOpen(true)
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: Brain,
      color: 'secondary',
      action: () => handleShowAiInsights()
    }
  ];

  // Load All Data
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load documents
        const docsQuery = query(
          collection(db, 'documents'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
          const docsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDocuments(docsData);
          setLoading(false);
        });

        // Load folders
        const foldersQuery = query(
          collection(db, 'folders'),
          where('userId', '==', currentUser.uid)
        );
        
        const unsubFolders = onSnapshot(foldersQuery, (snapshot) => {
          const foldersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setFolders(foldersData);
        });

        // Load contacts
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('userId', '==', currentUser.uid)
        );
        
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          displayName: doc.data().name || `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim()
        }));
        setContacts(contactsData);

        // Load templates
        const templatesQuery = query(
          collection(db, 'document_templates'),
          where('userId', '==', currentUser.uid)
        );
        
        const templatesSnapshot = await getDocs(templatesQuery);
        const templatesData = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTemplates(templatesData);

        // Load audit logs
        const auditQuery = query(
          collection(db, 'document_audit'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        
        const auditSnapshot = await getDocs(auditQuery);
        const auditData = auditSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAuditLogs(auditData);

        return () => {
          unsubDocs();
          unsubFolders();
        };
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Error loading documents', 'error');
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // AI: Auto-categorize document on upload
  const aiCategorizeDocument = async (fileName, fileType) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document classification expert. Analyze the filename and file type to categorize documents accurately."
        }, {
          role: "user",
          content: `Categorize this document: "${fileName}" (${fileType}). Return ONLY one of these categories: agreement, addendum, poa, ach, info_sheet, contract, form, letter, dispute, report, invoice, receipt, general`
        }],
        temperature: 0.3,
        max_tokens: 50
      });

      const category = response.choices[0].message.content.trim().toLowerCase();
      return Object.keys(documentTypes).includes(category) ? category : 'general';
    } catch (error) {
      console.error('AI categorization error:', error);
      return 'general';
    }
  };

  // AI: Auto-generate tags for document
  const aiGenerateTags = async (fileName, description, category) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document tagging expert. Generate relevant, concise tags for documents."
        }, {
          role: "user",
          content: `Generate 3-5 relevant tags for this document:
          Filename: ${fileName}
          Category: ${category}
          Description: ${description || 'N/A'}
          
          Return ONLY comma-separated tags, no explanations.`
        }],
        temperature: 0.5,
        max_tokens: 100
      });

      const tagsString = response.choices[0].message.content.trim();
      return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('AI tag generation error:', error);
      return [];
    }
  };

  // AI: Extract key data from document
  const aiExtractDocumentData = async (documentText) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document analysis expert. Extract key information from documents in a structured format."
        }, {
          role: "user",
          content: `Extract key information from this document text. Return as JSON with these fields: names (array), dates (array), amounts (array), important_terms (array), summary (string, max 100 words).

Document text:
${documentText.substring(0, 3000)}...`
        }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI data extraction error:', error);
      return null;
    }
  };

  // AI: Generate document summary
  const aiSummarizeDocument = async (documentText) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document summarization expert. Create clear, concise summaries."
        }, {
          role: "user",
          content: `Summarize this document in 2-3 sentences:

${documentText.substring(0, 3000)}...`
        }],
        temperature: 0.5,
        max_tokens: 150
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI summarization error:', error);
      return null;
    }
  };

  // AI: Intelligent document search
  const aiSmartSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return documents;

    try {
      setAiProcessing(true);

      // Get embeddings for search query
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: searchQuery
      });

      // In production, you'd compare embeddings with stored document embeddings
      // For now, use semantic search via GPT
      const semanticResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a search assistant. Given a search query, determine which document attributes would match."
        }, {
          role: "user",
          content: `User is searching for: "${searchQuery}"
          
Available documents: ${JSON.stringify(documents.map(d => ({ 
  id: d.id, 
  name: d.name, 
  type: d.type, 
  description: d.description,
  tags: d.tags 
})))}

Return an array of document IDs that match this search, considering semantic meaning. Return as JSON array of IDs.`
        }],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const results = JSON.parse(semanticResponse.choices[0].message.content);
      const matchingIds = results.documentIds || results.ids || [];

      setAiProcessing(false);
      return documents.filter(doc => matchingIds.includes(doc.id));

    } catch (error) {
      console.error('AI search error:', error);
      setAiProcessing(false);
      // Fallback to regular search
      return documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  };

  // AI: Generate document from prompt
  const handleAiGenerateDocument = async () => {
    const prompt = window.prompt('Describe the document you want to generate:');
    if (!prompt) return;

    setAiProcessing(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a professional document writer specializing in credit repair and financial services. Generate complete, professional documents."
        }, {
          role: "user",
          content: `Generate a professional document based on this request: ${prompt}
          
Include all necessary sections, legal language where appropriate, and professional formatting.`
        }],
        temperature: 0.7,
        max_tokens: 2000
      });

      const generatedContent = response.choices[0].message.content;

      // Open template dialog with generated content
      setTemplateForm({
        name: 'AI Generated Document',
        type: 'general',
        content: generatedContent,
        variables: [],
        aiGenerate: false,
        aiPrompt: prompt
      });
      setTemplateDialogOpen(true);

    } catch (error) {
      console.error('AI generation error:', error);
      showSnackbar('Error generating document', 'error');
    } finally {
      setAiProcessing(false);
    }
  };

  // AI: Analyze document for insights
  const handleAiAnalyzeDocument = async (document) => {
    setAiProcessing(true);
    setSelectedDocument(document);
    setAiAnalysisDialogOpen(true);

    try {
      // Simulate getting document text (in production, you'd use OCR or PDF parsing)
      const documentText = `Document: ${document.name}\nType: ${document.type}\nDescription: ${document.description || 'N/A'}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document analysis expert. Provide comprehensive insights about documents including risks, compliance, and recommendations."
        }, {
          role: "user",
          content: `Analyze this document and provide:
1. Key insights
2. Potential issues or risks
3. Compliance considerations
4. Recommendations for improvement

Document info:
${documentText}

Return as JSON with fields: insights (array), risks (array), compliance (array), recommendations (array)`
        }],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      setAiAnalysis(analysis);

    } catch (error) {
      console.error('AI analysis error:', error);
      showSnackbar('Error analyzing document', 'error');
      setAiAnalysis({
        insights: ['Unable to analyze document at this time'],
        risks: [],
        compliance: [],
        recommendations: []
      });
    } finally {
      setAiProcessing(false);
    }
  };

  // AI: Get smart recommendations
  const handleShowAiInsights = async () => {
    setAiProcessing(true);
    setAiInsightsOpen(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a document management consultant. Analyze document collections and provide actionable insights."
        }, {
          role: "user",
          content: `Analyze this document collection and provide insights:

Total documents: ${documents.length}
Types: ${Object.entries(
  documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {})
).map(([type, count]) => `${type}: ${count}`).join(', ')}

Provide:
1. Organization suggestions
2. Missing document types
3. Compliance recommendations
4. Workflow improvements
5. Risk areas

Return as JSON with these fields as arrays.`
        }],
        temperature: 0.6,
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const insights = JSON.parse(response.choices[0].message.content);
      setAiSuggestions(insights);

    } catch (error) {
      console.error('AI insights error:', error);
      showSnackbar('Error generating insights', 'error');
    } finally {
      setAiProcessing(false);
    }
  };

  // Handle File Upload with AI Processing
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadForm(prev => ({
      ...prev,
      file,
      name: file.name.split('.')[0]
    }));

    // AI auto-categorize if enabled
    if (uploadForm.aiAutoProcess) {
      setAiProcessing(true);
      const category = await aiCategorizeDocument(file.name, file.type);
      setUploadForm(prev => ({ ...prev, type: category }));
      setAiProcessing(false);
    }

    // AI auto-tag if enabled
    if (uploadForm.aiAutoTag) {
      setAiProcessing(true);
      const tags = await aiGenerateTags(file.name, '', uploadForm.type);
      setUploadForm(prev => ({ ...prev, tags }));
      setAiProcessing(false);
    }
  };

  // Upload Document with Full AI Processing
  const handleUploadDocument = async () => {
    if (!uploadForm.file) {
      showSnackbar('Please select a file', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Upload file to storage
      const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${uploadForm.file.name}`);
      await uploadBytes(fileRef, uploadForm.file);
      const fileUrl = await getDownloadURL(fileRef);

      // AI Processing
      let aiData = {};
      if (uploadForm.aiAutoProcess) {
        setAiProcessing(true);
        
        // In production, you'd extract text from PDF/images using OCR
        // For now, we'll use filename and description
        const mockText = `${uploadForm.name} ${uploadForm.description}`;
        
        if (uploadForm.aiAutoSummarize) {
          aiData.summary = await aiSummarizeDocument(mockText);
        }
        
        if (uploadForm.aiAutoTag && uploadForm.tags.length === 0) {
          aiData.tags = await aiGenerateTags(uploadForm.name, uploadForm.description, uploadForm.type);
        }

        setAiProcessing(false);
      }

      // Save document metadata
      const docData = {
        userId: currentUser.uid,
        name: uploadForm.name,
        type: uploadForm.type,
        category: uploadForm.category,
        contactId: uploadForm.contact?.id,
        contactName: uploadForm.contact?.displayName,
        folderId: uploadForm.folder?.id,
        folderName: uploadForm.folder?.name,
        fileUrl,
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        fileType: uploadForm.file.type,
        tags: aiData.tags || uploadForm.tags,
        description: uploadForm.description,
        summary: aiData.summary,
        status: uploadForm.requiresSignature ? 'pending_signature' : 'uploaded',
        isConfidential: uploadForm.isConfidential,
        expirationDate: uploadForm.expirationDate,
        reminderDays: uploadForm.reminderDays,
        aiProcessed: uploadForm.aiAutoProcess,
        version: 1,
        versions: [{
          version: 1,
          uploadedAt: Timestamp.now(),
          uploadedBy: currentUser.uid,
          fileUrl,
          changes: 'Initial upload'
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'documents'), docData);

      // Log audit trail
      await addDoc(collection(db, 'document_audit'), {
        documentId: docRef.id,
        userId: currentUser.uid,
        action: 'upload',
        details: `Uploaded document: ${uploadForm.name}`,
        timestamp: Timestamp.now()
      });
      
      showSnackbar('Document uploaded successfully!', 'success');
      setUploadDialogOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading document:', error);
      showSnackbar('Error uploading document', 'error');
    } finally {
      setLoading(false);
      setAiProcessing(false);
    }
  };

  // Batch Upload with AI Processing
  const handleBatchUpload = () => {
    batchInputRef.current?.click();
  };

  const handleBatchFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setBatchMode(true);
    setBatchFiles(files);
    setLoading(true);

    try {
      for (const file of files) {
        // Auto-categorize each file
        const category = await aiCategorizeDocument(file.name, file.type);
        const tags = await aiGenerateTags(file.name, '', category);

        // Upload file
        const fileRef = ref(storage, `documents/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);

        // Save to Firestore
        await addDoc(collection(db, 'documents'), {
          userId: currentUser.uid,
          name: file.name.split('.')[0],
          type: category,
          category: category,
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          tags,
          status: 'uploaded',
          aiProcessed: true,
          version: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: currentUser.uid
        });
      }

      showSnackbar(`${files.length} documents uploaded successfully!`, 'success');
      setBatchMode(false);
      setBatchFiles([]);
    } catch (error) {
      console.error('Error batch uploading:', error);
      showSnackbar('Error uploading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create Folder
  const handleCreateFolder = async () => {
    if (!folderForm.name) {
      showSnackbar('Please enter folder name', 'warning');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'folders'), {
        userId: currentUser.uid,
        name: folderForm.name,
        description: folderForm.description,
        color: folderForm.color,
        icon: folderForm.icon,
        permissions: folderForm.permissions,
        autoArchiveDays: folderForm.autoArchiveDays,
        documentCount: 0,
        createdAt: Timestamp.now()
      });

      showSnackbar('Folder created successfully!', 'success');
      setFolderDialogOpen(false);
      setFolderForm({ 
        name: '', 
        description: '', 
        color: '#3B82F6', 
        icon: 'folder',
        permissions: 'private',
        autoArchiveDays: null
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      showSnackbar('Error creating folder', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Share Document
  const handleShareDocument = async () => {
    if (!shareForm.document || shareForm.shareWith.length === 0) {
      showSnackbar('Please select document and recipients', 'warning');
      return;
    }

    setLoading(true);
    try {
      const shareData = {
        documentId: shareForm.document.id,
        documentName: shareForm.document.name,
        sharedBy: currentUser.uid,
        sharedWith: shareForm.shareWith.map(c => c.id),
        permissions: shareForm.permissions,
        expiresAt: shareForm.expiresAt,
        requirePassword: shareForm.requirePassword,
        password: shareForm.password,
        allowDownload: shareForm.allowDownload,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'document_shares'), shareData);

      // Log audit
      await addDoc(collection(db, 'document_audit'), {
        documentId: shareForm.document.id,
        userId: currentUser.uid,
        action: 'share',
        details: `Shared with ${shareForm.shareWith.length} recipient(s)`,
        timestamp: Timestamp.now()
      });

      // Send notifications if enabled
      if (shareForm.notifyRecipients) {
        // In production, send email/SMS notifications
        console.log('Sending share notifications...');
      }

      showSnackbar('Document shared successfully!', 'success');
      setShareDialogOpen(false);
    } catch (error) {
      console.error('Error sharing document:', error);
      showSnackbar('Error sharing document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) return;

    setLoading(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', docId));
      
      // Delete from Storage
      if (fileUrl) {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      }

      // Log audit
      await addDoc(collection(db, 'document_audit'), {
        documentId: docId,
        userId: currentUser.uid,
        action: 'delete',
        details: 'Document deleted',
        timestamp: Timestamp.now()
      });

      showSnackbar('Document deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting document:', error);
      showSnackbar('Error deleting document', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) {
      showSnackbar('No documents selected', 'warning');
      return;
    }

    if (!window.confirm(`Delete ${selectedDocuments.length} document(s)? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      for (const docId of selectedDocuments) {
        const docToDelete = documents.find(d => d.id === docId);
        if (docToDelete) {
          batch.delete(doc(db, 'documents', docId));
          
          // Delete from storage
          if (docToDelete.fileUrl) {
            const fileRef = ref(storage, docToDelete.fileUrl);
            await deleteObject(fileRef);
          }
        }
      }

      await batch.commit();
      setSelectedDocuments([]);
      showSnackbar(`${selectedDocuments.length} document(s) deleted`, 'success');
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showSnackbar('Error deleting documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Move to Folder (Bulk)
  const handleBulkMoveToFolder = async (folderId) => {
    if (selectedDocuments.length === 0) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const folder = folders.find(f => f.id === folderId);

      for (const docId of selectedDocuments) {
        batch.update(doc(db, 'documents', docId), {
          folderId: folder.id,
          folderName: folder.name,
          updatedAt: Timestamp.now()
        });
      }

      await batch.commit();
      setSelectedDocuments([]);
      showSnackbar(`Moved ${selectedDocuments.length} document(s)`, 'success');
    } catch (error) {
      console.error('Error moving documents:', error);
      showSnackbar('Error moving documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create Document Version
  const handleCreateVersion = async (documentId, changes) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();

      const newVersion = {
        version: (docData.version || 1) + 1,
        uploadedAt: Timestamp.now(),
        uploadedBy: currentUser.uid,
        fileUrl: docData.fileUrl,
        changes
      };

      await updateDoc(docRef, {
        version: newVersion.version,
        versions: [...(docData.versions || []), newVersion],
        updatedAt: Timestamp.now()
      });

      // Log audit
      await addDoc(collection(db, 'document_audit'), {
        documentId,
        userId: currentUser.uid,
        action: 'version_create',
        details: `Created version ${newVersion.version}: ${changes}`,
        timestamp: Timestamp.now()
      });

      showSnackbar('New version created', 'success');
    } catch (error) {
      console.error('Error creating version:', error);
      showSnackbar('Error creating version', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send Document
  const handleSendDocument = (document) => {
    navigate('/e-documents', { state: { documentId: document.id } });
  };

  // Reset Forms
  const resetUploadForm = () => {
    setUploadForm({
      file: null,
      name: '',
      type: 'general',
      contact: null,
      folder: null,
      tags: [],
      description: '',
      category: 'general',
      aiAutoProcess: true,
      aiAutoTag: true,
      aiAutoSummarize: true,
      expirationDate: null,
      reminderDays: null,
      isConfidential: false,
      requiresSignature: false
    });
  };

  // Show Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Advanced Search with AI
  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (aiSettings.intelligentSearch && term.length > 3) {
      // Use AI semantic search
      const results = await aiSmartSearch(term);
      // In production, you'd set filtered results
      console.log('AI Search results:', results);
    }
  };

  // Filter Documents
  const filteredDocuments = documents.filter(doc => {
    if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !(doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))) {
      return false;
    }
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (filterContact && doc.contactId !== filterContact.id) return false;
    if (selectedFolder && doc.folderId !== selectedFolder.id) return false;
    if (filterTags.length > 0 && !filterTags.some(tag => doc.tags?.includes(tag))) return false;
    return true;
  });

  // Sort Documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return b.createdAt?.toMillis() - a.createdAt?.toMillis();
      case 'date_asc':
        return a.createdAt?.toMillis() - b.createdAt?.toMillis();
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'size_desc':
        return b.fileSize - a.fileSize;
      case 'size_asc':
        return a.fileSize - b.fileSize;
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb > 1) return `${gb.toFixed(2)} GB`;
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  // Statistics
  const stats = {
    total: documents.length,
    folders: folders.length,
    pending: documents.filter(d => d.status === 'pending' || d.status === 'pending_signature').length,
    signed: documents.filter(d => d.status === 'signed').length,
    confidential: documents.filter(d => d.isConfidential).length,
    aiProcessed: documents.filter(d => d.aiProcessed).length
  };

  // Get all unique tags
  const allTags = [...new Set(documents.flatMap(d => d.tags || []))];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              <Brain size={32} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              AI-Powered Document Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intelligent document management with AI categorization, analysis, and insights
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="AI Insights">
              <IconButton 
                color="secondary" 
                onClick={handleShowAiInsights}
                sx={{ bgcolor: 'secondary.light' }}
              >
                <Sparkles />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsDialogOpen(true)}>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={() => window.location.reload()}>
                <RefreshCw />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* AI Processing Indicator */}
      {aiProcessing && (
        <Alert severity="info" icon={<Brain />} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={16} />
            <Typography variant="body2">AI is processing your request...</Typography>
          </Stack>
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={6} md={2} key={action.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={action.action}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: `${action.color}.main` }}>
                      <Icon size={24} />
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {action.label}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                  <FileText size={20} color="#3B82F6" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Folders</Typography>
                  <FolderOpen size={20} color="#10B981" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.folders}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Pending</Typography>
                  <Clock size={20} color="#F59E0B" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.pending}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Signed</Typography>
                  <CheckCircle size={20} color="#10B981" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.signed}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Confidential</Typography>
                  <Lock size={20} color="#EF4444" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.confidential}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={2}>
          <Card sx={{ bgcolor: 'secondary.light' }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">AI Processed</Typography>
                  <Brain size={20} color="#8B5CF6" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.aiProcessed}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              placeholder="Search documents... (AI-powered)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                    {aiSettings.intelligentSearch ? (
                      <Sparkles size={20} color="#8B5CF6" />
                    ) : (
                      <Search size={20} />
                    )}
                  </Stack>
                )
              }}
            />
          </Grid>

          <Grid item xs={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {Object.entries(documentTypes).map(([key, type]) => (
                  <MenuItem key={key} value={key}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="uploaded">Uploaded</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="pending_signature">Pending Signature</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <Autocomplete
              size="small"
              options={allTags}
              multiple
              value={filterTags}
              onChange={(e, value) => setFilterTags(value)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by Tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    size="small"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="date_desc">Newest First</MenuItem>
                <MenuItem value="date_asc">Oldest First</MenuItem>
                <MenuItem value="name_asc">Name A-Z</MenuItem>
                <MenuItem value="name_desc">Name Z-A</MenuItem>
                <MenuItem value="size_desc">Largest First</MenuItem>
                <MenuItem value="size_asc">Smallest First</MenuItem>
                <MenuItem value="type">By Type</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2.5}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridIcon size={18} />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListIcon size={18} />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<FolderPlus size={18} />}
                onClick={() => setFolderDialogOpen(true)}
              >
                Folder
              </Button>

              {selectedDocuments.length > 0 && (
                <Chip
                  label={`${selectedDocuments.length} selected`}
                  onDelete={() => setSelectedDocuments([])}
                  color="primary"
                />
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<Trash2 size={16} />}
                onClick={handleBulkDelete}
                color="error"
              >
                Delete Selected
              </Button>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Move to Folder</InputLabel>
                <Select
                  label="Move to Folder"
                  onChange={(e) => handleBulkMoveToFolder(e.target.value)}
                  defaultValue=""
                >
                  {folders.map(folder => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                size="small"
                startIcon={<Archive size={16} />}
                onClick={() => {
                  // Handle bulk archive
                  showSnackbar('Bulk archive feature coming soon', 'info');
                }}
              >
                Archive
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Breadcrumbs */}
      {selectedFolder && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => setSelectedFolder(null)}
              sx={{ cursor: 'pointer' }}
            >
              All Documents
            </MuiLink>
            <Typography variant="body2" color="text.primary">
              {selectedFolder.name}
            </Typography>
          </Breadcrumbs>
        </Box>
      )}

      {/* Documents Grid/List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {/* Folders First */}
          {!selectedFolder && folders.map((folder) => (
            <Grid item xs={12} sm={6} md={3} key={folder.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                    borderColor: folder.color
                  }
                }}
                onClick={() => setSelectedFolder(folder)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <FolderOpen size={40} color={folder.color} />
                      <IconButton size="small">
                        <MoreVertical size={16} />
                      </IconButton>
                    </Stack>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {folder.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {documents.filter(d => d.folderId === folder.id).length} documents
                      </Typography>
                    </Box>
                    {folder.description && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {folder.description}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Documents */}
          {sortedDocuments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((doc) => {
              const docType = documentTypes[doc.type] || documentTypes.general;
              const DocIcon = docType.icon;
              const isSelected = selectedDocuments.includes(doc.id);

              return (
                <Grid item xs={12} sm={6} md={3} key={doc.id}>
                  <Card
                    sx={{
                      transition: 'all 0.2s',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Header with selection */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDocuments([...selectedDocuments, doc.id]);
                                } else {
                                  setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                                }
                              }}
                            />
                            <Badge
                              badgeContent={
                                doc.aiProcessed ? <Sparkles size={12} /> : null
                              }
                              color="secondary"
                            >
                              <Avatar sx={{ bgcolor: docType.color }}>
                                <DocIcon size={24} />
                              </Avatar>
                            </Badge>
                          </Stack>

                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="AI Analyze">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleAiAnalyzeDocument(doc)}
                              >
                                <Brain size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Document Info */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                            {doc.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                            <Chip label={docType.label} size="small" />
                            {doc.isConfidential && (
                              <Chip
                                icon={<Lock size={12} />}
                                label="Confidential"
                                size="small"
                                color="error"
                              />
                            )}
                          </Stack>
                        </Box>

                        {/* Summary (AI Generated) */}
                        {doc.summary && (
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {doc.summary}
                          </Typography>
                        )}

                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {doc.tags.slice(0, 3).map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {doc.tags.length > 3 && (
                              <Chip
                                label={`+${doc.tags.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        )}

                        {/* Contact */}
                        {doc.contactName && (
                          <Chip
                            icon={<User size={14} />}
                            label={doc.contactName}
                            size="small"
                            variant="outlined"
                          />
                        )}

                        <Divider />

                        {/* Footer */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(doc.fileSize)}
                          </Typography>
                          <Chip
                            label={doc.status}
                            size="small"
                            color={
                              doc.status === 'signed' ? 'success' :
                              doc.status === 'pending' || doc.status === 'pending_signature' ? 'warning' :
                              'default'
                            }
                          />
                        </Stack>

                        {/* Quick Actions */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<Download size={14} />}
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            fullWidth
                          >
                            Download
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Send size={14} />}
                            onClick={() => handleSendDocument(doc)}
                            variant="outlined"
                            fullWidth
                          >
                            Send
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedDocuments.length > 0 &&
                        selectedDocuments.length < sortedDocuments.length
                      }
                      checked={
                        sortedDocuments.length > 0 &&
                        selectedDocuments.length === sortedDocuments.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(sortedDocuments.map(d => d.id));
                        } else {
                          setSelectedDocuments([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDocuments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((doc) => {
                    const docType = documentTypes[doc.type] || documentTypes.general;
                    const DocIcon = docType.icon;
                    const isSelected = selectedDocuments.includes(doc.id);

                    return (
                      <TableRow
                        key={doc.id}
                        hover
                        selected={isSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, doc.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: docType.color, width: 32, height: 32 }}>
                              <DocIcon size={16} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {doc.name}
                              </Typography>
                              {doc.isConfidential && (
                                <Chip
                                  icon={<Lock size={10} />}
                                  label="Confidential"
                                  size="small"
                                  color="error"
                                  sx={{ height: 16, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={docType.label} size="small" />
                        </TableCell>
                        <TableCell>{doc.contactName || '-'}</TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.status}
                            size="small"
                            color={
                              doc.status === 'signed' ? 'success' :
                              doc.status === 'pending' || doc.status === 'pending_signature' ? 'warning' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {doc.aiProcessed && (
                            <Tooltip title="AI Processed">
                              <Sparkles size={16} color="#8B5CF6" />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.createdAt && format(doc.createdAt.toDate(), 'MM/dd/yyyy')}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => {
                                setSelectedDocument(doc);
                                setViewDialogOpen(true);
                              }}>
                                <Eye size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="AI Analyze">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleAiAnalyzeDocument(doc)}
                              >
                                <Brain size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                              >
                                <Download size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send">
                              <IconButton
                                size="small"
                                onClick={() => handleSendDocument(doc)}
                              >
                                <Send size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteDocument(doc.id, doc.fileUrl)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={sortedDocuments.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[12, 24, 48, 96]}
          />
        </Paper>
      )}

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && sortedDocuments.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TablePagination
            component="div"
            count={sortedDocuments.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[12, 24, 48, 96]}
          />
        </Box>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileSelect}
      />
      <input
        ref={batchInputRef}
        type="file"
        multiple
        hidden
        onChange={handleBatchFileSelect}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Upload Document</Typography>
            {uploadForm.aiAutoProcess && (
              <Chip
                icon={<Sparkles size={14} />}
                label="AI Processing Enabled"
                size="small"
                color="secondary"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
                sx={{ py: 3 }}
              >
                {uploadForm.file ? (
                  <Stack spacing={1} alignItems="center">
                    <Typography>{uploadForm.file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(uploadForm.file.size)}
                    </Typography>
                  </Stack>
                ) : (
                  'Select File'
                )}
                <input
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Document Name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                  label="Document Type"
                >
                  {Object.entries(documentTypes).map(([key, type]) => (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: type.color }}>
                          {React.createElement(type.icon, { size: 16 })}
                        </Box>
                        <Typography>{type.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                value={uploadForm.contact}
                onChange={(e, value) => setUploadForm(prev => ({ ...prev, contact: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Associated Client (Optional)" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={folders}
                getOptionLabel={(option) => option.name || ''}
                value={uploadForm.folder}
                onChange={(e, value) => setUploadForm(prev => ({ ...prev, folder: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Folder (Optional)" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                value={uploadForm.tags}
                onChange={(e, value) => setUploadForm(prev => ({ ...prev, tags: value }))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    helperText="Press Enter to add custom tags"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Sparkles size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  AI Processing Options
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={uploadForm.aiAutoProcess}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, aiAutoProcess: e.target.checked }))}
                      />
                    }
                    label="Enable AI Auto-Processing"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={uploadForm.aiAutoTag}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, aiAutoTag: e.target.checked }))}
                        disabled={!uploadForm.aiAutoProcess}
                      />
                    }
                    label="AI Auto-Generate Tags"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={uploadForm.aiAutoSummarize}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, aiAutoSummarize: e.target.checked }))}
                        disabled={!uploadForm.aiAutoProcess}
                      />
                    }
                    label="AI Auto-Summarize"
                  />
                </FormGroup>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={uploadForm.isConfidential}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, isConfidential: e.target.checked }))}
                  />
                }
                label="Mark as Confidential"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={uploadForm.requiresSignature}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, requiresSignature: e.target.checked }))}
                  />
                }
                label="Requires Signature"
              />
            </Grid>

            {uploadForm.requiresSignature && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Expiration Date"
                    type="date"
                    value={uploadForm.expirationDate || ''}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Reminder Days Before"
                    type="number"
                    value={uploadForm.reminderDays || ''}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, reminderDays: e.target.value }))}
                    fullWidth
                    InputProps={{
                      endAdornment: <Typography variant="caption">days</Typography>
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUploadDialogOpen(false);
            resetUploadForm();
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDocument}
            disabled={!uploadForm.file || !uploadForm.name || loading || aiProcessing}
            startIcon={aiProcessing ? <CircularProgress size={16} /> : <Upload />}
          >
            {aiProcessing ? 'Processing...' : loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={folderDialogOpen} onClose={() => setFolderDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Folder Name"
                value={folderForm.name}
                onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                value={folderForm.description}
                onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Folder Color"
                type="color"
                value={folderForm.color}
                onChange={(e) => setFolderForm(prev => ({ ...prev, color: e.target.value }))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  value={folderForm.permissions}
                  onChange={(e) => setFolderForm(prev => ({ ...prev, permissions: e.target.value }))}
                  label="Permissions"
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!folderForm.name || loading}
          >
            Create Folder
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Document Details</Typography>
            <Stack direction="row" spacing={1}>
              {selectedDocument?.aiProcessed && (
                <Chip
                  icon={<Sparkles size={14} />}
                  label="AI Processed"
                  size="small"
                  color="secondary"
                />
              )}
              <IconButton size="small" onClick={() => setViewDialogOpen(false)}>
                <X size={20} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Document Preview Area */}
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 400 }}>
                  <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                  {selectedDocument.fileType?.includes('pdf') ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      width="100%"
                      height="500px"
                      title="Document Preview"
                    />
                  ) : selectedDocument.fileType?.includes('image') ? (
                    <img
                      src={selectedDocument.fileUrl}
                      alt={selectedDocument.name}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <Alert severity="info">
                      Preview not available for this file type. Click Download to view.
                    </Alert>
                  )}
                </Paper>
              </Grid>

              {/* Document Info */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Information</Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body2">{selectedDocument.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Type</Typography>
                        <Typography variant="body2">
                          {documentTypes[selectedDocument.type]?.label}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">File Size</Typography>
                        <Typography variant="body2">{formatFileSize(selectedDocument.fileSize)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Chip label={selectedDocument.status} size="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Created</Typography>
                        <Typography variant="body2">
                          {selectedDocument.createdAt && format(selectedDocument.createdAt.toDate(), 'MM/dd/yyyy hh:mm a')}
                        </Typography>
                      </Box>
                      {selectedDocument.contactName && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Client</Typography>
                          <Typography variant="body2">{selectedDocument.contactName}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>

                  {/* AI Summary */}
                  {selectedDocument.summary && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'secondary.light' }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Sparkles size={16} />
                        <Typography variant="subtitle2">AI Summary</Typography>
                      </Stack>
                      <Typography variant="body2">{selectedDocument.summary}</Typography>
                    </Paper>
                  )}

                  {/* Tags */}
                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {selectedDocument.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Actions */}
                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                      fullWidth
                    >
                      Download
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Brain />}
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleAiAnalyzeDocument(selectedDocument);
                      }}
                      color="secondary"
                      fullWidth
                    >
                      AI Analyze
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={() => {
                        setViewDialogOpen(false);
                        handleSendDocument(selectedDocument);
                      }}
                      fullWidth
                    >
                      Send Document
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Share2 />}
                      onClick={() => {
                        setShareForm(prev => ({ ...prev, document: selectedDocument }));
                        setViewDialogOpen(false);
                        setShareDialogOpen(true);
                      }}
                      fullWidth
                    >
                      Share
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              {/* Description */}
              {selectedDocument.description && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Description</Typography>
                    <Typography variant="body2">{selectedDocument.description}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={aiAnalysisDialogOpen} onClose={() => setAiAnalysisDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Brain size={24} />
            <Typography variant="h6">AI Document Analysis</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {aiProcessing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={60} />
                <Typography>Analyzing document with AI...</Typography>
              </Stack>
            </Box>
          ) : aiAnalysis ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Insights */}
              {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Sparkles size={20} color="#3B82F6" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Key Insights
                      </Typography>
                    </Stack>
                    <List dense>
                      {aiAnalysis.insights.map((insight, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><CheckCircle size={16} color="#10B981" /></ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Risks */}
              {aiAnalysis.risks && aiAnalysis.risks.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <AlertTriangle size={20} color="#EF4444" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        Potential Risks
                      </Typography>
                    </Stack>
                    <List dense>
                      {aiAnalysis.risks.map((risk, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><AlertCircle size={16} color="#EF4444" /></ListItemIcon>
                          <ListItemText primary={risk} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Compliance */}
              {aiAnalysis.compliance && aiAnalysis.compliance.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderColor: 'info.main' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Shield size={20} color="#3B82F6" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        Compliance Considerations
                      </Typography>
                    </Stack>
                    <List dense>
                      {aiAnalysis.compliance.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><Info size={16} color="#3B82F6" /></ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Recommendations */}
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderColor: 'success.main' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Target size={20} color="#10B981" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        Recommendations
                      </Typography>
                    </Stack>
                    <List dense>
                      {aiAnalysis.recommendations.map((rec, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><ArrowRight size={16} color="#10B981" /></ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Alert severity="info">No analysis data available</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiAnalysisDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Drawer */}
      <Drawer
        anchor="right"
        open={aiInsightsOpen}
        onClose={() => setAiInsightsOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Brain size={24} />
              <Typography variant="h6">AI Insights</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setAiInsightsOpen(false)}>
              <X size={20} />
            </IconButton>
          </Stack>

          {aiProcessing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2">Generating insights...</Typography>
              </Stack>
            </Box>
          ) : aiSuggestions && Object.keys(aiSuggestions).length > 0 ? (
            <Stack spacing={2}>
              {Object.entries(aiSuggestions).map(([key, values]) => (
                <Accordion key={key} defaultExpanded>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {Array.isArray(values) && values.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><Sparkles size={14} /></ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            <Alert severity="info">Click "Generate Insights" to get AI recommendations</Alert>
          )}
        </Box>
      </Drawer>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                value={shareForm.shareWith}
                onChange={(e, value) => setShareForm(prev => ({ ...prev, shareWith: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Share With" placeholder="Select contacts..." />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  value={shareForm.permissions}
                  onChange={(e) => setShareForm(prev => ({ ...prev, permissions: e.target.value }))}
                  label="Permissions"
                >
                  <MenuItem value="view">View Only</MenuItem>
                  <MenuItem value="download">View & Download</MenuItem>
                  <MenuItem value="edit">View, Download & Edit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Expires At (Optional)"
                type="datetime-local"
                value={shareForm.expiresAt || ''}
                onChange={(e) => setShareForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shareForm.allowDownload}
                    onChange={(e) => setShareForm(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  />
                }
                label="Allow Download"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shareForm.notifyRecipients}
                    onChange={(e) => setShareForm(prev => ({ ...prev, notifyRecipients: e.target.checked }))}
                  />
                }
                label="Notify Recipients"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shareForm.requirePassword}
                    onChange={(e) => setShareForm(prev => ({ ...prev, requirePassword: e.target.checked }))}
                  />
                }
                label="Require Password"
              />
            </Grid>

            {shareForm.requirePassword && (
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  type="password"
                  value={shareForm.password}
                  onChange={(e) => setShareForm(prev => ({ ...prev, password: e.target.value }))}
                  fullWidth
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleShareDocument}
            disabled={loading || shareForm.shareWith.length === 0}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Settings size={24} />
            <Typography variant="h6">AI Settings</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autoCategorizeDocs}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoCategorizeDocs: e.target.checked }))}
                  />
                }
                label="Auto-Categorize Documents"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autoExtractData}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoExtractData: e.target.checked }))}
                  />
                }
                label="Auto-Extract Data"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autoSummarize}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoSummarize: e.target.checked }))}
                  />
                }
                label="Auto-Summarize Documents"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.autoTag}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoTag: e.target.checked }))}
                  />
                }
                label="Auto-Generate Tags"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.intelligentSearch}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, intelligentSearch: e.target.checked }))}
                  />
                }
                label="Intelligent Search (Semantic)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.contentAnalysis}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, contentAnalysis: e.target.checked }))}
                  />
                }
                label="Content Analysis"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.smartRecommendations}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, smartRecommendations: e.target.checked }))}
                  />
                }
                label="Smart Recommendations"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={aiSettings.sentimentAnalysis}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, sentimentAnalysis: e.target.checked }))}
                  />
                }
                label="Sentiment Analysis (Beta)"
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            // Save settings to localStorage or Firestore
            localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
            showSnackbar('Settings saved', 'success');
            setSettingsDialogOpen(false);
          }}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentCenter;