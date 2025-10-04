// src/pages/CreditReports.jsx - Complete Credit Report Management System
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Menu, MenuItem, FormControl, InputLabel,
  Select, Card, CardContent, Grid, Avatar, Stack, Tooltip, Badge,
  CircularProgress, LinearProgress, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Divider, Switch,
  FormControlLabel, FormGroup, Checkbox, RadioGroup, Radio, Autocomplete,
  InputAdornment, ToggleButton, ToggleButtonGroup, Slider,
  Stepper, Step, StepLabel, Accordion, AccordionSummary, 
  AccordionDetails, Rating, SpeedDial, SpeedDialAction
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FileCheck, TrendingUp, AlertCircle, CheckCircle, Download, Upload,
  Send, Edit, Trash2, Search, Filter, Calendar, Clock, Eye, Copy,
  Archive, Settings, RefreshCw, Shield, Award, Target, Zap,
  BarChart2, PieChart, Activity, CreditCard, FileText, Mail,
  Phone, User, Building, MapPin, Hash, ExternalLink, Info,
  ChevronRight, ChevronDown, XCircle, Plus, Minus, DollarSign,
  Percent, ArrowUp, ArrowDown, Flag, Star, Lock, Unlock,
  AlertTriangle, HelpCircle, MessageSquare, Scale, Briefcase,
  Home, Car, GraduationCap, Heart, Layers, Database, Cpu,
  Grid as GridIcon,  // RENAMED to avoid MUI conflict
  List as ListIcon   // For list view toggle
} from 'lucide-react';
import { 
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, limit, serverTimestamp, onSnapshot, getDoc, setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format, subMonths, differenceInDays } from 'date-fns';

const CreditReports = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBureau, setFilterBureau] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Report Form State
  const [reportForm, setReportForm] = useState({
    contact: null,
    bureau: 'equifax', // equifax, experian, transunion
    reportDate: new Date(),
    scores: {
      equifax: 0,
      experian: 0,
      transunion: 0,
      vantage: 0,
      fico8: 0
    },
    accounts: [],
    inquiries: [],
    publicRecords: [],
    collections: [],
    summary: {
      totalAccounts: 0,
      openAccounts: 0,
      closedAccounts: 0,
      delinquentAccounts: 0,
      totalDebt: 0,
      utilization: 0,
      paymentHistory: 100,
      oldestAccount: null,
      averageAccountAge: 0
    }
  });

  // Dispute Form State
  const [disputeForm, setDisputeForm] = useState({
    contact: null,
    type: 'inaccurate', // inaccurate, fraudulent, duplicate, outdated
    bureau: [],
    items: [],
    reason: '',
    supportingDocs: [],
    status: 'draft',
    priority: 'normal' // low, normal, high, urgent
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    avgScore: 0,
    avgImprovement: 0,
    totalDisputes: 0,
    successRate: 0,
    pendingDisputes: 0,
    recentActivity: [],
    scoreDistribution: [],
    bureauComparison: {}
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Score Ranges
  const scoreRanges = {
    excellent: { min: 750, max: 850, color: '#10B981', label: 'Excellent' },
    good: { min: 700, max: 749, color: '#3B82F6', label: 'Good' },
    fair: { min: 650, max: 699, color: '#F59E0B', label: 'Fair' },
    poor: { min: 550, max: 649, color: '#EF4444', label: 'Poor' },
    bad: { min: 300, max: 549, color: '#991B1B', label: 'Bad' }
  };

  // Negative Item Types
  const negativeItemTypes = [
    { id: 'late_payment', label: 'Late Payment', icon: Clock },
    { id: 'collection', label: 'Collection Account', icon: AlertCircle },
    { id: 'charge_off', label: 'Charge-off', icon: XCircle },
    { id: 'bankruptcy', label: 'Bankruptcy', icon: Scale },
    { id: 'foreclosure', label: 'Foreclosure', icon: Home },
    { id: 'repossession', label: 'Repossession', icon: Car },
    { id: 'tax_lien', label: 'Tax Lien', icon: Building },
    { id: 'judgment', label: 'Judgment', icon: Scale },
    { id: 'hard_inquiry', label: 'Hard Inquiry', icon: Search }
  ];

  // Load reports
  const loadReports = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'creditReports'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reportsData = [];
      
      querySnapshot.forEach((doc) => {
        reportsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setReports(reportsData);
      calculateStatistics(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      showSnackbar('Error loading credit reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load disputes
  const loadDisputes = async () => {
    try {
      const q = query(
        collection(db, 'disputes'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const disputesData = [];
      
      querySnapshot.forEach((doc) => {
        disputesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDisputes(disputesData);
    } catch (error) {
      console.error('Error loading disputes:', error);
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
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Calculate statistics
  const calculateStatistics = (reportsData) => {
    const stats = {
      totalReports: reportsData.length,
      avgScore: 0,
      avgImprovement: 0,
      totalDisputes: 0,
      successRate: 0,
      pendingDisputes: 0,
      recentActivity: [],
      scoreDistribution: [],
      bureauComparison: {
        equifax: { avg: 0, count: 0 },
        experian: { avg: 0, count: 0 },
        transunion: { avg: 0, count: 0 }
      }
    };

    let totalScore = 0;
    let scoreCount = 0;
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0, bad: 0 };

    reportsData.forEach(report => {
      // Calculate average scores
      Object.entries(report.scores || {}).forEach(([bureau, score]) => {
        if (score > 0) {
          totalScore += score;
          scoreCount++;
          
          // Bureau comparison
          if (stats.bureauComparison[bureau]) {
            stats.bureauComparison[bureau].avg += score;
            stats.bureauComparison[bureau].count++;
          }
          
          // Score distribution
          if (score >= 750) distribution.excellent++;
          else if (score >= 700) distribution.good++;
          else if (score >= 650) distribution.fair++;
          else if (score >= 550) distribution.poor++;
          else distribution.bad++;
        }
      });
    });

    // Calculate averages
    if (scoreCount > 0) {
      stats.avgScore = Math.round(totalScore / scoreCount);
    }

    Object.keys(stats.bureauComparison).forEach(bureau => {
      if (stats.bureauComparison[bureau].count > 0) {
        stats.bureauComparison[bureau].avg = Math.round(
          stats.bureauComparison[bureau].avg / stats.bureauComparison[bureau].count
        );
      }
    });

    stats.scoreDistribution = Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: reportsData.length > 0 ? (count / reportsData.length) * 100 : 0
    }));

    setStatistics(stats);
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 750) return scoreRanges.excellent.color;
    if (score >= 700) return scoreRanges.good.color;
    if (score >= 650) return scoreRanges.fair.color;
    if (score >= 550) return scoreRanges.poor.color;
    return scoreRanges.bad.color;
  };

  // Get score rating
  const getScoreRating = (score) => {
    if (score >= 750) return scoreRanges.excellent.label;
    if (score >= 700) return scoreRanges.good.label;
    if (score >= 650) return scoreRanges.fair.label;
    if (score >= 550) return scoreRanges.poor.label;
    return scoreRanges.bad.label;
  };

  // Import report
  const handleImportReport = async () => {
    setLoading(true);
    try {
      const reportData = {
        ...reportForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'creditReports'), reportData);
      
      showSnackbar('Credit report imported successfully!', 'success');
      setImportDialogOpen(false);
      resetReportForm();
      loadReports();
    } catch (error) {
      console.error('Error importing report:', error);
      showSnackbar('Error importing credit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create dispute
  const handleCreateDispute = async () => {
    setLoading(true);
    try {
      const disputeData = {
        ...disputeForm,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'disputes'), disputeData);
      
      showSnackbar('Dispute created successfully!', 'success');
      setDisputeDialogOpen(false);
      resetDisputeForm();
      loadDisputes();
    } catch (error) {
      console.error('Error creating dispute:', error);
      showSnackbar('Error creating dispute', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Analyze report
  const analyzeReport = (report) => {
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      potentialImprovement: 0
    };

    // Analyze strengths
    if (report.summary?.paymentHistory >= 95) {
      analysis.strengths.push('Excellent payment history');
    }
    if (report.summary?.utilization <= 30) {
      analysis.strengths.push('Low credit utilization');
    }
    if (report.summary?.averageAccountAge >= 7) {
      analysis.strengths.push('Long credit history');
    }

    // Analyze weaknesses
    if (report.summary?.utilization > 50) {
      analysis.weaknesses.push('High credit utilization');
      analysis.recommendations.push('Pay down credit card balances');
      analysis.potentialImprovement += 30;
    }
    if (report.collections?.length > 0) {
      analysis.weaknesses.push(`${report.collections.length} collection accounts`);
      analysis.recommendations.push('Dispute or settle collection accounts');
      analysis.potentialImprovement += report.collections.length * 20;
    }
    if (report.summary?.delinquentAccounts > 0) {
      analysis.weaknesses.push('Delinquent accounts present');
      analysis.recommendations.push('Bring all accounts current');
      analysis.potentialImprovement += 25;
    }

    return analysis;
  };

  // Simulate score improvement
  const simulateScoreImprovement = (currentScore, changes) => {
    let newScore = currentScore;
    
    if (changes.payOffCollections) newScore += 30;
    if (changes.reduceUtilization) newScore += 25;
    if (changes.disputeErrors) newScore += 20;
    if (changes.becomeAuthorizedUser) newScore += 15;
    if (changes.payOnTime) newScore += 10;
    
    return Math.min(850, newScore);
  };

  // Reset forms
  const resetReportForm = () => {
    setReportForm({
      contact: null,
      bureau: 'equifax',
      reportDate: new Date(),
      scores: {
        equifax: 0,
        experian: 0,
        transunion: 0,
        vantage: 0,
        fico8: 0
      },
      accounts: [],
      inquiries: [],
      publicRecords: [],
      collections: [],
      summary: {
        totalAccounts: 0,
        openAccounts: 0,
        closedAccounts: 0,
        delinquentAccounts: 0,
        totalDebt: 0,
        utilization: 0,
        paymentHistory: 100,
        oldestAccount: null,
        averageAccountAge: 0
      }
    });
    setSelectedReport(null);
  };

  const resetDisputeForm = () => {
    setDisputeForm({
      contact: null,
      type: 'inaccurate',
      bureau: [],
      items: [],
      reason: '',
      supportingDocs: [],
      status: 'draft',
      priority: 'normal'
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
      loadReports();
      loadDisputes();
      loadContacts();
    }
  }, [currentUser]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filterBureau !== 'all' && report.bureau !== filterBureau) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          report.contact?.displayName?.toLowerCase().includes(search) ||
          report.contact?.email?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [reports, filterBureau, searchTerm]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Credit Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive credit report analysis and dispute management
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Upload size={20} />}
              onClick={() => setImportDialogOpen(true)}
            >
              Import Report
            </Button>
            <Button
              variant="contained"
              startIcon={<FileText size={20} />}
              onClick={() => setDialogOpen(true)}
            >
              Pull Report
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
                    <Typography variant="body2" color="text.secondary">Average Score</Typography>
                    <Typography variant="h3" fontWeight={600} color={getScoreColor(statistics.avgScore)}>
                      {statistics.avgScore || '--'}
                    </Typography>
                    <Chip
                      label={getScoreRating(statistics.avgScore)}
                      size="small"
                      sx={{ 
                        backgroundColor: getScoreColor(statistics.avgScore),
                        color: 'white',
                        mt: 1
                      }}
                    />
                  </Box>
                  <Activity size={24} color={getScoreColor(statistics.avgScore)} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Reports</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.totalReports}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      <TrendingUp size={12} /> 3 this month
                    </Typography>
                  </Box>
                  <FileCheck size={24} color="#3B82F6" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Disputes</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {statistics.pendingDisputes || disputes.filter(d => d.status === 'pending').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {disputes.filter(d => d.status === 'resolved').length} resolved
                    </Typography>
                  </Box>
                  <AlertCircle size={24} color="#F59E0B" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {statistics.successRate || 78}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dispute success
                    </Typography>
                  </Box>
                  <CheckCircle size={24} color="#10B981" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Reports" />
            <Tab label="Disputes" />
            <Tab label="Analysis" />
            <Tab label="Simulator" />
          </Tabs>

          {/* Reports Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search reports..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search size={18} />
                  }}
                  sx={{ width: 300 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterBureau}
                    onChange={(e) => setFilterBureau(e.target.value)}
                  >
                    <MenuItem value="all">All Bureaus</MenuItem>
                    <MenuItem value="equifax">Equifax</MenuItem>
                    <MenuItem value="experian">Experian</MenuItem>
                    <MenuItem value="transunion">TransUnion</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ flexGrow: 1 }} />

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, v) => v && setViewMode(v)}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <Grid size={18} />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ListIcon size={18} />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Reports Grid/List */}
              {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {filteredReports.map((report) => (
                    <Grid item xs={12} md={4} key={report.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                              <Typography variant="h6">
                                {report.contact?.displayName || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(
                                  report.reportDate?.toDate ? report.reportDate.toDate() : new Date(report.reportDate),
                                  'MM/dd/yyyy'
                                )}
                              </Typography>
                            </Box>
                            <Chip
                              label={report.bureau}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h3" fontWeight={600} color={getScoreColor(report.scores?.[report.bureau] || 0)}>
                              {report.scores?.[report.bureau] || '--'}
                            </Typography>
                            <Rating
                              value={(report.scores?.[report.bureau] || 0) / 170}
                              max={5}
                              readOnly
                              size="small"
                            />
                          </Box>

                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Accounts
                              </Typography>
                              <Typography variant="body2">
                                {report.summary?.totalAccounts || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Utilization
                              </Typography>
                              <Typography variant="body2">
                                {report.summary?.utilization || 0}%
                              </Typography>
                            </Grid>
                          </Grid>

                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => {
                              setSelectedReport(report);
                              setDialogOpen(true);
                            }}>
                              <Eye size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => {
                              setSelectedContact(report.contact);
                              setDisputeDialogOpen(true);
                            }}>
                              <Flag size={16} />
                            </IconButton>
                            <IconButton size="small">
                              <Download size={16} />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Bureau</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Accounts</TableCell>
                        <TableCell>Collections</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {report.contact?.displayName || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={report.bureau} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              color={getScoreColor(report.scores?.[report.bureau] || 0)}
                            >
                              {report.scores?.[report.bureau] || '--'}
                            </Typography>
                          </TableCell>
                          <TableCell>{report.summary?.totalAccounts || 0}</TableCell>
                          <TableCell>{report.collections?.length || 0}</TableCell>
                          <TableCell>
                            {format(
                              report.reportDate?.toDate ? report.reportDate.toDate() : new Date(report.reportDate),
                              'MM/dd/yyyy'
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small">
                                <Eye size={16} />
                              </IconButton>
                              <IconButton size="small">
                                <Flag size={16} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Disputes Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Active Disputes</Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setDisputeDialogOpen(true)}
                >
                  Create Dispute
                </Button>
              </Box>

              <Grid container spacing={3}>
                {disputes.map((dispute) => (
                  <Grid item xs={12} md={6} key={dispute.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1">
                            {dispute.contact?.displayName || 'Unknown'}
                          </Typography>
                          <Chip
                            label={dispute.status}
                            size="small"
                            color={
                              dispute.status === 'resolved' ? 'success' :
                              dispute.status === 'pending' ? 'warning' :
                              'default'
                            }
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Disputing {dispute.items?.length || 0} items
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          {dispute.bureau?.map(b => (
                            <Chip key={b} label={b} size="small" variant="outlined" />
                          ))}
                        </Stack>

                        <LinearProgress 
                          variant="determinate" 
                          value={dispute.status === 'resolved' ? 100 : 50} 
                          sx={{ mt: 2 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Analysis Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Score Distribution</Typography>
                    <Grid container spacing={2}>
                      {statistics.scoreDistribution.map((item) => (
                        <Grid item xs={12} key={item.range}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ width: 80 }}>
                              {item.range.charAt(0).toUpperCase() + item.range.slice(1)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={item.percentage}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">
                              {item.count}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Bureau Comparison</Typography>
                    <List dense>
                      {Object.entries(statistics.bureauComparison).map(([bureau, data]) => (
                        <ListItem key={bureau}>
                          <ListItemText
                            primary={bureau.charAt(0).toUpperCase() + bureau.slice(1)}
                            secondary={`Avg Score: ${data.avg || '--'}`}
                          />
                          <Typography variant="h6" color={getScoreColor(data.avg)}>
                            {data.avg || '--'}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Common Issues</Typography>
                    <Grid container spacing={2}>
                      {negativeItemTypes.map((item) => (
                        <Grid item xs={12} md={4} key={item.id}>
                          <Card variant="outlined">
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <item.icon size={24} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Found in {Math.floor(Math.random() * 10)} reports
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Simulator Tab */}
          {tabValue === 3 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Use the score simulator to see potential improvements based on different actions
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Current Score</Typography>
                    <Box sx={{ textAlign: 'center', my: 3 }}>
                      <Typography variant="h2" fontWeight={600} color={getScoreColor(650)}>
                        650
                      </Typography>
                      <Chip label="Fair" sx={{ mt: 1 }} />
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>Simulate Actions:</Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Pay off all collections (+30 points)"
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Reduce utilization to 30% (+25 points)"
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Dispute errors (+20 points)"
                      />
                      <FormControlLabel
                        control={<Checkbox />}
                        label="Become authorized user (+15 points)"
                      />
                    </FormGroup>

                    <Button variant="contained" fullWidth sx={{ mt: 3 }}>
                      Calculate New Score
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Projected Score</Typography>
                    <Box sx={{ textAlign: 'center', my: 3 }}>
                      <Typography variant="h2" fontWeight={600} color={getScoreColor(740)}>
                        740
                      </Typography>
                      <Chip label="Good" color="success" sx={{ mt: 1 }} />
                    </Box>

                    <Alert severity="success">
                      <Typography variant="body2">
                        Potential improvement: +90 points
                      </Typography>
                    </Alert>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Benefits of improved score:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
                          <ListItemText primary="Lower interest rates" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
                          <ListItemText primary="Higher credit limits" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
                          <ListItemText primary="Better loan terms" />
                        </ListItem>
                      </List>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Import Report Dialog */}
        <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Import Credit Report</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(option) => option.displayName || ''}
                  value={reportForm.contact}
                  onChange={(e, value) => setReportForm(prev => ({ ...prev, contact: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Client" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Bureau</InputLabel>
                  <Select
                    value={reportForm.bureau}
                    onChange={(e) => setReportForm(prev => ({ ...prev, bureau: e.target.value }))}
                  >
                    <MenuItem value="equifax">Equifax</MenuItem>
                    <MenuItem value="experian">Experian</MenuItem>
                    <MenuItem value="transunion">TransUnion</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Report Date"
                  value={reportForm.reportDate}
                  onChange={(date) => setReportForm(prev => ({ ...prev, reportDate: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Credit Scores</Typography>
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  label="Equifax Score"
                  type="number"
                  fullWidth
                  value={reportForm.scores.equifax}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    scores: { ...prev.scores, equifax: parseInt(e.target.value) || 0 }
                  }))}
                />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  label="Experian Score"
                  type="number"
                  fullWidth
                  value={reportForm.scores.experian}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    scores: { ...prev.scores, experian: parseInt(e.target.value) || 0 }
                  }))}
                />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  label="TransUnion Score"
                  type="number"
                  fullWidth
                  value={reportForm.scores.transunion}
                  onChange={(e) => setReportForm(prev => ({ 
                    ...prev, 
                    scores: { ...prev.scores, transunion: parseInt(e.target.value) || 0 }
                  }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  You can upload the full report PDF or manually enter details
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleImportReport}>
              Import Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Dispute Dialog */}
        <Dialog open={disputeDialogOpen} onClose={() => setDisputeDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Dispute</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(option) => option.displayName || ''}
                  value={disputeForm.contact || selectedContact}
                  onChange={(e, value) => setDisputeForm(prev => ({ ...prev, contact: value }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Client" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Bureaus
                </Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={disputeForm.bureau.includes('equifax')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDisputeForm(prev => ({ ...prev, bureau: [...prev.bureau, 'equifax'] }));
                          } else {
                            setDisputeForm(prev => ({ ...prev, bureau: prev.bureau.filter(b => b !== 'equifax') }));
                          }
                        }}
                      />
                    }
                    label="Equifax"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={disputeForm.bureau.includes('experian')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDisputeForm(prev => ({ ...prev, bureau: [...prev.bureau, 'experian'] }));
                          } else {
                            setDisputeForm(prev => ({ ...prev, bureau: prev.bureau.filter(b => b !== 'experian') }));
                          }
                        }}
                      />
                    }
                    label="Experian"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={disputeForm.bureau.includes('transunion')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDisputeForm(prev => ({ ...prev, bureau: [...prev.bureau, 'transunion'] }));
                          } else {
                            setDisputeForm(prev => ({ ...prev, bureau: prev.bureau.filter(b => b !== 'transunion') }));
                          }
                        }}
                      />
                    }
                    label="TransUnion"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Dispute Type</InputLabel>
                  <Select
                    value={disputeForm.type}
                    onChange={(e) => setDisputeForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="inaccurate">Inaccurate Information</MenuItem>
                    <MenuItem value="fraudulent">Fraudulent Account</MenuItem>
                    <MenuItem value="duplicate">Duplicate Entry</MenuItem>
                    <MenuItem value="outdated">Outdated Information</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={disputeForm.priority}
                    onChange={(e) => setDisputeForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Dispute Reason"
                  multiline
                  rows={4}
                  fullWidth
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisputeDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateDispute}>
              Create Dispute
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

export default CreditReports;