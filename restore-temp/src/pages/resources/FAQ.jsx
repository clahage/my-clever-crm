// FAQ.jsx - Enhanced with Rich Preview Pane
// Includes reusable RichPreview component

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Container, Typography, TextField, Button, Card, CardContent,
  Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Paper,
  List, ListItem, ListItemText, Tooltip, CircularProgress, InputAdornment,
  Fab, Menu, Divider, Switch, FormControlLabel, Avatar, Rating, 
  ToggleButtonGroup, ToggleButton, Tab, Tabs
} from '@mui/material';
import {
  Add, Edit, Delete, Search, DragIndicator, AttachMoney, Share,
  Facebook, Twitter, LinkedIn, Email, Link, ContentCopy, Check,
  AutoAwesome, Category, Upload, Download, Save, Publish,
  Visibility, VisibilityOff, Code, FormatBold, FormatItalic,
  FormatListBulleted, FormatListNumbered, FormatQuote, InsertLink,
  Title, Image as ImageIcon
} from '@mui/icons-material';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Papa from 'papaparse';
import axios from 'axios';
import aiService from '@/services/aiService';

// ============================================================================
// REUSABLE RICH PREVIEW COMPONENT
// ============================================================================
export const RichPreview = ({ content, sx = {} }) => {
  // Parse markdown-style text to rich HTML
  const parseContent = useMemo(() => {
    if (!content) return '';
    
    let parsed = content;
    
    // Escape HTML to prevent XSS
    parsed = parsed.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Headers
    parsed = parsed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and Italic
    parsed = parsed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    parsed = parsed.replace(/^\* (.+)$/gim, '<li>$1</li>');
    parsed = parsed.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    parsed = parsed.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    
    // Code blocks
    parsed = parsed.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    parsed = parsed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Blockquotes
    parsed = parsed.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Line breaks
    parsed = parsed.replace(/\n\n/g, '</p><p>');
    parsed = parsed.replace(/\n/g, '<br/>');
    
    // Wrap in paragraphs
    if (!parsed.startsWith('<')) {
      parsed = `<p>${parsed}</p>`;
    }
    
    // Affiliate link highlighting
    parsed = parsed.replace(/\$\$AFFILIATE:(.*?)\$\$/g, 
      '<span style="background-color: #e1bee7; padding: 2px 6px; border-radius: 4px; font-weight: 500;">💰 $1</span>');
    
    return parsed;
  }, [content]);
  
  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        ...sx,
        '& h1': { fontSize: '2em', fontWeight: 'bold', mb: 2, mt: 1 },
        '& h2': { fontSize: '1.5em', fontWeight: 'bold', mb: 1.5, mt: 1 },
        '& h3': { fontSize: '1.2em', fontWeight: 'bold', mb: 1, mt: 1 },
        '& p': { mb: 1.5, lineHeight: 1.6 },
        '& ul, & ol': { pl: 3, mb: 1.5 },
        '& li': { mb: 0.5, lineHeight: 1.6 },
        '& blockquote': {
          borderLeft: '4px solid #1976d2',
          pl: 2,
          ml: 0,
          my: 2,
          color: 'text.secondary',
          fontStyle: 'italic'
        },
        '& code': {
          bgcolor: 'grey.100',
          color: '#d63384',
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.9em'
        },
        '& pre': {
          bgcolor: '#282c34',
          color: '#abb2bf',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          mb: 2,
          '& code': {
            bgcolor: 'transparent',
            color: 'inherit',
            p: 0
          }
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        },
        '& strong': { fontWeight: 'bold' },
        '& em': { fontStyle: 'italic' }
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: parseContent }} />
    </Paper>
  );
};

// ============================================================================
// MARKDOWN TOOLBAR COMPONENT
// ============================================================================
const MarkdownToolbar = ({ onFormat }) => {
  const buttons = [
    { icon: <Title />, format: 'heading', tooltip: 'Heading (##)' },
    { icon: <FormatBold />, format: 'bold', tooltip: 'Bold (**text**)' },
    { icon: <FormatItalic />, format: 'italic', tooltip: 'Italic (*text*)' },
    { icon: <FormatListBulleted />, format: 'bullet', tooltip: 'Bullet List' },
    { icon: <FormatListNumbered />, format: 'number', tooltip: 'Numbered List' },
    { icon: <FormatQuote />, format: 'quote', tooltip: 'Quote (>)' },
    { icon: <Code />, format: 'code', tooltip: 'Code Block (```)' },
    { icon: <InsertLink />, format: 'link', tooltip: 'Link [text](url)' },
    { icon: <AttachMoney />, format: 'affiliate', tooltip: 'Affiliate Link' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 0.5, p: 1, borderBottom: 1, borderColor: 'divider' }}>
      {buttons.map((btn) => (
        <Tooltip key={btn.format} title={btn.tooltip}>
          <IconButton
            size="small"
            onClick={() => onFormat(btn.format)}
            sx={{ 
              '&:hover': { 
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
              }
            }}
          >
            {btn.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

// ============================================================================
// MAIN FAQ COMPONENT
// ============================================================================
const FAQ = () => {
  const { currentUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';
  const textareaRef = useRef(null);
  
  // Core State
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewMode, setPreviewMode] = useState(false);
  const [editorTab, setEditorTab] = useState(0); // 0 = Edit, 1 = Preview
  
  // Form State
  const [currentFaq, setCurrentFaq] = useState({
    question: '',
    answer: '',
    category: '',
    tags: [],
    affiliateLinks: [],
    metadata: {
      views: 0,
      helpful: 0,
      notHelpful: 0
    }
  });

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Categories
  const CATEGORIES = [
    'Credit Scores',
    'Dispute Process', 
    'Credit Reports',
    'Collections',
    'Bankruptcy',
    'Identity Theft',
    'Credit Cards',
    'Loans',
    'Legal Rights',
    'General'
  ];

  // Load FAQs from Firebase
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'faqs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const faqData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFaqs(faqData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading FAQs:', error);
      setLoading(false);
      showSnackbar('Error loading FAQs', 'error');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Format text helper
  const insertFormatting = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentFaq.answer;
    const selectedText = text.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch(type) {
      case 'heading':
        replacement = `\n## ${selectedText || 'Heading'}\n`;
        cursorOffset = 4;
        break;
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        cursorOffset = 1;
        break;
      case 'bullet':
        replacement = `\n* ${selectedText || 'List item'}\n`;
        cursorOffset = 3;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || 'List item'}\n`;
        cursorOffset = 4;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'Quote'}\n`;
        cursorOffset = 3;
        break;
      case 'code':
        replacement = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`;
        cursorOffset = 4;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          replacement = `[${selectedText || 'link text'}](${url})`;
        }
        break;
      case 'affiliate':
        const product = prompt('Enter product name:');
        if (product) {
          replacement = `$$AFFILIATE:${product}$$`;
        }
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setCurrentFaq({ ...currentFaq, answer: newText });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  // AI Category Detection
  const detectCategory = async (text) => {
    if (aiService?.complete) {
      try {
        const res = await aiService.complete({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `You are a credit repair expert. Categorize the following text into one of these categories: ${CATEGORIES.join(', ')}. Respond with only the category name.` },
            { role: 'user', content: text }
          ],
          temperature: 0.3,
          max_tokens: 50
        });
        const category = (res.response || res || '').trim();
        return CATEGORIES.includes(category) ? category : 'General';
      } catch (error) {
        console.error('Error detecting category via aiService:', error);
        return 'General';
      }
    }
    return 'General';
  };

  // AI Enhance Answer
  const enhanceAnswer = async () => {
    if (!aiService?.complete) {
      showSnackbar('AI service not configured', 'warning');
      return;
    }

    try {
      const res = await aiService.complete({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a credit repair expert. Enhance this FAQ answer with more detail, structure it with markdown formatting (headers, lists, bold for key points), and identify where affiliate links for credit monitoring, credit repair services, or identity protection would be appropriate. Mark affiliate opportunities with $$AFFILIATE:product name$$.' },
          { role: 'user', content: `Question: ${currentFaq.question}\nAnswer: ${currentFaq.answer}` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const enhancedAnswer = res.response || res || '';
      setCurrentFaq({ ...currentFaq, answer: enhancedAnswer });
      showSnackbar('Answer enhanced with AI', 'success');
    } catch (error) {
      console.error('Error enhancing answer:', error);
      showSnackbar('Error enhancing answer', 'error');
    }
  };

  // CSV Import
  const handleCSVImport = async (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let importCount = 0;
        for (const row of results.data) {
          if (row.question && row.answer) {
            const category = await detectCategory(`${row.question} ${row.answer}`);
            
            await addDoc(collection(db, 'faqs'), {
              question: row.question,
              answer: row.answer,
              category: row.category || category,
              tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
              createdAt: serverTimestamp(),
              createdBy: currentUser.uid,
              metadata: { views: 0, helpful: 0, notHelpful: 0 }
            });
            importCount++;
          }
        }
        showSnackbar(`Imported ${importCount} FAQs successfully`, 'success');
      },
      error: (error) => {
        showSnackbar('Error importing CSV file', 'error');
        console.error('CSV import error:', error);
      }
    });
  };

  // Save FAQ
  const handleSaveFaq = async () => {
    if (!currentFaq.question || !currentFaq.answer) {
      showSnackbar('Question and answer are required', 'warning');
      return;
    }

    try {
      if (!currentFaq.category) {
        currentFaq.category = await detectCategory(`${currentFaq.question} ${currentFaq.answer}`);
      }

      const faqData = {
        ...currentFaq,
        updatedAt: serverTimestamp()
      };

      if (selectedFaq) {
        await updateDoc(doc(db, 'faqs', selectedFaq.id), faqData);
        showSnackbar('FAQ updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'faqs'), {
          ...faqData,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid
        });
        showSnackbar('FAQ created successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      showSnackbar('Error saving FAQ', 'error');
      console.error('Save error:', error);
    }
  };

  // Helper Functions
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFaq(null);
    setCurrentFaq({
      question: '',
      answer: '',
      category: '',
      tags: [],
      affiliateLinks: [],
      metadata: { views: 0, helpful: 0, notHelpful: 0 }
    });
    setEditorTab(0);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        FAQ Management
      </Typography>

      {/* Search and Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flexGrow: 1, minWidth: 250 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
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

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add FAQ
          </Button>
        )}
      </Box>

      {/* FAQ List with Preview */}
      <Grid container spacing={3}>
        {filteredFaqs.map((faq) => (
          <Grid item xs={12} md={6} key={faq.id}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Chip label={faq.category} size="small" color="primary" />
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {faq.question}
                </Typography>
                
                {previewMode ? (
                  <RichPreview 
                    content={faq.answer} 
                    sx={{ maxHeight: 200, overflow: 'auto' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {faq.answer.substring(0, 150)}...
                  </Typography>
                )}

                {isAdmin && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton size="small" onClick={() => setPreviewMode(!previewMode)}>
                      {previewMode ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <Box>
                      <IconButton size="small" onClick={() => {
                        setSelectedFaq(faq);
                        setCurrentFaq(faq);
                        setOpenDialog(true);
                      }}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={async () => {
                        if (window.confirm('Delete this FAQ?')) {
                          await deleteDoc(doc(db, 'faqs', faq.id));
                          showSnackbar('FAQ deleted', 'success');
                        }
                      }}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ Editor Dialog with Rich Preview */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedFaq ? 'Edit FAQ' : 'Create New FAQ'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Question"
              value={currentFaq.question}
              onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={currentFaq.category}
                onChange={(e) => setCurrentFaq({ ...currentFaq, category: e.target.value })}
                label="Category"
              >
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tabs value={editorTab} onChange={(e, val) => setEditorTab(val)} sx={{ mb: 2 }}>
              <Tab label="Edit" />
              <Tab label="Preview" />
            </Tabs>

            {editorTab === 0 ? (
              <Box>
                <MarkdownToolbar onFormat={insertFormatting} />
                <TextField
                  inputRef={textareaRef}
                  label="Answer"
                  value={currentFaq.answer}
                  onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                  fullWidth
                  multiline
                  rows={12}
                  placeholder="Write your answer here... Use markdown for formatting"
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }
                  }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    onClick={enhanceAnswer}
                  >
                    Enhance with AI
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Category />}
                    onClick={async () => {
                      const category = await detectCategory(`${currentFaq.question} ${currentFaq.answer}`);
                      setCurrentFaq({ ...currentFaq, category });
                      showSnackbar(`Category: ${category}`, 'success');
                    }}
                  >
                    Auto-Detect Category
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Preview:
                </Typography>
                <RichPreview content={currentFaq.answer} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFaq}>
            {selectedFaq ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default FAQ;