import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Stack, Chip, Divider } from '@mui/material';
import { Users, Calendar, Bell, ClipboardList } from 'lucide-react';

export default function EmployeeApp() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Users size={24} />
        <Typography variant="h5">Employee App</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Field-friendly app for staff productivity.</Typography>
        <Divider sx={{ my: 2 }} />

        <List dense>
          <ListItem><ListItemText primary="Tasks & checklists" /></ListItem>
          <ListItem><ListItemText primary="Calendar & appointments" /></ListItem>
          <ListItem><ListItemText primary="Push notifications" /></ListItem>
          <ListItem><ListItemText primary="Leads intake & quick notes" /></ListItem>
        </List>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip icon={<Calendar size={16} />} label="Calendar" />
          <Chip icon={<Bell size={16} />} label="Push" />
          <Chip icon={<ClipboardList size={16} />} label="Tasks" />
        </Stack>
      </Paper>
    </Box>
  );
}
