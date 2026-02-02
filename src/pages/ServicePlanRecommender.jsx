// Path: src/pages/ServicePlanRecommender.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICE PLAN RECOMMENDER PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Page wrapper for ServicePlanRecommender component
 * Allows selecting a contact to get AI-powered plan recommendations
 * 
 * URL: /service-plan-recommender
 * Optional URL param: ?contactId=XXXXX
 * 
 * @version 2.0.0
 * @date February 2026
 * @author SpeedyCRM Engineering - Christopher
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActionArea,
  CircularProgress, Alert, Chip, Stack, Avatar, TextField,
  InputAdornment, Button, Divider, Breadcrumbs, Link
} from '@mui/material';
import {
  Users, Search, User, CreditCard, TrendingUp, AlertCircle,
  ChevronRight, Brain, Sparkles, FileCheck, Phone, Mail, Home
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';

// Import the actual recommender component
import ServicePlanRecommender from '@/components/ServicePlanRecommender';

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ContactCard = ({ contact, onClick, selected }) => {
  const idiqData = contact.idiqEnrollment || {};
  const creditScore = idiqData.creditScore || contact.creditScore;
  const negativeItems = idiqData.negativeItemCount || 0;
  
  // Determine score color
  let scoreColor = 'text.disabled';
  if (creditScore >= 700) scoreColor = 'success.main';
  else if (creditScore >= 600) scoreColor = 'warning.main';
  else if (creditScore) scoreColor = 'error.main';
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        border: selected ? 3 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.light'
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar sx={{ bgcolor: selected ? 'primary.main' : 'grey.400', width: 48, height: 48 }}>
              {contact.firstName?.[0] || contact.email?.[0] || '?'}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap>
                {contact.firstName} {contact.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" noWrap>
                {contact.email}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {creditScore && (
                  <Chip
                    icon={<CreditCard size={14} />}
                    label={`Score: ${creditScore}`}
                    size="small"
                    sx={{ 
                      bgcolor: scoreColor === 'success.main' ? 'success.light' :
                               scoreColor === 'warning.main' ? 'warning.light' :
                               scoreColor === 'error.main' ? 'error.light' : 'grey.200',
                      color: scoreColor === 'text.disabled' ? 'text.secondary' : scoreColor
                    }}
                  />
                )}
                
                {negativeItems > 0 && (
                  <Chip
                    icon={<AlertCircle size={14} />}
                    label={`${negativeItems} Negative`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
                
                {contact.leadScore && (
                  <Chip
                    icon={<TrendingUp size={14} />}
                    label={`Lead: ${contact.leadScore}/10`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              
              {idiqData.creditScore && (
                <Chip
                  icon={<FileCheck size={14} />}
                  label="Has Credit Report"
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ServicePlanRecommenderPage = () => {
  // URL params (optional contactId)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlContactId = searchParams.get('contactId');
  
  // State
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(urlContactId || null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ═════════════════════════════════════════════════════════════════════════
  // FETCH CONTACTS WITH CREDIT DATA
  // ═════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📋 Fetching contacts with credit data...');
        
        // Fetch contacts that have idiqEnrollment data (credit reports)
        const contactsRef = collection(db, 'contacts');
        const q = query(
          contactsRef,
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        
        const snapshot = await getDocs(q);
        
        const contactsList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(c => c.idiqEnrollment?.creditScore || c.creditScore); // Only contacts with credit data
        
        console.log(`✅ Found ${contactsList.length} contacts with credit data`);
        
        setContacts(contactsList);
        setFilteredContacts(contactsList);
        
        // If URL has contactId, select it
        if (urlContactId) {
          const contact = contactsList.find(c => c.id === urlContactId);
          if (contact) {
            setSelectedContact(contact);
            console.log(`✅ Pre-selected contact from URL: ${contact.firstName} ${contact.lastName}`);
          } else {
            // Try to fetch the contact directly
            const contactDoc = await getDoc(doc(db, 'contacts', urlContactId));
            if (contactDoc.exists()) {
              const contactData = { id: contactDoc.id, ...contactDoc.data() };
              setSelectedContact(contactData);
              console.log(`✅ Fetched contact from URL param: ${contactData.firstName} ${contactData.lastName}`);
            }
          }
        }
        
      } catch (err) {
        console.error('❌ Error fetching contacts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [urlContactId]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // SEARCH FILTER
  // ═════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(c => 
      (c.firstName?.toLowerCase() || '').includes(term) ||
      (c.lastName?.toLowerCase() || '').includes(term) ||
      (c.email?.toLowerCase() || '').includes(term) ||
      (c.phone || '').includes(term)
    );
    
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // CONTACT SELECTION
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleContactSelect = (contact) => {
    console.log(`📋 Selected contact: ${contact.firstName} ${contact.lastName} (${contact.id})`);
    setSelectedContactId(contact.id);
    setSelectedContact(contact);
    
    // Update URL param
    setSearchParams({ contactId: contact.id });
  };
  
  const handleBackToSelection = () => {
    setSelectedContactId(null);
    setSelectedContact(null);
    setSearchParams({});
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // WORKFLOW ADVANCE HANDLER
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleWorkflowAdvance = (data) => {
    console.log('📝 Workflow advancing:', data);
    // In a real workflow, this would navigate to contract signing
    // For now, just log it
    alert(`Selected Plan: ${data.selectedPlan}\n\nIn production, this would advance to the contract signing stage.`);
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading contacts with credit data...</Typography>
      </Box>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: CONTACT SELECTED - SHOW RECOMMENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  if (selectedContactId && selectedContact) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToSelection}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Users size={16} style={{ marginRight: 4 }} />
            Select Contact
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Brain size={16} style={{ marginRight: 4 }} />
            AI Recommendation for {selectedContact.firstName}
          </Typography>
        </Breadcrumbs>
        
        {/* Contact Info Bar */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedContact.firstName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedContact.firstName} {selectedContact.lastName}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {selectedContact.email && (
                    <Chip icon={<Mail size={14} />} label={selectedContact.email} size="small" />
                  )}
                  {selectedContact.phone && (
                    <Chip icon={<Phone size={14} />} label={selectedContact.phone} size="small" />
                  )}
                </Stack>
              </Box>
            </Stack>
            
            <Button
              variant="outlined"
              onClick={handleBackToSelection}
              startIcon={<ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />}
            >
              Change Contact
            </Button>
          </Stack>
        </Paper>
        
        {/* The AI-Powered Service Plan Recommender */}
        <ServicePlanRecommender
          contactId={selectedContactId}
          contactData={selectedContact}
          leadScore={selectedContact.leadScore || 5}
          onPlanSelected={(data) => console.log('Plan selected:', data)}
          onWorkflowAdvance={handleWorkflowAdvance}
          allowComparison={true}
          showCalculator={true}
          embedded={false}
        />
      </Box>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: NO CONTACT SELECTED - SHOW SELECTION UI
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          <Brain size={32} color="#6366f1" />
          <Sparkles size={24} color="#f59e0b" />
        </Stack>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          AI Service Plan Recommender
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a contact with credit data to get an AI-powered service plan recommendation
        </Typography>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search contacts by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
        />
      </Paper>
      
      {/* Contact Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredContacts.length} contacts with credit data
      </Typography>
      
      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary">
            No contacts with credit data found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contacts need to complete IDIQ enrollment to have credit data
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredContacts.map(contact => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <ContactCard
                contact={contact}
                selected={selectedContactId === contact.id}
                onClick={() => handleContactSelect(contact)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.50' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          💡 How It Works
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            1. <strong>Select a contact</strong> - Choose someone with credit data (IDIQ enrollment)
          </Typography>
          <Typography variant="body2">
            2. <strong>AI analyzes their profile</strong> - We review credit score, negative items, call transcripts, and interaction history
          </Typography>
          <Typography variant="body2">
            3. <strong>Get personalized recommendation</strong> - AI suggests the best plan with confidence level and reasoning
          </Typography>
          <Typography variant="body2">
            4. <strong>Proceed to contract</strong> - Select a plan and advance to contract signing
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ServicePlanRecommenderPage;