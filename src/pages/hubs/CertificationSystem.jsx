// ===================================================================
// CertificationSystem.jsx - Professional Certification Management
// ===================================================================
// Purpose: Comprehensive certification tracking and management system
// Features:
// - Available certifications catalog
// - Progress tracking for active certifications
// - Completed certifications display
// - Certification requirements and prerequisites
// - Expiration tracking and renewal reminders
// - Certificate generation and download
// - Gamification with badges and achievements
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Paper
} from '@mui/material';
import {
  Award,
  Trophy,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Download,
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// CERTIFICATION CATALOG DATA
// ===================================================================

const CERTIFICATIONS = [
  {
    id: 'crm-fundamentals',
    title: 'CRM Fundamentals',
    description: 'Master the basics of customer relationship management',
    category: 'Core',
    level: 'Beginner',
    duration: '2 hours',
    icon: BookOpen,
    color: 'blue',
    requirements: [],
    modules: ['Introduction to CRM', 'Contact Management', 'Lead Tracking', 'Basic Reporting'],
    points: 100
  },
  {
    id: 'credit-repair-specialist',
    title: 'Credit Repair Specialist',
    description: 'Comprehensive credit repair processes and compliance',
    category: 'Credit',
    level: 'Intermediate',
    duration: '8 hours',
    icon: TrendingUp,
    color: 'green',
    requirements: ['crm-fundamentals'],
    modules: ['FCRA Compliance', 'Dispute Process', 'Credit Bureaus', 'Client Communication', 'Best Practices'],
    points: 500
  },
  {
    id: 'sales-professional',
    title: 'Sales Professional',
    description: 'Advanced sales techniques and conversion strategies',
    category: 'Sales',
    level: 'Intermediate',
    duration: '6 hours',
    icon: Target,
    color: 'orange',
    requirements: ['crm-fundamentals'],
    modules: ['Lead Qualification', 'Objection Handling', 'Closing Techniques', 'Follow-up Strategies'],
    points: 400
  },
  {
    id: 'compliance-expert',
    title: 'Compliance Expert',
    description: 'Legal compliance and regulatory requirements',
    category: 'Legal',
    level: 'Advanced',
    duration: '10 hours',
    icon: Shield,
    color: 'red',
    requirements: ['crm-fundamentals', 'credit-repair-specialist'],
    modules: ['FCRA', 'FDCPA', 'State Regulations', 'Consumer Protection', 'Risk Management'],
    points: 750
  },
  {
    id: 'ai-automation-specialist',
    title: 'AI Automation Specialist',
    description: 'Leverage AI tools for enhanced productivity',
    category: 'Technology',
    level: 'Advanced',
    duration: '5 hours',
    icon: Zap,
    color: 'purple',
    requirements: ['crm-fundamentals'],
    modules: ['AI-Powered Workflows', 'Automation Setup', 'Smart Analytics', 'Integration Management'],
    points: 600
  },
  {
    id: 'team-leadership',
    title: 'Team Leadership',
    description: 'Lead and manage high-performing teams',
    category: 'Management',
    level: 'Advanced',
    duration: '12 hours',
    icon: Trophy,
    color: 'yellow',
    requirements: ['crm-fundamentals', 'sales-professional'],
    modules: ['Team Building', 'Performance Management', 'Coaching', 'Conflict Resolution', 'Strategic Planning'],
    points: 1000
  }
];

// ===================================================================
// MAIN CERTIFICATION SYSTEM COMPONENT
// ===================================================================

const CertificationSystem = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [userCertifications, setUserCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  // ===============================================================
  // LOAD USER CERTIFICATIONS
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'userCertifications'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const certs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserCertifications(certs);

      // Calculate total points
      const points = certs
        .filter(c => c.status === 'completed')
        .reduce((sum, cert) => {
          const certData = CERTIFICATIONS.find(cat => cat.id === cert.certificationId);
          return sum + (certData?.points || 0);
        }, 0);
      setTotalPoints(points);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ===============================================================
  // HELPERS
  // ===============================================================

  const getUserCert = (certId) => {
    return userCertifications.find(uc => uc.certificationId === certId);
  };

  const canStartCert = (cert) => {
    if (cert.requirements.length === 0) return true;

    return cert.requirements.every(reqId => {
      const userCert = getUserCert(reqId);
      return userCert && userCert.status === 'completed';
    });
  };

  const getCertStatus = (cert) => {
    const userCert = getUserCert(cert.id);
    if (!userCert) return 'not-started';
    return userCert.status;
  };

  const getCertProgress = (cert) => {
    const userCert = getUserCert(cert.id);
    if (!userCert) return 0;
    return userCert.progress || 0;
  };

  // ===============================================================
  // HANDLERS
  // ===============================================================

  const handleStartCertification = async (cert) => {
    if (!auth.currentUser) {
      alert('Please log in to start certifications');
      return;
    }

    if (!canStartCert(cert)) {
      alert('Please complete prerequisite certifications first');
      return;
    }

    try {
      await addDoc(collection(db, 'userCertifications'), {
        userId: auth.currentUser.uid,
        certificationId: cert.id,
        status: 'in-progress',
        progress: 0,
        startedAt: new Date().toISOString(),
        modules: cert.modules.map(m => ({ name: m, completed: false }))
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error starting certification:', error);
      alert('Failed to start certification');
    }
  };

  const handleViewDetails = (cert) => {
    setSelectedCert(cert);
    setDialogOpen(true);
  };

  const handleDownloadCertificate = (cert) => {
    alert(`Downloading certificate for ${cert.title}...`);
    // In production, generate and download PDF certificate
  };

  // ===============================================================
  // RENDER: STATS OVERVIEW
  // ===============================================================

  const renderStats = () => {
    const completed = userCertifications.filter(c => c.status === 'completed').length;
    const inProgress = userCertifications.filter(c => c.status === 'in-progress').length;
    const available = CERTIFICATIONS.length - completed - inProgress;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Trophy size={32} />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{completed}</Typography>
            <Typography variant="body2">Completed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Clock size={32} />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{inProgress}</Typography>
            <Typography variant="body2">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
            <BookOpen size={32} />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{available}</Typography>
            <Typography variant="body2">Available</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Star size={32} />
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{totalPoints}</Typography>
            <Typography variant="body2">Total Points</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER: CERTIFICATION CARD
  // ===============================================================

  const renderCertificationCard = (cert) => {
    const userCert = getUserCert(cert.id);
    const status = getCertStatus(cert);
    const progress = getCertProgress(cert);
    const canStart = canStartCert(cert);
    const Icon = cert.icon;

    const getStatusChip = () => {
      if (status === 'completed') {
        return <Chip icon={<CheckCircle size={16} />} label="Completed" color="success" size="small" />;
      }
      if (status === 'in-progress') {
        return <Chip icon={<Clock size={16} />} label="In Progress" color="primary" size="small" />;
      }
      if (!canStart) {
        return <Chip icon={<Lock size={16} />} label="Locked" color="default" size="small" />;
      }
      return <Chip label="Available" color="info" size="small" />;
    };

    return (
      <Grid item xs={12} sm={6} md={4} key={cert.id}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: !canStart && status === 'not-started' ? 0.6 : 1,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ bgcolor: `${cert.color}.main`, width: 56, height: 56 }}>
                <Icon size={32} />
              </Avatar>
              {getStatusChip()}
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="bold">
              {cert.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {cert.description}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={cert.category} size="small" />
              <Chip label={cert.level} size="small" variant="outlined" />
              <Chip icon={<Clock size={14} />} label={cert.duration} size="small" variant="outlined" />
            </Stack>

            {status === 'in-progress' && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Progress</Typography>
                  <Typography variant="body2" fontWeight="bold">{progress}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}

            {status === 'completed' && userCert?.completedAt && (
              <Alert severity="success" icon={<Trophy size={16} />} sx={{ mt: 2 }}>
                Completed {new Date(userCert.completedAt).toLocaleDateString()}
              </Alert>
            )}

            {cert.requirements.length > 0 && status === 'not-started' && (
              <Alert severity="info" icon={<Lock size={16} />} sx={{ mt: 2 }}>
                Requires: {cert.requirements.length} prerequisite(s)
              </Alert>
            )}
          </CardContent>

          <CardActions>
            <Button
              size="small"
              onClick={() => handleViewDetails(cert)}
              startIcon={<BookOpen size={16} />}
            >
              Details
            </Button>
            {status === 'completed' && (
              <Button
                size="small"
                color="success"
                onClick={() => handleDownloadCertificate(cert)}
                startIcon={<Download size={16} />}
              >
                Download
              </Button>
            )}
            {status === 'in-progress' && (
              <Button
                size="small"
                color="primary"
                variant="contained"
              >
                Continue
              </Button>
            )}
            {status === 'not-started' && canStart && (
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() => handleStartCertification(cert)}
              >
                Start
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER: DETAILS DIALOG
  // ===============================================================

  const renderDetailsDialog = () => {
    if (!selectedCert) return null;

    const Icon = selectedCert.icon;
    const canStart = canStartCert(selectedCert);
    const status = getCertStatus(selectedCert);

    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${selectedCert.color}.main`, width: 48, height: 48 }}>
              <Icon size={28} />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCert.title}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip label={selectedCert.level} size="small" />
                <Chip label={selectedCert.duration} size="small" />
                <Chip label={`${selectedCert.points} pts`} size="small" color="warning" />
              </Stack>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            {selectedCert.description}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Modules Covered
          </Typography>
          <List>
            {selectedCert.modules.map((module, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle size={20} color="#4caf50" />
                </ListItemIcon>
                <ListItemText primary={module} />
              </ListItem>
            ))}
          </List>

          {selectedCert.requirements.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Prerequisites
              </Typography>
              <List>
                {selectedCert.requirements.map((reqId) => {
                  const reqCert = CERTIFICATIONS.find(c => c.id === reqId);
                  const isCompleted = getUserCert(reqId)?.status === 'completed';
                  return (
                    <ListItem key={reqId}>
                      <ListItemIcon>
                        {isCompleted ? (
                          <CheckCircle size={20} color="#4caf50" />
                        ) : (
                          <Lock size={20} color="#999" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={reqCert?.title}
                        secondary={isCompleted ? 'Completed' : 'Not completed'}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {status === 'not-started' && canStart && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleStartCertification(selectedCert)}
              startIcon={<Target size={16} />}
            >
              Start Certification
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading certifications...</Typography>
      </Box>
    );
  }

  const availableCerts = CERTIFICATIONS.filter(cert => getCertStatus(cert) === 'not-started');
  const inProgressCerts = CERTIFICATIONS.filter(cert => getCertStatus(cert) === 'in-progress');
  const completedCerts = CERTIFICATIONS.filter(cert => getCertStatus(cert) === 'completed');

  return (
    <Box>
      {/* Stats Overview */}
      {renderStats()}

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
        >
          <Tab
            value="available"
            label={`Available (${availableCerts.length})`}
            icon={<BookOpen size={18} />}
            iconPosition="start"
          />
          <Tab
            value="in-progress"
            label={`In Progress (${inProgressCerts.length})`}
            icon={<Clock size={18} />}
            iconPosition="start"
          />
          <Tab
            value="completed"
            label={`Completed (${completedCerts.length})`}
            icon={<Trophy size={18} />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Certifications Grid */}
      <Grid container spacing={3}>
        {activeTab === 'available' && availableCerts.map(cert => renderCertificationCard(cert))}
        {activeTab === 'in-progress' && inProgressCerts.map(cert => renderCertificationCard(cert))}
        {activeTab === 'completed' && completedCerts.map(cert => renderCertificationCard(cert))}
      </Grid>

      {/* Empty State */}
      {activeTab === 'available' && availableCerts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No available certifications. Great job completing all accessible certifications!
        </Alert>
      )}
      {activeTab === 'in-progress' && inProgressCerts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No certifications in progress. Start a new certification to begin your learning journey!
        </Alert>
      )}
      {activeTab === 'completed' && completedCerts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No completed certifications yet. Start your first certification to earn achievements!
        </Alert>
      )}

      {/* Details Dialog */}
      {renderDetailsDialog()}
    </Box>
  );
};

export default CertificationSystem;
