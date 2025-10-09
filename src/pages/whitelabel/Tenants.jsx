import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Stack, Chip, Divider, Button } from '@mui/material';
import { Building2, UserPlus } from 'lucide-react';

export default function Tenants() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Building2 size={24} />
        <Typography variant="h5">White Label — Tenants</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1">Coming Soon — Manage reseller tenants & provisioning.</Typography>
        <Divider sx={{ my: 2 }} />

        <Button variant="contained" startIcon={<UserPlus size={16} />} disabled>
          New Tenant
        </Button>

        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Placeholder row */}
            <TableRow>
              <TableCell>Acme Reseller</TableCell>
              <TableCell>Pro</TableCell>
              <TableCell>12</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip label="Collections: tenants, tenantUsers" />
        </Stack>
      </Paper>
    </Box>
  );
}
