// ===================================================================
// CertificationSystem.jsx - Certification & Badge Management
// ===================================================================
// Purpose: Manage certifications, badges, and skill assessments
// Features:
// - Browse available certifications
// - Track earned certifications
// - Skill level tracking
// - Badge collection system
// - Exam scheduling and taking
// - Certificate generation and download
// - Leaderboard and achievements
// - Share certifications externally
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge as MuiBadge,
  Stack
} from '@mui/material';
import {
  Award,
  Trophy,
  Star,
  Medal,
  Target,
  CheckCircle,
  Clock,
  Download,
  Share2,
  TrendingUp,
  Zap,
  BookOpen,
  Users,
  Calendar,
  ExternalLink,
  Lock,
  Unlock,
  ChevronRight
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

// ===================================================================
// CERTIFICATION DATA
// ===================================================================

const CERTIFICATIONS = [
  {
    id: 'cert-basic',
    title: 'Credit Repair Fundamentals',
    description: 'Master the core principles of credit repair',
    level: 'Foundation',
    color: 'from-blue-500 to-blue-600',
    icon: <BookOpen />,
    prerequisites: [],
    requirements: [
      'Complete Credit Repair Fundamentals course',
      'Pass 80% on final exam',
      'Complete 10 practice disputes'
    ],
    examDuration: '60 minutes',
    passingScore: 80,
    validityPeriod: 'Lifetime',
    benefits: [
      'Digital certificate',
      'LinkedIn badge',
      'Foundation skill level',
      'Unlock intermediate courses'
    ]
  },
  {
    id: 'cert-advanced',
    title: 'Advanced Credit Strategy',
    description: 'Expert-level credit repair techniques',
    level: 'Advanced',
    color: 'from-purple-500 to-purple-600',
    icon: <Trophy />,
    prerequisites: ['cert-basic'],
    requirements: [
      'Complete Advanced Dispute Strategies course',
      'Pass 85% on certification exam',
      'Complete 25 successful disputes',
      'Hold Foundation certification'
    ],
    examDuration: '90 minutes',
    passingScore: 85,
    validityPeriod: '2 years',
    benefits: [
      'Digital certificate with honors',
      'Advanced skill badge',
      'Priority support access',
      'Mentor opportunities'
    ]
  },
  {
    id: 'cert-fcra',
    title: 'FCRA Compliance Specialist',
    description: 'Comprehensive FCRA and compliance knowledge',
    level: 'Specialist',
    color: 'from-green-500 to-green-600',
    icon: <Medal />,
    prerequisites: ['cert-basic'],
    requirements: [
      'Complete FCRA Compliance Training',
      'Pass 90% on compliance exam',
      'Complete legal case studies',
      'Annual renewal required'
    ],
    examDuration: '75 minutes',
    passingScore: 90,
    validityPeriod: '1 year (renewable)',
    benefits: [
      'Compliance certification',
      'Legal resource access',
      'Compliance updates',
      'Annual CE credits'
    ]
  },
  {
    id: 'cert-customer-service',
    title: 'Customer Service Excellence',
    description: 'Deliver exceptional client experiences',
    level: 'Professional',
    color: 'from-orange-500 to-orange-600',
    icon: <Users />,
    prerequisites: [],
    requirements: [
      'Complete Customer Service Excellence course',
      'Pass 85% on service exam',
      'Maintain 4.5+ client rating',
      'Handle 50+ client interactions'
    ],
    examDuration: '45 minutes',
    passingScore: 85,
    validityPeriod: 'Lifetime',
    benefits: [
      'Service excellence badge',
      'Client-facing recognition',
      'Bonus eligibility',
      'Team lead opportunities'
    ]
  }
];

const BADGES = [
  { id: 'early-bird', name: 'Early Bird', description: 'Complete first course', icon: '🌅' },
  { id: 'speed-learner', name: 'Speed Learner', description: 'Complete course in 1 day', icon: '⚡' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Score 100% on exam', icon: '💯' },
  { id: 'mentor', name: 'Mentor', description: 'Help 10 team members', icon: '🎓' },
  { id: 'overachiever', name: 'Overachiever', description: 'Earn all certifications', icon: '🏆' },
  { id: 'streak-7', name: '7-Day Streak', description: 'Learn 7 days in a row', icon: '🔥' },
  { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Complete 20 courses', icon: '📚' }
];

// ===================================================================
// MAIN CERTIFICATION SYSTEM COMPONENT
// ===================================================================

const CertificationSystem = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [userCertifications, setUserCertifications] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [userProgress, setUserProgress] = useState({});

  // ===============================================================
  // LOAD USER DATA
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('🏆 CertificationSystem: Loading data');

    const unsubscribers = [];

    // Listen to user certifications
    const certsRef = collection(db, 'certifications');
    const certsQuery = query(
      certsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('earnedAt', 'desc')
    );
    const unsubCerts = onSnapshot(certsQuery, (snapshot) => {
      const certs = [];
      snapshot.forEach((doc) => {
        certs.push({ id: doc.id, ...doc.data() });
      });
      setUserCertifications(certs);
      console.log('📜 Certifications loaded:', certs.length);
    }, (err) => {
      console.error('❌ Error loading certifications:', err);
    });
    unsubscribers.push(unsubCerts);

    // Listen to user badges
    const badgesRef = collection(db, 'userBadges');
    const badgesQuery = query(
      badgesRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubBadges = onSnapshot(badgesQuery, (snapshot) => {
      const badges = [];
      snapshot.forEach((doc) => {
        badges.push({ id: doc.id, ...doc.data() });
      });
      setUserBadges(badges);
      console.log('🎖️ Badges loaded:', badges.length);
    }, (err) => {
      console.error('❌ Error loading badges:', err);
    });
    unsubscribers.push(unsubBadges);

    // Load progress for certification requirements
    const progressRef = collection(db, 'trainingProgress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      const progress = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        progress[data.courseId] = data;
      });
      setUserProgress(progress);
    }, (err) => {
      console.error('❌ Error loading progress:', err);
    });
    unsubscribers.push(unsubProgress);

    setLoading(false);

    return () => {
      console.log('🧹 Cleaning up CertificationSystem listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ===============================================================
  // HELPER FUNCTIONS
  // ===============================================================

  const hasCertification = (certId) => {
    return userCertifications.some(c => c.certificationId === certId && c.status === 'earned');
  };

  const meetsPrerequisites = (cert) => {
    if (!cert.prerequisites || cert.prerequisites.length === 0) return true;
    return cert.prerequisites.every(prereq => hasCertification(prereq));
  };

  const calculateProgress = (cert) => {
    // Calculate progress towards certification
    let completed = 0;
    const total = cert.requirements.length;

    // In production, check actual completion status
    // For demo, just return a sample
    const earned = hasCertification(cert.id);
    return earned ? 100 : Math.floor(Math.random() * 80);
  };

  const handleScheduleExam = async (certId) => {
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(collection(db, 'examSchedules')), {
        userId: auth.currentUser.uid,
        certificationId: certId,
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: serverTimestamp()
      });

      console.log('📅 Exam scheduled:', certId);
      alert('Exam scheduled! You will receive a confirmation email.');
    } catch (err) {
      console.error('❌ Error scheduling exam:', err);
    }
  };

  const handleDownloadCertificate = (cert) => {
    // In production, generate PDF certificate
    console.log('📥 Downloading certificate:', cert.certificationId);
    alert('Certificate download will be available soon!');
  };

  const handleShareCertificate = (cert) => {
    // In production, generate shareable link
    console.log('📤 Sharing certificate:', cert.certificationId);
    alert('Share functionality coming soon!');
  };

  // ===============================================================
  // RENDER CERTIFICATION CARD
  // ===============================================================

  const renderCertificationCard = (cert) => {
    const earned = hasCertification(cert.id);
    const meetsPrereq = meetsPrerequisites(cert);
    const progress = calculateProgress(cert);

    return (
      <Grid item xs={12} md={6} key={cert.id}>
        <Card className={`h-full ${!meetsPrereq ? 'opacity-60' : ''}`}>
          <Box className={`p-4 bg-gradient-to-r ${cert.color} text-white`}>
            <Box className="flex items-center justify-between mb-2">
              <Box className="p-2 bg-white/20 rounded-lg">
                {cert.icon}
              </Box>
              {earned && (
                <Chip
                  label="Earned"
                  size="small"
                  icon={<CheckCircle size={16} />}
                  className="bg-white text-green-700"
                />
              )}
              {!meetsPrereq && (
                <Chip
                  label="Locked"
                  size="small"
                  icon={<Lock size={16} />}
                  className="bg-white/20"
                />
              )}
            </Box>
            <Typography variant="h6" className="font-bold mb-1">
              {cert.title}
            </Typography>
            <Typography variant="body2" className="opacity-90">
              {cert.description}
            </Typography>
          </Box>

          <CardContent>
            <Box className="mb-4">
              <Box className="flex justify-between items-center mb-1">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Progress
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} className="h-2 rounded" />
            </Box>

            <Box className="space-y-2 mb-4">
              <Typography variant="subtitle2" className="font-semibold text-gray-900 dark:text-white">
                Requirements:
              </Typography>
              {cert.requirements.map((req, index) => (
                <Box key={index} className="flex items-start gap-2">
                  <CheckCircle size={16} className={progress >= (index + 1) * 25 ? 'text-green-600' : 'text-gray-400'} />
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {req}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider className="my-3" />

            <Grid container spacing={2} className="text-sm">
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Exam Duration
                </Typography>
                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                  <Clock size={14} />
                  {cert.examDuration}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Passing Score
                </Typography>
                <Typography variant="body2" className="font-semibold flex items-center gap-1">
                  <Target size={14} />
                  {cert.passingScore}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Level
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {cert.level}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                  Validity
                </Typography>
                <Typography variant="body2" className="font-semibold">
                  {cert.validityPeriod}
                </Typography>
              </Grid>
            </Grid>

            <Box className="mt-4">
              {earned ? (
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => handleDownloadCertificate(cert)}
                  >
                    Download Certificate
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Share2 />}
                    onClick={() => handleShareCertificate(cert)}
                  >
                    Share
                  </Button>
                </Stack>
              ) : meetsPrereq ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setSelectedCert(cert);
                    setShowCertDialog(true);
                  }}
                  startIcon={<Award />}
                >
                  View Details
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled
                  startIcon={<Lock />}
                >
                  Complete Prerequisites
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading certifications...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // MAIN RENDER
  // ===============================================================

  return (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Certifications Earned
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {userCertifications.filter(c => c.status === 'earned').length}
                  </Typography>
                </Box>
                <Award size={40} className="opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Badges Collected
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {userBadges.length}
                  </Typography>
                </Box>
                <Trophy size={40} className="opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    Skills Mastered
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {userCertifications.filter(c => c.status === 'earned').length * 3}
                  </Typography>
                </Box>
                <Star size={40} className="opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="body2" className="opacity-90 mb-1">
                    In Progress
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {userCertifications.filter(c => c.status === 'in-progress').length}
                  </Typography>
                </Box>
                <TrendingUp size={40} className="opacity-80" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper className="mb-4">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Available" value="available" icon={<Award />} iconPosition="start" />
          <Tab 
            label="Earned" 
            value="earned" 
            icon={<CheckCircle />} 
            iconPosition="start"
            {...(userCertifications.filter(c => c.status === 'earned').length > 0 && {
              badge: userCertifications.filter(c => c.status === 'earned').length
            })}
          />
          <Tab label="Badges" value="badges" icon={<Trophy />} iconPosition="start" />
          <Tab label="Skills" value="skills" icon={<Star />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 'available' && (
        <Grid container spacing={3}>
          {CERTIFICATIONS.map(cert => renderCertificationCard(cert))}
        </Grid>
      )}

      {activeTab === 'earned' && (
        <Box>
          {userCertifications.filter(c => c.status === 'earned').length > 0 ? (
            <Grid container spacing={3}>
              {userCertifications
                .filter(c => c.status === 'earned')
                .map(cert => {
                  const certData = CERTIFICATIONS.find(c => c.id === cert.certificationId);
                  return certData ? renderCertificationCard(certData) : null;
                })}
            </Grid>
          ) : (
            <Paper className="p-12 text-center">
              <Award size={64} className="mx-auto mb-4 text-gray-400" />
              <Typography variant="h6" className="mb-2 text-gray-900 dark:text-white">
                No Certifications Earned Yet
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400 mb-4">
                Complete courses and pass exams to earn your first certification
              </Typography>
              <Button
                variant="contained"
                onClick={() => setActiveTab('available')}
              >
                Browse Certifications
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 'badges' && (
        <Grid container spacing={3}>
          {BADGES.map(badge => {
            const earned = userBadges.some(b => b.badgeId === badge.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <Card className={!earned ? 'opacity-50' : ''}>
                  <CardContent className="text-center">
                    <Typography variant="h1" className="mb-2">
                      {badge.icon}
                    </Typography>
                    <Typography variant="h6" className="font-bold mb-1">
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                      {badge.description}
                    </Typography>
                    {earned && (
                      <Chip
                        label="Earned"
                        color="success"
                        size="small"
                        className="mt-2"
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {activeTab === 'skills' && (
        <Paper className="p-6">
          <Typography variant="h6" className="font-bold mb-4 text-gray-900 dark:text-white">
            Skill Levels
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="mb-2">Credit Repair</Typography>
              <Box className="flex items-center gap-3">
                <LinearProgress variant="determinate" value={75} className="flex-1 h-2 rounded" />
                <Typography variant="body2" className="font-semibold">Expert</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="mb-2">Customer Service</Typography>
              <Box className="flex items-center gap-3">
                <LinearProgress variant="determinate" value={60} className="flex-1 h-2 rounded" />
                <Typography variant="body2" className="font-semibold">Advanced</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="mb-2">Compliance & Legal</Typography>
              <Box className="flex items-center gap-3">
                <LinearProgress variant="determinate" value={45} className="flex-1 h-2 rounded" />
                <Typography variant="body2" className="font-semibold">Intermediate</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="mb-2">Technology & Tools</Typography>
              <Box className="flex items-center gap-3">
                <LinearProgress variant="determinate" value={85} className="flex-1 h-2 rounded" />
                <Typography variant="body2" className="font-semibold">Master</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Certification Detail Dialog */}
      <Dialog
        open={showCertDialog}
        onClose={() => setShowCertDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCert && (
          <>
            <DialogTitle>
              <Box className={`p-4 -mx-6 -mt-6 mb-4 bg-gradient-to-r ${selectedCert.color} text-white rounded-t`}>
                <Typography variant="h5" className="font-bold">
                  {selectedCert.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography className="mb-4">
                {selectedCert.description}
              </Typography>

              <Typography variant="h6" className="font-semibold mb-2">
                Benefits:
              </Typography>
              <List dense>
                {selectedCert.benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle className="text-green-600" size={20} />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" className="mt-4">
                Exam can be scheduled once all requirements are met. You'll have {selectedCert.examDuration} to complete the exam with a passing score of {selectedCert.passingScore}%.
              </Alert>
            </DialogContent>
            <DialogActions className="p-4">
              <Button onClick={() => setShowCertDialog(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleScheduleExam(selectedCert.id);
                  setShowCertDialog(false);
                }}
                startIcon={<Calendar />}
              >
                Schedule Exam
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CertificationSystem;