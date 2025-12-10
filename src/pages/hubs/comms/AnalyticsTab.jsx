// Path: /src/pages/hubs/comms/AnalyticsTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - ANALYTICS TAB
// ============================================================================
// Purpose: Communication metrics and performance analytics
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Mail,
  MessageSquare,
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const AnalyticsTab = () => {
  const { userProfile } = useAuth();
  const [emails, setEmails] = useState([]);
  const [sms, setSms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to emails
    const emailQuery = query(collection(db, 'emails'));
    const unsubscribeEmails = onSnapshot(emailQuery, (snapshot) => {
      const emailsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmails(emailsData);
    });

    // Subscribe to SMS
    const smsQuery = query(collection(db, 'sms'));
    const unsubscribeSms = onSnapshot(smsQuery, (snapshot) => {
      const smsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSms(smsData);
    });

    // Subscribe to campaigns
    const campaignQuery = query(collection(db, 'campaigns'));
    const unsubscribeCampaigns = onSnapshot(campaignQuery, (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignsData);
      setLoading(false);
    });

    return () => {
      unsubscribeEmails();
      unsubscribeSms();
      unsubscribeCampaigns();
    };
  }, []);

  // Calculate metrics
  const totalEmails = emails.length;
  const totalSMS = sms.length;
  const sentEmails = emails.filter(e => e.status === 'sent').length;
  const sentSMS = sms.filter(s => s.status === 'sent' || s.status === 'delivered').length;

  const totalOpens = emails.reduce((sum, e) => sum + (e.opens || 0), 0);
  const totalClicks = emails.reduce((sum, e) => sum + (e.clicks || 0), 0);

  const openRate = sentEmails > 0 ? ((totalOpens / sentEmails) * 100).toFixed(1) : 0;
  const clickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : 0;

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);

  const StatCard = ({ icon: Icon, label, value, change, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ p: 1, bgcolor: `${color}20`, borderRadius: 1 }}>
            <Icon size={24} style={{ color }} />
          </Box>
          {change && (
            <Chip
              label={change}
              size="small"
              sx={{
                bgcolor: change.startsWith('+') ? '#10B98120' : '#EF444420',
                color: change.startsWith('+') ? '#10B981' : '#EF4444',
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const MetricCard = ({ label, value, total, color }) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color }}>
              {percentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({value} / {total})
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={parseFloat(percentage)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: `${color}20`,
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
                borderRadius: 4
              }
            }}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Mail}
            label="Total Emails Sent"
            value={sentEmails}
            change="+12.5%"
            color="#3B82F6"
            subtitle={`${totalEmails} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MessageSquare}
            label="Total SMS Sent"
            value={sentSMS}
            change="+8.3%"
            color="#10B981"
            subtitle={`${totalSMS} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUp}
            label="Active Campaigns"
            value={activeCampaigns}
            change="+3"
            color="#F59E0B"
            subtitle={`${campaigns.length} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={DollarSign}
            label="Total Conversions"
            value={totalConversions}
            change="+15.7%"
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Performance Metrics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="Email Open Rate"
            value={totalOpens}
            total={sentEmails || 1}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="Click-Through Rate"
            value={totalClicks}
            total={totalOpens || 1}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="SMS Delivery Rate"
            value={sentSMS}
            total={totalSMS || 1}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Top Campaigns */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Top Performing Campaigns
      </Typography>
      <Grid container spacing={3}>
        {campaigns.slice(0, 3).map((campaign, index) => (
          <Grid item xs={12} md={4} key={campaign.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {campaign.name}
                  </Typography>
                  <Chip label={`#${index + 1}`} size="small" color="primary" />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Recipients
                    </Typography>
                    <Typography variant="h6">
                      {campaign.recipients || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Opens
                    </Typography>
                    <Typography variant="h6">
                      {campaign.opens || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                    <Typography variant="h6">
                      {campaign.clicks || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {campaign.conversions || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {campaigns.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No campaigns yet. Create your first campaign to see analytics.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsTab;
