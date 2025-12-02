// src/components/DuplicateManager.jsx
// DUPLICATE DETECTION & MERGING SYSTEM
// Prevents duplicate contacts, tracks contact frequency

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Users,
  Merge,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const DuplicateManager = () => {
  const { currentUser } = useAuth();
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mergeDialog, setMergeDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [merging, setMerging] = useState(false);
  const [stats, setStats] = useState({ total: 0, duplicateGroups: 0, totalDuplicates: 0 });

  // ===== FIND DUPLICATES =====
  const findDuplicates = async () => {
    setLoading(true);
    console.log('🔍 Scanning for duplicates...');

    try {
      // Get all contacts
      const contactsQuery = query(collection(db, 'contacts'));
      const snapshot = await getDocs(contactsQuery);
      
      const contacts = [];
      snapshot.forEach((doc) => {
        contacts.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📊 Found ${contacts.length} total contacts`);

      // Group by email and phone
      const emailGroups = {};
      const phoneGroups = {};

      contacts.forEach(contact => {
        // Group by email
        if (contact.email) {
          const email = contact.email.toLowerCase().trim();
          if (!emailGroups[email]) emailGroups[email] = [];
          emailGroups[email].push(contact);
        }

        // Group by phone
        if (contact.phone) {
          const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
          if (phone.length >= 10) {
            if (!phoneGroups[phone]) phoneGroups[phone] = [];
            phoneGroups[phone].push(contact);
          }
        }
      });

      // Find duplicate groups
      const duplicateGroups = [];

      // Email duplicates
      Object.entries(emailGroups).forEach(([email, group]) => {
        if (group.length > 1) {
          duplicateGroups.push({
            type: 'email',
            key: email,
            contacts: group,
            count: group.length,
          });
        }
      });

      // Phone duplicates (excluding ones already caught by email)
      Object.entries(phoneGroups).forEach(([phone, group]) => {
        if (group.length > 1) {
          // Check if already in email duplicates
          const alreadyCaught = duplicateGroups.some(dg => 
            dg.contacts.some(c => group.some(gc => gc.id === c.id))
          );
          if (!alreadyCaught) {
            duplicateGroups.push({
              type: 'phone',
              key: phone,
              contacts: group,
              count: group.length,
            });
          }
        }
      });

      setDuplicates(duplicateGroups);
      setStats({
        total: contacts.length,
        duplicateGroups: duplicateGroups.length,
        totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.count, 0),
      });

      console.log(`✅ Found ${duplicateGroups.length} duplicate groups`);
    } catch (error) {
      console.error('❌ Error finding duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== MERGE DUPLICATES =====
  const mergeDuplicates = async (group) => {
    console.log('🔀 Merging duplicates:', group);
    setMerging(true);

    try {
      // Sort by creation date (oldest first)
      const sorted = [...group.contacts].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });

      // Keep the oldest one as the master
      const master = sorted[0];
      const duplicatesToMerge = sorted.slice(1);

      console.log(`📌 Master record: ${master.id}`);
      console.log(`🗑️ Merging ${duplicatesToMerge.length} duplicates into master`);

      // Merge all data into master
      const mergedData = {
        // Contact frequency counter
        contactFrequency: (master.contactFrequency || 1) + duplicatesToMerge.length,
        
        // Merge tags
        tags: [
          ...new Set([
            ...(master.tags || []),
            ...duplicatesToMerge.flatMap(d => d.tags || [])
          ])
        ],
        
        // Merge notes
        notes: [
          master.notes || '',
          ...duplicatesToMerge.map(d => d.notes || '').filter(n => n)
        ].join('\n---\n'),
        
        // Keep highest lead score
        leadScore: Math.max(
          master.leadScore || 0,
          ...duplicatesToMerge.map(d => d.leadScore || 0)
        ),
        
        // Keep highest engagement score
        engagementScore: Math.max(
          master.engagementScore || 0,
          ...duplicatesToMerge.map(d => d.engagementScore || 0)
        ),
        
        // Sum total revenue
        totalRevenue: (master.totalRevenue || 0) + 
          duplicatesToMerge.reduce((sum, d) => sum + (d.totalRevenue || 0), 0),
        
        // Most recent contact date
        lastContact: [master, ...duplicatesToMerge]
          .map(d => d.lastContact)
          .filter(Boolean)
          .sort((a, b) => b.toMillis() - a.toMillis())[0] || master.lastContact,
        
        // Merge source list
        sources: [
          ...new Set([
            master.source,
            ...duplicatesToMerge.map(d => d.source).filter(Boolean)
          ])
        ],
        
        // Add merge history
        mergeHistory: {
          mergedAt: serverTimestamp(),
          mergedCount: duplicatesToMerge.length,
          mergedIds: duplicatesToMerge.map(d => d.id),
        },
        
        updatedAt: serverTimestamp(),
      };

      // Update master record
      await updateDoc(doc(db, 'contacts', master.id), mergedData);

      // Delete duplicates
      const batch = writeBatch(db);
      duplicatesToMerge.forEach(duplicate => {
        batch.delete(doc(db, 'contacts', duplicate.id));
      });
      await batch.commit();

      console.log('✅ Merge complete!');
      
      // Refresh duplicates list
      await findDuplicates();
      setMergeDialog(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('❌ Error merging duplicates:', error);
      alert('Error merging duplicates: ' + error.message);
    } finally {
      setMerging(false);
    }
  };

  // Load duplicates on mount
  useEffect(() => {
    findDuplicates();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          <Users size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Duplicate Contact Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={18} />}
          onClick={findDuplicates}
          disabled={loading}
        >
          Scan for Duplicates
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card sx={{ bgcolor: '#E3F2FD' }}>
          <CardContent>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="caption">Total Contacts</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#FFF3E0' }}>
          <CardContent>
            <Typography variant="h4" color="warning.main">{stats.duplicateGroups}</Typography>
            <Typography variant="caption">Duplicate Groups</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#FFEBEE' }}>
          <CardContent>
            <Typography variant="h4" color="error.main">{stats.totalDuplicates}</Typography>
            <Typography variant="caption">Total Duplicates</Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#E8F5E9' }}>
          <CardContent>
            <Typography variant="h4" color="success.main">
              {stats.total - stats.totalDuplicates + stats.duplicateGroups}
            </Typography>
            <Typography variant="caption">After Cleanup</Typography>
          </CardContent>
        </Card>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : duplicates.length === 0 ? (
        <Alert severity="success" icon={<CheckCircle />}>
          <Typography variant="h6">No Duplicates Found! 🎉</Typography>
          <Typography variant="body2">Your contact database is clean.</Typography>
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <Alert severity="warning" icon={<AlertTriangle />} sx={{ mb: 2 }}>
              Found {duplicates.length} groups of duplicate contacts. Review and merge below.
            </Alert>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match Type</TableCell>
                    <TableCell>Identifier</TableCell>
                    <TableCell>Duplicate Count</TableCell>
                    <TableCell>Names</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {duplicates.map((group, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip 
                          label={group.type} 
                          size="small"
                          color={group.type === 'email' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{group.key}</TableCell>
                      <TableCell>
                        <Badge badgeContent={group.count} color="error">
                          <Users size={20} />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {group.contacts.map(c => `${c.firstName} ${c.lastName}`).join(', ')}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedGroup(group);
                              setMergeDialog(true);
                            }}
                          >
                            <Eye size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Merge All">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => mergeDuplicates(group)}
                          >
                            <Merge size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Merge Dialog */}
      <Dialog open={mergeDialog} onClose={() => setMergeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Merge Duplicate Contacts
          <IconButton
            onClick={() => setMergeDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedGroup && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                This will merge {selectedGroup.count} contacts into one master record.
                The oldest contact will be kept, and all data will be combined.
              </Alert>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Lead Score</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedGroup.contacts
                      .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
                      .map((contact, idx) => (
                        <TableRow key={contact.id} sx={{ bgcolor: idx === 0 ? '#E8F5E9' : 'inherit' }}>
                          <TableCell>
                            {idx === 0 && <Chip label="MASTER" size="small" color="success" sx={{ mr: 1 }} />}
                            {contact.firstName} {contact.lastName}
                          </TableCell>
                          <TableCell>
                            {contact.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                          </TableCell>
                          <TableCell>{contact.leadScore || 0}</TableCell>
                          <TableCell>{contact.status || 'Unknown'}</TableCell>
                          <TableCell>{contact.source || 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">What will be merged:</Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Contact frequency counter will be updated</li>
                  <li>All tags will be combined</li>
                  <li>Notes will be concatenated</li>
                  <li>Highest lead/engagement scores kept</li>
                  <li>Revenue totals summed</li>
                  <li>Duplicate records will be deleted</li>
                </ul>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Merge size={18} />}
            onClick={() => mergeDuplicates(selectedGroup)}
            disabled={merging}
          >
            {merging ? 'Merging...' : 'Merge Duplicates'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DuplicateManager;