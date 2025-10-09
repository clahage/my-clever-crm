import React from 'react';
import { Box, Paper, Typography, Stack, Chip, Divider, List, ListItem, ListItemText, Button } from '@mui/material';
import { BookOpen, FileText, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Articles() {
  return (
    <Box p={3}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <BookOpen size={24} />
        <Typography variant="h5">Articles (Knowledge Center)</Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Coming Soon — Centralized article library for users, clients & affiliates.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2">Planned Features</Typography>
        <List dense>
          <ListItem><ListItemText primary="Categories, tags, full-text search" /></ListItem>
          <ListItem><ListItemText primary="Featured / trending content; staff picks" /></ListItem>
          <ListItem><ListItemText primary="Role-aware visibility (public, clients, staff, affiliates)" /></ListItem>
          <ListItem><ListItemText primary="Versioning, drafts, scheduled publish" /></ListItem>
        </List>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>Data & Integrations</Typography>
        <List dense>
          <ListItem><ListItemText primary="Firestore collections: articles, articleCategories" /></ListItem>
          <ListItem><ListItemText primary="Optional: Algolia/Meilisearch for search indexing" /></ListItem>
        </List>

        <Stack direction="row" spacing={1} mt={2}>
          <Chip icon={<FileText size={16} />} label="Firestore" />
          <Chip icon={<Search size={16} />} label="Search indexing (optional)" />
        </Stack>

        <Stack direction="row" spacing={1} mt={3}>
          <Button variant="contained" startIcon={<Plus size={16} />} disabled>
            New Article
          </Button>
          <Button component={Link} to="/" variant="text">Back to Dashboard</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
