import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, InputAdornment, Grid, Card,
  CardContent, Chip, Alert, CircularProgress, List, ListItem,
  ListItemButton, ListItemText, Divider, Collapse
} from '@mui/material';
import { BookOpen, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const KnowledgeBaseTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');

      const articlesRef = collection(db, 'articles');
      const articlesSnap = await getDocs(query(articlesRef, orderBy('createdAt', 'desc')));
      const articlesData = articlesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesData);

    } catch (err) {
      console.error('Error loading articles:', err);
      setError('Failed to load knowledge base articles');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const filteredArticles = articles.filter(article =>
    !searchQuery ||
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(articles.map(a => a.category || 'General'))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <BookOpen size={24} />
        <Typography variant="h5" fontWeight="bold">
          Knowledge Base
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {/* Categories Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <List>
              {categories.map((category) => {
                const categoryArticles = filteredArticles.filter(a => (a.category || 'General') === category);
                return (
                  <Box key={category}>
                    <ListItemButton onClick={() => toggleCategory(category)}>
                      <ListItemText primary={category} secondary={`${categoryArticles.length} articles`} />
                      {expandedCategories[category] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </ListItemButton>
                    <Collapse in={expandedCategories[category]}>
                      <List component="div" disablePadding>
                        {categoryArticles.map((article) => (
                          <ListItemButton
                            key={article.id}
                            sx={{ pl: 4 }}
                            onClick={() => setSelectedArticle(article)}
                            selected={selectedArticle?.id === article.id}
                          >
                            <ListItemText primary={article.title} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Article Content */}
        <Grid item xs={12} md={8}>
          {selectedArticle ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {selectedArticle.title}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label={selectedArticle.category || 'General'} size="small" sx={{ mr: 1 }} />
                <Chip label={`${selectedArticle.readTime || 5} min read`} size="small" variant="outlined" />
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedArticle.content || 'No content available'}
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BookOpen size={64} color="#ccc" />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Select an article to read
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default KnowledgeBaseTab;
