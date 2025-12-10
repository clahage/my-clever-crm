import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  CircularProgress, Grid, Card, CardContent, TablePagination
} from '@mui/material';
import {
  HelpCircle, Plus, MessageSquare, Clock, CheckCircle, AlertCircle,
  Eye, Mail
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const SupportTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsQuery = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(ticketsQuery);
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.subject || !formData.description) {
        setError('Subject and description are required');
        return;
      }

      await addDoc(collection(db, 'tickets'), {
        ...formData,
        status: 'open',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        updatedAt: serverTimestamp()
      });

      setSuccess('Support ticket created successfully');
      setDialogOpen(false);
      setFormData({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general'
      });
      loadTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create support ticket');
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'warning',
      'in-progress': 'info',
      resolved: 'success',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: AlertCircle,
      'in-progress': Clock,
      resolved: CheckCircle,
      closed: CheckCircle
    };
    const Icon = icons[status] || HelpCircle;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { label: 'Total Tickets', value: tickets.length, color: '#3B82F6' },
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#F59E0B' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#06B6D4' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#10B981' }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HelpCircle size={24} />
          <div>
            <Typography variant="h5" fontWeight="bold">
              Support & Help Desk
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submit and track support tickets
            </Typography>
          </div>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setDialogOpen(true)}
        >
          New Ticket
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tickets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        #{ticket.id.slice(0, 8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(ticket.status)}
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.createdAt
                          ? formatDistanceToNow(
                              ticket.createdAt.toDate
                                ? ticket.createdAt.toDate()
                                : new Date(ticket.createdAt),
                              { addSuffix: true }
                            )
                          : 'Just now'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewTicket(ticket)}>
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={tickets.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create Ticket Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  SelectProps={{ native: true }}
                >
                  <option value="general">General</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTicket}>
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Ticket #{selectedTicket?.id.slice(0, 8).toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  {selectedTicket.subject}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={selectedTicket.category} size="small" variant="outlined" />
                  <Chip label={selectedTicket.priority} size="small" color={getPriorityColor(selectedTicket.priority)} />
                  <Chip label={selectedTicket.status} size="small" color={getStatusColor(selectedTicket.status)} />
                </Box>
              </Box>

              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </Typography>
              </Paper>

              <Typography variant="caption" color="text.secondary">
                Created {selectedTicket.createdAt
                  ? formatDistanceToNow(
                      selectedTicket.createdAt.toDate
                        ? selectedTicket.createdAt.toDate()
                        : new Date(selectedTicket.createdAt),
                      { addSuffix: true }
                    )
                  : 'just now'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTicket(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTab;
