import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as DocIcon,
  Folder as FolderIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  CreditCard as CreditIcon,
  Badge as IdIcon,
  Gavel as DisputeIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const DOCUMENT_TYPES = [
  { value: 'id', label: 'Government ID', icon: IdIcon, color: 'primary' },
  { value: 'ssn_card', label: 'SSN Card', icon: IdIcon, color: 'secondary' },
  { value: 'credit_report', label: 'Credit Report', icon: CreditIcon, color: 'info' },
  { value: 'agreement', label: 'Service Agreement', icon: DocIcon, color: 'success' },
  { value: 'correspondence', label: 'Bureau Correspondence', icon: DocIcon, color: 'warning' },
  { value: 'dispute_letter', label: 'Dispute Letter', icon: DisputeIcon, color: 'error' },
  { value: 'other', label: 'Other', icon: DocIcon, color: 'default' }
];

const STATUS_COLORS = {
  active: 'success',
  archived: 'default',
  expired: 'error'
};

function DocumentCard({ document, onView, onArchive }) {
  const theme = useTheme();
  const docType = DOCUMENT_TYPES.find(t => t.value === document.documentType);
  const Icon = docType?.icon || DocIcon;
  const isExpiring = document.expirationDate &&
    new Date(document.expirationDate.toDate?.() || document.expirationDate) <
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${docType?.color || 'grey'}.100`,
              color: `${docType?.color || 'grey'}.main`
            }}
          >
            <Icon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {document.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {docType?.label || document.documentType}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={document.status}
            color={STATUS_COLORS[document.status] || 'default'}
          />
        </Box>

        {document.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} noWrap>
            {document.description}
          </Typography>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {document.tags?.map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        {isExpiring && document.status === 'active' && (
          <Alert severity="warning" sx={{ mt: 2, py: 0 }}>
            <Typography variant="caption">
              Expires: {new Date(document.expirationDate.toDate?.() || document.expirationDate).toLocaleDateString()}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {document.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
          </Typography>
          <Box>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(document)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" component="a" href={document.fileUrl} target="_blank">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {document.status === 'active' && (
              <Tooltip title="Archive">
                <IconButton size="small" onClick={() => onArchive(document.id)}>
                  <ArchiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DocumentVault() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDocuments();
    loadAlerts();
  }, [typeFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const getDocuments = httpsCallable(functions, 'getDocuments');
      const result = await getDocuments({
        documentType: typeFilter || undefined,
        status: activeTab === 1 ? 'archived' : 'active'
      });
      setDocuments(result.data.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // Would load document alerts from Firestore
      // For demo, showing static alerts
      setAlerts([
        { id: 1, documentType: 'id', message: '3 IDs expiring in next 30 days' },
        { id: 2, documentType: 'agreement', message: '1 agreement pending signature' }
      ]);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  const archiveDocument = async (documentId) => {
    try {
      const archiveFn = httpsCallable(functions, 'archiveDocument');
      await archiveFn({ documentId, reason: 'User archived' });
      loadDocuments();
    } catch (err) {
      console.error('Error archiving document:', err);
    }
  };

  const viewDocument = async (document) => {
    try {
      const logAccess = httpsCallable(functions, 'logDocumentAccess');
      await logAccess({ documentId: document.id, action: 'viewed' });
      window.open(document.fileUrl, '_blank');
    } catch (err) {
      console.error('Error logging access:', err);
      window.open(document.fileUrl, '_blank');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const documentStats = {
    total: documents.length,
    byType: DOCUMENT_TYPES.reduce((acc, type) => {
      acc[type.value] = documents.filter(d => d.documentType === type.value).length;
      return acc;
    }, {})
  };

  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Document Vault
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Securely store and manage client documents
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {alerts.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningIcon />}
              onClick={() => setAlertsDialogOpen(true)}
            >
              {alerts.length} Alerts
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {DOCUMENT_TYPES.slice(0, 6).map(type => {
          const Icon = type.icon;
          const count = documentStats.byType[type.value] || 0;
          return (
            <Grid item xs={6} sm={4} md={2} key={type.value}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: typeFilter === type.value ? 2 : 0,
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => setTypeFilter(typeFilter === type.value ? '' : type.value)}
              >
                <Icon sx={{ color: `${type.color}.main`, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type.label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Document Type</InputLabel>
              <Select
                value={typeFilter}
                label="Document Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {DOCUMENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tabs value={activeTab} onChange={(e, v) => { setActiveTab(v); loadDocuments(); }}>
              <Tab label="Active" />
              <Tab label="Archived" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Document Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map(document => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
              <DocumentCard
                document={document}
                onView={viewDocument}
                onArchive={archiveDocument}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search' : 'Upload your first document to get started'}
          </Typography>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Documents are securely stored and encrypted. Supported formats: PDF, JPG, PNG, DOC, DOCX
          </Typography>
          <Box
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.default',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
            }}
          >
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Drag & drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select label="Document Type" defaultValue="">
                  {DOCUMENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description (optional)" multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="date" label="Expiration Date (optional)" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<UploadIcon />}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts Dialog */}
      <Dialog open={alertsDialogOpen} onClose={() => setAlertsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Document Alerts</DialogTitle>
        <DialogContent>
          {alerts.map(alert => (
            <Alert key={alert.id} severity="warning" sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
