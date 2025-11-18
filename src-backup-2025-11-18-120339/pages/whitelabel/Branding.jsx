import React from 'react';
import { Box, Paper, Typography, Grid, TextField, Stack, Chip, Divider, Button } from '@mui/material';
import { Brush, Palette, Image } from 'lucide-react';

export default function Branding() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Palette size={24} />
        <Typography variant="h5">White Label — Branding</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Per-tenant colors, logos, favicon, legal footer.</Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Primary Color (hex)" placeholder="#3B82F6" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Accent Color (hex)" placeholder="#10B981" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="outlined" startIcon={<Image size={16} />} disabled>Upload Logo</Button>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip icon={<Brush size={16} />} label="Per-tenant theme" />
        </Stack>
      </Paper>
    </Box>
  );
}
