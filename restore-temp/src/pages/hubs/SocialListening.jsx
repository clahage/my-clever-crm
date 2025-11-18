// ============================================================================
// SocialListening.jsx - SOCIAL LISTENING & MONITORING
// ============================================================================
// VERSION: 1.0.0
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Social listening and brand monitoring system. Track mentions, keywords,
// competitors, and industry trends across social platforms.
//
// FEATURES:
// - Brand mention tracking
// - Keyword monitoring
// - Competitor analysis
// - Sentiment analysis
// - Trend discovery
// - Alert notifications
// - Response management
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
  Chip,
  Alert,
  AlertTitle,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Divider,
} from '@mui/material';
import {
  Radio,
  Search,
  TrendingUp,
  MessageCircle,
  Bell,
  Plus,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';

const SocialListening = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('mentions');
  const [mentions, setMentions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [trends, setTrends] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to mentions
    const mentionsQuery = query(
      collection(db, 'socialMedia', 'listening', 'mentions'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    unsubscribers.push(
      onSnapshot(mentionsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMentions(data);
      })
    );

    // Listen to keywords
    const keywordsQuery = query(
      collection(db, 'socialMedia', 'listening', 'keywords'),
      where('userId', '==', currentUser.uid)
    );

    unsubscribers.push(
      onSnapshot(keywordsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKeywords(data);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      await addDoc(collection(db, 'socialMedia', 'listening', 'keywords'), {
        keyword: newKeyword,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        active: true,
      });
      setNewKeyword('');
    } catch (error) {
      console.error('Error adding keyword:', error);
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    try {
      await deleteDoc(doc(db, 'socialMedia', 'listening', 'keywords', keywordId));
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  const renderMentions = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4">{mentions.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Mentions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {mentions.filter(m => m.sentiment === 'positive').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Positive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {mentions.filter(m => m.responded === false).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Needs Response
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Mentions
          </Typography>
          <List>
            {mentions.length > 0 ? (
              mentions.slice(0, 10).map((mention) => (
                <React.Fragment key={mention.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Radio size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={mention.text || 'Mention content'}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            label={mention.sentiment || 'neutral'}
                            size="small"
                            color={
                              mention.sentiment === 'positive'
                                ? 'success'
                                : mention.sentiment === 'negative'
                                ? 'error'
                                : 'default'
                            }
                          />
                          <Typography variant="caption">
                            {mention.platform} • {mention.timestamp && format(mention.timestamp.toDate(), 'MMM dd, h:mm a')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View">
                        <IconButton size="small">
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Respond">
                        <IconButton size="small">
                          <MessageCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <Alert severity="info">No mentions yet</Alert>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  const renderKeywords = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Add keyword to monitor..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            fullWidth
          />
          <Button variant="contained" onClick={handleAddKeyword}>
            Add
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <Grid item xs={12} sm={6} md={4} key={keyword.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{keyword.keyword}</Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {keyword.mentionCount || 0} mentions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Keywords</AlertTitle>
              Add keywords to start monitoring!
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderTrends = () => (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trending Topics
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            AI-powered trend analysis coming soon!
          </Alert>
          <List>
            {[
              { topic: 'Credit Score Tips', mentions: 145, trend: 'up' },
              { topic: 'Debt Management', mentions: 98, trend: 'up' },
              { topic: 'Financial Literacy', mentions: 76, trend: 'stable' },
            ].map((trend, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TrendingUp size={20} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={trend.topic}
                    secondary={`${trend.mentions} mentions`}
                  />
                  <Chip
                    label={trend.trend}
                    size="small"
                    color={trend.trend === 'up' ? 'success' : 'default'}
                  />
                </ListItem>
                {index < 2 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Social Listening
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Social Listening</AlertTitle>
        Monitor brand mentions, keywords, and trends across social media platforms.
      </Alert>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            value="mentions"
            label="Mentions"
            icon={<Badge badgeContent={mentions.length} color="error"><Radio /></Badge>}
            iconPosition="start"
          />
          <Tab value="keywords" label="Keywords" icon={<Search />} iconPosition="start" />
          <Tab value="trends" label="Trends" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 'mentions' && renderMentions()}
      {activeTab === 'keywords' && renderKeywords()}
      {activeTab === 'trends' && renderTrends()}
    </Box>
  );
};

export default SocialListening;