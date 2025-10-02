// src/components/InitializeDisputeSystem.jsx
// One-time setup component - Add this temporarily to your Settings page
import React, { useState } from 'react';
import { 
  Button, 
  Alert, 
  AlertTitle, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  FileText,
  Settings,
  Lock,
  Send,
  Clock,
  Shield
} from 'lucide-react';
import { runInitialization } from '../utils/initializeCollections';

const InitializeDisputeSystem = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('ready'); // ready, running, success, error
  const [initialized, setInitialized] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    setStatus('running');
    
    try {
      await runInitialization();
      setStatus('success');
      setInitialized(true);
      
      // Save to localStorage to remember initialization
      localStorage.setItem('disputeSystemInitialized', 'true');
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Check if already initialized
  React.useEffect(() => {
    if (localStorage.getItem('disputeSystemInitialized') === 'true') {
      setInitialized(true);
      setStatus('success');
    }
  }, []);

  const collections = [
    { name: 'disputeTemplates', icon: <FileText size={20} />, description: 'Letter templates library' },
    { name: 'disputeLetters', icon: <Send size={20} />, description: 'Saved dispute letters' },
    { name: 'disputeHistory', icon: <Clock size={20} />, description: 'Dispute tracking history' },
    { name: 'disputeResponses', icon: <FileText size={20} />, description: 'Bureau responses' },
    { name: 'permissions', icon: <Lock size={20} />, description: 'User permissions' },
    { name: 'settings', icon: <Settings size={20} />, description: 'System settings' },
    { name: 'automationRules', icon: <Shield size={20} />, description: 'Automation rules' },
    { name: 'mailingQueue', icon: <Send size={20} />, description: 'Mail processing queue' }
  ];

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Database size={32} color="#1976d2" />
          <Typography variant="h5" component="h2">
            Initialize Dispute System
          </Typography>
        </Box>

        {status === 'ready' && !initialized && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>One-Time Setup Required</AlertTitle>
              This will create all necessary Firebase collections for the Dispute Letter System.
            </Alert>

            <Typography variant="subtitle1" gutterBottom>
              Collections to be created:
            </Typography>
            
            <List dense>
              {collections.map((collection) => (
                <ListItem key={collection.name}>
                  <ListItemIcon>{collection.icon}</ListItemIcon>
                  <ListItemText
                    primary={collection.name}
                    secondary={collection.description}
                  />
                  {initialized && (
                    <CheckCircle size={20} color="green" />
                  )}
                </ListItem>
              ))}
            </List>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : <PlayCircle />}
              onClick={handleInitialize}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Creating Collections...' : 'Initialize Dispute System'}
            </Button>
          </>
        )}

        {status === 'running' && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Creating Collections...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <AlertTitle>Success!</AlertTitle>
            All collections have been created successfully. The Dispute System is ready to use!
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                href="/dispute-letters"
              >
                Go to Dispute Letters
              </Button>
            </Box>
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Error</AlertTitle>
            Failed to create collections. Please check the console for details and try again.
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleInitialize}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        )}

        {initialized && status !== 'running' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <AlertTitle>System Already Initialized</AlertTitle>
            The Dispute System has already been set up and is ready to use.
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Collections Created" 
                color="success" 
                icon={<CheckCircle size={16} />}
              />
            </Box>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InitializeDisputeSystem;