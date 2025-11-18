// ============================================================================
// MobileAPIConfiguration.jsx - Mobile API Configuration Component
// ============================================================================

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Settings, Save } from 'lucide-react';

const MobileAPIConfiguration = ({ onComplete }) => {
  const [config, setConfig] = useState({
    apiBaseUrl: '',
    apiKey: '',
    timeout: 30000,
  });

  const handleSave = () => {
    // Save configuration
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Settings className="w-6 h-6 text-blue-500" />
          <Typography variant="h5" fontWeight="bold">
            Mobile API Configuration
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Configure mobile API settings and endpoints
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Base URL"
              value={config.apiBaseUrl}
              onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
              placeholder="https://api.example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Timeout (ms)"
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Configuration
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MobileAPIConfiguration;
