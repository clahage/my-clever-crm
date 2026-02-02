// Path: src/components/preview/ClientPortalPreview.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLIENT PORTAL PREVIEW - "See Your Future Dashboard"
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Shows prospects a preview of what their Client Progress Portal will look
 * like once they become a client. Uses their REAL credit data to populate
 * the preview, building trust and credibility.
 * 
 * PURPOSE: Reduce skepticism, show transparency, encourage conversion
 * 
 * @version 1.0.0
 * @date February 2026
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Stack, Avatar, Chip, Alert, AlertTitle, Divider,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Fade, Zoom, Badge, useTheme
} from '@mui/material';
import {
  TrendingUp, Target, CheckCircle, Clock, Calendar,
  BarChart3, PieChart, Award, Shield, Star, Sparkles,
  FileText, Send, AlertCircle, ArrowRight, X, Eye,
  Lock, Unlock, Gift, Zap, CreditCard, DollarSign,
  Home, Car, Briefcase, Phone, Mail, User
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK TIMELINE DATA (simulated progress)
// ═══════════════════════════════════════════════════════════════════════════

const generateMockTimeline = (currentScore, negativeItems) => {
  const targetScore = Math.min(currentScore + 120, 750);
  const estimatedMonths = negativeItems > 10 ? 6 : negativeItems > 5 ? 4 : 3;
  
  return [
    {
      month: 'Month 1',
      status: 'completed',
      events: [
        'Credit analysis completed',
        'Dispute strategy created',
        `${Math.min(negativeItems, 5)} dispute letters sent`
      ],
      scoreChange: '+15 points'
    },
    {
      month: 'Month 2',
      status: 'in-progress',
      events: [
        'Bureau responses received',
        `${Math.floor(negativeItems * 0.3)} items removed`,
        'Round 2 disputes prepared'
      ],
      scoreChange: '+25 points'
    },
    {
      month: 'Month 3',
      status: 'upcoming',
      events: [
        'Additional removals expected',
        'Score optimization strategies',
        'Credit building recommendations'
      ],
      scoreChange: '+35 points'
    },
    {
      month: `Month ${estimatedMonths}`,
      status: 'target',
      events: [
        `Target score: ${targetScore}`,
        'Service completion review',
        'Long-term credit maintenance plan'
      ],
      scoreChange: `Total: +${targetScore - currentScore} points`
    }
  ];
};

// ═══════════════════════════════════════════════════════════════════════════
// SCORE GAUGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ScoreGauge = ({ currentScore, targetScore, label }) => {
  const progress = ((currentScore - 300) / 550) * 100;
  const targetProgress = ((targetScore - 300) / 550) * 100;
  
  const getScoreColor = (score) => {
    if (score < 580) return '#ef4444';
    if (score < 670) return '#f59e0b';
    if (score < 740) return '#3b82f6';
    return '#22c55e';
  };
  
  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ 
        position: 'relative', 
        width: 120, 
        height: 120, 
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background circle */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '8px solid',
          borderColor: 'grey.200'
        }} />
        {/* Progress circle */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '8px solid',
          borderColor: getScoreColor(currentScore),
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          transform: `rotate(${45 + (progress * 1.8)}deg)`,
          transition: 'transform 1s ease-out'
        }} />
        {/* Score display */}
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: getScoreColor(currentScore) }}>
            {currentScore}
          </Typography>
          {targetScore && targetScore !== currentScore && (
            <Typography variant="caption" color="success.main">
              → {targetScore}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ClientPortalPreview = ({
  open,
  onClose,
  contactData = {},
  onBecomeClient  // Callback when "Become a Client" is clicked
}) => {
  const theme = useTheme();
  
  // ═════════════════════════════════════════════════════════════════════════
  // EXTRACT REAL DATA FROM CONTACT
  // ═════════════════════════════════════════════════════════════════════════
  
  const idiqData = contactData.idiqEnrollment || {};
  const currentScore = idiqData.creditScore || contactData.creditScore || 580;
  const negativeItems = idiqData.negativeItemCount || 5;
  const inquiries = idiqData.inquiryCount || 3;
  const accountCount = idiqData.accountCount || 10;
  
  // Calculate projections
  const targetScore = Math.min(currentScore + 120, 750);
  const estimatedRemovals = Math.floor(negativeItems * 0.7);
  const estimatedMonths = negativeItems > 10 ? 6 : negativeItems > 5 ? 4 : 3;
  
  const timeline = useMemo(() => 
    generateMockTimeline(currentScore, negativeItems),
    [currentScore, negativeItems]
  );
  
  const progressPercent = 0; // Starting point for preview
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '95vh',
          overflow: 'hidden'
        }
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        color: 'white',
        position: 'relative'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Eye size={24} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                🔮 Preview: Your Personal Credit Dashboard
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                This is what your progress portal will look like as a Speedy Credit Repair client
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </Stack>
        
        {/* Preview Badge */}
        <Chip
          label="PREVIEW MODE"
          color="warning"
          size="small"
          sx={{ position: 'absolute', top: 12, right: 60 }}
        />
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: 'grey.100' }}>
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SIMULATED DASHBOARD */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        
        <Box sx={{ p: 3 }}>
          {/* Welcome Bar */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {contactData.firstName?.[0] || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Welcome back, {contactData.firstName || 'Client'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your credit journey started: <em>(after you become a client)</em>
                  </Typography>
                </Box>
              </Stack>
              <Chip 
                icon={<Sparkles size={16} />}
                label="Active Client"
                color="success"
              />
            </Stack>
          </Paper>
          
          {/* Score Cards Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Current Score */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <ScoreGauge 
                  currentScore={currentScore} 
                  targetScore={targetScore}
                  label="Your Current Score"
                />
                <Chip 
                  label={currentScore < 580 ? 'Very Poor' : currentScore < 670 ? 'Fair' : 'Good'}
                  color={currentScore < 580 ? 'error' : currentScore < 670 ? 'warning' : 'success'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            
            {/* Progress */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="overline" color="text.secondary">
                  Overall Progress
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(#22c55e 0% ${progressPercent}%, #e5e7eb ${progressPercent}% 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h4" fontWeight="bold">
                        {progressPercent}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ready to start your journey!
                </Typography>
              </Paper>
            </Grid>
            
            {/* Target */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'success.50' }}>
                <Typography variant="overline" color="text.secondary">
                  Your Target Score
                </Typography>
                <Typography variant="h2" fontWeight="bold" color="success.main" sx={{ my: 1 }}>
                  {targetScore}+
                </Typography>
                <Chip 
                  icon={<Target size={16} />}
                  label={`Est. ${estimatedMonths} months`}
                  color="success"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  +{targetScore - currentScore} point improvement
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Stats Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <AlertCircle size={24} color="#ef4444" />
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {negativeItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Negative Items Found
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Send size={24} color="#3b82f6" />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disputes Sent
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <CheckCircle size={24} color="#22c55e" />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {estimatedRemovals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Est. Items Removed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Calendar size={24} color="#7c3aed" />
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {estimatedMonths}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Months to Target
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Timeline Preview */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📅 Your Projected Timeline
            </Typography>
            <Grid container spacing={2}>
              {timeline.map((item, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%',
                      borderColor: item.status === 'target' ? 'success.main' : 'divider',
                      bgcolor: item.status === 'target' ? 'success.50' : 'transparent',
                      opacity: item.status === 'upcoming' || item.status === 'target' ? 0.8 : 1
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.month}
                        </Typography>
                        <Chip 
                          label={item.scoreChange}
                          size="small"
                          color={item.status === 'target' ? 'success' : 'default'}
                        />
                      </Stack>
                      <Stack spacing={0.5}>
                        {item.events.map((event, i) => (
                          <Typography key={i} variant="caption" color="text.secondary">
                            • {event}
                          </Typography>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          {/* What's Included */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ✨ What You'll Get as a Client
            </Typography>
            <Grid container spacing={2}>
              {[
                { icon: <BarChart3 size={20} />, title: 'Real-Time Progress Tracking', desc: 'Watch your score improve' },
                { icon: <FileText size={20} />, title: 'Dispute Letter Tracking', desc: 'See every letter sent on your behalf' },
                { icon: <Shield size={20} />, title: 'Bureau Response Monitoring', desc: 'Track responses from all 3 bureaus' },
                { icon: <Star size={20} />, title: 'Achievement Badges', desc: 'Celebrate your milestones' },
                { icon: <Phone size={20} />, title: 'Direct Expert Access', desc: 'Call Chris directly: (888) 724-7344' },
                { icon: <Gift size={20} />, title: 'Credit Building Tips', desc: 'Personalized recommendations' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER CTA */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <DialogActions sx={{ 
        p: 3, 
        bgcolor: 'white', 
        borderTop: 1, 
        borderColor: 'divider',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            This preview uses your actual credit data. Ready to make it real?
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} variant="outlined">
            Close Preview
          </Button>
          <Button 
            variant="contained" 
            color="success"
            size="large"
            endIcon={<ArrowRight size={20} />}
            onClick={() => {
              onClose();
              if (onBecomeClient) onBecomeClient();
            }}
          >
            Become a Client & Track My Progress
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ClientPortalPreview;