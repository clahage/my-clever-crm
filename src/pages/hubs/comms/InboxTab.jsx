// Path: /src/pages/hubs/comms/InboxTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - INBOX TAB
// ============================================================================
// Purpose: Unified communications inbox for all channels
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Badge,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import {
  Search,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Inbox as InboxIcon
} from 'lucide-react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const InboxTab = () => {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // In a real implementation, we'd combine emails, SMS, and messages into conversations
    // For now, we'll use a simple conversations collection
    const q = query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail size={16} />;
      case 'sms': return <MessageSquare size={16} />;
      case 'phone': return <Phone size={16} />;
      default: return <InboxIcon size={16} />;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'email': return 'primary';
      case 'sms': return 'success';
      case 'phone': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
              <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary" align="center">
                          {searchTerm
                            ? 'No conversations match your search'
                            : 'No conversations yet'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ) : (
                  filteredConversations.map((conv) => (
                    <React.Fragment key={conv.id}>
                      <ListItem
                        button
                        selected={selectedConversation?.id === conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: conv.unread ? 'action.hover' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          <Avatar>{conv.clientName?.[0] || 'C'}</Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {conv.clientName}
                              </Typography>
                              {conv.unread && (
                                <Badge badgeContent={conv.unreadCount || 1} color="primary" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                                {conv.lastMessage}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  icon={getChannelIcon(conv.channel)}
                                  label={conv.channel}
                                  size="small"
                                  color={getChannelColor(conv.channel)}
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {conv.lastMessageAt?.toDate().toLocaleDateString() || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversation Detail */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ height: 650, display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <Box sx={{ pb: 2, borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Typography variant="h6">
                      {selectedConversation.clientName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Chip
                        icon={getChannelIcon(selectedConversation.channel)}
                        label={selectedConversation.channel}
                        size="small"
                        color={getChannelColor(selectedConversation.channel)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {selectedConversation.clientEmail || selectedConversation.clientPhone}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages Area */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2">
                        {selectedConversation.lastMessage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {selectedConversation.lastMessageAt?.toDate().toLocaleString() || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Reply Area */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      multiline
                      maxRows={3}
                    />
                    <IconButton color="primary" size="large">
                      <Send />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >
                  <InboxIcon size={64} style={{ color: '#ccc' }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    Select a conversation to view messages
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InboxTab;
