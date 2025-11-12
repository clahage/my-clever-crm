import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Stack, Chip, Divider, Alert } from '@mui/material';
import { Globe, Shield, Link as LinkIcon } from 'lucide-react';

export default function Domains() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Globe size={24} />
        <Typography variant="h5">White Label — Domains</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Custom domains & subdomains per tenant.</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          DNS verification flow will use TXT records. Optional managed SSL via Firebase Hosting.
        </Alert>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Planned</Typography>
        <List dense>
          <ListItem><ListItemText primary="Add domain → Verify → Assign to tenant" /></ListItem>
          <ListItem><ListItemText primary="Automatic HTTPS (managed certs) where possible" /></ListItem>
          <ListItem><ListItemText primary="Redirects / vanity links" /></ListItem>
        </List>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip icon={<Shield size={16} />} label="HTTPS" />
          <Chip icon={<LinkIcon size={16} />} label="Tenant routing" />
        </Stack>
      </Paper>
    </Box>
  );
}
