/**
 * CONTACT VIEW SIMULATOR
 *
 * Purpose:
 * Simulates what contacts see when they interact with Speedy Credit Repair.
 * Shows their perspective: emails, SMS, dashboard, portal, etc.
 *
 * What It Does:
 * - Renders client dashboard view
 * - Shows progress tracking
 * - Displays dispute status
 * - Shows credit score changes
 * - Simulates client portal navigation
 * - Mobile-responsive design
 *
 * Why It's Important:
 * - See exactly what clients experience
 * - Catch UX issues before launch
 * - Test mobile vs desktop views
 * - Verify client-facing content
 * - Ensure professional appearance
 *
 * Used in: WorkflowTestingSimulator contact view panel
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Description as DocumentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContactViewSimulator({
  contactState,
  serviceTier = 'standard',
  variant = 'full' // 'full' or 'mobile'
}) {
  const [activeTab, setActiveTab] = useState(0);

  // Calculate progress
  const totalItems = contactState.negativeItemCount || 10;
  const removedItems = contactState.itemsRemoved || 0;
  const progress = (removedItems / totalItems) * 100;
  const scoreImprovement = (contactState.creditScore || 580) - 580;

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: variant === 'mobile' ? 1 : 3 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#1976d2', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Speedy Credit Repair
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Welcome back, {contactState.firstName}!
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: '#1565c0', width: 56, height: 56 }}>
            {contactState.firstName?.charAt(0)}
          </Avatar>
        </Box>
      </Paper>

      {/* Credit Score Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Credit Score
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {contactState.creditScore || 580}
                  </Typography>
                  {scoreImprovement > 0 && (
                    <Chip
                      icon={<TrendingUpIcon />}
                      label={`+${scoreImprovement} points`}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
                <CreditCardIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.3 }} />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Goal: 700
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.min(100, ((contactState.creditScore || 580) / 700) * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, ((contactState.creditScore || 580) / 700) * 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Negative Items
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {totalItems - removedItems}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {removedItems} removed, {totalItems - removedItems} remaining
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: '#f44336', opacity: 0.3 }} />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progress.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab label="Dashboard" />
          <Tab label="Disputes" />
          <Tab label="Documents" />
          <Tab label="Billing" />
        </Tabs>

        {/* Dashboard Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Recent Activity */}
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Dispute successful - 2 items removed"
                  secondary="Experian - 2 days ago"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Dispute in progress"
                  secondary="TransUnion - 15 days remaining"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <DocumentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="New dispute letters sent"
                  secondary="All 3 bureaus - 5 days ago"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Next Steps */}
            <Typography variant="h6" gutterBottom>
              Your Next Steps
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Action Required: Review Your Dispute Results
              </Typography>
              <Typography variant="body2">
                We received responses from 2 bureaus. Click below to review.
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                Review Results
              </Button>
            </Alert>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Monthly Strategy Call Scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thursday, December 12 at 2:00 PM
                </Typography>
                <Typography variant="body2" paragraph>
                  Christopher will call you to review progress and plan next month's strategy.
                </Typography>
                <Button variant="contained" size="small">
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Disputes Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Disputes
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Creditor</TableCell>
                    <TableCell>Bureau</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Days Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Capital One</TableCell>
                    <TableCell>Experian</TableCell>
                    <TableCell>
                      <Chip label="In Progress" color="warning" size="small" />
                    </TableCell>
                    <TableCell>15 days</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Chase Bank</TableCell>
                    <TableCell>TransUnion</TableCell>
                    <TableCell>
                      <Chip label="Under Review" color="info" size="small" />
                    </TableCell>
                    <TableCell>12 days</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Medical Collection</TableCell>
                    <TableCell>Equifax</TableCell>
                    <TableCell>
                      <Chip label="Removed!" color="success" size="small" />
                    </TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Completed Disputes
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Discover Card - Late payment removed"
                  secondary="All 3 bureaus - Completed 12/1/2025"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="AT&T Collection - Account removed"
                  secondary="Experian, TransUnion - Completed 11/28/2025"
                />
              </ListItem>
            </List>
          </Box>
        )}

        {/* Documents Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Documents
            </Typography>

            <List>
              <ListItem button>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Service Agreement"
                  secondary="Signed 11/15/2025"
                />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="IDIQ Credit Report"
                  secondary="Updated 12/1/2025"
                />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dispute Letters - December 2025"
                  secondary="Sent to all 3 bureaus"
                />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <DocumentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Bureau Responses - November 2025"
                  secondary="2 items removed"
                />
              </ListItem>
            </List>
          </Box>
        )}

        {/* Billing Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Billing Information
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Plan
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {serviceTier === 'diy' ? 'DIY Credit Builder' :
                       serviceTier === 'standard' ? 'Standard Tier' :
                       serviceTier === 'acceleration' ? 'Acceleration Tier' :
                       serviceTier === 'premium' ? 'Premium Tier' : 'VIP Elite'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${serviceTier === 'diy' ? '49' :
                        serviceTier === 'standard' ? '179' :
                        serviceTier === 'acceleration' ? '249' :
                        serviceTier === 'premium' ? '349' : '599'}/month
                    </Typography>
                  </Box>
                  <Button variant="outlined">Change Plan</Button>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>December 1, 2025</TableCell>
                    <TableCell>$179.00</TableCell>
                    <TableCell>
                      <Chip label="Paid" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Download</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>November 1, 2025</TableCell>
                    <TableCell>$179.00</TableCell>
                    <TableCell>
                      <Chip label="Paid" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Download</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Next payment of $179.00 due on January 1, 2026
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Support Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Call Christopher
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Talk to the owner directly
                </Typography>
                <Button variant="contained" fullWidth>
                  (555) 123-4567
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Email Support
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  We respond within 24 hours
                </Typography>
                <Button variant="outlined" fullWidth>
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
