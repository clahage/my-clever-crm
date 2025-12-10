/**
 * Email Alias Manager Component
 * Comprehensive UI for managing 24+ Gmail aliases
 *
 * Features:
 * - Alias selector dropdown
 * - Usage statistics dashboard
 * - Test email functionality
 * - Permission management
 * - Real-time analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Email,
  Send,
  BarChart,
  Settings,
  CheckCircle,
  Error,
  TrendingUp,
  People,
  Speed,
  Info,
} from '@mui/icons-material';
import aliasService, { EMAIL_ALIASES } from '@/services/aliasService';
import unifiedEmailService from '@/services/unifiedEmailService';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Email Alias Manager Component
 */
const EmailAliasManager = () => {
  const { currentUser } = useAuth();
  const [selectedAlias, setSelectedAlias] = useState('contact');
  const [aliasStats, setAliasStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [permittedAliases, setPermittedAliases] = useState([]);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load permitted aliases on mount
  useEffect(() => {
    loadPermittedAliases();
  }, [currentUser]);

  // Load stats when alias changes
  useEffect(() => {
    if (selectedAlias) {
      loadAliasStats(selectedAlias);
    }
  }, [selectedAlias]);

  /**
   * Load user's permitted aliases
   */
  const loadPermittedAliases = async () => {
    if (!currentUser) return;

    try {
      // Get user role from profile
      const userRole = currentUser.role || 'agent';
      const aliases = aliasService.getPermittedAliases(userRole);

      setPermittedAliases(aliases);

      if (aliases.length > 0 && !aliases.includes(selectedAlias)) {
        setSelectedAlias(aliases[0]);
      }
    } catch (error) {
      console.error('Failed to load permitted aliases:', error);
      setErrorMessage('Failed to load aliases');
    }
  };

  /**
   * Load alias statistics
   */
  const loadAliasStats = async (alias) => {
    setLoadingStats(true);
    try {
      const stats = await unifiedEmailService.getAliasStats(alias);
      setAliasStats(stats);
    } catch (error) {
      console.error('Failed to load alias stats:', error);
      setAliasStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  /**
   * Send test email
   */
  const handleSendTest = async () => {
    if (!testEmail) {
      setErrorMessage('Please enter a test email address');
      return;
    }

    setSendingTest(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await unifiedEmailService.sendTestEmail(testEmail, selectedAlias);
      setSuccessMessage(`Test email sent to ${testEmail}`);
      setTestEmail('');
      setTestDialogOpen(false);
    } catch (error) {
      setErrorMessage(`Failed to send test email: ${error.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  /**
   * Get alias by key
   */
  const getAliasConfig = (key) => {
    return aliasService.getAlias(key);
  };

  /**
   * Get alias color by category
   */
  const getAliasColor = (category) => {
    const colors = {
      'customer-facing': 'primary',
      'sales': 'success',
      'service': 'info',
      'financial': 'warning',
      'operations': 'secondary',
      'administrative': 'error',
      'compliance': 'default',
      'automation': 'info',
      'system': 'default',
    };
    return colors[category] || 'default';
  };

  const aliasConfig = getAliasConfig(selectedAlias);
  const aliasesByCategory = aliasService.getAliasesByCategory();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📧 Email Alias Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage 24+ Gmail aliases for different business functions
        </Typography>
      </Box>

      {/* Alerts */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Alias Selector & Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <InputLabel>Select Email Alias</InputLabel>
            <Select
              value={selectedAlias}
              onChange={(e) => setSelectedAlias(e.target.value)}
              label="Select Email Alias"
            >
              {Object.entries(aliasesByCategory).map(([category, aliases]) => [
                <MenuItem key={`header-${category}`} disabled sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                  {category.replace('-', ' ').toUpperCase()}
                </MenuItem>,
                ...aliases
                  .filter(a => permittedAliases.includes(a.key))
                  .map(alias => (
                    <MenuItem key={alias.key} value={alias.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        <Box>
                          <Typography variant="body2">{alias.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alias.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
              ])}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Send />}
            onClick={() => setTestDialogOpen(true)}
            sx={{ height: '56px' }}
          >
            Send Test Email
          </Button>
        </Grid>
      </Grid>

      {/* Alias Details */}
      {aliasConfig && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {aliasConfig.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {aliasConfig.purpose}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={aliasConfig.category}
                    color={getAliasColor(aliasConfig.category)}
                    size="small"
                  />
                  <Chip
                    label={`Priority: ${aliasConfig.priority}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Department: ${aliasConfig.department}`}
                    size="small"
                    variant="outlined"
                  />
                  {aliasConfig.autoResponse && (
                    <Chip
                      label="Auto-Response"
                      size="small"
                      color="success"
                      icon={<CheckCircle />}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Email:</strong> {aliasConfig.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Handler:</strong> {aliasConfig.handler || 'None'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Category:</strong> {aliasConfig.category}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Dashboard */}
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {loadingStats ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : aliasStats ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email color="primary" />
                    <Typography variant="h6">{aliasStats.totalSent}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Sent (30 days)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="h6">{aliasStats.successRate}%</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp color="info" />
                    <Typography variant="h6">{aliasStats.openRate}%</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Open Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <People color="secondary" />
                    <Typography variant="h6">{aliasStats.recipients}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Unique Recipients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detailed Statistics
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Successful
                      </Typography>
                      <Typography variant="h6">{aliasStats.successful}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Failed
                      </Typography>
                      <Typography variant="h6">{aliasStats.failed}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Opens
                      </Typography>
                      <Typography variant="h6">{aliasStats.opens}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Clicks
                      </Typography>
                      <Typography variant="h6">{aliasStats.clicks}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              No statistics available for this alias yet
            </Alert>
          </Grid>
        )}

        {/* All Aliases Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Available Aliases
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Alias</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permittedAliases.map(key => {
                      const alias = getAliasConfig(key);
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {alias.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {alias.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {alias.purpose}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alias.priority}
                              size="small"
                              color={
                                alias.priority === 'high' ? 'error' :
                                alias.priority === 'medium' ? 'warning' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={alias.category}
                              size="small"
                              color={getAliasColor(alias.category)}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Select this alias">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedAlias(key)}
                                color={selectedAlias === key ? 'primary' : 'default'}
                              >
                                <Email />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Send a test email from <strong>{aliasConfig?.email}</strong> to verify configuration
          </Typography>
          <TextField
            fullWidth
            label="Recipient Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
            placeholder="your-email@example.com"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendTest}
            disabled={sendingTest || !testEmail}
            startIcon={sendingTest ? <CircularProgress size={20} /> : <Send />}
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailAliasManager;
