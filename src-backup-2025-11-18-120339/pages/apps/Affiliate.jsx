import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Stack, Chip, Divider } from '@mui/material';
import { Handshake, DollarSign, BarChart3 } from 'lucide-react';

export default function AffiliateApp() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Handshake size={24} />
        <Typography variant="h5">Affiliate App</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Referral tracking & payouts.</Typography>
        <Divider sx={{ my: 2 }} />

        <List dense>
          <ListItem><ListItemText primary="Lead submission & tracking" /></ListItem>
          <ListItem><ListItemText primary="Payouts & history" /></ListItem>
          <ListItem><ListItemText primary="Marketing assets & links" /></ListItem>
          <ListItem><ListItemText primary="Team downline view (optional)" /></ListItem>
        </List>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip icon={<DollarSign size={16} />} label="Payouts" />
          <Chip icon={<BarChart3 size={16} />} label="Reporting" />
        </Stack>
      </Paper>
    </Box>
  );
}
