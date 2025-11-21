// ============================================================================
// EngagementTracker.jsx - ENGAGEMENT TRACKER
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
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  Badge,
  Alert,
} from '@mui/material';
import {
  MessageCircle,
  Heart,
  Share2,
  ThumbsUp,
  Send,
  CheckCircle,
  Clock,
  Eye,
  Reply,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { format } from 'date-fns';

const EngagementTracker = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to comments
    const commentsQuery = query(
      collection(db, 'socialMedia', 'engagement', 'comments'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    unsubscribers.push(
      onSnapshot(commentsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(data);
      })
    );

    // Listen to messages
    const messagesQuery = query(
      collection(db, 'socialMedia', 'engagement', 'messages'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    unsubscribers.push(
      onSnapshot(messagesQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(data);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  const handleReply = async (itemId, type) => {
    const reply = replyText[itemId];
    if (!reply?.trim()) return;

    try {
      const collectionPath = `socialMedia/engagement/${type}`;
      await updateDoc(doc(db, collectionPath, itemId), {
        replied: true,
        replyText: reply,
        repliedAt: new Date(),
      });

      setReplyText({ ...replyText, [itemId]: '' });
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  const handleMarkAsRead = async (itemId, type) => {
    try {
      const collectionPath = `socialMedia/engagement/${type}`;
      await updateDoc(doc(db, collectionPath, itemId), {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderComments = () => (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">{comments.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Comments
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">
              {comments.filter(c => !c.replied).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Response
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">
              {comments.filter(c => c.replied).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Responded
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card>
        <List>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{comment.author?.[0] || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {comment.author || 'User'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {comment.replied ? (
                            <Chip
                              label="Replied"
                              size="small"
                              color="success"
                              icon={<CheckCircle size={14} />}
                            />
                          ) : (
                            <Chip
                              label="Pending"
                              size="small"
                              color="warning"
                              icon={<Clock size={14} />}
                            />
                          )}
                          <Chip
                            label={comment.platform}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.primary">
                          {comment.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {comment.timestamp && format(comment.timestamp.toDate(), 'MMM dd, h:mm a')}
                        </Typography>
                        {!comment.replied && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Type your reply..."
                              value={replyText[comment.id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                            />
                            <IconButton
                              color="primary"
                              onClick={() => handleReply(comment.id, 'comments')}
                            >
                              <Send size={18} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No comments to display
            </Alert>
          )}
        </List>
      </Card>
    </Box>
  );

  const renderMessages = () => (
    <Box>
      <Card>
        <List>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <React.Fragment key={message.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Badge
                      badgeContent={message.read ? null : '!'}
                      color="error"
                    >
                      <Avatar>{message.from?.[0] || 'U'}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {message.from || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {message.timestamp && format(message.timestamp.toDate(), 'h:mm a')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">{message.text}</Typography>
                        {!message.read && (
                          <Button
                            size="small"
                            startIcon={<Eye size={14} />}
                            sx={{ mt: 1 }}
                            onClick={() => handleMarkAsRead(message.id, 'messages')}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < messages.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No messages to display
            </Alert>
          )}
        </List>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Engagement Tracker
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            value="comments"
            label="Comments"
            icon={
              <Badge badgeContent={comments.filter(c => !c.replied).length} color="error">
                <MessageCircle />
              </Badge>
            }
            iconPosition="start"
          />
          <Tab
            value="messages"
            label="Messages"
            icon={
              <Badge badgeContent={messages.filter(m => !m.read).length} color="error">
                <Send />
              </Badge>
            }
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {activeTab === 'comments' && renderComments()}
      {activeTab === 'messages' && renderMessages()}
    </Box>
  );
};

export default EngagementTracker;