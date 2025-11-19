// ============================================================================
// ContactAutocomplete.jsx - REUSABLE CONTACT SEARCH COMPONENT
// ============================================================================
// Firebase-powered autocomplete for selecting contacts
// Features: Debounced search, avatar display, auto-population
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Avatar,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { User, Phone, Mail, Building } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ContactAutocomplete = ({
  value,
  onChange,
  label = 'Select Contact',
  placeholder = 'Type to search contacts...',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  filterRoles = null, // e.g., ['client', 'prospect']
  sx = {},
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    const searchContacts = async () => {
      setLoading(true);
      try {
        const contactsRef = collection(db, 'contacts');
        const searchTerm = inputValue.toLowerCase();

        // Create queries for first name, last name, and email
        const queries = [];

        // First name search
        queries.push(
          query(
            contactsRef,
            where('firstNameLower', '>=', searchTerm),
            where('firstNameLower', '<=', searchTerm + '\uf8ff'),
            limit(15)
          )
        );

        // Last name search
        queries.push(
          query(
            contactsRef,
            where('lastNameLower', '>=', searchTerm),
            where('lastNameLower', '<=', searchTerm + '\uf8ff'),
            limit(15)
          )
        );

        // Email search (if contains @)
        if (searchTerm.includes('@') || searchTerm.includes('.')) {
          queries.push(
            query(
              contactsRef,
              where('email', '>=', searchTerm),
              where('email', '<=', searchTerm + '\uf8ff'),
              limit(10)
            )
          );
        }

        // Execute all queries
        const snapshots = await Promise.all(queries.map(q => getDocs(q)));

        // Combine and deduplicate results
        const contactsMap = new Map();

        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };

            // Filter by roles if specified
            if (filterRoles && filterRoles.length > 0) {
              const contactRoles = data.roles || [];
              const hasRole = filterRoles.some(role =>
                contactRoles.includes(role)
              );
              if (!hasRole) return;
            }

            contactsMap.set(doc.id, data);
          });
        });

        // Convert to array and sort by name
        const results = Array.from(contactsMap.values()).sort((a, b) => {
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setOptions(results.slice(0, 20)); // Limit to 20 results
      } catch (err) {
        console.error('Error searching contacts:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const debounceTimer = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, filterRoles]);

  // Format contact display name
  const getContactName = (contact) => {
    if (!contact) return '';
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    return name || contact.email || 'Unknown Contact';
  };

  // Get initials for avatar
  const getInitials = (contact) => {
    if (!contact) return '?';
    const first = contact.firstName?.[0] || '';
    const last = contact.lastName?.[0] || '';
    return (first + last).toUpperCase() || contact.email?.[0]?.toUpperCase() || '?';
  };

  // Get role chip color
  const getRoleColor = (roles) => {
    if (!roles || roles.length === 0) return 'default';
    if (roles.includes('client')) return 'success';
    if (roles.includes('prospect')) return 'warning';
    if (roles.includes('lead')) return 'info';
    return 'default';
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={getContactName}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      filterOptions={(x) => x} // Disable client-side filtering, use Firebase results
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters...'
          : 'No contacts found'
      }
      sx={sx}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 1.5,
            px: 2,
          }}
        >
          <Avatar
            src={option.photoURL}
            alt={getContactName(option)}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {getInitials(option)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight="medium" noWrap>
              {getContactName(option)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {option.email && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Mail size={12} />
                  {option.email}
                </Typography>
              )}
              {option.phone && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Phone size={12} />
                  {option.phone}
                </Typography>
              )}
            </Box>
            {option.company && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
              >
                <Building size={12} />
                {option.company}
              </Typography>
            )}
          </Box>
          {option.roles && option.roles.length > 0 && (
            <Chip
              label={option.roles[0]}
              size="small"
              color={getRoleColor(option.roles)}
              sx={{ textTransform: 'capitalize' }}
            />
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <User size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default ContactAutocomplete;
