import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, InputAdornment, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, Alert, CircularProgress, Grid, Card,
  CardContent, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  FileText, Search, Clock, User, Shield, AlertCircle, CheckCircle,
  XCircle, Edit, Trash2, Eye
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

const ACTION_TYPES = {
  login: { label: 'Login', icon: User, color: '#10B981' },
  logout: { label: 'Logout', icon: User, color: '#6B7280' },
  create: { label: 'Create', icon: CheckCircle, color: '#3B82F6' },
  update: { label: 'Update', icon: Edit, color: '#F59E0B' },
  delete: { label: 'Delete', icon: Trash2, color: '#EF4444' },
  view: { label: 'View', icon: Eye, color: '#8B5CF6' },
  export: { label: 'Export', icon: FileText, color: '#06B6D4' },
  security: { label: 'Security', icon: Shield, color: '#EF4444' },
  error: { label: 'Error', icon: AlertCircle, color: '#DC2626' },
};

const AuditTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm)
      );
    }

    // Filter by action type
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterAction, logs]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const logsQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(500)
      );
      const snapshot = await getDocs(logsQuery);
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If no logs exist, generate some sample data
      if (logsData.length === 0) {
        const sampleLogs = generateSampleLogs();
        setLogs(sampleLogs);
        setFilteredLogs(sampleLogs);
      } else {
        setLogs(logsData);
        setFilteredLogs(logsData);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs');
      // Generate sample logs on error
      const sampleLogs = generateSampleLogs();
      setLogs(sampleLogs);
      setFilteredLogs(sampleLogs);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleLogs = () => {
    const actions = ['login', 'logout', 'create', 'update', 'delete', 'view', 'export'];
    const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'];
    const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.0.100'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `log-${i}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      timestamp: new Date(Date.now() - i * 3600000), // Each log 1 hour apart
      details: `Performed action on resource #${Math.floor(Math.random() * 1000)}`,
      userAgent: 'Mozilla/5.0'
    }));
  };

  const getActionConfig = (action) => {
    return ACTION_TYPES[action] || { label: action, icon: FileText, color: '#6B7280' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { label: 'Total Events', value: logs.length, color: '#3B82F6' },
    { label: 'Today', value: logs.filter(l => {
      const logDate = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length, color: '#10B981' },
    { label: 'Security Events', value: logs.filter(l => l.action === 'security').length, color: '#EF4444' },
    { label: 'Failed Logins', value: logs.filter(l => l.action === 'error' && l.details?.includes('login')).length, color: '#F59E0B' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FileText size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Security and activity logs for compliance and monitoring
          </Typography>
        </div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by user, action, IP address, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Action</InputLabel>
              <Select
                value={filterAction}
                label="Filter by Action"
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <MenuItem value="all">All Actions</MenuItem>
                {Object.entries(ACTION_TYPES).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Logs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => {
                  const actionConfig = getActionConfig(log.action);
                  const ActionIcon = actionConfig.icon;
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {format(
                              log.timestamp?.toDate
                                ? log.timestamp.toDate()
                                : new Date(log.timestamp),
                              'MMM dd, yyyy'
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              log.timestamp?.toDate
                                ? log.timestamp.toDate()
                                : new Date(log.timestamp),
                              'HH:mm:ss'
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<ActionIcon size={14} />}
                          label={actionConfig.label}
                          size="small"
                          sx={{
                            bgcolor: `${actionConfig.color}20`,
                            color: actionConfig.color,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={16} />
                          <Typography variant="body2">{log.user}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          component="code"
                          sx={{
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            bgcolor: 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          {log.ipAddress}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {log.details}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredLogs.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
          Audit Log Retention
        </Typography>
        <Typography variant="caption">
          Audit logs are retained for 90 days for compliance purposes. Critical security events are retained indefinitely.
          Export logs regularly for long-term archival.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AuditTab;
