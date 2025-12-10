// Path: /src/pages/hubs/analytics/ReportsTab.jsx
// ============================================================================
// ANALYTICS HUB - CUSTOM REPORTS TAB
// ============================================================================
// Purpose: Build custom reports with templates and export functionality
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: reports
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  MoreVertical,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ReportsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'Comprehensive revenue analysis with trends',
      icon: DollarSign,
      color: 'success',
      fields: ['Total Revenue', 'Revenue by Month', 'Top Clients', 'Payment Methods']
    },
    {
      id: 'clients',
      name: 'Client Report',
      description: 'Client acquisition and retention metrics',
      icon: Users,
      color: 'primary',
      fields: ['Total Clients', 'New Clients', 'Active Clients', 'Churn Rate']
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'KPIs and goal tracking dashboard',
      icon: Target,
      color: 'info',
      fields: ['KPIs Status', 'Goals Progress', 'Team Performance', 'Trends']
    },
    {
      id: 'sales',
      name: 'Sales Funnel Report',
      description: 'Conversion funnel and sales metrics',
      icon: TrendingUp,
      color: 'warning',
      fields: ['Funnel Stages', 'Conversion Rates', 'Dropoff Analysis', 'Opportunities']
    }
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsQuery = query(collection(db, 'reports'));
      const reportsSnap = await getDocs(reportsQuery);
      const reportsData = reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleCreateReport = async (template) => {
    try {
      const newReport = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        template: template.id,
        createdBy: userProfile?.uid,
        createdAt: new Date(),
        status: 'draft'
      };

      await addDoc(collection(db, 'reports'), newReport);
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleDeleteReport = async () => {
    if (selectedReport) {
      try {
        await deleteDoc(doc(db, 'reports', selectedReport.id));
        fetchReports();
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleExportReport = (format) => {
    console.log(`Exporting report in ${format} format`);
    handleMenuClose();
  };

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* Report Templates */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Report Templates
          </Typography>
          <Chip icon={<FileText size={16} />} label={`${templates.length} Templates`} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Grid item xs={12} md={6} key={template.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${template.color}.100`,
                            color: `${template.color}.main`
                          }}
                        >
                          <Icon size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {template.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {template.fields.slice(0, 2).map((field, idx) => (
                              <Chip key={idx} label={field} size="small" variant="outlined" />
                            ))}
                            {template.fields.length > 2 && (
                              <Chip label={`+${template.fields.length - 2} more`} size="small" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Plus size={18} />}
                      onClick={() => handleCreateReport(template)}
                    >
                      Create Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Saved Reports */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Your Reports
          </Typography>
          <Chip label={`${reports.length} Reports`} />
        </Box>
        <Divider sx={{ mb: 2 }} />

        {reports.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No reports created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a template above to create your first report
            </Typography>
          </Box>
        ) : (
          <List>
            {reports.map((report, index) => (
              <React.Fragment key={report.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Play size={16} />}
                        variant="outlined"
                      >
                        Run
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download size={16} />}
                        variant="outlined"
                      >
                        Export
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, report)}
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {report.name}
                        </Typography>
                        <Chip
                          label={report.status || 'draft'}
                          size="small"
                          color={report.status === 'completed' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={14} />
                          <Typography variant="caption">
                            {report.createdAt?.toDate().toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BarChart3 size={14} />
                          <Typography variant="caption">
                            {report.template || 'Custom'}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleExportReport('PDF')}>
          <Download size={18} style={{ marginRight: 8 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportReport('Excel')}>
          <Download size={18} style={{ marginRight: 8 }} />
          Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExportReport('CSV')}>
          <Download size={18} style={{ marginRight: 8 }} />
          Export as CSV
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Edit size={18} style={{ marginRight: 8 }} />
          Edit Report
        </MenuItem>
        <MenuItem onClick={handleDeleteReport} sx={{ color: 'error.main' }}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Delete Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReportsTab;
