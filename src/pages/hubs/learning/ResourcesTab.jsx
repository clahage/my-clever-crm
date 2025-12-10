import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Archive, Download, FileText, File, Search } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';

const ResourcesTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');

      const resourcesRef = collection(db, 'resources');
      const resourcesSnap = await getDocs(query(resourcesRef, orderBy('createdAt', 'desc')));
      const resourcesData = resourcesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResources(resourcesData);

    } catch (err) {
      console.error('Error loading resources:', err);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource) => {
    try {
      setDownloading({ ...downloading, [resource.id]: true });
      setError('');

      // Get download URL from Firebase Storage
      if (resource.storagePath) {
        const storageRef = ref(storage, resource.storagePath);
        const downloadUrl = await getDownloadURL(storageRef);

        // Open download in new tab
        window.open(downloadUrl, '_blank');
        setSuccess(`Downloading ${resource.title}...`);
      } else {
        setError('Download link not available');
      }

    } catch (err) {
      console.error('Error downloading resource:', err);
      setError('Failed to download resource');
    } finally {
      setDownloading({ ...downloading, [resource.id]: false });
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery ||
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const resourceTypes = ['all', 'template', 'guide', 'checklist', 'form', 'tool'];

  const getFileIcon = (type) => {
    switch (type) {
      case 'template':
        return <FileText size={48} />;
      case 'form':
        return <File size={48} />;
      default:
        return <Archive size={48} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Archive size={24} />
        <Typography variant="h5" fontWeight="bold">
          Resource Library
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                {resourceTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Resources Grid */}
      <Grid container spacing={3}>
        {filteredResources.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No resources found. Try adjusting your search or filters.
            </Alert>
          </Grid>
        ) : (
          filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ textAlign: 'center', mb: 2, color: 'primary.main' }}>
                    {getFileIcon(resource.type)}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="600" align="center">
                    {resource.title || 'Untitled Resource'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph align="center">
                    {resource.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip label={resource.type || 'File'} size="small" />
                    <Chip label={resource.fileSize || '1 MB'} size="small" variant="outlined" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={downloading[resource.id] ? <CircularProgress size={18} /> : <Download size={18} />}
                    onClick={() => handleDownload(resource)}
                    disabled={downloading[resource.id]}
                  >
                    {downloading[resource.id] ? 'Downloading...' : 'Download'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default ResourcesTab;
