// src/pages/ContactDetailPage.jsx - Complete Contact Detail & Management
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
  Snackbar, Grid, Avatar, Stack, Tooltip, Card, CardContent,
  CircularProgress, List, ListItem, ListItemText, ListItemIcon,
  Divider, Menu, MenuItem, Badge, FormControl, InputLabel, Select,
  Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  ArrowLeft, Edit, Save, X, Phone, Mail, MessageSquare, FileText,
  Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock,
  MoreVertical, Trash2, Plus, Eye, Download, Upload, Target, Award,
  Briefcase, MapPin, User, Building2, CreditCard, Send, Star,
  Activity, History, BarChart, ChevronDown, ExternalLink, Copy
} from 'lucide-react';
import { 
  collection, doc, getDoc, updateDoc, addDoc, query, where, 
  orderBy, onSnapshot, Timestamp, deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ViewCreditReportButton from '../components/credit/ViewCreditReportButton';
import openaiService from '../services/openAIService';

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State Management
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Dialog States
  const [noteDialog, setNoteDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [smsDialog, setSmsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  
  // Data States
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [communications, setCommunications] = useState([]);
  
  // Form States
  const [editedContact, setEditedContact] = useState({});
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [newEmail, setNewEmail] = useState({ subject: '', body: '' });
  const [newSms, setNewSms] = useState('');
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Menu
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch Contact Data
  useEffect(() => {
    if (!id) return;

    const fetchContact = async () => {
      try {
        const contactRef = doc(db, 'contacts', id);
        const contactSnap = await getDoc(contactRef);
        
        if (contactSnap.exists()) {
          const contactData = { id: contactSnap.id, ...contactSnap.data() };
          setContact(contactData);
          setEditedContact(contactData);
        } else {
          setSnackbar({ open: true, message: 'Contact not found', severity: 'error' });
          navigate('/contacts');
        }
      } catch (error) {
        console.error('Error fetching contact:', error);
        setSnackbar({ open: true, message: 'Error loading contact', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id, navigate]);

  // Fetch Related Data
  useEffect(() => {
    if (!id || !currentUser) return;

    // Notes listener
    const notesQuery = query(
      collection(db, 'notes'),
      where('contactId', '==', id),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Tasks listener
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('contactId', '==', id),
      where('userId', '==', currentUser.uid),
      orderBy('dueDate', 'asc')
    );
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Disputes listener
    const disputesQuery = query(
      collection(db, 'disputes'),
      where('contactId', '==', id),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubDisputes = onSnapshot(disputesQuery, (snapshot) => {
      setDisputes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Documents listener
    const docsQuery = query(
      collection(db, 'documents'),
      where('contactId', '==', id),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Activities listener
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('contactId', '==', id),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubNotes();
      unsubTasks();
      unsubDisputes();
      unsubDocs();
      unsubActivities();
    };
  }, [id, currentUser]);

  // Save Contact
  const handleSave = async () => {
    if (!editedContact.displayName?.trim()) {
      setSnackbar({ open: true, message: 'Name is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'contacts', id), {
        ...editedContact,
        updatedAt: Timestamp.now()
      });

      // Log activity
      await addDoc(collection(db, 'activities'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'contact_updated',
        description: 'Contact details updated',
        timestamp: Timestamp.now()
      });

      setContact(editedContact);
      setEditMode(false);
      setSnackbar({ open: true, message: 'Contact updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating contact:', error);
      setSnackbar({ open: true, message: 'Error updating contact', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // AI Categorization
  const handleAICategorize = async () => {
    setCategorizing(true);
    try {
      const result = await openaiService.categorizeContact(contact);
      
      await updateDoc(doc(db, 'contacts', id), {
        category: result.category || contact.category,
        heatScore: result.heatScore || contact.heatScore,
        urgency: result.urgency || contact.urgency,
        aiSuggestion: result.nextMove,
        lastAIAnalysis: Timestamp.now()
      });

      setSnackbar({ 
        open: true, 
        message: `AI Analysis: ${result.nextMove || 'Contact categorized'}`, 
        severity: 'success' 
      });
      
      // Refresh contact
      const contactSnap = await getDoc(doc(db, 'contacts', id));
      if (contactSnap.exists()) {
        const updated = { id: contactSnap.id, ...contactSnap.data() };
        setContact(updated);
        setEditedContact(updated);
      }
    } catch (error) {
      console.error('Error with AI categorization:', error);
      setSnackbar({ open: true, message: 'AI categorization failed', severity: 'warning' });
    } finally {
      setCategorizing(false);
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addDoc(collection(db, 'notes'), {
        contactId: id,
        userId: currentUser.uid,
        content: newNote,
        createdAt: Timestamp.now()
      });

      await addDoc(collection(db, 'activities'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'note_added',
        description: 'Added a note',
        timestamp: Timestamp.now()
      });

      setNewNote('');
      setNoteDialog(false);
      setSnackbar({ open: true, message: 'Note added', severity: 'success' });
    } catch (error) {
      console.error('Error adding note:', error);
      setSnackbar({ open: true, message: 'Error adding note', severity: 'error' });
    }
  };

  // Add Task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setSnackbar({ open: true, message: 'Task title required', severity: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        contactId: id,
        userId: currentUser.uid,
        title: newTask.title,
        dueDate: newTask.dueDate ? Timestamp.fromDate(new Date(newTask.dueDate)) : null,
        priority: newTask.priority,
        completed: false,
        createdAt: Timestamp.now()
      });

      await addDoc(collection(db, 'activities'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'task_created',
        description: `Task: ${newTask.title}`,
        timestamp: Timestamp.now()
      });

      setNewTask({ title: '', dueDate: '', priority: 'medium' });
      setTaskDialog(false);
      setSnackbar({ open: true, message: 'Task created', severity: 'success' });
    } catch (error) {
      console.error('Error adding task:', error);
      setSnackbar({ open: true, message: 'Error creating task', severity: 'error' });
    }
  };

  // Toggle Task
  const handleToggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !completed,
        completedAt: !completed ? Timestamp.now() : null
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete Contact
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'contacts', id));
      setSnackbar({ open: true, message: 'Contact deleted', severity: 'success' });
      navigate('/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      setSnackbar({ open: true, message: 'Error deleting contact', severity: 'error' });
    }
  };

  // Send Email
  const handleSendEmail = async () => {
    if (!newEmail.subject.trim() || !newEmail.body.trim()) {
      setSnackbar({ open: true, message: 'Subject and body required', severity: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'communications'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'email',
        subject: newEmail.subject,
        body: newEmail.body,
        to: contact.email,
        status: 'sent',
        sentAt: Timestamp.now()
      });

      await addDoc(collection(db, 'activities'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'email_sent',
        description: `Email: ${newEmail.subject}`,
        timestamp: Timestamp.now()
      });

      setNewEmail({ subject: '', body: '' });
      setEmailDialog(false);
      setSnackbar({ open: true, message: 'Email sent', severity: 'success' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSnackbar({ open: true, message: 'Error sending email', severity: 'error' });
    }
  };

  // Send SMS
  const handleSendSms = async () => {
    if (!newSms.trim()) {
      setSnackbar({ open: true, message: 'Message required', severity: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'communications'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'sms',
        message: newSms,
        to: contact.phone,
        status: 'sent',
        sentAt: Timestamp.now()
      });

      await addDoc(collection(db, 'activities'), {
        contactId: id,
        userId: currentUser.uid,
        type: 'sms_sent',
        description: `SMS sent`,
        timestamp: Timestamp.now()
      });

      setNewSms('');
      setSmsDialog(false);
      setSnackbar({ open: true, message: 'SMS sent', severity: 'success' });
    } catch (error) {
      console.error('Error sending SMS:', error);
      setSnackbar({ open: true, message: 'Error sending SMS', severity: 'error' });
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return formatDate(timestamp);
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      lead: 'info',
      client: 'success',
      vendor: 'warning',
      affiliate: 'secondary',
      employee: 'primary',
      'professional service provider': 'error'
    };
    return colors[category?.toLowerCase()] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success'
    };
    return colors[priority?.toLowerCase()] || 'default';
  };

  // Get heat score color
  const getHeatScoreColor = (score) => {
    if (score >= 8) return 'error';
    if (score >= 5) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box p={3}>
        <Alert severity="error">Contact not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/contacts')}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {editMode ? 'Edit Contact' : 'Contact Details'}
        </Typography>
        
        {!editMode && (
          <>
            <Button
              variant="outlined"
              startIcon={categorizing ? <CircularProgress size={16} /> : <Target />}
              onClick={handleAICategorize}
              disabled={categorizing}
            >
              AI Analyze
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertical />
            </IconButton>
          </>
        )}
        
        {editMode && (
          <>
            <Button
              variant="outlined"
              startIcon={<X />}
              onClick={() => {
                setEditMode(false);
                setEditedContact(contact);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <Save />}
              onClick={handleSave}
              disabled={saving}
            >
              Save
            </Button>
          </>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setAnchorEl(null); setDeleteDialog(true); }}>
          <ListItemIcon><Trash2 size={18} /></ListItemIcon>
          <ListItemText>Delete Contact</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); navigate(`/contacts/${id}/duplicate`); }}>
          <ListItemIcon><Copy size={18} /></ListItemIcon>
          <ListItemText>Duplicate Contact</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); window.print(); }}>
          <ListItemIcon><Download size={18} /></ListItemIcon>
          <ListItemText>Export to PDF</ListItemText>
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {/* Left Column - Contact Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mb: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {contact.displayName?.[0]?.toUpperCase() || '?'}
              </Avatar>
              
              {editMode ? (
                <TextField
                  fullWidth
                  value={editedContact.displayName || ''}
                  onChange={(e) => setEditedContact({ ...editedContact, displayName: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h5" align="center" gutterBottom>
                  {contact.displayName}
                </Typography>
              )}
              
              {editMode ? (
                <FormControl fullWidth size="small">
                  <Select
                    value={editedContact.category || 'lead'}
                    onChange={(e) => setEditedContact({ ...editedContact, category: e.target.value })}
                  >
                    <MenuItem value="lead">Lead</MenuItem>
                    <MenuItem value="client">Client</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                    <MenuItem value="affiliate">Affiliate</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="professional service provider">Professional Service Provider</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip 
                  label={contact.category || 'Lead'} 
                  color={getCategoryColor(contact.category)}
                  size="small"
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Contact Information */}
            <Stack spacing={2}>
              {editMode ? (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editedContact.email || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                    size="small"
                    InputProps={{
                      startAdornment: <Mail size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editedContact.phone || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                    size="small"
                    InputProps={{
                      startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Company"
                    value={editedContact.company || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                    size="small"
                    InputProps={{
                      startAdornment: <Building2 size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={editedContact.address || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, address: e.target.value })}
                    size="small"
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <MapPin size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                </>
              ) : (
                <>
                  {contact.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={18} />
                      <Typography variant="body2">{contact.email}</Typography>
                    </Box>
                  )}
                  {contact.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={18} />
                      <Typography variant="body2">{contact.phone}</Typography>
                    </Box>
                  )}
                  {contact.company && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Building2 size={18} />
                      <Typography variant="body2">{contact.company}</Typography>
                    </Box>
                  )}
                  {contact.address && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <MapPin size={18} />
                      <Typography variant="body2">{contact.address}</Typography>
                    </Box>
                  )}
                </>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Quick Actions */}
            {!editMode && (
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Mail />}
                  onClick={() => setEmailDialog(true)}
                  disabled={!contact.email}
                >
                  Send Email
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MessageSquare />}
                  onClick={() => setSmsDialog(true)}
                  disabled={!contact.phone}
                >
                  Send SMS
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Phone />}
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                  disabled={!contact.phone}
                >
                  Call
                </Button>
              </Stack>
            )}
          </Paper>

          {/* View Credit Report Button */}
              {contact?.idiqEnrollment?.membershipNumber && (
                <Box sx={{ mt: 2 }}>
                  <ViewCreditReportButton
                    contactId={contact.id}
                    contactEmail={contact.email}
                    membershipNumber={contact.idiqEnrollment.membershipNumber}
                    variant="contained"
                    size="medium"
                    fullWidth
                  />
                </Box>
              )}

          {/* Stats Card */}
          {!editMode && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Heat Score</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={contact.heatScore || 5} 
                      color={getHeatScoreColor(contact.heatScore)}
                      size="small"
                    />
                    <Typography variant="caption">/10</Typography>
                  </Box>
                </Box>
                
                {contact.urgency && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Urgency</Typography>
                    <Chip 
                      label={contact.urgency} 
                      color={contact.urgency === 'High' ? 'error' : contact.urgency === 'Medium' ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                )}
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Disputes</Typography>
                  <Typography variant="h6">{disputes.length}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Documents</Typography>
                  <Typography variant="h6">{documents.length}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Open Tasks</Typography>
                  <Typography variant="h6">{tasks.filter(t => !t.completed).length}</Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab icon={<Activity size={18} />} label="Activity" iconPosition="start" />
              <Tab icon={<FileText size={18} />} label={`Notes (${notes.length})`} iconPosition="start" />
              <Tab icon={<CheckCircle size={18} />} label={`Tasks (${tasks.length})`} iconPosition="start" />
              <Tab icon={<CreditCard size={18} />} label={`Disputes (${disputes.length})`} iconPosition="start" />
              <Tab icon={<Upload size={18} />} label={`Documents (${documents.length})`} iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Activity Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Activity Timeline</Typography>
                  {contact.aiSuggestion && (
                    <Alert severity="info" sx={{ mb: 2 }} icon={<Target />}>
                      <strong>AI Suggestion:</strong> {contact.aiSuggestion}
                    </Alert>
                  )}
                  
                  <List>
                    {activities.length === 0 ? (
                      <ListItem>
                        <ListItemText secondary="No activity yet" />
                      </ListItem>
                    ) : (
                      activities.map((activity) => (
                        <ListItem key={activity.id} divider>
                          <ListItemIcon>
                            {activity.type === 'note_added' && <FileText size={18} />}
                            {activity.type === 'task_created' && <CheckCircle size={18} />}
                            {activity.type === 'email_sent' && <Mail size={18} />}
                            {activity.type === 'sms_sent' && <MessageSquare size={18} />}
                            {activity.type === 'contact_updated' && <Edit size={18} />}
                            {!['note_added', 'task_created', 'email_sent', 'sms_sent', 'contact_updated'].includes(activity.type) && <Activity size={18} />}
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.description}
                            secondary={formatRelativeTime(activity.timestamp)}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Box>
              )}

              {/* Notes Tab */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Notes</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus />}
                      onClick={() => setNoteDialog(true)}
                    >
                      Add Note
                    </Button>
                  </Box>

                  <List>
                    {notes.length === 0 ? (
                      <ListItem>
                        <ListItemText secondary="No notes yet" />
                      </ListItem>
                    ) : (
                      notes.map((note) => (
                        <Card key={note.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="body2" gutterBottom>
                              {note.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(note.createdAt)}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </List>
                </Box>
              )}

              {/* Tasks Tab */}
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Tasks</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus />}
                      onClick={() => setTaskDialog(true)}
                    >
                      Add Task
                    </Button>
                  </Box>

                  <List>
                    {tasks.length === 0 ? (
                      <ListItem>
                        <ListItemText secondary="No tasks yet" />
                      </ListItem>
                    ) : (
                      tasks.map((task) => (
                        <ListItem key={task.id} divider>
                          <ListItemIcon>
                            <Switch
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id, task.completed)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <Box>
                                {task.dueDate && (
                                  <Chip 
                                    label={`Due: ${formatDate(task.dueDate)}`}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                )}
                                <Chip 
                                  label={task.priority || 'Medium'}
                                  color={getPriorityColor(task.priority)}
                                  size="small"
                                />
                              </Box>
                            }
                            sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Box>
              )}

              {/* Disputes Tab */}
              {activeTab === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Credit Disputes</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Plus />}
                      onClick={() => navigate('/dispute-creation', { state: { contactId: id } })}
                    >
                      New Dispute
                    </Button>
                  </Box>

                  <List>
                    {disputes.length === 0 ? (
                      <ListItem>
                        <ListItemText secondary="No disputes yet" />
                      </ListItem>
                    ) : (
                      disputes.map((dispute) => (
                        <Card key={dispute.id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2">
                                {dispute.disputeItems?.[0]?.accountName || 'Dispute'}
                              </Typography>
                              <Chip 
                                label={dispute.status || 'pending'}
                                size="small"
                                color={
                                  dispute.status === 'sent' ? 'success' : 
                                  dispute.status === 'failed' ? 'error' : 'default'
                                }
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Bureaus: {dispute.selectedBureaus?.join(', ') || 'N/A'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(dispute.createdAt)}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                startIcon={<Eye />}
                                onClick={() => navigate('/dispute-status')}
                              >
                                View Details
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </List>
                </Box>
              )}

              {/* Documents Tab */}
              {activeTab === 4 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Documents</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Upload />}
                      onClick={() => navigate('/document-center')}
                    >
                      Upload
                    </Button>
                  </Box>

                  <List>
                    {documents.length === 0 ? (
                      <ListItem>
                        <ListItemText secondary="No documents yet" />
                      </ListItem>
                    ) : (
                      documents.map((doc) => (
                        <ListItem key={doc.id} divider>
                          <ListItemIcon>
                            <FileText size={18} />
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.fileName || doc.name}
                            secondary={formatDate(doc.createdAt)}
                          />
                          <IconButton
                            size="small"
                            onClick={() => window.open(doc.fileUrl || doc.url, '_blank')}
                          >
                            <Download size={18} />
                          </IconButton>
                        </ListItem>
                      ))
                    )}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Note Dialog */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNote}>Add Note</Button>
        </DialogActions>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={taskDialog} onClose={() => setTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
        </DialogActions>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Email to {contact.displayName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="To"
              value={contact.email}
              disabled
            />
            <TextField
              fullWidth
              label="Subject"
              value={newEmail.subject}
              onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Message"
              value={newEmail.body}
              onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />} onClick={handleSendEmail}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send SMS Dialog */}
      <Dialog open={smsDialog} onClose={() => setSmsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send SMS to {contact.displayName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="To"
              value={contact.phone}
              disabled
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={newSms}
              onChange={(e) => setNewSms(e.target.value)}
              helperText={`${newSms.length}/160 characters`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />} onClick={handleSendSms}>
            Send SMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Contact?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {contact.displayName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactDetailPage;