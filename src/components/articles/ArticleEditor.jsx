// src/components/articles/ArticleEditor.jsx
// Enhanced Article Editor Component with Advanced Features
// ~800 lines

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Chip, IconButton,
  FormControl, InputLabel, Select, MenuItem, Grid, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Badge,
  List, ListItem, ListItemText, ListItemIcon, Divider, Alert
} from '@mui/material';
import {
  FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted,
  FormatListNumbered, Link, Image, Code, FormatQuote, Title,
  Undo, Redo, FormatClear, TableChart, EmojiEmotions, Functions,
  ExpandMore, CheckCircle, Warning, Error as ErrorIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom toolbar component
const CustomToolbar = ({ onFormat, onInsert }) => {
  const formatButtons = [
    { icon: <Title />, action: 'header', tooltip: 'Heading' },
    { icon: <FormatBold />, action: 'bold', tooltip: 'Bold' },
    { icon: <FormatItalic />, action: 'italic', tooltip: 'Italic' },
    { icon: <FormatUnderlined />, action: 'underline', tooltip: 'Underline' },
    { icon: <FormatListBulleted />, action: 'bullet', tooltip: 'Bullet List' },
    { icon: <FormatListNumbered />, action: 'ordered', tooltip: 'Numbered List' },
    { icon: <FormatQuote />, action: 'blockquote', tooltip: 'Quote' },
    { icon: <Code />, action: 'code-block', tooltip: 'Code Block' },
    { icon: <Link />, action: 'link', tooltip: 'Insert Link' },
    { icon: <Image />, action: 'image', tooltip: 'Insert Image' },
    { icon: <TableChart />, action: 'table', tooltip: 'Insert Table' },
    { icon: <EmojiEmotions />, action: 'emoji', tooltip: 'Insert Emoji' },
    { icon: <Functions />, action: 'formula', tooltip: 'Insert Formula' },
    { icon: <FormatClear />, action: 'clean', tooltip: 'Clear Formatting' }
  ];

  return (
    <Paper sx={{ p: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {formatButtons.map((btn) => (
        <Tooltip key={btn.action} title={btn.tooltip}>
          <IconButton
            size="small"
            onClick={() => btn.action === 'clean' ? onFormat(btn.action) : onInsert(btn.action)}
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
    </Paper>
  );
};

// Template selector component
const TemplateSelector = ({ onSelect }) => {
  const templates = [
    {
      id: 'dispute',
      name: 'Dispute Letter Template',
      content: `<h2>How to Write an Effective Dispute Letter</h2>
        <p>When disputing items on your credit report, it's crucial to...</p>
        <h3>Step 1: Identify Errors</h3>
        <p>Review your credit report carefully and identify...</p>
        <h3>Step 2: Gather Documentation</h3>
        <p>Collect all supporting documents that prove...</p>
        <h3>Step 3: Write Your Letter</h3>
        <p>Include the following information...</p>`
    },
    {
      id: 'guide',
      name: 'How-To Guide Template',
      content: `<h2>[Title of Your Guide]</h2>
        <p><strong>Introduction:</strong> Brief overview of what readers will learn...</p>
        <h3>Prerequisites</h3>
        <ul>
          <li>Requirement 1</li>
          <li>Requirement 2</li>
        </ul>
        <h3>Step-by-Step Instructions</h3>
        <ol>
          <li>First step...</li>
          <li>Second step...</li>
        </ol>
        <h3>Tips and Best Practices</h3>
        <p>Additional advice...</p>
        <h3>Common Mistakes to Avoid</h3>
        <p>Watch out for...</p>`
    },
    {
      id: 'news',
      name: 'News Article Template',
      content: `<h2>[Headline]</h2>
        <p class="lead">[Lead paragraph - summarize the key points]</p>
        <h3>The Details</h3>
        <p>[Expand on the story...]</p>
        <h3>Impact on Consumers</h3>
        <p>[How this affects readers...]</p>
        <h3>What You Can Do</h3>
        <p>[Action items for readers...]</p>
        <h3>Looking Forward</h3>
        <p>[Future implications...]</p>`
    },
    {
      id: 'review',
      name: 'Product Review Template',
      content: `<h2>[Product Name] Review</h2>
        <p class="rating">Overall Rating: [X/5 stars]</p>
        <h3>Overview</h3>
        <p>[Brief description of the product/service...]</p>
        <h3>Pros</h3>
        <ul>
          <li>Advantage 1</li>
          <li>Advantage 2</li>
        </ul>
        <h3>Cons</h3>
        <ul>
          <li>Disadvantage 1</li>
          <li>Disadvantage 2</li>
        </ul>
        <h3>Pricing</h3>
        <p>[Cost details and value assessment...]</p>
        <h3>Final Verdict</h3>
        <p>[Recommendation and who it's best for...]</p>`
    }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Quick Start Templates</Typography>
      <Grid container spacing={2}>
        {templates.map(template => (
          <Grid item xs={12} sm={6} key={template.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => onSelect(template.content)}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {template.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click to use this template
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// SEO Panel Component
const SEOPanel = ({ seo, onChange }) => {
  const [localSEO, setLocalSEO] = useState(seo || {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    focusKeyword: '',
    readability: 'Not analyzed',
    seoScore: 0
  });

  const [keywordInput, setKeywordInput] = useState('');

  const seoAnalysis = React.useMemo(() => {
    let score = 0;
    const analysis = [];

    // Check meta title
    if (localSEO.metaTitle) {
      score += 20;
      if (localSEO.metaTitle.length >= 30 && localSEO.metaTitle.length <= 60) {
        score += 10;
        analysis.push({ type: 'success', text: 'Meta title length is optimal' });
      } else {
        analysis.push({ type: 'warning', text: 'Meta title should be 30-60 characters' });
      }
    } else {
      analysis.push({ type: 'error', text: 'Meta title is missing' });
    }

    // Check meta description
    if (localSEO.metaDescription) {
      score += 20;
      if (localSEO.metaDescription.length >= 120 && localSEO.metaDescription.length <= 160) {
        score += 10;
        analysis.push({ type: 'success', text: 'Meta description length is optimal' });
      } else {
        analysis.push({ type: 'warning', text: 'Meta description should be 120-160 characters' });
      }
    } else {
      analysis.push({ type: 'error', text: 'Meta description is missing' });
    }

    // Check keywords
    if (localSEO.keywords.length > 0) {
      score += 20;
      if (localSEO.keywords.length >= 3 && localSEO.keywords.length <= 7) {
        score += 10;
        analysis.push({ type: 'success', text: 'Good number of keywords' });
      } else {
        analysis.push({ type: 'warning', text: 'Aim for 3-7 keywords' });
      }
    } else {
      analysis.push({ type: 'error', text: 'No keywords specified' });
    }

    // Check focus keyword
    if (localSEO.focusKeyword) {
      score += 10;
      analysis.push({ type: 'success', text: 'Focus keyword is set' });
    }

    return { score, analysis };
  }, [localSEO]);

  const addKeyword = () => {
    if (keywordInput.trim() && !localSEO.keywords.includes(keywordInput.trim())) {
      const updated = {
        ...localSEO,
        keywords: [...localSEO.keywords, keywordInput.trim()]
      };
      setLocalSEO(updated);
      onChange(updated);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    const updated = {
      ...localSEO,
      keywords: localSEO.keywords.filter(k => k !== keyword)
    };
    setLocalSEO(updated);
    onChange(updated);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>SEO Optimization</Typography>
          <Chip
            label={`Score: ${seoAnalysis.score}%`}
            color={seoAnalysis.score >= 70 ? 'success' : seoAnalysis.score >= 40 ? 'warning' : 'error'}
            size="small"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meta Title"
              value={localSEO.metaTitle}
              onChange={(e) => {
                const updated = { ...localSEO, metaTitle: e.target.value };
                setLocalSEO(updated);
                onChange(updated);
              }}
              helperText={`${localSEO.metaTitle.length}/60 characters`}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meta Description"
              multiline
              rows={2}
              value={localSEO.metaDescription}
              onChange={(e) => {
                const updated = { ...localSEO, metaDescription: e.target.value };
                setLocalSEO(updated);
                onChange(updated);
              }}
              helperText={`${localSEO.metaDescription.length}/160 characters`}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Focus Keyword"
              value={localSEO.focusKeyword}
              onChange={(e) => {
                const updated = { ...localSEO, focusKeyword: e.target.value };
                setLocalSEO(updated);
                onChange(updated);
              }}
              helperText="Primary keyword to optimize for"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Add Keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                size="small"
              />
              <Button onClick={addKeyword} variant="outlined" size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {localSEO.keywords.map(keyword => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => removeKeyword(keyword)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>SEO Analysis</Typography>
            <List dense>
              {seoAnalysis.analysis.map((item, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    {item.type === 'success' ? <CheckCircle color="success" /> :
                     item.type === 'warning' ? <Warning color="warning" /> :
                     <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

// Monetization Panel Component
const MonetizationPanel = ({ monetization, onChange }) => {
  const [affiliateProduct, setAffiliateProduct] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [commission, setCommission] = useState('');

  const addAffiliateLink = () => {
    if (affiliateProduct && affiliateUrl) {
      const newLink = {
        product: affiliateProduct,
        url: affiliateUrl,
        commission: parseFloat(commission) || 0,
        clicks: 0,
        conversions: 0
      };
      
      onChange({
        ...monetization,
        affiliateLinks: [...(monetization.affiliateLinks || []), newLink]
      });
      
      setAffiliateProduct('');
      setAffiliateUrl('');
      setCommission('');
    }
  };

  const removeAffiliateLink = (index) => {
    const updated = {
      ...monetization,
      affiliateLinks: monetization.affiliateLinks.filter((_, i) => i !== index)
    };
    onChange(updated);
  };

  const calculatePotentialRevenue = () => {
    if (!monetization.affiliateLinks) return 0;
    
    return monetization.affiliateLinks.reduce((total, link) => {
      return total + (link.commission || 0);
    }, 0);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>Monetization Settings</Typography>
          <Chip
            label={`Potential: $${calculatePotentialRevenue().toFixed(2)}/conversion`}
            color="success"
            size="small"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Affiliate Links
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Product Name"
              value={affiliateProduct}
              onChange={(e) => setAffiliateProduct(e.target.value)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Affiliate URL"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Commission ($)"
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={addAffiliateLink}
              size="small"
              sx={{ height: '40px' }}
            >
              Add
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <List dense>
              {monetization.affiliateLinks?.map((link, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => removeAffiliateLink(index)}
                      size="small"
                    >
                      <Error />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={link.product}
                    secondary={`${link.url} • $${link.commission} commission`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12}>
            <Alert severity="info">
              Tip: Place affiliate links naturally within your content where they provide value to readers.
            </Alert>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

// Main ArticleEditor Component
const ArticleEditor = ({
  article,
  onChange,
  onSave,
  onPublish,
  onSchedule,
  autoSaveEnabled = true,
  showSEO = true,
  showMonetization = true,
  showTemplates = true
}) => {
  const [localArticle, setLocalArticle] = useState(article || {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    seo: {},
    monetization: { affiliateLinks: [] }
  });

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);

  const editorRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // Calculate statistics
  useEffect(() => {
    const text = localArticle.content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const reading = Math.ceil(words / 200);
    
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(reading);
  }, [localArticle.content]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && localArticle.content) {
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
  }, [localArticle, autoSaveEnabled]);

  const handleAutoSave = async () => {
    setAutoSaveStatus('Saving...');
    try {
      await onSave(localArticle, true);
      setLastSaved(new Date());
      setAutoSaveStatus('Saved');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      setAutoSaveStatus('Save failed');
      console.error('Auto-save error:', error);
    }
  };

  const handleContentChange = (content) => {
    const updated = { ...localArticle, content };
    setLocalArticle(updated);
    onChange(updated);
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...localArticle, [field]: value };
    setLocalArticle(updated);
    onChange(updated);
  };

  const insertTemplate = (templateContent) => {
    handleContentChange(templateContent);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }, { 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  return (
    <Box>
      {/* Editor Statistics Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Words: {wordCount}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Characters: {charCount}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              Reading Time: {readingTime} min
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">
              {autoSaveStatus || (lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Templates Section */}
      {showTemplates && !localArticle.content && (
        <TemplateSelector onSelect={insertTemplate} />
      )}

      {/* Main Editor */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Article Title"
            value={localArticle.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              style: { fontSize: '1.5rem', fontWeight: 'bold' }
            }}
          />
          
          <TextField
            fullWidth
            label="Excerpt / Summary"
            value={localArticle.excerpt}
            onChange={(e) => handleFieldChange('excerpt', e.target.value)}
            multiline
            rows={2}
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Brief description that appears in article listings"
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Content
          </Typography>
          
          <Box sx={{ minHeight: 400, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <ReactQuill
              ref={editorRef}
              value={localArticle.content}
              onChange={handleContentChange}
              modules={quillModules}
              theme="snow"
              style={{ minHeight: 350 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* SEO Panel */}
      {showSEO && (
        <SEOPanel
          seo={localArticle.seo}
          onChange={(seo) => handleFieldChange('seo', seo)}
        />
      )}

      {/* Monetization Panel */}
      {showMonetization && (
        <Box sx={{ mt: 2 }}>
          <MonetizationPanel
            monetization={localArticle.monetization}
            onChange={(monetization) => handleFieldChange('monetization', monetization)}
          />
        </Box>
      )}

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => onSave(localArticle, false)}
            >
              Save as Draft
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => onPublish(localArticle)}
            >
              Publish Now
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => onSchedule(localArticle)}
            >
              Schedule
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ArticleEditor;