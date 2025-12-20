// ============================================================================
// SMART DISPUTE PRIORITIZATION - AI-POWERED ITEM RANKING
// ============================================================================
// Intelligent prioritization of disputable items for maximum score impact
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Tooltip,
  Collapse,
  Autocomplete,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Sort as SortIcon,
  TrendingUp,
  Speed,
  Gavel,
  Schedule,
  CheckCircle,
  Warning,
  Star,
  ExpandMore,
  KeyboardArrowRight,
  Lightbulb,
  PlayArrow,
  Flag,
  Timer,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, functions } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

// Priority Badge Component
const PriorityBadge = ({ score }) => {
  const getConfig = () => {
    if (score >= 80) return { color: 'error', label: 'Critical', icon: '🔥' };
    if (score >= 60) return { color: 'warning', label: 'High', icon: '⚡' };
    if (score >= 40) return { color: 'info', label: 'Medium', icon: '📊' };
    return { color: 'default', label: 'Low', icon: '📋' };
  };

  const config = getConfig();

  return (
    <Chip
      icon={<span>{config.icon}</span>}
      label={`${config.label} (${Math.round(score)})`}
      color={config.color}
      size="small"
    />
  );
};

// Success Probability Indicator
const SuccessIndicator = ({ probability }) => {
  const percentage = Math.round(probability * 100);
  const getColor = () => {
    if (percentage >= 70) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        sx={{ width: 60, height: 8, borderRadius: 4 }}
      />
      <Typography variant="caption" fontWeight="bold">
        {percentage}%
      </Typography>
    </Box>
  );
};

// Item Card Component
const PrioritizedItemCard = ({ item, index, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{
        mb: 2,
        border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Checkbox
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{ mt: -1, ml: -1 }}
          />
          <Avatar
            sx={{
              bgcolor: index < 3 ? 'warning.main' : index < 6 ? 'info.main' : 'grey.400',
              width: 32,
              height: 32,
              fontSize: '0.9rem',
              mr: 2,
            }}
          >
            {index + 1}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.creditor || item.name || 'Unknown Creditor'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.type?.toUpperCase()} • ${item.balance?.toLocaleString() || 0}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <PriorityBadge score={item.analysis?.priorityScore || 0} />
                <Box sx={{ mt: 1 }}>
                  <SuccessIndicator probability={item.analysis?.successProbability || 0} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <TrendingUp sx={{ color: 'success.main' }} />
                <Typography variant="body2" fontWeight="bold">
                  {item.analysis?.scoreImpact || 0} pts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Score Impact
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Gavel sx={{ color: 'info.main' }} />
                <Typography variant="body2" fontWeight="bold">
                  {item.analysis?.legalStrength || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Legal Strength
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Speed sx={{ color: 'warning.main' }} />
                <Typography variant="body2" fontWeight="bold">
                  {item.analysis?.urgency || 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Urgency
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Timer sx={{ color: 'secondary.main' }} />
                <Typography variant="body2" fontWeight="bold">
                  {item.estimatedTimeToResolve || '45 days'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Est. Time
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {item.recommendedReasons?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Recommended Dispute Reasons:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {item.recommendedReasons.map((reason, idx) => (
                  <Chip
                    key={idx}
                    label={reason.replace(/_/g, ' ')}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

const SmartPrioritization = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [maxItems, setMaxItems] = useState(10);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const contactsRef = collection(db, 'contacts');
        const q = query(contactsRef, orderBy('lastName'), limit(500));
        const snapshot = await getDocs(q);
        const clientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          label: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || doc.data().email,
        }));
        setClients(clientList);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setClientsLoading(false);
      }
    };
    loadClients();
  }, []);

  // Run prioritization
  const runPrioritization = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedItems(new Set());

    try {
      const prioritize = httpsCallable(functions, 'prioritizeDisputes');
      const result = await prioritize({
        clientId: selectedClient.id,
        maxItems: maxItems,
      });

      if (result.data.success) {
        setResults(result.data);
      } else {
        setError('Prioritization failed');
      }
    } catch (err) {
      console.error('Prioritization error:', err);
      setError(err.message || 'Failed to prioritize disputes');
    } finally {
      setLoading(false);
    }
  };

  // Toggle item selection
  const toggleItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items in a round
  const selectRound = (roundItems) => {
    const newSelected = new Set(selectedItems);
    roundItems.forEach(item => newSelected.add(item.id));
    setSelectedItems(newSelected);
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
            <SortIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Smart Dispute Prioritization
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              AI-powered ranking for maximum score impact
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={clients}
              loading={clientsLoading}
              value={selectedClient}
              onChange={(e, newValue) => setSelectedClient(newValue)}
              getOptionLabel={(option) => option.label || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Client"
                  placeholder="Search by name..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {clientsLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="number"
              label="Max Items to Analyze"
              value={maxItems}
              onChange={(e) => setMaxItems(Math.max(1, parseInt(e.target.value) || 10))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 50 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={runPrioritization}
              disabled={loading || !selectedClient}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SortIcon />}
              sx={{ height: 56, background: 'linear-gradient(45deg, #11998e, #38ef7d)' }}
            >
              {loading ? 'Analyzing...' : 'Prioritize Items'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {results.totalItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {results.rounds?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dispute Rounds
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {selectedItems.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selected Items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    +{results.strategy?.estimatedTotalScoreGain || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Est. Score Gain
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Strategy Overview */}
          {results.strategy && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Lightbulb sx={{ mr: 1, color: 'warning.main' }} />
                AI Strategy Recommendation
              </Typography>
              <Typography variant="body1" paragraph>
                {results.strategy.overallStrategy}
              </Typography>
              {results.strategy.immediateActions?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Immediate Actions:
                  </Typography>
                  <List dense>
                    {results.strategy.immediateActions.map((action, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <PlayArrow color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {results.strategy.warningsAndRisks?.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Warnings:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {results.strategy.warningsAndRisks.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Paper>
          )}

          {/* Dispute Rounds */}
          {results.rounds?.map((round, roundIdx) => (
            <Accordion key={roundIdx} defaultExpanded={roundIdx === 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge badgeContent={round.items.length} color="primary" sx={{ mr: 2 }}>
                      <Avatar sx={{ bgcolor: roundIdx === 0 ? 'error.main' : 'primary.main' }}>
                        R{round.roundNumber}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6">
                        Round {round.roundNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Week {round.estimatedStartWeek} • {round.items.length} items
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectRound(round.items);
                    }}
                  >
                    Select All
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {round.items.map((item, itemIdx) => (
                  <PrioritizedItemCard
                    key={item.id}
                    item={item}
                    index={roundIdx * 5 + itemIdx}
                    selected={selectedItems.has(item.id)}
                    onSelect={toggleItem}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Action Button */}
          {selectedItems.size > 0 && (
            <Paper
              sx={{
                position: 'sticky',
                bottom: 16,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                boxShadow: 8,
              }}
            >
              <Typography variant="h6">
                {selectedItems.size} items selected
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Gavel />}
              >
                Generate Disputes
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SortIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to prioritize disputable items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI analyzes each negative item for score impact, success probability,
            legal strength, and urgency to recommend the optimal dispute order.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SmartPrioritization;
