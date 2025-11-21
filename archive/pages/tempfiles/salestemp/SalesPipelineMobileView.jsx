// ============================================
// SALES PIPELINE MOBILE VIEW
// Path: /src/components/mobile/SalesPipelineMobileView.jsx
// ============================================
// Mobile-optimized sales pipeline interface
// Swipe gestures, touch-friendly, voice notes
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Button,
  Drawer,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Phone,
  Mail,
  MessageSquare,
  Mic,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  DollarSign,
  Calendar,
  User,
  ChevronRight,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// ============================================
// MAIN COMPONENT
// ============================================

const SalesPipelineMobileView = () => {
  // ===== STATE =====
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // ===== REFS =====
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const recordingInterval = useRef(null);

  // ===== STAGES =====
  const stages = [
    { id: 'all', label: 'All Deals', color: '#6b7280' },
    { id: 'new', label: 'New', color: '#3b82f6' },
    { id: 'contacted', label: 'Contacted', color: '#8b5cf6' },
    { id: 'qualified', label: 'Qualified', color: '#f59e0b' },
    { id: 'proposal', label: 'Proposal', color: '#ec4899' },
    { id: 'negotiation', label: 'Negotiation', color: '#10b981' },
    { id: 'closing', label: 'Closing', color: '#06b6d4' },
  ];

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, selectedStage, searchQuery]);

  const loadDeals = async () => {
    console.log('📱 Loading deals for mobile view');
    setLoading(true);

    try {
      const dealsRef = collection(db, 'deals');
      const q = query(
        dealsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const dealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDeals(dealsData);
      console.log('✅ Loaded', dealsData.length, 'deals');
    } catch (error) {
      console.error('❌ Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = [...deals];

    // Filter by stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === selectedStage);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.name?.toLowerCase().includes(query) ||
        deal.contactName?.toLowerCase().includes(query) ||
        deal.company?.toLowerCase().includes(query)
      );
    }

    setFilteredDeals(filtered);
  };

  // ============================================
  // TOUCH HANDLERS
  // ============================================

  const handleTouchStart = (e, deal) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwipeDirection(null);
  };

  const handleTouchMove = (e, deal) => {
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Determine if horizontal swipe (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        setSwipeDirection('right');
      } else {
        setSwipeDirection('left');
      }
    }
  };

  const handleTouchEnd = async (e, deal) => {
    if (swipeDirection === 'right') {
      // Swipe right: Move to next stage
      await moveToNextStage(deal);
    } else if (swipeDirection === 'left') {
      // Swipe left: Move to previous stage
      await moveToPreviousStage(deal);
    }
    
    setSwipeDirection(null);
  };

  const moveToNextStage = async (deal) => {
    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closing'];
    const currentIndex = stageOrder.indexOf(deal.stage);
    
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      await updateDealStage(deal.id, nextStage);
    }
  };

  const moveToPreviousStage = async (deal) => {
    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closing'];
    const currentIndex = stageOrder.indexOf(deal.stage);
    
    if (currentIndex > 0) {
      const prevStage = stageOrder[currentIndex - 1];
      await updateDealStage(deal.id, prevStage);
    }
  };

  const updateDealStage = async (dealId, newStage) => {
    console.log('📝 Updating deal stage:', dealId, 'to', newStage);

    try {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        stage: newStage,
        lastStageChange: new Date(),
      });

      // Update local state
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === dealId ? { ...deal, stage: newStage } : deal
        )
      );

      console.log('✅ Deal stage updated');
    } catch (error) {
      console.error('❌ Error updating deal stage:', error);
    }
  };

  // ============================================
  // VOICE RECORDING
  // ============================================

  const startRecording = () => {
    console.log('🎤 Starting voice recording');
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // TODO: Implement actual voice recording using MediaRecorder API
  };

  const stopRecording = () => {
    console.log('⏹️ Stopping voice recording');
    setIsRecording(false);
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    // TODO: Save and attach voice note to deal
  };

  // ============================================
  // QUICK ACTIONS
  // ============================================

  const handleCall = (deal) => {
    console.log('📞 Calling:', deal.contactPhone);
    window.location.href = `tel:${deal.contactPhone}`;
  };

  const handleEmail = (deal) => {
    console.log('📧 Emailing:', deal.contactEmail);
    window.location.href = `mailto:${deal.contactEmail}`;
  };

  const handleSMS = (deal) => {
    console.log('💬 Sending SMS to:', deal.contactPhone);
    window.location.href = `sms:${deal.contactPhone}`;
  };

  const handleViewDeal = (deal) => {
    setSelectedDeal(deal);
    setDrawerOpen(true);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderDealCard = (deal) => {
    const stage = stages.find(s => s.id === deal.stage) || stages[1];
    
    return (
      <Card
        key={deal.id}
        elevation={2}
        className="mb-3"
        sx={{
          borderLeft: `4px solid ${stage.color}`,
          transform: swipeDirection ? 
            (swipeDirection === 'right' ? 'translateX(20px)' : 'translateX(-20px)') 
            : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }}
        onTouchStart={(e) => handleTouchStart(e, deal)}
        onTouchMove={(e) => handleTouchMove(e, deal)}
        onTouchEnd={(e) => handleTouchEnd(e, deal)}
      >
        <CardContent className="py-3 px-4">
          <Box className="flex items-start justify-between mb-2">
            <Box className="flex-1" onClick={() => handleViewDeal(deal)}>
              <Typography variant="body1" className="font-semibold mb-1">
                {deal.name}
              </Typography>
              <Box className="flex items-center gap-2 flex-wrap">
                <Chip
                  size="small"
                  label={stage.label}
                  sx={{
                    bgcolor: stage.color,
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  size="small"
                  icon={<DollarSign className="w-3 h-3" />}
                  label={`$${(deal.value || 0).toLocaleString()}`}
                  color="success"
                />
              </Box>
            </Box>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: stage.color,
                fontSize: '0.875rem',
              }}
            >
              {deal.contactName?.split(' ').map(n => n[0]).join('') || '?'}
            </Avatar>
          </Box>

          <Box className="flex items-center gap-2 mt-2 mb-2">
            <User className="w-3 h-3 text-gray-600" />
            <Typography variant="caption" className="text-gray-600">
              {deal.contactName || 'Unknown'}
            </Typography>
            {deal.expectedCloseDate && (
              <>
                <Calendar className="w-3 h-3 text-gray-600 ml-2" />
                <Typography variant="caption" className="text-gray-600">
                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Box>

          {deal.winProbability && (
            <Box className="mb-2">
              <Box className="flex items-center justify-between mb-1">
                <Typography variant="caption" className="text-gray-600">
                  Win Probability
                </Typography>
                <Typography variant="caption" className="font-semibold">
                  {(deal.winProbability * 100).toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={deal.winProbability * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: stage.color,
                  },
                }}
              />
            </Box>
          )}

          <Box className="flex items-center justify-end gap-1 mt-3">
            <IconButton size="small" onClick={() => handleCall(deal)}>
              <Phone className="w-4 h-4" />
            </IconButton>
            <IconButton size="small" onClick={() => handleEmail(deal)}>
              <Mail className="w-4 h-4" />
            </IconButton>
            <IconButton size="small" onClick={() => handleSMS(deal)}>
              <MessageSquare className="w-4 h-4" />
            </IconButton>
            <IconButton size="small" onClick={() => handleViewDeal(deal)}>
              <ChevronRight className="w-4 h-4" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStageFilter = () => (
    <Box className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {stages.map(stage => (
        <Chip
          key={stage.id}
          label={stage.label}
          onClick={() => setSelectedStage(stage.id)}
          sx={{
            bgcolor: selectedStage === stage.id ? stage.color : '#f3f4f6',
            color: selectedStage === stage.id ? 'white' : '#374151',
            fontWeight: selectedStage === stage.id ? 600 : 400,
            '&:hover': {
              bgcolor: selectedStage === stage.id ? stage.color : '#e5e7eb',
            },
          }}
        />
      ))}
    </Box>
  );

  const renderDealDrawer = () => (
    <Drawer
      anchor="bottom"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        },
      }}
    >
      <Box className="p-4">
        {selectedDeal && (
          <>
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="font-semibold">
                {selectedDeal.name}
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5" />
              </IconButton>
            </Box>

            <Box className="space-y-3">
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  Contact
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {selectedDeal.contactName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" className="text-gray-600">
                  Value
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  ${(selectedDeal.value || 0).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" className="text-gray-600">
                  Expected Close Date
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {selectedDeal.expectedCloseDate ? 
                    new Date(selectedDeal.expectedCloseDate).toLocaleDateString() 
                    : 'Not set'}
                </Typography>
              </Box>

              {selectedDeal.notes && (
                <Box>
                  <Typography variant="caption" className="text-gray-600">
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedDeal.notes}
                  </Typography>
                </Box>
              )}

              <Box className="flex gap-2 mt-4">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Phone className="w-4 h-4" />}
                  onClick={() => handleCall(selectedDeal)}
                >
                  Call
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Mail className="w-4 h-4" />}
                  onClick={() => handleEmail(selectedDeal)}
                >
                  Email
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );

  const renderVoiceRecorder = () => (
    <Box
      className="fixed bottom-20 left-0 right-0 bg-red-600 text-white p-4 flex items-center justify-between"
      sx={{ display: isRecording ? 'flex' : 'none' }}
    >
      <Box className="flex items-center gap-3">
        <Box className="w-3 h-3 bg-white rounded-full animate-pulse" />
        <Typography variant="body2" className="font-semibold">
          Recording {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
        </Typography>
      </Box>
      <IconButton onClick={stopRecording} sx={{ color: 'white' }}>
        <Check className="w-5 h-5" />
      </IconButton>
    </Box>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box className="p-4">
        <LinearProgress />
        <Typography variant="body2" className="text-center mt-4 text-gray-600">
          Loading pipeline...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="pb-20">
      {/* ===== HEADER ===== */}
      <Box className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-4 border-b">
        <Box className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <Typography variant="h6" className="font-semibold">
            Sales Pipeline
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />,
          }}
        />
      </Box>

      {/* ===== STAGE FILTER ===== */}
      <Box className="p-4 pb-0">
        {renderStageFilter()}
      </Box>

      {/* ===== DEALS LIST ===== */}
      <Box className="p-4">
        {filteredDeals.length === 0 ? (
          <Alert severity="info" className="mt-4">
            No deals found
          </Alert>
        ) : (
          filteredDeals.map(deal => renderDealCard(deal))
        )}
      </Box>

      {/* ===== SPEED DIAL ===== */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Plus className="w-5 h-5" />}
          tooltipTitle="New Deal"
        />
        <SpeedDialAction
          icon={<Mic className="w-5 h-5" />}
          tooltipTitle="Voice Note"
          onClick={isRecording ? stopRecording : startRecording}
        />
        <SpeedDialAction
          icon={<Filter className="w-5 h-5" />}
          tooltipTitle="Filter"
          onClick={() => setFilterDrawerOpen(true)}
        />
      </SpeedDial>

      {/* ===== DRAWERS ===== */}
      {renderDealDrawer()}
      {renderVoiceRecorder()}

      {/* ===== SWIPE HINT ===== */}
      {filteredDeals.length > 0 && (
        <Alert severity="info" className="m-4">
          💡 Swipe right to move forward, left to move back
        </Alert>
      )}
    </Box>
  );
};

export default SalesPipelineMobileView;