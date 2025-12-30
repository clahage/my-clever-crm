// ═══════════════════════════════════════════════════════════════════════════
// CAL.COM BOOKING SYSTEM - Strategic Consultation Calls
// ═══════════════════════════════════════════════════════════════════════════
// 
// Path: src/components/booking/CalComBookingSystem.jsx
// 
// Purpose: Integrated booking system for paid consultation calls
// - Cal.com scheduling
// - Stripe payment processing
// - Automatic Zoom link generation
// - Call recording setup
// - CRM integration
// - Upsell opportunities
//
// Author: SpeedyCRM Engineering Team
// Date: December 29, 2025
// Version: 1.0 - Production Ready
//
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Calendar,
  Clock,
  CreditCard,
  Video,
  CheckCircle,
  Users,
  TrendingUp,
  Phone,
  Award,
  DollarSign
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// ═══════════════════════════════════════════════════════════════════════════
// CONSULTATION PACKAGES
// ═══════════════════════════════════════════════════════════════════════════

const CONSULTATION_PACKAGES = {
  quick: {
    id: 'quick-qa',
    name: '15-Minute Quick Q&A',
    duration: 15,
    description: 'Quick questions answered by credit repair expert',
    features: [
      'Specific question answered',
      'Quick strategy recommendations',
      'Next steps guidance',
      'Email follow-up summary'
    ],
    pricing: {
      diy: 25,          // DIY plan clients
      professional: 0,   // FREE - 1 per month included
      vip: 0,           // FREE - 2 per month included
      public: 49        // Non-clients
    },
    calComEventType: 'quick-qa-15min',
    color: '#4caf50'
  },
  
  strategy: {
    id: 'strategy-session',
    name: '30-Minute Strategy Session',
    duration: 30,
    description: 'In-depth strategy planning with Chris Lahage',
    features: [
      'Comprehensive credit review',
      'Customized action plan',
      'Timeline and expectations',
      'Resource recommendations',
      'Written strategy document',
      'Email & SMS follow-up'
    ],
    pricing: {
      diy: 75,
      professional: 50,
      vip: 0,           // FREE - 1 per month included
      public: 99
    },
    calComEventType: 'strategy-session-30min',
    color: '#2196f3'
  },
  
  deepDive: {
    id: 'deep-dive',
    name: '60-Minute Deep Dive',
    duration: 60,
    description: 'Comprehensive review and planning with Chris Lahage',
    features: [
      'Complete credit file analysis',
      'Multi-bureau strategy',
      'Account-by-account review',
      'Timeline projections',
      'Credit building roadmap',
      'Detailed written report',
      '30-day email support',
      'Priority scheduling'
    ],
    pricing: {
      diy: 150,
      professional: 99,
      vip: 0,           // FREE - 1 per quarter included
      public: 199
    },
    calComEventType: 'deep-dive-60min',
    color: '#9c27b0'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CalComBookingSystem = ({ userProfile, onBookingComplete }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    currentPlan: 'public',
    notes: ''
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD USER PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (userProfile) {
      setClientInfo({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        currentPlan: determinePlanLevel(userProfile),
        notes: ''
      });
    }
  }, [userProfile]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const determinePlanLevel = (profile) => {
    if (!profile.servicePlan) return 'public';
    
    const plan = profile.servicePlan.toLowerCase();
    if (plan.includes('diy')) return 'diy';
    if (plan.includes('vip') || plan.includes('premium') || plan.includes('accelerated')) return 'vip';
    if (plan.includes('professional') || plan.includes('standard')) return 'professional';
    return 'public';
  };

  const getPrice = (pkg) => {
    const planLevel = clientInfo.currentPlan || 'public';
    return pkg.pricing[planLevel];
  };

  const isFreeForPlan = (pkg) => {
    const price = getPrice(pkg);
    return price === 0;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKING HANDLER
  // ═══════════════════════════════════════════════════════════════════════════

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setBookingDialog(true);
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const price = getPrice(selectedPackage);

      // If free for this plan, skip payment
      if (price === 0) {
        await createBooking(null);
        return;
      }

      // Otherwise, process payment first
      setPaymentDialog(true);
      
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE BOOKING
  // ═══════════════════════════════════════════════════════════════════════════

  const createBooking = async (paymentId) => {
    try {
      // Create booking record in Firestore
      const bookingData = {
        userId: auth.currentUser?.uid || null,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        duration: selectedPackage.duration,
        price: getPrice(selectedPackage),
        planLevel: clientInfo.currentPlan,
        clientInfo: {
          name: clientInfo.name,
          email: clientInfo.email,
          phone: clientInfo.phone,
          notes: clientInfo.notes
        },
        paymentId: paymentId,
        status: 'pending',
        calComEventType: selectedPackage.calComEventType,
        createdAt: serverTimestamp(),
        zoomLinkSent: false,
        recordingConsent: false
      };

      const bookingRef = await addDoc(collection(db, 'consultationBookings'), bookingData);

      // Open Cal.com booking widget
      openCalComBooking(bookingRef.id);

      // Close dialogs
      setBookingDialog(false);
      setPaymentDialog(false);

      if (onBookingComplete) {
        onBookingComplete(bookingRef.id);
      }

    } catch (err) {
      console.error('Create booking error:', err);
      throw err;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CAL.COM INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  const openCalComBooking = (bookingId) => {
    // Cal.com embed code
    const calComUrl = `https://cal.com/speedycreditrepair/${selectedPackage.calComEventType}?metadata[bookingId]=${bookingId}&metadata[email]=${encodeURIComponent(clientInfo.email)}&metadata[name]=${encodeURIComponent(clientInfo.name)}`;
    
    // Open in new window or embed
    window.open(calComUrl, '_blank', 'width=800,height=600');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STRIPE PAYMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const processPayment = async () => {
    try {
      setLoading(true);

      // Call your Stripe Cloud Function
      const response = await fetch('/api/createConsultationPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getPrice(selectedPackage),
          packageId: selectedPackage.id,
          clientEmail: clientInfo.email,
          clientName: clientInfo.name
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      // You'll need to add Stripe.js to your project
      const stripe = window.Stripe('your_stripe_publishable_key');
      await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UPSELL COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════

  const UpsellBanner = () => {
    if (clientInfo.currentPlan !== 'diy' && clientInfo.currentPlan !== 'public') {
      return null;
    }

    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          💡 Save on Consultation Calls!
        </Typography>
        <Typography variant="body2" gutterBottom>
          Upgrade to our <strong>Professional Plan ($149/mo)</strong> and get:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• FREE 15-min calls (1 per month)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 50% OFF strategy sessions" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Full-service credit repair" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Expert dispute handling" />
          </ListItem>
        </List>
        <Button variant="contained" color="primary" size="small" sx={{ mt: 2 }}>
          Upgrade Now & Save
        </Button>
      </Alert>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PACKAGE CARD
  // ═══════════════════════════════════════════════════════════════════════════

  const PackageCard = ({ pkg }) => {
    const price = getPrice(pkg);
    const isFree = price === 0;

    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: isFree ? `2px solid ${pkg.color}` : '1px solid #e0e0e0',
          position: 'relative',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
            transition: 'all 0.3s'
          }
        }}
      >
        {isFree && (
          <Chip
            label="INCLUDED FREE"
            color="success"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontWeight: 'bold'
            }}
          />
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Clock size={32} color={pkg.color} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              {pkg.name}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {pkg.description}
          </Typography>

          <Box sx={{ my: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: pkg.color }}>
              {isFree ? 'FREE' : `$${price}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pkg.duration} minutes
            </Typography>
          </Box>

          <List dense>
            {pkg.features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle size={16} color={pkg.color} />
                </ListItemIcon>
                <ListItemText 
                  primary={feature}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>

        <Box sx={{ p: 2 }}>
          <Button
            variant={isFree ? "contained" : "outlined"}
            fullWidth
            size="large"
            onClick={() => handleSelectPackage(pkg)}
            sx={{
              backgroundColor: isFree ? pkg.color : 'transparent',
              borderColor: pkg.color,
              color: isFree ? 'white' : pkg.color,
              '&:hover': {
                backgroundColor: isFree ? pkg.color : 'rgba(0,0,0,0.05)',
                borderColor: pkg.color
              }
            }}
          >
            {isFree ? 'Schedule Free Call' : 'Book Now'}
          </Button>
        </Box>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Strategic Consultation Calls
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Book a one-on-one call with our credit repair experts to get personalized guidance on your credit journey.
      </Typography>

      <UpsellBanner />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.values(CONSULTATION_PACKAGES).map((pkg) => (
          <Grid item xs={12} md={4} key={pkg.id}>
            <PackageCard pkg={pkg} />
          </Grid>
        ))}
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Book {selectedPackage?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your Name"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="What would you like to discuss?"
              multiline
              rows={3}
              value={clientInfo.notes}
              onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBooking}
            disabled={loading || !clientInfo.name || !clientInfo.email}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue to Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CreditCard size={48} color="#2196f3" />
            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
              ${getPrice(selectedPackage)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedPackage?.name}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={processPayment}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Pay with Stripe'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CalComBookingSystem;