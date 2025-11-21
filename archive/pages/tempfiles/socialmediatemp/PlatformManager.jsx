// ============================================================================
// PlatformManager.jsx - SOCIAL PLATFORM MANAGER
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Link2,
  CheckCircle,
  XCircle,
  Settings,
  Trash2,
  RefreshCw,
  Key,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877f2',
    description: 'Connect your Facebook Page',
    authType: 'oauth',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#e4405f',
    description: 'Connect your Instagram Business account',
    authType: 'oauth',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: '#1da1f2',
    description: 'Connect your Twitter account',
    authType: 'oauth',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0a66c2',
    description: 'Connect your LinkedIn Page',
    authType: 'oauth',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: '#ff0000',
    description: 'Connect your YouTube Channel',
    authType: 'oauth',
  },
];

const PlatformManager = () => {
  const { currentUser } = useAuth();

  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [connectDialog, setConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [apiCredentials, setApiCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'socialMedia', 'platforms', 'connected'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const platforms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConnectedPlatforms(platforms);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setConnectDialog(true);
  };

  const handleSaveConnection = async () => {
    try {
      await addDoc(collection(db, 'socialMedia', 'platforms', 'connected'), {
        platformId: selectedPlatform.id,
        platformName: selectedPlatform.name,
        credentials: apiCredentials,
        userId: currentUser.uid,
        status: 'active',
        connectedAt: serverTimestamp(),
      });

      setConnectDialog(false);
      setApiCredentials({ apiKey: '', apiSecret: '', accessToken: '' });
    } catch (error) {
      console.error('Error connecting platform:', error);
    }
  };

  const handleDisconnect = async (connectionId) => {
    if (!confirm('Disconnect this platform?')) return;

    try {
      await deleteDoc(doc(db, 'socialMedia', 'platforms', 'connected', connectionId));
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleToggleStatus = async (connectionId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'socialMedia', 'platforms', 'connected', connectionId), {
        status: currentStatus === 'active' ? 'paused' : 'active',
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const isConnected = (platformId) => {
    return connectedPlatforms.some(p => p.platformId === platformId);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Platform Manager
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Connect Your Social Accounts</AlertTitle>
        Connect your social media platforms to start posting and managing content.
      </Alert>

      {/* Available Platforms */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Available Platforms
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const connected = isConnected(platform.id);

          return (
            <Grid item xs={12} sm={6} md={4} key={platform.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: platform.color, width: 48, height: 48 }}>
                      <Icon size={24} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{platform.name}</Typography>
                      {connected ? (
                        <Chip
                          label="Connected"
                          size="small"
                          color="success"
                          icon={<CheckCircle size={14} />}
                        />
                      ) : (
                        <Chip label="Not Connected" size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {platform.description}
                  </Typography>
                  {!connected ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Link2 />}
                      onClick={() => handleConnect(platform)}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Settings />}
                    >
                      Manage
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Connected Platforms */}
      {connectedPlatforms.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Connected Platforms
          </Typography>
          <Card>
            <List>
              {connectedPlatforms.map((connection, index) => {
                const platform = PLATFORMS.find(p => p.id === connection.platformId);
                const Icon = platform?.icon || Activity;

                return (
                  <React.Fragment key={connection.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: platform?.color }}>
                          <Icon size={20} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={connection.platformName}
                        secondary={`Connected on ${connection.connectedAt?.toDate().toLocaleDateString()}`}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={connection.status === 'active'}
                            onChange={() => handleToggleStatus(connection.id, connection.status)}
                          />
                        }
                        label={connection.status === 'active' ? 'Active' : 'Paused'}
                      />
                      <Tooltip title="Test Connection">
                        <IconButton size="small">
                          <Activity size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Disconnect">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDisconnect(connection.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < connectedPlatforms.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
        </>
      )}

      {/* Connect Dialog */}
      <Dialog open={connectDialog} onClose={() => setConnectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Connect {selectedPlatform?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
            <AlertTitle>OAuth Authentication</AlertTitle>
            You'll be redirected to {selectedPlatform?.name} to authorize access.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key (Optional)"
                type="password"
                value={apiCredentials.apiKey}
                onChange={(e) => setApiCredentials({ ...apiCredentials, apiKey: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Access Token (Optional)"
                type="password"
                value={apiCredentials.accessToken}
                onChange={(e) => setApiCredentials({ ...apiCredentials, accessToken: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveConnection}>
            Connect Platform
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformManager;