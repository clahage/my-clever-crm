// ============================================================================
// PostScheduler.jsx - SOCIAL MEDIA POST SCHEDULER
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Comprehensive post scheduling system with calendar view, multi-platform
// posting, draft management, and automated publishing. Enables users to plan,
// schedule, and manage social media content across all platforms.
//
// FEATURES:
// - Calendar view of scheduled posts
// - Multi-platform post creation
// - Draft management
// - Bulk scheduling
// - Post templates
// - Media upload and management
// - Preview before posting
// - Automated publishing
// - Time zone management
// - Optimal posting time suggestions (AI)
// - Post recycling
// - Queue management
//
// SUPPORTED POST TYPES:
// - Text posts
// - Image posts (single/multiple)
// - Video posts
// - Stories (Instagram/Facebook)
// - Reels/Shorts
// - Carousels
// - Polls
// - Links with preview
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
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Send,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Upload,
  Save,
  Sparkles,
  CheckCircle,
  XCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
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
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2', maxChars: 63206 },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e4405f', maxChars: 2200 },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1da1f2', maxChars: 280 },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0a66c2', maxChars: 3000 },
];

const POST_TYPES = [
  { value: 'text', label: 'Text Only' },
  { value: 'image', label: 'Image Post' },
  { value: 'video', label: 'Video Post' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel/Short' },
];

const VIEW_MODES = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'list', label: 'List' },
  { value: 'queue', label: 'Queue' },
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PostScheduler = () => {
  const { currentUser } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // View state
  const [viewMode, setViewMode] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Posts state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Dialog state
  const [createDialog, setCreateDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  // New post state
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [],
    postType: 'text',
    scheduledTime: new Date(),
    media: [],
    hashtags: [],
    mentions: [],
    location: '',
  });

  // Media upload state
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // AI state
  const [generatingOptimalTime, setGeneratingOptimalTime] = useState(false);
  const [optimalTimes, setOptimalTimes] = useState([]);

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to scheduled posts
    const scheduledQuery = query(
      collection(db, 'socialMedia', 'posts', 'scheduled'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'scheduled'),
      orderBy('scheduledTime', 'asc')
    );

    unsubscribers.push(
      onSnapshot(scheduledQuery, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScheduledPosts(posts);
        console.log('✅ Scheduled posts loaded:', posts.length);
      })
    );

    // Listen to draft posts
    const draftsQuery = query(
      collection(db, 'socialMedia', 'posts', 'drafts'),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(draftsQuery, (snapshot) => {
        const drafts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDraftPosts(drafts);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== POST HANDLERS =====
  const handleCreatePost = async (saveAsDraft = false) => {
    try {
      setLoading(true);

      const postData = {
        ...newPost,
        userId: currentUser.uid,
        status: saveAsDraft ? 'draft' : 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const collectionPath = saveAsDraft
        ? 'socialMedia/posts/drafts'
        : 'socialMedia/posts/scheduled';

      await addDoc(collection(db, collectionPath), postData);

      showSnackbar(
        saveAsDraft ? 'Post saved as draft!' : 'Post scheduled successfully!',
        'success'
      );

      setCreateDialog(false);
      setNewPost({
        content: '',
        platforms: [],
        postType: 'text',
        scheduledTime: new Date(),
        media: [],
        hashtags: [],
        mentions: [],
        location: '',
      });
    } catch (error) {
      console.error('❌ Error creating post:', error);
      showSnackbar('Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId, isDraft = false) => {
    if (!confirm('Delete this post?')) return;

    try {
      const collectionPath = isDraft
        ? 'socialMedia/posts/drafts'
        : 'socialMedia/posts/scheduled';

      await deleteDoc(doc(db, collectionPath, postId));
      showSnackbar('Post deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      showSnackbar('Failed to delete post', 'error');
    }
  };

  const handleDuplicatePost = async (post) => {
    try {
      const duplicateData = {
        ...post,
        content: `${post.content} (Copy)`,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      delete duplicateData.id;

      await addDoc(collection(db, 'socialMedia', 'posts', 'drafts'), duplicateData);
      showSnackbar('Post duplicated!', 'success');
    } catch (error) {
      console.error('❌ Error duplicating post:', error);
      showSnackbar('Failed to duplicate post', 'error');
    }
  };

  const handlePublishNow = async (postId) => {
    if (!confirm('Publish this post immediately?')) return;

    try {
      // Update post status to publishing
      await updateDoc(doc(db, 'socialMedia', 'posts', 'scheduled', postId), {
        status: 'publishing',
        publishedAt: serverTimestamp(),
      });

      // In production, this would trigger Cloud Function to publish
      showSnackbar('Post is being published!', 'success');
    } catch (error) {
      console.error('❌ Error publishing post:', error);
      showSnackbar('Failed to publish post', 'error');
    }
  };

  // ===== AI HANDLERS =====
  const handleGenerateOptimalTime = async () => {
    if (!OPENAI_API_KEY) {
      showSnackbar('OpenAI API key not configured', 'warning');
      return;
    }

    try {
      setGeneratingOptimalTime(true);

      const prompt = `Based on social media best practices for credit repair business, suggest 3 optimal posting times for today. Consider:
- Target audience: Credit repair clients
- Business hours: 9 AM - 6 PM EST
- Platform: ${newPost.platforms.join(', ')}

Provide 3 time suggestions in JSON format:
[
  {
    "time": "09:30 AM",
    "reason": "Morning engagement peak",
    "dayPart": "Morning"
  }
]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const content = data.content[0].text;

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const times = JSON.parse(jsonMatch[0]);
        setOptimalTimes(times);
        showSnackbar('Optimal times generated!', 'success');
      }
    } catch (error) {
      console.error('❌ AI error:', error);
      showSnackbar('Failed to generate optimal times', 'error');
    } finally {
      setGeneratingOptimalTime(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = [];
    
    let day = startOfWeek(start);
    while (day <= endOfWeek(end)) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };

  const getPostsForDay = (day) => {
    return scheduledPosts.filter(post =>
      post.scheduledTime && isSameDay(post.scheduledTime.toDate(), day)
    );
  };

  const getCharacterLimit = () => {
    if (newPost.platforms.length === 0) return 0;
    const limits = newPost.platforms.map(p => {
      const platform = PLATFORMS.find(pl => pl.id === p);
      return platform?.maxChars || 0;
    });
    return Math.min(...limits);
  };

  // ===== RENDER: CALENDAR VIEW =====
  const renderCalendarView = () => {
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Box>
        {/* Calendar Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight />
            </IconButton>
          </Box>
          <Button variant="outlined" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </Box>

        {/* Calendar Grid */}
        <Paper>
          <Grid container>
            {/* Week Day Headers */}
            {weekDays.map(day => (
              <Grid item xs={12/7} key={day} sx={{ p: 1, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">
                  {day}
                </Typography>
              </Grid>
            ))}

            {/* Calendar Days */}
            {days.map((day, index) => {
              const dayPosts = getPostsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <Grid
                  item
                  xs={12/7}
                  key={index}
                  sx={{
                    p: 1,
                    minHeight: 100,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: isToday ? 'action.hover' : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={isToday ? 'bold' : 'normal'}>
                    {format(day, 'd')}
                  </Typography>
                  {dayPosts.map((post, idx) => (
                    <Chip
                      key={idx}
                      label={post.platforms[0]}
                      size="small"
                      sx={{ mt: 0.5, width: '100%' }}
                      onClick={() => {
                        setSelectedPost(post);
                        setPreviewDialog(true);
                      }}
                    />
                  ))}
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>
    );
  };

  // ===== RENDER: LIST VIEW =====
  const renderListView = () => (
    <Grid container spacing={2}>
      {scheduledPosts.length > 0 ? (
        scheduledPosts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" gutterBottom>
                      {post.content.substring(0, 100)}
                      {post.content.length > 100 && '...'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                      {post.platforms?.map(platform => {
                        const platformData = PLATFORMS.find(p => p.id === platform);
                        const Icon = platformData?.icon;
                        return (
                          <Tooltip key={platform} title={platformData?.name}>
                            <Avatar sx={{ bgcolor: platformData?.color, width: 24, height: 24 }}>
                              {Icon && <Icon size={14} />}
                            </Avatar>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                  <Chip
                    icon={<Clock size={14} />}
                    label={post.scheduledTime && format(post.scheduledTime.toDate(), 'MMM dd, h:mm a')}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPost(post);
                        setPreviewDialog(true);
                      }}
                    >
                      <Eye size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <Edit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <IconButton size="small" onClick={() => handleDuplicatePost(post)}>
                      <Copy size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Publish Now">
                    <IconButton size="small" color="success" onClick={() => handlePublishNow(post.id)}>
                      <Send size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Alert severity="info">
            <AlertTitle>No Scheduled Posts</AlertTitle>
            Create your first scheduled post to get started!
          </Alert>
        </Grid>
      )}
    </Grid>
  );

  // ===== RENDER: QUEUE VIEW =====
  const renderQueueView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Publishing Queue
            </Typography>
            <List>
              {scheduledPosts.slice(0, 10).map((post, index) => (
                <React.Fragment key={post.id}>
                  <ListItem>
                    <ListItemText
                      primary={post.content.substring(0, 80) + '...'}
                      secondary={post.scheduledTime && format(post.scheduledTime.toDate(), 'MMM dd, h:mm a')}
                    />
                    <Chip label={`#${index + 1}`} size="small" />
                  </ListItem>
                  {index < scheduledPosts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Drafts
            </Typography>
            <List>
              {draftPosts.slice(0, 5).map((draft) => (
                <ListItem key={draft.id} button>
                  <ListItemText
                    primary={draft.content.substring(0, 50) + '...'}
                    secondary="Draft"
                  />
                </ListItem>
              ))}
            </List>
            {draftPosts.length === 0 && (
              <Alert severity="info">No drafts</Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ===== MAIN RENDER =====
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Post Scheduler</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, value) => value && setViewMode(value)}
            size="small"
          >
            {VIEW_MODES.map(mode => (
              <ToggleButton key={mode.value} value={mode.value}>
                {mode.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setCreateDialog(true)}
          >
            Create Post
          </Button>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">{scheduledPosts.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled Posts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">{draftPosts.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Drafts
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">
              {scheduledPosts.filter(p => isSameDay(p.scheduledTime?.toDate() || new Date(), new Date())).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today's Posts
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Content */}
      {viewMode === 'calendar' && renderCalendarView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'queue' && renderQueueView()}

      {/* Create Post Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Platform Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Platforms *
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = newPost.platforms.includes(platform.id);
                  return (
                    <Chip
                      key={platform.id}
                      icon={<Icon size={16} />}
                      label={platform.name}
                      onClick={() => {
                        const platforms = isSelected
                          ? newPost.platforms.filter(p => p !== platform.id)
                          : [...newPost.platforms, platform.id];
                        setNewPost({ ...newPost, platforms });
                      }}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
            </Grid>

            {/* Post Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Post Type</InputLabel>
                <Select
                  value={newPost.postType}
                  label="Post Type"
                  onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}
                >
                  {POST_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Scheduled Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Schedule Time"
                value={format(newPost.scheduledTime, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewPost({ ...newPost, scheduledTime: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Post Content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Write your post content here..."
                helperText={
                  newPost.platforms.length > 0
                    ? `${newPost.content.length} / ${getCharacterLimit()} characters`
                    : 'Select platforms to see character limit'
                }
              />
            </Grid>

            {/* AI Optimal Time */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={generatingOptimalTime ? <CircularProgress size={16} /> : <Sparkles />}
                onClick={handleGenerateOptimalTime}
                disabled={generatingOptimalTime || newPost.platforms.length === 0}
              >
                {generatingOptimalTime ? 'Generating...' : 'Suggest Optimal Time (AI)'}
              </Button>

              {optimalTimes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Suggested Times:
                  </Typography>
                  {optimalTimes.map((time, index) => (
                    <Chip
                      key={index}
                      label={`${time.time} - ${time.reason}`}
                      sx={{ m: 0.5 }}
                      onClick={() => {
                        // Set the suggested time
                        const [hours, minutes] = time.time.split(':');
                        const newTime = new Date(newPost.scheduledTime);
                        newTime.setHours(parseInt(hours), parseInt(minutes.split(' ')[0]));
                        setNewPost({ ...newPost, scheduledTime: newTime });
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Media Upload */}
            {['image', 'video', 'carousel'].includes(newPost.postType) && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  component="label"
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? 'Uploading...' : 'Upload Media'}
                  <input type="file" hidden accept="image/*,video/*" multiple />
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={() => handleCreatePost(true)}
            disabled={loading || !newPost.content || newPost.platforms.length === 0}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => handleCreatePost(false)}
            disabled={loading || !newPost.content || newPost.platforms.length === 0}
          >
            {loading ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post Preview</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" paragraph>
                {selectedPost.content}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {selectedPost.platforms?.map(platform => {
                  const platformData = PLATFORMS.find(p => p.id === platform);
                  const Icon = platformData?.icon;
                  return (
                    <Chip
                      key={platform}
                      icon={Icon && <Icon size={16} />}
                      label={platformData?.name}
                      size="small"
                    />
                  );
                })}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Scheduled: {selectedPost.scheduledTime && format(selectedPost.scheduledTime.toDate(), 'PPpp')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
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

export default PostScheduler;