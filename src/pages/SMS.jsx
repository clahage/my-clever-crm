// src/pages/SMS.jsx - Complete SMS Messaging System
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Menu, MenuItem, FormControl, InputLabel,
  Select, Card, CardContent, Grid, Avatar, Stack, Tooltip, Badge,
  CircularProgress, LinearProgress, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Divider, Switch,
  FormControlLabel, Checkbox, Autocomplete, InputAdornment,
  ToggleButton, ToggleButtonGroup, Drawer, AvatarGroup
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  MessageSquare, Send, Phone, User, Users, Clock, CheckCircle,
  XCircle, AlertCircle, Search, Filter, Calendar, Archive,
  Smartphone, Wifi, Signal, Battery, MoreVertical, Plus,
  FileText, Image, Mic, Video, MapPin, Paperclip, Smile,
  Settings, Download, Upload, Edit, Trash2, Star, Flag,
  ChevronLeft, ChevronRight, TrendingUp, DollarSign,
  BarChart2, PieChart, Hash, Link2, Copy, RefreshCw,
  Zap, Shield, Bell, BellOff, Volume2, VolumeX
} from 'lucide-react';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, limit, serverTimestamp, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';

const SMS = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const messageEndRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Message Form State
  const [messageForm, setMessageForm] = useState({
    to: '',
    message: '',
    mediaUrl: '',
    scheduled: false,
    sendAt: null,
    template: null
  });

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    recipients: [],
    segments: [],
    schedule: {
      type: 'immediate', // immediate, scheduled, drip
      sendAt: null,
      interval: 'daily',
      count: 1
    },
    tracking: {
      delivery: true,
      replies: true,
      optOuts: true
    },
    settings: {
      stopOnReply: true,
      includeOptOut: true,
      personalize: true
    }
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'general',
    message: '',
    variables: [],
    isActive: true
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalDelivered: 0,
    deliveryRate: 0,
    responseRate: 0,
    optOutRate: 0,
    activeConversations: 0,
    todayMessages: 0
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // SMS Templates
  const smsTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      category: 'onboarding',
      message: 'Hi {{firstName}}! Welcome to our credit repair service. Reply STOP to opt out.',
      variables: ['firstName']
    },
    {
      id: 'reminder',
      name: 'Payment Reminder',
      category: 'billing',
      message: 'Hi {{firstName}}, your payment of {{amount}} is due on {{dueDate}}. Pay now: {{link}}',
      variables: ['firstName', 'amount', 'dueDate', 'link']
    },
    {
      id: 'progress',
      name: 'Progress Update',
      category: 'update',
      message: 'Great news {{firstName}}! Your credit score improved by {{points}} points!',
      variables: ['firstName', 'points']
    },
    {
      id: 'appointment',
      name: 'Appointment Reminder',
      category: 'scheduling',
      message: 'Reminder: Your appointment is on {{date}} at {{time}}. Reply C to confirm.',
      variables: ['date', 'time']
    }
  ];

  // Load conversations
  const loadConversations = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'smsConversations'),
        where('userId', '==', currentUser.uid),
        orderBy('lastMessageAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const conversationsData = [];
      
      querySnapshot.forEach((doc) => {
        conversationsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setConversations(conversationsData);
      calculateStatistics(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showSnackbar('Error loading conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for conversation
  const loadMessages = async (conversationId) => {
    try {
      const q = query(
        collection(db, 'smsMessages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const messagesData = [];
      
      querySnapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setMessages(messagesData);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Load contacts
  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.phone
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      const q = query(
        collection(db, 'smsCampaigns'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const campaignsData = [];
      
      querySnapshot.forEach((doc) => {
        campaignsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const q = query(
        collection(db, 'smsTemplates'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const templatesData = [];
      
      querySnapshot.forEach((doc) => {
        templatesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTemplates([...smsTemplates, ...templatesData]);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Calculate statistics
  const calculateStatistics = (conversationsData) => {
    const stats = {
      totalSent: 0,
      totalReceived: 0,
      totalDelivered: 0,
      deliveryRate: 0,
      responseRate: 0,
      optOutRate: 0,
      activeConversations: 0,
      todayMessages: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    conversationsData.forEach(conv => {
      if (conv.messageCount) {
        stats.totalSent += conv.sentCount || 0;
        stats.totalReceived += conv.receivedCount || 0;
        stats.totalDelivered += conv.deliveredCount || 0;
      }
      
      if (conv.lastMessageAt) {
        const lastMessage = conv.lastMessageAt.toDate ? conv.lastMessageAt.toDate() : new Date(conv.lastMessageAt);
        if (lastMessage >= today) {
          stats.todayMessages++;
        }
        
        // Active if last message within 7 days
        const daysSince = differenceInMinutes(new Date(), lastMessage) / (60 * 24);
        if (daysSince <= 7) {
          stats.activeConversations++;
        }
      }
    });

    if (stats.totalSent > 0) {
      stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
      stats.responseRate = (stats.totalReceived / stats.totalSent) * 100;
    }

    setStatistics(stats);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageForm.message.trim()) return;

    setLoading(true);
    try {
      // Create or get conversation
      let conversationId = selectedConversation?.id;
      
      if (!conversationId) {
        // Create new conversation
        const conversationData = {
          userId: currentUser.uid,
          contact: selectedContact,
          lastMessage: messageForm.message,
          lastMessageAt: serverTimestamp(),
          messageCount: 1,
          sentCount: 1,
          status: 'active',
          createdAt: serverTimestamp()
        };
        
        const convRef = await addDoc(collection(db, 'smsConversations'), conversationData);
        conversationId = convRef.id;
      }

      // Create message
      const messageData = {
        conversationId,
        userId: currentUser.uid,
        from: currentUser.phoneNumber || 'System',
        to: messageForm.to || selectedContact?.phone,
        message: messageForm.message,
        direction: 'outbound',
        status: 'sent',
        mediaUrl: messageForm.mediaUrl,
        scheduled: messageForm.scheduled,
        sendAt: messageForm.sendAt,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'smsMessages'), messageData);
      
      // Update conversation
      await updateDoc(doc(db, 'smsConversations', conversationId), {
        lastMessage: messageForm.message,
        lastMessageAt: serverTimestamp(),
        messageCount: increment(1),
        sentCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      showSnackbar('Message sent successfully!', 'success');
      setMessageForm({ ...messageForm, message: '', mediaUrl: '' });
      loadMessages(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('Error sending message', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      const campaignData = {
        ...campaignForm,
        userId: currentUser.uid,
        status: 'draft',
        stats: {
          sent: 0,
          delivered: 0,
          failed: 0,
          replies: 0,
          optOuts: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'smsCampaigns'), campaignData);
      
      showSnackbar('Campaign created successfully!', 'success');
      setCampaignDialogOpen(false);
      resetCampaignForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      showSnackbar('Error creating campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaign) => {
    try {
      // Update campaign status
      await updateDoc(doc(db, 'smsCampaigns', campaign.id), {
        status: 'sending',
        sentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Simulate sending to recipients
      setTimeout(async () => {
        await updateDoc(doc(db, 'smsCampaigns', campaign.id), {
          status: 'sent',
          'stats.sent': campaign.recipients?.length || 0,
          'stats.delivered': campaign.recipients?.length || 0,
          updatedAt: serverTimestamp()
        });
        
        showSnackbar('Campaign sent successfully!', 'success');
        loadCampaigns();
      }, 2000);
      
    } catch (error) {
      console.error('Error sending campaign:', error);
      showSnackbar('Error sending campaign', 'error');
    }
  };

  // Create template
  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const templateData = {
        ...templateForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'smsTemplates'), templateData);
      
      showSnackbar('Template created successfully!', 'success');
      setTemplateDialogOpen(false);
      resetTemplateForm();
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      showSnackbar('Error creating template', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply template
  const applyTemplate = (template) => {
    setMessageForm(prev => ({
      ...prev,
      message: template.message,
      template: template
    }));
    showSnackbar('Template applied!', 'success');
  };

  // Format message time
  const formatMessageTime = (date) => {
    const messageDate = date?.toDate ? date.toDate() : new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else {
      return format(messageDate, 'MMM d, h:mm a');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset forms
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      message: '',
      recipients: [],
      segments: [],
      schedule: {
        type: 'immediate',
        sendAt: null,
        interval: 'daily',
        count: 1
      },
      tracking: {
        delivery: true,
        replies: true,
        optOuts: true
      },
      settings: {
        stopOnReply: true,
        includeOptOut: true,
        personalize: true
      }
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'general',
      message: '',
      variables: [],
      isActive: true
    });
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Initialize
  useEffect(() => {
    if (currentUser) {
      loadConversations();
      loadContacts();
      loadCampaigns();
      loadTemplates();
    }
  }, [currentUser]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          conv.contact?.displayName?.toLowerCase().includes(search) ||
          conv.contact?.phone?.toLowerCase().includes(search) ||
          conv.lastMessage?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [conversations, searchTerm]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              SMS Messaging
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send SMS messages and manage campaigns
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<MessageSquare size={20} />}
              onClick={() => setDialogOpen(true)}
            >
              New Message
            </Button>
            <Button
              variant="contained"
              startIcon={<Users size={20} />}
              onClick={() => setCampaignDialogOpen(true)}
            >
              Create Campaign
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Messages Today</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.todayMessages}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      <TrendingUp size={12} /> Active messaging
                    </Typography>
                  </Box>
                  <Send size={24} color="#10B981" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Delivery Rate</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.deliveryRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Industry avg: 95%
                    </Typography>
                  </Box>
                  <CheckCircle size={24} color="#3B82F6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Response Rate</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.responseRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From campaigns
                    </Typography>
                  </Box>
                  <MessageSquare size={24} color="#8B5CF6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Chats</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.activeConversations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last 7 days
                    </Typography>
                  </Box>
                  <Users size={24} color="#F59E0B" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Messages" />
            <Tab label="Campaigns" />
            <Tab label="Templates" />
            <Tab label="Analytics" />
          </Tabs>

          {/* Messages Tab */}
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', height: 600 }}>
              {/* Conversations List */}
              <Box sx={{ 
                width: 350, 
                borderRight: 1, 
                borderColor: 'divider',
                overflow: 'auto'
              }}>
                <Box sx={{ p: 2 }}>
                  <TextField
                    placeholder="Search conversations..."
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search size={18} />
                    }}
                  />
                </Box>
                
                <List>
                  {filteredConversations.map((conv) => (
                    <ListItem
                      key={conv.id}
                      button
                      selected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <ListItemIcon>
                        <Avatar>
                          {conv.contact?.displayName?.[0] || '?'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={conv.contact?.displayName || 'Unknown'}
                        secondary={
                          <Box>
                            <Typography variant="body2" noWrap>
                              {conv.lastMessage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conv.lastMessageAt && formatMessageTime(conv.lastMessageAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      {conv.unreadCount > 0 && (
                        <Badge badgeContent={conv.unreadCount} color="primary" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Message Thread */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <Box sx={{ 
                      p: 2, 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          {selectedConversation.contact?.displayName?.[0] || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {selectedConversation.contact?.displayName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedConversation.contact?.phone}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small">
                          <Phone size={18} />
                        </IconButton>
                        <IconButton size="small">
                          <Archive size={18} />
                        </IconButton>
                        <IconButton size="small">
                          <MoreVertical size={18} />
                        </IconButton>
                      </Stack>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflow: 'auto', 
                      p: 2,
                      backgroundColor: '#f5f5f5'
                    }}>
                      {messages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: message.direction === 'outbound' ? 'flex-end' : 'flex-start',
                            mb: 2
                          }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              backgroundColor: message.direction === 'outbound' ? '#4F46E5' : 'white',
                              color: message.direction === 'outbound' ? 'white' : 'text.primary'
                            }}
                          >
                            <Typography variant="body2">
                              {message.message}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              display: 'block', 
                              mt: 1,
                              opacity: 0.8
                            }}>
                              {formatMessageTime(message.createdAt)}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messageEndRef} />
                    </Box>

                    {/* Message Input */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2}>
                        <IconButton size="small">
                          <Paperclip size={18} />
                        </IconButton>
                        <TextField
                          fullWidth
                          placeholder="Type a message..."
                          value={messageForm.message}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSendMessage}
                          disabled={!messageForm.message.trim()}
                        >
                          <Send size={18} />
                        </Button>
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <MessageSquare size={48} />
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Select a conversation to start messaging
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Campaigns Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">SMS Campaigns</Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setCampaignDialogOpen(true)}
                >
                  New Campaign
                </Button>
              </Box>

              <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                  <Grid item xs={12} md={4} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" noWrap>
                            {campaign.name}
                          </Typography>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={
                              campaign.status === 'sent' ? 'success' :
                              campaign.status === 'scheduled' ? 'info' :
                              'default'
                            }
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {campaign.message.substring(0, 100)}...
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Recipients
                            </Typography>
                            <Typography variant="body2">
                              {campaign.recipients?.length || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Sent
                            </Typography>
                            <Typography variant="body2">
                              {campaign.stats?.sent || 0}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          {campaign.status === 'draft' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSendCampaign(campaign)}
                            >
                              Send
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Templates Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">SMS Templates</Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  Create Template
                </Button>
              </Box>

              <Grid container spacing={3}>
                {templates.map((template) => (
                  <Grid item xs={12} md={6} key={template.id || template.name}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {template.name}
                          </Typography>
                          <Chip 
                            label={template.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {template.message}
                        </Typography>
                        
                        {template.variables?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Variables: 
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              {template.variables.map(v => (
                                <Chip key={v} label={v} size="small" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Button
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => applyTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Analytics Tab */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Message Volume</Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        Message volume chart will be displayed here
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Top Conversations</Typography>
                    <List dense>
                      {conversations.slice(0, 5).map((conv) => (
                        <ListItem key={conv.id}>
                          <ListItemText
                            primary={conv.contact?.displayName || 'Unknown'}
                            secondary={`${conv.messageCount || 0} messages`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* New Message Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New SMS Message</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(option) => `${option.displayName} (${option.phone})`}
                  value={selectedContact}
                  onChange={(e, value) => {
                    setSelectedContact(value);
                    setMessageForm(prev => ({ ...prev, to: value?.phone || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="To" fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  fullWidth
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  helperText={`${messageForm.message.length}/160 characters`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={messageForm.scheduled}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, scheduled: e.target.checked }))}
                    />
                  }
                  label="Schedule message"
                />
              </Grid>
              
              {messageForm.scheduled && (
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Send At"
                    value={messageForm.sendAt}
                    onChange={(date) => setMessageForm(prev => ({ ...prev, sendAt: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSendMessage}>
              {messageForm.scheduled ? 'Schedule' : 'Send'} Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Campaign Dialog */}
        <Dialog open={campaignDialogOpen} onClose={() => setCampaignDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create SMS Campaign</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  fullWidth
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                  helperText="Use {{firstName}}, {{lastName}} for personalization"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={contacts}
                  getOptionLabel={(option) => option.displayName}
                  value={campaignForm.recipients}
                  onChange={(e, value) => setCampaignForm(prev => ({ ...prev, recipients: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Recipients" placeholder="Select contacts" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Type</InputLabel>
                  <Select
                    value={campaignForm.schedule.type}
                    onChange={(e) => setCampaignForm(prev => ({ 
                      ...prev, 
                      schedule: { ...prev.schedule, type: e.target.value }
                    }))}
                  >
                    <MenuItem value="immediate">Send Immediately</MenuItem>
                    <MenuItem value="scheduled">Schedule for Later</MenuItem>
                    <MenuItem value="drip">Drip Campaign</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create SMS Template</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="onboarding">Onboarding</MenuItem>
                    <MenuItem value="billing">Billing</MenuItem>
                    <MenuItem value="update">Update</MenuItem>
                    <MenuItem value="scheduling">Scheduling</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  fullWidth
                  value={templateForm.message}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                  helperText="Use {{variable}} for dynamic content"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateTemplate}>
              Create Template
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
    </LocalizationProvider>
  );
};

export default SMS;