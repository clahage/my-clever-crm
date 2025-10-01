// Forms.jsx - Production-Ready Form Builder and Management
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  ListItemButton,
  Checkbox,
  Radio,
  RadioGroup,
  Rating,
  Slider,
  Autocomplete,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  AvatarGroup,
  Drawer,
  FormGroup,
  FormLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Send,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  Code,
  Image,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Hash,
  Type,
  ToggleLeft,
  CheckSquare,
  Circle,
  Square,
  List as ListIcon,
  Star,
  Upload as UploadIcon,
  MapPin,
  CreditCard,
  Link,
  FileSignature,
  BarChart3,
  Users,
  Share2,
  Lock,
  Unlock,
  Zap,
  Database,
  Globe,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Move,
  MoreVertical,
  Save,
  Play,
  Pause,
  Archive,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

// Form field types
const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: <Type size={20} />, category: 'Basic' },
  { type: 'email', label: 'Email', icon: <Mail size={20} />, category: 'Basic' },
  { type: 'number', label: 'Number', icon: <Hash size={20} />, category: 'Basic' },
  { type: 'phone', label: 'Phone', icon: <Phone size={20} />, category: 'Basic' },
  { type: 'textarea', label: 'Text Area', icon: <FileText size={20} />, category: 'Basic' },
  { type: 'select', label: 'Dropdown', icon: <ChevronDown size={20} />, category: 'Selection' },
  { type: 'radio', label: 'Radio Buttons', icon: <Circle size={20} />, category: 'Selection' },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare size={20} />, category: 'Selection' },
  { type: 'toggle', label: 'Toggle Switch', icon: <ToggleLeft size={20} />, category: 'Selection' },
  { type: 'date', label: 'Date Picker', icon: <Calendar size={20} />, category: 'DateTime' },
  { type: 'time', label: 'Time Picker', icon: <Clock size={20} />, category: 'DateTime' },
  { type: 'file', label: 'File Upload', icon: <UploadIcon size={20} />, category: 'Advanced' },
  { type: 'signature', label: 'Signature', icon: <FileSignature size={20} />, category: 'Advanced' },
  { type: 'rating', label: 'Rating', icon: <Star size={20} />, category: 'Advanced' },
  { type: 'slider', label: 'Slider', icon: <Move size={20} />, category: 'Advanced' },
  { type: 'location', label: 'Location', icon: <MapPin size={20} />, category: 'Advanced' },
  { type: 'payment', label: 'Payment', icon: <CreditCard size={20} />, category: 'Advanced' },
  { type: 'heading', label: 'Heading', icon: <Type size={20} />, category: 'Layout' },
  { type: 'divider', label: 'Divider', icon: <Divider size={20} />, category: 'Layout' },
  { type: 'section', label: 'Section', icon: <Square size={20} />, category: 'Layout' }
];

// Form templates
const formTemplates = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    icon: <Mail size={24} />,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'phone', label: 'Phone Number', required: false },
      { type: 'textarea', label: 'Message', required: true }
    ]
  },
  {
    id: 'survey',
    name: 'Customer Survey',
    description: 'Feedback survey with ratings and comments',
    icon: <BarChart3 size={24} />,
    fields: [
      { type: 'rating', label: 'Overall Satisfaction', required: true },
      { type: 'radio', label: 'Would you recommend us?', options: ['Yes', 'No', 'Maybe'], required: true },
      { type: 'textarea', label: 'Additional Comments', required: false }
    ]
  },
  {
    id: 'registration',
    name: 'Event Registration',
    description: 'Event signup with attendee information',
    icon: <Users size={24} />,
    fields: [
      { type: 'text', label: 'Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'select', label: 'Ticket Type', options: ['Standard', 'VIP', 'Premium'], required: true },
      { type: 'number', label: 'Number of Attendees', required: true }
    ]
  },
  {
    id: 'application',
    name: 'Job Application',
    description: 'Employment application with resume upload',
    icon: <Briefcase size={24} />,
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email', required: true },
      { type: 'phone', label: 'Phone', required: true },
      { type: 'file', label: 'Resume', required: true },
      { type: 'textarea', label: 'Cover Letter', required: false }
    ]
  }
];

const Forms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedForm, setSelectedForm] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form builder state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    fields: [],
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      redirectUrl: '',
      requireLogin: false,
      captcha: false,
      emailNotifications: true,
      notificationEmail: '',
      autoResponse: false,
      responseEmail: '',
      limitSubmissions: false,
      maxSubmissions: 0,
      closeDate: null,
      customCSS: '',
      customJS: ''
    },
    theme: {
      primaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Roboto',
      borderRadius: 8,
      fieldSpacing: 16
    },
    integrations: [],
    analytics: {
      views: 0,
      submissions: 0,
      completionRate: 0,
      avgCompletionTime: 0
    }
  });

  // Field configuration state
  const [fieldConfig, setFieldConfig] = useState({
    label: '',
    type: 'text',
    placeholder: '',
    helperText: '',
    required: false,
    validation: '',
    options: [],
    defaultValue: '',
    width: 'full',
    conditional: {
      enabled: false,
      field: '',
      operator: 'equals',
      value: ''
    }
  });

  // Fetch forms and submissions
  useEffect(() => {
    if (!user) return;

    const formsQuery = query(
      collection(db, 'forms'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeForms = onSnapshot(formsQuery, (snapshot) => {
      const formsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setForms(formsData);
    });

    const submissionsQuery = query(
      collection(db, 'formSubmissions'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const submissionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(submissionsData);
      setLoading(false);
    });

    return () => {
      unsubscribeForms();
      unsubscribeSubmissions();
    };
  }, [user]);

// Statistics calculation - FIXED VERSION
  const statistics = useMemo(() => {
    const activeF = forms.filter(f => f.status === 'active').length;
    const totalSubmissions = submissions.length;
    const todaySubmissions = submissions.filter(s => {
      const submitted = new Date(s.submittedAt?.seconds * 1000 || s.submittedAt);
      const today = new Date();
      return submitted.toDateString() === today.toDateString();
    }).length;

    const avgCompletionRate = forms.reduce((sum, f) => {
      return sum + (f.analytics?.completionRate || 0);
    }, 0) / (forms.length || 1);

    return {
      total: forms.length,
      active: activeF,  // ✅ FIXED: Changed from 'activeForms' to 'activeF'
      draft: forms.filter(f => f.status === 'draft').length,
      archived: forms.filter(f => f.status === 'archived').length,
      totalSubmissions,
      todaySubmissions,
      avgCompletionRate: avgCompletionRate.toFixed(1),
      totalViews: forms.reduce((sum, f) => sum + (f.analytics?.views || 0), 0)
    };
  }, [forms, submissions]);

  // Performance data for charts
  const performanceData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        submissions: Math.floor(Math.random() * 50 + 10),
        views: Math.floor(Math.random() * 200 + 50)
      };
    });
    return last7Days;
  }, []);

  // Handle field drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({ ...formData, fields: items });
  };

  // Add field to form
  const handleAddField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType.type,
      label: fieldType.label,
      required: false,
      placeholder: '',
      options: fieldType.type === 'select' || fieldType.type === 'radio' || fieldType.type === 'checkbox' ? ['Option 1', 'Option 2'] : [],
      validation: '',
      width: 'full'
    };

    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });

    setSnackbar({ open: true, message: 'Field added to form', severity: 'success' });
  };

  // Remove field from form
  const handleRemoveField = (fieldId) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(f => f.id !== fieldId)
    });
  };

  // Update field configuration
  const handleUpdateField = (fieldId, updates) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      )
    });
  };

  // Handle form creation
  const handleCreateForm = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: 'Form name is required', severity: 'error' });
      return;
    }

    if (formData.fields.length === 0) {
      setSnackbar({ open: true, message: 'Add at least one field to the form', severity: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'forms'), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        shareUrl: `https://forms.speedycrm.com/${Date.now()}`
      });

      setSnackbar({ open: true, message: 'Form created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating form', severity: 'error' });
    }
  };

  // Handle form duplication
  const handleDuplicateForm = async (form) => {
    try {
      const duplicatedForm = {
        ...form,
        name: `${form.name} (Copy)`,
        status: 'draft',
        analytics: {
          views: 0,
          submissions: 0,
          completionRate: 0,
          avgCompletionTime: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      delete duplicatedForm.id;
      
      await addDoc(collection(db, 'forms'), duplicatedForm);
      setSnackbar({ open: true, message: 'Form duplicated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error duplicating form', severity: 'error' });
    }
  };

  // Handle form deletion
  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form? All submissions will also be deleted.')) return;

    try {
      await deleteDoc(doc(db, 'forms', formId));
      setSnackbar({ open: true, message: 'Form deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting form', severity: 'error' });
    }
  };

  // Toggle form status
  const handleToggleFormStatus = async (formId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const formRef = doc(db, 'forms', formId);
      await updateDoc(formRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setSnackbar({ 
        open: true, 
        message: `Form ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating form status', severity: 'error' });
    }
  };

  // Use form template
  const handleUseTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      fields: template.fields.map((field, index) => ({
        ...field,
        id: Date.now().toString() + index
      }))
    });
    setDialogOpen(true);
    setDialogType('create');
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedForm(null);
    setPreviewMode(false);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      fields: [],
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        redirectUrl: '',
        requireLogin: false,
        captcha: false,
        emailNotifications: true,
        notificationEmail: '',
        autoResponse: false,
        responseEmail: '',
        limitSubmissions: false,
        maxSubmissions: 0,
        closeDate: null,
        customCSS: '',
        customJS: ''
      },
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Roboto',
        borderRadius: 8,
        fieldSpacing: 16
      },
      integrations: [],
      analytics: {
        views: 0,
        submissions: 0,
        completionRate: 0,
        avgCompletionTime: 0
      }
    });
  };

  // Filtered forms
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchesSearch = form.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [forms, searchTerm, filterStatus]);

  // DataGrid columns
  const columns = [
    {
      field: 'name',
      headerName: 'Form Name',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileText size={16} />
          <Box>
            <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'active' ? 'success' :
            params.value === 'paused' ? 'warning' :
            params.value === 'archived' ? 'default' :
            'primary'
          }
          icon={
            params.value === 'active' ? <CheckCircle size={14} /> :
            params.value === 'paused' ? <Pause size={14} /> :
            params.value === 'archived' ? <Archive size={14} /> :
            <Edit2 size={14} />
          }
        />
      )
    },
    {
      field: 'fields',
      headerName: 'Fields',
      width: 100,
      renderCell: (params) => (
        <Badge badgeContent={params.value?.length || 0} color="primary">
          <ListIcon size={16} />
        </Badge>
      )
    },
    {
      field: 'submissions',
      headerName: 'Submissions',
      width: 120,
      renderCell: (params) => {
        const count = submissions.filter(s => s.formId === params.row.id).length;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Users size={14} />
            <Typography variant="body2">{count}</Typography>
          </Box>
        );
      }
    },
    {
      field: 'views',
      headerName: 'Views',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Eye size={14} />
          <Typography variant="body2">{params.row.analytics?.views || 0}</Typography>
        </Box>
      )
    },
    {
      field: 'completionRate',
      headerName: 'Completion',
      width: 120,
      renderCell: (params) => {
        const rate = params.row.analytics?.completionRate || 0;
        const color = rate > 70 ? 'success' : rate > 40 ? 'warning' : 'error';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={rate}
              color={color}
              sx={{ width: 50, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption">{rate}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value.seconds * 1000).toLocaleDateString() : '-'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleToggleFormStatus(params.row.id, params.row.status)}
          >
            {params.row.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedForm(params.row);
              setFormData(params.row);
              setDialogOpen(true);
              setDialogType('edit');
            }}
          >
            <Edit2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setAnchorEl(event.currentTarget);
              setSelectedForm(params.row);
            }}
          >
            <MoreVertical size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  // Render field preview
  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
        return (
          <TextField
            fullWidth={field.width === 'full'}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            helperText={field.helperText}
            size="small"
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth={field.width === 'full'}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            helperText={field.helperText}
            multiline
            rows={4}
            size="small"
          />
        );
      case 'select':
        return (
          <FormControl fullWidth={field.width === 'full'} size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select label={field.label}>
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'radio':
        return (
          <FormControl>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup>
              {field.options?.map(option => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormGroup>
            <FormLabel>{field.label}</FormLabel>
            {field.options?.map(option => (
              <FormControlLabel key={option} control={<Checkbox />} label={option} />
            ))}
          </FormGroup>
        );
      case 'toggle':
        return (
          <FormControlLabel
            control={<Switch />}
            label={field.label}
          />
        );
      case 'rating':
        return (
          <Box>
            <Typography>{field.label}</Typography>
            <Rating />
          </Box>
        );
      case 'slider':
        return (
          <Box>
            <Typography>{field.label}</Typography>
            <Slider defaultValue={50} />
          </Box>
        );
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={field.label}
              renderInput={(params) => <TextField {...params} size="small" fullWidth={field.width === 'full'} />}
            />
          </LocalizationProvider>
        );
      case 'time':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label={field.label}
              renderInput={(params) => <TextField {...params} size="small" fullWidth={field.width === 'full'} />}
            />
          </LocalizationProvider>
        );
      case 'file':
        return (
          <Button variant="outlined" component="label" startIcon={<UploadIcon size={16} />}>
            {field.label}
            <input type="file" hidden />
          </Button>
        );
      case 'heading':
        return <Typography variant="h6">{field.label}</Typography>;
      case 'divider':
        return <Divider />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Forms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage dynamic forms with drag-and-drop builder
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Code size={20} />}
          >
            Embed Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
          >
            Export Data
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => {
              setDialogOpen(true);
              setDialogType('create');
            }}
          >
            Create Form
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Forms</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.active} active
                  </Typography>
                </Box>
                <FileText size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Submissions</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalSubmissions}</Typography>
                  <Typography variant="caption" color="success.main">
                    {statistics.todaySubmissions} today
                  </Typography>
                </Box>
                <Users size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Views</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.totalViews}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    All time
                  </Typography>
                </Box>
                <Eye size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Completion</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.avgCompletionRate}%</Typography>
                  <Typography variant="caption" color={Number(statistics.avgCompletionRate) > 70 ? 'success.main' : 'warning.main'}>
                    {Number(statistics.avgCompletionRate) > 70 ? 'Good' : 'Needs improvement'}
                  </Typography>
                </Box>
                <CheckCircle size={24} color="#8B5CF6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="My Forms" />
          <Tab label="Templates" />
          <Tab label="Submissions" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search forms..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8 }} />
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Forms DataGrid */}
          <DataGrid
            rows={filteredForms}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Form Templates</Typography>
          <Grid container spacing={3}>
            {formTemplates.map(template => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                        {template.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{template.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip label={`${template.fields.length} fields`} size="small" sx={{ mr: 1 }} />
                      <Chip label="Ready to use" size="small" color="success" />
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleUseTemplate(template)}
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

      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Submissions</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Form</TableCell>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.slice(0, 10).map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.formName}</TableCell>
                    <TableCell>{submission.email || 'Anonymous'}</TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt?.seconds * 1000 || submission.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip label="Complete" size="small" color="success" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Eye size={16} />
                      </IconButton>
                      <IconButton size="small">
                        <Download size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Submission Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="submissions" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="views" stroke="#10B981" fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Top Forms</Typography>
              <List>
                {forms.slice(0, 5).map(form => (
                  <ListItem key={form.id}>
                    <ListItemIcon>
                      <FileText size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={form.name}
                      secondary={`${submissions.filter(s => s.formId === form.id).length} submissions`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Form Builder Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {dialogType === 'create' ? 'Create New Form' : 'Edit Form'}
            <ToggleButtonGroup
              value={previewMode ? 'preview' : 'build'}
              exclusive
              onChange={(e, v) => setPreviewMode(v === 'preview')}
              size="small"
            >
              <ToggleButton value="build">Build</ToggleButton>
              <ToggleButton value="preview">Preview</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!previewMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>Form Fields</Typography>
                  {Object.entries(
                    fieldTypes.reduce((acc, field) => {
                      if (!acc[field.category]) acc[field.category] = [];
                      acc[field.category].push(field);
                      return acc;
                    }, {})
                  ).map(([category, fields]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                        {category}
                      </Typography>
                      <Stack spacing={1}>
                        {fields.map(field => (
                          <Button
                            key={field.type}
                            variant="outlined"
                            size="small"
                            fullWidth
                            startIcon={field.icon}
                            onClick={() => handleAddField(field)}
                            sx={{ justifyContent: 'flex-start' }}
                          >
                            {field.label}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12} md={9}>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Form Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {formData.fields.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <ListIcon size={48} color="#9CA3AF" />
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        No fields added yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drag and drop fields from the left panel to get started
                      </Typography>
                    </Box>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="fields">
                        {(provided) => (
                          <Box {...provided.droppableProps} ref={provided.innerRef}>
                            {formData.fields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided, snapshot) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                      border: 1,
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                      <Box {...provided.dragHandleProps} sx={{ cursor: 'move' }}>
                                        <Move size={20} />
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        {renderFieldPreview(field)}
                                      </Box>
                                      <Box>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setSelectedField(field);
                                            setDrawerOpen(true);
                                          }}
                                        >
                                          <Settings size={16} />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveField(field.id)}
                                        >
                                          <Trash2 size={16} />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 4, minHeight: 400 }}>
              <Typography variant="h5" gutterBottom>{formData.name || 'Untitled Form'}</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {formData.description}
              </Typography>
              <Stack spacing={2}>
                {formData.fields.map(field => (
                  <Box key={field.id}>
                    {renderFieldPreview(field)}
                  </Box>
                ))}
              </Stack>
              <Button variant="contained" sx={{ mt: 3 }}>
                {formData.settings.submitButtonText}
              </Button>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateForm}>
            {dialogType === 'create' ? 'Create Form' : 'Update Form'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field Settings Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 350 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Field Settings</Typography>
          {selectedField && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Label"
                value={selectedField.label}
                onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
              />
              <TextField
                fullWidth
                label="Placeholder"
                value={selectedField.placeholder}
                onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
              />
              <TextField
                fullWidth
                label="Helper Text"
                value={selectedField.helperText}
                onChange={(e) => handleUpdateField(selectedField.id, { helperText: e.target.value })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedField.required}
                    onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                  />
                }
                label="Required"
              />
              {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Options</Typography>
                  {selectedField.options?.map((option, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      size="small"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...selectedField.options];
                        newOptions[index] = e.target.value;
                        handleUpdateField(selectedField.id, { options: newOptions });
                      }}
                      sx={{ mb: 1 }}
                    />
                  ))}
                  <Button
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={() => {
                      handleUpdateField(selectedField.id, {
                        options: [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`]
                      });
                    }}
                  >
                    Add Option
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Drawer>

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

export default Forms;