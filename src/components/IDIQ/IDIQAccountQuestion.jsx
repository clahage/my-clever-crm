// Path: src/components/idiq/IDIQAccountQuestion.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IDIQ ACCOUNT QUESTION - PRE-ENROLLMENT FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Asks if prospect already has an IDIQ account before starting enrollment.
 * - If YES: Provides option to link existing account or cancel/switch
 * - If NO: Offers free credit report with no obligation
 * 
 * @version 1.0.0
 * @date February 2026
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  CardActionArea, Stack, Avatar, Chip, Alert, AlertTitle,
  Divider, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress
} from '@mui/material';
import {
  User, UserCheck, Gift, Shield, CreditCard, CheckCircle,
  XCircle, AlertTriangle, ArrowRight, Lock, Sparkles,
  Phone, Mail, ExternalLink, FileCheck, DollarSign,
  TrendingUp, Clock, Award, Heart
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const IDIQAccountQuestion = ({
  onHasAccount,      // Callback when user has existing account
  onNoAccount,       // Callback when user needs new account (free report)
  onSkip,            // Callback to skip this step
  contactData = {}   // Pre-filled contact data
}) => {
  // ═════════════════════════════════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  const [selection, setSelection] = useState(null); // 'yes', 'no', or null
  const [showExistingAccountDialog, setShowExistingAccountDialog] = useState(false);
  const [existingAccountInfo, setExistingAccountInfo] = useState({
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  
  // ═════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleYesClick = () => {
    setSelection('yes');
    setShowExistingAccountDialog(true);
  };
  
  const handleNoClick = () => {
    setSelection('no');
  };
  
  const handleProceedWithFreeReport = () => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      if (onNoAccount) onNoAccount();
    }, 500);
  };
  
  const handleExistingAccountSubmit = () => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      setShowExistingAccountDialog(false);
      if (onHasAccount) onHasAccount(existingAccountInfo);
    }, 500);
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: INITIAL QUESTION
  // ═════════════════════════════════════════════════════════════════════════
  
  if (!selection) {
    return (
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'primary.main',
            mx: 'auto',
            mb: 2
          }}>
            <CreditCard size={40} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Let's Check Your Credit
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Do you currently have an IdentityIQ account?
          </Typography>
        </Box>
        
        {/* Selection Cards */}
        <Grid container spacing={3}>
          {/* YES - Has Account */}
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 3
                }
              }}
            >
              <CardActionArea onClick={handleYesClick} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                    <UserCheck size={32} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Yes, I Have an Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    I already subscribe to IdentityIQ credit monitoring
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    endIcon={<ArrowRight size={18} />}
                  >
                    Link My Account
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          
          {/* NO - Needs Account */}
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                borderColor: 'success.light',
                bgcolor: 'success.50',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'success.main',
                  boxShadow: 3
                }
              }}
            >
              <CardActionArea onClick={handleNoClick} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Chip 
                    label="RECOMMENDED" 
                    color="success" 
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  />
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                    <Gift size={32} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    No, I Don't Have One
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get a FREE credit report with scores from all 3 bureaus!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="success"
                    sx={{ mt: 2 }}
                    endIcon={<Sparkles size={18} />}
                  >
                    Get Free Report
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
        
        {/* Skip Option */}
        {onSkip && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="text" color="inherit" onClick={onSkip}>
              Skip for now
            </Button>
          </Box>
        )}
      </Paper>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: NO ACCOUNT - FREE REPORT OFFER
  // ═════════════════════════════════════════════════════════════════════════
  
  if (selection === 'no') {
    return (
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'success.main',
            mx: 'auto',
            mb: 2
          }}>
            <Gift size={40} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="success.main">
            🎉 Your Free Credit Report Awaits!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Speedy Credit Repair is offering you a completely free credit report
          </Typography>
        </Box>
        
        {/* Benefits Grid */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      All 3 Bureau Scores
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Experian, Equifax & TransUnion
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Shield size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      No Harm to Your Credit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Soft pull - no inquiry on your report
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CreditCard size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      No Credit Card Required
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No payment information needed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Lock size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      No Obligation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check out our services risk-free
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <XCircle size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      No Cancellation Needed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nothing to cancel if you don't proceed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Clock size={24} color="#22c55e" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Instant Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      See your scores in minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
        
        {/* Expert Review Notice */}
        <Alert 
          severity="info" 
          icon={<User size={24} />}
          sx={{ mb: 3 }}
        >
          <AlertTitle>Personal Expert Review</AlertTitle>
          Once your report is pulled, <strong>Chris Lahage</strong> (30 years credit repair experience, 
          current Finance Director at one of Toyota's top franchises) will personally review your 
          credit profile and provide customized recommendations.
        </Alert>
        
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="outlined"
            onClick={() => setSelection(null)}
          >
            Go Back
          </Button>
          <Button 
            variant="contained" 
            color="success"
            size="large"
            onClick={handleProceedWithFreeReport}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={20} /> : <ArrowRight size={20} />}
          >
            {loading ? 'Processing...' : 'Get My Free Report'}
          </Button>
        </Stack>
      </Paper>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: EXISTING ACCOUNT DIALOG
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <>
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>Processing...</Typography>
      </Paper>
      
      <Dialog 
        open={showExistingAccountDialog} 
        onClose={() => {
          setShowExistingAccountDialog(false);
          setSelection(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <UserCheck size={24} />
            </Avatar>
            <Box>
              <Typography variant="h6">Link Your IdentityIQ Account</Typography>
              <Typography variant="body2" color="text.secondary">
                We'll connect to your existing account for credit monitoring
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Why Link Your Account?</AlertTitle>
            Linking allows us to automatically access your credit reports so you don't have to 
            manually send us updates. This enables us to work on <strong>auto-pilot</strong> - 
            you can just watch your credit improve without needing to send us every email you receive!
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Enter your IdentityIQ account information:
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="IdentityIQ Email"
              type="email"
              fullWidth
              value={existingAccountInfo.email}
              onChange={(e) => setExistingAccountInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
            />
            <TextField
              label="Phone Number (on account)"
              fullWidth
              value={existingAccountInfo.phone}
              onChange={(e) => setExistingAccountInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </Stack>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Is your current IDIQ subscription through another provider?
          </Typography>
          
          <Alert severity="warning" sx={{ mt: 1 }}>
            <AlertTitle>Consider Switching to Our Partner Plan</AlertTitle>
            <Typography variant="body2">
              If your current IdentityIQ subscription is not through Speedy Credit Repair, 
              you might want to consider canceling it and re-enrolling through our partner link. 
              This allows us to:
            </Typography>
            <List dense sx={{ mt: 1 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle size={16} color="#22c55e" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access your reports directly through our dashboard"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle size={16} color="#22c55e" />
                </ListItemIcon>
                <ListItemText 
                  primary="Provide you with the same coverage at our partner discount rate"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle size={16} color="#22c55e" />
                </ListItemIcon>
                <ListItemText 
                  primary="Work more efficiently on your behalf"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setShowExistingAccountDialog(false);
              setSelection(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleExistingAccountSubmit}
            disabled={!existingAccountInfo.email || loading}
          >
            {loading ? 'Connecting...' : 'Link Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IDIQAccountQuestion;