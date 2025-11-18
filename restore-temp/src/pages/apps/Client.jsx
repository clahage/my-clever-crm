import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Stack, Chip, Divider } from '@mui/material';
import { User, FileText, ShieldCheck, MessageSquare } from 'lucide-react';

export default function ClientApp() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <User size={24} />
        <Typography variant="h5">Client App</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Transparent credit-repair experience.</Typography>
        <Divider sx={{ my: 2 }} />

        <List dense>
          <ListItem><ListItemText primary="Dispute status & progress timeline" /></ListItem>
          <ListItem><ListItemText primary="Documents & e-sign" /></ListItem>
          <ListItem><ListItemText primary="Secure messaging & alerts" /></ListItem>
          <ListItem><ListItemText primary="Billing & receipts" /></ListItem>
        </List>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip icon={<FileText size={16} />} label="E-sign" />
          <Chip icon={<ShieldCheck size={16} />} label="Secure" />
          <Chip icon={<MessageSquare size={16} />} label="Messaging" />
        </Stack>
      </Paper>
    </Box>
  );
}
