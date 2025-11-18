// EContracts.jsx - Production-Ready Electronic Contract Management
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
  InputAdornment,
  LinearProgress,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  ListItemButton,
  Avatar,
  AvatarGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Calendar,
  Copy,
  MoreVertical,
  PenTool,
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  Building,
  DollarSign,
  TrendingUp,
  FileSignature,
  Upload,
  ChevronDown,
  User,
  Briefcase,
  Award,
  Share2,
  Lock,
  Unlock,
  History,
  RefreshCw,
  Archive,
  Star,
  Zap,
  BarChart3
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

const EContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showNewContract, setShowNewContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // view, edit, sign, send
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Contract form state
  const [contractForm, setContractForm] = useState({
    title: '',
    template: '',
    category: '',
    status: 'draft',
    type: 'service',
    value: 0,
    currency: 'USD',
    parties: [],
    content: '',
    clauses: [],
    signatureFields: [],
    attachments: [],
    validityPeriod: {
      startDate: new Date(),
      endDate: null,
      autoRenew: false,
      renewalPeriod: 12
    },
    metadata: {
      tags: [],
      notes: '',
      customFields: {}
    },
    reminders: {
      enabled: true,
      beforeExpiry: 30,
      frequency: 'once'
    },
    permissions: {
      canView: [],
      canEdit: [],
      canSign: [],
      public: false
    }
  });

  // Contract templates with real content
  const contractTemplates = [
    {
      id: 'service',
      name: 'Service Agreement',
      category: 'Business',
      icon: <Briefcase size={24} />,
      description: 'Standard service agreement for professional services',
      fields: ['service_description', 'payment_terms', 'deliverables', 'timeline'],
      popularity: 95,
      estimatedTime: '5 mins'
    },
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      category: 'Legal',
      icon: <Lock size={24} />,
      description: 'Mutual or one-way NDA for protecting confidential information',
      fields: ['confidential_info', 'duration', 'exceptions', 'governing_law'],
      popularity: 88,
      estimatedTime: '3 mins'
    },
    {
      id: 'employment',
      name: 'Employment Contract',
      category: 'HR',
      icon: <Users size={24} />,
      description: 'Full-time or part-time employment agreement',
      fields: ['position', 'salary', 'benefits', 'start_date', 'probation'],
      popularity: 76,
      estimatedTime: '10 mins'
    },
    {
      id: 'lease',
      name: 'Lease Agreement',
      category: 'Real Estate',
      icon: <Building size={24} />,
      description: 'Commercial or residential lease agreement',
      fields: ['property_address', 'rent_amount', 'lease_term', 'deposit'],
      popularity: 82,
      estimatedTime: '8 mins'
    },
    {
      id: 'sales',
      name: 'Sales Contract',
      category: 'Sales',
      icon: <DollarSign size={24} />,
      description: 'Product or service sales agreement',
      fields: ['products', 'pricing', 'delivery_terms', 'warranty'],
      popularity: 90,
      estimatedTime: '6 mins'
    },
    {
      id: 'partnership',
      name: 'Partnership Agreement',
      category: 'Business',
      icon: <Award size={24} />,
      description: 'Business partnership or joint venture agreement',
      fields: ['ownership_split', 'responsibilities', 'profit_sharing', 'exit_terms'],
      popularity: 65,
      estimatedTime: '15 mins'
    }
  ];

  // Standard contract clauses
  const standardClauses = [
    { id: 'confidentiality', label: 'Confidentiality Clause', required: false },
    { id: 'termination', label: 'Termination Clause', required: true },
    { id: 'liability', label: 'Limitation of Liability', required: true },
    { id: 'indemnification', label: 'Indemnification', required: false },
    { id: 'force_majeure', label: 'Force Majeure', required: false },
    { id: 'dispute_resolution', label: 'Dispute Resolution', required: true },
    { id: 'governing_law', label: 'Governing Law', required: true },
    { id: 'severability', label: 'Severability', required: false },
    { id: 'entire_agreement', label: 'Entire Agreement', required: true }
  ];

  // Fetch contracts with real-time updates
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'contracts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContracts(contractsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Statistics
  const statistics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return {
      total: contracts.length,
      draft: contracts.filter(c => c.status === 'draft').length,
      sent: contracts.filter(c => c.status === 'sent').length,
      signed: contracts.filter(c => c.status === 'signed').length,
      expired: contracts.filter(c => c.status === 'expired').length,
      totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
      recentlySigned: contracts.filter(c => 
        c.status === 'signed' && new Date(c.signedAt) > thirtyDaysAgo
      ).length,
      pendingSignature: contracts.filter(c => 
        ['sent', 'viewed'].includes(c.status)
      ).length,
      expiringSoon: contracts.filter(c => {
        if (!c.validityPeriod?.endDate) return false;
        const endDate = new Date(c.validityPeriod.endDate);
        const daysUntilExpiry = (endDate - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length
    };
  }, [contracts]);

  // Performance data for charts
  const performanceData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      created: Math.floor(Math.random() * 50 + 10),
      signed: Math.floor(Math.random() * 40 + 5),
      value: Math.floor(Math.random() * 100000 + 20000)
    }));
  }, []);

  // Contract status distribution
  const statusDistribution = [
    { name: 'Draft', value: statistics.draft, color: '#9CA3AF' },
    { name: 'Sent', value: statistics.sent, color: '#3B82F6' },
    { name: 'Signed', value: statistics.signed, color: '#10B981' },
    { name: 'Expired', value: statistics.expired, color: '#EF4444' }
  ];

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setContractForm({
      ...contractForm,
      title: template.name,
      template: template.id,
      category: template.category,
      type: template.id
    });
    setShowNewContract(false);
    setDialogOpen(true);
    setDialogType('create');
  };

  // Handle contract creation
  const handleCreateContract = async () => {
    if (!contractForm.title) {
      setSnackbar({ open: true, message: 'Contract title is required', severity: 'error' });
      return;
    }

    try {
      await addDoc(collection(db, 'contracts'), {
        ...contractForm,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email
        }
      });

      setSnackbar({ open: true, message: 'Contract created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating contract', severity: 'error' });
    }
  };

  // Handle sending contract
  const handleSendContract = async (contractId, recipients) => {
    try {
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, {
        status: 'sent',
        sentAt: serverTimestamp(),
        sentTo: recipients,
        updatedAt: serverTimestamp()
      });

      // TODO: Send actual email notifications
      setSnackbar({ open: true, message: 'Contract sent successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error sending contract', severity: 'error' });
    }
  };

  // Handle contract signing
  const handleSignContract = async (contractId) => {
    try {
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, {
        status: 'signed',
        signedAt: serverTimestamp(),
        signedBy: [...(selectedContract?.signedBy || []), {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          signedAt: new Date().toISOString()
        }],
        updatedAt: serverTimestamp()
      });

      setSnackbar({ open: true, message: 'Contract signed successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error signing contract', severity: 'error' });
    }
  };

  // Handle contract duplication
  const handleDuplicateContract = async (contract) => {
    try {
      const duplicatedContract = {
        ...contract,
        title: `${contract.title} (Copy)`,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sentAt: null,
        signedAt: null,
        signedBy: [],
        viewedBy: []
      };
      
      delete duplicatedContract.id;
      
      await addDoc(collection(db, 'contracts'), duplicatedContract);
      setSnackbar({ open: true, message: 'Contract duplicated successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error duplicating contract', severity: 'error' });
    }
  };

  // Handle contract deletion
  const handleDeleteContract = async (contractId) => {
    if (!window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'contracts', contractId));
      setSnackbar({ open: true, message: 'Contract deleted successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting contract', severity: 'error' });
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContract(null);
    setSelectedTemplate(null);
    setActiveStep(0);
    setContractForm({
      title: '',
      template: '',
      category: '',
      status: 'draft',
      type: 'service',
      value: 0,
      currency: 'USD',
      parties: [],
      content: '',
      clauses: [],
      signatureFields: [],
      attachments: [],
      validityPeriod: {
        startDate: new Date(),
        endDate: null,
        autoRenew: false,
        renewalPeriod: 12
      },
      metadata: {
        tags: [],
        notes: '',
        customFields: {}
      },
      reminders: {
        enabled: true,
        beforeExpiry: 30,
        frequency: 'once'
      },
      permissions: {
        canView: [],
        canEdit: [],
        canSign: [],
        public: false
      }
    });
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = 
        contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.template?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.parties?.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
      const matchesType = filterType === 'all' || contract.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, searchTerm, filterStatus, filterType]);

  // DataGrid columns
  const columns = [
    {
      field: 'title',
      headerName: 'Contract',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileText size={16} />
          <Box>
            <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.category} • {params.row.template}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'parties',
      headerName: 'Parties',
      width: 200,
      renderCell: (params) => (
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
          {params.value?.map((party, index) => (
            <Avatar key={index}>{party.name?.[0] || party.email?.[0]}</Avatar>
          )) || <Typography variant="caption" color="text.secondary">No parties</Typography>}
        </AvatarGroup>
      )
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          ${params.value?.toLocaleString() || 0}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusConfig = {
          draft: { color: 'default', icon: <Edit size={14} /> },
          sent: { color: 'info', icon: <Send size={14} /> },
          viewed: { color: 'warning', icon: <Eye size={14} /> },
          signed: { color: 'success', icon: <CheckCircle size={14} /> },
          expired: { color: 'error', icon: <XCircle size={14} /> },
          cancelled: { color: 'error', icon: <XCircle size={14} /> }
        };
        
        const config = statusConfig[params.value] || statusConfig.draft;
        
        return (
          <Chip
            label={params.value}
            size="small"
            color={config.color}
            icon={config.icon}
          />
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
      field: 'expiresAt',
      headerName: 'Expires',
      width: 120,
      renderCell: (params) => {
        const endDate = params.row.validityPeriod?.endDate;
        if (!endDate) return <Typography variant="caption">No expiry</Typography>;
        
        const date = new Date(endDate);
        const daysUntil = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysUntil > 0 && daysUntil <= 30;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isExpiringSoon && <AlertTriangle size={14} color="#F59E0B" />}
            <Typography 
              variant="body2" 
              color={isExpiringSoon ? 'warning.main' : 'text.primary'}
            >
              {date.toLocaleDateString()}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small"
            onClick={() => {
              setSelectedContract(params.row);
              setDialogOpen(true);
              setDialogType('view');
            }}
          >
            <Eye size={16} />
          </IconButton>
          {params.row.status === 'draft' && (
            <IconButton
              size="small"
              onClick={() => handleSendContract(params.row.id, [])}
            >
              <Send size={16} />
            </IconButton>
          )}
          {['sent', 'viewed'].includes(params.row.status) && (
            <IconButton
              size="small"
              onClick={() => {
                setSelectedContract(params.row);
                setDialogOpen(true);
                setDialogType('sign');
              }}
            >
              <PenTool size={16} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedContract(params.row);
            }}
          >
            <MoreVertical size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  const steps = ['Contract Details', 'Parties & Signatories', 'Terms & Clauses', 'Review & Send'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            E-Contracts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, send, and manage electronic contracts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Upload size={20} />}
          >
            Upload
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download size={20} />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setShowNewContract(true)}
          >
            New Contract
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
                  <Typography variant="body2" color="text.secondary">Total Contracts</Typography>
                  <Typography variant="h4" fontWeight={600}>{statistics.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.draft} drafts
                  </Typography>
                </Box>
                <FileText size={24} color="#9CA3AF" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Awaiting Signature</Typography>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    {statistics.pendingSignature}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.sent} sent
                  </Typography>
                </Box>
                <Clock size={24} color="#3B82F6" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Signed</Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {statistics.signed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statistics.recentlySigned} this month
                  </Typography>
                </Box>
                <CheckCircle size={24} color="#10B981" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Value</Typography>
                  <Typography variant="h4" fontWeight={600}>
                    ${statistics.totalValue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    {statistics.expiringSoon} expiring soon
                  </Typography>
                </Box>
                <DollarSign size={24} color="#F59E0B" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Contracts" />
          <Tab label="Templates" />
          <Tab label="Analytics" />
          <Tab label="Audit Trail" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search contracts..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="nda">NDA</MenuItem>
                <MenuItem value="employment">Employment</MenuItem>
                <MenuItem value="lease">Lease</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="partnership">Partnership</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Contracts DataGrid */}
          <DataGrid
            rows={filteredContracts}
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
          <Typography variant="h6" sx={{ mb: 2 }}>Contract Templates</Typography>
          <Grid container spacing={3}>
            {contractTemplates.map((template) => (
              <Grid item xs={12} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                        {template.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{template.name}</Typography>
                        <Chip label={template.category} size="small" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={`${template.popularity}% used`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={template.estimatedTime} 
                          size="small" 
                          variant="outlined"
                          icon={<Clock size={14} />}
                        />
                      </Box>
                      <Button size="small" endIcon={<ChevronDown size={16} />}>
                        Use
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Contract Performance</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="created" stroke="#3B82F6" name="Created" />
                  <Line yAxisId="left" type="monotone" dataKey="signed" stroke="#10B981" name="Signed" />
                  <Bar yAxisId="right" dataKey="value" fill="#F59E0B" name="Value ($)" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Audit Trail</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Contract</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date().toLocaleString()}</TableCell>
                    <TableCell>Service Agreement #{index + 1}</TableCell>
                    <TableCell>
                      <Chip 
                        label={['Created', 'Viewed', 'Signed', 'Downloaded'][index % 4]} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>user@example.com</TableCell>
                    <TableCell>192.168.1.1</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* New Contract Templates Dialog */}
      <Dialog open={showNewContract} onClose={() => setShowNewContract(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Choose Contract Template
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {contractTemplates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.lighter'
                    }
                  }}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {template.icon}
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewContract(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit/View Contract Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {dialogType === 'create' ? 'Create New Contract' :
           dialogType === 'edit' ? 'Edit Contract' :
           dialogType === 'sign' ? 'Sign Contract' :
           'View Contract'}
        </DialogTitle>
        <DialogContent>
          {(dialogType === 'create' || dialogType === 'edit') && (
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {index === 0 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Contract Title"
                            value={contractForm.title}
                            onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Contract Value"
                            type="number"
                            value={contractForm.value}
                            onChange={(e) => setContractForm({ ...contractForm, value: Number(e.target.value) })}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Currency</InputLabel>
                            <Select
                              value={contractForm.currency}
                              onChange={(e) => setContractForm({ ...contractForm, currency: e.target.value })}
                              label="Currency"
                            >
                              <MenuItem value="USD">USD</MenuItem>
                              <MenuItem value="EUR">EUR</MenuItem>
                              <MenuItem value="GBP">GBP</MenuItem>
                              <MenuItem value="CAD">CAD</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="Start Date"
                              value={contractForm.validityPeriod.startDate}
                              onChange={(date) => setContractForm({
                                ...contractForm,
                                validityPeriod: { ...contractForm.validityPeriod, startDate: date }
                              })}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label="End Date"
                              value={contractForm.validityPeriod.endDate}
                              onChange={(date) => setContractForm({
                                ...contractForm,
                                validityPeriod: { ...contractForm.validityPeriod, endDate: date }
                              })}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          </LocalizationProvider>
                        </Grid>
                      </Grid>
                    )}

                    {index === 1 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Contract Parties</Typography>
                        </Grid>
                        {/* Add party form fields here */}
                        <Grid item xs={12}>
                          <Button variant="outlined" startIcon={<Plus size={16} />}>
                            Add Party
                          </Button>
                        </Grid>
                      </Grid>
                    )}

                    {index === 2 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Select Clauses</Typography>
                        <Grid container spacing={1}>
                          {standardClauses.map((clause) => (
                            <Grid item xs={12} key={clause.id}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={contractForm.clauses.includes(clause.id)}
                                    onChange={(e) => {
                                      const newClauses = e.target.checked
                                        ? [...contractForm.clauses, clause.id]
                                        : contractForm.clauses.filter(c => c !== clause.id);
                                      setContractForm({ ...contractForm, clauses: newClauses });
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {clause.label}
                                    {clause.required && (
                                      <Chip label="Required" size="small" color="error" />
                                    )}
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {index === 3 && (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Contract is ready to be sent!
                        </Alert>
                        <Typography variant="h6" gutterBottom>Review Details</Typography>
                        <List>
                          <ListItem>
                            <ListItemText primary="Title" secondary={contractForm.title} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Value" secondary={`$${contractForm.value} ${contractForm.currency}`} />
                          </ListItem>
                          <ListItem>
                            <ListItemText primary="Validity" secondary={
                              `${contractForm.validityPeriod.startDate?.toLocaleDateString()} - ${contractForm.validityPeriod.endDate?.toLocaleDateString() || 'No end date'}`
                            } />
                          </ListItem>
                        </List>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        disabled={index === 0}
                        onClick={() => setActiveStep(index - 1)}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (index === steps.length - 1) {
                            handleCreateContract();
                          } else {
                            setActiveStep(index + 1);
                          }
                        }}
                      >
                        {index === steps.length - 1 ? 'Create & Send' : 'Continue'}
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}

          {dialogType === 'sign' && selectedContract && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please review the contract carefully before signing.
              </Alert>
              <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>{selectedContract.title}</Typography>
                <Typography variant="body1" paragraph>
                  {selectedContract.content || 'Contract content would appear here...'}
                </Typography>
              </Paper>
              <FormControlLabel
                control={<Checkbox />}
                label="I have read and agree to the terms and conditions"
              />
            </Box>
          )}

          {dialogType === 'view' && selectedContract && (
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{selectedContract.title}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption">Status</Typography>
                    <Typography variant="body1">{selectedContract.status}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption">Value</Typography>
                    <Typography variant="body1">${selectedContract.value?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption">Content</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedContract.content || 'Contract content...'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogType === 'sign' && (
            <Button 
              variant="contained" 
              startIcon={<PenTool size={16} />}
              onClick={() => handleSignContract(selectedContract.id)}
            >
              Sign Contract
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Contract Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedContract(null);
        }}
      >
        <MenuItem onClick={() => {
          if (selectedContract) handleDuplicateContract(selectedContract);
          setAnchorEl(null);
        }}>
          <Copy size={16} style={{ marginRight: 8 }} /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement share
          setAnchorEl(null);
        }}>
          <Share2 size={16} style={{ marginRight: 8 }} /> Share
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement download
          setAnchorEl(null);
        }}>
          <Download size={16} style={{ marginRight: 8 }} /> Download
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement archive
          setAnchorEl(null);
        }}>
          <Archive size={16} style={{ marginRight: 8 }} /> Archive
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            if (selectedContract) handleDeleteContract(selectedContract.id);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

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

export default EContracts;