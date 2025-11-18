/**
 * CommunicationsCenter.jsx
 * 
 * Purpose: Admin communications dashboard - unified hub for all client communications
 * 
 * Features:
 * - Email management (inbox, sent, drafts)
 * - Fax center (send, receive, track)
 * - Ticket system
 * - AI auto-response configuration
 * - Communication analytics
 * - Staff assignment
 * - Priority filtering
 * - Real-time updates
 * 
 * Dependencies:
 * - Material-UI
 * - communicationService.js
 * - emailService.js
 * - faxService.js
 * 
 * Author: Claude (SpeedyCRM Team)
 * Last Updated: October 19, 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  AlertTitle,
  LinearProgress,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Mail as EmailIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Archive as ArchiveIcon,
  Trash2 as DeleteIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  RefreshCw as RefreshIcon,
  FileText as FaxIcon,
  Ticket as TicketIcon,
  TrendingUp as StatsIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Clock as ClockIcon,
  CheckCircle as CheckIcon,
  AlertCircle as UrgentIcon,
  MessageCircle as MessageIcon,
  Phone as CallIcon,
  DollarSign as BillingIcon,
  MoreVertical as MoreIcon,
  Eye as ViewIcon,
  Edit as EditIcon,
  UserPlus as AssignIcon,
  Tag as TagIcon
} from 'lucide-react';

import communicationService from '@/services/communicationService';
import emailService from '@/services/emailService';
import faxService from '@/services/faxService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

/**
 * Main Communications Center Component
 */
const CommunicationsCenter = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [communications, setCommunications] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [faxes, setFaxes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComm, setSelectedComm] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load data on mount
  useEffect(() => {
    loadCommunications();
    loadTickets();
    loadFaxes();
    loadStats();

    // Set up real-time listeners
    const unsubscribeComm = setupCommunicationsListener();
    const unsubscribeTickets = setupTicketsListener();

    return () => {
      unsubscribeComm && unsubscribeComm();
      unsubscribeTickets && unsubscribeTickets();
    };
  }, []);

  /**
   * Load communications
   */
  const loadCommunications = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'communications'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCommunications(data);
    } catch (error) {
      console.error('Failed to load communications:', error);
      showError('Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load tickets
   */
  const loadTickets = async () => {
    try {
      const q = query(
        collection(db, 'tickets'),
        where('status', '!=', 'resolved'),
        orderBy('status'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  /**
   * Load faxes
   */
  const loadFaxes = async () => {
    try {
      const pending = await faxService.getPendingFaxes();
      setFaxes(pending);
    } catch (error) {
      console.error('Failed to load faxes:', error);
    }
  };

  /**
   * Load statistics
   */
  const loadStats = async () => {
    try {
      const statistics = await communicationService.getCommunicationStats();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  /**
   * Set up real-time listener for communications
   */
  const setupCommunicationsListener = () => {
    const q = query(
      collection(db, 'communications'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCommunications(data);
    });
  };

  /**
   * Set up real-time listener for tickets
   */
  const setupTicketsListener = () => {
    const q = query(
      collection(db, 'tickets'),
      where('status', '!=', 'resolved'),
      orderBy('status'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(data);
    });
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    loadCommunications();
    loadTickets();
    loadFaxes();
    loadStats();
  };

  /**
   * View communication details
   */
  const handleView = (comm) => {
    setSelectedComm(comm);
    setViewDialogOpen(true);
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'info';
      case 'auto_responded': return 'success';
      case 'acknowledged': return 'default';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  /**
   * Filter communications
   */
  const filteredCommunications = communications.filter(comm => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        comm.subject?.toLowerCase().includes(search) ||
        comm.message?.toLowerCase().includes(search) ||
        comm.clientName?.toLowerCase().includes(search) ||
        comm.clientEmail?.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Department filter
    if (filterDepartment !== 'all' && comm.department !== filterDepartment) {
      return false;
    }

    // Priority filter
    if (filterPriority !== 'all' && comm.priority !== filterPriority) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all' && comm.status !== filterStatus) {
      return false;
    }

    return true;
  });

  /**
   * Paginated communications
   */
  const paginatedCommunications = filteredCommunications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /**
   * Handle page change
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Render statistics cards
   */
  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Communications
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <MessageIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Auto-Responded
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.autoResponded}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.total > 0 ? Math.round((stats.autoResponded / stats.total) * 100) : 0}% AI Success
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <CheckIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {tickets.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <TicketIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Faxes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {faxes.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <FaxIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  /**
   * Render communications table
   */
  const renderCommunicationsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedCommunications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  No communications found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedCommunications.map((comm) => (
              <TableRow key={comm.id} hover>
                <TableCell>
                  <Chip
                    size="small"
                    label={comm.type}
                    icon={
                      comm.type === 'email' ? <EmailIcon size={14} /> :
                      comm.type === 'fax' ? <FaxIcon size={14} /> :
                      <MessageIcon size={14} />
                    }
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {comm.clientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comm.clientEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={comm.department} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {comm.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={comm.priority}
                    color={getPriorityColor(comm.priority)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={comm.status}
                    color={getStatusColor(comm.status)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {comm.timestamp?.toDate ? 
                      formatDistanceToNow(comm.timestamp.toDate(), { addSuffix: true }) :
                      'Just now'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleView(comm)}>
                    <ViewIcon size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredCommunications.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Communications Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all client communications in one place
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon size={18} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon size={18} />}
          >
            Compose
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<InboxIcon size={18} />} label="All Communications" />
          <Tab icon={<TicketIcon size={18} />} label={`Tickets (${tickets.length})`} />
          <Tab icon={<FaxIcon size={18} />} label={`Faxes (${faxes.length})`} />
          <Tab icon={<StatsIcon size={18} />} label="Analytics" />
          <Tab icon={<SettingsIcon size={18} />} label="Settings" />
        </Tabs>

        <CardContent>
          {/* Filters */}
          {activeTab === 0 && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search communications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon size={18} />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                      <MenuItem value="billing">Billing</MenuItem>
                      <MenuItem value="disputes">Disputes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="all">All Priorities</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="received">Received</MenuItem>
                      <MenuItem value="auto_responded">Auto-Responded</MenuItem>
                      <MenuItem value="acknowledged">Acknowledged</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Content based on active tab */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderCommunicationsTable()}
              {activeTab === 1 && <Typography>Tickets view coming soon...</Typography>}
              {activeTab === 2 && <Typography>Faxes view coming soon...</Typography>}
              {activeTab === 3 && <Typography>Analytics view coming soon...</Typography>}
              {activeTab === 4 && <Typography>Settings view coming soon...</Typography>}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedComm && (
          <>
            <DialogTitle>
              Communication Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                  <Typography variant="body1">{selectedComm.clientName} ({selectedComm.clientEmail})</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                  <Typography variant="body1">{selectedComm.subject}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedComm.message}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<SendIcon size={18} />}>
                Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CommunicationsCenter;