// ===================================================================
// KnowledgeBase.jsx - Searchable Knowledge Base
// ===================================================================
// Purpose: Browse and search knowledge base articles and FAQs
// Features:
// - Article library with categories
// - Advanced search with AI
// - Popular articles
// - Helpful ratings
// - Bookmark articles
// - Related articles suggestions
// - Print and share articles
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Divider,
  Rating,
  Tooltip,
  Alert,
  Stack,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Search,
  BookOpen,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  Printer,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  FileText,
  Zap,
  CheckCircle,
  Home,
  ExternalLink
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// ===================================================================
// KNOWLEDGE BASE CATEGORIES
// ===================================================================

const KB_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: <Star /> },
  { id: 'credit-repair', label: 'Credit Repair', icon: <TrendingUp /> },
  { id: 'platform', label: 'Platform Guide', icon: <BookOpen /> },
  { id: 'compliance', label: 'Compliance & Legal', icon: <FileText /> },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: <HelpCircle /> },
  { id: 'best-practices', label: 'Best Practices', icon: <CheckCircle /> }
];

// ===================================================================
// SAMPLE KNOWLEDGE BASE ARTICLES
// ===================================================================

const SAMPLE_ARTICLES = [
  {
    id: 'article-1',
    title: 'How to Read a Credit Report',
    category: 'credit-repair',
    summary: 'Complete guide to understanding all sections of a credit report.',
    content: `# How to Read a Credit Report

A credit report is divided into several key sections...

## Personal Information
This section includes your name, current and previous addresses...

## Account History
Shows all your credit accounts, including...

## Public Records
Lists bankruptcies, tax liens, and judgments...

## Inquiries
Shows who has accessed your credit report...`,
    author: 'Chris - Founder & CEO',
    views: 1250,
    helpful: 234,
    notHelpful: 12,
    lastUpdated: new Date('2024-01-15'),
    tags: ['credit-report', 'basics', 'education'],
    relatedArticles: ['article-2', 'article-3']
  },
  {
    id: 'article-2',
    title: 'Understanding Credit Scores',
    category: 'credit-repair',
    summary: 'Learn what factors impact your credit score and how to improve it.',
    content: `# Understanding Credit Scores

Your credit score is calculated using five main factors...`,
    author: 'Laurie - Operations Manager',
    views: 980,
    helpful: 189,
    notHelpful: 8,
    lastUpdated: new Date('2024-01-20'),
    tags: ['credit-score', 'factors', 'improvement'],
    relatedArticles: ['article-1', 'article-4']
  },
  {
    id: 'article-3',
    title: 'Common Credit Report Errors',
    category: 'credit-repair',
    summary: 'Identify and dispute common errors found on credit reports.',
    content: `# Common Credit Report Errors

Here are the most frequent errors we see...`,
    author: 'Chris - Founder & CEO',
    views: 756,
    helpful: 145,
    notHelpful: 5,
    lastUpdated: new Date('2024-02-01'),
    tags: ['errors', 'disputes', 'correction'],
    relatedArticles: ['article-1', 'article-2']
  }
];

const SAMPLE_FAQS = [
  {
    id: 'faq-1',
    category: 'getting-started',
    question: 'How long does credit repair take?',
    answer: 'Credit repair timelines vary by individual case. Most clients see results within 3-6 months, with an average score increase of 60-100 points. Complex cases may take longer.'
  },
  {
    id: 'faq-2',
    category: 'credit-repair',
    question: 'Can you remove accurate negative items?',
    answer: 'No. We can only dispute inaccurate, unverifiable, or outdated information. Accurate negative items must remain for the time periods specified by law (typically 7 years for most items, 10 years for bankruptcies).'
  },
  {
    id: 'faq-3',
    category: 'getting-started',
    question: 'What is your success rate?',
    answer: 'We successfully remove or modify 70-80% of inaccurate negative items we dispute. Success varies based on the accuracy of negative items and client cooperation.'
  },
  {
    id: 'faq-4',
    category: 'platform',
    question: 'How do I access my credit reports?',
    answer: 'Log into your client portal and navigate to the Credit Reports section. You can view all three bureau reports and see detailed analysis of each item.'
  },
  {
    id: 'faq-5',
    category: 'compliance',
    question: 'What is the FCRA?',
    answer: 'The Fair Credit Reporting Act (FCRA) is a federal law that regulates the collection, dissemination, and use of consumer credit information. It gives you rights to accurate credit reporting and dispute processes.'
  }
];

// ===================================================================
// MAIN KNOWLEDGE BASE COMPONENT
// ===================================================================

const KnowledgeBase = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [faqs, setFaqs] = useState(SAMPLE_FAQS);
  const [filteredArticles, setFilteredArticles] = useState(SAMPLE_ARTICLES);
  const [filteredFaqs, setFilteredFaqs] = useState(SAMPLE_FAQS);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'articles', 'faqs'

  // ===============================================================
  // LOAD DATA
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('📚 KnowledgeBase: Loading data');

    const unsubscribers = [];

    // Listen to bookmarked articles
    const bookmarksRef = collection(db, 'articleBookmarks');
    const bookmarksQuery = query(
      bookmarksRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubBookmarks = onSnapshot(bookmarksQuery, (snapshot) => {
      const bookmarks = [];
      snapshot.forEach((doc) => {
        bookmarks.push(doc.data().articleId);
      });
      setBookmarkedArticles(bookmarks);
    }, (err) => {
      console.error('❌ Error loading bookmarks:', err);
    });
    unsubscribers.push(unsubBookmarks);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up KnowledgeBase listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // FILTER CONTENT
  // ===============================================================

  useEffect(() => {
    let filteredArts = articles;
    let filteredFqs = faqs;

    // Category filter
    if (selectedCategory !== 'all') {
      filteredArts = filteredArts.filter(a => a.category === selectedCategory);
      filteredFqs = filteredFqs.filter(f => f.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredArts = filteredArts.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
      );
      filteredFqs = filteredFqs.filter(f =>
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filteredArts);
    setFilteredFaqs(filteredFqs);
  }, [articles, faqs, selectedCategory, searchQuery]);

  // ===============================================================
  // ACTIONS
  // ===============================================================

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    setShowArticleDialog(true);

    // Track view
    if (auth.currentUser) {
      try {
        await setDoc(doc(collection(db, 'articleViews')), {
          userId: auth.currentUser.uid,
          articleId: article.id,
          viewedAt: serverTimestamp()
        });
      } catch (err) {
        console.error('❌ Error tracking view:', err);
      }
    }
  };

  const handleToggleBookmark = async (articleId) => {
    if (!auth.currentUser) return;

    const bookmarkDoc = doc(db, 'articleBookmarks', `${auth.currentUser.uid}_${articleId}`);

    try {
      if (bookmarkedArticles.includes(articleId)) {
        await updateDoc(bookmarkDoc, {
          active: false
        });
      } else {
        await setDoc(bookmarkDoc, {
          userId: auth.currentUser.uid,
          articleId: articleId,
          active: true,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('❌ Error toggling bookmark:', err);
    }
  };

  const handleRateArticle = async (articleId, helpful) => {
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(collection(db, 'articleRatings')), {
        userId: auth.currentUser.uid,
        articleId: articleId,
        helpful: helpful,
        ratedAt: serverTimestamp()
      });
      console.log('✅ Article rated');
    } catch (err) {
      console.error('❌ Error rating article:', err);
    }
  };

  const handlePrintArticle = () => {
    window.print();
  };

  // ===============================================================
  // RENDER ARTICLE CARD
  // ===============================================================

  const renderArticleCard = (article) => {
    const isBookmarked = bookmarkedArticles.includes(article.id);

    return (
      <Grid item xs={12} md={6} key={article.id}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent onClick={() => handleArticleClick(article)}>
            <Box className="flex items-start justify-between mb-2">
              <Box className="flex-1">
                <Typography variant="h6" className="font-bold mb-1 text-gray-900 dark:text-white">
                  {article.title}
                </Typography>
                <Chip
                  label={KB_CATEGORIES.find(c => c.id === article.category)?.label}
                  size="small"
                  className="mb-2"
                />
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(article.id);
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="text-yellow-600" size={20} />
                ) : (
                  <Bookmark size={20} />
                )}
              </IconButton>
            </Box>

            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
              {article.summary}
            </Typography>

            <Box className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Box className="flex items-center gap-1">
                <Clock size={14} />
                <span>{article.views} views</span>
              </Box>
              <Box className="flex items-center gap-1">
                <ThumbsUp size={14} />
                <span>{article.helpful} helpful</span>
              </Box>
            </Box>

            <Box className="flex flex-wrap gap-1">
              {article.tags.map(tag => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading knowledge base...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box>
      {/* Search Header */}
      <Paper className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <Typography variant="h5" className="font-bold mb-3 text-gray-900 dark:text-white text-center">
          How can we help you today?
        </Typography>
        <TextField
          fullWidth
          placeholder="Search articles, FAQs, and guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={24} />
              </InputAdornment>
            )
          }}
          className="bg-white dark:bg-gray-800"
        />
      </Paper>

      {/* Categories */}
      <Paper className="p-4 mb-6">
        <Typography variant="subtitle2" className="mb-2 text-gray-600 dark:text-gray-400">
          Browse by Category
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label="All"
            onClick={() => setSelectedCategory('all')}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
          />
          {KB_CATEGORIES.map(cat => (
            <Chip
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              color={selectedCategory === cat.id ? 'primary' : 'default'}
            />
          ))}
        </Stack>
      </Paper>

      {/* View Mode Tabs */}
      <Paper className="p-2 mb-4">
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'all' ? 'contained' : 'text'}
            onClick={() => setViewMode('all')}
          >
            All
          </Button>
          <Button
            variant={viewMode === 'articles' ? 'contained' : 'text'}
            onClick={() => setViewMode('articles')}
            startIcon={<BookOpen />}
          >
            Articles ({filteredArticles.length})
          </Button>
          <Button
            variant={viewMode === 'faqs' ? 'contained' : 'text'}
            onClick={() => setViewMode('faqs')}
            startIcon={<HelpCircle />}
          >
            FAQs ({filteredFaqs.length})
          </Button>
        </Stack>
      </Paper>

      {/* Popular Articles */}
      {viewMode !== 'faqs' && (
        <Box className="mb-6">
          <Typography variant="h6" className="font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} />
            Popular Articles
          </Typography>
          <Grid container spacing={3}>
            {filteredArticles.slice(0, 4).map(article => renderArticleCard(article))}
          </Grid>
        </Box>
      )}

      {/* FAQs */}
      {viewMode !== 'articles' && filteredFaqs.length > 0 && (
        <Box>
          <Typography variant="h6" className="font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={20} />
            Frequently Asked Questions
          </Typography>
          <Paper>
            {filteredFaqs.map((faq, index) => (
              <Accordion key={faq.id}>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography className="font-semibold">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && filteredFaqs.length === 0 && (
        <Paper className="p-12 text-center">
          <Search size={64} className="mx-auto mb-4 text-gray-400" />
          <Typography variant="h6" className="mb-2 text-gray-900 dark:text-white">
            No results found
          </Typography>
          <Typography className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or browse by category
          </Typography>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}>
            Clear Search
          </Button>
        </Paper>
      )}

      {/* Article Detail Dialog */}
      <Dialog
        open={showArticleDialog}
        onClose={() => setShowArticleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Box className="flex items-start justify-between">
                <Box className="flex-1">
                  <Typography variant="h5" className="font-bold mb-2">
                    {selectedArticle.title}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    By {selectedArticle.author} • Last updated {selectedArticle.lastUpdated.toLocaleDateString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Bookmark">
                    <IconButton onClick={() => handleToggleBookmark(selectedArticle.id)}>
                      {bookmarkedArticles.includes(selectedArticle.id) ? (
                        <BookmarkCheck className="text-yellow-600" />
                      ) : (
                        <Bookmark />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print">
                    <IconButton onClick={handlePrintArticle}>
                      <Printer />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton>
                      <Share2 />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box className="prose dark:prose-invert max-w-none">
                <Typography variant="body1" className="whitespace-pre-line">
                  {selectedArticle.content}
                </Typography>
              </Box>

              <Divider className="my-4" />

              {/* Rating */}
              <Box className="text-center">
                <Typography variant="subtitle2" className="mb-2">
                  Was this article helpful?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<ThumbsUp />}
                    onClick={() => handleRateArticle(selectedArticle.id, true)}
                  >
                    Yes ({selectedArticle.helpful})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ThumbsDown />}
                    onClick={() => handleRateArticle(selectedArticle.id, false)}
                  >
                    No ({selectedArticle.notHelpful})
                  </Button>
                </Stack>
              </Box>

              {/* Related Articles */}
              {selectedArticle.relatedArticles && selectedArticle.relatedArticles.length > 0 && (
                <Box className="mt-6">
                  <Typography variant="h6" className="font-semibold mb-3">
                    Related Articles
                  </Typography>
                  <List>
                    {selectedArticle.relatedArticles.map(relatedId => {
                      const related = articles.find(a => a.id === relatedId);
                      return related ? (
                        <ListItem key={relatedId} disablePadding>
                          <ListItemButton onClick={() => handleArticleClick(related)}>
                            <ChevronRight size={20} className="mr-2" />
                            <ListItemText primary={related.title} />
                          </ListItemButton>
                        </ListItem>
                      ) : null;
                    })}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions className="p-4">
              <Button onClick={() => setShowArticleDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KnowledgeBase;