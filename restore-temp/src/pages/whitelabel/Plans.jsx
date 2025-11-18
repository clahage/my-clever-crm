import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CardActions, Button, Divider, Chip, Stack } from '@mui/material';
import { CreditCard, DollarSign, Crown } from 'lucide-react';

export default function Plans() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <CreditCard size={24} />
        <Typography variant="h5">White Label — Plans & Billing</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Subscription plans, usage limits, and add-ons.</Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {[
            { name: 'Starter', price: '$49/mo', badge: null },
            { name: 'Pro', price: '$149/mo', badge: 'Popular' },
            { name: 'Enterprise', price: 'Custom', badge: <Crown size={16}/> },
          ].map((p) => (
            <Grid item xs={12} md={4} key={p.name}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography color="text.secondary">{p.price}</Typography>
                </CardContent>
                <CardActions>
                  <Button disabled>Configure</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip icon={<DollarSign size={16} />} label="Stripe (recommended)" />
        </Stack>
      </Paper>
    </Box>
  );
}
