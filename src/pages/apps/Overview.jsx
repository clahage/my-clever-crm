import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Stack, Chip, Divider } from '@mui/material';
import { Smartphone, Info, Users, User, Handshake } from 'lucide-react';

export default function AppsOverview() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Smartphone size={24} />
        <Typography variant="h5">Mobile Apps — Overview</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Coming Soon — Companion apps for employees, clients, and affiliates (iOS & Android).
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {[
            { title: 'Employee App', icon: <Users size={18} />, desc: 'Tasks, notifications, appointments, leads.' },
            { title: 'Client App', icon: <User size={18} />, desc: 'Dispute status, documents, secure messages, payments.' },
            { title: 'Affiliate App', icon: <Handshake size={18} />, desc: 'Referrals, payouts, marketing assets.' },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.icon}
                    <Typography variant="subtitle1">{item.title}</Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip icon={<Info size={16} />} label="Capacitor/Expo (recommended)" />
        </Stack>
      </Paper>
    </Box>
  );
}
